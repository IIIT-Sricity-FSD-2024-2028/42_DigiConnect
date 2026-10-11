// src/pages/grievance/GrievanceDetailPage.jsx
// React concepts used: Components, Props (prop drilling to timeline), State (useState),
// Events (onClick, onChange, onSubmit), Lists (.map), Hooks (useState, useEffect),
// Forms (controlled textarea & action selection), Router (useParams, useNavigate, Link),
// API calls (apiGetGrievanceById, apiGetLinkedApplication, apiResolveGrievance), Callbacks
// Inspects a grievance ticket, compares appeal with original application, and executes 3-way resolution.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  apiGetGrievanceById,
  apiGetLinkedApplication,
  apiResolveGrievance,
} from '../../api/grievanceApi';
import GrievanceTimeline from '../../components/grievance/GrievanceTimeline';
import Button from '../../components/common/Button';

/**
 * Formats date string to readable format: "15 Apr 2026, 04:00 PM".
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDetailDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

/**
 * Returns badge class and label for grievance status.
 */
function getStatusBadgeMeta(status = '') {
  const s = status.toLowerCase().replace(/_/g, '-');
  if (s === 'resolved' || s === 'completed' || s === 'escalated-resolved') {
    return { badgeClass: 'badge-success', label: 'Resolved' };
  }
  if (s === 'escalated') {
    return { badgeClass: 'badge-purple', label: 'Escalated' };
  }
  if (s === 'rejected' || s === 'dismissed') {
    return { badgeClass: 'badge-danger', label: 'Rejected' };
  }
  if (s === 'investigating' || s === 'under-review' || s === 'in-progress') {
    return { badgeClass: 'badge-info', label: 'Investigating' };
  }
  return { badgeClass: 'badge-warning', label: 'Open' };
}

// ── 3 Statutory Grievance Resolution Actions (Sections 28-32) ──
const RESOLUTION_OPTIONS = [
  {
    action: 'UPHOLD_REJECTION',
    title: 'Uphold Rejection',
    subtitle: 'Decision Upheld',
    description: 'Complaint is unsubstantiated. Original rejection stands with no changes to the application.',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    icon: (
      <svg width="24" height="24" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    action: 'DIRECT_RE_VERIFICATION',
    title: 'Direct Re-verification',
    subtitle: 'Reopen Application',
    description: 'Reopen application and re-inject it into the verification queue for a fresh inspection.',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    icon: (
      <svg width="24" height="24" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    action: 'OVERRULE_AND_ISSUE_CERTIFICATE',
    title: 'Overrule & Issue Certificate',
    subtitle: 'Approve & Issue',
    description: 'Overrule the prior rejection immediately and trigger automated digital certificate generation.',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    icon: (
      <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

/**
 * Returns user-facing success text for the resolution action.
 */
function getResolutionSuccessMessage(action = '') {
  if (action === 'UPHOLD_REJECTION') {
    return 'Rejection upheld successfully.';
  }
  if (action === 'DIRECT_RE_VERIFICATION') {
    return 'Application sent for re-verification successfully.';
  }
  if (action === 'OVERRULE_AND_ISSUE_CERTIFICATE') {
    return 'Rejection overruled and certificate issued successfully.';
  }
  return 'Grievance resolved successfully.';
}

export default function GrievanceDetailPage() {
  // [Router Hook] Extract grievance ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();

  // [State] Grievance and linked application data
  const [grievance, setGrievance] = useState(null);
  const [linkedApp, setLinkedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // [State] Controlled Resolution Form state
  const [selectedAction, setSelectedAction] = useState('UPHOLD_REJECTION');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // [Callback] Fetch grievance and optional linked application
  const loadGrievanceData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch grievance details
      const res = await apiGetGrievanceById(id);
      const grvData = res?.data || res;

      if (!grvData || !grvData.id) {
        throw new Error(`Grievance record '${id}' not found.`);
      }
      setGrievance(grvData);

      // 2. Fetch linked application if available
      if (grvData.relatedAppId) {
        try {
          const appRes = await apiGetLinkedApplication(grvData.relatedAppId);
          const appData = appRes?.data || appRes;
          setLinkedApp(appData && appData.id ? appData : null);
        } catch {
          setLinkedApp(null);
        }
      } else {
        setLinkedApp(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load grievance details.');
    } finally {
      setLoading(false);
    }
  };

  // [Hooks / useEffect] Load data on mount or when URL param 'id' changes
  useEffect(() => {
    loadGrievanceData();
  }, [id]);

  // [Callback] Handle controlled form submission for resolution
  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation: remarks required
    if (!remarks.trim()) {
      setSubmitError('Please enter resolution remarks explaining your decision before submitting.');
      return;
    }

    if (!selectedAction) {
      setSubmitError('Please select one of the three resolution actions.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiResolveGrievance(id, {
        action: selectedAction,
        remarks: remarks.trim(),
      });

      const result = response?.data || response;
      setSubmitSuccess({
        action: selectedAction,
        remarks: remarks.trim(),
        certificate: result?.certificate,
        application: result?.application,
      });

      // Clear input remarks
      setRemarks('');

      // Refresh grievance details to show updated status and history timeline
      await loadGrievanceData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit grievance resolution.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render Loading State ──
  if (loading && !grievance) {
    return (
      <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--navy-900)' }}>
          Loading grievance details for ticket #{id}...
        </div>
      </div>
    );
  }

  // ── Render Error State ──
  if (error && !grievance) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadGrievanceData}>
            Retry
          </Button>
        </div>
        <Button variant="secondary" onClick={() => navigate('/grievance/dashboard')}>
          ← Back to Grievance Queue
        </Button>
      </div>
    );
  }

  if (!grievance) return null;

  const statusMeta = getStatusBadgeMeta(grievance.status);
  const priority = (grievance.priority || 'medium').toLowerCase();
  const sla = (grievance.slaStatus || 'safe').toLowerCase();
  const isResolved =
    (grievance.status || '').toLowerCase() === 'resolved' ||
    (grievance.status || '').toLowerCase() === 'escalated-resolved';

  return (
    <div className="grievance-detail-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* ── Top Navigation / Breadcrumbs ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/grievance/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Queue</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Ticket ID: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--navy-900)' }}>{grievance.id}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadGrievanceData}
            title="Refresh record"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Hero Overview Banner ── */}
      <div className="card" style={{ padding: 'var(--space-xl)', borderLeft: '4px solid var(--navy-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy-700)' }}>
                {grievance.id}
              </span>
              <span className={`badge ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
              {grievance.category && (
                <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                  {grievance.category}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 var(--space-sm) 0' }}>
              {grievance.subject || 'Citizen Grievance Appeal'}
            </h1>

            <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.6, margin: 0 }}>
              {grievance.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Quick Metrics Column */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 'var(--space-md)',
              background: 'var(--slate-50)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                Citizen
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                {grievance.citizenName || 'Citizen'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {grievance.citizenId || '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                Priority
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  color: priority === 'high' ? 'var(--red-600)' : priority === 'low' ? 'var(--green-600)' : 'var(--amber-600)',
                }}
              >
                ● {priority}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                SLA Status
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: sla === 'breach' ? 'var(--red-600)' : sla === 'warn' ? 'var(--amber-600)' : 'var(--green-600)',
                }}
              >
                {sla === 'breach' ? 'Breached' : sla === 'warn' ? 'At Risk' : 'Safe'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                Filed Date
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                {formatDetailDate(grievance.filedDate || grievance.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Alert Banner (Shown after successful resolution) ── */}
      {submitSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{getResolutionSuccessMessage(submitSuccess.action)}</span>
          </div>
          {submitSuccess.remarks && (
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              Resolution Remarks: <em>"{submitSuccess.remarks}"</em>
            </p>
          )}
          {submitSuccess.certificate && (
            <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #86efac', marginTop: '4px' }}>
              🎉 <strong>Digital Certificate Issued:</strong> ID #{submitSuccess.certificate.id} ({submitSuccess.certificate.serviceName})
            </div>
          )}
        </div>
      )}

      {/* ── Two-Column Main Layout (Left: Inspection & Actions, Right: Timeline & Evidence) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 0.9fr)', gap: 'var(--space-xl)', alignItems: 'flex-start' }}>

        {/* ══ LEFT COLUMN: Inspection & Resolution Actions ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

          {/* 1. Citizen Appeal Statement */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Citizen Appeal Statement</span>
            </div>
            <div className="card-body">
              <div
                style={{
                  background: 'var(--amber-50)',
                  border: '1px solid var(--amber-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-md)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber-800)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Citizen's Registered Grounds for Grievance
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--navy-900)', lineHeight: 1.6 }}>
                  "{grievance.description || 'No statement provided'}"
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                <div><strong>Complainant:</strong> {grievance.citizenName}</div>
                <div><strong>Jurisdiction:</strong> {grievance.jurisdiction || '—'}</div>
                <div><strong>Assigned GRO:</strong> {grievance.officerName || 'Unassigned'}</div>
              </div>
            </div>
          </div>

          {/* 2. Linked Application Details (When Available) */}
          {linkedApp ? (
            <div className="card" style={{ borderTop: '3px solid var(--navy-500)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">Linked Application Reference</span>
                <span className="badge badge-info">{linkedApp.id}</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      Service Name
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {linkedApp.serviceName || 'Government Service'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      Current Status
                    </div>
                    <div>
                      <span className="badge badge-danger" style={{ textTransform: 'uppercase' }}>
                        {linkedApp.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      Assigned Officer
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                      {linkedApp.officerName || linkedApp.assignedOfficerName || 'Department Officer'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      Applied Date
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                      {formatDetailDate(linkedApp.submittedDate || linkedApp.appliedDate || linkedApp.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Prior Rejection Details */}
                {linkedApp.rejectionReason && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-md)',
                      marginTop: 'var(--space-sm)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                      Prior Rejection Reason
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '2px' }}>
                      {linkedApp.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '0.85rem' }}>
                No standalone application linked directly to ticket #{grievance.id}.
              </div>
            </div>
          )}

          {/* 3. Resolution Actions Form (Sections 28-32) */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">Resolution Decision</span>
              {isResolved && <span className="badge badge-success">Decision Recorded</span>}
            </div>

            <div className="card-body">
              {isResolved ? (
                /* ── Recorded Decision View when already resolved ── */
                <div>
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-md)',
                      marginBottom: 'var(--space-md)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Recorded Decision: {grievance.resolutionAction || 'RESOLVED'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#14532d', lineHeight: 1.6, fontWeight: 500 }}>
                      "{grievance.resolutionNote || grievance.remarks || grievance.resolutionRemarks || 'Grievance appeal has been resolved and closed.'}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                    <div><strong>Resolved By:</strong> {grievance.resolvedBy || 'Grievance Officer'}</div>
                    <div><strong>Closed Date:</strong> {formatDetailDate(grievance.closedDate || grievance.lastUpdated)}</div>
                    <div><strong>Status:</strong> Closed &amp; Archived</div>
                  </div>
                </div>
              ) : (
                /* ── Interactive Resolution Form when open ── */
                <>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                    Select an appellate resolution action and provide mandatory findings/remarks.
                  </p>

                  {/* 3 Resolution Action Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                    {RESOLUTION_OPTIONS.map((opt) => {
                      const isSelected = selectedAction === opt.action;
                      return (
                        <div
                          key={opt.action}
                          onClick={() => setSelectedAction(opt.action)}
                          style={{
                            padding: 'var(--space-md) var(--space-lg)',
                            border: `2px solid ${isSelected ? opt.color : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-lg)',
                            background: isSelected ? opt.bgColor : 'var(--color-surface)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--space-md)',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <div style={{ marginTop: '2px', flexShrink: 0 }}>{opt.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                {opt.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  color: opt.color,
                                  background: '#fff',
                                  border: `1px solid ${opt.borderColor}`,
                                  borderRadius: 'var(--radius-full)',
                                  padding: '1px 8px',
                                }}
                              >
                                {opt.action}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                              {opt.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Controlled Form for Resolution Remarks */}
                  <form onSubmit={handleResolutionSubmit}>
                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                      <label className="form-label" htmlFor="resolutionRemarks">
                        <span>Appellate Findings &amp; Resolution Remarks</span>
                        <span className="required" style={{ color: 'var(--red-500)', marginLeft: '4px' }}>*</span>
                      </label>
                      <textarea
                        id="resolutionRemarks"
                        className="form-textarea"
                        rows="4"
                        placeholder="Enter detailed reason for upholding, reopening, or overruling this application rejection..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--color-border)',
                          fontSize: '0.875rem',
                          fontFamily: 'inherit',
                          lineHeight: 1.5,
                          outline: 'none',
                        }}
                      />
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        These remarks will be recorded in the permanent audit trail and communicated to the citizen.
                      </div>
                    </div>

                    {/* Submission Error Alert */}
                    {submitError && (
                      <div className="alert alert-danger" style={{ marginBottom: 'var(--space-md)' }}>
                        {submitError}
                      </div>
                    )}

                    {/* Submit Action Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                      >
                        {submitting ? 'Processing Resolution...' : 'Submit Resolution Decision'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN: Grievance Timeline & Audit History ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Timeline Card */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">Ticket Audit &amp; Action History</span>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                {(grievance.history || []).length} events
              </span>
            </div>
            <div className="card-body">
              <GrievanceTimeline history={grievance.history || []} />
            </div>
          </div>

          {/* Evidence Attachments Card (if available) */}
          {grievance.evidence && grievance.evidence.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Supporting Evidence</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {grievance.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--slate-50)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <span style={{ color: 'var(--navy-900)', fontWeight: 600 }}>
                        📎 {ev.split(/[/\\]/).pop() || `Document ${idx + 1}`}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
