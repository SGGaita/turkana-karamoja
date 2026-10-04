import { useState } from 'react';
import {
  Box, Typography, TextField, Chip, Autocomplete,
} from '@mui/material';
import { mergeKeywordSuggestions, normalizeKeyword } from '../lib/report-keywords';

const MAX_KEYWORDS = 12;

export default function ReportKeywordsField({
  value = [],
  onChange,
  disabled,
  inputSx,
  suggestions = [],
  title = 'Keywords / tags',
  hint = 'Add topics that help people find this report — e.g. drought, food security, Turkana. Press Enter after each tag.',
}) {
  const [inputValue, setInputValue] = useState('');
  const options = mergeKeywordSuggestions(suggestions);

  const addKeyword = (raw) => {
    const keyword = normalizeKeyword(raw);
    if (!keyword) return;
    const exists = value.some((k) => k.toLowerCase() === keyword.toLowerCase());
    if (exists || value.length >= MAX_KEYWORDS) return;
    onChange([...value, keyword]);
    setInputValue('');
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 1.5, lineHeight: 1.5 }}>
        {hint}
      </Typography>

      <Autocomplete
        multiple
        freeSolo
        disabled={disabled}
        options={options}
        value={value}
        inputValue={inputValue}
        onInputChange={(_, newInput) => setInputValue(newInput)}
        onChange={(_, newValue) => {
          const normalized = [];
          newValue.forEach((item) => {
            const keyword = normalizeKeyword(item);
            if (!keyword) return;
            if (normalized.some((k) => k.toLowerCase() === keyword.toLowerCase())) return;
            normalized.push(keyword);
          });
          onChange(normalized.slice(0, MAX_KEYWORDS));
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              label={option}
              size="small"
              sx={{ bgcolor: '#F0F8FF', color: '#2E7BB4', fontWeight: 600, fontSize: '0.72rem' }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={value.length ? 'Add another keyword…' : 'Type a keyword and press Enter'}
            sx={inputSx}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault();
                addKeyword(inputValue);
              }
            }}
          />
        )}
      />
      <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mt: 0.8 }}>
        Up to {MAX_KEYWORDS} keywords · choose from suggestions or type your own
      </Typography>
    </Box>
  );
}
