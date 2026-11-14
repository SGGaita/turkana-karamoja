#!/usr/bin/env node
/**
 * npm run test:visual:baseline [-- <url>]   take the "before" pictures (default: the frozen sandbox)
 * npm run test:visual [-- <url>]            compare a site with them (default: http://localhost:3000)
 * Extra Playwright options go after the URL, e.g. `npm run test:visual -- http://localhost:3000 --project=desktop`.
 *
 * Browser: Playwright's own Chromium when installed (`npx playwright install chromium`); otherwise the Google Chrome
 * or Microsoft Edge already on this computer, so nothing has to be downloaded. Set PW_CHANNEL=chrome|msedge to choose.
 * The browser that took the "before" pictures is written next to them; comparisons should use the same one, because
 * browsers draw text slightly differently.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const SANDBOX = 'https://karamoja-cluster-hub.vercel.app';
const here = dirname(fileURLToPath(import.meta.url));
const shotsDir = join(here, '__screenshots__');
const browserFile = join(shotsDir, 'BROWSER.txt');

const [mode = 'compare', maybeUrl, ...rest] = process.argv.slice(2);
const isUrl = /^https?:\/\//.test(maybeUrl || '');
const url = isUrl ? maybeUrl : mode === 'baseline' ? SANDBOX : 'http://localhost:3000';
const extra = isUrl ? rest : [maybeUrl, ...rest].filter(Boolean);

/** Is the exact Chromium this Playwright version needs on disk? (A leftover older version doesn't count.) */
function playwrightChromiumInstalled() {
  try {
    const { chromium } = require('playwright-core');
    return existsSync(chromium.executablePath());
  } catch {
    return false;
  }
}

function installed(channel) {
  const pf = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
  const win = channel === 'chrome' ? ['Google/Chrome/Application/chrome.exe'] : ['Microsoft/Edge/Application/msedge.exe'];
  const other = channel === 'chrome'
    ? ['/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : ['/usr/bin/microsoft-edge', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'];
  return pf.some((p) => win.some((w) => existsSync(join(p, w)))) || other.some((p) => existsSync(p));
}

function pickBrowser() {
  if (process.env.PW_CHROME_PATH) return { env: {}, label: `chrome at ${process.env.PW_CHROME_PATH}` };
  if (process.env.PW_CHANNEL) return { env: { PW_CHANNEL: process.env.PW_CHANNEL }, label: process.env.PW_CHANNEL };
  if (playwrightChromiumInstalled()) return { env: {}, label: 'playwright-chromium' };
  for (const ch of ['chrome', 'msedge']) if (installed(ch)) return { env: { PW_CHANNEL: ch }, label: ch };
  console.error('No browser found. Install Google Chrome or Microsoft Edge, or run: npx playwright install chromium');
  process.exit(1);
}

const browser = pickBrowser();
console.log(`${mode === 'baseline' ? 'Taking the "before" pictures from' : 'Comparing'} ${url} with ${browser.label}`);
if (mode !== 'baseline' && existsSync(browserFile)) {
  const before = readFileSync(browserFile, 'utf8').trim();
  if (before && before !== browser.label) {
    console.warn(`Note: the "before" pictures were taken with ${before}. Use the same browser (PW_CHANNEL) for a fair comparison.`);
  }
}

const config = join(here, 'playwright.config.mjs');
const args = ['playwright', 'test', '-c', config, ...(mode === 'baseline' ? ['--update-snapshots'] : []), ...extra];
// Windows runs npx through cmd.exe, which would treat | & < > ^ in an argument (e.g. --grep "a|b") as its own syntax.
const quote = (a) => (process.platform === 'win32' && /[\s|&<>^"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const r = spawnSync('npx', args.map(quote), {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, ...browser.env, VISUAL_URL: url, VISUAL_MODE: mode },
});
if (mode === 'baseline' && r.status === 0) {
  mkdirSync(shotsDir, { recursive: true });
  writeFileSync(browserFile, `${browser.label}\n`);
}
if (mode !== 'baseline') console.log('Report: npx playwright show-report playwright-report/visual');
process.exit(r.status ?? 1);
