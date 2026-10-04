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
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    importScripts: ['/push-handler.js'],
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
