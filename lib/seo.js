/**
 * SEO essentials (FE-23): the site's public address, whether search engines may index it, canonical
 * addresses, the sitemap, robots.txt and structured data for alerts.
 *
 * Indexing is OFF unless NEXT_PUBLIC_ALLOW_INDEXING is "true": the sandbox demo holds test data and must not
 * appear in search results. Set it (with NEXT_PUBLIC_SITE_URL) on production only.
 */
import { APP_FULL_NAME } from './branding';
import { buildSlugPath, slugify } from './slug';
import { htmlToText } from './cms-alerts';
import { DEFAULT_LOCALE, SITE_LOCALES, localePath } from './locales';

/** The site's public address, no trailing slash ('' when not configured). */
export function siteUrl(env = process.env) {
  return String(env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
}

/** May search engines index this deployment? */
export function indexingAllowed(env = process.env) {
  return String(env.NEXT_PUBLIC_ALLOW_INDEXING || '').trim().toLowerCase() === 'true' && siteUrl(env) !== '';
}

/** Absolute address of a path, or '' when the site address is not configured. */
export function absoluteUrl(path, env = process.env) {
  const base = siteUrl(env);
  if (!base) return '';
  if (/^https?:\/\//i.test(String(path || ''))) return String(path);
  return base + canonicalPath(path);
}

/** The path without query string or fragment ("/" for the home page; no trailing slash otherwise). */
export function canonicalPath(asPath) {
  const p = String(asPath || '/').split(/[?#]/)[0] || '/';
  const clean = (`/${p}`).replace(/\/{2,}/g, '/');
  return clean.length > 1 ? clean.replace(/\/+$/, '') : '/';
}

/** Public pages that are always in the sitemap. */
export const STATIC_PATHS = [
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
];

/** Pages that must never be indexed (account links, offline and error pages). */
export const NOINDEX_PATHS = [
  '/partners-stakeholders/set-password',
  '/partners-stakeholders/reset-password',
  '/partners-stakeholders/forgot-password',
  '/offline',
  '/404',
  '/500',
];

const day = (v) => {
  const d = v ? new Date(String(v).replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(String(v)) ? '' : 'Z')) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : '';
};

/**
 * Sitemap entries from the CMS collections (as karamoja/v1 returns them, English).
 *
 * @param {{alerts?:any[], reports?:any[], organizations?:any[], initiatives?:any[], helpSlugs?:string[]}} c
 * @returns {{path:string, lastmod:string}[]}
 */
export function sitemapEntries(c = {}) {
  const out = STATIC_PATHS.map((path) => ({ path, lastmod: '' }));
  const add = (path, item) => out.push({ path, lastmod: day(item?.modified || item?.date) });
  for (const a of c.alerts || []) if (a?.id && a.title) add(`/early-warnings/${buildSlugPath(a.title, a.id)}`, a);
  for (const r of c.reports || []) if (r?.id && r.title) add(`/reports/${buildSlugPath(r.title, r.id)}`, r);
  for (const o of c.organizations || []) if (o?.id && o.title) add(`/organizations/${slugify(o.title) || o.id}`, o);
  for (const i of c.initiatives || []) if (i?.id && i.title) add(`/community/${buildSlugPath(i.title, i.id)}`, i);
  for (const s of c.helpSlugs || []) if (s) out.push({ path: `/help/${s}`, lastmod: '' });
  const seen = new Set();
  return out.filter((e) => (seen.has(e.path) ? false : seen.add(e.path)));
}

/**
 * hreflang links for a page (FE-26): one per ready language that has a tag search engines know (Core gives English
 * and Kiswahili one), plus x-default → English. Empty when only one language would be listed.
 *
 * @param {string} path      Page path without language prefix.
 * @param {{code: string, hreflang?: string}[]} languages Ready languages (Site settings → Languages).
 * @returns {{hreflang: string, href: string}[]}
 */
export function hreflangLinks(path, languages = [], env = process.env) {
  if (!siteUrl(env)) return [];
  const tagged = languages.filter((l) => l && l.hreflang && SITE_LOCALES.includes(l.code));
  if (tagged.length < 2) return [];
  const links = tagged.map((l) => ({ hreflang: l.hreflang, href: absoluteUrl(localePath(path, l.code), env) }));
  links.push({ hreflang: 'x-default', href: absoluteUrl(localePath(path, DEFAULT_LOCALE), env) });
  return links;
}

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * sitemap.xml text: every page in every ready language (FE-26), each with its hreflang alternates.
 *
 * @param {{path: string, lastmod: string}[]} entries
 * @param {object} env
 * @param {{code: string, hreflang?: string}[]} languages Ready languages; English only when not given.
 */
export function sitemapXml(entries, env = process.env, languages = [{ code: DEFAULT_LOCALE, hreflang: 'en' }]) {
  const base = siteUrl(env);
  const codes = languages.map((l) => l.code).filter((c) => SITE_LOCALES.includes(c));
  if (!codes.includes(DEFAULT_LOCALE)) codes.unshift(DEFAULT_LOCALE);
  const urls = [];
  for (const e of entries) {
    const alternates = hreflangLinks(e.path, languages, env)
      .map((a) => `<xhtml:link rel="alternate" hreflang="${xml(a.hreflang)}" href="${xml(a.href)}"/>`)
      .join('');
    for (const code of codes) {
      const loc = xml(base + localePath(e.path, code));
      urls.push(`  <url><loc>${loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}${alternates}</url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

/** robots.txt text: everything blocked unless indexing is allowed. */
export function robotsTxt(env = process.env) {
  if (!indexingAllowed(env)) {
    return 'User-agent: *\nDisallow: /\n';
  }
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/'];
  for (const p of NOINDEX_PATHS.filter((x) => x.startsWith('/partners-stakeholders/') || x === '/offline')) {
    for (const code of SITE_LOCALES) lines.push(`Disallow: ${localePath(p, code)}`);
  }
  lines.push('', `Sitemap: ${siteUrl(env)}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}

/**
 * schema.org SpecialAnnouncement for an alert (karamoja/v1 alert, English).
 *
 * @param {any} dto Alert from the CMS.
 * @param {string} url Absolute address of the alert page ('' when unknown).
 * @returns {object|null}
 */
export function alertJsonLd(dto, url = '') {
  if (!dto?.id || !dto.title) return null;
  const text = htmlToText(String(dto.body || ''));
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    name: String(dto.title),
    text: text.slice(0, 5000) || undefined,
    datePosted: day(dto.issued || dto.date) || undefined,
    expires: dto.validity === 'ongoing' ? undefined : (day(dto.valid_to) || undefined),
    url: url || undefined,
    announcementLocation: dto.area ? { '@type': 'AdministrativeArea', name: String(dto.area) } : undefined,
    spatialCoverage: dto.area ? { '@type': 'Place', name: String(dto.area) } : undefined,
    publisher: { '@type': 'Organization', name: String(dto.source || dto.organization?.name || APP_FULL_NAME) },
  };
  return JSON.parse(JSON.stringify(ld)); // Drops the undefined keys.
}

/**
 * FAQPage structured data for /help/faq (FE-13): every question with its answer as plain text.
 *
 * @param {Array<{items: Array<{question: string, answer: string}>}>} categories
 */
export function faqJsonLd(categories) {
  const entities = (Array.isArray(categories) ? categories : [])
    .flatMap((c) => (Array.isArray(c?.items) ? c.items : []))
    .map((i) => ({ q: String(i?.question || '').trim(), a: htmlToText(String(i?.answer || '')) }))
    .filter((i) => i.q && i.a)
    .map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } }));
  return entities.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities } : null;
}
