// src/pages/state-admin/DepartmentsManagementPage.jsx
// State Departments & Appointed Department Heads Management
// Converted from state-admin/departments.html
// React concepts used:
// 1. Components (DepartmentsManagementPage)
// 2. Props (passed to Modal, StatusBadge)
// 3. State (useState for departments list, loading, error, search/filter, modals, forms)
// 4. Events (onClick, onChange, onSubmit)
// 5. Lists (.map with keys for rendering department directory table rows)
// 6. Hooks (useState, useEffect for data lifecycle, useContext via useAuth)
// 7. Context (consuming AuthContext to identify current state administrator)
// 8. Controlled inputs (form state bound to input value and onChange)
// 9. Component reuse (Modal, StatusBadge)
// 10. API calls (apiGetDepartments, apiCreateDepartment, apiAssignDepartmentHead, apiUpdateDepartmentStatus)

import React, { useState, useEffect } from 'react';
// Context: consuming existing AuthContext
import { useAuth } from '../../context/AuthContext';
// API calls: State Admin API functions
import {
  apiGetDepartments,
  apiCreateDepartment,
  apiAssignDepartmentHead,
  apiUpdateDepartmentStatus,
} from '../../api/stateAdminApi';
// Component reuse: Modal dialog from common components
import Modal from '../../components/common/Modal';
// Component reuse: StatusBadge from common components
import StatusBadge from '../../components/common/StatusBadge';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';

export default function DepartmentsManagementPage() {
  // Context: AuthContext provides current admin session
  const { user } = useAuth();
  const stateId = user?.stateId || 'state_ap';

  // Toast feedback state
  const { toast, showToast, hideToast } = useToast();

  // State: departments list, loading, error
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State / Controlled inputs: search query and status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Inline validation error states
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [headFieldErrors, setHeadFieldErrors] = useState({});

  // State: Create Department Modal & Controlled Form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    description: '',
    headUserName: '',
    headUserEmail: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // State: Appoint / Replace IAS Head Modal & Controlled Form state
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [selectedDeptForHead, setSelectedDeptForHead] = useState(null);
  const [headForm, setHeadForm] = useState({
    name: '',
    email: '',
  });
  const [appointingHead, setAppointingHead] = useState(false);
  const [headError, setHeadError] = useState(null);

  // Hooks / useEffect: fetch departments on component mount
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      // API Call: fetch departments list from backend
      const data = await apiGetDepartments(stateId);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      // State: capture error message
      setError(err.message || 'Failed to load state departments');
    } finally {
      // State: stop loading spinner
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [stateId]);

  // ── Controlled input change handlers ──
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    if (createFieldErrors[name]) {
      setCreateFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleHeadInputChange = (e) => {
    const { name, value } = e.target;
    setHeadForm((prev) => ({ ...prev, [name]: value }));
    if (headFieldErrors[name]) {
      setHeadFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // ── Forms / Events: handle Create Department submit ──
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!createForm.name.trim()) errors.name = 'Department name is required.';
    if (!createForm.code.trim()) errors.code = 'Department code is required.';

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      setCreateError('Department name and code are required.');
      return;
    }
    setCreateFieldErrors({});

    try {
      setCreating(true);
      setCreateError(null);

      const payload = {
        stateId: stateId,
        name: createForm.name.trim(),
        code: createForm.code.trim().toUpperCase(),
        description: createForm.description.trim() || `${createForm.name} Department`,
        headUserName: createForm.headUserName.trim() || undefined,
        headUserEmail: createForm.headUserEmail.trim() || undefined,
      };

      // API Call: create department & appoint head in backend
      await apiCreateDepartment(payload);

      showToast(`Department "${payload.name}" created successfully!`, 'success');

      // Close modal, reset form, and refresh department list
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        code: '',
        description: '',
        headUserName: '',
        headUserEmail: '',
      });
      await fetchDepartments();
    } catch (err) {
      const msg = err.message || 'Failed to create department.';
      setCreateError(msg);
      showToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  // ── Modal trigger: Open Appoint IAS Head dialog ──
  const handleOpenAppointHead = (dept) => {
    setSelectedDeptForHead(dept);
    setHeadForm({
      name: dept.headName || '',
      email: dept.headEmail || '',
    });
    setHeadFieldErrors({});
    setHeadError(null);
    setIsHeadModalOpen(true);
  };

  // ── Forms / Events: handle Appoint IAS Head submit ──
  const handleAppointHeadSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!headForm.name.trim()) errors.name = 'IAS Department Head name is required.';
    if (!headForm.email.trim()) errors.email = 'Official email is required.';

    if (Object.keys(errors).length > 0) {
      setHeadFieldErrors(errors);
      setHeadError('Both IAS Department Head name and official email are required.');
      return;
    }
    setHeadFieldErrors({});

    try {
      setAppointingHead(true);
      setHeadError(null);

      // API Call: appoint department head
      await apiAssignDepartmentHead(selectedDeptForHead.id, {
        name: headForm.name.trim(),
        email: headForm.email.trim(),
      });

      showToast(`Department Head for ${selectedDeptForHead.name} appointed successfully!`, 'success');

      // Close modal and refresh list
      setIsHeadModalOpen(false);
      await fetchDepartments();
    } catch (err) {
      const msg = err.message || 'Failed to appoint Department Head.';
      setHeadError(msg);
      showToast(msg, 'error');
    } finally {
      setAppointingHead(false);
    }
  };

  // ── Events: handle Toggle Department Operational Status (Active / Suspended) ──
  const handleToggleStatus = async (dept) => {
    const nextStatus = dept.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      // API Call: patch department status
      await apiUpdateDepartmentStatus(dept.id, nextStatus);
      showToast(`Department "${dept.name}" status updated to ${nextStatus}.`, 'success');
      await fetchDepartments();
    } catch (err) {
      showToast(err.message || `Could not update status: ${err.message}`, 'error');
    }
  };

  // ── Filtered departments list for search & status filters ──
  const filteredDepartments = departments.filter((d) => {
    // Search query matching name, code, or head name
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.code && d.code.toLowerCase().includes(q)) ||
      (d.headName && d.headName.toLowerCase().includes(q));

    // Status filter matching ACTIVE or SUSPENDED
    const matchesStatus =
      statusFilter === 'ALL' ||
      (d.status && d.status.toUpperCase() === statusFilter);

    return matchesSearch && matchesStatus;
  });

  // ── 1. LOADING STATE ──
  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          Loading State Departments...
        </div>
        <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
          Retrieving registered line departments and appointed IAS Department Heads.
        </p>
      </div>
    );
  }

  // ── 2. ERROR STATE ──
  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            color: '#991b1b',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Unable to Load Departments</div>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', color: '#b91c1c' }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: '14px' }}
            onClick={fetchDepartments}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            State Departments & Appointed Department Heads
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Government Secretariat · Executive Departmental Administration & IAS Appointments
          </p>
        </div>

        {/* Action: Open Create Department Modal */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
        >
          + Create Department
        </button>
      </div>

      {/* ── Search & Filter Controls (Controlled Inputs) ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Controlled input: Search box */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search by department name, code, or IAS head..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Controlled input: Status dropdown */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>

        {/* Reset filter button */}
        {(searchQuery || statusFilter !== 'ALL') && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Department Directory Table Card ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
          }}
        >
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
            Registered Departments Directory
          </span>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
            {filteredDepartments.length} of {departments.length} Departments
          </span>
        </div>

        {/* ── 3. EMPTY STATE ── */}
        {filteredDepartments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏢</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>No Departments Found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search terms or filter settings.'
                : 'Get started by creating your first state department.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Code</th>
                  <th style={{ padding: '12px 16px' }}>Appointed IAS Department Head</th>
                  <th style={{ padding: '12px 16px' }}>Services</th>
                  <th style={{ padding: '12px 16px' }}>Officers</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Lists: mapping over filtered departments with key */}
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id || dept.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#0f172a' }}>{dept.name}</strong>
                      {dept.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {dept.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <code
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {dept.code}
                      </code>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {dept.headName ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            👤 {dept.headName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {dept.headEmail}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>
                          ⚠️ Unassigned (Appoint IAS Head)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                        {dept.servicesCount || 0} Services
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {dept.officersCount || 0} Officers
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {/* Component reuse: StatusBadge */}
                      <StatusBadge status={dept.status || 'ACTIVE'} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {/* Action: Appoint IAS Department Head */}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => handleOpenAppointHead(dept)}
                          title="Appoint or replace IAS Department Head"
                        >
                          👤 Appoint Head
                        </button>

                        {/* Action: Toggle Active / Suspended */}
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            color: dept.status === 'ACTIVE' ? '#ca8a04' : '#16a34a',
                          }}
                          onClick={() => handleToggleStatus(dept)}
                          title="Toggle operational status"
                        >
                          {dept.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: CREATE DEPARTMENT & APPOINT IAS HEAD (Controlled Form)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="🏢 Create State Department & Appoint Head"
      >
        <form onSubmit={handleCreateSubmit}>
          {createError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}
            >
              {createError}
            </div>
          )}

          {/* Controlled input: Department Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Department Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Higher Education Department"
              value={createForm.name}
              onChange={handleCreateInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {createFieldErrors.name && <div className="field-error">{createFieldErrors.name}</div>}
          </div>

          {/* Controlled input: Department Code */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Department Code <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="code"
              className="form-input"
              placeholder="e.g. DEPT_HED, DEPT_FOR"
              value={createForm.code}
              onChange={handleCreateInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase' }}
            />
            {createFieldErrors.code && <div className="field-error">{createFieldErrors.code}</div>}
          </div>

          {/* Controlled input: Description */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Department Description
            </label>
            <textarea
              name="description"
              className="form-input"
              rows="2"
              placeholder="e.g. Administration of collegiate and technical education institutions"
              value={createForm.description}
              onChange={handleCreateInputChange}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* IAS Department Head Appointment section */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '10px' }}>
              🎖️ Appoint IAS Department Head (Optional)
            </div>

            {/* Controlled input: IAS Head Full Name */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                IAS Officer Full Name
              </label>
              <input
                type="text"
                name="headUserName"
                className="form-input"
                placeholder="e.g. Dr. K. Radhakrishnan IAS"
                value={createForm.headUserName}
                onChange={handleCreateInputChange}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Controlled input: IAS Head Official Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Official Government Email
              </label>
              <input
                type="email"
                name="headUserEmail"
                className="form-input"
                placeholder="e.g. head.hed@state.gov.in"
                value={createForm.headUserEmail}
                onChange={handleCreateInputChange}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: APPOINT / REPLACE IAS HEAD (Controlled Form)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isHeadModalOpen}
        onClose={() => setIsHeadModalOpen(false)}
        title={selectedDeptForHead ? `👤 Appoint IAS Head: ${selectedDeptForHead.name}` : 'Appoint Head'}
      >
        <form onSubmit={handleAppointHeadSubmit}>
          {headError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}
            >
              {headError}
            </div>
          )}

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
            Appoint a commissioned IAS officer to oversee departmental workflows, onboard field officers, and review escalated service queries.
          </p>

          {/* Controlled input: IAS Officer Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              IAS Officer Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Dr. S. Suresh Kumar IAS"
              value={headForm.name}
              onChange={handleHeadInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {headFieldErrors.name && <div className="field-error">{headFieldErrors.name}</div>}
          </div>

          {/* Controlled input: Official Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Official Government Email <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. head.rev@state.gov.in"
              value={headForm.email}
              onChange={handleHeadInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {headFieldErrors.email && <div className="field-error">{headFieldErrors.email}</div>}
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsHeadModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={appointingHead}
            >
              {appointingHead ? 'Appointing...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Toast Notification Container */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
