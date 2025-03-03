import React, { useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import ActivityPage from './pages/ActivityPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticlePage from './pages/ArticlePage';
import TimelinePage from './pages/TimelinePage';
import queryClient from './utils/QueryClient';
import { ColorModeContext, useColorMode } from './utils/ColorMode';

function App() {
  const colorMode = useColorMode();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode.mode,
          primary: {
            main: colorMode.mode === 'light' ? '#000' : '#fff',
          },
        },
        typography: { fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif' },
      }),
    [colorMode.mode],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Articles routes - specific ones first */}
              <Route path="/articles/:articleId" element={<ArticlePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              {/* Timeline route */}
              <Route path="/timeline" element={<TimelinePage />} />
              {/* Event routes */}
              <Route path="/:eventId/:activityId" element={<ActivityPage />} />
              <Route path="/:eventId" element={<EventPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;