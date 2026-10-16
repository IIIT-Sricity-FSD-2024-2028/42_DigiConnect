// src/pages/state-admin/DepartmentGrievanceCellsPage.jsx
// Department Grievance Cells & Multi-Tier Appellate Workflows Page
// Converted from state-admin/grievance-cells.html
// React concepts used:
// 1. Components (DepartmentGrievanceCellsPage)
// 2. Props (passed to Modal, StatusBadge)
// 3. State (useState for cells, departments, loading, error, modal state, form state)
// 4. Events (onClick, onChange, onSubmit)
// 5. Lists (.map with unique keys for rendering table rows and dropdown options)
// 6. Hooks (useState, useEffect for data lifecycle, useContext via useAuth)
// 7. Context (consuming AuthContext to identify current state administrator)
// 8. Controlled inputs (form state bound to input value and onChange)
// 9. Component reuse (Modal, StatusBadge)
// 10. API calls (apiGetGrievanceCells, apiGetDepartments, apiConfigureGrievanceCell)

import React, { useState, useEffect } from 'react';
// Context: consuming existing AuthContext
import { useAuth } from '../../context/AuthContext';
// API calls: State Admin API functions
import {
  apiGetGrievanceCells,
  apiGetDepartments,
  apiConfigureGrievanceCell,
} from '../../api/stateAdminApi';
// Component reuse: Modal dialog from common components
import Modal from '../../components/common/Modal';
// Component reuse: StatusBadge from common components
import StatusBadge from '../../components/common/StatusBadge';

export default function DepartmentGrievanceCellsPage() {
  // Context: AuthContext provides current admin session
  const { user } = useAuth();
  const stateId = user?.stateId || user?.state_id || user?.state;

  // State: grievance cells list, departments list, loading, and error states
  const [cells, setCells] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State: Configure Cell Modal visibility and controlled form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: '',
    cellName: '',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Hooks / useEffect: fetch cells and departments on component mount
  const loadData = async () => {
    if (!stateId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // API Call: fetch grievance cells for state
      const cellsRes = await apiGetGrievanceCells(stateId);
      const cellsList = Array.isArray(cellsRes) ? cellsRes : cellsRes?.data || [];
      setCells(cellsList);

      // API Call: fetch state departments to populate department selection dropdown
      const deptsRes = await apiGetDepartments(stateId);
      const deptsList = Array.isArray(deptsRes) ? deptsRes : deptsRes?.data || [];
      setDepartments(deptsList);

      // Initialize default selected department in form if available
      if (deptsList.length > 0 && !formData.departmentId) {
        setFormData((prev) => ({
          ...prev,
          departmentId: deptsList[0].id,
          cellName: `${deptsList[0].name} Appellate Authority`,
        }));
      }
    } catch (err) {
      // State: capture error message
      setError(err.message || 'Failed to load department grievance cells');
    } finally {
      // State: stop loading spinner
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stateId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [stateId]);

  // ── Controlled input change handler ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // When department changes, suggest a default cell name
      if (name === 'departmentId') {
        const foundDept = departments.find((d) => d.id === value);
        if (foundDept) {
          updated.cellName = `${foundDept.name} Appellate Authority`;
        }
      }
      return updated;
    });
  };

  // ── Open modal handler ──
  const handleOpenModal = () => {
    const initialDeptId = departments.length > 0 ? departments[0].id : '';
    const initialDeptName = departments.length > 0 ? departments[0].name : '';
    setFormData({
      departmentId: initialDeptId,
      cellName: initialDeptName ? `${initialDeptName} Appellate Authority` : '',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  // ── Forms / Events: handle Configure Cell submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId || !formData.cellName.trim()) {
      setSubmitError('Please select a department and enter a cell name.');
      return;
    }

    const selectedDept = departments.find((d) => d.id === formData.departmentId);
    const deptName = selectedDept ? selectedDept.name : 'Department';

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        stateId: stateId,
        departmentId: formData.departmentId,
        deptName: deptName,
        cellName: formData.cellName.trim(),
        jurisdictionTier: formData.jurisdictionTier,
        slaDays: Number(formData.slaDays) || 7,
      };

      // API Call: post grievance cell configuration
      await apiConfigureGrievanceCell(payload);

      // Close modal and refresh list
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to configure grievance cell.');
    } finally {
      setSubmitting(false);
    }
  };

  // Notice if administrator has no assigned state jurisdiction
  if (!stateId) {
    return (
      <div style={{ padding: '32px', maxWidth: '800px', margin: '40px auto' }}>
        <div
          style={{
            background: 'var(--color-bg-card, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏛️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            No State Jurisdiction Assigned
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
            No state jurisdiction assigned to this administrator account. Please contact the Central Administrator.
          </p>
        </div>
      </div>
    );
  }

  // ── 1. LOADING STATE ──
  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          Loading Department Grievance Cells...
        </div>
        <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
          Retrieving department appellate authorities and escalation workflow configurations.
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
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Unable to Load Grievance Cells</div>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', color: '#b91c1c' }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: '14px' }}
            onClick={loadData}
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
            Department Grievance Cells & Multi-Tier Workflows
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            State Secretariat · Department-Bound Appellate Workflows & Jurisdiction Scopes
          </p>
        </div>

        {/* Action: Open Configure Cell Modal */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleOpenModal}
        >
          + Configure Grievance Cell
        </button>
      </div>

      {/* ── Master Architecture Information Banner ── */}
      <div
        style={{
          background: '#eff6ff',
          borderLeft: '4px solid #2563eb',
          padding: '14px 18px',
          borderRadius: '0 8px 8px 0',
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af' }}>
          🏛️ Master Architecture Rule:
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', marginTop: '4px', lineHeight: 1.5 }}>
          All services belonging to a state department share its designated grievance redressal cell.
          Grievance officers are scoped to hierarchical jurisdiction nodes (Sub-Division, District, or State) ensuring structured appellate resolution.
        </div>
      </div>

      {/* ── Configured Grievance Cells Table Card ── */}
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
            Configured Department Grievance Cells
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
            {cells.length} Active Cells
          </span>
        </div>

        {/* ── 3. EMPTY STATE ── */}
        {cells.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚖️</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>No Grievance Cells Configured Yet</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Click "+ Configure Grievance Cell" to establish the appellate redressal workflow for a state department.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Cell Name</th>
                  <th style={{ padding: '12px 16px' }}>Jurisdiction Tier Scope</th>
                  <th style={{ padding: '12px 16px' }}>Resolution SLA</th>
                  <th style={{ padding: '12px 16px' }}>Appellate Workflow Structure</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Lists: mapping over cells with key */}
                {cells.map((cell) => (
                  <tr key={cell.id || cell.departmentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#0f172a' }}>🏢 {cell.deptName || 'Department'}</strong>
                      {cell.departmentId && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {cell.departmentId}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e3a8a' }}>
                      {cell.cellName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {cell.jurisdictionTier || 'DISTRICT'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      {cell.slaDays || 7} Days
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#475569' }}>
                      {cell.workflowSummary || 'District Grievance Officer ➔ State Appellate Authority'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {/* Component reuse: StatusBadge */}
                      <StatusBadge status={cell.status || 'Active'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CONFIGURE GRIEVANCE CELL (Controlled Form)
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="⚖️ Configure Department Grievance Cell"
      >
        <form onSubmit={handleSubmit}>
          {submitError && (
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
              {submitError}
            </div>
          )}

          {/* Controlled input: Department Selection Dropdown */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              State Department <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="departmentId"
              className="form-input"
              value={formData.departmentId}
              onChange={handleInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              {departments.length === 0 ? (
                <option value="">No departments registered</option>
              ) : (
                /* Lists: map departments to options */
                departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Controlled input: Cell Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Grievance Cell Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="cellName"
              className="form-input"
              placeholder="e.g. Revenue Department Appellate Authority"
              value={formData.cellName}
              onChange={handleInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Controlled input: Jurisdiction Tier Scope */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Jurisdiction Tier Scope <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="jurisdictionTier"
              className="form-input"
              value={formData.jurisdictionTier}
              onChange={handleInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <option value="SUB_DIVISION">Sub-Division Scope (Mandal / Taluk appeals)</option>
              <option value="DISTRICT">District Scope (District Grievance Redressal)</option>
              <option value="STATE">State Appellate Scope (Secretariat Review)</option>
            </select>
          </div>

          {/* Controlled input: Resolution SLA Days */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Resolution SLA (Days) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="slaDays"
              className="form-input"
              min="1"
              max="30"
              value={formData.slaDays}
              onChange={handleInputChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Grievance Cell'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
