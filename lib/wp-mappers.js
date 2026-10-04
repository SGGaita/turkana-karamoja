import { HUB_LANGUAGES, getLanguageLabel } from './languages';
import { HUB_MAP_LOCATIONS } from './hub-locations';
import { formatAdvisoryValidity } from './advisory-validity';
import { buildSlugPath } from './slug';
import { resolveTopbarLink } from './topbar-links';
import { APP_NAME, APP_TAGLINE } from './branding';

const LEGACY_TITLES = new Set([
  'Turkana – Karamoja',
  'Turkana–Karamoja',
  'Turkana-Karamoja',
  'Turkana–Karamoja Climate Hub',
  'Turkana-Karamoja Climate Hub',
  'Karamoja Climate Change Knowledge Hub',
]);

const LEGACY_TAGLINES = new Set(['Climate Hub', 'Climate Change Knowledge Hub']);

function normalizeBrandingTitle(title) {
  const value = String(title || '').trim();
  if (!value || LEGACY_TITLES.has(value)) return APP_NAME;
  return value;
}

function normalizeBrandingTagline(tagline) {
  const value = String(tagline || '').trim();
  if (!value || LEGACY_TAGLINES.has(value)) return APP_TAGLINE;
  return value;
}

export { HUB_LANGUAGES, getLanguageLabel };

export function parseReportFiles(acf = {}) {
  let raw = acf.report_files;
  if (typeof raw === 'string' && raw) {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  let files = Array.isArray(raw)
    ? raw.filter((f) => f && f.url).map((f) => ({
      url: f.url,
      size: f.size || '',
      language: f.language || 'en',
      label: f.label || getLanguageLabel(f.language),
      filename: f.filename || '',
    }))
    : [];

  if (!files.length && acf.file_url) {
    files = [{
      url: acf.file_url,
      size: acf.file_size || '',
      language: 'en',
      label: 'English',
      filename: '',
    }];
  }

  return files;
}

const LEVEL_STYLES = {
  RED: { color: '#D63030', bg: '#FFF0F0' },
  ORANGE: { color: '#E87010', bg: '#FFF4EC' },
  YELLOW: { color: '#B8860B', bg: '#FFFBEC' },
  GREEN: { color: '#2E8B57', bg: '#F0FFF6' },
};

const TAG_COLORS = {
  SITREP: '#2E7BB4',
  Assessment: '#2E8B57',
  HAP: '#E87010',
  Monitoring: '#2E7BB4',
  WASH: '#2E8B57',
  Livelihoods: '#E87010',
};


/** Decode the handful of HTML entities WordPress commonly renders into titles/excerpts
 *  (e.g. "AT&#038;T" -> "AT&T"). No DOM available at build time, so this is done by hand. */
function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&(#39|apos);/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html) {
  if (!html) return '';
  return decodeEntities(html.replace(/<[^>]+>/g, '')).trim();
}

function formatDate(isoOrText) {
  if (!isoOrText) return '';
  const d = new Date(isoOrText);
  if (Number.isNaN(d.getTime())) return String(isoOrText);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function featuredImageUrl(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  return media?.source_url || null;
}

function parseActions(acf) {
  if (!acf?.actions) return [];
  if (Array.isArray(acf.actions)) {
    return acf.actions.map((a) => (typeof a === 'string' ? a : a?.action || a?.text || '')).filter(Boolean);
  }
  return [];
}

function parseOrgs(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

function parseKeywords(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((k) => (typeof k === 'string' ? k : k?.label || k?.name || '')).filter(Boolean);
  }
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

export { parseKeywords };

function parseLangs(acf) {
  if (!acf?.languages) return ['English'];
  if (Array.isArray(acf.languages)) {
    return acf.languages.map((l) => (typeof l === 'string' ? l : l?.language || '')).filter(Boolean);
  }
  return String(acf.languages).split(',').map((s) => s.trim()).filter(Boolean);
}

export function mapAlert(post) {
  const acf = post.acf || {};
  const levelRaw = (acf.alert_level || 'yellow').toString().toUpperCase();
  const level = ['RED', 'ORANGE', 'YELLOW', 'GREEN'].includes(levelRaw) ? levelRaw : 'YELLOW';
  const style = LEVEL_STYLES[level];
  const actions = parseActions(acf);

  return {
    id: post.id,
    level,
    color: style.color,
    bg: style.bg,
    title: stripHtml(post.title?.rendered),
    area: acf.area || '',
    body: acf.body || stripHtml(post.content?.rendered) || '',
    source: acf.source || '',
    issued: acf.issued_date ? formatDate(acf.issued_date) : formatDate(post.date),
    valid: acf.valid_until || '',
    actions: actions.length ? actions : [],
    advisoryType: acf.advisory_type || '',
    targetGroups: parseOrgs(acf.target_groups),
    keywords: parseKeywords(acf.keywords),
    location: {
      lat: acf.latitude ? parseFloat(acf.latitude) : null,
      lng: acf.longitude ? parseFloat(acf.longitude) : null,
      label: acf.location_label || '',
    },
    files: parseAdvisoryFiles(acf),
    publishOnMap: acf.publish_on_map === true || acf.publish_on_map === '1' || acf.publish_on_map === 1,
  };
}

const ALERT_LEVEL_TO_MAP_TIER = {
  RED: 'severe',
  ORANGE: 'moderate',
  YELLOW: 'watch',
  GREEN: 'normal',
};

const AREA_COORD_ALIASES = [
  { pattern: /turkana west|kakuma/i, lat: 3.717, lng: 34.875 },
  { pattern: /turkana north|lokichogio|kibish/i, lat: 4.207, lng: 34.348 },
  { pattern: /turkana central|kalokol/i, lat: 3.532, lng: 35.831 },
  { pattern: /turkana south/i, lat: 3.119, lng: 35.597 },
  { pattern: /turkana east|turkwel/i, lat: 3.119, lng: 35.85 },
  { pattern: /loima/i, lat: 3.35, lng: 35.1 },
  { pattern: /lodwar/i, lat: 3.119, lng: 35.597 },
  { pattern: /kaabong/i, lat: 3.517, lng: 34.133 },
  { pattern: /kotido/i, lat: 3.0, lng: 34.133 },
  { pattern: /moroto/i, lat: 2.534, lng: 34.667 },
  { pattern: /napak|nakapiripirit/i, lat: 1.908, lng: 34.972 },
  { pattern: /abim/i, lat: 2.703, lng: 33.668 },
  { pattern: /karamoja/i, lat: 2.534, lng: 34.667 },
  { pattern: /turkana/i, lat: 3.119, lng: 35.597 },
];

/** Resolve map coordinates from pinned lat/lng or area / title text. */
export function resolveAlertCoordinates(alert) {
  const lat = alert?.location?.lat;
  const lng = alert?.location?.lng;
  if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return { lat, lng };
  }

  const search = [
    alert?.location?.label,
    alert?.area,
    alert?.title,
  ].filter(Boolean).join(' ').toLowerCase();

  if (!search) return null;

  const byName = [...HUB_MAP_LOCATIONS].sort((a, b) => b.name.length - a.name.length);
  for (const loc of byName) {
    if (search.includes(loc.name.toLowerCase())) {
      return { lat: loc.lat, lng: loc.lng };
    }
  }

  for (const { pattern, lat: aliasLat, lng: aliasLng } of AREA_COORD_ALIASES) {
    if (pattern.test(search)) {
      return { lat: aliasLat, lng: aliasLng };
    }
  }

  return null;
}

export function shouldShowAlertOnMap(alert) {
  return resolveAlertCoordinates(alert) != null;
}

/** Shape for RegionalMap live advisory markers */
export function toMapAdvisoryMarker(alert, index = 0) {
  const coords = resolveAlertCoordinates(alert);
  if (!coords) return null;
  const tier = ALERT_LEVEL_TO_MAP_TIER[alert.level] || 'watch';
  const bodyText = stripHtml(alert.body || '');
  return {
    id: alert.id ?? `fallback-${index}`,
    name: alert.title,
    lat: coords.lat,
    lng: coords.lng,
    region: alert.area || alert.location.label || '',
    alertType: alert.advisoryType || alert.title,
    alertLevel: tier,
    color: alert.color,
    valid: alert.valid,
    issued: alert.issued,
    summary: bodyText.length > 160 ? `${bodyText.slice(0, 157)}…` : bodyText,
    source: alert.source || '',
    href: alert.id != null
      ? `/early-warnings/${buildSlugPath(alert.title, alert.id)}`
      : '/early-warnings',
    isLive: true,
  };
}

/** Compact shape for home WarningsStrip cards */
export function toStripAlert(alert) {
  const body = stripHtml(alert.body || '');
  const desc = body.length > 140 ? `${body.slice(0, 137)}…` : body;
  return {
    id: alert.id,
    color: alert.color,
    bg: alert.bg,
    border: alert.color,
    level: alert.level,
    title: alert.title,
    area: alert.area,
    desc,
    issued: alert.issued,
    valid: alert.valid,
    href: alert.id != null
      ? `/early-warnings/${buildSlugPath(alert.title, alert.id)}`
      : '/early-warnings',
  };
}

export function mapReport(post) {
  const acf = post.acf || {};
  const tag = acf.tag || 'Report';
  const tagColor = TAG_COLORS[tag] || '#2E7BB4';
  const files = parseReportFiles(acf);
  const primary = files.find((f) => f.language === 'en') || files[0];
  const categories = Array.isArray(acf.categories) && acf.categories.length ? acf.categories : [tag];
  return {
    id: post.id,
    iconBg: `${tagColor}22`,
    tag,
    tagColor,
    categories,
    title: stripHtml(post.title?.rendered),
    // `acf.description` (custom post meta, written directly by the plugin — not
    // ACF/CPT-support dependent) holds the full rich-HTML description and is the
    // most reliable source; `desc` is the stripped short blurb for cards/lists,
    // `content` is the full HTML for the report detail page.
    desc: stripHtml(acf.description) || stripHtml(post.excerpt?.rendered) || '',
    content: post.content?.rendered || acf.description || '',
    orgs: parseOrgs(acf.partner_orgs),
    date: acf.publication_date ? formatDate(acf.publication_date) : formatDate(post.date),
    dateRaw: acf.publication_date || post.date || null,
    isNew: Boolean(acf.is_new),
    isUpdated: Boolean(acf.is_updated),
    size: primary?.size || acf.file_size || '',
    fileUrl: primary?.url || acf.file_url || null,
    files,
    keywords: parseKeywords(acf.keywords),
    countries: Array.isArray(acf.countries) ? acf.countries : [],
    organizationId: acf.organization_id ? Number(acf.organization_id) : null,
    downloadCount: Number(acf.download_count ?? post.meta?.download_count ?? 0) || 0,
    downloadCounts: Array.isArray(acf.download_counts) ? acf.download_counts : [],
  };
}

export function mapInitiative(post) {
  const acf = post.acf || {};
  const tag = acf.tag || 'Initiative';
  const tagColor = acf.tag_color || TAG_COLORS[tag] || '#C1440E';
  const img = featuredImageUrl(post) || acf.image_url || '';
  return {
    id: post.id,
    img,
    tag,
    tagColor,
    title: stripHtml(post.title?.rendered),
    desc: acf.description || stripHtml(post.excerpt?.rendered) || '',
    link: post.link || '#',
  };
}

export function mapProgramme(post) {
  const acf = post.acf || {};
  const img = featuredImageUrl(post) || acf.image_url || '';
  return {
    id: post.id,
    img,
    title: stripHtml(post.title?.rendered),
    desc: acf.description || stripHtml(post.excerpt?.rendered) || '',
    langs: parseLangs(acf),
    color: acf.color || '#2E7BB4',
    href: acf.link_url || '',
  };
}

function parseCoordinates(acf) {
  const lat = acf?.latitude != null && acf.latitude !== '' ? parseFloat(acf.latitude) : null;
  const lng = acf?.longitude != null && acf.longitude !== '' ? parseFloat(acf.longitude) : null;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { lat, lng };
}

export function mapWaterPoint(post) {
  const acf = post.acf || {};
  const coords = parseCoordinates(acf);
  return {
    id: post.id,
    name: stripHtml(post.title?.rendered),
    pointType: acf.point_type || 'borehole',
    status: acf.status || 'functional',
    region: acf.region || '',
    locationLabel: acf.location_label || '',
    desc: acf.description || stripHtml(post.excerpt?.rendered) || '',
    lastUpdated: acf.last_updated ? formatDate(acf.last_updated) : '',
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  };
}

export function mapAssistanceSite(post) {
  const acf = post.acf || {};
  const coords = parseCoordinates(acf);
  return {
    id: post.id,
    name: stripHtml(post.title?.rendered),
    siteType: acf.site_type || 'food_distribution',
    agency: acf.agency || '',
    region: acf.region || '',
    locationLabel: acf.location_label || '',
    desc: acf.description || stripHtml(post.excerpt?.rendered) || '',
    schedule: acf.schedule || '',
    contact: acf.contact || '',
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  };
}

export function mapPlantingAdvisory(post) {
  const acf = post.acf || {};
  return {
    id: post.id,
    title: stripHtml(post.title?.rendered),
    crop: acf.crop || '',
    season: acf.season || '',
    region: acf.region || '',
    desc: acf.description || stripHtml(post.excerpt?.rendered) || '',
    windowStart: acf.window_start || '',
    windowEnd: acf.window_end || '',
    status: acf.status || 'optimal',
    agroDealer: acf.agro_dealer || '',
    langs: parseLangs(acf),
  };
}

export function toServiceMapMarker(item, kind) {
  if (item.lat == null || item.lng == null) return null;
  return {
    id: `${kind}-${item.id}`,
    name: item.name || item.title,
    lat: item.lat,
    lng: item.lng,
    region: item.region,
    status: item.status,
    pointType: item.pointType,
    siteType: item.siteType,
    agency: item.agency,
    desc: item.desc,
    schedule: item.schedule,
    contact: item.contact,
    lastUpdated: item.lastUpdated,
    kind,
  };
}

export function mapOrganization(post) {
  const acf = post.acf || {};
  return {
    id: post.id,
    abbr: acf.abbreviation || stripHtml(post.title?.rendered).slice(0, 12),
    name: stripHtml(post.title?.rendered),
    type: acf.org_type || 'Partner',
    country: acf.country_flag || acf.country_code || 'INT',
    portalUrl: acf.portal_url || null,
    description: acf.description || '',
    contactName: acf.contact_name || '',
    contactEmail: acf.contact_email || '',
    verified: acf.verification_status === 'approved',
  };
}

export function mapOrganizationDetail(raw) {
  if (!raw) return null;
  const acf = raw.acf || {};
  return {
    id: raw.id,
    abbr: acf.abbreviation || stripHtml(raw.title?.rendered).slice(0, 12),
    name: stripHtml(raw.title?.rendered),
    type: acf.org_type || 'Partner',
    country: acf.country_flag || 'INT',
    description: acf.description || '',
    contactName: acf.contact_name || '',
    contactEmail: acf.contact_email || '',
    contactPhone: acf.contact_phone || '',
    portalUrl: acf.portal_url || null,
    verified: acf.verification_status === 'approved',
  };
}

export function mapNewsPost(post) {
  const tags = post._embedded?.['wp:term']?.[0] || [];
  const tagObj = tags[0];
  const tag = tagObj?.name || 'News';
  const tagColor = TAG_COLORS[tag] || '#2E7BB4';
  const urgent = tag.toLowerCase().includes('urgent') || tag.toLowerCase().includes('community');

  return {
    id: post.id,
    iconBg: `${tagColor}22`,
    tag,
    tagColor,
    title: stripHtml(post.title?.rendered),
    desc: stripHtml(post.excerpt?.rendered) || '',
    date: formatDate(post.date),
    isNew: false,
    isUpdated: false,
    urgent,
    link: post.link,
  };
}

export function mapBulletin(post) {
  const n = mapNewsPost(post);
  return {
    title: n.title,
    desc: n.desc,
    tag: n.tag,
    date: n.date,
    urgent: n.urgent,
  };
}

export function mapCommunityInitiative(post) {
  const acf = post.acf || {};
  const terms = post._embedded?.['wp:term'] || [];
  const tags = terms.find((group) => group?.[0]?.taxonomy === 'post_tag') || terms[1] || terms[0] || [];
  const tagObj = Array.isArray(tags) ? tags[0] : null;
  const tag = tagObj?.name || 'Community';
  const tagColor = TAG_COLORS[tag] || '#C1440E';
  const img = featuredImageUrl(post) || acf.image_url || '';

  return {
    id: post.id,
    title: stripHtml(post.title?.rendered),
    desc: stripHtml(post.excerpt?.rendered) || '',
    content: post.content?.rendered || '',
    img,
    tag,
    tagColor,
    date: formatDate(post.date),
    dateRaw: post.date || null,
    slugPath: buildSlugPath(stripHtml(post.title?.rendered), post.id),
    link: post.link || '#',
    freq: acf.radio_frequency || '',
    lang: acf.radio_languages || '',
    times: acf.broadcast_times || '',
    files: parsePostFiles(acf),
  };
}

export function mapPage(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const featured = raw._embedded?.['wp:featuredmedia']?.[0];
  return {
    title: stripHtml(raw.title?.rendered || ''),
    subtitle: stripHtml(raw.excerpt?.rendered || ''),
    content: raw.content?.rendered || '',
    featuredImage: featured?.source_url || '',
  };
}

export function mapContact(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    title: raw.title || '',
    subtitle: raw.subtitle || '',
    intro: raw.intro || '',
    featuredImage: raw.featured_image || raw.featuredImage || '',
    formTitle: raw.form_title || raw.formTitle || '',
    formIntro: raw.form_intro || raw.formIntro || '',
    formRecipient: raw.form_recipient || raw.formRecipient || '',
    offices: (raw.offices || []).map((o) => ({
      name: o.name || '',
      region: o.region || '',
      address: o.address || '',
      phone: o.phone || '',
      email: o.email || '',
      hours: o.hours || '',
    })),
    contacts: (raw.contacts || []).map((c) => ({
      organization: c.organization || '',
      role: c.role || '',
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      country: c.country || '',
      website: c.website || '',
    })),
    social: (raw.social || []).map((s) => ({
      network: s.network || '',
      url: s.url || '',
      label: s.label || '',
    })),
  };
}

function mapCommunityStation(station, index, prefix = 'radio') {
  return {
    id: station.id || `${prefix}-${index}`,
    name: station.name || '',
    freq: station.frequency || station.freq || '',
    lang: station.languages || station.lang || '',
    times: station.times || '',
  };
}

function mapCommunityRegionGroup(group, index) {
  const stations = (group.stations || [])
    .map((station, stationIndex) => mapCommunityStation(station, stationIndex, `radio-${index}`))
    .filter((station) => station.name);

  return {
    country: group.country || '',
    region: group.region || '',
    stations,
  };
}

export function mapCommunityPage(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const outreachItems = (raw.outreach?.items || [])
    .map((item) => ({
      country: item.country || '',
      region: item.region || '',
      label: item.label || '',
      description: item.description || '',
    }))
    .filter((item) => item.label || item.description);

  let regions = (raw.radio?.regions || []).map(mapCommunityRegionGroup).filter((g) => g.country && g.region);

  if (!regions.length && raw.radio?.stations?.length) {
    regions = [{
      country: 'Kenya',
      region: 'Turkana',
      stations: raw.radio.stations
        .map((station, index) => mapCommunityStation(station, index))
        .filter((station) => station.name),
    }];
  }

  regions = regions.filter((group) => group.stations.length > 0);

  if (!outreachItems.length && !regions.length) return null;

  return {
    outreach: { items: outreachItems },
    radio: {
      title: raw.radio?.title || 'Partner Radio Stations',
      regions,
    },
  };
}

export function mapAlertLegend(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const items = (raw.items || [])
    .map((item) => {
      const level = (item.level || '').toString().toUpperCase();
      const style = LEVEL_STYLES[level] || LEVEL_STYLES.YELLOW;
      return {
        level,
        color: item.color || style.color,
        bg: item.bg || style.bg,
        title: item.title || '',
        description: item.description || '',
      };
    })
    .filter((item) => item.level && (item.title || item.description));

  if (!items.length) return null;

  return {
    title: raw.title || 'Alert colour guide',
    items,
  };
}

export function mapHomeSections(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const about = raw.about || {};
  const getInvolved = raw.get_involved || raw.getInvolved || {};
  const map = raw.map || {};
  const footer = raw.footer || {};
  return {
    about: {
      eyebrow: about.eyebrow || '',
      titleLine1: about.title_line_1 || about.titleLine1 || '',
      titleLine2: about.title_line_2 || about.titleLine2 || '',
      description: about.description || '',
      partnerCountLabel: about.partner_count_label || about.partnerCountLabel || 'Partner Organisations',
      ctaLabel: about.cta_label || about.ctaLabel || '',
      highlights: (about.highlights || []).map((h) => ({
        title: h.title || '',
        desc: h.desc || '',
      })),
    },
    getInvolved: {
      eyebrow: getInvolved.eyebrow || '',
      heading: getInvolved.heading || '',
      body: getInvolved.body || '',
      buttonLabel: getInvolved.button_label || getInvolved.buttonLabel || '',
    },
    map: {
      eyebrow: map.eyebrow || '',
      title: map.title || '',
      subtitle: map.subtitle || '',
    },
    footer: {
      metaDescription: footer.meta_description || footer.metaDescription || '',
      columnKaramoja: footer.column_karamoja || footer.columnKaramoja || 'Karamoja',
      columnServices: footer.column_services || footer.columnServices || 'Services',
      columnRegions: footer.column_regions || footer.columnRegions || 'Regions',
      columnContact: footer.column_contact || footer.columnContact || 'Contact',
      contactLink: footer.contact_link || footer.contactLink || 'Contact Us →',
      linksKaramoja: footer.links_karamoja || footer.linksKaramoja || [],
      linksServices: footer.links_services || footer.linksServices || [],
    },
  };
}

export function mapHero(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const overview = raw.overview || {};
  return {
    eyebrow: raw.eyebrow || '',
    title: raw.title || '',
    titleAccent: raw.title_accent || raw.titleAccent || '',
    subtitle: raw.subtitle || '',
    backgroundImage: raw.background_image || raw.backgroundImage || '',
    primaryCta: {
      label: raw.primary_cta?.label || raw.primaryCta?.label || 'Learn more',
      href: raw.primary_cta?.href || raw.primaryCta?.href || '/',
    },
    secondaryCta: {
      label: raw.secondary_cta?.label || raw.secondaryCta?.label || '',
      href: raw.secondary_cta?.href || raw.secondaryCta?.href || '#about',
    },
    overview: {
      title: overview.title || "What's happening now",
      subtitle: overview.subtitle || '',
      footer: overview.footer || '',
      metrics: (overview.metrics || []).map((m) => ({
        val: m.val || '',
        label: m.label || '',
        sub: m.sub || '',
        color: m.color || '#D4A96A',
      })),
    },
  };
}

export function mapSiteHeader(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    branding: {
      title: normalizeBrandingTitle(raw.branding?.title || raw.site_title || APP_NAME),
      tagline: normalizeBrandingTagline(raw.branding?.tagline || raw.site_tagline || APP_TAGLINE),
      logoUrl: raw.branding?.logo_url || raw.branding?.logoUrl || '',
    },
    topbar: {
      statusText: raw.topbar?.status_text || raw.topbar?.statusText || '',
      links: (raw.topbar?.links || []).map((l) => ({
        label: l.label,
        href: resolveTopbarLink(l.label, l.href),
      })),
    },
    navLinks: (raw.nav_links || raw.navLinks || []).map((l) => ({
      label: l.label,
      href: l.href || '/',
    })),
    cta: {
      label: raw.cta?.label || 'Alerts',
      href: raw.cta?.href || '/early-warnings',
    },
  };
}

function parseActionsFromHtml(html) {
  if (!html) return [];
  const actions = [];
  const liMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
  liMatches.forEach((li) => {
    const text = stripHtml(li);
    if (text) actions.push({ action: text });
  });
  if (!actions.length) {
    const plain = stripHtml(html);
    plain.split('\n').forEach((line) => {
      const text = line.replace(/^[-•\d.)\s]+/, '').trim();
      if (text) actions.push({ action: text });
    });
  }
  return actions;
}

export function parseAdvisoryFiles(acf = {}) {
  let raw = acf.advisory_files;
  if (typeof raw === 'string' && raw) {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  return Array.isArray(raw)
    ? raw.filter((f) => f && f.url).map((f) => ({
      url: f.url,
      size: f.size || '',
      language: f.language || 'en',
      label: f.label || getLanguageLabel(f.language),
      filename: f.filename || '',
    }))
    : [];
}

export function parsePostFiles(acf = {}) {
  let raw = acf.post_files;
  if (typeof raw === 'string' && raw) {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  return Array.isArray(raw)
    ? raw.filter((f) => f && f.url).map((f) => ({
      url: f.url,
      size: f.size || '',
      language: f.language || 'en',
      label: f.label || getLanguageLabel(f.language),
      filename: f.filename || '',
    }))
    : [];
}

export function buildAdvisoryPayload(form, { files = [] } = {}) {
  const situation = form.situation || form.content || '';
  const actionsHtml = form.recommendedActions || '';
  const actions = parseActionsFromHtml(actionsHtml);
  const loc = form.location || {};

  const areaLabel = [
    loc.label,
    form.region,
  ].filter(Boolean).join(' — ') || form.region || '';

  const acf = {
    alert_level: form.level || 'yellow',
    area: areaLabel,
    body: situation,
    source: form.org,
    issued_date: (form.validity?.mode === 'range' && form.validity.fromDate)
      ? form.validity.fromDate
      : new Date().toISOString().slice(0, 10),
    valid_until: form.validity ? formatAdvisoryValidity(form.validity) : (form.validPeriod || ''),
    actions: actions.length ? actions : [],
    advisory_type: form.type || '',
    target_groups: (form.targetGroups || []).join(', '),
    keywords: form.keywords || [],
    latitude: loc.lat != null ? String(loc.lat) : '',
    longitude: loc.lng != null ? String(loc.lng) : '',
    location_label: loc.label || '',
  };
  if (files.length) {
    acf.advisory_files = files;
  }
  if (form.organizationId) {
    acf.organization_id = String(form.organizationId);
  }

  return {
    title: form.title,
    status: 'draft',
    content: situation,
    acf,
  };
}

export function buildOrganizationPayload(form) {
  return {
    name: form.name,
    abbreviation: form.abbr || '',
    org_type: form.type || 'Partner',
    country: form.country || 'INT',
    contact_email: form.contactEmail,
    contact_name: form.contactName,
    contact_phone: form.contactPhone || '',
    description: form.description || '',
  };
}

export function buildReportPayload(form, { fileUrl = '', fileSize = '', files = [] } = {}) {
  const categories = (form.categories || []).map((c) => String(c).trim()).filter(Boolean);
  const acf = {
    tag: categories[0] || 'Report',
    categories,
    // Written directly to post meta by the plugin's rest_after_insert hook (not via
    // ACF/ACF-to-REST-API, which may not be installed/configured) — see
    // tk_pp_stamp_new_submission in the WordPress plugin. Kept as full rich HTML so it
    // matches what the edit form re-reads; `desc`/`content` in mapReport() derive the
    // stripped blurb and detail-page body from this same value.
    description: form.description || '',
    partner_orgs: form.org,
    file_url: fileUrl,
    file_size: fileSize,
    publication_date: new Date().toISOString().slice(0, 10),
    is_new: true,
    is_updated: false,
  };
  if (files.length) {
    acf.report_files = files;
    const primary = files.find((f) => f.language === 'en') || files[0];
    acf.file_url = primary.url;
    acf.file_size = primary.size || fileSize;
  }
  if (form.organizationId) {
    acf.organization_id = String(form.organizationId);
  }
  if (form.keywords?.length) {
    acf.keywords = form.keywords.map((k) => String(k).trim()).filter(Boolean);
  }
  if (form.countries?.length) {
    acf.countries = form.countries.map((c) => String(c).trim()).filter(Boolean);
  }

  return {
    title: form.title,
    status: 'draft',
    content: form.description || '',
    excerpt: stripHtml(form.description) || '',
    acf,
  };
}
