import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function OrganizerDashboard() {
  const { userProfile, signOut } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    capacity: 50,
    status: 'upcoming',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*, event_participants(count)')
        .eq('organizer_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...formData, organizer_id: userProfile.id }])
        .select();

      if (error) throw error;

      setEvents([data[0], ...events]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        capacity: 50,
        status: 'upcoming',
      });
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== eventId));
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Organizer Dashboard</h1>
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
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancel' : 'Create New Event'}
          </button>
        </div>

        {showCreateForm && (
          <div className="form-card">
            <h2>Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="title">Event Title*</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter event title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Describe your event"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="event_date">Date*</label>
                  <input
                    type="date"
                    id="event_date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="event_time">Time</label>
                  <input
                    type="time"
                    id="event_time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="capacity">Capacity*</label>
                  <input
                    type="number"
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">Create Event</button>
            </form>
          </div>
        )}

        <div className="events-section">
          <h2>Your Events ({filteredEvents.length})</h2>

          {loading ? (
            <p>Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? 'No events match your search' : 'No events yet. Create your first event!'}</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
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
                      <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
                      {event.event_time && ` at ${event.event_time}`}
                    </div>
                    {event.location && (
                      <div className="detail-item">
                        <strong>Location:</strong> {event.location}
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>Capacity:</strong> {event.capacity}
                    </div>
                    <div className="detail-item">
                      <strong>Participants:</strong> {event.event_participants?.[0]?.count || 0}
                    </div>
                  </div>
                  <div className="event-actions">
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
