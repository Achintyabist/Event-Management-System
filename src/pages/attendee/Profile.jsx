import React from 'react';
import AttendeeLayout from '../../components/layout/AttendeeLayout';
import { useAuth } from '../../context/AuthContext';


const AttendeeProfile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AttendeeLayout>
        <div className="flex items-center justify-center h-64">
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </AttendeeLayout>
    );
  }

  return (
    <AttendeeLayout>
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Attendee Profile</h2>
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
            <span className="font-semibold text-gray-700">Attendee ID:</span>
            <span className="ml-2 text-gray-900">{user?.Attendee_Id || user?.id || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Role:</span>
            <span className="ml-2 text-gray-900">Attendee</span>
          </div>
        </div>
      </div>
    </AttendeeLayout>
  );
};

export default AttendeeProfile;
