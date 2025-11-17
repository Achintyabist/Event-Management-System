import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AttendeeDashboard() {
  const { userProfile, signOut } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchMyEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizers(name),
          event_participants(count)
        `)
        .in('status', ['upcoming', 'ongoing'])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setAllEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          *,
          events(
            *,
            organizers(name)
          )
        `)
        .eq('attendee_id', userProfile.id)
        .neq('status', 'cancelled');

      if (error) throw error;
      setMyEvents(data || []);
    } catch (error) {
      console.error('Error fetching my events:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const event = allEvents.find(e => e.id === eventId);
      const participantCount = event.event_participants?.[0]?.count || 0;

      if (participantCount >= event.capacity) {
        alert('Event is full!');
        return;
      }

      const { data: existingReg } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('attendee_id', userProfile.id)
        .maybeSingle();

      if (existingReg) {
        alert('You are already registered for this event!');
        return;
      }

      const { error } = await supabase
        .from('event_participants')
        .insert([{
          event_id: eventId,
          attendee_id: userProfile.id,
          status: 'registered'
        }]);

      if (error) throw error;

      alert('Successfully registered for the event!');
      fetchEvents();
      fetchMyEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for event');
    }
  };

  const handleCancelRegistration = async (participationId) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id', participationId);

      if (error) throw error;

      alert('Registration cancelled successfully!');
      fetchEvents();
      fetchMyEvents();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      alert('Failed to cancel registration');
    }
  };

  const filteredAllEvents = allEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyEvents = myEvents.filter(participation =>
    participation.events.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participation.events.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participation.events.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isRegistered = (eventId) => {
    return myEvents.some(p => p.events.id === eventId);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Attendee Dashboard</h1>
          <p>Welcome, {userProfile?.name}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="actions-bar">
          <input
            type="search"
            placeholder="Search events by title, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Events ({filteredAllEvents.length})
          </button>
          <button
            className={`tab ${activeTab === 'my-events' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-events')}
          >
            My Events ({filteredMyEvents.length})
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="events-section">
            <h2>Available Events</h2>

            {loading ? (
              <p>Loading events...</p>
            ) : filteredAllEvents.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? 'No events match your search' : 'No upcoming events available'}</p>
              </div>
            ) : (
              <div className="events-grid">
                {filteredAllEvents.map((event) => {
                  const participantCount = event.event_participants?.[0]?.count || 0;
                  const isFull = participantCount >= event.capacity;
                  const registered = isRegistered(event.id);

                  return (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <span className={`status-badge ${event.status}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      <div className="event-details">
                        <div className="detail-item">
                          <strong>Organizer:</strong> {event.organizers?.name}
                        </div>
                        <div className="detail-item">
                          <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
                          {event.event_time && ` at ${event.event_time}`}
                        </div>
                        {event.location && (
                          <div className="detail-item">
                            <strong>Location:</strong> {event.location}
                          </div>
                        )}
                        <div className="detail-item">
                          <strong>Availability:</strong> {participantCount}/{event.capacity}
                          {isFull && <span className="full-badge">FULL</span>}
                        </div>
                      </div>
                      <div className="event-actions">
                        {registered ? (
                          <button className="btn-secondary" disabled>
                            Already Registered
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(event.id)}
                            className="btn-primary"
                            disabled={isFull}
                          >
                            {isFull ? 'Event Full' : 'Register'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-events' && (
          <div className="events-section">
            <h2>My Registered Events</h2>

            {filteredMyEvents.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? 'No events match your search' : 'You have not registered for any events yet'}</p>
              </div>
            ) : (
              <div className="events-grid">
                {filteredMyEvents.map((participation) => {
                  const event = participation.events;
                  return (
                    <div key={participation.id} className="event-card">
                      <div className="event-header">
                        <h3>{event.title}</h3>
                        <span className={`status-badge ${event.status}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      <div className="event-details">
                        <div className="detail-item">
                          <strong>Organizer:</strong> {event.organizers?.name}
                        </div>
                        <div className="detail-item">
                          <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
                          {event.event_time && ` at ${event.event_time}`}
                        </div>
                        {event.location && (
                          <div className="detail-item">
                            <strong>Location:</strong> {event.location}
                          </div>
                        )}
                        <div className="detail-item">
                          <strong>Registered on:</strong> {new Date(participation.registered_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="event-actions">
                        <button
                          onClick={() => handleCancelRegistration(participation.id)}
                          className="btn-danger"
                        >
                          Cancel Registration
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
