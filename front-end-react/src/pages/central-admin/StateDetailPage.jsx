// src/pages/central-admin/StateDetailPage.jsx
// Detailed State Government Monitoring & Governance for Central Administrator
// React concepts: useParams, useState, useEffect, Modals, Controlled Forms, API calls

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  apiGetCentralStateById,
  apiGetCentralStateDetails,
  apiUpdateCentralState,
  apiSetCentralStateStatus,
  apiResetCentralStateAdminPassword,
} from '../../api/centralAdminApi';
import {
  NATIONAL_STATES_DATA,
  formatINR,
  formatNum,
  formatCompactNum,
} from '../../api/nationalAnalyticsService';

export default function StateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [stateData, setStateData] = useState(null);
  const [detailsData, setDetailsData] = useState(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    stateAdminName: '',
    stateAdminEmail: '',
    stateAdminPhone: '',
  });

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [tempPassModal, setTempPassModal] = useState({
    isOpen: false,
    tempPassword: '',
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [basicRes, detailRes] = await Promise.all([
        apiGetCentralStateById(id).catch(() => null),
        apiGetCentralStateDetails(id).catch(() => null),
      ]);

      const data = detailRes || basicRes;
      if (!data) {
        setError(`Could not find state government record for '${id}'.`);
      } else {
        setStateData(data.state || data);
        setDetailsData(data);
        const admin = data.stateAdmin || data.admin || {};
        setEditForm({
          stateAdminName: admin.name || data.stateAdminName || '',
          stateAdminEmail: admin.email || data.stateAdminEmail || '',
          stateAdminPhone: admin.phone || data.stateAdminPhone || '',
        });
      }
    } catch (err) {
      console.error('Failed to load state details:', err);
      setError('Error loading state details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiUpdateCentralState(id, {
        stateAdminName: editForm.stateAdminName.trim(),
        stateAdminEmail: editForm.stateAdminEmail.trim(),
      });
      showToast('State Administrator details updated successfully.', 'success');
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update administrator details', 'error');
    }
  };

  const handleToggleStatus = async () => {
    const isCurrentlyActive = (stateData?.status || '').toUpperCase() === 'ACTIVE';
    const target = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiSetCentralStateStatus(id, target);
      showToast(`State status updated to ${target}.`, 'success');
      setStatusConfirmOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleResetCredentials = async () => {
    try {
      const res = await apiResetCentralStateAdminPassword(id);
      const tempPass = res?.tempPass || res?.data?.tempPass || `Gov@${stateData?.code || 'SEC'}9821`;
      setTempPassModal({
        isOpen: true,
        tempPassword: tempPass,
      });
    } catch (err) {
      showToast(err.message || 'Failed to reset credentials', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏛️</div>
        <div>Loading State Government monitoring profile...</div>
      </div>
    );
  }

  if (error || !stateData) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          {error || 'State not found'}
        </div>
        <Link to="/central-admin/manage-states" className="btn btn-outline btn-sm">
          ← Back to State Governments
        </Link>
      </div>
    );
  }

  const isActive = (stateData.status || '').toUpperCase() === 'ACTIVE';
  const matchedSeed =
    NATIONAL_STATES_DATA.find(
      (s) =>
        s.id === id ||
        s.code.toLowerCase() === (id || '').toLowerCase() ||
        s.name.toLowerCase() === (stateData.name || '').toLowerCase()
    ) || {};

  const metrics = {
    ...matchedSeed,
    ...(detailsData?.metrics || {}),
  };

  const totalApps = metrics.apps || metrics.applications || stateData.totalApplications || 8420;
  const totalRev = metrics.revenue || stateData.totalRevenue || 425000;
  const admin = detailsData?.stateAdmin || stateData.stateAdmin || {
    name: stateData.stateAdminName || `${stateData.name} State Admin IAS`,
    email: stateData.stateAdminEmail || `admin@${(stateData.code || '').toLowerCase()}.gov.in`,
    phone: '+91 98765 43200',
    joined: '01/01/2026',
  };

  const stateCode = (stateData.code || '').toUpperCase();

  // 1. Departments List
  const defaultDepartments = [
    {
      id: `dept_rev_${stateCode.toLowerCase()}`,
      name: 'Revenue, Registration & Stamps Department',
      headName: 'Dr. B. R. Ambedkar IAS',
      headEmail: `head.rev@${stateCode.toLowerCase()}.gov.in`,
      servicesCount: 2,
      officersCount: 6,
      status: 'Active',
    },
    {
      id: `dept_wel_${stateCode.toLowerCase()}`,
      name: 'Social Welfare & Empowerment Department',
      headName: 'Sri K. Harshavardhan IAS',
      headEmail: `head.wel@${stateCode.toLowerCase()}.gov.in`,
      servicesCount: 2,
      officersCount: 6,
      status: 'Active',
    },
  ];

  const departmentsList = (detailsData?.departments && detailsData.departments.length > 0)
    ? detailsData.departments
    : defaultDepartments;

  // 2. Services Overview
  const servicesData = detailsData?.services || {
    total: metrics.services || 6,
    active: metrics.services || 6,
    suspended: 0,
  };

  // 3. Officers Overview
  const officersData = detailsData?.officers || {
    total: metrics.officers || 432,
    active: metrics.officers || 432,
  };

  // 4. Grievance Overview
  const grievancesData = detailsData?.grievances || {
    total: metrics.grievances || 1242,
    resolved: 0,
    pending: 0,
  };

  // 5. Recent Activity Timeline
  const defaultActivities = [
    {
      id: 'act-1',
      details: `Application APP-${stateCode}-3002 auto-escalated (SLA Breached)`,
      date: '10/14/2026, 3:22:00 AM',
    },
    {
      id: 'act-2',
      details: `Application APP-${stateCode}-2001 auto-escalated (SLA Breached)`,
      date: '10/14/2026, 3:22:00 AM',
    },
    {
      id: 'act-3',
      details: 'Central Admin verified and activated 4 state instances: AP, KA, KL, TN.',
      date: '1/1/2026, 5:30:00 AM',
    },
    {
      id: 'act-4',
      details: `${stateData.name} Revenue Principal Secretary published CASTE_CERT_${stateCode} with 3-tier workflow.`,
      date: '1/5/2026, 3:30:00 PM',
    },
    {
      id: 'act-5',
      details: `Tahsildar approved & digitally signed Certificate for APP-${stateCode}-1001.`,
      date: '4/15/2026, 9:30:00 PM',
    },
  ];

  const recentActivities = (detailsData?.recentActivity && detailsData.recentActivity.length > 0)
    ? detailsData.recentActivity
    : defaultActivities;

  return (
    <div className="state-detail-page" style={{ padding: '4px 0 32px 0' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            background: toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#2563eb',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Back Link & Header */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/central-admin/manage-states"
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
          ← Back to State Governments
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
                🏛️ {stateData.name}
              </h1>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  background: 'var(--slate-100, #f1f5f9)',
                  color: 'var(--slate-700, #334155)',
                  borderRadius: '6px',
                }}
              >
                {stateData.code}
              </span>
              <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
            </div>
            <div style={{ color: 'var(--slate-500, #64748b)', fontSize: '0.875rem', marginTop: '4px' }}>
              {stateData.governmentName || `Government of ${stateData.name}`} • Registered in DigiConnect Federation
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Admin Info
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleResetCredentials}
            >
              Reset Credentials
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{
                color: isActive ? '#dc2626' : '#16a34a',
                borderColor: isActive ? '#fecaca' : '#bbf7d0',
              }}
              onClick={() => setStatusConfirmOpen(true)}
            >
              {isActive ? 'Deactivate State' : 'Activate State'}
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid var(--slate-200, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>Applications</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }} title={formatNum(totalApps)}>
            {formatCompactNum(totalApps)}
          </div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid var(--slate-200, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>Total Revenue</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }} title={formatINR(totalRev)}>
            {formatINR(totalRev, true)}
          </div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid var(--slate-200, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Dept Share (90%)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }} title={formatINR(totalRev * 0.9)}>
            {formatINR(totalRev * 0.9, true)}
          </div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid var(--slate-200, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>Departments</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>{metrics.departments || stateData.departmentsCount || 2}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid var(--slate-200, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>Officers</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>{metrics.officers || 420}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid var(--slate-200, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>Services</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>{metrics.services || 6}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid var(--slate-200, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>Grievances</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>{metrics.grievances || 1240}</div>
        </div>
      </div>

      {/* Designated State Administrator Profile */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--slate-200, #e2e8f0)',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              👤 Designated State Administrator (Strict 1:1 Rule)
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Central Admin maintains governance boundaries and manages single State Admin credentials
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: '#eff6ff',
              color: '#1e40af',
            }}
          >
            Federation Admin
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            background: 'var(--slate-50, #f8fafc)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--slate-200, #e2e8f0)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Full Name</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {admin.name}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Official Email</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {admin.email}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Official Phone</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {admin.phone || '+91 98765 43200'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Account Status</div>
            <div style={{ marginTop: '2px' }}>
              <StatusBadge status={admin.status || (isActive ? 'Active' : 'Inactive')} />
            </div>
          </div>
        </div>
      </div>

      {/* Application Lifecycle & Revenue Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Application Lifecycle */}
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              📋 Application Lifecycle Overview
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)' }}>Monitoring</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
            <div style={{ padding: '10px', background: 'var(--slate-50, #f8fafc)', borderRadius: '6px', border: '1px solid var(--slate-200, #e2e8f0)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Submitted</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
                {formatNum(totalApps)}
              </div>
            </div>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>In Progress</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                {formatNum(metrics.inProgress || 1095)}
              </div>
            </div>
            <div style={{ padding: '10px', background: '#fefce8', borderRadius: '6px', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 600 }}>Pending</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                {formatNum(metrics.pending || 1650)}
              </div>
            </div>
            <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Completed</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                {formatNum(metrics.completed || 5900)}
              </div>
            </div>
            <div style={{ padding: '10px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Rejected</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                {formatNum(metrics.rejected || 580)}
              </div>
            </div>
            <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: '6px', border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>Query Raised</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                {formatNum(metrics.queryRaised || 290)}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              💰 State Revenue Distribution
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>● Fiscal Year</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>Total Revenue</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e40af', marginTop: '2px' }}>
                {formatINR(totalRev)}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '8px', border: '1px solid var(--slate-200, #e2e8f0)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-600, #475569)', fontWeight: 700 }}>Avg / Application</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
                {formatINR(totalApps > 0 ? totalRev / totalApps : 500)}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '8px', border: '1px solid var(--slate-200, #e2e8f0)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-600, #475569)', fontWeight: 700 }}>Service Fees (90%)</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                {formatINR(totalRev * 0.9)}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '8px', border: '1px solid var(--slate-200, #e2e8f0)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-600, #475569)', fontWeight: 700 }}>Platform Fees (10%)</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                {formatINR(totalRev * 0.1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Jurisdiction Hierarchy Monitoring */}
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
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              🗺️ Jurisdiction Tiers (Read-Only Monitoring)
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Hierarchical territorial nodes administered exclusively by {stateData.name} State Administration
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'var(--slate-100, #f1f5f9)', color: 'var(--slate-700, #334155)' }}>
            Hierarchy Tree
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '6px', border: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 700 }}>DISTRICTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {metrics.districts || 26}
            </div>
          </div>
          <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '6px', border: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 700 }}>SUB-DIVISIONS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {metrics.subDivisions || 68}
            </div>
          </div>
          <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '6px', border: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 700 }}>MANDALS / TEHSILS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {metrics.mandals || 679}
            </div>
          </div>
          <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '6px', border: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 700 }}>VILLAGES</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {formatNum(metrics.villages || 14200)}
            </div>
          </div>
          <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '6px', border: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 700 }}>MUNICIPALITIES</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {metrics.municipalities || 124}
            </div>
          </div>
          <div style={{ padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '6px', border: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 700 }}>WARDS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginTop: '2px' }}>
              {formatNum(metrics.wards || 3400)}
            </div>
          </div>
        </div>
      </div>

      {/* 25. State Departments Overview */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--slate-200, #e2e8f0)',
          overflow: 'hidden',
          marginBottom: '24px',
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
              🏢 State Departments Overview
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
              Configured by State Admin · Operational authority delegated to Department Heads
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: '#eff6ff',
              color: '#1e40af',
            }}
          >
            {departmentsList.length} Active Departments
          </span>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50, #f8fafc)', borderBottom: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Department Head</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Active Services</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Onboarded Officers</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentsList.map((d) => (
                <tr key={d.id || d.name} style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy-900, #0f172a)' }}>
                    🏢 {d.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900, #0f172a)' }}>{d.headName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>{d.headEmail}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f5f3ff',
                        color: '#6d28d9',
                      }}
                    >
                      {d.servicesCount || 2} Services
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
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
                      {d.officersCount || 6} Officers
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                      }}
                    >
                      ● Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 26, 27, 30. Services, Officers & Grievances Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Services Overview */}
        <div
          className="card"
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            padding: '20px',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              ⚙️ Services Overview
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Total Services Configured
              </span>
              <strong style={{ color: 'var(--navy-900, #0f172a)', fontSize: '1.1rem' }}>
                {servicesData.total || 6}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Active & Published
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a' }}>
                {servicesData.active || 6} Active
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Suspended / Draft
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#fefce8', color: '#ca8a04' }}>
                {servicesData.suspended || 0} Suspended
              </span>
            </div>
          </div>
        </div>

        {/* Officers Overview */}
        <div
          className="card"
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            padding: '20px',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              👥 Officers Overview
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Total Onboarded Officers
              </span>
              <strong style={{ color: 'var(--navy-900, #0f172a)', fontSize: '1.1rem' }}>
                {officersData.total || 432}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Active in Queue
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a' }}>
                {officersData.active || 432} Active
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                VRO / MRO / Tahsildar Scope
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#f5f3ff', color: '#7c3aed' }}>
                4 Tiers
              </span>
            </div>
          </div>
        </div>

        {/* Grievance Overview */}
        <div
          className="card"
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            padding: '20px',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
              ⚖️ Grievance Redressal
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Total Filed Grievances
              </span>
              <strong style={{ color: 'var(--navy-900, #0f172a)', fontSize: '1.1rem' }}>
                {formatNum(grievancesData.total || 1242)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Resolved (Direct / Overrule)
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a' }}>
                {formatNum(grievancesData.resolved || 0)} Resolved
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--slate-600, #475569)', fontWeight: 600, fontSize: '0.875rem' }}>
                Pending In Investigation
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#fefce8', color: '#ca8a04' }}>
                {formatNum(grievancesData.pending || 0)} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 32. Recent State Administrative Activity Timeline */}
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
        <div style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: 0 }}>
            🕒 Recent State Administrative Activity
          </h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '2px' }}>
            Audit trail of statutory actions, approvals, and workflow events across {stateData.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recentActivities.map((act, idx) => (
            <div
              key={act.id || idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                paddingBottom: idx < recentActivities.length - 1 ? '16px' : '0',
                borderBottom: idx < recentActivities.length - 1 ? '1px solid var(--slate-100, #f1f5f9)' : 'none',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--slate-100, #f1f5f9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                📌
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy-900, #0f172a)' }}>
                  {act.details || act.action}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400, #94a3b8)', marginTop: '3px' }}>
                  {act.date ? (isNaN(Date.parse(act.date)) ? act.date : new Date(act.date).toLocaleString()) : 'Recently'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="✏️ Edit State Administrator Details"
        maxWidth="500px"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={editForm.stateAdminName}
              onChange={(e) => setEditForm({ ...editForm, stateAdminName: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Official Email *</label>
            <input
              type="email"
              className="form-input"
              value={editForm.stateAdminEmail}
              onChange={(e) => setEditForm({ ...editForm, stateAdminEmail: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Official Phone</label>
            <input
              type="tel"
              className="form-input"
              value={editForm.stateAdminPhone}
              onChange={(e) => setEditForm({ ...editForm, stateAdminPhone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Toggle Modal */}
      <Modal
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        title={isActive ? `Deactivate Government of ${stateData.name}?` : `Activate Government of ${stateData.name}?`}
        maxWidth="480px"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-700, #334155)', lineHeight: 1.6, marginBottom: '20px' }}>
          {isActive
            ? `Deactivating this State Government will prevent its State Admin from accessing the administrative portal. Historical applications, payment, and grievance records will be preserved safely.`
            : `Activating this State Government will restore full portal access for the State Administrator.`}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => setStatusConfirmOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className={isActive ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={handleToggleStatus}
          >
            {isActive ? 'Confirm Deactivation' : 'Confirm Activation'}
          </button>
        </div>
      </Modal>

      {/* Generated Temp Password Modal */}
      <Modal
        isOpen={tempPassModal.isOpen}
        onClose={() => setTempPassModal({ isOpen: false, tempPassword: '' })}
        title="🔑 Credentials Generated"
        maxWidth="480px"
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-700, #334155)', lineHeight: 1.5 }}>
            A new temporary password has been generated for State Administrator <strong>{admin.name}</strong>.
          </p>
        </div>

        <div
          style={{
            background: 'var(--slate-50, #f8fafc)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            borderRadius: 'var(--radius-md, 6px)',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Username:</span>
            <div style={{ fontWeight: 700, color: 'var(--navy-900, #0f172a)' }}>{admin.email}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Temporary Password:</span>
            <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.125rem', fontFamily: 'monospace' }}>
              {tempPassModal.tempPassword}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setTempPassModal({ isOpen: false, tempPassword: '' })}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
