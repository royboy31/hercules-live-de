# Core Web Vitals Summary - hercules-astro.pages.dev

Tested: 2026-01-15

---

## Performance Overview

```
MOBILE SCORES                  DESKTOP SCORES
+---------------------------+  +---------------------------+
| Performance:     93/100  |  | Performance:     99/100  |
| Accessibility:   96/100  |  | Accessibility:   96/100  |
| Best Practices:  96/100  |  | Best Practices:  96/100  |
| SEO:            100/100  |  | SEO:            100/100  |
+---------------------------+  +---------------------------+
```

---

## Core Web Vitals Comparison

| Metric | Mobile | Desktop | Target | Mobile Status | Desktop Status |
|--------|--------|---------|--------|---------------|----------------|
| **LCP** (Largest Contentful Paint) | 2.5s | 0.7s | <2.5s | GREEN (at threshold) | GREEN |
| **CLS** (Cumulative Layout Shift) | 0 | 0.003 | <0.1 | GREEN | GREEN |
| **TBT** (Total Blocking Time) | 0ms | 0ms | <200ms | GREEN | GREEN |
| **FCP** (First Contentful Paint) | 1.4s | 0.4s | <1.8s | GREEN | GREEN |
| **Speed Index** | 5.5s | 1.3s | <3.4s | ORANGE | GREEN |

---

## Key Findings

### STRENGTHS
- Perfect CLS scores (no layout shifts)
- Zero blocking time on both mobile and desktop
- Excellent SEO (100/100)
- Strong accessibility (96/100)
- Fast server response time
- Good use of modern WebP images
- Efficient JavaScript execution

### AREAS FOR IMPROVEMENT

**1. Speed Index (Mobile: 5.5s)**
- Target: <3.4s
- Current: 5.5s (62% above target)
- Impact: Medium priority
- Cause: Progressive loading of slider images, render path optimization needed

**2. LCP (Mobile: 2.5s)**
- Target: <2.5s
- Current: 2.5s (right at threshold)
- Impact: Low priority (technically passing)
- Cause: Large hero slider image (84.4 KB) not preloaded

**3. Unused JavaScript (24.8 KB)**
- File: client.D_Es0amM.js
- Impact: Low priority
- Cause: Astro client bundle contains unused code

---

## Optimization Opportunities

### HIGH PRIORITY (Est. total improvement: +3-4 points)

1. **Preload LCP Image**
   - Add to `<head>`: `<link rel="preload" as="image" href="/images/slider/slide-2-scarves.webp" fetchpriority="high">`
   - Expected: LCP 2.5s → 2.0s
   - Impact: +1-2 points

2. **Optimize Swiper.js Loading**
   - Lazy load slider library with IntersectionObserver
   - Expected: Speed Index improvement
   - Impact: +1 point

3. **Convert footer-bg.jpg to WebP**
   - Current: 71.6 KB JPEG
   - Expected: ~45 KB WebP (26 KB savings)
   - Impact: +1 point

### MEDIUM PRIORITY (Est. improvement: +1-2 points)

4. **Reduce Unused JavaScript**
   - Use client:visible or client:idle instead of client:load
   - Remove 24.8 KB unused code
   - Impact: +1 point

5. **Optimize Slider Images**
   - Generate responsive sizes for slider images
   - Reduce slide-2-scarves.webp size
   - Impact: +0.5 point

### LOW PRIORITY (Marginal improvements)

6. **Reduce Unused CSS**
7. **Optimize Font Loading** (use font-display: swap)
8. **Add Resource Hints** (preconnect, dns-prefetch)

---

## Resource Breakdown

**Total Network Requests:** 70
**Total Transfer Size:** 674.1 KB

### Largest Resources:
1. slide-2-scarves.webp - 84.4 KB (Image)
2. footer-bg.jpg - 71.6 KB (Image) ← Should be WebP
3. client.D_Es0amM.js - 57.5 KB (Script)
4. slide-1-teamwear.webp - 50.4 KB (Image)
5. design-herc-3-optimized.webp - 47.1 KB (Image)

### Main Thread Work: 917ms
- Other: 443ms (48%)
- Script Evaluation: 198ms (22%)
- Style & Layout: 157ms (17%)
- Parse HTML & CSS: 49ms (5%)
- Rendering: 44ms (5%)
- Script Parsing: 26ms (3%)

---

## Expected Results After Optimization

**Current Scores:**
- Mobile: 93/100
- Desktop: 99/100

**After Priority 1 + 2 Optimizations:**
- Mobile: 96-97/100
- Desktop: 99-100/100

**Key Metric Improvements:**
- Mobile LCP: 2.5s → 2.0s
- Mobile Speed Index: 5.5s → 3.8s
- Bundle Size: 674 KB → 625 KB

---

## Next Steps

1. Review detailed report: `core-web-vitals/detailed-reports/hercules-astro-pages-dev.md`
2. Implement high priority optimizations first
3. Re-test after each major change
4. Document results in optimization-log.md

---

## Status: PRODUCTION READY

The site is already performing excellently and provides a great user experience. The recommended optimizations will push the score from "excellent" to "exceptional" but are not critical for launch.
