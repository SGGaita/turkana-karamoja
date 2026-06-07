import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSiteHeader } from '../contexts/SiteHeaderContext';
import AlertBanner from './AlertBanner';
import LanguageSelector from './LanguageSelector';

export default function Navbar({ urgentBanner = null }) {
  const { branding, topbar, navLinks, cta } = useSiteHeader();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
      <Box
        sx={{
          bgcolor: '#3D2B1F',
          color: '#F0D9B0',
          px: { xs: 2, md: 4 },
          py: '6px',
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.04em',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="span"
            sx={{
              width: 7,
              height: 7,
              bgcolor: '#2E8B57',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulse 1.8s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          />
          {topbar.statusText}
        </Box>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <LanguageSelector />
          {topbar.links.map((link) => {
            const internal = link.href.startsWith('/');
            const Comp = internal ? Link : 'a';
            return (
              <Box
                key={link.label}
                component={Comp}
                href={link.href}
                sx={{ color: '#D4A96A', textDecoration: 'none', fontSize: '0.7rem' }}
              >
                {link.label}
              </Box>
            );
          })}
        </Box>
      </Box>

      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'rgba(61, 43, 31, 0.97)',
          backdropFilter: 'blur(8px)',
          borderBottom: urgentBanner ? 'none' : '2px solid #C1440E',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 0.5, minHeight: '64px !important' }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
              textDecoration: 'none',
            }}
          >
            {branding.logoUrl && (
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Image src={branding.logoUrl} alt="" width={42} height={42} style={{ objectFit: 'contain' }} unoptimized />
              </Box>
            )}
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '0.9rem', md: '1.05rem' },
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                {branding.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  color: '#D4A96A',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {branding.tagline}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => {
                const isActive = router.pathname === link.href;
                return (
                  <Button
                    key={link.label}
                    component={Link}
                    href={link.href}
                    sx={{
                      color: isActive ? 'white' : '#D4A96A',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      px: 1.2,
                      py: 0.8,
                      borderBottom: isActive ? '2px solid #C1440E' : '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
              <Button
                component={Link}
                href={cta.href}
                variant="contained"
                size="small"
                sx={{ ml: 1, bgcolor: '#C1440E', '&:hover': { bgcolor: '#E8622A' }, fontSize: '0.75rem' }}
              >
                {cta.label}
              </Button>
            </Box>
          )}

          {isMobile && (
            <Button onClick={() => setDrawerOpen(true)} sx={{ color: '#D4A96A', minWidth: 'auto', px: 1 }} aria-label="open menu">
              Menu
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <AlertBanner banner={urgentBanner} />
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, bgcolor: '#3D2B1F', minHeight: '100vh', pt: 2 }}>
          <List>
            {navLinks.map((link) => (
              <ListItem
                key={link.label}
                component={Link}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                sx={{ color: '#F0D9B0', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }, textDecoration: 'none' }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
              </ListItem>
            ))}
            <ListItem component={Link} href={cta.href} onClick={() => setDrawerOpen(false)} sx={{ color: '#C1440E' }}>
              <ListItemText primary={cta.label} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
