# PageSpeed Insights Report - Staging URL
## URL: https://staging.hercules-merchandise.de/collections/personalisierte-sportbekleidung/

**Test Date:** 2026-01-12
**Test Environment:** PageSpeed Insights API (Lighthouse)

---

## Performance Scores

| Strategy | Performance | Accessibility | Best Practices | SEO | Status |
|----------|-------------|---------------|----------------|-----|--------|
| Mobile   | **73**      | 97            | 100            | 92  | Need Work |
| Desktop  | **99**      | 97            | 100            | 92  | Optimized |

---

## Core Web Vitals Comparison

### Mobile Performance
| Metric | Current | Previous | Change | Status |
|--------|---------|----------|--------|--------|
| Performance Score | **73** | 88 | -15 | Regression |
| LCP | **5.6s** | 3.4s | +2.2s | POOR |
| FCP | 2.6s | - | - | OK |
| TBT | 0ms | - | - | GOOD |
| CLS | 0.022 | - | - | GOOD |
| Speed Index | 4.3s | - | - | OK |
| TTI | 5.7s | - | - | POOR |

### Desktop Performance (Reference)
| Metric | Value | Status |
|--------|-------|--------|
| Performance Score | **99** | EXCELLENT |
| LCP | 0.9s | GOOD |
| FCP | 0.5s | GOOD |
| TBT | 0ms | GOOD |
| CLS | 0.019 | GOOD |
| Speed Index | 0.9s | EXCELLENT |

---

## Critical Issues Found

### 1. Largest Contentful Paint (LCP) - 5.6s (Target: <2.5s)
**Impact:** CRITICAL - Primary cause of low mobile score (Score: 0.17/1.0)

The LCP of 5.6s is significantly worse than the previous 3.4s, indicating the optimization may have introduced a regression.

**LCP Timeline:**
- Current: 5,627ms (5.6s)
- Target: <2,500ms (2.5s)
- Gap: **3,127ms over target**

### 2. Time to Interactive (TTI) - 5.7s
**Impact:** MODERATE (Score: 0.68/1.0)

### 3. First Contentful Paint (FCP) - 2.6s
**Impact:** MODERATE (Score: 0.64/1.0)

---

## Network Analysis

- **Total Requests:** 93
- **Total Transfer Size:** 1,106.5 KB (1.08 MB)
- **Main Thread Work:** 3.3s
- **Server Response Time:** 60ms (GOOD)

---

## Optimization Opportunities

### Top Issues:
1. **Reduce unused JavaScript** - Est. savings of 23 KiB (Score: 0.5)

---

## Assessment: DID WE REACH 90+?

### Desktop: YES (99)
Desktop performance is excellent with a 99 score. The page loads in under 1 second with optimal Core Web Vitals.

### Mobile: NO (73) - REGRESSION DETECTED

**Critical Finding:** The mobile score has DECREASED from 88 to 73, and LCP has INCREASED from 3.4s to 5.6s.

This indicates that the recent optimizations may have introduced an issue rather than improving performance.

---

## Root Cause Analysis

### Possible Issues with Current Implementation:

1. **Responsive Image Srcset Not Loading Correctly**
   - The 300px mobile image may not be loading properly
   - Browser may be loading larger image sizes on mobile
   - Check if Worker API is correctly serving WebP at 300px width

2. **LCP Preload Tag May Be Ineffective**
   - The preload link for 300px WebP may not match actual image URL
   - Worker transformation URL might differ from preload URL
   - Browser may ignore preload and make duplicate request

3. **IntersectionObserver Loading Strategy**
   - If LCP image is using lazy loading, it will delay LCP significantly
   - LCP image should NEVER be lazy-loaded
   - Check if first product image has `loading="lazy"` attribute

4. **Network Waterfall Issue**
   - Multiple redirects or chained requests for images
   - Worker API might be adding latency
   - Check actual network timing in DevTools

---

## Recommended Next Steps

### IMMEDIATE ACTIONS:

1. **Verify LCP Element**
   - Use Chrome DevTools to identify actual LCP element
   - Check if it's the first product image as expected
   - Verify image is NOT lazy-loaded

2. **Test Image Loading**
   - Open staging URL on mobile device or DevTools mobile emulation
   - Check Network tab for actual image URLs being loaded
   - Verify 300px WebP is loaded on mobile viewport (not 400px or 600px)
   - Check if Worker API is responding quickly

3. **Validate Preload Tag**
   - View page source and check preload link href
   - Compare with actual image src in rendered HTML
   - Ensure they match exactly (including query parameters)

4. **Remove Lazy Loading from LCP Image**
   ```html
   <!-- WRONG: Will delay LCP -->
   <img loading="lazy" src="..." />

   <!-- CORRECT: LCP image should load eagerly -->
   <img loading="eager" src="..." fetchpriority="high" />
   ```

5. **Test Without Worker API**
   - Temporarily test with direct CDN URLs (no Worker transformation)
   - This will help isolate if Worker is causing latency
   - Compare LCP with and without Worker

### CODE REVIEW NEEDED:

Please share the current implementation of:
1. Product image component with srcset
2. LCP preload tag in document head
3. Worker API endpoint for image transformation
4. Any lazy loading or IntersectionObserver code

---

## Comparison: Previous vs Current

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Mobile Score | 88 | 73 | -15 (REGRESSION) |
| Mobile LCP | 3.4s | 5.6s | +2.2s (REGRESSION) |
| Desktop Score | - | 99 | - |

---

## Conclusion

The optimization changes have **NOT** achieved the goal. Instead of improving mobile performance to 90+, we've experienced a significant regression:

- Mobile score dropped from 88 to 73
- LCP increased from 3.4s to 5.6s
- This is likely due to an implementation issue, not the optimization strategy itself

The responsive images + WebP + preload strategy is sound, but something in the implementation is causing images to load slower than before.

**Status: NEEDS DEBUGGING**

Next action should be to review the actual code implementation and test image loading behavior in Chrome DevTools to identify the root cause of the regression.
