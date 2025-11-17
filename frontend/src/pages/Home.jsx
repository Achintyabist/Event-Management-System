import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Home() {
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userType) {
      navigate('/dashboard');
    }
  }, [user, userType]);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Event Management System</h1>
        <p className="home-subtitle">Organize and participate in amazing events</p>

        <div className="home-cards">
          <div className="home-card">
            <h2>For Organizers</h2>
            <p>Create and manage your events with ease. Track participants and organize successful events.</p>
            <div className="card-actions">
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/signup/organizer" className="btn-secondary">Sign Up</Link>
            </div>
          </div>

          <div className="home-card">
            <h2>For Attendees</h2>
            <p>Browse upcoming events and register for the ones you love. Never miss an exciting event again.</p>
            <div className="card-actions">
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/signup/attendee" className="btn-secondary">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
