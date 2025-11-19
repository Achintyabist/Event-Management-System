import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      success('Login successful!');
      return response;
    } catch (err) {
      error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.signup(userData);
      success('Account created successfully! Please login.');
      return response;
    } catch (err) {
      error(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      success('Logged out successfully');
    } catch (err) {
      error('Logout failed');
    }
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const isOrganizer = () => {
    return authService.isOrganizer();
  };

  const isAttendee = () => {
    return authService.isAttendee();
  };

  const getUserRole = () => {
    return authService.getUserRole();
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    isOrganizer,
    isAttendee,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};