import { clearCookies, cmsBase, cmsHeaders, getSession, sameSite, sendJson } from '../../../lib/server/session';
import { portalRouteAllowed } from '../../../lib/server/portal-routes';

// Raw bodies: JSON as sent, and multipart for the upload fallback.
export const config = { api: { bodyParser: false } };

const MAX_BODY = 12 * 1024 * 1024; // Hosting caps it lower (Vercel ~4.5 MB): large files use upload tickets.

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw Object.assign(new Error('too large'), { status: 413 });
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

/**
 * /api/portal/<CMS route> → the same call to the CMS with the partner's token from the httpOnly cookie (FE-06).
 * Only the routes the partner portal uses are forwarded (lib/server/portal-routes.js), so this can't be used to
 * reach anything else with a partner's rights.
 */
export default async function handler(req, res) {
  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const route = parts.filter(Boolean).join('/');
  if (!portalRouteAllowed(req.method, route)) return sendJson(res, 404, { code: 'not_found', message: 'Not found.' });
  if (!sameSite(req)) return sendJson(res, 403, { message: 'Forbidden' });
  const s = getSession(req);
  if (!s) return sendJson(res, 401, { code: 'session_expired', message: 'Please sign in again.' }, clearCookies(req));
  const base = cmsBase();
  if (!base) return sendJson(res, 503, { message: 'This service is unavailable right now. Please try again later.' });

  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') for (const one of [].concat(v)) query.append(k, String(one));
  }
  const qs = query.toString();
  try {
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
    const headers = { ...cmsHeaders(req, s.token) };
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    if (req.headers['content-disposition']) headers['Content-Disposition'] = req.headers['content-disposition'];
    const r = await fetch(`${base}/wp-json/${route}${qs ? `?${qs}` : ''}`, { method: req.method, headers, body });
    const text = await r.text();
    // The CMS refused the token (expired, password changed, account suspended): end the session here too.
    const expired = r.status === 401 || (r.status === 403 && /jwt_auth|invalid_token|rest_not_logged_in/.test(text));
    res.setHeader('Cache-Control', 'no-store');
    if (expired) res.setHeader('Set-Cookie', clearCookies(req));
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json; charset=utf-8');
    for (const h of ['x-wp-total', 'x-wp-totalpages']) if (r.headers.get(h)) res.setHeader(h, r.headers.get(h));
    return res.status(expired ? 401 : r.status).send(expired ? JSON.stringify({ code: 'session_expired', message: 'Please sign in again.' }) : text);
  } catch (err) {
    if (err.status === 413) return sendJson(res, 413, { message: 'The file is too large to send this way.' });
    return sendJson(res, 502, { message: 'This service is unavailable right now. Please try again later.' });
  }
}
