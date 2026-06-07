import { Box, Typography, Button, Card, CardMedia, CardContent } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { fallbackProgrammes } from '../lib/fallback-data';

export default function CommunitySection({ programmes: programmesProp }) {
  const programs = (programmesProp?.length ? programmesProp : fallbackProgrammes).slice(0, 3);

  return (
    <Box id="community" sx={{ bgcolor: '#FDF6EC', py: { xs: 7, md: 10 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E8B57', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>
            Community Engagement
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.2rem' }, color: '#3D2B1F' }}>
              Empowering Action Through
              <br />
              Climate Knowledge
            </Typography>
            <Button component={Link} href="/community" variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ borderColor: '#2E8B57', color: '#2E8B57', '&:hover': { bgcolor: '#F0FFF6' } }}>
              View All Programmes
            </Button>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'white', border: '1px solid #D4A96A', borderLeft: '4px solid #D4A96A', borderRadius: 2, px: 3, py: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '1.4rem' }}>📱</Typography>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#3D2B1F' }}>Access via SMS / Radio</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', mt: 0.3 }}>
              Communities without internet receive alerts via SMS (Safaricom/MTN) or <strong>Turkana FM 89.5</strong> · <strong>Lodwar Community Radio</strong> · <strong>Radio Karamoja 107.3 FM</strong> - daily advisories at 07:00 & 18:00 EAT.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {programs.map((p) => (
            <Box key={p.id || p.title} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
              <Card sx={{ height: '100%', border: '1px solid #E8E0D5', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(61,43,31,0.12)' } }}>
                {p.img && <CardMedia component="img" image={p.img} alt={p.title} sx={{ height: 200, objectFit: 'cover' }} />}
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', mb: 1 }}>{p.title}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.65 }}>{p.desc}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
