import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Autocomplete, Checkbox,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { submitAdvisory, getWpBaseUrl } from '../lib/wordpress';
import ReportDocumentsField from './ReportDocumentsField';
import ReportKeywordsField from './ReportKeywordsField';
import AdvisoryLocationPicker from './AdvisoryLocationPicker';
import { isRichTextEmpty } from './HubRichTextEditor';
import { ADVISORY_TARGET_GROUPS, SUGGESTED_ADVISORY_KEYWORDS } from '../lib/advisory-constants';
import { mergeKeywordSuggestions } from '../lib/report-keywords';
import AdvisoryValidityField from './AdvisoryValidityField';
import { emptyAdvisoryValidity, validateAdvisoryValidity } from '../lib/advisory-validity';
import { ADVISORY_REGION_OPTIONS } from '../lib/regions';

const HubRichTextEditor = dynamic(() => import('./HubRichTextEditor'), { ssr: false });

const checkboxIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkboxCheckedIcon = <CheckBoxIcon fontSize="small" />;

const advisoryTypes = [
  'Weather Forecast', 'Seasonal Climate Outlook', 'Flood Warning', 'Drought Advisory',
  'Locust Advisory', 'Disease Outbreak Alert', 'Situation Report (SITREP)',
  'Food Security Update', 'Humanitarian Bulletin', 'Other',
];

const alertLevels = [
  { val: 'red', label: 'RED - Severe / Extreme', color: '#D63030' },
  { val: 'orange', label: 'ORANGE - High', color: '#E87010' },
  { val: 'yellow', label: 'YELLOW - Moderate / Watch', color: '#B8860B' },
  { val: 'green', label: 'GREEN - Normal / Information', color: '#2E8B57' },
];

const regions = ADVISORY_REGION_OPTIONS;

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'white',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A96A' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7BB4' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2E7BB4' },
};

const emptyAdvisoryForm = () => ({
  contact: '',
  type: '',
  level: 'yellow',
  region: '',
  validity: emptyAdvisoryValidity(),
  title: '',
  situation: '',
  recommendedActions: '',
  targetGroups: [],
  keywords: [],
  documents: [{ id: 1, file: null, language: 'en' }],
  location: { lat: null, lng: null, label: '' },
});

export default function AdvisorySubmissionForm({ token, orgRecord, onNotify, onSubmitted }) {
  const [form, setForm] = useState(emptyAdvisoryForm);
  const [submitting, setSubmitting] = useState(false);
  const wpConfigured = Boolean(getWpBaseUrl());
  const isDemo = token?.startsWith('DEMO_JWT_TOKEN');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.region) {
      onNotify?.('Select the administrative area for this advisory.', 'warning');
      return;
    }
    if (form.location.lat == null || form.location.lng == null) {
      onNotify?.('Pin the affected location on the map.', 'warning');
      return;
    }
    if (!form.targetGroups.length) {
      onNotify?.('Select at least one target group.', 'warning');
      return;
    }
    if (isRichTextEmpty(form.situation)) {
      onNotify?.('Describe the situation — what is happening and who is affected.', 'warning');
      return;
    }
    if (isRichTextEmpty(form.recommendedActions)) {
      onNotify?.('Add recommended actions — use a bullet list so communities know exactly what to do.', 'warning');
      return;
    }
    const validityError = validateAdvisoryValidity(form.validity);
    if (validityError) {
      onNotify?.(validityError, 'warning');
      return;
    }

    setSubmitting(true);
    const payload = { ...form, org: orgRecord?.name, organizationId: orgRecord?.id };

    if (isDemo) {
      setTimeout(() => {
        onNotify?.(`Advisory submitted (demo)! Reference: DEMO-${Date.now().toString().slice(-6)}. Pending admin review.`);
        setForm(emptyAdvisoryForm());
        setSubmitting(false);
        onSubmitted?.();
      }, 1500);
      return;
    }

    if (!wpConfigured) {
      onNotify?.('WordPress is not configured.', 'warning');
      setSubmitting(false);
      return;
    }

    try {
      const result = await submitAdvisory(payload, token);
      onNotify?.(`Advisory submitted! Reference: WP-${result.id}. Pending admin review.`);
      setForm(emptyAdvisoryForm());
      onSubmitted?.();
    } catch (err) {
      onNotify?.(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}>
      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2B1F', mb: 1 }}>
        Advisory Submission
      </Typography>
      <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mb: 3, lineHeight: 1.55 }}>
        Early warnings must be specific and actionable — pin the location, name who should act, and list clear steps communities can take now.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <TextField label="Contact Name *" required value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} sx={{ ...inputSx, flex: '1 1 240px' }} size="small" />
        <FormControl sx={{ flex: '1 1 240px', ...inputSx }} size="small" required>
          <InputLabel>Advisory Type *</InputLabel>
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} label="Advisory Type *">
            {advisoryTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <FormControl sx={{ flex: '1 1 240px', ...inputSx }} size="small" required>
          <InputLabel>Alert Level *</InputLabel>
          <Select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} label="Alert Level *">
            {alertLevels.map((l) => (
              <MenuItem key={l.val} value={l.val}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                  {l.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <AdvisoryValidityField
        value={form.validity}
        onChange={(validity) => setForm((f) => ({ ...f, validity }))}
        inputSx={inputSx}
      />

      <AdvisoryLocationPicker
        location={form.location}
        region={form.region}
        regions={regions}
        inputSx={inputSx}
        onLocationChange={(location) => setForm((f) => ({ ...f, location }))}
        onRegionChange={(region) => setForm((f) => ({ ...f, region }))}
      />

      <Autocomplete
        multiple
        disableCloseOnSelect
        options={ADVISORY_TARGET_GROUPS}
        value={form.targetGroups}
        onChange={(_, targetGroups) => setForm((f) => ({ ...f, targetGroups }))}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox icon={checkboxIcon} checkedIcon={checkboxCheckedIcon} checked={selected} sx={{ mr: 1 }} />
            {option}
          </li>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option} label={option} size="small" sx={{ fontSize: '0.68rem' }} />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="Target groups *" size="small" sx={{ ...inputSx, mb: 2.5 }} placeholder="Who should act on this advisory?" />
        )}
        sx={{ mb: 2.5 }}
      />

      <TextField label="Advisory Title *" fullWidth required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} sx={{ ...inputSx, mb: 2.5 }} size="small" placeholder="Short, specific headline — e.g. Flash flood risk in Lodwar lowlands" />

      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>Situation *</Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 1, lineHeight: 1.5 }}>
        What is happening, where, and how severe? Be factual and specific.
      </Typography>
      <Box sx={{ mb: 2.5 }}>
        <HubRichTextEditor
          value={form.situation}
          onChange={(situation) => setForm((f) => ({ ...f, situation }))}
          placeholder="Describe the hazard, observed impacts, and timeframe…"
          minHeight={120}
        />
      </Box>

      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>Recommended actions *</Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 1, lineHeight: 1.5 }}>
        Use a bullet list — each item should be a clear, actionable step (e.g. &quot;Move livestock to higher ground before nightfall&quot;).
      </Typography>
      <Box sx={{ mb: 2.5 }}>
        <HubRichTextEditor
          value={form.recommendedActions}
          onChange={(recommendedActions) => setForm((f) => ({ ...f, recommendedActions }))}
          placeholder="• Move to higher ground&#10;• Avoid crossing flooded wadis&#10;• Monitor local radio for updates"
          minHeight={140}
        />
      </Box>

      <ReportKeywordsField
        value={form.keywords}
        onChange={(keywords) => setForm((f) => ({ ...f, keywords }))}
        inputSx={inputSx}
        suggestions={mergeKeywordSuggestions(SUGGESTED_ADVISORY_KEYWORDS)}
        title="Keywords"
        hint="Tag hazards and topics so people can find this advisory — e.g. flood, livestock, Turkana."
      />

      <ReportDocumentsField
        documents={form.documents}
        onChange={(documents) => setForm((f) => ({ ...f, documents }))}
        inputSx={inputSx}
        onError={(msg) => onNotify?.(msg, 'warning')}
        title="Supporting documents (optional)"
        hint="Upload briefing notes or translations in multiple languages — English plus Kiswahili, Turkana, etc."
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        footnote="PDF, Word, Excel, or image · max 10 MB per file · up to 5 files"
      />

      <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ bgcolor: '#C1440E', py: 1.5 }}>
        {submitting ? 'Submitting…' : 'Submit Advisory for Review'}
      </Button>
    </Box>
  );
}
