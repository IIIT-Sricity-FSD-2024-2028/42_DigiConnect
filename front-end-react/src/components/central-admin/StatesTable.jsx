// src/components/central-admin/StatesTable.jsx
// Directory Table for State Governments registered in the DigiConnect federation
// React concepts: Components, Props, Callbacks, Conditional Rendering, Number/Currency formatting

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatINR, formatNum, formatCompactNum } from '../../api/nationalAnalyticsService';

export default function StatesTable({
  states = [],
  onToggleStatus,
  onResetPassword,
}) {

  if (!states || states.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: '#ffffff',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--slate-200, #e2e8f0)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏛️</div>
        <div style={{ fontWeight: 700, color: 'var(--navy-900, #0f172a)', fontSize: '1rem' }}>
          No State Governments Found
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500, #64748b)', marginTop: '4px' }}>
          Try adjusting your search query or status filter.
        </div>
      </div>
    );
  }

  return (
    <div className="table-container" style={{ overflowX: 'auto', background: '#ffffff', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--slate-200, #e2e8f0)' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'var(--slate-50, #f8fafc)', borderBottom: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>State</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Government Entity</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>State Admin</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Status</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Depts</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Citizens</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Applications</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)' }}>Revenue</th>
            <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--slate-700, #334155)', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {states.map((s) => {
            const isActive = (s.status || '').toUpperCase() === 'ACTIVE';
            return (
              <tr
                key={s.id || s.code}
                style={{
                  borderBottom: '1px solid var(--slate-100, #f1f5f9)',
                  transition: 'background-color 0.15s',
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy-900, #0f172a)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏛️</span>
                    <span>{s.name}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        background: 'var(--slate-100, #f1f5f9)',
                        color: 'var(--slate-700, #334155)',
                        borderRadius: '4px',
                      }}
                    >
                      {s.code}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--slate-700, #334155)', fontWeight: 500 }}>
                  {s.governmentName || `Government of ${s.name}`}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy-800, #1e293b)' }}>
                    {s.stateAdminName || s.stateAdmin?.name || `${s.name} State Admin IAS`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                    {s.stateAdminEmail || s.stateAdmin?.email || `admin@${(s.code || '').toLowerCase()}.gov.in`}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                  {s.departmentsCount ?? s.departments?.length ?? 0}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <span title={formatNum(s.citizensCount || s.citizens || 0)}>
                    {formatCompactNum(s.citizensCount || s.citizens || 0)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <span title={formatNum(s.applicationsCount || s.totalApplications || s.apps || 0)}>
                    {formatCompactNum(s.applicationsCount || s.totalApplications || s.apps || 0)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>
                  <span title={formatINR(s.revenue || s.totalRevenue || 0)}>
                    {formatINR(s.revenue || s.totalRevenue || 0, true)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                    <Link
                      to={`/central-admin/states/${s.id || s.code}`}
                      className="btn btn-ghost btn-sm"
                      style={{ fontWeight: 700, padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      View
                    </Link>
                    {onResetPassword && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--slate-600, #475569)' }}
                        title="Reset Administrator temporary credentials"
                        onClick={() => onResetPassword(s)}
                      >
                        Reset PW
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          color: isActive ? '#ef4444' : '#16a34a',
                          borderColor: isActive ? '#fecaca' : '#bbf7d0',
                        }}
                        onClick={() => onToggleStatus(s)}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
