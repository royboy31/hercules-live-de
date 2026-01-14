# Session 2026-01-14: CLS & PageSpeed Optimization

## Summary
Fixed Cumulative Layout Shift (CLS) issues on the homepage to achieve a perfect CLS score of 1 (value: 0.003-0.027).

## Issues Identified

### 1. Image-Related CLS
- **Google Reviews image** (`/images/google-reviews.png`) - CSS `height: auto` overriding HTML dimensions
- **About Hercules image** (`/images/about-hercules.webp`) - CSS `height: auto` causing layout shift
- **Product images in TopPerformer** - Missing aspect-ratio causing shifts on lazy load

### 2. Font-Related CLS
- Web fonts (Jost, Roboto) from fonts.gstatic.com causing text reflow when loaded
- `font-display: swap` was causing visible font swap

### 3. Slider Content CLS
- Slider heading (`<h2 class="slide-heading">`) shifting when fonts load
- No reserved space for slider content

## Fixes Applied

### 1. Google Reviews Image (Header & TopBar)

**File: `src/components/Header.astro`** (line 604-608)
```css
.mobile-topbar-reviews img {
  max-width: 100%;
  height: auto;
  aspect-ratio: 306 / 36;  /* Added */
}
```

**File: `src/components/TopBar.astro`** (line 125-129)
```css
.google-reviews img {
  width: 154px;
  height: auto;
  aspect-ratio: 306 / 36;  /* Added */
}
```

### 2. About Hercules Image

**File: `src/components/HerculesMerchandise.astro`** (line 151-158)
```css
.about-image {
  width: 100%;
  max-width: 800px;
  height: auto;
  aspect-ratio: 600 / 400;  /* Added */
  border-radius: 30px;
  object-fit: cover;
}
```

### 3. Product Images in TopPerformer

**File: `src/components/TopPerformer.astro`** (line 140-146)
```css
.product-image img {
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1 / 1;  /* Added */
  object-fit: contain;
  object-position: center;
}
```

### 4. Font Loading & Fallbacks

**File: `src/styles/global.css`** (lines 3-22)
```css
/* Font fallback definitions to prevent CLS */
@font-face {
  font-family: 'Jost Fallback';
  src: local('Arial');
  size-adjust: 100%;
  ascent-override: 92%;
  descent-override: 22%;
  line-gap-override: 0%;
}

@font-face {
  font-family: 'Roboto Fallback';
  src: local('Arial');
  size-adjust: 100%;
  ascent-override: 92%;
  descent-override: 24%;
  line-gap-override: 0%;
}
```

**File: `src/styles/global.css`** (lines 53-55)
```css
/* Font Family - includes metric-adjusted fallbacks to prevent CLS */
--font-family-sans: 'Jost', 'Jost Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-body: 'Roboto', 'Roboto Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**File: `src/layouts/BaseLayout.astro`** (lines 207-215)
```html
<!-- Changed from display=swap to display=optional to prevent font swap CLS -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&family=Roboto:wght@400&display=optional">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&family=Roboto:wght@400&display=optional" media="print" onload="this.media='all'">
```

### 5. Slider Content Space Reservation

**File: `src/components/Slider.astro`** (lines 138-154)
```css
.slide-contents {
  width: 1020px;
  max-width: 100%;
  min-height: 200px;  /* Added - Reserve space to prevent CLS */
}

.slide-heading {
  font-family: 'Jost', 'Jost Fallback', sans-serif;  /* Added fallback */
  font-size: 60px;
  font-weight: 600;
  line-height: 1.05;
  color: #ffffff;
  text-transform: uppercase;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  min-height: 1.05em;  /* Added - Reserve space for heading */
}
```

## Worker Image Size Updates

Updated the Product Sync Worker to use WordPress's exact image sizes for optimal performance:

**File: `workers/product-sync/src/index.ts`**

### Main image sync (lines 785-816)
- Changed from 300x300 to **361x361** (exact display size for category cards)
- Added fallback chain: 361x361 → 300x300 → 600x600 → original

### Thumbnail sync
- Changed from 150x150 to **100x100** (for 83px thumbnail display)
- Added fallback: 100x100 → 83x83

### Updated locations:
- Line 609: `localThumbnail` → 361x361
- Line 620: `thumbnail` → 361x361
- Lines 1888-1900: Resync endpoint → 361x361 main, 100x100 thumb
- Lines 2000-2012: Single product sync → 361x361 main, 100x100 thumb
- Lines 2026-2027: imageResults metadata updated

**Worker Deployed:** Version `04f4fd94-0a95-4722-bf2c-dcd986cf054e`

## Results

### Before Fixes
- CLS Score: Variable (0.024+ with elements flagged)
- Layout shift elements detected: 3-4
- Unsized images flagged: 2

### After Fixes
| URL | CLS Score | CLS Value | Layout Shifts | Unsized Images |
|-----|-----------|-----------|---------------|----------------|
| hercules-astro.pages.dev | 1 (perfect) | 0.003 | None | None |
| staging.hercules-merchandise.de | 1 (perfect) | 0.027 | None | None |

### Performance Scores
- Mobile: 79-83
- Desktop: 96

## Pending: Image Resync

The Worker code is updated but images couldn't be resynced due to **Cloudflare KV daily write limit exceeded**.

The limit resets at midnight UTC. After reset, images will be automatically synced at the 3 AM UTC cron job, or manually with:

```bash
# Manual resync (after KV limit resets)
offset=0
while true; do
  result=$(curl -s -X POST "https://hercules-product-sync.gilles-86d.workers.dev/resync-images?offset=$offset" \
    -H "Authorization: Bearer hercules-webhook-secret-2024")
  hasMore=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin).get('hasMore',False))" 2>/dev/null)
  [ "$hasMore" = "False" ] && break
  offset=$((offset + 1))
  sleep 1
done
```

## Note on KV Limits

The Cloudflare account appears to be on the **Workers Free tier** for KV operations (1,000 writes/day limit), even though the domain may be on a Pro plan. These are separate subscriptions.

To increase limits, upgrade to Workers Paid ($5/month) at:
https://dash.cloudflare.com/86dfa0e10ca766f79d5042548fc2776f/workers/plans

## Files Modified

1. `src/components/Header.astro` - aspect-ratio for mobile Google Reviews image
2. `src/components/TopBar.astro` - aspect-ratio for desktop Google Reviews image
3. `src/components/HerculesMerchandise.astro` - aspect-ratio for about image
4. `src/components/TopPerformer.astro` - aspect-ratio for product images
5. `src/components/Slider.astro` - min-height for content, fallback font
6. `src/styles/global.css` - Font fallback definitions with metrics
7. `src/layouts/BaseLayout.astro` - Changed to display=optional for fonts
8. `workers/product-sync/src/index.ts` - Updated image sizes to 361x361 and 100x100

## Deployments

- **Astro Site:** https://hercules-astro.pages.dev
- **Preview URLs:**
  - https://622d10b8.hercules-astro.pages.dev
  - https://3b378e91.hercules-astro.pages.dev
  - https://997c704a.hercules-astro.pages.dev
- **Worker:** https://hercules-product-sync.gilles-86d.workers.dev
