export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateEventForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.name)) {
    errors.name = 'Event name is required';
  }
  
  if (!validateRequired(formData.description)) {
    errors.description = 'Event description is required';
  }
  
  if (!validateRequired(formData.date)) {
    errors.date = 'Event date is required';
  } else {
    const eventDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      errors.date = 'Event date cannot be in the past';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSessionForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.name)) {
    errors.name = 'Session name is required';
  }
  
  if (!validateRequired(formData.date)) {
    errors.date = 'Session date is required';
  }
  
  if (!validateRequired(formData.startTime)) {
    errors.startTime = 'Start time is required';
  }
  
  if (!validateRequired(formData.endTime)) {
    errors.endTime = 'End time is required';
  }
  
  if (formData.startTime && formData.endTime) {
    if (formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
  }
  
  if (!validateRequired(formData.venueId)) {
    errors.venueId = 'Venue is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};