# PageSpeed Insights Report - Collections Page

**URL:** https://417c9ade.hercules-astro.pages.dev/collections/personalisierte-sportbekleidung/
**Test Date:** 2026-01-12
**Strategy:** Mobile & Desktop

---

## Performance Summary

### Mobile Results
| Metric | Score | Status |
|--------|-------|--------|
| Performance | 84 | Good |
| Accessibility | 97 | Excellent |
| Best Practices | 96 | Excellent |
| SEO | 69 | Needs Improvement |

### Desktop Results
| Metric | Score |
|--------|-------|
| Performance | 99 | Excellent |

---

## Core Web Vitals - Mobile

| Metric | Value | Status | Assessment |
|--------|-------|--------|------------|
| **First Contentful Paint (FCP)** | 2.6s | Good | Green (<3.0s) |
| **Largest Contentful Paint (LCP)** | 3.8s | Good | Yellow (2.5-4.0s) |
| **Total Blocking Time (TBT)** | 0ms | Excellent | Green (0ms) |
| **Cumulative Layout Shift (CLS)** | 0.001 | Excellent | Green (<0.1) |
| **Speed Index** | 3.5s | Good | Acceptable |

### Desktop Core Web Vitals
| Metric | Value | Status |
|--------|-------|--------|
| **FCP** | 0.5s | Excellent |
| **LCP** | 0.8s | Excellent |
| **TBT** | 0ms | Excellent |
| **CLS** | 0.016 | Excellent |

---

## Comparison: Before vs After

### Before (Previous Test)
- **Performance Score:** 81 (Mobile)
- **LCP:** 4.4s
- **Critical Request Chain:** Present (Issue)

### After (Current Test)
- **Performance Score:** 84 (Mobile) - **+3 points**
- **LCP:** 3.8s - **-0.6s improvement (13.6% faster)**
- **Critical Request Chain:** **ELIMINATED** (No longer flagged)

### Key Improvements
1. **Critical Request Chain ELIMINATED** - This was a major issue that's now resolved
2. **LCP improved from 4.4s to 3.8s** - Moved closer to the "good" threshold
3. **TBT remains at 0ms** - Excellent interactivity
4. **CLS remains excellent at 0.001** - Very stable layout
5. **Desktop performance at 99** - Near perfect

---

## Critical Request Chain Analysis

**Status:** RESOLVED

The critical request chain issue that was previously flagged is no longer present in the audit results. This indicates that the dependency chain for render-blocking resources has been optimized.

**What this means:**
- Fewer blocking resources in the critical rendering path
- Faster initial page render
- Better resource loading prioritization

---

## Remaining Opportunities

### 1. Reduce Unused JavaScript
- **Estimated Savings:** 24 KiB
- **Impact:** Low to Medium
- **Description:** Remove unused JavaScript to reduce bytes consumed by network activity

**Recommendation:** Analyze which JavaScript bundles contain unused code and consider:
- Code splitting
- Tree shaking optimization
- Lazy loading non-critical scripts

### 2. Server Response Time
- **Current:** 10ms (Root document)
- **Status:** Excellent
- **No action needed** - Already optimal

---

## Additional Observations

### Strengths
- Excellent accessibility score (97/100)
- Strong best practices score (96/100)
- Perfect blocking time (0ms)
- Minimal layout shift (0.001)
- Desktop performance near perfect (99/100)
- Critical request chain eliminated

### Areas for Further Improvement
1. **SEO Score (69)** - Could be improved
   - Check meta descriptions
   - Verify structured data
   - Ensure proper heading hierarchy

2. **Mobile LCP (3.8s)** - Currently in "Needs Improvement" zone
   - Target: Get below 2.5s for "Good" rating
   - Consider image optimization
   - Preload critical resources

3. **Unused JavaScript (24 KiB)** - Minor opportunity
   - Review bundle composition
   - Remove dead code

---

## Performance Trend

```
Score Evolution:
81 (Before) → 84 (Current) [+3 points]

LCP Evolution:
4.4s (Before) → 3.8s (Current) [-0.6s, 13.6% improvement]

Critical Request Chain:
Present (Before) → Eliminated (Current) [RESOLVED]
```

---

## Next Steps

To reach 90+ performance score on mobile:

1. **Optimize LCP to <2.5s** (High Priority)
   - Preload hero images
   - Optimize image delivery
   - Consider using srcset for responsive images

2. **Address SEO Issues** (Medium Priority)
   - Review and fix SEO audit failures
   - Ensure meta tags are complete

3. **Remove Unused JavaScript** (Low Priority)
   - Analyze bundle with webpack-bundle-analyzer
   - Remove unused dependencies

---

## Conclusion

The collection page shows significant improvement with the critical request chain issue eliminated and LCP reduced by 13.6%. The page is now scoring 84/100 on mobile (up from 81) and an impressive 99/100 on desktop.

**Status:** Good (Yellow) - 6 more points needed to reach 90+ target
**Trajectory:** Positive - Moving in the right direction

The page is performing well overall, with just a few optimizations needed to reach the 90+ target for mobile performance.
