/**
 * Reports from Karamoja Core (karamoja/v1/reports). FE-20.
 *
 * reportFromCms() returns the shape the reports pages and cards already use (mapReport() in wp-mappers.js).
 */
import { getLanguageLabel } from './languages';
import { htmlToText, formatDay } from './cms-alerts';
import { slugify } from './slug';

const TAG_COLORS = {
  SITREP: '#2E7BB4',
  Assessment: '#2E8B57',
  HAP: '#E87010',
  Monitoring: '#2E7BB4',
  WASH: '#2E8B57',
  Livelihoods: '#E87010',
};

const str = (v) => (typeof v === 'string' ? v : '');
const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

/**
 * One CMS report in the page shape.
 *
 * @param {object} dto            karamoja/v1 report
 * @param {{slim?: boolean}} opts slim: leave out the full text (list pages)
 */
export function reportFromCms(dto, { slim = false } = {}) {
  if (!dto || typeof dto !== 'object' || !dto.id) return null;
  const tag = str(dto.tag) || 'Report';
  const tagColor = TAG_COLORS[tag] || '#2E7BB4';
  const files = (Array.isArray(dto.documents) ? dto.documents : [])
    .filter((d) => d && d.url)
    .map((d) => ({
      url: d.url,
      size: str(d.size),
      language: str(d.language) || 'en',
      label: str(d.label) || getLanguageLabel(str(d.language) || 'en'),
      filename: '',
    }));
  const primary = files.find((f) => f.language === 'en') || files[0];
  const orgName = str(dto.organization?.name);
  const partners = str(dto.partners).split(',').map((s) => s.trim()).filter(Boolean);
  const orgs = partners.length ? partners : (orgName ? [orgName] : []);
  const categories = list(dto.categories);
  const untranslated = Array.isArray(dto._untranslated) ? dto._untranslated : [];
  // A translated description is the text for that language; otherwise the full text, then the description.
  const translatedDescription = dto.lang && dto.lang !== 'en' && str(dto.description) && !untranslated.includes('description');
  const content = translatedDescription ? str(dto.description) : (str(dto.content) || str(dto.description));
  return {
    id: dto.id,
    iconBg: `${tagColor}22`,
    tag,
    tagColor,
    categories: categories.length ? categories : [tag],
    title: str(dto.title),
    desc: htmlToText(dto.description) || htmlToText(dto.excerpt),
    ...(slim ? {} : { content }),
    orgs,
    orgHref: orgName ? `/organizations/${slugify(orgName)}` : null,
    date: formatDay(dto.publication_date || dto.date),
    dateRaw: str(dto.publication_date) || str(dto.date) || null,
    isNew: Boolean(dto.is_new),
    isUpdated: Boolean(dto.is_updated),
    size: primary?.size || '',
    fileUrl: primary?.url || null,
    files,
    keywords: list(dto.keywords),
    countries: list(dto.countries),
    organizationId: orgName ? 1 : null,
    downloadCount: Number(dto.downloads) || 0,
    downloadCounts: (Array.isArray(dto.download_versions) ? dto.download_versions : []).map((v) => ({
      key: str(v?.key),
      language: str(v?.language),
      count: Number(v?.count) || 0,
      url: str(v?.url),
    })),
    untranslated,
  };
}
