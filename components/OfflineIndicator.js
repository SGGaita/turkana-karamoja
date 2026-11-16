import { Box, Typography } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useOffline } from '../contexts/OfflineContext';
import { useT } from '../contexts/LanguageContext';
import { formatSavedAt } from '../lib/offline';

/** Bar under the header while there is no connection, with when the saved copy was made (FE-09). */
export default function OfflineIndicator() {
  const { online, savedAt } = useOffline();
  const t = useT();
  if (online) return null;
  return (
    <Box
      role="status"
      sx={{
        bgcolor: '#3D2B1F', color: '#F0D9B0', py: 0.75, px: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontSize: '0.75rem',
      }}
    >
      <CloudOffIcon sx={{ fontSize: 16 }} />
      <Typography component="span" sx={{ fontSize: '0.75rem' }}>
        {savedAt ? t('offline.banner_saved', { date: formatSavedAt(savedAt) }) : t('offline.banner')}
      </Typography>
    </Box>
  );
}
