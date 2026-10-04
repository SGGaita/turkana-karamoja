import { Box, Typography, Button, Divider } from '@mui/material';
import AboutHubIntro from './AboutHubIntro';

export default function ClimateHubSection() {
  return (
    <Box
      id="about"
      sx={{
        bgcolor: 'white',
        py: { xs: 7, md: 10 },
        px: { xs: 2, md: 0 },
      }}
    >
      <AboutHubIntro showCta />
    </Box>
  );
}
