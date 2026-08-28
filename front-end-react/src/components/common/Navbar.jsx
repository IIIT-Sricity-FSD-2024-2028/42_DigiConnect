import React from 'react';

// Common Top Navbar for citizen and admin portals
export default function Navbar({ user }) {
  return (
    <header className="app-navbar">
      <div className="navbar-brand">
        <div className="brand-logo-badge">🏛️</div>
        <div className="brand-text">
          <h1>DigiConnect</h1>
          <span>Citizen Portal</span>
        </div>
      </div>
      <div className="navbar-right">
        <div className="user-profile-tag">
          <span className="user-avatar">{user?.name ? user.name.charAt(0) : 'C'}</span>
          <span>{user?.name || 'Citizen User'}</span>
        </div>
      </div>
    </header>
  );
}
