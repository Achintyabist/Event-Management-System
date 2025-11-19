import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { isOrganizer, isAttendee } = useAuth();
  const location = useLocation();

  const organizerLinks = [
    { to: ROUTES.ORGANIZER_EVENTS, label: 'My Events' },
    { to: ROUTES.ORGANIZER_CREATE_EVENT, label: 'Create Event' },
    { to: '/organizer/profile', label: 'Profile' }
  ];
  const attendeeLinks = [
    { to: ROUTES.ATTENDEE_EVENTS, label: 'Browse Events' },
    { to: ROUTES.ATTENDEE_MY_EVENTS, label: 'My Events' },
    { to: '/attendee/profile', label: 'Profile' }
  ];

  const links = isOrganizer() ? organizerLinks : isAttendee() ? attendeeLinks : [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full p-6 hidden md:block">
      <nav className="space-y-2">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-4 py-2 rounded text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium ${location.pathname === link.to ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
