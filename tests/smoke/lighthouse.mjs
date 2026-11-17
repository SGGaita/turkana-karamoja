#!/usr/bin/env node
/**
 * Lighthouse scores for the main pages (FE-28), saved so they can be compared over time.
 *
 *   npm run test:lighthouse                                   http://localhost:3000, phone settings
 *   SMOKE_SITE=https://www.example.org npm run test:lighthouse
 *   LH_DESKTOP=1 npm run test:lighthouse                      desktop settings instead
 *   LH_MIN="accessibility=90,seo=90" npm run test:lighthouse  fail (exit 1) below these scores
 *
 * Writes reports/lighthouse/<date>-<host>-<mobile|desktop>.md (commit it: the record) and the full HTML report for
 * each page under reports/lighthouse/html/ (not committed). Lighthouse 12 has no "PWA" category any more: the
 * installability check is in the smoke suite (`npm run test:smoke`, *installed app*).
 *
 * Measure a production build (`npm run build && npm start`) or the live site, never `npm run dev`.
 * Local scores are only a guide: the live site runs on Vercel's network and CDN.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { smokeEnv } from './env.mjs';

const env = smokeEnv();
const desktop = /^(1|true|yes)$/i.test(process.env.LH_DESKTOP || '');
const PAGES = (process.env.LH_PAGES || '/,/early-warnings,/reports,/community,/about,/help,/contact').split(',').map((p) => p.trim()).filter(Boolean);
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const MIN = Object.fromEntries(
  String(process.env.LH_MIN || '').split(',').map((s) => s.split('=').map((x) => x.trim())).filter(([k, v]) => k && v),
);

const out = fileURLToPath(new URL('../../reports/lighthouse/', import.meta.url));
mkdirSync(`${out}html`, { recursive: true });

async function chromePath() {
  if (process.env.PW_CHROME_PATH) return process.env.PW_CHROME_PATH;
  try {
    const { chromium } = await import('@playwright/test');
    const path = chromium.executablePath();
    return existsSync(path) ? path : undefined; // not downloaded: chrome-launcher finds the installed Chrome
  } catch {
    return undefined; // chrome-launcher looks for an installed Chrome
  }
}

const chrome = await chromeLauncher.launch({
  chromePath: await chromePath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', ...(process.env.LH_CHROME_FLAGS || '').split(' ').filter(Boolean)],
});

const rows = [];
let failed = false;
let version = '';
try {
  for (const path of PAGES) {
    const url = new URL(path, `${env.site}/`).href;
    process.stdout.write(`${path} … `);
    const config = desktop
      ? { extends: 'lighthouse:default', settings: { preset: 'desktop', formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false } } }
      : { extends: 'lighthouse:default' };
    const { lhr, report } = await lighthouse(url, { port: chrome.port, output: 'html', onlyCategories: CATEGORIES, logLevel: 'error' }, config);
    version = lhr.lighthouseVersion;
    const score = (c) => (lhr.categories[c]?.score == null ? null : Math.round(lhr.categories[c].score * 100));
    const metric = (id) => lhr.audits[id]?.displayValue || '–';
    const row = {
      path,
      scores: Object.fromEntries(CATEGORIES.map((c) => [c, score(c)])),
      lcp: metric('largest-contentful-paint'),
      tbt: metric('total-blocking-time'),
      cls: metric('cumulative-layout-shift'),
      // The failing audits worth reading first (score 0, weighted in a category).
      fix: Object.values(lhr.audits).filter((a) => a.score === 0 && a.scoreDisplayMode === 'binary').map((a) => a.title).slice(0, 4),
    };
    rows.push(row);
    const file = `${path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-')}${desktop ? '-desktop' : ''}.html`;
    writeFileSync(`${out}html/${file}`, report);
    for (const [c, min] of Object.entries(MIN)) {
      if (row.scores[c] != null && row.scores[c] < Number(min)) failed = true;
    }
    console.log(CATEGORIES.map((c) => `${c} ${row.scores[c] ?? '–'}`).join(' · '));
  }
} finally {
  await chrome.kill();
}

const host = new URL(env.site).host.replace(/[^a-z0-9.-]/gi, '_');
const date = new Date().toISOString().slice(0, 10);
const label = desktop ? 'desktop' : 'mobile';
const head = `| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | First things to fix |\n|---|---|---|---|---|---|---|---|---|\n`;
const body = rows
  .map((r) => `| \`${r.path}\` | ${CATEGORIES.map((c) => r.scores[c] ?? '–').join(' | ')} | ${r.lcp} | ${r.tbt} | ${r.cls} | ${r.fix.join('; ') || '–'} |`)
  .join('\n');
const md = `# Lighthouse: ${env.site} (${label}), ${date}

Lighthouse ${version}, ${desktop ? 'desktop preset' : 'phone (Moto G Power, slow 4G)'}. Scores out of 100.
${env.indexing ? '' : '\nIndexing is off on this site (sandbox / local), so SEO loses points for *noindex*: expected.\n'}
${head}${body}

Full reports: \`reports/lighthouse/html/\` (open in a browser; not committed).
`;
const file = `${out}${date}-${host}-${label}.md`;
writeFileSync(file, md);
console.log(`\nSaved ${file.replace(fileURLToPath(new URL('../../', import.meta.url)), '')}`);
if (failed) {
  console.error(`Below the minimum scores (${process.env.LH_MIN}).`);
  process.exit(1);
}
