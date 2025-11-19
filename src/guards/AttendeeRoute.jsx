import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AttendeeRoute = ({ children }) => {
  const { isAuthenticated, isAttendee, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!isAttendee()) {
    // Redirect non-attendees to their appropriate dashboard
    if (isOrganizer()) {
      return <Navigate to={ROUTES.ORGANIZER_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default AttendeeRoute;