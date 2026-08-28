import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/admin/StatCard';
import UserToolbar from '../../components/admin/UserToolbar';
import UserTable from '../../components/admin/UserTable';
import EditUserModal from '../../components/admin/EditUserModal';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  INITIAL_MOCK_USERS,
} from '../../services/api';
import '../../styles/admin.css';

/**
 * Parent Container Component: ManageUsersPage
 *
 * Features:
 *  - Full CRUD management across all roles (Citizens, Officers, Supervisors, Grievance, Super Users).
 *  - Lifted state management for user directory, search term, active role filter, and modal forms.
 *  - Parent-to-child data flow via props.
 *  - Child-to-parent event communication via custom callback handlers.
 */
export default function ManageUsersPage() {
  const currentUser = { id: 'ADM-1001', name: 'Super User', role: 'Super Admin' };

  // ── Lifted State ──
  const [users, setUsers] = useState(INITIAL_MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'

  // Fetch users from backend on initial mount
  useEffect(() => {
    getUsers().then((data) => {
      if (data && data.length > 0) {
        setUsers(data);
      }
    });
  }, []);

  // ── Derived Filtered Users (using lifted state) ──
  const filteredUsers = users.filter((u) => {
    // 1. Role filter
    if (
      roleFilter !== 'all' &&
      (u.role || '').toLowerCase() !== roleFilter.toLowerCase()
    ) {
      return false;
    }

    // 2. Status filter
    if (
      statusFilter &&
      (u.status || 'Active').toLowerCase() !== statusFilter.toLowerCase()
    ) {
      return false;
    }

    // 3. Search query across name, email, id, phone, role
    if (search.trim()) {
      const q = search.toLowerCase();

      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchId = (u.id || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      const matchRole = (u.role || '').toLowerCase().includes(q);
      const matchDept = (u.dept || '').toLowerCase().includes(q);

      return (
        matchName ||
        matchEmail ||
        matchId ||
        matchPhone ||
        matchRole ||
        matchDept
      );
    }

    return true;
  });

  // ── Child-to-Parent Callback Handlers ──

  // Callback: Search term changed from UserToolbar
  const handleSearchChange = (term) => {
    setSearch(term);
  };

  // Callback: Role tab clicked from UserToolbar
  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
  };

  // Callback: Status dropdown selected from UserToolbar
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  // Callback: Open modal for creating new user
  const handleAddNewUser = () => {
    setActiveUser(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Callback: Open modal for editing existing user
  const handleEditUser = (userToEdit) => {
    setActiveUser(userToEdit);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Callback: Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveUser(null);
  };

  // Callback: Toggle user status (Activate <-> Suspend)
  const handleStatusToggle = async (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const newStatus =
      (targetUser.status || '').toLowerCase() === 'suspended'
        ? 'Active'
        : 'Suspended';

    const updatedUser = { ...targetUser, status: newStatus };

    // Update parent lifted state
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );

    // Sync with backend
    await updateUser(userId, { status: newStatus });
  };

  // Callback: Delete user from list
  const handleDeleteUser = async (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (
      window.confirm(
        `Are you sure you want to permanently delete "${targetUser.name}" (${userId})?`
      )
    ) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      await deleteUser(userId);
    }
  };

  // Callback: Save user (Create or Update from Modal)
  const handleSaveUser = async (userData) => {
    if (modalMode === 'edit') {
      setUsers((prev) =>
        prev.map((u) => (u.id === userData.id ? userData : u))
      );

      await updateUser(userData.id, userData);
    } else {
      setUsers((prev) => [userData, ...prev]);

      await createUser(userData);
    }

    handleCloseModal();
  };

  // Callback: Export users
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name,Role,Email,Phone,Joined,Status,Department']
        .concat(
          filteredUsers.map(
            (u) =>
              `"${u.id}","${u.name}","${u.role}","${u.email}","${u.phone || ''
              }","${u.joined || ''}","${u.status || 'Active'}","${u.dept || ''
              }"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');

    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `digiconnect_users_${new Date().toISOString().slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Computed metric counts
  const totalCount = users.length;

  const citizenCount = users.filter(
    (u) => (u.role || '').toLowerCase() === 'citizen'
  ).length;

  const officerCount = users.filter(
    (u) => (u.role || '').toLowerCase() === 'officer'
  ).length;

  const supervisorCount = users.filter(
    (u) => (u.role || '').toLowerCase() === 'supervisor'
  ).length;

  const grievanceCount = users.filter(
    (u) => (u.role || '').toLowerCase() === 'grievance'
  ).length;

  const adminCount = users.filter((u) =>
    ['super_user', 'super_admin', 'admin'].includes(
      (u.role || '').toLowerCase()
    )
  ).length;

  const suspendedCount = users.filter(
    (u) => (u.status || '').toLowerCase() === 'suspended'
  ).length;

  return (
    <div className="admin-page-root">
      {/* 1. Header Navbar passing user via Props */}
      <Navbar user={currentUser} />

      <main className="app-container">
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">
              Full administrative directory and access control across all
              citizen and departmental roles.
            </p>
          </div>
        </div>

        {/* 2. Summary Metric Cards with Role Filters */}
        <div className="admin-stats-strip">
          <StatCard
            label="Total Users"
            value={totalCount}
            type="all"
            active={roleFilter === 'all' && !statusFilter}
            onClick={() => {
              setRoleFilter('all');
              setStatusFilter('');
            }}
          />

          <StatCard
            label="Citizens"
            value={citizenCount}
            type="citizens"
            active={roleFilter === 'citizen'}
            onClick={() => {
              setRoleFilter('citizen');
              setStatusFilter('');
            }}
          />

          <StatCard
            label="Officers"
            value={officerCount}
            type="officers"
            active={roleFilter === 'officer'}
            onClick={() => {
              setRoleFilter('officer');
              setStatusFilter('');
            }}
          />

          <StatCard
            label="Supervisors"
            value={supervisorCount}
            type="supervisors"
            active={roleFilter === 'supervisor'}
            onClick={() => {
              setRoleFilter('supervisor');
              setStatusFilter('');
            }}
          />

          <StatCard
            label="Grievance Officers"
            value={grievanceCount}
            type="grievance"
            active={roleFilter === 'grievance'}
            onClick={() => {
              setRoleFilter('grievance');
              setStatusFilter('');
            }}
          />

          <StatCard
            label="Super Users"
            value={adminCount}
            type="admins"
            active={roleFilter === 'super_user'}
            onClick={() => {
              setRoleFilter('super_user');
              setStatusFilter('');
            }}
          />

          <StatCard
            label="Suspended"
            value={suspendedCount}
            type="suspended"
            active={statusFilter === 'Suspended'}
            onClick={() => {
              setRoleFilter('all');
              setStatusFilter('Suspended');
            }}
          />
        </div>

        {/* 3. Toolbar Component with Props & Child-to-Parent Callbacks */}
        <UserToolbar
          search={search}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onRoleFilterChange={handleRoleFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
          onAddNewUser={handleAddNewUser}
          onExport={handleExport}
        />

        {/* 4. User Table Component passing filtered list via Props & Callbacks */}
        <UserTable
          users={filteredUsers}
          totalCount={totalCount}
          onToggleStatus={handleStatusToggle}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />

        {/* 5. Add / Edit User Modal passing props and callbacks */}
        <EditUserModal
          isOpen={isModalOpen}
          user={activeUser}
          mode={modalMode}
          onSave={handleSaveUser}
          onClose={handleCloseModal}
        />
      </main>
    </div>
  );
}