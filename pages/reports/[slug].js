import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Typography, Button, Chip, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import ReportPreviewDialog from '../../components/ReportPreviewDialog';
import ReportFileLanguages from '../../components/ReportFileLanguages';
import ReportDownloadStat from '../../components/ReportDownloadStat';
import ShareLinks from '../../components/ShareLinks';
import { getReportById, getReports } from '../../lib/wordpress';
import { getReportFiles, applyReportDownloadStats } from '../../lib/report-utils';
import { buildSlugPath, extractIdFromSlugPath, slugify } from '../../lib/slug';
import { getCountryLabel } from '../../lib/countries';

const richTextSx = {
  fontSize: '0.9rem',
  lineHeight: 1.75,
  color: '#3D2B1F',
  '& p': { m: '0 0 1em' },
  '& ul, & ol': { pl: 3, mb: 1.5 },
  '& li': { mb: 0.5 },
  '& strong': { color: '#3D2B1F' },
};

const panelCardSx = {
  bgcolor: 'white',
  border: '1px solid #E8E0D5',
  borderRadius: 2,
  p: 2.5,
  mb: 2,
};

const panelHeadingSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  fontFamily: '"Montserrat", sans-serif',
  fontWeight: 700,
  fontSize: '0.82rem',
  color: '#3D2B1F',
  mb: 1.5,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

function SidePanelSection({ icon: Icon, title, children }) {
  return (
    <Box sx={panelCardSx}>
      <Typography component="h2" sx={panelHeadingSx}>
        <Icon sx={{ fontSize: 18, color: '#C1440E' }} />
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function ReportDetail({ report, apiStale }) {
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [liveReport, setLiveReport] = useState(report);

  useEffect(() => {
    if (report) setLiveReport(report);
  }, [report]);

  if (router.isFallback) {
    return (
      <Layout title="Loading report…">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#C1440E', mb: 2 }} />
          <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem' }}>Loading report…</Typography>
        </Box>
      </Layout>
    );
  }

  const current = liveReport || report;
  const files = getReportFiles(current);
  const reportPath = `/reports/${buildSlugPath(current.title, current.id)}`;
  const orgHref = current.organizationId
    ? `/organizations/${slugify(current.orgs?.[0] || 'organisation')}`
    : null;
  const keywords = current.keywords || [];

  const handleDownloadTracked = (_id, stats) => {
    setLiveReport((prev) => applyReportDownloadStats(prev || report, stats));
    setPreview((open) => (
      open ? { ...open, report: applyReportDownloadStats(open.report || current, stats) } : open
    ));
  };

  return (
    <Layout title={current.title} description={current.desc}>
      <PageHero
        title={current.title}
        subtitle={current.orgs?.join(', ') || current.tag}
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=70"
        breadcrumbs={['Reports', current.tag]}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Button component={Link} href="/reports" startIcon={<ArrowBackIcon />} sx={{ color: '#2E7BB4', mb: 3, textTransform: 'none' }}>
          All reports
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'flex-start',
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* Main content */}
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
              bgcolor: 'white',
              border: '1px solid #E8E0D5',
              borderRadius: 2,
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
              {(current.categories?.length ? current.categories : [current.tag]).filter(Boolean).map((c) => (
                <Chip key={c} label={c} size="small" sx={{ bgcolor: current.tagColor, color: 'white', fontWeight: 600, fontSize: '0.68rem' }} />
              ))}
              {current.isNew && <Chip label="NEW" size="small" sx={{ bgcolor: '#C1440E', color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />}
              {current.isUpdated && <Chip label="UPDATED" size="small" sx={{ bgcolor: '#2E7BB4', color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />}
            </Box>

            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#3D2B1F', mb: 1.5 }}>
              {current.title}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 3 }}>
              {current.orgs?.map((o) => (
                <Chip key={o} label={o} size="small" sx={{ bgcolor: '#F0D9B0', color: '#6B4226', fontSize: '0.7rem' }} />
              ))}
              {current.countries?.map((c) => (
                <Chip key={c} label={getCountryLabel(c)} size="small" sx={{ bgcolor: '#EAF3EC', color: '#2E7040', fontSize: '0.7rem' }} />
              ))}
              <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>{current.date}{current.size ? ` · ${current.size}` : ''}</Typography>
              <ReportDownloadStat count={current.downloadCount} size="medium" />
            </Box>

            {current.content ? (
              <Box sx={richTextSx} dangerouslySetInnerHTML={{ __html: current.content }} />
            ) : (
              <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', lineHeight: 1.75, mb: 1 }}>
                {current.desc || 'No description was provided for this report.'}
              </Typography>
            )}
          </Box>

          {/* Right side panel */}
          <Box
              sx={{
                flex: '0 0 auto',
                width: { xs: '100%', md: 320 },
                position: { md: 'sticky' },
                top: { md: 24 },
                alignSelf: 'flex-start',
              }}
            >
              <SidePanelSection icon={ShareOutlinedIcon} title="Share">
                <ShareLinks title={current.title} path={reportPath} size="medium" />
              </SidePanelSection>

              {orgHref && (
                <SidePanelSection icon={BusinessOutlinedIcon} title="Organisation">
                  {current.orgs?.[0] && (
                    <Typography sx={{ fontSize: '0.88rem', color: '#3D2B1F', fontWeight: 600, mb: 1.5 }}>
                      {current.orgs[0]}
                    </Typography>
                  )}
                  <Button
                    component={Link}
                    href={orgHref}
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: '#3D2B1F',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      py: 1.1,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#C1440E', boxShadow: 'none' },
                    }}
                  >
                    View organisation profile
                  </Button>
                </SidePanelSection>
              )}

              {files.length > 0 && (
                <SidePanelSection icon={DescriptionOutlinedIcon} title="Documents">
                  <ReportFileLanguages
                    files={files}
                    report={current}
                    onPreview={(r, file) => setPreview({ report: r, file })}
                    onDownloadTracked={handleDownloadTracked}
                  />
                </SidePanelSection>
              )}

              {keywords.length > 0 && (
                <SidePanelSection icon={LocalOfferOutlinedIcon} title="Tags">
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {keywords.map((k) => (
                      <Chip
                        key={k}
                        label={k}
                        size="small"
                        sx={{ bgcolor: '#F0F8FF', color: '#2E7BB4', fontWeight: 600, fontSize: '0.68rem' }}
                      />
                    ))}
                  </Box>
                </SidePanelSection>
              )}
            </Box>
        </Box>
      </Box>

      <ReportPreviewDialog
        report={preview?.report}
        file={preview?.file}
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        onDownloadTracked={handleDownloadTracked}
      />
    </Layout>
  );
}

export async function getStaticPaths() {
  const { data } = await getReports();
  return {
    paths: (data || []).map((r) => ({ params: { slug: buildSlugPath(r.title, r.id) } })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const id = extractIdFromSlugPath(params.slug);
  const { data, apiStale } = await getReportById(id);
  if (!data) {
    return { notFound: true };
  }

  // Canonicalise: redirect old bare-id links (or a stale slug after a title edit)
  // to the current slug so there's exactly one indexable URL per report.
  const canonical = buildSlugPath(data.title, data.id);
  if (canonical !== params.slug) {
    return { redirect: { destination: `/reports/${canonical}`, permanent: true } };
  }

  return { props: { report: data, apiStale }, revalidate: 300 };
}
