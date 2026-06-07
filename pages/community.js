import { Box, Typography, Button, Chip, Divider } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import { radioStations } from '../lib/fallback-data';
import { getProgrammes, getBulletins } from '../lib/wordpress';

export default function Community({ programmes, bulletins, apiStale }) {
  return (
    <Layout title="Community">
      <PageHero title="Community Information" subtitle="Climate advisories, services and bulletins for communities across Turkana and Karamoja" image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=70" breadcrumbs={['Community']} />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Box sx={{ bgcolor: '#FDF6EC', border: '1px solid #D4A96A', borderRadius: 2, p: 3, mb: 5, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[
            { label: 'SMS Alerts', desc: 'Via Safaricom & MTN networks' },
            { label: 'Community Radio', desc: 'Daily advisories at 07:00 & 18:00 EAT' },
            { label: 'Toll-Free Hotline', desc: 'Call 1192 (Kenya) free of charge' },
          ].map((item) => (
            <Box key={item.label} sx={{ flex: '1 1 200px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', mb: 0.5 }}>{item.label}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A' }}>{item.desc}</Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, mb: 3 }}>Community Services</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          {programmes.map((s) => (
            <Box key={s.id || s.title} sx={{ flex: '1 1 calc(33.333% - 11px)', minWidth: { xs: '100%', md: 'calc(33.333% - 11px)' }, bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', mb: 0.8 }}>{s.title}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1.5 }}>{s.desc}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {s.langs?.map((l) => (
                  <Box key={l} sx={{ px: 1, py: 0.25, bgcolor: '#F0D9B0', color: '#6B4226', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700 }}>{l}</Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 5 }} />

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, mb: 3 }}>Partner Radio Stations</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          {radioStations.map((r) => (
            <Box key={r.name} sx={{ flex: '1 1 calc(25% - 12px)', minWidth: { xs: '100%', sm: 'calc(50% - 8px)' }, bgcolor: '#3D2B1F', borderRadius: 2, p: 2.5 }}>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', color: '#D4A96A', fontSize: '1.1rem', fontWeight: 700 }}>{r.name}</Typography>
              <Typography sx={{ color: '#F0D9B0', fontSize: '1.5rem', fontWeight: 700, fontFamily: '"Montserrat", sans-serif' }}>{r.freq}</Typography>
              <Typography sx={{ color: '#9A9A9A', fontSize: '0.75rem' }}>{r.lang}</Typography>
              <Typography sx={{ color: '#9A9A9A', fontSize: '0.75rem' }}>{r.times}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 5 }} />

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.4rem', fontWeight: 700, mb: 3 }}>Latest Community Bulletins</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bulletins.map((b) => (
            <Box key={b.title} sx={{ bgcolor: 'white', border: `1px solid ${b.urgent ? '#D63030' : '#E8E0D5'}`, borderLeft: `4px solid ${b.urgent ? '#D63030' : '#D4A96A'}`, borderRadius: 2, p: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 0.7, flexWrap: 'wrap' }}>
                <Chip label={b.tag} size="small" sx={{ bgcolor: '#F0D9B0', color: '#6B4226', fontSize: '0.65rem', height: 20 }} />
                {b.urgent && <Chip label="URGENT" size="small" sx={{ bgcolor: '#D63030', color: 'white', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />}
                <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', fontFamily: '"Montserrat", sans-serif', ml: 'auto' }}>{b.date}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', mb: 0.6 }}>{b.title}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.6 }}>{b.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  const [programmesRes, bulletinsRes] = await Promise.all([getProgrammes(), getBulletins()]);
  return {
    props: {
      programmes: programmesRes.data,
      bulletins: bulletinsRes.data,
      apiStale: programmesRes.apiStale || bulletinsRes.apiStale,
    },
    revalidate: 600,
  };
}
