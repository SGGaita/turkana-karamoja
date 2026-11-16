import { afterEach, describe, expect, it, vi } from 'vitest';
import { faqJsonLd } from '../lib/seo';

describe('FAQPage structured data (FE-13)', () => {
  it('lists every question with its answer as text', () => {
    const ld = faqJsonLd([
      { items: [{ question: 'Can I use it on my phone?', answer: '<p>Yes, <strong>any</strong> phone.</p>' }] },
      { items: [{ question: 'Is it free?', answer: '<p>Yes.</p>' }, { question: '', answer: '<p>skipped</p>' }] },
    ]);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toEqual([
      { '@type': 'Question', name: 'Can I use it on my phone?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, any phone.' } },
      { '@type': 'Question', name: 'Is it free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes.' } },
    ]);
  });
  it('adds nothing when there are no questions', () => {
    expect(faqJsonLd([])).toBeNull();
    expect(faqJsonLd(null)).toBeNull();
  });
});

describe('portal help (FE-14)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('lists the Partner Guide articles in order and finds articles for a form', async () => {
    const calls = [];
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      calls.push(String(url));
      const body = String(url).includes('/help/context')
        ? { items: [{ key: 'partner-submit-advisory', title: 'Submitting an advisory', excerpt: 'Steps.' }] }
        : { topics: [{ articles: [{ key: 'partner-register', title: 'Registering' }, { slug: 'partner-sign-in', title: 'Signing in' }, { title: 'No key' }] }] };
      return { ok: true, json: async () => body };
    }));
    const { partnerArticles, contextArticles } = await import('../lib/help-client');
    expect(await partnerArticles('sw')).toEqual([
      { key: 'partner-register', title: 'Registering', excerpt: '' },
      { key: 'partner-sign-in', title: 'Signing in', excerpt: '' },
    ]);
    expect((await contextArticles('partner.submit-advisory'))[0].key).toBe('partner-submit-advisory');
    await contextArticles('partner.submit-advisory'); // From the session cache.
    expect(calls).toHaveLength(2);
    expect(calls[0]).toContain('/wp-json/karamoja/v1/help?audience=partner&lang=sw');
    expect(calls[1]).toContain('/help/context?keys=partner.submit-advisory&lang=en');
  });

  it('tries again after a failure', async () => {
    let n = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      n += 1;
      return n === 1 ? { ok: false, status: 503 } : { ok: true, json: async () => ({ items: [] }) };
    }));
    const { contextArticles } = await import('../lib/help-client');
    await expect(contextArticles('partner.signin')).rejects.toThrow('503');
    await expect(contextArticles('partner.signin')).resolves.toEqual([]);
  });
});
