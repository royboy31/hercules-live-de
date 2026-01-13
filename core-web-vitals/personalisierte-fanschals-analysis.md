# PageSpeed Insights Analysis - Personalisierte Fanschals Collection

**URL:** https://staging.hercules-merchandise.de/collections/personalisierte-fanschals/
**Strategy:** Mobile
**Test Date:** 2026-01-13
**Overall Performance Score:** 86/100

---

## Executive Summary

The page has a **good overall performance score (86/100)**, but there is significant room for improvement, particularly in the **Largest Contentful Paint (LCP)** metric which is currently at **4.1 seconds** (should be under 2.5s).

### Key Issues Identified:
1. **Image delivery needs optimization** - 143 KB potential savings
2. **LCP is too slow** (4.1s) - primarily due to unoptimized images
3. **71 image resources** consuming 1,265.7 KB total transfer size
4. **Images not using modern formats** (WebP/AVIF)
5. **Images not properly sized** for their display dimensions

---

## Core Web Vitals Scores

| Metric | Value | Score | Status | Target |
|--------|-------|-------|--------|--------|
| **First Contentful Paint (FCP)** | 1.7s | 0.93 | ✅ Good | < 1.8s |
| **Largest Contentful Paint (LCP)** | 4.1s | 0.48 | 🔴 Poor | < 2.5s |
| **Total Blocking Time (TBT)** | 0ms | 1.00 | ✅ Excellent | < 200ms |
| **Cumulative Layout Shift (CLS)** | 0.005 | 1.00 | ✅ Excellent | < 0.1 |
| **Speed Index** | 1.7s | 1.00 | ✅ Excellent | < 3.4s |
| **Time to Interactive (TTI)** | 4.1s | 0.87 | 🟡 Needs Work | < 3.8s |

---

## Critical Issue: Largest Contentful Paint (LCP)

**Current:** 4.1 seconds
**Target:** < 2.5 seconds
**Gap:** 1.6+ seconds too slow

The LCP is the most critical metric to optimize. This metric measures when the largest content element becomes visible to the user.

---

## Image-Related Issues (Detailed Findings)

### 1. Image Delivery Optimization
**Potential Savings:** 143 KB
**Affected Images:** 6 images

#### Image #1 - Main Product Image (LCP Candidate)
```
URL: https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-schal-aus-recycelter-baumwolle
Alt: "Personalisierter Schal aus recycelter Baumwolle"
Loading: eager
Fetch Priority: auto
```

**Current Size:** 116,188 bytes (113.5 KB)
**Wasted Bytes:** 56,188 bytes (54.9 KB) - **48% savings possible**

**Issue:** Using a modern image format (WebP, AVIF) or increasing the image compression could improve this image's download size.

**HTML:**
```html
<img src="https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-schal-aus-recycelter-baumwolle"
     alt="Personalisierter Schal aus recycelter Baumwolle"
     loading="eager"
     fetchpriority="auto"
     class="kd-main-img"
     width="361"
     height="361">
```

---

#### Image #2 - Thumbnail
```
URL: https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-fussballschal/2?size=thumb
Loading: lazy
Displayed Size: 98x98 pixels
Actual Size: 300x300 pixels
```

**Current Size:** 29,016 bytes (28.3 KB)
**Wasted Bytes:** 27,415 bytes (26.8 KB) - **94% waste**

**Issues:**
1. **Compression:** Could save 14,016 bytes (13.7 KB) with better compression
2. **Oversized:** Image is 300x300 but displayed at 98x98 - could save 25,920 bytes (25.3 KB) by serving properly sized image

**HTML:**
```html
<img src="https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-fussballschal/2?size=thumb"
     alt=""
     loading="lazy"
     class="kd-thumb"
     width="83"
     height="83">
```

---

#### Image #3 - Thumbnail
```
URL: https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-fussballschal?size=thumb
Displayed Size: 98x98 pixels
Actual Size: 300x300 pixels
```

**Current Size:** 20,692 bytes (20.2 KB)
**Wasted Bytes:** 19,091 bytes (18.6 KB) - **92% waste**

**Issues:**
1. **Compression:** Could save 5,692 bytes (5.6 KB)
2. **Oversized:** 300x300 served for 98x98 display - could save 18,484 bytes (18.1 KB)

---

#### Image #4 - Thumbnail
```
URL: https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-fussballschal/1?size=thumb
Displayed Size: 98x98 pixels
Actual Size: 300x300 pixels
```

**Current Size:** 18,974 bytes (18.5 KB)
**Wasted Bytes:** 17,373 bytes (17.0 KB) - **92% waste**

**Issue:** Image is 300x300 but displayed at 98x98

---

#### Image #5 - Main Product Image
```
URL: https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-fussballschal
Alt: "Personalisierter HD-Fußballschal"
Loading: eager
Fetch Priority: high
```

**Current Size:** 73,416 bytes (71.7 KB)
**Wasted Bytes:** 13,416 bytes (13.1 KB) - **18% savings possible**

**Issue:** Using a modern image format (WebP, AVIF) or increasing compression could improve download size

**HTML:**
```html
<img src="https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-fussballschal"
     alt="Personalisierter HD-Fußballschal"
     loading="eager"
     fetchpriority="high"
     class="kd-main-img"
     width="361"
     height="361">
```

---

#### Image #6 - Thumbnail
```
URL: https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-fussballschal/3?size=thumb
Displayed Size: 98x98 pixels
Actual Size: 300x300 pixels
```

**Current Size:** 14,348 bytes (14.0 KB)
**Wasted Bytes:** 12,817 bytes (12.5 KB) - **89% waste**

**Issue:** Oversized - 300x300 served for 98x98 display

---

### 2. Top 10 Largest Resources (All Images)

| # | Type | Size | URL |
|---|------|------|-----|
| 1 | Image | 117.1 KB | ...personalisierter-jacquard-schal/3?size=thumb |
| 2 | Image | 114.1 KB | ...personalisierter-schal-aus-recycelter-baumwolle |
| 3 | Image | 101.4 KB | ...personalisierter-business-schal/2?size=thumb |
| 4 | Image | 75.6 KB | ...individuell-bedruckter-fanschal |
| 5 | Image | 72.8 KB | ...individuell-bedruckter-fanschal/3?size=thumb |
| 6 | Image | 72.3 KB | ...personalisierter-fussballschal |
| 7 | Image | 70.0 KB | ...personalisierter-business-schal |
| 8 | Image | 63.2 KB | ...individuell-gestrickter-schlauchschal |
| 9 | Image | 62.0 KB | ...personalisierter-jacquard-schal |
| 10 | Image | 55.3 KB | ...individuell-bedruckter-fanschal/2?size=thumb |

---

### 3. Resource Summary

| Resource Type | Count | Transfer Size |
|---------------|-------|---------------|
| **Images** | 71 | 1,265.7 KB (86.9% of total) |
| Scripts | 12 | 86.0 KB |
| Fonts | 3 | 49.7 KB |
| Document | 1 | 38.0 KB |
| Stylesheets | 3 | 15.7 KB |
| Other | 1 | 1.8 KB |
| **Total** | **91** | **1,456.9 KB** |

Third-party resources: 30 requests, 1,172.5 KB

---

## Other Performance Issues

### Reduce Unused JavaScript
**Potential Savings:** 150ms, 23 KB

**Affected File:**
```
https://staging.hercules-merchandise.de/_astro/client.D_Es0amM.js
Total Size: 54,685 bytes (53.4 KB)
Wasted: 23,585 bytes (23.0 KB) - 43% unused
```

---

## Render-Blocking Resources

✅ **No render-blocking resources detected** - This is excellent!

---

## Specific Recommendations

### Priority 1: Optimize LCP Image (CRITICAL)

The main product images are likely LCP candidates. Focus on these first:

1. **Convert to WebP or AVIF format**
   - Target: `personalisierter-schal-aus-recycelter-baumwolle` (113.5 KB → ~58 KB)
   - Expected savings: ~55 KB, significant LCP improvement

2. **Implement image preloading for LCP image**
   ```html
   <link rel="preload" as="image"
         href="https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-schal-aus-recycelter-baumwolle"
         fetchpriority="high">
   ```

3. **Ensure LCP image has `fetchpriority="high"`** (currently set to "auto")
   ```html
   <img src="..."
        loading="eager"
        fetchpriority="high">  <!-- Change from auto to high -->
   ```

---

### Priority 2: Fix Thumbnail Image Sizing (HIGH IMPACT)

All thumbnail images are **3x larger than necessary**:
- Current: 300x300 pixels served
- Displayed: 98x98 pixels
- Waste: ~92% per thumbnail

**Solution:**
Create properly sized thumbnail variants:
```
?size=thumb → serve 100x100 images (not 300x300)
?size=small → serve 200x200 images
?size=medium → serve 400x400 images
?size=large → serve 800x800 images
```

**Expected Impact:** Save ~100+ KB across all thumbnails

---

### Priority 3: Implement Modern Image Formats (HIGH IMPACT)

Convert all images to WebP with JPEG fallback:

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="...">
</picture>
```

Or use AVIF for even better compression:

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="...">
</picture>
```

**Expected Savings:** 30-50% file size reduction across all images

---

### Priority 4: Optimize Image CDN/Worker

The images are served from:
```
https://hercules-product-sync.gilles-86d.workers.dev/image/...
```

**Recommendations:**

1. **Implement automatic format negotiation** based on `Accept` header
   - Serve WebP to browsers that support it
   - Serve AVIF to Chrome/Edge
   - Fallback to JPEG for others

2. **Implement responsive image sizing**
   - Honor the `?size=thumb` parameter properly (serve 100x100, not 300x300)
   - Add quality parameter: `?size=thumb&quality=85`
   - Add format parameter: `?size=thumb&format=webp`

3. **Enable Cloudflare Image Optimization** (if using Cloudflare)
   - Polish feature for automatic format conversion
   - Image resizing on-the-fly

4. **Add proper cache headers**
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

---

### Priority 5: Optimize JavaScript Bundle

**File:** `_astro/client.D_Es0amM.js`
**Issue:** 43% unused code (23 KB wasted)

**Solutions:**
1. Code split to load only what's needed
2. Lazy load non-critical components
3. Tree-shake unused imports
4. Consider dynamic imports for route-specific code

---

## Implementation Action Plan

### Phase 1: Quick Wins (Target: +8-10 points)

1. **Fix thumbnail sizing** (1-2 hours)
   - Update image worker to serve 100x100 for `?size=thumb`
   - Test all thumbnail displays

2. **Preload LCP image** (15 minutes)
   - Add `<link rel="preload">` for main product image
   - Change `fetchpriority="auto"` to `fetchpriority="high"`

3. **Add WebP support** (2-4 hours)
   - Update image worker to serve WebP by default
   - Test browser compatibility

**Expected Result:** Performance score 86 → 94-96

---

### Phase 2: Deep Optimization (Target: 96-99 points)

4. **Implement AVIF format** (1-2 hours)
   - Add AVIF generation to image worker
   - Use `<picture>` element with format fallbacks

5. **Optimize JavaScript bundle** (4-6 hours)
   - Analyze bundle composition
   - Implement code splitting
   - Lazy load non-critical code

6. **Add image CDN optimization** (2-4 hours)
   - Enable automatic format negotiation
   - Implement quality optimization
   - Add device-pixel-ratio support

**Expected Result:** Performance score 96-99, LCP < 2.5s

---

## Code Examples

### Example 1: Preload LCP Image
```html
<head>
  <!-- Preload the LCP image -->
  <link rel="preload"
        as="image"
        href="https://hercules-product-sync.gilles-86d.workers.dev/image/personalisierter-schal-aus-recycelter-baumwolle?format=webp&quality=85"
        fetchpriority="high">
</head>
```

### Example 2: Responsive Images with Modern Formats
```html
<picture>
  <!-- AVIF for modern browsers -->
  <source
    srcset="
      image-100.avif 100w,
      image-200.avif 200w,
      image-400.avif 400w
    "
    sizes="(max-width: 768px) 100px, 200px"
    type="image/avif">

  <!-- WebP fallback -->
  <source
    srcset="
      image-100.webp 100w,
      image-200.webp 200w,
      image-400.webp 400w
    "
    sizes="(max-width: 768px) 100px, 200px"
    type="image/webp">

  <!-- JPEG fallback -->
  <img
    src="image-200.jpg"
    srcset="
      image-100.jpg 100w,
      image-200.jpg 200w,
      image-400.jpg 400w
    "
    sizes="(max-width: 768px) 100px, 200px"
    alt="Product image"
    loading="lazy"
    width="200"
    height="200">
</picture>
```

### Example 3: Cloudflare Worker for Image Optimization
```javascript
// workers/image-optimizer.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const imageUrl = url.pathname.replace('/image/', '');

    // Get query parameters
    const size = url.searchParams.get('size') || 'medium';
    const format = url.searchParams.get('format') || 'auto';
    const quality = url.searchParams.get('quality') || 85;

    // Define size mappings
    const sizes = {
      thumb: 100,
      small: 200,
      medium: 400,
      large: 800
    };

    const width = sizes[size] || 400;

    // Fetch original image
    const response = await fetch(`https://origin.example.com/${imageUrl}`);

    // Optimize with Cloudflare Image Resizing
    return fetch(response.url, {
      cf: {
        image: {
          width: width,
          quality: quality,
          format: format === 'auto' ? 'auto' : format,
          fit: 'cover'
        }
      }
    });
  }
}
```

---

## Expected Impact Summary

| Optimization | Time Investment | Performance Gain | LCP Improvement |
|--------------|----------------|------------------|-----------------|
| Fix thumbnail sizing | 1-2 hours | +3-4 points | 100-200ms |
| Preload LCP image | 15 minutes | +2-3 points | 200-400ms |
| WebP conversion | 2-4 hours | +3-5 points | 300-500ms |
| AVIF support | 1-2 hours | +1-2 points | 100-200ms |
| JS optimization | 4-6 hours | +2-3 points | 50-100ms |
| **Total** | **9-15 hours** | **+11-17 points** | **750-1400ms** |

**Target Performance Score:** 97-100/100
**Target LCP:** 2.0-2.6 seconds (currently 4.1s)

---

## Next Steps

1. Review this report with the development team
2. Prioritize Phase 1 quick wins
3. Implement thumbnail sizing fix first (biggest impact/effort ratio)
4. Test changes in staging environment
5. Re-run PageSpeed Insights to measure improvement
6. Proceed to Phase 2 optimizations

---

## Testing Checklist

After implementing optimizations, verify:

- [ ] All thumbnails display correctly at 98x98 pixels
- [ ] Main product images load with WebP format
- [ ] LCP image is preloaded in `<head>`
- [ ] `fetchpriority="high"` is set on LCP image
- [ ] No broken images on any browser
- [ ] Page functions correctly on mobile devices
- [ ] Images have proper cache headers
- [ ] PageSpeed Insights score improved
- [ ] LCP time reduced to < 2.5s

---

**Report Generated:** 2026-01-13
**Analyst:** Core Web Vitals Optimization Agent
**Tool:** PageSpeed Insights API v5
