import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Typography, Button, Chip, CircularProgress, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import CmsUnavailable from '../../components/CmsUnavailable';
import ShareLinks from '../../components/ShareLinks';
import CommunityInitiativeCard from '../../components/CommunityInitiativeCard';
import { extractIdFromSlugPath } from '../../lib/slug';
import { cmsStaticProps, getCollection, getInitiative, getPageAllLocales, inAllLocales, isPublishedPage } from '../../lib/cms';
import { initiativeFromCms, sameSlugs } from '../../lib/cms-community';
import { pickLocale } from '../../lib/cms-alerts';
import { useLanguage } from '../../contexts/LanguageContext';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=70';

const richTextSx = {
  fontSize: '0.95rem',
  lineHeight: 1.8,
  color: '#3D2B1F',
  '& p': { m: '0 0 1.1em' },
  '& h2, & h3': {
    fontFamily: '"Montserrat", sans-serif',
    color: '#3D2B1F',
    mt: 3,
    mb: 1.5,
  },
  '& h2': { fontSize: '1.35rem' },
  '& h3': { fontSize: '1.1rem' },
  '& ul, & ol': { pl: 3, mb: 1.5 },
  '& li': { mb: 0.5 },
  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: 2 },
  '& a': { color: '#C1440E' },
  '& strong': { color: '#3D2B1F' },
};

export default function CommunityInitiativeDetail({ unavailable, articleByLocale, relatedByLocale, pageByLocale }) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const article = pickLocale(articleByLocale, locale);
  const related = pickLocale(relatedByLocale, locale) || [];
  const heroCopy = pickLocale(pageByLocale, locale)?.sections?.hero || {};

  if (unavailable) return <CmsUnavailable />;
  if (router.isFallback || !article) {
    return (
      <Layout title={t('community.loading_article')}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#C1440E', mb: 2 }} />
          <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem' }}>{t('community.loading_article')}</Typography>
        </Box>
      </Layout>
    );
  }

  const articlePath = `/community/${article.slugPath}`;
  const files = article.files || [];

  return (
    <Layout title={article.title} description={article.desc} type="article" image={article.img}>
      <PageHero
        title={article.title}
        subtitle={article.desc || heroCopy.fallback_subtitle || ''}
        image={article.img || heroCopy.image?.url || HERO_IMAGE}
        breadcrumbs={['Community', article.tag]}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>

        <Button
          component={Link}
          href="/community"
          startIcon={<ArrowBackIcon />}
          sx={{ color: '#C1440E', mb: 3, textTransform: 'none' }}
        >
          {t('community.all_initiatives')}
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'flex-start',
            gap: { xs: 3, lg: 4 },
          }}
        >
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              bgcolor: 'white',
              border: '1px solid #E8E0D5',
              borderRadius: 2,
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
              <Chip label={article.tag} size="small" sx={{ bgcolor: article.tagColor, color: 'white', fontSize: '0.68rem' }} />
              <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', fontFamily: '"Montserrat", sans-serif' }}>
                {article.date}
              </Typography>
            </Box>

            {article.img && (
              <Box
                component="img"
                src={article.img}
                alt={article.title}
                sx={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 2, mb: 3 }}
              />
            )}

            <Box sx={richTextSx} dangerouslySetInnerHTML={{ __html: article.content || `<p>${article.desc}</p>` }} />

            {(article.freq || article.times) && (
              <Box sx={{ bgcolor: '#3D2B1F', borderRadius: 2, p: 2.5, mt: 3 }}>
                {article.freq && <Typography sx={{ color: '#F0D9B0', fontSize: '1.4rem', fontWeight: 700, fontFamily: '"Montserrat", sans-serif' }}>{article.freq}</Typography>}
                {article.lang && <Typography sx={{ color: '#D4A96A', fontSize: '0.8rem' }}>{article.lang}</Typography>}
                {article.times && <Typography sx={{ color: '#D4A96A', fontSize: '0.8rem' }}>{article.times}</Typography>}
              </Box>
            )}

            {files.length > 0 && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E8E0D5' }}>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: '#3D2B1F',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <DescriptionOutlinedIcon sx={{ fontSize: 18, color: '#C1440E' }} />
                  {t('common.documents')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {files.map((file) => (
                    <Button
                      key={`${file.url}-${file.language}`}
                      component="a"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon sx={{ flexShrink: 0 }} />}
                      sx={{
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        textTransform: 'none',
                        borderColor: '#E8E0D5',
                        color: '#3D2B1F',
                        fontSize: '0.78rem',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        minWidth: 0,
                        py: 1.25,
                        '& .MuiButton-startIcon': { mt: '2px', mr: 1.25 },
                        '&:hover': { borderColor: '#C1440E', bgcolor: '#FFF8F5' },
                      }}
                    >
                      <Box component="span" sx={{ minWidth: 0, flex: 1 }}>
                        {file.filename || file.label || t('common.download_document')}
                        {file.size && (
                          <Box component="span" sx={{ display: 'block', color: '#9A9A9A', fontSize: '0.72rem', mt: 0.25 }}>
                            {file.size}
                          </Box>
                        )}
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <ShareLinks title={article.title} path={articlePath} size="medium" />
          </Box>
        </Box>

        {related.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, mb: 3 }}>
              {t('community.related')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {related.map((item) => (
                <Box
                  key={item.id || item.slugPath}
                  sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}
                >
                  <CommunityInitiativeCard item={item} compact />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export async function getStaticPaths() {
  // Built on first visit and then kept (ISR); instant updates rebuild a page when its initiative changes.
  return { paths: [], fallback: 'blocking' };
}

/** Karamoja Core: the initiative and up to three others in every language. Null = not found. */
async function cmsProps(id) {
  let byLocale;
  try {
    byLocale = await inAllLocales((l) => getInitiative(id, l));
  } catch (err) {
    if (err?.code === 'karamoja_not_found') return null;
    throw err;
  }
  const [othersByLocale, pages] = await Promise.all([
    inAllLocales((l) => getCollection('initiatives', { per_page: 4 }, l)).catch(() => ({})),
    getPageAllLocales('initiative-detail').catch(() => null),
  ]);
  const articleByLocale = {};
  const relatedByLocale = {};
  Object.entries(byLocale).forEach(([l, dto]) => {
    articleByLocale[l] = initiativeFromCms(dto);
  });
  Object.entries(othersByLocale).forEach(([l, rows]) => {
    relatedByLocale[l] = (Array.isArray(rows) ? rows : [])
      .map(initiativeFromCms)
      .filter((x) => x && String(x.id) !== String(id))
      .slice(0, 3);
  });
  sameSlugs(relatedByLocale);
  Object.values(articleByLocale).forEach((a) => {
    if (a && articleByLocale.en) a.slugPath = articleByLocale.en.slugPath;
  });
  return {
    articleByLocale,
    relatedByLocale,
    pageByLocale: isPublishedPage(pages?.en) ? pages : null,
  };
}

export async function getStaticProps({ params }) {
  const id = extractIdFromSlugPath(params.slug);
  if (!/^\d+$/.test(String(id))) return { notFound: true };
  return cmsStaticProps(async () => {
    const props = await cmsProps(id);
    if (!props?.articleByLocale?.en) return null;
    const canonical = props.articleByLocale.en.slugPath;
    if (canonical !== params.slug) {
      return { redirect: { destination: `/community/${canonical}`, permanent: true } };
    }
    return props;
  }, { revalidate: 300, name: 'initiative' });
}
