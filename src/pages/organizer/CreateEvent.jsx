import React, { useState } from 'react';
import OrganizerLayout from '../../components/layout/OrganizerLayout';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const CreateEvent = () => {
  const { user } = useAuth();
  const { loading, execute } = useApi();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    event_name: '',
    event_description: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    console.log("User:", user);
console.log("Organizer Id:", user?.Organizer_Id);

    e.preventDefault();
    setError('');
    if (!formData.event_name || !formData.event_description) {
      setError('Event name and description are required.');
      return;
    }
    if (!user?.Organizer_Id) {
      setError('Organizer ID is missing. Please log in again.');
      return;
    }
    await execute(async () => {
      try {
        await apiService.createEvent({
          event_name: formData.event_name,
          event_description: formData.event_description,
          organizer_id: user.Organizer_Id
        });
        navigate(ROUTES.ORGANIZER_EVENTS);
      } catch (err) {
        setError(err.message || 'Failed to create event.');
      }
    });
  };

  return (
    <OrganizerLayout>
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Event</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="event_description" value={formData.event_description} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={!formData.event_name || !formData.event_description || !user?.Organizer_Id}>Create Event</button>
        </form>
      </div>
    </OrganizerLayout>
  );
};

export default CreateEvent;
