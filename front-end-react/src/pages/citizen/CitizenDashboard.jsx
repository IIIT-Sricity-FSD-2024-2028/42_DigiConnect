import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetMyApplications, apiGetMyGrievances } from '../../api/citizenApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge, { checkStatusCategory, getStatusBadgeClass } from '../../components/common/StatusBadge';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch real data from backend APIs with consistent limit (100)
        const [appsRes, grievRes] = await Promise.all([
          apiGetMyApplications(1, 100).catch((err) => {
            console.error('Error fetching applications:', err);
            return { data: [] };
          }),
          apiGetMyGrievances().catch((err) => {
            console.error('Error fetching grievances:', err);
            return { data: [] };
          }),
        ]);

        const appsList = Array.isArray(appsRes)
          ? appsRes
          : appsRes?.data || appsRes?.items || [];
        const grievList = Array.isArray(grievRes)
          ? grievRes
          : grievRes?.data || grievRes?.items || [];

        setApplications(appsList);
        setGrievances(grievList);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Compute status metrics consistently with MyApplicationsPage via shared statusHelper
  const totalApps = applications.length;
  const approvedCount = applications.filter((a) => checkStatusCategory(a.status).isApproved).length;
  const pendingCount = applications.filter((a) => checkStatusCategory(a.status).isUnderReview).length;
  const queryApps = applications.filter((a) => checkStatusCategory(a.status).isQuery);
  const queryCount = queryApps.length;
  const openGrievancesCount = grievances.filter(
    (g) => !['resolved', 'rejected', 'escalated-resolved'].includes((g.status || '').toLowerCase())
  ).length;

  const approvalRate = totalApps > 0 ? Math.round((approvedCount / totalApps) * 100) : 0;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Loading Citizen Dashboard...</div>
        <p style={{ fontSize: '0.875rem' }}>Fetching your applications and grievance records...</p>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Banner */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>
          Welcome back, {user?.name || 'Citizen'} 👋
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Manage your government applications, track progress, and raise grievances.
        </div>
      </div>

      {/* Action Required Alerts for Query-status applications */}
      {queryApps.length > 0 && (
        <div id="dashboardAlerts">
          {queryApps.slice(0, 3).map((app) => (
            <div key={app.id} className="alert alert-warning" style={{ marginBottom: 'var(--space-lg)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong>Action Required:</strong> Officer has raised a query on your {app.serviceName || 'service'} application ({app.id}). Please upload the requested documents.
                <Link to={`/citizen/track?id=${app.id}`} style={{ color: 'var(--amber-600)', fontWeight: 700, marginLeft: '8px' }}>
                  Respond Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* 5 Stats Cards Grid */}
      <div className="stats-grid">
        {/* 1. Total Applications */}
        <StatCard
          title="Total Applications"
          value={totalApps}
          subtitle="Since Jan 2024"
          iconColor="blue"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        {/* 2. Approved */}
        <StatCard
          title="Approved"
          value={approvedCount}
          variant="success"
          subtitle={`${approvalRate}% approval rate`}
          iconColor="green"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* 3. Under Review */}
        <StatCard
          title="Under Review"
          value={pendingCount}
          variant="accent"
          subtitle={queryCount > 0 ? `${queryCount} needs response` : 'Currently being reviewed'}
          iconColor="amber"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* 4. Query Raised */}
        <StatCard
          title="Query Raised"
          value={queryCount}
          subtitle="Needs your response"
          iconColor="amber"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* 5. Open Grievances */}
        <StatCard
          title="Open Grievances"
          value={openGrievancesCount}
          subtitle="Under investigation"
          iconColor="amber"
          icon={
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
      </div>

      {/* Main Grid: Recent Applications & Quick Apply */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Applications */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Recent Applications
            </span>
            <Link to="/citizen/applications" className="btn btn-ghost btn-sm">
              View All
            </Link>
          </div>

          <div style={{ padding: 0 }}>
            {applications.length === 0 ? (
              <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No applications yet. <Link to="/citizen/apply">Apply now</Link>
              </div>
            ) : (
              applications.slice(0, 4).map((app) => {
                const typeClass =
                  app.serviceType === 'certificate'
                    ? 'cert'
                    : app.serviceType === 'welfare'
                    ? 'welfare'
                    : app.serviceType === 'permission'
                    ? 'permission'
                    : 'correction';

                const statusInfo = checkStatusCategory(app.status);
                const isApproved = statusInfo.isApproved;

                return (
                  <div
                    key={app.id}
                    className="application-item"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`app-type-icon ${typeClass}`}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="app-info">
                      <div className="app-title">{app.serviceName || 'Government Service'}</div>
                      <div className="app-meta">
                        {app.id} · Submitted {formatDate(app.submittedDate || app.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${statusInfo.badgeClass}`}>
                        {statusInfo.badgeLabel}
                      </span>
                      {isApproved && (
                        <span
                          className="btn btn-outline btn-sm"
                          title="Approved Application"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Apply */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Quick Apply Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Apply for a Service</span>
            </div>
            <div className="card-body" style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                <Link
                  to="/citizen/apply?type=certificate"
                  className="service-card"
                  style={{ padding: 'var(--space-md)', background: 'var(--navy-50)', borderColor: 'var(--navy-200)' }}
                >
                  <div className="service-card-icon" style={{ background: 'var(--navy-100)', width: '40px', height: '40px' }}>
                    <svg width="18" height="18" fill="none" stroke="var(--navy-600)" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)' }}>Certificates</div>
                </Link>

                <Link
                  to="/citizen/apply?type=welfare"
                  className="service-card"
                  style={{ padding: 'var(--space-md)', background: 'var(--green-100)', borderColor: '#bbf7d0' }}
                >
                  <div className="service-card-icon" style={{ background: 'white', width: '40px', height: '40px' }}>
                    <svg width="18" height="18" fill="none" stroke="#166534" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>Welfare</div>
                </Link>

                <Link
                  to="/citizen/apply?type=permission"
                  className="service-card"
                  style={{ padding: 'var(--space-md)', background: 'var(--amber-100)', borderColor: '#fde68a' }}
                >
                  <div className="service-card-icon" style={{ background: 'white', width: '40px', height: '40px' }}>
                    <svg width="18" height="18" fill="none" stroke="var(--amber-600)" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-700)' }}>Permissions</div>
                </Link>

                <Link
                  to="/citizen/apply?type=correction"
                  className="service-card"
                  style={{ padding: 'var(--space-md)', background: 'var(--purple-100)', borderColor: '#e9d5ff' }}
                >
                  <div className="service-card-icon" style={{ background: 'white', width: '40px', height: '40px' }}>
                    <svg width="18" height="18" fill="none" stroke="#6b21a8" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8' }}>Corrections</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Schemes Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--navy-800) 0%, var(--navy-600) 100%)',
          border: 'none',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div
          className="card-body"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-lg)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--amber-400)',
                marginBottom: '4px',
              }}
            >
              New Scheme Available
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              PM Kisan Scholarship 2025
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--navy-200)', margin: 0 }}>
              Eligible students can apply for up to ₹25,000 scholarship. Applications open until 31 March 2025.
            </p>
          </div>
          <Link to="/citizen/apply?type=welfare" className="btn btn-accent" style={{ whiteSpace: 'nowrap' }}>
            Apply Now →
          </Link>
        </div>
      </div>
    </>
  );
}
