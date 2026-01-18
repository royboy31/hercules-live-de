# Product Page Optimization - Implementation Guide
**Target:** 85-90% mobile score without changing image quality
**Current Score:** 81/100 mobile
**Expected Result:** 85-88/100 mobile

---

## Phase 1: Quick Wins (30 minutes, +4-5 points)

### 1. Preload LCP Image (5 minutes)

**File:** `/home/kamindu/Headerless Herculess site/astro-hercules/src/pages/produkte/[slug].astro`

**Current Code (around line 210):**
```astro
<BaseLayout
  title={product.name}
  description={productDescription}
  ogType="product"
  ogImage={productImage}
  jsonLdSchemas={jsonLdSchemas}
>
```

**Updated Code:**
```astro
<BaseLayout
  title={product.name}
  description={productDescription}
  ogType="product"
  ogImage={productImage}
  jsonLdSchemas={jsonLdSchemas}
  preloadLcpImage={{
    src: workerImage(0),
    sizes: "(max-width: 768px) 100vw, 600px"
  }}
>
```

**Explanation:**
- Adds `<link rel="preload">` for main product image in `<head>`
- Uses Worker cached 361px image (fast load, same as current src)
- Progressive upgrade to full quality still works after page load
- Browser prioritizes LCP image download immediately

**Expected Impact:**
- LCP: 4.4s → 3.5-3.8s
- Score: +2-3 points

---

### 2. Lazy Load TrustIndex Widget (15 minutes)

**File:** `/home/kamindu/Headerless Herculess site/astro-hercules/src/components/CustomerReviews.astro`

**Current Code (approximate):**
```astro
<div class="container">
  <h2>WAS KUNDEN ÜBER UNS SAGEN</h2>
  <div id="ti-widget"></div>
  <script src="https://cdn.trustindex.io/loader.js?72406ce58900366af2861a4ccab"></script>
</div>
```

**Updated Code:**
```astro
<div class="container">
  <h2>WAS KUNDEN ÜBER UNS SAGEN</h2>
  <div id="ti-widget" data-lazy-load="true"></div>
  <!-- Placeholder while loading -->
  <div id="ti-placeholder" style="min-height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
    <p>Kundenrezensionen werden geladen...</p>
  </div>
</div>

<script>
  // Lazy load TrustIndex when section is near viewport
  function initTrustIndexLazy() {
    const widget = document.getElementById('ti-widget');
    const placeholder = document.getElementById('ti-placeholder');

    if (!widget || !placeholder) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Load TrustIndex script
        const script = document.createElement('script');
        script.src = 'https://cdn.trustindex.io/loader.js?72406ce58900366af2861a4ccab';
        script.async = true;
        script.onload = () => {
          // Hide placeholder when widget loads
          placeholder.style.display = 'none';
          widget.style.display = 'block';
        };
        document.head.appendChild(script);
        observer.disconnect();
      }
    }, {
      rootMargin: '200px' // Start loading 200px before section is visible
    });

    observer.observe(widget);
  }

  // Initialize lazy loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrustIndexLazy);
  } else {
    initTrustIndexLazy();
  }
</script>

<style>
  #ti-widget {
    display: none; /* Hidden until TrustIndex loads */
  }

  #ti-placeholder {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-family: Roboto, sans-serif;
    font-size: 16px;
  }
</style>
```

**Explanation:**
- TrustIndex script only loads when user scrolls near reviews section
- Saves 87 KB initial load (loader.js + content fetch + CSS)
- Placeholder shows "loading" message until widget appears
- 200px rootMargin means loading starts slightly before section is visible (smooth UX)

**Expected Impact:**
- Initial bundle: -87 KB
- Speed Index: improvement
- Score: +2-3 points

**Alternative (Simpler but slightly less UX):**
If you want even simpler code without placeholder:
```astro
<div id="ti-widget"></div>

<script>
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://cdn.trustindex.io/loader.js?72406ce58900366af2861a4ccab';
      document.head.appendChild(script);
      observer.disconnect();
    }
  }, { rootMargin: '200px' });

  observer.observe(document.getElementById('ti-widget'));
</script>
```

---

### 3. Test and Deploy (10 minutes)

**Local Testing:**
```bash
cd "/home/kamindu/Headerless Herculess site/astro-hercules"

# Build site
npm run build

# Check build output
ls -lh dist/produkte/personalisierte-snapback-cap/index.html

# Deploy to staging
CLOUDFLARE_API_TOKEN="ZN0wjGH08jqnYCOvlpNH5Y-z--3FeL-63fnLndQp" \
CLOUDFLARE_ACCOUNT_ID="86dfa0e10ca766f79d5042548fc2776f" \
npx wrangler pages deploy dist/ --project-name=hercules-astro --commit-dirty=true
```

**Verify Changes:**
1. Open https://staging.hercules-merchandise.de/produkte/personalisierte-snapback-cap/
2. Open DevTools → Network tab
3. Verify:
   - LCP image loads first (preload working)
   - TrustIndex loads only when scrolling to reviews section
   - Progressive image upgrade still works (check image src after load)

**Run PageSpeed Test:**
```bash
# Mobile test
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fstaging.hercules-merchandise.de%2Fprodukte%2Fpersonalisierte-snapback-cap%2F&key=AIzaSyCEBwlUlOrIxXcRLHCiUVInsAsDTunskC4&strategy=mobile" > mobile-phase1.json

# Check score
python3 -c "import json; d=json.load(open('mobile-phase1.json')); print(f\"Mobile Score: {int(d['lighthouseResult']['categories']['performance']['score']*100)}\")"
```

**Expected Result:** 85-86/100

---

## Phase 2: Polish (20 minutes, +1-2 points)

### 4. Optimize React Component Loading (10 minutes)

**Identify Components Using client:load:**
```bash
cd "/home/kamindu/Headerless Herculess site/astro-hercules"
grep -r "client:load" src/pages/produkte/
```

**Optimization Strategy:**

| Component | Current | Recommended | Reason |
|-----------|---------|-------------|--------|
| ProductConfigurator | client:load | **Keep as is** | Above fold, interactive immediately |
| WishlistButton | client:load | **client:idle** | Non-critical interaction |
| ContactFormPopup | client:load | **client:idle** | User-triggered (button click) |
| Related Products | - | - | No React needed (static) |

**Example Change:**

**File:** `/home/kamindu/Headerless Herculess site/astro-hercules/src/pages/produkte/[slug].astro`

**Find lines like:**
```astro
<WishlistButton client:load productId={product.id} />
```

**Change to:**
```astro
<WishlistButton client:idle productId={product.id} />
```

**What client:idle Does:**
- Waits for main thread to be idle (after critical rendering)
- Defers non-critical JavaScript execution
- Still interactive before user clicks (no delay perceived)
- Improves TBT and Speed Index

**Expected Impact:**
- Defers 5-10 KB JavaScript execution
- Score: +1-2 points

---

### 5. Test and Deploy (10 minutes)

Same process as Phase 1, verify functionality:
- Wishlist button still works
- Contact form popup still opens
- No JavaScript errors in console

---

## Phase 3: Optional Improvements (Low Priority)

### 6. Defer Non-Critical CSS

**File:** `/home/kamindu/Headerless Herculess site/astro-hercules/src/layouts/BaseLayout.astro`

**Current:**
```astro
<link rel="stylesheet" href="/path/to/gallery.css">
```

**Optimized:**
```astro
<link rel="preload" href="/path/to/gallery.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/path/to/gallery.css"></noscript>
```

**Note:** Only defer CSS for below-fold or interaction-triggered features (gallery lightbox, modals)

---

### 7. Compress Design Section Images

**Files to Optimize:**
- `/public/images/design/design-mockup.webp` (126 KB → ~80 KB)
- Logo image (116 KB → ~75 KB)

**Commands:**
```bash
cd "/home/kamindu/Headerless Herculess site/astro-hercules/public/images/design"

# Backup originals
cp design-mockup.webp design-mockup-original.webp

# Re-compress with quality 80 (instead of 90)
cwebp design-mockup-original.webp -q 80 -o design-mockup.webp

# Check size reduction
ls -lh design-mockup*.webp
```

**Expected:** -40-50 KB per image

---

### 8. Convert Footer Background to WebP

**File:** `/public/images/footer-bg-1.jpg` (72 KB)

**Commands:**
```bash
cd "/home/kamindu/Headerless Herculess site/astro-hercules/public/images"

# Convert to WebP
cwebp footer-bg-1.jpg -q 85 -o footer-bg-1.webp

# Update CSS references
# Find: footer-bg-1.jpg
# Replace with: footer-bg-1.webp
```

**Expected:** 72 KB → ~45 KB (-27 KB)

---

## Verification Checklist

After each optimization phase, verify:

### Functionality
- [ ] Product images load (Worker cache first, WordPress upgrade after)
- [ ] Thumbnail carousel works (click to swap main image)
- [ ] Product configurator works (attribute selection, quantity, pricing)
- [ ] Wishlist button works (add/remove from wishlist)
- [ ] Contact form popup opens
- [ ] TrustIndex reviews appear when scrolling

### Performance
- [ ] LCP image preloaded (check Network tab, preload request first)
- [ ] TrustIndex loads lazily (only when scrolling to reviews)
- [ ] No JavaScript errors in console
- [ ] CLS remains at 0 (no layout shifts)
- [ ] Progressive image upgrade works (image quality improves after load)

### PageSpeed Metrics
- [ ] Mobile score: 85+ (Phase 1), 87+ (Phase 2)
- [ ] LCP: <4.0s (Phase 1), <3.8s (Phase 2)
- [ ] TBT: 0ms (should remain 0)
- [ ] CLS: 0 (should remain 0)

---

## Rollback Plan

If any optimization causes issues:

### Phase 1 Rollback
**Remove LCP preload:**
```astro
<BaseLayout
  title={product.name}
  description={productDescription}
  ogType="product"
  ogImage={productImage}
  jsonLdSchemas={jsonLdSchemas}
  <!-- Remove this line: -->
  preloadLcpImage={{...}}
>
```

**Restore TrustIndex immediate loading:**
```astro
<div id="ti-widget"></div>
<script src="https://cdn.trustindex.io/loader.js?72406ce58900366af2861a4ccab"></script>
```

### Phase 2 Rollback
**Restore client:load:**
```astro
<WishlistButton client:load productId={product.id} />
```

---

## Expected Final Results

### After Phase 1 + 2 (50 minutes total)

**Mobile Performance:**
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Score** | 81/100 | **87-88/100** | +6-7 points |
| **LCP** | 4.4s | 3.5-3.8s | -20% |
| **TBT** | 0ms | 0ms | Maintained |
| **CLS** | 0 | 0 | Maintained |
| **Speed Index** | 4.7s | 4.0-4.3s | -15% |
| **Bundle Size** | 982 KB | ~895 KB | -87 KB |

**Desktop Performance:**
| Metric | Before | After |
|--------|--------|-------|
| **Score** | 96/100 | **97-98/100** |

---

## Success Criteria

**GOAL ACHIEVED** if:
- ✅ Mobile score: 85-90/100
- ✅ Progressive image system still works (fast load → quality upgrade)
- ✅ No visible UX degradation
- ✅ CLS remains at 0
- ✅ All interactive features work

**Note:** If mobile score reaches 85-87 after Phase 1, Phase 2 is optional. Only proceed if you want to push to 87-90 range.

---

## Files to Modify Summary

### Phase 1 (Required for 85-86 score):
1. `/src/pages/produkte/[slug].astro` - Add LCP preload
2. `/src/components/CustomerReviews.astro` - Lazy load TrustIndex

### Phase 2 (Optional for 87-88 score):
3. `/src/pages/produkte/[slug].astro` - Change client:load to client:idle

### Phase 3 (Marginal improvements):
4. Design section images - Re-compress WebP
5. Footer background - Convert JPEG to WebP

---

## Contact for Issues

If you encounter any problems during implementation:
1. Check browser console for JavaScript errors
2. Verify Network tab shows expected loading behavior
3. Test on multiple browsers (Chrome, Firefox, Safari)
4. Compare with staging site before changes

**Remember:** The progressive image loading system is optimal and should NOT be changed. All optimizations preserve this system while improving other bottlenecks.
