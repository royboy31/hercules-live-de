# WordPress Sticky Header Plugin Updates

## Plugin: Hercules Sticky Header
**Location:** `/wp-content/mu-plugins/hercules-sticky-header.php`
**Final Version:** 2.0.7
**Date:** January 2026

---

## Access Details & Environment

### SSH Access to WordPress Server
```bash
ssh combel
```
**Working Directory:** `/var/www/vhosts/hercules-merchandise.de`

### Important Paths
| Path | Description |
|------|-------------|
| `/var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/` | Staging site root |
| `/var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/mu-plugins/` | MU-Plugins directory |
| `/var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/uploads/` | Media uploads |

### URLs
| URL | Description |
|-----|-------------|
| https://staging.hercules-merchandise.de | Staging site (via Edge Router) |
| https://staging.hercules-merchandise.de/wp-admin/ | WordPress Admin |
| https://staging.hercules-merchandise.de/mein-konto/ | WordPress-only page (for testing sticky header) |

### Local Development
| Path | Description |
|------|-------------|
| `/home/kamindu/Headerless Herculess site/astro-hercules/` | Astro project root |
| `/home/kamindu/Headerless Herculess site/astro-hercules/src/components/StickyHeader.astro` | Reference Astro sticky header |
| `/tmp/hercules-sticky-header-v2.0.6.php` | Local copy of plugin (latest edits) |

### Upload Plugin to Server
```bash
scp /tmp/hercules-sticky-header-v2.0.6.php combel:/var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/mu-plugins/hercules-sticky-header.php
```

### Read Plugin from Server
```bash
ssh combel "cat /var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/mu-plugins/hercules-sticky-header.php"
```

### Architecture Overview
The site uses an **Edge Router** that routes traffic between:
- **Astro** (static pages like homepage, collections)
- **WordPress** (dynamic pages like cart, checkout, my-account, wp-admin)

The sticky header plugin is a WordPress **mu-plugin** that renders on WordPress-only pages to match the Astro header design.

### Menu Data Source
The sticky header fetches menu items from `/tmp/menu.json` which contains:
- `sportarten` - Sports categories
- `produkte` - Product categories
- `themen` - Theme categories

Each item has: `id`, `title`, `url`, `icon`, `icon_wp`

---

## Issues Reported

The following issues were reported with the WordPress sticky header compared to the Astro version:

1. Icons are different
2. ALLE KATEGORIEN font and color are different
3. Dropdown logo is not showing
4. Dropdown main menu items styling different (colors as well)

---

## Fixes Applied

### Version 2.0.3
**Issue:** Logo not displaying (broken image)

**Root Cause:** The logo URL was pointing to a non-existent path (`/wp-content/uploads/2025/06/hercules-logo-original1.webp`)

**Fix:** Updated logo URL to correct path:
```php
// Before (broken):
$logo_url = home_url('/wp-content/uploads/2025/06/hercules-logo-original1.webp');

// After (fixed):
$logo_url = content_url('/uploads/2025/04/hercules-logo-new-original.webp');
```

---

### Version 2.0.4
**Issue:** Logo displaying at 140px height instead of 55px

**Root Cause:** Elementor's global CSS rule `.elementor img { height: auto; }` was overriding the plugin's logo height setting

**Fix:** Added `!important` to logo CSS to override Elementor styles:
```css
.dropdown-logo {
    height: 55px !important;
    width: auto !important;
    display: block;
    max-height: 55px !important;
}
```

---

### Version 2.0.5
**Issue:** PRODUKTE and THEMEN menu items invisible (white text on white background)

**Root Cause:** WordPress/Elementor CSS was overriding the menu item text color to white (`rgb(255, 255, 255)`)

**Fix:** Added `!important` to menu link CSS colors:
```css
.sticky-nav-link {
    /* ... other styles ... */
    background: transparent !important;
    color: #253461 !important;
}

.sticky-nav-link:hover {
    color: #00AEEF !important;
    background-color: #F5F5F5 !important;
}

.sticky-nav-item.active .sticky-nav-link {
    color: #00AEEF !important;
    background-color: #F5F5F5 !important;
}
```

---

### Version 2.0.6
**Issue 1:** ALLE KATEGORIEN text appearing white instead of dark blue (#253461)

**Root Cause:** WordPress/Elementor CSS was overriding the color property on `.all-categories-text`

**Fix:** Added `!important` to all color-related properties:
```css
.all-categories-text {
    background: none !important;
    font-family: 'Jost', sans-serif !important;
    font-size: 15px !important;
    font-weight: 500 !important;
    color: #253461 !important;
}
.all-categories-text:hover { color: #00AEEF !important; }
.sticky-menu-wrapper:has(.sticky-dropdown-nav.active) .all-categories-text {
    color: #00AEEF !important;
}
```

**Issue 2:** Icons (account, wishlist, cart) different from Astro version

**Root Cause:** WordPress plugin was using different SVG icons with different viewBox dimensions and paths than Astro components

**Fix:** Replaced all icon SVGs with exact copies from Astro components:
- **Account icon:** From `UserSession.tsx` - viewBox="0 0 29 29" (person with head and body)
- **Wishlist icon:** From `WishlistCount.tsx` - viewBox="0 0 24 24" (heart outline)
- **Cart icon:** From `UserSession.tsx` - viewBox="0 0 31 31" (shopping cart with wheels)

**Additional Fix:** Changed icon button size from 40x40 to 44x44 to match Astro styling exactly.

---

### Version 2.0.7
**Issue 1:** Hamburger button turns red on hover/click

**Root Cause:** WordPress/Elementor global button styles were overriding the hamburger button background color on hover, focus, and active states.

**Fix:** Added explicit hover/focus/active states with `!important`:
```css
.sticky-menu-toggle:hover,
.sticky-menu-toggle:focus,
.sticky-menu-toggle:active,
.sticky-menu-toggle.active {
    background-color: #253461 !important;
    border: none !important;
    color: #FFFFFF !important;
    outline: none !important;
    box-shadow: none !important;
}
```

**Issue 2:** Gap between dropdown and header

**Root Cause:**
- Dropdown had 8px border-radius on all corners, creating visual gap at top
- Logo header section had 25px padding creating white space

**Fix:**
1. Changed dropdown border-radius from `8px` to `0 0 8px 8px` (only bottom corners rounded)
2. Reduced logo header padding from `25px` to `15px 25px 25px 25px` (reduced top padding)

```css
.sticky-dropdown-nav {
    border-radius: 0 0 8px 8px;  /* Only bottom corners rounded */
}
.dropdown-logo-header {
    padding: 15px 25px 25px 25px;  /* Reduced top padding */
}
```

**Issue 3:** Cart count and login indicator show wrong values (stale from cache)

**Issue 4:** Login indicator dot too small (10x10 instead of 16x16)

**Root Cause:** PHP-rendered values (`WC()->cart->get_cart_contents_count()` and `is_user_logged_in()`) are set at page load time and become stale when pages are cached by Cloudflare APO.

**Fix:** Added JavaScript to dynamically fetch session data from `/wp-json/hercules/v1/session` API:
```javascript
function updateSessionUI() {
    fetch('/wp-json/hercules/v1/session', { credentials: 'include' })
    .then(response => response.json())
    .then(data => {
        // Update cart count badge
        var cartCount = data.cart && data.cart.count ? data.cart.count : 0;
        // Create/update/remove badge based on count

        // Update login indicator
        var isLoggedIn = data.logged_in === true;
        // Create/remove indicator based on login status
    });
}

// Fetch on page load
updateSessionUI();

// Refresh on tab visibility change
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') updateSessionUI();
});

// Listen for cart update events
window.addEventListener('hercules:cart-updated', updateSessionUI);
```

**Issue 4 Fix:** Updated CSS for login indicator size:
```css
/* Changed from 10x10 to 16x16, adjusted positioning */
.logged-in-indicator {
    position: absolute;
    top: -5px;   /* was -3px */
    right: -5px; /* was -3px */
    width: 16px;  /* was 10px */
    height: 16px; /* was 10px */
    background: #10C99E;
    border-radius: 50%;
    border: 2px solid white;
}
```

---

## Final Result

All issues have been resolved:

| Issue | Status | Version | Fix |
|-------|--------|---------|-----|
| Dropdown logo not showing | ✅ Fixed | v2.0.3 | Corrected URL path |
| Logo too large (140px) | ✅ Fixed | v2.0.4 | Added !important to CSS override |
| Menu items invisible | ✅ Fixed | v2.0.5 | Added !important to override Elementor CSS |
| ALLE KATEGORIEN white color | ✅ Fixed | v2.0.6 | Added !important to color properties |
| Icons different from Astro | ✅ Fixed | v2.0.6 | Replaced with exact SVGs from Astro components |
| Hamburger button turns red | ✅ Fixed | v2.0.7 | Added explicit hover/active states |
| Gap between dropdown and header | ✅ Fixed | v2.0.7 | Removed top border-radius, reduced padding |
| Cart/login indicators stale | ✅ Fixed | v2.0.7 | Dynamic JS fetch from session API |
| Login indicator too small | ✅ Fixed | v2.0.7 | Changed from 10x10 to 16x16 pixels |

---

## Key Learnings

1. **WordPress/Elementor CSS Conflicts:** When creating custom components for WordPress sites using Elementor, use `!important` on critical styling properties to ensure they aren't overridden by Elementor's global styles.

2. **Asset Paths:** Always verify actual file paths on the server. The logo was in `/2025/04/` not `/2025/06/`.

3. **Common Elementor Overrides to Watch:**
   - `.elementor img { height: auto; }` - Affects all images
   - Global button/link color styles
   - Font family inheritance

---

## Files Modified

- `/wp-content/mu-plugins/hercules-sticky-header.php` (v2.0.7)

## Testing

Tested on: `https://staging.hercules-merchandise.de/mein-konto/`

The WordPress sticky header dropdown now visually matches the Astro version at `https://staging.hercules-merchandise.de/` (Astro pages).

---

## How to Test & Debug

### Testing the Sticky Header
1. Navigate to a WordPress-only page: https://staging.hercules-merchandise.de/mein-konto/
2. Scroll down past the main header to trigger the sticky header
3. Click "ALLE KATEGORIEN" to open the dropdown
4. Verify all menu items (SPORTARTEN, PRODUKTE, THEMEN) are visible

### Using Chrome DevTools MCP
The Chrome DevTools MCP server can be used to:
- Take screenshots for visual comparison
- Inspect computed CSS styles
- Execute JavaScript to check element dimensions
- Debug CSS override issues

Example: Check if menu items have correct colors:
```javascript
document.querySelectorAll('.sticky-nav-item').forEach(item => {
  const btn = item.querySelector('.sticky-nav-link');
  console.log(item.textContent.trim(), window.getComputedStyle(btn).color);
});
```

### Common Debug Commands
```bash
# Check plugin version on server
ssh combel "grep 'Version:' /var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/mu-plugins/hercules-sticky-header.php"

# Search for CSS rules in plugin
ssh combel "grep -n 'dropdown-logo' /var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/mu-plugins/hercules-sticky-header.php"

# Check if logo file exists
ssh combel "ls -la /var/www/vhosts/hercules-merchandise.de/staging.hercules-merchandise.de/wp-content/uploads/2025/04/hercules-logo*"
```

### Screenshots for Reference
During debugging, screenshots were saved to `/tmp/`:
- `astro-sticky-dropdown.png` - Astro reference
- `wordpress-sticky-v2.0.5-with-header.png` - Final WordPress result

---

## Related Files

### WordPress MU-Plugins on Server
| File | Purpose |
|------|---------|
| `hercules-sticky-header.php` | Sticky header for WordPress pages |
| `hercules-session-api.php` | Session/cart API for Astro |
| `hercules-wishlist-api.php` | Wishlist API |
| `hercules-category-api.php` | Category REST API |
| `pearl-rest-api-meta.php` | REST API meta fields |

### Astro Components (Reference)
| File | Purpose |
|------|---------|
| `src/components/StickyHeader.astro` | Main sticky header component |
| `src/components/Header.astro` | Main header component |

---

## Future Improvements

If further styling adjustments are needed:
1. Always compare with Astro `StickyHeader.astro` for exact CSS values
2. Use `!important` for critical styles to override Elementor
3. Test on WordPress-only pages (mein-konto, cart, checkout)
4. Use Chrome DevTools to inspect computed styles and identify CSS conflicts
