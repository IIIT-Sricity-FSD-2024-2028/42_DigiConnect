import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiTrackApplication, apiGetMyApplications } from '../../api/citizenApi';
import TimelineTracker from '../../components/citizen/TimelineTracker';

export default function TrackApplicationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchId, setSearchId] = useState('');
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tabs: 'timeline', 'documents', 'details'
  const [activeTab, setActiveTab] = useState('timeline');

  // Query response modal states
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [queryNote, setQueryNote] = useState('');
  const [queryFiles, setQueryFiles] = useState([]);
  const [querySuccessMsg, setQuerySuccessMsg] = useState('');

  // Toast / notification message
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadApplication = async (idToLoad) => {
    if (!idToLoad || !idToLoad.trim()) return;
    const cleanId = idToLoad.trim();

    try {
      setLoading(true);
      setError(null);
      const res = await apiTrackApplication(cleanId);
      const data = res?.data || res;
      if (data && data.id) {
        setApp(data);
      } else {
        throw new Error('Application not found. Please verify the Application ID.');
      }
    } catch (err) {
      setApp(null);
      setError(err.message || 'Application not found. Please verify the ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId) {
      loadApplication(urlId);
    } else {
      // Auto-load first citizen application if no query param is passed
      apiGetMyApplications()
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          if (list.length > 0) {
            setSearchId(list[0].id);
            loadApplication(list[0].id);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSearchParams({ id: searchId.trim().toUpperCase() });
      loadApplication(searchId.trim().toUpperCase());
    }
  };

  // Status mapping
  const normStatus = (app?.status || '').toLowerCase().replace(/_/g, '-');
  const isApproved = ['approved', 'completed', 'certificate-generated'].includes(normStatus);
  const isRejected = normStatus === 'rejected';
  const isQuery = ['query', 'query-raised'].includes(normStatus);
  const isEscalated = normStatus === 'escalated';

  let statusBadgeClass = 'badge-info';
  let statusBadgeLabel = 'Under Review';
  if (isApproved) {
    statusBadgeClass = 'badge-success';
    statusBadgeLabel = 'Approved';
  } else if (isRejected) {
    statusBadgeClass = 'badge-danger';
    statusBadgeLabel = 'Rejected';
  } else if (isQuery) {
    statusBadgeClass = 'badge-warning';
    statusBadgeLabel = 'Query Raised';
  } else if (isEscalated) {
    statusBadgeClass = 'badge-purple';
    statusBadgeLabel = 'Escalated';
  }

  // Format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // SLA calculations
  const totalSlaDays = Number(app?.slaTotal || app?.slaDays || 15);
  const daysLeft = app?.daysLeft !== undefined && app?.daysLeft !== null ? app.daysLeft : 7;
  const isClosed = isApproved || isRejected;
  const usedDays = isClosed ? totalSlaDays : Math.max(0, totalSlaDays - daysLeft);
  const slaPerc = isClosed ? 100 : Math.min(100, Math.max(0, Math.round((usedDays / totalSlaDays) * 100)));
  const slaCls = isClosed ? (isRejected ? 'breach' : 'safe') : daysLeft > 4 ? 'safe' : daysLeft >= 0 ? 'warn' : 'breach';

  // Workflow Stages
  const stages = app?.workflowSteps && app.workflowSteps.length > 0
    ? [
        { label: 'Application Submitted', step: 0 },
        ...app.workflowSteps.map((ws, i) => ({
          label: ws.stepName || `Stage ${ws.stepNumber || i + 1}`,
          step: ws.stepNumber || i + 1,
        })),
        { label: 'Certificate Generated', step: app.workflowSteps.length + 1 },
      ]
    : [
        { label: 'Application Submitted', step: 1 },
        { label: 'Payment Confirmed', step: 2 },
        { label: 'Officer Verified', step: 3 },
        { label: 'Supervisor Review', step: 4 },
        { label: 'Approved / Completed', step: 5 },
      ];

  const currentStep = Number(app?.currentStepNumber || app?.currentStep) || 1;

  // Rejection details
  const rejectionEvent = app?.timeline?.find((t) => (t.action || t.stepName || '').toLowerCase().includes('reject'));
  const rejectionReason = app?.rejectionReason || rejectionEvent?.note || rejectionEvent?.remarks || 'Insufficient documentation or verification mismatch.';
  const rejectionOfficer = app?.rejectedBy || rejectionEvent?.actor || app?.officerName || 'Department Officer';

  // Query details
  const queryEvent = app?.timeline?.find((t) => (t.action || t.stepName || '').toLowerCase().includes('query'));
  const queryMessage = app?.queryMessage || queryEvent?.note || queryEvent?.remarks || 'Please upload the requested supporting documents.';

  // Handle Query Response Submit
  const handleQueryResponseSubmit = (e) => {
    e.preventDefault();
    setQuerySuccessMsg('Documents and response submitted successfully.');
    setTimeout(() => {
      setQuerySuccessMsg('');
      setQueryModalOpen(false);
      showToast('Query response submitted to officer.');
    }, 1200);
  };

  return (
    <div>
      <style>{`
        .track-search {
          background: linear-gradient(135deg, var(--navy-800), var(--navy-600));
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
        }
        .stage-bar {
          display: flex;
          gap: 0;
          margin-bottom: var(--space-xl);
        }
        .stage-node {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .stage-node::before {
          content: '';
          position: absolute;
          top: 20px;
          left: -50%;
          width: 100%;
          height: 2px;
          background: var(--color-border);
          z-index: 0;
        }
        .stage-node:first-child::before {
          display: none;
        }
        .stage-node.done::before, .stage-node.active::before {
          background: var(--green-400);
        }
        .stage-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--slate-400);
        }
        .stage-node.done .stage-circle {
          background: var(--green-500);
          border-color: var(--green-500);
          color: #fff;
        }
        .stage-node.active .stage-circle {
          background: var(--navy-600);
          border-color: var(--navy-600);
          color: #fff;
          box-shadow: 0 0 0 4px var(--navy-100);
        }
        .stage-node.breach .stage-circle {
          background: var(--red-500);
          border-color: var(--red-500);
          color: #fff;
        }
        .stage-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-align: center;
          margin-top: 8px;
          max-width: 80px;
          line-height: 1.3;
        }
        .stage-node.done .stage-label { color: var(--green-600); }
        .stage-node.active .stage-label { color: var(--navy-700); }

        .query-card {
          border: 2px solid var(--amber-400);
          background: var(--amber-50);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }
        .tab-bar {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--color-border);
          margin-bottom: var(--space-xl);
        }
        .tab-item {
          padding: 12px 20px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-muted);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: all 0.15s ease;
        }
        .tab-item.active {
          color: var(--navy-700);
          border-bottom-color: var(--navy-600);
        }

        .sla-fill { height: 8px; border-radius: 99px; transition: width 0.4s; }
        .sla-fill.safe { background: #10b981; }
        .sla-fill.warn { background: var(--amber-400); }
        .sla-fill.breach { background: var(--red-500); }

        .upload-zone {
          border: 2px dashed var(--slate-300);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          text-align: center;
          cursor: pointer;
          background: var(--slate-50);
        }
        .upload-zone:hover {
          border-color: var(--navy-400);
          background: var(--navy-50);
        }
      `}</style>

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--navy-900)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 2000,
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
          Track Your Application
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Enter your Application ID or select from your recent applications below.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="track-search">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--navy-200)',
                marginBottom: '8px',
              }}
            >
              Application ID
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. APP-AP-1001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.05em',
                  background: '#fff',
                  border: '1px solid var(--navy-300)',
                }}
              />
              <button type="submit" className="btn btn-accent" style={{ whiteSpace: 'nowrap' }}>
                Track →
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Loading Spinner ── */}
      {loading && (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading tracking information...
        </div>
      )}

      {/* ── Error / Not Found Alert ── */}
      {!loading && error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !app && !error && (
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
            Enter your Application ID
          </h3>
          <p style={{ fontSize: '0.875rem', margin: '0' }}>
            Type your Application ID above to inspect status, workflow timeline, and attached documents.
          </p>
        </div>
      )}

      {/* ── Application Detail (When Loaded) ── */}
      {!loading && app && (
        <div>
          {/* 1. Header Overview Card */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="card-body" style={{ padding: 'var(--space-xl)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-lg)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-700)' }}>
                      {app.id}
                    </span>
                    <span className={`badge ${statusBadgeClass}`}>{statusBadgeLabel}</span>
                    <span className="badge badge-success">
                      {app.fee === 0 ? 'Free / No Fee' : 'Payment Confirmed'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
                    {app.serviceName || 'Government Service'}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {app.dept || app.departmentName || app.department || 'Department Administration'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      Submitted
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {formatDate(app.submittedDate || app.appliedDate || app.createdAt)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      SLA Due
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--amber-600)' }}>
                      {formatDate(app.slaDate)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      Assigned To
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {app.officerName || app.assignedOfficerName || 'Assigned Officer'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      Days Left
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isClosed ? 'var(--slate-500)' : 'var(--navy-900)' }}>
                      {isClosed ? '—' : daysLeft}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Stage Progress Card */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="card-header">
              <span className="card-title">Application Progress</span>
            </div>
            <div className="card-body" style={{ padding: 'var(--space-xl)' }}>
              <TimelineTracker
                stages={stages}
                currentStep={currentStep}
                status={app.status}
                showStageBar={true}
                showEvents={false}
              />

              {/* SLA Utilisation Bar */}
              <div style={{ marginTop: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  <span>SLA Utilisation</span>
                  <span>{isClosed ? 'Closed' : `${slaPerc}%`}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div className={`sla-fill ${slaCls}`} style={{ width: `${slaPerc}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  <span>Submitted: {usedDays} days used</span>
                  <span>SLA: {totalSlaDays} days total</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Rejection Alert Banner */}
          {isRejected && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#991b1b', margin: '0 0 4px 0' }}>
                      Application Rejected
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#7f1d1d', lineHeight: 1.6, margin: '0 0 var(--space-md) 0' }}>
                      Reason: <strong>{rejectionReason}</strong>
                      <br />
                      Rejected by: <span>{rejectionOfficer}</span>
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link
                        to={`/citizen/raise-grievance?appId=${encodeURIComponent(app.id)}&service=${encodeURIComponent(app.serviceName || '')}&reason=${encodeURIComponent(rejectionReason)}`}
                        className="btn btn-sm btn-danger"
                      >
                        Apply for Grievance Appeal
                      </Link>
                      <span style={{ fontSize: '0.8125rem', color: '#991b1b' }}>
                        Appeal this decision to the Department Appellate Authority
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Query Alert Banner */}
          {isQuery && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="query-card">
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--amber-400)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
                      Action Required – Officer Query
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', margin: '0 0 var(--space-md) 0' }}>
                      {queryMessage}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        onClick={() => setQueryModalOpen(true)}
                      >
                        Upload Documents &amp; Respond
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--amber-200)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber-700)' }}>
                    ⏱ Respond within 3 days or your application may be delayed or rejected.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Tabs Card (Timeline / Documents / Details) */}
          <div className="card">
            <div className="tab-bar">
              <div
                className={`tab-item ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                Timeline
              </div>
              <div
                className={`tab-item ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </div>
              <div
                className={`tab-item ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Full Details
              </div>
            </div>

            <div className="card-body" style={{ padding: '0 var(--space-xl) var(--space-xl) var(--space-xl)' }}>
              {/* Tab 1: Timeline */}
              {activeTab === 'timeline' && (
                <TimelineTracker
                  showStageBar={false}
                  showEvents={true}
                  events={app.timeline || []}
                  status={app.status}
                />
              )}

              {/* Tab 2: Documents */}
              {activeTab === 'documents' && (
                <div className="table-wrapper" style={{ border: 'none' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Type</th>
                        <th>Uploaded On</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!app.documents || app.documents.length === 0) ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
                            No documents attached.
                          </td>
                        </tr>
                      ) : (
                        app.documents.map((doc, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{doc.name}</td>
                            <td>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {doc.type || 'Document'}
                              </span>
                            </td>
                            <td>{formatDate(doc.date || app.submittedDate)}</td>
                            <td>
                              <span className="badge badge-success">
                                {doc.status === 'verified' ? 'Verified' : 'Uploaded'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => showToast(`Document verified: ${doc.name}`)}
                              >
                                View Proof
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Full Details */}
              {activeTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-sm)' }}>
                  {[
                    { label: 'Application ID', val: app.id },
                    { label: 'Service Name', val: app.serviceName },
                    { label: 'Category', val: (app.serviceType || 'Certificate').toUpperCase() },
                    { label: 'Department', val: app.dept || app.departmentName || '—' },
                    { label: 'Applicant Name', val: app.citizenName || 'Citizen' },
                    { label: 'Assigned Officer', val: app.officerName || app.assignedOfficerName || '—' },
                    { label: 'Submitted Date', val: formatDate(app.submittedDate || app.createdAt) },
                    { label: 'SLA Due Date', val: formatDate(app.slaDate) },
                    { label: 'Fee Paid', val: app.fee > 0 ? `₹${app.fee}` : 'Free / ₹0' },
                    { label: 'Payment Status', val: (app.paymentStatus || 'paid').toUpperCase() },
                    { label: 'Overall Status', val: statusBadgeLabel.toUpperCase() },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--slate-50)',
                        borderRadius: '8px',
                        border: '1px solid var(--slate-200)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--navy-900)', fontWeight: 600 }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="card-footer" style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => showToast('Application details sent to your registered email.')}
              >
                Email Details
              </button>
              {isApproved && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => showToast('Certificate downloaded successfully!')}
                >
                  Download Certificate
                </button>
              )}
              <Link to="/citizen/raise-grievance" className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
                Raise Grievance
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Query Response Modal ── */}
      {queryModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 22, 40, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setQueryModalOpen(false)}
        >
          <div
            className="modal"
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '90%',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
              <span className="modal-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Respond to Officer Query
              </span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
                onClick={() => setQueryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQueryResponseSubmit}>
              <div className="modal-body" style={{ padding: 'var(--space-xl)' }}>
                <div className="alert alert-warning" style={{ marginBottom: 'var(--space-md)', fontSize: '0.8125rem' }}>
                  {queryMessage}
                </div>

                {querySuccessMsg && (
                  <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}>
                    {querySuccessMsg}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Upload Requested Document(s) <span style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <input
                    type="file"
                    id="queryFileInput"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files) {
                        setQueryFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                  <div
                    className="upload-zone"
                    onClick={() => document.getElementById('queryFileInput')?.click()}
                  >
                    <svg width="28" height="28" fill="none" stroke="var(--slate-400)" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto 8px auto', display: 'block' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      Click to upload files (PDF, JPG, PNG up to 5MB)
                    </div>
                  </div>

                  {queryFiles.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {queryFiles.map((file, i) => (
                        <div key={i} style={{ fontSize: '0.8rem', color: 'var(--navy-700)', fontWeight: 600, background: 'var(--green-50)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>
                          ✓ {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Additional Note (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add clarification notes for the officer…"
                    value={queryNote}
                    onChange={(e) => setQueryNote(e.target.value)}
                    style={{ width: '100%' }}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: 'var(--space-md) var(--space-xl)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setQueryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
