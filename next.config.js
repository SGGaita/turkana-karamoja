const wpImagePatterns = [
  { protocol: 'http', hostname: 'localhost', pathname: '/turkana-karamoja-hub/**' },
];
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      ...wpImagePatterns,
    ],
  },
};

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  // PWA is off in `next dev` unless NEXT_PUBLIC_PWA_DEV=true (set it in .env.local to test install/offline locally).
  disable: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_PWA_DEV !== 'true',
  register: true,
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
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'pages-cache' },
      },
    ],
  },
});

module.exports = withPWA(nextConfig);
