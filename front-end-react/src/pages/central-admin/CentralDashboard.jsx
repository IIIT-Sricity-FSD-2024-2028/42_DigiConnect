// src/pages/central-admin/CentralDashboard.jsx
// Executive National Dashboard for Central Administrator (Super User)
// React concepts: useState, useEffect, Props, Components & Charts reuse, API integration

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import TrendChart from '../../components/common/charts/TrendChart';
import {
  getNationalAnalyticsData,
  getMetricsForPeriod,
  formatINR,
  formatNum,
  formatCompactNum,
} from '../../api/nationalAnalyticsService';

export default function CentralDashboard() {
  const [period, setPeriod] = useState('month');
  const [appTrendPeriod, setAppTrendPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [nationalData, setNationalData] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getNationalAnalyticsData();
        setNationalData(data);
      } catch (err) {
        console.error('Failed to load national data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const baseData = nationalData || {
    totalStates: 4,
    activeStates: 4,
    inactiveStates: 0,
    totalCitizens: 124800,
    totalApplications: 26430,
    totalRevenue: 1320000,
    totalPlatformFees: 132000,
    slaComplianceRate: 95.4,
    completed: 18600,
    inProgress: 3345,
    pending: 4260,
    rejected: 1830,
    queryRaised: 740,
    states: [],
    trends: {},
  };

  const metrics = getMetricsForPeriod(period, baseData) || baseData;

  const states = metrics.states || [];

  const trendPoints = (metrics.trends?.[appTrendPeriod] || []).map((t) => ({
    label: t.label,
    value: t.apps,
  }));

  const totalAppSum =
    (metrics.completed || 0) +
    (metrics.inProgress || 0) +
    (metrics.pending || 0) +
    (metrics.rejected || 0) +
    (metrics.queryRaised || 0) ||
    metrics.totalApplications ||
    1;

  const getPercent = (val) => Math.round(((val || 0) / totalAppSum) * 100);

  return (
    <div className="central-dashboard-page" style={{ padding: '4px 0 32px 0' }}>
      {/* 1. Header & Time Filter */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)' }}>
            National Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--slate-500, #64748b)', fontSize: '0.875rem' }}>
            National overview, federation health, and performance of the DigiConnect digital governance platform.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            className="filter-pill-group"
            style={{
              display: 'inline-flex',
              background: 'var(--slate-100, #f1f5f9)',
              padding: '3px',
              borderRadius: 'var(--radius-md, 8px)',
              gap: '2px',
            }}
          >
            {['today', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                type="button"
                className={`filter-pill ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
                style={{
                  border: 'none',
                  background: period === p ? '#ffffff' : 'transparent',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: period === p ? 'var(--navy-900, #0f172a)' : 'var(--slate-600, #475569)',
                  boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : 'Today'}
              </button>
            ))}
          </div>

          <Link
            to="/central-admin/manage-states"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🏛️</span> Manage States
          </Link>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          title="Total States"
          value={metrics.totalStates}
          subtitle={`Active: ${metrics.activeStates} / Inactive: ${metrics.inactiveStates || 0}`}
          icon="🏛️"
          iconColor="blue"
        />
        <StatCard
          title="Total Citizens"
          value={formatCompactNum(metrics.totalCitizens)}
          subtitle={`${formatNum(metrics.totalCitizens)} registered nationwide`}
          icon="👥"
          iconColor="blue"
        />
        <StatCard
          title="Total Applications"
          value={formatCompactNum(metrics.totalApplications)}
          subtitle={`${metrics.periodLabel || 'This Month'} • SLA ${metrics.slaComplianceRate}%`}
          icon="📋"
          iconColor="amber"
        />
        <StatCard
          title="National Revenue"
          value={formatINR(metrics.totalRevenue, true)}
          subtitle={`${metrics.periodLabel || 'This Month'} (${formatINR(metrics.totalRevenue)})`}
          icon="💰"
          iconColor="green"
        />
        <StatCard
          title="Platform Share (10%)"
          value={formatINR(metrics.totalPlatformFees || metrics.totalRevenue * 0.1, true)}
          subtitle={`Retention (${formatINR(metrics.totalPlatformFees || metrics.totalRevenue * 0.1)})`}
          icon="⚡"
          iconColor="purple"
        />
      </div>

      {/* 3. National Application Lifecycle Status Breakdown */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--slate-200, #e2e8f0)',
          padding: '20px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              National Application Status Breakdown
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Real-time lifecycle distribution across all federated state service applications
            </div>
          </div>
          <Link
            to="/central-admin/analytics/applications"
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 700, color: 'var(--navy-600, #2563eb)' }}
          >
            View Detailed Velocity →
          </Link>
        </div>

        {/* Multi-segment status progress bar */}
        <div
          style={{
            display: 'flex',
            height: '14px',
            borderRadius: '7px',
            overflow: 'hidden',
            background: 'var(--slate-100, #f1f5f9)',
            marginBottom: '20px',
          }}
        >
          <div
            title={`Completed: ${formatNum(metrics.completed)} (${getPercent(metrics.completed)}%)`}
            style={{ width: `${getPercent(metrics.completed)}%`, background: '#16a34a', transition: 'width 0.3s ease' }}
          />
          <div
            title={`In Progress: ${formatNum(metrics.inProgress)} (${getPercent(metrics.inProgress)}%)`}
            style={{ width: `${getPercent(metrics.inProgress)}%`, background: '#2563eb', transition: 'width 0.3s ease' }}
          />
          <div
            title={`Pending: ${formatNum(metrics.pending)} (${getPercent(metrics.pending)}%)`}
            style={{ width: `${getPercent(metrics.pending)}%`, background: '#f59e0b', transition: 'width 0.3s ease' }}
          />
          <div
            title={`Rejected: ${formatNum(metrics.rejected)} (${getPercent(metrics.rejected)}%)`}
            style={{ width: `${getPercent(metrics.rejected)}%`, background: '#dc2626', transition: 'width 0.3s ease' }}
          />
          <div
            title={`Query Raised: ${formatNum(metrics.queryRaised)} (${getPercent(metrics.queryRaised)}%)`}
            style={{ width: `${getPercent(metrics.queryRaised)}%`, background: '#8b5cf6', transition: 'width 0.3s ease' }}
          />
        </div>

        {/* Status Chips Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>● Completed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }} title={formatNum(metrics.completed)}>
              {formatCompactNum(metrics.completed)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d' }}>{formatNum(metrics.completed)} ({getPercent(metrics.completed)}%)</div>
          </div>

          <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>● In Progress</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }} title={formatNum(metrics.inProgress)}>
              {formatCompactNum(metrics.inProgress)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>{formatNum(metrics.inProgress)} ({getPercent(metrics.inProgress)}%)</div>
          </div>

          <div style={{ padding: '12px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e' }}>● Pending Review</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }} title={formatNum(metrics.pending)}>
              {formatCompactNum(metrics.pending)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#b45309' }}>{formatNum(metrics.pending)} ({getPercent(metrics.pending)}%)</div>
          </div>

          <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>● Rejected</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }} title={formatNum(metrics.rejected)}>
              {formatCompactNum(metrics.rejected)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{formatNum(metrics.rejected)} ({getPercent(metrics.rejected)}%)</div>
          </div>

          <div style={{ padding: '12px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5b21b6' }}>● Query Raised</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }} title={formatNum(metrics.queryRaised)}>
              {formatCompactNum(metrics.queryRaised)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6d28d9' }}>{formatNum(metrics.queryRaised)} ({getPercent(metrics.queryRaised)}%)</div>
          </div>
        </div>
      </div>

      {/* 4. Application Volume Velocity Trend Chart */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--slate-200, #e2e8f0)',
          padding: '20px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              📈 National Application Submission Velocity
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Volume trend curve across time horizons
            </div>
          </div>

          <div
            className="filter-pill-group"
            style={{
              display: 'inline-flex',
              background: 'var(--slate-100, #f1f5f9)',
              padding: '3px',
              borderRadius: '6px',
              gap: '2px',
            }}
          >
            {['daily', 'weekly', 'monthly', 'yearly'].map((tp) => (
              <button
                key={tp}
                type="button"
                className={`filter-pill ${appTrendPeriod === tp ? 'active' : ''}`}
                onClick={() => setAppTrendPeriod(tp)}
                style={{
                  border: 'none',
                  background: appTrendPeriod === tp ? '#ffffff' : 'transparent',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: appTrendPeriod === tp ? 'var(--navy-900, #0f172a)' : 'var(--slate-600, #475569)',
                  boxShadow: appTrendPeriod === tp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        <TrendChart
          points={trendPoints}
          height={200}
          lineColor="#2563eb"
          fillColor="rgba(37, 99, 235, 0.08)"
          formatValue={formatNum}
        />
      </div>

      {/* 5. State-Wise Revenue & Fiscal Performance Table */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--slate-200, #e2e8f0)',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--slate-200, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              State-Wise Revenue Collection
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Fiscal generation, department entitlement (90%), and central platform fee share (10%)
            </div>
          </div>
          <Link
            to="/central-admin/analytics/revenue"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Inspect Detailed Revenue Analysis →
          </Link>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50, #f8fafc)', borderBottom: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>State</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Applications</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Dept. Share (90%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Platform Fee (10%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Total Revenue</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)', textAlign: 'right' }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {states.map((st) => {
                const total = st.revenue || st.totalRevenue || 0;
                const deptShare = st.serviceFee !== undefined ? st.serviceFee : Math.round(total * 0.9);
                const platformFee = st.platformFee !== undefined ? st.platformFee : Math.round(total * 0.1);
                const sharePercent = st.revenueShare || (metrics.totalRevenue > 0 ? ((total / metrics.totalRevenue) * 100).toFixed(1) : 0);

                return (
                  <tr key={st.id || st.code} style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy-900, #0f172a)' }}>
                      <Link
                        to={`/central-admin/states/${st.id || st.code}`}
                        style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>🏛️</span>
                        <span>{st.name}</span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            background: 'var(--slate-100, #f1f5f9)',
                            color: 'var(--slate-700, #334155)',
                            borderRadius: '4px',
                          }}
                        >
                          {st.code}
                        </span>
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      <span title={formatNum(st.applications || st.totalApplications || 0)}>
                        {formatCompactNum(st.applications || st.totalApplications || 0)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#16a34a' }}>
                      <span title={formatINR(deptShare)}>
                        {formatINR(deptShare, true)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb' }}>
                      <span title={formatINR(platformFee)}>
                        {formatINR(platformFee, true)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--navy-900, #0f172a)' }}>
                      <span title={formatINR(total)}>
                        {formatINR(total, true)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          padding: '3px 8px',
                          background: 'var(--slate-100, #f1f5f9)',
                          color: 'var(--navy-800, #1e293b)',
                          borderRadius: '12px',
                        }}
                      >
                        {sharePercent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
