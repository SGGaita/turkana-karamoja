import { Box, Typography, Button, Divider } from '@mui/material';
import Link from 'next/link';

const highlights = [
  { title: 'Commissioned by', desc: 'Danish Refugee Council' },
  { title: 'Early Warning Systems', desc: 'Real-time flood, drought, locust, and disease outbreak alerts covering all sub-counties.' },
  { title: 'Adaptation Strategies & Best Practices', desc: 'Climate-smart agriculture, pastoralist mobility, water harvesting, and resilience guides.' },
];

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
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 5, md: 8 },
        }}
      >
        {/* Left - Image */}
        <Box
          sx={{
            flex: '0 0 auto',
            width: { xs: '100%', md: '45%' },
            position: 'relative',
          }}
        >
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80"
            alt="Turkana river and greenery"
            sx={{
              width: '100%',
              height: { xs: 280, md: 460 },
              objectFit: 'cover',
              borderRadius: 3,
              display: 'block',
              boxShadow: '0 16px 48px rgba(61,43,31,0.18)',
            }}
          />
          {/* Accent bar */}
          <Box
            sx={{
              position: 'absolute',
              left: -8,
              top: 32,
              width: 5,
              height: 80,
              bgcolor: '#C1440E',
              borderRadius: 2,
            }}
          />
          {/* Floating stat badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -20,
              right: 24,
              bgcolor: '#3D2B1F',
              color: 'white',
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#D4A96A', lineHeight: 1 }}>
              47
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', mt: 0.3 }}>Partner Organisations</Typography>
          </Box>
        </Box>

        {/* Right - Content */}
        <Box sx={{ flex: 1, pt: { xs: 3, md: 0 } }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#C1440E',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              mb: 1.5,
            }}
          >
            About the Climate Hub
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.8rem', md: '2.3rem' },
              color: '#3D2B1F',
              lineHeight: 1.22,
              mb: 2.5,
            }}
          >
            Cross-Border Climate
            <br />
            Intelligence Platform
          </Typography>
          <Typography
            sx={{
              color: '#5A5A5A',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              mb: 3,
            }}
          >
            The Turkana–Karamoja Climate Hub is a joint Kenya–Uganda early warning and climate information
            platform serving pastoral and agropastoral communities across two of East Africa's most climate-vulnerable
            dryland regions. Built on verified data from national meteorological and humanitarian agencies, the Hub
            delivers actionable intelligence to communities, government, and partners.
          </Typography>

          <Divider sx={{ mb: 3, borderColor: '#E8E0D5' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3.5 }}>
            {highlights.map((h) => (
              <Box key={h.title}>
                <Typography sx={{ fontWeight: 600, color: '#3D2B1F', fontSize: '0.88rem', mb: 0.3 }}>
                  {h.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.5 }}>{h.desc}</Typography>
              </Box>
            ))}
          </Box>

          <Button
            component={Link}
            href="/about"
            variant="contained"
            sx={{
              bgcolor: '#2E8B57',
              '&:hover': { bgcolor: '#247A49', transform: 'translateY(-2px)' },
              transition: 'all 0.25s',
              boxShadow: '0 6px 20px rgba(46,139,87,0.3)',
            }}
          >
            More About the Hub
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
