import Link from 'next/link';
import { Box, Typography, Chip, Button, Divider } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { CommunityBackLink, IntroBox } from '../../components/CommunityServiceLayout';
import { getHealthAlerts } from '../../lib/wordpress';
import { buildSlugPath } from '../../lib/slug';
import { listCmsProps, pageCopy, healthAlertFromCms, telParts } from '../../lib/cms-community';
import { pickLocale, levelLabel } from '../../lib/cms-alerts';
import { useLanguage } from '../../contexts/LanguageContext';

const ORDER = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };

// What the page showed before Karamoja → Website pages → Health is saved.
const DEFAULT_COPY = {
  hero: {
    title: 'Health & Nutrition Alerts',
    subtitle: 'Acute malnutrition rates, disease outbreaks, health facility status, and vaccination campaigns',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=70',
  },
  intro: {
    title: 'Emergency?',
    text: 'For immediate health emergencies call the toll-free hotline 1192 (Kenya, 24/7). This page shows verified health and nutrition advisories from partner organisations.',
  },
  empty: { text: 'No health or nutrition advisories published at this time. Check back later or see Early Warnings for all active alerts.' },
};

export default function HealthAlertsPage({ source = 'legacy', alerts: legacyAlerts, itemsByLocale, pageByLocale, apiStale }) {
  const { locale, t } = useLanguage();
  const cms = source === 'cms';
  const alerts = cms
    ? [...(pickLocale(itemsByLocale, locale) || [])].sort((a, b) => ORDER[a.level] - ORDER[b.level])
    : legacyAlerts || [];
  const { copy, hero } = pageCopy(cms ? pageByLocale : null, locale, DEFAULT_COPY);
  const intro = copy('intro');

  return (
    <Layout title={hero.title}>
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        breadcrumbs={['Community', 'Health & Nutrition']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <CommunityBackLink />
        <StaleContentBanner show={apiStale} />

        <IntroBox title={intro.title} text={intro.text} color="#D63030" bg="#FFF0F0">
          {intro.text && telParts(intro.text).map((part, i) => (part.tel ? (
            <Box key={i} component="a" href={`tel:${part.tel}`} sx={{ color: '#D63030', fontWeight: 700, textDecoration: 'none' }}>{part.text}</Box>
          ) : part.text))}
        </IntroBox>

        {alerts.length === 0 ? (
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A' }}>
            {copy('empty').text}{' '}
            <Link href="/early-warnings" style={{ color: '#C1440E' }}>{t('alerts.link_early_warnings')}</Link>
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((a) => {
              const href = a.id != null ? `/early-warnings/${buildSlugPath(a.title, a.id)}` : null;
              const bodyPreview = a.body && a.body.length > 220 ? `${a.body.slice(0, 217)}…` : a.body;

              return (
                <Box
                  key={a.id || a.title}
                  component={href ? Link : 'div'}
                  href={href || undefined}
                  sx={{
                    bgcolor: a.bg,
                    border: `1px solid ${a.color}40`,
                    borderLeft: `5px solid ${a.color}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    cursor: href ? 'pointer' : 'default',
                    '&:hover': href ? { boxShadow: `0 10px 28px ${a.color}22`, transform: 'translateY(-2px)' } : undefined,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, flexWrap: 'wrap' }}>
                    <Chip label={levelLabel(a.level, t)} size="small" sx={{ bgcolor: a.color, color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />
                    {a.advisoryType && (
                      <Chip label={a.advisoryType} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: `${a.color}60`, color: '#5A5A5A' }} />
                    )}
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', flex: 1 }}>{a.title}</Typography>
                    {href && (
                      <Button size="small" variant="outlined" endIcon={<ArrowForwardIcon />} component="span" sx={{ borderColor: a.color, color: a.color, fontSize: '0.72rem', textTransform: 'none', pointerEvents: 'none' }}>
                        {t('alerts.view')}
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ borderColor: `${a.color}20` }} />
                  <Box sx={{ px: 3, py: 2.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B4226', mb: 0.5 }}>{t('alerts.area_affected')}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#3D2B1F', mb: 2, fontWeight: 500 }}>{a.area}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.7 }}>{bodyPreview}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', textTransform: 'uppercase' }}>{t('alerts.source')}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#2E7BB4', fontWeight: 500 }}>{a.source}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', textTransform: 'uppercase' }}>{t('alerts.issued')}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#3D2B1F', fontWeight: 500 }}>{a.issued}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    return { props: await listCmsProps('alerts', 'health', healthAlertFromCms), revalidate: 60 };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.warn('[cms] health alerts:', err.message);
  }
  const res = await getHealthAlerts();
  return { props: { alerts: res.data, apiStale: res.apiStale }, revalidate: 60 };
}
