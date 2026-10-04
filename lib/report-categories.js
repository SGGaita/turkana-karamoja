/** Suggested categories for report submission (partners can add custom ones too). */
export const SUGGESTED_REPORT_CATEGORIES = [
  'SITREP',
  'Assessment',
  'HAP',
  'Monitoring',
  'WASH',
  'Livelihoods',
  'Food Security',
  'Nutrition',
  'Health',
  'Early Warning',
  'Climate',
  'Displacement',
  'Other',
];

export function normalizeCategory(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function mergeCategorySuggestions(existingCategories = []) {
  const seen = new Set();
  const merged = [];
  [...existingCategories, ...SUGGESTED_REPORT_CATEGORIES].forEach((word) => {
    const key = normalizeCategory(word).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(normalizeCategory(word));
  });
  return merged.sort((a, b) => a.localeCompare(b));
}
