import { Alert } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function StaleContentBanner({ show }) {
  if (!show) return null;
  return (
    <Alert
      severity="info"
      icon={<InfoOutlinedIcon />}
      sx={{
        mb: 3,
        bgcolor: '#F0F6FF',
        border: '1px solid #2E7BB4',
        '& .MuiAlert-icon': { color: '#2E7BB4' },
      }}
    >
      Showing cached content - live CMS updates are temporarily unavailable.
    </Alert>
  );
}
