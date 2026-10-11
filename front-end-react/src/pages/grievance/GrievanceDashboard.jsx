// src/pages/grievance/GrievanceDashboard.jsx
// React concepts used: Components, Props (prop drilling to queue table), State (useState),
// Events (onClick for retry), Lists (KPI stat cards), Hooks (useState, useEffect), API calls (apiGetGrievances)
// Grievance Officer dashboard presenting KPI summary cards and the grievance queue table.

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiGetGrievances } from '../../api/grievanceApi';
import StatCard from '../../components/common/StatCard';
import GrievanceQueueTable from '../../components/grievance/GrievanceQueueTable';

export default function GrievanceDashboard() {
  const location = useLocation();

  // [State] Data management, loading, and error handling
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // [Callback] Fetch grievances from backend API
  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetGrievances(1, 100);
      if (res && Array.isArray(res.data)) {
        setGrievances(res.data);
      } else if (Array.isArray(res)) {
        setGrievances(res);
      } else {
        setGrievances([]);
      }
    } catch (err) {
      setGrievances([]);
      setError(err.message || 'Failed to load grievance data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // [Hooks / useEffect] Fetch on initial component mount
  useEffect(() => {
    fetchGrievances();
  }, []);

  // [Hooks / useEffect] Scroll to queue target or top depending on URL hash
  useEffect(() => {
    if (location.hash === '#queue' || location.hash === '#grievance-queue') {
      const scrollToQueue = () => {
        const el = document.getElementById('queue') || document.getElementById('grievance-queue');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      };
      const timer = setTimeout(scrollToQueue, 50);
      return () => clearTimeout(timer);
    } else if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash, location.pathname, loading]);

  // [State / Derived Calculations] Calculate KPI metrics from fetched grievance records
  const escalatedCount = grievances.filter((g) => {
    const s = (g.status || '').toLowerCase().replace(/_/g, '-');
    return s === 'escalated';
  }).length;

  const inInvestigationCount = grievances.filter((g) => {
    const s = (g.status || '').toLowerCase().replace(/_/g, '-');
    return s === 'open' || s === 'investigating' || s === 'under-review' || s === 'in-progress' || s === 'submitted';
  }).length;

  const resolvedCount = grievances.filter((g) => {
    const s = (g.status || '').toLowerCase().replace(/_/g, '-');
    return s === 'resolved' || s === 'completed' || s === 'escalated-resolved';
  }).length;

  return (
    <div className="grievance-dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
              Department Grievance Cell
            </h1>
            <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Review, investigate, and resolve citizen appeals and dispute escalations.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing...' : 'Refresh Queue'}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metrics Strip (3 Required KPI Cards) ── */}
      <div className="stats-grid">
        {/* KPI 1: Escalated Cases */}
        <StatCard
          title="Escalated Cases"
          value={loading ? '...' : escalatedCount}
          subtitle="Requires supervisory intervention"
          variant="danger"
          iconColor="purple"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />

        {/* KPI 2: In Investigation */}
        <StatCard
          title="In Investigation"
          value={loading ? '...' : inInvestigationCount}
          subtitle="Active grievances under review"
          variant="accent"
          iconColor="amber"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        {/* KPI 3: Resolved */}
        <StatCard
          title="Resolved"
          value={loading ? '...' : resolvedCount}
          subtitle="Appeals addressed &amp; closed"
          variant="success"
          iconColor="green"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── Error Notification ── */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
            </svg>
            <span>{error}</span>
          </div>
          <button type="button" className="btn btn-sm btn-outline" onClick={fetchGrievances} style={{ borderColor: 'var(--red-400)', color: 'var(--red-700)' }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Loading Spinner State ── */}
      {loading && grievances.length === 0 && (
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--navy-900)' }}>
            Loading grievance queue...
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Retrieving ticket status and SLA tracking records.
          </p>
        </div>
      )}

      {/* ── Grievance Queue Section ── */}
      <section id="queue" style={{ scrollMarginTop: '24px' }}>
        {(!loading || grievances.length > 0) && (
          <GrievanceQueueTable grievances={grievances} />
        )}
      </section>
    </div>
  );
}
