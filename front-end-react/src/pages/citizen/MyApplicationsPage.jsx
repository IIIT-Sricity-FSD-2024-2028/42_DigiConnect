import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetMyApplications } from '../../api/citizenApi';
import ApplicationRow from '../../components/citizen/ApplicationRow';
import { checkStatusCategory } from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('table');

  // Withdraw modal state
  const [withdrawApp, setWithdrawApp] = useState(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetMyApplications(1, 100);
      const appsList = Array.isArray(res) ? res : res?.data || res?.items || [];
      setApplications(appsList);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Compute summary strip counts
  const totalCount = applications.length;
  const underReviewCount = applications.filter((a) => checkStatusCategory(a.status).isUnderReview).length;
  const queryCount = applications.filter((a) => checkStatusCategory(a.status).isQuery).length;
  const approvedCount = applications.filter((a) => checkStatusCategory(a.status).isApproved).length;
  const rejectedCount = applications.filter((a) => checkStatusCategory(a.status).isRejected).length;
  const escalatedCount = applications.filter((a) => checkStatusCategory(a.status).isEscalated).length;

  // Filter applications list
  const filteredApps = applications.filter((app) => {
    const { isApproved, isQuery, isUnderReview, isRejected, isEscalated, s } = checkStatusCategory(app.status);

    if (filterStatus === 'approved' && !isApproved) return false;
    if (filterStatus === 'query' && !isQuery) return false;
    if (filterStatus === 'under-review' && !isUnderReview) return false;
    if (filterStatus === 'submitted' && s !== 'submitted' && s !== 'pending') return false;
    if (filterStatus === 'rejected' && !isRejected) return false;
    if (filterStatus === 'escalated' && !isEscalated) return false;

    // Filter by service type
    const rawType = (app.serviceType || app.category || '').toLowerCase();
    if (filterType && rawType !== filterType.toLowerCase()) return false;

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const idMatch = (app.id || '').toLowerCase().includes(q);
      const nameMatch = (app.serviceName || '').toLowerCase().includes(q);
      const deptMatch = (app.dept || app.departmentName || app.department || '').toLowerCase().includes(q);
      if (!idMatch && !nameMatch && !deptMatch) return false;
    }

    return true;
  });

  // Sort applications list
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'date-desc') {
      const dateA = new Date(a.submittedDate || a.appliedDate || a.createdAt || 0);
      const dateB = new Date(b.submittedDate || b.appliedDate || b.createdAt || 0);
      return dateB - dateA;
    }
    if (sortBy === 'date-asc') {
      const dateA = new Date(a.submittedDate || a.appliedDate || a.createdAt || 0);
      const dateB = new Date(b.submittedDate || b.appliedDate || b.createdAt || 0);
      return dateA - dateB;
    }
    if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    }
    return 0;
  });

  const handleConfirmWithdraw = () => {
    if (withdrawApp) {
      setApplications((prev) => prev.filter((a) => a.id !== withdrawApp.id));
      setWithdrawApp(null);
    }
  };

  return (
    <div>
      <style>{`
        .summary-strip {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }
        .summary-chip {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          text-align: center;
          box-shadow: var(--shadow-xs);
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .summary-chip:hover {
          border-color: var(--navy-300);
          box-shadow: var(--shadow-sm);
          transform: translateY(-1px);
        }
        .summary-chip.active-filter {
          border-color: var(--navy-500);
          background: var(--navy-50);
        }
        .summary-chip-val {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 4px;
        }
        .summary-chip-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }
        .chip-all .summary-chip-val { color: var(--navy-700); }
        .chip-pending .summary-chip-val { color: var(--amber-600); }
        .chip-query .summary-chip-val { color: #d97706; }
        .chip-approved .summary-chip-val { color: #166534; }
        .chip-rejected .summary-chip-val { color: var(--red-500); }
        .chip-escalated .summary-chip-val { color: #9333ea; }

        .filter-bar {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-bottom: var(--space-md);
        }
        .filter-btn {
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-btn.active, .filter-btn:hover {
          border-color: var(--navy-500);
          background: var(--navy-50);
          color: var(--navy-700);
        }

        .search-filter-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
        }
        .search-box {
          position: relative;
          flex: 1;
          min-width: 220px;
        }
        .search-box-input {
          width: 100%;
          padding: 9px 14px 9px 38px;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background: var(--slate-50);
          color: var(--color-text);
          outline: none;
        }
        .search-box-input:focus {
          border-color: var(--navy-400);
          background: var(--color-surface);
          box-shadow: 0 0 0 3px rgba(37, 87, 160, 0.1);
        }
        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-400);
          width: 16px;
          height: 16px;
          pointer-events: none;
        }

        .view-toggle {
          display: flex;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .view-btn {
          padding: 7px 12px;
          background: var(--color-surface);
          border: none;
          cursor: pointer;
          color: var(--slate-400);
          display: flex;
          align-items: center;
        }
        .view-btn.active { background: var(--navy-600); color: #fff; }
        .view-btn svg { width: 16px; height: 16px; }

        .service-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
        }
        .svc-certificate { background: var(--navy-100); color: var(--navy-800); }
        .svc-welfare { background: #d1fae5; color: #065f46; }
        .svc-permission { background: var(--amber-100); color: #92400e; }
        .svc-record { background: var(--purple-100); color: #6b21a8; }

        .sla-bar-bg {
          height: 4px;
          background: var(--slate-100);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 3px;
        }
        .sla-bar-fill {
          height: 100%;
          border-radius: 99px;
        }
        .sla-bar-fill.safe { background: #10b981; }
        .sla-bar-fill.warn { background: var(--amber-400); }
        .sla-bar-fill.breach { background: var(--red-500); }
        .sla-text { font-size: 0.72rem; font-weight: 600; }
        .sla-text.safe { color: #166534; }
        .sla-text.warn { color: var(--amber-600); }
        .sla-text.breach { color: var(--red-500); }

        .icon-btn {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--slate-500);
          text-decoration: none;
        }
        .icon-btn:hover {
          border-color: var(--navy-300);
          color: var(--navy-600);
          background: var(--navy-50);
        }
        .icon-btn svg { width: 14px; height: 14px; }

        .apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-lg);
        }
        .app-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xs);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .app-card-header {
          padding: var(--space-md) var(--space-lg);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .app-card-body {
          padding: var(--space-md) var(--space-lg);
          flex: 1;
        }
        .app-card-footer {
          padding: var(--space-md) var(--space-lg);
          background: var(--slate-50);
          border-top: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 1024px) {
          .summary-strip { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .summary-strip { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
            My Applications
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Track and manage all your service applications in one place.
          </p>
        </div>
        <Link to="/citizen/apply" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Apply for New Service
        </Link>
      </div>

      {/* ── Summary Strip (6 Chips) ── */}
      <div className="summary-strip">
        <div
          className={`summary-chip chip-all ${filterStatus === 'all' ? 'active-filter' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <div className="summary-chip-val">{totalCount}</div>
          <div className="summary-chip-label">Total</div>
        </div>
        <div
          className={`summary-chip chip-pending ${filterStatus === 'under-review' ? 'active-filter' : ''}`}
          onClick={() => setFilterStatus('under-review')}
        >
          <div className="summary-chip-val">{underReviewCount}</div>
          <div className="summary-chip-label">Under Review</div>
        </div>
        <div
          className={`summary-chip chip-query ${filterStatus === 'query' ? 'active-filter' : ''}`}
          onClick={() => setFilterStatus('query')}
        >
          <div className="summary-chip-val">{queryCount}</div>
          <div className="summary-chip-label">Query Raised</div>
        </div>
        <div
          className={`summary-chip chip-approved ${filterStatus === 'approved' ? 'active-filter' : ''}`}
          onClick={() => setFilterStatus('approved')}
        >
          <div className="summary-chip-val">{approvedCount}</div>
          <div className="summary-chip-label">Approved</div>
        </div>
        <div
          className={`summary-chip chip-rejected ${filterStatus === 'rejected' ? 'active-filter' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          <div className="summary-chip-val">{rejectedCount}</div>
          <div className="summary-chip-label">Rejected</div>
        </div>
        <div
          className={`summary-chip chip-escalated ${filterStatus === 'escalated' ? 'active-filter' : ''}`}
          onClick={() => setFilterStatus('escalated')}
        >
          <div className="summary-chip-val">{escalatedCount}</div>
          <div className="summary-chip-label">Escalated</div>
        </div>
      </div>

      {/* ── Status Filter Pills ── */}
      <div className="filter-bar">
        {[
          { key: 'all', label: 'All' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'under-review', label: 'Under Review' },
          { key: 'query', label: 'Query Raised' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'escalated', label: 'Escalated' },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            className={`filter-btn ${filterStatus === btn.key ? 'active' : ''}`}
            onClick={() => setFilterStatus(btn.key)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── Search / Service Filter / Sort / View Toggle ── */}
      <div className="search-filter-row">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search by Application ID, service name, or dept…"
        />

        <select
          className="form-select"
          style={{ minWidth: '160px', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Service Types</option>
          <option value="certificate">Certificates</option>
          <option value="welfare">Welfare Programs</option>
          <option value="permission">Permissions</option>
          <option value="correction">Record Corrections</option>
        </select>

        <select
          className="form-select"
          style={{ minWidth: '130px', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="status">Status</option>
        </select>

        <div className="view-toggle">
          <button
            type="button"
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="5" rx="1" />
              <rect x="3" y="10" width="18" height="5" rx="1" />
              <rect x="3" y="17" width="18" height="4" rx="1" />
            </svg>
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="Card View"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Table Meta / Result Count ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Showing <strong style={{ color: 'var(--navy-700)' }}>{sortedApps.length}</strong> of{' '}
          <strong style={{ color: 'var(--navy-700)' }}>{totalCount}</strong> applications
        </div>
      </div>

      {/* ── Loading / Error Alerts ── */}
      {loading && (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading your applications...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* ── Content View ── */}
      {!loading && !error && (
        <>
          {sortedApps.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
                No applications found
              </h3>
              <p style={{ fontSize: '0.875rem', margin: '0 0 var(--space-md) 0' }}>
                No records match your selected filters or search query.
              </p>
              <Link to="/citizen/apply" className="btn btn-outline btn-sm">
                Apply for a Service
              </Link>
            </div>
          ) : viewMode === 'table' ? (
            /* ══ TABLE VIEW ══ */
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Service Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>SLA</th>
                      <th>Officer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedApps.map((app) => (
                      <ApplicationRow key={app.id} app={app} onWithdraw={(a) => setWithdrawApp(a)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ══ CARD VIEW ══ */
            <div className="apps-grid">
              {sortedApps.map((app) => {
                const rawType = (app.serviceType || app.category || 'certificate').toLowerCase();
                const submittedDate = app.submittedDate || app.appliedDate || app.createdAt;
                const formattedDate = submittedDate
                  ? new Date(submittedDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div key={app.id} className="app-card">
                    <div className="app-card-header">
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--navy-500)', fontWeight: 600 }}>
                          {app.id}
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900)', marginTop: '2px' }}>
                          {app.serviceName || 'Government Service'}
                        </div>
                      </div>
                      <span className={`service-tag svc-${rawType}`}>
                        {rawType.charAt(0).toUpperCase() + rawType.slice(1)}
                      </span>
                    </div>

                    <div className="app-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Department:</span>
                        <span style={{ fontWeight: 600, color: 'var(--navy-800)' }}>
                          {app.dept || app.departmentName || app.department || '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Submitted:</span>
                        <span style={{ fontWeight: 600, color: 'var(--navy-800)' }}>{formattedDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
                        <span className="badge badge-info">{app.status || 'Submitted'}</span>
                      </div>
                    </div>

                    <div className="app-card-footer">
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Officer: {app.officerName || app.assignedOfficerName || '—'}
                      </span>
                      <Link to={`/citizen/track?id=${app.id}`} className="btn btn-ghost btn-sm">
                        Track Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Withdraw Modal ── */}
      {/* ── Withdraw Confirmation Modal ── */}
      <Modal
        isOpen={Boolean(withdrawApp)}
        onClose={() => setWithdrawApp(null)}
        title="Withdraw Application"
        maxWidth="440px"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', width: '100%' }}>
            <button type="button" className="btn btn-outline" onClick={() => setWithdrawApp(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleConfirmWithdraw}>
              Yes, Withdraw
            </button>
          </div>
        }
      >
        {withdrawApp && (
          <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--red-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-md)',
              }}
            >
              <svg width="28" height="28" fill="none" stroke="var(--red-500)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
              Are you sure you want to withdraw application <strong>{withdrawApp.id}</strong>?
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              This action cannot be undone once confirmed.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
