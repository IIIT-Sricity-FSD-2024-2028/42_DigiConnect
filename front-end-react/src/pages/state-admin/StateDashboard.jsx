// src/pages/state-admin/StateDashboard.jsx
// State Government Executive Dashboard
// Converted from state-admin/dashboard.html
// React concepts used:
// 1. Components (StateDashboard)
// 2. Props (passed to StatCard, StatusBadge)
// 3. State (useState for dashboard data, loading, error, active tab/filter)
// 4. Events (onClick for retrying, toggling views)
// 5. Lists (.map with unique keys for leaderboard and departments table)
// 6. Hooks (useState, useEffect for data lifecycle, useContext via useAuth)
// 7. Context (consuming AuthContext to obtain current state administrator details)
// 8. Router (useNavigate for quick navigation to jurisdictions and departments)
// 9. API calls (apiGetStateDashboard, apiGetJurisdictionStats)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Context: consuming existing AuthContext
import { useAuth } from '../../context/AuthContext';
// API calls: importing State Admin API functions
import { apiGetStateDashboard, apiGetJurisdictionStats } from '../../api/stateAdminApi';
// Component reuse: reusing shared StatCard component
import StatCard from '../../components/common/StatCard';
// Component reuse: reusing shared StatusBadge component
import StatusBadge from '../../components/common/StatusBadge';

// Currency and number formatting helper
function formatINR(val) {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

function formatNum(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN');
}


export default function StateDashboard() {
  // Router: navigation hook for redirecting to subpages
  const navigate = useNavigate();

  // Context: extract current user from AuthContext
  const { user } = useAuth();
  const stateId = user?.stateId || 'state_ap';

  // State: tracking dashboard data, loading state, error state, and table row toggle
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllDepts, setShowAllDepts] = useState(false);

  // Hooks / useEffect: fetch dashboard data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // API Call: fetch dashboard data for current state
        const res = await apiGetStateDashboard(stateId);
        const data = res?.data || res || {};

        // API Call: fetch aggregated jurisdiction tier stats
        try {
          const statsRes = await apiGetJurisdictionStats(stateId);
          if (statsRes?.data || statsRes) {
            data.jurisdiction = statsRes.data || statsRes;
          }
        } catch (_err) {
          // Fallback gracefully if stats endpoint is unavailable
        }

        setDashboardData(data);
      } catch (err) {
        // State: set error message if API fails
        setError(err.message || 'Failed to load State Administration Dashboard');
      } finally {
        // State: end loading indicator
        setLoading(false);
      }
    }

    loadData();
  }, [stateId]);

  // ── 1. LOADING STATE ──
  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          Loading State Administration Dashboard...
        </div>
        <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
          Aggregating department metrics, citizen applications, and jurisdiction health.
        </p>
      </div>
    );
  }

  // ── 2. ERROR STATE ──
  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            color: '#991b1b',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Unable to Load State Dashboard</div>
          <p style={{ fontSize: '0.875rem', marginTop: '4px', color: '#b91c1c' }}>{error}</p>
          {/* Events: retry button */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: '14px' }}
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Extract metrics from API response with fallback safe defaults
  const state = dashboardData?.state || { name: user?.state || 'State Government', code: user?.stateCode || 'ST', status: 'ACTIVE' };
  const stateAdmin = dashboardData?.stateAdmin || { name: user?.name || 'State Administrator' };
  const summary = dashboardData?.summary || {
    totalDepartments: 0,
    totalOfficers: 0,
    totalServices: 0,
    totalApplications: 0,
    totalRevenue: 0,
    totalGrievances: 0,
  };
  const jurisdiction = dashboardData?.jurisdiction || {
    districtsCount: 0,
    subDivisionsCount: 0,
    mandalsCount: 0,
    villagesCount: 0,
    municipalitiesCount: 0,
    wardsCount: 0,
  };
  const districtsLeaderboard = dashboardData?.districtsLeaderboard || [];
  const departments = dashboardData?.departments || [];
  const visibleDepts = showAllDepts ? departments : departments.slice(0, 5);

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* ── Identity & Welcome Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              Government of {state.name}
            </h1>
            <span
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {state.code}
            </span>
            <span
              style={{
                background: '#22c55e',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              ● {state.status || 'ACTIVE'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Executive Secretariat · {stateAdmin.name} · Oversight & Inter-departmental Governance
          </p>
        </div>

        {/* Quick navigation shortcut buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Events: navigation onClick */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ color: '#ffffff', borderColor: '#475569' }}
            onClick={() => navigate('/state-admin/jurisdictions')}
          >
            🗺️ Jurisdiction Hierarchy
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/state-admin/departments')}
          >
            🏢 Manage Departments
          </button>
        </div>
      </div>

      {/* ── State-Wide KPIs using reused <StatCard /> ── */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
          📊 State Key Performance Indicators
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Component reuse: StatCard */}
          <StatCard
            title="State Departments"
            value={summary.totalDepartments}
            subtitle="Registered line departments"
            iconColor="purple"
          />
          <StatCard
            title="Field Officers"
            value={formatNum(summary.totalOfficers)}
            subtitle="Onboarded verification staff"
            iconColor="blue"
          />
          <StatCard
            title="Public Services"
            value={summary.totalServices}
            subtitle="Catalog services live"
            iconColor="blue"
          />
          <StatCard
            title="Citizen Applications"
            value={formatNum(summary.totalApplications)}
            subtitle="Statewide total volume"
            iconColor="green"
            variant="success"
          />
          <StatCard
            title="Collected Revenue"
            value={formatINR(summary.totalRevenue)}
            subtitle="Service & platform treasury"
            iconColor="amber"
            variant="accent"
          />
          <StatCard
            title="Public Grievances"
            value={formatNum(summary.totalGrievances)}
            subtitle="Active citizen tickets"
            iconColor="purple"
          />
        </div>
      </div>

      {/* ── Geographic Hierarchy Summary Counters ── */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
            🏛️ Dynamic Jurisdiction Coverage Summary
          </span>
          {/* Router / Events: link to full tree */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem' }}
            onClick={() => navigate('/state-admin/jurisdictions')}
          >
            Explore Tree Structure →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{jurisdiction.districtsCount || 0}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Districts</div>
          </div>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{jurisdiction.subDivisionsCount || 0}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sub-Divisions</div>
          </div>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{jurisdiction.mandalsCount || 0}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mandals</div>
          </div>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatNum(jurisdiction.villagesCount || 0)}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Villages</div>
          </div>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{jurisdiction.municipalitiesCount || 0}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Municipalities</div>
          </div>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{formatNum(jurisdiction.wardsCount || 0)}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Wards</div>
          </div>
        </div>
      </div>

      {/* ── District Performance Leaderboard (List) ── */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
          🏆 District Performance Leaderboard
        </h2>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Lists: mapping over dynamic district leaderboard from backend */}
          {districtsLeaderboard.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              No district performance data available for this state.
            </div>
          ) : (
            districtsLeaderboard.map((dist) => (
              <div
                key={dist.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: dist.rank === 1 ? '#fef3c7' : '#f1f5f9',
                      color: dist.rank === 1 ? '#b45309' : '#475569',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    #{dist.rank}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                      {dist.name} District
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      District Collector: {dist.collector}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Submissions: </span>
                    <strong>{formatNum(dist.apps)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#16a34a' }}>Completed: </span>
                    <strong>{formatNum(dist.completed)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#ca8a04' }}>Pending: </span>
                    <strong>{formatNum(dist.pending)}</strong>
                  </div>
                  <div
                    style={{
                      background: dist.slaRate >= 92 ? '#dcfce7' : '#fef9c3',
                      color: dist.slaRate >= 92 ? '#15803d' : '#854d0e',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  >
                    {dist.slaRate}% SLA Compliance
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Department Efficiency Metrics (Table) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🏢 Department Operational Efficiency
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
              Real-time monitoring of state line departments and IAS heads
            </p>
          </div>
          {departments.length > 5 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAllDepts((prev) => !prev)}
            >
              {showAllDepts ? 'Show Fewer' : `Show All ${departments.length} Departments`}
            </button>
          )}
        </div>

        {/* ── EMPTY STATE ── */}
        {departments.length === 0 ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🏢</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>No Departments Registered Yet</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Create your first state department to appoint an IAS Department Head.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '12px' }}
              onClick={() => navigate('/state-admin/departments')}
            >
              + Create Department
            </button>
          </div>
        ) : (
          /* Table of departments */
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              overflowX: 'auto',
            }}
          >
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Department Head</th>
                  <th style={{ padding: '12px 16px' }}>Services</th>
                  <th style={{ padding: '12px 16px' }}>Applications</th>
                  <th style={{ padding: '12px 16px' }}>Pending</th>
                  <th style={{ padding: '12px 16px' }}>Completed</th>
                  <th style={{ padding: '12px 16px' }}>Revenue</th>
                  <th style={{ padding: '12px 16px' }}>Resolution</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Lists: mapping over visible departments with key */}
                {visibleDepts.map((d) => (
                  <tr key={d.id || d.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#0f172a' }}>{d.name}</strong>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {d.code}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{d.headName || 'Unassigned'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{d.headEmail || '--'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                        {d.servicesCount || 0} Services
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      {formatNum(d.applicationsCount || 0)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ca8a04', fontWeight: 600 }}>
                      {formatNum(d.pendingCount || 0)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>
                      {formatNum(d.completedCount || 0)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>
                      {formatINR(d.revenue || 0)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>
                      {d.resolutionRate ?? 100}%
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {/* Component reuse: StatusBadge */}
                      <StatusBadge status={d.status || 'Active'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
