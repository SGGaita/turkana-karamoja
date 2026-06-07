import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <Box
      sx={{
        bgcolor: '#3D2B1F',
        color: '#F0D9B0',
        py: 0.75,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        fontSize: '0.75rem',
      }}
    >
      <CloudOffIcon sx={{ fontSize: 16 }} />
      <Typography component="span" sx={{ fontSize: '0.75rem' }}>
        You are offline - showing last saved content where available
      </Typography>
    </Box>
  );
}
