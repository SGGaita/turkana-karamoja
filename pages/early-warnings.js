import { Box, Typography, Chip, Button, LinearProgress, Divider } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import PushSubscribeButton from '../components/PushSubscribeButton';
import { seasonalOutlook } from '../lib/fallback-data';
import { getAlerts } from '../lib/wordpress';

export default function EarlyWarnings({ alerts, apiStale }) {
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
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.7 }}>
            <strong style={{ color: '#3D2B1F' }}>About this page:</strong> This page shows weather warnings,
            food and water updates, and important alerts from trusted government and aid organisations.
            All information is checked before it is published here. When you see a warning, follow the guidance given.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5 }}>
          <Box sx={{ flex: '1 1 300px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F', mb: 0.5 }}>What to Expect - Long Rains 2026</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 1.5 }}>Rain season forecast: March to May 2026</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.7, mb: 2 }}>
              Weather experts predict <strong>less rain than usual</strong> across most of Turkana and Karamoja
              this season. Plan for dry conditions - save water, check pasture, and prepare livestock early.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {seasonalOutlook.map((row) => (
                <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8E0D5', pb: 0.8 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#3D2B1F' }}>{row.val}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 300px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F', mb: 0.5 }}>Hunger & Food Situation</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', mb: 1.5 }}>Food Security Analysis - Feb to May 2026</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.7, mb: 2 }}>
              Most families in Turkana and Karamoja are{' '}
              <strong style={{ color: '#E87010' }}>struggling to get enough food</strong> and need support.
            </Typography>
            {[
              { phase: 'Enough food - no problem', pct: 8, color: '#2E8B57' },
              { phase: 'Some shortage - need to be careful', pct: 22, color: '#B8860B' },
              { phase: 'Serious shortage - need help now', pct: 48, color: '#E87010' },
              { phase: 'Very serious - urgent help needed', pct: 18, color: '#D63030' },
              { phase: 'Extreme hunger - lives at risk', pct: 4, color: '#8B0000' },
            ].map((row) => (
              <Box key={row.phase} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#5A5A5A' }}>{row.phase}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: row.color }}>{row.pct}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={row.pct} sx={{ height: 6, borderRadius: 3, bgcolor: '#E8E0D5', '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 3 } }} />
              </Box>
            ))}
          </Box>
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#3D2B1F', mb: 3 }}>
          Active & Recent Advisories
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {alerts.map((a) => (
            <Box key={a.id || a.title} sx={{ bgcolor: a.bg, border: `1px solid ${a.color}40`, borderLeft: `5px solid ${a.color}`, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, flexWrap: 'wrap' }}>
                <Chip label={`${a.level} ALERT`} size="small" sx={{ bgcolor: a.color, color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', flex: 1 }}>{a.title}</Typography>
                <Button size="small" variant="outlined" disabled sx={{ borderColor: a.color, color: a.color, fontSize: '0.72rem' }}>
                  Download PDF
                </Button>
              </Box>
              <Divider sx={{ borderColor: `${a.color}20` }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, px: 3, py: 2.5 }}>
                <Box sx={{ flex: '2 1 320px' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B4226', mb: 0.5 }}>Area Affected</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#3D2B1F', mb: 2, fontWeight: 500 }}>{a.area}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.7 }}>{a.body}</Typography>
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
                      {a.actions.map((act) => (
                        <Box key={act} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: a.color, mt: 0.7, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.5 }}>{act}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data, apiStale } = await getAlerts();
  return { props: { alerts: data, apiStale } };
}
