import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText,
} from '@mui/material';
import { submitReport, updateSubmission, getWpBaseUrl } from '../lib/wordpress';
import ReportDocumentsField from './ReportDocumentsField';
import ReportKeywordsField from './ReportKeywordsField';
import ReportCategoriesField from './ReportCategoriesField';
import { HUB_COUNTRIES, getCountryLabel } from '../lib/countries';
import { isRichTextEmpty } from './HubRichTextEditor';

const HubRichTextEditor = dynamic(() => import('./HubRichTextEditor'), { ssr: false });

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'white',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A96A' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7BB4' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2E7BB4' },
};

const emptyReportForm = () => ({
  categories: [],
  title: '',
  description: '',
  keywords: [],
  countries: [],
  documents: [{ id: 1, file: null, language: 'en' }],
});

/**
 * Also doubles as the "edit an existing report" form — dashboard.js swaps the same
 * full-page Submit Report section into edit mode (mode="edit", submissionId, initialValues)
 * instead of using a modal. Edit mode skips the documents field: adding/removing files for
 * an existing report is handled by PartnerSubmissionsPanel's "Manage documents" action,
 * since those are already-uploaded files rather than new ones to attach.
 */
export default function ReportSubmissionForm({
  token, orgRecord, onNotify, onSubmitted, mode = 'create', submissionId = null, initialValues = null, embedded = false,
}) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(() => (isEdit
    ? {
      categories: initialValues?.categories || [],
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      keywords: initialValues?.keywords || [],
      countries: initialValues?.countries || [],
      documents: [],
    }
    : emptyReportForm()));
  const [submitting, setSubmitting] = useState(false);
  const wpConfigured = Boolean(getWpBaseUrl());
  const isDemo = token?.startsWith('DEMO_JWT_TOKEN');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categories.length) {
      onNotify?.('Select at least one report category.', 'warning');
      return;
    }
    if (!form.countries?.length) {
      onNotify?.('Select at least one country this report applies to.', 'warning');
      return;
    }
    if (isRichTextEmpty(form.description)) {
      onNotify?.('Add a description or summary for this report.', 'warning');
      return;
    }
    if (!isEdit) {
      if (!form.documents.some((d) => d.file)) {
        onNotify?.('Please attach at least one document.', 'warning');
        return;
      }
      const missingLang = form.documents.some((d) => d.file && !d.language);
      if (missingLang) {
        onNotify?.('Select a language for each document.', 'warning');
        return;
      }
    }

    setSubmitting(true);

    if (isEdit) {
      try {
        const payload = {
          title: form.title,
          description: form.description,
          keywords: form.keywords,
          categories: form.categories,
          countries: form.countries,
        };
        const res = await updateSubmission('report', submissionId, payload, token);
        onNotify?.(res.message || 'Report updated.');
        onSubmitted?.();
      } catch (err) {
        onNotify?.(err.message || 'Update failed', 'error');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const payload = { ...form, org: orgRecord?.name, organizationId: orgRecord?.id };

    if (isDemo) {
      setTimeout(() => {
        onNotify?.(`Report uploaded (demo)! Reference: DEMO-RPT-${Date.now().toString().slice(-6)}. Pending admin review.`);
        setForm(emptyReportForm());
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
      const result = await submitReport(payload, token);
      onNotify?.(`Report uploaded! Reference: WP-RPT-${result.id}. Pending admin review.`);
      setForm(emptyReportForm());
      onSubmitted?.();
    } catch (err) {
      onNotify?.(err.message || 'Upload failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={embedded ? {} : { bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: { xs: 2.5, md: 3.5 } }}
    >
      {!embedded && (
        <>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2B1F', mb: 1 }}>
            {isEdit ? 'Edit Report' : 'Upload Report'}
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mb: 3 }}>
            {isEdit
              ? 'Update this report\'s category, title, description, countries, or keywords. To add or remove documents, use "Manage documents" from the submissions list.'
              : 'Upload situation reports, assessments, and monitoring documents. Add multiple files in different languages (e.g. English + Kiswahili). Files appear on the Reports page after admin review.'}
          </Typography>
        </>
      )}

      <ReportCategoriesField
        value={form.categories}
        onChange={(categories) => setForm((f) => ({ ...f, categories }))}
        inputSx={inputSx}
      />

      <TextField label="Report Title *" fullWidth required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} sx={{ ...inputSx, mb: 2.5 }} size="small" />

      <FormControl fullWidth size="small" sx={{ ...inputSx, mb: 2.5 }}>
        <InputLabel>Countries this report applies to *</InputLabel>
        <Select
          multiple
          value={form.countries}
          label="Countries this report applies to *"
          onChange={(e) => {
            const { value } = e.target;
            setForm((f) => ({ ...f, countries: typeof value === 'string' ? value.split(',') : value }));
          }}
          renderValue={(selected) => selected.map((code) => getCountryLabel(code)).join(', ')}
        >
          {HUB_COUNTRIES.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              <Checkbox checked={form.countries.includes(c.code)} size="small" />
              <ListItemText primary={c.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>Description / Summary *</Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 1, lineHeight: 1.5 }}>
        Summarise what this report covers — key findings, scope, and why it matters.
      </Typography>
      <Box sx={{ mb: 2.5 }}>
        <HubRichTextEditor
          value={form.description}
          onChange={(description) => setForm((f) => ({ ...f, description }))}
          placeholder="Describe the report's scope, key findings, and relevance…"
          minHeight={140}
        />
      </Box>

      <ReportKeywordsField
        value={form.keywords}
        onChange={(keywords) => setForm((f) => ({ ...f, keywords }))}
        inputSx={inputSx}
      />

      {!isEdit && (
        <ReportDocumentsField
          documents={form.documents}
          onChange={(documents) => setForm((f) => ({ ...f, documents }))}
          inputSx={inputSx}
          onError={(msg) => onNotify?.(msg, 'warning')}
        />
      )}

      <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ bgcolor: '#2E7BB4', py: 1.5, '&:hover': { bgcolor: '#2569a0' }, mt: isEdit ? 2.5 : 0 }}>
        {submitting ? (isEdit ? 'Saving…' : 'Uploading…') : (isEdit ? 'Save changes' : 'Upload Report for Review')}
      </Button>
    </Box>
  );
}
