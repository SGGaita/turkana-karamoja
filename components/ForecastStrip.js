import { Box, Typography } from '@mui/material';

const forecast = [
  { day: 'TODAY', icon: '🌩️', high: 38, low: 24, rain: 75, isToday: true },
  { day: 'TUE', icon: '⛈️', high: 35, low: 23, rain: 80, isToday: false },
  { day: 'WED', icon: '🌧️', high: 33, low: 22, rain: 60, isToday: false },
  { day: 'THU', icon: '⛅', high: 36, low: 24, rain: 30, isToday: false },
  { day: 'FRI', icon: '☀️', high: 39, low: 25, rain: 10, isToday: false },
  { day: 'SAT', icon: '🌤️', high: 40, low: 26, rain: 15, isToday: false },
  { day: 'SUN', icon: '⛅', high: 38, low: 24, rain: 25, isToday: false },
];

export default function ForecastStrip() {
  return (
    <Box sx={{ bgcolor: '#3D2B1F', py: 3, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          sx={{
            color: '#D4A96A',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            mb: 2,
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          7-Day Forecast - Turkana / Karamoja
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
          {forecast.map((f) => (
            <Box
              key={f.day}
              sx={{
                flex: '1 0 90px',
                bgcolor: f.isToday ? 'rgba(193,68,14,0.25)' : 'rgba(255,255,255,0.05)',
                border: f.isToday ? '1px solid #C1440E' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
                p: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: f.isToday ? '#D4A96A' : '#9A9A9A',
                }}
              >
                {f.day}
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', my: 0.5 }}>{f.icon}</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#F0D9B0' }}>
                {f.high}°{' '}
                <Box component="span" sx={{ fontSize: '0.7rem', color: '#9A9A9A', fontWeight: 400 }}>
                  / {f.low}°
                </Box>
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#5BA3D9', mt: 0.3 }}>
                💧 {f.rain}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
