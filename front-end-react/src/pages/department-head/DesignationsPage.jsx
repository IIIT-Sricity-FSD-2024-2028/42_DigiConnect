// src/pages/department-head/DesignationsPage.jsx
// Designations Management Page for Department Head
// Reference: front-end/department-head/designations.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Events (onClick, onSubmit),
// Lists (map), Context (useAuth), API calls (apiGetDesignations, apiCreateDesignation, apiDeleteDesignation)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetDesignations,
  apiCreateDesignation,
  apiDeleteDesignation,
} from '../../api/departmentHeadApi';
import Modal from '../../components/common/Modal';

export default function DesignationsPage() {
  const { user } = useAuth();
  const departmentId = user?.departmentId || '';
  const departmentName = user?.dept || 'Department';

  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDesignations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGetDesignations(departmentId);
      setDesignations(res?.data || []);
    } catch (err) {
      console.error('Error fetching designations:', err);
      setError('Failed to load designations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, [departmentId]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) {
      alert('Designation title and code are required.');
      return;
    }

    setSubmitting(true);
    try {
      await apiCreateDesignation({
        departmentId,
        title: newTitle.trim(),
        code: newCode.trim().toUpperCase(),
        description: newDesc.trim() || `${newTitle.trim()} for ${departmentName}`,
      });
      alert(`Designation "${newTitle}" created successfully!`);
      setIsModalOpen(false);
      setNewTitle('');
      setNewCode('');
      setNewDesc('');
      fetchDesignations();
    } catch (err) {
      alert(`Error creating designation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete designation "${title}"?`)) {
      return;
    }
    try {
      await apiDeleteDesignation(id);
      setDesignations((prev) => prev.filter((d) => d.id !== id));
      alert(`Designation "${title}" deleted.`);
    } catch (err) {
      alert(`Failed to delete designation: ${err.message}`);
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

      <div
        style={{
          background: '#eff6ff',
          borderLeft: '4px solid #2563eb',
          padding: '12px 16px',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af' }}>
          Job Role Philosophy:
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', marginTop: '2px' }}>
          Designations define operational duties (e.g. Village Revenue Officer, Revenue Inspector, Tahsildar). Every service workflow stage binds directly to a required designation.
        </div>
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
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Designation Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Village Revenue Officer (VRO)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Role Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. VRO"
              style={{ textTransform: 'uppercase' }}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              required
            />
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
    </div>
  );
}
