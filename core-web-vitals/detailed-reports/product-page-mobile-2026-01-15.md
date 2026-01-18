# Product Page Performance Report - Mobile
**URL:** https://hercules-astro.pages.dev/produkte/personalisierter-fussballschal/
**Test Date:** 2026-01-15 16:47:28
**Strategy:** Mobile

---

## Summary Scores

| Category | Score | Status |
|----------|-------|--------|
| Performance | 76 | 🟡 Good |
| Accessibility | 93 | ✅ Excellent |
| Best Practices | 92 | ✅ Excellent |
| SEO | 100 | ✅ Excellent |

**GOAL:** Achieve 90+ Performance Score (Currently: 76)
**GAP:** Need +14 points

---

## Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **FCP** (First Contentful Paint) | 1.2 s | < 1.8s | ✅ Pass |
| **LCP** (Largest Contentful Paint) | 5.6 s | < 2.5s | 🔴 Fail |
| **TBT** (Total Blocking Time) | 0 ms | < 200ms | ✅ Perfect |
| **CLS** (Cumulative Layout Shift) | 0.034 | < 0.1 | ✅ Pass |
| **Speed Index** | 4.7 s | < 3.4s | 🔴 Fail |

### Critical Issue: LCP at 5.6 s
LCP (Largest Contentful Paint) is the primary bottleneck, taking 5.6 s. Target is < 2.5s.

**LCP Element:** Unknown

---

## Top Optimization Opportunities

### 1. Reduce unused JavaScript
**Estimated Savings:** 150ms (0.1s)

Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. [Learn how to reduce unused JavaScript](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript/).

- client.D_Es0amM.js: 24.2 KB

---

## Failing Diagnostics

### Background and foreground colors do not have a sufficient contrast ratio.
**Score:** 0.00

Low-contrast text is difficult or impossible for many users to read. [Learn how to provide sufficient color contrast](https://dequeuniversity.com/rules/axe/4.11/color-contrast)....

### Links rely on color to be distinguishable.
**Score:** 0.00

Low-contrast text is difficult or impossible for many users to read. Link text that is discernible improves the experience for users with low vision. [Learn how to make links distinguishable](https://...

### Use efficient cache lifetimes
**Score:** 0.00

A long cache lifetime can speed up repeat visits to your page. [Learn more about caching](https://developer.chrome.com/docs/performance/insights/cache)....

### LCP request discovery
**Score:** 0.00

[Optimize LCP](https://developer.chrome.com/docs/performance/insights/lcp-discovery) by making the LCP image discoverable from the HTML immediately, and avoiding lazy-loading...

### Forced reflow
**Score:** 0.00

A forced reflow occurs when JavaScript queries geometric properties (such as offsetWidth) after styles have been invalidated by a change to the DOM state. This can result in poor performance. Learn mo...

### Improve image delivery
**Score:** 0.00

Reducing the download time of images can improve the perceived load time of the page and LCP. [Learn more about optimizing image size](https://developer.chrome.com/docs/performance/insights/image-deli...

### Network dependency tree
**Score:** 0.00

[Avoid chaining critical requests](https://developer.chrome.com/docs/performance/insights/network-dependency-tree) by reducing the length of chains, reducing the download size of resources, or deferri...

### LCP breakdown
**Score:** 0.00

Each [subpart has specific improvement strategies](https://developer.chrome.com/docs/performance/insights/lcp-breakdown). Ideally, most of the LCP time should be spent on loading the resources, not wi...

### Serves images with low resolution
**Score:** 0.00

Image natural dimensions should be proportional to the display size and the pixel ratio to maximize image clarity. [Learn how to provide responsive images](https://web.dev/articles/serve-responsive-im...

### Browser errors were logged to the console
**Score:** 0.00

Errors logged to the console indicate unresolved problems. They can come from network request failures and other browser concerns. [Learn more about this errors in console diagnostic audit](https://de...

