import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';

/** Legacy route — redirects to /partners-stakeholders. */
export default function SubmitRedirect() {
  const router = useRouter();

  useEffect(() => {
    const query = { ...router.query };
    router.replace({ pathname: '/partners-stakeholders', query });
  }, [router]);

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#C1440E' }} />
    </Box>
  );
}
