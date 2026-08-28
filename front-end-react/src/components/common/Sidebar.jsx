import React from 'react';

// Common Sidebar component matching DigiConnect Civic Trust layout
export default function Sidebar({ currentPage = 'my-applications', onNavigate, user }) {
  const citizenUser = user || { name: 'Ravi Kumar', role: 'Citizen' };

  const menuSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'citizen-dashboard', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      title: 'MY SERVICES',
      items: [
        { id: 'my-applications', label: 'My Applications', icon: '📁' },
        { id: 'track-application', label: 'Track Application', icon: '🔍' },
        { id: 'apply-service', label: 'Apply for Service', icon: '✍️' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { id: 'raise-grievance', label: 'Raise Grievance', icon: '📢' },
        { id: 'my-grievances', label: 'My Grievances', icon: '📋' },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => onNavigate && onNavigate('citizen-dashboard')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-brand-icon">
          🏛️
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">DigiConnect</div>
          <div className="sidebar-brand-sub">Citizen Portal</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {menuSections.map((sec, idx) => (
          <div key={idx}>
            <div className="nav-section-label">{sec.title}</div>
            {sec.items.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onNavigate && onNavigate(item.id)}
                >
                  <span className="nav-icon-span" style={{ fontSize: '1.1rem', marginRight: '8px' }}>{item.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer / User Info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
            {citizenUser.name ? citizenUser.name.charAt(0) : 'C'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="sidebar-user-name">{citizenUser.name}</div>
            <div className="sidebar-user-role">{citizenUser.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
