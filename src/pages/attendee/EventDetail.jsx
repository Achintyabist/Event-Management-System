import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttendeeLayout from '../../components/layout/AttendeeLayout';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';


const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [venue, setVenue] = useState(null);
  const [organizer, setOrganizer] = useState(null);

  // Fetch event details, participants, venue, organizer
  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const eventData = await apiService.getEventById(id);
      setEvent(eventData);

      // Fetch participants
      const attendeeData = await apiService.request(`/api/events/${id}/attendees`);
      setParticipants(attendeeData || []);

      // Fetch venue info
      if (eventData.venue_id || eventData.Venue_Id) {
        const venueId = eventData.venue_id || eventData.Venue_Id;
        const venues = await apiService.getVenues();
        setVenue(venues.find(v => v.Venue_Id === venueId || v.id === venueId));
      }

      // Fetch organizer info
      if (eventData.organizer_id || eventData.Organizer_Id) {
        const organizerId = eventData.organizer_id || eventData.Organizer_Id;
        setOrganizer({ Organizer_Id: organizerId });
      }

      // Check if user is registered
      const registeredEvents = await apiService.getRegisteredEvents(user.Attendee_Id);
      setRegistered((registeredEvents || []).some(e => (e.Event_Id || e.id) == id));
    } catch (err) {
      // TODO: Show error toast if needed
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line
  }, [id, user]);

  const handleRegister = async () => {
    setLoading(true);
    await apiService.register(user.Attendee_Id, id);
    await fetchEventDetails();
    setLoading(false);
  };

  const handleUnregister = async () => {
    setLoading(true);
    await apiService.unregisterFromEvent(id);
    await fetchEventDetails();
    setLoading(false);
  };

  if (loading || !event) {
    return (
      <AttendeeLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading event details..." />
        </div>
      </AttendeeLayout>
    );
  }

  return (
    <AttendeeLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{event.event_name || event.Event_Name}</h2>
        <p className="mb-2 text-gray-700">{event.event_description || event.Event_Description}</p>
        <div className="mb-4 text-gray-600">
          <span>Date: {event.event_date || event.Event_Date}</span><br/>
          <span>Time: {event.event_time || event.Event_Time}</span><br/>
          <span>Venue: {venue ? `${venue.Name || venue.name} (${venue.Location || venue.location})` : (event.venue_id || event.Venue_Id)}</span><br/>
          <span>Organizer: {organizer ? organizer.Name || organizer.Organizer_Id : (event.organizer_id || event.Organizer_Id)}</span><br/>
          <span>Participants: {participants.length}</span>
        </div>
        <div className="mt-6">
          {registered ? (
            <button onClick={handleUnregister} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Unregister</button>
          ) : (
            <button onClick={handleRegister} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Register</button>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Participants</h3>
          <ul className="list-disc pl-6">
            {participants.length > 0 ? participants.map(att => (
              <li key={att.Attendee_Id || att.id}>{att.name} ({att.email})</li>
            )) : <li>No participants yet.</li>}
          </ul>
        </div>
      </div>
    </AttendeeLayout>
  );
};

export default EventDetail;
