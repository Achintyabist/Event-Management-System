import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Guards
import ProtectedRoute from './guards/ProtectedRoute';
import OrganizerRoute from './guards/OrganizerRoute';
import AttendeeRoute from './guards/AttendeeRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Organizer Pages
import OrganizerMyEvents from './pages/organizer/MyEvents';
import OrganizerProfile from './pages/organizer/Profile';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import OrganizerEventDetail from './pages/organizer/EventDetail';
import CreateSession from "./pages/organizer/CreateSession";


// Attendee Pages
import AttendeeProfile from './pages/attendee/Profile';
import Events from './pages/attendee/Events';
import AttendeeMyEvents from './pages/attendee/MyEvents';
import AttendeeEventDetail from './pages/attendee/EventDetail';

// Constants
import { ROUTES } from './utils/constants';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<Home />} />
            
            {/* Auth Routes - Only accessible when not authenticated */}
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.SIGNUP} 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              } 
            />

            {/* Organizer Routes */}
            <Route 
              path={ROUTES.ORGANIZER_EVENTS} 
              element={
                <OrganizerRoute>
                  <OrganizerMyEvents />
                </OrganizerRoute>
              } 
            />
            <Route 
              path={ROUTES.ORGANIZER_CREATE_EVENT} 
              element={
                <OrganizerRoute>
                  <CreateEvent />
                </OrganizerRoute>
              } 
            />
            <Route 
              path={ROUTES.ORGANIZER_EDIT_EVENT(':id')} 
              element={
                <OrganizerRoute>
                  <EditEvent />
                </OrganizerRoute>
              } 
            />
            <Route 
              path={ROUTES.ORGANIZER_EVENT_DETAIL(':id')} 
              element={
                <OrganizerRoute>
                  <OrganizerEventDetail />
                </OrganizerRoute>
              } 
            />
            <Route
              path="/organizer/events/:id/create-session"
              element={<OrganizerRoute>
                <CreateSession />
                </OrganizerRoute>}
            />

            <Route 
              path={'/organizer/profile'} 
              element={
                <OrganizerRoute>
                  <OrganizerProfile />
                </OrganizerRoute>
              } 
            />

            {/* Attendee Routes */}
            <Route 
              path={ROUTES.ATTENDEE_EVENTS} 
              element={
                <AttendeeRoute>
                  <Events />
                </AttendeeRoute>
              } 
            />
            <Route 
              path={ROUTES.ATTENDEE_MY_EVENTS} 
              element={
                <AttendeeRoute>
                  <AttendeeMyEvents />
                </AttendeeRoute>
              } 
            />
            <Route 
              path={ROUTES.ATTENDEE_EVENT_DETAIL(':id')} 
              element={
                <AttendeeRoute>
                  <AttendeeEventDetail />
                </AttendeeRoute>
              } 
            />
            <Route 
              path={'/attendee/profile'} 
              element={
                <AttendeeRoute>
                  <AttendeeProfile />
                </AttendeeRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;