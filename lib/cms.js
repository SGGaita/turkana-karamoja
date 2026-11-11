/**
 * CMS client for the Karamoja Core content API (karamoja/v1). FE-11.
 *
 * Unlike lib/wordpress.js, these calls never return made-up fallback content: a failure throws a CmsError, so a page
 * regenerated with ISR keeps its last good version instead of caching an empty one. Callers that still have a legacy
 * source during the move (home page) catch the error and use it instead.
 */
import { getWpBaseUrl } from './wordpress';

/** Content languages in the CMS. */
export const CMS_LOCALES = ['en', 'sw', 'pk', 'tk'];

/** Website language codes → CMS codes ("tu" and "ng" are the combined Ng'aturkana / Nga'Karamojong locale). */
const SITE_TO_CMS = { en: 'en', sw: 'sw', pk: 'pk', tu: 'tk', ng: 'tk', tk: 'tk' };

/** Website language codes that read each CMS locale. */
export const SITE_LOCALES_FOR = { en: ['en'], sw: ['sw'], pk: ['pk'], tk: ['tu', 'ng'] };

const TIMEOUT_MS = 15000;

export class CmsError extends Error {
  constructor(message, status = 0, code = '') {
    super(message);
    this.name = 'CmsError';
    this.status = status;
    this.code = code; // WordPress error code, e.g. karamoja_not_found (item missing) vs rest_no_route (no Core).
  }
}

/** CMS locale for a website language code (unknown → en). */
export function cmsLocale(siteLocale) {
  return SITE_TO_CMS[String(siteLocale || '').toLowerCase()] || 'en';
}

/**
 * GET a karamoja/v1 route.
 *
 * @param {string} route  e.g. '/pages/home'
 * @param {object} params query parameters
 * @returns {Promise<any>} parsed JSON
 * @throws {CmsError}
 */
export async function cmsGet(route, params = {}, { fetchImpl = fetch, timeoutMs = TIMEOUT_MS } = {}) {
  const base = getWpBaseUrl();
  if (!base) throw new CmsError('CMS URL not configured (NEXT_PUBLIC_WP_BASE_URL)');
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  const url = `${base}/wp-json/karamoja/v1${route}${qs.toString() ? `?${qs}` : ''}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new CmsError(err?.name === 'AbortError' ? `CMS timed out after ${timeoutMs} ms: ${route}` : `CMS unreachable: ${err?.message || err}`);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let code = '';
    try {
      code = String((await res.json())?.code || '');
    } catch {
      /* no JSON body */
    }
    throw new CmsError(`CMS ${res.status} for ${route}`, res.status, code);
  }
  try {
    return await res.json();
  } catch {
    throw new CmsError(`CMS sent invalid JSON for ${route}`, res.status);
  }
}

/** One website page in one language. */
export function getPage(slug, siteLocale = 'en', opts) {
  return cmsGet(`/pages/${encodeURIComponent(slug)}`, { lang: cmsLocale(siteLocale) }, opts);
}

/** Site settings (header, footer, contacts…) in one language. */
export function getGlobals(siteLocale = 'en', opts) {
  return cmsGet('/globals', { lang: cmsLocale(siteLocale) }, opts);
}

/** A public collection (alerts, reports, organizations…), translated where available. */
export function getCollection(name, params = {}, siteLocale = 'en', opts) {
  return cmsGet(`/${encodeURIComponent(name)}`, { ...params, lang: cmsLocale(siteLocale) }, opts);
}

/** One published alert by id (active or not). */
export function getAlert(id, siteLocale = 'en', opts) {
  return cmsGet(`/alerts/${encodeURIComponent(String(id))}`, { lang: cmsLocale(siteLocale) }, opts);
}

/** One published community initiative by id. */
export function getInitiative(id, siteLocale = 'en', opts) {
  return cmsGet(`/initiatives/${encodeURIComponent(String(id))}`, { lang: cmsLocale(siteLocale) }, opts);
}

/** One published report by id. */
export function getReport(id, siteLocale = 'en', opts) {
  return cmsGet(`/reports/${encodeURIComponent(String(id))}`, { lang: cmsLocale(siteLocale) }, opts);
}

/**
 * Every item of a collection (pages of 50, at most 1,000 items).
 *
 * @returns {Promise<any[]>}
 */
export async function getAll(name, params = {}, siteLocale = 'en', opts) {
  const out = [];
  for (let page = 1; page <= 20; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const batch = await getCollection(name, { ...params, per_page: 50, page }, siteLocale, opts);
    if (!Array.isArray(batch)) break;
    out.push(...batch);
    if (batch.length < 50) break;
  }
  return out;
}

/**
 * The same request in every CMS language. English must load; other languages fall back to English.
 *
 * @param {(locale: string) => Promise<any>} load
 * @returns {Promise<Record<string, any>>}
 * @throws {CmsError} when English fails
 */
export async function inAllLocales(load) {
  const results = await Promise.allSettled(CMS_LOCALES.map((l) => load(l)));
  if (results[0].status !== 'fulfilled') throw results[0].reason;
  const out = {};
  CMS_LOCALES.forEach((l, i) => {
    if (results[i].status === 'fulfilled') out[l] = results[i].value;
  });
  return out;
}

/**
 * A page in every CMS language. English must load; a missing translation just falls back to English.
 *
 * @returns {Promise<Record<string, object>>} CMS locale → page
 * @throws {CmsError} when English fails
 */
export function getPageAllLocales(slug, opts) {
  return inAllLocales((l) => getPage(slug, l, opts));
}

/** A page that has been saved at least once in wp-admin (an unsaved page has no updated_at). */
export function isPublishedPage(page) {
  return Boolean(page && typeof page === 'object' && page.sections && page.updated_at);
}
