// src/components/grievance/GrievanceTimeline.jsx
// React concepts used: Components, Props (history), Lists (.map), Semantic HTML (ol/li)
// Renders the chronological audit & action history for a grievance ticket as a semantic list.

import React from 'react';

/**
 * Formats ISO date string to a human-readable format: "15 Apr 2026, 04:00 PM".
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatTimelineDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

/**
 * Determines the timeline dot styling based on event status and action keyword conventions.
 * Completed historical events receive green markers ('success').
 * Current active events retain orange markers ('pending').
 * Pending events use neutral muted markers ('neutral').
 * Escalated/rejection events receive red markers ('danger').
 * @param {object|string} eventOrAction - History entry object or action description string
 * @returns {string} CSS class modifier for timeline dot ('success', 'pending', 'danger', 'neutral', 'info')
 */
function getDotClass(eventOrAction) {
  const entry = typeof eventOrAction === 'object' && eventOrAction !== null ? eventOrAction : { action: eventOrAction || '' };
  const status = String(entry.status || '').toLowerCase();
  const act = String(entry.action || '').toLowerCase();

  // 1. Explicit event status checks
  if (status === 'completed' || status === 'done' || status === 'resolved' || status === 'closed') {
    return 'success';
  }
  if (status === 'in_progress' || status === 'active' || status === 'investigating') {
    return 'pending';
  }
  if (status === 'pending' || status === 'waiting' || status === 'scheduled' || status === 'queued') {
    return 'neutral';
  }
  if (status === 'rejected' || status === 'escalated' || status === 'breach' || status === 'upheld') {
    return 'danger';
  }

  // 2. Action keyword conventions
  // Rejected / Escalated / Breach / Uphold Rejection
  if (act.includes('reject') || act.includes('breach') || act.includes('uphold') || act.includes('escalat')) {
    return 'danger';
  }

  // Current active / in-progress events retain an orange marker (e.g. Investigation Initiated)
  if (
    act.includes('investigat') ||
    act.includes('re-verif') ||
    act.includes('reopen') ||
    act.includes('query') ||
    act.includes('in progress')
  ) {
    return 'pending';
  }

  // Pending events use neutral muted color
  if (act.includes('pending') || act.includes('awaiting') || act.includes('queued') || act.includes('scheduled')) {
    return 'neutral';
  }

  // Completed historical events receive green markers (e.g. Grievance Filed, Assigned to Cell, Resolved)
  if (
    act.includes('filed') ||
    act.includes('assign') ||
    act.includes('submit') ||
    act.includes('resolv') ||
    act.includes('overrule') ||
    act.includes('cert') ||
    act.includes('approv') ||
    act.includes('complet')
  ) {
    return 'success';
  }

  return 'neutral';
}

/**
 * GrievanceTimeline Component
 * Props:
 *   history {Array} - Array of history entries: [{ action, date, actor, note }]
 */
export default function GrievanceTimeline({ history = [] }) {
  // Graceful fallback for empty or missing history
  if (!history || !Array.isArray(history) || history.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-xl) var(--space-md)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
          background: 'var(--slate-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)',
        }}
      >
        No grievance history recorded yet.
      </div>
    );
  }

  return (
    <ol className="timeline" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {history.map((entry, index) => {
        const action = entry.action || 'Action Recorded';
        const date = entry.date || entry.createdAt || '';
        const actor = entry.actor || entry.actorName || '';
        const note = entry.note || entry.remarks || entry.resolutionNote || '';
        const dotModifier = getDotClass(entry);

        return (
          <li key={entry.id || `${action}-${index}`} className="timeline-item">
            {/* Dot Indicator */}
            <div className={`timeline-dot ${dotModifier}`}>
              {dotModifier === 'success' ? (
                <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : dotModifier === 'danger' ? (
                <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Timeline Content */}
            <div className="timeline-content">
              <div className="timeline-label" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{action}</span>
                {actor && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--navy-600)',
                      background: 'var(--navy-50)',
                      border: '1px solid var(--navy-200)',
                      borderRadius: 'var(--radius-full)',
                      padding: '1px 8px',
                    }}
                  >
                    {actor}
                  </span>
                )}
              </div>

              {/* Remarks / Note Block */}
              {note && (
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--slate-700)',
                    background: 'var(--slate-50)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    marginTop: '6px',
                    lineHeight: 1.5,
                  }}
                >
                  {note}
                </div>
              )}

              {/* Timestamp */}
              <div className="timeline-time" style={{ marginTop: '4px' }}>
                {formatTimelineDate(date)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
