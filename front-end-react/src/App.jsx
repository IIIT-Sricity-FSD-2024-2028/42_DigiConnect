import React, { useState } from 'react';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ApplicationsPage from './pages/citizen/MyApplicationsPage';
import './App.css';

export default function App() {
  // Default to Member 5: ManageUsersPage
  const [activeTab, setActiveTab] = useState('manage-users');

  return (
    <div className="app-root">
      {/* Top Demo Switcher for Previewing Converted Pages */}
      <div className="demo-page-switcher">
        <div className="demo-switcher-inner">
          <span className="demo-tag">React Conversion Preview:</span>
          <button
            type="button"
            className={`demo-tab-btn ${activeTab === 'manage-users' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage-users')}
          >
            🛡️ Member 5: Manage Users (Admin)
          </button>
          <button
            type="button"
            className={`demo-tab-btn ${activeTab === 'my-applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-applications')}
          >
            📋 Member 1: My Applications (Citizen)
          </button>
        </div>
      </div>

      {/* Render Active Converted Page */}
      {activeTab === 'manage-users' ? (
        <ManageUsersPage />
      ) : (
        <ApplicationsPage />
      )}
    </div>
  );
}
