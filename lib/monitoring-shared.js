/**
 * Error monitoring (FE-27), shared by the browser (lib/monitoring.js) and the server (lib/monitoring-server.js).
 *
 * Errors go to Sentry when NEXT_PUBLIC_SENTRY_DSN is set; without it nothing is loaded or sent. Reports pass through
 * this site's /api/monitoring (pages/api/monitoring.js), so the CSP needs no Sentry host and ad-blockers don't drop
 * them. No personal data: emails and phone numbers are blanked, and addresses lose their query string (password
 * links carry one-time keys there).
 */

/** Read as literal `process.env.NEXT_PUBLIC_…`, so Next.js builds them into browser code too. */
const PUBLIC_ENV = {
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV,
};

/** The DSN, or '' when monitoring is off. */
export function monitoringDsn(env = PUBLIC_ENV) {
  const v = String(env.NEXT_PUBLIC_SENTRY_DSN || '').trim();
  // https only; plain http only for a Sentry running on this machine (testing).
  const ok = /^https:\/\/[A-Za-z0-9]+@[A-Za-z0-9.-]+(:\d+)?\/\d+$/.test(v) || /^http:\/\/[A-Za-z0-9]+@(localhost|127\.0\.0\.1)(:\d+)?\/\d+$/.test(v);
  return ok ? v : '';
}

/** "production", "preview" (Vercel previews), or what SENTRY_ENVIRONMENT says. */
export function monitoringEnvironment(env = PUBLIC_ENV) {
  return String(env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || env.NEXT_PUBLIC_VERCEL_ENV || env.NODE_ENV || 'production');
}

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+?\d[\d ()-]{7,}\d)/g;

/** Text with emails and phone numbers blanked. */
export function scrubText(v) {
  return typeof v === 'string' ? v.replace(EMAIL, '[email]').replace(PHONE, '[phone]') : v;
}

/** An address without its query string or fragment. */
export function scrubUrl(v) {
  if (typeof v !== 'string') return v;
  return v.split(/[?#]/)[0];
}

/** A Sentry event with personal data removed (messages, exception values, request, breadcrumbs, user). */
export function scrubEvent(event) {
  if (!event || typeof event !== 'object') return event;
  const e = { ...event };
  delete e.user;
  if (e.message) e.message = scrubText(e.message);
  if (e.exception?.values) {
    e.exception = { ...e.exception, values: e.exception.values.map((x) => ({ ...x, value: scrubText(x.value) })) };
  }
  if (e.request) {
    e.request = { url: scrubUrl(e.request.url), method: e.request.method };
  }
  if (Array.isArray(e.breadcrumbs)) e.breadcrumbs = e.breadcrumbs.map(scrubBreadcrumb);
  return e;
}

export function scrubBreadcrumb(b) {
  if (!b || typeof b !== 'object') return b;
  const out = { ...b, message: scrubText(b.message) };
  if (b.data) {
    out.data = { ...b.data };
    for (const k of ['url', 'from', 'to']) if (out.data[k]) out.data[k] = scrubUrl(out.data[k]);
  }
  return out;
}

/**
 * Where /api/monitoring may forward a report: only to the configured project. Returns the Sentry envelope address,
 * or '' when the report names another DSN.
 *
 * @param {string} envelope The report as sent by the SDK (first line: JSON header with `dsn`).
 * @param {string} configured The configured DSN.
 */
export function tunnelTarget(envelope, configured) {
  try {
    const header = JSON.parse(String(envelope).split('\n')[0]);
    const want = new URL(configured);
    const got = new URL(header.dsn);
    const project = want.pathname.replace(/\//g, '');
    if (got.host !== want.host || got.username !== want.username || got.pathname.replace(/\//g, '') !== project) return '';
    return `${want.protocol}//${want.host}/api/${project}/envelope/`;
  } catch {
    return '';
  }
}
