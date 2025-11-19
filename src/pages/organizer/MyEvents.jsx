import React, { useEffect, useState } from 'react';
import OrganizerLayout from '../../components/layout/OrganizerLayout';
import EventCard from '../../components/cards/EventCard';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Fetch events for this organizer
        const allEvents = await apiService.getEvents();
        const myEvents = allEvents.filter(e => e.Organizer_Id === user.Organizer_Id);
        setEvents(myEvents);
      } catch (err) {
        setEvents([]);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [user]);

  const handleEdit = (eventId) => {
    window.location.href = `/organizer/events/${eventId}/edit`;
  };

  const handleDelete = async (eventId) => {
    setLoading(true);
    try {
      await apiService.request(`/api/events/${eventId}`, { method: 'DELETE' });
      setEvents(events.filter(e => (e.Event_Id || e.id) !== eventId));
    } catch (err) {
      // TODO: Show error toast if needed
    }
    setLoading(false);
  };

  return (
    <OrganizerLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Events</h1>
        {loading ? (
          <div>Loading...</div>
        ) : events.length === 0 ? (
          <div>No events found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard 
                key={event.Event_Id || event.id} 
                event={event} 
                showActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};

export default MyEvents;
