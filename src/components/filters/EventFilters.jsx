import React from 'react';
import { Filter } from 'lucide-react';

const EventFilters = ({ 
  filters, 
  onFilterChange, 
  className = '' 
}) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date
          </label>
          <select
            value={filters.dateFilter || ''}
            onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="networking">Networking</option>
            <option value="training">Training</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Events</option>
            <option value="open">Open for Registration</option>
            <option value="full">Full</option>
            <option value="closed">Registration Closed</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'date'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="created">Recently Created</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {Object.values(filters).some(value => value) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onFilterChange({})}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilters;