import { describe, it, expect, vi } from 'vitest';
import { reportFromCms } from '../lib/cms-reports';
import { getAll } from '../lib/cms';

const dto = (over = {}) => ({
  id: 7,
  title: 'Seasonal outlook',
  excerpt: '',
  date: '2026-11-01T08:00:00',
  modified: '2026-11-02T08:00:00',
  tag: 'Assessment',
  description: '<p>Rains <strong>late</strong>.</p>',
  content: '<p>Full text</p>',
  categories: [],
  countries: ['KE'],
  keywords: ['rain'],
  publication_date: '2026-10-30',
  is_new: true,
  is_updated: false,
  organization: { name: 'Women Group', slug: 'women-group' },
  partners: 'KMD, FAO',
  documents: [{ url: 'https://cms/sw.pdf', label: '', language: 'sw', size: '2 MB' }, { url: 'https://cms/en.pdf', label: 'English', language: 'en', size: '1 MB' }],
  downloads: 5,
  download_versions: [{ key: 'en', language: 'en', count: 3, url: '' }],
  lang: 'en',
  ...over,
});

describe('reports from Karamoja Core', () => {
  it('maps to the page shape', () => {
    const r = reportFromCms(dto());
    expect(r).toMatchObject({
      id: 7, tag: 'Assessment', tagColor: '#2E8B57', categories: ['Assessment'], title: 'Seasonal outlook', desc: 'Rains late.',
      content: '<p>Full text</p>', orgs: ['KMD', 'FAO'], orgHref: '/organizations/women-group', isNew: true, countries: ['KE'],
      keywords: ['rain'], downloadCount: 5, fileUrl: 'https://cms/en.pdf', size: '1 MB', dateRaw: '2026-10-30',
    });
    expect(r.date).toBe('30 Oct 2026');
    expect(r.files[0].label).toBeTruthy();
    expect(r.downloadCounts).toEqual([{ key: 'en', language: 'en', count: 3, url: '' }]);
    expect(reportFromCms(dto({ partners: '' })).orgs).toEqual(['Women Group']);
    expect(reportFromCms(dto(), { slim: true }).content).toBeUndefined();
    expect(reportFromCms(null)).toBeNull();
  });

  it('shows the translated description in other languages, the full text otherwise', () => {
    expect(reportFromCms(dto({ lang: 'sw', description: '<p>Mvua</p>', _untranslated: [] })).content).toBe('<p>Mvua</p>');
    expect(reportFromCms(dto({ lang: 'sw', _untranslated: ['description'] })).content).toBe('<p>Full text</p>');
    expect(reportFromCms(dto({ content: '' })).content).toBe('<p>Rains <strong>late</strong>.</p>');
  });

  it('reads every page of a collection', async () => {
    process.env.NEXT_PUBLIC_WP_BASE_URL = 'http://cms.test';
    const pages = { 1: Array.from({ length: 50 }, (_, i) => ({ id: i })), 2: [{ id: 50 }] };
    const fetchImpl = vi.fn((url) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(pages[new URL(url).searchParams.get('page')] || []) }));
    const all = await getAll('reports', {}, 'en', { fetchImpl });
    expect(all).toHaveLength(51);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
