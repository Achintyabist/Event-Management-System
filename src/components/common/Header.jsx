import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const Header = () => {
  const { user, logout, isAuthenticated, isOrganizer, isAttendee } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getNavigationLinks = () => {
    if (!isAuthenticated()) {
      return [
        { to: ROUTES.LOGIN, label: 'Login' },
        { to: ROUTES.SIGNUP, label: 'Sign Up' }
      ];
    }

    if (isOrganizer()) {
      return [
        { to: ROUTES.ORGANIZER_DASHBOARD, label: 'Dashboard' },
        { to: ROUTES.ORGANIZER_EVENTS, label: 'My Events' },
        { to: ROUTES.ORGANIZER_CREATE_EVENT, label: 'Create Event' }
      ];
    }

    if (isAttendee()) {
      return [
        { to: ROUTES.ATTENDEE_DASHBOARD, label: 'Dashboard' },
        { to: ROUTES.ATTENDEE_EVENTS, label: 'Browse Events' },
        { to: ROUTES.ATTENDEE_MY_EVENTS, label: 'My Events' }
      ];
    }

    return [];
  };

  const navigationLinks = getNavigationLinks();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={ROUTES.HOME} 
            className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            onClick={closeMobileMenu}
          >
            <Calendar className="w-8 h-8" />
            <span>EventHub</span>
          </Link>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{user?.name || 'User'}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {isOrganizer() ? 'Organizer' : 'Attendee'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAuthenticated() && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                    <User className="w-4 h-4" />
                    <span>{user?.name || 'User'}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {isOrganizer() ? 'Organizer' : 'Attendee'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;