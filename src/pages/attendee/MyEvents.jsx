import React, { useEffect, useState } from 'react';
import AttendeeLayout from '../../components/layout/AttendeeLayout';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCard from '../../components/cards/EventCard';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.Attendee_Id) {
      setLoading(true);
      apiService.getRegisteredEvents(user.Attendee_Id)
        .then(data => {
          setEvents(data || []);
        })
        .catch(err => {
          console.error("Failed to fetch events", err);
          setEvents([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <AttendeeLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Registered Events</h1>
        {loading ? (
          <LoadingSpinner size="lg" text="Loading events..." />
        ) : events.length === 0 ? (
          <div className="text-gray-600 text-lg mt-8 text-center">
            You are not participating in any event.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.Event_Id || event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </AttendeeLayout>
  );
};

export default MyEvents;
