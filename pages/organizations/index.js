import { Box, Typography, Chip, Button } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { organizationPortals, partnerTypeColors } from '../../lib/fallback-data';
import { getOrganizations } from '../../lib/wordpress';
import { APP_NAME } from '../../lib/branding';
import { slugify } from '../../lib/slug';

const countryLabels = { KE: 'Kenya', UG: 'Uganda', INT: 'International' };

export default function OrganizationsIndex({ organizations, apiStale }) {
  return (
    <Layout title="Organizations">
      <PageHero
        title="Partner Organizations"
        subtitle={`Verified institutions publishing advisories and reports on ${APP_NAME}`}
        image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=70"
        breadcrumbs={['Organizations']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.7, mb: 4, maxWidth: 720 }}>
          These government agencies, UN bodies, and humanitarian partners are registered on the platform.
          Select an organisation to view its profile, published advisories, and submitted reports.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          {organizationPortals.map((p) => (
            <Box key={p.title} sx={{ flex: '1 1 260px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ background: p.bg, px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#3D2B1F' }}>{p.title}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.6 }}>{p.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#3D2B1F', mb: 3 }}>
          Verified Partners ({organizations.length})
        </Typography>

        {organizations.length === 0 ? (
          <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#9A9A9A' }}>No verified organizations published yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {organizations.map((org) => (
              <Box
                key={org.id || org.abbr}
                component={Link}
                href={`/organizations/${slugify(org.name) || org.id || org.abbr}`}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #E8E0D5',
                  borderRadius: 2,
                  p: 2.5,
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#D4A96A', boxShadow: '0 4px 16px rgba(61,43,31,0.08)', transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: `${partnerTypeColors[org.type] || '#2E7BB4'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', color: partnerTypeColors[org.type] || '#2E7BB4', flexShrink: 0 }}>
                    {org.abbr}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F', lineHeight: 1.3 }}>{org.name}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', mt: 0.3 }}>{countryLabels[org.country] || org.country}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 1.5 }}>
                  <Chip label={org.type} size="small" sx={{ bgcolor: '#FDF6EC', color: '#6B4226', fontSize: '0.62rem', height: 20 }} />
                  <Chip label="Verified" size="small" sx={{ bgcolor: '#E0F5E9', color: '#2E8B57', fontSize: '0.62rem', height: 20 }} />
                </Box>
                {org.description && (
                  <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.55, mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {org.description}
                  </Typography>
                )}
                <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ color: '#C1440E', fontSize: '0.72rem', p: 0, '&:hover': { bgcolor: 'transparent' } }}>
                  View profile & activity
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  const { data, apiStale } = await getOrganizations();
  return { props: { organizations: data, apiStale }, revalidate: 300 };
}
