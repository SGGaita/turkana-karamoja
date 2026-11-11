import { Box, Typography, Button, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpLayout, { HelpUnavailable, helpRichTextSx } from '../../components/HelpLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { pickLocale, formatDay } from '../../lib/cms-alerts';
import { inAllLocales } from '../../lib/cms';
import {
  GUIDES,
  articleFromCms,
  getHelpArticle,
  getHelpTopics,
  helpCopy,
  helpPageAllLocales,
  helpStaticProps,
  topicsAllLocales,
  topicsFromCms,
} from '../../lib/cms-help';

export default function HelpArticle({ unavailable, articleByLocale, topicsByLocale, pageByLocale }) {
  const { locale, t } = useLanguage();
  const copy = helpCopy(pageByLocale, locale);
  const topics = pickLocale(topicsByLocale, locale) || { guides: {}, faqCount: 0 };
  const article = pickLocale(articleByLocale, locale);
  const guides = GUIDES.map((g) => topics.guides[g]).filter(Boolean);

  if (unavailable || !article) {
    return (
      <HelpLayout title={copy.hero.title} image={copy.hero.image} breadcrumbs={['Help']} guides={guides} contact={copy.contact}>
        <HelpUnavailable />
      </HelpLayout>
    );
  }

  const topicName = article.isFaq ? copy.faq.title : article.topic?.name;
  const active = article.isFaq ? 'faq' : article.topic?.slug;

  return (
    <HelpLayout
      title={article.title}
      subtitle={article.excerpt}
      image={copy.hero.image}
      breadcrumbs={['Help', ...(topicName ? [topicName] : []), article.title]}
      guides={guides}
      active={active}
      toc={article.toc}
      faqLabel={topics.faqCount ? copy.faq.title : ''}
      contact={copy.contact}
    >
      <Box component="article">
        {article.englishOnly && (
          <Box sx={{ bgcolor: '#FFF8E7', border: '1px solid #E8D5A0', borderRadius: 2, p: 1.5, mb: 3, fontSize: '0.85rem', color: '#5A5A5A' }}>
            {t('help.english_only')}
          </Box>
        )}
        <Box sx={helpRichTextSx} dangerouslySetInnerHTML={{ __html: article.content }} />
        {article.updatedAt && (
          <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', mt: 3 }}>{t('help.updated', { date: formatDay(article.updatedAt) })}</Typography>
        )}
      </Box>

      {(article.prev || article.next) && (
        <Box component="nav" aria-label={topicName || t('help.guides')} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          {article.prev ? (
            <Button component={Link} href={`/help/${article.prev.slug}`} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', color: '#3D2B1F', textAlign: 'left' }}>
              <span><small style={{ display: 'block', color: '#9A9A9A' }}>{t('help.previous')}</small>{article.prev.title}</span>
            </Button>
          ) : <span />}
          {article.next && (
            <Button component={Link} href={`/help/${article.next.slug}`} endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', color: '#3D2B1F', textAlign: 'right', ml: 'auto' }}>
              <span><small style={{ display: 'block', color: '#9A9A9A' }}>{t('help.next')}</small>{article.next.title}</span>
            </Button>
          )}
        </Box>
      )}

      {article.related.length > 0 && (
        <Box component="section" sx={{ mt: 5 }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#3D2B1F', mb: 2 }}>{t('help.related')}</Typography>
          <Grid container spacing={2}>
            {article.related.map((r) => (
              <Grid item xs={12} sm={4} key={r.slug}>
                <Card elevation={0} sx={{ height: '100%', border: '1px solid #E8E0D5', borderRadius: 2 }}>
                  <CardActionArea component={Link} href={r.href} sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#3D2B1F', mb: 0.5 }}>{r.title}</Typography>
                      {r.excerpt && <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A' }}>{r.excerpt}</Typography>}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </HelpLayout>
  );
}

export async function getStaticPaths() {
  try {
    const { guides } = topicsFromCms(await getHelpTopics('en'));
    const paths = Object.values(guides).flatMap((g) => g.articles.map((a) => ({ params: { slug: a.slug } })));
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  return helpStaticProps(async () => {
    const slug = String(params?.slug || '');
    const [articleByLocale, topicsByLocale, pageByLocale] = await Promise.all([
      inAllLocales((l) => getHelpArticle(slug, l).then(articleFromCms)),
      topicsAllLocales(),
      helpPageAllLocales(),
    ]);
    return { articleByLocale, topicsByLocale, pageByLocale };
  });
}
