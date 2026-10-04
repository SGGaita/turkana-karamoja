import { Box, Typography } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { CommunityBackLink, StatusPill } from '../../components/CommunityServiceLayout';
import { getPlantingAdvisories } from '../../lib/wordpress';
import { PLANTING_STATUS, formatDateRange } from '../../lib/community-services';
import { seasonalOutlook } from '../../lib/fallback-data';

export default function PlantingCalendarPage({ advisories, apiStale }) {
  const bySeason = advisories.reduce((acc, row) => {
    const key = row.season || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <Layout title="Farming & Planting Calendar">
      <PageHero
        title="Farming & Planting Calendar"
        subtitle="Climate-smart agriculture advisories, seasonal planting windows, and agro-dealer locations"
        image="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=70"
        breadcrumbs={['Community', 'Planting Calendar']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <CommunityBackLink />
        <StaleContentBanner show={apiStale} />

        <Box sx={{ bgcolor: 'white', border: '1px solid #2E8B57', borderLeft: '4px solid #2E8B57', borderRadius: 2, p: 3, mb: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F', mb: 1 }}>Season Outlook</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {seasonalOutlook.map((row) => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8E0D5', pb: 0.8 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>{row.label}</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#3D2B1F' }}>{row.val}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {Object.entries(bySeason).map(([season, rows]) => (
          <Box key={season} sx={{ mb: 5 }}>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>{season}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {rows.map((row) => {
                const status = PLANTING_STATUS[row.status] || { label: row.status, color: '#9A9A9A' };
                return (
                  <Box key={row.id} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', md: 'calc(50% - 8px)' }, bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#3D2B1F', flex: 1 }}>{row.crop}</Typography>
                      <StatusPill label={status.label} color={status.color} />
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', mb: 1 }}>{row.region}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#3D2B1F', fontWeight: 600, mb: 1 }}>
                      Planting window: {formatDateRange(row.windowStart, row.windowEnd)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.65, mb: 1.5 }}>{row.desc}</Typography>
                    {row.agroDealer && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#2E8B57', fontWeight: 600 }}>Agro-dealer: {row.agroDealer}</Typography>
                    )}
                    {row.langs?.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 1.5 }}>
                        {row.langs.map((l) => (
                          <Box key={l} sx={{ px: 1, py: 0.25, bgcolor: '#F0D9B0', color: '#6B4226', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700 }}>{l}</Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  const res = await getPlantingAdvisories();
  return { props: { advisories: res.data, apiStale: res.apiStale }, revalidate: 60 };
}
