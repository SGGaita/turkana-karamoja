import { describe, expect, it } from 'vitest';
import {
  absoluteUrl, alertJsonLd, canonicalPath, indexingAllowed, robotsTxt, siteUrl, sitemapEntries, sitemapXml,
} from '../lib/seo';

const PROD = { NEXT_PUBLIC_SITE_URL: 'https://karamoja.example/', NEXT_PUBLIC_ALLOW_INDEXING: 'true' };
const SANDBOX = { NEXT_PUBLIC_SITE_URL: 'https://karamoja-cluster-hub.vercel.app' };

describe('site address and indexing', () => {
  it('trims the trailing slash', () => {
    expect(siteUrl(PROD)).toBe('https://karamoja.example');
    expect(siteUrl({})).toBe('');
  });
  it('indexes only when told to, with an address', () => {
    expect(indexingAllowed(PROD)).toBe(true);
    expect(indexingAllowed(SANDBOX)).toBe(false);
    expect(indexingAllowed({ NEXT_PUBLIC_ALLOW_INDEXING: 'true' })).toBe(false);
  });
});

describe('canonical addresses', () => {
  it('drops query, fragment and trailing slash', () => {
    expect(canonicalPath('/reports/?lang=sw#top')).toBe('/reports');
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('')).toBe('/');
    expect(canonicalPath('//help//faq/')).toBe('/help/faq');
  });
  it('makes absolute links only with an address', () => {
    expect(absoluteUrl('/about?x=1', PROD)).toBe('https://karamoja.example/about');
    expect(absoluteUrl('/about', {})).toBe('');
    expect(absoluteUrl('https://cdn.example/a.png', PROD)).toBe('https://cdn.example/a.png');
  });
});

describe('robots.txt', () => {
  it('blocks everything outside production', () => {
    expect(robotsTxt(SANDBOX)).toBe('User-agent: *\nDisallow: /\n');
    expect(robotsTxt({})).toBe('User-agent: *\nDisallow: /\n');
  });
  it('allows production and points at the sitemap', () => {
    const txt = robotsTxt(PROD);
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Disallow: /api/');
    expect(txt).toContain('Disallow: /partners-stakeholders/set-password');
    expect(txt).toContain('Sitemap: https://karamoja.example/sitemap.xml');
  });
});

describe('sitemap', () => {
  const entries = sitemapEntries({
    alerts: [{ id: 56, title: 'Flash Flood Watch', modified: '2026-11-09 13:48:47' }],
    reports: [{ id: 35, title: 'NDMA Report & Outlook' }],
    organizations: [{ id: 21, title: 'National Disaster Management Authority' }],
    initiatives: [{ id: 81, title: 'Ward Climate Committees' }],
    helpSlugs: ['alert-levels', 'alert-levels'],
  });
  const paths = entries.map((e) => e.path);
  it('lists the main pages and every item at the address its page uses', () => {
    expect(paths).toContain('/');
    expect(paths).toContain('/early-warnings/flash-flood-watch-56');
    expect(paths).toContain('/reports/ndma-report-and-outlook-35');
    expect(paths).toContain('/organizations/national-disaster-management-authority');
    expect(paths).toContain('/community/ward-climate-committees-81');
    expect(paths.filter((p) => p === '/help/alert-levels')).toHaveLength(1);
  });
  it('never lists account or error pages', () => {
    expect(paths.some((p) => /set-password|reset-password|forgot-password|offline|404|500/.test(p))).toBe(false);
  });
  it('writes valid XML with lastmod in UTC', () => {
    const x = sitemapXml(entries, PROD);
    expect(x).toContain('<loc>https://karamoja.example/early-warnings/flash-flood-watch-56</loc><lastmod>2026-11-09T13:48:47.000Z</lastmod>');
    expect(x.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(x).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
  });
  it('survives an empty CMS', () => {
    expect(sitemapEntries({}).length).toBeGreaterThan(10);
  });
});

describe('alert structured data', () => {
  const dto = {
    id: 547, title: 'Heavy rain', body: '<p>Heavy rain <b>likely</b>.</p>', area: 'Turkana', issued: '2026-11-14',
    valid_to: '2026-11-21 07:53:27', source: 'NDMA',
  };
  it('is a SpecialAnnouncement with dates and place', () => {
    const ld = alertJsonLd(dto, 'https://karamoja.example/early-warnings/heavy-rain-547');
    expect(ld['@type']).toBe('SpecialAnnouncement');
    expect(ld.text).toBe('Heavy rain likely.');
    expect(ld.datePosted).toBe('2026-11-14T00:00:00.000Z');
    expect(ld.expires).toBe('2026-11-21T07:53:27.000Z');
    expect(ld.spatialCoverage).toEqual({ '@type': 'Place', name: 'Turkana' });
    expect(ld.publisher.name).toBe('NDMA');
    expect(ld.url).toBe('https://karamoja.example/early-warnings/heavy-rain-547');
  });
  it('has no expiry for an ongoing alert and no url when the address is unknown', () => {
    const ld = alertJsonLd({ ...dto, validity: 'ongoing' }, '');
    expect(ld.expires).toBeUndefined();
    expect(ld.url).toBeUndefined();
  });
  it('is null without an alert', () => {
    expect(alertJsonLd(null)).toBeNull();
  });
});
