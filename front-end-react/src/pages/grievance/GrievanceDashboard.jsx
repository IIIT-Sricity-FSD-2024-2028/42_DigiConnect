// src/pages/grievance/GrievanceDashboard.jsx
// Grievance Officer Dashboard matching front-end/grievance/grievance-dashboard.html exactly
// React concepts: Components, State, Effects, Controlled Filters, Pagination, Modals, CSV Export, Router Navigation

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGetGrievances } from '../../api/grievanceApi';

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

function getCatLabel(c = '') {
  const map = {
    delay: 'Service Delay',
    rejection: 'App. Rejection',
    payment: 'Payment Issue',
    misconduct: 'Officer Misconduct',
    technical: 'Technical Issue',
    'wrong-info': 'Wrong Information',
    other: 'Other Issue',
  };
  return map[c] || (c ? c.charAt(0).toUpperCase() + c.slice(1) : 'General');
}

function getCatClass(c = '') {
  const map = {
    delay: 'cat-delay',
    rejection: 'cat-rejection',
    payment: 'cat-payment',
    misconduct: 'cat-misconduct',
    technical: 'cat-delay',
    'wrong-info': 'cat-rejection',
  };
  return map[c] || 'cat-delay';
}

function getStatusInfo(status = '') {
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
  return map[s] || { label: status || 'Open', cls: 'badge-warning', srs: '' };
}

function getSlaDisplay(g) {
  const s = (g.slaStatus || 'safe').toLowerCase();
  const labels = { safe: 'On Track', warn: 'At Risk', breach: 'Breached' };
  const icons = { safe: '✓', warn: '⏱', breach: '⚠' };
  return {
    label: `${icons[s] || ''} ${labels[s] || 'On Track'}`,
    className: `sla-text ${s}`,
  };
}

export default function GrievanceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [currentFilter, setCurrentFilter] = useState('all');
  const [activeCatFilter, setActiveCatFilter] = useState('');
  const [activeSearchQ, setActiveSearchQ] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Quick View Modal
  const [quickViewGrievance, setQuickViewGrievance] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetGrievances(1, 200);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setGrievances(list);
    } catch (err) {
      setError(err.message || 'Failed to load grievance data.');
      showToast('Failed to load grievance queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  // Hash anchor scrolling for queue
  useEffect(() => {
    if (location.hash === '#queue' || location.hash === '#grievance-queue') {
      const timer = setTimeout(() => {
        const el = document.getElementById('queue') || document.getElementById('grievance-queue');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timer);
    } else if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash, location.pathname, loading]);

  // Derived KPI Counts
  const countNew = useMemo(() => {
    return grievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      return s === 'new' || s === 'open' || s === 'submitted';
    }).length;
  }, [grievances]);

  const countOpen = useMemo(() => {
    return grievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      return s === 'investigating' || s === 'under-review' || s === 'in-progress';
    }).length;
  }, [grievances]);

  const countResolved = useMemo(() => {
    return grievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      return s === 'resolved' || s === 'completed' || s === 'escalated-resolved';
    }).length;
  }, [grievances]);

  const countBreach = useMemo(() => {
    return grievances.filter((g) => (g.slaStatus || '').toLowerCase() === 'breach').length;
  }, [grievances]);

  // Filtered & Sorted Queue
  const filteredData = useMemo(() => {
    let result = grievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');

      // Status filter
      let matchStatus = true;
      if (currentFilter === 'new') {
        matchStatus = s === 'new' || s === 'open' || s === 'submitted';
      } else if (currentFilter === 'open' || currentFilter === 'investigating') {
        matchStatus = s === 'investigating' || s === 'under-review' || s === 'in-progress';
      } else if (currentFilter === 'resolved') {
        matchStatus = s === 'resolved' || s === 'completed' || s === 'escalated-resolved';
      } else if (currentFilter === 'breach') {
        matchStatus = (g.slaStatus || '').toLowerCase() === 'breach';
      }

      // Category filter
      const matchCat = !activeCatFilter || (g.category || '').toLowerCase() === activeCatFilter.toLowerCase();

      // Search query
      const q = activeSearchQ.toLowerCase().trim();
      const matchSearch =
        !q ||
        (g.id || '').toLowerCase().includes(q) ||
        (g.citizenName || '').toLowerCase().includes(q) ||
        (g.subject || '').toLowerCase().includes(q) ||
        (g.relatedAppId || '').toLowerCase().includes(q);

      return matchStatus && matchCat && matchSearch;
    });

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.filedDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.filedDate || b.createdAt || 0).getTime();
      if (sortOption === 'date_desc') return dateB - dateA;
      if (sortOption === 'date_asc') return dateA - dateB;
      return 0;
    });

    return result;
  }, [grievances, currentFilter, activeCatFilter, activeSearchQ, sortOption]);

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * pageSize;
  const pageItems = filteredData.slice(pageStart, pageStart + pageSize);

  const handleExportCSV = () => {
    if (!filteredData.length) {
      showToast('No grievances available to export', 'warning');
      return;
    }
    const headers = ['Grievance ID,Citizen Name,Application ID,Category,Priority,Status,SLA,Submitted,Subject'];
    const rows = filteredData.map((g) => {
      const clean = (str = '') => `"${String(str).replace(/"/g, '""')}"`;
      return [
        clean(g.id),
        clean(g.citizenName),
        clean(g.relatedAppId || ''),
        clean(getCatLabel(g.category)),
        clean(g.priority || 'Medium'),
        clean(getStatusInfo(g.status).label),
        clean(getSlaDisplay(g).label),
        clean(formatDate(g.filedDate || g.createdAt)),
        clean(g.subject || ''),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Grievance_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exporting to CSV...', 'info');
  };

  return (
    <div className="grievance-dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Toast Notification Container */}
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

      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
              Grievance Queue
            </h1>
            <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Manage, investigate and resolve citizen complaints — categorize, investigate, then resolve or escalate to Supervisor
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={fetchGrievances}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
              >
                <polyline points="23,4 23,10 17,10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SRS Workflow Info Alert */}
      <div className="alert alert-info" style={{ marginBottom: 0, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <strong>Grievance workflow:</strong> Citizen complaint → You receive &amp; categorize → Investigate →{' '}
          <strong>Resolve</strong> (valid / invalid) <em>or</em> <strong>Escalate to Supervisor</strong> (serious cases). Supervisor takes final action.
        </div>
      </div>

      {/* Summary Strip (4 KPI chips matching HTML) */}
      <div className="summary-strip">
        <div
          className={`summary-chip new ${currentFilter === 'new' ? 'active-chip' : ''}`}
          onClick={() => {
            setCurrentFilter((prev) => (prev === 'new' ? 'all' : 'new'));
            setCurrentPage(1);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="summary-chip-val" id="countNew">{loading ? '...' : countNew}</div>
          <div className="summary-chip-label">New</div>
          <div className="summary-chip-status">NEW_GRIEVANCE</div>
        </div>

        <div
          className={`summary-chip open ${currentFilter === 'open' ? 'active-chip' : ''}`}
          onClick={() => {
            setCurrentFilter((prev) => (prev === 'open' ? 'all' : 'open'));
            setCurrentPage(1);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="summary-chip-val" id="countOpen">{loading ? '...' : countOpen}</div>
          <div className="summary-chip-label">Investigating</div>
          <div className="summary-chip-status">UNDER_INVESTIGATION</div>
        </div>

        <div
          className={`summary-chip resolved ${currentFilter === 'resolved' ? 'active-chip' : ''}`}
          onClick={() => {
            setCurrentFilter((prev) => (prev === 'resolved' ? 'all' : 'resolved'));
            setCurrentPage(1);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="summary-chip-val" id="countResolved">{loading ? '...' : countResolved}</div>
          <div className="summary-chip-label">Resolved</div>
          <div className="summary-chip-status">GRIEVANCE_RESOLVED</div>
        </div>

        <div
          className={`summary-chip breach ${currentFilter === 'breach' ? 'active-chip' : ''}`}
          onClick={() => {
            setCurrentFilter((prev) => (prev === 'breach' ? 'all' : 'breach'));
            setCurrentPage(1);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="summary-chip-val" id="countBreach">{loading ? '...' : countBreach}</div>
          <div className="summary-chip-label">SLA Breach</div>
          <div className="summary-chip-status">SLA_BREACHED</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" id="queue">
        {/* Card Header */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            All Grievances
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'new', label: 'New' },
              { key: 'open', label: 'Investigating' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`filter-btn ${currentFilter === tab.key ? 'active' : ''}`}
                onClick={() => {
                  setCurrentFilter(tab.key);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Body with Search & Dropdowns */}
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--slate-400)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-box-input"
                id="tableSearch"
                placeholder="Search by ID, citizen, or subject..."
                value={activeSearchQ}
                onChange={(e) => {
                  setActiveSearchQ(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="form-select"
              style={{ width: '160px' }}
              value={activeCatFilter}
              onChange={(e) => {
                setActiveCatFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              <option value="delay">Service Delay</option>
              <option value="rejection">App. Rejection</option>
              <option value="payment">Payment Issue</option>
              <option value="misconduct">Officer Misconduct</option>
            </select>

            <select
              className="form-select"
              style={{ width: '140px' }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
            </select>
          </div>

          {/* Table Meta Count & Per Page */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Showing <span style={{ fontWeight: 700, color: 'var(--navy-700)' }}>{pageItems.length}</span> of{' '}
              <span style={{ fontWeight: 700, color: 'var(--navy-700)' }}>{totalCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Per page:</label>
              <select
                className="form-select"
                style={{ width: '80px', padding: '5px 28px 5px 10px' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grievance Queue Table */}
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table" id="grievanceTable">
            <thead>
              <tr>
                <th>Grievance ID</th>
                <th>Citizen Name</th>
                <th>Application ID</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="grievanceTableBody">
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 8px auto' }}></div>
                    Loading grievances...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--red-600)' }}>
                    {error}
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                    No grievances match your filters
                  </td>
                </tr>
              ) : (
                pageItems.map((g) => {
                  const sm = getStatusInfo(g.status);
                  const sla = getSlaDisplay(g);
                  const priority = (g.priority || 'medium').toLowerCase();
                  const initials = (g.citizenName || 'User')
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={g.id}
                      className="grievance-table-row"
                      onClick={() => setQuickViewGrievance(g)}
                      data-testid={`griev-row-${g.id}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="grievance-id">{g.id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="assign-avatar">{initials}</div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                            {g.citizenName || 'Citizen'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--navy-700)' }}>
                        {g.relatedAppId || '—'}
                      </td>
                      <td>
                        <span className={`category-tag ${getCatClass(g.category)}`}>
                          {getCatLabel(g.category)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span
                            className={`priority-dot ${
                              priority === 'high'
                                ? 'priority-high'
                                : priority === 'low'
                                ? 'priority-low'
                                : 'priority-medium'
                            }`}
                            style={{
                              background:
                                priority === 'high'
                                  ? 'var(--red-500)'
                                  : priority === 'low'
                                  ? 'var(--green-500)'
                                  : 'var(--amber-400)',
                            }}
                          ></span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                            {priority}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${sm.cls}`}>{sm.label}</span>
                      </td>
                      <td>
                        <span className={sla.className} style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                          {sla.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {formatDate(g.filedDate || g.createdAt)}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => setQuickViewGrievance(g)}
                            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-xs"
                            onClick={() => navigate(`/grievance/detail/${g.id}`)}
                            style={{ padding: '3px 8px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                          >
                            View in Detail
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

        {/* Pagination Card Footer */}
        <div
          className="card-footer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Page <span style={{ fontWeight: 700, color: 'var(--navy-700)' }}>{currentPageSafe}</span> of{' '}
            <span style={{ fontWeight: 700, color: 'var(--navy-700)' }}>{totalPages}</span>
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPageSafe <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              <span>Prev</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPageSafe >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Next</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewGrievance && (
        <div className="modal-overlay active" id="quickViewModal" onClick={() => setQuickViewGrievance(null)}>
          <div className="modal" style={{ maxWidth: '640px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="modal-title" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                {quickViewGrievance.id}
              </span>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setQuickViewGrievance(null)}
                aria-label="Close modal"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-lg)',
                  background: 'var(--slate-50)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Citizen Name
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{quickViewGrievance.citizenName}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Application ID
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {quickViewGrievance.relatedAppId || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Category
                  </div>
                  <span className={`category-tag ${getCatClass(quickViewGrievance.category)}`}>
                    {getCatLabel(quickViewGrievance.category)}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Status
                  </div>
                  <span className={`badge ${getStatusInfo(quickViewGrievance.status).cls}`}>
                    {getStatusInfo(quickViewGrievance.status).label}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Priority
                  </div>
                  <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {quickViewGrievance.priority || 'Medium'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    SLA Status
                  </div>
                  <div style={{ fontWeight: 600 }}>{getSlaDisplay(quickViewGrievance).label}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
                  Subject
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '10px' }}>
                  {quickViewGrievance.subject || 'Complaint Subject'}
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Description
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--slate-700)',
                    lineHeight: 1.6,
                    background: '#fff',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {quickViewGrievance.description || 'No complaint details provided.'}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setQuickViewGrievance(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const id = quickViewGrievance.id;
                  setQuickViewGrievance(null);
                  navigate(`/grievance/detail/${id}`);
                }}
              >
                Open Full Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
