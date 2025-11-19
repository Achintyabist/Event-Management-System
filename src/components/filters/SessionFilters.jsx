import React from 'react';
import { Filter } from 'lucide-react';
import { SESSION_STATUS } from '../../utils/constants';

const SessionFilters = ({ 
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
        <h3 className="text-sm font-medium text-gray-900">Session Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Session Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Availability
          </label>
          <select
            value={filters.session_status || ''}
            onChange={(e) => handleFilterChange('session_status', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sessions</option>
            <option value={SESSION_STATUS.NOT_FILLED}>Available</option>
            <option value={SESSION_STATUS.FILLED}>Full</option>
          </select>
        </div>

        {/* Time Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Time
          </label>
          <select
            value={filters.timeFilter || ''}
            onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Times</option>
            <option value="morning">Morning (6AM - 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 6PM)</option>
            <option value="evening">Evening (6PM - 12AM)</option>
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
            <option value="date">Date & Time</option>
            <option value="name">Session Name</option>
            <option value="availability">Availability</option>
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

export default SessionFilters;