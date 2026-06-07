import { Box, Typography, Button, Chip } from '@mui/material';
import Link from 'next/link';
import { fallbackNews } from '../lib/fallback-data';

export default function NewsSection({ news: newsProp }) {
  const news = newsProp?.length ? newsProp : fallbackNews;

  return (
    <Box id="news" sx={{ bgcolor: 'white', py: { xs: 7, md: 10 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#C1440E', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1 }}>Latest News</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', md: '2.1rem' }, color: '#3D2B1F' }}>Reports & Resources</Typography>
          </Box>
          <Button component={Link} href="/reports" variant="outlined" sx={{ borderColor: '#C1440E', color: '#C1440E', '&:hover': { bgcolor: '#FFF0EC' } }}>
            View All News
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 4 }}>
          {news.map((n) => (
            <Box key={n.id || n.title} sx={{ flex: '1 1 calc(50% - 10px)', minWidth: { xs: '100%', sm: 'calc(50% - 10px)' }, bgcolor: '#FDF6EC', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, flexWrap: 'wrap' }}>
                  <Chip label={n.tag} size="small" sx={{ bgcolor: n.tagColor, color: 'white', fontWeight: 600, fontSize: '0.62rem', height: 20 }} />
                  {n.isNew && <Chip label="NEW" size="small" sx={{ bgcolor: '#C1440E', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />}
                  {n.isUpdated && <Chip label="UPDATED" size="small" sx={{ bgcolor: '#2E7BB4', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F', lineHeight: 1.35, mb: 0.8 }}>{n.title}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.55, mb: 1 }}>{n.desc}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A', fontFamily: '"Montserrat", sans-serif' }}>{n.date}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
