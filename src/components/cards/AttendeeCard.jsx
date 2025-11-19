import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

const AttendeeCard = ({ attendee, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {attendee.name || attendee.Name || 'Unknown Attendee'}
          </h3>
          
          <div className="mt-2 space-y-1">
            {(attendee.email || attendee.Email) && (
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{attendee.email || attendee.Email}</span>
              </div>
            )}
            
            {(attendee.phone || attendee.Phone || attendee.phone_number) && (
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{attendee.phone || attendee.Phone || attendee.phone_number}</span>
              </div>
            )}
          </div>
          
          {(attendee.registration_date || attendee.Registration_Date) && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Registered: {new Date(attendee.registration_date || attendee.Registration_Date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeeCard;