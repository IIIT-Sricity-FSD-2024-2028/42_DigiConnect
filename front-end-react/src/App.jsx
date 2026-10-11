import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage.jsx';
import ApplyServicePage from './pages/citizen/ApplyServicePage';
import MyApplicationsPage from './pages/citizen/MyApplicationsPage';
import TrackApplicationPage from './pages/citizen/TrackApplicationPage';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import ReviewApplicationPage from './pages/officer/ReviewApplicationPage';
import GrievanceDashboard from './pages/grievance/GrievanceDashboard';
import GrievanceDetailPage from './pages/grievance/GrievanceDetailPage';

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

        {/* Teammate Extension Placeholders:
            <Route path="raise-grievance" element={<RaiseGrievancePage />} />
            <Route path="my-grievances" element={<MyGrievancesPage />} />
        */}
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
      <Route path="/" element={<LandingPage />} />

      {/* Placeholder stubs — replace with real pages as team builds them */}
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/register" element={<RegisterPage />} /> */}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Default redirect to Citizen Dashboard */}
      {/* <Route path="/" element={<Navigate to="/citizen/dashboard" replace />} 
      <Route path="*" element={<Navigate to="/citizen/dashboard" replace />} /> */}
    </Routes>
  );
}

export default App;