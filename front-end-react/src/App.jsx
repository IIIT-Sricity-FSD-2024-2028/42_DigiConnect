// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Placeholder stubs — replace with real pages as team builds them */}
      <Route path="/login" element={<div style={{padding:'2rem', fontFamily:'sans-serif'}}><h2>Login Page — Coming Soon (Member 2)</h2></div>} />
      <Route path="/register" element={<div style={{padding:'2rem', fontFamily:'sans-serif'}}><h2>Register Page — Coming Soon</h2></div>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
