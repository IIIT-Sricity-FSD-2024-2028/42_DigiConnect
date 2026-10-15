// src/pages/central-admin/RevenueAnalysisPage.jsx
// Detailed National Fiscal & Revenue Analytics for Central Administrator
// React concepts: useState, useEffect, useMemo, Link, StatCard, BarChart, DonutChart, TrendChart

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import BarChart from '../../components/common/charts/BarChart';
import DonutChart from '../../components/common/charts/DonutChart';
import TrendChart from '../../components/common/charts/TrendChart';
import {
  getNationalAnalyticsData,
  getMetricsForPeriod,
  formatINR,
  formatNum,
  formatCompactNum,
} from '../../api/nationalAnalyticsService';

const STATE_COLORS = [
  '#2563eb', // Royal Blue
  '#16a34a', // Emerald Green
  '#ca8a04', // Amber
  '#7c3aed', // Purple
  '#0284c7', // Sky Blue
  '#db2777', // Rose Pink
  '#ea580c', // Orange
  '#475569', // Slate
];

export default function RevenueAnalysisPage() {
  const [period, setPeriod] = useState('month');
  const [revTrendPeriod, setRevTrendPeriod] = useState('monthly');
  const [barChartFilter, setBarChartFilter] = useState('top5');
  const [compareMetric, setCompareMetric] = useState('revenue');
  const [selectedStateCodes, setSelectedStateCodes] = useState(['AP', 'KA', 'TN', 'KL']);
  const [stateToAdd, setStateToAdd] = useState('');
  const [tableLimit, setTableLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [nationalData, setNationalData] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getNationalAnalyticsData();
        setNationalData(data);
      } catch (err) {
        console.error('Failed to load national analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const baseData = nationalData || {
    totalRevenue: 0,
    totalPlatformFees: 0,
    totalServiceFees: 0,
    totalApplications: 0,
    avgRevPerApp: 0,
    states: [],
    trends: {},
  };

  const periodMetrics = getMetricsForPeriod(period, baseData) || baseData;

  const multiplier = baseData.totalRevenue > 0
    ? periodMetrics.totalRevenue / baseData.totalRevenue
    : 1;

  const allStates = useMemo(() => {
    return (baseData.states || []).map((s) => {
      const stateRev = Math.round((s.revenue || 0) * multiplier);
      const statePlat = Math.round(stateRev * 0.1);
      const stateServ = Math.max(0, stateRev - statePlat);
      const stateApps = Math.round((s.applications || 0) * multiplier);
      const share = periodMetrics.totalRevenue > 0
        ? ((stateRev / periodMetrics.totalRevenue) * 100).toFixed(1)
        : s.revenueShare || '0.0';

      return {
        ...s,
        revenue: stateRev,
        platformFee: statePlat,
        serviceFee: stateServ,
        applications: stateApps,
        revenueShare: share,
      };
    });
  }, [baseData.states, multiplier, periodMetrics.totalRevenue]);

  const totalRevenue = periodMetrics.totalRevenue || 0;
  const platformFee = periodMetrics.totalPlatformFees || 0;
  const serviceFee = periodMetrics.totalServiceFees || 0;
  const totalApplications = periodMetrics.totalApplications || 0;
  const avgFee = totalApplications > 0 ? Math.round(totalRevenue / totalApplications) : 0;

  const highestState = allStates[0] || {
    name: 'N/A',
    revenue: 0,
    revenueShare: '0.0',
  };

  // 1. Bar Chart Data (Top 5, Top 10, Bottom 5, All States)
  const barChartData = useMemo(() => {
    let filtered = [...allStates];
    if (barChartFilter === 'top5') filtered = filtered.slice(0, 5);
    else if (barChartFilter === 'top10') filtered = filtered.slice(0, 10);
    else if (barChartFilter === 'bottom5') filtered = filtered.slice(-5).reverse();

    return filtered.map((s, idx) => ({
      label: s.code || s.name,
      value: s.revenue,
      color: STATE_COLORS[idx % STATE_COLORS.length],
      sublabel: s.name,
    }));
  }, [allStates, barChartFilter]);

  // 2. Donut Chart Data
  const donutChartData = useMemo(() => {
    return allStates.map((s, idx) => ({
      label: s.name,
      value: s.revenue,
      color: STATE_COLORS[idx % STATE_COLORS.length],
      formattedValue: formatINR(s.revenue),
    }));
  }, [allStates]);

  // 3. Trend Chart Data (Monthly, Weekly, Daily, Yearly)
  const trendPoints = useMemo(() => {
    const series = nationalData?.trends?.[revTrendPeriod] || [];
    return series.map((t) => ({
      label: t.label,
      value: t.revenue,
    }));
  }, [nationalData, revTrendPeriod]);

  // 4. Comparison Chart Data
  const comparedStates = useMemo(() => {
    return allStates.filter((s) => selectedStateCodes.includes(s.code));
  }, [allStates, selectedStateCodes]);

  const comparisonChartData = useMemo(() => {
    return comparedStates.map((s, idx) => {
      let val = s.revenue;
      if (compareMetric === 'applications') val = s.applications;
      if (compareMetric === 'avgRevenue') val = s.applications > 0 ? Math.round(s.revenue / s.applications) : 0;

      return {
        label: s.code || s.name,
        value: val,
        color: STATE_COLORS[idx % STATE_COLORS.length],
      };
    });
  }, [comparedStates, compareMetric]);

  const handleRemoveCompareState = (code) => {
    setSelectedStateCodes((prev) => prev.filter((c) => c !== code));
  };

  const handleAddCompareState = () => {
    if (stateToAdd && !selectedStateCodes.includes(stateToAdd)) {
      setSelectedStateCodes((prev) => [...prev, stateToAdd]);
      setStateToAdd('');
    }
  };

  const availableStatesToAdd = allStates.filter((s) => !selectedStateCodes.includes(s.code));

  return (
    <div className="revenue-analysis-page" style={{ padding: '4px 0 32px 0' }}>
      {/* Back Link & Header */}
      <div
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
            National Revenue Analysis
          </h1>
          <p style={{ color: 'var(--slate-500, #64748b)', fontSize: '0.875rem', marginTop: '4px' }}>
            Detailed state-wise fiscal generation, revenue distribution, trends and comparative analytics.
          </p>
        </div>

        {/* Time selector pills */}
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
      </div>

      {/* 5 Summary KPI Cards */}
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
          title="Total Revenue"
          value={formatINR(totalRevenue, true)}
          subtitle={`Across federated state portals (${formatINR(totalRevenue)})`}
          icon="💰"
          iconColor="blue"
        />
        <StatCard
          title="Platform Fee (10%)"
          value={formatINR(platformFee, true)}
          subtitle={`Central infrastructure retention (${formatINR(platformFee)})`}
          icon="⚡"
          iconColor="purple"
        />
        <StatCard
          title="Service Fee (90%)"
          value={formatINR(serviceFee, true)}
          subtitle={`State department treasury share (${formatINR(serviceFee)})`}
          icon="🏛️"
          iconColor="green"
        />
        <StatCard
          title="Avg Fee / Application"
          value={formatINR(avgFee)}
          subtitle={`Across ${formatNum(totalApplications)} submissions`}
          icon="📊"
          iconColor="amber"
        />
        <StatCard
          title="Highest Revenue State"
          value={highestState.name}
          subtitle={`${formatINR(highestState.revenue, true)} (${highestState.revenueShare}% share)`}
          icon="🏆"
          iconColor="blue"
        />
      </div>

      {/* Row: Bar Chart & Donut Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* 1. Revenue by State Bar Chart */}
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
                Revenue by State
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>Gross revenue generated per state</div>
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
                { id: 'top5', label: 'Top 5' },
                { id: 'top10', label: 'Top 10' },
                { id: 'bottom5', label: 'Bottom 5' },
                { id: 'all', label: 'All States' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  className={`filter-pill ${barChartFilter === btn.id ? 'active' : ''}`}
                  onClick={() => setBarChartFilter(btn.id)}
                  style={{
                    border: 'none',
                    background: barChartFilter === btn.id ? '#ffffff' : 'transparent',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: barChartFilter === btn.id ? 'var(--navy-900, #0f172a)' : 'var(--slate-600, #475569)',
                    boxShadow: barChartFilter === btn.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <BarChart
            data={barChartData}
            height={260}
            formatValue={(v) => formatINR(v, true)}
          />
        </div>

        {/* 2. Revenue Distribution Donut Chart */}
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
                Revenue Distribution by State
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                Percentage contribution to total national revenue
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'var(--slate-100, #f1f5f9)',
                color: 'var(--slate-700, #334155)',
              }}
            >
              National Share
            </span>
          </div>

          <DonutChart
            data={donutChartData}
            size={220}
            holeSize={50}
            centerLabel="Revenue"
            centerSub="Share"
          />
        </div>
      </div>

      {/* 3. National Revenue Trend Chart */}
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
              📈 National Revenue Trend
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Revenue collection progression across time horizons
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
                className={`filter-pill ${revTrendPeriod === tp ? 'active' : ''}`}
                onClick={() => setRevTrendPeriod(tp)}
                style={{
                  border: 'none',
                  background: revTrendPeriod === tp ? '#ffffff' : 'transparent',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: revTrendPeriod === tp ? 'var(--navy-900, #0f172a)' : 'var(--slate-600, #475569)',
                  boxShadow: revTrendPeriod === tp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
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
          height={220}
          lineColor="#16a34a"
          fillColor="rgba(22, 163, 74, 0.08)"
          formatValue={(v) => formatINR(v, true)}
        />
      </div>

      {/* 4. Compare States Interactive Section */}
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
              Compare States
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Interactive cross-state benchmark & performance comparison
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600, #475569)' }}>Metric:</span>
            <select
              className="form-select"
              value={compareMetric}
              onChange={(e) => setCompareMetric(e.target.value)}
              style={{ width: 'auto', padding: '4px 12px', fontSize: '0.8125rem', fontWeight: 700 }}
            >
              <option value="revenue">Revenue (₹)</option>
              <option value="applications">Applications Count</option>
              <option value="avgRevenue">Average Revenue / Application</option>
            </select>
          </div>
        </div>

        {/* Selected State Tag Chips & Add Dropdown */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--slate-50, #f8fafc)',
            borderBottom: '1px solid var(--slate-200, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--navy-900, #0f172a)' }}>
            Selected States:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {selectedStateCodes.map((code) => {
              const st = allStates.find((s) => s.code === code);
              return (
                <span
                  key={code}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: '#eff6ff',
                    color: '#1e40af',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  🏛️ {st?.name || code}
                  {selectedStateCodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCompareState(code)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 700,
                        padding: 0,
                        marginLeft: '2px',
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>

          {availableStatesToAdd.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                className="form-select"
                value={stateToAdd}
                onChange={(e) => setStateToAdd(e.target.value)}
                style={{ width: '160px', padding: '4px 8px', fontSize: '0.8125rem' }}
              >
                <option value="">+ Select State...</option>
                {availableStatesToAdd.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddCompareState}
                disabled={!stateToAdd}
                style={{ fontSize: '0.75rem' }}
              >
                Add State
              </button>
            </div>
          )}
        </div>

        {/* State Comparison Bar Chart */}
        <div style={{ padding: '20px' }}>
          <BarChart
            data={comparisonChartData}
            height={220}
            formatValue={(v) => (compareMetric === 'revenue' ? formatINR(v, true) : formatNum(v))}
          />
        </div>

        {/* Comparison Table */}
        <div className="table-container" style={{ overflowX: 'auto', borderTop: '1px solid var(--slate-200, #e2e8f0)' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50, #f8fafc)', borderBottom: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>State</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Applications</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Dept. Share (90%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Platform Fee (10%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Total Revenue</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Revenue Share</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {comparedStates.slice(0, tableLimit).map((st) => {
                const total = st.revenue;
                const dShare = st.serviceFee;
                const pFee = st.platformFee;
                const sharePercent = st.revenueShare;

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
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      <span title={formatNum(st.applications)}>
                        {formatCompactNum(st.applications)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#16a34a' }}>
                      <span title={formatINR(dShare)}>
                        {formatINR(dShare, true)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb' }}>
                      <span title={formatINR(pFee)}>
                        {formatINR(pFee, true)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--navy-900, #0f172a)' }}>
                      <span title={formatINR(total)}>
                        {formatINR(total, true)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
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
