# Hercules Merchandise - Astro Headless Site

> **IMPORTANT: Working Directory**
> This project folder is: `/home/kamindu/hercules-headless-live/`
> Do NOT mix up with any other folder (e.g., staging project folders).
> All file edits, builds, and deployments must happen within this directory.

## Project Overview

Headless e-commerce site built with **Astro + React** frontend and **WordPress/WooCommerce** backend. Uses Cloudflare Workers for hybrid routing between static Astro pages and dynamic WordPress pages.

---

## Quick Reference

### URLs

| Environment | URL |
|-------------|-----|
| Astro Frontend (Production) | https://hercules-de-live.pages.dev |
| Edge Router (Staging) | https://staging.hercules-merchandise.de |
| WordPress Staging | https://staging.hercules-merchandise.de/wp-admin/ |
| WordPress Production | https://hercules-merchandise.de/wp-admin/ |
| Product Sync Worker | https://hercules-product-sync.gilles-86d.workers.dev |
| Form Handler Worker | https://hercules-form-handler.gilles-86d.workers.dev |

### SSH Access (Combell Server)

```bash
ssh combel
# Host: 136.144.235.35
# User: kamindu-de
# Staging: /var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/
# Production: /var/www/vhosts/hercules-merchandise.de/httpdocs/
```

### Credentials

**Cloudflare (Gilles's Account - Production):**
```
CLOUDFLARE_API_TOKEN=ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp
CLOUDFLARE_ACCOUNT_ID=86dfa0e10ca766f79d5042548fc2776f
```

**WooCommerce API (Production):**
```
WC_STORE_URL=https://hercules-merchandise.de
WC_CONSUMER_KEY=ck_5cbd5b18596e9cdef28d18ba3cbdc27898e61bce
WC_CONSUMER_SECRET=cs_9da1d065d3d75997e38ed19b9d716f2b2ab00ca1
```

**Webhook Secret:**
```
hercules-webhook-secret-2024
```

**GitHub Repository (Production):**
```
https://github.com/royboy31/hercules-live-de (private)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Browser                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Cloudflare Edge Router                        │
│   (hercules-edge-router.gilles-86d.workers.dev)                │
└─────────────────────────────────────────────────────────────────┘
                    │                       │
         Astro Routes                WordPress Routes
    /, /kollektionen/*,          /cart, /checkout,
    /produkte/*, /blogs/*        /wp-admin/*, /wp-json/*
                    │                       │
                    ▼                       ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│   Cloudflare Pages        │   │   WordPress (Combell)         │
│   hercules-astro.pages.dev│   │   staging.hercules-merchandise│
└───────────────────────────┘   └───────────────────────────────┘
```

### Edge Router Routing

**Astro (Static):**
- `/` - Homepage
- `/kollektionen/*` - Category pages
- `/produkte/*` - Product detail pages
- `/blogs/*` - Blog pages
- `/wishlist` - Wishlist page

**WordPress (Dynamic):**
- `/cart`, `/checkout` - Shopping cart/checkout
- `/my-account` - User account
- `/wp-admin/*` - Admin panel
- `/wp-json/*` - REST API
- `/kontakt`, `/quote-generator` - Contact pages

---

## Project Structure

```
astro-hercules/
├── src/
│   ├── components/          # Astro & React components
│   │   ├── Header.astro
│   │   ├── StickyHeader.astro
│   │   ├── MobileMenu.astro
│   │   ├── ProductConfigurator.tsx
│   │   ├── ProductSearch.tsx
│   │   ├── UserSession.tsx
│   │   ├── WishlistButton.tsx
│   │   ├── ContactFormPopup.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── index.astro
│   │   ├── kollektionen/[slug].astro
│   │   ├── produkte/[slug].astro
│   │   ├── blogs/[slug].astro
│   │   ├── wishlist.astro
│   │   └── 404.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── config/
│   │   ├── seo.ts
│   │   └── hreflang-mappings.ts
│   ├── data/
│   │   ├── menu-data.ts
│   │   └── homepage-products.json
│   └── styles/
│       ├── global.css
│       ├── fonts.css
│       └── steps.css
├── workers/
│   ├── edge-router/         # Hybrid routing worker
│   ├── product-sync/        # WooCommerce sync worker
│   └── form-handler/        # Contact form worker
├── functions/               # Cloudflare Pages Functions
│   └── api/
│       ├── contact.ts
│       └── newsletter.ts
├── public/
│   ├── images/
│   └── fonts/
├── .github/workflows/
│   └── deploy.yml           # Auto-deploy on push
├── astro.config.mjs
├── package.json
├── .env
└── live-plan.md             # Go-live deployment plan
```

---

## Deployment

### Standard Deployment (GitHub Only)

**NEVER deploy directly with wrangler. Always go through GitHub:**

```bash
# Stage, commit, and push
git add -A && git commit -m "Your message" && git push origin main

# GitHub Actions will automatically build and deploy
```

### Check Deployment Status

```bash
gh run list --limit 5
gh run watch
```

### Deploy Workers Manually (if needed)

```bash
# Edge Router
cd workers/edge-router
CLOUDFLARE_API_TOKEN="ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp" \
CLOUDFLARE_ACCOUNT_ID="86dfa0e10ca766f79d5042548fc2776f" \
npx wrangler deploy

# Product Sync
cd workers/product-sync
CLOUDFLARE_API_TOKEN="ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp" \
CLOUDFLARE_ACCOUNT_ID="86dfa0e10ca766f79d5042548fc2776f" \
npx wrangler deploy
```

---

## Key Features Implemented

### Frontend (Astro)
- [x] Homepage with all sections
- [x] Category archive pages (`/kollektionen/[slug]`)
- [x] Product detail pages (`/produkte/[slug]`)
- [x] Product configurator (Pearl WC Steps style)
- [x] Blog archive and posts
- [x] Product search with scoring
- [x] Wishlist (localStorage)
- [x] Mini-cart dropdown
- [x] Contact form popup
- [x] 404 page with typing animation
- [x] SEO (meta tags, JSON-LD, sitemap)
- [x] Hreflang (DE/EN/FR)
- [x] Self-hosted fonts (Jost, Roboto)

### Backend (WordPress mu-plugins)
- [x] `hercules-session-api.php` - Cart/session sync
- [x] `hercules-main-header-menu-api.php` - Menu REST API
- [x] `hercules-category-api.php` - Category details
- [x] `hercules-wishlist-api.php` - Wishlist API
- [x] `hercules-sticky-header.php` - WP sticky header
- [x] `pearl-rest-api-meta.php` - Product pricing/PDFs
- [x] `hercules-menu-webhooks.php` - Auto-rebuild on menu change

### Workers
- [x] Edge Router - Hybrid Astro/WordPress routing
- [x] Product Sync - Daily sync + webhooks + KV storage
- [x] Form Handler - R2 uploads, Brevo email, Google Sheets

---

## WordPress REST API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wp-json/hercules/v1/session` | GET | Cart count, user state |
| `/wp-json/hercules/v1/cart/remove` | POST | Remove cart item |
| `/wp-json/hercules/v1/wishlist` | GET | Get wishlist |
| `/wp-json/hercules/v1/wishlist/toggle` | POST | Add/remove wishlist |
| `/wp-json/hercules/v1/categories` | GET | All categories |
| `/wp-json/hercules/v1/category/{slug}` | GET | Single category |
| `/wp-json/hercules/v1/main-header-menu` | GET | Menu structure |

---

## Product Sync Worker API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/products` | GET | All products (97) |
| `/product/{slug}` | GET | Single product |
| `/categories` | GET | All categories (39) |
| `/category/{slug}` | GET | Single category |
| `/search?q={query}` | GET | Product search |
| `/image/{slug}` | GET | Cached product image |
| `/status` | GET | Last sync time |
| `/trigger-rebuild` | POST | Trigger GitHub Actions |

---

## Important Notes

### Session/Cookie Handling
- Cloudflare APO strips WooCommerce cookies
- Edge Router copies cookies to `X-Edge-Cookies` header
- WordPress mu-plugin restores cookies from this header
- Cart sync only works via Edge Router (same domain)

### Menu Sync
- Menu data fetched at Astro build time
- Changes require site rebuild
- `hercules-menu-webhooks.php` auto-triggers rebuild

### Image Caching
- All product images cached in Cloudflare KV
- No WordPress access needed at runtime
- Daily sync at 3 AM UTC

### MalCare
- **Must be disabled** on WordPress - blocks API requests
- Rename: `malcare-security` → `malcare-security-disabled`

---

## Development

### Local Dev Server

```bash
npm run dev
# http://localhost:4321
```

### Build

```bash
npm run build
```

### Test Product Sync

```bash
# Check status
curl "https://hercules-product-sync.gilles-86d.workers.dev/status"

# Manual sync trigger
curl -X POST "https://hercules-product-sync.gilles-86d.workers.dev/trigger-rebuild" \
  -H "Authorization: Bearer hercules-webhook-secret-2024"
```

---

## Go Live

See `live-plan.md` for complete deployment checklist including:
- WordPress file migration (mu-plugins, theme)
- Edge Router configuration for production
- WooCommerce webhook setup
- GitHub secrets update
- DNS configuration

---

## Design Values

### Colors
- Primary: `#253461`
- Accent/CTA: `#10C99E`
- Secondary Blue: `#469ADC`
- Link Blue: `#00AEEF`

### Typography
- Headings: Jost (500-600 weight)
- Body: Roboto (400 weight)
- Nav: Jost 15px, 500 weight, uppercase

### Layout
- Container: 1280px max-width
- Border radius: 15-20px (cards), 50px (buttons)

---

*Last updated: 2026-01-27*
