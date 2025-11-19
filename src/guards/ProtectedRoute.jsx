import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated()) {
    // Redirect authenticated users to their dashboard based on role
    const { isOrganizer, isAttendee } = useAuth();
    if (isOrganizer()) {
      return <Navigate to={ROUTES.ORGANIZER_DASHBOARD} replace />;
    }
    if (isAttendee()) {
      return <Navigate to={ROUTES.ATTENDEE_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default ProtectedRoute;