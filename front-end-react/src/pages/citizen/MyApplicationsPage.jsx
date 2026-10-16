import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetMyApplications, apiWithdrawApplication } from '../../api/citizenApi';
import ApplicationRow from '../../components/citizen/ApplicationRow';
import { checkStatusCategory } from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import { downloadDigitalCertificate } from '../../utils/certificate';
import { normalizeApplications } from '../../utils/applicationMapper';

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
      const normalized = normalizeApplications(appsList);
      setApplications(normalized);
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

  const handleConfirmWithdraw = async () => {
    if (withdrawApp) {
      try {
        await apiWithdrawApplication(withdrawApp.id);
        setApplications((prev) => prev.filter((a) => a.id !== withdrawApp.id));
      } catch (err) {
        console.warn('Backend withdraw error, removing locally:', err.message);
        setApplications((prev) => prev.filter((a) => a.id !== withdrawApp.id));
      } finally {
        setWithdrawApp(null);
      }
    }
  };

  return (
    <div>
      
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
                      <ApplicationRow
                        key={app.id}
                        app={app}
                        onWithdraw={(a) => setWithdrawApp(a)}
                        onDownloadCert={(a) => downloadDigitalCertificate(a)}
                      />
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {checkStatusCategory(app.status).isApproved && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#047857', borderColor: '#a7f3d0' }}
                            onClick={() => downloadDigitalCertificate(app)}
                          >
                            Certificate
                          </button>
                        )}
                        {!checkStatusCategory(app.status).isApproved && !checkStatusCategory(app.status).isRejected && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--red-600)', borderColor: 'var(--red-200)' }}
                            onClick={() => setWithdrawApp(app)}
                          >
                            Withdraw
                          </button>
                        )}
                        <Link to={`/citizen/track?id=${app.id}`} className="btn btn-ghost btn-sm">
                          Track Details →
                        </Link>
                      </div>
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
