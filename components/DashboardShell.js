import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box, Typography, Button, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme, Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { APP_NAME, APP_PAGE_TITLE_SUFFIX } from '../lib/branding';

const SIDEBAR_WIDTH = 264;

export const DASHBOARD_SECTIONS = [
  { key: 'overview', label: 'Overview', icon: DashboardOutlinedIcon },
  { key: 'advisory', label: 'Submit Advisory', icon: CampaignOutlinedIcon },
  { key: 'report', label: 'Submit Report', icon: DescriptionOutlinedIcon },
];

function SidebarContent({ orgRecord, section, onSectionChange, onLogout, onNavigate }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#3D2B1F', color: 'white' }}>
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1rem', color: 'white', lineHeight: 1.3 }}>
          {APP_NAME}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#D4A96A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Partner Dashboard
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <Box sx={{ p: 2, pb: 1 }}>
        <Typography sx={{ color: '#9A9A9A', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 }}>
          Organisation
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', mb: 0.5, wordBreak: 'break-word' }}>
          {orgRecord?.name || '—'}
        </Typography>
        {orgRecord?.reference && (
          <Chip label="Verified partner" size="small" sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
        )}
      </Box>

      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {DASHBOARD_SECTIONS.map(({ key, label, icon: Icon }) => (
          <ListItemButton
            key={key}
            selected={section === key}
            onClick={() => { onSectionChange(key); onNavigate?.(); }}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              color: section === key ? '#3D2B1F' : 'rgba(255,255,255,0.85)',
              bgcolor: section === key ? '#D4A96A' : 'transparent',
              '&:hover': { bgcolor: section === key ? '#D4A96A' : 'rgba(255,255,255,0.08)' },
              '&.Mui-selected': { bgcolor: '#D4A96A' },
              '&.Mui-selected:hover': { bgcolor: '#D4A96A' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: section === key ? 700 : 500 }}>
              {label}
            </ListItemText>
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <Box sx={{ p: 1.5 }}>
        <ListItemButton component={Link} href="/" sx={{ borderRadius: 1.5, mb: 0.5, color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><HomeOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>Back to site</ListItemText>
        </ListItemButton>
        <ListItemButton onClick={onLogout} sx={{ borderRadius: 1.5, color: '#F0D9B0', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}>Sign out</ListItemText>
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function DashboardShell({
  title = 'Partner Dashboard',
  orgRecord,
  userEmail,
  section,
  onSectionChange,
  onLogout,
  children,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = DASHBOARD_SECTIONS.find((s) => s.key === section)?.label || 'Overview';

  return (
    <>
      <Head>
        <title>{`${title} | ${APP_PAGE_TITLE_SUFFIX}`}</title>
        <meta name="description" content="Kenya · Uganda · Cross-Border Climate Intelligence Platform" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3D2B1F" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', bgcolor: '#FDF6EC' }}>
        {/* Desktop permanent sidebar */}
        <Box
          component="nav"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
            position: 'sticky',
            top: 0,
            height: '100vh',
          }}
        >
          <SidebarContent orgRecord={orgRecord} section={section} onSectionChange={onSectionChange} onLogout={onLogout} />
        </Box>

        {/* Mobile temporary drawer */}
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, bgcolor: '#3D2B1F' }}>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, height: '100%' }}>
            <SidebarContent orgRecord={orgRecord} section={section} onSectionChange={onSectionChange} onLogout={onLogout} onNavigate={() => setMobileOpen(false)} />
          </Box>
        </Drawer>

        {/* Main column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box
            sx={{
              position: 'sticky', top: 0, zIndex: 10,
              bgcolor: 'white', borderBottom: '1px solid #E8E0D5',
              px: { xs: 2, md: 4 }, py: 1.5,
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}
          >
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#3D2B1F' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#3D2B1F' }}>
                {activeLabel}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.8rem', color: '#5A5A5A' }}>
                {userEmail}
              </Typography>
              {!isMobile && (
                <Button size="small" onClick={onLogout} startIcon={<LogoutIcon />} sx={{ color: '#C1440E' }}>
                  Sign out
                </Button>
              )}
            </Box>
          </Box>

          <Box component="main" sx={{ flex: 1, width: '100%', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
