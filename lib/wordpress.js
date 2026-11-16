/**
 * Partner portal and contact form calls to WordPress: Karamoja Core's karamoja/v1 routes (WP-39; the old plugin's
 * addresses are answered by Core for 90 days after cut-over only) and wp/v2 media and items for submissions.
 * Public pages read karamoja/v1 through lib/cms.js.
 */
import {
  buildAdvisoryPayload,
  buildReportPayload,
  buildOrganizationPayload,
  getLanguageLabel,
} from './wp-mappers';
import { APP_NAME } from './branding';
import { formatFileSize } from './report-utils';
import { portal, uploadMedia } from './portal-client';
import { track } from './analytics';

export { uploadMedia };

export function getWpBaseUrl() {
  const url = process.env.NEXT_PUBLIC_WP_BASE_URL;
  if (!url || url.includes('your-wordpress-site')) return null;
  return url.replace(/\/$/, '');
}

export async function submitContactForm(form) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(`${base}/wp-json/karamoja/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      organization: form.organization || '',
      subject: form.subject || `${APP_NAME} enquiry`,
      message: form.message,
      captcha_token: form.captchaToken || '',
      website: form.website || '', // Hidden honeypot: real people leave it empty.
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || json.code || 'Failed to send message');
  }
  return json;
}

export async function registerOrganization(form) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const payload = { ...buildOrganizationPayload(form), captcha_token: form.captchaToken || '' };
  const res = await fetch(`${base}/wp-json/karamoja/v1/portal/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.code || 'Registration failed');
  }
  return json;
}

/**
 * Organisation status for an email. Signed in, the call goes through the website's server with the session, and
 * the CMS returns the full record (id, name, reference) for the partner's own email. Signed out it goes to the
 * CMS directly and returns just { registered, status }.
 */
export async function getOrganizationStatus(email, signedIn = false) {
  const route = `karamoja/v1/portal/status?email=${encodeURIComponent(email)}`;
  if (signedIn) return portal(route);
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');
  const res = await fetch(`${base}/wp-json/${route}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Could not check organization status');
  }
  return json;
}
async function uploadAll(documents) {
  const files = [];
  for (const doc of (documents || []).filter((d) => d.file)) {
    const media = await uploadMedia(doc.file);
    files.push({
      url: media.source_url || '',
      size: formatFileSize(doc.file.size),
      language: doc.language || 'en',
      label: getLanguageLabel(doc.language || 'en'),
      filename: doc.file.name || '',
    });
  }
  return files;
}

/** Partner calls go through the website's server, which adds the session (FE-06). */
export async function submitReport(form) {
  const files = await uploadAll(form.documents);
  const primary = files.find((f) => f.language === 'en') || files[0];
  const payload = buildReportPayload(form, { fileUrl: primary?.url || '', fileSize: primary?.size || '', files });
  return portal('wp/v2/tk_report', { method: 'POST', json: payload });
}

export async function submitAdvisory(form) {
  const files = await uploadAll(form.documents);
  return portal('wp/v2/tk_alert', { method: 'POST', json: buildAdvisoryPayload(form, { files }) });
}

export const getMySubmissions = () => portal('karamoja/v1/portal/submissions');

export const updateSubmission = (type, id, payload) => portal(`karamoja/v1/portal/submissions/${type}/${id}`, { method: 'PATCH', json: payload });

export const withdrawSubmission = (type, id) => portal(`karamoja/v1/portal/submissions/${type}/${id}/withdraw`, { method: 'POST', json: {} });

export const addReportDocuments = (reportId, documents) => portal(`karamoja/v1/portal/submissions/report/${reportId}/documents`, { method: 'POST', json: { documents } });

export const removeReportDocument = (reportId, url) => portal(`karamoja/v1/portal/submissions/report/${reportId}/documents`, { method: 'DELETE', json: { url } });

/** Count a public library download without blocking the file open. */
export function trackReportDownload(reportId, file = {}, onTracked) {
  // GA4's recommended download event (FE-27; only after the visitor accepts analytics).
  const name = String(file.filename || file.url || '').split(/[?#]/)[0].split('/').pop() || '';
  track('file_download', {
    file_name: name,
    file_extension: (name.match(/\.([a-z0-9]{1,5})$/i) || [])[1]?.toLowerCase() || '',
    report_id: String(reportId || ''),
    file_language: file.language || '',
  });
  const base = getWpBaseUrl();
  if (!base || !reportId) return;
  const payload = JSON.stringify({
    url: file.url || '',
    language: file.language || '',
    label: file.label || '',
    filename: file.filename || '',
  });
  fetch(`${base}/wp-json/karamoja/v1/reports/${encodeURIComponent(reportId)}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
    mode: 'cors',
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((stats) => {
      if (stats && typeof onTracked === 'function') onTracked(stats);
    })
    .catch(() => {});
}

export { buildAdvisoryPayload };
