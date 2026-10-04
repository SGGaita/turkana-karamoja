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
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSiteHeader } from '../contexts/SiteHeaderContext';
import AlertBanner from './AlertBanner';
import LanguageSelector from './LanguageSelector';
import PushSubscribeButton from './PushSubscribeButton';
import { resolveTopbarLink } from '../lib/topbar-links';

export default function Navbar({ urgentBanner = null }) {
  const { branding, topbar, navLinks } = useSiteHeader();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
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
          bgcolor: '#FFFFFF',
          color: '#3D2B1F',
          px: { xs: 2, md: 4 },
          py: '6px',
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'flex-end',
          alignItems: 'center',
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          borderBottom: '1px solid #E8E0D5',
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <LanguageSelector />
          {topbar.links.map((link) => {
            const href = resolveTopbarLink(link.label, link.href);
            const internal = href.startsWith('/');
            const Comp = internal ? Link : 'a';
            return (
              <Box
                key={link.label}
                component={Comp}
                href={href}
                sx={{
                  color: '#3D2B1F',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  '&:hover': { color: '#C1440E' },
                }}
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
          bgcolor: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(61,43,31,0.08)',
          borderBottom: urgentBanner ? 'none' : '2px solid #C1440E',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1, minHeight: { xs: '64px !important', md: '96px !important' } }}>
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
                  height: { xs: 56, md: 76 },
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Image
                  src={branding.logoUrl}
                  alt=""
                  width={300}
                  height={76}
                  style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
                  unoptimized
                />
              </Box>
            )}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#3D2B1F',
                  lineHeight: 1.2,
                }}
              >
                {branding.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  color: '#8B6A4A',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1.35,
                  maxWidth: { xs: 200, md: 280 },
                  whiteSpace: 'normal',
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
                      color: isActive ? '#C1440E' : '#3D2B1F',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      px: 1.2,
                      py: 0.8,
                      borderBottom: isActive ? '2px solid #C1440E' : '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': { color: '#C1440E', bgcolor: 'rgba(193,68,14,0.06)' },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: '#3D2B1F' }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <AlertBanner banner={urgentBanner} />
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 260, bgcolor: '#FFFFFF', minHeight: '100vh' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ color: '#3D2B1F' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href;
              return (
                <ListItem
                  key={link.label}
                  component={Link}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    color: isActive ? '#C1440E' : '#3D2B1F',
                    fontWeight: isActive ? 700 : 400,
                    borderLeft: isActive ? '3px solid #C1440E' : '3px solid transparent',
                    '&:hover': { bgcolor: 'rgba(193,68,14,0.06)', color: '#C1440E' },
                    textDecoration: 'none',
                  }}
                >
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: '1rem' }} />
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ borderColor: '#E8E0D5', my: 1 }} />

          <List>
            {topbar.links.map((link) => {
              const href = resolveTopbarLink(link.label, link.href);
              const internal = href.startsWith('/');
              const isActive = internal && router.pathname === href.split('#')[0];
              const Comp = internal ? Link : 'a';
              return (
                <ListItem
                  key={link.label}
                  component={Comp}
                  href={href}
                  {...(!internal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    color: isActive ? '#C1440E' : '#3D2B1F',
                    fontWeight: isActive ? 700 : 400,
                    borderLeft: isActive ? '3px solid #C1440E' : '3px solid transparent',
                    '&:hover': { bgcolor: 'rgba(193,68,14,0.06)', color: '#C1440E' },
                    textDecoration: 'none',
                  }}
                >
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ px: 2, py: 1.5 }}>
            <PushSubscribeButton compact />
          </Box>

          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E8E0D5' }}>
            <LanguageSelector variant="drawer" />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
