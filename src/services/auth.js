import { apiService } from './api';
import { storage } from './storage';

export const authService = {
  async login(credentials) {
    try {
      let response;
      const persistent = !!credentials.keepSignedIn;

      if (credentials.userType === "organizer") {
        response = await apiService.organizerLogin({
          email: credentials.email,
          password: credentials.password
        });
      } else {
        response = await apiService.attendeeLogin({
          email: credentials.email,
          password: credentials.password
        });
      }

      if (response.user) {
        storage.setUser(response.user, persistent);
      }
      if (response.token) {
        storage.setToken(response.token, persistent);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  },

  async signup(userData) {
    try {
      let response;
      const persistent = !!userData.keepSignedIn;

      if (userData.userType === "organizer") {
        response = await apiService.organizerSignup({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone
        });
      } else {
        response = await apiService.attendeeSignup({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone
        });
      }

      if (response.user) {
        storage.setUser(response.user, persistent);
      }
      if (response.token) {
        storage.setToken(response.token, persistent);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || "Signup failed");
    }
  },

  async logout() {
    storage.clear();
  },

  getCurrentUser() {
    return storage.getUser();
  },

  isAuthenticated() {
    return !!storage.getUser();
  },

  isOrganizer() {
    return storage.getUser()?.userType === "organizer";
  },

  isAttendee() {
    return storage.getUser()?.userType === "attendee";
  }
};
