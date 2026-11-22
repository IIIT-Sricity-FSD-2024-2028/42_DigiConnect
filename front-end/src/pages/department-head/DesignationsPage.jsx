// src/pages/department-head/DesignationsPage.jsx
// Designations Management Page for Department Head
// Reference: front-end/department-head/designations.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Events (onClick, onSubmit),
// Lists (map), Context (useAuth), API calls (apiGetDesignations, apiCreateDesignation, apiDeleteDesignation)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDesignations,
  createDesignation,
  deleteDesignation,
  selectDeptHeadDesignations,
  selectDeptHeadLoading,
  selectDeptHeadError,
} from '../../store/slices/deptHeadSlice';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';

export default function DesignationsPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const departmentId = user?.departmentId || '';
  const departmentName = user?.dept || 'Department';

  // ── Redux Store State (Strict 1:1 binding, no local data bypassing) ──
  const designations = useAppSelector(selectDeptHeadDesignations);
  const loading = useAppSelector(selectDeptHeadLoading);
  const error = useAppSelector(selectDeptHeadError);

  // Toast feedback state
  const { toast, showToast, hideToast } = useToast();

  // Create Modal Ephemeral UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Ephemeral UI State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting, setDeleting] = useState(false);

  // ── Hook: Fetch Designations on Mount ──
  useEffect(() => {
    dispatch(fetchDesignations(departmentId));
  }, [dispatch, departmentId]);

  // ── CRUD: Create Designation (Create -> DB success -> Redux Store) ──
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newTitle.trim()) errors.title = 'Designation title is required.';
    if (!newCode.trim()) errors.code = 'Role code is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('Designation title and code are required.', 'warning');
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const payload = {
        departmentId,
        title: newTitle.trim(),
        code: newCode.trim().toUpperCase(),
        description: newDesc.trim() || `${newTitle.trim()} for ${departmentName}`,
      };
      const resultAction = await dispatch(createDesignation(payload));
      if (createDesignation.fulfilled.match(resultAction)) {
        showToast(`Designation "${newTitle}" created successfully!`, 'success');
        setIsModalOpen(false);
        setNewTitle('');
        setNewCode('');
        setNewDesc('');
      } else {
        showToast(resultAction.payload || 'Error creating designation', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating designation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, title) => {
    setDeleteTarget({ id, title });
  };

  // ── CRUD: Delete Designation (Delete -> DB success -> Redux Store) ──
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const resultAction = await dispatch(deleteDesignation(deleteTarget.id));
      if (deleteDesignation.fulfilled.match(resultAction)) {
        showToast(`Designation "${deleteTarget.title}" deleted.`, 'success');
        setDeleteTarget(null);
      } else {
        showToast(resultAction.payload || 'Failed to delete designation', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete designation', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dept-designations-page">
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div>
          <h1 className="page-title">Manage Role Designations</h1>
          <p className="page-subtitle">
            {departmentName} · Define operational job roles without numeric officer hierarchy levels
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          + Add Designation
        </button>
      </div>



      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span className="card-title">Configured Department Designations</span>
          <span className="badge badge-purple">{designations.length} Roles Active</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Role Code</th>
                  <th>Designation Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      Loading designations...
                    </td>
                  </tr>
                ) : designations.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      No designations configured yet. Click "+ Add Designation" to create one.
                    </td>
                  </tr>
                ) : (
                  designations.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <span className="badge badge-neutral">{d.code || d.id}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        👔 {d.title}
                      </td>
                      <td style={{ color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                        {d.description || 'Department operational role'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDelete(d.id, d.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for adding a new designation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="👔 Add Department Designation"
        footer={null}
      >
        <form onSubmit={handleCreateSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Designation Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Village Revenue Officer (VRO)"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
              }}
              required
            />
            {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Role Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. VRO"
              style={{ textTransform: 'uppercase' }}
              value={newCode}
              onChange={(e) => {
                setNewCode(e.target.value);
                if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: '' }));
              }}
              required
            />
            {fieldErrors.code && <div className="field-error">{fieldErrors.code}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Description</label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="Operational responsibilities..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--slate-100)' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Designation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Accessible Confirmation Modal for Designation Deletion */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Designation"
        message={`Are you sure you want to delete designation "${deleteTarget?.title}"? Officers assigned to this designation will be unlinked.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Designation'}
        confirmVariant="danger"
        loading={deleting}
      />

      {/* Global Toast Notification Container */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
