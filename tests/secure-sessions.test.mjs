import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Readable } from 'node:stream';
import {
  clearCookies, clientIp, cmsHeaders, getSession, jwtPayload, readCookies, sameSite, sessionCookies, tokenLifetime,
} from '../lib/server/session';
import { portalRouteAllowed } from '../lib/server/portal-routes';
import headersLib from '../lib/security-headers';
import login from '../pages/api/auth/login';
import portalProxy from '../pages/api/portal/[...path]';

const { contentSecurityPolicy, securityHeaders } = headersLib;

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (exp) => `${b64({ alg: 'HS256' })}.${b64({ exp, data: { user: { id: 7 } } })}.sig`;
const now = Math.floor(Date.now() / 1000);
const TOKEN = jwt(now + 3600);

function req({ method = 'GET', headers = {}, cookies = '', body, query = {} } = {}) {
  const r = body !== undefined && typeof body !== 'object' ? Readable.from([Buffer.from(body)]) : Readable.from([]);
  return Object.assign(r, {
    method,
    query,
    body,
    headers: { host: 'hub.example', 'x-requested-with': 'karamoja', ...(cookies ? { cookie: cookies } : {}), ...headers },
    socket: { remoteAddress: '::ffff:10.1.2.3' },
  });
}

function res() {
  const out = { statusCode: 200, headers: {}, body: undefined };
  out.setHeader = (k, v) => { out.headers[k.toLowerCase()] = v; };
  out.status = (c) => { out.statusCode = c; return out; };
  out.json = (b) => { out.body = b; return out; };
  out.send = (b) => { out.body = typeof b === 'string' ? JSON.parse(b) : b; return out; };
  return out;
}

describe('session cookies', () => {
  it('reads cookies and the token payload', () => {
    expect(readCookies({ headers: { cookie: 'a=1; kc_user=me%40x.org' } })).toEqual({ a: '1', kc_user: 'me@x.org' });
    expect(jwtPayload(TOKEN).data.user.id).toBe(7);
    expect(jwtPayload('nope')).toBeNull();
  });

  it('lives as long as the token, at most a week', () => {
    expect(tokenLifetime(jwt(now + 600))).toBeGreaterThan(590);
    expect(tokenLifetime(jwt(now + 30 * 86400))).toBe(7 * 86400);
    expect(tokenLifetime(jwt(now - 5))).toBe(0);
  });

  it('is httpOnly and SameSite=Lax, Secure over HTTPS', () => {
    const [plain] = sessionCookies(req(), TOKEN, 'me@x.org');
    expect(plain).toMatch(/^kc_session=/);
    expect(plain).toContain('HttpOnly');
    expect(plain).toContain('SameSite=Lax');
    expect(plain).not.toContain('Secure');
    const [secure] = sessionCookies(req({ headers: { 'x-forwarded-proto': 'https' } }), TOKEN, 'me@x.org');
    expect(secure).toContain('Secure');
    expect(sessionCookies(req(), jwt(now - 1), 'x')).toEqual([]);
    expect(clearCookies(req()).every((c) => c.includes('Max-Age=0'))).toBe(true);
  });

  it('ignores an expired session', () => {
    expect(getSession(req({ cookies: `kc_session=${TOKEN}; kc_user=me%40x.org` }))).toEqual({ token: TOKEN, email: 'me@x.org' });
    expect(getSession(req({ cookies: `kc_session=${jwt(now - 1)}` }))).toBeNull();
    expect(getSession(req())).toBeNull();
  });
});

describe('calls to the CMS', () => {
  it('takes the visitor address from the host', () => {
    expect(clientIp(req({ headers: { 'x-real-ip': '203.0.113.5', 'x-forwarded-for': '198.51.100.1' } }))).toBe('203.0.113.5');
    expect(clientIp(req({ headers: { 'x-forwarded-for': '198.51.100.1, 10.0.0.1' } }))).toBe('198.51.100.1');
    expect(clientIp(req())).toBe('10.1.2.3');
  });

  it('sends the address only with a real shared secret', () => {
    const secret = 's'.repeat(40);
    expect(cmsHeaders(req(), '', { CMS_PROXY_SECRET: secret })).toEqual({ 'X-Karamoja-Proxy-Secret': secret, 'X-Karamoja-Client-IP': '10.1.2.3' });
    expect(cmsHeaders(req(), '', { CMS_PROXY_SECRET: 'short' })).toEqual({});
    expect(cmsHeaders(req(), 'tok', {})).toEqual({ Authorization: 'Bearer tok' });
  });

  it('accepts only requests from the site itself', () => {
    expect(sameSite(req())).toBe(true);
    expect(sameSite(req({ headers: { origin: 'https://hub.example' } }))).toBe(true);
    expect(sameSite(req({ headers: { origin: 'https://evil.example' } }))).toBe(false);
    expect(sameSite(req({ headers: { 'x-requested-with': '' } }))).toBe(false);
  });
});

describe('portal route allowlist', () => {
  it('allows exactly the portal routes', () => {
    expect(portalRouteAllowed('GET', 'tk/v1/my-submissions')).toBe(true);
    expect(portalRouteAllowed('PATCH', 'tk/v1/my-submissions/report/12')).toBe(true);
    expect(portalRouteAllowed('POST', 'tk/v1/my-submissions/advisory/12/withdraw')).toBe(true);
    expect(portalRouteAllowed('DELETE', 'tk/v1/my-submissions/report/12/documents')).toBe(true);
    expect(portalRouteAllowed('POST', 'wp/v2/tk_alert')).toBe(true);
    expect(portalRouteAllowed('POST', 'karamoja/v1/portal/upload-ticket')).toBe(true);
  });
  it('refuses everything else', () => {
    expect(portalRouteAllowed('GET', 'wp/v2/users')).toBe(false);
    expect(portalRouteAllowed('POST', 'wp/v2/users')).toBe(false);
    expect(portalRouteAllowed('DELETE', 'wp/v2/tk_alert')).toBe(false);
    expect(portalRouteAllowed('POST', 'wp/v2/tk_alert/5')).toBe(false);
    expect(portalRouteAllowed('GET', 'tk/v1/my-submissions/../../wp/v2/users')).toBe(false);
    expect(portalRouteAllowed('PATCH', 'tk/v1/my-submissions/user/12')).toBe(false);
  });
});

describe('security headers', () => {
  const prod = { NODE_ENV: 'production', NEXT_PUBLIC_WP_BASE_URL: 'https://cms.example/' };
  it('allows scripts only from the site and Turnstile', () => {
    const csp = contentSecurityPolicy(prod);
    expect(csp).toContain("script-src 'self' https://challenges.cloudflare.com;");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("connect-src 'self' https://cms.example https://challenges.cloudflare.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
  });
  it('keeps a local production build working against an http CMS', () => {
    const csp = contentSecurityPolicy({ NODE_ENV: 'production', NEXT_PUBLIC_WP_BASE_URL: 'http://localhost:8098' });
    expect(csp).not.toContain('upgrade-insecure-requests');
    expect(csp).toContain('img-src \'self\' data: blob: https: http://localhost:8098');
  });
  it('allows eval only in development, HSTS only in production', () => {
    expect(contentSecurityPolicy({ NODE_ENV: 'development' })).toContain("'unsafe-eval'");
    const keys = (env) => securityHeaders(env).map((h) => h.key);
    expect(keys(prod)).toContain('Strict-Transport-Security');
    expect(keys({ NODE_ENV: 'development' })).not.toContain('Strict-Transport-Security');
    expect(keys(prod)).toEqual(expect.arrayContaining(['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']));
  });
});

describe('API routes', () => {
  const realFetch = global.fetch;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_WP_BASE_URL = 'https://cms.example';
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('login keeps the token in a cookie and never returns it', async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ token: TOKEN, user_email: 'me@x.org' }), { status: 200 }));
    const r = res();
    await login(req({ method: 'POST', body: { email: 'me@x.org', password: 'pw' } }), r);
    expect(r.statusCode).toBe(200);
    expect(JSON.stringify(r.body)).not.toContain(TOKEN);
    expect(r.body.email).toBe('me@x.org');
    expect(r.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(global.fetch.mock.calls[0][0]).toBe('https://cms.example/wp-json/karamoja/v1/auth/login');
  });

  it('login falls back to the JWT plugin before cut-over and hides why it failed', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'rest_no_route' }), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: '[jwt_auth] incorrect_password', message: 'The password you entered for the email address me@x.org is incorrect' }), { status: 403 }));
    const r = res();
    await login(req({ method: 'POST', body: { email: 'me@x.org', password: 'bad' } }), r);
    expect(global.fetch.mock.calls[1][0]).toBe('https://cms.example/wp-json/jwt-auth/v1/token');
    expect(r.statusCode).toBe(401);
    expect(r.body.message).toBe('The email or password is incorrect.');
  });

  it('login refuses a cross-site post', async () => {
    global.fetch = vi.fn();
    const r = res();
    await login(req({ method: 'POST', headers: { 'x-requested-with': '' }, body: { email: 'a', password: 'b' } }), r);
    expect(r.statusCode).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('portal forwards allowed calls with the token from the cookie', async () => {
    global.fetch = vi.fn(async () => new Response('{"items":[]}', { status: 200, headers: { 'content-type': 'application/json' } }));
    const r = res();
    await portalProxy(req({ cookies: `kc_session=${TOKEN}`, query: { path: ['tk', 'v1', 'my-submissions'] } }), r);
    expect(r.statusCode).toBe(200);
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe('https://cms.example/wp-json/tk/v1/my-submissions');
    expect(init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('portal refuses other routes and calls without a session', async () => {
    global.fetch = vi.fn();
    const r1 = res();
    await portalProxy(req({ cookies: `kc_session=${TOKEN}`, query: { path: ['wp', 'v2', 'users'] } }), r1);
    expect(r1.statusCode).toBe(404);
    const r2 = res();
    await portalProxy(req({ query: { path: ['tk', 'v1', 'my-submissions'] } }), r2);
    expect(r2.statusCode).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('portal ends the session when the CMS refuses the token', async () => {
    global.fetch = vi.fn(async () => new Response('{"code":"jwt_auth_invalid_token"}', { status: 403 }));
    const r = res();
    await portalProxy(req({ cookies: `kc_session=${TOKEN}`, query: { path: ['tk', 'v1', 'my-submissions'] } }), r);
    expect(r.statusCode).toBe(401);
    expect(r.body.code).toBe('session_expired');
    expect(String(r.headers['set-cookie'])).toContain('Max-Age=0');
  });

  it('portal passes the raw body and query string through', async () => {
    global.fetch = vi.fn(async () => new Response('{}', { status: 201 }));
    const r = res();
    await portalProxy(req({ method: 'POST', cookies: `kc_session=${TOKEN}`, headers: { 'content-type': 'application/json' }, body: '{"title":"x"}', query: { path: ['wp', 'v2', 'tk_alert'] } }), r);
    expect(r.statusCode).toBe(201);
    expect(global.fetch.mock.calls[0][1].body.toString()).toBe('{"title":"x"}');
    const r2 = res();
    await portalProxy(req({ cookies: `kc_session=${TOKEN}`, query: { path: ['tk', 'v1', 'organization-status'], email: 'me@x.org' } }), r2);
    expect(global.fetch.mock.calls[1][0]).toBe('https://cms.example/wp-json/tk/v1/organization-status?email=me%40x.org');
  });
});
