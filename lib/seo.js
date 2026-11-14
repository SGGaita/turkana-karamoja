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

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** sitemap.xml text. */
export function sitemapXml(entries, env = process.env) {
  const base = siteUrl(env);
  const urls = entries.map((e) => `  <url><loc>${xml(base + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/** robots.txt text: everything blocked unless indexing is allowed. */
export function robotsTxt(env = process.env) {
  if (!indexingAllowed(env)) {
    return 'User-agent: *\nDisallow: /\n';
  }
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/'];
  for (const p of NOINDEX_PATHS.filter((x) => x.startsWith('/partners-stakeholders/') || x === '/offline')) lines.push(`Disallow: ${p}`);
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
