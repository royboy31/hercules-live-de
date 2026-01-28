# PageSpeed Insights Audit Report - Homepage

**URL:** https://hercules-merchandise.de/
**Test Date:** 2026-01-28
**Lighthouse Version:** 13.0.1

---

## Executive Summary

### Mobile Performance
- **Performance:** 87/100 (Good, but below 90 target)
- **Accessibility:** 96/100 (Excellent)
- **Best Practices:** 96/100 (Excellent)
- **SEO:** 92/100 (Excellent)

**Status:** GOOD - Close to optimization target

### Desktop Performance
- **Performance:** 99/100 (Excellent)
- **Accessibility:** 96/100 (Excellent)
- **Best Practices:** 100/100 (Perfect)
- **SEO:** 92/100 (Excellent)

**Status:** OPTIMIZED

---

## Core Web Vitals

### Mobile Metrics
| Metric | Value | Status | Target |
|--------|-------|--------|--------|
| **First Contentful Paint (FCP)** | 1.3s | GOOD | < 1.8s |
| **Largest Contentful Paint (LCP)** | 3.3s | NEEDS IMPROVEMENT | < 2.5s |
| **Total Blocking Time (TBT)** | 0ms | EXCELLENT | < 200ms |
| **Cumulative Layout Shift (CLS)** | 0 | EXCELLENT | < 0.1 |
| **Speed Index** | 6.1s | NEEDS IMPROVEMENT | < 3.4s |

### Desktop Metrics
| Metric | Value | Status | Target |
|--------|-------|--------|--------|
| **First Contentful Paint (FCP)** | 0.3s | EXCELLENT | < 1.8s |
| **Largest Contentful Paint (LCP)** | 0.5s | EXCELLENT | < 2.5s |
| **Total Blocking Time (TBT)** | 0ms | EXCELLENT | < 200ms |
| **Cumulative Layout Shift (CLS)** | 0.003 | EXCELLENT | < 0.1 |
| **Speed Index** | 1.4s | EXCELLENT | < 3.4s |

---

## Key Findings

### Strengths
- Zero Total Blocking Time on both mobile and desktop
- Perfect Cumulative Layout Shift (no layout instability)
- Excellent desktop performance (99/100)
- Strong accessibility score (96/100)
- Perfect best practices on desktop

### Areas for Improvement (Mobile)

#### 1. Largest Contentful Paint (LCP): 3.3s
**Issue:** LCP exceeds the "Good" threshold of 2.5s by 0.8s
**Impact:** Users experience slower perceived load time on mobile devices
**Priority:** HIGH

#### 2. Speed Index: 6.1s
**Issue:** Speed Index is significantly higher than the 3.4s target
**Impact:** Visual progress appears slow during page load
**Priority:** HIGH

---

## Detailed Opportunities

### 1. Reduce Unused CSS
**Potential Savings:** 47.4 KB
**Score:** 0.50/1.00
**Status:** Needs Attention

**Details:**
- `https://widget.chathive.app/assets/index-BBjK0QDd.css`: 47.4 KB wasted

**Recommendation:**
- Review and remove unused CSS rules from the Chathive widget
- Consider lazy-loading the chat widget CSS only when needed
- Implement critical CSS inlining for above-the-fold content

### 2. Reduce Unused JavaScript
**Potential Savings:** 23.4 KB
**Score:** 0.50/1.00
**Status:** Needs Attention

**Details:**
- `https://hercules-merchandise.de/_astro/client.D_Es0amM.js`: 23.4 KB wasted

**Recommendation:**
- Analyze the Astro client bundle for unused code
- Implement code splitting to load only necessary JavaScript
- Consider tree-shaking to remove dead code

---

## Critical Issues

### 1. Color Contrast Failures (Accessibility)
**Score:** 0/1 (Failed)
**Impact:** Users with vision impairments cannot read text properly
**WCAG Compliance:** Fails WCAG AA standards

**Affected Elements:**

1. **Slide Button** (`.slide-button`)
   - Current: 2.12:1 (white #ffffff on #10c99e)
   - Required: 4.5:1
   - Fix: Darken background to #00A87E or darker

2. **Product Button** (`.product-button`)
   - Current: 2.74:1 (#469adc on #e9f5ff)
   - Required: 4.5:1
   - Fix: Darken text to #1E6FB8 or darker

3. **Contact Trigger Button** (`.contact-trigger-button`)
   - Current: 2.12:1 (white #ffffff on #10c99e)
   - Required: 4.5:1
   - Fix: Darken background to #00A87E or darker

4. **Highlight Text** (`.highlight`)
   - Current: 2.9:1 (#469adc on #fafafa)
   - Required: 3:1 (large text)
   - Fix: Darken text to #2E7DC0 or darker

**Priority:** CRITICAL - Affects accessibility compliance

### 2. Invalid robots.txt
**Score:** 0/1 (Failed)
**Issue:** Contains unknown directive "Content-Signal: search=yes,ai-train=no"

**Impact:** Search engines may ignore or misinterpret the robots.txt file

**Fix:** Remove the invalid directive or use supported directives only

### 3. Low Resolution Images
**Score:** 0/1 (Failed)
**Issue:** Images served at exact size without responsive sizing

**Affected Images:**
- `https://hercules-merchandise.de/images/hercules-logo-small.webp` (87x39)
  - Displayed: 87x39
  - Actual: 87x39
  - Issue: No higher resolution available for high-DPI displays

**Recommendation:**
- Serve 2x and 3x resolution images for Retina/HiDPI displays
- Use responsive image techniques (srcset, sizes attributes)
- Consider using image CDN for automatic optimization

---

## Performance Budget Analysis

### Resource Loading
- **Total Resources:** 95+ resources
- **HTML Size:** ~303KB
- **Image Format:** WebP (optimized)
- **Font Format:** WOFF2 (optimized)
- **JavaScript:** Async-loaded

### Loading Timeline (Mobile)
- First Contentful Paint: 1.3s
- Largest Contentful Paint: 3.3s
- Speed Index: 6.1s
- Final Screenshot: ~15.2s

---

## Recommendations by Priority

### HIGH Priority (Mobile Performance)

1. **Optimize Largest Contentful Paint**
   - Identify the LCP element (likely hero image or large text block)
   - Preload critical resources (fonts, hero images)
   - Optimize image delivery (compression, format, size)
   - Consider using a CDN for faster resource delivery

2. **Improve Speed Index**
   - Optimize critical rendering path
   - Inline critical CSS
   - Defer non-critical JavaScript
   - Lazy-load below-the-fold content

3. **Fix Color Contrast Issues**
   - Update button background colors to meet WCAG AA (4.5:1 ratio)
   - Update highlight text colors to meet WCAG AA (3:1 for large text)
   - Test with contrast checker tools
   - Consider implementing a design system with accessible colors

### MEDIUM Priority

4. **Reduce Unused CSS**
   - Audit Chathive widget CSS usage
   - Extract and inline critical CSS
   - Defer non-critical stylesheets
   - Remove unused rules

5. **Reduce Unused JavaScript**
   - Analyze Astro client bundle
   - Implement code splitting
   - Remove dead code
   - Consider dynamic imports for non-critical features

6. **Fix robots.txt**
   - Remove invalid "Content-Signal" directive
   - Validate robots.txt syntax
   - Test with Google Search Console

### LOW Priority

7. **Implement Responsive Images**
   - Generate 2x and 3x versions of images
   - Use srcset and sizes attributes
   - Consider using image CDN (Cloudflare Images, Imgix, etc.)

---

## Testing Environment

### Mobile Emulation
- **Device:** Moto G Power 2022
- **Screen:** Mobile viewport
- **Network:** Simulated 4G
- **CPU:** Throttled (4x slowdown)

### Desktop Testing
- **Device:** Desktop computer
- **Screen:** Desktop viewport
- **Network:** Simulated broadband
- **CPU:** No throttling

---

## Next Steps

1. Address color contrast issues immediately (WCAG compliance)
2. Optimize LCP on mobile (preload critical resources)
3. Reduce unused CSS from Chathive widget
4. Reduce unused JavaScript in Astro client bundle
5. Fix robots.txt validation errors
6. Implement responsive image sizing
7. Re-test after optimizations to verify improvements

**Target:** Achieve 90+ performance score on mobile to match desktop excellence.

---

## Conclusion

The homepage performs excellently on desktop (99/100) but has room for improvement on mobile (87/100). The main issues are:
- LCP of 3.3s (target: <2.5s)
- Speed Index of 6.1s (target: <3.4s)
- Critical color contrast failures affecting accessibility

With focused optimization on mobile LCP, unused resources, and accessibility fixes, the site can easily achieve 90+ across all metrics and devices.

**Current Status:** GOOD
**Target Status:** OPTIMIZED (90+)
**Estimated Effort:** 4-6 hours of development work
