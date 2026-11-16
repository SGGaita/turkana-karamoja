import Link from 'next/link';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import { useOffline } from '../contexts/OfflineContext';
import { useT } from '../contexts/LanguageContext';
import { formatSavedAt } from '../lib/offline';

/**
 * "Download for offline use" (FE-09): saves the main pages, current alerts, recent reports, organisations and help on
 * this device; shows progress and when it was last saved. Also links to the saved documents. For the dark footer.
 */
export default function OfflineDownload({ children, hideSavedLink = false }) {
  const { supported, online, slow, savedAt, progress, partly, downloadForOffline } = useOffline();
  const t = useT();
  if (!supported) return children ? <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>{children}</Box> : null;
  const busy = Boolean(progress);
  const muted = { fontSize: '0.7rem', color: '#9A9A9A' };
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
      <Button
        size="small"
        variant="outlined"
        onClick={downloadForOffline}
        disabled={busy || !online}
        startIcon={<CloudDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
        sx={{
          color: '#F0D9B0', borderColor: 'rgba(240,217,176,0.4)', fontSize: '0.7rem', textTransform: 'none',
          '&:hover': { borderColor: '#F0D9B0', bgcolor: 'rgba(240,217,176,0.08)' },
          '&.Mui-disabled': { color: '#6B6B6B', borderColor: 'rgba(255,255,255,0.12)' },
        }}
      >
        {t('offline.download')}
      </Button>
      {children}
      {!hideSavedLink && (
      <Button
        component={Link}
        href="/saved"
        size="small"
        sx={{ color: '#9A9A9A', fontSize: '0.7rem', textTransform: 'none', '&:hover': { color: '#F0D9B0' } }}
      >
        {t('offline.saved_title')}
      </Button>
      )}
      <Box sx={{ flex: '1 1 220px', minWidth: 0 }} aria-live="polite">
        {busy && (
          <>
            <Typography sx={muted}>{t('offline.downloading', { done: progress.done, total: progress.total })}</Typography>
            <LinearProgress
              variant={progress.total ? 'determinate' : 'indeterminate'}
              value={progress.total ? (100 * progress.done) / progress.total : 0}
              sx={{ mt: 0.5, maxWidth: 260, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#C1440E' } }}
            />
          </>
        )}
        {!busy && savedAt && <Typography sx={muted}>{t('offline.downloaded', { date: formatSavedAt(savedAt) })}</Typography>}
        {!busy && partly && <Typography sx={{ ...muted, color: '#D4A96A' }}>{t('offline.download_partly')}</Typography>}
        {!busy && slow && !partly && <Typography sx={muted}>{t('offline.slow_connection')}</Typography>}
      </Box>
    </Box>
  );
}
