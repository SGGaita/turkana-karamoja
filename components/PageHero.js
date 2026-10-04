import { Box, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';

export default function PageHero({ title, subtitle, image, breadcrumbs = [], contentMaxWidth = 1200 }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 200, md: 260 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        bgcolor: '#3D2B1F',
      }}
    >
      {/* Background */}
      {image && (
        <Box
          component="img"
          src={image}
          alt={title}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.25,
          }}
        />
      )}
      {/* Pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(61,43,31,0.95) 0%, rgba(107,66,38,0.85) 60%, rgba(139,69,19,0.7) 100%)',
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: contentMaxWidth,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, md: 4 },
          pb: 4,
          pt: 3,
        }}
      >
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator="›"
            sx={{ mb: 2 }}
          >
            <Link href="/" style={{ color: '#D4A96A', fontSize: '0.75rem', textDecoration: 'none' }}>
              Home
            </Link>
            {breadcrumbs.map((b, i) =>
              i === breadcrumbs.length - 1 ? (
                <Typography key={b} sx={{ color: '#9A9A9A', fontSize: '0.75rem' }}>
                  {b}
                </Typography>
              ) : (
                <Link key={b} href="#" style={{ color: '#D4A96A', fontSize: '0.75rem', textDecoration: 'none' }}>
                  {b}
                </Link>
              )
            )}
          </Breadcrumbs>
        )}

        <Box>
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              fontSize: { xs: '1.6rem', md: '2.4rem' },
              lineHeight: 1.15,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ color: '#D4A96A', fontSize: { xs: '0.85rem', md: '0.95rem' }, fontWeight: 300 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Bottom accent */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, bgcolor: '#C1440E' }} />
    </Box>
  );
}
