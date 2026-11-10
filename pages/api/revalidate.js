import crypto from 'crypto';

/**
 * On-demand revalidation (karamoja-wp WP-30): WordPress POSTs the paths it changed so those pages are rebuilt within
 * seconds instead of waiting for their ISR timer.
 *
 * POST /api/revalidate
 * Header: x-karamoja-secret: <REVALIDATE_SECRET> (same value as KARAMOJA_REVALIDATE_SECRET in wp-config.php)
 * Body:   { "paths": ["/", "/early-warnings", "/early-warnings/some-alert"] }
 *
 * Answers 200 with a result per path. A path that isn't a page yet (e.g. a brand-new alert) is reported, not fatal:
 * it is built on its first visit anyway.
 */

const MAX_PATHS = 100;

function secretMatches(given, expected) {
  if (!given || !expected || expected.length < 32) return false;
  const a = Buffer.from(String(given));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Site paths only: no protocol, no "//", no "..", no whitespace or control characters.
export function safePath(p) {
  return (
    typeof p === 'string' &&
    p.length <= 200 &&
    p.startsWith('/') &&
    !p.startsWith('//') &&
    !p.includes('..') &&
    !/[\s\u0000-\u001f]/.test(p)
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.REVALIDATE_SECRET || process.env.REVALIDATE_SECRET.length < 32) {
    return res.status(503).json({ error: 'Revalidation is not configured' });
  }
  if (!secretMatches(req.headers['x-karamoja-secret'], process.env.REVALIDATE_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const paths = Array.isArray(req.body?.paths) ? req.body.paths : [];
  const wanted = [...new Set(paths.filter(safePath).map((p) => p.split('?')[0].split('#')[0] || '/'))].slice(0, MAX_PATHS);
  if (!wanted.length) {
    return res.status(400).json({ error: 'No valid paths' });
  }

  const results = [];
  for (const path of wanted) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await res.revalidate(path);
      results.push({ path, ok: true });
    } catch (err) {
      results.push({ path, ok: false, error: err?.message || 'failed' });
    }
  }
  const ok = results.filter((r) => r.ok).length;
  return res.status(200).json({ revalidated: ok, failed: results.length - ok, results });
}
