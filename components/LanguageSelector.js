import { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'tu', name: 'Turkana', nativeName: 'Ng\'aturkana' },
  { code: 'pk', name: 'Pokot', nativeName: 'Pokoot' },
  { code: 'ng', name: 'Ngakaramojong', nativeName: 'Nga\'Karamojong' },
];

export default function LanguageSelector() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    handleClose();
    // TODO: Implement actual language switching logic
    console.log('Language selected:', langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        sx={{
          color: '#9A9A9A',
          fontSize: '0.75rem',
          textTransform: 'none',
          '&:hover': { color: '#D4A96A', bgcolor: 'transparent' },
          minWidth: 'auto',
          px: 1,
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
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            selected={lang.code === selectedLanguage}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': { bgcolor: '#FDF6EC' },
              '&.Mui-selected': { bgcolor: '#FFF0EC', '&:hover': { bgcolor: '#FFE8E0' } },
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
              {lang.code === selectedLanguage && (
                <CheckIcon sx={{ fontSize: 18, color: '#C1440E', ml: 2 }} />
              )}
            </Box>
          </MenuItem>
        ))}
        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E8E0D5', bgcolor: '#FDF6EC' }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', lineHeight: 1.5 }}>
            Translation feature coming soon. Currently showing English content.
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
}
