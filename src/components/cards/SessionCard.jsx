import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, UserCheck, UserX, CreditCard as Edit, Trash2 } from 'lucide-react';
import { formatDate, formatTime, calculateSeatsLeft } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const SessionCard = ({ 
  session, 
  onRegister, 
  onUnregister, 
  onEdit, 
  onDelete, 
  showActions = false,
  showRegistration = false,
  className = '' 
}) => {
  const { isOrganizer, isAttendee } = useAuth();

  const seatsLeft = calculateSeatsLeft(session.Capacity || session.capacity, session.participants || 0);
  const isFull = seatsLeft <= 0;
  const isRegistered = session.registered || false;

  const getSessionLink = () => {
    if (isOrganizer()) {
      return ROUTES.ORGANIZER_SESSION_DETAIL(session.Schedule_Id || session.id);
    }
    return ROUTES.ATTENDEE_SESSION_DETAIL(session.Schedule_Id || session.id);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRegister(session);
  };

  const handleUnregister = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onUnregister(session);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(session);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(session);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      <Link to={getSessionLink()} className="block p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {session.Session_Name || session.name}
          </h3>
          
          {showActions && isOrganizer() && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit Session"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {formatDate(session.Session_Date || session.date)} at{' '}
              {formatTime(session.Start_Time || session.startTime)} -{' '}
              {formatTime(session.End_Time || session.endTime)}
            </span>
          </div>

          {(session.Venue_Name || session.venue) && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{session.Venue_Name || session.venue}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {session.participants || 0} / {session.Capacity || session.capacity} participants
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isFull 
                ? 'bg-red-100 text-red-800' 
                : seatsLeft <= 5
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {isFull ? 'Full' : `${seatsLeft} seats left`}
            </span>
            
            {isRegistered && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Registered
              </span>
            )}
          </div>

          {showRegistration && isAttendee() && (
            <div className="flex space-x-2">
              {isRegistered ? (
                <button
                  onClick={handleUnregister}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Unregister
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isFull}
                  className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md transition-colors ${
                    isFull
                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  {isFull ? 'Full' : 'Register'}
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default SessionCard;