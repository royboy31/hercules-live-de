/**
 * Hercules Edge Router
 *
 * Routes traffic between Astro (static) and WordPress (dynamic) origins
 * on the same domain for seamless cookie/session sharing.
 */

interface Env {
  ASTRO_ORIGIN: string;
  WORDPRESS_ORIGIN: string;
  WORDPRESS_HOST: string; // The actual WordPress hostname for Host header
}

// Paths that should NEVER be cached (dynamic/personalized)
const NO_CACHE_PATHS = [
  '/cart',
  '/warenkorb',
  '/checkout',
  '/kasse',
  '/my-account',
  '/mein-konto',
  '/wishlist',
  '/wunschliste',
  '/wp-admin',
  '/wp-login.php',
  '/wp-json',  // REST API should never be cached
  '/wc-api',   // WooCommerce API
];

// Paths that should go to WordPress
const WORDPRESS_PATHS = [
  // Cart & Checkout
  '/cart',
  '/warenkorb',
  '/checkout',
  '/kasse',

  // Account
  '/my-account',
  '/mein-konto',
  '/wishlist',
  '/wunschliste',

  // WordPress Core
  '/wp-admin',
  '/wp-json',
  '/wc-api',
  '/wp-login.php',
  '/wp-cron.php',
  '/?wc-ajax',
  '/wp-content/uploads',
  '/wp-content/plugins',
  '/wp-content/themes',
  '/wp-content/cache',
  '/wp-includes',

  // Product pages (still on WordPress for now)
  '/produkt',
  '/produkte',  // German permalink structure (actual WP permalink)
  '/product',
  '/products',
  '/shop',

  // Contact & Quote pages
  '/kontakt',
  '/kontaktieren-sie-uns',
  '/angebot-anfragen',

  // About & Info pages
  '/uber-uns',
  '/lieferungen-und-rucksendungen',
  '/zahlungsmethoden',

  // Blog - NOW SERVED BY ASTRO (removed from WordPress paths)
  // '/blogs',
  // '/blog',

  // Legal pages
  '/rechtlicher-hinweis',
  '/nutzungsbedingungen',
  '/datenschutzerklarung',
  '/impressum',
  '/agb',
];

// Paths that should always go to Astro
const ASTRO_PATHS = [
  '/',
  '/collections',
  '/blogs',
];

function shouldBypassCache(pathname: string, search: string): boolean {
  // WC AJAX should never be cached
  if (search.includes('wc-ajax')) {
    return true;
  }

  // Check no-cache paths
  for (const path of NO_CACHE_PATHS) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return true;
    }
  }

  return false;
}

function shouldRouteToWordPress(pathname: string, search: string): boolean {
  // Check for WooCommerce AJAX calls
  if (search.includes('wc-ajax')) {
    return true;
  }

  // Check WordPress paths
  for (const wpPath of WORDPRESS_PATHS) {
    if (pathname === wpPath || pathname.startsWith(wpPath + '/') || pathname.startsWith(wpPath + '?')) {
      return true;
    }
  }

  // Check for WordPress file extensions
  if (pathname.endsWith('.php')) {
    return true;
  }

  return false;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, search } = url;

    // Handle /blog -> /blogs redirect (keep on same domain)
    if (pathname === '/blog' || pathname === '/blog/') {
      const redirectUrl = new URL('/blogs/', url.origin);
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // Handle CORS preflight for API requests
    if (request.method === 'OPTIONS' && pathname.startsWith('/wp-json/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': url.origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-WP-Nonce',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Determine which origin to use
    const isWordPress = shouldRouteToWordPress(pathname, search);
    const bypassCache = shouldBypassCache(pathname, search);
    const origin = isWordPress ? env.WORDPRESS_ORIGIN : env.ASTRO_ORIGIN;

    // Build target URL
    const targetUrl = new URL(pathname + search, origin);

    // Clone headers and adjust Host
    const headers = new Headers(request.headers);
    // For WordPress, use the configured host; for Astro, use the origin's host
    const targetHost = isWordPress ? env.WORDPRESS_HOST : new URL(origin).host;
    headers.set('Host', targetHost);

    // Forward the original host for WordPress to use in redirects
    headers.set('X-Forwarded-Host', url.host);
    headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

    // Create the proxied request
    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual', // Handle redirects ourselves
    });

    try {
      // Fetch with cache bypass for dynamic pages
      const fetchOptions: RequestInit = bypassCache ? {
        cf: {
          cacheTtl: 0,
          cacheEverything: false,
        } as any,
      } : {};

      let response = await fetch(proxyRequest, fetchOptions);

      // Handle redirects - rewrite to keep on same domain
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('Location');
        if (location) {
          const redirectUrl = new URL(location, targetUrl);

          // Check if redirect is to our WordPress origin
          const wpOriginHost = env.WORDPRESS_HOST;
          const astroOriginHost = new URL(env.ASTRO_ORIGIN).host;

          if (redirectUrl.host === wpOriginHost || redirectUrl.host === new URL(env.WORDPRESS_ORIGIN).host) {
            // Rewrite WordPress redirects to our domain
            redirectUrl.host = url.host;
            redirectUrl.protocol = url.protocol;
          } else if (redirectUrl.host === astroOriginHost) {
            // Rewrite Astro/Pages redirects to our domain
            redirectUrl.host = url.host;
            redirectUrl.protocol = url.protocol;
          }

          // Create new response with rewritten location and cookies
          const newHeaders = new Headers();
          for (const [key, value] of response.headers.entries()) {
            if (key.toLowerCase() === 'set-cookie') {
              // Remove domain restriction so cookie works on Edge Router domain
              let newCookie = value.replace(/;\s*domain=[^;]+/gi, '');
              newCookie = newCookie.replace(new RegExp(wpOriginHost, 'g'), url.host);
              newHeaders.append(key, newCookie);
            } else if (key.toLowerCase() === 'location') {
              newHeaders.set(key, redirectUrl.toString());
            } else {
              newHeaders.set(key, value);
            }
          }

          // Debug headers for redirects
          newHeaders.set('X-Edge-Router', 'hercules');
          newHeaders.set('X-Routed-To', isWordPress ? 'wordpress' : 'astro');

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        }
      }

      // Rewrite WordPress origin URLs and cookies
      const wpHost = env.WORDPRESS_HOST;
      const wpOriginHost = new URL(env.WORDPRESS_ORIGIN).host;
      const ourOrigin = url.origin;
      const ourHost = url.host;

      // Create new headers and rewrite Set-Cookie domains
      const newHeaders = new Headers();
      for (const [key, value] of response.headers.entries()) {
        if (key.toLowerCase() === 'set-cookie') {
          // Rewrite cookie domain from WordPress to our domain
          let newCookie = value;
          // Remove domain restriction so cookie works on Edge Router domain
          newCookie = newCookie.replace(/;\s*domain=[^;]+/gi, '');
          // Also rewrite any WordPress URLs in the cookie path
          newCookie = newCookie.replace(new RegExp(wpHost, 'g'), ourHost);
          newHeaders.append(key, newCookie);
        } else {
          newHeaders.set(key, value);
        }
      }

      // Add CORS headers for session/API requests to allow credentials
      if (pathname.startsWith('/wp-json/')) {
        newHeaders.set('Access-Control-Allow-Origin', ourOrigin);
        newHeaders.set('Access-Control-Allow-Credentials', 'true');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-WP-Nonce');
      }

      // For non-redirect responses, we may need to rewrite content
      // that contains absolute URLs to WordPress origin
      const contentType = response.headers.get('Content-Type') || '';

      // Rewrite URLs in HTML, JSON, CSS, and JavaScript files
      const shouldRewriteContent =
        contentType.includes('text/html') ||
        contentType.includes('application/json') ||
        contentType.includes('text/css') ||
        contentType.includes('application/javascript') ||
        contentType.includes('text/javascript');

      if (shouldRewriteContent) {
        let body = await response.text();

        // Replace all URL formats for WordPress host:
        // 1. Full HTTPS URLs: https://staging.hercules-merchandise.de
        body = body.replaceAll(`https://${wpHost}`, ourOrigin);

        // 2. Full HTTP URLs: http://staging.hercules-merchandise.de
        body = body.replaceAll(`http://${wpHost}`, ourOrigin);

        // 3. Protocol-relative URLs: //staging.hercules-merchandise.de
        body = body.replaceAll(`//${wpHost}`, `//${ourHost}`);

        // 4. Escaped URLs in JSON: https:\/\/staging.hercules-merchandise.de
        body = body.replaceAll(`https:\\/\\/${wpHost}`, `https:\\/\\/${ourHost}`);
        body = body.replaceAll(`http:\\/\\/${wpHost}`, `https:\\/\\/${ourHost}`);

        // Also handle origin host if different from WordPress host
        if (wpOriginHost !== wpHost) {
          body = body.replaceAll(`https://${wpOriginHost}`, ourOrigin);
          body = body.replaceAll(`http://${wpOriginHost}`, ourOrigin);
          body = body.replaceAll(`//${wpOriginHost}`, `//${ourHost}`);
        }

        // Also rewrite Astro/Pages URLs to our domain
        const astroHost = new URL(env.ASTRO_ORIGIN).host;
        body = body.replaceAll(`https://${astroHost}`, ourOrigin);
        body = body.replaceAll(`http://${astroHost}`, ourOrigin);
        body = body.replaceAll(`//${astroHost}`, `//${ourHost}`);

        newHeaders.delete('Content-Length'); // Length may have changed

        // Set appropriate caching headers
        if (bypassCache) {
          // Dynamic pages should never be cached
          newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
          newHeaders.set('Pragma', 'no-cache');
        } else if (!isWordPress) {
          // Astro pages can be cached
          newHeaders.set('Cache-Control', 'public, max-age=300'); // 5 minutes
        }
        // Note: For cacheable WordPress pages, preserve their original Cache-Control

        // Debug headers to confirm Edge Router is processing requests
        newHeaders.set('X-Edge-Router', 'hercules');
        newHeaders.set('X-Routed-To', isWordPress ? 'wordpress' : 'astro');

        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      // For non-rewritten content, still apply cache headers if needed
      if (bypassCache) {
        newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        newHeaders.set('Pragma', 'no-cache');
      }

      // Debug headers to confirm Edge Router is processing requests
      newHeaders.set('X-Edge-Router', 'hercules');
      newHeaders.set('X-Routed-To', isWordPress ? 'wordpress' : 'astro');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('Edge router error:', error);
      return new Response(`Edge Router Error: ${error}`, { status: 502 });
    }
  },
};
