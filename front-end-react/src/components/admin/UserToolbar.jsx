import React from 'react';

/**
 * Child Component: UserToolbar
 * Provides search filtering, role filter tabs, status selector, and user creation trigger.
 * 
 * Props:
 *  - search: string
 *  - roleFilter: string
 *  - statusFilter: string
 *  - onSearchChange: Callback (newSearchTerm) => void
 *  - onRoleFilterChange: Callback (newRole) => void
 *  - onStatusFilterChange: Callback (newStatus) => void
 *  - onAddNewUser: Callback () => void
 *  - onExport: Callback () => void
 */
export default function UserToolbar({
  search = '',
  roleFilter = 'all',
  statusFilter = '',
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onAddNewUser,
  onExport,
}) {
  const roles = [
    { id: 'all', label: 'All Users' },
    { id: 'citizen', label: 'Citizens' },
    { id: 'officer', label: 'Officers' },
    { id: 'supervisor', label: 'Supervisors' },
    { id: 'grievance', label: 'Grievance Officers' },
    { id: 'super_user', label: 'Super Users' },
  ];

  return (
    <div className="user-toolbar-card">
      {/* 1. Role Filter Tabs */}
      <div className="role-tabs-wrap">
        <div className="role-tabs-container">
          {roles.map((r) => {
            const isActive = (roleFilter || 'all').toLowerCase() === r.id.toLowerCase();
            return (
              <button
                key={r.id}
                type="button"
                className={`role-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onRoleFilterChange && onRoleFilterChange(r.id)}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search, Status Filter & Action Controls */}
      <div className="toolbar-controls-row">
        {/* Search Input */}
        <div className="toolbar-search-input-wrap">
          <svg
            className="search-icon"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="form-input toolbar-search-field"
            placeholder="Search by name, email, role or ID…"
            value={search}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange && onSearchChange('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <select
          className="form-select status-select-field"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending Approval</option>
        </select>

        {/* Export Button */}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onExport}
          title="Export Users as CSV"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>

        {/* Add New User Primary Action */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAddNewUser}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </button>
      </div>
    </div>
  );
}
