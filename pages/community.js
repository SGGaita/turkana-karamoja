import Link from 'next/link';
import { Box, Typography, Divider, Chip } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import CommunityInitiativeCard from '../components/CommunityInitiativeCard';
import { getProgrammes, getCommunityInitiatives, getCommunityPage } from '../lib/wordpress';
import { groupCommunityByCountryRegion } from '../lib/regions';

function RegionBadge({ country, region }) {
  if (!country && !region) return null;
  const label = region ? `${region} · ${country}` : country;
  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: '#F0D9B0', color: '#6B4226', fontWeight: 700, fontSize: '0.62rem', mb: 1 }}
    />
  );
}

function OutreachItem({ item }) {
  return (
    <Box sx={{ flex: '1 1 220px' }}>
      <RegionBadge country={item.country} region={item.region} />
      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', mb: 0.5 }}>{item.label}</Typography>
      <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A' }}>{item.description}</Typography>
    </Box>
  );
}

function RadioCard({ station }) {
  return (
    <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: 'calc(50% - 8px)' }, bgcolor: '#3D2B1F', borderRadius: 2, p: 2.5 }}>
      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', color: '#D4A96A', fontSize: '1.1rem', fontWeight: 700 }}>{station.name}</Typography>
      <Typography sx={{ color: '#F0D9B0', fontSize: '1.5rem', fontWeight: 700, fontFamily: '"Montserrat", sans-serif' }}>{station.freq}</Typography>
      <Typography sx={{ color: '#9A9A9A', fontSize: '0.75rem' }}>{station.lang}</Typography>
      <Typography sx={{ color: '#9A9A9A', fontSize: '0.75rem' }}>{station.times}</Typography>
    </Box>
  );
}

export default function Community({ programmes, communityInitiatives, communityPage, apiStale }) {
  const outreachItems = communityPage?.outreach?.items || [];
  const { clusterWide, grouped: groupedOutreach } = groupCommunityByCountryRegion(outreachItems);
  const radioTitle = communityPage?.radio?.title || 'Partner Radio Stations';
  const radioRegions = communityPage?.radio?.regions || [];

  const radioByCountry = radioRegions.reduce((acc, group) => {
    if (!group.country || !group.region || !group.stations?.length) return acc;
    if (!acc[group.country]) acc[group.country] = [];
    acc[group.country].push(group);
    return acc;
  }, {});

  return (
    <Layout title="Community">
      <PageHero title="Community Information" subtitle="Climate advisories, services and initiatives for communities across the Karamoja Cluster" image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=70" breadcrumbs={['Community']} />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        {(clusterWide.length > 0 || groupedOutreach.length > 0) && (
          <Box sx={{ mb: 5 }}>
            {clusterWide.length > 0 && (
              <Box sx={{ bgcolor: '#FDF6EC', border: '1px solid #D4A96A', borderRadius: 2, p: 3, mb: groupedOutreach.length ? 3 : 0, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {clusterWide.map((item) => (
                  <OutreachItem key={item.label} item={item} />
                ))}
              </Box>
            )}

            {groupedOutreach.map(({ country, regions }) => (
              <Box key={country} sx={{ mb: 3 }}>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', mb: 2 }}>{country}</Typography>
                {regions.map(({ region, items }) => (
                  <Box key={`${country}-${region}`} sx={{ bgcolor: '#FDF6EC', border: '1px solid #D4A96A', borderRadius: 2, p: 3, mb: 2 }}>
                    {region !== 'General' && (
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#6B4226', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{region}</Typography>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {items.map((item) => (
                        <OutreachItem key={`${item.label}-${region}`} item={item} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, mb: 3 }}>Community Services</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          {programmes.map((s) => {
            const isExternal = s.href?.startsWith('tel:');
            const CardWrapper = s.href ? (isExternal ? 'a' : Link) : 'div';
            const wrapperProps = s.href
              ? isExternal
                ? { href: s.href }
                : { href: s.href }
              : {};

            return (
              <Box
                key={s.id || s.title}
                component={CardWrapper}
                {...wrapperProps}
                sx={{
                  flex: '1 1 calc(33.333% - 11px)',
                  minWidth: { xs: '100%', md: 'calc(33.333% - 11px)' },
                  bgcolor: 'white',
                  border: '1px solid #E8E0D5',
                  borderRadius: 2,
                  p: 2.5,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  transition: 'all 0.2s',
                  cursor: s.href ? 'pointer' : 'default',
                  '&:hover': s.href ? { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(61,43,31,0.1)', borderColor: s.color || '#D4A96A' } : undefined,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', mb: 0.8 }}>{s.title}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1.5 }}>{s.desc}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {s.langs?.map((l) => (
                    <Box key={l} sx={{ px: 1, py: 0.25, bgcolor: '#F0D9B0', color: '#6B4226', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700 }}>{l}</Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ mb: 5 }} />

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, mb: 3 }}>Community Initiatives</Typography>
        {communityInitiatives.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 6 }}>
            {communityInitiatives.map((item) => (
              <Box key={item.id || item.slugPath} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
                <CommunityInitiativeCard item={item} />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mb: 6 }}>
            No community initiatives published yet. Add posts under the Community Initiatives category in WordPress.
          </Typography>
        )}

        {radioRegions.length > 0 && (
          <>
            <Divider sx={{ mb: 5 }} />

            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, mb: 3 }}>{radioTitle}</Typography>

            {Object.entries(radioByCountry).map(([country, regions]) => (
              <Box key={country} sx={{ mb: 4 }}>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#3D2B1F', mb: 2 }}>{country}</Typography>
                {regions.map((group) => (
                  <Box key={`${country}-${group.region}`} sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#6B4226', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{group.region}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {group.stations.map((station) => (
                        <RadioCard key={station.id || station.name} station={station} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </>
        )}
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  const [programmesRes, initiativesRes, communityPageRes] = await Promise.all([
    getProgrammes(),
    getCommunityInitiatives(),
    getCommunityPage(),
  ]);

  return {
    props: {
      programmes: programmesRes.data,
      communityInitiatives: initiativesRes.data,
      communityPage: communityPageRes.data,
      apiStale: programmesRes.apiStale || initiativesRes.apiStale || communityPageRes.apiStale,
    },
    revalidate: 60,
  };
}
