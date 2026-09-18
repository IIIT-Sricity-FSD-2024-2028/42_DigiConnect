import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title = 'Dashboard', breadcrumbs = [{ label: 'Citizen Portal' }, { label: 'Dashboard' }] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const userName = user?.name || user?.email || 'Citizen';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      {/* Left section: Breadcrumbs and Title */}
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle"
          aria-label="Toggle Sidebar"
          onClick={() => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.toggle('open');
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label || idx}>
                {crumb.to ? (
                  <Link to={crumb.to} style={{ color: 'var(--navy-500)' }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="separator">›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Right section: Notification Bell & User Dropdown */}
      <div className="topbar-right">
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <div
            className="notif-btn"
            onClick={() => setNotifOpen((prev) => !prev)}
            style={{ cursor: 'pointer' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <div className="notif-dot"></div>
          </div>

          {notifOpen && (
            <div className="notif-panel open" style={{ display: 'block' }}>
              <div className="card-header" style={{ padding: '12px 16px' }}>
                <span className="card-title" style={{ fontSize: '0.875rem' }}>Notifications</span>
                <span className="badge badge-info">0 new</span>
              </div>
              <div className="notif-list" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="dropdown" style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
            }}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Citizen
              </div>
            </div>
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu" style={{ display: 'block', right: 0 }}>
              <div className="dropdown-header">My Account</div>
              <div className="dropdown-divider"></div>
              <div
                className="dropdown-item danger"
                onClick={handleLogout}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
