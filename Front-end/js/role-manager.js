// ═══════════════════════════════════════════
// role-manager.js — RBAC, navigation data, permission checks
// ═══════════════════════════════════════════

/**
 * SVG icon paths for navigation items
 */
export const svgIcons = {
  'grid':           `<path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>`,
  'file-text':      `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
  'search':         `<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`,
  'plus-circle':    `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'alert-circle':   `<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'message-square': `<path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>`,
  'check-circle':   `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'help-circle':    `<path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'alert-triangle': `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>`,
  'edit-2':         `<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>`,
  'settings':       `<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`,
  'users':          `<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>`,
  'file':           `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
  'manage-users':   `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>`,
  'workflow':       `<path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>`,
  'system-settings':`<path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>`,
  'users-swap':     `<path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>`,
  'user':           `<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>`,
  'logout':         `<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>`,
};

/**
 * Navigation configuration per role
 */
export const roleConfig = {
  citizen: {
    portalLabel: 'Citizen Portal',
    roleLabel: 'Citizen',
    badge: 'badge-info',
    dashboardHref: 'citizen/citizen-dashboard.html',
    items: [
      { type: 'label', label: 'Overview' },
      { type: 'link', icon: 'grid', label: 'Dashboard', href: 'citizen/citizen-dashboard.html' },
      { type: 'label', label: 'My Services' },
      { type: 'link', icon: 'file-text', label: 'My Applications', href: 'citizen/my-applications.html' },
      { type: 'link', icon: 'search', label: 'Track Application', href: 'citizen/track-application.html' },
      { type: 'link', icon: 'plus-circle', label: 'Apply for Service', href: 'citizen/apply-service.html' },
      { type: 'label', label: 'Support' },
      { type: 'link', icon: 'alert-circle', label: 'Raise Grievance', href: 'citizen/raise-grievance.html' },
      { type: 'link', icon: 'message-square', label: 'My Grievances', href: 'citizen/my-grievances.html' },
    ],
  },
  officer: {
    portalLabel: 'Officer Portal',
    roleLabel: 'Department Officer',
    badge: 'badge-purple',
    dashboardHref: 'officer/officer-dashboard.html',
    items: [
      { type: 'label', label: 'Overview' },
      { type: 'link', icon: 'grid', label: 'Dashboard', href: 'officer/officer-dashboard.html' },
      { type: 'label', label: 'Work Queue' },
      { type: 'link', icon: 'check-circle', label: 'Review Application', href: 'officer/review-application.html' },
    ],
  },
  supervisor: {
    portalLabel: 'Supervisor Portal',
    roleLabel: 'Department Supervisor',
    badge: 'badge-orange',
    dashboardHref: 'supervisor/supervisor-dashboard.html',
    items: [
      { type: 'label', label: 'Overview' },
      { type: 'link', icon: 'grid', label: 'Dashboard', href: 'supervisor/supervisor-dashboard.html' },
      { type: 'label', label: 'Management' },
      { type: 'link', icon: 'alert-triangle', label: 'Escalated Cases', href: 'supervisor/escalated-cases.html' },
      { type: 'link', icon: 'edit-2', label: 'Override & Review', href: 'supervisor/supervisor-review.html' },
      { type: 'link', icon: 'users-swap', label: 'Workload Management', href: 'supervisor/workload-management.html' },
    ],
  },
  super_user: {
    portalLabel: 'Super User Portal',
    roleLabel: 'Super User',
    badge: 'badge-danger',
    dashboardHref: 'Super User/dashboard.html',
    items: [
      { type: 'label', label: 'Overview' },
      { type: 'link', icon: 'grid', label: 'Dashboard', href: 'Super User/dashboard.html' },
      { type: 'label', label: 'Management' },
      { type: 'link', icon: 'manage-users', label: 'Manage Users', href: 'Super User/manage-users.html' },
      { type: 'link', icon: 'settings', label: 'Manage Services', href: 'Super User/manage-services.html' },
      { type: 'link', icon: 'workflow', label: 'Workflow Config', href: 'Super User/workflow-config.html' },
      { type: 'link', icon: 'users', label: 'Officer Onboarding', href: 'Super User/officer-onboarding.html' },
      { type: 'link', icon: 'file', label: 'Audit Logs', href: 'Super User/audit-logs.html' },
      { type: 'label', label: 'System' },
      { type: 'link', icon: 'system-settings', label: 'System Settings', href: 'Super User/system-settings.html' },
    ],
  },
  grievance: {
    portalLabel: 'Grievance Portal',
    roleLabel: 'Grievance Officer',
    badge: 'badge-warning',
    dashboardHref: 'grievance/grievance-dashboard.html',
    items: [
      { type: 'label', label: 'Overview' },
      { type: 'link', icon: 'grid', label: 'Dashboard', href: 'grievance/grievance-dashboard.html' },
      { type: 'label', label: 'Grievances' },
      { type: 'link', icon: 'file-text', label: 'Grievance Detail', href: 'grievance/grievance-detail.html' },
      { type: 'link', icon: 'file', label: 'Grievance History', href: 'grievance/grievance-history.html' },
    ],
  },
};

/**
 * Get role config for a given role
 * @param {string} role
 * @returns {object}
 */
export function getRoleConfig(role) {
  return roleConfig[role] || roleConfig['citizen'];
}

/**
 * Get the dashboard path for a role
 * @param {string} role
 * @returns {string}
 */
export function getRoleDashboardPath(role) {
  const config = getRoleConfig(role);
  return config.dashboardHref;
}

/**
 * Get redirect map for login
 * @returns {object}
 */
export function getLoginRedirectMap() {
  return {
    citizen: 'citizen/citizen-dashboard.html',
    officer: 'officer/officer-dashboard.html',
    supervisor: 'supervisor/supervisor-dashboard.html',
    grievance: 'grievance/grievance-dashboard.html',
    super_user: 'Super User/dashboard.html',
  };
}

/**
 * Check if a role has permission for an action
 * @param {string} role
 * @param {string} action
 * @returns {boolean}
 */
export function hasPermission(role, action) {
  const permissions = {
    citizen: ['view_own_applications', 'create_application', 'track_application', 'raise_grievance', 'view_own_grievances', 'update_profile', 'make_payment'],
    officer: ['view_assigned_applications', 'review_application', 'approve_application', 'reject_application', 'raise_query', 'view_own_profile'],
    supervisor: ['view_all_applications', 'override_decision', 'reassign_application', 'view_escalations', 'manage_workload'],
    super_user: ['manage_users', 'manage_services', 'manage_workflows', 'view_audit_logs', 'system_settings', 'onboard_officers'],
    grievance: ['view_all_grievances', 'investigate_grievance', 'resolve_grievance', 'escalate_grievance'],
  };

  const rolePerms = permissions[role] || [];
  return rolePerms.includes(action);
}

