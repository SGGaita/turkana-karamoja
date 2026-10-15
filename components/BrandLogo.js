import { useEffect, useState } from 'react';
import Image from 'next/image';
import { APP_LOGO_URL } from '../lib/branding';

/**
 * Site logo that never renders blank.
 * Always paints the logo bundled with the site first (fast, from the CDN). If the CMS
 * supplies a different logo, it is preloaded in the background and swapped in only once
 * it has fully downloaded; if it fails to load, the bundled logo simply stays.
 */
export default function BrandLogo({ src, alt = '', width = 300, height = 76, priority = false, style }) {
  const [displaySrc, setDisplaySrc] = useState(APP_LOGO_URL);

  useEffect(() => {
    if (!src || src === APP_LOGO_URL) {
      setDisplaySrc(APP_LOGO_URL);
      return undefined;
    }
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => { if (!cancelled) setDisplaySrc(src); };
    img.onerror = () => { if (!cancelled) setDisplaySrc(APP_LOGO_URL); };
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      onError={() => setDisplaySrc(APP_LOGO_URL)}
      style={{ width: 'auto', height: '100%', objectFit: 'contain', ...style }}
    />
  );
}
