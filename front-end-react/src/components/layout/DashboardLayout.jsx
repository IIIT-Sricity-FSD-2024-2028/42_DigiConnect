import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  return (
    <div className="app-layout">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Sticky Topbar */}
      <Topbar />

      {/* Main Routed Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
