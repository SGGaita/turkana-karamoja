import { Box, Typography, Divider } from '@mui/material';
import { APP_NAME, APP_TAGLINE, APP_COPYRIGHT } from '../lib/branding';
import { FOOTER_REGIONS } from '../lib/regions';
import { TOLL_FREE_LINES } from '../lib/toll-free-lines';
import Link from 'next/link';
import { useLocalizedHomeSections, useShell } from '../contexts/LanguageContext';
import { withoutRetiredLinks } from '../lib/topbar-links';

/** The old footer content (home sections + built-in lists), until Site settings are saved. */
function legacyFooter(footer) {
  const asLinks = (list) => withoutRetiredLinks(list).map((l) => (typeof l === 'string' ? { label: l, href: '' } : l));
  return {
    siteName: APP_NAME,
    tagline: APP_TAGLINE,
    about: footer.metaDescription,
    partners: ['KMD', 'UMA', 'NDMA', 'OPM', 'OCHA', 'FAO', 'ICPAC', 'UNICEF', 'WFP'],
    columns: [
      // "API Access" etc. may still be stored in the CMS or the browser cache; never show it.
      { title: footer.columnKaramoja || 'Karamoja', links: asLinks(footer.linksKaramoja?.length ? footer.linksKaramoja : ['About Karamoja', 'Our Partners', 'Data Sources', 'Methodology']) },
      { title: footer.columnServices || 'Services', links: asLinks(footer.linksServices?.length ? footer.linksServices : ['Early Warnings', 'Weather Forecasts', 'Community Bulletins', 'Submit Advisory', 'Donor Portal']) },
    ],
    regionsTitle: footer.columnRegions || 'Regions',
    regions: FOOTER_REGIONS,
    contactTitle: footer.columnContact || 'Contact',
    contactLink: { label: footer.contactLink || 'Contact Us →', href: '/contact' },
    contactLines: (footer.contacts?.length
      ? footer.contacts
      : [
        // Placeholder numbers, the demo email and the fake "24/7 duty officer" line were removed (E8).
        { label: 'Lodwar, Turkana County, Kenya', sub: '' },
        { label: 'Moroto, Uganda', sub: '' },
        ...TOLL_FREE_LINES.map((l) => ({ label: l.display, sub: l.label })),
      ]).map((c) => ({ text: c.label, note: c.sub })),
    copyright: `${APP_COPYRIGHT} · Kenya · Uganda`,
    social: [],
  };
}

export default function Footer() {
  const homeSections = useLocalizedHomeSections();
  const shell = useShell();
  if (shell && shell.footer.enabled === false) return null;
  // Karamoja → Site settings → Footer once saved; the old content until then.
  const data = shell
    ? { ...shell.footer, contactLines: [...shell.footer.contactLines, ...shell.hotlines.map((l) => ({ text: l.display, note: l.label }))] }
    : legacyFooter(homeSections.footer || {});
  const columns = [
    ...data.columns,
    ...(data.regions.length ? [{ title: data.regionsTitle, links: data.regions.map((r) => ({ label: r, href: '' })) }] : []),
  ];

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
                {data.siteName}
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#D4A96A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {data.tagline}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.75, mb: 2.5, maxWidth: 280 }}>
              {data.about}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.partners.map((p) => (
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
            {data.social.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {data.social.map((sl) => (
                  <Box key={sl.url} component="a" href={sl.url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.75rem', color: '#D4A96A', textDecoration: 'none', textTransform: 'capitalize', '&:hover': { color: '#F0D9B0' } }}>
                    {sl.network || sl.url}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {columns.map(({ title: heading, links }) => (
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
                    key={link.label}
                    {...(link.href ? { component: Link, href: link.href } : { component: 'span' })}
                    sx={{
                      fontSize: '0.78rem',
                      color: '#9A9A9A',
                      textDecoration: 'none',
                      '&:hover': { color: '#D4A96A' },
                      transition: 'color 0.2s',
                    }}
                  >
                    {link.label}
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
              {data.contactTitle}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.contactLink && (
              <Box
                component={Link}
                href={data.contactLink.href}
                sx={{
                  fontSize: '0.78rem',
                  color: '#D4A96A',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#F0D9B0' },
                }}
              >
                {data.contactLink.label}
              </Box>
              )}
              {data.contactLines.map((c) => (
                <Box key={c.text}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', lineHeight: 1.5 }}>{c.text}</Typography>
                  {c.note && <Typography sx={{ fontSize: '0.68rem', color: '#6B4226' }}>{c.note}</Typography>}
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
          {data.copyright}
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
