import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const ROUTE_CONFIGS = {
  // Citizen Routes
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

  // Department Field Officer Routes
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

  // Department Head Routes
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

  // State Administrator Routes
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
  '/state-admin/grievance-cells': {
    title: 'Department Grievance Cells',
    breadcrumbs: [{ label: 'State Admin Portal', to: '/state-admin/dashboard' }, { label: 'Grievance Cells' }],
  },
};

// Dynamic fallback resolution based on URL prefix, hash, and user context
function resolveRouteConfig(pathname, hash = '', user = null) {
  // Grievance Portal Routes (matching HTML exact titles and breadcrumbs)
  if (pathname === '/grievance/dashboard') {
    const rawName = user?.name || user?.email || 'Officer';
    const tokens = rawName.trim().split(/\s+/);
    const displayName = (tokens[0].length <= 2 && tokens.length > 1) ? rawName.trim() : tokens[0];
    return {
      title: `${getGreeting()}, ${displayName}!`,
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Dashboard' },
      ],
    };
  }

  if (pathname === '/grievance/history') {
    return {
      title: 'Grievance History',
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Grievance History' },
      ],
    };
  }

  if (pathname === '/grievance/detail' || pathname.startsWith('/grievance/detail/')) {
    return {
      title: 'Grievance Detail',
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Grievance Detail' },
      ],
    };
  }

  if (pathname === '/profile') {
    const rawRole = (user?.role || '').toLowerCase();
    const isGrievance = rawRole.includes('grievance');
    const dashboardTo = isGrievance
      ? '/grievance/dashboard'
      : rawRole.includes('officer')
      ? '/officer/dashboard'
      : rawRole.includes('dept') || rawRole.includes('supervisor')
      ? '/department-head/dashboard'
      : rawRole.includes('state')
      ? '/state-admin/dashboard'
      : rawRole.includes('central') || rawRole.includes('admin')
      ? '/central-admin/dashboard'
      : '/citizen/dashboard';

    return {
      title: 'My Profile',
      breadcrumbs: [
        { label: 'Dashboard', to: dashboardTo },
        { label: 'Profile' },
      ],
    };
  }

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
  const { user } = useAuth();

  // Find matching route config or dynamic fallback
  const currentConfig = resolveRouteConfig(location.pathname, location.hash, user);

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
