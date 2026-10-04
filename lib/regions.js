/** Canonical geographic coverage for the Karamoja platform. */

export const REGIONS_KENYA = 'Turkana and North Pokot';
export const REGIONS_UGANDA = 'Moroto, Amudat and Napak';
export const REGIONS_KENYA_DETAIL =
  'Turkana County (Lokiriama and Loima Sub-Counties) and West Pokot County (Pokot North Sub-County)';
export const REGIONS_UGANDA_DETAIL = 'Moroto, Amudat, and Napak Districts';
export const REGIONS_COVERAGE_DETAIL = `${REGIONS_KENYA_DETAIL}, Kenya; and ${REGIONS_UGANDA_DETAIL}, Uganda`;
export const COVERAGE_SUMMARY = REGIONS_COVERAGE_DETAIL;

export const PLATFORM_COVERAGE_SENTENCE =
  `pastoral and agropastoral communities across ${COVERAGE_SUMMARY}`;

export function platformCoverageIntro(appFullName) {
  return `${appFullName} is a public-facing web platform that delivers early warnings, climate reports, community services, and partner information to ${PLATFORM_COVERAGE_SENTENCE}.`;
}

export const COVERAGE_NARRATIVE =
  `${REGIONS_COVERAGE_DETAIL} — pastoral communities linked across the Kenya–Uganda frontier.`;

export const COVERAGE_MAP_LEGEND =
  'Kenya: Turkana (1), North Pokot (2) · Uganda: Moroto (3), Napak (4), Amudat (5)';

export const HERO_COVERAGE_SUB = `${REGIONS_KENYA} (Kenya) · ${REGIONS_UGANDA} (Uganda)`;

export const GEO_COVERAGE_HTML = `
    <p><strong>Kenya</strong> — ${REGIONS_KENYA_DETAIL}</p>
    <p><strong>Uganda</strong> — ${REGIONS_UGANDA_DETAIL}</p>
  `.trim();

export const FOOTER_REGIONS = [
  'Turkana (Kenya)',
  'North Pokot (Kenya)',
  'Moroto (Uganda)',
  'Amudat (Uganda)',
  'Napak (Uganda)',
];

export const ADVISORY_REGION_OPTIONS = [
  'Both - full cluster coverage',
  'Turkana (Kenya)',
  'North Pokot (Kenya)',
  'Moroto (Uganda)',
  'Amudat (Uganda)',
  'Napak (Uganda)',
];

/** Country → region options for Community page admin and grouping. */
export const COMMUNITY_COUNTRY_REGIONS = {
  Kenya: ['Turkana', 'North Pokot'],
  Uganda: ['Moroto', 'Amudat', 'Napak'],
};

export const COMMUNITY_COUNTRIES = Object.keys(COMMUNITY_COUNTRY_REGIONS);

/**
 * Group flat community items into country → region → items for display.
 * Items without a country appear under the cluster-wide group.
 */
export function groupCommunityByCountryRegion(items, { countryKey = 'country', regionKey = 'region' } = {}) {
  const clusterWide = [];
  const countryMap = new Map();

  (items || []).forEach((item) => {
    const country = (item[countryKey] || '').trim();
    const region = (item[regionKey] || '').trim();

    if (!country) {
      clusterWide.push(item);
      return;
    }

    if (!countryMap.has(country)) {
      countryMap.set(country, new Map());
    }
    const regionMap = countryMap.get(country);
    const regionKeyName = region || 'General';
    if (!regionMap.has(regionKeyName)) {
      regionMap.set(regionKeyName, []);
    }
    regionMap.get(regionKeyName).push(item);
  });

  const grouped = COMMUNITY_COUNTRIES.filter((country) => countryMap.has(country)).map((country) => ({
    country,
    regions: COMMUNITY_COUNTRY_REGIONS[country]
      .filter((region) => countryMap.get(country).has(region))
      .map((region) => ({
        region,
        items: countryMap.get(country).get(region),
      }))
      .concat(
        [...countryMap.get(country).entries()]
          .filter(([region]) => !COMMUNITY_COUNTRY_REGIONS[country].includes(region))
          .map(([region, regionItems]) => ({ region, items: regionItems })),
      ),
  }));

  return { clusterWide, grouped };
}
