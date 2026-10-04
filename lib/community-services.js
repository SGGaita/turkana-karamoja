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

export const WATER_POINT_STATUS = {
  functional: { label: 'Functional', color: '#2E8B57' },
  partial: { label: 'Partial', color: '#E87010' },
  non_functional: { label: 'Non-functional', color: '#D63030' },
  trucking: { label: 'Water trucking', color: '#2E7BB4' },
};

export const WATER_POINT_TYPES = {
  borehole: 'Borehole',
  pan: 'Pan',
  dam: 'Dam',
  water_trucking: 'Water trucking',
};

export const ASSISTANCE_SITE_TYPES = {
  food_distribution: 'Food distribution',
  nfi: 'NFI distribution',
  cash_transfer: 'Cash transfer',
  registration: 'Registration',
};

export const PLANTING_STATUS = {
  optimal: { label: 'Optimal window', color: '#2E8B57' },
  caution: { label: 'Plant with caution', color: '#E87010' },
  closed: { label: 'Window closed', color: '#9A9A9A' },
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
