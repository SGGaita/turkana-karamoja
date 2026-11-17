import { useState } from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';
import { canOptimize } from '../lib/image-hosts';

/**
 * A picture that fills its box, sent at the size the screen needs (WebP/AVIF through Next's image optimiser) instead
 * of the original upload: CMS pictures are often 1–3 MB PNGs, and WordPress's "large" size is the original when the
 * upload is already ~1024 px (17 Nov 2026: 7.5 MB of initiative pictures on Home). Pictures from other hosts, and any
 * the optimiser can't serve, load as they are.
 *
 * `sizes` says how wide it shows (e.g. "(min-width: 900px) 33vw, 100vw"); `sx` styles the box (give it a height);
 * `imgSx` the picture (objectFit, objectPosition, opacity…). `priority` for the first big picture on a page.
 */
export default function Picture({ src, alt = '', sizes = '100vw', priority = false, sx, imgSx, component = 'div' }) {
  const [plain, setPlain] = useState(false);
  if (!src) return null;
  const optimize = !plain && canOptimize(src);
  return (
    <Box component={component} sx={{ position: 'relative', overflow: 'hidden', ...sx }}>
      <Box
        component={Image}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={!optimize}
        onError={() => setPlain(true)}
        sx={{ objectFit: 'cover', ...imgSx }}
      />
    </Box>
  );
}
