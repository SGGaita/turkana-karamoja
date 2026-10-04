import Link from 'next/link';
import { Box, Typography, Chip, Button, Divider } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { CommunityBackLink } from '../../components/CommunityServiceLayout';
import { getHealthAlerts } from '../../lib/wordpress';
import { buildSlugPath } from '../../lib/slug';

export default function HealthAlertsPage({ alerts, apiStale }) {
  return (
    <Layout title="Health & Nutrition Alerts">
      <PageHero
        title="Health & Nutrition Alerts"
        subtitle="Acute malnutrition rates, disease outbreaks, health facility status, and vaccination campaigns"
        image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=70"
        breadcrumbs={['Community', 'Health & Nutrition']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <CommunityBackLink />
        <StaleContentBanner show={apiStale} />

        <Box sx={{ bgcolor: '#FFF0F0', border: '1px solid #D6303040', borderLeft: '4px solid #D63030', borderRadius: 2, p: 2.5, mb: 4 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.7 }}>
            <strong style={{ color: '#3D2B1F' }}>Emergency?</strong> For immediate health emergencies call the toll-free hotline{' '}
            <Box component="a" href="tel:1192" sx={{ color: '#D63030', fontWeight: 700, textDecoration: 'none' }}>1192</Box>{' '}
            (Kenya, 24/7). This page shows verified health and nutrition advisories from partner organisations.
          </Typography>
        </Box>

        {alerts.length === 0 ? (
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A' }}>
            No health or nutrition advisories published at this time. Check back later or visit{' '}
            <Link href="/early-warnings" style={{ color: '#C1440E' }}>Early Warnings</Link> for all active alerts.
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
                    <Chip label={`${a.level} ALERT`} size="small" sx={{ bgcolor: a.color, color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />
                    {a.advisoryType && (
                      <Chip label={a.advisoryType} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: `${a.color}60`, color: '#5A5A5A' }} />
                    )}
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', flex: 1 }}>{a.title}</Typography>
                    {href && (
                      <Button size="small" variant="outlined" endIcon={<ArrowForwardIcon />} component="span" sx={{ borderColor: a.color, color: a.color, fontSize: '0.72rem', textTransform: 'none', pointerEvents: 'none' }}>
                        View advisory
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ borderColor: `${a.color}20` }} />
                  <Box sx={{ px: 3, py: 2.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B4226', mb: 0.5 }}>Area Affected</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#3D2B1F', mb: 2, fontWeight: 500 }}>{a.area}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.7 }}>{bodyPreview}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A' }}>SOURCE</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#2E7BB4', fontWeight: 500 }}>{a.source}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A' }}>ISSUED</Typography>
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
  const res = await getHealthAlerts();
  return { props: { alerts: res.data, apiStale: res.apiStale }, revalidate: 60 };
}
