import { Box, Typography, Divider } from '@mui/material';
import { APP_NAME, APP_TAGLINE, APP_COPYRIGHT } from '../lib/branding';
import { FOOTER_REGIONS } from '../lib/regions';
import { useLocalizedHomeSections } from '../contexts/LanguageContext';

const partners = ['KMD', 'UMA', 'NDMA', 'OPM', 'OCHA', 'FAO', 'ICPAC', 'UNICEF', 'WFP'];

export default function Footer() {
  const homeSections = useLocalizedHomeSections();
  const footer = homeSections.footer || {};

  const footerLinks = {
    [footer.columnKaramoja || 'Karamoja']: footer.linksKaramoja?.length
      ? footer.linksKaramoja
      : ['About Karamoja', 'Our Partners', 'Data Sources', 'API Access', 'Methodology'],
    [footer.columnServices || 'Services']: footer.linksServices?.length
      ? footer.linksServices
      : ['Early Warnings', 'Weather Forecasts', 'Community Bulletins', 'Submit Advisory', 'Donor Portal'],
    [footer.columnRegions || 'Regions']: FOOTER_REGIONS,
  };

  return (
    <Box
      component="footer"
      id="contact"
      sx={{ bgcolor: '#3D2B1F', color: '#9A9A9A', pt: { xs: 6, md: 8 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 6 }, mb: 5 }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#F0D9B0',
                  lineHeight: 1.2,
                }}
              >
                {APP_NAME}
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#D4A96A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {APP_TAGLINE}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.75, mb: 2.5, maxWidth: 280 }}>
              {footer.metaDescription}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {partners.map((p) => (
                <Box
                  key={p}
                  sx={{
                    px: 1.2,
                    py: 0.4,
                    bgcolor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 1,
                    fontSize: '0.65rem',
                    color: '#D4A96A',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  {p}
                </Box>
              ))}
            </Box>
          </Box>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <Box key={heading} sx={{ flex: '1 1 140px' }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  color: '#F0D9B0',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {heading}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {links.map((link) => (
                  <Box
                    key={link}
                    component="a"
                    href="#"
                    sx={{
                      fontSize: '0.78rem',
                      color: '#9A9A9A',
                      textDecoration: 'none',
                      '&:hover': { color: '#D4A96A' },
                      transition: 'color 0.2s',
                    }}
                  >
                    {link}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}

          <Box sx={{ flex: '1 1 200px' }}>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                color: '#F0D9B0',
                fontSize: '0.95rem',
                fontWeight: 700,
                mb: 2,
              }}
            >
              {footer.columnContact || 'Contact'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box
                component="a"
                href="/contact"
                sx={{
                  fontSize: '0.78rem',
                  color: '#D4A96A',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#F0D9B0' },
                }}
              >
                {footer.contactLink || 'Contact Us →'}
              </Box>
              {[
                { label: 'Lodwar, Turkana County, Kenya', sub: '' },
                { label: 'Moroto, Uganda', sub: '' },
                { label: '+254 (0)54 22 XXX', sub: 'Turkana Coordination Unit' },
                { label: 'info@tkclimate.org', sub: '' },
                { label: 'Emergency: +254 700 000 000', sub: '24/7 duty officer' },
              ].map((c) => (
                <Box key={c.label}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', lineHeight: 1.5 }}>{c.label}</Typography>
                  {c.sub && <Typography sx={{ fontSize: '0.68rem', color: '#6B4226' }}>{c.sub}</Typography>}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      </Box>

      <Box
        sx={{
          bgcolor: '#1A0F0A',
          py: 1.5,
          mt: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          px: { xs: 2, md: 6 },
        }}
      >
        <Typography
          sx={{ fontSize: '0.68rem', color: '#5A5A5A', fontFamily: '"Montserrat", sans-serif' }}
        >
          {APP_COPYRIGHT} · Kenya · Uganda
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {['Privacy Policy', 'Terms of Use', 'Accessibility', 'Data Policy'].map((l) => (
            <Box
              key={l}
              component="a"
              href="#"
              sx={{ fontSize: '0.65rem', color: '#5A5A5A', textDecoration: 'none', '&:hover': { color: '#9A9A9A' } }}
            >
              {l}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
