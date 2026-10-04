import { Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudIcon from '@mui/icons-material/Cloud';
import GroupsIcon from '@mui/icons-material/Groups';
import CellTowerIcon from '@mui/icons-material/CellTower';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const CARD_THEMES = [
  { accent: '#C1440E', bg: '#FDF6EC', iconBg: '#C1440E' },
  { accent: '#8B4513', bg: '#F8F2EC', iconBg: '#8B4513' },
  { accent: '#6B4226', bg: '#F5EDE0', iconBg: '#6B4226' },
  { accent: '#A0522D', bg: '#FBF5EF', iconBg: '#A0522D' },
  { accent: '#5C3D2E', bg: '#F3EBE3', iconBg: '#5C3D2E' },
  { accent: '#3D2B1F', bg: '#EDE4DA', iconBg: '#3D2B1F' },
];

const FEATURE_ICONS = [
  WarningAmberIcon,
  CloudIcon,
  GroupsIcon,
  CellTowerIcon,
  PublicIcon,
  VerifiedUserIcon,
];

function FeatureCard({ feature, index }) {
  const theme = CARD_THEMES[index % CARD_THEMES.length];
  const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];

  return (
    <Box
      sx={{
        flex: '1 1 calc(33.333% - 16px)',
        minWidth: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(33.333% - 16px)' },
        bgcolor: theme.bg,
        border: '1px solid #E8E0D5',
        borderRadius: 3,
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 40px rgba(61, 43, 31, 0.12)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: theme.accent,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: theme.accent,
          opacity: 0.06,
        },
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2.5,
          bgcolor: theme.iconBg,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          boxShadow: `0 6px 16px ${theme.accent}44`,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>

      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          color: '#3D2B1F',
          mb: 1,
          lineHeight: 1.35,
        }}
      >
        {feature.title}
      </Typography>

      <Typography
        sx={{
          fontSize: '0.85rem',
          color: '#5A5A5A',
          lineHeight: 1.65,
        }}
      >
        {feature.description}
      </Typography>
    </Box>
  );
}

export default function KeyFeaturesCards({ features }) {
  const items = features?.length ? features : [];

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 700,
            color: '#3D2B1F',
            mb: 1,
          }}
        >
          Key Features &amp; Services
        </Typography>
        <Box sx={{ width: 64, height: 4, bgcolor: '#C1440E', borderRadius: 2 }} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
        }}
      >
        {items.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </Box>
    </Box>
  );
}
