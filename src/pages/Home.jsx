import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isOrganizer, isAttendee } = useAuth();

  const getDashboardLink = () => {
    if (isOrganizer()) {
      return ROUTES.ORGANIZER_DASHBOARD;
    }
    if (isAttendee()) {
      return ROUTES.ATTENDEE_DASHBOARD;
    }
    return ROUTES.LOGIN;
  };

  const features = [
    {
      icon: Calendar,
      title: 'Easy Event Management',
      description: 'Create, manage, and track your events with our intuitive interface.'
    },
    {
      icon: Users,
      title: 'Seamless Registration',
      description: 'Attendees can easily discover and register for events they love.'
    },
    {
      icon: Star,
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications and live event updates.'
    }
  ];

  const benefits = [
    'Create unlimited events and sessions',
    'Track attendee registrations in real-time',
    'Manage venue capacity and availability',
    'Send automated notifications',
    'Generate detailed reports',
    'Mobile-friendly interface'
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Manage Events
              <span className="block text-blue-200">Like a Pro</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The complete platform for event organizers and attendees. 
              Create memorable experiences and connect with your audience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated() ? (
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to={ROUTES.SIGNUP}
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools for organizers and a seamless experience for attendees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose EventHub?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of event organizers who trust EventHub to manage their events 
                and connect with their audiences.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Event management"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute inset-0 bg-blue-600 opacity-10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
      
    </Layout>
  );
};

export default Home;