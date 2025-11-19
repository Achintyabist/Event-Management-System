import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrganizerLayout from '../../components/layout/OrganizerLayout';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const EditEvent = () => {
    const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, execute } = useApi();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    event_id: '',
    event_name: '',
    event_description: '',
    event_date: '',
    event_time: '',
    venue_id: '',
    vendor_id: ''
  });

  useEffect(() => {
    execute(async () => {
      const eventData = await apiService.request(`/api/events/${id}`);
      setEvent(eventData);
      setFormData({
        event_id: eventData.event_id || eventData.Event_Id || '',
        event_name: eventData.event_name || eventData.Event_Name || '',
        event_description: eventData.event_description || eventData.Event_Description || '',
        event_date: eventData.event_date || eventData.Event_Date || '',
        event_time: eventData.event_time || eventData.Event_Time || '',
        venue_id: eventData.venue_id || eventData.Venue_Id || '',
        vendor_id: eventData.vendor_id || eventData.Vendor_Id || ''
      });
    });
  }, [id, execute]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(async () => {
      await apiService.request(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...formData, organizer_id: user.Organizer_Id })
      });
      navigate(ROUTES.ORGANIZER_EVENT_DETAIL(id));
    });
  };

  if (loading || !event) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading event..." />
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout>
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
            <input type="text" name="event_id" value={formData.event_id} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="event_description" value={formData.event_description} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="time" name="event_time" value={formData.event_time} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue ID</label>
            <input type="text" name="venue_id" value={formData.venue_id} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
            <input type="text" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Changes</button>
        </form>
      </div>
    </OrganizerLayout>
  );
};

export default EditEvent;
