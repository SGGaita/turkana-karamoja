import { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

import { HUB_LANGUAGES } from '../lib/languages';
import { useLanguage, SUPPORTED_LOCALES } from '../contexts/LanguageContext';

const languages = HUB_LANGUAGES;

export default function LanguageSelector({ variant = 'default' }) {
  const { locale, setLocale } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (langCode) => {
    handleClose();
    if (SUPPORTED_LOCALES.includes(langCode)) {
      setLocale(langCode);
    }
  };

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];
  const isDrawer = variant === 'drawer';

  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        fullWidth={isDrawer}
        sx={{
          color: isDrawer ? '#3D2B1F' : '#9A9A9A',
          fontSize: isDrawer ? '0.9rem' : '0.75rem',
          textTransform: 'none',
          justifyContent: isDrawer ? 'flex-start' : 'center',
          '&:hover': {
            color: isDrawer ? '#C1440E' : '#D4A96A',
            bgcolor: isDrawer ? 'rgba(193,68,14,0.06)' : 'transparent',
          },
          minWidth: 'auto',
          px: isDrawer ? 1.5 : 1,
          py: isDrawer ? 1 : undefined,
        }}
      >
        {currentLanguage?.nativeName}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: 'white',
            border: '1px solid #E8E0D5',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E8E0D5' }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Select Language
          </Typography>
        </Box>
        {languages.map((lang) => {
          const isSupported = SUPPORTED_LOCALES.includes(lang.code);
          return (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              selected={lang.code === locale}
              disabled={!isSupported}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': { bgcolor: '#FDF6EC' },
                '&.Mui-selected': { bgcolor: '#FFF0EC', '&:hover': { bgcolor: '#FFE8E0' } },
                '&.Mui-disabled': { opacity: 0.55 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#3D2B1F', mb: 0.2 }}>
                    {lang.nativeName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A' }}>
                    {lang.name}
                  </Typography>
                </Box>
                {lang.code === locale && (
                  <CheckIcon sx={{ fontSize: 18, color: '#C1440E', ml: 2 }} />
                )}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
