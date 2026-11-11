import { Box, Typography } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { CommunityServiceMap, CommunityBackLink, StatusPill, StatChip, IntroBox, EmptyNote } from '../../components/CommunityServiceLayout';
import { getWaterPoints } from '../../lib/wordpress';
import { toServiceMapMarker } from '../../lib/wp-mappers';
import { WATER_POINT_STATUS, WATER_POINT_TYPES, countByStatus } from '../../lib/community-services';
import { listCmsProps, pageCopy, waterPointFromCms } from '../../lib/cms-community';
import { pickLocale } from '../../lib/cms-alerts';
import { useLanguage, useVocabLabel } from '../../contexts/LanguageContext';

// What the page showed before Karamoja → Website pages → Water points is saved.
const DEFAULT_COPY = {
  hero: {
    title: 'Water Point Status Map',
    subtitle: 'Real-time status of boreholes, pans, dams and water trucking points across Turkana and Karamoja',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1400&q=70',
  },
  intro: {},
  empty: { text: 'No water points have been published yet.' },
};

export default function WaterPointsPage({ source = 'legacy', waterPoints: legacyPoints, itemsByLocale, pageByLocale, apiStale }) {
  const { locale, t } = useLanguage();
  const cms = source === 'cms';
  const waterPoints = (cms ? pickLocale(itemsByLocale, locale) : legacyPoints) || [];
  const { copy, hero } = pageCopy(cms ? pageByLocale : null, locale, DEFAULT_COPY);
  const typeLabel = useVocabLabel('water_point_types', WATER_POINT_TYPES);
  const statusLabel = useVocabLabel('water_point_statuses', WATER_POINT_STATUS);
  const markers = waterPoints.map((wp) => toServiceMapMarker(wp, 'water')).filter(Boolean);
  const statusCounts = countByStatus(waterPoints);

  return (
    <Layout title={hero.title}>
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        breadcrumbs={['Community', 'Water Points']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <CommunityBackLink />
        <StaleContentBanner show={apiStale} />
        <IntroBox title={copy('intro').title} text={copy('intro').text} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <StatChip value={waterPoints.length} label={t('community.total_water_points')} color="#2E7BB4" />
          <StatChip value={statusCounts.functional || 0} label={t('community.functional')} color="#2E8B57" />
          <StatChip value={(statusCounts.partial || 0) + (statusCounts.trucking || 0)} label={t('community.partial_trucking')} color="#E87010" />
          <StatChip value={statusCounts.non_functional || 0} label={t('community.non_functional')} color="#D63030" />
        </Box>

        <Box sx={{ mb: 5 }}>
          <CommunityServiceMap
            markers={markers}
            apiStale={apiStale}
            emptyMessage={t('community.no_points_on_map')}
          />
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>{t('community.all_water_points')}</Typography>
        {!waterPoints.length && !apiStale && <EmptyNote text={copy('empty').text} />}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {waterPoints.map((wp) => {
            const status = { label: statusLabel(wp.status), color: WATER_POINT_STATUS[wp.status]?.color || '#9A9A9A' };
            return (
              <Box key={wp.id} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', flex: 1 }}>{wp.name}</Typography>
                  <StatusPill label={status.label} color={status.color} />
                  {wp.pointType && <StatusPill label={typeLabel(wp.pointType)} color="#2E7BB4" />}
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', mb: 0.5 }}>{wp.region}{wp.locationLabel ? ` · ${wp.locationLabel}` : ''}</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.6 }}>{wp.desc}</Typography>
                {wp.lastUpdated && (
                  <Typography sx={{ fontSize: '0.68rem', color: wp.stale ? '#B85C00' : '#9A9A9A', mt: 1 }}>
                    {t('common.last_updated', { date: wp.lastUpdated })}{wp.stale ? ` · ${t('common.out_of_date')}` : ''}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    return { props: await listCmsProps('water-points', 'water-points', waterPointFromCms), revalidate: 60 };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.warn('[cms] water points:', err.message);
  }
  const res = await getWaterPoints();
  return { props: { waterPoints: res.data, apiStale: res.apiStale }, revalidate: 60 };
}
