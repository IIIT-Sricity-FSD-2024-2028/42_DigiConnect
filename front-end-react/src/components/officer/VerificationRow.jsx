import React from 'react';
import StatusBadge from '../common/StatusBadge';

// Officer Verification Row Component
export default function VerificationRow({ item, onVerify, onReject }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{item.title}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusBadge status={item.status} />
        {item.status === 'pending' && (
          <>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: '#22c55e', color: '#fff' }}
              onClick={() => onVerify && onVerify(item.id)}
            >
              Verify
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: '#ef4444', color: '#fff' }}
              onClick={() => onReject && onReject(item.id)}
            >
              Query
            </button>
          </>
        )}
      </div>
    </div>
  );
}
