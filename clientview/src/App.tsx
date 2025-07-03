import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import InstallPrompt from '@components/shared/InstallPrompt';
import { LoginProvider } from '@components/shared/LoginContext';
import ActivityPage from './pages/ActivityPage';
import ArticlePage from './pages/ArticlePage';
import ArticlesPage from './pages/ArticlesPage';
import EventPage from './pages/EventPage';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import { ColorModeContext, useColorMode } from './utils/ColorMode';
import queryClient from './utils/QueryClient';
import React from 'react';

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
          <LoginProvider>
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

              {/*
                Delay showing InstallPrompt by 20 seconds
              */}
              {(() => {
                const [showPrompt, setShowPrompt] = React.useState(false);
                React.useEffect(() => {
                  const timer = setTimeout(() => setShowPrompt(true), 20000);
                  return () => clearTimeout(timer);
                }, []);
                return showPrompt ? <InstallPrompt /> : null;
              })()}

              {/* Vercel Analytics */}
              <SpeedInsights />
            </BrowserRouter>
          </LoginProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;