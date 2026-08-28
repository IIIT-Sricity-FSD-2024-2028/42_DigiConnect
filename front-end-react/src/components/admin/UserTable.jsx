import React, { useState } from 'react';
import UserTableRow from './UserTableRow';

/**
 * Child Component: UserTable
 * Renders the users data table, column headers, pagination controls, and empty states.
 * 
 * Props:
 *  - users: Array<User>
 *  - onToggleStatus: Callback (userId) => void
 *  - onEditUser: Callback (user) => void
 *  - onDeleteUser: Callback (userId) => void
 */
export default function UserTable({
  users = [],
  totalCount = 0,
  onToggleStatus,
  onEditUser,
  onDeleteUser,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Pagination calculation
  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="user-table-card">
      <div className="card-header-flex">
        <div className="card-header-title-group">
          <span className="card-title-text">All Registered Accounts</span>
          <span className="badge-count">{users.length}</span>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onToggleStatus={onToggleStatus}
                  onEditUser={onEditUser}
                  onDeleteUser={onDeleteUser}
                />
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="empty-table-state">
                    <div className="empty-icon">🔍</div>
                    <h4>No users found</h4>
                    <p>No user accounts matched the selected filters or search query.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-footer-pagination">
        <div className="pagination-info">
          Showing <strong>{paginatedUsers.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, users.length)}</strong> of <strong>{users.length}</strong> filtered users (Total: {totalCount || users.length})
        </div>
        <div className="pagination-controls">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              className={`btn btn-sm ${safePage === pg ? 'btn-primary' : 'btn-outline'}`}
              style={{ minWidth: '32px' }}
              onClick={() => setCurrentPage(pg)}
            >
              {pg}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
