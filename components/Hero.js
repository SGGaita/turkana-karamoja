import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { fallbackHero } from '../lib/fallback-data';
import { useLocalizedHero } from '../contexts/LanguageContext';

export default function Hero() {
  const hero = useLocalizedHero(fallbackHero);
  const { primaryCta, secondaryCta } = hero;

  return (
    <Box
      id="home"
      sx={{
        position: 'relative',
        minHeight: { xs: '72vh', md: 'calc(100vh - 120px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#1A120E',
      }}
    >
      {hero.backgroundImage && (
        <Box
          component="img"
          src={hero.backgroundImage}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            opacity: 0.32,
          }}
        />
      )}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(105deg, rgba(26,18,14,0.94) 0%, rgba(26,18,14,0.72) 45%, rgba(26,18,14,0.35) 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(26,18,14,0.98) 0%, transparent 55%)',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            width: '100%',
            px: { xs: 2.5, md: 4 },
            py: { xs: 4, md: 5 },
            display: 'grid',
            gridTemplateColumns: '1fr',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              sx={{
                color: '#9A9088',
                fontSize: '0.7rem',
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              {hero.eyebrow}
            </Typography>

            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontFamily: '"Montserrat", sans-serif',
                fontSize: { xs: '2.35rem', sm: '2.85rem', md: '3.35rem' },
                lineHeight: 1.1,
                fontWeight: 700,
                mb: 2,
              }}
            >
              {hero.title}
              <Box component="span" sx={{ display: 'block', color: '#D4A96A', mt: 0.25 }}>
                {hero.titleAccent}
              </Box>
            </Typography>

            <Typography
              sx={{
                color: '#B8AEA4',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.75,
                maxWidth: 520,
                mb: 3.5,
              }}
            >
              {hero.subtitle}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Button
                component={Link}
                href={primaryCta.href}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#C1440E',
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  boxShadow: '0 8px 24px rgba(193,68,14,0.35)',
                  '&:hover': { bgcolor: '#D9561E' },
                }}
              >
                {primaryCta.label}
              </Button>
              <Button
                component={Link}
                href={secondaryCta.href}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: '#E8E0D5',
                  px: 3,
                  py: 1.2,
                  borderRadius: 1.5,
                  '&:hover': { borderColor: '#D4A96A', bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                {secondaryCta.label}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
