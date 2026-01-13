# PageSpeed Insights Analysis - JavaScript-Optimized Collection Page

**URL:** https://280d42c2.hercules-astro.pages.dev/collections/personalisierte-sportbekleidung/
**Test Date:** 2026-01-12
**Version:** JavaScript-optimized (IntersectionObserver + Dynamic Imports)

## Executive Summary

The JavaScript optimizations using IntersectionObserver and dynamic imports show **mixed results**:
- **Desktop Performance: EXCELLENT (99/100)** - Outstanding desktop performance
- **Mobile Performance: NEEDS IMPROVEMENT (78/100)** - Slight regression from original (81)
- **JavaScript Execution: SIGNIFICANTLY IMPROVED** - Down from 930ms to 100ms

## Performance Scores

### Mobile
| Metric | Score | Status |
|--------|-------|--------|
| Performance | **78** | Needs Work |
| Accessibility | - | Not tested |
| Best Practices | - | Not tested |
| SEO | - | Not tested |

### Desktop
| Metric | Score | Status |
|--------|-------|--------|
| Performance | **99** | Excellent |
| Accessibility | - | Not tested |
| Best Practices | - | Not tested |
| SEO | - | Not tested |

## Core Web Vitals - Mobile

| Metric | Value | Status | Previous | Change |
|--------|-------|--------|----------|---------|
| **First Contentful Paint (FCP)** | 2.6s | Poor | - | - |
| **Largest Contentful Paint (LCP)** | 5.0s | Poor | 4.3s | +0.7s (worse) |
| **Total Blocking Time (TBT)** | 0ms | Excellent | - | Excellent |
| **Cumulative Layout Shift (CLS)** | 0 | Excellent | - | Perfect |
| **Speed Index** | 2.6s | Fair | - | - |

### LCP Analysis
- **Target:** < 2.5s
- **Current:** 5.0s (2x slower than target)
- **Previous:** 4.3s
- **Regression:** +0.7s (16% slower)

## Core Web Vitals - Desktop

| Metric | Value | Status |
|--------|-------|--------|
| **First Contentful Paint (FCP)** | 0.5s | Excellent |
| **Largest Contentful Paint (LCP)** | 0.8s | Excellent |
| **Total Blocking Time (TBT)** | 0ms | Excellent |
| **Cumulative Layout Shift (CLS)** | 0.008 | Excellent |
| **Speed Index** | 0.9s | Excellent |

## JavaScript Execution Analysis

### Mobile Performance
| Metric | Current | Previous | Improvement |
|--------|---------|----------|-------------|
| **Bootup Time** | 100ms | 930ms | **-830ms (89% faster)** |
| **Main Thread Work** | 1.9s | - | - |

### Script Execution Breakdown
1. **Unattributable:** 1463ms
2. **Other:** 254ms
3. **client.D_Es0amM.js:** 116ms

### Key Improvements
- **Autoplay script eliminated** from initial load
- **Swiper libraries deferred** until needed
- **Total JavaScript execution:** 89% reduction (930ms → 100ms)
- **Zero blocking time:** TBT = 0ms (perfect score)

## Optimization Impact Comparison

| Version | Mobile Score | LCP | JS Execution | Key Issue |
|---------|-------------|-----|--------------|-----------|
| **Original** | 81 | 4.3s | 930ms | Autoplay script blocking |
| **With Preload** | 79 | 4.6s | - | Preload degraded performance |
| **JS Optimized** | 78 | 5.0s | 100ms | LCP regression despite JS improvements |

## Critical Issues

### 1. LCP Regression (Primary Concern)
**Problem:** Despite reducing JavaScript execution by 89%, LCP increased from 4.3s to 5.0s

**Possible Causes:**
- IntersectionObserver delay may be affecting critical above-the-fold content
- Dynamic imports introduce async delays for visible content
- Image loading may be delayed by deferred script execution
- Network conditions during test (PageSpeed uses throttled connection)

**Recommendation:**
- Verify that IntersectionObserver is NOT applied to hero/above-fold content
- Check that critical images load immediately, not waiting for JavaScript
- Consider preloading LCP image with `<link rel="preload">`

### 2. Unused JavaScript
**Finding:** 24.3KB of unused code in client.D_Es0amM.js

**Impact:** Minimal savings (0.00s according to audit)

**Recommendation:** Low priority - focus on LCP first

## What's Working Well

1. **Zero Layout Shift (CLS = 0)** - Perfect stability
2. **Zero Blocking Time (TBT = 0ms)** - Excellent interactivity
3. **JavaScript Execution Optimized** - 89% reduction in bootup time
4. **Desktop Performance (99/100)** - Near-perfect desktop experience
5. **No Long Tasks** - Smooth main thread execution

## What Needs Investigation

1. **LCP Element Identification**
   - Need to identify what element is the LCP (data not returned in this test)
   - Verify if it's an image, text, or other content
   - Check if JavaScript is delaying LCP element rendering

2. **IntersectionObserver Timing**
   - Verify observer thresholds and rootMargin settings
   - Ensure observers aren't watching above-the-fold content
   - Check if observers are triggering before first paint

3. **Image Loading Strategy**
   - Confirm LCP image has priority
   - Check if lazy-loading is applied to above-fold images
   - Verify fetchpriority="high" on critical images

## Recommendations

### Immediate Actions (High Priority)

1. **Audit IntersectionObserver Usage**
   ```javascript
   // Ensure hero/above-fold content is NOT deferred
   // Only apply to below-the-fold elements
   const observer = new IntersectionObserver(callback, {
     rootMargin: '50px' // Load slightly before entering viewport
   });
   ```

2. **Preload LCP Image**
   ```html
   <link rel="preload" as="image" href="/path/to/lcp-image.jpg" fetchpriority="high">
   ```

3. **Verify Critical CSS Inline**
   - Ensure styles for LCP element are in critical CSS
   - No JavaScript should be required to render LCP element

### Testing Actions

1. **Re-test with WebPageTest**
   - Get filmstrip view to see when LCP renders
   - Compare with original version side-by-side
   - Test on multiple network conditions

2. **Chrome DevTools Performance Profile**
   - Record page load with throttling
   - Identify exact moment LCP element renders
   - Check if JavaScript is blocking LCP

3. **Lighthouse CI Testing**
   - Run multiple tests to get median values
   - Single PageSpeed test may have variance
   - Compare 5+ runs of each version

## Conclusion

The JavaScript optimizations **successfully achieved the primary goal** of reducing script execution time (89% improvement), resulting in:
- Zero blocking time
- Perfect layout stability
- Excellent desktop performance (99/100)

However, the **LCP regression is concerning** and suggests that the deferred loading strategy may be inadvertently affecting above-the-fold content rendering.

**Overall Assessment:** The optimization strategy is sound, but implementation needs refinement to ensure critical rendering path is not delayed.

**Next Steps:**
1. Investigate why LCP increased despite reduced JavaScript
2. Verify IntersectionObserver is not watching critical content
3. Re-test to confirm if regression is consistent or test variance
4. Consider hybrid approach: defer below-fold, eager-load above-fold

**Performance Target:**
- Mobile: 90+ (need +12 points)
- LCP: < 2.5s (need -2.5s improvement)
- Desktop: Maintain 99/100

## Test Environment
- Strategy: Mobile (throttled)
- Network: 4G simulation
- CPU: 4x slowdown
- User Agent: Mobile Lighthouse
