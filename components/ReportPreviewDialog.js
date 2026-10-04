import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, IconButton, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { canEmbedPreview, isPdfUrl, getReportFiles } from '../lib/report-utils';
import { trackReportDownload } from '../lib/wordpress';

export default function ReportPreviewDialog({ report, file, open, onClose, onDownloadTracked }) {
  const [embedFailed, setEmbedFailed] = useState(false);
  const [activeFile, setActiveFile] = useState(file);

  useEffect(() => {
    if (open) {
      setActiveFile(file || null);
      setEmbedFailed(false);
    }
  }, [open, file, report]);

  if (!report) {
    return null;
  }

  const files = getReportFiles(report);
  const current = activeFile || file || files[0];
  const url = current?.url;
  const embeddable = canEmbedPreview(url) && !embedFailed;

  const handleClose = () => {
    setEmbedFailed(false);
    setActiveFile(null);
    onClose();
  };

  const selectFile = (f) => {
    setEmbedFailed(false);
    setActiveFile(f);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pr: 1 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', lineHeight: 1.3 }}>
            {report.title}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mt: 0.5 }}>
            {current?.label || 'Document'}{current?.size ? ` · ${current.size}` : ''}
          </Typography>
          {files.length > 1 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.5 }}>
              {files.map((f) => (
                <Chip
                  key={`${f.url}-${f.language}`}
                  label={f.label || f.language}
                  size="small"
                  onClick={() => selectFile(f)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: current?.url === f.url && current?.language === f.language ? '#C1440E' : '#E0EFF8',
                    color: current?.url === f.url && current?.language === f.language ? '#fff' : '#2E7BB4',
                    fontWeight: 600,
                    fontSize: '0.68rem',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small" aria-label="Close preview">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, minHeight: 320, bgcolor: '#F5F0EA' }}>
        {!url ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#5A5A5A', fontSize: '0.9rem' }}>
              No file is attached to this report yet.
            </Typography>
          </Box>
        ) : embeddable ? (
          <Box sx={{ height: { xs: '55vh', md: '68vh' }, bgcolor: '#fff' }}>
            {isPdfUrl(url) ? (
              <iframe
                title={`${report.title} — ${current?.label || 'preview'}`}
                src={url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                onError={() => setEmbedFailed(true)}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 2 }}>
                <Box
                  component="img"
                  src={url}
                  alt={report.title}
                  onError={() => setEmbedFailed(true)}
                  sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#5A5A5A', fontSize: '0.9rem', mb: 1, lineHeight: 1.6 }}>
              {embedFailed
                ? 'Inline preview could not load (often due to browser security on cross-site files).'
                : 'This file type cannot be previewed in the browser.'}
            </Typography>
            <Typography sx={{ color: '#9A9A9A', fontSize: '0.8rem' }}>
              Use Open in new tab or Download to view Word, Excel, and other documents.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={handleClose} sx={{ color: '#5A5A5A' }}>Close</Button>
        {url && (
          <>
            <Button
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              sx={{ color: '#2E7BB4' }}
            >
              Open in new tab
            </Button>
            <Button
              component="a"
              href={url}
              download
              variant="contained"
              onClick={() => trackReportDownload(report.id, current, (stats) => onDownloadTracked?.(report.id, stats))}
              startIcon={<DownloadIcon />}
              sx={{ bgcolor: '#3D2B1F', '&:hover': { bgcolor: '#C1440E' } }}
            >
              Download
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
