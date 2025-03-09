import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/AuthContext';
import { Role } from '@common/constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
}

const ProtectedRoute = ({ children, requiredRole = Role.ADMIN }: ProtectedRouteProps) => {
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
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
