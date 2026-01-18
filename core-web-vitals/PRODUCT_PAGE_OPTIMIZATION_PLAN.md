# Product Page Optimization Plan
**Target:** Achieve 90+ Mobile Performance Score
**Current Score:** 76 (Need +14 points)

**Test URL:** https://hercules-astro.pages.dev/produkte/personalisierter-fussballschal/
**Date:** 2026-01-15

---

## Current Performance Analysis

### Scores
| Category | Score | Status |
|----------|-------|--------|
| Performance | 76 | 🟡 Good (Target: 90+) |
| Accessibility | 93 | ✅ Excellent |
| Best Practices | 92 | ✅ Excellent |
| SEO | 100 | ✅ Perfect |

### Core Web Vitals
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **FCP** | 1.2s | < 1.8s | ✅ Pass |
| **LCP** | 5.6s | < 2.5s | 🔴 CRITICAL - Primary issue |
| **TBT** | 0ms | < 200ms | ✅ Perfect |
| **CLS** | 0.034 | < 0.1 | ✅ Pass |
| **Speed Index** | 4.7s | < 3.4s | 🔴 Fail |

### Main Thread Work Breakdown
- Other: 302ms
- Script Evaluation: 165ms
- Style Layout: 115ms
- Paint Composite Render: 41ms
- Parse HTML: 40ms

**Total Main Thread Time:** 663ms (Good - under 1000ms)

---

## Critical Issues Identified

### 1. LCP at 5.6s (CRITICAL)
**Problem:** Main product image takes too long to load
**Impact:** -10 to -15 performance points

**Root Causes:**
- Product image not preloaded in HTML
- No `fetchpriority="high"` on LCP image
- Large image size without responsive variants
- Image loaded from Worker KV without optimization

### 2. Unused JavaScript (150ms savings)
**Problem:** Large React client bundle with unused code
**Impact:** -3 to -5 performance points

**Files:**
- `client.D_Es0amM.js`: 179KB (24.2 KB unused)
- ProductConfigurator: 44KB (heavy component)
- Multiple React hydration islands loading eagerly

### 3. Missing Image Optimizations
**Problem:** No responsive images, no modern formats
**Impact:** -2 to -4 performance points

**Issues:**
- Images served at full WordPress size (361x361px)
- No WebP/AVIF modern formats
- No srcset for responsive delivery
- Thumbnail images also not optimized

### 4. Font Loading Not Optimized
**Impact:** -1 to -2 performance points

**Current:** Self-hosted fonts loaded with preload
**Issue:** Font preload might be blocking other critical resources

---

## Optimization Strategy

### Phase 1: LCP Image Optimization (Expected +8-10 points)

#### 1.1 Add LCP Image Preload in BaseLayout
**File:** `src/layouts/BaseLayout.astro`

Add conditional product image preload:
```astro
{preloadImages.length > 0 && preloadImages.map(img => (
  <link rel="preload" as="image" href={img} fetchpriority="high" />
))}
```

**File:** `src/pages/produkte/[slug].astro`

Pass product image as preload:
```astro
<BaseLayout
  ...
  preloadImages={galleryImages[0]?.src ? [galleryImages[0].src] : []}
>
```

#### 1.2 Add fetchpriority="high" to Main Image
**File:** `src/pages/produkte/[slug].astro` (line 250-256)

Change:
```astro
<img
  id="main-product-image"
  src={galleryImages[0]?.src || '/images/placeholder.png'}
  alt={product.name}
  loading="eager"
  fetchpriority="high"
  width="361"
  height="361"
/>
```

#### 1.3 Implement Responsive Image Sizes
**Worker:** Generate multiple image sizes (150w, 300w, 600w)
**HTML:** Add srcset to main image

```astro
<img
  id="main-product-image"
  src={galleryImages[0]?.src}
  srcset={`
    ${galleryImages[0]?.src?.replace('-361x361', '-150x150')} 150w,
    ${galleryImages[0]?.src?.replace('-361x361', '-300x300')} 300w,
    ${galleryImages[0]?.src} 600w
  `}
  sizes="(max-width: 768px) 100vw, 50vw"
  alt={product.name}
  loading="eager"
  fetchpriority="high"
  width="361"
  height="361"
/>
```

**Expected Impact:** LCP 5.6s → 3.0-3.5s, Score +8-10 points

---

### Phase 2: JavaScript Optimization (Expected +3-5 points)

#### 2.1 Defer Non-Critical React Components
**File:** `src/pages/produkte/[slug].astro`

Change ProductConfigurator loading:
```astro
<ProductConfigurator
  productSlug={slug as string}
  workerUrl={WORKER_URL}
  client:idle
/>
```

Already using `client:load` - change to `client:visible` or `client:idle`:
- `client:visible`: Loads when component enters viewport (RECOMMENDED)
- `client:idle`: Loads when main thread is idle

#### 2.2 Lazy Load Below-Fold Images
**File:** `src/pages/produkte/[slug].astro` (line 268)

Thumbnail images already using lazy loading correctly (index < 20 = eager, rest = lazy)

#### 2.3 Defer ContactFormPopup
**File:** `src/pages/produkte/[slug].astro` (line 322)

Change from `client:idle` to `client:visible`:
```astro
<ContactFormPopup
  triggerType="button"
  triggerText="Kostenloses Design anfordern"
  client:visible
/>
```

**Expected Impact:** Reduce initial JS execution time by 50-100ms, Score +2-3 points

---

### Phase 3: CSS Optimization (Expected +1-2 points)

#### 3.1 Inline Critical CSS
**Tool:** Use Astro's `inlineStylesheets` config

**File:** `astro.config.mjs`

Add:
```js
export default defineConfig({
  build: {
    inlineStylesheets: 'auto'
  }
});
```

#### 3.2 Remove Unused CSS
Check if all CSS from `_slug_.CWFpgx0p.css` (57KB), `_slug_.nckCHj18.css` (35KB) is used.

**Expected Impact:** FCP improvement by 100-200ms, Score +1-2 points

---

### Phase 4: Font Loading Optimization (Expected +1-2 points)

#### 4.1 Optimize Font Preload Priority
**File:** `src/layouts/BaseLayout.astro`

Current font preloads might be blocking LCP image. Ensure LCP image preload comes BEFORE font preloads:

```astro
<!-- LCP Image Preload (FIRST) -->
{preloadImages.length > 0 && preloadImages.map(img => (
  <link rel="preload" as="image" href={img} fetchpriority="high" />
))}

<!-- Font Preload (AFTER) -->
<link rel="preload" as="font" href="/fonts/jost-latin.woff2" type="font/woff2" crossorigin>
<link rel="preload" as="font" href="/fonts/roboto-latin.woff2" type="font/woff2" crossorigin>
```

#### 4.2 Use font-display: optional
Already implemented in `src/styles/fonts.css`

**Expected Impact:** Prevent font-related layout shifts, Score +1 point

---

### Phase 5: Additional Optimizations (Expected +2-3 points)

#### 5.1 Add Cache Headers for Static Assets
Ensure Cloudflare Pages serves assets with long cache:
- Images: `Cache-Control: public, max-age=31536000, immutable`
- JS/CSS: `Cache-Control: public, max-age=31536000, immutable`

#### 5.2 Reduce Third-Party Scripts
Check for:
- Google Analytics (already optimized)
- TrustIndex widget (not on product page)
- Any tracking scripts

#### 5.3 Optimize Product Data Fetching
Current: 2 API calls (product + all products for related)
Optimization: Cache product list in build, only fetch current product at runtime

**Expected Impact:** Reduce network time by 200-300ms, Score +2 points

---

## Implementation Priority

### HIGH PRIORITY (Do First - Biggest Impact)
1. **LCP Image Preload** (Phase 1.1, 1.2) → +5-6 points
2. **Responsive Images** (Phase 1.3) → +3-4 points
3. **Defer ProductConfigurator** (Phase 2.1) → +2-3 points

**Expected Total:** +10-13 points (Score: 76 → 86-89)

### MEDIUM PRIORITY (Do Second - Get to 90+)
4. **Font Loading Order** (Phase 4.1) → +1-2 points
5. **Inline Critical CSS** (Phase 3.1) → +1-2 points
6. **Defer ContactFormPopup** (Phase 2.2) → +1 point

**Expected Total:** +3-5 points (Score: 86-89 → 89-94)

### LOW PRIORITY (Nice to Have - Get to 95+)
7. **Cache Headers** (Phase 5.1) → +1 point
8. **Optimize Data Fetching** (Phase 5.3) → +1-2 points

**Expected Total:** +2-3 points (Score: 89-94 → 91-97)

---

## Expected Final Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Performance Score** | 76 | **90-94** | **+14-18 points** |
| **LCP** | 5.6s | **2.5-3.0s** | **-2.6-3.1s** |
| **FCP** | 1.2s | **0.9-1.0s** | **-0.2-0.3s** |
| **Speed Index** | 4.7s | **3.0-3.4s** | **-1.3-1.7s** |
| **TBT** | 0ms | **0ms** | No change (already perfect) |
| **CLS** | 0.034 | **0.020** | **-0.014** |

---

## Files to Modify

1. `src/layouts/BaseLayout.astro` - LCP preload, font order
2. `src/pages/produkte/[slug].astro` - Image attributes, component loading
3. `astro.config.mjs` - Inline stylesheets config
4. (Optional) `workers/product-sync/src/index.ts` - Generate responsive image sizes

---

## Testing Plan

1. **After Phase 1 (LCP):**
   - Run PageSpeed Insights
   - Expected: 76 → 84-86

2. **After Phase 2 (JS):**
   - Run PageSpeed Insights
   - Expected: 84-86 → 88-91

3. **After Phase 3-4 (CSS/Fonts):**
   - Run PageSpeed Insights
   - Expected: 88-91 → 90-94

4. **Final Verification:**
   - Test multiple product pages
   - Test on different network conditions
   - Verify no functionality broken

---

## Notes

- Focus on LCP optimization first - it's the biggest impact
- Test after each phase to verify improvements
- Don't sacrifice user experience for score
- Mobile score is harder to optimize than desktop (simulated 3G network)
- 90+ score is excellent, 95+ is exceptional

---

## Risk Assessment

**LOW RISK:**
- Image preload (Phase 1.1, 1.2)
- fetchpriority attribute (Phase 1.2)
- Component loading strategy (Phase 2.1, 2.3)

**MEDIUM RISK:**
- Responsive images (Phase 1.3) - needs testing on all devices
- Inline CSS (Phase 3.1) - might increase HTML size

**HIGH RISK:**
- Removing font preload (DON'T DO - already optimized)
- Changing component hydration might break interactivity

---

## Success Criteria

✅ **Minimum Goal:** Mobile Performance Score 90+
✅ **Stretch Goal:** Mobile Performance Score 93+
✅ **LCP Target:** < 2.5s (currently 5.6s)
✅ **Speed Index Target:** < 3.4s (currently 4.7s)
✅ **No Regression:** Maintain 90+ scores for Accessibility, Best Practices, SEO
✅ **No Functionality Loss:** All product features work correctly
