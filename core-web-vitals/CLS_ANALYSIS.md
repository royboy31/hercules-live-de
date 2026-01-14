# Cumulative Layout Shift (CLS) Analysis
**Site:** https://hercules-astro.pages.dev  
**Date:** 2026-01-14  
**Current CLS Score:** 0.000 (Perfect!)

## Executive Summary

✅ **Result:** ZERO layout shifts detected  
✅ **Status:** All CLS prevention measures properly implemented  
✅ **Action Required:** None - site is fully optimized

---

## Current PageSpeed Insights Results

| Metric | Mobile | Desktop | Status |
|--------|--------|---------|--------|
| **Performance Score** | 80 | 96 | ✅ Good |
| **CLS (Cumulative Layout Shift)** | **0.000** | **0.000** | ✅ Perfect |
| **LCP (Largest Contentful Paint)** | 4.4s | 1.2s | ⚠️ Acceptable |
| **FCP (First Contentful Paint)** | 2.6s | 0.8s | ✅ Good |
| **TBT (Total Blocking Time)** | 0ms | 0ms | ✅ Perfect |
| **Speed Index** | 4.9s | 1.5s | ✅ Good |

---

## CLS Prevention Measures Already Implemented

### 1. Font Loading Optimization ✅

**BaseLayout.astro (Lines 207-215):**
- ✅ `font-display: optional` prevents FOIT/FOUT layout shifts
- ✅ Font preload with `fetchpriority="high"`
- ✅ Async loading with media print trick
- ✅ Preconnect to fonts.googleapis.com

**global.css (Lines 6-22):**
- ✅ Font fallback definitions with metric adjustments
- ✅ Jost Fallback: `size-adjust: 100%, ascent-override: 92%, descent-override: 22%`
- ✅ Roboto Fallback: `size-adjust: 100%, ascent-override: 92%, descent-override: 24%`
- ✅ This ensures fallback fonts match web font metrics exactly

**Why this prevents CLS:**
- `font-display: optional` = no font swap, just shows fallback if webfont isn't ready
- Metric-adjusted fallbacks = no text reflow when webfont loads
- Result: **Zero layout shift from font loading**

---

### 2. Image Dimension Attributes ✅

**All images have explicit width/height:**

**Slider Images (Slider.astro, Lines 46-56):**
```astro
<img
  src={slide.image}
  width="1280"
  height="550"
  fetchpriority={slide.id === 1 ? "high" : "low"}
  loading={slide.id === 1 ? "eager" : "lazy"}
/>
```

**About Image (HerculesMerchandise.astro, Lines 31-37):**
```astro
<img
  src="/images/about-hercules.webp"
  width="600"
  height="400"
  loading="lazy"
/>
```
- ✅ Also has `aspect-ratio: 600 / 400` in CSS (line 155)

**Product Images (TopPerformer.astro, Lines 38-42):**
```astro
<img
  src={product.image}
  width="225"
  height="225"
  loading="lazy"
/>
```

**Why this prevents CLS:**
- Browser reserves exact space before image loads
- No layout jump when image appears
- Result: **Zero layout shift from images**

---

### 3. Slider Reserved Space ✅

**Slider.astro (Lines 99-154):**

```css
.hero-swiper {
  height: 550px;  /* Fixed height */
}

.slide-contents {
  width: 1020px;
  min-height: 200px;  /* Reserve space for content */
}

.slide-heading {
  min-height: 1.05em;  /* Reserve space for heading text */
}
```

**Why this prevents CLS:**
- Fixed slider height = no shift when slides load
- Min-height on content = text doesn't cause reflow
- Result: **Zero layout shift from slider**

---

### 4. Main Element Flexibility ✅

**BaseLayout.astro (Line 280):**
```html
<main class="flex-1">
  <slot />
</main>
```

**Body structure (Lines 275-284):**
```html
<body class="min-h-screen flex flex-col">
  <TopBar />
  <Header />
  <StickyHeader />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</body>
```

**Why this prevents CLS:**
- `flex-1` allows main to grow/shrink naturally
- `min-h-screen` ensures body always fills viewport
- Footer stays at bottom without absolute positioning
- Result: **No layout shift from dynamic content height**

---

### 5. Content-Visibility Optimization ✅

**global.css (Lines 257-265):**
```css
.top-performer-section,
.why-choose-section,
.design-service-section,
.hercules-merchandise-section,
.trust-logos-section,
.customer-reviews-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 400px;
}
```

**Why this prevents CLS:**
- `contain-intrinsic-size` reserves estimated space for off-screen sections
- Browser knows approximate height before rendering
- Reduces reflows when sections come into view
- Result: **Minimal shift when lazy-rendering sections**

---

### 6. Responsive Image Loading ✅

**Slider with srcset (Slider.astro, Lines 46-56):**
```astro
<img
  srcset={`${slide.imageMobileSm} 480w, ${slide.imageMobile} 640w, ${slide.image} 1280w`}
  sizes="(max-width: 480px) 480px, (max-width: 768px) 640px, 1280px"
  width="1280"
  height="550"
  fetchpriority={slide.id === 1 ? "high" : "low"}
/>
```

**Why this prevents CLS:**
- Correct image size loaded immediately based on viewport
- No image swap = no layout shift
- LCP image (first slide) has `fetchpriority="high"` and `loading="eager"`
- Result: **Fast LCP with zero shift**

---

### 7. LCP Image Preload ✅

**BaseLayout.astro (Lines 196-199):**
```html
<link rel="preload" as="image" href="/images/slider/slide-1-teamwear-mobile-sm.webp" media="(max-width: 480px)" fetchpriority="high">
<link rel="preload" as="image" href="/images/slider/slide-1-teamwear-mobile.webp" media="(min-width: 481px) and (max-width: 768px)" fetchpriority="high">
<link rel="preload" as="image" href="/images/slider/slide-1-teamwear.webp" media="(min-width: 769px)" fetchpriority="high">
```

**Why this prevents CLS:**
- LCP image starts loading ASAP (in <head>)
- Responsive preload = correct size for viewport
- Faster render = less chance of shift
- Result: **LCP at 4.4s mobile, 1.2s desktop**

---

### 8. Deferred JavaScript Initialization ✅

**Slider.astro (Lines 389-397):**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initSwiper, { timeout: 2000 });
  } else {
    setTimeout(initSwiper, 100);
  }
});
```

**TopPerformer.astro (Lines 311-317):**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initSwiper, { timeout: 2000 });
  } else {
    setTimeout(initSwiper, 100);
  }
});
```

**Why this prevents CLS:**
- Swiper doesn't block initial render
- HTML structure renders first with proper sizing
- JavaScript initializes after main thread is idle
- No shift when Swiper activates
- Result: **Zero shift from JavaScript initialization**

---

## Elements Analyzed (Your Specific Concerns)

### ✅ 1. `<main class="flex-1">` Element
**Status:** Properly configured  
**Implementation:** Flexbox with `flex-1` allows natural content growth  
**CLS Impact:** None - layout is fluid and prevents shifts

### ✅ 2. `<img src="/images/about-hercules.webp">` - About Image
**Status:** Fully optimized  
**Dimensions:** `width="600" height="400"` explicit  
**Aspect Ratio:** `aspect-ratio: 600 / 400` in CSS  
**CLS Impact:** None - space reserved before load

### ✅ 3. `<h2 class="slide-heading">` - Slider Heading
**Status:** Reserved space  
**Implementation:** `min-height: 1.05em` in CSS  
**Parent Container:** `min-height: 200px` on `.slide-contents`  
**CLS Impact:** None - space reserved for text

### ✅ 4. Product Images in TopPerformer Section
**Status:** All have dimensions  
**Implementation:** `width="225" height="225"` explicit  
**Container:** `aspect-ratio: 1 / 1` in CSS  
**CLS Impact:** None - square aspect ratio enforced

### ✅ 5. Web Fonts Causing Text Reflow
**Status:** Completely prevented  
**Implementation:**
- `font-display: optional` (no swap)
- Metric-adjusted fallback fonts
- Preload critical fonts
**CLS Impact:** None - fallbacks match web font metrics exactly

---

## Verification Test Results

**Test Date:** 2026-01-14  
**Test URL:** https://hercules-astro.pages.dev  
**Test Method:** Google PageSpeed Insights API

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fhercules-astro.pages.dev&key=AIzaSyCEBwlUlOrIxXcRLHCiUVInsAsDTunskC4&category=performance&strategy=mobile"
```

**Results:**
- ✅ CLS: 0.000 (Perfect score)
- ✅ No layout-shift-elements detected
- ✅ All images properly sized (score: 1.0)
- ✅ No font-display issues

---

## Best Practices Already Followed

1. ✅ **Always specify width/height on images**
2. ✅ **Use aspect-ratio CSS for responsive images**
3. ✅ **Reserve space for dynamic content with min-height**
4. ✅ **Use font-display: optional to prevent text reflow**
5. ✅ **Preload critical fonts and images**
6. ✅ **Use content-visibility for below-fold sections**
7. ✅ **Defer non-critical JavaScript**
8. ✅ **Use metric-adjusted font fallbacks**

---

## Recommendations

### Current Status: NO CHANGES NEEDED ✅

Your site already achieves **perfect CLS score of 0.000**. All elements mentioned in your requirements are properly sized and configured.

### Optional Future Enhancements:

1. **LCP Optimization (Mobile: 4.4s):**
   - Already optimized with responsive preload
   - Limited by simulated 3G network (1.6 Mbps)
   - Desktop LCP is excellent (1.2s)

2. **Monitor CLS on New Pages:**
   - Use this as template for all new pages
   - Always add width/height to images
   - Continue using font-display: optional

3. **Consider Critical CSS Inlining:**
   - Current setup loads fonts async
   - Could inline critical CSS for even faster FCP

---

## Conclusion

**Your site has ZERO layout shifts.** All the elements you mentioned are properly configured:

✅ Main element - uses flex-1 for natural content flow  
✅ About image - has width/height and aspect-ratio  
✅ Slider heading - has min-height reservation  
✅ Product images - all have explicit dimensions  
✅ Web fonts - using font-display: optional with metric-adjusted fallbacks  

**No changes are needed.** The current implementation represents best practices for CLS prevention.

---

## Technical Reference

**Files with CLS Prevention:**
- `/src/layouts/BaseLayout.astro` - Font loading, preload
- `/src/styles/global.css` - Font fallbacks, content-visibility
- `/src/components/Slider.astro` - Fixed height, min-height, deferred init
- `/src/components/HerculesMerchandise.astro` - Image dimensions
- `/src/components/TopPerformer.astro` - Image dimensions, deferred init

**Key CSS Properties Used:**
- `width` + `height` attributes on all `<img>` tags
- `aspect-ratio` for responsive images
- `min-height` for dynamic content areas
- `font-display: optional` for web fonts
- `content-visibility: auto` for below-fold sections
- `contain-intrinsic-size` for estimated heights

**Key HTML Attributes Used:**
- `width="..."` and `height="..."` on all images
- `loading="eager"` for LCP image, `loading="lazy"` for others
- `fetchpriority="high"` for LCP image
- `srcset` and `sizes` for responsive images

**Key JavaScript Techniques:**
- `requestIdleCallback` for deferred Swiper initialization
- DOMContentLoaded event for non-blocking execution

---

**Test Command for Future Verification:**
```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fhercules-astro.pages.dev&key=AIzaSyCEBwlUlOrIxXcRLHCiUVInsAsDTunskC4&category=performance&strategy=mobile" | python3 -c "import json, sys; d=json.load(sys.stdin); print(f\"CLS: {d['lighthouseResult']['audits']['cumulative-layout-shift']['numericValue']:.3f}\")"
```

Expected output: `CLS: 0.000`
