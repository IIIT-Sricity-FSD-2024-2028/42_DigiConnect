import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { hideToast as hideToastAction, selectToast } from '../../store/slices/uiSlice';

// Icons for each toast type
function ToastIcon({ type }) {
  if (type === 'error') {
    return (
      <svg width="20" height="20" fill="none" stroke="var(--red-500, #ef4444)" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  if (type === 'warning') {
    return (
      <svg width="20" height="20" fill="none" stroke="var(--amber-500, #f59e0b)" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  if (type === 'info') {
    return (
      <svg width="20" height="20" fill="none" stroke="var(--blue-500, #3b82f6)" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  // default: success
  return (
    <svg width="20" height="20" fill="none" stroke="var(--green-500, #10b981)" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function getBorderColor(type) {
  if (type === 'error')   return 'var(--red-500, #ef4444)';
  if (type === 'warning') return 'var(--amber-500, #f59e0b)';
  if (type === 'info')    return 'var(--blue-500, #3b82f6)';
  return 'var(--green-500, #10b981)'; // success
}

// Props:
//   toast    — optional { message: string, type: 'success'|'error'|'warning'|'info' }
//              If omitted, toast state is read directly from Redux store.
//   onClose  — optional callback function to dismiss the toast.
//              If omitted, dispatches hideToast action to Redux store.
function Toast({ toast: propToast, onClose: propOnClose }) {
  const dispatch = useAppDispatch();
  const reduxToast = useAppSelector(selectToast);

  const activeToast =
    propToast !== undefined
      ? propToast
      : reduxToast?.visible
      ? { id: reduxToast.id, message: reduxToast.message, type: reduxToast.type }
      : null;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      dispatch(hideToastAction());
    }
  };

  // [Component] render nothing when there is no toast or visible is false
  if (!activeToast || activeToast.visible === false) return null;

  const cssType = activeToast.type === 'error' ? 'danger' : (activeToast.type || 'info');

  return (
    <div
      id="toast-container"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: 'min(460px, calc(100vw - 32px))',
        pointerEvents: 'none',
      }}
    >
      <div
        key={activeToast.id !== undefined ? activeToast.id : activeToast.message}
        className={`toast toast-${cssType}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 12px 30px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
          borderLeft: `5px solid ${getBorderColor(activeToast.type)}`,
          color: 'var(--navy-900, #0f172a)',
          minWidth: '280px',
          maxWidth: '100%',
          pointerEvents: 'auto',
          wordBreak: 'break-word',
        }}
      >
        {/* Status Icon */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <ToastIcon type={activeToast.type} />
        </div>

        {/* Toast Text */}
        <span style={{ flex: 1, lineHeight: 1.4, color: 'var(--navy-900, #0f172a)' }}>
          {activeToast.message}
        </span>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss notification"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--slate-400, #94a3b8)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '2px 4px',
            lineHeight: 1,
            marginLeft: '6px',
          }}
          title="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
