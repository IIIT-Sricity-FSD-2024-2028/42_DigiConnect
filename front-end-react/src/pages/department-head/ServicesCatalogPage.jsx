// src/pages/department-head/ServicesCatalogPage.jsx
// Department Services Catalog Page
// Reference: front-end/department-head/services.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Events (onClick),
// Lists (map), Context (useAuth), Router (useNavigate, Link), API calls (apiGetDeptServices, apiDeleteService)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetDeptServices, apiDeleteService } from '../../api/departmentHeadApi';
import Modal from '../../components/common/Modal';
// import StatusBadge from '../../components/common/StatusBadge';

export default function ServicesCatalogPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const departmentId = user?.departmentId || '';
  const departmentName = user?.dept || 'Department';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inspect Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectedService, setInspectedService] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGetDeptServices(departmentId);
      setServices(res?.data || []);
    } catch (err) {
      console.error('Error fetching department services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [departmentId]);

  const handleInspect = (service) => {
    setInspectedService(service);
    setInspectModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) {
      return;
    }
    try {
      await apiDeleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      alert(`Service "${name}" was deleted successfully.`);
    } catch (err) {
      alert(`Failed to delete service: ${err.message}`);
    }
  };

  return (
    <div className="dept-services-page">
      {/* ── Page Header ── */}
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
          <h1 className="page-title">Department Services Catalog</h1>
          <p className="page-subtitle">
            {departmentName} · Dynamic Form Schemas, Proofs, Fees &amp; Workflow Routing
          </p>
        </div>
        <Link to="/department-head/service-builder" className="btn btn-primary btn-sm">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          + Build New Service
        </Link>
      </div>



      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* ── Services Table Card ── */}
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span className="card-title">Services Offered by Department</span>
          <span className="badge badge-purple">
            {loading ? 'Loading...' : `${services.length} Active Services`}
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Service Code</th>
                  <th>Service Name &amp; Description</th>
                  <th>Fee Breakdown</th>
                  <th>Resolution SLA</th>
                  <th>Workflow Sequence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      Loading department services...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      No services configured for this department yet.{' '}
                      <Link to="/department-head/service-builder" style={{ color: 'var(--navy-600)', fontWeight: 600 }}>
                        Click "+ Build New Service" to create one.
                      </Link>
                    </td>
                  </tr>
                ) : (
                  services.map((s) => {
                    const serviceFee = s.serviceFee ?? s.fee ?? 35;
                    const platformFee = s.platformFee ?? 15;
                    const totalFee = s.totalFee ?? (serviceFee + platformFee);
                    const sla = s.slaDays ?? s.sla ?? 7;

                    let workflowText = s.workflowSummary || '';
                    if (!workflowText && Array.isArray(s.workflowSteps) && s.workflowSteps.length > 0) {
                      workflowText = s.workflowSteps
                        .map((st) => st.stepName || st.requiredDesignationId?.replace('desig_', '').toUpperCase())
                        .join(' ➔ ');
                    }
                    if (!workflowText) workflowText = 'VRO ➔ MRO ➔ Tahsildar (DSC)';

                    return (
                      <tr key={s.id || s.code}>
                        <td>
                          <span className="badge badge-neutral">{s.code || s.id}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>📜 {s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {s.description || 'Statutory citizen delivery service.'}
                          </div>
                        </td>
                        <td>
                          <strong>₹{totalFee}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            (₹{serviceFee} Dept + ₹{platformFee} Portal)
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-warning">⏱️ {sla} Days</span>
                        </td>
                        <td>
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem', whiteSpace: 'normal', lineHeight: '1.4' }}>
                            {workflowText}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleInspect(s)}
                            >
                              Inspect
                            </button>
                            <Link
                              to={`/department-head/service-builder?id=${s.id}`}
                              className="btn btn-ghost btn-sm"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#ef4444' }}
                              onClick={() => handleDelete(s.id, s.name)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Inspect Service Schema Modal ── */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title={inspectedService ? `🔍 Service Schema — ${inspectedService.name}` : 'Service Schema'}
        maxWidth="680px"
        footer={
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setInspectModalOpen(false)}>
            Close
          </button>
        }
      >
        {inspectedService && (
          <div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                Service Information
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                {inspectedService.name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                Code: <code>{inspectedService.code}</code> · Total Fee:{' '}
                <strong>
                  ₹{(inspectedService.serviceFee ?? 35) + (inspectedService.platformFee ?? 15)}
                </strong>{' '}
                · SLA: <strong>{inspectedService.slaDays || 7} Days</strong>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', marginTop: '8px' }}>
                {inspectedService.description || 'Statutory departmental service.'}
              </p>
            </div>

            {/* Workflow Steps Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>
                ⚡ Multi-Stage Workflow Steps
              </div>
              {Array.isArray(inspectedService.workflowSteps) && inspectedService.workflowSteps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inspectedService.workflowSteps.map((st, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.875rem' }}>
                          Step {st.stepNumber || i + 1}: {st.stepName || 'Verification'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                          Assigned Role: <span className="badge badge-purple">{st.requiredDesignationId}</span>
                        </div>
                      </div>
                      <div>
                        {st.isFinalApprovalStep ? (
                          <span className="badge badge-success">Final DSC Signoff</span>
                        ) : (
                          <span className="badge badge-neutral">Review Stage</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                  Default multi-tier sequence: VRO Verification ➔ MRO Scrutiny ➔ Tahsildar Final Signoff
                </p>
              )}
            </div>

            {/* Form Fields Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>
                📝 Dynamic Citizen Form Fields
              </div>
              {Array.isArray(inspectedService.fields) && inspectedService.fields.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {inspectedService.fields.map((f, i) => (
                    <span key={i} className="badge badge-neutral" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                      {f.label} ({f.type}) {f.required && '★'}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Standard applicant profile fields</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
