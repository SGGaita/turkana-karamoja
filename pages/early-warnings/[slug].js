import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Typography, Button, Chip, CircularProgress, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SourceOutlinedIcon from '@mui/icons-material/SourceOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import Layout from '../../components/Layout';
import ShareLinks from '../../components/ShareLinks';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import AlertLevelLegend from '../../components/AlertLevelLegend';
import { getAlertById, getAlerts, getAlertLegend } from '../../lib/wordpress';
import { buildSlugPath, extractIdFromSlugPath } from '../../lib/slug';

const ADVISORY_PAGE_WIDTH = 1400;

const panelCardSx = {
  bgcolor: 'white',
  border: '1px solid #E8E0D5',
  borderRadius: 2,
  p: 2.5,
  mb: 2,
  minWidth: 0,
  overflow: 'hidden',
};

export default function AdvisoryDetail({ alert, alertLegend, apiStale }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Layout title="Loading advisory…">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#C1440E', mb: 2 }} />
          <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem' }}>Loading advisory…</Typography>
        </Box>
      </Layout>
    );
  }

  const files = alert.files || [];
  const keywords = alert.keywords || [];
  const actions = alert.actions || [];
  const alertPath = `/early-warnings/${buildSlugPath(alert.title, alert.id)}`;

  return (
    <Layout title={alert.title} description={alert.body}>
      <PageHero
        title={alert.title}
        subtitle={alert.area || 'Early warning advisory'}
        image="https://images.unsplash.com/photo-1504608524841-42584120d693?w=1400&q=70"
        breadcrumbs={['Early Warnings', alert.level]}
        contentMaxWidth={ADVISORY_PAGE_WIDTH}
      />

      <Box sx={{ maxWidth: ADVISORY_PAGE_WIDTH, mx: 'auto', px: { xs: 2, md: 4, lg: 5 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Button
          component={Link}
          href="/early-warnings"
          startIcon={<ArrowBackIcon />}
          sx={{ color: '#2E7BB4', mb: 3, textTransform: 'none' }}
        >
          All early warnings
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'flex-start',
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
              bgcolor: alert.bg || 'white',
              border: `1px solid ${alert.color}40`,
              borderLeft: `5px solid ${alert.color}`,
              borderRadius: 2,
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
              <Chip
                label={`${alert.level} ALERT`}
                size="small"
                sx={{ bgcolor: alert.color, color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
              />
              {alert.advisoryType && (
                <Chip
                  label={alert.advisoryType}
                  size="small"
                  sx={{ bgcolor: 'white', color: '#3D2B1F', fontWeight: 600, fontSize: '0.68rem', border: '1px solid #E8E0D5' }}
                />
              )}
            </Box>

            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                fontSize: { xs: '1.35rem', md: '1.75rem' },
                color: '#3D2B1F',
                mb: 2,
                lineHeight: 1.25,
              }}
            >
              {alert.title}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 3 }}>
              {alert.area && (
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start', minWidth: 180 }}>
                  <PlaceOutlinedIcon sx={{ fontSize: 18, color: '#C1440E', mt: '2px' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Area affected
                    </Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: '#3D2B1F', fontWeight: 600 }}>{alert.area}</Typography>
                  </Box>
                </Box>
              )}
              {alert.source && (
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start', minWidth: 160 }}>
                  <SourceOutlinedIcon sx={{ fontSize: 18, color: '#C1440E', mt: '2px' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Source
                    </Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: '#2E7BB4', fontWeight: 600 }}>{alert.source}</Typography>
                  </Box>
                </Box>
              )}
              {(alert.issued || alert.valid) && (
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start', minWidth: 160 }}>
                  <ScheduleOutlinedIcon sx={{ fontSize: 18, color: '#C1440E', mt: '2px' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Validity
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#3D2B1F' }}>
                      {alert.issued ? `Issued ${alert.issued}` : ''}
                      {alert.issued && alert.valid ? ' · ' : ''}
                      {alert.valid || ''}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <ShareLinks title={alert.title} path={alertPath} size="medium" />
            </Box>

            <Divider sx={{ borderColor: `${alert.color}25`, mb: 3 }} />

            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#3D2B1F', mb: 1.25 }}>
              Situation
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#3D2B1F', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {alert.body || 'No advisory details were provided.'}
            </Typography>

            {actions.length > 0 && (
              <Box
                sx={{
                  mt: 4,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  border: `1px solid ${alert.color}30`,
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#3D2B1F',
                    mb: 1.75,
                  }}
                >
                  <ChecklistOutlinedIcon sx={{ fontSize: 20, color: alert.color }} />
                  Recommended actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {actions.map((act) => (
                    <Box key={act} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: alert.color, mt: 0.7, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.9rem', color: '#3D2B1F', lineHeight: 1.6 }}>{act}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flex: '0 0 auto',
              width: { xs: '100%', md: 360 },
              minWidth: 0,
              position: { md: 'sticky' },
              top: { md: 24 },
            }}
          >
            <Box sx={panelCardSx}>
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
                <ShareOutlinedIcon sx={{ fontSize: 18, color: '#C1440E' }} />
                Share
              </Typography>
              <ShareLinks title={alert.title} path={alertPath} size="medium" />
            </Box>

            {alert.targetGroups?.length > 0 && (
              <Box sx={panelCardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#3D2B1F', mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target groups
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {alert.targetGroups.map((g) => (
                    <Chip key={g} label={g} size="small" sx={{ bgcolor: '#F0D9B0', color: '#6B4226', fontSize: '0.7rem' }} />
                  ))}
                </Box>
              </Box>
            )}

            {files.length > 0 && (
              <Box sx={panelCardSx}>
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
                  Documents
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
                        {file.filename || file.label || 'Download document'}
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

            {keywords.length > 0 && (
              <Box sx={panelCardSx}>
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
                  <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: '#C1440E' }} />
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {keywords.map((k) => (
                    <Chip key={k} label={k} size="small" sx={{ bgcolor: '#F0F8FF', color: '#2E7BB4', fontWeight: 600, fontSize: '0.68rem' }} />
                  ))}
                </Box>
              </Box>
            )}

            <AlertLevelLegend title={alertLegend?.title} items={alertLegend?.items} compact />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}

export async function getStaticPaths() {
  const { data } = await getAlerts();
  return {
    paths: (data || [])
      .filter((a) => a.id != null)
      .map((a) => ({ params: { slug: buildSlugPath(a.title, a.id) } })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const id = extractIdFromSlugPath(params.slug);
  const [{ data, apiStale }, alertLegendRes] = await Promise.all([
    getAlertById(id),
    getAlertLegend(),
  ]);
  if (!data) {
    return { notFound: true };
  }

  const canonical = buildSlugPath(data.title, data.id);
  if (data.id != null && canonical !== params.slug) {
    return { redirect: { destination: `/early-warnings/${canonical}`, permanent: true } };
  }

  return { props: { alert: data, alertLegend: alertLegendRes.data, apiStale: apiStale || alertLegendRes.apiStale }, revalidate: 120 };
}
