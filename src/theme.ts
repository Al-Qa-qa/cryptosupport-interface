import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { red, green, lightGreen } from '@mui/material/colors';

/**
 *
 * Well Done...
 * make new boiler plate for wagmi connecting
 */

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          position: 'relative',
          minHeight: '100vh',
          paddingBottom: '56px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: green['900'],
    },
    secondary: {
      main: lightGreen['800'],
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontSize: 60,
      fontWeight: 700,
    },
    h2: {
      fontSize: 45,
      fontWeight: 700,
    },
    h3: {
      fontSize: 30,
      fontWeight: 500,
    },
    h4: {
      fontSize: 25,
      fontWeight: 400,
    },
  },
});

theme.typography.h1[theme.breakpoints.down('sm')] = {
  fontSize: 40,
};
theme.typography.h2[theme.breakpoints.down('sm')] = {
  fontSize: 32,
};
theme.typography.h3[theme.breakpoints.down('sm')] = {
  fontSize: 25,
};
theme.typography.h5[theme.breakpoints.down('sm')] = {
  fontSize: 18,
};

export default theme;
