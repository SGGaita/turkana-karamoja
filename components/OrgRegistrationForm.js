import { useState } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Autocomplete,
} from '@mui/material';
import { registerOrganization, getWpBaseUrl } from '../lib/wordpress';
import { saveOrgSession } from '../lib/org-session';

const ORG_TYPE_OPTIONS = [
  'Met Agency',
  'Government',
  'UN Agency',
  'Regional Body',
  'Research',
  'NGO',
  'Partner',
  'CBO',
  'Donor',
  'Private Sector',
  'Academic Institution',
];

const countries = [
  { code: 'KE', label: 'Kenya' },
  { code: 'UG', label: 'Uganda' },
  { code: 'INT', label: 'International' },
];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'white',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A96A' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7BB4' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2E7BB4' },
};

/** Public organisation-registration form. No login required — this is how a new
 *  partner organisation gets into the review queue in the first place. */
export default function OrgRegistrationForm({ defaultEmail = '', onRegistered, onNotify, title = 'Organisation Registration' }) {
  const [form, setForm] = useState({
    name: '', abbr: '', type: '', country: 'KE', contactName: '', contactEmail: defaultEmail, contactPhone: '', description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const wpConfigured = Boolean(getWpBaseUrl());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orgType = (form.type || '').trim();
    if (!orgType) {
      onNotify?.('Please select or enter an organisation type.', 'error');
      return;
    }
    setSubmitting(true);

    if (!wpConfigured) {
      setTimeout(() => {
        const record = {
          id: Date.now(),
          reference: `DEMO-ORG-${Date.now().toString().slice(-6)}`,
          name: form.name,
          status: 'approved',
          approved: true,
          contactEmail: form.contactEmail,
        };
        saveOrgSession(record);
        onNotify?.(`Organisation registered (demo). Reference: ${record.reference}. You can now sign in and submit content.`);
        setSubmitting(false);
        onRegistered?.(form.contactEmail);
      }, 1200);
      return;
    }

    try {
      const result = await registerOrganization({ ...form, type: orgType });
      onNotify?.(result.message || `Registration received. Reference: ${result.reference}`);
      onRegistered?.(form.contactEmail);
    } catch (err) {
      onNotify?.(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}>
      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2B1F', mb: 1 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mb: 3 }}>
        Government agencies, UN bodies, NGOs, and research institutions must register before publishing content. Your application will be reviewed by platform administrators.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <TextField label="Organisation Name *" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} sx={{ ...inputSx, flex: '1 1 280px' }} size="small" />
        <TextField label="Abbreviation" placeholder="e.g. KMD, OCHA" value={form.abbr} onChange={(e) => setForm((f) => ({ ...f, abbr: e.target.value }))} sx={{ ...inputSx, flex: '1 1 120px' }} size="small" />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <Autocomplete
          freeSolo
          options={ORG_TYPE_OPTIONS}
          value={form.type}
          onChange={(_, value) => setForm((f) => ({ ...f, type: value || '' }))}
          onInputChange={(_, value) => setForm((f) => ({ ...f, type: value || '' }))}
          sx={{ flex: '1 1 200px', minWidth: 200 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Organisation Type *"
              required
              size="small"
              sx={inputSx}
              helperText="Choose a type or type your own"
              inputProps={{
                ...params.inputProps,
                maxLength: 80,
              }}
            />
          )}
        />
        <FormControl sx={{ flex: '1 1 160px', ...inputSx }} size="small" required>
          <InputLabel>Country *</InputLabel>
          <Select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} label="Country *">
            {countries.map((c) => <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <TextField label="Contact Name *" required value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} sx={{ ...inputSx, flex: '1 1 200px' }} size="small" />
        <TextField label="Contact Email *" type="email" required value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} sx={{ ...inputSx, flex: '1 1 200px' }} size="small" helperText="Must match your editor login email" />
        <TextField label="Contact Phone" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} sx={{ ...inputSx, flex: '1 1 160px' }} size="small" />
      </Box>

      <TextField label="Brief Description" multiline rows={3} fullWidth value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} sx={{ ...inputSx, mb: 3 }} size="small" placeholder="What type of content will your organisation publish?" />

      <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ bgcolor: '#C1440E', py: 1.5, '&:hover': { bgcolor: '#E8622A' } }}>
        {submitting ? 'Submitting…' : 'Submit Registration Application'}
      </Button>
    </Box>
  );
}
