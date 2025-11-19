export const USER_ROLES = {
  ORGANIZER: 'organizer',
  ATTENDEE: 'attendee'
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
  
  // Events
  EVENTS: '/events',
  EVENT_BY_ID: (id) => `/events/${id}`,
  
  // Sessions
  EVENT_SESSIONS: (eventId) => `/events/${eventId}/sessions`,
  SESSION_BY_ID: (eventId, sessionId) => `/events/${eventId}/sessions/${sessionId}`,
  
  // Registration
  REGISTER: (eventId) => `/events/${eventId}/register`,
  UNREGISTER: (eventId) => `/events/${eventId}/register`,
  ATTENDEES: (eventId) => `/events/${eventId}/attendees`
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Organizer routes
  ORGANIZER_DASHBOARD: '/organizer/dashboard',
  ORGANIZER_EVENTS: '/organizer/events',
  ORGANIZER_EVENT_DETAIL: (id) => `/organizer/events/${id}`,
  ORGANIZER_CREATE_EVENT: '/organizer/events/create',
  ORGANIZER_EDIT_EVENT: (id) => `/organizer/events/${id}/edit`,
  ORGANIZER_SESSION_DETAIL: (id) => `/organizer/sessions/${id}`,
  ORGANIZER_ATTENDEES: (eventId) => `/organizer/events/${eventId}/attendees`,
  ORGANIZER_ADD_SESSION: (id) => `/organizer/events/${id}/create-session`,

  
  // Attendee routes
  ATTENDEE_DASHBOARD: '/attendee/dashboard',
  ATTENDEE_EVENTS: '/attendee/events',
  ATTENDEE_EVENT_DETAIL: (id) => `/attendee/events/${id}`,
  ATTENDEE_SESSION_DETAIL: (id) => `/attendee/sessions/${id}`,
  ATTENDEE_MY_EVENTS: '/attendee/my-events'
};

export const SESSION_STATUS = {
  FILLED: 'filled',
  NOT_FILLED: 'not_filled'
};

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};