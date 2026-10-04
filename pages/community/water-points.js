import { Box, Typography } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { CommunityServiceMap, CommunityBackLink, StatusPill, StatChip } from '../../components/CommunityServiceLayout';
import { getWaterPoints } from '../../lib/wordpress';
import { toServiceMapMarker } from '../../lib/wp-mappers';
import { WATER_POINT_STATUS, WATER_POINT_TYPES, countByStatus } from '../../lib/community-services';

export default function WaterPointsPage({ waterPoints, apiStale }) {
  const markers = waterPoints.map((wp) => toServiceMapMarker(wp, 'water')).filter(Boolean);
  const statusCounts = countByStatus(waterPoints);

  return (
    <Layout title="Water Point Status Map">
      <PageHero
        title="Water Point Status Map"
        subtitle="Real-time status of boreholes, pans, dams and water trucking points across Turkana and Karamoja"
        image="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1400&q=70"
        breadcrumbs={['Community', 'Water Points']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <CommunityBackLink />
        <StaleContentBanner show={apiStale} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <StatChip value={waterPoints.length} label="Total water points" color="#2E7BB4" />
          <StatChip value={statusCounts.functional || 0} label="Functional" color="#2E8B57" />
          <StatChip value={(statusCounts.partial || 0) + (statusCounts.trucking || 0)} label="Partial / Trucking" color="#E87010" />
          <StatChip value={statusCounts.non_functional || 0} label="Non-functional" color="#D63030" />
        </Box>

        <Box sx={{ mb: 5 }}>
          <CommunityServiceMap
            markers={markers}
            apiStale={apiStale}
            emptyMessage="No water points with GPS coordinates published yet. Add Water Points in WordPress admin."
          />
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>All Water Points</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {waterPoints.map((wp) => {
            const status = WATER_POINT_STATUS[wp.status] || { label: wp.status, color: '#9A9A9A' };
            return (
              <Box key={wp.id} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', flex: 1 }}>{wp.name}</Typography>
                  <StatusPill label={status.label} color={status.color} />
                  <StatusPill label={WATER_POINT_TYPES[wp.pointType] || wp.pointType} color="#2E7BB4" />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', mb: 0.5 }}>{wp.region}{wp.locationLabel ? ` · ${wp.locationLabel}` : ''}</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.6 }}>{wp.desc}</Typography>
                {wp.lastUpdated && (
                  <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mt: 1 }}>Last updated: {wp.lastUpdated}</Typography>
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
  const res = await getWaterPoints();
  return { props: { waterPoints: res.data, apiStale: res.apiStale }, revalidate: 60 };
}
