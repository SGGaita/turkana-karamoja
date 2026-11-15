import { buildManifest, pwaLang } from '../lib/pwa';
import snapshot from '../lib/pwa.snapshot.json';

/**
 * /manifest.webmanifest (FE-08): the web app manifest from Karamoja → Site settings → Installed app, in the visitor's
 * language (?lang=, set by LanguageContext). Cached for 5 minutes, so name and colour changes in the CMS show without
 * a rebuild; the build's copy is used when the CMS can't be reached.
 */
export default function Manifest() {
  return null;
}

const TIMEOUT_MS = 5000;

async function livePwa(lang) {
  const base = (process.env.WP_INTERNAL_URL || process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
  if (!base) return null;
  try {
    const res = await fetch(`${base}/wp-json/karamoja/v1/pwa?lang=${lang}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === 'object' && 'short_name' in data ? data : null;
  } catch {
    return null;
  }
}

export async function getServerSideProps({ res, query }) {
  const lang = pwaLang(query.lang);
  const manifest = buildManifest(await livePwa(lang), snapshot);
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
  res.end(JSON.stringify(manifest));
  return { props: {} };
}
