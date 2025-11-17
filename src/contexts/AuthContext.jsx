import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserType(null);
          setUserProfile(null);
        }
      })();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data: organizer } = await supabase
        .from('organizers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (organizer) {
        setUser({ id: userId });
        setUserType('organizer');
        setUserProfile(organizer);
        setLoading(false);
        return;
      }

      const { data: attendee } = await supabase
        .from('attendees')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (attendee) {
        setUser({ id: userId });
        setUserType('attendee');
        setUserProfile(attendee);
        setLoading(false);
        return;
      }

      setUser({ id: userId });
      setUserType(null);
      setUserProfile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const signUp = async (email, password, name, phone, type) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const profileData = {
        id: data.user.id,
        email,
        name,
        phone,
      };

      const table = type === 'organizer' ? 'organizers' : 'attendees';
      const { error: profileError } = await supabase
        .from(table)
        .insert([profileData]);

      if (profileError) throw profileError;

      await fetchUserProfile(data.user.id);
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await fetchUserProfile(data.user.id);
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setUserType(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userType,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
