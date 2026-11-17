// Local XAMPP images are only allowed in development (or when ALLOW_LOCAL_WP_IMAGES=true for a local
// production build). In production the image optimiser must not fetch from localhost (audit v3 N-4).
const allowLocalImages = process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_WP_IMAGES === 'true';
const wpImagePatterns = allowLocalImages
  ? [{ protocol: 'http', hostname: 'localhost', pathname: '/**' }]
  : [];
if (process.env.NEXT_PUBLIC_WP_BASE_URL) {
  try {
    const wpUrl = new URL(process.env.NEXT_PUBLIC_WP_BASE_URL);
    const already = wpImagePatterns.some((p) => p.hostname === wpUrl.hostname);
    // A CMS on this machine counts as local too: only with ALLOW_LOCAL_WP_IMAGES (audit v3 N-4).
    const local = /^(localhost|127\.\d+\.\d+\.\d+|\[::1\])$/.test(wpUrl.hostname);
    if (!already && (!local || allowLocalImages)) {
      wpImagePatterns.push({
        protocol: wpUrl.protocol.replace(':', ''),
        hostname: wpUrl.hostname,
        pathname: '/**',
      });
    }
  } catch {
    /* ignore invalid URL */
  }
}

// The same hosts, for components/Picture.js in the browser (which pictures can go through the optimiser).
const imageHosts = ['images.unsplash.com', ...wpImagePatterns.map((p) => p.hostname)];

const { securityHeaders } = require('./lib/security-headers');
const { SITE_LOCALES, DEFAULT_LOCALE } = require('./lib/locales');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Language addresses (FE-26): English at /, the others at /sw/…, /pko/…, /tuv/…. The address decides the language;
  // middleware.js sends a returning visitor to the language they chose last.
  i18n: { locales: SITE_LOCALES, defaultLocale: DEFAULT_LOCALE, localeDetection: false },
  // CSP, HSTS (production), no framing, no sniffing, referrer and permissions policies (FE-06).
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders() }];
  },
  env: { KC_IMAGE_HOSTS: [...new Set(imageHosts)].join(',') },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      ...wpImagePatterns,
    ],
  },
  async redirects() {
    return [
      // Removed from the public site (audit v3 §12.7). Admin docs live in wp-admin, technical docs in the repo.
      { source: '/help/admin-guide', destination: '/help', permanent: true },
      { source: '/help/technical', destination: '/help', permanent: true },
      // Legacy routes, previously redirected in client-side JS.
      { source: '/dashboard', destination: '/partners-stakeholders', permanent: true },
      { source: '/submit', destination: '/partners-stakeholders', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      // The manifest now comes from the CMS (FE-08).
      { source: '/manifest.json', destination: '/manifest.webmanifest', permanent: true },
    ];
  },
  async rewrites() {
    // Report documents under the website's own address, so "Save for offline" can keep them (FE-09).
    const base = (process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
    if (!/^https?:\/\//.test(base)) return [];
    return [{ source: '/cms-files/:path*', destination: `${base}/wp-content/uploads/:path*`, locale: false }];
  },
};

const { CACHES, LIMITS } = require('./lib/offline-config');

// Offline use (FE-09). Workbox serialises these rules into the service worker, so callbacks must not use variables
// from this file; the cache names and limits are written in as values. public/offline-sw.js saves pages ahead of time.
const keepEvenIfVaried = { ignoreVary: true };
/** The app's start address is /?source=pwa; store and find it as "/". */
const dropSourceParam = {
  cacheKeyWillBeUsed: async ({ request }) => {
    const u = new URL(request.url);
    u.searchParams.delete('source');
    return u.href;
  },
};

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_PWA_DEV !== 'true',
  register: true,
  // A new version waits until the visitor chooses "Reload" (components/OfflineManager.js), instead of replacing the
  // code under an open page; and pages are not reloaded on their own when the connection comes back.
  reloadOnOnline: false,
  fallbacks: { document: '/offline' },
  publicExcludes: [
    '!noprecache/**/*',
    '!docs/**/*',
    '!images/docs/**/*',
    '!*.geojson',
    '!sw-dev.js',
    '!favicon-48.png',
  ],
  workboxOptions: {
    skipWaiting: false,
    importScripts: ['/push-handler.js', '/offline-sw.js'],
    exclude: [
      /\/_next\/static\/.*(?<!\.p)\.woff2/,
      /\.map$/,
      /^manifest.*\.js$/,
      /dynamic-css-manifest\.json$/,
    ],
    runtimeCaching: [
      // Sign-in, portal, push and revalidation calls are never stored.
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/'),
        handler: 'NetworkOnly',
      },
      // Saved documents are served by offline-sw.js; the rest of /cms-files/ isn't stored.
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/cms-files/'),
        handler: 'NetworkOnly',
      },
      // Page data used when moving between pages.
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/_next/data/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: CACHES.data,
          networkTimeoutSeconds: 4,
          expiration: LIMITS.data,
          cacheableResponse: { statuses: [200] },
          matchOptions: keepEvenIfVaried,
        },
      },
      // Pages.
      {
        urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: CACHES.pages,
          networkTimeoutSeconds: 4,
          expiration: LIMITS.pages,
          cacheableResponse: { statuses: [200] },
          matchOptions: keepEvenIfVaried,
          plugins: [dropSourceParam],
        },
      },
      // Resized pictures.
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname === '/_next/image',
        handler: 'StaleWhileRevalidate',
        options: { cacheName: CACHES.images, expiration: LIMITS.images, cacheableResponse: { statuses: [200] } },
      },
      // Pictures straight from the CMS, and the help screenshots shipped with Karamoja Core (WP-44).
      {
        urlPattern: ({ url }) => /\/wp-content\/(uploads\/.+|plugins\/karamoja-core\/assets\/help\/[^/]+)\.(png|jpe?g|webp|gif|svg)$/i.test(url.pathname),
        handler: 'CacheFirst',
        options: { cacheName: CACHES.media, expiration: LIMITS.media, cacheableResponse: { statuses: [0, 200] } },
      },
      // Map tiles: only those already viewed, at most 300 for 30 days.
      {
        urlPattern: ({ url }) => /(^|\.)basemaps\.cartocdn\.com$|(^|\.)tile\.openstreetmap\.org$/.test(url.hostname),
        handler: 'CacheFirst',
        options: { cacheName: CACHES.tiles, expiration: LIMITS.tiles, cacheableResponse: { statuses: [0, 200] } },
      },
      // CMS calls made by the browser (public data).
      {
        urlPattern: ({ url }) => url.pathname.includes('/wp-json/karamoja/v1/') || url.pathname.includes('/wp-json/tk/v1/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: CACHES.api,
          networkTimeoutSeconds: 6,
          expiration: LIMITS.api,
          cacheableResponse: { statuses: [200] },
        },
      },
      // Fonts (Montserrat ships with the website, in /_next/static/media/).
      {
        urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'font',
        handler: 'CacheFirst',
        options: { cacheName: CACHES.fonts, expiration: LIMITS.fonts, cacheableResponse: { statuses: [200] } },
      },
    ],
  },
});

module.exports = withPWA(nextConfig);
