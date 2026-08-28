import React from 'react';

// Common Status Badge Component
export default function StatusBadge({ status }) {
  const normalized = (status || 'submitted').toLowerCase();
  const label = normalized.replace('-', ' ').toUpperCase();

  return (
    <span className={`status-badge status-${normalized}`}>
      {label}
    </span>
  );
}
