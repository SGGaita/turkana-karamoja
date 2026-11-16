/**
 * Offline use (FE-09): names and limits shared by next.config.js (Workbox runtime caching), public/offline-sw.js and
 * the website code. CommonJS so next.config.js can require it.
 */
const DAY = 24 * 60 * 60;

/** Cache names. kc-pages / kc-data are also filled by the warm-up in public/offline-sw.js. */
const CACHES = {
  pages: 'kc-pages',
  data: 'kc-data',
  images: 'kc-images',
  media: 'kc-media',
  tiles: 'kc-map-tiles',
  api: 'kc-api',
  fonts: 'kc-fonts',
  saved: 'kc-saved-files',
};

/** Budgets (entries / age). */
const LIMITS = {
  pages: { maxEntries: 400, maxAgeSeconds: 30 * DAY },
  data: { maxEntries: 600, maxAgeSeconds: 30 * DAY },
  images: { maxEntries: 200, maxAgeSeconds: 30 * DAY },
  media: { maxEntries: 200, maxAgeSeconds: 30 * DAY },
  tiles: { maxEntries: 300, maxAgeSeconds: 30 * DAY },
  api: { maxEntries: 60, maxAgeSeconds: DAY },
  fonts: { maxEntries: 30, maxAgeSeconds: 365 * DAY },
};

/** Pages saved on every device after the first visit (one per main route; the build's list of static routes). */
const STATIC_ROUTES = [
  '/',
  '/early-warnings',
  '/reports',
  '/community',
  '/community/water-points',
  '/community/assistance',
  '/community/planting-calendar',
  '/community/health',
  '/organizations',
  '/about',
  '/contact',
  '/help',
  '/help/user-guide',
  '/help/partner-guide',
  '/help/faq',
  '/partners-stakeholders',
  '/saved',
  '/offline',
];

/** Same-site address for CMS uploads, so a saved document opens without a connection (next.config.js rewrite). */
const FILES_PREFIX = '/cms-files/';

/** Re-save content at most this often (on opening the app and when the connection comes back). */
const REWARM_MS = 6 * 60 * 60 * 1000;

module.exports = { CACHES, LIMITS, STATIC_ROUTES, FILES_PREFIX, REWARM_MS };
