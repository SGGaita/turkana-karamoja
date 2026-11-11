import { describe, it, expect, afterEach } from 'vitest';
import { topicsFromCms, faqFromCms, articleFromCms, helpCopy, helpStaticProps, HELP_DEFAULT_COPY } from '../lib/cms-help';
import { CmsError } from '../lib/cms';

describe('help topics', () => {
  it('keeps the two guides and the FAQ count, drops other topics', () => {
    const out = topicsFromCms({
      topics: [
        { slug: 'user-guide', name: 'User Guide', articles: [{ slug: 'alert-levels', title: 'Warning colours', excerpt: 'Red…' }, { title: 'no slug' }] },
        { slug: 'partner-guide', name: 'Mwongozo', articles: [] },
        { slug: '', name: 'Other', articles: [{ slug: 'x', title: 'X' }] },
      ],
      faq_count: 23,
    });
    expect(Object.keys(out.guides)).toEqual(['user-guide', 'partner-guide']);
    expect(out.guides['user-guide'].articles).toEqual([{ slug: 'alert-levels', title: 'Warning colours', excerpt: 'Red…', href: '/help/alert-levels' }]);
    expect(out.guides['partner-guide'].name).toBe('Mwongozo');
    expect(out.faqCount).toBe(23);
  });

  it('copes with nothing', () => {
    expect(topicsFromCms(null)).toEqual({ guides: {}, faqCount: 0 });
  });
});

describe('FAQ', () => {
  it('maps categories and drops empty ones', () => {
    const out = faqFromCms({
      categories: [
        { slug: 'faq-general', name: 'General', color: '#123456', items: [{ slug: 'is-it-free', question: 'Is it free?', answer: '<p>Yes.</p>' }, { slug: 'x' }] },
        { slug: 'faq-empty', name: 'Empty', items: [] },
      ],
    });
    expect(out).toEqual([{ slug: 'faq-general', name: 'General', color: '#123456', items: [{ slug: 'is-it-free', question: 'Is it free?', answer: '<p>Yes.</p>' }] }]);
  });
});

describe('article', () => {
  const dto = {
    id: 7,
    slug: 'partner-register',
    key: 'partner-register',
    title: 'Registering',
    excerpt: 'How to apply',
    content: '<h2 id="before">Before</h2><p>Text</p>',
    toc: [{ id: 'before', text: 'Before', level: 2 }, { id: '', text: 'bad' }],
    updated_at: '2026-11-11T10:00:00+00:00',
    _untranslated: ['content'],
    topic: { slug: 'partner-guide', name: 'Partner Guide', parent: '' },
    prev: null,
    next: { slug: 'partner-set-password', title: 'Setting your password' },
    related: [{ slug: 'partner-sign-in', title: 'Signing in' }],
  };

  it('maps the text, headings, neighbours and translation state', () => {
    const a = articleFromCms(dto);
    expect(a.toc).toEqual([{ id: 'before', text: 'Before', level: 2 }]);
    expect(a.englishOnly).toBe(true);
    expect(a.topic).toEqual({ slug: 'partner-guide', name: 'Partner Guide' });
    expect(a.next.slug).toBe('partner-set-password');
    expect(a.related[0].href).toBe('/help/partner-sign-in');
    expect(a.isFaq).toBe(false);
  });

  it('knows FAQ answers and topics that are not guides', () => {
    const a = articleFromCms({ ...dto, _untranslated: [], topic: { slug: 'faq-general', name: 'General', parent: 'faq' } });
    expect(a.isFaq).toBe(true);
    expect(a.topic).toBeNull();
    expect(a.englishOnly).toBe(false);
    expect(articleFromCms({})).toBeNull();
  });
});

describe('Help Center page text', () => {
  it('uses the defaults until the page is saved', () => {
    const c = helpCopy(null, 'en');
    expect(c.hero.title).toBe(HELP_DEFAULT_COPY.hero.title);
    expect(c.cards.partner_guide).toContain('partner organisations');
    expect(c.contact.title).toBe('Still need help?');
  });

  it('uses the saved text, the defaults for sections saved before they existed, and nothing for switched-off ones', () => {
    const page = { sections: { hero: { title: 'Msaada', subtitle: '' }, intro: { text: 'Karibu' }, faq: { title: 'Maswali' }, contact: { enabled: false } }, updated_at: 'x' };
    const c = helpCopy({ en: page, sw: page }, 'sw');
    expect(c.hero.title).toBe('Msaada');
    expect(c.intro.text).toBe('Karibu');
    expect(c.faq.title).toBe('Maswali');
    expect(c.cards.faq).toBe(HELP_DEFAULT_COPY.cards.faq);
    expect(c.contact).toEqual({});
  });
});

describe('helpStaticProps', () => {
  const phase = process.env.NEXT_PHASE;
  afterEach(() => {
    process.env.NEXT_PHASE = phase;
  });

  it('returns the props, or not found for a missing article', async () => {
    expect(await helpStaticProps(async () => ({ a: 1 }))).toEqual({ props: { a: 1, unavailable: false }, revalidate: 300 });
    expect(await helpStaticProps(async () => { throw new CmsError('gone', 404, 'karamoja_not_found'); })).toEqual({ notFound: true, revalidate: 300 });
  });

  it('builds a short "not available" page during the build, keeps the last good page afterwards', async () => {
    const down = async () => { throw new CmsError('CMS unreachable'); };
    process.env.NEXT_PHASE = 'phase-production-build';
    expect(await helpStaticProps(down)).toEqual({ props: { unavailable: true }, revalidate: 60 });
    process.env.NEXT_PHASE = 'phase-production-server';
    await expect(helpStaticProps(down)).rejects.toThrow('CMS unreachable');
  });
});
