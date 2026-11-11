import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cmsGet, cmsLocale, cmsStaticProps, getPageAllLocales, isPublishedPage, CmsError } from '../lib/cms';

const ok = (body) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const fail = (status) => Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });

describe('cms client', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_WP_BASE_URL = 'http://cms.test/';
  });

  it('maps website languages to CMS languages', () => {
    expect(cmsLocale('en')).toBe('en');
    expect(cmsLocale('sw')).toBe('sw');
    expect(cmsLocale('pk')).toBe('pk');
    expect(cmsLocale('tu')).toBe('tk');
    expect(cmsLocale('ng')).toBe('tk');
    expect(cmsLocale('fr')).toBe('en');
    expect(cmsLocale(undefined)).toBe('en');
  });

  it('builds the URL with the language', async () => {
    const fetchImpl = vi.fn(() => ok({ page: 'home' }));
    await cmsGet('/pages/home', { lang: 'tk', empty: '' }, { fetchImpl });
    expect(fetchImpl.mock.calls[0][0]).toBe('http://cms.test/wp-json/karamoja/v1/pages/home?lang=tk');
  });

  it('throws on HTTP errors and network failures instead of returning made-up content', async () => {
    await expect(cmsGet('/pages/home', {}, { fetchImpl: () => fail(500) })).rejects.toBeInstanceOf(CmsError);
    await expect(cmsGet('/pages/home', {}, { fetchImpl: () => fail(404) })).rejects.toMatchObject({ status: 404 });
    await expect(cmsGet('/pages/home', {}, { fetchImpl: () => Promise.reject(new Error('ECONNREFUSED')) })).rejects.toThrow(/unreachable/);
  });

  it('throws when the CMS URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_WP_BASE_URL;
    await expect(cmsGet('/globals')).rejects.toThrow(/not configured/);
  });

  it('loads every language; only English is required', async () => {
    const fetchImpl = vi.fn((url) => (url.includes('lang=pk') ? fail(500) : ok({ locale: new URL(url).searchParams.get('lang') })));
    const pages = await getPageAllLocales('home', { fetchImpl });
    expect(Object.keys(pages).sort()).toEqual(['en', 'sw', 'tk']);
    await expect(getPageAllLocales('home', { fetchImpl: (url) => (url.includes('lang=en') ? fail(503) : ok({})) })).rejects.toBeInstanceOf(CmsError);
  });

  it('treats a page as published once it has been saved', () => {
    expect(isPublishedPage({ sections: {}, updated_at: '2026-11-10T08:00:00+00:00' })).toBe(true);
    expect(isPublishedPage({ sections: {}, updated_at: null })).toBe(false);
    expect(isPublishedPage(null)).toBe(false);
  });
});

describe('cmsStaticProps', () => {
  const phase = process.env.NEXT_PHASE;
  const env = process.env.NODE_ENV;
  const restore = () => { process.env.NEXT_PHASE = phase; process.env.NODE_ENV = env; };

  it('passes props, null → 404, redirects through', async () => {
    expect(await cmsStaticProps(async () => ({ a: 1 }), { revalidate: 60 })).toEqual({ props: { a: 1, unavailable: false }, revalidate: 60 });
    expect(await cmsStaticProps(async () => null)).toEqual({ notFound: true, revalidate: 300 });
    const redirect = { destination: '/x', permanent: true };
    expect(await cmsStaticProps(async () => ({ redirect }))).toEqual({ redirect });
  });

  it('a missing item is a 404; Core missing (no route) is not', async () => {
    expect(await cmsStaticProps(async () => { throw new CmsError('gone', 404, 'karamoja_not_found'); })).toEqual({ notFound: true, revalidate: 300 });
    process.env.NEXT_PHASE = 'phase-production-build';
    const res = await cmsStaticProps(async () => { throw new CmsError('no route', 404, 'rest_no_route'); });
    restore();
    expect(res).toEqual({ props: { unavailable: true }, revalidate: 60 });
  });

  it('Core down: a short page during the build, the last good page afterwards', async () => {
    const down = async () => { throw new CmsError('CMS unreachable'); };
    process.env.NEXT_PHASE = 'phase-production-build';
    const built = await cmsStaticProps(down, { name: 'test' });
    process.env.NEXT_PHASE = '';
    process.env.NODE_ENV = 'production';
    await expect(cmsStaticProps(down)).rejects.toThrow('CMS unreachable');
    restore();
    expect(built).toEqual({ props: { unavailable: true }, revalidate: 60 });
  });
});
