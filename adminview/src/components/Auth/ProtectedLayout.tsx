import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/AuthContext';
import { Role } from '@common/constants';

interface ProtectedLayoutProps {
  minAccessRole?: Role;
}

/**
 * A layout component that protects routes requiring authentication
 * Uses Outlet from react-router to render nested child routes when authenticated
 */
const ProtectedLayout = ({ minAccessRole = Role.ADMIN }: ProtectedLayoutProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the location the user was trying to access for potential redirect after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role requirements using simple numeric comparison
  // If user's role value is less than the minimum required role value, deny access
  if ((user?.role || Role.GUEST) < minAccessRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render child routes using Outlet when the user is authenticated and authorized
  return <Outlet />;
};

export default ProtectedLayout;
