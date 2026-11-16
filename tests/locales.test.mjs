import { describe, expect, it } from 'vitest';
import { cmsFor, localePath, siteLocale, splitLocale, SITE_LOCALES } from '../lib/locales';
import { hreflangLinks, sitemapXml, robotsTxt } from '../lib/seo';
import { languagePaths, readyLanguages } from '../pages/api/revalidate';
import { forLocale, groupFor } from '../lib/offline';
import { isPageHref } from '../lib/links';
import { serviceCardsByLocale } from '../lib/cms-community';

const PROD = { NEXT_PUBLIC_SITE_URL: 'https://hub.example.org', NEXT_PUBLIC_ALLOW_INDEXING: 'true' };
const READY = [{ code: 'en', hreflang: 'en' }, { code: 'sw', hreflang: 'sw' }, { code: 'tuv', hreflang: '' }];

describe('language addresses (FE-26)', () => {
  it('uses the language tags Core gives each language, English without a prefix', () => {
    expect(SITE_LOCALES).toEqual(['en', 'sw', 'pko', 'tuv']);
    expect(localePath('/reports', 'sw')).toBe('/sw/reports');
    expect(localePath('/', 'sw')).toBe('/sw');
    expect(localePath('/sw/reports', 'en')).toBe('/reports');
    expect(localePath('/sw/reports?x=1', 'pko')).toBe('/pko/reports?x=1');
    expect(splitLocale('/tuv/help/faq')).toEqual({ locale: 'tuv', path: '/help/faq' });
    expect(splitLocale('/swahili-news')).toEqual({ locale: 'en', path: '/swahili-news' });
  });

  it('reads the old codes and the CMS codes', () => {
    expect(['tu', 'ng', 'tk', 'pk', 'sw', 'xx'].map(siteLocale)).toEqual(['tuv', 'tuv', 'tuv', 'pko', 'sw', '']);
    expect(['en', 'sw', 'pko', 'tuv', 'tu', 'zz'].map(cmsFor)).toEqual(['en', 'sw', 'pk', 'tk', 'tk', 'en']);
  });

  it('tells search engines about the languages they know, with English as x-default', () => {
    expect(hreflangLinks('/reports', READY, PROD)).toEqual([
      { hreflang: 'en', href: 'https://hub.example.org/reports' },
      { hreflang: 'sw', href: 'https://hub.example.org/sw/reports' },
      { hreflang: 'x-default', href: 'https://hub.example.org/reports' },
    ]);
    expect(hreflangLinks('/reports', [{ code: 'en', hreflang: 'en' }], PROD)).toEqual([]);
    expect(hreflangLinks('/reports', READY, {})).toEqual([]);
  });

  it('lists every page in every ready language in the sitemap, and keeps account pages out in every language', () => {
    const x = sitemapXml([{ path: '/about', lastmod: '' }], PROD, READY);
    expect(x).toContain('<loc>https://hub.example.org/about</loc>');
    expect(x).toContain('<loc>https://hub.example.org/sw/about</loc>');
    expect(x).toContain('<loc>https://hub.example.org/tuv/about</loc>');
    expect(x).toContain('hreflang="sw" href="https://hub.example.org/sw/about"');
    expect(x).not.toContain('hreflang=""');
    expect(robotsTxt(PROD)).toContain('Disallow: /sw/partners-stakeholders/set-password');
  });

  it('rebuilds a changed page in each ready language', async () => {
    expect(languagePaths(['/', '/reports'], ['en', 'sw'])).toEqual(['/', '/sw', '/reports', '/sw/reports']);
    const codes = await readyLanguages(1e12, async () => ({ languages: [{ code: 'en', enabled: true, label: 'English' }, { code: 'sw', enabled: true, label: 'Kiswahili' }] }));
    expect(codes).toEqual(['en', 'sw']);
  });

  it('saves pages for offline use in the language being read', () => {
    expect(forLocale('sw', ['/', '/reports'])).toEqual(['/sw', '/sw/reports']);
    expect(forLocale('en', ['/reports'])).toEqual(['/reports']);
    expect([groupFor('core', 'en'), groupFor('core', 'sw')]).toEqual(['core', 'core-sw']);
  });

  it('sends buttons with internal addresses through Next.js links (they keep the language)', () => {
    expect(isPageHref('/reports')).toBe(true);
    expect(isPageHref('/cms-files/2026/a.pdf')).toBe(false);
    expect(isPageHref('/api/x')).toBe(false);
    expect(isPageHref('/reports', { target: '_blank' })).toBe(false);
    expect(isPageHref('https://example.org')).toBe(false);
    expect(isPageHref('/sitemap.xml')).toBe(false);
  });

  it('service page cards stay in the unprefixed form (Link adds the language)', () => {
    expect(serviceCardsByLocale([null, null, null, null], ['sw']).sw[0].href).toBe('/community/assistance');
  });
});
