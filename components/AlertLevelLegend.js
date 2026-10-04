import { Box, Typography } from '@mui/material';
import { fallbackAlertLegend } from '../lib/fallback-data';

export const ALERT_LEVEL_LEGEND = fallbackAlertLegend.items;

export default function AlertLevelLegend({ title, items, compact = false }) {
  const legendTitle = title || fallbackAlertLegend.title;
  const legendItems = items?.length ? items : fallbackAlertLegend.items;

  return (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #E8E0D5',
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Typography
        component="div"
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: '#3D2B1F',
          mb: compact ? 1.5 : 2,
        }}
      >
        {legendTitle}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: compact ? '1fr 1fr' : 'repeat(4, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {legendItems.map((item) => (
          <Box
            key={item.level}
            sx={{
              bgcolor: item.bg,
              border: `1px solid ${item.color}33`,
              borderLeft: `4px solid ${item.color}`,
              borderRadius: 1.5,
              p: 1.5,
              minHeight: compact ? undefined : 108,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  border: '1.5px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  flexShrink: 0,
                }}
              />
              <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.72rem', color: item.color, letterSpacing: '0.04em' }}>
                {item.level}
              </Typography>
            </Box>
            <Typography component="div" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#3D2B1F', mb: 0.4 }}>
              {item.title}
            </Typography>
            <Typography component="div" sx={{ fontSize: '0.72rem', color: '#5A5A5A', lineHeight: 1.5 }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
