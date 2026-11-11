/**
 * Coverage areas from Karamoja Core (karamoja/v1/areas) for the website's coverage map. Pure functions:
 * tests/cms-areas.test.mjs.
 */
import { cmsGet } from './cms';

const str = (v) => (typeof v === 'string' ? v : '');
const GEOMETRY = ['Polygon', 'MultiPolygon', 'Feature', 'FeatureCollection'];

/** Colours per country, darker for each further area (the map's old palette). */
const PALETTE = {
  KE: ['#C1440E', '#8B4513', '#D2691E'],
  UG: ['#6B4226', '#A0522D', '#5C3D2E', '#8B6F47'],
  '': ['#2E7BB4', '#5A5A5A'],
};

/** Areas in the map's shape: id, number, name, country, colour, centre, outline. Areas without an outline are dropped. */
export function areasFromCms(list) {
  const seen = {};
  return (Array.isArray(list) ? list : [])
    .filter((a) => a && str(a.slug) && str(a.name) && a.outline && GEOMETRY.includes(a.outline.type))
    .map((a, i) => {
      const country = ['KE', 'UG'].includes(a.country) ? a.country : '';
      const n = seen[country] || 0;
      seen[country] = n + 1;
      const palette = PALETTE[country];
      const lat = Number(a.centre?.lat);
      const lng = Number(a.centre?.lng);
      return {
        id: str(a.slug),
        number: Number(a.number) > 0 ? Number(a.number) : i + 1,
        name: str(a.name),
        country,
        color: palette[n % palette.length],
        centre: Number.isFinite(lat) && Number.isFinite(lng) && a.centre ? [lat, lng] : null,
        outline: a.outline,
      };
    });
}

/** The areas grouped by country, for the cards and the legend. */
export function areasByCountry(areas) {
  const groups = [];
  (areas || []).forEach((a) => {
    let g = groups.find((x) => x.country === a.country);
    if (!g) {
      g = { country: a.country, color: a.color, areas: [] };
      groups.push(g);
    }
    g.areas.push(a);
  });
  return groups;
}

/** The areas shown on the coverage map, or null (Core not reachable / none set up: the website's own map stays). */
export async function getCoverageAreas(opts) {
  try {
    const areas = areasFromCms(await cmsGet('/areas', {}, opts));
    return areas.length ? areas : null;
  } catch {
    return null;
  }
}
