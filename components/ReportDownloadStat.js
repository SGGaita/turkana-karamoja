import { Box, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { formatDownloadCount } from '../lib/report-utils';

export default function ReportDownloadStat({ count = 0, size = 'small' }) {
  const compact = size === 'small';
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
      <DownloadIcon sx={{ fontSize: compact ? 14 : 16, color: '#9A9A9A' }} />
      <Typography component="span" sx={{ fontSize: compact ? '0.68rem' : '0.78rem', color: '#9A9A9A' }}>
        {formatDownloadCount(count)}
      </Typography>
    </Box>
  );
}
