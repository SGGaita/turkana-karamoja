import { clearCookies, cmsBase, cmsHeaders, sameSite, sendJson, sessionCookies } from '../../../lib/server/session';

const GENERIC = 'The email or password is incorrect.';
const UNAVAILABLE = 'Sign-in is unavailable right now. Please try again later.';
// Core's own messages for these are safe to show (they don't say whether the email exists).
const SHOWN = ['karamoja_locked', 'karamoja_inactive', 'karamoja_rate_limited'];

async function call(url, req, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cmsHeaders(req) },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

/**
 * POST /api/auth/login { email, password } → signs the partner in and keeps the CMS token in an httpOnly
 * cookie (FE-06). Karamoja Core's sign-in when the CMS has it, else the JWT plugin (before cut-over).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed' });
  if (!sameSite(req)) return sendJson(res, 403, { message: 'Forbidden' });
  const base = cmsBase();
  if (!base) return sendJson(res, 503, { message: UNAVAILABLE });
  const email = String(req.body?.email || '').trim();
  const password = String(req.body?.password || '');
  if (!email || !password) return sendJson(res, 400, { message: GENERIC });

  try {
    let r = await call(`${base}/wp-json/karamoja/v1/auth/login`, req, { email, password });
    if (r.status === 404 && r.json?.code === 'rest_no_route') {
      r = await call(`${base}/wp-json/jwt-auth/v1/token`, req, { username: email, password });
    }
    if (r.status >= 500 || (r.status === 404 && r.json?.code === 'rest_no_route')) {
      return sendJson(res, 503, { message: UNAVAILABLE }, clearCookies(req));
    }
    if (r.status !== 200 || !r.json?.token) {
      const code = r.json?.code || '';
      return sendJson(res, r.status === 429 ? 429 : 401, { code, message: SHOWN.includes(code) ? r.json.message : GENERIC }, clearCookies(req));
    }
    const signedInAs = r.json.user_email || email;
    const cookies = sessionCookies(req, r.json.token, signedInAs);
    if (!cookies.length) return sendJson(res, 503, { message: UNAVAILABLE });
    return sendJson(res, 200, { email: signedInAs, name: r.json.user_display_name || '' }, cookies);
  } catch {
    return sendJson(res, 503, { message: UNAVAILABLE });
  }
}
