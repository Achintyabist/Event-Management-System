import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import Layout from '../../components/layout/Layout';
import SignupForm from '../../components/forms/SignupForm';

const Signup = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    try {
      await signup(formData);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      // Error is handled by the auth context
      console.error('Signup failed:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm 
          onSubmit={handleSignup} 
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Signup;