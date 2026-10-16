// src/pages/citizen/MyGrievancesPage.jsx
// Converted from: front-end/citizen/my-grievances.html & front-end/js/grievance.js
//
// React Concepts Demonstrated:
//  [Component] — Modular functional page component
//  [State]     — useState for grievances list, loading/error, activeFilter, and selectedId
//  [Hooks]     — useEffect to fetch grievances from backend on mount
//  [Events]    — onClick to filter and select grievance cards
//  [Lists]     — .map() with unique key to render grievance cards and chat bubbles
//  [Condition] — Conditional rendering for loading spinner, empty state, and resolution box
//  [Props]     — Passing title, value, variant to StatCard and status to StatusBadge
//  [Router]    — Link to navigate to "/citizen/raise-grievance"

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGetMyGrievances } from '../../api/citizenApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';

// Helper mapping category keys to human-readable names
const CATEGORY_LABELS = {
  delay: 'Delay in Service',
  rejection: 'Wrongful Rejection',
  misconduct: 'Officer Misconduct',
  technical: 'Technical Issue',
  'wrong-info': 'Wrong Information Issued',
  payment: 'Payment Issue',
  other: 'Other Issue',
};

export default function MyGrievancesPage() {
  // ── 1. State ──
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'open' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Router search params (support linking directly via ?id=GRV-...)
  const [searchParams] = useSearchParams();

  // ── 2. Side Effect: Fetch Data on Mount ──
  useEffect(() => {
    async function loadGrievances() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGetMyGrievances();
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];
        setGrievances(list);

        // Auto-select grievance from URL query or default to first item
        const urlId = searchParams.get('id');
        if (urlId && list.some((g) => g.id === urlId)) {
          setSelectedId(urlId);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load grievances');
      } finally {
        setLoading(false);
      }
    }

    loadGrievances();
  }, [searchParams]);

  // ── 3. Derived Metrics (Calculated dynamically from state) ──
  const TERMINAL_STATUSES = ['resolved', 'rejected', 'escalated-resolved'];
  const totalCount = grievances.length;
  const openCount = grievances.filter((g) => !TERMINAL_STATUSES.includes((g.status || '').toLowerCase())).length;
  const resolvedCount = grievances.filter((g) =>
    ['resolved', 'escalated-resolved'].includes((g.status || '').toLowerCase())
  ).length;

  // Filter list based on selected tab and search query
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const isClosed = TERMINAL_STATUSES.includes((g.status || '').toLowerCase());
      if (filter === 'open' && isClosed) return false;
      if (filter === 'resolved' && !isClosed) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const idMatch = (g.id || '').toLowerCase().includes(query);
        const subjectMatch = (g.subject || g.title || '').toLowerCase().includes(query);
        const relatedAppMatch = (g.relatedAppId || '').toLowerCase().includes(query);
        const deptMatch = (g.dept || g.department || g.departmentName || '').toLowerCase().includes(query);
        const descMatch = (g.description || g.complaint || '').toLowerCase().includes(query);
        const categoryMatch = (CATEGORY_LABELS[g.category] || g.category || '').toLowerCase().includes(query);
        const officerMatch = (g.assignedOfficerName || g.officer || '').toLowerCase().includes(query);

        if (!idMatch && !subjectMatch && !relatedAppMatch && !deptMatch && !descMatch && !categoryMatch && !officerMatch) {
          return false;
        }
      }

      return true;
    });
  }, [grievances, filter, searchQuery]);

  // Keep selectedId synchronized when search/filter narrows results
  useEffect(() => {
    if (filteredGrievances.length > 0) {
      const stillInList = filteredGrievances.some((g) => g.id === selectedId);
      if (!stillInList) {
        setSelectedId(filteredGrievances[0].id);
      }
    }
  }, [filteredGrievances, selectedId]);

  // Currently selected grievance object
  const selectedGrv = grievances.find((g) => g.id === selectedId) || null;

  // Date formatting helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
            My Grievances
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Track all your filed grievances and official dispute resolutions.
          </p>
        </div>

        <Link to="/citizen/raise-grievance" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Raise New Grievance
        </Link>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <StatCard
          title="Total Filed"
          value={totalCount}
          subtitle="All complaints"
          iconColor="blue"
          icon={
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
        <StatCard
          title="In Investigation"
          value={openCount}
          variant="accent"
          subtitle="Active cases"
          iconColor="amber"
          icon={
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          variant="success"
          subtitle={`${totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}% resolution rate`}
          iconColor="green"
          icon={
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Error alert if backend call fails */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* ── Loading Spinner ── */}
      {loading ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Loading Grievances...</div>
          <p style={{ fontSize: '0.875rem' }}>Fetching your records from the Grievance Cell...</p>
        </div>
      ) : grievances.length === 0 ? (
        /* ── Empty State ── */
        <div className="card" style={{ padding: 'var(--space-3xl) var(--space-xl)', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--navy-50)',
              color: 'var(--navy-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-md)',
            }}
          >
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>
            No Grievances Filed
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto var(--space-lg)' }}>
            Have an issue with an application delay, rejection, or government officer? Raise a formal complaint to the Grievance Cell.
          </p>
          <Link to="/citizen/raise-grievance" className="btn btn-primary">
            File Your First Grievance →
          </Link>
        </div>
      ) : (
        /* ── Master-Detail 2-Column Grid ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
          {/* Left Column: Filter tabs + Cards List */}
          <div>
            {/* Live Search Bar */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Search by ID, subject, officer..."
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'open', label: 'Open' },
                { key: 'resolved', label: 'Resolved' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {filteredGrievances.length === 0 ? (
                <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {searchQuery ? (
                    <>
                      <p style={{ margin: '0 0 8px 0' }}>No grievances match &ldquo;{searchQuery}&rdquo;</p>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    `No ${filter} grievances found.`
                  )}
                </div>
              ) : (
                filteredGrievances.map((g) => {
                  const isSelected = g.id === selectedId;
                  const priorityColor =
                    g.priority?.toLowerCase() === 'urgent'
                      ? 'var(--red-600)'
                      : g.priority?.toLowerCase() === 'high'
                      ? 'var(--red-500)'
                      : 'var(--amber-500)';

                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedId(g.id)}
                      style={{
                        background: isSelected ? 'var(--navy-50)' : 'var(--color-surface)',
                        border: `1.5px solid ${isSelected ? 'var(--navy-600)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-md) var(--space-lg)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 2px var(--navy-100)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-600)' }}>
                          {g.id}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {formatDate(g.filedDate || g.createdAt)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px', lineHeight: 1.3 }}>
                        {g.subject || g.title || 'Grievance Complaint'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: priorityColor,
                              display: 'inline-block',
                            }}
                          />
                          {(g.priority || 'Normal').toUpperCase()}
                        </div>
                        <StatusBadge status={g.status || 'open'} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detail Inspector Card */}
          {selectedGrv ? (
            <div className="card" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              {/* Card Header */}
              <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy-700)' }}>
                    {selectedGrv.id}
                  </span>
                  <StatusBadge status={selectedGrv.status || 'open'} />
                  <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {selectedGrv.priority || 'Normal'} Priority
                  </span>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 6px 0' }}>
                  {selectedGrv.subject || selectedGrv.title}
                </h3>

                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Category: <strong>{CATEGORY_LABELS[selectedGrv.category] || selectedGrv.category || 'General'}</strong>
                </div>

                {/* Metadata Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 'var(--space-md)',
                    marginTop: 'var(--space-lg)',
                    paddingTop: 'var(--space-md)',
                    borderTop: '1px solid var(--slate-100)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      Filed On
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.875rem' }}>
                      {formatDate(selectedGrv.filedDate || selectedGrv.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      Grievance Officer
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.875rem' }}>
                      {selectedGrv.officerName || 'Under Assignment'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      Related Application
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-600)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
                      {selectedGrv.relatedAppId || selectedGrv.applicationId || 'None'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen's Complaint Body */}
              <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Your Complaint Statement
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-800)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {selectedGrv.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Conditional Resolution Section (Only shown when resolved, overruled, or rejected) */}
              {(selectedGrv.status === 'resolved' ||
                selectedGrv.status === 'escalated-resolved' ||
                selectedGrv.status === 'rejected' ||
                selectedGrv.resolutionNote ||
                selectedGrv.remarks) && (
                <div
                  style={{
                    padding: 'var(--space-lg)',
                    background: selectedGrv.status === 'rejected' ? 'var(--red-50)' : 'var(--green-50)',
                    borderTop: `1px solid ${selectedGrv.status === 'rejected' ? 'var(--red-200)' : 'var(--green-200)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: selectedGrv.status === 'rejected' ? 'var(--red-800)' : 'var(--green-800)',
                      }}
                    >
                      Official Resolution Decision
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(selectedGrv.resolvedDate || selectedGrv.updatedAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-800)', lineHeight: 1.6, margin: 0 }}>
                    {selectedGrv.resolutionNote || selectedGrv.remarks || 'The grievance has been reviewed and closed by the Grievance Officer.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Select a grievance from the left to view full dispute details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
