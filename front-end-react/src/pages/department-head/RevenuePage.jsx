// src/pages/department-head/RevenuePage.jsx
// Department Revenue & Financial Collections Page
// Reference: front-end/department-head/revenue.html
// React concepts: Components, Props, State (useState), Hooks (useEffect), Lists (map), Context (useAuth), API calls (apiGetDeptRevenue)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiGetDeptRevenue } from '../../api/departmentHeadApi';
import StatCard from '../../components/common/StatCard';

export default function RevenuePage() {
  const { user } = useAuth();
  const departmentId = user?.departmentId || '';
  const departmentName = user?.dept || 'Department';

  const [revData, setRevData] = useState({
    totalRevenue: 0,
    totalServiceFee: 0,
    totalPlatformFee: 0,
    paidTransactionsCount: 0,
    serviceBreakdown: [],
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadRevenue() {
      setLoading(true);
      setError('');
      try {
        const res = await apiGetDeptRevenue(departmentId);
        if (isMounted && res?.data) {
          setRevData(res.data);
        }
      } catch (err) {
        console.error('Error fetching department revenue:', err);
        if (isMounted) setError('Failed to load revenue analytics.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRevenue();
    return () => {
      isMounted = false;
    };
  }, [departmentId]);

  return (
    <div className="dept-revenue-page">
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div>
          <h1 className="page-title">Department Revenue &amp; Financials</h1>
          <p className="page-subtitle">
            {departmentName} · Real-time statutory fees, portal shares, and financial receipts ledger
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <StatCard
          title="Total Treasury Collections"
          value={`₹${(revData.totalRevenue || 0).toLocaleString()}`}
          subtitle="Combined fees collected"
          variant="accent"
          icon={<span>💰</span>}
          iconColor="purple"
        />
        <StatCard
          title="Department Fee Realized"
          value={`₹${(revData.totalServiceFee || 0).toLocaleString()}`}
          subtitle="Direct departmental share"
          icon={<span>🏛️</span>}
          iconColor="green"
        />
        <StatCard
          title="e-Governance Platform Share"
          value={`₹${(revData.totalPlatformFee || 0).toLocaleString()}`}
          subtitle="Portal maintenance share"
          icon={<span>💻</span>}
          iconColor="blue"
        />
        <StatCard
          title="Paid Transactions"
          value={revData.paidTransactionsCount || 0}
          subtitle="Completed citizen payments"
          icon={<span>🧾</span>}
          iconColor="amber"
        />
      </div>

      {/* Revenue Transactions Ledger */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">Citizen Payment Transactions Ledger</span>
          <span className="badge badge-success">Live Treasury Sync</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Application Ref</th>
                  <th>Service</th>
                  <th>Dept Fee</th>
                  <th>Portal Fee</th>
                  <th>Total Paid</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      Loading revenue transaction records...
                    </td>
                  </tr>
                ) : !revData.transactions || revData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                      No financial transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  revData.transactions.map((tx, idx) => (
                    <tr key={tx.id || idx}>
                      <td><code>{tx.transactionId || tx.id}</code></td>
                      <td><strong>{tx.applicationId || tx.appRef || 'APP-REV-001'}</strong></td>
                      <td>{tx.serviceName || 'Revenue Service'}</td>
                      <td><span style={{ color: '#166534', fontWeight: 600 }}>₹{tx.serviceFee != null ? tx.serviceFee : (tx.amount ? Math.round(tx.amount * 0.7) : 0)}</span></td>
                      <td><span style={{ color: '#1e40af', fontWeight: 600 }}>₹{tx.platformFee != null ? tx.platformFee : (tx.amount ? Math.round(tx.amount * 0.3) : 0)}</span></td>
                      <td><strong style={{ color: '#6b21a8' }}>₹{tx.totalAmount || tx.amount || 0}</strong></td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>
                        {tx.date || new Date().toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
