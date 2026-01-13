# PageSpeed Insights Analysis - Collection Page Optimization
**URL:** https://dff8aa9f.hercules-astro.pages.dev/collections/personalisierte-sportbekleidung/
**Tested:** 2026-01-12
**Strategy:** Mobile & Desktop

---

## Performance Scores Comparison

### Mobile Performance
```
BEFORE:  81  
AFTER:   78  (-3 points) ⚠️ REGRESSION
```

### Desktop Performance
```
BEFORE:  N/A
AFTER:   99  ✓ EXCELLENT
```

### Other Categories (After Optimization)
```
Accessibility:    97  ✓
Best Practices:   96  ✓
SEO:              69  (blocked from indexing)
```

---

## Core Web Vitals Comparison

### Mobile (Primary Concern)
| Metric       | Before  | After  | Change    | Status     | Threshold |
|--------------|---------|--------|-----------|------------|-----------|
| **LCP**      | 4.3s    | 5.1s   | +0.8s ❌  | WORSE      | <2.5s     |
| **FCP**      | N/A     | 2.6s   | N/A       | Moderate   | <1.8s     |
| **CLS**      | N/A     | 0.00   | ✓         | PERFECT    | <0.1      |
| **TBT**      | N/A     | 20ms   | ✓         | EXCELLENT  | <200ms    |
| Speed Index  | N/A     | 2.6s   | ✓         | Good       | <3.4s     |

### Desktop (Excellent Results)
| Metric       | After  | Status     |
|--------------|--------|------------|
| **LCP**      | 0.9s   | ✓ EXCELLENT |
| **FCP**      | 0.5s   | ✓ EXCELLENT |
| **CLS**      | 0.008  | ✓ EXCELLENT |
| **TBT**      | 0ms    | ✓ PERFECT   |
| Speed Index  | 0.8s   | ✓ EXCELLENT |

---

## Image Request Analysis

### Request Count Comparison
```
BEFORE:  90 images
AFTER:   103 images (mobile)  (+13 images ❌)
         174 images (desktop) (+84 images ❌)
```

### Image Breakdown by Source (Mobile)
| Domain | Count | Transfer Size | Notes |
|--------|-------|---------------|-------|
| hercules-product-sync.gilles-86d.workers.dev | 61 | 2,024 KiB | Product images from Workers API |
| dff8aa9f.hercules-astro.pages.dev | 42 | 133 KiB | Static assets (hero, icons, UI) |
| **TOTAL** | **103** | **2,157 KiB** | |

**Finding:** Gallery thumbnails are still being loaded, indicating the deferred loading optimization did not work as expected.

---

## What Worked ✓

1. **CLS Elimination (Mobile: 0.00, Desktop: 0.008)**
   - Skeleton placeholders successfully prevented layout shifts
   - This is a MAJOR win for user experience

2. **TBT Optimization (Mobile: 20ms)**
   - Excellent main thread blocking time
   - Well under the 200ms threshold

3. **Desktop Performance (99/100)**
   - Outstanding desktop experience
   - All Core Web Vitals in green

4. **Accessibility & Best Practices**
   - 97/100 accessibility (excellent)
   - 96/100 best practices (excellent)

---

## What Didn't Work ❌

1. **Mobile LCP Regression (4.3s → 5.1s)**
   - LCP got WORSE by 0.8 seconds
   - Still far from the 2.5s threshold
   - Possible causes:
     - fetchpriority="high" not being respected on mobile
     - Gallery thumbnails loading despite deferred loading attempt
     - Main thread work: 2.1s (980ms in "other" category)

2. **Increased Image Requests (90 → 103)**
   - 13 additional images loaded on mobile
   - Gallery deferred loading is NOT working
   - All product images + thumbnails still loading on page load

3. **Mobile Score Regression (81 → 78)**
   - 3-point decrease in overall mobile performance
   - Optimizations had opposite effect on mobile

---

## Root Cause Analysis

### Why LCP Increased on Mobile

**Main Thread Work Breakdown (2.1s total):**
- Other: 980ms (largest contributor)
- Script Evaluation: 430ms
- Style/Layout: 407ms
- Paint/Composite: 180ms

**JavaScript Bootup Time (0.4s):**
- autoplay.DnqRM0Nv.js: 769ms
- Anonymous scripts: 460ms
- client.D_Es0amM.js: 144ms
- swiper-core.CcKoyxgK.js: 141ms

**Issue:** The deferred gallery loading JavaScript is likely executing DURING page load rather than AFTER, blocking the main thread and delaying LCP.

### Why Image Count Increased

**Expected behavior:**
- First 6 product images load immediately (fetchpriority="high")
- Gallery thumbnails load after page load via JavaScript

**Actual behavior:**
- All 103 images loading during page load
- Gallery deferred loading script not working correctly
- Possible issues:
  - Script executing too early
  - IntersectionObserver not configured correctly
  - Images not properly marked for deferred loading

---

## Top Optimization Opportunities (Mobile)

### 1. Reduce Unused JavaScript
- **Estimated Savings:** 470ms / 24 KiB
- Defer non-critical scripts
- Code-split large modules

### 2. Improve Cache Lifetimes
- **Estimated Savings:** 829 KiB
- Set proper cache headers for static assets
- Leverage browser caching

### 3. Optimize Image Delivery
- **Estimated Savings:** 326 KiB
- Use modern image formats (WebP/AVIF)
- Implement responsive images
- Proper image compression

---

## Recommended Next Steps

### Immediate Fixes (High Priority)

1. **Fix Gallery Deferred Loading**
   - Audit the JavaScript implementation
   - Ensure thumbnails are NOT in initial HTML
   - Use data-src instead of src for deferred images
   - Verify IntersectionObserver triggers AFTER page load

2. **Reduce fetchpriority="high" Usage**
   - Only apply to LCP image (first product image)
   - Remove from other 5 images
   - Let browser prioritize naturally

3. **Defer Gallery JavaScript**
   - Move gallery loading script to end of body
   - Use defer or async attributes
   - Consider lazy-loading the entire gallery module

### Secondary Optimizations

4. **Code Splitting**
   - Split autoplay.js (769ms bootup time)
   - Lazy-load Swiper (141ms) if not immediately needed
   - Defer non-critical client scripts

5. **Image Optimization**
   - Compress product images from Workers API
   - Implement responsive images with srcset
   - Use WebP format for all images

6. **Cache Headers**
   - Set long-lived cache headers for static assets
   - Implement cache-busting for versioned files

---

## Success Metrics to Track

### Target for Next Iteration
- Mobile LCP: <2.5s (currently 5.1s)
- Mobile Performance Score: >90 (currently 78)
- Image Requests: <50 on initial load (currently 103)
- FCP: <1.8s (currently 2.6s)

### What to Preserve
- CLS: 0.00 (perfect, keep skeleton placeholders)
- TBT: 20ms (excellent, maintain)
- Desktop: 99 (excellent, don't regress)

---

## Conclusion

The optimization attempt had **mixed results**:

**Wins:**
- Perfect CLS prevention (0.00 on mobile)
- Excellent desktop performance (99)
- Great TBT scores

**Losses:**
- Mobile LCP regression (+0.8s)
- Increased image requests (+13)
- Lower mobile performance score (-3 points)

**Primary Issue:** The deferred gallery loading is not working correctly, causing all images to load on page load and blocking the main thread, which degrades LCP performance on mobile.

**Recommendation:** Revert the gallery deferred loading changes and implement a simpler approach:
1. Only load first 6 product images in HTML
2. Load remaining products with IntersectionObserver
3. Don't load gallery thumbnails at all until user clicks on a product

