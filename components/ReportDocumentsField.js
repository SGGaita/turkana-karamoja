import { useRef, useState } from 'react';
import {
  Box, Typography, Button, Chip, FormControl, InputLabel, Select, MenuItem, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { HUB_LANGUAGES } from '../lib/languages';
import { formatFileSize as formatSize } from '../lib/report-utils';

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx';

export default function ReportDocumentsField({
  documents,
  onChange,
  disabled,
  inputSx,
  onError,
  title = 'Documents *',
  hint = `Drag and drop files (up to ${MAX_FILES}), or browse — then mark the language of each version, e.g. English PDF plus Kiswahili or Turkana translations.`,
  accept = ACCEPT,
  footnote = 'PDF or Word · max 10 MB per file',
}) {
  const inputRefs = useRef({});
  const [dragOverId, setDragOverId] = useState(null);

  const acceptList = accept.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const isAcceptedType = (file) => {
    if (!acceptList.length) return true;
    const name = file.name.toLowerCase();
    return acceptList.some((ext) => name.endsWith(ext));
  };

  /** First language not already used by any row — so a freshly added row doesn't
   *  default to a language someone already picked. */
  const nextAvailableLanguage = (rows) => {
    const used = new Set(rows.map((d) => d.language));
    return HUB_LANGUAGES.find((l) => !used.has(l.code))?.code || HUB_LANGUAGES[0].code;
  };

  const addRow = () => {
    if (documents.length >= MAX_FILES) return;
    onChange([
      ...documents,
      { id: Date.now(), file: null, language: nextAvailableLanguage(documents) },
    ]);
  };

  const updateRow = (id, patch) => {
    onChange(documents.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeRow = (id) => {
    if (documents.length <= 1) {
      onChange([{ id: Date.now(), file: null, language: 'en' }]);
      return;
    }
    onChange(documents.filter((d) => d.id !== id));
  };

  const validateFile = (file) => {
    if (!isAcceptedType(file)) return `${file.name} isn't an accepted file type.`;
    if (file.size > MAX_BYTES) return `${file.name} exceeds 10 MB.`;
    return null;
  };

  const pickFile = (id, file) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) return { error };
    updateRow(id, { file });
    return null;
  };

  /** Drop one or more files onto a row: the first file fills that row, any extra
   *  files fill other empty rows (creating new ones, up to MAX_FILES). */
  const handleDropFiles = (id, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || disabled) return;

    const errors = [];
    const next = documents.map((d) => ({ ...d }));

    const assign = (idx, file) => {
      const error = validateFile(file);
      if (error) { errors.push(error); return; }
      next[idx] = { ...next[idx], file };
    };

    const targetIdx = next.findIndex((d) => d.id === id);
    const [first, ...rest] = files;
    if (targetIdx !== -1 && first) assign(targetIdx, first);

    rest.forEach((file) => {
      let emptyIdx = next.findIndex((d) => !d.file);
      if (emptyIdx === -1) {
        if (next.length >= MAX_FILES) {
          errors.push(`${file.name} skipped — maximum ${MAX_FILES} files.`);
          return;
        }
        next.push({ id: Date.now() + Math.random(), file: null, language: nextAvailableLanguage(next) });
        emptyIdx = next.length - 1;
      }
      assign(emptyIdx, file);
    });

    onChange(next);
    if (errors.length && onError) onError(errors.join(' '));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', mb: 0.5, color: '#3D2B1F' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mb: 2, lineHeight: 1.5 }}>
        {hint}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {documents.map((doc, index) => (
          <Box
            key={doc.id}
            sx={{
              border: '1px solid #E8E0D5',
              borderRadius: 2,
              p: 2,
              bgcolor: '#FDF9F4',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B4226' }}>
                Document {index + 1}
              </Typography>
              {documents.length > 1 && (
                <IconButton size="small" onClick={() => removeRow(doc.id)} disabled={disabled} aria-label="Remove document">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <FormControl size="small" sx={{ ...inputSx, mb: 1.5, width: '100%' }} disabled={disabled}>
              <InputLabel>Language *</InputLabel>
              <Select
                value={doc.language}
                label="Language *"
                onChange={(e) => updateRow(doc.id, { language: e.target.value })}
              >
                {HUB_LANGUAGES
                  // Hide languages already picked on another row — each language can only
                  // be used once per report, and this is a simpler guard than validating
                  // duplicates after the fact.
                  .filter((lang) => lang.code === doc.language || !documents.some((d) => d.id !== doc.id && d.language === lang.code))
                  .map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>{lang.nativeName}</MenuItem>
                  ))}
              </Select>
            </FormControl>

            <input
              ref={(el) => { inputRefs.current[doc.id] = el; }}
              type="file"
              hidden
              accept={accept}
              onChange={(e) => {
                const err = pickFile(doc.id, e.target.files?.[0]);
                if (err?.error && onError) {
                  onError(err.error);
                }
                e.target.value = '';
              }}
            />

            <Box
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) setDragOverId(doc.id); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) setDragOverId(doc.id); }}
              onDragLeave={(e) => {
                e.preventDefault(); e.stopPropagation();
                setDragOverId((current) => (current === doc.id ? null : current));
              }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation();
                setDragOverId(null);
                if (disabled) return;
                handleDropFiles(doc.id, e.dataTransfer.files);
              }}
              sx={{
                border: '1.5px dashed',
                borderColor: dragOverId === doc.id ? '#C1440E' : '#D4C4B0',
                borderRadius: 1.5,
                bgcolor: dragOverId === doc.id ? '#FFF0EC' : 'transparent',
                p: 1.75,
                textAlign: 'center',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              {!doc.file ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                  <CloudUploadOutlinedIcon sx={{ color: dragOverId === doc.id ? '#C1440E' : '#C4A886', fontSize: 26 }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A' }}>
                    Drag &amp; drop a file here, or
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={disabled}
                    onClick={() => inputRefs.current[doc.id]?.click()}
                    sx={{ borderColor: '#C1440E', color: '#C1440E', '&:hover': { bgcolor: '#FFF0EC', borderColor: '#C1440E' } }}
                  >
                    Choose file
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <InsertDriveFileOutlinedIcon sx={{ color: '#C1440E', fontSize: 20 }} />
                  <Chip
                    label={doc.file.name}
                    onDelete={disabled ? undefined : () => updateRow(doc.id, { file: null })}
                    sx={{ bgcolor: '#C1440E', color: 'white', maxWidth: '100%' }}
                  />
                  <Typography sx={{ fontSize: '0.7rem', color: '#9A9A9A' }}>{formatSize(doc.file.size)}</Typography>
                  <Button size="small" disabled={disabled} onClick={() => inputRefs.current[doc.id]?.click()} sx={{ fontSize: '0.72rem' }}>
                    Replace
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      <Button
        startIcon={<AddIcon />}
        onClick={addRow}
        disabled={disabled || documents.length >= MAX_FILES}
        sx={{ mt: 1.5, color: '#2E7BB4', textTransform: 'none', fontSize: '0.8rem' }}
      >
        Add another document
      </Button>
      <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mt: 1 }}>
        {footnote}
      </Typography>
    </Box>
  );
}

export { MAX_FILES as REPORT_MAX_FILES };
