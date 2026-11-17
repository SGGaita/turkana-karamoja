import Link from 'next/link';
import { Box, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShareLinks from './ShareLinks';
import { useT } from '../contexts/LanguageContext';
import Picture from './Picture';
import { badge } from '../lib/contrast';

export default function CommunityInitiativeCard({ item, compact = false }) {
  const t = useT();
  const href = `/community/${item.slugPath}`;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #E8E0D5',
        transition: 'all 0.25s',
        '&:hover': { transform: compact ? 'none' : 'translateY(-4px)', boxShadow: compact ? 'none' : '0 16px 40px rgba(61,43,31,0.12)' },
      }}
    >
      {item.img && (
        <Picture
          src={item.img}
          alt={item.title}
          sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
          sx={{ height: compact ? 160 : 200, flexShrink: 0 }}
        />
      )}
      <CardContent sx={{ flex: 1, p: compact ? 2 : 2.5, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label={item.tag} size="small" sx={{ ...badge(item.tagColor), fontSize: '0.65rem', height: 20 }} />
          <Typography sx={{ fontSize: '0.68rem', color: '#6B6B6B', fontFamily: '"Montserrat", sans-serif', ml: 'auto' }}>
            {item.date}
          </Typography>
        </Box>

        <Typography
          component={Link}
          href={href}
          sx={{
            fontWeight: 700,
            fontSize: compact ? '0.88rem' : '0.95rem',
            color: '#3D2B1F',
            mb: 1,
            lineHeight: 1.35,
            textDecoration: 'none',
            '&:hover': { color: '#C1440E' },
          }}
        >
          {item.title}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.8rem',
            color: '#5A5A5A',
            lineHeight: 1.6,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: compact ? 3 : 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.desc}
        </Typography>

        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ShareLinks title={item.title} path={href} />
          <Button
            component={Link}
            href={href}
            size="small"
            aria-label={`${t('common.read_more')}: ${item.title}`}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ alignSelf: 'flex-start', color: '#C1440E', fontWeight: 600, p: 0, textTransform: 'none' }}
          >
            {t('common.read_more')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
