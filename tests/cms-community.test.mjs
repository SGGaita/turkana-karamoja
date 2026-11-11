import { describe, it, expect } from 'vitest';
import {
  waterPointFromCms,
  assistanceSiteFromCms,
  plantingFromCms,
  programmeFromCms,
  initiativeFromCms,
  healthAlertFromCms,
  chosen,
  pageCopy,
  sameSlugs,
  telParts,
} from '../lib/cms-community';
import { vocabulariesFromGlobals } from '../lib/cms-globals';

describe('service items', () => {
  it('maps a water point with freshness and location', () => {
    const wp = waterPointFromCms({
      id: 5,
      title: 'Lodwar borehole',
      type: 'borehole',
      status: 'functional',
      region: 'Turkana',
      description: '<p>Solar <b>pump</b></p>',
      location: { label: 'Lodwar', lat: '3.11', lng: 35.6 },
      last_verified: '2026-11-01',
      stale: true,
    });
    expect(wp).toMatchObject({ id: 5, name: 'Lodwar borehole', pointType: 'borehole', lat: 3.11, lng: 35.6, locationLabel: 'Lodwar', stale: true });
    expect(wp.desc).toBe('Solar pump');
    expect(wp.lastUpdated).toMatch(/2026/);
  });

  it('keeps missing coordinates as null (no map pin) and drops items without an id', () => {
    expect(assistanceSiteFromCms({ id: 2, title: 'Site', location: { lat: '', lng: null } })).toMatchObject({ lat: null, lng: null, stale: false });
    expect(waterPointFromCms({ title: 'x' })).toBeNull();
  });

  it('maps planting advisories and programmes', () => {
    expect(plantingFromCms({ id: 3, title: 'Sorghum', season: 'Long rains', languages: ['EN', 3] })).toMatchObject({ crop: 'Sorghum', status: 'optimal', langs: ['EN'] });
    expect(programmeFromCms({ id: 4, title: 'Radio', link: '/x', languages: [] })).toMatchObject({ href: '/x', color: '#2E7BB4' });
  });

  it('maps an initiative with radio details and documents', () => {
    const i = initiativeFromCms({
      id: 9,
      title: 'Peace caravan',
      excerpt: '<p>Short</p>',
      tag: 'Radio',
      date: '2026-10-01T00:00:00',
      radio: { frequency: '98.1 FM', languages: 'Ng\'aturkana', times: 'Mon 7pm' },
      documents: [{ url: 'https://x/a.pdf', language: 'sw', size: '1 MB' }, { url: '' }],
    });
    expect(i).toMatchObject({ slugPath: 'peace-caravan-9', tagColor: '#2E7BB4', freq: '98.1 FM', desc: 'Short' });
    expect(i.files).toHaveLength(1);
    expect(i.files[0].label).toBeTruthy();
  });
});

describe('health alerts', () => {
  it('keeps only active health or nutrition alerts', () => {
    expect(healthAlertFromCms({ id: 1, title: 'Cholera outbreak', active: true })).not.toBeNull();
    expect(healthAlertFromCms({ id: 2, title: 'Cholera outbreak', active: false })).toBeNull();
    expect(healthAlertFromCms({ id: 3, title: 'Strong winds', active: true })).toBeNull();
  });

  it('makes the hotline number tappable', () => {
    const parts = telParts('Call the toll-free hotline 1192 (Kenya, 24/7).');
    expect(parts.find((p) => p.tel)).toEqual({ text: '1192', tel: '1192' });
    expect(parts.map((p) => p.text).join('')).toBe('Call the toll-free hotline 1192 (Kenya, 24/7).');
    expect(telParts('No number here')).toEqual([{ text: 'No number here' }]);
  });
});

describe('page helpers', () => {
  const all = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it('chosen() follows the picked order and falls back to everything', () => {
    expect(chosen([{ id: 3 }, { id: 1 }, { id: 99 }], all).map((x) => x.id)).toEqual([3, 1]);
    expect(chosen([], all)).toBe(all);
    expect(chosen(undefined, all)).toBe(all);
  });

  it('pageCopy() uses saved sections, else the built-in text', () => {
    const defaults = { hero: { title: 'Default', subtitle: 'Sub', image: 'img.jpg' }, empty: { text: 'None' } };
    const unsaved = pageCopy(null, 'en', defaults);
    expect(unsaved.hero).toEqual({ title: 'Default', subtitle: 'Sub', image: 'img.jpg' });
    expect(unsaved.copy('empty').text).toBe('None');

    const saved = pageCopy(
      { en: { sections: { hero: { title: 'Saved', subtitle: '' }, empty: { enabled: false, text: 'x' } } }, sw: { sections: { hero: { title: 'Maji' } } } },
      'sw',
      defaults,
    );
    expect(saved.hero).toEqual({ title: 'Maji', subtitle: '', image: 'img.jpg' });
    const en = pageCopy({ en: { sections: { hero: { title: 'Saved' }, empty: { enabled: false, text: 'x' } } } }, 'en', defaults);
    expect(en.shown('empty')).toBe(false);
    expect(en.copy('empty')).toEqual({});
  });

  it('sameSlugs() links every language to the English address', () => {
    const out = sameSlugs({ en: [{ id: 9, slugPath: 'peace-caravan-9' }], sw: [{ id: 9, slugPath: 'msafara-wa-amani-9' }] });
    expect(out.sw[0].slugPath).toBe('peace-caravan-9');
  });
});

describe('vocabularies', () => {
  it('turns Site settings lists into code → label maps', () => {
    const v = vocabulariesFromGlobals({ sections: { vocabularies: { site_types: [{ key: 'nfi', label: 'Household items' }, { key: '', label: 'x' }] } } });
    expect(v.site_types).toEqual({ nfi: 'Household items' });
    expect(v.water_point_types).toEqual({});
  });
});
