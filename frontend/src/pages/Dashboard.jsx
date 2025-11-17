import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import OrganizerDashboard from './OrganizerDashboard';
import AttendeeDashboard from './AttendeeDashboard';

export default function Dashboard() {
  const { userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!userType) {
    return <Navigate to="/login" />;
  }

  if (userType === 'organizer') {
    return <OrganizerDashboard />;
  }

  if (userType === 'attendee') {
    return <AttendeeDashboard />;
  }

  return <Navigate to="/login" />;
}
