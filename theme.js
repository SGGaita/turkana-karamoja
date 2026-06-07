import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#C1440E',
      light: '#E8622A',
      dark: '#3D2B1F',
    },
    secondary: {
      main: '#2E7BB4',
      light: '#5BA3D9',
    },
    success: {
      main: '#2E8B57',
    },
    warning: {
      main: '#E87010',
    },
    error: {
      main: '#D63030',
    },
    background: {
      default: '#FDF6EC',
      paper: '#FFFDF9',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
    },
    custom: {
      sand: '#D4A96A',
      sandLight: '#F0D9B0',
      sandPale: '#FDF6EC',
      earth: '#3D2B1F',
      earthMid: '#6B4226',
      mist: '#E8E0D5',
      ash: '#9A9A9A',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '0em',
    },
    h5: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    subtitle1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0em',
    },
    body2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0em',
    },
    button: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
    caption: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.03em',
    },
    overline: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: '0.75rem',
      lineHeight: 2,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
          fontFamily: '"Montserrat", sans-serif',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(61,43,31,0.08)',
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'p',
          subtitle2: 'p',
          body1: 'p',
          body2: 'p',
        },
      },
    },
  },
});

export default theme;
