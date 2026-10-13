import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage';
import ApplyServicePage from './pages/citizen/ApplyServicePage';
import MyApplicationsPage from './pages/citizen/MyApplicationsPage';
import TrackApplicationPage from './pages/citizen/TrackApplicationPage';
import MyGrievancesPage from './pages/citizen/MyGrievancesPage';
import RaiseGrievancePage from './pages/citizen/RaiseGrievancePage';
import ProfilePage from './pages/common/ProfilePage';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import ReviewApplicationPage from './pages/officer/ReviewApplicationPage';
import GrievanceDashboard from './pages/grievance/GrievanceDashboard';
import GrievanceDetailPage from './pages/grievance/GrievanceDetailPage';
import DeptDashboard from './pages/department-head/DeptDashboard';
import ServicesCatalogPage from './pages/department-head/ServicesCatalogPage';
import ServiceBuilderPage from './pages/department-head/ServiceBuilderPage';
import OfficersManagementPage from './pages/department-head/OfficersManagementPage';
import DesignationsPage from './pages/department-head/DesignationsPage';
import RevenuePage from './pages/department-head/RevenuePage';
import StateDashboard from './pages/state-admin/StateDashboard';
import JurisdictionsPage from './pages/state-admin/JurisdictionsPage';
import DepartmentsManagementPage from './pages/state-admin/DepartmentsManagementPage';
import DepartmentGrievanceCellsPage from './pages/state-admin/DepartmentGrievanceCellsPage';

function App() {
  return (
    <Routes>
      {/* ── Citizen Portal Routes (Protected) ── */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/citizen/dashboard" replace />} />
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="apply" element={<ApplyServicePage />} />
        <Route path="applications" element={<MyApplicationsPage />} />
        <Route path="track" element={<TrackApplicationPage />} />
        <Route path="my-grievances" element={<MyGrievancesPage />} />
        <Route path="raise-grievance" element={<RaiseGrievancePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ── Department Officer Routes (Protected) ── */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRoles={['officer', 'department_head', 'super_user']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="review" element={<ReviewApplicationPage />} />
        <Route path="review/:id" element={<ReviewApplicationPage />} />
      </Route>

      {/* ── Department Head Routes (Protected) ── */}
      <Route
        path="/department-head"
        element={
          <ProtectedRoute allowedRoles={['department_head', 'supervisor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/department-head/dashboard" replace />} />
        <Route path="dashboard" element={<DeptDashboard />} />
        <Route path="services" element={<ServicesCatalogPage />} />
        <Route path="service-builder" element={<ServiceBuilderPage />} />
        <Route path="officers" element={<OfficersManagementPage />} />
        <Route path="designations" element={<DesignationsPage />} />
        <Route path="revenue" element={<RevenuePage />} />
      </Route>

      {/* ── State Administrator Routes (Protected) ── */}
      <Route
        path="/state-admin"
        element={
          <ProtectedRoute allowedRoles={['state_admin', 'super_user']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/state-admin/dashboard" replace />} />
        <Route path="dashboard" element={<StateDashboard />} />
        <Route path="jurisdictions" element={<JurisdictionsPage />} />
        <Route path="departments" element={<DepartmentsManagementPage />} />
        <Route path="grievance-cells" element={<DepartmentGrievanceCellsPage />} />
      </Route>

      {/* Public Routes */}
      {/* -- Grievance Cell Routes (Protected) -- */}
      <Route
        path="/grievance"
        element={
          <ProtectedRoute allowedRoles={['grievance', 'grievance_officer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/grievance/dashboard" replace />} />
        <Route path="dashboard" element={<GrievanceDashboard />} />
        <Route path="detail/:id" element={<GrievanceDetailPage />} />
      </Route>
      {/* ── Global Profile Route (Protected for any logged-in user) ── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<LandingPage />} />

      {/* Placeholder stubs — replace with real pages as team builds them */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Default redirect to Citizen Dashboard */}
      {/* <Route path="/" element={<Navigate to="/citizen/dashboard" replace />} 
      <Route path="*" element={<Navigate to="/citizen/dashboard" replace />} /> */}
    </Routes>
  );
}

export default App;