// src/pages/grievance/GrievanceDetailPage.jsx
// Grievance Detail & Resolution Page matching front-end/grievance/grievance-detail.html exactly.
// Full 4-Step Appellate Workflow: Review → Categorize → Investigate → Resolution Decision.
// React concepts used: Components, Props, State (useState), Hooks (useEffect, useMemo),
// Forms (controlled inputs, checklists), Modals, Router (useParams, useNavigate, Link), API calls

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetGrievances,
  apiGetGrievanceById,
  apiGetLinkedApplication,
  apiResolveGrievance,
  apiUpdateGrievanceStatus,
} from '../../api/grievanceApi';
import GrievanceTimeline from '../../components/grievance/GrievanceTimeline';

const JURISDICTION_NAMES = {
  node_ap: 'Andhra Pradesh (State Headquarters)',
  node_cg_vil: 'Chandragiri Village, Tirupati, Andhra Pradesh',
  node_tpt: 'Tirupati Urban Mandal, Andhra Pradesh',
  node_w14: 'Ward 14, Visakhapatnam Urban, Andhra Pradesh',
  node_nellore: 'Nellore District, Andhra Pradesh',
  node_kurnool: 'Kurnool District, Andhra Pradesh',
  node_ka: 'Karnataka (State Headquarters)',
  node_bbmp: 'BBMP Central, Bengaluru, Karnataka',
  node_mysuru: 'Mysuru Urban, Karnataka',
  node_hunsur: 'Hunsur Taluk, Mysuru, Karnataka',
  node_kl: 'Kerala (State Headquarters)',
  node_tvm: 'Thiruvananthapuram Corporation, Kerala',
  node_nedumangad: 'Nedumangad Taluk, Kerala',
  node_tn: 'Tamil Nadu (State Headquarters)',
  node_gcc: 'Greater Chennai Corporation, Tamil Nadu',
  node_madurai: 'Madurai Corporation, Tamil Nadu',
};

function formatJurisdiction(nodeId) {
  if (!nodeId || nodeId === '-') return 'State Redressal Cell';
  return JURISDICTION_NAMES[nodeId] || nodeId.replace('node_', '').toUpperCase();
}

const DEPT_NAMES = {
  dept_rev_ap: 'Revenue, Registration & Stamps Department (AP)',
  dept_wel_ap: 'Social Welfare & Empowerment Department (AP)',
  dept_rev_ka: 'Revenue Department - Kandaya Ilakhe (KA)',
  dept_wel_ka: 'Social Welfare & Backward Classes (KA)',
  dept_rev_kl: 'Revenue Department - Keralam E-District (KL)',
  dept_wel_kl: 'SC/ST Development & Social Justice (KL)',
  dept_rev_tn: 'Revenue & Disaster Management (TN)',
  dept_wel_tn: 'Adi Dravidar & Tribal Welfare (TN)',
};

function formatDept(deptId) {
  return DEPT_NAMES[deptId] || deptId || 'Department Grievance Cell';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

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

function getCatLabel(c = '') {
  const normalized = c.toLowerCase().replace(/_/g, '-');
  const map = {
    delay: 'Service Delay',
    rejection: 'App. Rejection',
    'rejection-appeal': 'Rejection Appeal',
    clarification: 'Clarification Inquiry',
    payment: 'Payment Issue',
    misconduct: 'Officer Misconduct',
    technical: 'Technical Issue',
    'wrong-info': 'Wrong Information',
    other: 'Other Issue',
  };
  return map[normalized] || map[c] || (c ? c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' ') : 'General');
}

function getCatClass(c = '') {
  const normalized = c.toLowerCase().replace(/_/g, '-');
  const map = {
    delay: 'cat-delay',
    rejection: 'cat-rejection',
    'rejection-appeal': 'cat-rejection',
    clarification: 'cat-clarification',
    payment: 'cat-payment',
    misconduct: 'cat-misconduct',
    technical: 'cat-technical',
    'wrong-info': 'cat-wrong-info',
  };
  return map[normalized] || map[c] || 'cat-delay';
}

function getStatusBadgeMeta(status = '') {
  const s = status.toLowerCase().replace(/_/g, '-');
  const map = {
    new: { label: 'New', cls: 'badge-info', srs: 'NEW_GRIEVANCE' },
    open: { label: 'New', cls: 'badge-info', srs: 'NEW_GRIEVANCE' },
    submitted: { label: 'New', cls: 'badge-info', srs: 'NEW_GRIEVANCE' },
    investigating: { label: 'Investigating', cls: 'badge-warning', srs: 'UNDER_INVESTIGATION' },
    'under-review': { label: 'Investigating', cls: 'badge-warning', srs: 'UNDER_INVESTIGATION' },
    escalated: { label: 'Escalated', cls: 'badge-purple', srs: 'GRIEVANCE_ESCALATED' },
    resolved: { label: 'Resolved', cls: 'badge-success', srs: 'GRIEVANCE_RESOLVED' },
    rejected: { label: 'Rejected', cls: 'badge-neutral', srs: 'GRIEVANCE_REJECTED' },
  };
  return map[s] || { label: status || 'Open', cls: 'badge-warning', srs: 'ACTIVE' };
}

export default function GrievanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Core Data States ──
  const [grievance, setGrievance] = useState(null);
  const [linkedApp, setLinkedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // ── 4-Step Workflow State ──
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'categorize' | 'investigate' | 'resolve'
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Step 1: Review Checklist
  const [reviewChecks, setReviewChecks] = useState({
    chk1: false,
    chk2: false,
    chk3: false,
    chk4: false,
  });

  // Step 2: Categorize
  const [selectedCat, setSelectedCat] = useState('delay');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [catRemarks, setCatRemarks] = useState('');

  // Step 3: Investigation Checklist (6 items)
  const [invChecks, setInvChecks] = useState([false, false, false, false, false, false]);
  const [evidenceAttachments, setEvidenceAttachments] = useState([]);

  // Step 4: Resolution Decision
  const [selectedResType, setSelectedResType] = useState('resolve'); // 'resolve' | 'reject' | 'escalate'
  const [resolveNote, setResolveNote] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('Application processed and certificate issued');
  const [rejectReason, setRejectReason] = useState('');
  const [rootCause, setRootCause] = useState('Complaint unsubstantiated — insufficient evidence');
  const [escalateReason, setEscalateReason] = useState('');
  const [escalationType, setEscalationType] = useState('SLA breach — serious officer negligence');

  // Modals
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [appHistoryModalOpen, setAppHistoryModalOpen] = useState(false);
  const [confirmResModalOpen, setConfirmResModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Fetch Grievance & Linked App ──
  const loadGrievance = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetId = id;
      if (!targetId) {
        const queueRes = await apiGetGrievances(1, 50);
        const list = Array.isArray(queueRes?.data) ? queueRes.data : Array.isArray(queueRes) ? queueRes : [];
        const active = list.find((g) => !['resolved', 'rejected', 'escalated-resolved', 'escalated'].includes((g.status || '').toLowerCase()));
        const chosen = active || list[0];
        if (chosen?.id) {
          navigate(`/grievance/detail/${chosen.id}`, { replace: true });
          return;
        } else {
          throw new Error('No grievances currently found in the queue.');
        }
      }

      const res = await apiGetGrievanceById(targetId);
      const grvData = res?.data || res;
      if (!grvData || !grvData.id) {
        throw new Error(`Grievance record '${targetId}' not found.`);
      }
      setGrievance(grvData);

      // Pre-populate category & priority
      if (grvData.category) setSelectedCat(grvData.category);
      if (grvData.priority) setSelectedPriority(grvData.priority.toLowerCase());

      // Pre-fill completed steps based on existing status
      const statusLower = (grvData.status || '').toLowerCase().replace(/_/g, '-');
      const cSteps = new Set();
      if (['investigating', 'under-review', 'in-progress'].includes(statusLower)) {
        cSteps.add(1);
        cSteps.add(2);
        setActiveTab('investigate');
        setReviewChecks({ chk1: true, chk2: true, chk3: true, chk4: true });
      } else if (['resolved', 'rejected', 'escalated'].includes(statusLower)) {
        cSteps.add(1);
        cSteps.add(2);
        cSteps.add(3);
        setActiveTab('resolve');
      }
      setCompletedSteps(cSteps);

      // Fetch linked application
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

  useEffect(() => {
    loadGrievance();
  }, [id]);

  // ── Remind Officer Action ──
  const handleRemindOfficer = async () => {
    if (!grievance) return;
    try {
      const count = (grievance.reminders || 0) + 1;
      const suffix = count === 1 ? '1st' : count === 2 ? '2nd' : `${count}th`;
      await apiUpdateGrievanceStatus(grievance.id, {
        remarks: `Officer Reminded (${suffix}) — Priority expedited notice sent to assigned field officer.`,
      });
      showToast(`Officer Reminded (${suffix}) successfully!`, 'success');
      loadGrievance();
    } catch (err) {
      showToast(err.message || 'Failed to send reminder to officer', 'error');
    }
  };

  // ── Step 1: Confirm Review ──
  const isReviewComplete = Object.values(reviewChecks).every(Boolean);
  const handleConfirmReview = async () => {
    setCompletedSteps((prev) => new Set([...prev, 1]));
    try {
      await apiUpdateGrievanceStatus(grievance.id, {
        remarks: 'Review Phase Completed — Citizen grounds and documents verified.',
      });
    } catch {}
    setActiveTab('categorize');
    showToast('Review completed. Proceeding to Categorize.', 'info');
  };

  // ── Step 2: Confirm Categorize ──
  const handleConfirmCategorize = async () => {
    if (!selectedCat) {
      showToast('Please select a category', 'warning');
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, 2]));
    try {
      await apiUpdateGrievanceStatus(grievance.id, {
        status: 'investigating',
        category: selectedCat,
        priority: selectedPriority,
        remarks: `Categorized as ${getCatLabel(selectedCat)} with ${selectedPriority} priority. ${catRemarks || ''}`,
      });
    } catch {}
    setActiveTab('investigate');
    showToast('Categorization saved. Status → UNDER_INVESTIGATION.', 'success');
    loadGrievance();
  };

  // ── Step 3: Confirm Investigation ──
  const invDoneCount = invChecks.filter(Boolean).length;
  const handleConfirmInvestigation = async () => {
    if (invDoneCount < 3) {
      showToast('Complete at least 3 checklist items before proceeding to resolution.', 'warning');
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, 3]));
    try {
      await apiUpdateGrievanceStatus(grievance.id, {
        remarks: 'Investigation Phase Completed — Findings compiled and verified.',
      });
    } catch {}
    setActiveTab('resolve');
    showToast('Investigation complete. Choose an appellate resolution outcome.', 'success');
  };

  // ── Step 4: Final Submit Resolution ──
  const handleExecuteResolution = async () => {
    setConfirmResModalOpen(false);
    setSubmitting(true);

    try {
      let finalRemarks = '';
      let apiAction = 'UPHOLD_REJECTION';

      if (selectedResType === 'resolve') {
        finalRemarks = `${resolveNote || 'Grievance resolved following appellate review.'} Corrective Action: ${correctiveAction}`;
        apiAction =
          selectedCat === 'rejection' || selectedCat === 'rejection_appeal'
            ? 'OVERRULE_AND_ISSUE_CERTIFICATE'
            : 'DIRECT_RE_VERIFICATION';
      } else if (selectedResType === 'reject') {
        finalRemarks = `${rejectReason || 'Grievance rejected — complaint could not be substantiated.'} Root Cause: ${rootCause}`;
        apiAction = 'UPHOLD_REJECTION';
      } else if (selectedResType === 'escalate') {
        finalRemarks = `Escalated to Department Supervisor. Escalation Type: ${escalationType}. Reason: ${escalateReason || 'Requires higher statutory intervention.'}`;
        apiAction = 'UPHOLD_REJECTION';
      }

      await apiResolveGrievance(grievance.id, {
        action: apiAction,
        remarks: finalRemarks,
      });

      showToast(`Grievance decision recorded (${selectedResType.toUpperCase()})!`, 'success');
      await loadGrievance();
    } catch (err) {
      showToast(err.message || 'Failed to submit resolution decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (error && !grievance) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={loadGrievance}>
            Retry
          </button>
        </div>
        <Link to="/grievance/dashboard#queue" className="btn btn-secondary" style={{ width: 'fit-content' }}>
          ← Back to Grievance Queue
        </Link>
      </div>
    );
  }

  if (!grievance) return null;

  const statusMeta = getStatusBadgeMeta(grievance.status);
  const priority = (grievance.priority || selectedPriority || 'medium').toLowerCase();
  const slaStatus = (grievance.slaStatus || 'safe').toLowerCase();
  const isTerminal = ['resolved', 'rejected', 'escalated', 'escalated-resolved'].includes((grievance.status || '').toLowerCase());

  // Checklists and evidence lists
  const rawDocs = [
    ...(grievance.documents || []),
    ...(grievance.evidence || []),
    ...evidenceAttachments,
  ];

  return (
    <div className="grievance-detail-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background:
              toastMessage.type === 'success'
                ? '#166534'
                : toastMessage.type === 'error'
                ? '#991b1b'
                : toastMessage.type === 'warning'
                ? '#92400e'
                : 'var(--navy-800)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* ── Top Navigation Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/grievance/dashboard#queue')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            <span>Back to Queue</span>
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--color-border)' }}></div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Grievance Ticket <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--navy-900)' }}>{grievance.id}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6,9 6,2 18,2 18,9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print</span>
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => showToast(`Notice dispatched to citizen ${grievance.citizenName}`, 'success')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Notify</span>
          </button>
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={handleRemindOfficer}
            style={{ color: '#92400e', borderColor: 'var(--amber-400)', background: 'var(--amber-100)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Remind Officer</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAuditModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span>Internal Audit Log</span>
          </button>
          {grievance.relatedAppId && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setAppHistoryModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>App History</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Exact Hero Banner matching front-end/grievance/grievance-detail.html ── */}
      <div className="detail-hero">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-xl)', alignItems: 'flex-start' }}>
          <div>
            <div className="detail-id">{grievance.id}</div>
            <div className="detail-title">{grievance.subject || 'Citizen Grievance Appeal'}</div>
            <div className="detail-desc">{grievance.description || 'No detailed statement provided.'}</div>

            <div className="detail-meta-row">
              <div className="detail-meta-item">
                <span className="detail-meta-label">Citizen</span>
                <span className="detail-meta-value">{grievance.citizenName || 'Citizen'}</span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Category</span>
                <span className={`category-tag ${getCatClass(grievance.category || selectedCat)}`}>
                  {getCatLabel(grievance.category || selectedCat)}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Status</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className={`badge ${statusMeta.cls}`}>{statusMeta.label}</span>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {statusMeta.srs}
                  </span>
                </div>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">SLA</span>
                <span className={`sla-text ${slaStatus}`}>
                  {slaStatus === 'breach' ? '⚠ Breached' : slaStatus === 'warn' ? '⏱ At Risk' : '✓ On Track'}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Priority</span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    color: priority === 'high' ? 'var(--red-500)' : priority === 'low' ? 'var(--green-600)' : 'var(--amber-600)',
                  }}
                >
                  ● {priority}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Submitted</span>
                <span className="detail-meta-value">{formatDate(grievance.filedDate || grievance.createdAt)}</span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Department</span>
                <span className="detail-meta-value" style={{ fontSize: '0.8125rem' }}>
                  {formatDept(grievance.departmentId || user?.dept)}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Jurisdiction</span>
                <span className="detail-meta-value" style={{ fontSize: '0.8125rem' }}>
                  {formatJurisdiction(grievance.jurisdiction || user?.assignedNodeId)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4-Step Interactive Workflow Tab Bar ── */}
      <div>
        <div className="detail-tab-list">
          {[
            { id: 'review', num: 1, label: 'Review' },
            { id: 'categorize', num: 2, label: 'Categorize' },
            { id: 'investigate', num: 3, label: 'Investigate' },
            { id: 'resolve', num: 4, label: 'Resolution' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const isDone = completedSteps.has(tab.num);
            return (
              <button
                key={tab.id}
                type="button"
                className={`detail-tab-btn ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="step-num">{tab.num}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ══ STEP 1: REVIEW COMPLAINT ══ */}
        {activeTab === 'review' && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Step 1 — Review Complaint
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                NEW_GRIEVANCE
              </span>
            </div>

            <div className="card-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
                Read the citizen's complaint and verify all linked records before proceeding to categorization.
              </p>

              {/* Citizen Quote Box */}
              <div
                style={{
                  background: 'var(--amber-50)',
                  border: '1px solid var(--amber-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)',
                  marginBottom: 'var(--space-xl)',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--amber-700)', marginBottom: 'var(--space-sm)' }}>
                  Citizen's Complaint Statement
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--navy-900)', lineHeight: 1.7, fontWeight: 500 }}>
                  "{grievance.description || 'No statement provided.'}"
                </div>
              </div>

              {/* 2-Column Citizen & App Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                {/* Citizen Information Card */}
                <div className="info-block">
                  <div className="info-block-header">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Citizen Information
                  </div>
                  <div className="info-block-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--slate-100)' }}>
                      <div className="assign-avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                        {(grievance.citizenName || 'User').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{grievance.citizenName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          Citizen ID: {grievance.citizenId || 'CIT-4421'}
                        </div>
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="info-key">District / Mandals</span>
                      <span className="info-val">{formatJurisdiction(grievance.jurisdiction)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">Assigned Officer</span>
                      <span className="info-val">{grievance.officerName || user?.name || 'Assigned Officer'}</span>
                    </div>
                    <div className="info-row" style={{ border: 'none' }}>
                      <span className="info-key">Submitted Date</span>
                      <span className="info-val">{formatDetailDate(grievance.filedDate || grievance.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Linked Application Card */}
                {linkedApp ? (
                  <div className="info-block">
                    <div className="info-block-header">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                      Linked Application Reference
                    </div>
                    <div className="info-block-body">
                      <div className="info-row">
                        <span className="info-key">App ID</span>
                        <span className="info-val" style={{ fontFamily: 'var(--font-mono)', color: 'var(--navy-600)' }}>
                          {linkedApp.id}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-key">Service Name</span>
                        <span className="info-val">{linkedApp.serviceName || 'State Government Service'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-key">Current Status</span>
                        <span className="info-val">
                          <span className={`badge ${linkedApp.status === 'REJECTED' ? 'badge-danger' : linkedApp.status?.includes('REVERIF') ? 'badge-info' : 'badge-warning'}`}>
                            {linkedApp.status || 'PENDING'}
                          </span>
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-key">Assigned Officer</span>
                        <span className="info-val">{linkedApp.officerName || linkedApp.assignedOfficerName || 'Field Officer'}</span>
                      </div>
                      <div className="info-row" style={{ border: 'none' }}>
                        <span className="info-key">Submitted Date</span>
                        <span className="info-val">{formatDate(linkedApp.submittedDate || linkedApp.appliedDate || linkedApp.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="info-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                    <span>No separate application linked directly to ticket #{grievance.id}.</span>
                  </div>
                )}
              </div>

              {/* Supporting Documents Section */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: 'var(--space-md)' }}>
                  Supporting Documents Submitted by Citizen
                </div>
                {rawDocs.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
                    {rawDocs.map((doc, idx) => {
                      const docName = typeof doc === 'string' ? doc.split(/[/\\]/).pop() : doc.name || `Document_${idx + 1}.pdf`;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            border: '1px solid var(--slate-200)',
                            borderRadius: '8px',
                            background: '#fff',
                          }}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--navy-100)', color: 'var(--navy-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                            </svg>
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {docName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Verified File</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    No supporting documents uploaded for this complaint.
                  </div>
                )}
              </div>

              {/* Confirmation Checklist */}
              <div style={{ background: 'var(--slate-50)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: 'var(--space-md)' }}>
                  Before proceeding, confirm you have:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reviewChecks.chk1}
                      onChange={(e) => setReviewChecks((prev) => ({ ...prev, chk1: e.target.checked }))}
                      style={{ accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
                    />
                    Read the citizen's complaint statement in full
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reviewChecks.chk2}
                      onChange={(e) => setReviewChecks((prev) => ({ ...prev, chk2: e.target.checked }))}
                      style={{ accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
                    />
                    Verified that the Application ID ({grievance.relatedAppId || 'General'}) exists and matches
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reviewChecks.chk3}
                      onChange={(e) => setReviewChecks((prev) => ({ ...prev, chk3: e.target.checked }))}
                      style={{ accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
                    />
                    Reviewed all citizen-submitted evidence attachments
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reviewChecks.chk4}
                      onChange={(e) => setReviewChecks((prev) => ({ ...prev, chk4: e.target.checked }))}
                      style={{ accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
                    />
                    Checked citizen profile and jurisdictional records
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!isReviewComplete}
                  onClick={handleConfirmReview}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Proceed to Categorize</span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2: CATEGORIZE GRIEVANCE ══ */}
        {activeTab === 'categorize' && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Step 2 — Categorize Grievance
              </span>
              <span className="badge badge-warning" style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                UNDER_INVESTIGATION
              </span>
            </div>

            <div className="card-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
                Select the grievance type and priority. Categorization determines statutory routing and SLA benchmarks.
              </p>

              {/* 4 Interactive Category Cards matching HTML */}
              <div className="cat-choice-grid">
                {[
                  {
                    key: 'delay',
                    title: 'Service Delay',
                    code: 'Case Type 1 — SERVICE_DELAY',
                    desc: 'Application or service not processed within SLA. Officer inaction or departmental backlog.',
                    iconClass: 'delay',
                    icon: (
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    ),
                  },
                  {
                    key: 'rejection',
                    title: 'Application Rejection',
                    code: 'Case Type 2 — APP_REJECTION',
                    desc: 'Application rejected without valid reason, improper documentation, or contested decision.',
                    iconClass: 'rejection',
                    icon: (
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    ),
                  },
                  {
                    key: 'payment',
                    title: 'Payment Issue',
                    code: 'Case Type 3 — PAYMENT_ISSUE',
                    desc: 'Duplicate payment, failed refund, fee deduction discrepancy, or subsidy delay.',
                    iconClass: 'payment',
                    icon: (
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    ),
                  },
                  {
                    key: 'misconduct',
                    title: 'Officer Misconduct',
                    code: 'Case Type 4 — OFFICER_MISCONDUCT',
                    desc: 'Bribery allegation, unprofessional conduct, harassment, or deliberate suppression.',
                    iconClass: 'misconduct',
                    icon: (
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    ),
                  },
                ].map((cat) => {
                  const isSelected = selectedCat === cat.key;
                  return (
                    <div
                      key={cat.key}
                      className={`cat-choice-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedCat(cat.key)}
                    >
                      <div className={`cat-icon ${cat.iconClass}`}>{cat.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div className="cat-choice-title">{cat.title}</div>
                        <div className="cat-choice-desc">{cat.desc}</div>
                        <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {cat.code}
                        </div>
                      </div>
                      <div className="cat-selected-check">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Priority Selector */}
              <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
                <div className="form-label">
                  Priority Level <span style={{ color: 'var(--red-500)' }}>*</span>
                </div>
                <div className="priority-selector">
                  {[
                    { key: 'high', label: '🔴 High Priority' },
                    { key: 'medium', label: '🟡 Medium Priority' },
                    { key: 'low', label: '🟢 Low Priority' },
                  ].map((p) => (
                    <div
                      key={p.key}
                      className={`priority-opt ${p.key} ${selectedPriority === p.key ? 'selected' : ''}`}
                      onClick={() => setSelectedPriority(p.key)}
                    >
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorization Remarks */}
              <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
                <label className="form-label" htmlFor="catRemarks">
                  Categorization Remarks
                </label>
                <textarea
                  id="catRemarks"
                  className="form-textarea"
                  rows="3"
                  placeholder="Record preliminary notes about why you selected this categorization..."
                  value={catRemarks}
                  onChange={(e) => setCatRemarks(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveTab('review')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmCategorize}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Confirm &amp; Begin Investigation</span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3: INVESTIGATION CHECKLIST ══ */}
        {activeTab === 'investigate' && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Step 3 — Investigation Checklist
              </span>
              <span className={`badge ${invDoneCount >= 3 ? 'badge-success' : 'badge-warning'}`}>
                {invDoneCount} / 6 Done
              </span>
            </div>

            <div className="card-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                Complete at least half of the statutory checklist before issuing an appellate resolution. Click each item to mark it done.
              </p>

              {/* 6 Interactive Investigation Items matching HTML */}
              <div className="inv-checklist">
                {[
                  {
                    title: 'Verify Application Reference',
                    sub: 'Confirm the linked application ID exists and matches this grievance ticket',
                  },
                  {
                    title: 'Review Application & Officer History',
                    sub: 'Check all prior actions taken by field officers — identify delays or irregularities',
                  },
                  {
                    title: 'Check SLA Compliance',
                    sub: 'Verify statutory timeline dates and calculate breach duration with evidence',
                  },
                  {
                    title: 'Review Internal Audit Logs',
                    sub: 'Examine audit trail for officer timestamps, field notes, and administrative guidelines',
                  },
                  {
                    title: 'Gather Citizen Evidence',
                    sub: 'Collect additional supporting documents, transaction proofs, or survey reports',
                  },
                  {
                    title: 'Prepare Appellate Investigation Findings',
                    sub: 'Document comprehensive rationale and conclusions before executing final resolution',
                  },
                ].map((item, idx) => {
                  const isDone = invChecks[idx];
                  return (
                    <div
                      key={idx}
                      className={`inv-check-item ${isDone ? 'done' : ''}`}
                      onClick={() =>
                        setInvChecks((prev) => {
                          const copy = [...prev];
                          copy[idx] = !copy[idx];
                          return copy;
                        })
                      }
                    >
                      <div className="inv-check-box">
                        {isDone && (
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="inv-check-title">{item.title}</div>
                        <div className="inv-check-sub">{item.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Evidence Upload Section */}
              <div style={{ background: 'var(--slate-50)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>
                  Supporting Evidence &amp; Officer Notes
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Attach Evidence Document</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEvidenceAttachments((prev) => [...prev, file.name]);
                          showToast(`Attached ${file.name} to investigation`, 'success');
                        }
                      }}
                    />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {evidenceAttachments.length} additional evidence document(s) added
                  </span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveTab('categorize')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmInvestigation}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Investigation Complete</span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 4: RESOLUTION DECISION ══ */}
        {activeTab === 'resolve' && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                Step 4 — Resolution Decision
              </span>
              {isTerminal && <span className="badge badge-success">Decision Recorded</span>}
            </div>

            <div className="card-body">
              {isTerminal ? (
                /* Recorded Resolution Display */
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
                      Official Resolution Decision: {grievance.resolutionAction || grievance.status?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#14532d', lineHeight: 1.6, fontWeight: 500 }}>
                      "{grievance.resolutionNote || grievance.remarks || 'Grievance closed following formal redressal.'}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                    <div><strong>Resolved By:</strong> {grievance.resolvedBy || user?.name || 'Grievance Cell'}</div>
                    <div><strong>Closed Date:</strong> {formatDetailDate(grievance.closedDate || grievance.lastUpdated)}</div>
                    <div><strong>Status:</strong> Closed &amp; Archived</div>
                  </div>
                </div>
              ) : (
                /* Interactive Resolution Options */
                <>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
                    Based on your investigation findings, select the appropriate statutory appellate outcome.
                  </p>

                  {/* 3 Outcome Buttons matching HTML */}
                  <div className="outcome-grid">
                    {/* 1. Resolve */}
                    <div
                      className={`outcome-btn ${selectedResType === 'resolve' ? 'selected' : ''}`}
                      onClick={() => setSelectedResType('resolve')}
                    >
                      <svg width="32" height="32" fill="none" stroke="var(--green-500)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="outcome-title">Resolve Grievance</div>
                      <div className="outcome-srs">GRIEVANCE_RESOLVED</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Complaint is valid. Direct re-verification or overrule rejection to issue certificate.
                      </div>
                    </div>

                    {/* 2. Reject */}
                    <div
                      className={`outcome-btn outcome-reject ${selectedResType === 'reject' ? 'selected' : ''}`}
                      onClick={() => setSelectedResType('reject')}
                    >
                      <svg width="32" height="32" fill="none" stroke="var(--slate-500)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      <div className="outcome-title">Reject Grievance</div>
                      <div className="outcome-srs">GRIEVANCE_REJECTED</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Complaint is unsubstantiated. Original decision stands upheld.
                      </div>
                    </div>

                    {/* 3. Escalate */}
                    <div
                      className={`outcome-btn outcome-escalate ${selectedResType === 'escalate' ? 'selected' : ''}`}
                      onClick={() => setSelectedResType('escalate')}
                    >
                      <svg width="32" height="32" fill="none" stroke="var(--red-500)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
                        <polyline points="17,6 23,6 23,12" />
                      </svg>
                      <div className="outcome-title">Escalate to Supervisor</div>
                      <div className="outcome-srs">GRIEVANCE_ESCALATED</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Serious breach or policy dispute. Transferred to Department Head.
                      </div>
                    </div>
                  </div>

                  {/* Resolve Fields */}
                  {selectedResType === 'resolve' && (
                    <div>
                      <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="form-label" htmlFor="resolveNote">
                          Resolution Findings &amp; Summary <span style={{ color: 'var(--red-500)' }}>*</span>
                        </label>
                        <textarea
                          id="resolveNote"
                          className="form-textarea"
                          rows="4"
                          placeholder="Describe the action taken and how the citizen's complaint was substantiated..."
                          value={resolveNote}
                          onChange={(e) => setResolveNote(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Corrective Action Taken</label>
                        <select
                          className="form-select"
                          value={correctiveAction}
                          onChange={(e) => setCorrectiveAction(e.target.value)}
                        >
                          <option>Application processed and certificate issued</option>
                          <option>Re-verification ordered and reassigned to field inspector</option>
                          <option>Refund processed to citizen's account</option>
                          <option>Officer counselled and warned regarding SLA</option>
                          <option>System / data discrepancy corrected</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Reject Fields */}
                  {selectedResType === 'reject' && (
                    <div>
                      <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="form-label" htmlFor="rejectReason">
                          Rejection Reason <span style={{ color: 'var(--red-500)' }}>*</span>
                        </label>
                        <textarea
                          id="rejectReason"
                          className="form-textarea"
                          rows="4"
                          placeholder="Explain why this grievance is being rejected. Citizen will receive this official reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Root Cause Finding</label>
                        <select
                          className="form-select"
                          value={rootCause}
                          onChange={(e) => setRootCause(e.target.value)}
                        >
                          <option>Complaint unsubstantiated — insufficient evidence</option>
                          <option>Duplicate grievance — already resolved</option>
                          <option>Outside statutory scope — not an administrative error</option>
                          <option>Citizen provided incomplete / false documentation</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Escalate Fields */}
                  {selectedResType === 'escalate' && (
                    <div>
                      <div className="alert alert-danger" style={{ marginBottom: 'var(--space-md)' }}>
                        Escalation will be transferred to <strong>Department Supervisor / Head</strong>. Authority over this complaint will be delegated upward.
                      </div>
                      <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="form-label" htmlFor="escalateReason">
                          Reason for Escalation <span style={{ color: 'var(--red-500)' }}>*</span>
                        </label>
                        <textarea
                          id="escalateReason"
                          className="form-textarea"
                          rows="4"
                          placeholder="Explain what was uncovered during investigation requiring supervisor escalation..."
                          value={escalateReason}
                          onChange={(e) => setEscalateReason(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Escalation Type</label>
                        <select
                          className="form-select"
                          value={escalationType}
                          onChange={(e) => setEscalationType(e.target.value)}
                        >
                          <option>SLA breach — serious officer negligence</option>
                          <option>Misconduct allegation with supporting evidence</option>
                          <option>Systemic issue requiring policy intervention</option>
                          <option>Dispute beyond Grievance Officer statutory limit</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setActiveTab('investigate')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="15,18 9,12 15,6" />
                      </svg>
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${selectedResType === 'escalate' ? 'btn-danger' : selectedResType === 'reject' ? 'btn-outline' : 'btn-success'}`}
                      disabled={submitting}
                      onClick={() => setConfirmResModalOpen(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>Submit Resolution Decision</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Internal Audit Log Modal ── */}
      {auditModalOpen && (
        <div className="modal-overlay active" onClick={() => setAuditModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '640px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                Internal Audit Log — #{grievance.id}
              </span>
              <button type="button" className="btn-icon" onClick={() => setAuditModalOpen(false)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <GrievanceTimeline history={grievance.history || []} />
            </div>
          </div>
        </div>
      )}

      {/* ── Linked Application History Modal ── */}
      {appHistoryModalOpen && linkedApp && (
        <div className="modal-overlay active" onClick={() => setAppHistoryModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '640px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="modal-title">Application Lifecycle — #{linkedApp.id}</span>
              <button type="button" className="btn-icon" onClick={() => setAppHistoryModalOpen(false)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <GrievanceTimeline
                history={[
                  {
                    action: `Application Submitted (${linkedApp.serviceName})`,
                    date: linkedApp.submittedDate || linkedApp.appliedDate || linkedApp.createdAt,
                    actor: linkedApp.citizenName || 'Citizen',
                    note: 'Application documents and required certificates uploaded.',
                  },
                  {
                    action: 'Application Verification In-Progress',
                    date: linkedApp.lastUpdated || linkedApp.createdAt,
                    actor: linkedApp.officerName || 'Field Officer',
                    note: `Assigned to ${linkedApp.officerName || 'jurisdictional officer'}.`,
                  },
                  ...(linkedApp.timeline || []),
                  {
                    action: `Grievance Appeal Raised (${grievance.id})`,
                    date: grievance.filedDate || grievance.createdAt,
                    actor: grievance.citizenName,
                    note: grievance.description,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmResModalOpen && (
        <div className="modal-overlay active" onClick={() => setConfirmResModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '480px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Confirm Resolution Decision</span>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--navy-900)', lineHeight: 1.6 }}>
                Are you sure you want to commit this outcome:{' '}
                <strong style={{ color: selectedResType === 'escalate' ? 'var(--red-600)' : 'var(--navy-900)' }}>
                  {selectedResType.toUpperCase()}
                </strong>
                ?
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                This appellate decision will be permanently sealed in the audit trail and transmitted to the applicant.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setConfirmResModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${selectedResType === 'escalate' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleExecuteResolution}
              >
                Confirm &amp; Record Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
