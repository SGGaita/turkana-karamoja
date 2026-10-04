import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';
import { COVERAGE_COUNTRIES } from '../lib/cluster-coverage';
import { COVERAGE_NARRATIVE, COVERAGE_MAP_LEGEND } from '../lib/regions';

const ClusterCoverageMap = dynamic(() => import('./ClusterCoverageMap'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: { xs: 320, md: 440 },
        bgcolor: '#F5F0E8',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #E8E0D5',
      }}
    >
      <Typography sx={{ color: '#9A9A9A', fontSize: '0.85rem' }}>Loading cluster map…</Typography>
    </Box>
  ),
});

function CoverageCard({ area }) {
  return (
    <Box
      sx={{
        flex: '1 1 calc(50% - 12px)',
        minWidth: { xs: '100%', md: 'calc(50% - 12px)' },
        bgcolor: '#FDF6EC',
        border: '1px solid #E8E0D5',
        borderRadius: 3,
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: area.color,
        },
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: area.color,
          mb: 0.5,
        }}
      >
        {area.name}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#3D2B1F',
          lineHeight: 1.45,
        }}
      >
        {area.areas}
      </Typography>
    </Box>
  );
}

export default function GeographicCoverageSection() {
  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 5 },
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 700,
            color: '#3D2B1F',
            mb: 1,
          }}
        >
          Geographic Coverage
        </Typography>
        <Box sx={{ width: 64, height: 4, bgcolor: '#C1440E', borderRadius: 2, mb: 1.5 }} />
        <Typography sx={{ fontSize: '0.92rem', color: '#5A5A5A', lineHeight: 1.7, maxWidth: 720 }}>
          {COVERAGE_NARRATIVE}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {COVERAGE_COUNTRIES.map((area) => (
          <CoverageCard key={area.id} area={area} />
        ))}
      </Box>

      <ClusterCoverageMap />

      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mt: 2, textAlign: 'center' }}>
        {COVERAGE_MAP_LEGEND}
      </Typography>
    </Box>
  );
}
