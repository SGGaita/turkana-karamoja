import { REGIONS_KENYA_DETAIL, REGIONS_UGANDA_DETAIL } from './regions';

export const COVERAGE_COUNTRIES = [
  {
    id: 'kenya',
    name: 'Kenya',
    areas: REGIONS_KENYA_DETAIL,
    color: '#C1440E',
  },
  {
    id: 'uganda',
    name: 'Uganda',
    areas: REGIONS_UGANDA_DETAIL,
    color: '#6B4226',
  },
];

export const MAP_LEGEND = [
  {
    country: 'Kenya',
    areas: 'Turkana & North Pokot',
    numbers: [1, 2],
    color: '#C1440E',
  },
  {
    country: 'Uganda',
    areas: 'Moroto, Napak & Amudat',
    numbers: [3, 4, 5],
    color: '#6B4226',
  },
];

export const CLUSTER_REGIONS = [
  {
    id: 'turkana',
    number: 1,
    name: 'Turkana, Kenya',
    color: '#C1440E',
    fill: '#C1440E',
    source: 'ken',
    shapeName: 'Turkana',
  },
  {
    id: 'north-pokot',
    number: 2,
    name: 'North Pokot, Kenya',
    color: '#8B4513',
    fill: '#8B4513',
    source: 'ken',
    shapeName: 'West Pokot',
  },
  {
    id: 'moroto',
    number: 3,
    name: 'Moroto District, Uganda',
    color: '#6B4226',
    fill: '#6B4226',
    source: 'uga',
    shapeNames: ['Moroto', 'Matheniko'],
  },
  {
    id: 'napak',
    number: 4,
    name: 'Napak District, Uganda',
    color: '#A0522D',
    fill: '#A0522D',
    source: 'uga',
    shapeNames: ['Bokora', 'Pian'],
  },
  {
    id: 'amudat',
    number: 5,
    name: 'Amudat District, Uganda',
    color: '#5C3D2E',
    fill: '#5C3D2E',
    source: 'uga',
    shapeNames: ['Pokot', 'Chekwii'],
  },
];

export function getRegionShapeNames(region) {
  return region.shapeNames || [region.shapeName];
}

/** @deprecated use COVERAGE_COUNTRIES */
export const COVERAGE_AREAS = COVERAGE_COUNTRIES;

export const CLUSTER_MAP_CENTER = [2.4, 34.8];
export const CLUSTER_MAP_ZOOM = 7;
