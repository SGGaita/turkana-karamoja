import { useRouter } from 'next/router';
import { Box, Typography, Chip, Button, Divider, CircularProgress } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { partnerTypeColors } from '../../lib/fallback-data';
import { getOrganizationProfile, getOrganizations } from '../../lib/wordpress';
import { buildSlugPath, slugify } from '../../lib/slug';

const countryLabels = { KE: 'Kenya', UG: 'Uganda', INT: 'International' };

export default function OrganizationProfile({ profile, apiStale }) {
  const router = useRouter();

  if (router.isFallback || !profile) {
    return (
      <Layout title="Loading organization…">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#C1440E', mb: 2 }} />
          <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem' }}>Loading organization…</Typography>
        </Box>
      </Layout>
    );
  }

  const { organization: org, reports, advisories, stats } = profile;

  return (
    <Layout title={org.name}>
      <PageHero
        title={org.name}
        subtitle={`${org.type} · ${countryLabels[org.country] || org.country}`}
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70"
        breadcrumbs={['Organizations', org.abbr]}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Button component={Link} href="/organizations" startIcon={<ArrowBackIcon />} sx={{ color: '#2E7BB4', mb: 3, textTransform: 'none' }}>
          All organizations
        </Button>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 5 }}>
          <Box sx={{ flex: '2 1 480px' }}>
            <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: `${partnerTypeColors[org.type] || '#2E7BB4'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: partnerTypeColors[org.type] || '#2E7BB4' }}>
                  {org.abbr}
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#3D2B1F' }}>{org.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={org.type} size="small" sx={{ fontSize: '0.65rem', height: 22 }} />
                    {org.verified && <Chip label="Verified Partner" size="small" sx={{ bgcolor: '#E0F5E9', color: '#2E8B57', fontSize: '0.65rem', height: 22 }} />}
                  </Box>
                </Box>
              </Box>

              {org.description && (
                <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.75, mb: 2 }}>{org.description}</Typography>
              )}

              {(org.contactName || org.contactEmail) && (
                <Box sx={{ pt: 2, borderTop: '1px solid #E8E0D5' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', mb: 1 }}>Contact</Typography>
                  {org.contactName && <Typography sx={{ fontSize: '0.85rem', color: '#3D2B1F' }}>{org.contactName}</Typography>}
                  {org.contactEmail && (
                    <Typography component="a" href={`mailto:${org.contactEmail}`} sx={{ fontSize: '0.85rem', color: '#2E7BB4', textDecoration: 'none' }}>
                      {org.contactEmail}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ bgcolor: '#3D2B1F', borderRadius: 2, p: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#D4A96A' }}>{stats.advisories}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#E8E0D5' }}>Advisories published</Typography>
            </Box>
            <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#C1440E' }}>{stats.reports}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A' }}>Reports submitted</Typography>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#3D2B1F', mb: 2 }}>
          Advisories ({advisories.length})
        </Typography>

        {advisories.length === 0 ? (
          <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3, mb: 5 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#9A9A9A' }}>No advisories published by this organisation yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
            {advisories.map((a) => (
              <Box key={a.id || a.title} sx={{ bgcolor: a.bg, border: `1px solid ${a.color}40`, borderLeft: `5px solid ${a.color}`, borderRadius: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={`${a.level} ALERT`} size="small" sx={{ bgcolor: a.color, color: 'white', fontWeight: 700, fontSize: '0.62rem' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#3D2B1F' }}>{a.title}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.65, mb: 1 }}>{a.body}</Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A' }}>Area: <strong style={{ color: '#3D2B1F' }}>{a.area}</strong></Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A' }}>Issued: <strong style={{ color: '#3D2B1F' }}>{a.issued}</strong></Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ mb: 4 }} />

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#3D2B1F', mb: 2 }}>
          Reports ({reports.length})
        </Typography>

        {reports.length === 0 ? (
          <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#9A9A9A' }}>No reports uploaded by this organisation yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reports.map((r) => (
              <Box key={r.id || r.title} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 0.8 }}>
                  <Chip label={r.tag} size="small" sx={{ bgcolor: r.tagColor, color: 'white', fontWeight: 600, fontSize: '0.62rem', height: 20 }} />
                  {r.isNew && <Chip label="NEW" size="small" sx={{ bgcolor: '#C1440E', color: 'white', fontSize: '0.6rem', height: 20 }} />}
                </Box>
                <Typography
                  component={Link}
                  href={`/reports/${buildSlugPath(r.title, r.id)}`}
                  sx={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', mb: 0.6, textDecoration: 'none', '&:hover': { color: '#C1440E', textDecoration: 'underline' } }}
                >
                  {r.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1 }}>{r.desc}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A' }}>{r.date}{r.size ? ` · ${r.size}` : ''}</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    component={Link}
                    href={`/reports/${buildSlugPath(r.title, r.id)}`}
                    sx={{ bgcolor: '#3D2B1F', '&:hover': { bgcolor: '#C1440E' }, fontSize: '0.72rem' }}
                  >
                    View report
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Layout>
  );
}

// Organisation URLs are pure name slugs (no trailing id), e.g. "/organizations/ndma".
// Unlike reports, there's no id to parse back out, so the slug is resolved against the
// full organisation list at build time. If two organisations ever slugify to the same
// name this will match whichever comes first — an accepted edge case for this dataset.
export async function getStaticPaths() {
  const { data } = await getOrganizations();
  return {
    paths: (data || []).map((org) => ({ params: { slug: slugify(org.name) || String(org.id) } })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { data: orgs } = await getOrganizations();
  const match = (orgs || []).find((org) => (slugify(org.name) || String(org.id)) === params.slug);
  if (!match) {
    return { notFound: true };
  }

  const { data, apiStale } = await getOrganizationProfile(match.id);
  if (!data?.organization) {
    return { notFound: true };
  }

  return { props: { profile: data, apiStale }, revalidate: 300 };
}
