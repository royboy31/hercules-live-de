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
// Customer email for Google Ads enhanced conversions (tracking lot 2). Same rules as the WordPress
// quote and purchase pushes (mu-plugins/hercules-ads-email.php):
// - off for visitors until this switch is on;
// - a browser carrying the cookie hercules_ads_email_test=1 gets it regardless, for testing;
// - only when the visitor accepted marketing cookies (cmplz_marketing=allow);
// - trimmed and lower-cased, never hashed here (GTM does that for the Ads tags), and never stored.
const ADS_EMAIL_LIVE = true;

function hasCookie(pair: string): boolean {
  return ('; ' + document.cookie + ';').includes('; ' + pair + ';');
}

function adsUserData(email?: string): { email: string } | undefined {
  if (!ADS_EMAIL_LIVE && !hasCookie('hercules_ads_email_test=1')) return undefined;
  if (!hasCookie('cmplz_marketing=allow')) return undefined;
  const value = (email ?? '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? { email: value } : undefined;
}

export function pushGenerateLead(leadType: LeadType, enquiryId?: string, email?: string): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // Clear first, as the WordPress pushes do, so a value from an earlier push cannot ride along.
  window.dataLayer.push({ user_data: undefined, enquiry_id: undefined });
  window.dataLayer.push({
    event: 'generate_lead',
    lead_type: leadType,
    enquiry_id: enquiryId,
    user_data: adsUserData(email),
  });
}

// Tracking lot 3: the reference `/api/contact` returns for an accepted request
// (HER-{SITE}-{YYMMDD}-{6 chars}). Anything else, or an unreadable body, gives undefined:
// the lead is still counted, without a reference.
const ENQUIRY_REF_RE = /^HER-(?:FR|UK|DE|NL)-\d{6}-[A-Z0-9]{6}$/;

export async function enquiryIdFrom(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { enquiry_id?: unknown };
    return typeof body.enquiry_id === 'string' && ENQUIRY_REF_RE.test(body.enquiry_id)
      ? body.enquiry_id
      : undefined;
  } catch {
    return undefined;
  }
}
