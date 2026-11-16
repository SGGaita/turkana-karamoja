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

/**
 * Country codes and names for filters: Site settings → Lists → Countries (key → name) when it has entries, else the
 * codes reports use with their English names.
 */
export function countryOptions(vocab) {
  const fromList = vocab && Object.keys(vocab).length ? Object.keys(vocab) : null;
  return {
    codes: fromList || HUB_COUNTRIES.map((c) => c.code),
    label: (code) => (vocab && vocab[code]) || getCountryLabel(code),
  };
}

/**
 * Report categories in the order of Site settings → Lists → Report categories (matched by key or name, any case), with
 * that list's names; categories not in the list follow, as they are.
 */
export function orderCategories(categories, vocab) {
  if (!vocab || !Object.keys(vocab).length) return categories;
  const order = Object.entries(vocab);
  const pos = (c) => order.findIndex(([k, l]) => k.toLowerCase() === String(c).toLowerCase() || l.toLowerCase() === String(c).toLowerCase());
  return [...categories].sort((a, b) => {
    const pa = pos(a);
    const pb = pos(b);
    return (pa < 0 ? 1e6 : pa) - (pb < 0 ? 1e6 : pb);
  });
}
