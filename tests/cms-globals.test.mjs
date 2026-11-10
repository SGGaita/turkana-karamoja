import { describe, it, expect } from 'vitest';
import {
  shellFromGlobals, headerFromGlobals, footerFromGlobals, hotlinesFromGlobals, languagesFromGlobals, seoFromGlobals, isPublishedGlobals,
} from '../lib/cms-globals';

const L = (label, href) => ({ label, href, external: false });

const globals = (over = {}) => ({
  page: 'globals',
  updated_at: '2026-11-10T09:00:00+00:00',
  languages: [
    { code: 'en', label: 'English', html_lang: 'en', enabled: true },
    { code: 'sw', label: 'Kiswahili', html_lang: 'sw', enabled: true },
    { code: 'pk', label: 'Pokoot', html_lang: 'pko', enabled: false },
    { code: 'tk', label: "Ng'aturkana / Nga'Karamojong", html_lang: 'tuv', enabled: true },
  ],
  sections: {
    branding: { enabled: true, site_name: 'Karamoja', tagline: 'Climate hub', logo: null, copyright: '© 2026 Karamoja' },
    topbar: { enabled: true, status_text: 'LIVE', links: [{ link: L('Help', '/help') }, { link: L('API Access', '/help/technical') }] },
    navigation: { enabled: true, menu: [L('Home', '/'), L('Reports', '/reports')], cta: L('Alerts', '/early-warnings') },
    footer: {
      enabled: true,
      about: 'About text',
      partners: [{ name: 'KMD' }, { name: '' }],
      column1_title: 'Karamoja',
      column1_links: [{ link: L('About', '/about') }],
      column2_title: '',
      column2_links: [],
      regions_title: 'Regions',
      regions: [{ name: 'Turkana (Kenya)' }],
      contact_title: 'Contact',
      contact_link: L('Contact Us →', '/contact'),
      contact_lines: [{ text: 'Lodwar', note: '' }, { text: '', note: 'x' }],
    },
    hotlines: { enabled: true, lines: [{ label: 'Kenya Toll Free', country: 'Kenya', display: '+254 800 722 399', tel: '+254 800-722399' }, { display: '', tel: '' }] },
    social: { enabled: true, links: [{ network: 'facebook', url: L('', 'https://facebook.com/x') }, { network: 'x', url: L('', 'http://insecure') }] },
    seo: { enabled: true, title_suffix: ' · Karamoja', description: 'Desc', share_image: { url: 'https://cms/share.jpg' } },
    ...over,
  },
});

describe('shell from site settings', () => {
  it('is null until site settings are saved', () => {
    expect(shellFromGlobals({ ...globals(), updated_at: null })).toBeNull();
    expect(isPublishedGlobals(null)).toBe(false);
    expect(shellFromGlobals(globals())).not.toBeNull();
  });

  it('maps the header; retired links are dropped; the old logo and menu are kept as fallbacks', () => {
    const legacy = { branding: { logoUrl: 'https://old/logo.png' }, navLinks: [{ label: 'Old', href: '/old' }] };
    const h = headerFromGlobals(globals(), legacy);
    expect(h.branding).toEqual({ title: 'Karamoja', tagline: 'Climate hub', logoUrl: 'https://old/logo.png' });
    expect(h.topbar.links).toEqual([L('Help', '/help')]);
    expect(h.navLinks.map((l) => l.href)).toEqual(['/', '/reports']);
    expect(h.cta.href).toBe('/early-warnings');
    expect(headerFromGlobals(globals({ navigation: { menu: [] } }), legacy).navLinks).toEqual(legacy.navLinks);
    expect(headerFromGlobals(globals({ branding: { logo: { url: 'https://cms/logo.png' } } }), legacy).branding.logoUrl).toBe('https://cms/logo.png');
    expect(headerFromGlobals(globals({ topbar: { enabled: false, status_text: 'x', links: [{ link: L('Help', '/help') }] } })).topbar).toMatchObject({ statusText: '', links: [] });
  });

  it('maps the footer', () => {
    const f = footerFromGlobals(globals());
    expect(f.partners).toEqual(['KMD']);
    expect(f.columns).toEqual([{ title: 'Karamoja', links: [L('About', '/about')] }]);
    expect(f.regions).toEqual(['Turkana (Kenya)']);
    expect(f.contactLines).toEqual([{ text: 'Lodwar', note: '' }]);
    expect(f.contactLink.href).toBe('/contact');
    expect(f.copyright).toBe('© 2026 Karamoja');
    expect(f.social).toEqual([{ network: 'facebook', url: 'https://facebook.com/x' }]);
  });

  it('maps helplines with dialable numbers', () => {
    expect(hotlinesFromGlobals(globals())).toEqual([{ label: 'Kenya Toll Free', country: 'Kenya', display: '+254 800 722 399', tel: '+254800722399' }]);
    expect(hotlinesFromGlobals(globals({ hotlines: { enabled: false, lines: [{ display: '1', tel: '1' }] } }))).toEqual([]);
  });

  it('offers English and the languages marked ready; Turkana/Karamojong is "tu" on the website', () => {
    expect(languagesFromGlobals(globals()).map((l) => l.code)).toEqual(['en', 'sw', 'tu']);
    expect(languagesFromGlobals({ languages: [{ code: 'en', enabled: false, label: 'English' }] }).map((l) => l.code)).toEqual(['en']);
  });

  it('maps SEO defaults', () => {
    expect(seoFromGlobals(globals())).toEqual({ titleSuffix: ' · Karamoja', description: 'Desc', shareImage: 'https://cms/share.jpg' });
  });
});
