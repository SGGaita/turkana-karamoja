/**
 * The website's languages and their addresses (FE-26). English has no prefix; the others are /sw/…, /pko/…, /tuv/….
 *
 * Address codes are the language tags Karamoja Core gives each language (Site settings → Languages, `html_lang`), so
 * the address, `<html lang>` and hreflang agree. The CMS keeps its own short codes (pk, tk): cmsFor() maps them.
 * The old cookie and picker used tu / ng / pk; oldCode() maps those.
 *
 * CommonJS so that next.config.js and middleware can read it too.
 */

/** Address codes, English first (the default, no prefix). */
const SITE_LOCALES = ['en', 'sw', 'pko', 'tuv'];
const DEFAULT_LOCALE = 'en';

/** Address code → CMS code. */
const CMS_FOR = { en: 'en', sw: 'sw', pko: 'pk', tuv: 'tk' };

/** CMS code → address code. */
const SITE_FOR_CMS = { en: 'en', sw: 'sw', pk: 'pko', tk: 'tuv' };

/** Codes used before FE-26 (cookie, picker), and CMS codes, → address code. */
const OLD_CODES = { tu: 'tuv', ng: 'tuv', tk: 'tuv', kdj: 'tuv', pk: 'pko' };

/** Cookie that remembers the visitor's choice (Next.js's own name), and the one used before FE-26. */
const LOCALE_COOKIE = 'NEXT_LOCALE';
const OLD_LOCALE_COOKIE = 'tk_hub_lang';

/** An address code for any code we have used (address, CMS or old), or '' when unknown. */
function siteLocale(code) {
  const c = String(code || '').toLowerCase();
  if (SITE_LOCALES.includes(c)) return c;
  return OLD_CODES[c] || '';
}

/** CMS code for an address code (or any old code); unknown → en. */
function cmsFor(code) {
  return CMS_FOR[siteLocale(code)] || 'en';
}

/**
 * The address of a path in a language: localePath('/reports', 'sw') → '/sw/reports'; English has no prefix.
 * A path that already has a language prefix is moved to the new one.
 */
function localePath(path, locale) {
  const { path: bare } = splitLocale(path);
  const loc = siteLocale(locale) || DEFAULT_LOCALE;
  if (loc === DEFAULT_LOCALE) return bare;
  return bare === '/' ? `/${loc}` : `/${loc}${bare}`;
}

/** Splits '/sw/reports?x=1' into { locale: 'sw', path: '/reports?x=1' }; no prefix → English. */
function splitLocale(path) {
  const p = String(path || '/');
  const m = p.match(/^\/([a-z]{2,3})(?=\/|$|\?|#)(.*)$/);
  if (m && SITE_LOCALES.includes(m[1])) {
    const rest = m[2] || '/';
    return { locale: m[1], path: rest.startsWith('/') ? rest : `/${rest}` };
  }
  return { locale: DEFAULT_LOCALE, path: p.startsWith('/') ? p : `/${p}` };
}

module.exports = {
  SITE_LOCALES,
  DEFAULT_LOCALE,
  CMS_FOR,
  SITE_FOR_CMS,
  OLD_CODES,
  LOCALE_COOKIE,
  OLD_LOCALE_COOKIE,
  siteLocale,
  cmsFor,
  localePath,
  splitLocale,
};
