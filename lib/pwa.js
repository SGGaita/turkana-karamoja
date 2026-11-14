/**
 * Installed app (FE-08): the web app manifest and icon links, from Karamoja → Site settings → Installed app
 * (`karamoja/v1/pwa`, Core 0.38.0).
 *
 * Icons: `npm run build` (scripts/fetch-pwa.js) downloads the CMS icons into public/icons/cms/<version>/, so the
 * service worker precaches them and the manifest points at this site. If the CMS has newer icons than the build
 * (`icons_version` differs), the manifest uses the CMS addresses until the next build. With no app icon in the CMS,
 * the built-in icons in public/icons/ are used.
 */

/** What the site used before the CMS had app settings (the old public/manifest.json). */
export const DEFAULT_PWA = {
  lang: 'en',
  name: 'Karamoja Climate Change Knowledge and Information',
  short_name: 'Karamoja',
  description: 'Climate change knowledge and information platform for Kenya and Uganda',
  start_url: '/?source=pwa',
  scope: '/',
  display: 'standalone',
  theme_color: '#C1440E',
  background_color: '#FDF6EC',
  icons_version: '',
  icons: null,
  shortcuts: [
    { name: 'Early warnings', short_name: 'Alerts', url: '/early-warnings' },
    { name: 'Reports', short_name: 'Reports', url: '/reports' },
  ],
  install_prompt: { show_after: 'second_visit', pages: 'all', seconds: 0, snooze_days: 7, max_dismissals: 3 },
  offline: { reports: 20, initiatives: 20, organizations: 100, help: true },
};

/** Built-in icons (public/icons). */
export const BUILT_IN_ICONS = {
  manifest: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  apple_touch_icon: '/icons/apple-touch-icon.png',
  favicon: ['/favicon-48.png'],
  badge: '/icons/badge-96.png',
};

const HEX = /^#[0-9a-f]{6}$/i;
const SITE_PATH = /^\/(?!\/)\S*$/;
const LANGS = ['en', 'sw', 'pk', 'tk', 'tu', 'ng'];

/** A language code the CMS knows, or 'en'. */
export function pwaLang(value) {
  const v = String(value || '').toLowerCase();
  return LANGS.includes(v) ? v : 'en';
}

/** Adds ?source=pwa (keeps other query parameters). */
function withSource(url) {
  return url.includes('source=') ? url : `${url}${url.includes('?') ? '&' : '?'}source=pwa`;
}

/**
 * The icon set to use.
 * - CMS answered: the build's downloaded copy when it is the same version, else the CMS addresses, else built-in
 *   (no app icon in the CMS).
 * - CMS not reachable (live = null): the build's copy, else built-in.
 *
 * @param {object|null} live     `karamoja/v1/pwa` answer now, or null.
 * @param {object|null} snapshot lib/pwa.snapshot.json ({ pwa, local: { version, files } }).
 */
export function iconSet(live, snapshot) {
  const local = snapshot?.local?.files ? snapshot.local : null;
  if (!live) return local ? local.files : BUILT_IN_ICONS;
  if (live.icons_version && local && local.version === live.icons_version) return local.files;
  if (live.icons?.manifest?.length) return live.icons;
  return BUILT_IN_ICONS;
}

/**
 * The web app manifest.
 *
 * @param {object|null} pwa      `karamoja/v1/pwa` answer, or null when the CMS can't be reached.
 * @param {object|null} snapshot lib/pwa.snapshot.json.
 */
export function buildManifest(pwa, snapshot = null) {
  const src = { ...DEFAULT_PWA, ...(pwa || snapshot?.pwa || {}) };
  const icons = iconSet(pwa, snapshot);
  const small = icons.manifest.find((i) => i.purpose === 'any' && i.sizes === '192x192') || icons.manifest[0];
  const shortcuts = (Array.isArray(src.shortcuts) ? src.shortcuts : [])
    .filter((s) => s && typeof s.name === 'string' && s.name.trim() && SITE_PATH.test(String(s.url || '')))
    .slice(0, 4)
    .map((s) => ({
      name: s.name,
      short_name: s.short_name || s.name,
      url: withSource(s.url),
      ...(small ? { icons: [{ src: small.src, sizes: small.sizes, type: 'image/png' }] } : {}),
    }));
  return {
    id: '/',
    name: src.name || DEFAULT_PWA.name,
    short_name: src.short_name || DEFAULT_PWA.short_name,
    description: src.description || DEFAULT_PWA.description,
    lang: pwaLang(src.lang),
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: HEX.test(src.background_color) ? src.background_color : DEFAULT_PWA.background_color,
    theme_color: HEX.test(src.theme_color) ? src.theme_color : DEFAULT_PWA.theme_color,
    categories: ['news', 'weather', 'education'],
    icons: icons.manifest.map(({ src: s, sizes, type, purpose }) => ({ src: s, sizes, type: type || 'image/png', purpose })),
    shortcuts,
  };
}

/** Links and colours for every page's <head>, from the build's copy (pages must not wait on the CMS). */
export function headIcons(snapshot) {
  const pwa = snapshot?.pwa || null;
  const icons = iconSet(null, snapshot);
  return {
    themeColor: HEX.test(pwa?.theme_color) ? pwa.theme_color : DEFAULT_PWA.theme_color,
    appleTouchIcon: icons.apple_touch_icon || BUILT_IN_ICONS.apple_touch_icon,
    favicons: icons.favicon?.length ? icons.favicon : BUILT_IN_ICONS.favicon,
    shortName: pwa?.short_name || DEFAULT_PWA.short_name,
  };
}

/** Icon and badge for push notifications (paths on this site only: the service worker shows them offline too). */
export function pushIcons(snapshot) {
  const files = snapshot?.local?.files;
  const ok = (p) => typeof p === 'string' && SITE_PATH.test(p);
  const icon = files?.manifest?.find((i) => i.purpose === 'any' && i.sizes === '192x192')?.src;
  return {
    icon: ok(icon) ? icon : '/icons/icon-192.png',
    badge: ok(files?.badge) ? files.badge : BUILT_IN_ICONS.badge,
  };
}
