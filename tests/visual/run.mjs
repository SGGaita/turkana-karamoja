#!/usr/bin/env node
/**
 * npm run test:visual:baseline [-- <url>]   take the "before" pictures (default: the frozen sandbox)
 * npm run test:visual [-- <url>]            compare a site with them (default: http://localhost:3000)
 * Extra Playwright options go after the URL, e.g. `npm run test:visual -- http://localhost:3000 --project=desktop`.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SANDBOX = 'https://karamoja-cluster-hub.vercel.app';
const [mode = 'compare', maybeUrl, ...rest] = process.argv.slice(2);
const isUrl = /^https?:\/\//.test(maybeUrl || '');
const url = isUrl ? maybeUrl : mode === 'baseline' ? SANDBOX : 'http://localhost:3000';
const extra = isUrl ? rest : [maybeUrl, ...rest].filter(Boolean);
const config = join(dirname(fileURLToPath(import.meta.url)), 'playwright.config.mjs');
const args = ['playwright', 'test', '-c', config, ...(mode === 'baseline' ? ['--update-snapshots'] : []), ...extra];

console.log(`${mode === 'baseline' ? 'Taking the "before" pictures from' : 'Comparing'} ${url}`);
const r = spawnSync('npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, VISUAL_URL: url, VISUAL_MODE: mode },
});
if (mode !== 'baseline') console.log('Report: npx playwright show-report playwright-report/visual');
process.exit(r.status ?? 1);
