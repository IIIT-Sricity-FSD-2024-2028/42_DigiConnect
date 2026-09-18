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

      {/* Public Routes */}
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