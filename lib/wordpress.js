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

export async function getJwtToken(username, password) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(`${base}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // WordPress returns HTML error text that also says whether the email exists
    // ("The password you entered for the email address…"). Never show it: one generic message.
    throw new Error(
      res.status === 403 || res.status === 401
        ? 'The email or password is incorrect.'
        : 'Sign-in is unavailable right now. Please try again later.',
    );
  }
  return { token: json.token, email: json.user_email, name: json.user_display_name };
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
 * Organisation status for an email. The CMS only returns the full record (id, name, reference)
 * when the signed-in partner asks about their own email, so pass the JWT when there is one.
 * Anonymous callers get just { registered, status }.
 */
export async function getOrganizationStatus(email, token = null) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const headers = token && !String(token).startsWith('DEMO_') ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(
    `${base}/wp-json/tk/v1/organization-status?email=${encodeURIComponent(email)}`,
    { headers },
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Could not check organization status');
  }
  return json;
}

export async function uploadMedia(file, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${base}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'File upload failed');
  }
  return json;
}

export async function submitReport(form, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const docs = (form.documents || []).filter((d) => d.file);
  const files = [];

  for (const doc of docs) {
    const media = await uploadMedia(doc.file, token);
    files.push({
      url: media.source_url || '',
      size: formatFileSize(doc.file.size),
      language: doc.language || 'en',
      label: getLanguageLabel(doc.language || 'en'),
      filename: doc.file.name || '',
    });
  }

  const primary = files.find((f) => f.language === 'en') || files[0];
  const payload = buildReportPayload(form, {
    fileUrl: primary?.url || '',
    fileSize: primary?.size || '',
    files,
  });

  const res = await fetch(`${base}/wp-json/wp/v2/tk_report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Report submission failed');
  }
  return json;
}

export async function submitAdvisory(form, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const docs = (form.documents || []).filter((d) => d.file);
  const files = [];

  for (const doc of docs) {
    const media = await uploadMedia(doc.file, token);
    files.push({
      url: media.source_url || '',
      size: formatFileSize(doc.file.size),
      language: doc.language || 'en',
      label: getLanguageLabel(doc.language || 'en'),
      filename: doc.file.name || '',
    });
  }

  const payload = buildAdvisoryPayload(form, { files });
  const res = await fetch(`${base}/wp-json/wp/v2/tk_alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Submission failed');
  }
  return json;
}

async function fetchWpAuth(path, token, options = {}) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(`${base}/wp-json${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || json.code || `Request failed (${res.status})`);
  }
  return json;
}

export async function getMySubmissions(token) {
  return fetchWpAuth('/tk/v1/my-submissions', token);
}

export async function updateSubmission(type, id, payload, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/${type}/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function withdrawSubmission(type, id, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/${type}/${id}/withdraw`, token, {
    method: 'POST',
  });
}

export async function addReportDocuments(reportId, documents, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/report/${reportId}/documents`, token, {
    method: 'POST',
    body: JSON.stringify({ documents }),
  });
}

export async function removeReportDocument(reportId, url, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/report/${reportId}/documents`, token, {
    method: 'DELETE',
    body: JSON.stringify({ url }),
  });
}

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
