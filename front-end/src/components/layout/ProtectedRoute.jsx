// src/components/layout/ProtectedRoute.jsx
// React concepts used: Components, Props (allowedRoles, children), Context (useAuth),
// Router (Navigate, useLocation), Callbacks (role checking logic)
//
// This component wraps dashboard routes and enforces:
// 1. Authentication — unauthenticated users are redirected to /login
// 2. Authorization  — users without the right role are redirected to their own dashboard
//
// Usage (by teammates in App.jsx routing):
//   <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
//     <Route path="dashboard" element={<CitizenDashboard />} />
//   </Route>
//
// Or wrapping a single page:
//   <Route path="/officer/dashboard" element={
//     <ProtectedRoute allowedRoles={['officer']}>
//       <OfficerDashboard />
//     </ProtectedRoute>
//   } />

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Role → dashboard redirect map (same map used in LoginPage for consistency) ──
const ROLE_DASHBOARD_MAP = {
  citizen: '/citizen/dashboard',
  officer: '/officer/dashboard',
  department_head: '/department-head/dashboard',
  state_admin: '/state-admin/dashboard',
  central_admin: '/central-admin/dashboard',
  grievance: '/grievance/dashboard',
  grievance_officer: '/grievance/dashboard',
  super_user: '/central-admin/dashboard',
};

/**
 * ProtectedRoute — Role-based route guard component
 *
 * Props:
 *   allowedRoles {string[]}  - Array of role strings that may access this route.
 *                                e.g. ['citizen'] or ['officer', 'department_head']
 *   children     {ReactNode} - Optional. If provided, renders children directly.
 *                                If omitted, renders <Outlet /> for nested routes.
 *
 * Behavior:
 *   • Not logged in  → Navigate to /login  (passes current location for redirect-back)
 *   • Wrong role     → Navigate to the user's own dashboard
 *   • Authorized     → Render children or <Outlet />
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  // [Context] Read auth state via useAuth hook
  const { isLoggedIn, role, user } = useAuth();

  // [Router hook] Get current location for redirect-back after login
  const location = useLocation();

  // ── Guard 1: Not authenticated → redirect to login ──
  if (!isLoggedIn) {
    // Pass the attempted URL as state so LoginPage could redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Guard 2: Authenticated but wrong role → redirect to their own dashboard ──
  if (allowedRoles.length > 0) {
    // Normalize role for comparison (handle aliases)
    const userRole = (role || '').toLowerCase();
    const userRoleKey = (user?.roleKey || '').toLowerCase();
    const userActualRole = (user?.actualRole || '').toLowerCase();

    // Check if any of the user's role identifiers match any allowed role
    const isAllowed = allowedRoles.some((allowed) => {
      const a = allowed.toLowerCase();
      return (
        userRole === a ||
        userRoleKey === a ||
        userActualRole === a ||
        // Handle known aliases
        (a === 'central_admin' && (userRole === 'super_user' || userRole === 'super_admin')) ||
        (a === 'department_head' && userRole === 'supervisor') ||
        (a === 'grievance' && userRole === 'grievance_officer')
      );
    });

    if (!isAllowed) {
      // Redirect to the user's own dashboard, not the one they tried to access
      const fallback = ROLE_DASHBOARD_MAP[userRole] || ROLE_DASHBOARD_MAP[userRoleKey] || '/';
      return <Navigate to={fallback} replace />;
    }
  }

  // ── Authorized → render content ──
  // If children were passed as a prop, render them directly.
  // Otherwise render <Outlet /> so nested <Route> elements work.
  return children ? children : <Outlet />;
}
