// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
// critters removed — Astro's auto inlineStylesheets handles critical CSS sizing
// import critters from 'astro-critters';
import sitemap from '@astrojs/sitemap';

// Fetch product and post dates at build time for sitemap lastmod
const WORKER_URL = 'https://hercules-product-sync.gilles-86d.workers.dev';
const buildDate = new Date().toISOString();

/** @type {Map<string, string>} slug → ISO date */
const lastmodMap = new Map();

try {
  const [productsRes, postsRes] = await Promise.all([
    fetch(`${WORKER_URL}/products`).catch(() => null),
    fetch(`${WORKER_URL}/posts`).catch(() => null),
  ]);

  if (productsRes?.ok) {
    const products = await productsRes.json();
    // Per-category: track the most recent product date_modified
    /** @type {Map<string, string>} */
    const categoryLastmod = new Map();

    for (const p of products) {
      const mod = p.date_modified || buildDate;
      lastmodMap.set(`/produkte/${p.slug}/`, mod);
      // Track per-category max date
      if (p.categories) {
        for (const catSlug of p.categories) {
          const existing = categoryLastmod.get(catSlug);
          if (!existing || mod > existing) {
            categoryLastmod.set(catSlug, mod);
          }
        }
      }
    }
    // Set collection lastmod = most recent product in that collection
    for (const [catSlug, mod] of categoryLastmod) {
      lastmodMap.set(`/kollektionen/${catSlug}/`, mod);
    }
  }

  if (postsRes?.ok) {
    const posts = await postsRes.json();
    for (const p of posts) {
      lastmodMap.set(`/blogs/${p.slug}/`, p.modified || p.date || buildDate);
    }
  }
} catch (e) {
  console.warn('Sitemap lastmod: failed to fetch dates, using build date as fallback', e);
}

// https://astro.build/config
export default defineConfig({
  site: 'https://hercules-merchandise.de',
  trailingSlash: 'always',
  build: {
    // 'auto' inlines small CSS, links larger bundles externally
    inlineStylesheets: 'auto',
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Optimize bundle splitting
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // React core - cached separately
            'react-vendor': ['react', 'react-dom'],
            // Interactive components - loaded on demand
            'configurator': ['./src/components/ProductConfigurator.tsx'],
          }
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false
        }
      },
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Inline small assets
      assetsInlineLimit: 4096,
      // Minimize CSS
      cssMinify: true,
      // Better minification
      minify: 'esbuild'
    }
  },

  integrations: [
    react(),
    sitemap({
      // Filter out pages that shouldn't be in sitemap
      filter: (page) => {
        // Exclude cart, checkout, account, search pages
        const excludePatterns = [
          '/cart',
          '/warenkorb',
          '/checkout',
          '/kasse',
          '/my-account',
          '/mein-konto',
          '/quote-generator',
          '/angebot-anfragen',
          '/search',
          '/api/',
          '/wishlist',
          '/kollektionen/unkategorisiert',
        ];
        return !excludePatterns.some(pattern => page.includes(pattern));
      },
      // Change frequency hints for crawlers
      changefreq: 'weekly',
      priority: 0.7,
      // Custom serialization for sitemap entries
      serialize: (item) => {
        // Extract path from full URL for lastmod lookup
        const path = new URL(item.url).pathname;
        const lastmod = lastmodMap.get(path) || buildDate;

        // Higher priority for homepage
        if (item.url === 'https://hercules-merchandise.de/') {
          return { ...item, lastmod, changefreq: 'daily', priority: 1.0 };
        }
        // Higher priority for product pages
        if (item.url.includes('/produkte/')) {
          return { ...item, lastmod, changefreq: 'weekly', priority: 0.9 };
        }
        // Higher priority for category pages
        if (item.url.includes('/kollektionen/')) {
          return { ...item, lastmod, changefreq: 'weekly', priority: 0.8 };
        }
        // Higher priority for blog posts
        if (item.url.includes('/blogs/') && item.url !== 'https://hercules-merchandise.de/blogs/') {
          return { ...item, lastmod, changefreq: 'monthly', priority: 0.6 };
        }
        return { ...item, lastmod };
      },
      // i18n support
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de-DE',
        },
      },
    })
  ],

  redirects: {
    '/blog': '/blogs',
    '/blog/': '/blogs',
    '/sitemap.xml': '/sitemap-index.xml',
  }
});
