import { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ArticlesPage from './pages/ArticlesPage';
import { AuthProvider } from './hooks/AuthContext';
import { ProtectedLayout } from './components/Auth';
import { Role } from '@common/constants';

// Create a theme with primary and secondary colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#000',
    },
    secondary: {
      main: '#2e7d32',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Create a React Query client with optimal settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter basename="/admin">
            <Suspense fallback={<div>Loading admin view...</div>}>
              <Routes>
                {/* Public route - Login */}
                <Route path="/" element={<HomePage />} />

                {/* Protected routes - Accessible only by Admins and Managers */}
                <Route element={<ProtectedLayout minAccessRole={Role.MANAGER} />}>
                  {/* Events routes */}
                  <Route path="events" element={<EventsPage />} />
                  <Route path="events/:eventId" element={<EventsPage />} />
                  
                  {/* Activities routes */}
                  <Route path="events/:eventId/activities" element={<ActivitiesPage />} />
                  <Route path="events/:eventId/activities/:activityId" element={<ActivitiesPage />} />
                  <Route path="events/:eventId/activities/create" element={<ActivitiesPage />} />

                  {/* Articles routes */}
                  <Route path="articles" element={<ArticlesPage />} />
                  <Route path="articles/:articleId" element={<ArticlesPage />} />
                </Route>

                {/* Redirect all other paths to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
