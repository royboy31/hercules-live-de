# URL Inventory - Hercules Merchandise

Last Updated: 2026-01-28

## Summary
- Total URLs Tested: 1
- Optimized (All 90+): 0
- Good (At least one <90): 1
- Needs Work (Any <70): 0
- Pending: 0

---

## URL Status Table

| URL | Perf | A11y | BP | SEO | Status | Last Tested | Priority Issues |
|-----|------|------|----|----|--------|-------------|-----------------|
| https://hercules-merchandise.de/ | M:87 D:99 | 96 | M:96 D:100 | 92 | GOOD | 2026-01-28 | Mobile: LCP 3.3s, Speed Index 6.1s, Color Contrast |

**Columns:**
- Perf = Performance | A11y = Accessibility | BP = Best Practices | SEO = SEO
- M: = Mobile score | D: = Desktop score

**Status Legend:**
- OPTIMIZED = All categories 90+ on both mobile and desktop
- GOOD = Close to target (at least one category between 85-89)
- NEEDS WORK = Any category below 85
- PENDING = Not yet tested

---

## Detailed Findings

### Homepage (https://hercules-merchandise.de/)

**Mobile Performance: 87/100**
- First Contentful Paint: 1.3s (Good)
- Largest Contentful Paint: 3.3s (Needs Improvement - Target: <2.5s)
- Total Blocking Time: 0ms (Excellent)
- Cumulative Layout Shift: 0 (Excellent)
- Speed Index: 6.1s (Needs Improvement - Target: <3.4s)

**Desktop Performance: 99/100**
- All metrics excellent
- Near-perfect optimization

**Critical Issues:**
1. Color Contrast Failures (WCAG compliance)
   - Slide buttons: 2.12:1 (need 4.5:1)
   - Product buttons: 2.74:1 (need 4.5:1)
   - Highlight text: 2.9:1 (need 3:1)

2. Mobile Speed Index: 6.1s (target: <3.4s)

3. Mobile LCP: 3.3s (target: <2.5s)

**Opportunities:**
- Reduce unused CSS: 47.4 KB (Chathive widget)
- Reduce unused JavaScript: 23.4 KB (Astro client)
- Fix invalid robots.txt directive
- Implement responsive images for HiDPI displays

**Next Steps:**
1. Fix color contrast for accessibility compliance
2. Optimize mobile LCP (preload critical resources)
3. Improve mobile Speed Index (optimize critical rendering path)
4. Reduce unused CSS/JS
5. Re-test to verify 90+ performance score

---

## Notes

This is the initial audit of the Hercules Merchandise website. The homepage shows excellent desktop performance (99/100) but mobile performance (87/100) needs optimization to reach the 90+ target. The site has solid fundamentals with zero TBT and CLS, indicating good technical implementation. Main focus should be on mobile LCP optimization and accessibility compliance.
