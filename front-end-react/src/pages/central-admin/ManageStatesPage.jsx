// src/pages/central-admin/ManageStatesPage.jsx
// Federation State Governments Management for Central Administrator
// React concepts: useState, useEffect, useMemo, Controlled inputs, Modals, Callbacks

import React, { useState, useEffect, useMemo } from 'react';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import CreateStateModal from '../../components/central-admin/CreateStateModal';
import StatesTable from '../../components/central-admin/StatesTable';
import {
  apiGetCentralStates,
  apiSetCentralStateStatus,
  apiResetCentralStateAdminPassword,
} from '../../api/centralAdminApi';
import { getNationalAnalyticsData } from '../../api/nationalAnalyticsService';

export default function ManageStatesPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    state: null,
    targetStatus: '',
    loading: false,
  });

  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    adminEmail: '',
    tempPassword: '',
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadStates = async () => {
    setLoading(true);
    setError('');
    try {
      const national = await getNationalAnalyticsData();
      setStates(national?.states || []);
    } catch (err) {
      console.error('Failed to load state records:', err);
      setError('Could not load State Governments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  // Summary counts
  const totalCount = states.length;
  const activeCount = states.filter((s) => (s.status || '').toUpperCase() === 'ACTIVE').length;
  const inactiveCount = totalCount - activeCount;

  // Filtered & Sorted list
  const filteredStates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return states
      .filter((s) => {
        const matchesQuery =
          !q ||
          s.name?.toLowerCase().includes(q) ||
          s.code?.toLowerCase().includes(q) ||
          s.governmentName?.toLowerCase().includes(q) ||
          s.stateAdminName?.toLowerCase().includes(q) ||
          s.stateAdmin?.name?.toLowerCase().includes(q) ||
          s.stateAdminEmail?.toLowerCase().includes(q);

        const isActive = (s.status || '').toUpperCase() === 'ACTIVE';
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && isActive) ||
          (statusFilter === 'inactive' && !isActive);

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'apps') {
          const aApps = a.totalApplications || a.applicationsCount || 0;
          const bApps = b.totalApplications || b.applicationsCount || 0;
          return bApps - aApps;
        }
        if (sortBy === 'revenue') {
          const aRev = a.totalRevenue || a.revenue || 0;
          const bRev = b.totalRevenue || b.revenue || 0;
          return bRev - aRev;
        }
        if (sortBy === 'depts') {
          const aDepts = a.departmentsCount || 0;
          const bDepts = b.departmentsCount || 0;
          return bDepts - aDepts;
        }
        return 0;
      });
  }, [states, searchQuery, statusFilter, sortBy]);

  // Handle Onboarding Created
  const handleStateCreated = (newState) => {
    showToast(`State Government '${newState.name || 'new'}' created successfully!`, 'success');
    loadStates();
  };

  // Trigger Status Toggle Dialog
  const handlePromptToggleStatus = (st) => {
    const isCurrentlyActive = (st.status || '').toUpperCase() === 'ACTIVE';
    const targetStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    setStatusModal({
      isOpen: true,
      state: st,
      targetStatus,
      loading: false,
    });
  };

  // Confirm Status Toggle Action
  const handleConfirmStatusToggle = async () => {
    if (!statusModal.state) return;
    setStatusModal((prev) => ({ ...prev, loading: true }));
    try {
      const stateId = statusModal.state.id || statusModal.state.code;
      await apiSetCentralStateStatus(stateId, statusModal.targetStatus);
      showToast(
        `State Government '${statusModal.state.name}' status updated to ${statusModal.targetStatus}.`,
        'success'
      );
      setStatusModal({ isOpen: false, state: null, targetStatus: '', loading: false });
      await loadStates();
    } catch (err) {
      showToast(err.message || 'Failed to update state status', 'error');
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Reset Admin Credentials
  const handleResetPassword = async (st) => {
    const adminName = st.stateAdminName || st.stateAdmin?.name || st.name;
    const adminEmail = st.stateAdminEmail || st.stateAdmin?.email || `admin@${(st.code || '').toLowerCase()}.gov.in`;

    try {
      const stateId = st.id || st.code;
      const res = await apiResetCentralStateAdminPassword(stateId);
      const tempPass = res?.tempPass || res?.data?.tempPass || `Gov@${st.code || 'SEC'}9821`;

      setPasswordModal({
        isOpen: true,
        adminEmail,
        tempPassword: tempPass,
      });
    } catch (err) {
      showToast(err.message || 'Failed to reset admin credentials', 'error');
    }
  };

  return (
    <div className="manage-states-page" style={{ padding: '4px 0 32px 0' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            background: toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#2563eb',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)' }}>
            State Governments
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--slate-500, #64748b)', fontSize: '0.875rem' }}>
            Manage and monitor State Governments registered on the DigiConnect federation.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>➕</span> Create State Government
        </button>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '12px 16px',
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          title="Total States"
          value={totalCount}
          subtitle="Federation coverage"
          icon="🏛️"
          iconColor="blue"
        />
        <StatCard
          title="Active States"
          value={activeCount}
          subtitle="Operational portals"
          icon="✅"
          iconColor="green"
        />
        <StatCard
          title="Inactive States"
          value={inactiveCount}
          subtitle="Suspended access"
          icon="⏸️"
          iconColor="amber"
        />
        <StatCard
          title="Total Admins"
          value={totalCount}
          subtitle="Strict 1:1 state admin mapping"
          icon="👤"
          iconColor="purple"
        />
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--slate-200, #e2e8f0)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1', minWidth: '260px', maxWidth: '420px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search state, code, admin..."
            style={{ paddingLeft: '12px' }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--slate-600, #475569)', fontWeight: 600 }}>
              Status:
            </label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--slate-600, #475569)', fontWeight: 600 }}>
              Sort by:
            </label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
            >
              <option value="name">State Name (A-Z)</option>
              <option value="apps">Total Applications</option>
              <option value="revenue">Highest Revenue</option>
              <option value="depts">Most Departments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <StatesTable
        states={filteredStates}
        onToggleStatus={handlePromptToggleStatus}
        onResetPassword={handleResetPassword}
      />

      {/* Create State Onboarding Modal */}
      <CreateStateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleStateCreated}
        existingStates={states}
      />

      {/* Activate / Deactivate Confirmation Dialog */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, state: null, targetStatus: '', loading: false })}
        title={statusModal.targetStatus === 'INACTIVE' ? `Deactivate Government of ${statusModal.state?.name}?` : `Activate Government of ${statusModal.state?.name}?`}
        maxWidth="480px"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-700, #334155)', lineHeight: 1.6, marginBottom: '20px' }}>
          {statusModal.targetStatus === 'INACTIVE'
            ? `Are you sure you want to deactivate ${statusModal.state?.name}? Deactivating this State Government will prevent its State Admin from accessing the administrative portal while preserving all historical applications, payment, and grievance records.`
            : `Are you sure you want to activate ${statusModal.state?.name}? This will restore State Administrator portal access and resume normal operations.`}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setStatusModal({ isOpen: false, state: null, targetStatus: '', loading: false })}
            disabled={statusModal.loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={statusModal.targetStatus === 'INACTIVE' ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={handleConfirmStatusToggle}
            disabled={statusModal.loading}
          >
            {statusModal.loading ? 'Updating...' : statusModal.targetStatus === 'INACTIVE' ? 'Confirm Deactivation' : 'Confirm Activation'}
          </button>
        </div>
      </Modal>

      {/* Reset Admin Temporary Password Display Modal */}
      <Modal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, adminEmail: '', tempPassword: '' })}
        title="🔑 State Administrator Credentials Reset"
        maxWidth="480px"
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-700, #334155)', lineHeight: 1.5 }}>
            A temporary password has been successfully generated for the State Administrator. Please share these credentials securely.
          </p>
        </div>

        <div
          style={{
            background: 'var(--slate-50, #f8fafc)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            borderRadius: 'var(--radius-md, 6px)',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Administrator Username:</span>
            <div style={{ fontWeight: 700, color: 'var(--navy-900, #0f172a)', fontSize: '0.9375rem' }}>
              {passwordModal.adminEmail}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>New Temporary Password:</span>
            <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.125rem', fontFamily: 'monospace' }}>
              {passwordModal.tempPassword}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPasswordModal({ isOpen: false, adminEmail: '', tempPassword: '' })}
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
