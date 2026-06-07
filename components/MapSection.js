import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const RegionalMap = dynamic(() => import('./RegionalMap'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: { xs: 380, md: 560 },
        bgcolor: '#F5F0E8',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #E8E0D5',
      }}
    >
      <Typography sx={{ color: '#9A9A9A', fontSize: '0.85rem' }}>Loading map…</Typography>
    </Box>
  ),
});

export default function MapSection() {
  return (
    <Box
      id="map"
      sx={{
        bgcolor: '#FDF6EC',
        py: { xs: 7, md: 10 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>

        {/* Section header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#C1440E',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              mb: 1.5,
            }}
          >
            Geographic Coverage
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: '1.8rem', md: '2.3rem' },
              color: '#3D2B1F',
              lineHeight: 1.22,
              mb: 1.5,
            }}
          >
            Regional Coverage Map
          </Typography>
          <Typography
            sx={{
              color: '#5A5A5A',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              maxWidth: 580,
              mx: 'auto',
            }}
          >
            Interactive view of climate monitoring stations, active alerts, and key communities
            across Turkana (Kenya) and Karamoja (Uganda). Click any marker for details.
          </Typography>
        </Box>

        {/* Map */}
        <RegionalMap />

        {/* Footer note */}
        <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <Box sx={{ width: 6, height: 6, bgcolor: '#2E8B57', borderRadius: '50%' }} />
          <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A' }}>
            Data sourced from Kenya Meteorological Dept · Uganda Met Authority · NDMA
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}
