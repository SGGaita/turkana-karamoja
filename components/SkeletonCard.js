import { Box, Skeleton } from '@mui/material';

export default function SkeletonCard({ height = 120 }) {
  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
      <Skeleton variant="text" width="40%" height={24} />
      <Skeleton variant="text" width="90%" sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" height={height} sx={{ mt: 2, borderRadius: 1 }} />
    </Box>
  );
}
