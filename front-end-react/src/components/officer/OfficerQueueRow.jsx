// src/components/officer/OfficerQueueRow.jsx
// Renders a single application row inside the officer's pending queue.
// Matches the layout from front-end/officer/officer-dashboard.html and dashboard.js.
//
// React Concepts Demonstrated:
//  [Component]     — OfficerQueueRow is a self-contained, reusable component
//  [Props]         — Receives `application` data and `onSelect` callback from parent
//  [State]         — useState tracks whether the SLA tooltip is expanded
//  [Events]        — onClick on the row, onMouseEnter/Leave on SLA bar
//  [Hooks]         — useState for local tooltip state
//  [Context]       — useAuth reads logged-in officer name from AuthContext
//  [Router]        — useNavigate navigates to /officer/review/:id on row click
//  [Prop Drilling] — onSelect is drilled: OfficerDashboard → OfficerQueueTable → OfficerQueueRow
//  [Callbacks]     — onSelect(application.id) is called when row is clicked

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Helper: Compute SLA urgency color from days remaining ──
function getSlaColor(slaLeft) {
  if (slaLeft < 0) return 'var(--red-500)';
  if (slaLeft <= 2) return 'var(--amber-400)';
  if (slaLeft <= 4) return 'var(--orange-300, #fdba74)';
  return 'var(--slate-200)';
}

// ── Helper: Compute the human-readable SLA label ──
function getSlaLabel(slaLeft) {
  if (slaLeft < 0) return `${Math.abs(slaLeft)}d overdue`;
  if (slaLeft <= 2) return `${slaLeft}d left ⚠`;
  return `${slaLeft} days left`;
}

// ── Helper: Compute SLA text color for the label ──
function getSlaTextColor(slaLeft) {
  if (slaLeft < 0) return 'var(--red-500)';
  if (slaLeft <= 2) return 'var(--amber-600)';
  return 'var(--green-600)';
}

// ── Helper: Compute percentage of SLA time used (clamped 5–100%) ──
function getSlaPercent(slaLeft, slaTotal) {
  if (!slaTotal) return 5;
  return Math.max(5, Math.min(100, (slaLeft / Math.max(slaTotal, 1)) * 100));
}

// ── Helper: Map status to badge class & label ──
function getStatusBadge(status) {
  if (status === 'new') return { className: 'badge badge-info', text: 'New' };
  if (status === 'urgent') return { className: 'badge badge-danger', text: 'Urgent' };
  return { className: 'badge badge-warning', text: 'In Review' };
}

export default function OfficerQueueRow({ application, onSelect }) {
  // [State] Controls whether the SLA tooltip detail is visible
  const [showSlaTooltip, setShowSlaTooltip] = useState(false);

  // [Context] Read the logged-in officer's name from AuthContext
  const { user } = useAuth();

  // [Router] Used to navigate to the review page when row is clicked
  const navigate = useNavigate();

  // Destructure application properties
  const {
    id,
    service,
    citizen,
    submitted,
    slaLeft = 0,
    slaTotal = 7,
    status = 'in_review',
  } = application;

  // Pre-compute SLA display values
  const slaColor     = getSlaColor(slaLeft);
  const slaLabel     = getSlaLabel(slaLeft);
  const slaTextColor = getSlaTextColor(slaLeft);
  const slaPercent   = getSlaPercent(slaLeft, slaTotal);
  const badge        = getStatusBadge(status);

  // ── [Event + Router + Callback] Row click handler ──
  function handleRowClick() {
    if (onSelect) onSelect(id);
    navigate(`/officer/review/${id}`);
  }

  return (
    <div
      className="app-row"
      onClick={handleRowClick}
      title={`Click to review application ${id}`}
    >
      {/* ── Priority Color Bar (left edge, color = SLA urgency) ── */}
      <div
        className="priority-bar"
        style={{ background: slaColor }}
      />

      {/* ── Middle: App ID, Status Badge, Service Name, Citizen Info ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: App ID + Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-600)' }}>
            {id}
          </span>
          <span className={badge.className}>
            {badge.text}
          </span>
        </div>

        {/* Row 2: Service Name */}
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)' }}>
          {service}
        </div>

        {/* Row 3: Citizen Name + Submitted Date */}
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {citizen} &nbsp;·&nbsp; Submitted {submitted}
        </div>
      </div>

      {/* ── Right: SLA Indicator ── */}
      <div
        style={{ textAlign: 'right', flexShrink: 0, position: 'relative' }}
        onMouseEnter={() => setShowSlaTooltip(true)}
        onMouseLeave={() => setShowSlaTooltip(false)}
      >
        {/* SLA Label text */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: slaTextColor }}>
          {slaLabel}
        </div>

        {/* SLA Progress Bar */}
        <div className="sla-bar" style={{ width: '80px', height: '4px', marginTop: '5px', marginLeft: 'auto' }}>
          <div
            className={`sla-fill ${slaLeft < 0 ? 'breach' : slaLeft <= 2 ? 'warn' : 'safe'}`}
            style={{ width: `${slaPercent}%` }}
          />
        </div>

        {/* SLA Tooltip on Hover */}
        {showSlaTooltip && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '4px',
              background: 'var(--navy-900)',
              color: '#fff',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              zIndex: 10,
              lineHeight: 1.6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <div>Assigned to: {user?.name || 'You'}</div>
            <div>SLA: {slaTotal} day{slaTotal !== 1 ? 's' : ''} total</div>
            <div>{slaLeft < 0 ? `${Math.abs(slaLeft)} days overdue` : `${slaLeft} of ${slaTotal} remaining`}</div>
          </div>
        )}
      </div>
    </div>
  );
}
