// src/components/layout/Sidebar.jsx
// Dynamic role-aware navigation sidebar mirroring front-end/js/navigation.js and role-manager.js
//
// React Concepts Demonstrated:
//  [Component] — Reusable responsive Sidebar layout component
//  [Hooks]     — useAuth for user role & session info, useNavigate for routing
//  [Context]   — Reads authenticated officer/citizen/admin state from AuthContext
//  [Router]    — NavLink for active tab styling, Link for brand & profile navigation
//  [Lists]     — Maps dynamic role-specific navSections and items with unique keys
//  [Events]    — onClick for sign-out and profile handlers

import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── SVG Icon Registry (mirrors svgIcons from front-end/js/role-manager.js) ──
const ICONS = {
  grid: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  file: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  fileText: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  search: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  plusCircle: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  alertCircle: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  messageSquare: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  checkCircle: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  workflow: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  settings: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  user: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  logout: (
    <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

// ── Role Navigation Configurations (Matching front-end/js/role-manager.js) ──
const ROLE_NAV_CONFIGS = {
  // ── 1. Department Field Officer ──
  officer: {
    portalLabel: 'Officer Portal',
    roleLabel: 'Department Officer',
    dashboardTo: '/officer/dashboard',
    sections: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', to: '/officer/dashboard', icon: ICONS.grid },
        ],
      },
      {
        title: 'Work Queue',
        items: [
          { label: 'Review Application', to: '/officer/review', icon: ICONS.checkCircle },
        ],
      },
    ],
  },

  // ── 2. Department Head ──
  department_head: {
    portalLabel: 'Department Head Portal',
    roleLabel: 'Department Head',
    dashboardTo: '/department-head/dashboard',
    sections: [
      {
        title: 'Department Overview',
        items: [
          { label: 'Department Dashboard', to: '/department-head/dashboard', icon: ICONS.grid },
        ],
      },
      {
        title: 'Role Designations',
        items: [
          { label: 'Manage Designations', to: '/department-head/designations', icon: ICONS.users },
        ],
      },
      {
        title: 'Services & Workflows',
        items: [
          { label: 'Department Services', to: '/department-head/services', icon: ICONS.settings },
          { label: 'Service & Workflow Builder', to: '/department-head/service-builder', icon: ICONS.plusCircle },
        ],
      },
      {
        title: 'Field Administration',
        items: [
          { label: 'Onboard Officers', to: '/department-head/officers', icon: ICONS.users },
        ],
      },
      {
        title: 'Financials & Revenue',
        items: [
          { label: 'Department Revenue', to: '/department-head/revenue', icon: ICONS.fileText },
        ],
      },
    ],
  },

  // ── 3. State Administrator ──
  state_admin: {
    portalLabel: 'State Government Portal',
    roleLabel: 'State Admin',
    dashboardTo: '/state-admin/dashboard',
    sections: [
      {
        title: 'State Overview',
        items: [
          { label: 'State Dashboard', to: '/state-admin/dashboard', icon: ICONS.grid },
        ],
      },
      {
        title: 'Administration',
        items: [
          { label: 'Dynamic Jurisdiction Tree', to: '/state-admin/jurisdictions', icon: ICONS.workflow },
          { label: 'Departments & Heads', to: '/state-admin/departments', icon: ICONS.settings },
          { label: 'Department Grievance Cells', to: '/state-admin/grievance-cells', icon: ICONS.alertCircle },
        ],
      },
    ],
  },

  // ── 4. Central Administrator / Super User ──
  central_admin: {
    portalLabel: 'Central Government Portal',
    roleLabel: 'Central Admin',
    dashboardTo: '/central-admin/dashboard',
    sections: [
      {
        title: 'National Overview',
        items: [
          { label: 'National Dashboard', to: '/central-admin/dashboard', icon: ICONS.grid },
        ],
      },
      {
        title: 'Federation Management',
        items: [
          { label: 'State Governments', to: '/central-admin/manage-states', icon: ICONS.users },
        ],
      },
      {
        title: 'National Analytics',
        items: [
          { label: 'Application Velocity', to: '/central-admin/analytics/applications', icon: ICONS.fileText },
          { label: 'Revenue Analysis', to: '/central-admin/analytics/revenue', icon: ICONS.workflow },
        ],
      },
    ],
  },

  // ── 5. Grievance Redressal Officer ──
  grievance: {
    portalLabel: 'Grievance Redressal Portal',
    roleLabel: 'Grievance Officer',
    dashboardTo: '/grievance/dashboard',
    sections: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', to: '/grievance/dashboard', icon: ICONS.grid },
        ],
      },
      {
        title: 'Grievances',
        items: [
          { label: 'Grievance Detail & Resolution', to: '/grievance/detail', icon: ICONS.fileText },
          { label: 'Grievance History', to: '/grievance/history', icon: ICONS.file || ICONS.fileText },
        ],
      },
    ],
  },

  // ── 6. Citizen (Default) ──
  citizen: {
    portalLabel: 'Citizen Portal',
    roleLabel: 'Citizen',
    dashboardTo: '/citizen/dashboard',
    sections: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', to: '/citizen/dashboard', icon: ICONS.grid },
        ],
      },
      {
        title: 'My Services',
        items: [
          { label: 'My Applications', to: '/citizen/applications', icon: ICONS.fileText },
          { label: 'Track Application', to: '/citizen/track', icon: ICONS.search },
          { label: 'Apply for Service', to: '/citizen/apply', icon: ICONS.plusCircle },
        ],
      },
      {
        title: 'Support',
        items: [
          { label: 'Raise Grievance', to: '/citizen/raise-grievance', icon: ICONS.alertCircle },
          { label: 'My Grievances', to: '/citizen/my-grievances', icon: ICONS.messageSquare },
        ],
      },
    ],
  },
};

export default function Sidebar() {
  // [Context] Extract logged in user and logout callback
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isItemActive = (item, defaultIsActive) => {
    if (item.to.includes('#')) {
      const [itemPath, itemHash] = item.to.split('#');
      return location.pathname === itemPath && location.hash === '#' + itemHash;
    }
    if (item.to === '/grievance/dashboard') {
      return location.pathname === '/grievance/dashboard';
    }
    return defaultIsActive;
  };

  // Normalize role key (default to citizen with storage fallback)
  const activeRoleStorage = typeof window !== 'undefined' ? localStorage.getItem('active_role') : null;
  const rawRole = (user?.role || user?.roleKey || user?.actualRole || user?.backendRole || activeRoleStorage || 'citizen').toLowerCase();
  const roleKey =
    rawRole === 'super_user' || rawRole === 'central_admin' || rawRole === 'central-admin' || rawRole === 'admin'
      ? 'central_admin'
      : rawRole === 'supervisor' || rawRole === 'department_head'
      ? 'department_head'
      : rawRole === 'grievance_officer' || rawRole === 'grievance'
      ? 'grievance'
      : rawRole === 'state_admin' || rawRole === 'state-admin'
      ? 'state_admin'
      : rawRole === 'officer'
      ? 'officer'
      : 'citizen';

  const config = ROLE_NAV_CONFIGS[roleKey] || ROLE_NAV_CONFIGS.citizen;

  const userName = user?.name || user?.email || config.roleLabel;
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // [Events] Handle user logout
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar" id="sidebar">
      {/* Brand & Portal Label */}
      <div className="sidebar-brand">
        <Link to={config.dashboardTo} className="sidebar-brand-icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
        </Link>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">DigiConnect</div>
          <div className="sidebar-brand-sub" data-testid="sidebar-portal-label">
            {config.portalLabel}
          </div>
        </div>
      </div>

      {/* ── [Lists] Dynamic Navigation Sections ── */}
      <nav className="sidebar-nav" data-testid="sidebar-nav">
        {config.sections.map((section) => (
          <React.Fragment key={section.title}>
            <div className="nav-section-label">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                end={item.to.endsWith('/dashboard') && !item.to.includes('#')}
                onClick={() => {
                  if (item.to.includes('#queue')) {
                    const el = document.getElementById('queue') || document.getElementById('grievance-queue');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else if (item.to === '/grievance/dashboard') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={({ isActive }) => `nav-item ${isItemActive(item, isActive) ? 'active' : ''}`.trim()}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </React.Fragment>
        ))}

        {/* ── Account Section (mirrors front-end/js/navigation.js) ── */}
        <div className="nav-section-label">Account</div>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`.trim()}
          data-testid="nav-my-profile"
        >
          {ICONS.user}
          <span>My Profile</span>
        </NavLink>

        <a
          href="#logout"
          className="nav-item"
          data-testid="nav-sign-out"
          onClick={handleLogout}
        >
          {ICONS.logout}
          <span>Sign Out</span>
        </a>
      </nav>

      {/* ── Footer User Info ── */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          data-testid="sidebar-user-info"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className="avatar" data-testid="sidebar-avatar">
            {initials}
          </div>
          <div>
            <div
              className="sidebar-user-name"
              data-testid="sidebar-user-name"
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
            >
              {userName}
            </div>
            <div className="sidebar-user-role">{config.roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
