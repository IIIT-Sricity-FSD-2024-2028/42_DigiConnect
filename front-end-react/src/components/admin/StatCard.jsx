import React from 'react';

/**
 * Common StatCard / Metric Chip Component
 * Used across Admin and Citizen dashboards for quick metric visualization.
 * 
 * Props:
 *  - label: string (e.g. "Total Users", "Citizens", "Officers")
 *  - value: number | string
 *  - type: 'all' | 'citizens' | 'officers' | 'supervisors' | 'grievance' | 'admins' | 'suspended' | 'under-review' | 'query' | 'approved' | 'rejected'
 *  - active: boolean
 *  - onClick: Callback () => void
 *  - icon: Optional React element / string
 */
export default function StatCard({
  label,
  value,
  type = 'all',
  active = false,
  onClick,
  icon,
}) {
  const typeMap = {
    all: 'chip-all',
    citizens: 'chip-green',
    citizen: 'chip-green',
    officers: 'chip-blue',
    officer: 'chip-blue',
    supervisors: 'chip-amber',
    supervisor: 'chip-amber',
    grievance: 'chip-cyan',
    admins: 'chip-purple',
    super_user: 'chip-purple',
    suspended: 'chip-red',
    'under-review': 'chip-pending',
    query: 'chip-query',
    approved: 'chip-approved',
    rejected: 'chip-rejected',
  };

  const chipClass = typeMap[type] || 'chip-all';

  return (
    <div
      className={`summary-chip ${chipClass} ${active ? 'active-filter' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="summary-chip-top">
        <div className="summary-chip-val">{value}</div>
        {icon && <span className="summary-chip-icon">{icon}</span>}
      </div>
      <div className="summary-chip-label">{label}</div>
    </div>
  );
}
