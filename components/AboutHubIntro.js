import { Box, Typography, Button, Divider } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteHeader } from '../contexts/SiteHeaderContext';
import { useLocalizedHomeSections } from '../contexts/LanguageContext';
import { ABOUT_HUB_IMAGE } from '../lib/about-hub-content';

export default function AboutHubIntro({ showCta = false, excludeCommissionedHighlight = false }) {
  const { branding } = useSiteHeader();
  const homeSections = useLocalizedHomeSections();
  const about = homeSections.about || {};
  const highlights = (about.highlights || []).filter(
    (h) => !(excludeCommissionedHighlight && h.title === 'Commissioned by')
  );

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        gap: { xs: 5, md: 8 },
      }}
    >
      <Box
        sx={{
          flex: '0 0 auto',
          width: { xs: '100%', md: '45%' },
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src={ABOUT_HUB_IMAGE}
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
      </Box>

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
          {about.eyebrow}
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
          {about.titleLine1}
          <br />
          {about.titleLine2}
        </Typography>
        <Typography
          sx={{
            color: '#5A5A5A',
            fontSize: '0.95rem',
            lineHeight: 1.75,
            mb: 3,
          }}
        >
          {about.description}
        </Typography>

        <Divider sx={{ mb: 3, borderColor: '#E8E0D5' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: showCta ? 3.5 : 0 }}>
          {highlights.map((h) => (
            <Box key={h.title}>
              <Typography sx={{ fontWeight: 600, color: '#3D2B1F', fontSize: '0.88rem', mb: 0.3 }}>
                {h.title}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.5 }}>{h.desc}</Typography>
              {h.title === 'Commissioned by' && branding.logoUrl && (
                <Box sx={{ height: 48, display: 'flex', alignItems: 'center', mt: 1.25 }}>
                  <Image
                    src={branding.logoUrl}
                    alt="Danish Refugee Council"
                    width={200}
                    height={48}
                    style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
                    unoptimized
                  />
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {showCta && (
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
            {about.ctaLabel || 'Learn more'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
