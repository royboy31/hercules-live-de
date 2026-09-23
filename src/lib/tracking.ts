// GA4 lead tracking for the DE Astro storefront.
// Leads are pushed only once /api/contact has confirmed the submission, never on click,
// so the counts match the enquiries actually delivered. Ported from the UK storefront
// (src/lib/tracking.ts there); only the lead half is ported, the ecommerce funnel
// (view_item, add_to_cart, ...) is deliberately out of scope for this release.

// One value per enquiry surface: GTM reads `lead_type` and splits Contact from Quote on it.
// `quote_generator` is produced WordPress-side by
// pearl-wc-steps-variation-fr/assets/js/quote-form.js, not here; it is listed so the
// vocabulary has a single definition.
export type LeadType =
  | 'contact_popup'
  | 'contact_page'
  | 'quantity_request'
  | 'express_delivery'
  | 'quote_generator';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// One accepted submission, one event. Every call site already sits behind the `/api/contact`
// success response, so a per-page-load cap would only drop a second genuine enquiry.
export function pushGenerateLead(leadType: LeadType): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'generate_lead', lead_type: leadType });
}
