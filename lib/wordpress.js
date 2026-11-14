/**
 * Partner portal and contact form calls to WordPress (the routes Karamoja Core serves at cut-over: tk/v1 portal routes,
 * wp/v2 media and items). Public pages read Karamoja Core's karamoja/v1 API through lib/cms.js (WP-39).
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

export { uploadMedia };

export function getWpBaseUrl() {
  const url = process.env.NEXT_PUBLIC_WP_BASE_URL;
  if (!url || url.includes('your-wordpress-site')) return null;
  return url.replace(/\/$/, '');
}

export async function submitContactForm(form) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(`${base}/wp-json/tk/v1/contact-submit`, {
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
  const res = await fetch(`${base}/wp-json/tk/v1/register-organization`, {
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
  const route = `tk/v1/organization-status?email=${encodeURIComponent(email)}`;
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

export const getMySubmissions = () => portal('tk/v1/my-submissions');

export const updateSubmission = (type, id, payload) => portal(`tk/v1/my-submissions/${type}/${id}`, { method: 'PATCH', json: payload });

export const withdrawSubmission = (type, id) => portal(`tk/v1/my-submissions/${type}/${id}/withdraw`, { method: 'POST', json: {} });

export const addReportDocuments = (reportId, documents) => portal(`tk/v1/my-submissions/report/${reportId}/documents`, { method: 'POST', json: { documents } });

export const removeReportDocument = (reportId, url) => portal(`tk/v1/my-submissions/report/${reportId}/documents`, { method: 'DELETE', json: { url } });

/** Count a public library download without blocking the file open. */
export function trackReportDownload(reportId, file = {}, onTracked) {
  const base = getWpBaseUrl();
  if (!base || !reportId) return;
  const payload = JSON.stringify({
    url: file.url || '',
    language: file.language || '',
    label: file.label || '',
    filename: file.filename || '',
  });
  fetch(`${base}/wp-json/tk/v1/reports/${encodeURIComponent(reportId)}/download`, {
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
