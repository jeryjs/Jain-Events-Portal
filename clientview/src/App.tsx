import React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMemo, useState, createContext } from 'react';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import ActivityPage from './pages/ActivityPage';
import queryClient from './utils/QueryClient';

interface ColorMode {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorMode>({
  mode: 'light', // Default value
  toggleColorMode: () => {},
});

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const colorMode = useMemo(
    () => ({
      mode: mode,
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode, // Set the mode here
          primary: {
            main: mode === 'light' ? '#000' : '#fff', // Adjust primary color based on mode
          },
        },
        typography: { fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif' },
      }),
    [mode],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:eventId" element={<EventPage />} />
              <Route path="/:eventId/:activityId" element={<ActivityPage />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;