import React, { createContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';

// Define theme settings
const themeSettings = {
    palette: {
        primary: {
            main: '#3498db',
            light: '#5dade2',
            dark: '#2980b9',
            contrastText: '#fff',
        },
        secondary: {
            main: '#2c3e50',
            light: '#34495e',
            dark: '#1a252f',
            contrastText: '#fff',
        },
        background: {
            default: '#f5f7fa',
            paper: '#fff',
        },
        text: {
            primary: '#333',
            secondary: '#7f8c8d',
        },
        error: {
            main: '#d63031',
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        h1: {
            fontSize: '2rem',
            fontWeight: 500,
            color: '#2c3e50',
        },
        subtitle1: {
            color: '#7f8c8d',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 4,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontSize: '1rem',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
};

// Create a context for theme toggling if needed in the future
export const ColorModeContext = createContext({
    toggleColorMode: () => { },
});

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        []
    );

    const theme = useMemo(() => createTheme(themeSettings), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default ThemeProvider;
