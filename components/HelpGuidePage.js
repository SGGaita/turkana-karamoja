import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import HelpLayout, { HelpUnavailable } from './HelpLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { pickLocale } from '../lib/cms-alerts';
import { GUIDES, helpCopy } from '../lib/cms-help';

const COPY_KEY = { 'user-guide': 'user_guide', 'partner-guide': 'partner_guide' };

/** A guide (help topic): its articles in order, each linking to its page. */
export default function HelpGuidePage({ slug, unavailable, topicsByLocale, pageByLocale }) {
  const { locale, t } = useLanguage();
  const copy = helpCopy(pageByLocale, locale);
  const topics = pickLocale(topicsByLocale, locale) || { guides: {}, faqCount: 0 };
  const guide = topics.guides[slug] || { name: '', articles: [] };
  const guides = GUIDES.map((g) => topics.guides[g]).filter(Boolean);
  const title = guide.name || copy.hero.title;

  return (
    <HelpLayout
      title={title}
      subtitle={copy.cards[COPY_KEY[slug]]}
      image={copy.hero.image}
      breadcrumbs={['Help', title]}
      guides={guides}
      active={slug}
      faqLabel={topics.faqCount ? copy.faq.title : ''}
      contact={copy.contact}
    >
      {unavailable ? (
        <HelpUnavailable />
      ) : (
        <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, counterReset: 'guide' }}>
          {guide.articles.map((a) => (
            <Box
              component="li"
              key={a.slug}
              sx={{
                counterIncrement: 'guide',
                display: 'flex',
                gap: 2,
                p: 2.5,
                mb: 1.5,
                bgcolor: 'white',
                border: '1px solid #E8E0D5',
                borderRadius: 2,
                '&::before': { content: 'counter(guide)', flex: '0 0 32px', height: 32, borderRadius: '50%', bgcolor: '#C1440E12', color: '#C1440E', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' },
              }}
            >
              <Box>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                  <Link href={a.href} style={{ color: '#3D2B1F' }}>{a.title}</Link>
                </Typography>
                {a.excerpt && <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.6 }}>{a.excerpt}</Typography>}
              </Box>
            </Box>
          ))}
          {!guide.articles.length && <Typography sx={{ color: '#5A5A5A' }}>{t('help.not_found')}</Typography>}
        </Box>
      )}
    </HelpLayout>
  );
}
