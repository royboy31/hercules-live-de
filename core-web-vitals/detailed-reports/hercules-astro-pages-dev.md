# Core Web Vitals Audit - hercules-astro.pages.dev

**Tested:** 2026-01-15
**URL:** https://hercules-astro.pages.dev

---

## Executive Summary

Overall, this Astro site performs **excellently** on both mobile and desktop. The site achieves a 93/100 performance score on mobile and an impressive 99/100 on desktop. All Core Web Vitals are in the green zone.

### Status: OPTIMIZED

| Category | Mobile | Desktop | Status |
|----------|--------|---------|--------|
| Performance | 93 | 99 | GREEN |
| Accessibility | 96 | 96 | GREEN |
| Best Practices | 96 | 96 | GREEN |
| SEO | 100 | 100 | GREEN |

---

## Core Web Vitals Analysis

### 1. Overall Performance Scores

**Mobile: 93/100** - Excellent
**Desktop: 99/100** - Excellent

Both scores are well above the 90+ threshold for optimal performance.

---

### 2. LCP (Largest Contentful Paint)

| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| **LCP** | **2.5s** | **0.7s** | <2.5s | GREEN (Mobile at threshold) |

**Analysis:**
- **Mobile LCP:** 2.5s is right at the boundary of "good" performance (threshold is 2.5s)
- **Desktop LCP:** 0.7s is excellent
- **LCP Score:** 0.9/1.0 (90%) - Very good

**LCP Element:**
The PageSpeed data didn't capture the specific element details, but based on the resource breakdown, the LCP element is likely one of the hero slider images:
- `slide-2-scarves.webp` (84.4 KB) - Largest image
- `slide-1-teamwear.webp` (50.4 KB)
- `slide-3-slides.webp` (26.3 KB)

**Recommendation to improve Mobile LCP:**
While technically in the green zone, mobile LCP is at the threshold. To improve:
1. **Preload the LCP image** - Add `<link rel="preload" as="image" href="/images/slider/slide-2-scarves.webp">` to the document head
2. **Optimize the largest slider image** - Compress slide-2-scarves.webp further (currently 84.4 KB)
3. **Use priority hint** - Add `fetchpriority="high"` to the first slider image

---

### 3. CLS (Cumulative Layout Shift)

| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| **CLS** | **0** | **0.003** | <0.1 | GREEN |

**Analysis:**
- **Mobile CLS:** 0 - Perfect! No layout shifts detected
- **Desktop CLS:** 0.003 - Excellent, well below threshold
- **Layout Shift Sources:** None identified

**Status:** PERFECT - No action needed

---

### 4. TBT (Total Blocking Time)

| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| **TBT** | **0ms** | **0ms** | <200ms | GREEN |

**Analysis:**
- Both mobile and desktop show 0ms blocking time
- No long tasks blocking the main thread
- JavaScript execution is well optimized

**Status:** PERFECT - No action needed

---

### 5. FCP (First Contentful Paint)

| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| **FCP** | **1.4s** | **0.4s** | <1.8s | GREEN |

**Analysis:**
- **Mobile FCP:** 1.4s - Good, well under threshold
- **Desktop FCP:** 0.4s - Excellent
- Content appears quickly on both devices

**Status:** GOOD - No critical issues

---

### 6. Speed Index

| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| **Speed Index** | **5.5s** | **1.3s** | <3.4s | ORANGE |

**Analysis:**
- **Mobile Speed Index:** 5.5s - This is the main area for improvement
- **Desktop Speed Index:** 1.3s - Excellent
- Speed Index measures how quickly content is visually displayed

**Why is Speed Index higher?**
While individual metrics are good, the Speed Index of 5.5s indicates that visual completeness takes longer on mobile. This is likely due to:
1. Progressive loading of slider images
2. Above-the-fold images not being prioritized
3. Potential render delays from style calculations

**Recommendations to improve Speed Index:**
1. **Optimize critical rendering path** - Inline critical CSS for above-the-fold content
2. **Preload hero images** - Ensure the first slider image loads immediately
3. **Defer non-critical resources** - Lazy load below-the-fold content
4. **Optimize font loading** - Use `font-display: swap` or preload critical fonts

---

## Resource Analysis

### Total Resources
- **Total Requests:** 70
- **Total Transfer Size:** 674.1 KB

### Largest Resources

| Type | Resource | Size | Notes |
|------|----------|------|-------|
| Image | slide-2-scarves.webp | 84.4 KB | Likely LCP element |
| Image | footer-bg.jpg | 71.6 KB | Can be optimized/converted to WebP |
| Script | client.D_Es0amM.js | 57.5 KB | Astro client bundle |
| Image | slide-1-teamwear.webp | 50.4 KB | Slider image |
| Image | design-herc-3-optimized.webp | 47.1 KB | Already optimized |
| Document | HTML | 39.2 KB | Main document |
| Image | about-hercules.webp | 27.4 KB | Good size |
| Font | jost-latin.woff2 | 26.7 KB | Already WOFF2 |
| Image | slide-3-slides.webp | 26.3 KB | Slider image |
| Script | swiper.r28p4gtm.js | 24.8 KB | Slider library |

---

## Main Thread Work Breakdown

Total main thread time: ~917ms

| Category | Time | Percentage |
|----------|------|------------|
| Other | 443ms | 48% |
| Script Evaluation | 198ms | 22% |
| Style & Layout | 157ms | 17% |
| Parse HTML & CSS | 49ms | 5% |
| Rendering | 44ms | 5% |
| Script Parsing | 26ms | 3% |

**Analysis:**
- Main thread work is efficient and well-distributed
- No excessive blocking from any single category
- JavaScript evaluation (198ms) is reasonable for the functionality provided

---

## JavaScript Bootup Time

Top scripts by total time:

1. **Unattributable:** 273ms (mostly browser overhead)
2. **swiper.r28p4gtm.js:** 261ms (50ms scripting + 4ms parse)
3. **Main document:** 206ms (27ms scripting + 6ms parse)
4. **client.D_Es0amM.js:** 112ms (80ms scripting + 11ms parse)

**Total bootup time:** ~852ms (reasonable)

---

## Optimization Opportunities

### Priority 1: High Impact

#### 1.1 Reduce Unused JavaScript (Est. savings: 0.15s)

**Current Issue:**
- `client.D_Es0amM.js` contains 24.8 KB of unused JavaScript

**Recommendation:**
```astro
// In your Astro config, ensure tree-shaking is enabled
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
});

// Use client:load directives only where needed
// Consider using client:visible or client:idle for non-critical components
<Component client:visible /> // Load when visible
<Component client:idle />    // Load when browser idle
```

#### 1.2 Convert footer-bg.jpg to WebP

**Current Issue:**
- `footer-bg.jpg` is 71.6 KB and uses legacy JPEG format

**Recommendation:**
```bash
# Convert to WebP with quality 80
cwebp -q 80 footer-bg.jpg -o footer-bg.webp

# Or use Astro's Image component which does this automatically
<Image src="/images/design/footer-bg.jpg" alt="..." format="webp" />
```

Expected savings: ~20-30 KB

#### 1.3 Preload LCP Image

**Recommendation:**
Add to your Astro layout's `<head>`:

```astro
<link
  rel="preload"
  as="image"
  href="/images/slider/slide-2-scarves.webp"
  fetchpriority="high"
/>
```

This will improve mobile LCP from 2.5s to potentially <2.0s.

---

### Priority 2: Medium Impact

#### 2.1 Optimize Swiper Loading

**Current Issue:**
Swiper.js (24.8 KB) loads immediately but may not be needed for initial render.

**Recommendation:**
```astro
---
// Load Swiper dynamically only when needed
const Swiper = import('swiper');
---

<div class="swiper-container" data-lazy-swiper>
  <!-- Swiper content -->
</div>

<script>
  // Initialize Swiper only when it comes into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        const { default: Swiper } = await import('swiper');
        new Swiper(entry.target, {
          // your config
        });
        observer.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll('[data-lazy-swiper]').forEach(el => {
    observer.observe(el);
  });
</script>
```

#### 2.2 Reduce Unused CSS (Score: 0.5/1.0)

**Recommendation:**
1. Use Astro's scoped styles to eliminate unused CSS automatically
2. Audit third-party CSS (if any) and remove unused rules
3. Consider using PurgeCSS in your build pipeline

```javascript
// Add to astro.config.mjs if using Tailwind
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    tailwind({
      config: {
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      }
    })
  ]
});
```

#### 2.3 Optimize Slider Images Further

**Current sizes:**
- slide-2-scarves.webp: 84.4 KB
- slide-1-teamwear.webp: 50.4 KB
- slide-3-slides.webp: 26.3 KB

**Recommendation:**
Use Astro's Image optimization with responsive sizes:

```astro
---
import { Image } from 'astro:assets';
import slide2 from '../images/slider/slide-2-scarves.webp';
---

<Image
  src={slide2}
  alt="Scarves collection"
  widths={[400, 800, 1200]}
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  format="webp"
  quality={75}
/>
```

This will generate multiple sizes and let the browser choose the optimal one.

---

### Priority 3: Low Impact (Nice to Have)

#### 3.1 Optimize Font Loading

Add to your layout:

```astro
<link
  rel="preload"
  href="/fonts/jost-latin.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<style>
  @font-face {
    font-family: 'Jost';
    src: url('/fonts/jost-latin.woff2') format('woff2');
    font-display: swap; /* Show fallback font immediately */
    font-weight: 100 900;
  }
</style>
```

#### 3.2 Add Resource Hints

```astro
<!-- If you're loading resources from external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

---

## Action Plan for 95+ Mobile Score

To push the mobile score from 93 to 95+:

1. **Preload LCP image** (Highest priority)
   - Add `<link rel="preload">` for slide-2-scarves.webp
   - Expected improvement: LCP 2.5s → 2.0s

2. **Reduce unused JavaScript**
   - Use more specific client directives (client:visible, client:idle)
   - Expected improvement: +1-2 points

3. **Convert footer-bg.jpg to WebP**
   - Saves ~25 KB
   - Expected improvement: +1 point

4. **Optimize Swiper loading**
   - Lazy load slider library
   - Expected improvement: Speed Index improvement

---

## Conclusion

Your Astro site is already performing **exceptionally well**:

**Strengths:**
- Perfect CLS (no layout shifts)
- Zero blocking time
- Fast server response
- Good use of modern image formats (WebP)
- Efficient JavaScript execution
- Excellent SEO and Accessibility scores

**Minor Improvements:**
- Mobile LCP is at the 2.5s threshold (could be <2.0s with preload)
- Speed Index on mobile is 5.5s (could be <4.0s with optimizations)
- Small amount of unused JavaScript can be eliminated

**Bottom Line:**
The site is production-ready and user experience is excellent. The recommended optimizations are "nice to have" improvements that will push the score from 93 to 95+, but the current performance is already strong.

**Estimated Score After Optimizations:**
- Mobile: 93 → 96-97
- Desktop: 99 (already optimal)

---

## Files Modified/To Modify

Based on the recommendations above, you'll primarily work with:

1. **Main layout file** (likely `src/layouts/Layout.astro`)
   - Add preload for LCP image
   - Add font preload
   - Optimize font-display

2. **Slider component** (wherever Swiper is initialized)
   - Implement lazy loading for Swiper.js
   - Add fetchpriority="high" to first image

3. **Image assets**
   - `/images/design/footer-bg.jpg` → Convert to WebP
   - Slider images: Apply responsive image optimization

4. **astro.config.mjs**
   - Verify Vite build optimizations
   - Ensure tree-shaking is enabled

5. **Client components**
   - Review client directive usage
   - Change `client:load` to `client:visible` or `client:idle` where appropriate

---

**Next Steps:**
Let me know which optimizations you'd like to implement first, and I can help you make the specific code changes to your Astro project!
