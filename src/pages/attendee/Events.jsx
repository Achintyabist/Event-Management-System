import React, { useEffect, useState } from 'react';
import AttendeeLayout from '../../components/layout/AttendeeLayout';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCard from '../../components/cards/EventCard';
import SearchBar from '../../components/filters/SearchBar';
import { useAuth } from '../../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getEvents({ hasSessions: true }),
      user ? apiService.getRegisteredEvents(user.Attendee_Id) : Promise.resolve([])
    ]).then(([allEvents, regEvents]) => {
      // Only show required fields
      const filteredEvents = (allEvents || []).map(e => ({
        Event_Id: e.Event_Id,
        Event_Name: e.Event_Name,
        Event_Description: e.Event_Description,
        participants: e.participants || 0,
        venue: e.Venue || null,
        date: e.Event_Date || null,
        time: e.Event_Time || null
      }));

      setEvents(filteredEvents);
      setRegisteredEvents((regEvents || []).map(e => e.Event_Id || e.id));
      setLoading(false);
    });
  }, [user]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredEvents = events.filter(event =>
    (event.Event_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.Event_Description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleParticipate = async (eventId) => {
    setLoading(true);
    await apiService.register(user.Attendee_Id, eventId);
    // Refresh registered events
    const regEvents = await apiService.getRegisteredEvents(user.Attendee_Id);
    setRegisteredEvents((regEvents || []).map(e => e.Event_Id || e.id));
    setLoading(false);
  };

  return (
    <AttendeeLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Browse Events</h1>
        <SearchBar placeholder="Search events..." onSearch={handleSearch} className="mb-4 w-64" />
        {loading ? (
          <LoadingSpinner size="lg" text="Loading events..." />
        ) : filteredEvents.length === 0 ? (
          <div>No events found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const isRegistered = registeredEvents.includes(event.Event_Id);
              return (
                <div key={event.Event_Id}>
                  <EventCard event={event} />
                  <div className="mt-2">
                    {isRegistered ? (
                      <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
                        Registered
                      </button>
                    ) : (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => handleParticipate(event.Event_Id)}>
                        Register
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AttendeeLayout>
  );
};

export default Events;
