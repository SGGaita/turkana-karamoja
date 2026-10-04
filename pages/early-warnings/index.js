import Link from 'next/link';
import { Box, Typography, Chip, Button, Divider } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import PushSubscribeButton from '../../components/PushSubscribeButton';
import MapSection from '../../components/MapSection';
import AlertLevelLegend from '../../components/AlertLevelLegend';
import ShareLinks from '../../components/ShareLinks';
import { getAlerts, getMapAdvisories, getAlertLegend } from '../../lib/wordpress';
import { toMapAdvisoryMarker } from '../../lib/wp-mappers';
import { buildSlugPath } from '../../lib/slug';

export default function EarlyWarnings({ alerts, mapAdvisories, alertLegend, apiStale }) {
  return (
    <Layout title="Early Warnings">
      <PageHero
        title="Early Warning System"
        subtitle="Verified advisories from KMD, UMA, NDMA, OPM, FAO and partner organisations"
        image="https://images.unsplash.com/photo-1504608524841-42584120d693?w=1400&q=70"
        breadcrumbs={['Early Warnings']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <PushSubscribeButton />
        </Box>

        <Box sx={{ bgcolor: 'white', border: '1px solid #2E7BB4', borderLeft: '4px solid #2E7BB4', borderRadius: 2, p: 2.5, mb: 4 }}>
          <Typography component="div" sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.7 }}>
            <strong style={{ color: '#3D2B1F' }}>About this page:</strong> This page shows weather warnings,
            food and water updates, and important alerts from trusted government and aid organisations.
            All information is checked before it is published here. When you see a warning, follow the guidance given.
          </Typography>
        </Box>

        <Box sx={{ mb: 5 }}>
          <MapSection
            compact
            id="early-warnings-map"
            mapAdvisories={mapAdvisories}
            apiStale={apiStale}
            eyebrow="Live map"
            title="Advisory coverage map"
            subtitle="Published advisories with pinned locations appear on the map below. Use the layer filters to switch between alerts, weather stations, and communities."
          />
        </Box>

        <Box sx={{ mb: 5 }}>
          <AlertLevelLegend title={alertLegend?.title} items={alertLegend?.items} />
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#3D2B1F', mb: 3 }}>
          Active & Recent Advisories
        </Typography>

        {!alerts?.length ? (
          <Box
            sx={{
              bgcolor: 'white',
              border: '1px solid #E8E0D5',
              borderRadius: 2,
              p: { xs: 3, md: 4 },
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#3D2B1F', mb: 1 }}>
              No advisories published right now
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', lineHeight: 1.7, maxWidth: 560, mx: 'auto' }}>
              {apiStale
                ? 'Advisory data could not be loaded from WordPress. Please try again shortly.'
                : 'When verified partners publish a new early warning, it will appear here and on the map above. Colour meanings are explained in the guide above.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {alerts.map((a) => {
              const href = a.id != null ? `/early-warnings/${buildSlugPath(a.title, a.id)}` : null;
              const bodyPreview = a.body && a.body.length > 220 ? `${a.body.slice(0, 217)}…` : a.body;

              return (
                <Box
                  key={a.id || a.title}
                  sx={{
                    bgcolor: a.bg,
                    border: `1px solid ${a.color}40`,
                    borderLeft: `5px solid ${a.color}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'block',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': href
                      ? { boxShadow: `0 10px 28px ${a.color}22`, transform: 'translateY(-2px)' }
                      : undefined,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, flexWrap: 'wrap' }}>
                    <Chip label={`${a.level} ALERT`} size="small" sx={{ bgcolor: a.color, color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />
                    <Typography
                      component={href ? Link : 'span'}
                      href={href || undefined}
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#3D2B1F',
                        flex: 1,
                        textDecoration: 'none',
                        '&:hover': href ? { color: a.color, textDecoration: 'underline' } : undefined,
                      }}
                    >
                      {a.title}
                    </Typography>
                    {href && (
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        component={Link}
                        href={href}
                        sx={{ borderColor: a.color, color: a.color, fontSize: '0.72rem', textTransform: 'none' }}
                      >
                        View full advisory
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ borderColor: `${a.color}20` }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, px: 3, py: 2.5 }}>
                    <Box sx={{ flex: '2 1 320px' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B4226', mb: 0.5 }}>Area Affected</Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#3D2B1F', mb: 2, fontWeight: 500 }}>{a.area}</Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.7 }}>{bodyPreview}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', fontFamily: '"Montserrat", sans-serif' }}>SOURCE</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#2E7BB4', fontWeight: 500 }}>{a.source}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', fontFamily: '"Montserrat", sans-serif' }}>ISSUED</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#3D2B1F', fontWeight: 500 }}>{a.issued}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', fontFamily: '"Montserrat", sans-serif' }}>VALID</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#3D2B1F', fontWeight: 500 }}>{a.valid}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    {a.actions?.length > 0 && (
                      <Box sx={{ flex: '1 1 200px', bgcolor: 'rgba(255,255,255,0.6)', border: `1px solid ${a.color}30`, borderRadius: 2, p: 2 }}>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#3D2B1F', textTransform: 'uppercase', mb: 1.5 }}>Recommended Actions</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {a.actions.slice(0, 3).map((act) => (
                            <Box key={act} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: a.color, mt: 0.7, flexShrink: 0 }} />
                              <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.5 }}>{act}</Typography>
                            </Box>
                          ))}
                          {a.actions.length > 3 && (
                            <Typography sx={{ fontSize: '0.72rem', color: a.color, fontWeight: 600, mt: 0.5 }}>
                              +{a.actions.length - 3} more on full advisory
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  {href && (
                    <Box sx={{ px: 3, pb: 2.25 }}>
                      <ShareLinks title={a.title} path={href} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export async function getServerSideProps() {
  const [alertsRes, mapAdvisoriesRes, alertLegendRes] = await Promise.all([
    getAlerts(),
    getMapAdvisories(),
    getAlertLegend(),
  ]);

  const mapAdvisories = (mapAdvisoriesRes.data || [])
    .map((alert, index) => toMapAdvisoryMarker(alert, index))
    .filter(Boolean);

  return {
    props: {
      alerts: alertsRes.data,
      mapAdvisories,
      alertLegend: alertLegendRes.data,
      apiStale: alertsRes.apiStale || mapAdvisoriesRes.apiStale || alertLegendRes.apiStale,
    },
  };
}
