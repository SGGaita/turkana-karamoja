import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

import { DEFAULT_LANGUAGES } from '../lib/defaults';
import { localePath } from '../lib/locales';
import { useLanguage, useShell, useT } from '../contexts/LanguageContext';

/**
 * Language menu (FE-26): English and the languages marked ready in Karamoja → Site settings → Languages. Each entry
 * is a link to the same page in that language (/reports → /sw/reports); choosing one is remembered for the next visit.
 */
export default function LanguageSelector({ variant = 'default' }) {
  const { locale, setLocale } = useLanguage();
  const t = useT();
  const router = useRouter();
  const shell = useShell();
  const languages = shell?.languages?.length ? shell.languages : DEFAULT_LANGUAGES;
  const isCurrent = (lang) => lang.code === locale;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const choose = (event, code) => {
    // A normal click: navigate through the context (keeps the scroll position and remembers the choice).
    // Ctrl/Cmd-click or middle-click: let the link open the other language in a new tab.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();
    handleClose();
    setLocale(code);
  };

  const currentLanguage = languages.find(isCurrent) || languages[0];
  const isDrawer = variant === 'drawer';

  return (
    <Box>
      <Button
        onClick={handleClick}
        aria-label={`${t('language.select')}: ${currentLanguage?.nativeName || ''}`}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        aria-controls={open ? 'language-menu' : undefined}
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
        id="language-menu"
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
          <Typography sx={{ fontSize: '0.7rem', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            {t('language.select')}
          </Typography>
        </Box>
        {languages.map((lang) => {
          return (
            <MenuItem
              key={lang.code}
              // A plain link to the page in that language (not Next.js's Link: it prefetches on hover, before the
              // choice is saved, and middleware.js would then send the click back to the language being left).
              component="a"
              href={localePath(router.asPath, lang.code)}
              hrefLang={lang.htmlLang || lang.code}
              lang={lang.htmlLang || lang.code}
              onClick={(e) => choose(e, lang.code)}
              selected={isCurrent(lang)}
              aria-current={isCurrent(lang) ? 'true' : undefined}
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
                  {lang.name && lang.name !== lang.nativeName && (
                    <Typography sx={{ fontSize: '0.7rem', color: '#6B6B6B' }}>
                      {lang.name}
                    </Typography>
                  )}
                </Box>
                {isCurrent(lang) && (
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
