import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkIcon from '@mui/icons-material/Link';
import { useT } from '../contexts/LanguageContext';

function buildShareUrl(path, origin) {
  const base = (origin || '').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export default function ShareLinks({ title, path, size = 'small' }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleShare = (platform, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (typeof window === 'undefined') return;
    const url = buildShareUrl(path, window.location.origin);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title || '');

    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    };

    if (links[platform]) {
      window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  const handleCopy = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (typeof window === 'undefined') return;
    const url = buildShareUrl(path, window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('share.copy'), url);
    }
  };

  const iconSx = size === 'small'
    ? { width: 32, height: 32, border: '1px solid #E8E0D5', color: '#5A5A5A' }
    : { width: 36, height: 36, border: '1px solid #E8E0D5', color: '#5A5A5A' };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', fontWeight: 600, mr: 0.5 }}>
        {t('share.label')}
      </Typography>
      <Tooltip title={t('share.facebook')}>
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('facebook', e)} aria-label={t('share.facebook')}>
          <FacebookIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('share.x')}>
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('twitter', e)} aria-label={t('share.x')}>
          <XIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('share.linkedin')}>
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('linkedin', e)} aria-label={t('share.linkedin')}>
          <LinkedInIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('share.whatsapp')}>
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('whatsapp', e)} aria-label={t('share.whatsapp')}>
          <WhatsAppIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={copied ? t('share.copied') : t('share.copy')}>
        <IconButton size="small" sx={iconSx} onClick={handleCopy} aria-label={t('share.copy')}>
          <LinkIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
