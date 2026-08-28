import React from 'react';
import StatusBadge from '../common/StatusBadge';

/**
 * Child Component: UserTableRow
 * Renders an individual user in the admin user table.
 * 
 * Props:
 *  - user: User object { id, name, role, email, phone, joined, status, dept, designation, empId }
 *  - onToggleStatus: Callback (userId) => void
 *  - onEditUser / onEdit: Callback (user) => void
 *  - onDeleteUser / onDelete: Callback (userId) => void
 */
export default function UserTableRow({
  user,
  onToggleStatus,
  onEditUser,
  onEdit,
  onDeleteUser,
  onDelete,
}) {
  if (!user) return null;

  const handleEdit = () => {
    if (onEditUser) onEditUser(user);
    else if (onEdit) onEdit(user);
  };

  const handleDelete = () => {
    if (onDeleteUser) onDeleteUser(user.id);
    else if (onDelete) onDelete(user.id);
  };

  const handleToggle = () => {
    if (onToggleStatus) onToggleStatus(user.id);
  };

  const initials = (user.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isSuspended = (user.status || '').toLowerCase() === 'suspended';

  // Role badge helper styling
  const roleBadgeClass = {
    super_user: 'badge-purple',
    super_admin: 'badge-purple',
    officer: 'badge-blue',
    supervisor: 'badge-amber',
    grievance: 'badge-cyan',
    citizen: 'badge-neutral',
  }[(user.role || '').toLowerCase()] || 'badge-neutral';

  const formattedRole = (user.role || 'citizen')
    .replace('_', ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <tr className="user-table-row" data-testid={`user-row-${user.id}`}>
      {/* User Info with Avatar */}
      <td className="cell-user">
        <div className="user-cell-wrap">
          <div className="user-avatar-badge">{initials}</div>
          <div className="user-text-info">
            <div className="user-full-name">{user.name}</div>
            <div className="user-id-sub">{user.id}</div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="cell-role">
        <span className={`role-chip ${roleBadgeClass}`}>
          {formattedRole}
        </span>
      </td>

      {/* Email */}
      <td className="cell-email">{user.email}</td>

      {/* Phone */}
      <td className="cell-phone">{user.phone || '—'}</td>

      {/* Joined Date */}
      <td className="cell-joined">{user.joined || '—'}</td>

      {/* Status Badge */}
      <td className="cell-status">
        <StatusBadge status={user.status || 'Active'} />
      </td>

      {/* Action Buttons with Callbacks */}
      <td className="cell-actions">
        <div className="row-action-group">
          {/* Edit Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleEdit}
            title="Edit User Details"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          {/* Toggle Status (Activate / Suspend) */}
          <button
            type="button"
            className={`btn btn-sm ${isSuspended ? 'btn-success-light' : 'btn-warning-light'}`}
            onClick={handleToggle}
            title={isSuspended ? 'Activate user account' : 'Suspend user account'}
          >
            {isSuspended ? 'Activate' : 'Suspend'}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            className="btn btn-danger-light btn-sm"
            onClick={handleDelete}
            title="Delete User"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
