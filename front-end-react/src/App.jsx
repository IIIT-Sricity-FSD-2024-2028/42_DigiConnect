import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage.jsx';



function App() {
  return (
    <Routes>
      {/* ── Citizen Portal Routes (Member 3 Shell) ── */}
      <Route path="/citizen" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/citizen/dashboard" replace />} />
        <Route path="dashboard" element={<CitizenDashboard />} />

        {/* Teammate Extension Placeholders:
            <Route path="apply" element={<ApplyServicePage />} />         (Member 4)
            <Route path="applications" element={<MyApplicationsPage />} /> (Member 5)
            <Route path="track" element={<TrackApplicationPage />} />     (Member 5)
            <Route path="raise-grievance" element={<RaiseGrievancePage />} />
            <Route path="my-grievances" element={<MyGrievancesPage />} />
        */}
      </Route>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Placeholder stubs — replace with real pages as team builds them */}
      <Route path="/login" element={<LoginPage/>}/>
      {/* <Route path="/register" element={<RegisterPage/>}/> */}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Default redirect to Citizen Dashboard */}
      {/* <Route path="/" element={<Navigate to="/citizen/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/citizen/dashboard" replace />} /> */}
    </Routes>
  );
}

export default App;
