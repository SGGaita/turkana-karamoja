import crypto from 'crypto';
import { getGlobals } from '../../lib/cms';
import { languagesFromGlobals } from '../../lib/cms-globals';
import { DEFAULT_LOCALE, SITE_LOCALES, localePath } from '../../lib/locales';

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
 *
 * Each path is rebuilt in every language marked ready in Site settings → Languages (FE-26): /reports, /sw/reports.
 * Languages not ready yet refresh on their normal timer.
 */

const MAX_PATHS = 100;
const CONCURRENCY = 8;
const LANG_TTL_MS = 60 * 1000;
let readyCache = { at: 0, codes: null };

/** Address languages to rebuild: English and the ready ones (all of them if Site settings can't be read). */
export async function readyLanguages(now = Date.now(), load = () => getGlobals('en')) {
  if (readyCache.codes && now - readyCache.at < LANG_TTL_MS) return readyCache.codes;
  let codes = SITE_LOCALES;
  try {
    const ready = languagesFromGlobals(await load()).map((l) => l.code).filter((c) => SITE_LOCALES.includes(c));
    if (ready.length) codes = [DEFAULT_LOCALE, ...ready.filter((c) => c !== DEFAULT_LOCALE)];
  } catch {
    /* CMS not reachable: every language */
  }
  readyCache = { at: now, codes };
  return codes;
}

/** Every language's address of each path: ['/reports'] → ['/reports', '/sw/reports']. */
export function languagePaths(paths, codes) {
  return paths.flatMap((p) => codes.map((c) => localePath(p, c)));
}

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

  // Rebuild a few pages at a time: one by one, a full refresh can outlast WordPress's wait.
  const targets = languagePaths(wanted, await readyLanguages());
  const results = new Array(targets.length);
  let next = 0;
  const worker = async () => {
    while (next < targets.length) {
      const i = next++;
      const path = targets[i];
      try {
        await res.revalidate(path);
        results[i] = { path, ok: true };
      } catch (err) {
        results[i] = { path, ok: false, error: err?.message || 'failed' };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker));
  const ok = results.filter((r) => r.ok).length;
  return res.status(200).json({ revalidated: ok, failed: results.length - ok, results });
}
