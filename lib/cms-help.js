/**
 * Help Center from Karamoja Core (karamoja/v1/help). Replaces the hardcoded guides in lib/docs/ (audit v3 §12.7).
 *
 * Only public and partner help reaches the website; staff and technical help stays in wp-admin.
 */
import { cmsGet, cmsLocale, inAllLocales, getPageAllLocales, isPublishedPage, cmsStaticProps } from './cms';
import { pickLocale } from './cms-alerts';
import { pageCopy } from './cms-community';

/** The guides on /help, in this order. The FAQ is a third card with its own page. */
export const GUIDES = ['user-guide', 'partner-guide'];

/** Website text before Karamoja → Website pages → Help Center is saved (same as Core's content pack). */
export const HELP_DEFAULT_COPY = {
  hero: {
    title: 'Help & Documentation Center',
    subtitle: 'User guide, partner guide and frequently asked questions',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70',
  },
  intro: {
    text: 'Find out how to read early warnings, browse reports and community services, and how partner organisations register and submit content.',
  },
  cards: {
    user_guide: 'How to use the website: early warnings, reports, community services, languages and alerts on your phone.',
    partner_guide: 'For partner organisations: registering, signing in, and submitting advisories and reports for review.',
    faq: 'Short answers to the questions people ask most.',
  },
  faq: { title: 'Frequently Asked Questions', subtitle: 'Find answers to common questions' },
  contact: { title: 'Still need help?', text: 'If you could not find the answer, contact the coordination team.' },
};

const str = (v) => (typeof v === 'string' ? v : '');
const arr = (v) => (Array.isArray(v) ? v : []);

/** Help topics with their articles (public + partner). */
export function getHelpTopics(siteLocale = 'en', opts) {
  return cmsGet('/help', { audience: 'website', lang: cmsLocale(siteLocale) }, opts);
}

/** FAQ categories with questions and answers. */
export function getHelpFaq(siteLocale = 'en', opts) {
  return cmsGet('/help/faq', { lang: cmsLocale(siteLocale) }, opts);
}

/** One article by address or key. */
export function getHelpArticle(slug, siteLocale = 'en', opts) {
  return cmsGet(`/help/${encodeURIComponent(slug)}`, { lang: cmsLocale(siteLocale) }, opts);
}

/** Search (runs in the browser). */
export function searchHelp(q, siteLocale = 'en', opts) {
  return cmsGet('/help/search', { q, audience: 'website', lang: cmsLocale(siteLocale) }, opts);
}

/** An article summary in the website's shape. */
export function summaryFromCms(dto) {
  if (!dto || typeof dto !== 'object' || !str(dto.slug)) return null;
  return {
    slug: str(dto.slug),
    title: str(dto.title),
    excerpt: str(dto.excerpt),
    href: `/help/${str(dto.slug)}`,
  };
}

/** The /help topic list: guides keyed by topic slug, plus the FAQ count. */
export function topicsFromCms(dto) {
  const guides = {};
  arr(dto?.topics).forEach((t) => {
    if (!t || !GUIDES.includes(t.slug)) return;
    guides[t.slug] = {
      slug: t.slug,
      name: str(t.name),
      articles: arr(t.articles).map(summaryFromCms).filter(Boolean),
    };
  });
  return { guides, faqCount: Number(dto?.faq_count) || 0 };
}

/** FAQ categories in the website's shape. */
export function faqFromCms(dto) {
  return arr(dto?.categories)
    .map((c) => ({
      slug: str(c?.slug),
      name: str(c?.name),
      color: str(c?.color) || '#2E7BB4',
      items: arr(c?.items)
        .filter((i) => i && str(i.question))
        .map((i) => ({ slug: str(i.slug), question: str(i.question), answer: str(i.answer) })),
    }))
    .filter((c) => c.items.length);
}

/** One article in the website's shape. */
export function articleFromCms(dto) {
  if (!dto || typeof dto !== 'object' || !str(dto.slug)) return null;
  const untranslated = arr(dto._untranslated);
  return {
    id: dto.id || null,
    slug: str(dto.slug),
    key: str(dto.key),
    title: str(dto.title),
    excerpt: str(dto.excerpt),
    content: str(dto.content),
    toc: arr(dto.toc).filter((h) => h && h.id && h.text).map((h) => ({ id: str(h.id), text: str(h.text), level: Number(h.level) || 2 })),
    updatedAt: str(dto.updated_at),
    englishOnly: untranslated.includes('content'),
    topic: dto.topic && GUIDES.includes(dto.topic.slug) ? { slug: dto.topic.slug, name: str(dto.topic.name) } : null,
    prev: dto.prev && dto.prev.slug ? { slug: dto.prev.slug, title: str(dto.prev.title) } : null,
    next: dto.next && dto.next.slug ? { slug: dto.next.slug, title: str(dto.next.title) } : null,
    related: arr(dto.related).map(summaryFromCms).filter(Boolean),
    isFaq: Boolean(dto.topic && (dto.topic.slug === 'faq' || dto.topic.parent === 'faq')),
  };
}

/**
 * The Help Center page's text in the reader's language (Karamoja → Website pages → Help Center once saved,
 * else the defaults).
 */
export function helpCopy(pageByLocale, locale) {
  const { copy, hero } = pageCopy(pageByLocale, locale, HELP_DEFAULT_COPY);
  const sections = pickLocale(pageByLocale, locale)?.sections || null;
  // Card descriptions and the contact box arrived with Core 0.25.0: a page saved before reads them as defaults.
  const withDefault = (key) => {
    const v = copy(key);
    return sections && sections[key] === undefined ? HELP_DEFAULT_COPY[key] : v;
  };
  return {
    hero,
    intro: withDefault('intro'),
    cards: withDefault('cards'),
    faq: withDefault('faq'),
    contact: withDefault('contact'),
  };
}

/** The Help Center page in every language, or null until it has been saved. */
export async function helpPageAllLocales() {
  const pages = await getPageAllLocales('help').catch(() => null);
  return isPublishedPage(pages?.en) ? pages : null;
}

/** Topics in every language (English must load). */
export function topicsAllLocales() {
  return inAllLocales((l) => getHelpTopics(l).then(topicsFromCms));
}

/** getStaticProps for a help page (see cmsStaticProps). */
export function helpStaticProps(load) {
  return cmsStaticProps(load, { revalidate: 300, name: 'help' });
}
