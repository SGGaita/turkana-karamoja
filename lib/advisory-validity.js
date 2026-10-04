export const VALIDITY_MODES = [
  { value: 'until', label: 'Valid until (single date)' },
  { value: 'range', label: 'Date range (from – until)' },
  { value: 'period', label: 'Period / duration' },
];

export const VALIDITY_PERIOD_PRESETS = [
  { value: '24h', label: 'Next 24 hours' },
  { value: '48h', label: 'Next 48 hours' },
  { value: '72h', label: 'Next 72 hours' },
  { value: '7d', label: 'Next 7 days' },
  { value: '14d', label: 'Next 14 days' },
  { value: '30d', label: 'Next 30 days' },
  { value: 'season', label: 'Until end of current season' },
  { value: 'ongoing', label: 'Ongoing — review when conditions change' },
  { value: 'custom', label: 'Custom (describe)' },
];

export const emptyAdvisoryValidity = () => ({
  mode: 'until',
  untilDate: '',
  fromDate: '',
  toDate: '',
  periodPreset: '48h',
  periodCustom: '',
});

function formatIsoDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatAdvisoryValidity(validity) {
  if (!validity) return '';

  if (validity.mode === 'until' && validity.untilDate) {
    return `Until ${formatIsoDate(validity.untilDate)}`;
  }

  if (validity.mode === 'range' && validity.fromDate && validity.toDate) {
    return `${formatIsoDate(validity.fromDate)} – ${formatIsoDate(validity.toDate)}`;
  }

  if (validity.mode === 'period') {
    if (validity.periodPreset === 'custom') {
      return (validity.periodCustom || '').trim();
    }
    const preset = VALIDITY_PERIOD_PRESETS.find((p) => p.value === validity.periodPreset);
    return preset?.label || '';
  }

  return '';
}

export function validateAdvisoryValidity(validity) {
  if (!validity) return 'Set when this advisory is valid.';

  if (validity.mode === 'until') {
    if (!validity.untilDate) return 'Choose a valid-until date.';
    return null;
  }

  if (validity.mode === 'range') {
    if (!validity.fromDate || !validity.toDate) return 'Choose both start and end dates.';
    if (validity.fromDate > validity.toDate) return 'End date must be on or after the start date.';
    return null;
  }

  if (validity.mode === 'period') {
    if (!validity.periodPreset) return 'Select a validity period.';
    if (validity.periodPreset === 'custom' && !(validity.periodCustom || '').trim()) {
      return 'Describe the custom validity period.';
    }
    return null;
  }

  return 'Set when this advisory is valid.';
}
