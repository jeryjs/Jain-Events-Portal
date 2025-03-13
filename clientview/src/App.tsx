import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ActivityPage from './pages/ActivityPage';
import ArticlePage from './pages/ArticlePage';
import ArticlesPage from './pages/ArticlesPage';
import EventPage from './pages/EventPage';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import { ColorModeContext, useColorMode } from './utils/ColorMode';
import queryClient from './utils/QueryClient';

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
        typography: { fontFamily: '"Roboto","Helvetica","Arial",sans-serif' },
      }),
    [colorMode.mode],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
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
          </BrowserRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;