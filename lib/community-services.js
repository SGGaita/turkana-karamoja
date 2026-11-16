export const HEALTH_ADVISORY_TYPES = [
  'Disease Outbreak Alert',
  'Food Security Update',
];

export const HEALTH_KEYWORDS = [
  'health',
  'nutrition',
  'malnutrition',
  'disease',
  'vaccination',
  'outbreak',
  'sam',
  'mam',
  'therapeutic',
  'cholera',
  'measles',
  'respiratory',
];

export function isHealthAlert(alert) {
  const type = (alert?.advisoryType || '').toLowerCase();
  if (HEALTH_ADVISORY_TYPES.some((t) => type === t.toLowerCase())) {
    return true;
  }
  const haystack = [
    alert?.title,
    alert?.body,
    ...(alert?.keywords || []),
    alert?.advisoryType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return HEALTH_KEYWORDS.some((kw) => haystack.includes(kw));
}

// Names come from Karamoja → Site settings → Lists (useVocabLabel); only the colours are fixed here (design).
export const WATER_POINT_STATUS_COLORS = {
  functional: '#2E8B57',
  partial: '#E87010',
  non_functional: '#D63030',
  trucking: '#2E7BB4',
};

export const PLANTING_STATUS_COLORS = {
  optimal: '#2E8B57',
  caution: '#E87010',
  closed: '#9A9A9A',
};

export function countByStatus(items, statusKey = 'status') {
  return items.reduce((acc, item) => {
    const key = item[statusKey] || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function formatDateRange(start, end) {
  if (!start && !end) return '—';
  const fmt = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start || end);
}
