import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * FE-24: content lives in the CMS. Built-in text is allowed only in lib/defaults.js (shown until the CMS content is
 * saved) and a few files of facts (app name, regions, country codes). Fake sample data must never come back.
 */
const ROOT = path.join(__dirname, '..');
const ALLOWED = new Set(['lib/defaults.js', 'lib/branding.js', 'lib/regions.js', 'lib/countries.js', 'lib/seo.js']);

function files(dir, out = []) {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) files(rel, out);
    else if (/\.(js|mjs)$/.test(entry.name)) out.push(rel.split(path.sep).join('/'));
  }
  return out;
}

const SITE = ['pages', 'components', 'contexts', 'lib'].flatMap((d) => files(d));

describe('no fake data in the site code', () => {
  const BANNED = [
    [/\d[\d ()]*X{2,}/, 'placeholder phone number'],
    [/tkclimate\.org/i, 'made-up email domain'],
    [/lorem ipsum/i, 'filler text'],
    [/LIVE SYSTEM/, 'status line claiming a live system'],
    [/24\/7 duty/i, 'made-up duty officer'],
    [/['"](Donor Portal|Data Sources|Methodology|Weather Forecasts|Community Bulletins)['"]/, 'link to a page that does not exist'],
  ];
  it.each(SITE)('%s', (file) => {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const [re, what] of BANNED) expect(re.test(text), `${file}: ${what}`).toBe(false);
  });
});

describe('content constants stay out of lib/', () => {
  // `export const NAME = '…'` (or `…`) with a sentence in it.
  const EXPORT_STRING = /export const ([A-Z0-9_a-z]+)\s*=\s*\n?\s*(['"`])([\s\S]*?)\2/g;
  const libFiles = files('lib').filter((f) => !ALLOWED.has(f));
  it.each(libFiles)('%s', (file) => {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const prose = [];
    for (const m of text.matchAll(EXPORT_STRING)) {
      const words = m[3].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).filter((w) => /[A-Za-z]{2,}/.test(w));
      if (words.length >= 6) prose.push(m[1]);
    }
    expect(prose, `${file}: move this text to the CMS (or lib/defaults.js if it is a built-in default)`).toEqual([]);
  });

  it('the old content files are gone', () => {
    for (const f of ['lib/fallback-data.js', 'lib/about-hub-content.js', 'lib/toll-free-lines.js']) {
      expect(fs.existsSync(path.join(ROOT, f)), f).toBe(false);
    }
  });
});
