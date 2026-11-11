import { useState } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Grid, TextField, Button, CircularProgress, InputAdornment } from '@mui/material';
import Link from 'next/link';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import TollFreeLines from '../../components/TollFreeLines';
import { HelpUnavailable } from '../../components/HelpLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { pickLocale } from '../../lib/cms-alerts';
import { helpCopy, helpPageAllLocales, helpStaticProps, searchHelp, topicsAllLocales } from '../../lib/cms-help';

const CARDS = [
  { slug: 'user-guide', icon: MenuBookOutlinedIcon, color: '#C1440E', copyKey: 'user_guide' },
  { slug: 'partner-guide', icon: HandshakeOutlinedIcon, color: '#2E7BB4', copyKey: 'partner_guide' },
  { slug: 'faq', icon: QuestionAnswerOutlinedIcon, color: '#2E8B57', copyKey: 'faq' },
];

function HelpSearch() {
  const { locale, t } = useLanguage();
  const [q, setQ] = useState('');
  const [state, setState] = useState({ status: 'idle', items: [], q: '' });

  const run = async (e) => {
    e.preventDefault();
    const words = q.trim();
    if (words.length < 2) return;
    setState({ status: 'loading', items: [], q: words });
    try {
      const res = await searchHelp(words, locale);
      setState({ status: 'done', items: Array.isArray(res?.items) ? res.items : [], q: words });
    } catch {
      setState({ status: 'error', items: [], q: words });
    }
  };

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Box component="form" role="search" onSubmit={run} sx={{ display: 'flex', gap: 1.5, maxWidth: 640 }}>
        <TextField
          fullWidth
          size="small"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          label={t('help.search_label')}
          inputProps={{ maxLength: 100, type: 'search' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ bgcolor: 'white' }}
        />
        <Button type="submit" variant="contained" disableElevation sx={{ bgcolor: '#C1440E', '&:hover': { bgcolor: '#A33A0C' }, textTransform: 'none', px: 3 }}>
          {t('help.search_button')}
        </Button>
      </Box>
      <Box aria-live="polite" sx={{ mt: 2, maxWidth: 800 }}>
        {state.status === 'loading' && <CircularProgress size={22} sx={{ color: '#C1440E' }} />}
        {state.status === 'error' && <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A' }}>{t('help.search_error')}</Typography>}
        {state.status === 'done' && state.items.length === 0 && (
          <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A' }}>{t('help.search_none', { q: state.q })}</Typography>
        )}
        {state.status === 'done' && state.items.length > 0 && (
          <>
            <Typography sx={{ fontSize: '0.8rem', color: '#9A9A9A', mb: 1 }}>{t('help.search_results', { n: state.items.length })}</Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {state.items.map((item) => (
                <Box component="li" key={item.slug} sx={{ py: 1.25, borderBottom: '1px solid #E8E0D5' }}>
                  <Link href={item.faq ? `/help/faq#${item.slug}` : `/help/${item.slug}`} style={{ color: '#C1440E', fontWeight: 600 }}>{item.title}</Link>
                  {(item.snippet || item.excerpt) && (
                    <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mt: 0.5 }}>{item.snippet || item.excerpt}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default function HelpHub({ unavailable, topicsByLocale, pageByLocale }) {
  const { locale, t } = useLanguage();
  const copy = helpCopy(pageByLocale, locale);
  const topics = pickLocale(topicsByLocale, locale) || { guides: {}, faqCount: 0 };

  const cardTitle = (slug) => (slug === 'faq' ? copy.faq.title : topics.guides[slug]?.name || '');
  const cardCount = (slug) => (slug === 'faq'
    ? t('help.questions', { n: topics.faqCount })
    : t('help.articles', { n: topics.guides[slug]?.articles.length || 0 }));
  const cards = CARDS.filter((c) => (c.slug === 'faq' ? topics.faqCount > 0 : topics.guides[c.slug]?.articles.length));

  return (
    <Layout title={copy.hero.title}>
      <PageHero title={copy.hero.title} subtitle={copy.hero.subtitle} image={copy.hero.image} breadcrumbs={['Help']} />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        {copy.intro.title && <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#3D2B1F', mb: 1 }}>{copy.intro.title}</Typography>}
        {copy.intro.text && (
          <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.75, mb: 4, maxWidth: 800 }}>{copy.intro.text}</Typography>
        )}

        {unavailable ? (
          <HelpUnavailable />
        ) : (
          <>
            <HelpSearch />
            <Grid container spacing={3}>
              {cards.map(({ slug, icon: Icon, color, copyKey }) => (
                <Grid item xs={12} sm={6} md={4} key={slug}>
                  <Card elevation={0} sx={{ height: '100%', border: '1px solid #E8E0D5', borderRadius: 2, transition: 'all 0.2s', '&:hover': { borderColor: color, boxShadow: `0 8px 24px ${color}20` } }}>
                    <CardActionArea component={Link} href={`/help/${slug}`} sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <Icon sx={{ color, fontSize: 28 }} />
                        </Box>
                        <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#3D2B1F', mb: 1 }}>{cardTitle(slug)}</Typography>
                        {copy.cards[copyKey] && (
                          <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1.5 }}>{copy.cards[copyKey]}</Typography>
                        )}
                        <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>{cardCount(slug)}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Box sx={{ mt: 6, p: 3, bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2 }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', mb: 1 }}>{t('help.quick_links')}</Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { fontSize: '0.9rem', color: '#5A5A5A', mb: 0.75 } }}>
            <li><Link href="/early-warnings" style={{ color: '#C1440E' }}>{t('help.quick_warnings')}</Link></li>
            <li><Link href="/partners-stakeholders" style={{ color: '#C1440E' }}>{t('help.quick_portal')}</Link></li>
            <li><Link href="/contact" style={{ color: '#C1440E' }}>{t('help.contact')}</Link></li>
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <TollFreeLines />
        </Box>
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  return helpStaticProps(async () => {
    const [topicsByLocale, pageByLocale] = await Promise.all([topicsAllLocales(), helpPageAllLocales()]);
    return { topicsByLocale, pageByLocale };
  });
}
