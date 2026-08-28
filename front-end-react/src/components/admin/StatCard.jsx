import React from 'react';

// Common Stat Card / Summary Metric Chip
export default function StatCard({ label, value, type = 'all', active = false, onClick }) {
  const typeMap = {
    all: 'chip-all',
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
      <div className="summary-chip-val">{value}</div>
      <div className="summary-chip-label">{label}</div>
    </div>
  );
}
