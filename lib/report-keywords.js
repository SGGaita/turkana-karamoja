/** Suggested keywords for report tagging (partners can add custom tags too). */
export const SUGGESTED_REPORT_KEYWORDS = [
  'Drought',
  'Flood',
  'Food security',
  'WASH',
  'Livestock',
  'Pastoral',
  'Rainfall',
  'Nutrition',
  'Displacement',
  'Livelihoods',
  'Climate',
  'Early warning',
  'Cross-border',
  'Turkana',
  'Karamoja',
  'Humanitarian',
  'Assessment',
  'Monitoring',
  'Health',
  'Water',
];

export function normalizeKeyword(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function mergeKeywordSuggestions(existingKeywords = []) {
  const seen = new Set();
  const merged = [];
  [...existingKeywords, ...SUGGESTED_REPORT_KEYWORDS].forEach((word) => {
    const key = normalizeKeyword(word).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(normalizeKeyword(word));
  });
  return merged.sort((a, b) => a.localeCompare(b));
}
