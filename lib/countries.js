/** Countries a report can apply to — coverage: Turkana & North Pokot (Kenya), Moroto, Amudat & Napak (Uganda). */

export const HUB_COUNTRIES = [
  { code: 'KE', label: 'Kenya' },
  { code: 'UG', label: 'Uganda' },
  { code: 'CROSS', label: 'Cross-border / Regional' },
];

export function getCountryLabel(code) {
  const found = HUB_COUNTRIES.find((c) => c.code === code);
  return found ? found.label : code;
}
