import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * FE-11 contract: the website and the CMS page schema (lib/cms/schema.snapshot.json, from `npm run cms:schema`) agree.
 * - Every section and field in the schema is read somewhere in the website code (else an editor fills in a field that
 *   never shows), unless listed below with the reason.
 * - Every section the website asks a page for exists in the schema (else a typo or a removed section shows nothing).
 * After a Core release that changes Website pages or Site settings: `npm run cms:schema`, then this test.
 */
const ROOT = path.join(__dirname, '..');
const walk = (d, out = []) => {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const rel = path.join(d, e.name);
    if (e.isDirectory()) walk(rel, out);
    else if (/\.(js|mjs)$/.test(e.name)) out.push(rel);
  }
  return out;
};
const FILES = ['lib', 'pages', 'components', 'contexts'].flatMap((d) => walk(d));
const SRC = FILES.map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
const SNAPSHOT = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/cms/schema.snapshot.json'), 'utf8'));

/** Read on purpose somewhere other than the page data, or by the CMS itself. */
const NOT_READ_DIRECTLY = {
  'globals.contacts.form_recipient': 'used by the CMS: where contact messages are emailed',
  'globals.alert_legend.*_title': 'read as `${level}_title` in lib/cms-globals.js',
  'globals.alert_legend.*_description': 'read as `${level}_description` in lib/cms-globals.js',
  'globals.app': 'read through karamoja/v1/pwa (lib/pwa.js, lib/install.js, lib/offline.js)',
  'globals.app.*': 'read through karamoja/v1/pwa',
  'globals.app_behaviour': 'read through karamoja/v1/pwa',
  'globals.app_behaviour.*': 'read through karamoja/v1/pwa',
};

function excused(id) {
  return Object.keys(NOT_READ_DIRECTLY).some((pattern) => {
    const re = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '[a-z0-9_]+')}$`);
    return re.test(id);
  });
}

/** The key is used as a property or a quoted name. */
function read(key) {
  return new RegExp(`['"\`]${key}['"\`]|\\.${key}\\b|\\b${key}\\s*:|\\?\\.${key}\\b`).test(SRC);
}

const ITEMS = [];
for (const [page, p] of Object.entries(SNAPSHOT.pages)) {
  for (const [section, s] of Object.entries(p.sections)) {
    ITEMS.push({ id: `${page}.${section}`, key: section });
    for (const field of Object.keys(s.fields)) ITEMS.push({ id: `${page}.${section}.${field}`, key: field });
  }
}

describe('the page schema snapshot', () => {
  it('is there and has the pages the website shows', () => {
    for (const page of ['home', 'about', 'contact', 'early-warnings', 'reports', 'community', 'help', 'globals']) {
      expect(SNAPSHOT.pages[page], page).toBeTruthy();
    }
  });
});

describe('every schema field is shown by the website', () => {
  it.each(ITEMS.map((i) => [i.id, i.key]))('%s', (id, key) => {
    expect(read(key) || excused(id), `${id}: read it in the website, or list it in NOT_READ_DIRECTLY with the reason`).toBe(true);
  });

  it('the exceptions are still in the schema', () => {
    const ids = ITEMS.map((i) => i.id);
    for (const pattern of Object.keys(NOT_READ_DIRECTLY)) {
      expect(ids.some((id) => excused(id) && new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '[a-z0-9_]+')}$`).test(id)), pattern).toBe(true);
    }
  });
});

describe('every section the website asks for exists', () => {
  const all = new Set(Object.values(SNAPSHOT.pages).flatMap((p) => Object.keys(p.sections)));
  // copy('x') / shown('x') / section="x" in pages and components.
  const asked = new Set();
  for (const re of [/\bcopy\('([a-z_]+)'\)/g, /\bshown\('([a-z_]+)'\)/g, /\bsection="([a-z_]+)"/g]) {
    for (const m of SRC.matchAll(re)) asked.add(m[1]);
  }
  it.each([...asked].sort())('%s', (section) => {
    expect(all.has(section), `"${section}" is not a section of any page in the CMS schema`).toBe(true);
  });
});
