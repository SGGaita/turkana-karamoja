/**
 * Home page from CMS sections (FE-16, first part): hero, about, map and get-involved copy, and which sections show.
 *
 * Output uses the shapes the existing components already read (mapHero / mapHomeSections), so the components do not
 * change. Footer copy still comes from the legacy home sections until site settings are wired in (FE-15).
 */
import { SITE_LOCALES_FOR } from './cms';
import { buildSlugPath } from './slug';

const PALETTE = {
  amber: '#D4A96A',
  orange: '#E87010',
  red: '#D63030',
  green: '#2E8B57',
  blue: '#2E7BB4',
  earth: '#3D2B1F',
};

const str = (v) => (typeof v === 'string' ? v : '');

function link(v, fallbackHref) {
  return { label: str(v?.label), href: str(v?.href) || fallbackHref };
}

/** Which home sections show (from the English page; hidden sections return { enabled: false }). */
export function homeVisibility(page) {
  const s = page?.sections || {};
  const on = (key) => s[key]?.enabled !== false;
  return {
    hero: on('hero'),
    overview: on('overview'),
    about: on('about'),
    map: on('map'),
    warnings: on('warnings'),
    initiatives: on('initiatives'),
    getInvolved: on('get_involved'),
  };
}

/**
 * Hero in the mapHero() shape.
 *
 * @param {object} page          CMS page
 * @param {object} legacyHero    current hero (its photo is kept until one is chosen in wp-admin)
 */
export function heroFromCms(page, legacyHero = null) {
  const h = page?.sections?.hero || {};
  const o = page?.sections?.overview || {};
  return {
    eyebrow: str(h.eyebrow),
    title: str(h.title),
    titleAccent: str(h.title_accent),
    subtitle: str(h.subtitle),
    // No photo is copied into the CMS; keep the current one until an editor picks one in the Media Library.
    backgroundImage: str(h.image?.url) || str(legacyHero?.backgroundImage),
    primaryCta: link(h.primary_cta, '/early-warnings'),
    secondaryCta: link(h.secondary_cta, '#about'),
    overview: overviewFromCms(o),
  };
}

const count = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.trunc(Number(v))) : 0);

/**
 * "What's happening now": the live warning count, and the editors' figures only when they are dated (audit E7).
 */
export function overviewFromCms(o = {}) {
  const asOf = /^\d{4}-\d{2}-\d{2}$/.test(str(o.as_of)) ? o.as_of : '';
  const w = o.warnings && typeof o.warnings === 'object' ? o.warnings : {};
  return {
    title: str(o.title),
    subtitle: str(o.subtitle),
    footer: str(o.note),
    asOf,
    warnings: {
      label: str(o.warnings_label),
      total: count(w.total),
      red: count(w.red),
      orange: count(w.orange),
      yellow: count(w.yellow),
      green: count(w.green),
    },
    metrics: asOf
      ? (Array.isArray(o.metrics) ? o.metrics : [])
        .map((m) => ({
          val: str(m?.value),
          label: str(m?.label),
          sub: str(m?.note),
          color: PALETTE[m?.color] || (/^#[0-9a-f]{6}$/i.test(str(m?.color)) ? m.color : PALETTE.amber),
        }))
        .filter((m) => m.val || m.label)
      : [],
  };
}

/** Whether the overview panel has anything to show. */
export function overviewHasContent(ov) {
  return Boolean(ov && ((ov.warnings?.label && ov.warnings.total >= 0) || ov.metrics?.length));
}

/**
 * Initiatives chosen in wp-admin, in the shape InitiativesSection reads. Items already loaded from the old endpoint
 * are reused (they carry the tag and photo); others are built from the CMS data.
 */
export function initiativesFromCms(page, legacyList = []) {
  const items = Array.isArray(page?.sections?.initiatives?.items) ? page.sections.initiatives.items : [];
  const byId = new Map((legacyList || []).map((x) => [Number(x.id), x]));
  return items
    .filter((it) => it && it.id)
    .map((it) => byId.get(Number(it.id)) || {
      id: it.id,
      title: str(it.title),
      desc: str(it.excerpt),
      img: str(it.image),
      tag: 'Community',
      tagColor: '#C1440E',
      slugPath: buildSlugPath(str(it.title), it.id),
    });
}

/** Initiatives heading and button. */
export function initiativesCopyFromCms(page) {
  const i = page?.sections?.initiatives || {};
  return {
    eyebrow: str(i.eyebrow),
    title: str(i.title),
    subtitle: str(i.subtitle),
    buttonLabel: str(i.button?.label),
    buttonHref: str(i.button?.href) || '/community',
  };
}

/**
 * Home copy in the mapHomeSections() shape, on top of the legacy copy (for the footer).
 */
export function homeSectionsFromCms(page, legacy = {}) {
  const s = page?.sections || {};
  const a = s.about || {};
  const m = s.map || {};
  const g = s.get_involved || {};
  return {
    ...legacy,
    about: {
      eyebrow: str(a.eyebrow),
      titleLine1: str(a.title_line_1),
      titleLine2: str(a.title_line_2),
      description: str(a.description),
      partnerCountLabel: str(a.partner_count_label),
      ctaLabel: str(a.cta?.label),
      ctaHref: str(a.cta?.href) || '/about',
      highlights: (Array.isArray(a.highlights) ? a.highlights : [])
        .map((x) => ({ title: str(x?.title), desc: str(x?.text) }))
        .filter((x) => x.title || x.desc),
    },
    map: { eyebrow: str(m.eyebrow), title: str(m.title), subtitle: str(m.subtitle) },
    getInvolved: {
      eyebrow: str(g.eyebrow),
      heading: str(g.heading),
      body: str(g.body),
      buttonLabel: str(g.button?.label),
      buttonHref: str(g.button?.href) || '/partners-stakeholders',
    },
    initiatives: initiativesCopyFromCms(page),
  };
}

/**
 * Props for the home page from CMS pages in every language.
 *
 * @param {Record<string, object>} pages          CMS locale → page (from getPageAllLocales)
 * @param {object} legacyHeroByLocale             website locale → legacy hero
 * @param {object} legacyHomeByLocale             website locale → legacy home sections
 * @returns {{heroByLocale: object, homeSectionsByLocale: object, homeVisible: object}}
 */
export function homeProps(pages, legacyHeroByLocale = {}, legacyHomeByLocale = {}, legacyInitiatives = []) {
  const heroByLocale = {};
  const homeSectionsByLocale = {};
  Object.entries(SITE_LOCALES_FOR).forEach(([cms, siteLocales]) => {
    const page = pages[cms] || pages.en;
    siteLocales.forEach((loc) => {
      heroByLocale[loc] = heroFromCms(page, legacyHeroByLocale[loc] || legacyHeroByLocale.en);
      homeSectionsByLocale[loc] = homeSectionsFromCms(page, legacyHomeByLocale[loc] || legacyHomeByLocale.en || {});
    });
  });
  const chosen = initiativesFromCms(pages.en, legacyInitiatives);
  return {
    heroByLocale,
    homeSectionsByLocale,
    homeVisible: homeVisibility(pages.en),
    // Empty choice → keep the latest from the old endpoint (as before).
    initiatives: chosen.length ? chosen : legacyInitiatives,
  };
}
