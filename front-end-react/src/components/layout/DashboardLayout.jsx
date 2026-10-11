import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const ROUTE_CONFIGS = {
  // ── Citizen Routes ──
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

  // ── Department Field Officer Routes ──
  '/officer/dashboard': {
    title: 'Field Officer Dashboard',
    breadcrumbs: [{ label: 'Officer Portal', to: '/officer/dashboard' }, { label: 'Dashboard' }],
  },
  '/officer/review': {
    title: 'Application Review',
    breadcrumbs: [{ label: 'Officer Portal', to: '/officer/dashboard' }, { label: 'Review Queue' }],
  },
  '/officer/verification': {
    title: 'Document Verification',
    breadcrumbs: [{ label: 'Officer Portal', to: '/officer/dashboard' }, { label: 'Verification' }],
  },
  '/officer/queries': {
    title: 'Citizen Queries',
    breadcrumbs: [{ label: 'Officer Portal', to: '/officer/dashboard' }, { label: 'Queries' }],
  },
  '/officer/sla-breaches': {
    title: 'SLA Breaches',
    breadcrumbs: [{ label: 'Officer Portal', to: '/officer/dashboard' }, { label: 'SLA Breaches' }],
  },
  '/officer/analytics': {
    title: 'Officer Analytics',
    breadcrumbs: [{ label: 'Officer Portal', to: '/officer/dashboard' }, { label: 'Analytics' }],
  },

  // ── Department Head Routes ──
  '/department-head/dashboard': {
    title: 'Department Dashboard',
    breadcrumbs: [{ label: 'Department Head Portal', to: '/department-head/dashboard' }, { label: 'Dashboard' }],
  },
  '/department-head/designations': {
    title: 'Manage Designations',
    breadcrumbs: [{ label: 'Department Head Portal', to: '/department-head/dashboard' }, { label: 'Designations' }],
  },
  '/department-head/services': {
    title: 'Department Services',
    breadcrumbs: [{ label: 'Department Head Portal', to: '/department-head/dashboard' }, { label: 'Services' }],
  },
  '/department-head/service-builder': {
    title: 'Service & Workflow Builder',
    breadcrumbs: [{ label: 'Department Head Portal', to: '/department-head/dashboard' }, { label: 'Service Builder' }],
  },
  '/department-head/officers': {
    title: 'Onboard Officers',
    breadcrumbs: [{ label: 'Department Head Portal', to: '/department-head/dashboard' }, { label: 'Officers' }],
  },
  '/department-head/revenue': {
    title: 'Department Revenue',
    breadcrumbs: [{ label: 'Department Head Portal', to: '/department-head/dashboard' }, { label: 'Revenue' }],
  },

  // ── State Administrator Routes ──
  '/state-admin/dashboard': {
    title: 'State Government Dashboard',
    breadcrumbs: [{ label: 'State Admin Portal', to: '/state-admin/dashboard' }, { label: 'Dashboard' }],
  },
  '/state-admin/jurisdictions': {
    title: 'Dynamic Jurisdiction Tree',
    breadcrumbs: [{ label: 'State Admin Portal', to: '/state-admin/dashboard' }, { label: 'Jurisdictions' }],
  },
  '/state-admin/departments': {
    title: 'Departments & Heads',
    breadcrumbs: [{ label: 'State Admin Portal', to: '/state-admin/dashboard' }, { label: 'Departments' }],
  },

  // ── Grievance Redressal Routes ──
  '/grievance/dashboard': {
    title: 'Grievance Redressal Portal',
    breadcrumbs: [{ label: 'Grievance Portal', to: '/grievance/dashboard' }, { label: 'Dashboard' }],
  },
};

// Dynamic fallback resolution based on URL prefix
function resolveRouteConfig(pathname) {
  if (ROUTE_CONFIGS[pathname]) {
    return ROUTE_CONFIGS[pathname];
  }

  // Handle dynamic /officer/review/:id
  if (pathname.startsWith('/officer/review/')) {
    return {
      title: 'Application Review',
      breadcrumbs: [
        { label: 'Officer Portal', to: '/officer/dashboard' },
        { label: 'Review Queue', to: '/officer/dashboard' },
        { label: 'Review Application' },
      ],
    };
  }

  if (pathname.startsWith('/officer')) {
    return {
      title: 'Field Officer Portal',
      breadcrumbs: [{ label: 'Officer Portal', to: '/officer/dashboard' }, { label: 'Overview' }],
    };
  }

  if (pathname.startsWith('/department-head')) {
    return {
      title: 'Department Head Portal',
      breadcrumbs: [{ label: 'Department Head Portal', to: '/department-head/dashboard' }, { label: 'Overview' }],
    };
  }

  if (pathname.startsWith('/state-admin')) {
    return {
      title: 'State Admin Portal',
      breadcrumbs: [{ label: 'State Admin Portal', to: '/state-admin/dashboard' }, { label: 'Overview' }],
    };
  }

  // Handle dynamic /grievance/detail/:id
  if (pathname.startsWith('/grievance/detail/')) {
    return {
      title: 'Grievance Detail & Resolution',
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Grievance Queue', to: '/grievance/dashboard#queue' },
        { label: 'Detail & Resolution' },
      ],
    };
  }

  if (pathname.startsWith('/grievance')) {
    return {
      title: 'Grievance Redressal Portal',
      breadcrumbs: [{ label: 'Grievance Portal', to: '/grievance/dashboard' }, { label: 'Overview' }],
    };
  }

  return {
    title: 'Citizen Portal',
    breadcrumbs: [{ label: 'Citizen Portal', to: '/citizen/dashboard' }, { label: 'Overview' }],
  };
}

export default function DashboardLayout() {
  const location = useLocation();

  // Find matching route config or dynamic fallback
  const currentConfig = resolveRouteConfig(location.pathname);

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
