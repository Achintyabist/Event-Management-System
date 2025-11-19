import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showErrorToast = true, 
      loadingState = true,
      onSuccess,
      onError 
    } = options;

    try {
      if (loadingState) setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      if (showErrorToast) {
        showError(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      if (loadingState) setLoading(false);
    }
  }, [showError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
    apiService
  };
};