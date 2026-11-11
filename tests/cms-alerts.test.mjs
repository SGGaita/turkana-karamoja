import { describe, it, expect } from 'vitest';
import { alertFromCms, splitAlerts, htmlToText, validityText, pickLocale, formatDay } from '../lib/cms-alerts';
import { legendFromGlobals } from '../lib/cms-globals';

const dto = (over = {}) => ({
  id: 12,
  title: 'Flood warning',
  date: '2026-11-09T06:00:00',
  modified: '2026-11-10T08:00:00',
  level: 'red',
  type: 'Flood',
  area: 'Loima',
  body: '<p>Move to <strong>higher ground</strong>.</p><ul><li>Now</li></ul>',
  actions: ['Move animals', ''],
  target_groups: 'Pastoralists, Farmers',
  keywords: ['flood'],
  source: '',
  organization: { name: 'Women Group', slug: 'wg' },
  issued: '',
  valid_to: '2026-11-12 21:00:00',
  validity: 'window',
  validity_text: '',
  lifecycle: 'active',
  cancel_reason: '',
  active: true,
  on_map: true,
  location: { label: 'Lodwar', lat: 3.12, lng: 35.6 },
  documents: [{ url: 'https://cms/f.pdf', label: 'Bulletin', language: 'en', size: '1 MB' }],
  _untranslated: ['actions'],
  ...over,
});

describe('alerts from Karamoja Core', () => {
  it('maps to the page shape', () => {
    const a = alertFromCms(dto());
    expect(a).toMatchObject({ id: 12, level: 'RED', color: '#D63030', title: 'Flood warning', area: 'Loima', advisoryType: 'Flood', source: 'Women Group', active: true, onMap: true, cancelled: false });
    expect(a.bodyHtml).toContain('<strong>');
    expect(a.body).toBe('Move to higher ground.\nNow');
    expect(a.actions).toEqual(['Move animals']);
    expect(a.targetGroups).toEqual(['Pastoralists', 'Farmers']);
    expect(a.location).toEqual({ lat: 3.12, lng: 35.6, label: 'Lodwar' });
    expect(a.files[0]).toMatchObject({ url: 'https://cms/f.pdf', filename: 'Bulletin' });
    expect(a.valid).toBe('Until 13 Nov 2026'); // 21:00 UTC is the next day in Nairobi.
    expect(a.issued).toBe('9 Nov 2026');
    expect(a.updated).toBe('10 Nov 2026');
    expect(a.untranslated).toEqual(['actions']);
    expect(alertFromCms(null)).toBeNull();
    expect(alertFromCms(dto({ level: 'purple' })).level).toBe('YELLOW');
  });

  it('only active alerts with the map flag go on the map', () => {
    expect(alertFromCms(dto({ active: false })).onMap).toBe(false);
    expect(alertFromCms(dto({ on_map: false })).onMap).toBe(false);
  });

  it('describes validity', () => {
    expect(validityText({ lifecycle: 'cancelled' })).toBe('Cancelled');
    expect(validityText({ validity: 'ongoing' })).toBe('Ongoing');
    expect(validityText({ validity_text: 'Active 48 hours' })).toBe('Active 48 hours');
    expect(formatDay('soon')).toBe('soon');
  });

  it('splits active (most serious first) from ended', () => {
    const { active, recent } = splitAlerts([
      dto({ id: 1, level: 'yellow' }),
      dto({ id: 2, level: 'red' }),
      dto({ id: 3, active: false, lifecycle: 'cancelled', cancel_reason: 'False alarm' }),
    ]);
    expect(active.map((a) => a.id)).toEqual([2, 1]);
    expect(recent[0]).toMatchObject({ id: 3, cancelled: true, cancelReason: 'False alarm', valid: 'Cancelled' });
  });

  it('knows a replaced alert and links only to an early-warnings page', () => {
    const a = alertFromCms(dto({ id: 4, active: false, lifecycle: 'updated', replaced_by: { id: 9, title: 'Flood warning upgraded', path: '/early-warnings/flood-warning-upgraded-9' } }));
    expect(a).toMatchObject({ replaced: true, cancelled: false, replacedBy: { path: '/early-warnings/flood-warning-upgraded-9', title: 'Flood warning upgraded' } });
    expect(alertFromCms(dto({ id: 5, lifecycle: 'updated', replaced_by: { path: 'https://evil.example/x' } })).replacedBy).toBeNull();
    expect(alertFromCms(dto({ id: 6 })).replaced).toBe(false);
  });

  it('reads plain text from HTML', () => {
    expect(htmlToText('<p>A &amp; B</p><p>C</p>')).toBe('A & B\nC');
  });

  it('picks the reader\'s language', () => {
    const by = { en: 'E', sw: 'S', tk: 'T' };
    expect(pickLocale(by, 'sw')).toBe('S');
    expect(pickLocale(by, 'ng')).toBe('T');
    expect(pickLocale(by, 'pk')).toBe('E');
    expect(pickLocale(null, 'en')).toBeNull();
  });

  it('alert colour guide from Site settings', () => {
    const g = { sections: { alert_legend: { enabled: true, title: 'Guide', red_title: 'Severe', red_description: 'Act now', orange_title: '', orange_description: '' } } };
    expect(legendFromGlobals(g)).toEqual({ title: 'Guide', items: [{ level: 'RED', color: '#D63030', bg: '#FFF0F0', title: 'Severe', description: 'Act now' }] });
    expect(legendFromGlobals({ sections: { alert_legend: { enabled: false, red_title: 'x' } } })).toBeNull();
  });
});
