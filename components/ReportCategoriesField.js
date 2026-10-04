import { Box, Typography, TextField, Autocomplete } from '@mui/material';
import { mergeCategorySuggestions, normalizeCategory } from '../lib/report-categories';

/** Single-select category picker: the backend only stores one category per report,
 *  so this deliberately only allows choosing (or typing) one — pick a suggestion or
 *  type your own, and it commits on select or on blur. */
export default function ReportCategoriesField({
  value = [],
  onChange,
  disabled,
  inputSx,
  suggestions = [],
  title = 'Report Category *',
  hint = 'Choose the category that best describes this report — pick a suggestion or type your own.',
}) {
  const options = mergeCategorySuggestions(suggestions);
  const current = value[0] || null;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 1.5, lineHeight: 1.5 }}>
        {hint}
      </Typography>

      <Autocomplete
        freeSolo
        autoSelect
        disabled={disabled}
        options={options}
        value={current}
        onChange={(_, newValue) => {
          const category = normalizeCategory(newValue);
          onChange(category ? [category] : []);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Pick a suggestion or type your own"
            sx={inputSx}
          />
        )}
      />
    </Box>
  );
}
