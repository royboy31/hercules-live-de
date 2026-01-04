# Hercules Merchandise - Astro Headless Site

## Project Overview
Migrating WordPress/WooCommerce Hercules Merchandise site (staging.hercules-merchandise.de) to a headless Astro + React architecture with pixel-perfect header matching.

## Quick Reference

### URLs
- **Astro Site:** https://hercules-astro.pages.dev (Gilles account)
- **Edge Router:** https://hercules-edge-router.gilles-86d.workers.dev
- **Worker API:** https://hercules-product-sync.gilles-86d.workers.dev
- **WordPress Staging:** https://staging.hercules-merchandise.de
- **WordPress Admin:** https://staging.hercules-merchandise.de/wp-admin/
- **Staging via Edge Router:** https://staging.hercules-merchandise.de (routes through Edge Router)

### SSH Access
```bash
ssh combel  # Connects to 136.144.235.35 as kamindu-de
cd staging.hercules-merchandise.de
```

### WooCommerce API (in .env)
```
WC_CONSUMER_KEY=ck_da08a229d145309d60a8386fdcd0191d654f0ed8
WC_CONSUMER_SECRET=cs_68cfe9d610f3906a63981abc369f3d3f33ab5b9b
```

### Cloudflare (Gilles's Account - Primary)
```
CLOUDFLARE_API_TOKEN=ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp
CLOUDFLARE_ACCOUNT_ID=86dfa0e10ca766f79d5042548fc2776f
```

### Cloudflare (Kamindu's Account - Legacy)
```
CLOUDFLARE_API_TOKEN=ZYxzjRKLp5DR7MZTUIFxvTPvzN0nvSnNgEcYmqOQ
CLOUDFLARE_ACCOUNT_ID=d6d3df04acc98efe34f43e42636a3dfc
```

### Worker Webhook Secret
```
hercules-webhook-secret-2024
```

## Cloudflare Pages Deployment (Gilles's Account)
- **Project Name:** hercules-astro
- **URL:** https://hercules-astro.pages.dev
- **Account ID:** 86dfa0e10ca766f79d5042548fc2776f
- **Deploy Command:**
```bash
cd "/home/kamindu/Headerless Herculess site/astro-hercules"
npm run build && CLOUDFLARE_API_TOKEN="ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp" CLOUDFLARE_ACCOUNT_ID="86dfa0e10ca766f79d5042548fc2776f" npx wrangler pages deploy dist/ --project-name=hercules-astro --commit-dirty=true
```

## Edge Router Deployment (Gilles's Account)
```bash
cd "/home/kamindu/Headerless Herculess site/astro-hercules/workers/edge-router"
CLOUDFLARE_API_TOKEN="ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp" CLOUDFLARE_ACCOUNT_ID="86dfa0e10ca766f79d5042548fc2776f" npx wrangler deploy
```

## Dev Server
- **Command:** `npm run dev`
- **URL:** http://localhost:4321/
- Background task ID: ba17ef6

## Key Design Values (Extracted from WordPress Elementor)

### Colors
- Primary: #253461
- Accent/CTA: #10C99E
- Secondary Blue: #469ADC
- Top bar icons: #23C3FF
- Sustainable icon: #10A380

### Typography
- Font: Jost (Google Fonts)
- Nav links with dropdown: 15px, weight 500, color #00aeef, uppercase
- Nav direct links: 15px, weight 500, color #253461, uppercase
- Top bar: 14px, weight 500

### Layout
- Container max-width: 1280px
- No padding on containers (edge-to-edge within container)

## Components Created/Modified

### TopBar.astro
- Container: 1280px, no padding
- Icons: 23px, #23C3FF fill, 11px margin-right
- Font: 14px/500 Jost
- Gap: 50px between items (margin 0 25px)
- Google reviews image: 154px width

### Header.astro
- Container: 1280px, no padding
- Logo: 172px width
- Search bar: 708px width, 144px gap from logo
- Search input: border-radius 15px, border 1px solid #253461, padding .5rem 1rem
- Icons: right-aligned with margin-left: auto
- Icon buttons: 44x44px, border 1px solid #253461, border-radius 15px, 22px icons
- Nav links (dropdown): padding 14px 22px (44px gap), color #00aeef
- Nav direct links: padding 14px 25px (50px gap), color #253461

### Slider.astro
- Container: 1280px max-width (not full width)
- Slide contents: 1020px width
- Swiper.js with fade effect, autoplay 5s
- 3 slides with images downloaded to /images/slider/
- Button: #E9F5FF bg, #469ADC text, border-radius 100px (pill), padding 15px 40px
- Navigation arrows and pagination dots included

### Images Downloaded
- /public/images/slider/slide-1-teamwear.jpg
- /public/images/slider/slide-2-scarves.jpg
- /public/images/slider/slide-3-slides.jpg

## Slide Content
1. **Slide 1:** "Dein Team. Deine Farben. Dein Trikot." → /collections/personalisierte-sportbekleidung/
2. **Slide 2:** "HEBEN SIE SICH AB IN IHREN FARBEN MIT STOLZ." → /collections/personalisierte-fanschals/
3. **Slide 3:** "Umkleidekabinen-Komfort, Streetstyle-Stolz." → /product/personalisierte-badeschlappen/

## Current Status (Last Updated: 2026-01-04)

### Completed
- ✅ Homepage fully replicated from WordPress
- ✅ Product Sync Worker deployed and running
- ✅ WooCommerce webhooks configured for real-time sync
- ✅ Search functionality implemented with score-based ranking
- ✅ 115 products synced with conditional pricing data
- ✅ Sticky header with dropdown menus (hover-based)
- ✅ Main header mega-menu matching sticky header design
- ✅ Footer with newsletter, phone icon, payment icons, language switcher
- ✅ Product carousel with equal height cards
- ✅ **Image caching in KV** - No WordPress access for images at runtime
- ✅ **Category archive pages** - `/collections/[slug]` with 3-column product grid
- ✅ **Product badges** - "Made in Europe" and "Green Option" from custom meta fields
- ✅ **Thumbnail carousel** - Swiper.js with 4 visible thumbnails, gray background, click to swap
- ✅ **Card features list** - USP checkmarks synced from `usp_1` to `usp_4` meta fields
- ✅ **Category card styling** - Matches WordPress exactly (title, button, features)
- ✅ **Related Products Section** - "Andere Kunden mochten diese Produkte ebenfalls" with 5 random products
- ✅ **Trust Logos Section** - "Sie vertrauen uns" with dual-row carousel
- ✅ **Customer Reviews Section** - "Was Kunden über uns sagen" with TrustIndex widget
- ✅ **Weiterlesen Link** - Scrolls to read-more content section
- ✅ **Desktop Mega Menu Icons** - All categories have icons (Sportarten, Produkte, Themen)
- ✅ **Mobile Menu Sliding Submenus** - Submenus slide in from right with back button
- ✅ **Auto-Rebuild on Product Sync** - GitHub Actions workflow triggers on WooCommerce webhook
- ✅ **Session Management** - Cart count badge and user state via WordPress REST API
- ✅ **Contact Form Popup** - Matches WordPress popup form with Google Sheets sync
- ✅ **Mini-Cart Popup** - Cart icon dropdown showing items, subtotal, and action buttons
- ✅ **Blog Archive Page** - `/blogs/` with uniform #FAFAFA background
- ✅ **Quote Generator Fix** - Fixed cart items not showing on `/quote-generator/` page (Pearl plugin cart initialization)
- ✅ **Newsletter Subscription** - Footer newsletter form saves to Google Sheets "Newsletter" tab
- ✅ **Wishlist Functionality** - Heart button on product cards with YITH WooCommerce Wishlist integration
- ✅ **Blog Author** - All blog posts show `info@hercules-merchandise.de` as author
- ✅ **Homepage CTA Popups** - "Kostenloses Design anfordern" and "Kontaktieren Sie uns jetzt" buttons open contact form popup

### Next Steps
1. Create product detail pages (`/produkt/[slug]`)
2. Implement cart functionality (add to cart from Astro pages)
3. Add to cart with custom pricing (matching Pearl plugin)
4. Checkout integration

---

## Wishlist Functionality (IMPLEMENTED - 2026-01-03)

### Overview
Wishlist functionality integrated with YITH WooCommerce Wishlist plugin via custom REST API.

### Components

**1. WordPress API Endpoint:**
- File: `wp-content/mu-plugins/hercules-wishlist-api.php` (v1.0.7)
- Endpoints:
  - `GET /wp-json/hercules/v1/wishlist` - Get wishlist product IDs
  - `POST /wp-json/hercules/v1/wishlist/add` - Add product to wishlist
  - `POST /wp-json/hercules/v1/wishlist/remove` - Remove product from wishlist
  - `POST /wp-json/hercules/v1/wishlist/toggle` - Toggle product in/out of wishlist
- Restores cookies from `X-Edge-Cookies` header (Cloudflare APO bypass)
- Uses YITH_WCWL class for add/remove operations

**2. React Component:**
- File: `src/components/WishlistButton.tsx`
- Props: `productId` (required), `size` (default 20), `className`
- Features:
  - Heart icon (filled when in wishlist, outline when not)
  - Click to toggle wishlist state
  - Loading spinner during toggle
  - Global state sharing via custom events
  - 30-second localStorage cache

**3. Integration:**
- Added to `CategoryProductCard.astro` in top-right corner
- Positioned absolutely with `z-index: 15`
- Rendered with `client:idle` for optimal loading

### Testing
```bash
# Test wishlist GET
curl -s "https://staging.hercules-merchandise.de/wp-json/hercules/v1/wishlist"

# Test wishlist toggle
curl -s -X POST "https://staging.hercules-merchandise.de/wp-json/hercules/v1/wishlist/toggle" \
  -H "Content-Type: application/json" -d '{"product_id": 6721}'
```

### Important Notes
- Wishlist uses session cookies (like cart) - requires same domain via Edge Router
- For anonymous users, YITH stores wishlist in session/cookies
- The X-Edge-Cookies header bypass ensures cookies work through Cloudflare APO

---

## Contact Form Popup (IMPLEMENTED - 2025-12-30)

### Overview
Contact form popup matching the WordPress Elementor popup (ID: 5735) with Google Sheets sync.

### Form Fields
1. **Nach- und Vorname** - text, required, 50% width
2. **Email** - email, required, 50% width
3. **Telefonnummer** - tel, optional, 100% width
4. **Nachricht** - textarea, optional, 4 rows
5. **Datei hochladen** - file upload, multiple files, max 10MB

### Components Created

**1. React Component:**
- File: `src/components/ContactFormPopup.tsx`
- Props: `triggerType` ("button" | "icon" | "link"), `triggerText`, `triggerClassName`
- Features:
  - Animated popup overlay with close on ESC/click outside
  - Form validation (name & email required)
  - File upload with size validation (10MB max)
  - Loading state with spinner
  - Success state with submitted details
  - Body scroll lock when open

**2. Cloudflare Pages Function:**
- File: `functions/api/contact.ts`
- Endpoint: `POST /api/contact`
- Features:
  - Google Sheets API integration with JWT auth
  - Auto-creates "Kontaktanfragen" sheet with headers
  - Stores: date, time, name, email, phone, message, files, page, URL, timestamp
  - Works without Google Sheets configured (for testing)

### Integration Points
1. **Desktop Header:** KONTAKT button opens popup
2. **Mobile Header:** Email icon button opens popup
3. **Footer:** Kontakt button in reseller section opens popup

### Google Sheets Setup
Environment variables needed (set in Cloudflare Pages):
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

### Sheet Structure
Sheet name: "Kontaktanfragen"
Columns: Datum | Uhrzeit | Name | Email | Telefon | Nachricht | Dateien | Seite | URL | Zeitstempel

### Success Message
- "Danke, dass Sie uns kontaktiert haben!"
- "Ihre Anfrage war erfolgreich. Einer unserer Mitarbeitenden wird sich so bald wie möglich bei Ihnen melden."

---

## Mini-Cart Popup (IMPLEMENTED - 2025-12-31)

### Overview
Cart icon in header now opens a dropdown popup showing cart contents, matching WordPress behavior.

### Features
- Click cart icon to toggle dropdown (instead of navigating to cart page)
- Shows "Ihr Warenkorb ist leer." when cart is empty
- When cart has items:
  - Cart items list with thumbnails, product names, quantities, prices
  - Subtotal row showing total amount
  - Two action buttons: "Warenkorb" and "Zur Kasse"
- Click outside to close dropdown
- Hover effects on buttons matching WordPress design

### Component Updated
- **File:** `src/components/UserSession.tsx`
- **Changes:**
  - Added `showCartDropdown` state and `dropdownRef` for click-outside handling
  - Changed cart icon from `<a>` link to `<button>` with click handler
  - Added dropdown JSX with items list, subtotal, and action buttons
  - Added `line_total` to CartItem interface

### Styling (Matching WordPress)
- Dropdown: white background, `box-shadow: 0 4px 12px rgba(0,0,0,0.15)`, `border-radius: 8px`
- Buttons: pill shape (`border-radius: 83px`)
- "Warenkorb" button: `#469ADC` outline, transparent background
- "Zur Kasse" button: `#10C99E` solid background, white text
- Hover effects: colors swap on hover

### Session API Updates (v1.3.0)
Updated WordPress mu-plugin at `wp-content/mu-plugins/hercules-session-api.php`:
- Added no-cache headers to prevent Cloudflare caching
- Added `subtotal` field to cart response
- Added `line_total` to cart items
- Added debug info for troubleshooting:
  - `wc_session_cookie_found` - Whether WooCommerce session cookie was received
  - `cookies_received` - List of cookie names received
  - `wc_customer_id` - WooCommerce customer/session ID
  - `wc_session_has_session` - Whether WooCommerce found an active session
  - `cart_contents_count_raw` - Raw cart item count

### Cart Data Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                        CART DATA SYNC                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User adds item to cart (on WordPress product page)              │
│                    ↓                                                │
│  2. WooCommerce stores cart in PHP session + cookies                │
│     Cookie: wp_woocommerce_session_<hash>                           │
│                    ↓                                                │
│  3. User visits Astro page (same domain via Edge Router)            │
│                    ↓                                                │
│  4. UserSession.tsx fetches: /wp-json/hercules/v1/session           │
│     with credentials: 'include' (sends cookies)                     │
│                    ↓                                                │
│  5. WordPress REST API reads WooCommerce cart from session          │
│                    ↓                                                │
│  6. Returns: { cart: { count, items[], subtotal, total } }          │
│                    ↓                                                │
│  7. Component displays cart dropdown with items                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Important: Same Domain Requirement
Cart data sync **ONLY works when Astro and WordPress are on the same domain** (via Edge Router):

| Access Method | Cart Sync Works? |
|--------------|------------------|
| `staging.hercules-merchandise.de` (via Edge Router) | ✅ Yes |
| `hercules-astro.pages.dev` (direct) | ❌ No - Cross-origin cookies blocked |

### Testing Cart Sync
1. Add item to cart: `https://staging.hercules-merchandise.de/produkt/personalisierter-fussballschal/`
2. Go to homepage: `https://staging.hercules-merchandise.de/`
3. Click cart icon - should show items in dropdown

### Debug in Browser Console
```javascript
// Check session API response
fetch('/wp-json/hercules/v1/session', {credentials: 'include'})
  .then(r => r.json())
  .then(d => console.log(d))
```

Look for `debug` object in response to troubleshoot cookie/session issues.

---

## Session Management (IMPLEMENTED - Updated 2026-01-03)

### Overview
Real-time cart count and user login state displayed on Astro pages via WordPress REST API.
**Critical:** Uses X-Edge-Cookies header to bypass Cloudflare APO cookie stripping.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SESSION DATA FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Browser sends request with WooCommerce cookies                  │
│                    ↓                                                │
│  2. Edge Router receives cookies, copies to X-Edge-Cookies header   │
│                    ↓                                                │
│  3. Cloudflare APO strips Cookie header but keeps X-Edge-Cookies    │
│                    ↓                                                │
│  4. WordPress mu-plugin restores cookies from X-Edge-Cookies        │
│                    ↓                                                │
│  5. WooCommerce loads session → returns cart data                   │
│                    ↓                                                │
│  6. UserSession.tsx displays cart count and login state             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Components

**1. WordPress API Endpoint:**
- File: `wp-content/mu-plugins/hercules-session-api.php` (v1.7.0)
- Endpoint: `GET /wp-json/hercules/v1/session`
- Returns: `logged_in`, `user` (name, email, avatar), `cart` (count, total, items, subtotal)
- **Key Feature:** Restores cookies from `X-Edge-Cookies` header at `muplugins_loaded` hook
- Initializes `WC()->customer` before cart calculations to avoid shipping errors
- CORS configured for Edge Router, Pages, and localhost

**2. Edge Router:**
- File: `workers/edge-router/src/index.ts`
- **Key Feature:** Copies all cookies to `X-Edge-Cookies` header for WordPress requests
- This bypasses Cloudflare APO which strips standard Cookie headers

**3. React Island Component:**
- File: `src/components/UserSession.tsx`
- Props: `type="cart"` | `type="account"` | `type="cart-count"`
- Features:
  - 30-second localStorage cache
  - Auto-refresh on tab visibility change
  - Custom event listener for cart updates (`hercules:cart-updated`)
  - Mini-cart dropdown with items, subtotal, action buttons

**4. Header Integration:**
- Cart icon shows count badge when items in cart
- Cart icon click opens mini-cart dropdown (not navigation)
- Account icon shows user avatar when logged in
- Green dot indicator for logged-in state

### Testing
```bash
# Add item to cart first
curl -c /tmp/cart.txt "https://staging.hercules-merchandise.de/?wc-ajax=add_to_cart" -X POST -d "product_id=11088&quantity=1"

# Test session API with cookies (through Edge Router)
curl -b /tmp/cart.txt "https://staging.hercules-merchandise.de/wp-json/hercules/v1/session"
# Should return cart with count > 0

# Test without cookies (should return empty cart)
curl "https://staging.hercules-merchandise.de/wp-json/hercules/v1/session"
```

### Files
- `src/components/Header.astro` - UserSession component integration
- `src/components/UserSession.tsx` - React component with mini-cart
- `workers/edge-router/src/index.ts` - X-Edge-Cookies header logic
- `wp-content/mu-plugins/hercules-session-api.php` - Session API v1.7.0

### Important Notes
- **MalCare WAF must be disabled** - It blocks session API requests
- Session sharing ONLY works via Edge Router (same domain required for cookies)
- Direct access to `hercules-astro.pages.dev` will NOT have session data

---

## Auto-Rebuild on Product Sync (IMPLEMENTED)

### How It Works
When products or categories are updated in WooCommerce:
1. WooCommerce webhook fires to the Product Sync Worker
2. Worker syncs product data to KV storage
3. Worker triggers GitHub Actions workflow via workflow_dispatch API
4. GitHub Actions builds Astro site and deploys to Cloudflare Pages
5. Site is rebuilt with latest product data (~1-2 minutes)

### Debouncing
- 5-minute debounce prevents excessive rebuilds
- Multiple product updates within 5 minutes only trigger one rebuild
- Scheduled sync (3 AM UTC) clears debounce and always rebuilds

### Components
```
WooCommerce → Webhook → Product Sync Worker → GitHub Actions → Cloudflare Pages
                              ↓
                        KV Storage (products/categories)
```

### GitHub Repository
- **URL:** https://github.com/kamindu01/hercules-astro
- **Workflow:** `.github/workflows/deploy.yml`
- **Triggers:** Push to main, workflow_dispatch (API)

### Worker Secrets
- `GITHUB_TOKEN` - GitHub Personal Access Token with `workflow` scope

### Manual Trigger
```bash
# Via GitHub CLI
gh workflow run deploy.yml --ref main -f reason="Manual trigger"

# Via GitHub API
curl -X POST "https://api.github.com/repos/kamindu01/hercules-astro/actions/workflows/deploy.yml/dispatches" \
  -H "Authorization: Bearer <GITHUB_TOKEN>" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"ref":"main","inputs":{"reason":"Manual trigger"}}'
```

---

## PLANNED FEATURES (TODO for Next Session)

### 1. Product Detail Pages (`/produkt/[slug]`)

**Priority:** Next implementation step

**Requirements:**
- Fetch product data from Worker API
- Display product images with gallery
- Show pricing (conditional prices from variations)
- Attribute selectors (size, color, etc.)
- Add to cart functionality
- Related products section

---

### 3. Edge Router Worker (Hybrid Routing)

**Purpose:** Route traffic between Astro (static pages) and WordPress (dynamic pages like checkout) on the same domain.

**Architecture:**
```
hercules-merchandise.de
         │
         ▼
   Cloudflare DNS (proxied)
         │
         ▼
   Edge Router Worker
         │
    ┌────┴────┐
    ▼         ▼
  Astro    WordPress
(static)  (dynamic)
```

**Routing Rules:**
| Path | Destination |
|------|-------------|
| `/`, `/collections/*`, `/produkt/*` | Astro (herculesde.pages.dev) |
| `/cart`, `/checkout/*`, `/my-account/*` | WordPress |
| `/wp-admin/*`, `/wp-json/*` | WordPress |
| `/wp-content/uploads/*` | WordPress (media) |

**Implementation:**
```typescript
// workers/edge-router/src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // WordPress paths
    const wordpressPaths = ['/cart', '/checkout', '/my-account', '/wp-admin', '/wp-json', '/wc-api'];
    const isWordPress = wordpressPaths.some(wp => path.startsWith(wp));

    const origin = isWordPress ? env.WORDPRESS_ORIGIN : env.ASTRO_ORIGIN;
    const targetUrl = new URL(path + url.search, origin);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Rewrite redirects to keep same domain
    // ... (see full implementation in conversation)

    return response;
  },
};
```

**Wrangler Config:**
```toml
name = "hercules-edge-router"
routes = [
  { pattern = "hercules-merchandise.de/*", zone_name = "hercules-merchandise.de" }
]

[vars]
ASTRO_ORIGIN = "https://herculesde.pages.dev"
WORDPRESS_ORIGIN = "https://your-wordpress-server.com"
```

**WordPress Config (wp-config.php):**
```php
define('WP_HOME', 'https://hercules-merchandise.de');
define('WP_SITEURL', 'https://hercules-merchandise.de');
define('COOKIE_DOMAIN', '.hercules-merchandise.de');
```

---

### 4. Session Management (WordPress ↔ Astro)

**Purpose:** Show logged-in user info and cart count on Astro pages.

**Approach:** Client-side API check with caching (most stable)

**Step 1: WordPress Endpoint**
Create `wp-content/mu-plugins/hercules-session-api.php`:
```php
<?php
add_action('rest_api_init', function() {
    register_rest_route('hercules/v1', '/session', [
        'methods' => 'GET',
        'callback' => 'hercules_get_session',
        'permission_callback' => '__return_true',
    ]);
});

function hercules_get_session() {
    $response = [
        'logged_in' => is_user_logged_in(),
        'user' => null,
        'cart' => ['count' => 0, 'total' => '€0,00'],
    ];

    if (is_user_logged_in()) {
        $user = wp_get_current_user();
        $response['user'] = [
            'id' => $user->ID,
            'name' => $user->display_name,
            'avatar' => get_avatar_url($user->ID, ['size' => 48]),
        ];
    }

    if (function_exists('WC') && WC()->cart) {
        $response['cart'] = [
            'count' => WC()->cart->get_cart_contents_count(),
            'total' => strip_tags(WC()->cart->get_cart_total()),
        ];
    }

    return rest_ensure_response($response);
}
```

**Step 2: React Island Component**
Create `src/components/UserSession.tsx`:
- Fetches `/wp-json/hercules/v1/session` with `credentials: 'include'`
- Caches in localStorage for 30 seconds
- Shows loading skeleton → user info or login link
- Displays cart count badge
- Refreshes on tab visibility change

**Step 3: Add to Header**
```astro
<UserSession client:load />
```

**Why This Approach:**
- Uses native WooCommerce sessions (no custom auth)
- Cart always accurate (real-time from WC)
- Works with all WC plugins
- Easy to debug (just check `/wp-json/hercules/v1/session`)

---

### Implementation Priority

1. **Product Detail Pages** - Required to view products and add to cart
2. **Edge Router** - Required for same-domain cart/checkout
3. **Session Management** - Shows user login state on Astro pages

### Files to Create

```
workers/
├── product-sync/          # Existing
└── edge-router/           # NEW
    ├── src/index.ts
    ├── wrangler.toml
    └── package.json

src/components/
├── UserSession.tsx        # NEW - React island for session

WordPress mu-plugins/
└── hercules-session-api.php  # NEW - Session API endpoint
```

## Session History

### Session 2026-01-04 (Product Configurator Quantity Step Fix)
**Task:** Fix quantity step not showing in Astro product configurator and match WordPress styling

**Changes Made:**

1. **Quantity Step Visibility Fixed** (`src/components/ProductConfigurator.tsx`):
   - Changed condition from `{matchedVariation && (` to `{(matchedVariation || config.variations?.length > 0) && (`
   - Added fallback pricing data: `matchedVariation?.conditional_prices || config.variations?.[0]?.conditional_prices || []`
   - Quantity step now shows even before all attributes are selected
   - Uses first variation's pricing as fallback when no specific variation is matched

2. **Quantity Range Calculation Updated:**
   ```tsx
   const prices = matchedVariation?.conditional_prices || config?.variations?.[0]?.conditional_prices;
   ```

3. **Product Page Layout Fixes** (`src/pages/produkte/[slug].astro`):
   - Product title moved inside gallery box with border-bottom separator
   - Created `main-image-container` for proper badge positioning
   - Removed wishlist button from product page
   - Removed background from main image container

4. **Steps CSS** (`src/styles/steps.css`):
   - Pearl WC Steps styling matching WordPress
   - Step indicator: Jost 15px weight 500, uppercase
   - Collapsed steps with green background (#E0F9F3) when selected
   - Radio options with custom checkbox styling (blue border, rounded corners)
   - Quantity controls with round buttons and range slider
   - Action buttons with pill shape (border-radius: 83px)

**Product Configurator Structure:**
- Step 1: Format auswählen (attribute selector)
- Step 2: Farben auswählen (attribute selector)
- Step 3: Wählen Sie Ihre Menge (quantity with pricing tiers)
- Summary: Ihr Angebot (shows after quantity selected)

**Files Modified:**
- `src/components/ProductConfigurator.tsx` - Quantity step condition fix
- `src/pages/produkte/[slug].astro` - Layout fixes
- `src/styles/steps.css` - Configurator styling

**Deployed:**
- Preview: https://52599794.hercules-astro.pages.dev
- Production: https://hercules-astro.pages.dev

**Git Commit:** `3d3968c` - Add product detail pages with configurator, wishlist, and newsletter

---

### Session 2026-01-04 (Product Detail Page Thumbnail Gallery)
**Task:** Match Astro product page thumbnail gallery styling to WordPress exactly

**Changes Made:**

1. **Thumbnail Gallery CSS Updated** (`src/pages/produkte/[slug].astro`):
   - Width: `18.5%` (using `calc(18.5% - 8px)` for gap compensation)
   - Layout: `float: left` with flexbox wrapper for gap support
   - Padding: `5px`
   - Background: `#e6e6e6` (light gray)
   - Border-radius: `15px` on container, `10px` on images
   - Image size: `94px × 94px` with `object-fit: cover`
   - Gap: `10px` column and row (flexbox gap)
   - Active state: `2px solid #469ADC` border on `.thumbnail-item.active`

2. **HTML Structure Simplified:**
   - Removed button wrapper around thumbnail images
   - Structure: `<li class="thumbnail-item"><img ... /></li>`
   - Active class now on `li` element (matching WordPress `.kd-active`)

3. **JavaScript Updated:**
   - Updated selectors from `.thumbnail` to `.thumbnail-item`
   - Click handlers work with new `li > img` structure
   - Lightbox integration updated for new structure

4. **Mobile Responsive:**
   - `@media (max-width: 768px)`: width `22.5%`, image `width: 100%`

**WordPress Reference CSS:**
```css
.thumbnail-item {
  width: 18.5% !important;
  float: left;
  margin: 0;
  list-style: none;
  padding: 5px;
  background: #e6e6e6;
  border-radius: 15px;
}
/* Image: 94px x 94px, 10px gap */
```

**Files Modified:**
- `src/pages/produkte/[slug].astro` - Thumbnail gallery CSS, HTML, and JavaScript

**Deployed:**
- Preview: https://440f723f.hercules-astro.pages.dev
- Production: https://hercules-astro.pages.dev

---

### Session 2026-01-04 (Blog Author & Homepage CTA Popups)
**Changes:**

1. **Blog Author Updated:**
   - File: `src/pages/blogs/[slug].astro`
   - Changed author display from dynamic WordPress author to static `info@hercules-merchandise.de`
   - Removed author avatar image display

2. **Homepage CTA Buttons → Contact Form Popup:**
   - **DesignService.astro:** "Kostenloses Design anfordern" button now opens ContactFormPopup
   - **HerculesMerchandise.astro:** "Kontaktieren Sie uns jetzt" button now opens ContactFormPopup
   - Used wrapper div pattern (`.cta-wrapper`) to override React component default styles
   - Button styling: green (#10C99E), pill shape, 15px 50px padding, Jost 15px 500 uppercase

**Files Modified:**
- `src/pages/blogs/[slug].astro` - Author display
- `src/components/DesignService.astro` - ContactFormPopup integration
- `src/components/HerculesMerchandise.astro` - ContactFormPopup integration

**Contact Form Popup Locations (all 5):**
1. Header "KONTAKT" button
2. Mobile header email icon
3. "Kostenloses Design anfordern" (Design Service section)
4. "Kontaktieren Sie uns jetzt" (Hercules Merchandise section)
5. Footer "Kontakt" button

---

### Session 2026-01-03 (Session/Cart Sharing Fix - APO Cookie Bypass)
**Critical Fix: Session cookies were being stripped by Cloudflare APO**

**Problem:**
- Session cookies (especially `wp_woocommerce_session_*`) were being stripped by Cloudflare APO when Edge Router made subrequests to WordPress
- This caused cart count and login state to not sync between Astro and WordPress pages
- Green dot indicator and cart badge were not showing

**Root Causes Identified:**
1. **MalCare WAF** was blocking requests to `/wp-json/hercules/v1/session`
2. **Cloudflare APO** strips WooCommerce session cookies from Worker subrequests
3. **WooCommerce customer object** was null, causing PHP fatal error in `calculate_totals()`

**Fixes Applied:**

1. **MalCare WAF Disabled:**
   ```bash
   # On server (ssh combel)
   mv /var/www/vhosts/hercules-merchandise.de/httpdocs/malcare-waf.php /var/www/vhosts/hercules-merchandise.de/httpdocs/malcare-waf.php.disabled
   mv staging.hercules-merchandise.de/malcare-waf.php staging.hercules-merchandise.de/malcare-waf.php.disabled
   mv staging.hercules-merchandise.de/bv_connector_*.php staging.hercules-merchandise.de/bv_connector_*.php.disabled
   ```

2. **Edge Router - X-Edge-Cookies Header** (`workers/edge-router/src/index.ts`):
   ```typescript
   // APO strips cookies - send them via custom header as backup
   const originalCookies = request.headers.get('Cookie') || '';
   if (originalCookies && isWordPress) {
     headers.set('X-Edge-Cookies', originalCookies);
   }
   ```
   - Custom headers are NOT stripped by APO
   - Edge Router Version: `69493364-119c-4226-b82f-772a127bfb31`

3. **WordPress mu-plugin Updated** (`hercules-session-api.php` v1.7.0):
   ```php
   // Restore cookies from X-Edge-Cookies header at earliest hook
   function hercules_restore_edge_cookies() {
       $edge_cookies = isset($_SERVER['HTTP_X_EDGE_COOKIES']) ? $_SERVER['HTTP_X_EDGE_COOKIES'] : '';
       if (empty($edge_cookies)) return;

       $cookie_pairs = explode('; ', $edge_cookies);
       foreach ($cookie_pairs as $pair) {
           $parts = explode('=', $pair, 2);
           if (count($parts) === 2) {
               $name = trim($parts[0]);
               $value = trim($parts[1]);
               if (!isset($_COOKIE[$name])) {
                   $_COOKIE[$name] = urldecode($value);
               }
           }
       }
   }
   add_action('muplugins_loaded', 'hercules_restore_edge_cookies', 0);

   // Initialize WC customer before cart operations
   if (!WC()->customer) {
       WC()->customer = new WC_Customer(get_current_user_id(), true);
   }
   ```

**How the Cookie Bypass Works:**
```
┌─────────────────────────────────────────────────────────────────────┐
│                    COOKIE BYPASS FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Browser sends request with cookies to Edge Router               │
│     Cookie: wp_woocommerce_session_xxx=...; other_cookies=...       │
│                    ↓                                                │
│  2. Edge Router copies cookies to X-Edge-Cookies header             │
│     X-Edge-Cookies: wp_woocommerce_session_xxx=...; other_cookies   │
│                    ↓                                                │
│  3. Cloudflare APO processes subrequest                             │
│     - STRIPS: Cookie header (standard cookies)                      │
│     - KEEPS: X-Edge-Cookies header (custom header)                  │
│                    ↓                                                │
│  4. WordPress mu-plugin restores cookies from X-Edge-Cookies        │
│     $_COOKIE['wp_woocommerce_session_xxx'] = decoded_value          │
│                    ↓                                                │
│  5. WooCommerce loads session and cart correctly                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Files Modified:**
- `workers/edge-router/src/index.ts` - Added X-Edge-Cookies header
- `workers/edge-router/wrangler.toml` - Simplified config (removed WORDPRESS_HOST)
- `wp-content/mu-plugins/hercules-session-api.php` - v1.7.0 with cookie restore and customer init

**Verification Test:**
```bash
# Add item to cart
curl -c /tmp/cart.txt "https://staging.hercules-merchandise.de/?wc-ajax=add_to_cart" -X POST -d "product_id=11088&quantity=1"

# Test session API with cookie (through Edge Router)
curl -b /tmp/cart.txt "https://staging.hercules-merchandise.de/wp-json/hercules/v1/session"
# Should return: {"cart":{"count":1,"items":[...]}}
```

**Important Notes:**
- MalCare WAF files disabled (not deleted) - can be re-enabled if needed
- `wp-config.php` has `@include` for malcare-waf.php from httpdocs - the file is now renamed so it doesn't load
- Debug mode was temporarily enabled to diagnose errors, then disabled

---

### Session 2025-12-31 (Mini-Cart Popup & Cart Sync)
**Mini-Cart Popup Implementation:**

1. **Mini-Cart Dropdown Popup:**
   - Updated `UserSession.tsx` to show cart dropdown on click (instead of navigating)
   - Shows cart items with thumbnails, names, quantities, prices
   - Shows subtotal row
   - Two action buttons: "Warenkorb" (view cart) and "Zur Kasse" (checkout)
   - Click outside to close
   - Styling matches WordPress cart dropdown

2. **Blog Archive Page Styling:**
   - Updated `/src/pages/blogs/index.astro`
   - Changed all sections to uniform `#FAFAFA` background:
     - `.breadcrumb-section`
     - `.blog-header`
     - `.blog-posts`

3. **WordPress Session API Updates (v1.3.0):**
   - Updated `wp-content/mu-plugins/hercules-session-api.php`
   - Added no-cache headers to prevent Cloudflare caching:
     - `Cache-Control: no-store, no-cache, must-revalidate, max-age=0, private`
     - `Surrogate-Control: no-store`
     - `CDN-Cache-Control: no-store`
   - Added `subtotal` field to cart response
   - Added `line_total` to cart items
   - Added debug info for troubleshooting cookie/session issues

4. **Deployment Updates:**
   - All deployments now to Gilles's Cloudflare account
   - Astro Site: `https://hercules-astro.pages.dev`
   - Edge Router: `https://hercules-edge-router.gilles-86d.workers.dev`
   - Product Sync Worker: `https://hercules-product-sync.gilles-86d.workers.dev`

5. **Edge Router Configuration:**
   - `staging.hercules-merchandise.de` now routes through Edge Router
   - Astro pages served for: `/`, `/collections/*`, `/blogs/*`
   - WordPress pages served for: `/produkt/*`, `/cart/`, `/checkout/`, etc.

6. **Cart Sync Requirements Documented:**
   - Cart data sync ONLY works on same domain (via Edge Router)
   - Cross-origin cookie restrictions prevent sync on direct Pages URL
   - User must access via `staging.hercules-merchandise.de` for cart to work

7. **Files Modified:**
   - `src/components/UserSession.tsx` - Mini-cart popup implementation
   - `src/pages/blogs/index.astro` - Background color fix
   - `wp-content/mu-plugins/hercules-session-api.php` - Session API updates

8. **Deployed:**
   - Astro: https://hercules-astro.pages.dev
   - Edge Router Version: `9174f93e-0d49-4620-9329-60a90a0433b0`

9. **Known Issue - Cart Session Not Loading:**
   - WooCommerce session cookie may not be received by REST API
   - Debug info added to API response for troubleshooting
   - Investigating cookie handling in Edge Router

---

### Session 2025-12-31 (Quote Generator Fix)
**Issue:** Quote generator page (`/quote-generator/`) showed "Ihr Warenkorb ist leer" even when cart had items. The `/cart/` page showed items correctly.

**Root Cause Analysis:**
1. Edge Router was correctly routing `/quote-generator/` to WordPress
2. WooCommerce session cookies were being set and sent correctly
3. WC Store API (`/wp-json/wc/store/cart`) returned correct cart items
4. BUT: The Pearl WC Steps plugin's quote shortcode (`[pearl_quote_request]`) was not initializing the WooCommerce cart session before reading cart items

**Fixes Applied:**

1. **Edge Router - Added `/quote-generator` to NO_CACHE_PATHS:**
   - File: `workers/edge-router/src/index.ts`
   - Added `/quote-generator` and `/angebot-anfragen` to `NO_CACHE_PATHS` array
   - Ensures response has `Cache-Control: no-store, no-cache, must-revalidate, private`
   - Prevents Cloudflare from caching session-dependent pages
   - Deployed Version: `ad781db3-13fc-4415-8bf4-11627face87f`

2. **Pearl Plugin - Added Cart Session Initialization:**
   - File: `wp-content/plugins/pearl-wc-steps-variation-fr/includes/quote-shortcode.php`
   - Added code after `ob_start()` in `render_quote_request()` function:
   ```php
   // Ensure WooCommerce cart is properly initialized from session
   if ( function_exists( 'WC' ) && WC()->session ) {
       // Start session if not already active
       if ( ! WC()->session->has_session() ) {
           WC()->session->set_customer_session_cookie( true );
       }
       // Initialize cart if not done
       if ( is_null( WC()->cart ) ) {
           wc_load_cart();
       }
       // Force cart to reload from session
       if ( WC()->cart && WC()->cart->is_empty() ) {
           WC()->cart->get_cart_from_session();
       }
   }
   ```
   - Backup created: `quote-shortcode.php.bak-20251231`

3. **Cleared WP Rocket Cache:**
   - Removed cached files for `/quote-generator/` from:
     - `wp-content/cache/wp-rocket/staging.hercules-merchandise.de/quote-generator/`
     - `wp-content/cache/supercache/staging.hercules-merchandise.de/quote-generator/`

**Why Cart Page Worked But Quote Generator Didn't:**
- `/cart/` page uses WooCommerce's built-in `woocommerce_cart_contents` hook which runs AFTER WooCommerce initializes the cart
- `/quote-generator/` uses a custom shortcode that runs during page render, potentially BEFORE WooCommerce initializes the cart from session
- The fix ensures cart is explicitly initialized from session before the shortcode tries to read cart items

**Verification:**
```bash
# Test flow
curl -c cookies.txt "https://staging.hercules-merchandise.de/?wc-ajax=add_to_cart" -X POST -d "product_id=11088&quantity=1"
curl -b cookies.txt "https://staging.hercules-merchandise.de/quote-generator/" | grep "pearl-cart-item-name"
# ✓ Now shows cart items
```

**Files Modified:**
- `workers/edge-router/src/index.ts` - Added cache bypass for quote pages
- `wp-content/plugins/pearl-wc-steps-variation-fr/includes/quote-shortcode.php` - Added cart initialization

---

### Session 2025-12-28 (Edge Router Verification)
**Edge Router Status Check:**

1. **Edge Router Worker Deployed:**
   - **URL:** https://hercules-edge-router.kamindudushmantha.workers.dev
   - **Location:** `workers/edge-router/src/index.ts`
   - **Status:** ✅ Working correctly

2. **Routing Logic:**
   - **Astro routes** (`/`, `/collections/*`, `/produkt/*`, etc.) → `herculesde.pages.dev`
   - **WordPress routes** (`/cart`, `/checkout`, `/wp-admin/*`, `/wp-json/*`, etc.) → `staging.hercules-merchandise.de`
   - URL rewriting enabled for HTML, JSON, CSS, JS content
   - Redirect handling to keep users on same domain

3. **Tested Routes:**
   - `GET /` → Returns Astro homepage ✓
   - `GET /collections/personalisierte-fanschals/` → Returns Astro category page ✓
   - `GET /wp-admin/` → Redirects to WordPress login ✓

4. **Worker Configuration (`wrangler.toml`):**
   ```toml
   name = "hercules-edge-router"
   ASTRO_ORIGIN = "https://herculesde.pages.dev"
   WORDPRESS_ORIGIN = "https://staging.hercules-merchandise.de"
   ```

5. **Next Steps (For Production):**
   - Configure DNS for `hercules-merchandise.de` to point to Cloudflare
   - Add route pattern: `hercules-merchandise.de/*`
   - Update WordPress `WP_HOME` and `WP_SITEURL` to production domain
   - Set `COOKIE_DOMAIN` to `.hercules-merchandise.de` for session sharing

---

### Session 2025-12-27 (Auto-Rebuild Implementation)
**Auto-Rebuild on Product Sync:**

1. **GitHub Repository Setup:**
   - Initialized git repository in `/home/kamindu/Headerless Herculess site/astro-hercules`
   - Created GitHub repo: https://github.com/kamindu01/hercules-astro (private)
   - Pushed all 194 files to GitHub

2. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Triggers: push to main, workflow_dispatch (API)
   - Steps: checkout → setup Node.js 20 → npm ci → npm run build → wrangler pages deploy
   - Deploy target: herculesde Pages project

3. **Worker Updates** (`workers/product-sync/src/index.ts`):
   - Added `GITHUB_TOKEN` to Env interface
   - Added `GITHUB_REPO` and `GITHUB_WORKFLOW` constants
   - Created `triggerSiteRebuild()` function using GitHub workflow_dispatch API
   - 5-minute debounce stored in KV (`last_rebuild` key)
   - Added rebuild trigger to all webhook handlers:
     - `/webhook/product-create`
     - `/webhook/product-update`
     - `/webhook/product-delete`
     - `/webhook/category-create`
     - `/webhook/category-update`
     - `/webhook/category-delete`
   - Scheduled sync (3 AM UTC) clears debounce and always rebuilds
   - Added debug endpoints:
     - `GET /status` - Shows last_sync, last_rebuild, github_token_configured
     - `POST /trigger-rebuild` - Manual rebuild trigger (clears debounce first)

4. **Secrets Configured:**
   - **GitHub repo secrets:** CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, WC_CONSUMER_KEY, WC_CONSUMER_SECRET
   - **Worker secrets:** GITHUB_TOKEN (from `gh auth token`)

5. **Worker Version:** `fa3654f5-bec5-4c28-af9a-8b1b155040d2`

6. **Test Results:**
   - Push to main triggers GitHub Actions build ✓
   - Manual `gh workflow run` works ✓
   - Direct GitHub API call with token works (HTTP 204) ✓
   - GitHub Actions successfully deploys to Cloudflare Pages (~50-60s) ✓
   - Webhook signature verification works ✓
   - **KV daily write limit hit** - rebuild debounce write failing (resets tomorrow)

7. **Known Issue:**
   - Cloudflare KV free tier has daily write limits (1,000 writes)
   - Heavy testing exhausted today's quota
   - Error: `KV put() limit exceeded for the day`
   - **Will work tomorrow** when limit resets at midnight UTC

8. **Verification Commands:**
   ```bash
   # Check worker status (shows debounce state and token config)
   curl -s "https://hercules-product-sync.kamindudushmantha.workers.dev/status"

   # Manual rebuild trigger (clears debounce)
   curl -s -X POST "https://hercules-product-sync.kamindudushmantha.workers.dev/trigger-rebuild" \
     -H "Authorization: Bearer hercules-webhook-secret-2024"

   # Simulate WooCommerce webhook
   PAYLOAD='{"id": 6721}'
   SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "hercules-webhook-secret-2024" -binary | base64)
   curl -X POST "https://hercules-product-sync.kamindudushmantha.workers.dev/webhook/product-update" \
     -H "X-WC-Webhook-Signature: $SIGNATURE" \
     -d "$PAYLOAD"

   # Check GitHub Actions runs
   gh run list --limit 5
   ```

---

### Session 2025-12-27 (Earlier)
**Category Page Sections, Menu Icons & Mobile Menu Overhaul:**

1. **Related Products Section ("Andere Kunden mochten diese Produkte ebenfalls"):**
   - Added below read-more-desc section on collection pages
   - Shows 5 random products NOT in current category
   - Heading: "ANDERE KUNDEN MOCHTEN DIESE PRODUKTE EBENFALLS" (uppercase, highlight in #469ADC)
   - Grid layout: 5 columns desktop, 4 tablet, 1 mobile
   - Card styling: border 1px solid #DCDCDC, border-radius 20px, padding 40px 15px
   - Image border-radius: 10px, title: Jost 18px weight 500 uppercase

2. **Trust Logos Section ("Sie vertrauen uns"):**
   - Added TrustLogos component to collection pages
   - Dual-row continuous Swiper carousel (49 partner logos)
   - Row 1: Left-to-right, Row 2: Right-to-left

3. **Customer Reviews Section ("Was Kunden über uns sagen"):**
   - Added CustomerReviews component to collection pages
   - TrustIndex widget for Google Reviews

4. **"Weiterlesen" Link:**
   - Added below category description
   - Only shows if `second_description` exists
   - Links to `#read-more-desc` section
   - Styled: Jost 16px, #469ADC, hover underline

5. **Desktop Mega Menu Icons:**
   - Added icons to Produkte menu (13 items with icons)
   - Added icons to Themen menu (12 items with icons)
   - Sportarten already had icons (11 items)
   - Icons: 17x17px, margin-right: 4.25px

6. **Mobile Menu Sliding Submenus:**
   - Complete rewrite of MobileMenu.astro
   - Main panel shows categories with right arrow
   - Tap category → submenu slides in from right
   - "Zurück" back button to return to main menu
   - All submenu items have icons (24x24px)
   - Smooth CSS transitions (0.3s)

7. **Files Modified:**
   - `src/pages/collections/[slug].astro` - Added all sections + Weiterlesen link
   - `src/components/Header.astro` - Added icons to Produkte/Themen menus
   - `src/components/MobileMenu.astro` - Complete rewrite with sliding submenus

8. **Deployed:**
   - Astro Site: https://d4595ec6.herculesde.pages.dev
   - Production: https://herculesde.pages.dev
   - 40 pages built

---

### Session 2025-12-27 (Earlier)
**Related Products Section & Gallery Image Sync Fixes:**

1. **Gallery Image Sync Fixes:**
   - Fixed subrequest limit issues causing sync to fail at 3 AM cron
   - Reduced BATCH_SIZE from 5 to 2 products per sync
   - Reduced MAX_GALLERY_IMAGES from 7 to 5 per product
   - Added fallback to original image URL if -300x300 thumbnail doesn't exist
   - Sync now handles JPG images that don't have thumbnail versions generated

2. **SSH Access (Combell for DE Staging):**
   - Host: `combel` (alias for 136.144.235.35)
   - User: kamindu-de
   - Site: `staging.hercules-merchandise.de/`

---

### Session 2025-12-27 (Previous)
**Category Second Description & Mobile Header Fixes:**

1. **Mobile Header Hamburger Fix:**
   - Changed hamburger button background from green (#10C99E) to brand blue (#253461)
   - Kept same size/border-radius as other icons (5px radius, 13px padding)

2. **Category Second Description (SEO Content):**
   - Created new WordPress mu-plugin: `wp-content/mu-plugins/hercules-category-api.php`
   - New REST endpoints:
     - `GET /wp-json/hercules/v1/categories` - All categories with `second_description`
     - `GET /wp-json/hercules/v1/category/{slug}` - Single category
   - Meta key in WordPress is `seconddesc` (stored in term_meta)
   - Worker updated to fetch from Hercules API instead of WC API for categories
   - Astro category page now displays `#read-more-desc` section below products

3. **Second Description Styling (Elementor Global Kit Match):**
   - Font: Jost (matches Elementor kit)
   - Text color: #5F5F5F (Elementor global text)
   - Text alignment: Centered
   - Max width: 900px, centered
   - Headings: Jost 500 weight, #253461
   - Links: #00AEEF (Elementor accent color)
   - Lists: Left-aligned but centered as block

4. **Files Modified:**
   - `src/components/Header.astro` - Hamburger button styling
   - `src/pages/collections/[slug].astro` - Added read-more-desc section + CSS
   - `workers/product-sync/src/index.ts` - Updated category sync to use Hercules API

5. **WordPress (Staging) Files Added:**
   - `wp-content/mu-plugins/hercules-category-api.php` - Category REST API with second_description

6. **Deployed:**
   - Worker Version: `a04e5a03-b2b2-4c42-84aa-014eb9841083`
   - Astro Site: https://b33dba0e.herculesde.pages.dev
   - Production: https://herculesde.pages.dev

### Session 2025-12-26 (Continued)
**Gallery Image Caching & Category Page Fixes:**

1. **Breadcrumb Styling:**
   - Changed margin to padding (20px top) to eliminate gap between header and content
   - Current page (last item) now displays in light blue (#469ADC) matching staging site

2. **Full Gallery Image Caching:**
   - Worker now caches ALL product gallery images (not just main thumbnail)
   - Image endpoint updated: `/image/{slug}` for main, `/image/{slug}/{index}` for gallery
   - Batch size reduced from 15 to 5 products per sync to stay within 50 subrequest limit
   - Added skip-existing logic: only downloads missing images (saves API calls)
   - Cron job (3 AM UTC) will continue syncing missing images if interrupted by daily limits

3. **Thumbnail Click Fix:**
   - All gallery images now served from Worker KV cache
   - Consistent URL format ensures clicking any thumbnail shows correct image
   - No more WordPress URLs at runtime

4. **Deployed:**
   - Worker Version: `a08ba4b5-7155-4296-b525-2a837f6ac911`
   - Astro Site: https://7ffcd020.herculesde.pages.dev
   - Production: https://herculesde.pages.dev

### Session 2025-12-26 (Earlier)
**Category Product Card Polish:**

1. **Thumbnail Carousel Updates:**
   - Changed `slidesPerView` from `'auto'` to `4` (exactly 4 visible)
   - Changed `spaceBetween` from `4` to `10`
   - Added gray background (`#F2F2F2`) to each thumbnail slide
   - All images now use webp format (`-83x83.png.webp`, `-361x361.png.webp`)
   - Fixed click handler to prevent navigation and properly swap main image
   - Non-blocking initialization with `requestIdleCallback`

2. **Product Title Styling:**
   - Font: Jost 18px, weight 500, uppercase
   - Color: #253461 (primary dark blue)
   - Text aligned center

3. **Card Features List (USP):**
   - Added `card_features` field to Worker sync (from `usp_1` to `usp_4` meta fields)
   - Displayed as checkmark list below title
   - Styling: Blue checkmarks (#469ADC), gray text (#626262), Roboto 14px
   - Re-synced all 112 products with card_features data

4. **Button Styling:**
   - Pill shape (border-radius: 50px)
   - Font: Jost 15px, weight 500, uppercase
   - Background: #469ADC, border: 1px solid #469ADC
   - Hover: transparent background, blue text/border
   - Text: "Mehr erfahren"
   - `align-self: center` to prevent flex stretch

5. **Deployed:**
   - Worker Version: `b1d1b38d-40b6-40f1-b86c-53f78e9fa4c8`
   - Astro Site: https://ba9bcd4b.herculesde.pages.dev
   - Production: https://herculesde.pages.dev

### Session 2025-12-25
**Category Page Polish & Deployment:**

1. **Fixed Product Badges:**
   - Changed from category-based to custom meta fields (`made_in_europe`, `green_product`)
   - Updated Worker to extract badge fields from WooCommerce `meta_data`
   - Re-synced all 115 products with badge data

2. **Downloaded Correct Badge SVGs:**
   - Downloaded `made-in-de.svg` → saved as `/public/images/badges/made-in-europe.svg`
   - Downloaded `Green-Option-de.svg` → saved as `/public/images/badges/green-option.svg`
   - Both match staging site exactly

3. **Implemented Thumbnail Carousel:**
   - Added Swiper.js carousel under main product image
   - Configuration: `slidesPerView: 'auto'`, `freeMode: true`, `spaceBetween: 4`
   - Thumbnails: 50px (60px on large screens)
   - Click thumbnail to swap main image
   - Limited to 7 thumbnails per product for performance

4. **Fixed Category Page Layout:**
   - Changed grid from 4 columns to 3 columns
   - Responsive: 3 cols (desktop) → 2 cols (tablet) → 1 col (mobile)
   - Container max-width: 1200px with 20px padding
   - Cards properly constrained with `min-width: 0` and `overflow: hidden`

5. **CategoryProductCard Styling:**
   - Reduced padding from 40px to 20px
   - Title font: 14px (16px on large screens), 2-line clamp
   - Button: 12px font, compact padding
   - Badges: 35-40px width, positioned top-left

6. **Deployed to Cloudflare Pages:**
   - Build: 40 pages in 51s
   - URL: https://herculesde.pages.dev
   - Preview: https://ef8183da.herculesde.pages.dev

### Session 2025-12-24
**Image Caching - No WordPress Access:**

1. **Added Image Caching to Worker:**
   - Created `syncImageToKV()` function to download and cache thumbnails
   - Images stored as base64 in KV with metadata (contentType, originalUrl, syncedAt)
   - Images sync automatically during product sync (daily cron + webhooks)

2. **Added `/image/{slug}` Endpoint:**
   - Serves cached product thumbnails from KV
   - Returns proper Content-Type header
   - 1-day cache header for browser caching

3. **Updated Search to Use Local Images:**
   - Search results now return `thumbnail: https://hercules-product-sync.kamindudushmantha.workers.dev/image/{slug}`
   - No more WordPress URLs in search results

4. **Updated Product Endpoint:**
   - Added `localThumbnail` field to product responses

5. **Synced All 115 Products:**
   - All product thumbnails now cached in KV

6. **Added Category Sync (Same as Products):**
   - Categories now synced individually with `category:{id}` and `category:slug:{slug}` keys
   - Category index stored at `category:index`
   - Category images cached in KV (if they have images)
   - Added webhook endpoints: `/webhook/category-create`, `/webhook/category-update`, `/webhook/category-delete`
   - Added API endpoints: `/categories` (index), `/category/{id|slug}` (single), `/category-image/{slug}` (image)
   - Added `/sync-categories` endpoint for manual sync
   - 39 categories synced with auto-sync on daily cron
   - Worker deployed: Version ID `dd95372d-a83a-413b-aa82-419a23d910a2`

7. **Created Category Archive Pages:**
   - Dynamic route at `/collections/[slug].astro`
   - Fetches category data and products from Worker API
   - Components: Breadcrumb, Category header with description, Product grid
   - New `CategoryProductCard.astro` component with:
     - Product image from local KV cache
     - "Made in Europe" and "Green Option" badges from custom meta fields
     - Swiper.js thumbnail carousel with image swap
     - Product title, price, and "Ausführung wählen" button
     - Hover effects and responsive design
   - 3-column grid on desktop, responsive to 1-column on mobile
   - Working URLs: `/collections/personalisierte-fanschals/`, `/collections/fussball/`, etc.

### Session 2025-12-23
**Header, Footer & UI Polish:**

1. **Sticky Header Dropdown Menus:**
   - Fixed border-radius from 50% to 15px (rounded squares, not circles)
   - Fixed "ALL CATEGORIES" font: 15px, weight 500
   - Fixed search bar: border 1px solid #bfbfbf, border-radius 15px
   - Implemented horizontal submenu layout (main menu left, submenu grid right)
   - Changed from click to hover behavior
   - Main menu: 204px width, 50px height links, 15px padding
   - Submenu: 780px width, 39px height links, 4-column grid
   - Hover effects: #F5F5F5 background, color change
   - Dropdown aligned to header container (not hamburger button)

2. **Main Header Mega-Menu:**
   - Updated to match sticky header submenu design
   - 4 columns, 780px width, 39px height items
   - Same hover effects (#F5F5F5 background)

3. **Slider Fixes:**
   - Fixed duplicate navigation arrows (hidden default Swiper ::after arrows)
   - Changed background from #f5f5f5 to #ffffff (matches rest of page)

4. **Footer Updates:**
   - Newsletter button text: "Senden" (confirmed from WordPress)
   - Reseller column heading: "Wiederverkäufer oder professioneller Verein?"
   - Reseller column button: "Kontakt"
   - Added phone icon (SVG) with +49 8001833745
   - Main footer padding-top: 250px (creates 80px visible space after newsletter)
   - Logo column: vertically centered with flexbox
   - Bottom footer restructured:
     - Legal links on left with hover translateX effect
     - Payment icons in center (pay-her-2.png downloaded)
     - Language switcher dropdown on right (Germany current, UK/France/Netherlands options)
     - Dropdown opens upward with hover

5. **Product Carousel:**
   - Equal height cards using `.swiper-wrapper { align-items: stretch }` and `.swiper-slide { height: auto }`

6. **Images Downloaded:**
   - /public/images/pay-her-2.png (payment icons)
   - /public/images/german.png (German flag for language switcher)

7. **Deployed to Cloudflare Pages:**
   - Latest: https://herculesde.pages.dev

### Session 2025-12-22 (End of Day)
**Search Fix & Final Deployment:**

1. **Fixed Search Results Not Matching WordPress:**
   - Problem: Search was matching category names too broadly (e.g., "schal" matched all products in "personalisierte-fanschals" category)
   - Solution: Implemented score-based search ranking:
     - Name exact match: 100 points
     - Name starts with query: 50 points
     - Name contains query: 30 points
     - Slug contains query: 20 points
     - Category match (4+ chars only): 5 points
   - Added filters to exclude test products and products without slugs
   - Now "schal" correctly returns "Personalisierter HD-Fußballschal" first (matching WordPress)

2. **Deployed Updated Worker:**
   - Version ID: `c1df2b02-c6ac-46fa-acfd-f2944c1e6582`
   - Search now uses local KV data with proper scoring

3. **Deployed Astro Site:**
   - Latest: https://herculesde.pages.dev

### Session 2025-12-22 (Earlier)
**Product Sync & Search Implementation:**

1. **Analyzed Pearl WC Steps Variation Plugin:**
   - Examined pricing logic in `includes/conditional-price.php`
   - Documented quantity-based pricing with linear interpolation
   - Documented addon-based pricing structure
   - Created `/docs/PRICING_LOGIC.md` with full documentation

2. **Disabled MalCare on Staging:**
   - SSH via Combell: `ssh combel`
   - Renamed plugin: `mv malcare-security malcare-security-disabled`

3. **Added REST API Meta Filter:**
   - Created mu-plugin at `/wp-content/mu-plugins/pearl-rest-api-meta.php`
   - Exposes `conditional_prices`, `lead_time` on variations
   - Exposes `addon_options`, `allowed_addon_ids`, `estimated_delivery_date` on products

4. **Deployed Cloudflare Worker:**
   - Created KV namespace: `9b35cae40f234d1ea15e974aa8acbb85`
   - Set secrets: `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `WEBHOOK_SECRET`
   - Implemented batched sync (15 products per batch) to avoid subrequest limits
   - Synced all 115 products successfully

5. **Created WooCommerce Webhooks:**
   - ID 3: `product.created` → `/webhook/product-create`
   - ID 4: `product.updated` → `/webhook/product-update`
   - ID 5: `product.deleted` → `/webhook/product-delete`
   - All use HMAC-SHA256 signature verification

6. **Implemented Search Functionality:**
   - Enhanced worker `/search` endpoint with pricing calculation
   - Created `ProductSearch.tsx` React component
   - Integrated into Header.astro (desktop + mobile)
   - Mobile: fullscreen overlay on search icon tap
   - Features: 300ms debounce, thumbnail+price results, click-outside-close

### Previous Session (Earlier 2025-12-22)
- Created all homepage sections (TopBar, Header, Slider, TopPerformer, WhyChooseUs, DesignService, HerculesMerchandise, TrustLogos, CustomerReviews, Footer)
- Downloaded all images from WordPress
- Matched pixel-perfect styling

## File Structure
```
/home/kamindu/Headerless Herculess site/astro-hercules/
├── src/
│   ├── components/
│   │   ├── TopBar.astro
│   │   ├── Header.astro          # Includes ProductSearch
│   │   ├── ProductSearch.tsx     # React search component
│   │   ├── Slider.astro
│   │   ├── TopPerformer.astro
│   │   ├── WhyChooseUs.astro
│   │   ├── DesignService.astro
│   │   ├── HerculesMerchandise.astro
│   │   ├── TrustLogos.astro
│   │   ├── CustomerReviews.astro
│   │   ├── MobileMenu.astro
│   │   ├── CategoryProductCard.astro  # Product cards for category pages
│   │   └── Footer.astro
│   ├── data/
│   │   └── homepage-products.json
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── collections/
│   │       └── [slug].astro      # Category archive pages
│   └── styles/
│       └── global.css
├── workers/
│   └── product-sync/
│       ├── src/index.ts          # Worker source
│       ├── wrangler.toml         # Worker config
│       └── package.json
├── docs/
│   └── PRICING_LOGIC.md          # Pearl plugin pricing docs
├── public/
│   └── images/
│       ├── slider/
│       ├── menu/
│       ├── products/
│       ├── design/
│       ├── logos/ (49 partner logos)
│       ├── flags/ (uk, fr, nl)
│       ├── badges/ (made-in-europe.svg, green-option.svg)
│       └── footer-newsletter-bg.jpg
├── .env                          # API credentials
└── dist/ (build output)
```

## Reference Files
- WordPress staging site: https://staging.hercules-merchandise.de
- Elementor CSS downloaded to: /tmp/elementor-196.css, /tmp/post-8.css
- Full HTML: /tmp/staging-home.html

## Current Slider Implementation Values
Reference for next session - current CSS in Slider.astro (matches WordPress):
- Heading: 60px, weight 600, line-height 1.05, uppercase, Jost
- Description: 18px, weight 400, line-height 1.5, Roboto
- Button: 15px, weight 500, uppercase, padding 15px 40px, #10C99E bg, white text
- Slider height: 550px (1024px: 500px, 768px: 400px)
- Slide padding: 90px
- Tagline: 25px, top-left positioned with margin 30px 0 0 100px
- Pagination: Blue #00AEEF

## DesignService Section Values
Reference for next session - current CSS in DesignService.astro:
- Background: footer-bg.jpg, cover, center
- Padding: 50px 30px
- Two-column 50/50 layout
- Main image: 75% width
- Arrow: absolute positioned, right -392px, bottom 13px
- Heading: Jost 35px, 600, uppercase, white, highlight #469ADC
- Description: Roboto 18px, 400, white
- Button: #10C99E, pill shape, padding 15px 50px, Jost 15px 500 uppercase

## HerculesMerchandise Section Values
Reference - current CSS in HerculesMerchandise.astro:
- Padding: 50px 0, gap 20px
- Two-column 50/50 layout
- Heading: Jost 35px, 600, uppercase, #253461, highlight #469ADC
- Description: Roboto 16px, 400, #5F5F5F
- Button: #10C99E, pill shape, padding 15px 50px
- Image: 30px border-radius, about-hercules.webp

## TrustLogos Section Values
Reference - Swiper.js settings in TrustLogos.astro (matching WordPress):
- Background: #F4F4F4
- Heading: Jost 35px, 600, uppercase, #253461, center
- Swiper settings:
  - slidesPerView: 8 (desktop), 4 (tablet), 2 (mobile)
  - spaceBetween: 20px
  - speed: 9000ms
  - autoplay delay: 0 (continuous)
  - loop: true
  - pauseOnMouseEnter: true
  - transition-timing-function: linear
- Logo image max-height: 100px (desktop), 80px (tablet), 60px (mobile)
- 49 logos total: 25 in row 1 (LTR), 24 in row 2 (RTL)

## StickyHeader Section Values
Reference - current CSS in StickyHeader.astro (matching WordPress):
- Header container: position relative (for dropdown alignment)
- Hamburger button: border-radius 15px (not 50%)
- "ALL CATEGORIES" text: 15px, weight 500
- Search input: border 1px solid #bfbfbf, border-radius 15px
- Dropdown menu:
  - Main nav: 204px width, vertical layout
  - Main nav links: 50px height, 15px padding, hover #F5F5F5 background
  - Submenu: 780px width, 4-column grid, positioned left: 204px
  - Submenu links: 39px height, hover #F5F5F5 background, color #469ADC
  - Opens on hover (not click)
  - Aligned to header container bottom edge

## CategoryProductCard Values
Reference - current CSS in CategoryProductCard.astro:
- Card: border 1px solid #DCDCDC, border-radius 20px, padding 20px 15px
- Main image: border-radius 10px, aspect-ratio 1/1
- Thumbnails: 50px (60px on large screens), Swiper.js with freeMode
- Badges: positioned absolute top-left, 35-40px width
- Title: Jost 14px (16px large), weight 500, uppercase, 2-line clamp
- Price: Roboto 14px, weight 400
- Button: #469ADC bg, 12px Jost 500 uppercase, padding 10px 15px, border-radius 3px
- Grid: 3 columns desktop, 2 tablet, 1 mobile (container max-width 1200px)

## Footer Section Values
Reference - current CSS in Footer.astro (matching WordPress):
- Newsletter section:
  - Background: footer-newsletter-bg.jpg with 0.15 black overlay
  - Border-radius: 30px
  - Padding: 100px 50px
  - Heading: Jost 50px, 600, uppercase, white
  - Input: 16px Roboto, border-radius 20px
  - Button: #10C99E, 15px Jost 500 uppercase, border-radius 20px, text "Senden"
- Main footer:
  - Background: #E8F5FF
  - Margin-top: -170px (overlaps newsletter)
  - Padding: 250px top, 30px bottom (80px visible space after newsletter)
  - Headings: Jost 18px, 500, uppercase, #253461
  - Links: Roboto 16px, 400, #253461, hover #469ADC with 3px translateX
  - Logo column: vertically centered with flexbox
  - Reseller column: heading "Wiederverkäufer oder professioneller Verein?", button "Kontakt"
  - Phone: SVG icon + +49 8001833745
- Bottom footer:
  - Border-top: 1px solid rgba(37, 52, 97, 0.12)
  - Three-column layout: legal links | payment icons | language switcher
  - Payment icons: pay-her-2.png
  - Language switcher: dropdown with Germany (current), UK, France, Netherlands
  - Text: Roboto 14px, #253461

## Product Sync Worker

### Location
`/workers/product-sync/`

### Deployed URL
`https://hercules-product-sync.kamindudushmantha.workers.dev`

### Purpose
Cloudflare Worker that syncs product data from WooCommerce to KV storage for the headless Astro frontend.

### Features
- **Daily Sync**: Cron job at 3 AM UTC syncs all products and categories
- **Webhook**: Real-time updates when products or categories change
- **Batched Sync**: 5 products per batch to stay within 50 subrequest limit
- **REST API**: Exposes product and category data via JSON endpoints
- **Pricing Data**: Syncs conditional_prices and addon_options from Pearl plugin
- **Image Caching**: ALL gallery images cached in KV storage (no WordPress access at runtime)
- **Skip-Existing**: Only downloads missing images (resumable if interrupted by daily limits)
- **Category Sync**: Categories synced with same pattern as products

### API Endpoints
**Products:**
- `GET /products` - Product index (97 products synced)
- `GET /product/{id|slug}` - Single product with pricing data (includes `localThumbnail` URL)
- `GET /search?q={query}` - Search products (returns local image URLs)
- `GET /image/{slug}` - Serve cached main product image (index 0)
- `GET /image/{slug}/{index}` - Serve cached gallery image by index (1, 2, 3, etc.)
- `POST /sync?offset=N` - Manual product sync (protected by Bearer token)
- `POST /webhook/product-create` - WooCommerce product created webhook
- `POST /webhook/product-update` - WooCommerce product updated webhook
- `POST /webhook/product-delete` - WooCommerce product deleted webhook

**Categories:**
- `GET /categories` - Category index (39 categories synced)
- `GET /category/{id|slug}` - Single category with details
- `GET /category-image/{slug}` - Serve cached category image
- `POST /sync-categories` - Manual category sync (protected by Bearer token)
- `POST /webhook/category-create` - WooCommerce category created webhook
- `POST /webhook/category-update` - WooCommerce category updated webhook
- `POST /webhook/category-delete` - WooCommerce category deleted webhook

**Other:**
- `GET /status` - Last sync timestamp

### Resources Created
- **KV Namespace**: `PRODUCTS_KV` (ID: `9b35cae40f234d1ea15e974aa8acbb85`)
- **Preview KV**: ID: `6f1c941171f5422391f3b2b8caeb9bd0`
- **Image Storage**: All product gallery images cached as base64 in KV
  - Main image: `image:{slug}` (index 0)
  - Gallery images: `image:{slug}:{index}` (index 1, 2, 3, etc.)
  - Skip-existing logic: only downloads missing images
- **Category Storage**: Categories cached in KV (keys: `category:{id}`, `category:slug:{slug}`, `category:index`)

### Secrets Set
- `WC_CONSUMER_KEY` - WooCommerce REST API key
- `WC_CONSUMER_SECRET` - WooCommerce REST API secret
- `WEBHOOK_SECRET` - `hercules-webhook-secret-2024`

### WooCommerce Webhooks (Real-time Sync)
Created in WooCommerce (IDs 3, 4, 5):
- **Product Created** → `/webhook/product-create`
- **Product Updated** → `/webhook/product-update`
- **Product Deleted** → `/webhook/product-delete`

All webhooks use HMAC-SHA256 signature verification with the same secret.

### Manual Sync Command
```bash
# Sync all products in batches
offset=0
while true; do
  result=$(curl -s -X POST "https://hercules-product-sync.kamindudushmantha.workers.dev/sync?offset=$offset" -H "Authorization: Bearer hercules-webhook-secret-2024")
  hasMore=$(echo "$result" | python3 -c "import sys, json; print(json.load(sys.stdin).get('hasMore', False))")
  [ "$hasMore" = "False" ] && break
  offset=$(echo "$result" | python3 -c "import sys, json; print(json.load(sys.stdin).get('nextOffset', 0))")
done
```

### Deploy
```bash
cd workers/product-sync
CLOUDFLARE_API_TOKEN="..." CLOUDFLARE_ACCOUNT_ID="d6d3df04acc98efe34f43e42636a3dfc" npx wrangler deploy
```

### Documentation
- See `/workers/product-sync/README.md` for detailed setup
- See `/docs/PRICING_LOGIC.md` for pricing data structures

## Search Functionality

### Implementation
Replicated from WordPress Pearl WC Steps plugin with improvements:

**Backend (Cloudflare Worker):**
- Enhanced `/search` endpoint returns full product data
- **Score-based ranking** (prioritizes name matches over category):
  - Name exact match: 100 points
  - Name starts with query: 50 points
  - Name contains query: 30 points
  - Slug contains query: 20 points
  - Category match (4+ chars): 5 points
- Filters out test products and products without slugs
- Calculates min/max price from conditional_prices
- Returns thumbnail, price display, and product URL
- Limit parameter (default 10 results)

**Frontend (React Component):**
- `src/components/ProductSearch.tsx`
- 300ms debounce on input
- Minimum 2 characters to trigger search
- Loading spinner during fetch
- Dropdown results with thumbnail and price
- Mobile-friendly with fullscreen overlay
- Keyboard accessible (Escape to close)

### API Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 6721,
      "title": "Personalisierter HD-Fußballschal",
      "slug": "personalisierter-fussballschal",
      "url": "/produkt/personalisierter-fussballschal",
      "price": "€5.30 – €10.95",
      "minPrice": 5.30,
      "maxPrice": 10.95,
      "thumbnail": "https://staging.../image-300x300.png",
      "categories": ["Personalisierte Fanschals", "Fußball"]
    }
  ]
}
```

### Test Search
```bash
curl "https://hercules-product-sync.kamindudushmantha.workers.dev/search?q=schal&limit=5"
```

## Product Attributes (from WordPress)

### Scarf Product Attributes
- `pa_masse-*` - Size/Format options
- `pa_farbe-*` - Color count (1-5, 5+)
- `pa_bommel-*` - Pompom (mit/ohne)
- `pa_strickerei-*` - Embroidery (mit/ohne)
- `pa_modell-*` - Design type
- `pa_produktion-*` - Production location (Europa/China)

### Data Structure
Products stored in KV with structure:
- `product:{id}` - Full product JSON
- `product:slug:{slug}` - Same, indexed by slug
- `product:index` - Array of {id, name, slug, categories}
- `categories` - All product categories

## Notes
- User prefers exact pixel-perfect matching with WordPress
- Always compare with staging site for accuracy
- Run build before deploy to Cloudflare
- Reference CSS files in /tmp/ may need to be re-downloaded if session resets
- MalCare disabled on staging (renamed to `malcare-security-disabled`)
- SSH access via Combell: `ssh combel` (host alias at 136.144.235.35)
- REST API meta filter installed at: `/wp-content/mu-plugins/pearl-rest-api-meta.php`
- WooCommerce REST API credentials in `.env` file
