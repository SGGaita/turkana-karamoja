/**
 * Partner sessions on the website's own server (FE-06). Server-only: never import this from a page component.
 *
 * The CMS sign-in token lives in an httpOnly cookie, so no script in the browser can read it. Partner calls go
 * through /api/portal/*, which adds the token and forwards them to the CMS.
 */

export const SESSION_COOKIE = 'kc_session';
export const EMAIL_COOKIE = 'kc_user';
const MAX_AGE = 7 * 24 * 3600; // Never longer than a week, whatever the token says.

/** CMS address for server-to-server calls. */
export function cmsBase(env = process.env) {
  return String(env.WP_INTERNAL_URL || env.NEXT_PUBLIC_WP_BASE_URL || '').trim().replace(/\/+$/, '');
}

/** Cookies of a request as an object. */
export function readCookies(req) {
  const out = {};
  for (const part of String(req?.headers?.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    const k = part.slice(0, i).trim();
    try {
      out[k] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      out[k] = part.slice(i + 1).trim();
    }
  }
  return out;
}

/** Payload of a JWT, without checking it (the CMS checks it on every call). */
export function jwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

/** Seconds the token is still good for (0 when expired or unreadable), capped at a week. */
export function tokenLifetime(token, now = Date.now()) {
  const exp = Number(jwtPayload(token)?.exp || 0);
  return Math.max(0, Math.min(MAX_AGE, Math.floor(exp - now / 1000)));
}

/** Is this request served over HTTPS (directly or behind the host's proxy)? */
export function isHttps(req) {
  return String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0].trim() === 'https' || Boolean(req?.socket?.encrypted);
}

function cookie(name, value, maxAge, secure) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}

/** Set-Cookie values that start a session (empty list when the token is unusable). */
export function sessionCookies(req, token, email) {
  const age = tokenLifetime(token);
  if (!age) return [];
  const secure = isHttps(req);
  return [cookie(SESSION_COOKIE, token, age, secure), cookie(EMAIL_COOKIE, email || '', age, secure)];
}

/** Set-Cookie values that end the session. */
export function clearCookies(req) {
  const secure = isHttps(req);
  return [cookie(SESSION_COOKIE, '', 0, secure), cookie(EMAIL_COOKIE, '', 0, secure)];
}

/** The session of a request: { token, email } or null when there is none or it has expired. */
export function getSession(req) {
  const c = readCookies(req);
  const token = c[SESSION_COOKIE] || '';
  if (!token || !tokenLifetime(token)) return null;
  return { token, email: c[EMAIL_COOKIE] || '' };
}

/** The visitor's address as the host saw it. */
export function clientIp(req) {
  const real = String(req?.headers?.['x-real-ip'] || '').trim();
  if (real) return real;
  const fwd = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || String(req?.socket?.remoteAddress || '').replace(/^::ffff:/, '');
}

/**
 * Headers for a call to the CMS on the visitor's behalf: their address (trusted by the CMS only with the shared
 * secret, see KARAMOJA_PROXY_SECRET) and, when signed in, the token.
 */
export function cmsHeaders(req, token = '', env = process.env) {
  const h = {};
  const secret = String(env.CMS_PROXY_SECRET || '');
  const ip = clientIp(req);
  if (secret.length >= 32 && ip) {
    h['X-Karamoja-Proxy-Secret'] = secret;
    h['X-Karamoja-Client-IP'] = ip;
  }
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/**
 * Was this request sent by the website's own pages? State-changing calls must carry X-Requested-With (a header
 * other sites can't add to a cross-site form post) and, when the browser sends one, an Origin of this site.
 */
export function sameSite(req) {
  if (String(req?.headers?.['x-requested-with'] || '') !== 'karamoja') return false;
  const origin = String(req?.headers?.origin || '');
  if (!origin) return true;
  try {
    return new URL(origin).host === String(req.headers['x-forwarded-host'] || req.headers.host || '');
  } catch {
    return false;
  }
}

/** Sends JSON. */
export function sendJson(res, status, body, cookies = []) {
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
