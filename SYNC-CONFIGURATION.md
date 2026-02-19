# Hercules Headless — Sync Configuration Reference

This document describes the complete sync architecture between WordPress/WooCommerce and the Astro frontend. Use it as the blueprint when setting up or auditing sync on any Hercules regional site.

---

## Regional Sites Status

| Site | Region | Astro Repo | Status | Missing |
|------|--------|------------|--------|---------|
| `hercules-merchandise.co.uk` | 🇬🇧 UK | `royboy31/hercules-live-uk` | ✅ Fully configured | — |
| `hercules-merchandise.de` | 🇩🇪 DE | `royboy31/hercules-live-de` | ⚠️ Partial | Product webhooks, category webhooks, dynamic homepage |
| `hercules-merchandising.fr` | 🇫🇷 FR | *(WordPress only)* | ❌ Not applicable | Full headless build needed first |
| `hercules-merchandise.nl` | 🇳🇱 NL | *(planned)* | 🔲 Planned | — |

---

## Site-Specific Configuration Values

### 🇬🇧 UK (`hercules-merchandise.co.uk`) — reference / fully live

| Item | Staging | Production |
|------|---------|------------|
| Worker name | `hercules-product-sync-uk` | `hercules-product-sync-uk` `--env production` |
| Worker URL | `https://hercules-product-sync-uk.gilles-86d.workers.dev` | `https://hercules-product-sync-uk-production.gilles-86d.workers.dev` |
| KV Namespace ID | `50743a0e269f4450b61bb690847534c4` | `82f827d101734ce38ccc89629c7ae919` |
| Astro Pages project | `hercules-uk-staging-e9z` | `hercules-uk` |
| Astro Pages URL | `https://hercules-uk-staging-e9z.pages.dev` | `https://hercules-uk.pages.dev` |
| WC store URL | `https://staging.hercules-merchandise.co.uk` | `https://hercules-merchandise.co.uk` |
| WordPress server | `ssh combel-uk` | same server |
| mu-plugins path (prod) | — | `/var/www/vhosts/hercules-merchandise.co.uk/httpdocs/wp-content/mu-plugins/` |
| mu-plugins path (staging) | `/var/www/vhosts/hercules-merchandise.co.uk/staging.hercules-merchandise.co.uk/wp-content/mu-plugins/` | — |
| Webhook secret | `hercules-webhook-secret-uk-2024` | same |
| GitHub repo | `royboy31/hercules-live-uk` | same |
| Astro project folder | `/home/kamindu/hercules-headless-uk/` | — |

### 🇩🇪 DE (`hercules-merchandise.de`) — partial, needs product/category webhooks

| Item | Staging | Production |
|------|---------|------------|
| Worker name | `hercules-product-sync-live` | `hercules-product-sync-live` `--env production` |
| Worker URL | `https://hercules-product-sync.gilles-86d.workers.dev` | *(same worker, production env)* |
| KV Namespace ID | `9eb4cfdf0e0d4636ad728eeb0ee30557` | *(same — DE uses one KV namespace)* |
| Astro Pages project | — | `hercules-de-live` |
| Astro Pages URL | — | `https://hercules-de-live.pages.dev` |
| WC store URL | `https://staging.hercules-merchandise.de` | `https://hercules-merchandise.de` |
| WordPress server | `ssh combel` | same server |
| mu-plugins path (prod) | — | `/var/www/vhosts/hercules-merchandise.de/httpdocs/wp-content/mu-plugins/` |
| mu-plugins path (staging) | `/var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/mu-plugins/` | — |
| Webhook secret | `hercules-webhook-secret-2024` | same |
| GitHub repo | `royboy31/hercules-live-de` | same |
| Astro project folder | `/home/kamindu/hercules-headless-live/` | — |

**DE — what's missing:**

| Item | Status | Action |
|------|--------|--------|
| `hercules-product-webhooks.php` | ❌ Not installed | Copy from UK `wordpress-updates/`, update secret + URLs, deploy to DE server |
| `hercules-category-webhooks.php` | ❌ Not installed | Same as above |
| `src/pages/index.astro` homepage | ❌ Uses static JSON | Apply same dynamic fetch fix as UK |
| `hercules-post-webhooks.php` | ✅ Installed | — |
| `hercules-menu-webhooks.php` | ✅ Installed | — |

---

## Architecture Overview

```
WordPress/WooCommerce
        │
        │  (1) content saved/deleted
        ▼
  mu-plugins (PHP)
  ├── hercules-product-webhooks.php
  ├── hercules-category-webhooks.php
  ├── hercules-post-webhooks.php
  └── hercules-menu-webhooks.php
        │
        │  (2) HTTP POST + HMAC-SHA256 signature
        ▼
Cloudflare Worker (product-sync)
  ├── Verifies HMAC signature
  ├── Fetches full item from WooCommerce REST API
  ├── Transforms data
  ├── Writes to KV (item + index)
  └── Triggers GitHub Actions rebuild (debounced 5 min)
        │
        │  (3) KV stores product/category/post data
        ▼
Cloudflare KV Namespace
  ├── product:{id}
  ├── product:slug:{slug}
  ├── product:index            ← used by Astro build
  ├── category:{id}
  ├── category:slug:{slug}
  ├── category:index
  ├── post:{id}
  ├── post:slug:{slug}
  ├── post:index
  └── image:{slug}:{index}     ← cached WebP images
        │
        │  (4) rebuild triggered → GitHub Actions fetches from KV
        ▼
Astro Static Build (Cloudflare Pages)
  └── getStaticPaths() reads from KV → builds product/category/blog pages
```

---

## Required Components

| Component | Purpose |
|-----------|---------|
| Cloudflare Worker (`product-sync`) | Data sync, image cache, rebuild trigger |
| Cloudflare KV Namespace | Stores all synced content + image cache |
| GitHub Actions (`deploy.yml`) | Rebuilds Astro site on content change |
| 4× WordPress mu-plugins | Detect content changes, send webhooks |

---

## Worker Setup

### wrangler.toml

```toml
name = "hercules-product-sync-[region]"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# KV namespace (staging)
[[kv_namespaces]]
binding = "PRODUCTS_KV"
id = "[staging-kv-namespace-id]"

# ⚠️ IMPORTANT: Do NOT enable cron triggers here.
# wrangler deploy re-registers triggers from this file on every deploy,
# overriding any manual dashboard setting. Keep commented out and
# run manual syncs via the /sync endpoint instead.
# [triggers]
# crons = ["0 3 * * *"]

[vars]
WC_STORE_URL  = "https://staging.[domain]"
ASTRO_SITE_URL = "https://[staging-pages-project].pages.dev"

[env.production]

[[env.production.kv_namespaces]]
binding = "PRODUCTS_KV"
id = "[production-kv-namespace-id]"

# [env.production.triggers]
# crons = ["0 3 * * *"]

[env.production.vars]
WC_STORE_URL  = "https://[domain]"
ASTRO_SITE_URL = "https://[pages-project].pages.dev"
```

### Worker Secrets (set via `wrangler secret put`)

| Secret | Description |
|--------|-------------|
| `WC_CONSUMER_KEY` | WooCommerce REST API consumer key |
| `WC_CONSUMER_SECRET` | WooCommerce REST API consumer secret |
| `WEBHOOK_SECRET` | Shared secret for HMAC signature verification |
| `GITHUB_TOKEN` | GitHub OAuth token (`gh auth token`) for triggering workflow_dispatch |

Set for both environments:
```bash
# Production
wrangler secret put WC_CONSUMER_KEY     --env production
wrangler secret put WC_CONSUMER_SECRET  --env production
wrangler secret put WEBHOOK_SECRET      --env production
wrangler secret put GITHUB_TOKEN        --env production

# Staging
wrangler secret put WC_CONSUMER_KEY
wrangler secret put WC_CONSUMER_SECRET
wrangler secret put WEBHOOK_SECRET
wrangler secret put GITHUB_TOKEN
```

---

## GitHub Actions Setup

In `.github/workflows/deploy.yml`, pass the production worker URL as a build env var so the Astro build fetches from production KV (not staging):

```yaml
- name: Build Astro site
  run: npm run build
  env:
    WORKER_URL: https://[worker-name]-production.[account].workers.dev
    WC_CONSUMER_KEY:    ${{ secrets.WC_CONSUMER_KEY }}
    WC_CONSUMER_SECRET: ${{ secrets.WC_CONSUMER_SECRET }}
```

In every Astro page/component that fetches from the worker:
```typescript
const WORKER_URL = import.meta.env.WORKER_URL
  || 'https://[worker-name].[account].workers.dev';  // staging fallback for local dev
```

---

## WordPress mu-plugins

Install all four plugins on **both staging and production** servers. Copy to `wp-content/mu-plugins/`. Always create a `.bak-YYYYMMDD` backup before overwriting an existing file.

When adapting for a new region, update two values inside each plugin:
- `$webhook_secret` — match the `WEBHOOK_SECRET` set on the worker
- `get_webhook_url()` — return the correct staging / production worker URLs for that region

### 1. `hercules-product-webhooks.php`

**What it covers:** All product data changes, including ACF fields.

| WordPress Hook | Fires When | Worker Endpoint |
|---------------|-----------|----------------|
| `woocommerce_update_product` | Product saved/updated | `/webhook/product-update` |
| `woocommerce_new_product` | New product created | `/webhook/product-create` |
| `woocommerce_save_product_variation` | Variation price/stock changes | `/webhook/product-update` (parent ID) |
| `wp_trash_post` | Product moved to trash | `/webhook/product-delete` |
| `untrash_post` | Product restored from trash | `/webhook/product-update` |
| `before_delete_post` | Product permanently deleted | `/webhook/product-delete` |
| `acf/save_post` (priority 30) | ACF fields saved (PDFs, addons, badges) | `/webhook/product-update` |

> **Why `acf/save_post` at priority 30?**
> `woocommerce_update_product` fires at `save_post` priority 10. ACF saves custom fields at `save_post` priority 20. If you only hook `woocommerce_update_product`, the worker fetches the product *before* ACF has written `pdf_url`, `pdf_2_url`, addon options, and badge meta to the database. Priority 30 ensures ACF data is committed before the webhook fires.

### 2. `hercules-category-webhooks.php`

**What it covers:** Product category changes.

| WordPress Hook | Fires When | Worker Endpoint |
|---------------|-----------|----------------|
| `created_product_cat` | Category created | `/webhook/category-create` |
| `edited_product_cat` | Category renamed/edited | `/webhook/category-update` |
| `delete_product_cat` | Category deleted | `/webhook/category-delete` |

### 3. `hercules-post-webhooks.php`

**What it covers:** Blog post changes.

| WordPress Hook | Fires When | Worker Endpoint |
|---------------|-----------|----------------|
| `save_post` | Post created or updated | `/webhook/post-create` or `/webhook/post-update` |
| `wp_trash_post` | Post trashed | `/webhook/post-update` |
| `before_delete_post` | Post permanently deleted | `/webhook/post-delete` |

### 4. `hercules-menu-webhooks.php`

**What it covers:** Navigation menu changes. Menu data is built into the Astro static bundle, so a full site rebuild is needed on any menu change.

| WordPress Hook | Fires When | Worker Endpoint |
|---------------|-----------|----------------|
| `wp_update_nav_menu` | Menu saved | `/trigger-rebuild` |

---

## Webhook Payload Format

All webhooks use the same HMAC-SHA256 signature method:
```php
$signature = base64_encode(hash_hmac('sha256', $payload, $webhook_secret, true));
// Sent as: X-WC-Webhook-Signature header
```

### Product payloads
```json
{ "id": 12345, "name": "Product Name", "action": "update", "status": "publish" }
{ "id": 12345, "action": "delete" }
{ "id": 12345, "variation_id": 67890, "action": "variation_update" }
{ "id": 12345, "name": "Product Name", "action": "acf_save", "status": "publish" }
```

### Category payloads
```json
{ "id": 42, "action": "update" }
{ "id": 42, "action": "delete" }
```

### Post payloads
```json
{ "id": 99, "post_id": 99, "action": "update", "status": "publish" }
{ "id": 99, "post_id": 99, "action": "delete" }
```

---

## Worker Webhook Endpoints

All webhook endpoints require `X-WC-Webhook-Signature` header. All manual endpoints require `Authorization: Bearer {WEBHOOK_SECRET}`.

### Webhook endpoints (called by WordPress mu-plugins)

| Endpoint | Method | Action |
|----------|--------|--------|
| `/webhook/product-update` | POST | Sync single product to KV + update `product:index` + rebuild |
| `/webhook/product-create` | POST | Same as product-update |
| `/webhook/product-delete` | POST | Remove product from KV + `product:index` + rebuild |
| `/webhook/category-update` | POST | Sync single category to KV + update `category:index` + rebuild |
| `/webhook/category-create` | POST | Same as category-update |
| `/webhook/category-delete` | POST | Remove category from KV + `category:index` + rebuild |
| `/webhook/post-update` | POST | Sync single post to KV + update `post:index` + rebuild |
| `/webhook/post-create` | POST | Same as post-update |
| `/webhook/post-delete` | POST | Remove post from KV + `post:index` + rebuild |
| `/trigger-rebuild` | POST | Trigger GitHub Actions rebuild only (no KV write) |

### Manual sync endpoints (protected by Bearer token)

```bash
WORKER="https://[worker-url]"
SECRET="[webhook-secret]"

# Full product sync (run after initial setup or if KV is wiped)
curl -X POST "$WORKER/sync" -H "Authorization: Bearer $SECRET"

# Full category sync
curl -X POST "$WORKER/sync-categories" -H "Authorization: Bearer $SECRET"

# Full post sync
curl -X POST "$WORKER/sync-posts" -H "Authorization: Bearer $SECRET"

# Force re-cache all product images (expensive — use once at setup)
curl -X POST "$WORKER/resync-images?force_images=true" -H "Authorization: Bearer $SECRET"

# Force re-cache images for a single product
curl -X POST "$WORKER/resync-product-images/{slug}" -H "Authorization: Bearer $SECRET"

# Trigger rebuild without a sync
curl -X POST "$WORKER/trigger-rebuild" -H "Authorization: Bearer $SECRET"

# Check sync status
curl "$WORKER/status"
```

### Data read endpoints (public, used by Astro build and browser)

| Endpoint | Returns |
|----------|---------|
| `GET /products` | Product index (lightweight, used by Astro `getStaticPaths`) |
| `GET /products-full` | All products with full data |
| `GET /product/{slug}` | Single product |
| `GET /products-by-category/{slug}` | Products in a category |
| `GET /categories` | All categories |
| `GET /category/{slug}` | Single category |
| `GET /posts` | Post index |
| `GET /post/{slug}` | Single post |
| `GET /search?q={query}` | Live product search |
| `GET /image/{slug}/{index}` | Cached product image (WebP) |
| `GET /image/{slug}/{index}?size=thumb` | Cached product thumbnail |
| `GET /status` | Last sync time, GitHub token status |

---

## KV Data Structure

| Key Pattern | Contents |
|-------------|---------|
| `product:{id}` | Full synced product JSON |
| `product:slug:{slug}` | Full synced product JSON (slug lookup) |
| `product:index` | Array of `{id, name, slug, featured, categories[], menu_order, made_in_europe, green_product, made_in_uk}` |
| `category:{id}` | Full synced category JSON |
| `category:slug:{slug}` | Full synced category JSON |
| `category:index` | Array of `{id, name, slug, parent, productCount}` |
| `post:{id}` | Full synced post JSON |
| `post:slug:{slug}` | Full synced post JSON |
| `post:index` | Array of `{id, title, slug, date, excerpt, featuredImage}` |
| `image:{slug}:{index}` | Base64 WebP image (full size, 361×361) |
| `image:{slug}:{index}:thumb` | Base64 WebP image (thumbnail, 100×100) |
| `last_sync` | ISO timestamp of last full product sync |
| `last_rebuild` | Unix ms timestamp of last GitHub Actions trigger |

---

## Sync Coverage by Content Type

| Content Type | Sync Trigger | Partial Sync | Rebuild |
|-------------|-------------|-------------|---------|
| Product create | `woocommerce_new_product` | ✅ Single product | ✅ Debounced 5 min |
| Product update | `woocommerce_update_product` | ✅ Single product | ✅ Debounced 5 min |
| Product variation change | `woocommerce_save_product_variation` | ✅ Parent product | ✅ Debounced 5 min |
| Product delete/trash | `wp_trash_post` / `before_delete_post` | ✅ Removed from KV + index | ✅ Debounced 5 min |
| ACF fields (PDFs, addons, badges) | `acf/save_post` priority 30 | ✅ Single product | ✅ Debounced 5 min |
| Category create/update/delete | `created/edited/delete_product_cat` | ✅ Single category | ✅ Debounced 5 min |
| Blog post create/update | `save_post` | ✅ Single post | ✅ Debounced 5 min |
| Blog post delete/trash | `before_delete_post` / `wp_trash_post` | ✅ Removed from KV + index | ✅ Debounced 5 min |
| Menu change | `wp_update_nav_menu` | ❌ Full rebuild only | ✅ Debounced 5 min |
| Attribute term rename | *(not hooked)* | ❌ Manual sync required | Manual |

---

## Porting to a New Site — Checklist

Use this checklist when applying the sync architecture to a new regional site. The UK site is the reference implementation.

### Phase 1 — Worker

- [ ] Copy `workers/product-sync/` from the UK project
- [ ] Update `wrangler.toml`: worker name, KV namespace IDs, `WC_STORE_URL`, `ASTRO_SITE_URL`
- [ ] Update `src/index.ts`: `WORKER_URL` constant (used for image URLs) and `GITHUB_REPO`
- [ ] Deploy worker (staging): `wrangler deploy`
- [ ] Set all 4 secrets (staging): `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `WEBHOOK_SECRET`, `GITHUB_TOKEN`
- [ ] Deploy worker (production): `wrangler deploy --env production`
- [ ] Set all 4 secrets (production) with `--env production`
- [ ] Verify: `curl "[worker-url]/status"`

### Phase 2 — Initial data sync

```bash
WORKER="https://[worker-url]"
SECRET="[webhook-secret]"

curl -X POST "$WORKER/sync"            -H "Authorization: Bearer $SECRET"
curl -X POST "$WORKER/sync-categories" -H "Authorization: Bearer $SECRET"
curl -X POST "$WORKER/sync-posts"      -H "Authorization: Bearer $SECRET"

# Verify counts
curl "$WORKER/products" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'products')"
```

### Phase 3 — WordPress mu-plugins

For each plugin, update `$webhook_secret` and `get_webhook_url()` to use the region's worker URLs, then deploy to both staging and production:

```bash
# For each plugin file:
scp wordpress-updates/hercules-product-webhooks.php  [server]:[mu-plugins-path]/
scp wordpress-updates/hercules-category-webhooks.php [server]:[mu-plugins-path]/
scp wordpress-updates/hercules-post-webhooks.php     [server]:[mu-plugins-path]/
scp wordpress-updates/hercules-menu-webhooks.php     [server]:[mu-plugins-path]/

# Verify PHP syntax (adjust PHP path per server)
ssh [server] "php -l [mu-plugins-path]/hercules-product-webhooks.php"
```

### Phase 4 — Astro build

- [ ] In `.github/workflows/deploy.yml` set `WORKER_URL` env var to the production worker URL
- [ ] In every Astro page that fetches from the worker, use:
  ```typescript
  const WORKER_URL = import.meta.env.WORKER_URL || 'https://[staging-worker-url]';
  ```
- [ ] Update `src/pages/index.astro`: replace static `homepage-products.json` import with dynamic build-time fetch (see UK implementation — `homepageProductSlugs` array + `Promise.all` fetches)
- [ ] Trigger a build and verify all pages load

### Phase 5 — Verify end-to-end

- [ ] Update a product in WordPress → confirm KV `synced_at` updates → confirm rebuild triggers → confirm site reflects change
- [ ] Update a category → confirm rebuild triggers
- [ ] Save a post → confirm rebuild triggers
- [ ] Update a menu → confirm rebuild triggers

---

## Emergency: KV Wiped / `product:index` Empty

If products disappear from the site but individual `product:{id}` KV entries still exist (common after a failed or buggy sync), rebuild `product:index` without a full sync:

```python
# rebuild-index.py — 98 reads + 1 write, well within daily KV limits
import urllib.request, json, time

CF_ACCOUNT = "[account-id]"
CF_TOKEN   = "[api-token]"
KV_NS      = "[kv-namespace-id]"
BASE       = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT}/storage/kv/namespaces/{KV_NS}"
HEADERS    = {"Authorization": f"Bearer {CF_TOKEN}"}

def cf_get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

resp = cf_get(f"{BASE}/keys?prefix=product%3A&limit=1000")
id_keys = [k["name"] for k in resp["result"] if k["name"].replace("product:", "").isdigit()]
print(f"Found {len(id_keys)} product entries")

index = []
for key in id_keys:
    product = cf_get(f"{BASE}/values/{key.replace(':', '%3A')}")
    index.append({
        "id":            product["id"],
        "name":          product["name"],
        "slug":          product["slug"],
        "featured":      product.get("featured", False),
        "categories":    [c["slug"] for c in product.get("categories", [])],
        "menu_order":    product.get("menu_order", 0),
        "made_in_europe": product.get("made_in_europe", False),
        "green_product":  product.get("green_product", False),
        "made_in_uk":     product.get("made_in_uk", False),
    })
    time.sleep(0.05)

put_req = urllib.request.Request(
    f"{BASE}/values/product%3Aindex",
    data=json.dumps(index).encode(),
    headers={**HEADERS, "Content-Type": "application/json"},
    method="PUT"
)
with urllib.request.urlopen(put_req) as r:
    result = json.loads(r.read())
    print("Written:", result["success"], f"({len(index)} products)")
```

After running, trigger a fresh build:
```bash
gh workflow run deploy.yml --repo [org]/[repo] --ref production
```

---

## Known Gotchas

### 1. Cron re-enabled by `wrangler deploy`
Every `wrangler deploy` re-registers trigger configuration from `wrangler.toml`. If cron entries exist in `wrangler.toml`, they will be re-enabled even if you disabled them in the Cloudflare dashboard. **Always keep cron entries commented out in `wrangler.toml`** and use manual `/sync` calls instead.

### 2. Delta sync must never overwrite `product:index` with a filtered result
If you implement delta sync (fetching only recently modified products), the `syncAllProducts()` function receives a filtered list. Never write that filtered list to `product:index` — it will overwrite the full index with a partial or empty list. Only write `product:index` during a full sync (when `modifiedAfter` is undefined).

### 3. ACF fields are not saved when `woocommerce_update_product` fires
`woocommerce_update_product` fires at `save_post` priority 10. ACF writes custom fields at priority 20. Always add a second `acf/save_post` hook at priority 30 to catch PDF URLs, addon options, and any other ACF-managed fields.

### 4. Rebuild debounce is 5 minutes
Multiple webhook updates in quick succession only trigger one rebuild. The KV is always updated immediately on each webhook — only the rebuild is debounced. If you save a product within 5 minutes of a recent rebuild, the KV entry is updated correctly but no new build fires. The next rebuild (manual or from a subsequent save) picks up all accumulated changes. Trigger a manual rebuild if needed: `gh workflow run deploy.yml --repo [org]/[repo] --ref production`

### 5. KV writes must happen before the image caching loop
The image caching loop inside `syncSingleProduct()` can use up to ~40 subrequests (WebP probe + fallback × images × sizes). Cloudflare limits Workers to 50 subrequests per invocation. If KV writes come after the image loop and the loop exhausts the limit, the KV write never executes — the product appears "synced" (webhook returned 200) but `synced_at` never updates. Always write to KV first, then run the image loop.

---

*Last updated: 2026-02-19*
