// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import critters from 'astro-critters';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://hercules-merchandise.de',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    critters(),
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
        ];
        return !excludePatterns.some(pattern => page.includes(pattern));
      },
      // Change frequency hints for crawlers
      changefreq: 'weekly',
      priority: 0.7,
      // Custom serialization for sitemap entries
      serialize: (item) => {
        // Higher priority for homepage
        if (item.url === 'https://hercules-merchandise.de/') {
          return { ...item, changefreq: 'daily', priority: 1.0 };
        }
        // Higher priority for product pages
        if (item.url.includes('/produkte/')) {
          return { ...item, changefreq: 'weekly', priority: 0.9 };
        }
        // Higher priority for category pages
        if (item.url.includes('/collections/')) {
          return { ...item, changefreq: 'weekly', priority: 0.8 };
        }
        // Higher priority for blog posts
        if (item.url.includes('/blogs/') && item.url !== 'https://hercules-merchandise.de/blogs/') {
          return { ...item, changefreq: 'monthly', priority: 0.6 };
        }
        return item;
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
  }
});
