import { Box, Typography, Button, Card, CardMedia, CardContent, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { fallbackInitiatives } from '../lib/fallback-data';

export default function InitiativesSection({ initiatives: initiativesProp }) {
  const initiatives = initiativesProp?.length ? initiativesProp : fallbackInitiatives;

  return (
    <Box id="initiatives" sx={{ bgcolor: 'white', py: { xs: 7, md: 10 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#C1440E', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>
            Leading Initiatives
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.2rem' }, color: '#3D2B1F' }}>
              Leading the Way in
              <br />
              Climate Resilience
            </Typography>
            <Button variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ borderColor: '#C1440E', color: '#C1440E', '&:hover': { bgcolor: '#FFF0EC' } }}>
              More Initiatives
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {initiatives.map((init) => (
            <Box key={init.id || init.title} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #E8E0D5', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(61,43,31,0.14)' } }}>
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  {init.img && (
                    <CardMedia component="img" image={init.img} alt={init.title} sx={{ height: 200, objectFit: 'cover' }} />
                  )}
                  <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                    <Chip label={init.tag} size="small" sx={{ bgcolor: init.tagColor, color: 'white', fontWeight: 600, fontSize: '0.68rem' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <OpenInNewIcon sx={{ fontSize: 14, color: '#3D2B1F' }} />
                  </Box>
                </Box>
                <CardContent sx={{ flex: 1, p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#3D2B1F', mb: 1.2, lineHeight: 1.35 }}>{init.title}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.65 }}>{init.desc}</Typography>
                  <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} sx={{ mt: 2, color: '#C1440E', fontWeight: 600, p: 0 }}>
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
