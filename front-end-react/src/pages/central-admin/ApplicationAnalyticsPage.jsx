// src/pages/central-admin/ApplicationAnalyticsPage.jsx
// National Application Velocity & SLA Analytics for Central Administrator
// React concepts: useState, useEffect, useMemo, Link, StatCard, TrendChart, BarChart

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import TrendChart from '../../components/common/charts/TrendChart';
import BarChart from '../../components/common/charts/BarChart';
import {
  getNationalAnalyticsData,
  formatNum,
} from '../../api/nationalAnalyticsService';

const STATE_COLORS = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#ca8a04', // Amber
  '#7c3aed', // Purple
  '#0284c7', // Sky Blue
  '#ea580c', // Orange
  '#db2777', // Pink
  '#475569', // Slate
];

export default function ApplicationAnalyticsPage() {
  const [velocityPeriod, setVelocityPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [nationalData, setNationalData] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getNationalAnalyticsData();
        setNationalData(data);
      } catch (err) {
        console.error('Failed to load application analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const states = nationalData?.states || [];
  const totalApplications = nationalData?.totalApplications || 26430;
  const completed = nationalData?.completed || 18600;
  const pending = nationalData?.pending || 4260;
  const inProgress = nationalData?.inProgress || 3345;
  const slaCompliance = nationalData?.slaComplianceRate || 95.4;

  const completionRate =
    totalApplications > 0 ? ((completed / totalApplications) * 100).toFixed(1) : '0.0';

  // 1. National Velocity Trend Points (Monthly / Weekly)
  const velocityTrendPoints = useMemo(() => {
    const series = nationalData?.trends?.[velocityPeriod] || [];
    return series.map((t) => ({
      label: t.label,
      value: t.apps,
    }));
  }, [nationalData, velocityPeriod]);

  // 2. Top States by Volume Bar Chart Data
  const topStatesBarData = useMemo(() => {
    const sorted = [...states].sort((a, b) => b.applications - a.applications).slice(0, 8);
    return sorted.map((s, idx) => ({
      label: s.code || s.name,
      value: s.applications,
      color: STATE_COLORS[idx % STATE_COLORS.length],
      sublabel: s.name,
    }));
  }, [states]);

  return (
    <div className="application-analytics-page" style={{ padding: '4px 0 32px 0' }}>
      {/* Back Link & Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/central-admin/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--navy-600, #2563eb)',
            textDecoration: 'none',
            marginBottom: '8px',
          }}
        >
          ← Back to National Dashboard
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
          National Application Analytics
        </h1>
        <p style={{ color: 'var(--slate-500, #64748b)', fontSize: '0.875rem', marginTop: '4px' }}>
          Lifecycle velocity, SLA turnaround, completion rates and state-by-state throughput across the DigiConnect federation.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          title="Total Submissions"
          value={formatNum(totalApplications)}
          subtitle="Across federated state portals"
          icon="📋"
          iconColor="blue"
        />
        <StatCard
          title="Completed & Issued"
          value={formatNum(completed)}
          subtitle={`${completionRate}% national completion rate`}
          icon="✅"
          iconColor="green"
        />
        <StatCard
          title="In Verification Queue"
          value={formatNum(pending + inProgress)}
          subtitle="Pending department review"
          icon="⏳"
          iconColor="amber"
        />
        <StatCard
          title="National SLA Compliance"
          value={`${slaCompliance}%`}
          subtitle="National target threshold: >90.0%"
          icon="⏱️"
          iconColor="purple"
        />
      </div>

      {/* Charts Grid: National Velocity Trend + Top States by Volume */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Left Chart: National Velocity Trend */}
        <div
          className="card"
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
                National Velocity Trend
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                Application submission throughput over time
              </div>
            </div>

            <div
              className="filter-pill-group"
              style={{
                display: 'inline-flex',
                background: 'var(--slate-100, #f1f5f9)',
                padding: '2px',
                borderRadius: '6px',
                gap: '2px',
              }}
            >
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'daily', label: 'Daily' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  className={`filter-pill ${velocityPeriod === btn.id ? 'active' : ''}`}
                  onClick={() => setVelocityPeriod(btn.id)}
                  style={{
                    border: 'none',
                    background: velocityPeriod === btn.id ? '#ffffff' : 'transparent',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: velocityPeriod === btn.id ? 'var(--navy-900, #0f172a)' : 'var(--slate-600, #475569)',
                    boxShadow: velocityPeriod === btn.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <TrendChart
            points={velocityTrendPoints}
            height={220}
            lineColor="#2563eb"
            fillColor="rgba(37, 99, 235, 0.08)"
            formatValue={formatNum}
          />
        </div>

        {/* Right Chart: Top States by Volume Bar Chart */}
        <div
          className="card"
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
                Top States by Application Volume
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                State-by-state submission volume rankings
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#eff6ff',
                color: '#1e40af',
              }}
            >
              Volume Leaders
            </span>
          </div>

          <BarChart
            data={topStatesBarData}
            height={220}
            formatValue={formatNum}
          />
        </div>
      </div>

      {/* State-by-State Throughput Table */}
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
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-200, #e2e8f0)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
            State-by-State Application Lifecycle
          </h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
            Comparative processing lifecycle, SLA adherence, and rejected application ratios
          </div>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50, #f8fafc)', borderBottom: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>State</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Total Applications</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Completed</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>In Progress</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Pending</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Rejected</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Queries</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Resolution Rate</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {states.map((st) => {
                const total = st.applications || 0;
                const comp = st.completed || 0;
                const inProg = st.inProgress || 0;
                const pend = st.pending || 0;
                const rej = st.rejected || 0;
                const queries = st.query || 0;
                const resRate = total > 0 ? Math.round((comp / total) * 100) : 0;

                return (
                  <tr key={st.id || st.code} style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy-900, #0f172a)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{formatNum(total)}</td>
                    <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>
                      {formatNum(comp)} ({resRate}%)
                    </td>
                    <td style={{ padding: '12px 16px', color: '#2563eb', fontWeight: 600 }}>{formatNum(inProg)}</td>
                    <td style={{ padding: '12px 16px', color: '#d97706', fontWeight: 600 }}>{formatNum(pend)}</td>
                    <td style={{ padding: '12px 16px', color: '#dc2626', fontWeight: 600 }}>{formatNum(rej)}</td>
                    <td style={{ padding: '12px 16px', color: '#7c3aed', fontWeight: 600 }}>{formatNum(queries)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: resRate >= 70 ? '#f0fdf4' : '#fefce8',
                          color: resRate >= 70 ? '#166534' : '#854d0e',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {resRate}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link
                        to={`/central-admin/states/${st.id || st.code}`}
                        className="btn btn-ghost btn-sm"
                        style={{ fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        Inspect State →
                      </Link>
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
