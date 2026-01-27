# Hercules Merchandise - Go Live Deployment Plan

## Executive Summary

This document outlines the complete deployment plan to transition from staging to production for the Hercules Merchandise headless Astro site.

**Current State:**
- Astro frontend: `https://hercules-astro.pages.dev` (Cloudflare Pages)
- Edge Router: Routes `staging.hercules-merchandise.de` → Astro/WordPress hybrid
- WordPress Staging: `staging.hercules-merchandise.de` (Combell)
- WordPress Production: `hercules-merchandise.de` (Combell)

**Target State:**
- Production domain `hercules-merchandise.de` routed through Edge Router
- Astro pages served for static content (homepage, collections, products, blogs)
- WordPress pages served for dynamic content (cart, checkout, account, admin)

---

## 1. Menu Sync Implementation

### How Menu Sync Works

**Architecture:**
```
WordPress Menu Admin → REST API Endpoint → Astro Build → Static HTML
```

**WordPress API Endpoint:**
- URL: `/wp-json/hercules/v1/main-header-menu`
- Plugin: `hercules-main-header-menu-api.php` (mu-plugin)
- Returns: Three dropdown menus (Sportarten, Produkte, Themen) + Direct Links
- Menu icons stored in: `wp-content/uploads/hercules-menu-icons/`

**Menu Data Flow:**
1. Menu items managed in WordPress Admin → Appearance → Menus
2. Menu: `product-catergory-menu` (dropdowns) + `main-header-direct-links`
3. REST API exposes menu structure with icon URLs
4. Astro fetches at build time via `src/data/menu-data.ts`
5. Cached once per build (prevents duplicate API calls)
6. Three components consume data: `Header.astro`, `StickyHeader.astro`, `MobileMenu.astro`

**Auto-Rebuild on Menu Change:**
- Plugin: `hercules-menu-webhooks.php` (mu-plugin)
- Triggers GitHub Actions rebuild when menu is saved
- Webhook URL: `https://hercules-product-sync.gilles-86d.workers.dev/trigger-rebuild`

---

## 2. WordPress Changes Comparison (Staging vs Production)

### 2.1 mu-plugins Directory

| File | Staging | Production | Action Required |
|------|---------|------------|-----------------|
| `hercules-brevo-mailer.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-cart-api.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-cart-contents-fix.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-category-api.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-edge-router-cookies.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-email-fixes.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-google-reviews-badge.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-main-header-menu-api.php` | ✅ v2.0.0 | ❌ Missing | **COPY** |
| `hercules-menu-icon-field.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-menu-webhooks.php` | ✅ v1.0.0 | ❌ Missing | **COPY** |
| `hercules-mini-cart-override.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-pearl-steps-api.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-post-webhooks.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-prevent-duplicate-email.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `hercules-session-api.php` | ✅ v1.9.0 | ❌ Missing | **COPY** (Critical) |
| `hercules-sticky-header.php` | ✅ v2.0.7 | ❌ Missing | **COPY** |
| `hercules-wishlist-api.php` | ✅ v1.0.7 | ❌ Missing | **COPY** |
| `pearl-rest-api-meta.php` | ✅ v1.2 | ❌ Missing | **COPY** (Critical) |
| `hercules-dynamic-menu-shortcode.php` | ✅ v1.0 | ❌ Missing | **COPY** |
| `wc-ga4-gtag-baseline.php` | ✅ | ✅ | No action |
| `wc-per-category-sorting/` | ✅ | ✅ | No action |
| `wc-per-category-sorting-loader.php` | ✅ | ✅ | No action |

**Debug files (DO NOT COPY):**
- `hercules-cart-debug.php`
- `hercules-debug-cookies.php`
- `hercules-dynamic-mega-menu.php.disabled`

### 2.2 Theme Changes (hello-theme-child-master)

| File/Folder | Staging | Production | Action Required |
|-------------|---------|------------|-----------------|
| `functions.php` | 58,599 bytes | 31,251 bytes | **COPY** (Major updates) |
| `style.css` | Updated | Older | **COPY** |
| `js/frontend.js` | Updated | Older | **COPY** |
| `js/custom-combined.js` | ✅ New | ❌ Missing | **COPY** |
| `css/custom-combined.css` | ✅ New | ❌ Missing | **COPY** |
| `woocommerce/cart/mini-cart.php` | ✅ New | ❌ Missing | **COPY** |
| `woocommerce/checkout/review-order.php` | Updated | Older | **COPY** |
| `woocommerce/emails/admin-new-order.php` | Updated | Older | **COPY** |
| `woocommerce/emails/customer-on-hold-order.php` | Updated | Older | **COPY** |

### 2.3 Plugins Comparison

| Plugin | Staging | Production | Notes |
|--------|---------|------------|-------|
| `akismet` | ✅ Active | ❌ Missing | Consider adding |
| `classic-editor` | Disabled | Active | Disable on prod |
| `duracelltomi-google-tag-manager` | ✅ Active | ❌ Missing | Consider adding |
| `easy-wp-smtp` | Disabled | Active | Disable on prod |
| `honeypot` | Disabled | Active | Disable on prod |
| `malcare-security` | Disabled | Active | **DISABLE on prod** |
| `menu-image` | Disabled | Active | Disable (replaced by mu-plugin) |
| `sitepress-multilingual-cms` | ✅ Active | ❌ Missing | For multilingual |
| `woo-preview-emails` | Disabled | Active | Disable on prod |
| `duplicate-post` | Disabled | Active | Disable on prod |
| `instant-images` | ✅ Active | ❌ Missing | Optional |
| `rich-text-editor-tinymce-for-woocommerce` | ✅ Active | ❌ Missing | Optional |

### 2.4 Database

| Setting | Staging | Production |
|---------|---------|------------|
| Database Name | `wp_jicy1` | `wp_iwllm` |
| Table Prefix | `wp_1202943_` | `wp_1202943_` (same) |

**Note:** Same table prefix means database migration possible but requires careful handling.

---

## 3. Cloudflare Configuration

### 3.1 Current Edge Router Configuration

**File:** `workers/edge-router/wrangler.toml`
```toml
name = "hercules-edge-router"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
ASTRO_ORIGIN = "https://hercules-astro.pages.dev"
WORDPRESS_ORIGIN = "https://staging.hercules-merchandise.de"

routes = [
  { pattern = "staging.hercules-merchandise.de/*", zone_name = "hercules-merchandise.de" }
]
```

### 3.2 Production Edge Router Configuration (REQUIRED)

```toml
name = "hercules-edge-router"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
ASTRO_ORIGIN = "https://hercules-astro.pages.dev"
WORDPRESS_ORIGIN = "https://hercules-merchandise.de"

routes = [
  { pattern = "hercules-merchandise.de/*", zone_name = "hercules-merchandise.de" }
]
```

### 3.3 Edge Router Code Update Required

In `workers/edge-router/src/index.ts`, update:
- Line 213: Change `origin-staging.hercules-merchandise.de` to production origin

### 3.4 Workers Deployed (Gilles's Account)

| Worker | URL | Purpose |
|--------|-----|---------|
| Edge Router | `hercules-edge-router.gilles-86d.workers.dev` | Routes Astro ↔ WordPress |
| Product Sync | `hercules-product-sync.gilles-86d.workers.dev` | Product/Category sync |
| Form Handler | `hercules-form-handler.gilles-86d.workers.dev` | Contact forms, R2 uploads |

**Account ID:** `86dfa0e10ca766f79d5042548fc2776f`

---

## 4. WordPress Endpoints Summary

### 4.1 Custom REST API Endpoints (mu-plugins)

| Endpoint | Plugin | Purpose |
|----------|--------|---------|
| `GET /wp-json/hercules/v1/session` | hercules-session-api.php | Cart count, user state |
| `POST /wp-json/hercules/v1/cart/remove` | hercules-session-api.php | Remove cart item |
| `GET /wp-json/hercules/v1/wishlist` | hercules-wishlist-api.php | Get wishlist items |
| `POST /wp-json/hercules/v1/wishlist/toggle` | hercules-wishlist-api.php | Add/remove wishlist |
| `GET /wp-json/hercules/v1/categories` | hercules-category-api.php | Category list |
| `GET /wp-json/hercules/v1/category/{slug}` | hercules-category-api.php | Category details |
| `GET /wp-json/hercules/v1/main-header-menu` | hercules-main-header-menu-api.php | Menu structure |

### 4.2 WooCommerce REST API Extensions (pearl-rest-api-meta.php)

Added to product responses:
- `conditional_prices` - Quantity tier pricing
- `lead_time` - Delivery timeframe
- `addon_options` - Available addons
- `allowed_addon_ids` - Allowed addon IDs
- `estimated_delivery_date` - Custom delivery date
- `pdf_url`, `pdf_2_url` - Design PDF downloads
- `faq` - FAQ entries

---

## 5. GitHub CI/CD

### 5.1 Current Workflow

**Repository:** `https://github.com/kamindu01/hercules-astro` (private)

**Triggers:**
1. Push to `main` branch
2. `workflow_dispatch` API call (from Product Sync Worker)
3. WooCommerce webhooks → Product Sync → GitHub Actions

**Secrets Required:**
- `CLOUDFLARE_API_TOKEN` (Gilles's account)
- `CLOUDFLARE_ACCOUNT_ID` (`86dfa0e10ca766f79d5042548fc2776f`)
- `WC_CONSUMER_KEY` (WooCommerce API)
- `WC_CONSUMER_SECRET` (WooCommerce API)

### 5.2 Production Update Required

Update `.env` and GitHub secrets with production WooCommerce API credentials.

---

## 6. Deployment Checklist

### Phase 1: Pre-Deployment Preparation

- [ ] **1.1** Create full backup of production WordPress
  ```bash
  ssh combel
  cd /var/www/vhosts/hercules-merchandise.de
  tar -czvf backups/httpdocs-backup-$(date +%Y%m%d).tar.gz httpdocs/
  ```

- [ ] **1.2** Create database backup
  ```bash
  wp db export backups/db-backup-$(date +%Y%m%d).sql --path=httpdocs/
  ```

- [ ] **1.3** Generate production WooCommerce API keys
  - Go to: `https://hercules-merchandise.de/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys`
  - Create new key with Read/Write permissions
  - Save key and secret securely

### Phase 2: WordPress File Migration

- [ ] **2.1** Copy all mu-plugins to production
  ```bash
  ssh combel
  cd /var/www/vhosts/hercules-merchandise.de

  # Copy mu-plugins
  cp staging.hercules-merchandise.de/wp-content/mu-plugins/hercules-*.php httpdocs/wp-content/mu-plugins/
  cp staging.hercules-merchandise.de/wp-content/mu-plugins/pearl-rest-api-meta.php httpdocs/wp-content/mu-plugins/
  ```

- [ ] **2.2** Copy theme changes
  ```bash
  # Backup existing theme
  cp -r httpdocs/wp-content/themes/hello-theme-child-master/ backups/hello-theme-child-backup-$(date +%Y%m%d)/

  # Copy updated files
  cp staging.hercules-merchandise.de/wp-content/themes/hello-theme-child-master/functions.php httpdocs/wp-content/themes/hello-theme-child-master/
  cp staging.hercules-merchandise.de/wp-content/themes/hello-theme-child-master/style.css httpdocs/wp-content/themes/hello-theme-child-master/
  cp staging.hercules-merchandise.de/wp-content/themes/hello-theme-child-master/js/*.js httpdocs/wp-content/themes/hello-theme-child-master/js/
  cp staging.hercules-merchandise.de/wp-content/themes/hello-theme-child-master/css/*.css httpdocs/wp-content/themes/hello-theme-child-master/css/

  # Copy WooCommerce templates
  cp -r staging.hercules-merchandise.de/wp-content/themes/hello-theme-child-master/woocommerce/ httpdocs/wp-content/themes/hello-theme-child-master/woocommerce/
  ```

- [ ] **2.3** Disable conflicting plugins on production
  ```bash
  cd httpdocs
  mv wp-content/plugins/malcare-security wp-content/plugins/malcare-security-disabled
  mv wp-content/plugins/menu-image wp-content/plugins/menu-image-disabled
  mv wp-content/plugins/classic-editor wp-content/plugins/classic-editor-disabled
  mv wp-content/plugins/easy-wp-smtp wp-content/plugins/easy-wp-smtp-disabled
  ```

- [ ] **2.4** Copy menu icons folder
  ```bash
  cp -r staging.hercules-merchandise.de/wp-content/uploads/hercules-menu-icons/ httpdocs/wp-content/uploads/
  ```

### Phase 3: Cloudflare Configuration

- [ ] **3.1** Update Edge Router wrangler.toml
  ```toml
  [vars]
  WORDPRESS_ORIGIN = "https://hercules-merchandise.de"

  routes = [
    { pattern = "hercules-merchandise.de/*", zone_name = "hercules-merchandise.de" }
  ]
  ```

- [ ] **3.2** Update Edge Router code
  - Change `origin-staging.hercules-merchandise.de` to production
  - Update any staging URLs in the code

- [ ] **3.3** Deploy updated Edge Router
  ```bash
  cd workers/edge-router
  CLOUDFLARE_API_TOKEN="ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp" \
  CLOUDFLARE_ACCOUNT_ID="86dfa0e10ca766f79d5042548fc2776f" \
  npx wrangler deploy
  ```

- [ ] **3.4** Update Product Sync Worker
  - Update `WC_STORE_URL` to production
  - Update `ASTRO_SITE_URL` if needed
  - Deploy worker

### Phase 4: WooCommerce Webhooks

- [ ] **4.1** Create webhooks on production WordPress
  ```
  Webhook 1: Product Created → https://hercules-product-sync.gilles-86d.workers.dev/webhook/product-create
  Webhook 2: Product Updated → https://hercules-product-sync.gilles-86d.workers.dev/webhook/product-update
  Webhook 3: Product Deleted → https://hercules-product-sync.gilles-86d.workers.dev/webhook/product-delete

  Secret: hercules-webhook-secret-2024
  ```

### Phase 5: GitHub CI/CD Updates

- [ ] **5.1** Update GitHub repository secrets
  - `WC_CONSUMER_KEY` → Production key
  - `WC_CONSUMER_SECRET` → Production secret

- [ ] **5.2** Update `.env` file locally
  ```env
  WC_STORE_URL=https://hercules-merchandise.de
  WC_CONSUMER_KEY=ck_PRODUCTION_KEY
  WC_CONSUMER_SECRET=cs_PRODUCTION_SECRET
  ```

- [ ] **5.3** Update Astro config
  - Update `site` in `astro.config.mjs` to production domain

### Phase 6: DNS & Go Live

- [ ] **6.1** Verify Cloudflare DNS settings
  - Ensure `hercules-merchandise.de` is proxied (orange cloud)
  - Edge Router will intercept all traffic

- [ ] **6.2** Test Edge Router routing
  ```bash
  curl -sI "https://hercules-merchandise.de/" | grep "X-Edge-Router"
  curl -sI "https://hercules-merchandise.de/cart" | grep "X-Routed-To"
  ```

- [ ] **6.3** Trigger full product sync
  ```bash
  curl -X POST "https://hercules-product-sync.gilles-86d.workers.dev/trigger-rebuild" \
    -H "Authorization: Bearer hercules-webhook-secret-2024"
  ```

- [ ] **6.4** Verify site functionality
  - Homepage loads from Astro
  - Collections/Products load from Astro
  - Cart/Checkout loads from WordPress
  - Session/Cart count syncs properly
  - Menu displays correctly

### Phase 7: Post-Go-Live

- [ ] **7.1** Monitor error logs
  ```bash
  ssh combel
  tail -f /var/www/vhosts/hercules-merchandise.de/logs/error_log
  ```

- [ ] **7.2** Clear all caches
  - Cloudflare: Purge everything
  - WP Rocket: Clear cache
  - Browser: Hard refresh

- [ ] **7.3** Test all critical paths
  - Add product to cart
  - Complete checkout
  - User login/registration
  - Contact form submission
  - Newsletter signup

---

## 7. Rollback Plan

If issues occur:

1. **Revert Edge Router**
   ```bash
   # Restore staging configuration
   # Update wrangler.toml to point back to staging
   npx wrangler deploy
   ```

2. **Restore WordPress Files**
   ```bash
   ssh combel
   cd /var/www/vhosts/hercules-merchandise.de
   rm -rf httpdocs/wp-content/mu-plugins/hercules-*.php
   cp -r backups/hello-theme-child-backup-*/  httpdocs/wp-content/themes/hello-theme-child-master/
   ```

3. **Disable Edge Router Route**
   - Remove route from wrangler.toml
   - Redeploy worker

---

## 8. Important Credentials Reference

| Service | Location | Notes |
|---------|----------|-------|
| Cloudflare (Gilles) | `.env`, GitHub Secrets | Account: 86dfa0e10ca766f79d5042548fc2776f |
| WooCommerce API | `.env`, GitHub Secrets | Need production keys |
| SSH (Combell) | `ssh combel` | 136.144.235.35, user: kamindu-de |
| GitHub | github.com/kamindu01/hercules-astro | Private repo |
| Brevo API | Cloudflare secrets | Email service |
| Webhook Secret | Workers | hercules-webhook-secret-2024 |

---

## 9. Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Preparation | 30 min | Backups |
| Phase 2: WordPress Migration | 45 min | File copies |
| Phase 3: Cloudflare Config | 30 min | Worker deploy |
| Phase 4: Webhooks | 15 min | WP Admin |
| Phase 5: GitHub Updates | 15 min | Secrets |
| Phase 6: DNS & Go Live | 30 min | Testing |
| Phase 7: Post-Go-Live | 60 min | Monitoring |

**Total Estimated Time: 3-4 hours**

---

## 10. Contact Information

- **Cloudflare Account Owner:** Gilles
- **Server Host:** Combell (Belgium)
- **Development:** Kamindu

---

*Document created: 2026-01-27*
*Last updated: 2026-01-27*
