import { describe, it, expect } from 'vitest';
import { heroFromCms, homeSectionsFromCms, homeVisibility, homeProps, overviewFromCms, overviewHasContent, initiativesFromCms } from '../lib/cms-home';

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
    overview: { enabled: true, title: 'Now', subtitle: '', note: 'Rains', as_of: '2026-11-01', warnings_label: 'Warnings active', warnings: { total: 3, red: 1, orange: 2, yellow: 0, green: 0 }, metrics: [{ value: '3', label: 'Warnings', note: 'x', color: 'orange' }, { value: '1', label: 'Odd', note: '', color: 'nope' }] },
    about: { enabled: true, eyebrow: 'About', title_line_1: 'A', title_line_2: 'B', description: 'D', partner_count_label: 'Partners', cta: { label: 'More', href: '/about' }, highlights: [{ title: 'T', text: 'X' }, { title: '', text: '' }] },
    map: { enabled: true, eyebrow: 'Map', title: 'Coverage', subtitle: 'S' },
    warnings: { enabled: false },
    initiatives: { enabled: true, eyebrow: 'Leading', title: 'T', subtitle: '', button: { label: 'More', href: '/community' }, items: [{ id: 5, title: 'Water project', excerpt: 'E', image: '' }, { id: 9, title: 'New one', excerpt: 'N', image: 'https://cms/i.jpg' }] },
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
    expect(homeVisibility(page())).toEqual({ hero: true, overview: true, about: true, map: true, warnings: false, initiatives: true, getInvolved: true });
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

  it('shows the editors\' figures only with a date; the warning count always', () => {
    const dated = overviewFromCms(page().sections.overview);
    expect(dated.asOf).toBe('2026-11-01');
    expect(dated.metrics).toHaveLength(2);
    expect(dated.warnings).toEqual({ label: 'Warnings active', total: 3, red: 1, orange: 2, yellow: 0, green: 0 });
    const undated = overviewFromCms({ ...page().sections.overview, as_of: '' });
    expect(undated.metrics).toEqual([]);
    expect(overviewHasContent(undated)).toBe(true);
    expect(overviewHasContent(overviewFromCms({ warnings_label: '', metrics: [{ value: '1', label: 'x' }] }))).toBe(false);
    expect(overviewFromCms({ as_of: 'soon', warnings: { total: 'x' } })).toMatchObject({ asOf: '', warnings: { total: 0 } });
  });

  it('uses the initiatives chosen in wp-admin, reusing the loaded ones', () => {
    const legacy = [{ id: 5, title: 'Water project', tag: 'Water', img: 'https://old.jpg' }, { id: 7, title: 'Other' }];
    const list = initiativesFromCms(page(), legacy);
    expect(list.map((x) => x.id)).toEqual([5, 9]);
    expect(list[0].tag).toBe('Water');
    expect(list[1]).toMatchObject({ title: 'New one', img: 'https://cms/i.jpg', tag: 'Community' });
    expect(list[1].slugPath).toContain('9');
    expect(homeProps({ en: page() }, {}, {}, legacy).initiatives.map((x) => x.id)).toEqual([5, 9]);
    const none = page({ initiatives: { enabled: true, items: [] } });
    expect(homeProps({ en: none }, {}, {}, legacy).initiatives).toBe(legacy);
    expect(homeSectionsFromCms(page()).initiatives).toMatchObject({ eyebrow: 'Leading', buttonLabel: 'More', buttonHref: '/community' });
  });
});
