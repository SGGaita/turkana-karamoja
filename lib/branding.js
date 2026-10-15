/** Canonical app branding — single source of truth for the frontend. */

export const APP_NAME = 'Karamoja';
export const APP_TAGLINE = 'Climate Change Knowledge and Information';
export const APP_FULL_NAME = `${APP_NAME} ${APP_TAGLINE}`;
export const APP_SHORT_NAME = APP_NAME;
export const APP_STATUS_TEXT = `LIVE SYSTEM · ${APP_FULL_NAME}`;
export const APP_PAGE_TITLE_SUFFIX = APP_FULL_NAME;
export const APP_META_DESCRIPTION =
  'Climate change knowledge and information for pastoral communities in the Karamoja Cluster.';
/** Logo bundled with the site (served from Vercel's CDN) so it always renders, even when the CMS is slow. */
export const APP_LOGO_URL = '/images/karamoja-logo.png';
export const APP_COPYRIGHT = `© 2026 ${APP_FULL_NAME}`;
