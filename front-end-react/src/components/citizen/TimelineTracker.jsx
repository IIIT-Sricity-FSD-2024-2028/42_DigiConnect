import React from 'react';

const DEFAULT_STAGES = [
  { label: 'Application Submitted', step: 1 },
  { label: 'Payment Confirmed', step: 2 },
  { label: 'Officer Verified', step: 3 },
  { label: 'Supervisor Review', step: 4 },
  { label: 'Approved / Completed', step: 5 },
];

export default function TimelineTracker({
  stages = DEFAULT_STAGES,
  currentStep = 1,
  status = 'submitted',
  events = [],
  showStageBar = true,
  showEvents = true,
}) {
  const normStatus = (status || '').toLowerCase().replace(/_/g, '-');
  const isApproved = ['approved', 'completed', 'certificate-generated'].includes(normStatus);
  const isRejected = normStatus === 'rejected';
  const isEscalated = normStatus === 'escalated';

  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
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
  };

  return (
    <div>
      {/* ── Horizontal Stage Bar ── */}
      {showStageBar && (
        <div className="stage-bar">
          {stages.map((s, idx) => {
            const stepNum = Number(s.step || idx + 1);
            let stStatus = '';

            if (isApproved) {
              stStatus = 'done';
            } else if (isRejected) {
              if (stepNum < currentStep) stStatus = 'done';
              else if (stepNum === currentStep) stStatus = 'breach';
            } else if (isEscalated) {
              if (stepNum < currentStep) stStatus = 'done';
              else if (stepNum === currentStep) stStatus = 'breach';
              else stStatus = 'active';
            } else {
              if (stepNum < currentStep) stStatus = 'done';
              else if (stepNum === currentStep) stStatus = 'active';
            }

            return (
              <div key={s.label || idx} className={`stage-node ${stStatus}`.trim()}>
                <div className="stage-circle">
                  {stStatus === 'done' ? (
                    <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : stStatus === 'active' ? (
                    <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : stStatus === 'breach' ? (
                    <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="stage-label">{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Vertical Event Timeline ── */}
      {showEvents && (
        <div className="timeline">
          {events.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '12px 0' }}>
              No timeline history recorded yet.
            </div>
          ) : (
            events.map((t, i) => {
              const actName = t.action || t.stepName || 'Status Update';
              const actLower = actName.toLowerCase();
              const isLast = i === events.length - 1;

              let dot = 'neutral';
              if (actLower.includes('escalat') || actLower.includes('reject') || actLower.includes('breach')) {
                dot = 'danger';
              } else if (actLower.includes('query')) {
                dot = 'warning';
              } else if (actLower.includes('approv') || actLower.includes('complet') || actLower.includes('submit')) {
                dot = 'success';
              } else if (isLast) {
                dot = isApproved ? 'success' : isRejected ? 'danger' : 'active';
              }

              const tDate = t.date || t.completedDate || t.createdAt;
              const tNote = t.note || t.remarks || '';
              const tActor = t.actor || '';

              return (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${dot}`}>
                    {dot === 'success' ? (
                      <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label">
                      {actName}
                      {tActor && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '6px', fontWeight: 500 }}>
                          — {tActor}
                        </span>
                      )}
                    </div>
                    {tNote && (
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--slate-600)',
                          background: 'var(--slate-50)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 10px',
                          marginTop: '4px',
                        }}
                      >
                        {tNote}
                      </div>
                    )}
                    <div className="timeline-time">{formatEventDate(tDate)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
