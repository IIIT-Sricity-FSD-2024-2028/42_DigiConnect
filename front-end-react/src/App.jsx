import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import MyApplicationsPage from './pages/citizen/MyApplicationsPage';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('my-applications');
  const user = { name: 'Ravi Kumar', role: 'Citizen' };

  // Dynamic titles for Topbar Navbar
  const titles = {
    'citizen-dashboard': 'Citizen Dashboard',
    'my-applications': 'My Applications',
    'track-application': 'Track Application Status',
    'apply-service': 'Apply for Service',
  };

  const pageTitle = titles[currentPage] || 'My Applications';

  return (
    <div className="app-layout">
      {/* 1. Sidebar on the Left */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
      />

      {/* 2. Main Wrapper on the Right */}
      <div className="main-wrapper">
        {/* Common Topbar / Navbar */}
        <Navbar
          user={user}
          title={pageTitle}
          breadcrumbs={[pageTitle]}
          onNavigate={setCurrentPage}
        />

        {/* Dynamic Page View */}
        <main className="main-content">
          {currentPage === 'track-application' && (
            <TrackApplicationPage onNavigate={setCurrentPage} />
          )}
          {currentPage === 'apply-service' && (
            <ApplyServicePage onNavigate={setCurrentPage} />
          )}
          {(currentPage === 'my-applications' || currentPage === 'citizen-dashboard') && (
            <MyApplicationsPage onNavigate={setCurrentPage} />
          )}
        </main>
      </div>
    </div>
  );
}
