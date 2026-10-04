import Image from 'next/image';
import { Box, Typography, Chip } from '@mui/material';
import { useSiteHeader } from '../contexts/SiteHeaderContext';
import { commissionedByContent } from '../lib/about-hub-content';

export default function CommissionedBySection({ data }) {
  const { branding } = useSiteHeader();
  const commissioned = { ...commissionedByContent, ...data };
  const logoUrl = branding.logoUrl || commissioned.logoUrl;
  const showLogo = Boolean(logoUrl);

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 3, md: 5 },
          p: { xs: 0, md: 1 },
        }}
      >
        {showLogo && (
          <Box
            sx={{
              flexShrink: 0,
              bgcolor: 'white',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 3.5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: '100%', md: 320 },
              minHeight: { xs: 120, md: 140 },
              boxShadow: '0 4px 20px rgba(61, 43, 31, 0.08)',
            }}
          >
            <Image
              src={logoUrl}
              alt={commissioned.logoAlt || 'Danish Refugee Council'}
              width={320}
              height={120}
              style={{ width: '100%', height: 'auto', maxHeight: 120, objectFit: 'contain' }}
              unoptimized
            />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C1440E',
              mb: 1,
            }}
          >
            {commissioned.title}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: '#3D2B1F',
              mb: 1,
              lineHeight: 1.3,
            }}
          >
            {commissioned.organization}
          </Typography>

          <Chip
            label={commissioned.project}
            size="small"
            sx={{
              bgcolor: '#FDF6EC',
              color: '#8B4513',
              fontWeight: 700,
              fontSize: '0.72rem',
              mb: 2,
              borderRadius: 0,
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: '0.88rem', md: '0.92rem' },
              color: '#5A5A5A',
              lineHeight: 1.75,
            }}
          >
            {commissioned.description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
