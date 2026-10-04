/** Case-insensitive unique labels, preserving the first spelling seen. */
export function uniqueLabels(values) {
  const seen = new Map();
  (values || []).forEach((value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  });
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export const REPORT_PAGE_SIZE = 5;
export const ORG_GROUP_PAGE_SIZE = 4;

export function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Best-effort real Date for a report, for date-range filtering/sorting.
 *  Prefers the raw ISO value; falls back to parsing the display string
 *  (works for "31 Mar 2026", "Dec 2025", etc). Returns null if unparseable. */
export function getReportDate(report) {
  const candidates = [report?.dateRaw, report?.date];
  for (const value of candidates) {
    if (!value) continue;
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export function getPrimaryOrg(report) {
  return report.orgs?.[0] || 'Other contributors';
}

export function groupReportsByOrg(reports) {
  const groups = new Map();
  reports.forEach((report) => {
    const key = getPrimaryOrg(report);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(report);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => ({
      name,
      organizationId: items.find((item) => item.organizationId)?.organizationId || null,
      items: [...items].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
    }));
}

export function isPdfUrl(url) {
  return Boolean(url && /\.pdf(\?|#|$)/i.test(url));
}

export function isImageUrl(url) {
  return Boolean(url && /\.(jpe?g|png|gif|webp|svg)(\?|#|$)/i.test(url));
}

export function canEmbedPreview(url) {
  return isPdfUrl(url) || isImageUrl(url);
}

export function previewType(url) {
  if (isPdfUrl(url)) return 'pdf';
  if (isImageUrl(url)) return 'image';
  return 'none';
}

export function formatDownloadCount(count) {
  const n = Number(count) || 0;
  return n === 1 ? '1 download' : `${n.toLocaleString()} downloads`;
}

export function applyReportDownloadStats(report, stats) {
  if (!report || !stats) return report;
  return {
    ...report,
    downloadCount: Number(stats.total ?? report.downloadCount) || 0,
    downloadCounts: Array.isArray(stats.versions) ? stats.versions : (report.downloadCounts || []),
  };
}

export function fileDownloadCount(report, file) {
  const versions = report?.downloadCounts || [];
  const lang = String(file?.language || '').toLowerCase();
  const url = file?.url || '';
  const match = versions.find((v) => {
    if (url && v.url && v.url === url) return true;
    const key = String(v.language || v.key || '').toLowerCase();
    return Boolean(lang && key && key === lang);
  });
  return match ? Number(match.count) || 0 : 0;
}

export function getReportFiles(report) {
  if (report?.files?.length) return report.files;
  if (report?.fileUrl) {
    return [{
      url: report.fileUrl,
      size: report.size || '',
      language: 'en',
      label: 'English',
      filename: '',
    }];
  }
  return [];
}
