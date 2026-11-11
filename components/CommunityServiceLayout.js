import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useT } from '../contexts/LanguageContext';

function MapLoading() {
  const t = useT();
  return (
    <Box sx={{ height: { xs: 380, md: 520 }, bgcolor: '#F5F0E8', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E0D5' }}>
      <Typography sx={{ color: '#9A9A9A', fontSize: '0.85rem' }}>{t('common.loading_map')}</Typography>
    </Box>
  );
}

const CommunityServiceMap = dynamic(() => import('./CommunityServiceMap'), {
  ssr: false,
  loading: MapLoading,
});

export { CommunityServiceMap };

export function CommunityBackLink({ label }) {
  const t = useT();
  return (
    <Button
      component={Link}
      href="/community"
      startIcon={<ArrowBackIcon />}
      sx={{ color: '#6B4226', fontWeight: 600, textTransform: 'none', mb: 3, px: 0 }}
    >
      {label || t('community.back')}
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

/** The page's Introduction section (Karamoja → Website pages); nothing when both fields are empty. */
export function IntroBox({ title, text, color = '#2E7BB4', bg = 'white', children }) {
  if (!title && !text && !children) return null;
  return (
    <Box sx={{ bgcolor: bg, border: `1px solid ${color}40`, borderLeft: `4px solid ${color}`, borderRadius: 2, p: 2.5, mb: 4 }}>
      <Typography component="div" sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
        {title && <strong style={{ color: '#3D2B1F' }}>{title} </strong>}
        {children || text}
      </Typography>
    </Box>
  );
}

/** Shown in place of a list with no items. */
export function EmptyNote({ text }) {
  if (!text) return null;
  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3, textAlign: 'center' }}>
      <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.7 }}>{text}</Typography>
    </Box>
  );
}
