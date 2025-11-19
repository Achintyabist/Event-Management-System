const STORAGE_KEYS = {
  USER: 'event_user',
  TOKEN: 'event_token'
};

export const storage = {
  setUser: (user, persistent = true) => {
    try {
      const storageType = persistent ? localStorage : sessionStorage;
      storageType.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  getUser: () => {
    try {
      let user = localStorage.getItem(STORAGE_KEYS.USER);
      if (!user) user = sessionStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  },

  setToken: (token, persistent = true) => {
    try {
      const storageType = persistent ? localStorage : sessionStorage;
      storageType.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  },

  getToken: () => {
    try {
      let token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      return token;
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};