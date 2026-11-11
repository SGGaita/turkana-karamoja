/**
 * Organisations from Karamoja Core (karamoja/v1/organizations). Pure functions: tests/cms-orgs.test.mjs.
 * Only verified organisations reach the website, and contact details only when the organisation chose to show them.
 */
import { htmlToText, alertFromCms } from './cms-alerts';
import { reportFromCms } from './cms-reports';
import { slugify } from './slug';

const str = (v) => (typeof v === 'string' ? v : '');
const rows = (v) => (Array.isArray(v) ? v : []);

/** One organisation in the website's shape. */
export function orgFromCms(dto) {
  if (!dto || typeof dto !== 'object' || !dto.id || !str(dto.title)) return null;
  const c = dto.contact && typeof dto.contact === 'object' ? dto.contact : null;
  const website = str(dto.website);
  return {
    id: dto.id,
    name: str(dto.title),
    abbr: str(dto.abbreviation),
    type: str(dto.type),
    country: str(dto.country),
    descriptionHtml: str(dto.description),
    description: htmlToText(dto.description),
    website: /^https?:\/\//i.test(website) ? website : '',
    verified: dto.verified !== false,
    contactName: str(c?.name),
    contactEmail: str(c?.email),
    contactPhone: str(c?.phone),
    slug: slugify(str(dto.title)) || String(dto.id),
  };
}

/** An organisation page: the organisation, its advisories and reports, and the totals. */
export function profileFromCms(dto) {
  const organization = orgFromCms(dto);
  if (!organization) return null;
  const a = dto.activity && typeof dto.activity === 'object' ? dto.activity : {};
  const advisories = rows(a.alerts).map(alertFromCms).filter(Boolean);
  const reports = rows(a.reports).map((r) => reportFromCms(r, { slim: true })).filter(Boolean);
  return {
    organization,
    advisories,
    reports,
    counts: {
      advisories: Number(a.counts?.alerts) || advisories.length,
      reports: Number(a.counts?.reports) || reports.length,
    },
  };
}

/** "Who publishes here" boxes. */
export function groupsFromCms(section) {
  return rows(section?.items).map((r) => ({ title: str(r?.title), text: str(r?.text) })).filter((g) => g.title);
}
