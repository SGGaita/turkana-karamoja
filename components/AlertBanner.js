import { Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Link from 'next/link';

const LEVEL_STYLES = {
  RED: { bg: '#B91C1C', label: 'RED' },
  ORANGE: { bg: '#C45A10', label: 'ORANGE' },
  YELLOW: { bg: '#9A7B0A', label: 'YELLOW' },
  GREEN: { bg: '#2E6B45', label: 'GREEN' },
};

/**
 * Urgent alert strip - sits directly under the main navbar (above page content).
 */
export default function AlertBanner({ banner }) {
  if (!banner) return null;

  const level = banner.level || 'RED';
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.RED;
  const show = level === 'RED' || level === 'ORANGE';

  if (!show) return null;

  return (
    <Box
      component={Link}
      href={banner.href || '/early-warnings'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 2, md: 4 },
        py: 1.15,
        textDecoration: 'none',
        bgcolor: style.bg,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        '&:hover': { filter: 'brightness(1.06)' },
      }}
    >
      <WarningAmberIcon sx={{ color: 'white', fontSize: 18, flexShrink: 0 }} />
      <Typography
        sx={{
          color: 'white',
          fontSize: { xs: '0.76rem', md: '0.84rem' },
          flex: 1,
          lineHeight: 1.45,
        }}
      >
        <Box component="span" sx={{ fontWeight: 700 }}>
          {banner.title}:{' '}
        </Box>
        {banner.desc}
      </Typography>
      <Typography
        sx={{
          color: 'white',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          px: 1.25,
          py: 0.35,
          bgcolor: 'rgba(0,0,0,0.18)',
          borderRadius: 1,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {style.label} · VIEW
      </Typography>
    </Box>
  );
}
