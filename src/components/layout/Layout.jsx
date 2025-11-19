import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import ToastContainer from '../common/Toast';

const Layout = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Layout;