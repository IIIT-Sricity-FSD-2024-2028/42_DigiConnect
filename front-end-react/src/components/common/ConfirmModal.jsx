// src/components/common/ConfirmModal.jsx
// Reusable accessible confirmation dialog component built on Modal.jsx.
// Provides non-blocking modal confirmation with clear Cancel and Confirm actions.

import React from 'react';
import Modal from './Modal';

/**
 * ConfirmModal
 *
 * Props:
 *   isOpen         {boolean}  - Controls dialog visibility
 *   onClose        {function} - Callback when cancelling / closing
 *   onConfirm      {function} - Callback when confirming the action
 *   title          {string}   - Modal title (default: 'Confirm Action')
 *   message        {string}   - Detailed message/prompt describing the action
 *   confirmText    {string}   - Confirm button label (default: 'Confirm')
 *   cancelText     {string}   - Cancel button label (default: 'Cancel')
 *   confirmVariant {string}   - 'primary' | 'danger' (default: 'primary')
 *   loading        {boolean}  - Disables actions and displays loading state
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}) {
  const confirmBtnClass = confirmVariant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      maxWidth="480px"
      footer={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={confirmBtnClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      }
    >
      <div style={{ padding: '8px 0', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--slate-700)' }}>
        {message}
      </div>
    </Modal>
  );
}
