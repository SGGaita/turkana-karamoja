import { Box, Typography, Chip, Button } from '@mui/material';
import Link from 'next/link';
import { toStripAlert } from '../lib/wp-mappers';
import { weatherItems } from '../lib/fallback-data';
import PushSubscribeButton from './PushSubscribeButton';

export default function WarningsStrip({ alerts: alertsProp = [], apiStale = false }) {
  const source = Array.isArray(alertsProp) ? alertsProp : [];
  const stripAlerts = source.slice(0, 4).map(toStripAlert);
  const activeCount = source.filter((a) => a.level === 'RED' || a.level === 'ORANGE').length;
  const hasAlerts = stripAlerts.length > 0;

  return (
    <Box id="warnings" sx={{ bgcolor: '#FDF6EC', py: { xs: 6, md: 9 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 1, flexWrap: 'wrap' }}>
          <Box sx={{ width: 4, height: 36, bgcolor: '#C1440E', borderRadius: 2, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#C1440E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Early Warning System
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F' }}>
              Active Climate Alerts
            </Typography>
          </Box>
          <PushSubscribeButton compact />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: '#3D2B1F',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            mb: 4,
            mt: 3,
            alignItems: 'center',
          }}
        >
          {weatherItems.map((w) => (
            <Box key={w.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ color: '#9A9A9A', fontSize: '0.75rem' }}>{w.label}:</Typography>
              <Typography sx={{ color: '#F0D9B0', fontSize: '0.75rem', fontWeight: 600 }}>{w.val}</Typography>
            </Box>
          ))}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 7, height: 7, bgcolor: hasAlerts && activeCount ? '#D63030' : '#2E8B57', borderRadius: '50%' }} />
            <Typography sx={{ color: hasAlerts && activeCount ? '#D63030' : '#2E8B57', fontSize: '0.75rem', fontWeight: 700 }}>
              {hasAlerts
                ? `${activeCount} Active Alert${activeCount !== 1 ? 's' : ''}`
                : 'No active alerts'}
            </Typography>
          </Box>
        </Box>

        {hasAlerts ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            {stripAlerts.map((a) => (
              <Box
                key={a.id || a.title}
                component={Link}
                href={a.href || '/early-warnings'}
                sx={{
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: { xs: '100%', sm: 280 },
                  bgcolor: a.bg,
                  border: `1px solid ${a.border}`,
                  borderLeft: `4px solid ${a.border}`,
                  borderRadius: 2,
                  p: 2.5,
                  textDecoration: 'none',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': { boxShadow: `0 8px 24px ${a.border}22`, transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ mb: 1.2 }}>
                  <Chip label={a.level} size="small" sx={{ bgcolor: a.border, color: 'white', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.06em' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#3D2B1F', mb: 0.5 }}>{a.title}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B4226', fontWeight: 500, mb: 0.8 }}>{a.area}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.55, mb: 1.2 }}>{a.desc}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: '#9A9A9A' }}>
                  <span>Issued: {a.issued}</span>
                  <span>{a.valid}</span>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              mb: 4,
              bgcolor: 'white',
              border: '1px solid #E8E0D5',
              borderRadius: 2,
              p: { xs: 3, md: 4 },
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#3D2B1F', mb: 1 }}>
              No advisories at this time
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
              {apiStale
                ? 'Live advisory data is temporarily unavailable. Please check again shortly, or visit Early Warnings for the latest updates.'
                : 'There are currently no published climate advisories. When a new warning is issued by verified partners, it will appear here.'}
            </Typography>
          </Box>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Button
            component={Link}
            href="/early-warnings"
            variant="outlined"
            sx={{ borderColor: '#C1440E', color: '#C1440E', '&:hover': { bgcolor: '#FFF0EC', borderColor: '#E8622A' } }}
          >
            View All Early Warnings →
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
