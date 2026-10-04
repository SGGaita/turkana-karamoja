import { useState } from 'react';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

function PlaceholderContent({ pathHint }) {
  return (
    <Box sx={{ textAlign: 'center', px: 3, py: 4, maxWidth: 420 }}>
      <ImageOutlinedIcon sx={{ fontSize: 48, color: '#C1440E66', mb: 1.5 }} />
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#3D2B1F', mb: 0.5 }}>
        Image placeholder
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', lineHeight: 1.5 }}>
        Add screenshot to{' '}
        <Box component="code" sx={{ fontSize: '0.75rem', color: '#C1440E', bgcolor: '#FFF8F3', px: 0.5, borderRadius: 0.5 }}>
          {pathHint}
        </Box>
      </Typography>
    </Box>
  );
}

/**
 * Renders a documentation screenshot or an editable placeholder.
 * Drop a file at the suggested public path — it appears automatically.
 */
export default function DocImagePlaceholder({
  src,
  suggestedPath,
  alt,
  caption,
  hint,
  aspectRatio = '16/9',
  natural = false,
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const pathHint = suggestedPath || (src ? `public${src}` : 'public/docs/images/…');
  const showPlaceholder = !src || loadFailed;
  const useNaturalFit = natural && !showPlaceholder;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          ...(useNaturalFit ? {} : { aspectRatio }),
          borderRadius: 2,
          overflow: 'hidden',
          border: showPlaceholder ? '2px dashed #C1440E55' : '1px solid #E8E0D5',
          bgcolor: showPlaceholder ? '#FFF8F3' : '#FDF6EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showPlaceholder ? (
          <PlaceholderContent pathHint={pathHint} />
        ) : useNaturalFit ? (
          <Image
            src={src}
            alt={alt || caption || 'Documentation illustration'}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 900px"
            quality={100}
            unoptimized
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onError={() => setLoadFailed(true)}
          />
        ) : (
          <Image
            src={src}
            alt={alt || caption || 'Documentation illustration'}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ objectFit: 'contain', background: '#FDF6EC' }}
            onError={() => setLoadFailed(true)}
          />
        )}
      </Box>

      {caption && (
        <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', mt: 1, lineHeight: 1.6, fontStyle: 'italic' }}>
          {caption}
        </Typography>
      )}

      {showPlaceholder && hint && (
        <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mt: 0.5, lineHeight: 1.5 }}>
          Suggested capture: {hint}
        </Typography>
      )}
    </Box>
  );
}
