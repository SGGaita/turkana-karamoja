import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  VALIDITY_MODES, VALIDITY_PERIOD_PRESETS, formatAdvisoryValidity,
} from '../lib/advisory-validity';

export default function AdvisoryValidityField({
  value,
  onChange,
  disabled,
  inputSx,
}) {
  const set = (patch) => onChange({ ...value, ...patch });
  const preview = formatAdvisoryValidity(value);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>
        Validity period *
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 1.5, lineHeight: 1.5 }}>
        When does this advisory apply? Pick an end date, a date range, or a duration so communities know how long to act.
      </Typography>

      <FormControl size="small" sx={{ ...inputSx, mb: 2, width: '100%', maxWidth: 360 }} disabled={disabled}>
        <InputLabel>Validity type *</InputLabel>
        <Select
          value={value.mode}
          label="Validity type *"
          onChange={(e) => set({ mode: e.target.value })}
        >
          {VALIDITY_MODES.map((m) => (
            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {value.mode === 'until' && (
        <TextField
          label="Valid until *"
          type="date"
          size="small"
          disabled={disabled}
          value={value.untilDate}
          onChange={(e) => set({ untilDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: new Date().toISOString().slice(0, 10) }}
          sx={{ ...inputSx, width: '100%', maxWidth: 280 }}
        />
      )}

      {value.mode === 'range' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Valid from *"
            type="date"
            size="small"
            disabled={disabled}
            value={value.fromDate}
            onChange={(e) => set({ fromDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ ...inputSx, flex: '1 1 200px' }}
          />
          <TextField
            label="Valid until *"
            type="date"
            size="small"
            disabled={disabled}
            value={value.toDate}
            onChange={(e) => set({ toDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: value.fromDate || new Date().toISOString().slice(0, 10) }}
            sx={{ ...inputSx, flex: '1 1 200px' }}
          />
        </Box>
      )}

      {value.mode === 'period' && (
        <Box>
          <FormControl size="small" sx={{ ...inputSx, mb: value.periodPreset === 'custom' ? 2 : 0, width: '100%', maxWidth: 400 }} disabled={disabled}>
            <InputLabel>Period *</InputLabel>
            <Select
              value={value.periodPreset}
              label="Period *"
              onChange={(e) => set({ periodPreset: e.target.value })}
            >
              {VALIDITY_PERIOD_PRESETS.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {value.periodPreset === 'custom' && (
            <TextField
              label="Describe the period *"
              size="small"
              fullWidth
              disabled={disabled}
              value={value.periodCustom}
              onChange={(e) => set({ periodCustom: e.target.value })}
              placeholder="e.g. Until rains resume in May 2026"
              sx={{ ...inputSx, maxWidth: 480 }}
            />
          )}
        </Box>
      )}

      {preview && (
        <Typography sx={{ fontSize: '0.72rem', color: '#2E7BB4', mt: 1.5, fontWeight: 600 }}>
          Will display as: {preview}
        </Typography>
      )}
    </Box>
  );
}
