// src/pages/officer/ReviewApplicationPage.jsx
// Complete Department Field Officer Application Review & Decision Page.
//
// React Concepts Demonstrated:
//  [Component]     — ReviewApplicationPage composable container with Hero, Info Blocks, and Action Panel
//  [Props]         — Pass application details, event callbacks, and decision states to sub-sections
//  [State]         — useState for queue, currentIdx, decision ('approve'|'query'|'reject'), form inputs, modal visibility, and toast
//  [Events]        — onClick (decision cards, queue nav, pagination, modal triggers), onChange (select, textareas)
//  [Lists]         — Mapped rendering of applicant fields, service fields, uploaded documents, timeline events, and queue items
//  [Hooks]         — useState, useEffect (data fetching & URL param syncing), useMemo (SLA & derived stats)
//  [Forms]         — Controlled form elements for decision selection, rejection reason dropdown, query textarea, and officer remarks
//  [Context]       — useAuth to read logged-in officer information and department
//  [Router]        — useParams to inspect active application ID, useNavigate for redirecting back to queue or next app
//  [API calls]     — apiGetOfficerQueue, apiGetApplicationById, apiOfficerApprove, apiOfficerReject, apiOfficerRaiseQuery
//  [Prop Drilling] — Passing callback handlers and form state down to nested sections
//  [Callbacks]     — handleSelectDecision, handleConfirmSubmit, handleNavigateApp, handleFieldChange

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import DecisionModal from '../../components/officer/DecisionModal';
import {
  apiGetOfficerQueue,
  apiGetApplicationById,
  apiApproveApplication,
  apiRejectApplication,
  apiRaiseQueryApplication,
} from '../../api/officerApi';

// Rejection reason options
const REJECTION_REASONS = [
  'Insufficient or invalid documents',
  'Duplicate application already processed',
  'Applicant is not eligible for this service',
  'Income / community data mismatch',
  'Fraudulent or tampered documents',
  'Other (specify in remarks)',
];

export default function ReviewApplicationPage() {
  // [Context] Extract logged in officer info
  const { user } = useAuth();

  // [Router] Extract URL parameter and navigation trigger
  const { id: routeAppId } = useParams();
  const navigate = useNavigate();

  // ── [State] Queue & Current Selection State ──
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── [State] Decision & Form States ──
  const [currentDecision, setCurrentDecision] = useState('approve'); // 'approve' | 'query' | 'reject'
  const [rejectReason, setRejectReason] = useState('');
  const [queryText, setQueryText] = useState('');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ── [Hooks] Toast notification via shared useToast hook ──
  const { toast, showToast, hideToast } = useToast(4000);

  // ── [Hooks + API calls] Fetch Officer Queue and Application Details ──
  useEffect(() => {
    let isMounted = true;

    async function loadQueueData() {
      // If queue is already present in state and contains routeAppId, just sync selection index
      if (queue.length > 0 && routeAppId) {
        const inMemoryIdx = queue.findIndex(
          (a) => String(a.id).toLowerCase() === String(routeAppId).toLowerCase()
        );
        if (inMemoryIdx !== -1) {
          setCurrentIdx(inMemoryIdx);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const res = await apiGetOfficerQueue();
        const rawQueue = res?.data || (Array.isArray(res) ? res : []);

        // Filter active applications only
        const activeQueue = rawQueue.filter(
          (a) => !['approved', 'rejected', 'completed'].includes(a.status)
        );

        if (!isMounted) return;

        setQueue(activeQueue);

        // If a specific ID is provided in the URL route, find its index
        if (routeAppId && activeQueue.length > 0) {
          const foundIdx = activeQueue.findIndex(
            (a) => String(a.id).toLowerCase() === String(routeAppId).toLowerCase()
          );
          if (foundIdx !== -1) {
            setCurrentIdx(foundIdx);
          } else {
            // Fallback: fetch single application
            try {
              const singleRes = await apiGetApplicationById(routeAppId);
              if (singleRes?.data && isMounted) {
                setQueue([singleRes.data]);
                setCurrentIdx(0);
              }
            } catch (err) {
              console.warn('Single app fetch fallback:', err.message);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load application queue');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQueueData();

    return () => {
      isMounted = false;
    };
  }, [routeAppId]);

  // Current active application
  const currentApp = queue[currentIdx] || null;

  // ── [Hooks] SLA Calculations for Hero Banner ──
  const slaStats = useMemo(() => {
    if (!currentApp) return { label: '7 days', color: '#10b981', percent: 100, isOverdue: false, slaLeft: 5, slaTotal: 7 };
    const slaLeft = typeof currentApp.slaLeft === 'number' ? currentApp.slaLeft : 5;
    const slaTotal = typeof currentApp.slaTotal === 'number' ? currentApp.slaTotal : 7;
    const isOverdue = slaLeft < 0;
    const percent = Math.max(5, Math.min(100, (Math.abs(slaLeft) / Math.max(slaTotal, 1)) * 100));

    let color = '#10b981';
    let label = `${slaLeft}d remaining`;

    if (isOverdue) {
      color = 'var(--red-500)';
      label = `${Math.abs(slaLeft)}d overdue`;
    } else if (slaLeft <= 2) {
      color = 'var(--amber-500)';
      label = `${slaLeft}d left ⚠`;
    }

    return {
      slaLeft,
      slaTotal,
      isOverdue,
      percent,
      color,
      label,
    };
  }, [currentApp]);

  // ── [Callbacks + Events] Navigation between applications in queue ──
  const handleNavigateApp = (newIndex) => {
    if (newIndex >= 0 && newIndex < queue.length) {
      setCurrentIdx(newIndex);
      const nextApp = queue[newIndex];
      if (nextApp) {
        navigate(`/officer/review/${nextApp.id}`, { replace: true });
      }
      // Reset decision form
      setCurrentDecision('approve');
      setRejectReason('');
      setQueryText('');
      setOfficerRemarks('');
    }
  };

  // ── [Callbacks + Events] Decision selection ──
  const handleSelectDecision = (type) => {
    setCurrentDecision(type);
  };

  // ── [Callbacks + Events] Initial submit button click (Validations) ──
  const handlePromptSubmit = () => {
    if (!currentApp) return;

    if (currentDecision === 'reject' && !rejectReason.trim()) {
      showToast('Please select a rejection reason from the dropdown.', 'warning');
      return;
    }

    if (currentDecision === 'query' && !queryText.trim()) {
      showToast('Please enter the query / clarification required from the citizen.', 'warning');
      return;
    }

    setShowConfirmModal(true);
  };

  // ── [State] Track approvals made in this review session ──
  const [sessionApprovals, setSessionApprovals] = useState(0);

  // ── [Callbacks + API calls] Final submission after modal confirmation ──
  const handleFinalConfirm = async () => {
    if (!currentApp) return;

    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const wasApproval = currentDecision === 'approve';
      const updatedApprovals = wasApproval ? sessionApprovals + 1 : sessionApprovals;

      // [API calls] Wire decision triggers to apiApproveApplication, apiRejectApplication, apiRaiseQueryApplication
      if (wasApproval) {
        await apiApproveApplication(
          currentApp.id,
          officerRemarks || 'Verified and approved by field officer.'
        );
        setSessionApprovals(updatedApprovals);
        // [Feedback alert/toast]
        showToast(`Application ${currentApp.id} approved successfully!`, 'success');
      } else if (currentDecision === 'reject') {
        await apiRejectApplication(currentApp.id, rejectReason);
        // [Feedback alert/toast]
        showToast(`Application ${currentApp.id} rejected. Citizen notified.`, 'warning');
      } else if (currentDecision === 'query') {
        await apiRaiseQueryApplication(currentApp.id, queryText);
        // [Feedback alert/toast]
        showToast(`Query sent to ${currentApp.citizen || currentApp.citizenName || 'citizen'} successfully.`, 'info');
      }

      // [Synchronize State] Remove processed application from local queue
      const updatedQueue = queue.filter((_, idx) => idx !== currentIdx);
      setQueue(updatedQueue);

      // Reset decision form state
      setCurrentDecision('approve');
      setRejectReason('');
      setQueryText('');
      setOfficerRemarks('');

      // [Update queue counts and redirect or load next application in queue]
      if (updatedQueue.length === 0) {
        // Queue is finished: redirect to /officer/dashboard after brief toast display
        setTimeout(() => {
          navigate('/officer/dashboard');
        }, 1200);
      } else {
        // Queue has remaining items: load the next application in queue
        const nextIdx = Math.min(currentIdx, updatedQueue.length - 1);
        setCurrentIdx(nextIdx);
        const nextApp = updatedQueue[nextIdx];
        if (nextApp) {
          navigate(`/officer/review/${nextApp.id}`, { replace: true });
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit decision. Please retry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Applicant metadata fields list
  const applicantFields = currentApp
    ? [
      { label: 'Full Name', value: currentApp.citizen || currentApp.citizenName || '—' },
      { label: 'Aadhaar Number', value: currentApp.aadhaar || 'XXXX-XXXX-8921' },
      { label: 'Mobile Phone', value: currentApp.phone || currentApp.citizenPhone || '—' },
      { label: 'Date of Birth', value: currentApp.dob || '14 May 1988' },
      { label: 'Gender', value: currentApp.gender || 'Male' },
      { label: 'Jurisdiction / Ward', value: currentApp.jurisdiction || 'Ward 14, Zone B' },
    ]
    : [];

  // Service specific fields list
  const serviceFields = currentApp
    ? [
      { label: 'Service Name', value: currentApp.service || currentApp.serviceName || '—' },
      { label: 'Application ID', value: currentApp.id || '—' },
      { label: 'Annual Income Declared', value: currentApp.formData?.annualIncome ? `₹${Number(currentApp.formData.annualIncome).toLocaleString('en-IN')}` : '₹1,80,000' },
      { label: 'Occupation', value: currentApp.formData?.occupation || 'Private Sector / Agriculture' },
      { label: 'Purpose of Certificate', value: currentApp.formData?.purpose || 'Higher Education & Scholarship' },
      { label: 'Family Members', value: currentApp.formData?.familyCount || '4' },
    ]
    : [];

  // Documents list
  const documents = currentApp?.documents?.length
    ? currentApp.documents
    : [
      { name: 'Income_Proof_Salary_Slip.pdf', size: '420 KB', type: 'application/pdf' },
      { name: 'Aadhaar_Card_Front_Back.pdf', size: '610 KB', type: 'application/pdf' },
      { name: 'Ration_Card_Family_Proof.jpg', size: '1.2 MB', type: 'image/jpeg' },
    ];

  // Application Timeline History list
  const timelineEvents = currentApp?.timeline?.length
    ? currentApp.timeline
    : [
      {
        action: 'Application Submitted',
        date: currentApp?.submitted || '23 Jan 2025, 10:30 AM',
        actor: currentApp?.citizen || 'Applicant',
        note: 'Online submission through Citizen Portal',
      },
      {
        action: 'Stage 1 Verification Assigned',
        date: '23 Jan 2025, 11:15 AM',
        actor: user?.name || 'Department Officer',
        note: 'Assigned to field officer queue for document verification',
      },
    ];

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
        <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Loading application details...</p>
      </div>
    );
  }

  if (error || !currentApp) {
    return (
      <div style={{ maxWidth: '800px', margin: 'var(--space-2xl) auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <svg width="48" height="48" fill="none" stroke="var(--red-500)" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto var(--space-md) auto' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
            {error || 'No applications available for review.'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
            Your assigned verification queue is currently empty or all applications have been reviewed.
          </p>
          <Link
            to="/officer/dashboard"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            ← Back to Officer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Toast Notification — [Component + Props + Callbacks] ── */}
      <Toast toast={toast} onClose={hideToast} />

      {/* ── Back Navigation Bar ── */}
      <div style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/officer/dashboard"
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* ── Top Hero Banner ── */}
      <div className="app-hero">
        <div className="app-hero-grid">
          <div>
            <div className="hero-app-id">{currentApp.id}</div>
            <div
              className="hero-title app-review-title"
              style={{ color: 'var(--navy-900, #0f172a)', fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 10px 0' }}
            >
              {currentApp.service || currentApp.serviceName || 'Service Application'} — Review
            </div>
            <div className="hero-meta-row">
              <div className="hero-meta-item">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <strong>{currentApp.citizen || currentApp.citizenName}</strong>
              </div>
              <div className="hero-meta-item">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .16h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.11 6.11l1.27-.34a2 2 0 012.11.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <span>{currentApp.phone || currentApp.citizenPhone || '9876540001'}</span>
              </div>
              <div className="hero-meta-item">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Submitted: <strong>{currentApp.submitted || currentApp.submittedDate || 'Recent'}</strong>
              </div>
              <span className={`badge ${currentApp.status === 'new' ? 'badge-info' : currentApp.status === 'urgent' ? 'badge-danger' : 'badge-warning'}`}>
                {currentApp.status === 'new' ? 'New' : currentApp.status === 'urgent' ? 'Urgent' : 'In Review'}
              </span>
            </div>
          </div>

          {/* SLA Hero Status Ring */}
          <div className="sla-hero" style={{ borderColor: slaStats.isOverdue ? 'var(--red-300)' : 'var(--color-border)' }}>
            <div className="sla-hero-label">SLA Status</div>
            <div className="sla-hero-val" style={{ color: slaStats.color }}>
              {slaStats.isOverdue ? `+${Math.abs(slaStats.slaLeft)}d` : `${slaStats.slaLeft}d`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
              {slaStats.isOverdue ? 'overdue' : 'remaining'}
            </div>
            <div style={{ height: '6px', background: 'var(--slate-100)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '99px', background: slaStats.color, width: `${slaStats.percent}%` }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {Math.max(0, (slaStats.slaTotal || 7) - Math.max(0, slaStats.slaLeft || 0))} of {slaStats.slaTotal || 7} days used
            </div>
          </div>
        </div>

        {/* Prev / Next queue stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={currentIdx === 0}
            onClick={() => handleNavigateApp(currentIdx - 1)}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Application <strong>{currentIdx + 1}</strong> of <strong>{queue.length}</strong>
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={currentIdx === queue.length - 1}
            onClick={() => handleNavigateApp(currentIdx + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Review Layout ── */}
      <div className="review-layout">
        {/* ── LEFT COLUMN: Application Details & Documents ── */}
        <div>
          {/* Section 1: Applicant Information */}
          <div className="info-block">
            <div className="info-block-header">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="info-block-title">Applicant Information</span>
            </div>
            <div className="info-block-body">
              {/* [Lists] Map applicant metadata fields */}
              <div className="detail-grid">
                {applicantFields.map((field) => (
                  <div key={field.label}>
                    <div className="detail-field-label">{field.label}</div>
                    <div className="detail-field-value">{field.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Service-Specific Data */}
          <div className="info-block">
            <div className="info-block-header">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span className="info-block-title">
                {currentApp.service || 'Service Details'}
              </span>
            </div>
            <div className="info-block-body">
              {/* [Lists] Map service-specific fields */}
              <div className="detail-grid">
                {serviceFields.map((field) => (
                  <div key={field.label}>
                    <div className="detail-field-label">{field.label}</div>
                    <div className="detail-field-value">{field.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Uploaded Documents */}
          <div className="info-block">
            <div className="info-block-header">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="info-block-title">Uploaded Verification Documents</span>
              <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                {documents.length} file{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="info-block-body">
              {/* [Lists] Map uploaded documents */}
              {documents.map((doc, idx) => (
                <div key={idx} className="doc-row">
                  <div className="doc-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="doc-name">{doc.name || `Document_${idx + 1}.pdf`}</div>
                    <div className="doc-size">{doc.size || 'Document · ~400 KB'}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => showToast(`Opening ${doc.name}...`, 'info')}
                  >
                    View Document
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Citizen Response (if pending query was answered) */}
          {currentApp.citizenResponse && (
            <div className="info-block" style={{ borderColor: 'var(--amber-300)', backgroundColor: '#fffbfa' }}>
              <div className="info-block-header" style={{ background: '#fef3c7', borderBottom: '1px solid var(--amber-200)' }}>
                <svg width="15" height="15" fill="none" stroke="var(--amber-600)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="info-block-title" style={{ color: 'var(--amber-800)' }}>
                  Citizen Response to Query
                </span>
              </div>
              <div className="info-block-body">
                <div style={{ fontSize: '0.875rem', color: 'var(--navy-800)', fontWeight: 500, fontStyle: 'italic' }}>
                  "{currentApp.citizenResponse}"
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Application Timeline History */}
          <div className="info-block">
            <div className="info-block-header">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="12,8 12,12 14,14" />
                <path d="M3.05 11a9 9 0 1 0 .5-4m-.5 4V7m0 4H7" />
              </svg>
              <span className="info-block-title">Application Audit Trail & History</span>
            </div>
            <div className="info-block-body">
              {/* [Lists] Map audit timeline */}
              <div className="history-tl">
                {timelineEvents.map((ev, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-dot" style={{ background: '#10b981' }}>
                      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20,6 9,17 4,12" strokeWidth="3" stroke="#fff" />
                      </svg>
                    </div>
                    <div className="history-label">{ev.action}</div>
                    <div className="history-ts">
                      {ev.date} · <strong>{ev.actor}</strong>
                    </div>
                    {ev.note && <div className="history-detail">{ev.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Decision Action Panel & Queue Navigator ── */}
        <div>
          {/* Action Panel Form */}
          <div className="action-panel">
            <div className="action-panel-header">
              <div className="action-panel-title">Officer Verification Decision</div>
            </div>
            <div className="action-panel-body">
              {/* [Forms + Events] Decision Card Option 1: Approve */}
              <div className="decision-cards">
                <div
                  className={`decision-card ${currentDecision === 'approve' ? 'selected-approve' : ''}`}
                  onClick={() => handleSelectDecision('approve')}
                >
                  <div className="decision-dot" />
                  <div>
                    <div className="decision-label" style={{ color: '#166534' }}>
                      ✓ Approve & Issue
                    </div>
                    <div className="decision-sub">Certificate will be generated and citizen notified</div>
                  </div>
                </div>

                {/* Decision Card Option 2: Raise Query */}
                <div
                  className={`decision-card ${currentDecision === 'query' ? 'selected-query' : ''}`}
                  onClick={() => handleSelectDecision('query')}
                >
                  <div className="decision-dot" />
                  <div>
                    <div className="decision-label" style={{ color: '#92400e' }}>
                      ? Raise Query
                    </div>
                    <div className="decision-sub">Request additional information or document from citizen</div>
                  </div>
                </div>

                {/* Decision Card Option 3: Reject */}
                <div
                  className={`decision-card ${currentDecision === 'reject' ? 'selected-reject' : ''}`}
                  onClick={() => handleSelectDecision('reject')}
                >
                  <div className="decision-dot" />
                  <div>
                    <div className="decision-label" style={{ color: '#991b1b' }}>
                      ✕ Reject Application
                    </div>
                    <div className="decision-sub">Reject application with mandatory governance reason</div>
                  </div>
                </div>
              </div>

              {/* [Forms] Dynamic Form 1: Rejection Reason Dropdown (Shown on Reject) */}
              {currentDecision === 'reject' && (
                <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Rejection Reason <span className="required" style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ marginBottom: 'var(--space-sm)' }}
                  >
                    <option value="">— Select a rejection reason —</option>
                    {/* [Lists] Map rejection reasons */}
                    {REJECTION_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* [Forms] Dynamic Form 2: Query Textarea (Shown on Query) */}
              {currentDecision === 'query' && (
                <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Query to Citizen <span className="required" style={{ color: 'var(--amber-600)' }}>*</span>
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Describe what clarification or document is required..."
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Citizen will receive this via SMS & portal notification. Response deadline: 3 days.
                  </div>
                </div>
              )}

              {/* [Forms] Officer Remarks Textarea (Always Visible) */}
              <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Officer Verification Remarks
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Internal observations, field verification notes (saved in audit trail)..."
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                />
              </div>

              {/* [Events] Submit Button */}
              <button
                type="button"
                className={`submit-cta cta-${currentDecision}`}
                onClick={handlePromptSubmit}
                disabled={submitting}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>
                  {submitting
                    ? 'Processing...'
                    : currentDecision === 'approve'
                      ? 'Approve & Issue Certificate'
                      : currentDecision === 'query'
                        ? 'Send Query to Citizen'
                        : 'Reject Application'}
                </span>
              </button>

              <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  All actions are cryptographically logged in the audit trail.
                </div>
              </div>
            </div>
          </div>

          {/* Queue Fast-Switcher List */}
          <div className="queue-nav" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="queue-nav-header">
              <span className="queue-nav-title">Assigned Queue</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {queue.length} application{queue.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              {/* [Lists] Map queue fast-switcher items */}
              {queue.map((qItem, qIdx) => {
                const isCurrent = qIdx === currentIdx;
                const pipColor =
                  qItem.slaLeft < 0
                    ? 'var(--red-500)'
                    : qItem.slaLeft <= 2
                      ? 'var(--amber-400)'
                      : '#10b981';

                return (
                  <div
                    key={qItem.id}
                    className={`queue-nav-item ${isCurrent ? 'current' : ''}`}
                    onClick={() => handleNavigateApp(qIdx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}
                  >
                    <div className="priority-pip" style={{ background: pipColor }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="queue-nav-id" style={{ fontWeight: 700 }}>
                        {qItem.id}
                      </div>
                      <div className="queue-nav-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {qItem.service || qItem.serviceName} · {(qItem.citizen || '').split(' ')[0]}
                      </div>
                    </div>
                    <span
                      className={`badge ${qItem.slaLeft < 0
                          ? 'badge-danger'
                          : qItem.slaLeft <= 2
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {qItem.slaLeft < 0 ? 'Breach' : qItem.slaLeft <= 2 ? 'Urgent' : 'Active'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── [Component + Prop Drilling + Callbacks] Decision Confirmation Modal ── */}
      <DecisionModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalConfirm}
        decision={currentDecision}
        app={currentApp}
        submitting={submitting}
        rejectReason={rejectReason}
        onReasonChange={(e) => setRejectReason(e.target.value)}
        queryText={queryText}
        onQueryChange={(e) => setQueryText(e.target.value)}
        officerRemarks={officerRemarks}
        onRemarksChange={(e) => setOfficerRemarks(e.target.value)}
      />
    </div>
  );
}
