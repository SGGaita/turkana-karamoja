import { describe, it, expect } from 'vitest';
import { heroFromCms, homeSectionsFromCms, homeVisibility, homeProps } from '../lib/cms-home';

const page = (over = {}) => ({
  page: 'home',
  updated_at: '2026-11-10T08:00:00+00:00',
  sections: {
    hero: {
      enabled: true,
      eyebrow: 'Kenya · Uganda Districts',
      title: 'Karamoja',
      title_accent: 'Climate hub',
      subtitle: 'Sub',
      image: null,
      primary_cta: { label: 'See warnings', href: '/early-warnings', external: false },
      secondary_cta: { label: '', href: '', external: false },
    },
    overview: { enabled: true, title: 'Now', subtitle: '', note: 'Rains', metrics: [{ value: '3', label: 'Warnings', note: 'x', color: 'orange' }, { value: '1', label: 'Odd', note: '', color: 'nope' }] },
    about: { enabled: true, eyebrow: 'About', title_line_1: 'A', title_line_2: 'B', description: 'D', partner_count_label: 'Partners', cta: { label: 'More', href: '/about' }, highlights: [{ title: 'T', text: 'X' }, { title: '', text: '' }] },
    map: { enabled: true, eyebrow: 'Map', title: 'Coverage', subtitle: 'S' },
    warnings: { enabled: false },
    initiatives: { enabled: true, items: [] },
    get_involved: { enabled: true, eyebrow: 'Join', heading: 'H', body: 'B', button: { label: 'Go', href: '/partners-stakeholders' } },
    ...over,
  },
});

describe('home from CMS', () => {
  it('maps the hero to the shape the Hero component reads', () => {
    const h = heroFromCms(page(), { backgroundImage: 'https://old/photo.jpg' });
    expect(h.eyebrow).toBe('Kenya · Uganda Districts');
    expect(h.titleAccent).toBe('Climate hub');
    expect(h.primaryCta).toEqual({ label: 'See warnings', href: '/early-warnings' });
    expect(h.secondaryCta.href).toBe('#about');
    expect(h.backgroundImage).toBe('https://old/photo.jpg'); // Kept until a photo is chosen in wp-admin.
    expect(h.overview.metrics[0]).toEqual({ val: '3', label: 'Warnings', sub: 'x', color: '#E87010' });
    expect(h.overview.metrics[1].color).toBe('#D4A96A');
    expect(heroFromCms(page({ hero: { image: { url: 'https://cms/new.jpg' } } })).backgroundImage).toBe('https://cms/new.jpg');
  });

  it('empty CMS text stays empty (no English or legacy text slipped in)', () => {
    const h = heroFromCms(page({ hero: { enabled: true, eyebrow: '', title: 'K' } }));
    expect(h.eyebrow).toBe('');
  });

  it('maps about, map and get-involved and keeps the legacy footer', () => {
    const s = homeSectionsFromCms(page(), { footer: { columnContact: 'Contact' }, about: { eyebrow: 'old' } });
    expect(s.footer).toEqual({ columnContact: 'Contact' });
    expect(s.about.eyebrow).toBe('About');
    expect(s.about.ctaHref).toBe('/about');
    expect(s.about.highlights).toEqual([{ title: 'T', desc: 'X' }]);
    expect(s.map.title).toBe('Coverage');
    expect(s.getInvolved).toMatchObject({ heading: 'H', buttonLabel: 'Go', buttonHref: '/partners-stakeholders' });
  });

  it('reads hidden sections', () => {
    expect(homeVisibility(page())).toEqual({ hero: true, about: true, map: true, warnings: false, initiatives: true, getInvolved: true });
  });

  it('builds every website language; tu and ng read the combined CMS locale; missing ones use English', () => {
    const en = page();
    const tk = page({ hero: { ...en.sections.hero, eyebrow: 'Turkana text' } });
    const props = homeProps({ en, tk }, { en: { backgroundImage: 'x' } }, { en: { footer: { a: 1 } } });
    expect(Object.keys(props.heroByLocale).sort()).toEqual(['en', 'ng', 'pk', 'sw', 'tu']);
    expect(props.heroByLocale.tu.eyebrow).toBe('Turkana text');
    expect(props.heroByLocale.ng.eyebrow).toBe('Turkana text');
    expect(props.heroByLocale.sw.eyebrow).toBe('Kenya · Uganda Districts');
    expect(props.homeSectionsByLocale.pk.footer).toEqual({ a: 1 });
    expect(props.homeVisible.warnings).toBe(false);
  });
});
