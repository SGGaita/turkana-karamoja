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
    if (!already) {
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

const { securityHeaders } = require('./lib/security-headers');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // CSP, HSTS (production), no framing, no sniffing, referrer and permissions policies (FE-06).
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders() }];
  },
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
    ];
  },
};

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  // PWA is off in `next dev` unless NEXT_PUBLIC_PWA_DEV=true (set it in .env.local to test install/offline locally).
  disable: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_PWA_DEV !== 'true',
  register: true,
  // A page that isn't saved on the device, opened without a connection, shows /offline (Website pages → Offline page).
  fallbacks: { document: '/offline' },
  // Keep big/dev-only files out of the install-time precache (they're still served normally).
  publicExcludes: [
    '!noprecache/**/*',
    '!docs/**/*',
    '!images/docs/**/*',
    '!*.geojson',
    '!sw-dev.js',
    '!favicon-48.png',
  ],
  workboxOptions: {
    importScripts: ['/push-handler.js'],
    // Next 15 emits dynamic-css-manifest.json but never serves it publicly (404). If it stays in the
    // precache list the service worker install fails and NO service worker is ever registered.
    // Supplying `exclude` replaces next-pwa's defaults, so they are repeated here.
    exclude: [
      /\/_next\/static\/.*(?<!\.p)\.woff2/,
      /\.map$/,
      /^manifest.*\.js$/,
      /dynamic-css-manifest\.json$/,
    ],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\/wp-json\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'wp-api-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
      {
        urlPattern: /\/early-warnings/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'ews-pages',
          networkTimeoutSeconds: 10,
        },
      },
      {
        // NetworkFirst (not StaleWhileRevalidate) so visitors get the latest deploy straight
        // away; the cached page is only used when offline or the network is slow.
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: { cacheName: 'pages-cache', networkTimeoutSeconds: 5 },
      },
    ],
  },
});

module.exports = withPWA(nextConfig);
