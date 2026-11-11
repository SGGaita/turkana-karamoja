import { describe, it, expect } from 'vitest';
import { orgFromCms, profileFromCms, groupsFromCms } from '../lib/cms-orgs';

const org = {
  id: 7,
  title: 'Moroto & Napak Relief',
  abbreviation: 'MNR',
  type: 'NGO',
  country: 'UG',
  description: '<p>Water &amp; food</p>',
  website: 'https://mnr.example',
  verified: true,
  contact: null,
};

describe('organisations', () => {
  it('maps an organisation with its website address', () => {
    expect(orgFromCms(org)).toMatchObject({ id: 7, name: 'Moroto & Napak Relief', abbr: 'MNR', description: 'Water & food', website: 'https://mnr.example', slug: 'moroto-and-napak-relief', contactEmail: '' });
    expect(orgFromCms({ ...org, website: 'javascript:alert(1)' }).website).toBe('');
    expect(orgFromCms({ id: 1 })).toBeNull();
  });

  it('shows contact details only when the API sends them', () => {
    expect(orgFromCms({ ...org, contact: { name: 'Jane', email: 'j@mnr.example', phone: '+256 700' } })).toMatchObject({ contactName: 'Jane', contactEmail: 'j@mnr.example', contactPhone: '+256 700' });
  });

  it('builds a profile with advisories, reports and totals', () => {
    const p = profileFromCms({
      ...org,
      activity: {
        alerts: [{ id: 3, title: 'Dry spell', level: 'orange', active: true }],
        reports: [{ id: 4, title: 'SITREP', tag: 'SITREP' }],
        counts: { alerts: 25, reports: 1 },
      },
    });
    expect(p.advisories.map((a) => a.id)).toEqual([3]);
    expect(p.reports.map((r) => r.id)).toEqual([4]);
    expect(p.counts).toEqual({ advisories: 25, reports: 1 });
    expect(profileFromCms({ ...org }).counts).toEqual({ advisories: 0, reports: 0 });
  });

  it('maps the "who publishes here" boxes', () => {
    expect(groupsFromCms({ items: [{ title: 'Met services', text: 'Forecasts' }, { text: 'no title' }] })).toEqual([{ title: 'Met services', text: 'Forecasts' }]);
  });
});
