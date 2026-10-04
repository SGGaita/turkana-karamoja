import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CommunityServiceMap = dynamic(() => import('./CommunityServiceMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: { xs: 380, md: 520 }, bgcolor: '#F5F0E8', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E0D5' }}>
      <Typography sx={{ color: '#9A9A9A', fontSize: '0.85rem' }}>Loading map…</Typography>
    </Box>
  ),
});

export { CommunityServiceMap };

export function CommunityBackLink({ label = 'Back to Community' }) {
  return (
    <Button
      component={Link}
      href="/community"
      startIcon={<ArrowBackIcon />}
      sx={{ color: '#6B4226', fontWeight: 600, textTransform: 'none', mb: 3, px: 0 }}
    >
      {label}
    </Button>
  );
}

export function StatusPill({ label, color }) {
  return (
    <Box sx={{ px: 1, py: 0.25, bgcolor: `${color}22`, color, borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, display: 'inline-block' }}>
      {label}
    </Box>
  );
}

export function StatChip({ value, label, color = '#3D2B1F' }) {
  return (
    <Box sx={{ flex: '1 1 120px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2, textAlign: 'center' }}>
      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.5rem', fontWeight: 700, color }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', mt: 0.5 }}>{label}</Typography>
    </Box>
  );
}
