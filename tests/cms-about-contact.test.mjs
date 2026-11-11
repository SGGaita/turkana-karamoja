import { describe, it, expect } from 'vitest';
import { featuresFromCms, stepsFromCms, partnersFromCms, officesFromGlobals, socialFromGlobals, helpBoxFromCms } from '../lib/cms-about-contact';

describe('About', () => {
  it('maps features and numbers the steps, skipping rows without a title', () => {
    expect(featuresFromCms({ items: [{ title: 'Alerts', text: 'Flood alerts' }, { text: 'no title' }] })).toEqual([{ title: 'Alerts', description: 'Flood alerts' }]);
    expect(stepsFromCms({ items: [{ title: 'Collect' }, {}, { title: 'Verify', text: 'Checked' }] })).toEqual([
      { title: 'Collect', description: '', step: 1 },
      { title: 'Verify', description: 'Checked', step: 2 },
    ]);
    expect(featuresFromCms(null)).toEqual([]);
  });

  it('links chosen organisations to their pages', () => {
    expect(partnersFromCms({ items: [{ id: 4, title: 'Kenya Meteorological Department', abbreviation: 'KMD', type: 'Government' }, { id: 5 }] })).toEqual([
      { id: 4, name: 'Kenya Meteorological Department', abbr: 'KMD', type: 'Government', href: '/organizations/kenya-meteorological-department' },
    ]);
  });
});

describe('Contact', () => {
  const g = {
    sections: {
      contacts: { offices: [{ name: 'Lodwar', region: 'Turkana', phone: '+254 700', email: 'a@b.org' }, { region: 'no name' }] },
      social: { links: [{ network: 'x', url: { href: 'https://x.com/hub', label: '' } }, { network: 'facebook', url: { href: 'javascript:alert(1)' } }, { network: 'linkedin' }] },
    },
  };

  it('reads offices and social accounts from Site settings', () => {
    expect(officesFromGlobals(g)).toEqual([{ name: 'Lodwar', region: 'Turkana', address: '', phone: '+254 700', email: 'a@b.org', hours: '' }]);
    expect(socialFromGlobals(g)).toEqual([{ network: 'x', url: 'https://x.com/hub', label: 'X' }]);
    expect(officesFromGlobals(null)).toEqual([]);
  });

  it('maps the "How we can help" box', () => {
    expect(helpBoxFromCms({ title: 'How we can help', items: [{ text: 'Media' }, { text: '' }], note: 'Emergency?' })).toEqual({ title: 'How we can help', items: ['Media'], note: 'Emergency?' });
    expect(helpBoxFromCms(undefined)).toEqual({ title: '', items: [], note: '' });
  });
});
