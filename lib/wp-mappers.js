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


function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
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
  };
}

/** Compact shape for home WarningsStrip cards */
export function toStripAlert(alert) {
  const body = alert.body || '';
  const desc = body.length > 140 ? `${body.slice(0, 137)}…` : body;
  return {
    color: alert.color,
    bg: alert.bg,
    border: alert.color,
    level: alert.level,
    title: alert.title,
    area: alert.area,
    desc,
    issued: alert.issued,
    valid: alert.valid,
  };
}

export function mapReport(post) {
  const acf = post.acf || {};
  const tag = acf.tag || 'Report';
  const tagColor = TAG_COLORS[tag] || '#2E7BB4';
  return {
    id: post.id,
    iconBg: `${tagColor}22`,
    tag,
    tagColor,
    title: stripHtml(post.title?.rendered),
    desc: acf.description || stripHtml(post.excerpt?.rendered) || '',
    orgs: parseOrgs(acf.partner_orgs),
    date: acf.publication_date ? formatDate(acf.publication_date) : formatDate(post.date),
    isNew: Boolean(acf.is_new),
    isUpdated: Boolean(acf.is_updated),
    size: acf.file_size || '',
    fileUrl: acf.file_url || null,
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
  };
}

export function mapOrganization(post) {
  const acf = post.acf || {};
  return {
    id: post.id,
    abbr: acf.abbreviation || stripHtml(post.title?.rendered).slice(0, 12),
    name: stripHtml(post.title?.rendered),
    type: acf.org_type || 'Partner',
    country: acf.country_code || 'INT',
    portalUrl: acf.portal_url || null,
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
    quickFacts: (raw.quick_facts || raw.quickFacts || []).map((f) => ({
      label: f.label || '',
      value: f.value || '',
      detail: f.detail || '',
    })),
  };
}

export function mapSiteHeader(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    branding: {
      title: raw.branding?.title || raw.site_title || 'Turkana – Karamoja',
      tagline: raw.branding?.tagline || raw.site_tagline || 'Climate Hub',
      logoUrl: raw.branding?.logo_url || raw.branding?.logoUrl || '',
    },
    topbar: {
      statusText: raw.topbar?.status_text || raw.topbar?.statusText || '',
      links: (raw.topbar?.links || []).map((l) => ({
        label: l.label,
        href: l.href || '#',
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

export function buildAdvisoryPayload(form) {
  const actions = form.content
    ? form.content
        .split('\n')
        .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean)
    : [];

  return {
    title: form.title,
    status: 'draft',
    content: form.content,
    acf: {
      alert_level: form.level || 'yellow',
      area: form.region,
      body: form.content,
      source: form.org,
      issued_date: new Date().toISOString().slice(0, 10),
      valid_until: form.validPeriod,
      actions: actions.length ? actions.map((text) => ({ action: text })) : [],
    },
  };
}
