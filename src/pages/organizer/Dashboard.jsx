import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, BarChart3, TrendingUp } from 'lucide-react';
import OrganizerLayout from '../../components/layout/OrganizerLayout';
import EventCard from '../../components/cards/EventCard';
import SearchBar from '../../components/filters/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { apiService } from '../../services/api';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const { loading, execute } = useApi();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    upcomingEvents: 0,
    totalSessions: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_description: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await execute(async () => {
        // Load organizer's events
        const eventsData = await apiService.getEvents({ organizer: true });
        // For each event, fetch participant count
        const eventsWithParticipants = await Promise.all(
          (eventsData || []).map(async (event) => {
            try {
              const attendees = await apiService.request(`/api/events/${event.Event_Id || event.id}/attendees`);
              return { ...event, participants: attendees.length };
            } catch {
              return { ...event, participants: 0 };
            }
          })
        );
        setEvents(eventsWithParticipants);

        // Calculate stats
        const totalEvents = eventsWithParticipants.length;
        const today = new Date();
        const upcomingEvents = eventsWithParticipants.filter(event => {
          const eventDate = new Date(event.event_date || event.Event_Date || event.date);
          return eventDate >= today;
        }).length;
        const totalAttendees = eventsWithParticipants.reduce((sum, event) => sum + (event.participants || 0), 0);

        setStats({
          totalEvents,
          upcomingEvents,
          totalAttendees,
          totalSessions: 0, // This would come from API
        });
      });
      // TODO: Show error toast if needed
    } catch (error) {
      // TODO: Show error toast if needed
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await execute(async () => {
        await apiService.createEvent({
          event_name: newEvent.event_name,
          event_description: newEvent.event_description,
          organizer_id: user.Organizer_Id
        });
        setShowCreateForm(false);
        setNewEvent({ event_name: '', event_description: '' });
        loadDashboardData(); // Refresh events
      });
      // TODO: Show error toast if needed
    } catch (error) {
      // TODO: Show error toast if needed
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await execute(async () => {
        await apiService.request(`/api/events/${eventId}`, {
          method: 'DELETE',
        });
        loadDashboardData(); // Refresh events
      });
      // TODO: Show error toast if needed
    } catch (error) {
      // TODO: Show error toast if needed
    }
  };

  const handleEditEvent = async (eventId, updatedEvent) => {
    try {
      await execute(async () => {
        await apiService.request(`/api/events/${eventId}`, {
          method: 'PUT',
          body: JSON.stringify(updatedEvent),
        });
        loadDashboardData(); // Refresh events
      });
      // TODO: Show error toast if needed
    } catch (error) {
      // TODO: Show error toast if needed
    }
  };

  const filteredEvents = events.filter(event =>
    (event.Event_Name || event.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.Event_Description || event.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentEvents = filteredEvents.slice(0, 6);

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Attendees',
      value: stats.totalAttendees,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: BarChart3,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  if (loading) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Organizer'}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your events today.
            </p>
          </div>
          <button
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Organize Event
          </button>
        </div>
        {showCreateForm && (
          <form className="bg-white p-4 rounded shadow mb-6" onSubmit={handleCreateEvent}>
            <h2 className="text-lg font-bold mb-2">Create New Event</h2>
            <input
              type="text"
              placeholder="Event Name"
              value={newEvent.event_name}
              onChange={e => setNewEvent({ ...newEvent, event_name: e.target.value })}
              className="mb-2 w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Event Description"
              value={newEvent.event_description}
              onChange={e => setNewEvent({ ...newEvent, event_description: e.target.value })}
              className="mb-2 w-full p-2 border rounded"
              required
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Event</button>
            <button type="button" className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </form>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <SearchBar
                placeholder="Search events..."
                onSearch={handleSearch}
                className="w-64"
              />
              <Link
                to={ROUTES.ORGANIZER_EVENTS}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <EventCard
                  key={event.Event_Id || event.id}
                  event={event}
                  showActions={true}
                  onDelete={handleDeleteEvent}
                  onEdit={handleEditEvent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first event.'}
              </p>
              {!searchQuery && (
                <Link
                  to={ROUTES.ORGANIZER_CREATE_EVENT}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Event
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default OrganizerDashboard;