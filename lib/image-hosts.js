// Hosts the image optimiser may fetch from (next.config.js `images.remotePatterns`, passed in at build time).
const OPTIMIZED_HOSTS = String(process.env.KC_IMAGE_HOSTS || '').split(',').filter(Boolean);

/** Whether Next's image optimiser can serve this address (same site, or a host it is allowed to fetch). */
export function canOptimize(src, hosts = OPTIMIZED_HOSTS) {
  if (!src) return false;
  if (String(src).startsWith('/') && !String(src).startsWith('//')) return true;
  try {
    return hosts.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}
