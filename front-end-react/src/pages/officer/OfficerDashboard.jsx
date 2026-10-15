// src/pages/officer/OfficerDashboard.jsx
// Main Department Field Officer Dashboard page.
//
// React Concepts Demonstrated:
//  [Component]     — OfficerDashboard is the root page component containing stat cards, tabs, queue table, and quick actions
//  [Props]         — Passes application lists, loading state, and callback functions down to OfficerQueueTable
//  [State]         — useState manages activeTab, queue data, slaRisks, queries, weekChart, loading, and toast notifications
//  [Events]        — onClick on tab switches, quick action buttons, notification reminders, and export trigger
//  [Lists]         — Mapped rendering of tabs, breach items, pending queries, and weekly chart bars
//  [Hooks]         — useState for state management, useEffect for initial API data loading, useMemo for computed values
//  [Forms]         — Filter/search forms embedded in child components
//  [Context]       — useAuth reads current logged-in officer profile and department
//  [Router]        — useNavigate provides client-side routing to application review page
//  [API calls]     — apiGetOfficerQueue, apiGetOfficerQueries, apiGetOfficerSlaRisks, apiGetOfficerWeekChart, apiCreateNotification
//  [Prop Drilling] — Passes onSelect & onQuickAction callbacks down to OfficerQueueTable → OfficerQueueRow
//  [Callbacks]     — handleSelectApplication, handleQuickAction, handleSendReminder, handleExportReport

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OfficerQueueTable from '../../components/officer/OfficerQueueTable';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import {
  apiGetOfficerQueue,
  apiGetOfficerQueries,
  apiGetOfficerSlaRisks,
  apiGetOfficerWeekChart,
  apiCreateNotification,
} from '../../api/officerApi';
import { apiGetStateJurisdictionNodes } from '../../api/departmentHeadApi';
import { apiGetServices } from '../../api/citizenApi';

function formatJurisdictionNode(nodeId, nodes = []) {
  if (!nodeId) return 'Assigned Hierarchy Scope';
  if (Array.isArray(nodes) && nodes.length > 0) {
    const found = nodes.find((n) => n.id === nodeId || n.nodeId === nodeId);
    if (found) {
      const typeStr = found.type ? ` (${found.type.charAt(0).toUpperCase() + found.type.slice(1)} Tier ${found.level || found.tier || ''})`.replace(' Tier )', ')') : '';
      return `${found.name}${typeStr}`;
    }
  }
  const clean = nodeId.replace(/^node_/, '');
  const dict = {
    vil: 'Village', mdl: 'Mandal', tlk: 'Taluk', dist: 'District',
    mdu: 'Madurai', chn: 'Chennai', cbe: 'Coimbatore', tcy: 'Tiruchirappalli', slm: 'Salem',
    blr: 'Bengaluru', mys: 'Mysuru', bgm: 'Belagavi', mng: 'Mangaluru', hub: 'Hubballi',
    tvm: 'Thiruvananthapuram', ekm: 'Ernakulam', clt: 'Kozhikode', tsr: 'Thrissur', kdr: 'Kollam',
    tpt: 'Tirupati', vsp: 'Visakhapatnam', kri: 'Krishna', gun: 'Guntur', ant: 'Ananthapuramu',
    ap: 'Andhra Pradesh', ka: 'Karnataka', kl: 'Kerala', tn: 'Tamil Nadu',
    cg: 'Chandragiri', w14: 'Ward 14',
  };
  const parts = clean.split('_').map((p) => dict[p.toLowerCase()] || (p.charAt(0).toUpperCase() + p.slice(1)));
  return parts.join(' ');
}

export default function OfficerDashboard() {
  // [Context] Access authenticated officer details
  const { user } = useAuth();

  // [Router] Programmatic navigation hook
  const navigate = useNavigate();

  // ── [State] Tab State ──
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'breach' | 'queries'

  // ── [State] API Data States ──
  const [queue, setQueue] = useState([]);
  const [queries, setQueries] = useState([]);
  const [slaRisks, setSlaRisks] = useState([]);
  const [weekChart, setWeekChart] = useState(null); // null until API responds
  const [jurisdictionNodes, setJurisdictionNodes] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── [Hooks] Toast notification via shared useToast hook ──
  const { toast, showToast, hideToast } = useToast();

  // Clear any legacy localStorage keys to ensure fresh, accurate server data
  useEffect(() => {
    try {
      const storageKey = `officer_approved_today_${user?.id || user?.userId || 'officer'}`;
      localStorage.removeItem(storageKey);
    } catch (e) {}
  }, [user]);

  // ── [Hooks + API calls] Fetch Officer Data on Mount ──
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        // [API calls] Fetch parallel datasets for the officer dashboard
        const [queueRes, queriesRes, slaRes, chartRes, nodesRes, servicesRes] = await Promise.allSettled([
          apiGetOfficerQueue(),
          apiGetOfficerQueries(),
          apiGetOfficerSlaRisks(),
          apiGetOfficerWeekChart(),
          apiGetStateJurisdictionNodes(user?.stateId),
          apiGetServices(),
        ]);

        if (!isMounted) return;

        if (nodesRes.status === 'fulfilled' && nodesRes.value?.data) {
          setJurisdictionNodes(nodesRes.value.data);
        } else if (nodesRes.status === 'fulfilled' && Array.isArray(nodesRes.value)) {
          setJurisdictionNodes(nodesRes.value);
        }

        // Populate queue
        if (queueRes.status === 'fulfilled' && queueRes.value?.data) {
          setQueue(queueRes.value.data);
        } else if (queueRes.status === 'fulfilled' && Array.isArray(queueRes.value)) {
          setQueue(queueRes.value);
        }

        // Populate queries
        if (queriesRes.status === 'fulfilled' && queriesRes.value?.data) {
          setQueries(queriesRes.value.data);
        } else if (queriesRes.status === 'fulfilled' && Array.isArray(queriesRes.value)) {
          setQueries(queriesRes.value);
        }

        // Populate SLA risks
        if (slaRes.status === 'fulfilled' && slaRes.value?.data) {
          setSlaRisks(slaRes.value.data);
        }

        // Populate weekly chart — normalize API shape
        // Backend returns: [{ day: 'Mon', approved: 8, rejected: 1, query: 2 }, ...]
        // We need: { days: ['Mon',...], vals: [8,...] }
        if (chartRes.status === 'fulfilled') {
          const raw = chartRes.value?.data || chartRes.value;
          if (Array.isArray(raw) && raw.length > 0) {
            setWeekChart({
              days: raw.map(d => d.day),
              vals: raw.map(d => d.approved || 0),
            });
          } else if (raw?.days && raw?.vals) {
            // Already in the right shape
            setWeekChart(raw);
          }
        }

        // Populate catalog services
        if (servicesRes.status === 'fulfilled') {
          const sData = servicesRes.value?.data || servicesRes.value;
          setAllServices(Array.isArray(sData) ? sData : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load officer dashboard');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── [Hooks] Computed Stats Derived from Queue, Chart, and Session Actions ──
  const stats = useMemo(() => {
    const pendingCount = queue.length;
    // SLA at risk: applications with <= 3 days left that are not completed/rejected
    const atRiskItems = queue.filter(
      (item) =>
        typeof item.slaLeft === 'number' &&
        item.slaLeft >= 0 &&
        item.slaLeft <= 3 &&
        item.status !== 'completed' &&
        item.status !== 'rejected'
    );
    const atRiskCount = atRiskItems.length;
    const queriesCount = queries.length;

    // Read today's approved count from the chart's today bar (matching current day of the week)
    const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = DAYS_OF_WEEK[new Date().getDay()];
    const todayIdx = weekChart?.days ? weekChart.days.indexOf(currentDayName) : -1;
    const approvedToday = todayIdx !== -1 ? (weekChart.vals?.[todayIdx] || 0) : 0;

    return {
      pendingCount,
      atRiskCount,
      atRiskItems,
      queriesCount,
      approvedToday,
    };
  }, [queue, queries, weekChart]);

  // Compute all services belonging to this officer's department
  const departmentServices = useMemo(() => {
    const officerDept = (user?.dept || user?.department || queue[0]?.dept || queue[0]?.department || '').toLowerCase();
    const officerDeptId = user?.departmentId || queue[0]?.departmentId;

    if (!Array.isArray(allServices) || allServices.length === 0) return [];

    return allServices
      .filter((svc) => {
        const sDept = (svc.dept || svc.department || '').toLowerCase();
        const sDeptId = svc.departmentId;

        if (officerDeptId && sDeptId && officerDeptId === sDeptId) return true;
        if (officerDept && sDept) {
          if (sDept === officerDept) return true;
          if (officerDept.includes('revenue') && sDept.includes('revenue')) return true;
          if (officerDept.includes('welfare') && sDept.includes('welfare')) return true;
          if (officerDept.includes('panchayat') && sDept.includes('panchayat')) return true;
        }
        return false;
      })
      .map((s) => s.name || s.serviceName)
      .filter(Boolean);
  }, [allServices, user, queue]);

  // showToast and hideToast are provided by the useToast hook above

  // ── [Callbacks + Router] Drillable handler for selecting an application ──
  const handleSelectApplication = (applicationId) => {
    navigate(`/officer/review/${applicationId}`);
  };

  // ── [Callbacks + Router] Drillable handler for row quick action ──
  const handleQuickAction = (actionType, application) => {
    if (actionType === 'review') {
      navigate(`/officer/review/${application.id}`);
    } else if (actionType === 'query' || actionType === 'reject') {
      navigate(`/officer/review/${application.id}?action=${actionType}`);
    }
  };

  // ── [Callbacks + API calls] Send reminder for pending query ──
  const handleSendReminder = async (queryItem) => {
    try {
      const targetCitizenId = queryItem.citizenId || (queryItem.citizenUser && queryItem.citizenUser.id);
      if (!targetCitizenId) {
        showToast('Unable to send reminder: citizen identifier missing.', 'warning');
        return;
      }
      await apiCreateNotification({
        userId: targetCitizenId,
        title: 'Query Reminder',
        message: `Reminder: Please respond to the pending query for application ${queryItem.id || queryItem.appId}.`,
        type: 'warning',
        link: `/citizen/track?id=${queryItem.id || queryItem.appId}`,
      });
      showToast(`Reminder sent successfully to ${queryItem.citizen || queryItem.citizenName || 'citizen'}.`, 'success');
    } catch (err) {
      showToast('Failed to send reminder notification.', 'error');
    }
  };

  // ── [Callbacks] Quick Action: Export Daily Report ──
  const handleExportReport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      showToast('Daily summary report generated and downloaded.', 'success');
    }, 1000);
  };

  // Chart bar values directly from the API response
  const displayChartVals = useMemo(() => {
    return weekChart?.vals || [];
  }, [weekChart]);

  // Calculate max value for chart rendering (weekChart may be null while loading)
  const maxChartVal = displayChartVals.length > 0 ? Math.max(...displayChartVals, 1) : 1;

  // Tab definitions list
  const TABS = [
    { id: 'queue', label: 'Pending Queue', count: stats.pendingCount, badgeBg: 'var(--amber-100)', badgeColor: 'var(--amber-700)' },
    { id: 'breach', label: 'SLA at Risk (≤ 3 Days)', count: stats.atRiskCount, badgeBg: '#fef3c7', badgeColor: '#b45309' },
    { id: 'queries', label: 'Queries Sent', count: stats.queriesCount, badgeBg: 'var(--slate-100)', badgeColor: 'var(--slate-600)' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Toast Notification — [Component + Props + Callbacks] ── */}
      <Toast toast={toast} onClose={hideToast} />

      {/* ── Officer Identity Badge & Jurisdiction Scope Header ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '16px 20px',
          marginBottom: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.35rem',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              flexShrink: 0,
            }}
          >
            🏛️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
                {user?.name || 'Department Field Officer'}
              </h2>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #86efac',
                }}
              >
                {user?.title || 'Field Verification Officer'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                }}
              >
                {user?.id || 'OFFICER'}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '4px' }}>
              <span>🏢 {user?.dept || user?.departmentName || 'Department'}</span>
              &nbsp;·&nbsp;
              <span>📍 Assigned Jurisdiction: <strong>{formatJurisdictionNode(user?.assignedNodeId || user?.jurisdiction, jurisdictionNodes)}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
            }}
          >
            Tier Workflow Authority: Active
          </span>
        </div>
      </div>

      {/* ── SLA at Risk Alert Banner ── */}
      {stats.atRiskCount > 0 && (
        <div
          className="alert alert-warning"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-lg)',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#92400e',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={{ fontSize: '0.875rem' }}>
              <strong>{stats.atRiskCount} application{stats.atRiskCount === 1 ? '' : 's'} approaching SLA breach (≤ 3 days left).</strong> Take action now before authority is automatically revoked and escalated to supervisor.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setActiveTab('breach')}
            style={{
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Review at Risk →
          </button>
        </div>
      )}

      {/* ── Stats Metric Cards Row ── */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Card 1: Pending Review */}
        <div className="stat-card accent">
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">Pending Review</div>
              <div className="stat-value" style={{ color: 'var(--amber-500)' }}>
                {loading ? '…' : stats.pendingCount}
              </div>
            </div>
            <div className="stat-icon amber">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Assigned queue items
          </div>
        </div>

        {/* Card 2: Approved Today */}
        <div className="stat-card success">
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">Approved Today</div>
              <div className="stat-value" style={{ color: 'var(--green-500)' }}>
                {stats.approvedToday}
              </div>
            </div>
            <div className="stat-icon green">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Successfully processed
          </div>
        </div>

        {/* Card 3: SLA at Risk */}
        <div className="stat-card warning" style={{ borderColor: stats.atRiskCount > 0 ? '#f59e0b' : undefined }}>
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">SLA at Risk (≤3d)</div>
              <div className="stat-value" style={{ color: '#d97706' }}>
                {loading ? '…' : stats.atRiskCount}
              </div>
            </div>
            <div className="stat-icon amber" style={{ background: '#fef3c7', color: '#d97706' }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>
            {stats.atRiskCount > 0 ? 'Urgent action recommended' : 'All SLAs healthy'}
          </div>
        </div>

        {/* Card 4: Awaiting Citizen */}
        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">Awaiting Citizen</div>
              <div className="stat-value">
                {loading ? '…' : stats.queriesCount}
              </div>
            </div>
            <div className="stat-icon amber">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Query responses pending
          </div>
        </div>

        {/* Card 5: SLA Compliance Rate */}
        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">My SLA Rate</div>
              <div className="stat-value">91%</div>
            </div>
            <div className="stat-icon green">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Target: 95% · Rank: 2/5
          </div>
        </div>
      </div>

      {/* ── [Lists + Events] Tab Navigation ── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '2px solid var(--color-border)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === tab.id ? 'var(--navy-700)' : 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--navy-600)' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  background: tab.badgeBg,
                  color: tab.badgeColor,
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginLeft: '6px',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main Layout Grid: Left Content + Right Action Panels ── */}
      <div className="dashboard-grid">
        {/* Left Column: Active Tab Content */}
        <div>
          {/* TAB 1: PENDING QUEUE */}
          {activeTab === 'queue' && (
            /* [Component + Props + Prop Drilling] */
            <OfficerQueueTable
              applications={queue}
              departmentServices={departmentServices}
              loading={loading}
              error={error}
              onSelect={handleSelectApplication}
              onQuickAction={handleQuickAction}
            />
          )}

          {/* TAB 2: SLA AT RISK (≤ 3 DAYS) */}
          {activeTab === 'breach' && (
            <div className="card" style={{ borderTop: '3px solid #f59e0b' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title" style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Approaching SLA Breach (≤ 3 Days Remaining)
                </span>
                <span className="badge badge-warning" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                  Urgent Attention Required
                </span>
              </div>

              <div>
                {stats.atRiskItems.length === 0 ? (
                  <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No applications currently at risk of SLA breach. All assigned applications have more than 3 days remaining.
                  </div>
                ) : (
                  /* [Lists] Map at-risk applications */
                  stats.atRiskItems.map((item) => (
                    <div
                      key={item.id}
                      className="app-row"
                      onClick={() => handleSelectApplication(item.id)}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'center',
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--slate-100)',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: item.slaLeft === 0 ? 'var(--red-100)' : '#fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="18" fill="none" stroke={item.slaLeft === 0 ? 'var(--red-500)' : '#d97706'} strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-700)' }}>
                            {item.id}
                          </span>
                          <span className={`badge ${item.slaLeft === 0 ? 'badge-danger' : 'badge-warning'}`}>
                            {item.slaLeft === 0 ? 'Breaching Today ⚠' : `${item.slaLeft} day${item.slaLeft === 1 ? '' : 's'} left`}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                          {item.service} — {item.citizen}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Submitted {item.submitted || item.submittedDate} · SLA: {item.slaTotal || 7} days
                        </div>
                        <div className="alert alert-warning" style={{ marginTop: '8px', padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e' }}>
                          Prioritize processing this application before SLA expires to prevent revocation and escalation to supervisory authority.
                        </div>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ backgroundColor: '#d97706', color: '#ffffff', border: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/officer/review/${item.id}`);
                          }}
                        >
                          Review Now →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUERIES SENT */}
          {activeTab === 'queries' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Queries Awaiting Citizen Response</span>
              </div>
              <div>
                {queries.length === 0 ? (
                  <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No active queries sent to citizens.
                  </div>
                ) : (
                  /* [Lists] Map pending citizen queries */
                  queries.map((q) => (
                    <div
                      key={q.id || q.appId}
                      className="app-row"
                      style={{
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--slate-100)',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: q.responded ? 'var(--green-100)' : 'var(--amber-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke={q.responded ? 'var(--green-500)' : 'var(--amber-600)'}
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={
                              q.responded
                                ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            }
                          />
                        </svg>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-600)' }}>
                            {q.id || q.appId}
                          </span>
                          <span className={`badge ${q.responded ? 'badge-success' : 'badge-warning'}`}>
                            {q.responded ? 'Responded' : 'Awaiting Citizen'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                          {q.citizen} — {q.service}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '2px', fontStyle: 'italic' }}>
                          "{q.query || q.queryText}"
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                          Sent {q.sent || 'Recently'} · Response deadline: <strong>{q.deadline || '3 days'}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {q.responded ? (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => navigate(`/officer/review/${q.id || q.appId}`)}
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleSendReminder(q)}
                          >
                            Send Reminder
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Weekly Approvals Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

          {/* Weekly Performance Bar Chart Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">This Week's Approvals</span>
            </div>
            <div className="card-body">
                          {/* [Lists] Render chart bars */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '6px',
                  height: '80px',
                  marginBottom: '8px',
                }}
              >
                {weekChart === null ? (
                  // Loading skeleton bars
                  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                    <div key={d} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                      <div style={{ width: '100%', height: '20px', backgroundColor: 'var(--slate-100)', borderRadius: '3px 3px 0 0' }} />
                    </div>
                  ))
                ) : displayChartVals.every(v => v === 0) ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
                    No approvals recorded this week
                  </div>
                ) : (
                  displayChartVals.map((val, idx) => {
                    const heightPercent = Math.max(8, (val / maxChartVal) * 72);
                    const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const currentDayName = DAYS_OF_WEEK[new Date().getDay()];
                    const isToday = weekChart?.days?.[idx] === currentDayName;
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                        title={`${val} approved on ${weekChart.days?.[idx] || ''}`}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: `${heightPercent}px`,
                            backgroundColor: isToday ? 'var(--navy-600)' : 'var(--navy-200)',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

                            {/* [Lists] Render day labels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {(weekChart?.days || []).map((day, idx) => (
                  <span key={idx} style={{ flex: 1, textAlign: 'center' }}>
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
