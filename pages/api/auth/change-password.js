import { clearCookies, cmsBase, cmsHeaders, getSession, sameSite, sendJson, sessionCookies } from '../../../lib/server/session';

/**
 * POST /api/auth/change-password { current_password, password } → Core changes the password and returns a new
 * token (old ones stop working); the cookie is replaced with it.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed' });
  if (!sameSite(req)) return sendJson(res, 403, { message: 'Forbidden' });
  const s = getSession(req);
  if (!s) return sendJson(res, 401, { code: 'session_expired', message: 'Please sign in again.' }, clearCookies(req));
  const base = cmsBase();
  if (!base) return sendJson(res, 503, { message: 'This service is unavailable right now. Please try again later.' });
  try {
    const r = await fetch(`${base}/wp-json/karamoja/v1/auth/password/change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...cmsHeaders(req, s.token) },
      body: JSON.stringify({ current_password: String(req.body?.current_password || ''), password: String(req.body?.password || '') }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) return sendJson(res, r.status, { code: json.code || '', message: json.message || 'The password could not be changed.' });
    const cookies = json.token ? sessionCookies(req, json.token, s.email) : [];
    return sendJson(res, 200, { message: json.message || 'Password changed.' }, cookies);
  } catch {
    return sendJson(res, 503, { message: 'This service is unavailable right now. Please try again later.' });
  }
}
