/**
 * Security headers for every response (FE-06). Used by next.config.js (CommonJS, so this file is too); kept here
 * so tests can check them.
 *
 * The Content-Security-Policy allows scripts only from this site (plus Cloudflare Turnstile), so a script hidden
 * in CMS-edited HTML — which pages insert as HTML — can't run. Styles allow inline (MUI and Leaflet set them).
 * Images allow any HTTPS source: CMS media, map tiles and the stock photos.
 */

/** Origin (scheme://host[:port]) of a URL, or '' when it isn't one. */
function originOf(url) {
  try {
    return new URL(String(url || '')).origin;
  } catch {
    return '';
  }
}

/** The Content-Security-Policy value. */
function contentSecurityPolicy(env = process.env) {
  const dev = env.NODE_ENV === 'development';
  const cms = originOf(env.NEXT_PUBLIC_WP_BASE_URL);
  const turnstile = 'https://challenges.cloudflare.com';
  // Google Analytics 4 (FE-27): loaded only after the visitor accepts, with the ID from Site settings → Analytics.
  const gtm = 'https://www.googletagmanager.com';
  const ga = ['https://*.google-analytics.com', 'https://*.analytics.google.com'];
  // Map tiles. Images allow any HTTPS source, but once the offline service worker is installed it fetches the
  // tiles itself (to keep the ones already viewed), and a service worker's fetches fall under connect-src.
  // Without these hosts every map showed only its grey background in a production build.
  const tiles = ['https://*.basemaps.cartocdn.com', 'https://*.tile.openstreetmap.org'];
  const directives = {
    'default-src': ["'self'"],
    // Next.js development needs eval for fast refresh; production does not.
    'script-src': ["'self'", turnstile, gtm, ...(dev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', ...(cms.startsWith('http:') ? [cms] : [])],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", ...(cms ? [cms] : []), turnstile, gtm, ...ga, ...tiles, ...(dev ? ['ws:'] : [])],
    'frame-src': [turnstile],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'media-src': ["'self'", 'https:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  const parts = Object.entries(directives).map(([k, v]) => `${k} ${v.join(' ')}`);
  // Only when the CMS is on HTTPS too: a local production build against http://localhost would lose its images.
  if (!dev && (!cms || cms.startsWith('https:'))) parts.push('upgrade-insecure-requests');
  return parts.join('; ');
}

/** Headers for every route, in next.config.js `headers()` form. */
function securityHeaders(env = process.env) {
  const headers = [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(env) },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ];
  if (env.NODE_ENV === 'production') {
    // One year, this host only (no includeSubDomains/preload: the CMS and other subdomains decide for themselves).
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' });
  }
  return headers;
}

module.exports = { originOf, contentSecurityPolicy, securityHeaders };
