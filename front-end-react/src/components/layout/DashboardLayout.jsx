import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const ROUTE_CONFIGS = {
  '/citizen/dashboard': {
    title: 'Citizen Dashboard',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'Dashboard' }],
  },
  '/citizen/applications': {
    title: 'My Applications',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'My Applications' }],
  },
  '/citizen/track': {
    title: 'Track Application',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'Track Application' }],
  },
  '/citizen/apply': {
    title: 'Apply for Service',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'Apply for Service' }],
  },
  '/citizen/raise-grievance': {
    title: 'Raise Grievance',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'Raise Grievance' }],
  },
  '/citizen/my-grievances': {
    title: 'My Grievances',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'My Grievances' }],
  },
};

export default function DashboardLayout() {
  const location = useLocation();

  // Find matching route config or fallback
  const currentConfig = ROUTE_CONFIGS[location.pathname] || {
    title: 'Citizen Portal',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'Overview' }],
  };

  return (
    <div className="app-layout">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Sticky Topbar with dynamic title & breadcrumbs */}
      <Topbar title={currentConfig.title} breadcrumbs={currentConfig.breadcrumbs} />

      {/* Main Routed Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
