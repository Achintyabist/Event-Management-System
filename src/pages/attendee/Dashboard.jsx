import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, BookOpen } from 'lucide-react';
import AttendeeLayout from '../../components/layout/AttendeeLayout';
import SessionCard from '../../components/cards/SessionCard';
import SearchBar from '../../components/filters/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/helpers';
import { apiService } from '../../services/api';

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const { loading, execute } = useApi();
  const { success, error } = useToast();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await execute(async () => {
        // Load user's registered events
        const myEvents = await apiService.getRegisteredEvents(user.Attendee_Id);
        setRegisteredEvents(Array.isArray(myEvents) ? myEvents : []);

        // Load all events for participation/search
        const allEventsData = await apiService.getEvents();
        setAllEvents(Array.isArray(allEventsData) ? allEventsData : []);
      });
    } catch (error) {
      error && error.message ? error(error.message) : error('Failed to load dashboard data');
      setRegisteredEvents([]);
      setAllEvents([]);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleUnregister = async (session) => {
    try {
      await execute(async () => {
        await apiService.unregisterFromEvent(session.Schedule_Id || session.id);
        success('Successfully unregistered from session');
        loadDashboardData(); // Reload data
      });
    } catch (error) {
      error('Failed to unregister from session');
    }
  };

  const filteredAllEvents = allEvents.filter(event =>
    (event.Event_Name || event.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.Event_Description || event.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleParticipate = async (event) => {
    try {
      await execute(async () => {
        await apiService.register(user.Attendee_Id, event.Event_Id);
        success('Successfully registered for event');
        loadDashboardData();
      });
    } catch (err) {
      error && err.message ? error(err.message) : error('Failed to register for event');
    }
  };

  const filteredRegisteredEvents = registeredEvents.filter(event =>
          (event.Event_Name || event.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.Event_Description || event.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

  if (loading) {
    return (
      <AttendeeLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </AttendeeLayout>
    );
  }

  return (
    <AttendeeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Attendee'}!
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your event registrations and discover new events.
            </p>
          </div>
          <Link
            to={ROUTES.ATTENDEE_EVENTS}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Browse Events
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registered Events</p>
                <p className="text-2xl font-bold text-gray-900">{registeredEvents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registeredEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    const now = new Date();
                    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registeredEvents.filter(event => new Date(event.date) >= new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Registered Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Registered Events</h2>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <SearchBar
                placeholder="Search my events..."
                onSearch={handleSearch}
                className="w-64"
              />
              <Link
                to={ROUTES.ATTENDEE_MY_EVENTS}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {filteredRegisteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredRegisteredEvents.slice(0, 5).map((event) => (
                <div key={event.Schedule_Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.session_name}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-2">
                      <Link
                        to={ROUTES.ATTENDEE_SESSION_DETAIL(event.Schedule_Id)}
                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleUnregister(event)}
                        className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Unregister
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registered events</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'No events match your search.' : 'Start by browsing and registering for events.'}
              </p>
              {!searchQuery && (
                <Link
                  to={ROUTES.ATTENDEE_EVENTS}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Events
                </Link>
              )}
            </div>
          )}
        </div>

        {/* All Events to Participate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Events</h2>
          {filteredAllEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllEvents.map((event) => (
                <div key={event.Event_Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {event.Event_Name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {event.Event_Description}
                  </p>
                  <div className="text-sm text-gray-500 mb-2">
                    <span>Date: {event.Event_Date}</span><br/>
                    <span>Time: {event.Event_Time}</span><br/>
                    <span>Venue ID: {event.Venue_Id}</span>
                  </div>
                  <button
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    onClick={() => handleParticipate(event)}
                  >
                    Participate
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No events available</p>
            </div>
          )}
        </div>
      </div>
    </AttendeeLayout>
  );
};

export default AttendeeDashboard;