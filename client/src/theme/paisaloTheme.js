import { createTheme } from '@mui/material/styles';

// Paisalo Digital Limited Color Palette
// Based on financial services industry standards and professional corporate branding
const paisaloColors = {
  primary: {
    main: '#1565C0', // Deep Blue - Trust, Stability, Finance
    light: '#42A5F5', // Light Blue
    dark: '#0D47A1', // Dark Blue
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#FF7043', // Orange - Energy, Growth, Innovation
    light: '#FFAB91', // Light Orange
    dark: '#D84315', // Dark Orange
    contrastText: '#FFFFFF'
  },
  success: {
    main: '#2E7D32', // Green - Success, Growth, Prosperity
    light: '#66BB6A',
    dark: '#1B5E20',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#F57C00', // Amber - Caution, Attention
    light: '#FFB74D',
    dark: '#E65100',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#C62828', // Red - Error, Alert
    light: '#EF5350',
    dark: '#B71C1C',
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#0288D1', // Info Blue
    light: '#4FC3F7',
    dark: '#01579B',
    contrastText: '#FFFFFF'
  },
  background: {
    default: '#F8F9FA', // Light Gray Background
    paper: '#FFFFFF',
    secondary: '#F5F5F5'
  },
  text: {
    primary: '#212121', // Dark Gray
    secondary: '#757575', // Medium Gray
    disabled: '#BDBDBD'
  },
  divider: '#E0E0E0',
  // Custom Paisalo Brand Colors
  paisalo: {
    gold: '#FFD700', // Gold accent for premium features
    darkBlue: '#0D47A1', // Corporate dark blue
    lightBlue: '#E3F2FD', // Light blue backgrounds
    orange: '#FF7043', // Brand orange
    lightOrange: '#FFF3E0', // Light orange backgrounds
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    }
  }
};

const paisaloTheme = createTheme({
  palette: paisaloColors,
  typography: {
    fontFamily: [
      'Roboto',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: paisaloColors.text.primary,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: paisaloColors.text.primary,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: paisaloColors.text.primary,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: paisaloColors.text.primary,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: paisaloColors.text.primary,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: paisaloColors.text.primary,
      lineHeight: 1.4
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: paisaloColors.text.primary,
      lineHeight: 1.5
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: paisaloColors.text.secondary,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: paisaloColors.text.primary,
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: paisaloColors.text.secondary,
      lineHeight: 1.6
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: paisaloColors.text.secondary,
      lineHeight: 1.4
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: paisaloColors.text.secondary,
      lineHeight: 1.4
    }
  },
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  components: {
    // Button customizations
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px'
          }
        }
      }
    },
    // Card customizations
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: `1px solid ${paisaloColors.divider}`,
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    // Paper customizations
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0,0,0,0.10)'
        }
      }
    },
    // TextField customizations
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: paisaloColors.primary.main
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px'
            }
          }
        }
      }
    },
    // Chip customizations
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.75rem'
        },
        colorPrimary: {
          backgroundColor: paisaloColors.primary.light,
          color: paisaloColors.primary.contrastText
        },
        colorSecondary: {
          backgroundColor: paisaloColors.secondary.light,
          color: paisaloColors.secondary.contrastText
        }
      }
    },
    // AppBar customizations
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: paisaloColors.primary.main,
          boxShadow: '0 2px 12px rgba(21,101,192,0.15)'
        }
      }
    },
    // Drawer customizations
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${paisaloColors.divider}`,
          backgroundColor: paisaloColors.background.paper
        }
      }
    },
    // Table customizations
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: paisaloColors.paisalo.lightBlue,
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: paisaloColors.primary.main,
            fontSize: '0.875rem'
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: paisaloColors.background.secondary
          },
          '&:hover': {
            backgroundColor: paisaloColors.paisalo.lightBlue
          }
        }
      }
    },
    // Dialog customizations
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }
    },
    // Alert customizations
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        },
        standardSuccess: {
          backgroundColor: '#E8F5E8',
          color: paisaloColors.success.dark,
          '& .MuiAlert-icon': {
            color: paisaloColors.success.main
          }
        },
        standardError: {
          backgroundColor: '#FFEBEE',
          color: paisaloColors.error.dark,
          '& .MuiAlert-icon': {
            color: paisaloColors.error.main
          }
        },
        standardWarning: {
          backgroundColor: '#FFF8E1',
          color: paisaloColors.warning.dark,
          '& .MuiAlert-icon': {
            color: paisaloColors.warning.main
          }
        },
        standardInfo: {
          backgroundColor: paisaloColors.paisalo.lightBlue,
          color: paisaloColors.info.dark,
          '& .MuiAlert-icon': {
            color: paisaloColors.info.main
          }
        }
      }
    }
  }
});

export default paisaloTheme;

