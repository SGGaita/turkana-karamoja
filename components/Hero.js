import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { fallbackHero } from '../lib/fallback-data';

function OverviewPanel({ overview }) {
  const { title, subtitle, footer, metrics } = overview;

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{title}</Typography>
        <Typography sx={{ color: '#9A9088', fontSize: '0.75rem', mt: 0.4, lineHeight: 1.5 }}>
          {subtitle}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {metrics.map((m, i) => (
          <Box
            key={m.label}
            sx={{
              px: 2.5,
              py: 2,
              borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                color: m.color,
                fontSize: '1.75rem',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {m.val}
            </Typography>
            <Typography sx={{ color: '#E8E0D5', fontSize: '0.8rem', fontWeight: 600, mt: 0.75 }}>
              {m.label}
            </Typography>
            <Typography sx={{ color: '#7A7268', fontSize: '0.7rem', mt: 0.35, lineHeight: 1.45 }}>
              {m.sub}
            </Typography>
          </Box>
        ))}
      </Box>

      {footer && (
        <Box
          sx={{
            px: 2.5,
            py: 1.25,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            bgcolor: 'rgba(193,68,14,0.08)',
          }}
        >
          <Typography sx={{ color: '#C9B89A', fontSize: '0.72rem', lineHeight: 1.5 }}>{footer}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default function Hero({ hero: heroProp }) {
  const hero = heroProp || fallbackHero;
  const { overview, quickFacts, primaryCta, secondaryCta } = hero;

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
            gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' },
            gap: { xs: 4, lg: 5 },
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

            <Box sx={{ display: { xs: 'block', lg: 'none' }, mt: 4 }}>
              <OverviewPanel overview={overview} />
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <OverviewPanel overview={overview} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(0,0,0,0.25)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2.5, md: 4 },
            py: 1.5,
            display: 'flex',
            gap: { xs: 2, md: 0 },
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {quickFacts.map((item, i) => (
            <Box
              key={item.label}
              sx={{
                flex: { md: '1 1 0' },
                minWidth: { xs: 140, md: 0 },
                px: { md: i > 0 ? 2.5 : 0 },
                borderRight: {
                  md: i < quickFacts.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                },
              }}
            >
              <Typography
                sx={{
                  color: '#7A7268',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 0.35,
                }}
              >
                {item.label}
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '0.88rem', fontWeight: 600 }}>
                {item.value}
              </Typography>
              <Typography sx={{ color: '#6A625C', fontSize: '0.68rem', mt: 0.25, lineHeight: 1.4 }}>
                {item.detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
