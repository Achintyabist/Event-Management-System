import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import Layout from '../../components/layout/Layout';
import LoginForm from '../../components/forms/LoginForm';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleLogin = async (formData) => {
    try {
      await login(formData);
      // Redirect based on user type
      if (formData.userType === 'organizer') {
        navigate(ROUTES.ORGANIZER_EVENTS);
      } else {
        navigate(ROUTES.ATTENDEE_EVENTS);
      }
    } catch (error) {
      // Show error message
      setErrorMsg(error.message || 'Login failed');
      console.error('Login failed:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {errorMsg && <p className="mb-4 text-center text-red-600">{errorMsg}</p>}
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Login;