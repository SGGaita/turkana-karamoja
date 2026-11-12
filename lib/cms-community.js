/**
 * Community pages from Karamoja Core (water points, assistance sites, planting advisories, programmes, initiatives).
 * FE-19. Output uses the shapes the pages already render (wp-mappers.js).
 */
import { getLanguageLabel } from './languages';
import { htmlToText, formatDay, pickLocale, alertFromCms } from './cms-alerts';
import { isHealthAlert } from './community-services';
import { buildSlugPath } from './slug';
import { getAll, getPageAllLocales, inAllLocales, isPublishedPage } from './cms';

const str = (v) => (typeof v === 'string' ? v : '');
const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
const num = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

const TAG_COLORS = {
  Radio: '#2E7BB4',
  Water: '#2E7BB4',
  Livelihoods: '#E87010',
  Health: '#D63030',
  Agriculture: '#2E8B57',
};

function place(dto) {
  const loc = dto?.location && typeof dto.location === 'object' ? dto.location : {};
  return { locationLabel: str(loc.label), lat: num(loc.lat), lng: num(loc.lng) };
}

/** Freshness: the date the service data was last confirmed (Core falls back to the last edit). */
function updated(dto) {
  return formatDay(str(dto.last_verified) || str(dto.modified));
}

export function waterPointFromCms(dto) {
  if (!dto?.id) return null;
  return {
    id: dto.id,
    name: str(dto.title),
    pointType: str(dto.type),
    status: str(dto.status),
    region: str(dto.region),
    ...place(dto),
    desc: htmlToText(dto.description) || htmlToText(dto.excerpt),
    lastUpdated: updated(dto),
    stale: Boolean(dto.stale),
  };
}

export function assistanceSiteFromCms(dto) {
  if (!dto?.id) return null;
  return {
    id: dto.id,
    name: str(dto.title),
    siteType: str(dto.type),
    agency: str(dto.agency),
    region: str(dto.region),
    ...place(dto),
    desc: htmlToText(dto.description) || htmlToText(dto.excerpt),
    schedule: str(dto.schedule),
    contact: str(dto.contact),
    lastUpdated: updated(dto),
    stale: Boolean(dto.stale),
  };
}

export function plantingFromCms(dto) {
  if (!dto?.id) return null;
  return {
    id: dto.id,
    title: str(dto.title),
    crop: str(dto.crop) || str(dto.title),
    season: str(dto.season),
    region: str(dto.region),
    desc: htmlToText(dto.description) || htmlToText(dto.excerpt),
    windowStart: str(dto.window_start),
    windowEnd: str(dto.window_end),
    status: str(dto.status) || 'optimal',
    agroDealer: str(dto.agro_dealer),
    langs: list(dto.languages),
  };
}

export function programmeFromCms(dto) {
  if (!dto?.id) return null;
  return {
    id: dto.id,
    img: str(dto.image),
    title: str(dto.title),
    desc: htmlToText(dto.description) || htmlToText(dto.excerpt),
    langs: list(dto.languages),
    color: str(dto.color) || '#2E7BB4',
    href: str(dto.link),
  };
}

export function initiativeFromCms(dto) {
  if (!dto?.id) return null;
  const title = str(dto.title);
  const tag = str(dto.tag) || 'Community';
  return {
    id: dto.id,
    title,
    desc: htmlToText(dto.excerpt),
    content: str(dto.content),
    img: str(dto.image),
    tag,
    tagColor: TAG_COLORS[tag] || '#C1440E',
    date: formatDay(dto.date),
    dateRaw: str(dto.date) || null,
    slugPath: buildSlugPath(title, dto.id),
    freq: str(dto.radio?.frequency),
    lang: str(dto.radio?.languages),
    times: str(dto.radio?.times),
    files: (Array.isArray(dto.documents) ? dto.documents : []).filter((d) => d && d.url).map((d) => ({
      url: d.url,
      size: str(d.size),
      language: str(d.language) || 'en',
      label: str(d.label) || getLanguageLabel(str(d.language) || 'en'),
      filename: '',
    })),
  };
}

/** Items picked in a page's reference field, in that order; all items when nothing was picked. */
export function chosen(refs, all) {
  const ids = (Array.isArray(refs) ? refs : []).map((r) => Number(r?.id)).filter(Boolean);
  if (!ids.length) return all;
  const byId = new Map(all.map((x) => [Number(x.id), x]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/**
 * Props for a CMS list page: the collection mapped per language, plus the page's sections once it has been saved.
 *
 * @throws {CmsError} when English cannot be loaded (see cmsStaticProps)
 */
export async function listCmsProps(collection, pageSlug, map, params = {}) {
  const [byLocale, pages] = await Promise.all([
    inAllLocales((l) => getAll(collection, params, l)),
    pageSlug ? getPageAllLocales(pageSlug).catch(() => null) : null,
  ]);
  const itemsByLocale = {};
  Object.entries(byLocale).forEach(([l, rows]) => {
    itemsByLocale[l] = (Array.isArray(rows) ? rows : []).map(map).filter(Boolean);
  });
  sameSlugs(itemsByLocale);
  return {
    itemsByLocale,
    pageByLocale: isPublishedPage(pages?.en) ? pages : null,
  };
}

/**
 * The page copy in the reader's language: saved sections when the page has been saved in Karamoja → Website pages,
 * else the text the website showed before. A section switched off reads as empty.
 */
export function pageCopy(pageByLocale, locale, defaults = {}) {
  const sections = pickLocale(pageByLocale, locale)?.sections || null;
  const shown = (key) => !sections || sections[key]?.enabled !== false;
  const copy = (key) => {
    if (!shown(key)) return {};
    return sections ? sections[key] || {} : defaults[key] || {};
  };
  const hero = copy('hero');
  return {
    copy,
    shown,
    hero: {
      title: str(hero.title) || str(defaults.hero?.title),
      subtitle: sections ? str(hero.subtitle) : str(defaults.hero?.subtitle),
      image: str(hero.image?.url) || str(defaults.hero?.image),
    },
  };
}

/** Active health and nutrition advisories (the Health page lists only these). */
export function healthAlertFromCms(dto) {
  const a = alertFromCms(dto);
  return a && a.active && isHealthAlert(a) ? a : null;
}

/** Splits text so a hotline number after the word "hotline" (e.g. "hotline 1192") can be a tap-to-call link. */
export function telParts(text) {
  const s = str(text);
  const m = s.match(/(hotline\s+)(\+?\d[\d\s-]{1,14}\d)/i);
  if (!m) return [{ text: s }];
  const start = m.index + m[1].length;
  const end = start + m[2].length;
  return [{ text: s.slice(0, start) }, { text: m[2], tel: m[2].replace(/[\s-]/g, '') }, { text: s.slice(end) }].filter((p) => p.text);
}

/**
 * Links use the English title's slug in every language, so a translated title never sends readers through a redirect
 * (the detail page's canonical address, and the one instant updates rebuild, is the English one).
 */
export function sameSlugs(itemsByLocale) {
  const en = new Map((itemsByLocale?.en || []).map((x) => [String(x.id), x.slugPath]));
  Object.values(itemsByLocale || {}).forEach((rows) => {
    (rows || []).forEach((x) => {
      if (x && x.slugPath && en.has(String(x.id))) x.slugPath = en.get(String(x.id));
    });
  });
  return itemsByLocale;
}
