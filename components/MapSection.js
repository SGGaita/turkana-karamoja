import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { COVERAGE_NARRATIVE } from '../lib/regions';

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

export default function MapSection({
  mapAdvisories = [],
  apiStale = false,
  compact = false,
  showHeader = true,
  showFooter = true,
  eyebrow = 'Geographic Coverage',
  title = 'Regional Coverage Map',
  subtitle = `Interactive view of climate monitoring stations, published advisories, and key communities across ${COVERAGE_NARRATIVE} Click any marker for details.`,
  id = 'map',
}) {
  return (
    <Box
      id={id}
      sx={{
        bgcolor: compact ? 'transparent' : '#FDF6EC',
        py: compact ? 0 : { xs: 7, md: 10 },
        px: compact ? 0 : { xs: 2, md: 0 },
      }}
    >
      <Box sx={{ maxWidth: compact ? 'none' : 1200, mx: 'auto', px: compact ? 0 : { xs: 2, md: 4 } }}>

        {showHeader && (
          <Box sx={{ mb: compact ? 3 : 5, textAlign: compact ? 'left' : 'center' }}>
            {eyebrow && (
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
                {eyebrow}
              </Typography>
            )}
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: compact ? { xs: '1.35rem', md: '1.6rem' } : { xs: '1.8rem', md: '2.3rem' },
                color: '#3D2B1F',
                lineHeight: 1.22,
                mb: 1.5,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  color: '#5A5A5A',
                  fontSize: compact ? '0.88rem' : '0.95rem',
                  lineHeight: 1.75,
                  maxWidth: compact ? 720 : 580,
                  mx: compact ? 0 : 'auto',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        <RegionalMap liveAdvisories={mapAdvisories} apiStale={apiStale} />

        {showFooter && (
          <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', justifyContent: compact ? 'flex-start' : 'center', gap: 1.5 }}>
            <Box sx={{ width: 6, height: 6, bgcolor: '#2E8B57', borderRadius: '50%' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A' }}>
              Data sourced from Kenya Meteorological Dept · Uganda Met Authority · NDMA
            </Typography>
          </Box>
        )}

      </Box>
    </Box>
  );
}
