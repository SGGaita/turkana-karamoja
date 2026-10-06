import { Box, Typography } from '@mui/material';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import { TOLL_FREE_LINES } from '../lib/toll-free-lines';

const VARIANTS = {
  light: {
    wrap: { bgcolor: '#FDF6EC', border: '1px solid #D4A96A', borderRadius: 2, p: { xs: 2.5, md: 3 } },
    title: '#3D2B1F',
    sub: '#5A5A5A',
    card: { bgcolor: 'white', border: '1px solid #E8E0D5', '&:hover': { borderColor: '#D4A96A', boxShadow: '0 8px 24px rgba(61,43,31,0.08)' } },
    label: '#6B4226',
    number: '#3D2B1F',
    icon: { bgcolor: '#F0D9B0', color: '#6B4226' },
  },
  dark: {
    wrap: { borderTop: '1px solid rgba(212,169,106,0.3)', pt: 2.5, mt: 3 },
    title: '#F0D9B0',
    sub: '#9A9A9A',
    card: { bgcolor: 'rgba(240,217,176,0.08)', border: '1px solid rgba(212,169,106,0.35)', '&:hover': { borderColor: '#D4A96A', bgcolor: 'rgba(240,217,176,0.14)' } },
    label: '#D4A96A',
    number: '#F0D9B0',
    icon: { bgcolor: '#D4A96A', color: '#3D2B1F' },
  },
};

export default function TollFreeLines({ variant = 'light', title = 'Toll-free helplines', subtitle = 'Free to call from any network', sx }) {
  const v = VARIANTS[variant] || VARIANTS.light;

  return (
    <Box sx={{ ...v.wrap, ...sx }}>
      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: variant === 'dark' ? '1rem' : '1.1rem', color: v.title }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '0.8rem', color: v.sub, mb: 2 }}>{subtitle}</Typography>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {TOLL_FREE_LINES.map((line) => (
          <Box
            key={line.tel}
            component="a"
            href={`tel:${line.tel}`}
            aria-label={`Call ${line.label} ${line.display}`}
            sx={{
              flex: '1 1 200px',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              textDecoration: 'none',
              transition: 'all 0.2s',
              ...v.card,
            }}
          >
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...v.icon }}>
              <PhoneInTalkOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: v.label }}>
                {line.label}
              </Typography>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: v.number, whiteSpace: 'nowrap' }}>
                {line.display}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
