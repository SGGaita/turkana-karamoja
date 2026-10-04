import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkIcon from '@mui/icons-material/Link';

function buildShareUrl(path, origin) {
  const base = (origin || '').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export default function ShareLinks({ title, path, size = 'small' }) {
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
      window.prompt('Copy this link:', url);
    }
  };

  const iconSx = size === 'small'
    ? { width: 32, height: 32, border: '1px solid #E8E0D5', color: '#5A5A5A' }
    : { width: 36, height: 36, border: '1px solid #E8E0D5', color: '#5A5A5A' };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', fontWeight: 600, mr: 0.5 }}>
        Share
      </Typography>
      <Tooltip title="Share on Facebook">
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('facebook', e)} aria-label="Share on Facebook">
          <FacebookIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share on X">
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('twitter', e)} aria-label="Share on X">
          <XIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share on LinkedIn">
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('linkedin', e)} aria-label="Share on LinkedIn">
          <LinkedInIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share on WhatsApp">
        <IconButton size="small" sx={iconSx} onClick={(e) => handleShare('whatsapp', e)} aria-label="Share on WhatsApp">
          <WhatsAppIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={copied ? 'Link copied!' : 'Copy link'}>
        <IconButton size="small" sx={iconSx} onClick={handleCopy} aria-label="Copy link">
          <LinkIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
