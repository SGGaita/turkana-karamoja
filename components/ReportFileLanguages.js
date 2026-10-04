import { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { trackReportDownload } from '../lib/wordpress';
import { fileDownloadCount, formatDownloadCount } from '../lib/report-utils';

/** Compact language switcher for a report's file variants: one row of language pills
 *  (only shown when there's more than one) plus a single Preview/Download row for
 *  whichever language is selected — instead of repeating a full row per language. */
export default function ReportFileLanguages({ files, report, onPreview, onDownloadTracked }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!files?.length) return null;
  const index = Math.min(activeIdx, files.length - 1);
  const file = files[index];
  const versionDownloads = fileDownloadCount(report, file);

  return (
    <Box>
      {files.length > 1 && (
        <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', mb: 0.6 }}>
          Select a language, then click Download to get that version of the report.
        </Typography>
      )}
      {files.length > 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1 }}>
          {files.map((f, i) => (
            <Chip
              key={`${f.url}-${f.language}`}
              label={f.label || f.language}
              size="small"
              onClick={() => setActiveIdx(i)}
              sx={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                bgcolor: i === index ? '#2E7BB4' : '#E0EFF8',
                color: i === index ? 'white' : '#2E7BB4',
                '&:hover': { bgcolor: i === index ? '#2569a0' : '#cfe6f5' },
              }}
            />
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
          py: 1, px: 1.5, bgcolor: '#FDF9F4', borderRadius: 1.5, border: '1px solid #F0EBE3',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem', color: '#9A9A9A', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
          }}
          title={file.filename || undefined}
        >
          {file.filename || file.label || file.language || 'Document'}
          {file.size ? ` · ${file.size}` : ''}
          {` · ${formatDownloadCount(versionDownloads)}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', ml: 'auto' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onPreview(report, file)}
            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
            sx={{ borderColor: '#D4C4B0', color: '#3D2B1F', fontSize: '0.68rem', py: 0.3, '&:hover': { borderColor: '#2E7BB4', bgcolor: '#F0F8FF' } }}
          >
            Preview
          </Button>
          <Button
            size="small"
            variant="contained"
            component="a"
            href={file.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackReportDownload(report?.id, file, (stats) => onDownloadTracked?.(report?.id, stats))}
            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            sx={{ bgcolor: '#3D2B1F', '&:hover': { bgcolor: '#C1440E' }, fontSize: '0.68rem', py: 0.3 }}
          >
            Download
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
