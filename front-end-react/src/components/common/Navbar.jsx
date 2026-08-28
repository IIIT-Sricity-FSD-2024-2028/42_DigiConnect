import React from 'react';

// Common Navbar / Topbar Component matching DigiConnect layout
export default function Navbar({ user, title = 'Citizen Portal', breadcrumbs = [], onNavigate }) {
  const citizenUser = user || { name: 'Ravi Kumar', role: 'Citizen' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-breadcrumb">
            <span style={{ color: 'var(--navy-500)', cursor: onNavigate ? 'pointer' : 'default' }} onClick={() => onNavigate && onNavigate('citizen-dashboard')}>
              Citizen Portal
            </span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="separator" style={{ margin: '0 6px', color: 'var(--slate-400)' }}>›</span>
                <span style={{ color: idx === breadcrumbs.length - 1 ? 'var(--slate-600)' : 'var(--navy-500)', fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400 }}>
                  {crumb.label || crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        {/* User Profile Tag */}
        <div className="user-profile-tag">
          <span className="user-avatar">{citizenUser.name ? citizenUser.name.charAt(0) : 'C'}</span>
          <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{citizenUser.name}</span>
          <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '2px 8px', marginLeft: '4px' }}>
            {citizenUser.role}
          </span>
        </div>
      </div>
    </header>
  );
}
