import React from 'react';

// Officer Action Decision Panel Component
export default function ActionPanel({ onApprove, onQuery, onReject }) {
  return (
    <div
      style={{
        padding: '16px',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <button
        type="button"
        className="btn btn-outline"
        style={{ borderColor: '#d97706', color: '#d97706' }}
        onClick={onQuery}
      >
        Raise Query
      </button>
      <button
        type="button"
        className="btn btn-danger"
        onClick={onReject}
      >
        Reject
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onApprove}
      >
        Approve Application
      </button>
    </div>
  );
}
