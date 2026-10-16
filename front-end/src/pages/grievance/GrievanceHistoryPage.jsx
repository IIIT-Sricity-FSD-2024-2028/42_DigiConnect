// src/pages/grievance/GrievanceHistoryPage.jsx
// Grievance History Archive page matching front-end/grievance/grievance-history.html exactly
// React concepts: Components, State, Effects, Controlled Inputs, Filtering, Pagination, Modals, CSV Export

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetGrievances } from '../../api/grievanceApi';
import SearchBar from '../../components/common/SearchBar';

const TERMINAL_STATUSES = ['resolved', 'rejected', 'escalated-resolved', 'escalated', 'closed'];

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

function formatDateTime(dateStr) {
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

export function getGrievanceClosedDate(g) {
  if (!g) return null;
  return g.closedDate || g.resolvedDate || g.lastUpdated || g.updatedAt || null;
}

export function getGrievanceDaysTaken(g) {
  if (!g) return null;
  if (typeof g.daysTaken === 'number') return g.daysTaken;
  const closed = getGrievanceClosedDate(g);
  const filed = g.filedDate || g.createdAt;
  if (closed && filed) {
    const start = new Date(filed).getTime();
    const end = new Date(closed).getTime();
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    }
  }
  return null;
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

function getOutcomeDisplay(status = '') {
  const s = status.toLowerCase().replace(/_/g, '-');
  if (s === 'resolved' || s === 'completed') {
    return { label: 'Resolved', cls: 'badge-success', icon: '✓' };
  }
  if (s === 'rejected' || s === 'dismissed') {
    return { label: 'Rejected', cls: 'badge-neutral', icon: '✕' };
  }
  if (s === 'escalated' || s === 'escalated-resolved') {
    return { label: 'Escalated → Closed', cls: 'badge-warning', icon: '⚡' };
  }
  return { label: status, cls: 'badge-neutral', icon: '•' };
}

export default function GrievanceHistoryPage() {
  const { user } = useAuth();
  const [allGrievances, setAllGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dynamic distinct categories
  const availableCategories = useMemo(() => {
    const canonical = ['delay', 'rejection', 'rejection_appeal', 'clarification', 'payment', 'misconduct', 'technical', 'wrong-info', 'other'];
    const present = allGrievances.map((g) => g.category).filter(Boolean);
    return Array.from(new Set([...canonical, ...present]));
  }, [allGrievances]);

  // Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetGrievances(1, 200);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAllGrievances(list);
    } catch (err) {
      setError(err.message || 'Failed to load grievance history.');
      showToast('Failed to load grievance history archive', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Filter only closed / terminal records
  const terminalGrievances = useMemo(() => {
    return allGrievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      return TERMINAL_STATUSES.includes(s);
    });
  }, [allGrievances]);

  // Aggregate statistics
  const countResolved = useMemo(() => {
    return terminalGrievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      return s === 'resolved' || s === 'completed';
    }).length;
  }, [terminalGrievances]);

  const countRejected = useMemo(() => {
    return terminalGrievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      return s === 'rejected' || s === 'dismissed';
    }).length;
  }, [terminalGrievances]);

  const countEscResolved = useMemo(() => {
    return terminalGrievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      return s === 'escalated' || s === 'escalated-resolved';
    }).length;
  }, [terminalGrievances]);

  const { avgDays, slaPerformanceRate } = useMemo(() => {
    if (!terminalGrievances.length) {
      return { avgDays: '—', slaPerformanceRate: '100% WITHIN SLA' };
    }
    const daysList = terminalGrievances
      .map(getGrievanceDaysTaken)
      .filter((d) => typeof d === 'number' && !isNaN(d));

    if (!daysList.length) {
      return { avgDays: '—', slaPerformanceRate: 'SLA COMPLIANT' };
    }

    const sum = daysList.reduce((acc, d) => acc + d, 0);
    const avg = (sum / daysList.length).toFixed(1) + 'd';

    // Grievance statutory SLA is 7 days
    const withinSlaCount = daysList.filter((d) => d <= 7).length;
    const rate = Math.round((withinSlaCount / daysList.length) * 100);

    return {
      avgDays: avg,
      slaPerformanceRate: `${rate}% WITHIN 7d SLA`,
    };
  }, [terminalGrievances]);

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    let result = terminalGrievances.filter((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, '-');
      let matchStatus = true;
      if (statusFilter === 'resolved') {
        matchStatus = s === 'resolved' || s === 'completed';
      } else if (statusFilter === 'rejected') {
        matchStatus = s === 'rejected' || s === 'dismissed';
      } else if (statusFilter === 'escalated') {
        matchStatus = s === 'escalated' || s === 'escalated-resolved';
      }

      const matchCat = !categoryFilter || (g.category || '').toLowerCase() === categoryFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (g.id || '').toLowerCase().includes(q) ||
        (g.citizenName || '').toLowerCase().includes(q) ||
        (g.subject || '').toLowerCase().includes(q) ||
        (g.relatedAppId || '').toLowerCase().includes(q);

      let matchDate = true;
      if (dateRangeFilter !== 'all') {
        const targetDate = getGrievanceClosedDate(g) || g.filedDate;
        if (targetDate) {
          const d = new Date(targetDate);
          const now = new Date();
          if (dateRangeFilter === 'thismonth') {
            matchDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          } else if (dateRangeFilter === 'last3months') {
            matchDate = now.getTime() - d.getTime() <= 90 * 86400000;
          } else if (dateRangeFilter === 'thisyear') {
            matchDate = d.getFullYear() === now.getFullYear();
          }
        }
      }

      return matchStatus && matchCat && matchSearch && matchDate;
    });

    result.sort((a, b) => {
      const dateA = new Date(getGrievanceClosedDate(a) || a.filedDate || 0).getTime();
      const dateB = new Date(getGrievanceClosedDate(b) || b.filedDate || 0).getTime();
      const daysA = getGrievanceDaysTaken(a) || 0;
      const daysB = getGrievanceDaysTaken(b) || 0;

      if (sortOption === 'date_desc') return dateB - dateA;
      if (sortOption === 'date_asc') return dateA - dateB;
      if (sortOption === 'days_asc') return daysA - daysB;
      if (sortOption === 'days_desc') return daysB - daysA;
      return 0;
    });

    return result;
  }, [terminalGrievances, statusFilter, categoryFilter, dateRangeFilter, searchQuery, sortOption]);

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * pageSize;
  const pageItems = filteredData.slice(pageStart, pageStart + pageSize);

  const handleExportCSV = () => {
    if (!filteredData.length) {
      showToast('No records available to export', 'warning');
      return;
    }
    const headers = ['Grievance ID,Citizen Name,Application ID,Category,Priority,Status,Closed Date,Days Taken,Resolved By,Subject'];
    const rows = filteredData.map((g) => {
      const outcome = getOutcomeDisplay(g.status).label;
      const daysVal = getGrievanceDaysTaken(g);
      const days = daysVal != null ? `${daysVal}d` : '';
      const closedVal = getGrievanceClosedDate(g);
      const closed = closedVal ? formatDate(closedVal) : '';
      const clean = (str = '') => '"' + String(str).replace(/"/g, '""') + '"';
      return [
        clean(g.id),
        clean(g.citizenName),
        clean(g.relatedAppId || ''),
        clean(getCatLabel(g.category)),
        clean(g.priority || 'Medium'),
        clean(outcome),
        clean(closed),
        clean(days),
        clean(g.resolvedBy || 'Grievance Cell'),
        clean(g.subject || ''),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Grievance_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported grievance archive to CSV successfully!', 'success');
  };

  return (
    <div className="grievance-history-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                Grievance History
              </h1>
              <span className="badge badge-info" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                {user?.dept || 'Department Redressal Cell'}
              </span>
            </div>
            <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Archive of closed grievances for <strong style={{ color: 'var(--navy-800)' }}>{user?.name || 'Grievance Officer'}</strong> — resolved, rejected, and escalated audit records.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Link
              to="/grievance/dashboard#queue"
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Queue</span>
            </Link>
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
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={loadHistory}
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

      {/* Summary Strip */}
      <div className="summary-strip">
        <div
          className={`summary-chip resolved ${statusFilter === 'resolved' ? 'active-chip' : ''}`}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'resolved' ? 'all' : 'resolved'));
            setCurrentPage(1);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="summary-chip-val" id="countResolved">{loading ? '...' : countResolved}</div>
          <div className="summary-chip-label">Resolved</div>
          <div className="summary-chip-status">GRIEVANCE_RESOLVED</div>
        </div>

        <div
          className={`summary-chip rejected ${statusFilter === 'rejected' ? 'active-chip' : ''}`}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'rejected' ? 'all' : 'rejected'));
            setCurrentPage(1);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="summary-chip-val" id="countRejected">{loading ? '...' : countRejected}</div>
          <div className="summary-chip-label">Rejected</div>
          <div className="summary-chip-status">GRIEVANCE_REJECTED</div>
        </div>

        <div
          className={`summary-chip escalated ${statusFilter === 'escalated' ? 'active-chip' : ''}`}
          onClick={() => {
            setStatusFilter((prev) => (prev === 'escalated' ? 'all' : 'escalated'));
            setCurrentPage(1);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="summary-chip-val" id="countEscResolved">{loading ? '...' : countEscResolved}</div>
          <div className="summary-chip-label">Escalated & Closed</div>
          <div className="summary-chip-status">ESCALATED_CLOSED</div>
        </div>

        <div className="summary-chip avg" style={{ cursor: 'default' }}>
          <div className="summary-chip-val" id="avgDays">{loading ? '...' : avgDays}</div>
          <div className="summary-chip-label">Avg Resolution Time</div>
          <div className="summary-chip-status">{loading ? '...' : slaPerformanceRate}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Card Header */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Archive of Closed Cases
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'escalated', label: 'Escalated & Closed' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`filter-btn ${statusFilter === tab.key ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Controls Body */}
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              onClear={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              placeholder="Search by ID, citizen, or subject..."
            />

            {/* Category Filter */}
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories ({terminalGrievances.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCatLabel(cat)}
                </option>
              ))}
            </select>

            {/* Time Filter */}
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Time</option>
              <option value="thismonth">This Month</option>
              <option value="last3months">Last 3 Months</option>
              <option value="thisyear">This Year</option>
            </select>

            {/* Sort Filter */}
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="days_asc">Fastest Resolved</option>
              <option value="days_desc">Slowest Resolved</option>
            </select>
          </div>

          {/* Table Meta */}
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

        {/* History Table */}
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table" id="grievanceTable">
            <thead>
              <tr>
                <th>Grievance ID</th>
                <th>Citizen Name</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Final Outcome</th>
                <th>Closed Date</th>
                <th>Resolution Time</th>
                <th>Resolved By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="historyTableBody">
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 8px auto' }}></div>
                    Loading grievance history...
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
                    No records match your filters
                  </td>
                </tr>
              ) : (
                pageItems.map((g) => {
                  const outcome = getOutcomeDisplay(g.status);
                  const closedDate = getGrievanceClosedDate(g);
                  const daysVal = getGrievanceDaysTaken(g);
                  const days = daysVal != null ? `${daysVal}d` : '—';
                  const isSlaBreach = daysVal != null && daysVal > 7;
                  const isSlaWarn = daysVal != null && daysVal >= 5 && daysVal <= 7;
                  const slaColor =
                    g.slaStatus === 'breach' || isSlaBreach
                      ? 'var(--red-500)'
                      : g.slaStatus === 'warn' || isSlaWarn
                      ? 'var(--amber-600)'
                      : '#166534';

                  return (
                    <tr
                      key={g.id}
                      className="history-table-row"
                      onClick={() => setSelectedGrievance(g)}
                      data-testid={`history-row-${g.id}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="grievance-id">{g.id}</span>
                        {g.relatedAppId && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {g.relatedAppId}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{g.citizenName || 'Citizen'}</td>
                      <td>
                        <span className={`category-tag ${getCatClass(g.category)}`}>
                          {getCatLabel(g.category)}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={g.subject}>
                        {g.subject || 'Complaint description'}
                      </td>
                      <td>
                        <span className={`badge ${outcome.cls}`}>
                          {outcome.icon} {outcome.label}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {formatDate(closedDate)}
                      </td>
                      <td style={{ color: slaColor, fontWeight: 700, fontSize: '0.8125rem' }}>{days}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--navy-700)' }}>
                        {g.resolvedBy || 'Grievance Officer'}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => setSelectedGrievance(g)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>View</span>
                        </button>
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

      {/* History Detail Modal */}
      {selectedGrievance && (
        <div className="modal-overlay active" id="historyModal" onClick={() => setSelectedGrievance(null)}>
          <div
            className="modal"
            style={{ maxWidth: '680px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="modal-title" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  Case Record: {selectedGrievance.id}
                </span>
                {selectedGrievance.relatedAppId && (
                  <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    (App: {selectedGrievance.relatedAppId})
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setSelectedGrievance(null)}
                aria-label="Close modal"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Meta Grid */}
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
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{selectedGrievance.citizenName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Category
                  </div>
                  <span className={`category-tag ${getCatClass(selectedGrievance.category)}`}>
                    {getCatLabel(selectedGrievance.category)}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Final Outcome
                  </div>
                  <span className={`badge ${getOutcomeDisplay(selectedGrievance.status).cls}`}>
                    {getOutcomeDisplay(selectedGrievance.status).label}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Resolution Time
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {getGrievanceDaysTaken(selectedGrievance) != null
                      ? `${getGrievanceDaysTaken(selectedGrievance)} days`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Filed Date
                  </div>
                  <div>{formatDate(selectedGrievance.filedDate)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Closed Date
                  </div>
                  <div>{formatDate(getGrievanceClosedDate(selectedGrievance))}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Resolved By
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedGrievance.resolvedBy || 'Department Grievance Cell'}</div>
                </div>
              </div>

              {/* Subject & Complaint Text */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
                  Subject
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '8px' }}>
                  {selectedGrievance.subject || 'Complaint Subject'}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Complaint Description
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
                  {selectedGrievance.description || 'No description provided.'}
                </div>
              </div>

              {/* Resolution Remarks */}
              {(selectedGrievance.resolutionNote || selectedGrievance.remarks) && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Resolution Findings & Remarks
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      background: '#f0fdf4',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #bbf7d0',
                      color: '#14532d',
                    }}
                  >
                    {selectedGrievance.resolutionNote || selectedGrievance.remarks}
                  </div>
                </div>
              )}

              {/* Audit History Timeline */}
              {selectedGrievance.history && selectedGrievance.history.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-900)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Audit History & State Transitions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[...selectedGrievance.history].reverse().map((h, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          gap: 'var(--space-md)',
                          padding: '8px 0',
                          borderBottom: '1px solid var(--slate-100)',
                        }}
                      >
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--navy-500)',
                            marginTop: '5px',
                            flexShrink: 0,
                          }}
                        ></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                            {h.action || h.status}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {formatDateTime(h.date || h.timestamp)} • {h.actor || 'System'}
                          </div>
                          {h.note && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                              {h.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedGrievance(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
