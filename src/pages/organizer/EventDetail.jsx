import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import OrganizerLayout from "../../components/layout/OrganizerLayout";
import { apiService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useApi } from "../../hooks/useApi";
import { ROUTES } from "../../utils/constants";



const EventDetail = () => {
  const { id } = useParams();
  const { loading, execute } = useApi();

  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    execute(async () => {
      // Fetch Event
      const eventData = await apiService.request(`/api/events/${id}`);
      setEvent(eventData);

      // Fetch Schedules of Event
      const scheduleData = await apiService.request(`/api/events/${id}/schedules`);
      setSchedules(scheduleData || []);

      // Fetch Attendees of Event (across all schedules)
      const attendeeData = await apiService.request(`/api/events/${id}/attendees`);
      setAttendees(attendeeData || []);
    });
  }, [id, execute]);

  if (loading || !event) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading event details..." />
        </div>
      </OrganizerLayout>
    );
  }

  const handleDeleteSession = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
  
    await execute(async () => {
      await apiService.deleteSchedule(scheduleId);
  
      // refresh schedules list
      const schedulesData = await apiService.request(`/api/events/${id}/schedules`);
      setSchedules(schedulesData || []);
    });
  };
  
  return (
    <OrganizerLayout>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
        {/* EVENT INFO */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {event.Event_Name}
        </h2>
        
        <p className="mb-2 text-gray-700">{event.Event_Description}</p>

        <p className="text-gray-600 mb-6">
          Organizer ID: {event.Organizer_Id}
        </p>

        {/* SCHEDULES */}
        <div className="flex justify-between items-center mt-6 mb-2">
  <h3 className="text-xl font-semibold">Schedules</h3>

  <Link
    to={ROUTES.ORGANIZER_ADD_SESSION(event.Event_Id)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    + Add Session
  </Link>
</div>

        <ul className="list-disc pl-6">
          {schedules.length > 0 ? (
            schedules.map((s) => (
              <li key={s.Schedule_Id} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <strong>{s.Session_Name}</strong><br />
                    Date: {s.Session_Date}<br />
                    Time: {s.Start_Time} - {s.End_Time}<br />
                    Venue: {s.Venue_Name} ({s.Venue_Location})
                  </div>

                  <button
                    onClick={() => handleDeleteSession(s.Schedule_Id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    Delete
                  </button>
                </div>
              </li>

            ))
          ) : (
            <li>No schedules yet.</li>
          )}
        </ul>

        {/* ATTENDEES */}
        <h3 className="text-xl font-semibold mt-6 mb-2">Attendees</h3>
        <ul className="list-disc pl-6">
          {attendees.length > 0 ? (
            attendees.map((att) => (
              <li key={att.Attendee_Id} className="mb-1">
                {att.Name} ({att.Email})
              </li>
            ))
          ) : (
            <li>No attendees yet.</li>
          )}
        </ul>
      </div>
    </OrganizerLayout>
  );
};

export default EventDetail;
