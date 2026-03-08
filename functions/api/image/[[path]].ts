/**
 * Same-origin image proxy for LCP optimization
 * Proxies product images from the Worker API through the Pages domain,
 * eliminating cross-origin DNS + TLS overhead on slow connections.
 *
 * URL: /api/image/{slug} or /api/image/{slug}/{index}?size=thumb
 */
export const onRequest: PagesFunction = async (context) => {
  const path = context.params.path;
  const pathStr = Array.isArray(path) ? path.join('/') : (path || '');

  const workerUrl = new URL(`https://hercules-product-sync.gilles-86d.workers.dev/image/${pathStr}`);

  // Pass through query params (size, w, format)
  const originalUrl = new URL(context.request.url);
  originalUrl.searchParams.forEach((value, key) => workerUrl.searchParams.set(key, value));

  const response = await fetch(workerUrl.toString());

  if (!response.ok) {
    return new Response('Image not found', { status: 404 });
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
};
