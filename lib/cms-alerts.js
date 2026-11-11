/**
 * Early warnings from Karamoja Core (karamoja/v1/alerts). FE-18.
 *
 * alertFromCms() returns the shape the pages already render (mapAlert() in wp-mappers.js) plus what the CMS adds:
 * sanitised HTML body, active/cancelled state, last updated date and the fields still in English.
 */
import { cmsLocale } from './cms';

export const LEVEL_STYLES = {
  RED: { color: '#D63030', bg: '#FFF0F0' },
  ORANGE: { color: '#E87010', bg: '#FFF4EC' },
  YELLOW: { color: '#B8860B', bg: '#FFFBEC' },
  GREEN: { color: '#2E8B57', bg: '#F0FFF6' },
};

const str = (v) => (typeof v === 'string' ? v : '');

/** Plain text from the (already sanitised) HTML body: for previews and the meta description. */
export function htmlToText(html) {
  return str(html)
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

/** "12 Nov 2026" from an ISO date or "YYYY-MM-DD hh:mm:ss" (UTC); other text as given. */
export function formatDay(value) {
  const v = str(value);
  if (!v) return '';
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(v) ? `${v.replace(' ', 'T')}Z` : v;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi' });
}

/** Validity in words, from the window when there is one. */
export function validityText(dto) {
  if (dto.lifecycle === 'cancelled') return 'Cancelled';
  if (dto.validity === 'ongoing') return 'Ongoing';
  if (dto.valid_to) return `Until ${formatDay(dto.valid_to)}`;
  return str(dto.validity_text);
}

/** Validity as data, so the page can word it in the reader's language (validityLabel). */
export function validityParts(dto) {
  if (dto.lifecycle === 'cancelled') return { kind: 'cancelled' };
  if (dto.validity === 'ongoing') return { kind: 'ongoing' };
  if (dto.valid_to) return { kind: 'until', date: formatDay(dto.valid_to) };
  return { kind: 'text', text: str(dto.validity_text) };
}

/**
 * The validity line in the reader's language. Alerts from the old API only have the English text (`valid`).
 *
 * @param {{validity?: {kind:string,date?:string,text?:string}, valid?: string}} a
 * @param {(key: string, vars?: object) => string} t
 */
export function validityLabel(a, t) {
  const v = a?.validity;
  if (!v) return a?.valid || '';
  if (v.kind === 'cancelled') return t('alerts.validity_cancelled');
  if (v.kind === 'ongoing') return t('alerts.validity_ongoing');
  if (v.kind === 'until') return t('alerts.validity_until', { date: v.date });
  return v.text || '';
}

/** "RED ALERT" etc. in the reader's language. */
export function levelLabel(level, t) {
  const l = String(level || '').toLowerCase();
  return ['red', 'orange', 'yellow', 'green'].includes(l) ? t(`alerts.level_${l}`) : `${level} ALERT`;
}

/** One CMS alert in the page shape. */
export function alertFromCms(dto) {
  if (!dto || typeof dto !== 'object' || !dto.id) return null;
  const levelRaw = str(dto.level).toUpperCase();
  const level = LEVEL_STYLES[levelRaw] ? levelRaw : 'YELLOW';
  const bodyHtml = str(dto.body);
  const loc = dto.location && typeof dto.location === 'object' ? dto.location : null;
  return {
    id: dto.id,
    level,
    ...LEVEL_STYLES[level],
    title: str(dto.title),
    area: str(dto.area),
    body: htmlToText(bodyHtml),
    bodyHtml,
    source: str(dto.source) || str(dto.organization?.name),
    issued: formatDay(dto.issued || dto.date),
    valid: validityText(dto),
    validity: validityParts(dto),
    updated: formatDay(dto.modified),
    actions: (Array.isArray(dto.actions) ? dto.actions : []).map(str).filter(Boolean),
    advisoryType: str(dto.type),
    targetGroups: str(dto.target_groups).split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
    keywords: (Array.isArray(dto.keywords) ? dto.keywords : []).map(str).filter(Boolean),
    location: {
      lat: loc && Number.isFinite(Number(loc.lat)) ? Number(loc.lat) : null,
      lng: loc && Number.isFinite(Number(loc.lng)) ? Number(loc.lng) : null,
      label: str(loc?.label),
    },
    files: (Array.isArray(dto.documents) ? dto.documents : [])
      .filter((d) => d && d.url)
      .map((d) => ({ url: d.url, label: str(d.label), filename: str(d.label), size: str(d.size), language: str(d.language) })),
    active: Boolean(dto.active),
    cancelled: dto.lifecycle === 'cancelled',
    cancelReason: str(dto.cancel_reason),
    onMap: Boolean(dto.on_map) && Boolean(dto.active),
    untranslated: Array.isArray(dto._untranslated) ? dto._untranslated : [],
  };
}

const ORDER = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };

/** Active first (most serious first), then the rest newest first (as the API sends them). */
export function splitAlerts(list) {
  const alerts = (Array.isArray(list) ? list : []).map(alertFromCms).filter(Boolean);
  const active = alerts.filter((a) => a.active).sort((a, b) => ORDER[a.level] - ORDER[b.level]);
  const recent = alerts.filter((a) => !a.active);
  return { active, recent };
}

/** The value for the reader's language: website code → CMS code, English when missing. */
export function pickLocale(byLocale, siteLocale) {
  if (!byLocale) return null;
  return byLocale[cmsLocale(siteLocale)] || byLocale.en || null;
}
