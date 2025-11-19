import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerLayout from "../../components/layout/OrganizerLayout";
import { apiService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { ROUTES } from "../../utils/constants";

const CreateSession = () => {
  const { id: eventId } = useParams(); // event id from URL
  const { loading, execute } = useApi();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    session_name: "",
    session_date: "",
    session_organizer: "",
    start_time: "",
    end_time: "",
    venue_id: ""
  });

  const [error, setError] = useState("");

  useEffect(() => {
    // Load venues list
    execute(async () => {
      const data = await apiService.getVenues();
      setVenues(data);
    });
  }, [execute]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.session_name ||
      !form.session_organizer||
      !form.session_date ||
      !form.start_time ||
      !form.end_time ||
      !form.venue_id
    ) {
      setError("All fields are required.");
      return;
    }

    await execute(async () => {
      try {
        await apiService.createSchedule({
          session_name: form.session_name,
          session_organizer: form.session_organizer,
          session_date: form.session_date,
          start_time: form.start_time,
          end_time: form.end_time,
          venue_id: form.venue_id,
          event_id: eventId
        });

        navigate(ROUTES.ORGANIZER_EVENT_DETAIL(eventId));
      } catch (err) {
        setError(err.message || "Failed to create session.");
      }
    });
  };

  return (
    <OrganizerLayout>
      <div className="max-w-xl mx-auto bg-white shadow p-8 rounded mt-6">
        <h2 className="text-2xl font-bold mb-4">Add Session</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1">Session Name</label>
            <input
              type="text"
              name="session_name"
              value={form.session_name}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Session Organizer</label>
            <input
                type="text"
                name="session_organizer"
                value={form.session_organizer}
                onChange={handleChange}
                className="w-full border rounded p-2"
            />
            </div>

          <div>
            <label className="block mb-1">Date</label>
            <input
              type="date"
              name="session_date"
              value={form.session_date}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-1">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-1">End Time</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-1">Venue</label>
            <select
              name="venue_id"
              value={form.venue_id}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Venue</option>
              {venues.map((v) => (
                <option key={v.Venue_Id} value={v.Venue_Id}>
                  {v.Name} — {v.Location}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Session
          </button>
        </form>
      </div>
    </OrganizerLayout>
  );
};

export default CreateSession;
