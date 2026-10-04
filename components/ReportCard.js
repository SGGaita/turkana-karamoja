import Link from 'next/link';
import { Box, Typography, Button, Chip } from '@mui/material';
import { getReportFiles } from '../lib/report-utils';
import ReportFileLanguages from './ReportFileLanguages';
import ReportDownloadStat from './ReportDownloadStat';
import ShareLinks from './ShareLinks';
import { buildSlugPath, slugify } from '../lib/slug';

export default function ReportCard({ report, onPreview, onDownloadTracked, compact = false }) {
  const files = getReportFiles(report);
  const reportPath = `/reports/${buildSlugPath(report.title, report.id)}`;

  return (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #E8E0D5',
        borderRadius: 2,
        p: compact ? 2 : 2.5,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 16px rgba(61,43,31,0.08)' },
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 0.8 }}>
        <Chip label={report.tag} size="small" sx={{ bgcolor: report.tagColor, color: 'white', fontWeight: 600, fontSize: '0.62rem', height: 20 }} />
        {report.orgs?.map((o) => (
          <Chip key={o} label={o} size="small" sx={{ bgcolor: '#F0D9B0', color: '#6B4226', fontSize: '0.62rem', height: 20 }} />
        ))}
        {report.isNew && <Chip label="NEW" size="small" sx={{ bgcolor: '#C1440E', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />}
        {report.isUpdated && <Chip label="UPDATED" size="small" sx={{ bgcolor: '#2E7BB4', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />}
        {report.keywords?.map((keyword) => (
          <Chip
            key={keyword}
            label={keyword}
            size="small"
            sx={{ bgcolor: '#F0F8FF', color: '#2E7BB4', fontSize: '0.6rem', height: 20, fontWeight: 600 }}
          />
        ))}
        {files.length > 1 && (
          <Chip label={`${files.length} languages`} size="small" sx={{ bgcolor: '#E8E0D5', color: '#3D2B1F', fontSize: '0.6rem', height: 20 }} />
        )}
      </Box>

      <Typography
        component={Link}
        href={reportPath}
        sx={{
          display: 'block',
          fontWeight: 700,
          fontSize: compact ? '0.88rem' : '0.92rem',
          color: '#3D2B1F',
          mb: 0.6,
          textDecoration: 'none',
          '&:hover': { color: '#C1440E', textDecoration: 'underline' },
        }}
      >
        {report.title}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.8rem',
          color: '#5A5A5A',
          lineHeight: 1.6,
          mb: 1.5,
          minHeight: '3.2em',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {report.desc}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A' }}>
            {report.date}
          </Typography>
          <ReportDownloadStat count={report.downloadCount} />
        </Box>
        <Typography
          component={Link}
          href={reportPath}
          sx={{ fontSize: '0.72rem', color: '#2E7BB4', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Read more →
        </Typography>
      </Box>

      <Box sx={{ mb: files.length ? 1.5 : 0 }}>
        <ShareLinks title={report.title} path={reportPath} />
      </Box>

      <ReportFileLanguages files={files} report={report} onPreview={onPreview} onDownloadTracked={onDownloadTracked} />
    </Box>
  );
}

export function OrgGroupHeader({ group }) {
  const profileHref = group.organizationId ? `/organizations/${slugify(group.name)}` : null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        mb: 1.5,
        pb: 1,
        borderBottom: '2px solid #E8E0D5',
      }}
    >
      <Box>
        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#3D2B1F' }}>
          {group.name}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>
          {group.items.length} report{group.items.length === 1 ? '' : 's'}
        </Typography>
      </Box>
      {profileHref && (
        <Button
          component={Link}
          href={profileHref}
          size="small"
          sx={{ color: '#2E7BB4', fontSize: '0.75rem', textTransform: 'none' }}
        >
          View organisation profile
        </Button>
      )}
    </Box>
  );
}
