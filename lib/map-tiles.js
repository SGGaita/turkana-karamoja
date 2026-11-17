const CARTO_TILE_BASE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export function getCartoTileUrl() {
  const key = process.env.NEXT_PUBLIC_CARTO_API_KEY;
  if (!key) return CARTO_TILE_BASE;
  return `${CARTO_TILE_BASE}?key=${encodeURIComponent(key)}`;
}

/** For the box around a map: the map credits' links are underlined, not told apart by colour only (WCAG 1.4.1). */
export const MAP_SX = { '& .leaflet-control-attribution a': { textDecoration: 'underline' } };
