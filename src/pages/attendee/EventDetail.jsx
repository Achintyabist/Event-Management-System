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

  const [loading, setLoading] = useState(true);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // Get event info
      const eventData = await apiService.getEventById(id);
      setEvent(eventData);

      // Schedules
      const scheduleData = await apiService.request(`/api/events/${id}/schedules?attendeeId=${user.Attendee_Id}`);
      setSchedules(scheduleData || []);

    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);



  const handleSessionRegister = async (scheduleId) => {
    setLoading(true);
    try {
      await apiService.register(user.Attendee_Id, id, scheduleId);
      await fetchEventDetails();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSessionUnregister = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to unregister from this session?")) return;
    setLoading(true);
    try {
      await apiService.unregisterFromEvent(id, user.Attendee_Id, scheduleId);
      await fetchEventDetails();
    } catch (err) {
      console.error(err);
    }
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

        {/* Registration is now session-based only - see schedules below */}


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

        <ul className="list-none pl-0">
          {schedules
            .filter(s => s.Session_Name.toLowerCase().includes(searchTerm.toLowerCase()))
            .length > 0 ? (
            schedules
              .filter(s => s.Session_Name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(s => (
                <li key={s.Schedule_Id} className="mb-4 p-4 border rounded shadow-sm bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-lg">{s.Session_Name}</strong><br />
                      <span className="text-gray-600">Date:</span> {s.Session_Date ? s.Session_Date.split('T')[0] : ''}<br />
                      <span className="text-gray-600">Time:</span> {s.Start_Time} - {s.End_Time}<br />
                      <span className="text-gray-600">Venue:</span> {s.Venue_Name} ({s.Venue_Location})<br />
                      <span className="text-gray-600">Organizer:</span> {s.Session_Organizer}<br />
                      <span className="text-blue-600 font-semibold mt-1 block">
                        {s.registered_count} registered
                      </span>
                    </div>

                    <div>
                      {s.is_registered ? (
                        <button
                          onClick={() => handleSessionUnregister(s.Schedule_Id)}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-200"
                        >
                          Registered (Click to Unregister)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSessionRegister(s.Schedule_Id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
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
