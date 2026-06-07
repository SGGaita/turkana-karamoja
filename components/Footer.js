import { Box, Typography, Divider } from '@mui/material';

const footerLinks = {
  'Climate Hub': ['About the Hub', 'Our Partners', 'Data Sources', 'API Access', 'Methodology'],
  'Services': ['Early Warnings', 'Weather Forecasts', 'Community Bulletins', 'Submit Advisory', 'Donor Portal'],
  'Regions': ['Turkana County (Kenya)', 'Karamoja Region (Uganda)', 'Turkana North', 'Kotido District', 'Moroto District'],
};

const partners = ['KMD', 'UMA', 'NDMA', 'OPM', 'OCHA', 'FAO', 'ICPAC', 'UNICEF', 'WFP'];

export default function Footer() {
  return (
    <Box
      component="footer"
      id="contact"
      sx={{ bgcolor: '#3D2B1F', color: '#9A9A9A', pt: { xs: 6, md: 8 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        {/* Top section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 6 }, mb: 5 }}>
          {/* Brand column */}
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
                Turkana – Karamoja
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#D4A96A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Climate Hub
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.75, mb: 2.5, maxWidth: 280 }}>
              Kenya · Uganda · Cross-Border Climate Intelligence Platform serving 2.4 million people in East
              Africa's most climate-vulnerable dryland regions.
            </Typography>
            {/* Partner logos strip */}
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

          {/* Link columns */}
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

          {/* Contact column */}
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
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Lodwar, Turkana County, Kenya', sub: '' },
                { label: 'Moroto, Karamoja Sub-Region, Uganda', sub: '' },
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

      {/* Bottom bar */}
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
          © 2026 Turkana–Karamoja Climate Hub · Kenya · Uganda · Cross-Border Platform
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
