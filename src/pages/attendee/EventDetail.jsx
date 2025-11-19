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
  const [schedules, setSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // Get event info
      const eventData = await apiService.getEventById(id);
      setEvent(eventData);

      // Schedules
      const scheduleData = await apiService.request(`/api/events/${id}/schedules`);
      setSchedules(scheduleData || []);



      // Check registration
      const regEvents = await apiService.getRegisteredEvents(user.Attendee_Id);
      setRegistered((regEvents || []).some(e => (e.Event_Id || e.id) == id));
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const handleRegister = async () => {
    setLoading(true);
    await apiService.register(user.Attendee_Id, id);
    await fetchEventDetails();
    setLoading(false);
  };

  const handleUnregister = async () => {
    setLoading(true);
    await apiService.unregisterFromEvent(id, user.Attendee_Id);
    await fetchEventDetails();
    setLoading(false);
  };

  if (loading || !event) {
    return (
      <AttendeeLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading event..." />
        </div>
      </AttendeeLayout>
    );
  }

  return (
    <AttendeeLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">

        {/* EVENT HEADER */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {event.Event_Name}
        </h2>

        <p className="mb-4 text-gray-700">
          {event.Event_Description}
        </p>

        <p className="text-gray-600 mb-4">
          Organizer: {event.Organizer_Name || event.Organizer_Id}
        </p>

        {/* REGISTER / UNREGISTER */}
        <div className="mt-4 mb-8">
          {registered ? (
            <button
              onClick={handleUnregister}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Unregister
            </button>
          ) : (
            <button
              onClick={handleRegister}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register
            </button>
          )}
        </div>

        {/* SCHEDULES */}
        <h3 className="text-xl font-semibold mt-6 mb-2">Schedules</h3>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <ul className="list-disc pl-6">
          {schedules
            .filter(s => s.Session_Name.toLowerCase().includes(searchTerm.toLowerCase()))
            .length > 0 ? (
            schedules
              .filter(s => s.Session_Name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(s => (
                <li key={s.Schedule_Id} className="mb-2">
                  <strong>{s.Session_Name}</strong><br />
                  Date: {s.Session_Date}<br />
                  Time: {s.Start_Time} - {s.End_Time}<br />
                  Venue: {s.Venue_Name} ({s.Venue_Location})<br />
                  Organizer: {s.Session_Organizer}
                </li>
              ))
          ) : (
            <li>No schedules found.</li>
          )}
        </ul>

      </div>
    </AttendeeLayout>
  );
};

export default EventDetail;
