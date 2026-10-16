// src/pages/department-head/DeptDashboard.jsx
// Department Head Executive Dashboard
// Reference: front-end/department-head/dashboard.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Events (onClick),
// Lists (map), Context (useAuth), Router (useNavigate, Link), API calls (apiGetDeptAnalytics, apiGetDeptServices)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetDeptAnalytics, apiGetDeptServices } from '../../api/departmentHeadApi';
import StatCard from '../../components/common/StatCard';
// import StatusBadge from '../../components/common/StatusBadge';

export default function DeptDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const departmentId = user?.departmentId || '';
  const departmentName = user?.dept || 'Department';
  const officerName = user?.name || 'Department Head';
  const officerTitle = user?.title || 'Head of Department';

  // ── States ──
  const [stats, setStats] = useState({
    activeServices: 0,
    totalServices: 0,
    totalDesignations: 0,
    totalOfficers: 0,
    totalApplications: 0,
    totalRevenue: 0,
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Hook: Fetch Data on Component Mount ──
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      setError('');

      try {
        // Parallel API calls for analytics and services
        const [analyticsRes, servicesRes] = await Promise.all([
          apiGetDeptAnalytics(departmentId).catch(() => ({ data: {} })),
          apiGetDeptServices(departmentId).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        if (analyticsRes?.data) {
          setStats((prev) => ({
            ...prev,
            ...analyticsRes.data,
          }));
        }

        const sList = servicesRes?.data || [];
        setServices(sList);
        if (sList.length > 0 && !analyticsRes?.data?.activeServices) {
          setStats((prev) => ({ ...prev, activeServices: sList.length, totalServices: sList.length }));
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load department dashboard data:', err);
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [departmentId]);

  return (
    <div className="dept-dashboard">
      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <div>
          <h1 className="page-title">{departmentName} Dashboard</h1>
          <p className="page-subtitle">
            {officerName} · {officerTitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/department-head/services')}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Services Catalog
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/department-head/service-builder')}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            + Create Dynamic Service
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* ── Stats Grid (5 StatCards matching dashboard.html) ── */}
      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <StatCard
          title="Active Services"
          value={stats.activeServices ?? stats.totalServices ?? services.length}
          icon={<span>📑</span>}
          iconColor="blue"
        />
        <StatCard
          title="Role Designations"
          value={stats.totalDesignations ?? 0}
          icon={<span>👔</span>}
          iconColor="green"
        />
        <StatCard
          title="Onboarded Officers"
          value={stats.totalOfficers ?? 0}
          icon={<span>👮</span>}
          iconColor="amber"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications ?? 0}
          icon={<span>📋</span>}
          iconColor="purple"
        />
        <div
          onClick={() => navigate('/department-head/revenue')}
          style={{ cursor: 'pointer' }}
          title="Click to view department financial ledger"
        >
          <StatCard
            title="Revenue Realized"
            value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
            subtitle="Statutory fees collected"
            variant="accent"
            icon={<span>💰</span>}
            iconColor="purple"
          />
        </div>
      </div>

      {/* ── Department Functional Pillars (4 Clickable Cards matching dashboard.html) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {/* Pillar 1: Designations Management */}
        <div
          className="card"
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onClick={() => navigate('/department-head/designations')}
        >
          <div className="card-header">
            <span className="card-title">👔 Designations Management</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: 'var(--space-md)' }}>
              Manage department designations (VRO, MRO, Tahsildar, Revenue Inspector). Designations represent operational job roles, avoiding numeric officer levels.
            </p>
            <button type="button" className="btn btn-outline btn-sm">
              Configure Designations →
            </button>
          </div>
        </div>

        {/* Pillar 2: Dynamic Service & Workflow Builder */}
        <div
          className="card"
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onClick={() => navigate('/department-head/service-builder')}
        >
          <div className="card-header">
            <span className="card-title">⚙️ Dynamic Service &amp; Workflow Builder</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: 'var(--space-md)' }}>
              Configure custom form fields (TEXT, NUMBER, DATE, SELECT), document proofs, fees (Service + Platform), Terms &amp; Conditions, and multi-step officer sequences.
            </p>
            <button type="button" className="btn btn-outline btn-sm">
              Launch Service Builder →
            </button>
          </div>
        </div>

        {/* Pillar 3: Officer Onboarding & Node Scoping */}
        <div
          className="card"
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onClick={() => navigate('/department-head/officers')}
        >
          <div className="card-header">
            <span className="card-title">📍 Officer Onboarding &amp; Node Scoping</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: 'var(--space-md)' }}>
              Onboard field officers by assigning their exact designation and binding them directly to a jurisdiction node (Village, Mandal, or District).
            </p>
            <button type="button" className="btn btn-outline btn-sm">
              Onboard Officers →
            </button>
          </div>
        </div>

        {/* Pillar 4: Financials & Revenue */}
        <div
          className="card"
          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onClick={() => navigate('/department-head/revenue')}
        >
          <div className="card-header">
            <span className="card-title">💰 Financials &amp; Revenue</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: 'var(--space-md)' }}>
              Inspect departmental revenue receipts, statutory service fees, e-Governance platform fee shares, and individual citizen payment transaction ledgers.
            </p>
            <button type="button" className="btn btn-outline btn-sm">
              View Revenue Collections →
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Configured Services Table ── */}
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span className="card-title">Configured Department Services</span>
          <Link to="/department-head/services" className="btn btn-ghost btn-sm">
            View All Services →
          </Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Fee (Service + Platform)</th>
                  <th>Workflow Sequence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      Loading configured department services...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      No services configured yet for this department.{' '}
                      <Link to="/department-head/service-builder" style={{ color: 'var(--navy-600)', fontWeight: 600 }}>
                        Create one now →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  services.map((s) => {
                    const sFee = s.serviceFee !== undefined ? s.serviceFee : (s.fee || 0);
                    const pFee = s.platformFee !== undefined ? s.platformFee : (sFee > 0 ? Math.round(sFee * 0.15) : 0);
                    const totFee = s.totalFee !== undefined ? s.totalFee : (sFee + pFee);

                    let workflowSummary = s.workflowSummary || '';
                    if (!workflowSummary && Array.isArray(s.workflowSteps) && s.workflowSteps.length > 0) {
                      workflowSummary = s.workflowSteps
                        .map((step) => step.stepName || step.requiredDesignationId?.replace('desig_', '').toUpperCase())
                        .join(' ➔ ');
                    }
                    if (!workflowSummary) workflowSummary = 'Standard Multi-Stage Verification';

                    return (
                      <tr key={s.id || s.code}>
                        <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                          📜 {s.name}
                          <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--slate-500)', marginTop: '2px' }}>
                            {s.description || 'Statutory citizen delivery service.'}
                          </div>
                        </td>
                        <td>
                          <strong>₹{totFee}</strong>{' '}
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            (₹{sFee} + ₹{pFee})
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem', whiteSpace: 'normal', lineHeight: '1.4' }}>
                            {workflowSummary}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <Link
                              to={`/department-head/service-builder?id=${s.id}`}
                              className="btn btn-ghost btn-sm"
                            >
                              Edit Config
                            </Link>
                            <Link
                              to="/department-head/services"
                              className="btn btn-outline btn-sm"
                            >
                              Catalog
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
