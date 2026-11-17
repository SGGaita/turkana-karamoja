#!/usr/bin/env node
/**
 * The pages to check for broken links (WP-38): every address in the site's /sitemap.xml (production), otherwise the
 * main pages from lib/offline-config.js and their Kiswahili versions. One URL per line.
 *
 *   node scripts/ops/link-targets.mjs https://www.example.org > pages.txt
 */
import { createRequire } from 'node:module';

const site = String(process.argv[2] || process.env.SITE_URL || '').replace(/\/+$/, '');
if (!site) {
  console.error('usage: link-targets.mjs <site address>');
  process.exit(2);
}

let urls = [];
try {
  const res = await fetch(`${site}/sitemap.xml`, { signal: AbortSignal.timeout(20_000) });
  if (res.ok) urls = [...(await res.text()).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
} catch {
  /* no sitemap: indexing is off outside production */
}
if (!urls.length) {
  const { STATIC_ROUTES } = createRequire(import.meta.url)('../../lib/offline-config.js');
  urls = STATIC_ROUTES.filter((p) => p !== '/saved' && p !== '/offline').flatMap((p) => [`${site}${p}`, `${site}/sw${p === '/' ? '' : p}`]);
}
console.log([...new Set(urls)].join('\n'));
