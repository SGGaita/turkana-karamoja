import { Box, Typography } from '@mui/material';

const CHEVRON = 22;

const STEP_COLORS = ['#3D2B1F', '#5C3D2E', '#8B4513', '#C1440E'];

function chevronClip(index, total) {
  if (total === 1) return 'none';
  if (index === 0) {
    return `polygon(0 0, calc(100% - ${CHEVRON}px) 0, 100% 50%, calc(100% - ${CHEVRON}px) 100%, 0 100%)`;
  }
  if (index === total - 1) {
    return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${CHEVRON}px 50%)`;
  }
  return `polygon(0 0, calc(100% - ${CHEVRON}px) 0, 100% 50%, calc(100% - ${CHEVRON}px) 100%, 0 100%, ${CHEVRON}px 50%)`;
}

function StepCard({ item, index, total }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const accent = STEP_COLORS[index] || STEP_COLORS[STEP_COLORS.length - 1];

  return (
    <Box
      sx={{
        position: 'relative',
        flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)', lg: '1 1 0' },
        minWidth: 0,
        zIndex: total - index,
        ml: {
          xs: 0,
          lg: isFirst ? 0 : `-${CHEVRON - 4}px`,
        },
        mt: { xs: index > 0 ? 1.5 : 0, lg: 0 },
      }}
    >
      <Box
        sx={{
          height: '100%',
          minHeight: { xs: 140, lg: 200 },
          bgcolor: index % 2 === 0 ? '#FDF6EC' : '#F5EDE0',
          border: '1px solid #E8E0D5',
          clipPath: {
            xs: 'none',
            lg: chevronClip(index, total),
          },
          borderRadius: { xs: 2, lg: 0 },
          pl: { xs: 2.5, lg: isFirst ? 2.5 : 4 },
          pr: { xs: 2.5, lg: isLast ? 2.5 : 3.5 },
          py: { xs: 2.5, lg: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: { lg: 'translateY(-3px)' },
            boxShadow: { lg: '0 8px 24px rgba(61, 43, 31, 0.12)' },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: accent,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {item.step}
          </Box>
          {!isLast && (
            <Box
              sx={{
                display: { xs: 'block', lg: 'none' },
                flex: 1,
                height: 2,
                bgcolor: '#E8E0D5',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '6px solid #C1440E',
                },
              }}
            />
          )}
        </Box>

        <Typography
          sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '0.95rem', lg: '1rem' },
            color: '#3D2B1F',
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '0.82rem', lg: '0.85rem' },
            color: '#5A5A5A',
            lineHeight: 1.65,
            flex: 1,
          }}
        >
          {item.description}
        </Typography>
      </Box>
    </Box>
  );
}

export default function HowItWorksStepper({ steps }) {
  const items = steps?.length ? steps : [];

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: { xs: '1.6rem', md: '2rem' },
          color: '#3D2B1F',
          mb: 3,
        }}
      >
        How the Hub Works
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          flexWrap: { xs: 'nowrap', md: 'wrap', lg: 'nowrap' },
          gap: { xs: 0, md: 2, lg: 0 },
          alignItems: 'stretch',
          filter: { lg: 'drop-shadow(0 2px 8px rgba(61, 43, 31, 0.08))' },
        }}
      >
        {items.map((item, index) => (
          <StepCard key={item.title} item={item} index={index} total={items.length} />
        ))}
      </Box>
    </Box>
  );
}
