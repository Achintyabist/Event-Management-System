import React from 'react';
import Layout from './Layout';
import Sidebar from './Sidebar';

const OrganizerLayout = ({ children }) => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <Sidebar />
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerLayout;