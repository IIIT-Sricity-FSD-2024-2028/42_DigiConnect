import React from 'react';
import { Link } from 'react-router-dom';
import { checkStatusCategory } from '../common/StatusBadge';

export default function ApplicationRow({ app, onWithdraw }) {
  if (!app) return null;

  // Normalized status and badge styling
  const statusInfo = checkStatusCategory(app.status);
  const isApproved = statusInfo.isApproved;
  const isRejected = statusInfo.isRejected;
  const isQuery = statusInfo.isQuery;
  const isEscalated = statusInfo.isEscalated;
  const isDraft = statusInfo.isDraft;

  const statusClass = statusInfo.badgeClass;
  const statusLabel = statusInfo.badgeLabel;

  // Service type styling tag
  const rawType = (app.serviceType || app.category || 'certificate').toLowerCase();
  const typeMap = {
    certificate: { label: 'Certificate', className: 'svc-certificate' },
    welfare: { label: 'Welfare', className: 'svc-welfare' },
    permission: { label: 'Permission', className: 'svc-permission' },
    record: { label: 'Correction', className: 'svc-record' },
    correction: { label: 'Correction', className: 'svc-record' },
  };
  const typeInfo = typeMap[rawType] || { label: rawType, className: 'svc-certificate' };

  // Formatted date
  const submittedDate = app.submittedDate || app.appliedDate || app.createdAt;
  const formattedDate = submittedDate
    ? new Date(submittedDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  // SLA calculations
  const daysRemaining = app.daysLeft !== undefined && app.daysLeft !== null ? app.daysLeft : 7;
  const isClosed = isApproved || isRejected;

  const slaText = isClosed
    ? isRejected
      ? 'Rejected'
      : 'Closed'
    : daysRemaining >= 0
    ? `${daysRemaining} days left`
    : `${Math.abs(daysRemaining)} days overdue`;

  const slaCls = isClosed
    ? isRejected
      ? 'breach'
      : 'safe'
    : daysRemaining > 4
    ? 'safe'
    : daysRemaining >= 0
    ? 'warn'
    : 'breach';

  const slaWidth = isClosed ? 100 : Math.max(10, Math.min(100, Math.max(0, daysRemaining) * 10));

  const officerName = app.officerName || app.assignedOfficerName || app.officer || '—';
  const dept = app.dept || app.departmentName || app.department || '—';

  return (
    <tr>
      <td className="app-id" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy-600)' }}>
        {app.id}
      </td>
      <td>
        <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{app.serviceName || 'Government Service'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{dept}</div>
      </td>
      <td>
        <span className={`service-tag ${typeInfo.className}`}>
          {typeInfo.label}
        </span>
      </td>
      <td>
        <span className={`badge ${statusClass}`}>
          {statusLabel}
        </span>
      </td>
      <td>{formattedDate}</td>
      <td>
        <div className="sla-wrap" style={{ minWidth: '90px' }}>
          <div className="sla-bar-bg">
            <div className={`sla-bar-fill ${slaCls}`} style={{ width: `${slaWidth}%` }}></div>
          </div>
          <div className={`sla-text ${slaCls}`}>{slaText}</div>
        </div>
      </td>
      <td>{officerName}</td>
      <td>
        <div className="row-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link
            to={`/citizen/track?id=${app.id}`}
            className="icon-btn"
            title="Track Application"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          {isDraft && onWithdraw && (
            <button
              type="button"
              className="icon-btn"
              style={{ color: 'var(--red-500)' }}
              title="Withdraw Application"
              onClick={() => onWithdraw(app)}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
