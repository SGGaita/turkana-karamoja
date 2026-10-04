import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { useLocalizedHomeSections } from '../contexts/LanguageContext';

export default function GetInvolvedSection() {
  const homeSections = useLocalizedHomeSections();
  const copy = homeSections.getInvolved || {};

  return (
    <Box
      id="get-involved"
      sx={{
        bgcolor: '#3D2B1F',
        py: { xs: 6, md: 8 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 3, md: 5 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#D4A96A',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              mb: 1,
            }}
          >
            {copy.eyebrow}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: '1.6rem', md: '2rem' },
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.25,
              mb: 1.5,
            }}
          >
            {copy.heading}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.88rem', md: '0.95rem' },
              color: '#C4B5A5',
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            {copy.body}
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/partners-stakeholders"
          variant="contained"
          size="large"
          startIcon={<HandshakeOutlinedIcon />}
          endIcon={<ArrowForwardIcon />}
          sx={{
            flexShrink: 0,
            bgcolor: '#C1440E',
            color: 'white',
            px: 3,
            py: 1.4,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: '0 8px 24px rgba(193,68,14,0.35)',
            '&:hover': {
              bgcolor: '#E8622A',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 32px rgba(193,68,14,0.4)',
            },
            transition: 'all 0.25s',
          }}
        >
          {copy.buttonLabel}
        </Button>
      </Box>
    </Box>
  );
}
