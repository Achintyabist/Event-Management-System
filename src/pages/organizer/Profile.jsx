import React from 'react';
import OrganizerLayout from '../../components/layout/OrganizerLayout';
import { useAuth } from '../../context/AuthContext';


const OrganizerProfile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-64">
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout>
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Organizer Profile</h2>
        <div className="space-y-4">
          <div>
            <span className="font-semibold text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{user?.name || user?.Name || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Email:</span>
            <span className="ml-2 text-gray-900">{user?.email || user?.Email || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Phone:</span>
            <span className="ml-2 text-gray-900">{user?.phone || user?.Phone_Number || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Organizer ID:</span>
            <span className="ml-2 text-gray-900">{user?.Organizer_Id || user?.id || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Role:</span>
            <span className="ml-2 text-gray-900">Organizer</span>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default OrganizerProfile;
