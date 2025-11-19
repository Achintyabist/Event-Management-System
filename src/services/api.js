import { storage } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = storage.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || (typeof data === 'string' ? data : JSON.stringify(data)) || `HTTP error! ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ---------------- AUTH (Organizer / Attendee) -------------- //

  async organizerLogin(credentials) {
    return this.request('/api/auth/organizer/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async attendeeLogin(credentials) {
    return this.request('/api/auth/attendee/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async organizerSignup(data) {
    return this.request('/api/auth/organizer/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async attendeeSignup(data) {
    return this.request('/api/auth/attendee/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ---------------- EVENTS ---------------- //

  async createEvent(eventData) {
    // Only send required fields (no event_id, it's auto-increment)
    const { event_name, event_description, organizer_id } = eventData;
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify({ event_name, event_description, organizer_id }),
    });
  }

  async getEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/events?${queryString}`);
  }

  async getEventById(eventId) {
    return this.request(`/api/events/${eventId}`);
  }

  async getRegisteredEvents(attendeeId) {
    return this.request(`/api/events?type=registered&attendeeId=${attendeeId}`);
  }

  async unregisterFromEvent(eventId, attendeeId, scheduleId = null) {
    let url = `/api/registrations/${eventId}?attendeeId=${attendeeId}`;
    if (scheduleId) {
      url += `&scheduleId=${scheduleId}`;
    }
    return this.request(url, {
      method: 'DELETE',
    });
  }

  // ---------------- VENUES ---------------- //
  async createVenue(venueData) {
    return this.request('/api/venues', {
      method: 'POST',
      body: JSON.stringify(venueData),
    });
  }

  async getVenues() {
    return this.request('/api/venues');
  }

  // ---------------- VENDORS ---------------- //
  async createVendor(vendorData) {
    return this.request('/api/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  }

  async getVendors() {
    return this.request('/api/vendors');
  }

  // ---------------- SCHEDULES ---------------- //
  async createSchedule(scheduleData) {
    return this.request('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  async getSchedules() {
    return this.request('/api/schedules');
  }

  async deleteSchedule(id) {
    return this.request(`/api/schedules/${id}`, {
      method: "DELETE",
    });
  }
  // ---------------- TASKS ---------------- //
  async createTask(taskData) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTasks() {
    return this.request('/api/tasks');
  }

  // ---------------- BUDGET ITEMS ---------------- //
  async createBudgetItem(budgetItemData) {
    return this.request('/api/budget-items', {
      method: 'POST',
      body: JSON.stringify(budgetItemData),
    });
  }

  async getBudgetItems() {
    return this.request('/api/budget-items');
  }

  // ---------------- REGISTRATION ---------------- //
  async register(attendee_id, event_id, schedule_id = null) {
    return this.request('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({ attendee_id, event_id, schedule_id }),
    });
  }
}

export const apiService = new ApiService();
