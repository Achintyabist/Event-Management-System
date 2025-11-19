import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import Layout from '../../components/layout/Layout';
import LoginForm from '../../components/forms/LoginForm';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleLogin = async (formData) => {
    try {
      await login(formData);
      
      // Redirect based on user type
      if (formData.userType === 'organizer') {
        navigate(ROUTES.ORGANIZER_DASHBOARD);
      } else {
        navigate(ROUTES.ATTENDEE_DASHBOARD);
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm 
          onSubmit={handleLogin} 
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Login;