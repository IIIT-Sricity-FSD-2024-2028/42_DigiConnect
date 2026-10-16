
import React, { useState, useEffect } from 'react';
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
    breadcrumbs: [
      { label: 'Citizen Portal', to: '/citizen/dashboard' },
      { label: 'Dashboard' },
    ],
  },
  '/citizen/applications': {
    title: 'My Applications',
    breadcrumbs: [
      { label: 'Citizen Portal', to: '/citizen/dashboard' },
      { label: 'My Applications' },
    ],
  },
  '/citizen/track': {
    title: 'Track Application',
    breadcrumbs: [
      { label: 'Citizen Portal', to: '/citizen/dashboard' },
      { label: 'Track Application' },
    ],
  },
  '/citizen/apply': {
    title: 'Apply for Service',
    breadcrumbs: [
      { label: 'Citizen Portal', to: '/citizen/dashboard' },
      { label: 'Apply for Service' },
    ],
  },
  '/citizen/raise-grievance': {
    title: 'Raise Grievance',
    breadcrumbs: [
      { label: 'Citizen Portal', to: '/citizen/dashboard' },
      { label: 'Raise Grievance' },
    ],
  },
  '/citizen/my-grievances': {
    title: 'My Grievances',
    breadcrumbs: [
      { label: 'Citizen Portal', to: '/citizen/dashboard' },
      { label: 'My Grievances' },
    ],
  },

  // Department Field Officer Routes
  '/officer/dashboard': {
    title: 'Field Officer Dashboard',
    breadcrumbs: [
      { label: 'Officer Portal', to: '/officer/dashboard' },
      { label: 'Dashboard' },
    ],
  },
  '/officer/review': {
    title: 'Application Review',
    breadcrumbs: [
      { label: 'Officer Portal', to: '/officer/dashboard' },
      { label: 'Review Queue' },
    ],
  },
  '/officer/verification': {
    title: 'Document Verification',
    breadcrumbs: [
      { label: 'Officer Portal', to: '/officer/dashboard' },
      { label: 'Verification' },
    ],
  },
  '/officer/queries': {
    title: 'Citizen Queries',
    breadcrumbs: [
      { label: 'Officer Portal', to: '/officer/dashboard' },
      { label: 'Queries' },
    ],
  },
  '/officer/sla-breaches': {
    title: 'SLA Breaches',
    breadcrumbs: [
      { label: 'Officer Portal', to: '/officer/dashboard' },
      { label: 'SLA Breaches' },
    ],
  },
  '/officer/analytics': {
    title: 'Officer Analytics',
    breadcrumbs: [
      { label: 'Officer Portal', to: '/officer/dashboard' },
      { label: 'Analytics' },
    ],
  },

  // Department Head Routes
  '/department-head/dashboard': {
    title: 'Department Dashboard',
    breadcrumbs: [
      { label: 'Department Head Portal', to: '/department-head/dashboard' },
      { label: 'Dashboard' },
    ],
  },
  '/department-head/designations': {
    title: 'Manage Designations',
    breadcrumbs: [
      { label: 'Department Head Portal', to: '/department-head/dashboard' },
      { label: 'Designations' },
    ],
  },
  '/department-head/services': {
    title: 'Department Services',
    breadcrumbs: [
      { label: 'Department Head Portal', to: '/department-head/dashboard' },
      { label: 'Services' },
    ],
  },
  '/department-head/service-builder': {
    title: 'Service & Workflow Builder',
    breadcrumbs: [
      { label: 'Department Head Portal', to: '/department-head/dashboard' },
      { label: 'Service Builder' },
    ],
  },
  '/department-head/officers': {
    title: 'Onboard Officers',
    breadcrumbs: [
      { label: 'Department Head Portal', to: '/department-head/dashboard' },
      { label: 'Officers' },
    ],
  },
  '/department-head/revenue': {
    title: 'Department Revenue',
    breadcrumbs: [
      { label: 'Department Head Portal', to: '/department-head/dashboard' },
      { label: 'Revenue' },
    ],
  },

  // State Administrator Routes
  '/state-admin/dashboard': {
    title: 'State Government Dashboard',
    breadcrumbs: [
      { label: 'State Admin Portal', to: '/state-admin/dashboard' },
      { label: 'Dashboard' },
    ],
  },
  '/state-admin/jurisdictions': {
    title: 'Dynamic Jurisdiction Tree',
    breadcrumbs: [
      { label: 'State Admin Portal', to: '/state-admin/dashboard' },
      { label: 'Jurisdictions' },
    ],
  },
  '/state-admin/departments': {
    title: 'Departments & Heads',
    breadcrumbs: [
      { label: 'State Admin Portal', to: '/state-admin/dashboard' },
      { label: 'Departments' },
    ],
  },
  '/state-admin/grievance-cells': {
    title: 'Department Grievance Cells',
    breadcrumbs: [
      { label: 'State Admin Portal', to: '/state-admin/dashboard' },
      { label: 'Grievance Cells' },
    ],
  },

  // Grievance Routes
  '/grievance/dashboard': {
    title: 'Grievance Redressal Portal',
    breadcrumbs: [
      { label: 'Grievance Portal', to: '/grievance/dashboard' },
      { label: 'Dashboard' },
    ],
  },

  // Central Administrator Routes
  '/central-admin/dashboard': {
    title: 'National Dashboard',
    breadcrumbs: [
      { label: 'Central Government', to: '/central-admin/dashboard' },
      { label: 'National Dashboard' },
    ],
  },
  '/central-admin/manage-states': {
    title: 'State Governments',
    breadcrumbs: [
      { label: 'Central Government', to: '/central-admin/dashboard' },
      { label: 'State Governments' },
    ],
  },
  '/central-admin/analytics/applications': {
    title: 'National Application Analytics',
    breadcrumbs: [
      { label: 'Central Government', to: '/central-admin/dashboard' },
      { label: 'Application Analytics' },
    ],
  },
  '/central-admin/analytics/revenue': {
    title: 'National Revenue Analysis',
    breadcrumbs: [
      { label: 'Central Government', to: '/central-admin/dashboard' },
      { label: 'Revenue Analysis' },
    ],
  },
};

function getResolvedRole(user) {
  const raw = (
    user?.role ||
    user?.roleKey ||
    user?.actualRole ||
    user?.backendRole ||
    'citizen'
  ).toLowerCase();

  if (
    raw === 'super_user' ||
    raw === 'central_admin' ||
    raw === 'central-admin' ||
    raw === 'admin'
  ) {
    return 'central_admin';
  }

  if (raw === 'supervisor' || raw === 'department_head') {
    return 'department_head';
  }

  if (raw === 'grievance_officer' || raw === 'grievance') {
    return 'grievance';
  }

  if (raw === 'state_admin' || raw === 'state-admin') {
    return 'state_admin';
  }

  if (raw === 'officer') {
    return 'officer';
  }

  return 'citizen';
}

function resolveRouteConfig(pathname, hash = '', user = null) {
  const roleKey = getResolvedRole(user);

  const portalMap = {
    central_admin: {
      label: 'Central Government',
      to: '/central-admin/dashboard',
    },
    state_admin: {
      label: 'State Admin Portal',
      to: '/state-admin/dashboard',
    },
    department_head: {
      label: 'Department Head Portal',
      to: '/department-head/dashboard',
    },
    officer: {
      label: 'Officer Portal',
      to: '/officer/dashboard',
    },
    grievance: {
      label: 'Grievance Portal',
      to: '/grievance/dashboard',
    },
    citizen: {
      label: 'Citizen Portal',
      to: '/citizen/dashboard',
    },
  };

  // Profile page for all authenticated roles
  if (
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname.endsWith('/profile')
  ) {
    const portal = portalMap[roleKey] || portalMap.citizen;

    return {
      title: 'My Profile',
      breadcrumbs: [
        { label: portal.label, to: portal.to },
        { label: 'My Profile' },
      ],
    };
  }

  // Grievance dashboard greeting
  if (pathname === '/grievance/dashboard') {
    const rawName = user?.name || user?.email || 'Officer';
    const trimmedName = rawName.trim();
    const tokens = trimmedName.split(/\s+/);

    const displayName =
      tokens[0].length <= 2 && tokens.length > 1
        ? trimmedName
        : tokens[0];

    return {
      title: `${getGreeting()}, ${displayName}!`,
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Dashboard' },
      ],
    };
  }

  // Grievance history
  if (pathname === '/grievance/history') {
    return {
      title: 'Grievance History',
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Grievance History' },
      ],
    };
  }

  // Grievance details
  if (
    pathname === '/grievance/detail' ||
    pathname.startsWith('/grievance/detail/')
  ) {
    return {
      title: 'Grievance Detail',
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Grievance Detail' },
      ],
    };
  }

  // Exact route configurations
  if (ROUTE_CONFIGS[pathname]) {
    return ROUTE_CONFIGS[pathname];
  }

  // Dynamic Central Admin state details
  if (pathname.startsWith('/central-admin/states/')) {
    return {
      title: 'State Government Details',
      breadcrumbs: [
        { label: 'Central Government', to: '/central-admin/dashboard' },
        { label: 'State Governments', to: '/central-admin/manage-states' },
        { label: 'State Details' },
      ],
    };
  }

  if (pathname.startsWith('/central-admin')) {
    return {
      title: 'Central Government Portal',
      breadcrumbs: [
        { label: 'Central Government', to: '/central-admin/dashboard' },
        { label: 'Overview' },
      ],
    };
  }

  // Dynamic Field Officer application review
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
      breadcrumbs: [
        { label: 'Officer Portal', to: '/officer/dashboard' },
        { label: 'Overview' },
      ],
    };
  }

  if (pathname.startsWith('/department-head')) {
    return {
      title: 'Department Head Portal',
      breadcrumbs: [
        { label: 'Department Head Portal', to: '/department-head/dashboard' },
        { label: 'Overview' },
      ],
    };
  }

  if (pathname.startsWith('/state-admin')) {
    return {
      title: 'State Admin Portal',
      breadcrumbs: [
        { label: 'State Admin Portal', to: '/state-admin/dashboard' },
        { label: 'Overview' },
      ],
    };
  }

  if (pathname.startsWith('/grievance')) {
    return {
      title: 'Grievance Redressal Portal',
      breadcrumbs: [
        { label: 'Grievance Portal', to: '/grievance/dashboard' },
        { label: 'Overview' },
      ],
    };
  }

  const portal = portalMap[roleKey] || portalMap.citizen;

  return {
    title: portal.label,
    breadcrumbs: [
      { label: portal.label, to: portal.to },
      { label: 'Overview' },
    ],
  };
}

export default function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close mobile sidebar when navigating routes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentConfig = resolveRouteConfig(
    location.pathname,
    location.hash,
    user
  );

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Topbar
        title={currentConfig.title}
        breadcrumbs={currentConfig.breadcrumbs}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
