import React from 'react';

// Common Sidebar component for Admin/Officer/Supervisor portals
export default function Sidebar({ title = 'DigiConnect', activeItem = 'Dashboard', items = [], onItemClick }) {
  const defaultItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'applications', label: 'Applications', icon: '📝' },
    { id: 'grievances', label: 'Grievances', icon: '📢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const navItems = items.length > 0 ? items : defaultItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-logo-badge">🏛️</span>
        <span style={{ fontWeight: 800 }}>{title}</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeItem === item.label ? 'active' : ''}`}
            onClick={() => onItemClick && onItemClick(item)}
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
