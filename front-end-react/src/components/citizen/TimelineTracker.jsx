import React from 'react';

// Citizen Timeline Tracker Component
export default function TimelineTracker({ steps = [], currentStep = 0 }) {
  const defaultSteps = [
    { title: 'Application Submitted', desc: 'Form received successfully' },
    { title: 'Document Verification', desc: 'Verification in progress' },
    { title: 'Officer Review', desc: 'Assigned to field officer' },
    { title: 'Final Decision', desc: 'Approval or query resolution' },
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="timeline-tracker" style={{ padding: '16px 0' }}>
      {displaySteps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '16px',
              opacity: isCompleted || isCurrent ? 1 : 0.5,
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: isCompleted ? '#22c55e' : isCurrent ? '#2557a0' : '#cbd5e1',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              {isCompleted ? '✓' : idx + 1}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{step.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{step.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
