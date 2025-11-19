import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, CreditCard as Edit, Trash2 } from 'lucide-react';
import { formatDate, truncateText } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const EventCard = ({ 
  event, 
  onEdit, 
  onDelete, 
  showActions = false,
  className = ''
}) => {
  const { isOrganizer } = useAuth();

  const getEventLink = () => {
    if (isOrganizer()) {
      return ROUTES.ORGANIZER_EVENT_DETAIL(event.Event_Id || event.id);
    }
    return ROUTES.ATTENDEE_EVENT_DETAIL(event.Event_Id || event.id);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(event.Event_Id || event.id, event);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(event.Event_Id || event.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      <Link to={getEventLink()} className="block p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {event.Event_Name || event.name}
          </h3>
          
          {showActions && isOrganizer() && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit Event"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-4">
          {truncateText(event.Event_Description || event.description, 120)}
        </p>


        <div className="space-y-2">
          {event.Event_Date || event.date ? (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(event.Event_Date || event.date)}</span>
            </div>
          ) : null}

          {event.venue || event.location ? (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.venue || event.location}</span>
            </div>
          ) : null}

          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {event.participants} participants</span>
          </div>
        </div>

        {event.status && (
          <div className="mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              event.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : event.status === 'full'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {event.status}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};

export default EventCard;