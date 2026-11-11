import { describe, it, expect } from 'vitest';
import { areasFromCms, areasByCountry } from '../lib/cms-areas';

const square = { type: 'Polygon', coordinates: [[[35.5, 3], [35.7, 3], [35.7, 3.2], [35.5, 3]]] };

describe('coverage areas', () => {
  it('maps areas with outlines, colours per country and numbers', () => {
    const areas = areasFromCms([
      { slug: 'turkana', name: 'Turkana', country: 'KE', number: 1, centre: { lat: 3.1, lng: 35.3 }, outline: square },
      { slug: 'north-pokot', name: 'North Pokot', country: 'KE', number: 2, centre: null, outline: square },
      { slug: 'moroto', name: 'Moroto', country: 'UG', number: 0, outline: square },
      { slug: 'no-outline', name: 'Loima', country: 'KE', outline: null },
      { slug: 'bad', name: 'Bad', outline: { type: 'Point', coordinates: [1, 2] } },
    ]);
    expect(areas.map((a) => a.id)).toEqual(['turkana', 'north-pokot', 'moroto']);
    expect(areas[0]).toMatchObject({ number: 1, country: 'KE', color: '#C1440E', centre: [3.1, 35.3] });
    expect(areas[1]).toMatchObject({ color: '#8B4513', centre: null });
    expect(areas[2]).toMatchObject({ number: 3, color: '#6B4226' });
  });

  it('groups by country in map order', () => {
    const groups = areasByCountry(areasFromCms([
      { slug: 'a', name: 'A', country: 'KE', outline: square },
      { slug: 'b', name: 'B', country: 'UG', outline: square },
      { slug: 'c', name: 'C', country: 'KE', outline: square },
    ]));
    expect(groups.map((g) => [g.country, g.areas.map((a) => a.id)])).toEqual([['KE', ['a', 'c']], ['UG', ['b']]]);
  });

  it('copes with nothing', () => {
    expect(areasFromCms(null)).toEqual([]);
  });
});
