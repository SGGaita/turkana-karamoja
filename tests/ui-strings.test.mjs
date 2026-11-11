import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { translate, UI_STRINGS_EN } from '../lib/ui-strings';
import { validityLabel, levelLabel, validityParts } from '../lib/cms-alerts';

describe('translate()', () => {
  it('uses the CMS text, else English, else the key', () => {
    expect(translate({ 'alerts.source': 'Chanzo' }, 'alerts.source')).toBe('Chanzo');
    expect(translate({ 'alerts.source': '' }, 'alerts.source')).toBe('Source');
    expect(translate(null, 'alerts.source')).toBe('Source');
    expect(translate(null, 'nope.missing')).toBe('nope.missing');
  });

  it('fills {placeholders} and leaves unknown ones', () => {
    expect(translate(null, 'reports.showing', { shown: 3, total: 10 })).toBe('Showing 3 of 10 reports');
    expect(translate({ 'common.last_updated': 'Ilisasishwa: {date}' }, 'common.last_updated', { date: '1 Nov 2026' })).toBe('Ilisasishwa: 1 Nov 2026');
    expect(translate(null, 'reports.showing', { shown: 3 })).toBe('Showing 3 of {total} reports');
  });

  it('picks singular or plural with n', () => {
    expect(translate(null, 'home.active_alerts', { n: 1 })).toBe('1 Active Alert');
    expect(translate(null, 'home.active_alerts', { n: 4 })).toBe('4 Active Alerts');
    expect(translate({ 'reports.count_other': 'ripoti {n}' }, 'reports.count', { n: 2 })).toBe('ripoti 2');
  });
});

describe('alert labels', () => {
  const t = (k, v) => translate({ 'alerts.validity_until': 'Hadi {date}', 'alerts.level_red': 'TAHADHARI NYEKUNDU' }, k, v);
  it('words the validity in the reader’s language', () => {
    expect(validityLabel({ validity: validityParts({ valid_to: '2026-11-20' }) }, t)).toBe('Hadi 20 Nov 2026');
    expect(validityLabel({ validity: validityParts({ lifecycle: 'cancelled' }) }, t)).toBe('Cancelled');
    expect(validityLabel({ validity: validityParts({ validity_text: '2 weeks' }) }, t)).toBe('2 weeks');
    expect(validityLabel({ valid: 'Until Friday' }, t)).toBe('Until Friday'); // old API: English as given
  });
  it('translates the level badge', () => {
    expect(levelLabel('RED', t)).toBe('TAHADHARI NYEKUNDU');
    expect(levelLabel('ORANGE', t)).toBe('ORANGE ALERT');
  });
});

describe('catalogue', () => {
  const root = path.resolve(__dirname, '..');
  const files = ['components', 'pages', 'lib', 'contexts'].flatMap((dir) => {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) return walk(p);
      return /\.(js|jsx)$/.test(e.name) ? [p] : [];
    });
    return walk(path.join(root, dir));
  });
  const used = new Set();
  files.forEach((f) => {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([a-z]+\.[a-z0-9_]+)'/g)) used.add(m[1]);
  });

  it('has every key the code uses (or its _one/_other forms)', () => {
    const missing = [...used].filter((k) => !(k in UI_STRINGS_EN) && !(`${k}_one` in UI_STRINGS_EN));
    expect(missing).toEqual([]);
    expect(used.size).toBeGreaterThan(100);
  });

  it('keeps keys in group.name form with simple {placeholders}', () => {
    Object.entries(UI_STRINGS_EN).forEach(([k, v]) => {
      expect(k).toMatch(/^[a-z]+\.[a-z0-9_]+$/);
      expect(v).not.toMatch(/\{(?![a-z_]+\})/);
    });
  });
});
