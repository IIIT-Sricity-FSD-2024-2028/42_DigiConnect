// src/components/common/Modal.jsx
// Universal State-driven Modal dialog component for DigiConnect.
// React concepts: Components, Props, Events (onClick, onKeyDown), Hooks (useEffect), Callbacks (onClose)

import React, { useEffect } from 'react';

/**
 * Reusable Modal dialog component.
 *
 * Props:
 *   isOpen          {boolean}   - Controls modal visibility
 *   onClose         {function}  - Callback triggered when closing the modal
 *   title           {string}    - Modal title displayed in header
 *   children        {ReactNode} - Body content
 *   footer          {ReactNode} - Optional action buttons (Cancel, Confirm, Submit)
 *   maxWidth        {string}    - Optional custom max-width (default: '560px')
 *   showCloseButton {boolean}   - Whether to display the '×' button (default: true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '560px',
  showCloseButton = true,
}) {
  // [Hooks / useEffect] Close on Escape key press and prevent background scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        // Close modal when clicking the backdrop outside of the modal dialog
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal" style={{ maxWidth }}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title" style={{ margin: 0, color: 'var(--navy-900)' }}>
            {title}
          </h3>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              aria-label="Close dialog"
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                lineHeight: 1,
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ color: 'var(--color-text)' }}>
          {children}
        </div>

        {/* Modal Footer (Optional) */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
