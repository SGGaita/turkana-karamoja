import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getMySubmissions, updateSubmission, withdrawSubmission,
  addReportDocuments, removeReportDocument, uploadMedia,
} from '../lib/wordpress';
import { getLanguageLabel } from '../lib/wp-mappers';
import { HUB_LANGUAGES } from '../lib/languages';
import { formatFileSize } from '../lib/report-utils';

const STATUS_STYLES = {
  pending: { bg: '#fff4ec', color: '#b45309', border: '#f59e0b' },
  approved: { bg: '#ecfdf5', color: '#047857', border: '#10b981' },
  rejected: { bg: '#fef2f2', color: '#b91c1c', border: '#ef4444' },
  withdrawn: { bg: '#f3f4f6', color: '#5A5A5A', border: '#d1d5db' },
  withdrawal_requested: { bg: '#f5f3ff', color: '#7c3aed', border: '#a78bfa' },
};

const STATUS_LABELS = {
  withdrawal_requested: 'Withdrawal requested',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'white',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A96A' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7BB4' },
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const label = STATUS_LABELS[status] || status || 'pending';
  return (
    <Chip
      label={label.toUpperCase()}
      size="small"
      sx={{
        bgcolor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontWeight: 700,
        fontSize: '0.62rem',
        height: 22,
      }}
    />
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

/** First language not already used by an existing document on the report — so the
 *  "Manage documents" language picker doesn't default to (or even offer) a language
 *  that's already covered. */
function nextAvailableLanguage(files) {
  const used = new Set((files || []).map((f) => f.language));
  return HUB_LANGUAGES.find((lang) => !used.has(lang.code))?.code || HUB_LANGUAGES[0].code;
}

export default function PartnerSubmissionsPanel({
  token, orgRecord, onNotify, filterType = 'all', filterStatus = 'all', onStats, onEditReport,
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addDocsItem, setAddDocsItem] = useState(null);
  const [newDoc, setNewDoc] = useState({ file: null, language: 'en' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token || token.startsWith('DEMO_JWT_TOKEN')) {
      setLoading(false);
      setItems([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getMySubmissions(token);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Could not load submissions');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!onStats) return;
    const stats = {
      total: items.length,
      pending: items.filter((i) => (i.review_status || 'pending') === 'pending').length,
      approved: items.filter((i) => i.review_status === 'approved').length,
      rejected: items.filter((i) => i.review_status === 'rejected').length,
      withdrawn: items.filter((i) => i.review_status === 'withdrawn').length,
      advisories: items.filter((i) => i.type === 'advisory').length,
      reports: items.filter((i) => i.type === 'report').length,
    };
    onStats(stats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const visibleItems = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && (item.review_status || 'pending') !== filterStatus) return false;
    return true;
  });

  // Reports edit on the same full-page "Submit Report" form (dashboard.js swaps it into
  // edit mode) rather than a modal — hand off to the parent instead of opening a dialog.
  // Advisories still use the lightweight in-place dialog below.
  const openEdit = (item) => {
    if (item.type === 'report' && onEditReport) {
      onEditReport(item);
      return;
    }
    setEditItem(item);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      content: item.description || '',
      keywords: item.keywords || [],
    });
  };
  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const payload = { title: editForm.title, content: editForm.content };
      const res = await updateSubmission(editItem.type, editItem.id, payload, token);
      onNotify?.(res.message || 'Updated');
      setEditItem(null);
      await load();
    } catch (err) {
      onNotify?.(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async (item) => {
    const isLiveReport = item.type === 'report' && item.review_status === 'approved';
    const confirmMsg = isLiveReport
      ? `Request withdrawal of ${item.reference}? It stays live on the Hub until an administrator approves the request.`
      : `Withdraw ${item.reference}? This cannot be undone from the portal.`;
    if (!window.confirm(confirmMsg)) return;
    setSaving(true);
    try {
      const res = await withdrawSubmission(item.type, item.id, token);
      onNotify?.(res.message || 'Withdrawn');
      await load();
    } catch (err) {
      onNotify?.(err.message || 'Withdraw failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDocument = async () => {
    if (!addDocsItem || !newDoc.file) return;
    setSaving(true);
    try {
      const media = await uploadMedia(newDoc.file, token);
      const doc = {
        url: media.source_url || '',
        size: formatFileSize(newDoc.file.size),
        language: newDoc.language,
        label: getLanguageLabel(newDoc.language),
        filename: newDoc.file.name,
      };
      const res = await addReportDocuments(addDocsItem.id, [doc], token);
      onNotify?.(res.message || 'Document added');
      setNewDoc({ file: null, language: nextAvailableLanguage(res.files) });
      // Keep the dialog open (it's "Manage documents" now, not a one-shot add) and
      // refresh its own file list immediately rather than waiting on the full reload.
      setAddDocsItem((cur) => (cur && cur.id === addDocsItem.id ? { ...cur, files: res.files } : cur));
      await load();
    } catch (err) {
      onNotify?.(err.message || 'Upload failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDocument = async (item, file) => {
    if (!window.confirm(`Remove "${file.filename || file.label || file.language}" from ${item.reference}?`)) return;
    setSaving(true);
    try {
      const res = await removeReportDocument(item.id, file.url, token);
      onNotify?.(res.message || 'Document removed');
      setAddDocsItem((cur) => (cur && cur.id === item.id ? { ...cur, files: res.files } : cur));
      await load();
    } catch (err) {
      onNotify?.(err.message || 'Remove failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <Alert severity="warning" sx={{ bgcolor: '#FFF4EC' }}>
        Sign in with your partner account to view submissions.
      </Alert>
    );
  }

  if (token.startsWith('DEMO_JWT_TOKEN')) {
    return (
      <Alert severity="info">
        My Submissions requires a live WordPress connection. Demo login does not sync with the CMS.
      </Alert>
    );
  }

  if (!orgRecord || orgRecord.status !== 'approved') {
    return (
      <Alert severity="info">
        Your organisation must be approved before you can track submissions here.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2B1F' }}>
          My Submissions
        </Typography>
        <Button size="small" startIcon={<RefreshIcon />} onClick={load} disabled={loading} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>
      <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', mb: 3 }}>
        View advisories and reports submitted by your organisation. Reports can be edited any time, including after approval; advisories can be edited while pending or rejected. Items can also be withdrawn or extended with more documents.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#C1440E' }} /></Box>
      ) : items.length === 0 ? (
        <Box sx={{ bgcolor: '#FDF9F4', border: '1px dashed #E8E0D5', borderRadius: 2, p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem' }}>No submissions yet. Use the advisory or report tabs to submit content.</Typography>
        </Box>
      ) : visibleItems.length === 0 ? (
        <Box sx={{ bgcolor: '#FDF9F4', border: '1px dashed #E8E0D5', borderRadius: 2, p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem' }}>No submissions match this filter.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visibleItems.map((item) => (
            <Box key={`${item.type}-${item.id}`} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1 }}>
                <Chip label={item.type === 'advisory' ? 'Advisory' : 'Report'} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                <StatusBadge status={item.review_status} />
                <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A' }}>{item.reference}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', ml: 'auto' }}>{formatDate(item.submitted_at)}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', mb: 0.5 }}>{item.title}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', mb: 1.5, lineHeight: 1.5 }}>
                {(item.description || '').slice(0, 160)}{(item.description || '').length > 160 ? '…' : ''}
              </Typography>
              {item.type === 'report' && item.files?.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
                  {item.files.map((f) => (
                    <Chip key={`${f.url}-${f.language}`} label={f.label || f.language} size="small" sx={{ fontSize: '0.62rem', bgcolor: '#F0F8FF', color: '#2E7BB4' }} />
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {item.can_edit && (
                  <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => openEdit(item)} sx={{ fontSize: '0.72rem', borderColor: '#D4C4B0', color: '#3D2B1F' }}>
                    Edit
                  </Button>
                )}
                {item.can_add_documents && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FolderOpenOutlinedIcon />}
                    onClick={() => { setAddDocsItem(item); setNewDoc({ file: null, language: nextAvailableLanguage(item.files) }); }}
                    sx={{ fontSize: '0.72rem', borderColor: '#2E7BB4', color: '#2E7BB4' }}
                  >
                    Manage documents
                  </Button>
                )}
                {item.can_withdraw && (
                  <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => handleWithdraw(item)} disabled={saving} sx={{ fontSize: '0.72rem' }}>
                    Withdraw
                  </Button>
                )}
                {item.review_status === 'approved' && (
                  <Typography sx={{ fontSize: '0.72rem', color: '#047857', alignSelf: 'center' }}>Published on Karamoja</Typography>
                )}
                {item.review_status === 'withdrawal_requested' && (
                  <Typography sx={{ fontSize: '0.72rem', color: '#7c3aed', alignSelf: 'center' }}>
                    Still live — withdrawal awaiting admin decision
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Reports never set editItem (they hand off to the full-page form via onEditReport),
          so this dialog is advisory-only now — a plain title/content edit. */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit {editItem?.reference}</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} sx={{ ...inputSx, mt: 1, mb: 2 }} size="small" />
          <TextField label="Content" fullWidth multiline rows={6} value={editForm.content} onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))} sx={inputSx} size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving} sx={{ bgcolor: '#C1440E' }}>Save changes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(addDocsItem)} onClose={() => setAddDocsItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Manage documents — {addDocsItem?.reference}</DialogTitle>
        <DialogContent>
          {addDocsItem?.files?.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#3D2B1F', mb: 1 }}>Current documents</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {addDocsItem.files.map((f) => (
                  <Box
                    key={f.url}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FDF9F4',
                      border: '1px solid #F0EBE3', borderRadius: 1, px: 1.2, py: 0.8,
                    }}
                  >
                    <Chip label={f.label || f.language} size="small" sx={{ fontSize: '0.6rem', bgcolor: '#F0F8FF', color: '#2E7BB4', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: '#5A5A5A', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.filename || 'Document'}{f.size ? ` · ${f.size}` : ''}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveDocument(addDocsItem, f)}
                      disabled={saving}
                      sx={{ minWidth: 0, fontSize: '0.68rem', flexShrink: 0 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#3D2B1F', mb: 1 }}>Add a document</Typography>
          <FormControl fullWidth size="small" sx={{ ...inputSx, mb: 2 }}>
            <InputLabel>Language</InputLabel>
            <Select value={newDoc.language} label="Language" onChange={(e) => setNewDoc((d) => ({ ...d, language: e.target.value }))}>
              {HUB_LANGUAGES
                // Hide languages the report already has a document in.
                .filter((lang) => lang.code === newDoc.language || !addDocsItem?.files?.some((f) => f.language === lang.code))
                .map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>{lang.nativeName}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button variant="outlined" component="label" fullWidth sx={{ borderColor: '#C1440E', color: '#C1440E' }}>
            {newDoc.file ? newDoc.file.name : 'Choose file'}
            <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => setNewDoc((d) => ({ ...d, file: e.target.files?.[0] || null }))} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDocsItem(null)}>Close</Button>
          <Button variant="contained" onClick={handleAddDocument} disabled={saving || !newDoc.file} sx={{ bgcolor: '#2E7BB4' }}>Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
