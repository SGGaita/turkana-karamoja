import { Box, Typography, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

const portals = [
  { icon: '🌦️', bg: 'linear-gradient(135deg,#E0EFF8,#C8E0F0)', title: 'Meteorological Authorities', desc: 'KMD & UMA publish official forecasts, climate outlooks and seasonal updates.', href: '/organizations' },
  { icon: '🚨', bg: 'linear-gradient(135deg,#FFE8E8,#FFCECE)', title: 'Disaster Management', desc: 'NDMA, OPM, and county disaster units issue emergency alerts and response updates.', href: '/organizations' },
  { icon: '🏛️', bg: 'linear-gradient(135deg,#E8F5E0,#CCEABD)', title: 'County / Regional Government', desc: 'Turkana, North Pokot, Moroto, Amudat and Napak authorities share policy documents and M&E.', href: '/organizations' },
  { icon: '🤝', bg: 'linear-gradient(135deg,#F5E8FF,#E8CCFF)', title: 'NGOs, UN & Partners', desc: 'Registered humanitarian organisations share 4Ws, needs assessments and coordination docs.', href: '/organizations' },
];

const partnerBadges = ['KMD', 'UMA', 'NDMA', 'OPM', 'OCHA', 'FAO', 'ICPAC', 'UNICEF', 'WFP', '+ 38 more'];

export default function OrganizationsSection() {
  return (
    <Box sx={{ bgcolor: '#3D2B1F', py: { xs: 7, md: 10 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 5 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#D4A96A', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>
              Organization Portals
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.2rem' }, color: 'white' }}>
              Coordinating Across
              <br />
              Borders & Agencies
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/organizations"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderColor: 'rgba(212,169,106,0.4)', color: '#D4A96A', '&:hover': { bgcolor: 'rgba(212,169,106,0.08)', borderColor: '#D4A96A' } }}
          >
            All Organizations
          </Button>
        </Box>

        {/* Portal cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 5 }}>
          {portals.map((p) => (
            <Box
              key={p.title}
              component={Link}
              href={p.href}
              sx={{
                flex: '1 1 calc(50% - 10px)',
                minWidth: { xs: '100%', sm: 'calc(50% - 10px)' },
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                overflow: 'hidden',
                textDecoration: 'none',
                display: 'block',
                transition: 'all 0.25s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(212,169,106,0.3)',
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Box sx={{ background: p.bg, px: 2.5, py: 2, fontSize: '2rem' }}>{p.icon}</Box>
              <Box sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', mb: 0.8 }}>{p.title}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#9A9A9A', lineHeight: 1.6 }}>{p.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Partner badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', mr: 0.5 }}>VERIFIED PARTNERS:</Typography>
          {partnerBadges.map((p) => (
            <Box
              key={p}
              sx={{
                px: 1.5,
                py: 0.4,
                bgcolor: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 1,
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#D4A96A',
                letterSpacing: '0.04em',
              }}
            >
              {p}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
