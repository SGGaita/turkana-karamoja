/**
 * Partner portal calls from the browser (FE-06). They go to the website's own /api routes, which hold the CMS
 * token in an httpOnly cookie; no script on the page can read or send the token.
 */

/** Fired on window when the CMS no longer accepts the session (expired, password changed, suspended). */
export const SESSION_EXPIRED_EVENT = 'karamoja:session-expired';

const HEADERS = { 'X-Requested-With': 'karamoja' };

function expired() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  return Object.assign(new Error('Your session has ended. Please sign in again.'), { code: 'session_expired', status: 401 });
}

async function call(url, { method = 'GET', json, body, headers = {} } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { ...HEADERS, ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : body,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw expired();
  if (!res.ok) {
    throw Object.assign(new Error(data.message || data.code || `Request failed (${res.status})`), { code: data.code, status: res.status });
  }
  return data;
}

/** A CMS route through the website's server, e.g. portal('tk/v1/my-submissions'). */
export function portal(route, options) {
  return call(`/api/portal/${String(route).replace(/^\/+/, '')}`, options);
}

/* ------------------------------------------------------------------ Session */

/** { signedIn, email } for this browser. */
export function getSession() {
  return call('/api/auth/session').catch(() => ({ signedIn: false, email: '' }));
}

/** Signs in; the token stays on the server. Resolves to { email, name }. */
export function signIn(email, password) {
  return call('/api/auth/login', { method: 'POST', json: { email, password } }).catch((err) => {
    // 401 here means "wrong email or password", not an ended session.
    throw Object.assign(new Error(err.code === 'session_expired' || !err.message ? 'The email or password is incorrect.' : err.message), err);
  });
}

/** Ends the session on this device. */
export function signOut() {
  return call('/api/auth/logout', { method: 'POST' }).catch(() => ({}));
}

/** Changes the password; the server swaps in the new token. Resolves to { message }. */
export function changePassword(currentPassword, password) {
  return call('/api/auth/change-password', { method: 'POST', json: { current_password: currentPassword, password } });
}

/* ------------------------------------------------------------------ Uploads */

let ticket = null; // { ticket, url, expiresAt, uses }

async function uploadTicket() {
  if (ticket && ticket.uses > 0 && ticket.expiresAt > Date.now() + 30000) return ticket;
  ticket = null;
  try {
    const t = await portal('karamoja/v1/portal/upload-ticket', { method: 'POST' });
    ticket = { ticket: t.ticket, url: t.upload_url, expiresAt: Date.now() + (Number(t.expires_in) || 0) * 1000, uses: Number(t.uses) || 1 };
  } catch (err) {
    if (err.code === 'session_expired') throw err;
    ticket = null; // CMS without upload tickets (before cut-over): upload through the website instead.
  }
  return ticket;
}

/**
 * Uploads a file to the CMS media library. With an upload ticket the browser sends the file straight to the CMS
 * (files up to 10 MB don't fit through the website's server); without one, through /api/portal.
 */
export async function uploadMedia(file) {
  const form = new FormData();
  form.append('file', file);
  const t = await uploadTicket();
  if (!t) return portal('wp/v2/media', { method: 'POST', body: form });
  t.uses -= 1;
  const res = await fetch(t.url, { method: 'POST', headers: { 'X-Karamoja-Upload-Ticket': t.ticket }, body: form });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    ticket = null; // Ticket refused (used up, expired or account changed): one fresh try.
    const again = await uploadTicket();
    if (!again) return portal('wp/v2/media', { method: 'POST', body: form });
    again.uses -= 1;
    const retry = await fetch(again.url, { method: 'POST', headers: { 'X-Karamoja-Upload-Ticket': again.ticket }, body: form });
    const retried = await retry.json().catch(() => ({}));
    if (!retry.ok) throw new Error(retried.message || 'File upload failed');
    return retried;
  }
  if (!res.ok) throw new Error(data.message || 'File upload failed');
  return data;
}
