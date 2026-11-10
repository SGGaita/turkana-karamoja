/**
 * Website shell from Karamoja → Site settings (karamoja/v1/globals). FE-15.
 *
 * Header output uses the mapSiteHeader() shape, so Navbar does not change. Footer, helplines, languages and SEO get
 * their own small shapes. Pure functions: tested in tests/cms-globals.test.mjs.
 */
import { isRetiredLink } from './topbar-links';

const str = (v) => (typeof v === 'string' ? v : '');
const rows = (v) => (Array.isArray(v) ? v : []);

function link(l) {
  return l && typeof l === 'object' && str(l.href) ? { label: str(l.label), href: str(l.href), external: Boolean(l.external) } : null;
}

/** Site settings that have been saved at least once in wp-admin. */
export function isPublishedGlobals(g) {
  return Boolean(g && typeof g === 'object' && g.sections && g.updated_at);
}

/**
 * Header in the mapSiteHeader() shape.
 *
 * @param {object} g             globals response
 * @param {object} legacyHeader  current header (its logo is kept until one is chosen in wp-admin; its menu if the CMS
 *                               has none)
 */
export function headerFromGlobals(g, legacyHeader = null) {
  const s = g?.sections || {};
  const b = s.branding || {};
  const t = s.topbar || {};
  const n = s.navigation || {};
  const menu = rows(n.menu).map(link).filter(Boolean);
  const cta = link(n.cta);
  return {
    branding: {
      title: str(b.site_name),
      tagline: str(b.tagline),
      logoUrl: str(b.logo?.url) || str(legacyHeader?.branding?.logoUrl),
    },
    topbar: {
      enabled: t.enabled !== false,
      statusText: t.enabled === false ? '' : str(t.status_text),
      links: t.enabled === false ? [] : rows(t.links).map((r) => link(r?.link)).filter((l) => l && !isRetiredLink(l)),
    },
    navLinks: menu.length ? menu : rows(legacyHeader?.navLinks),
    cta: cta || { label: '', href: '' },
  };
}

/** Footer content. */
export function footerFromGlobals(g) {
  const s = g?.sections || {};
  const f = s.footer || {};
  const b = s.branding || {};
  const column = (title, links) => ({
    title: str(title),
    links: rows(links).map((r) => link(r?.link)).filter((l) => l && !isRetiredLink(l)),
  });
  return {
    enabled: f.enabled !== false,
    siteName: str(b.site_name),
    tagline: str(b.tagline),
    about: str(f.about),
    partners: rows(f.partners).map((p) => str(p?.name)).filter(Boolean),
    columns: [column(f.column1_title, f.column1_links), column(f.column2_title, f.column2_links)].filter((c) => c.title || c.links.length),
    regionsTitle: str(f.regions_title),
    regions: rows(f.regions).map((r) => str(r?.name)).filter(Boolean),
    contactTitle: str(f.contact_title),
    contactLink: link(f.contact_link),
    contactLines: rows(f.contact_lines).map((r) => ({ text: str(r?.text), note: str(r?.note) })).filter((r) => r.text),
    copyright: str(b.copyright),
    social: s.social?.enabled === false ? [] : rows(s.social?.links)
      .map((r) => ({ network: str(r?.network), url: str(r?.url?.href) || str(r?.url) }))
      .filter((r) => /^https:\/\//.test(r.url)),
  };
}

/** Toll-free helplines. */
export function hotlinesFromGlobals(g) {
  const h = g?.sections?.hotlines || {};
  if (h.enabled === false) return [];
  return rows(h.lines)
    .map((l) => ({ label: str(l?.label), country: str(l?.country), display: str(l?.display), tel: str(l?.tel).replace(/[^\d+]/g, '') }))
    .filter((l) => l.display && l.tel);
}

/** Website language codes for each CMS language (the combined Turkana/Karamojong locale is "tu" on the website). */
const SITE_CODE = { en: 'en', sw: 'sw', pk: 'pk', tk: 'tu' };

/** Languages offered in the picker: English always, the others once marked ready in Site settings → Languages. */
export function languagesFromGlobals(g) {
  return rows(g?.languages)
    .filter((l) => l && SITE_CODE[l.code] && (l.code === 'en' || l.enabled))
    .map((l) => ({ code: SITE_CODE[l.code], cms: l.code, nativeName: str(l.label) || l.code, htmlLang: str(l.html_lang) || l.code }));
}

const LEGEND_STYLES = {
  RED: { color: '#D63030', bg: '#FFF0F0' },
  ORANGE: { color: '#E87010', bg: '#FFF4EC' },
  YELLOW: { color: '#B8860B', bg: '#FFFBEC' },
  GREEN: { color: '#2E8B57', bg: '#F0FFF6' },
};

/** Alert colour guide (Site settings → Alert legend); null when it has no text. */
export function legendFromGlobals(g) {
  const l = g?.sections?.alert_legend || {};
  if (l.enabled === false) return null;
  const items = Object.keys(LEGEND_STYLES)
    .map((level) => ({
      level,
      ...LEGEND_STYLES[level],
      title: str(l[`${level.toLowerCase()}_title`]),
      description: str(l[`${level.toLowerCase()}_description`]),
    }))
    .filter((i) => i.title || i.description);
  return items.length ? { title: str(l.title), items } : null;
}

/** Defaults for <head>. */
export function seoFromGlobals(g) {
  const s = g?.sections?.seo || {};
  return {
    titleSuffix: str(s.title_suffix),
    description: str(s.description),
    shareImage: str(s.share_image?.url),
  };
}

/**
 * Everything the shell needs, or null when Site settings have not been saved yet (the old sources stay in use).
 */
export function shellFromGlobals(g, legacyHeader = null) {
  if (!isPublishedGlobals(g)) return null;
  return {
    header: headerFromGlobals(g, legacyHeader),
    footer: footerFromGlobals(g),
    hotlines: hotlinesFromGlobals(g),
    languages: languagesFromGlobals(g),
    seo: seoFromGlobals(g),
    legend: legendFromGlobals(g),
  };
}
