import { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { CommunityServiceMap, CommunityBackLink, StatusPill, StatChip } from '../../components/CommunityServiceLayout';
import { getAssistanceSites } from '../../lib/wordpress';
import { toServiceMapMarker } from '../../lib/wp-mappers';
import { ASSISTANCE_SITE_TYPES } from '../../lib/community-services';

const FILTER_TYPES = [
  { key: 'all', label: 'All sites' },
  { key: 'food_distribution', label: 'Food' },
  { key: 'nfi', label: 'NFI' },
  { key: 'cash_transfer', label: 'Cash transfer' },
  { key: 'registration', label: 'Registration' },
];

export default function AssistancePage({ assistanceSites, apiStale }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? assistanceSites : assistanceSites.filter((s) => s.siteType === filter);
  const markers = filtered.map((s) => toServiceMapMarker(s, 'assistance')).filter(Boolean);
  const agencies = [...new Set(assistanceSites.map((s) => s.agency).filter(Boolean))];

  return (
    <Layout title="Humanitarian Assistance Locator">
      <PageHero
        title="Humanitarian Assistance Locator"
        subtitle="Food distribution, NFI, cash transfer and registration sites across Turkana and Karamoja"
        image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=70"
        breadcrumbs={['Community', 'Assistance Locator']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <CommunityBackLink />
        <StaleContentBanner show={apiStale} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <StatChip value={assistanceSites.length} label="Active sites" color="#E87010" />
          <StatChip value={agencies.length} label="Partner agencies" color="#3D2B1F" />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {FILTER_TYPES.map(({ key, label }) => (
            <Chip
              key={key}
              label={label}
              onClick={() => setFilter(key)}
              sx={{
                fontWeight: 600,
                fontSize: '0.72rem',
                bgcolor: filter === key ? '#E87010' : 'white',
                color: filter === key ? 'white' : '#3D2B1F',
                border: '1px solid #E8E0D5',
              }}
            />
          ))}
        </Box>

        <Box sx={{ mb: 5 }}>
          <CommunityServiceMap
            markers={markers}
            apiStale={apiStale}
            emptyMessage="No assistance sites with GPS coordinates published yet."
          />
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>Distribution & Registration Sites</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((site) => (
            <Box key={site.id} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', flex: 1 }}>{site.name}</Typography>
                {site.agency && <StatusPill label={site.agency} color="#E87010" />}
                <StatusPill label={ASSISTANCE_SITE_TYPES[site.siteType] || site.siteType} color="#2E7BB4" />
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', mb: 0.5 }}>{site.region}{site.locationLabel ? ` · ${site.locationLabel}` : ''}</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1 }}>{site.desc}</Typography>
              {site.schedule && <Typography sx={{ fontSize: '0.75rem', color: '#3D2B1F' }}><strong>Schedule:</strong> {site.schedule}</Typography>}
              {site.contact && <Typography sx={{ fontSize: '0.75rem', color: '#5A5A5A', mt: 0.5 }}><strong>Contact:</strong> {site.contact}</Typography>}
            </Box>
          ))}
        </Box>
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  const res = await getAssistanceSites();
  return { props: { assistanceSites: res.data, apiStale: res.apiStale }, revalidate: 60 };
}
