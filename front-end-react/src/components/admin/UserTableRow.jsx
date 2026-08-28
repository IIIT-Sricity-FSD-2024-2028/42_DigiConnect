import React from 'react';
import StatusBadge from '../common/StatusBadge';

// Admin / Supervisor User Table Row Component
export default function UserTableRow({ user, onEdit, onDelete }) {
  return (
    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{user.name}</td>
      <td style={{ padding: '12px 16px', color: '#64748b' }}>{user.email}</td>
      <td style={{ padding: '12px 16px', color: '#0f172a' }}>{user.role}</td>
      <td style={{ padding: '12px 16px' }}>
        <StatusBadge status={user.status || 'approved'} />
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ marginRight: '8px' }}
          onClick={() => onEdit && onEdit(user)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onDelete && onDelete(user.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
