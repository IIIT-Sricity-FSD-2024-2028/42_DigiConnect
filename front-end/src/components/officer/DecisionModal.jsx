// src/components/officer/DecisionModal.jsx
// Decision confirmation modal for officer review workflow.
// Built on top of src/components/common/Modal.jsx
//
// React Concepts Demonstrated:
//  [Component]     — DecisionModal is a self-contained presentational + form component
//  [Props]         — Receives isOpen, onClose, onConfirm, decision, app, form state, and change callbacks via prop drilling
//  [State]         — No local state; all state is owned by the parent (ReviewApplicationPage) and passed down as props
//  [Events]        — onChange on textarea/select form elements, onClick on action buttons
//  [Lists]         — REJECTION_REASONS rendered as <option> list via .map()
//  [Hooks]         — None needed (no local state or effects)
//  [Forms]         — Controlled inputs: remarks textarea, rejection reason select, query textarea
//  [Prop Drilling] — form values (rejectReason, queryText, officerRemarks) and setters passed from parent
//  [Callbacks]     — onClose and onConfirm fire parent-owned handler functions

import React from 'react';
import Modal from '../common/Modal';

// ── Rejection reason options list ──
const REJECTION_REASONS = [
  { value: '', label: '— Select a reason —' },
  { value: 'insufficient_documents', label: 'Insufficient Documents' },
  { value: 'duplicate_application',  label: 'Duplicate Application' },
  { value: 'data_mismatch',          label: 'Data Mismatch / Inconsistency' },
  { value: 'ineligible_applicant',   label: 'Applicant Not Eligible' },
  { value: 'invalid_address',        label: 'Invalid or Unverified Address' },
  { value: 'expired_documents',      label: 'Expired Supporting Documents' },
  { value: 'other',                  label: 'Other (specify in remarks)' },
];

// ─── Small inline section header used inside the modal body ───
function SectionLabel({ children }) {
  return (
    <p
      style={{
        margin: '0 0 6px 0',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--slate-500, #64748b)',
      }}
    >
      {children}
    </p>
  );
}

// ─── Approve Workflow Body ─────────────────────────────────────
// Props (via prop drilling from ReviewApplicationPage):
//   app            — current application object
//   officerRemarks — controlled textarea value
//   onRemarksChange — callback to update remarks in parent
function ApproveBody({ app, officerRemarks, onRemarksChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Confirmation summary */}
      <div
        style={{
          background: 'var(--green-50, #f0fdf4)',
          border: '1.5px solid var(--green-200, #bbf7d0)',
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        {/* Checkmark icon */}
        <svg width="20" height="20" fill="none" stroke="var(--green-600, #16a34a)" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '1px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: 'var(--green-800, #166534)', fontSize: '0.9rem' }}>
            Approve Application
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--green-700, #15803d)', lineHeight: 1.5 }}>
            You are about to <strong>approve</strong> application <strong>{app?.id}</strong> for{' '}
            <strong>{app?.serviceType || app?.type || 'this service'}</strong>. The citizen will be
            notified and the certificate will be queued for issuance.
          </p>
        </div>
      </div>

      {/* Issuance info notice */}
      <div
        style={{
          background: 'var(--blue-50, #eff6ff)',
          border: '1px solid var(--blue-200, #bfdbfe)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '0.82rem',
          color: 'var(--blue-700, #1d4ed8)',
          lineHeight: 1.5,
        }}
      >
        <strong>📄 Certificate Issuance:</strong> The digital certificate will be generated within
        1–2 business days and made available to the citizen on their DigiConnect portal.
      </div>

      {/* Officer remarks (optional) */}
      <div>
        <SectionLabel>Officer Remarks (Optional)</SectionLabel>
        <textarea
          id="approve-remarks"
          value={officerRemarks}
          onChange={onRemarksChange}
          placeholder="Add internal notes or verification remarks (optional)…"
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1.5px solid var(--slate-200, #e2e8f0)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            color: 'var(--navy-900, #0f172a)',
            background: 'var(--slate-50, #f8fafc)',
            boxSizing: 'border-box',
            outline: 'none',
            lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  );
}

// ─── Reject Workflow Body ──────────────────────────────────────
// Props (via prop drilling from ReviewApplicationPage):
//   app              — current application object
//   rejectReason     — controlled select value
//   officerRemarks   — controlled textarea value
//   onReasonChange   — callback for rejection reason select
//   onRemarksChange  — callback for remarks textarea
function RejectBody({ app, rejectReason, officerRemarks, onReasonChange, onRemarksChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Warning summary */}
      <div
        style={{
          background: 'var(--red-50, #fef2f2)',
          border: '1.5px solid var(--red-200, #fecaca)',
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <svg width="20" height="20" fill="none" stroke="var(--red-600, #dc2626)" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '1px' }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <div>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: 'var(--red-800, #991b1b)', fontSize: '0.9rem' }}>
            Reject Application
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--red-700, #b91c1c)', lineHeight: 1.5 }}>
            You are about to <strong>reject</strong> application <strong>{app?.id}</strong>. The
            citizen will be notified with the reason below and may reapply after rectification.
          </p>
        </div>
      </div>

      {/* Mandatory: Rejection reason dropdown */}
      <div>
        <SectionLabel>Rejection Reason <span style={{ color: 'var(--red-500, #ef4444)' }}>*</span></SectionLabel>
        <select
          id="reject-reason-select"
          value={rejectReason}
          onChange={onReasonChange}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1.5px solid ${!rejectReason ? 'var(--red-400, #f87171)' : 'var(--slate-200, #e2e8f0)'}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            color: rejectReason ? 'var(--navy-900, #0f172a)' : 'var(--slate-400, #94a3b8)',
            background: 'var(--slate-50, #f8fafc)',
            boxSizing: 'border-box',
            cursor: 'pointer',
          }}
        >
          {/* [Lists] Render rejection options via .map() */}
          {REJECTION_REASONS.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
        {!rejectReason && (
          <p style={{ margin: '5px 0 0 2px', fontSize: '0.75rem', color: 'var(--red-500, #ef4444)' }}>
            A rejection reason is required before submitting.
          </p>
        )}
      </div>

      {/* Optional: Detailed remarks */}
      <div>
        <SectionLabel>Detailed Remarks (Optional)</SectionLabel>
        <textarea
          id="reject-remarks"
          value={officerRemarks}
          onChange={onRemarksChange}
          placeholder="Describe in detail what the citizen needs to rectify or resubmit…"
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1.5px solid var(--slate-200, #e2e8f0)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            color: 'var(--navy-900, #0f172a)',
            background: 'var(--slate-50, #f8fafc)',
            boxSizing: 'border-box',
            outline: 'none',
            lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  );
}

// ─── Raise Query Workflow Body ─────────────────────────────────
// Props (via prop drilling from ReviewApplicationPage):
//   app            — current application object
//   queryText      — controlled textarea value
//   onQueryChange  — callback to update query text in parent
function QueryBody({ app, queryText, onQueryChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Info summary */}
      <div
        style={{
          background: 'var(--amber-50, #fffbeb)',
          border: '1.5px solid var(--amber-200, #fde68a)',
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <svg width="20" height="20" fill="none" stroke="var(--amber-600, #d97706)" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '1px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: 'var(--amber-800, #92400e)', fontSize: '0.9rem' }}>
            Raise a Query
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--amber-700, #b45309)', lineHeight: 1.5 }}>
            A query will be sent to <strong>{app?.citizen || app?.citizenName || 'the citizen'}</strong> for
            application <strong>{app?.id}</strong>. The application will be put on hold until a
            response is received.
          </p>
        </div>
      </div>

      {/* Query textarea */}
      <div>
        <SectionLabel>Query / Clarification Required <span style={{ color: 'var(--red-500, #ef4444)' }}>*</span></SectionLabel>
        <textarea
          id="query-text"
          value={queryText}
          onChange={onQueryChange}
          placeholder="Describe what document, information, or clarification is needed from the citizen…"
          rows={4}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1.5px solid ${!queryText.trim() ? 'var(--amber-400, #fbbf24)' : 'var(--slate-200, #e2e8f0)'}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            color: 'var(--navy-900, #0f172a)',
            background: 'var(--slate-50, #f8fafc)',
            boxSizing: 'border-box',
            outline: 'none',
            lineHeight: 1.5,
          }}
        />
        {!queryText.trim() && (
          <p style={{ margin: '5px 0 0 2px', fontSize: '0.75rem', color: 'var(--amber-600, #d97706)' }}>
            Please describe the query before sending.
          </p>
        )}
      </div>

      {/* Response deadline notice */}
      <div
        style={{
          background: 'var(--slate-50, #f8fafc)',
          border: '1px solid var(--slate-200, #e2e8f0)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.82rem',
          color: 'var(--slate-600, #475569)',
          lineHeight: 1.5,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          <strong>Response deadline:</strong> The citizen has <strong>3 business days</strong> to
          respond. If no response is received, the application will be auto-escalated to a supervisor.
        </span>
      </div>
    </div>
  );
}

// ─── DecisionModal — Main Export ──────────────────────────────
//
// Props (all passed via prop drilling from ReviewApplicationPage):
//   isOpen          {boolean}   — controls Modal visibility
//   onClose         {function}  — callback: parent closes the modal
//   onConfirm       {function}  — callback: parent runs the API submission
//   decision        {string}    — 'approve' | 'reject' | 'query'
//   app             {object}    — current application object
//   submitting      {boolean}   — true while API call is in progress
//   rejectReason    {string}    — controlled value for reject reason select
//   onReasonChange  {function}  — callback: update rejectReason in parent
//   queryText       {string}    — controlled value for query textarea
//   onQueryChange   {function}  — callback: update queryText in parent
//   officerRemarks  {string}    — controlled value for remarks textarea
//   onRemarksChange {function}  — callback: update officerRemarks in parent
export default function DecisionModal({
  isOpen,
  onClose,
  onConfirm,
  decision,
  app,
  submitting,
  rejectReason,
  onReasonChange,
  queryText,
  onQueryChange,
  officerRemarks,
  onRemarksChange,
}) {
  // ── Derive modal config from the decision type ──
  const config = {
    approve: {
      title: '✅ Confirm Approval',
      confirmLabel: 'Approve Application',
      confirmColor: 'var(--green-600, #16a34a)',
      confirmHover: 'var(--green-700, #15803d)',
      maxWidth: '560px',
      // Disable confirm only while submitting
      isDisabled: submitting,
    },
    reject: {
      title: '❌ Confirm Rejection',
      confirmLabel: 'Reject Application',
      confirmColor: 'var(--red-600, #dc2626)',
      confirmHover: 'var(--red-700, #b91c1c)',
      maxWidth: '560px',
      // Disable confirm if no reason selected or while submitting
      isDisabled: submitting || !rejectReason,
    },
    query: {
      title: '💬 Send Query to Citizen',
      confirmLabel: 'Send Query',
      confirmColor: 'var(--amber-600, #d97706)',
      confirmHover: 'var(--amber-700, #b45309)',
      maxWidth: '560px',
      // Disable confirm if query is empty or while submitting
      isDisabled: submitting || !queryText.trim(),
    },
  };

  const active = config[decision] || config.approve;

  // ── Footer: Cancel + Confirm buttons passed as a prop to Modal ──
  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
      {/* Cancel — [Events + Callbacks] */}
      <button
        id="decision-modal-cancel"
        type="button"
        onClick={onClose}
        disabled={submitting}
        style={{
          padding: '9px 20px',
          borderRadius: '8px',
          border: '1.5px solid var(--slate-300, #cbd5e1)',
          background: '#fff',
          color: 'var(--slate-700, #334155)',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      >
        Cancel
      </button>

      {/* Confirm — [Events + Callbacks] */}
      <button
        id="decision-modal-confirm"
        type="button"
        onClick={onConfirm}
        disabled={active.isDisabled}
        style={{
          padding: '9px 24px',
          borderRadius: '8px',
          border: 'none',
          background: active.isDisabled ? 'var(--slate-300, #cbd5e1)' : active.confirmColor,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.875rem',
          cursor: active.isDisabled ? 'not-allowed' : 'pointer',
          opacity: 1,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background 0.15s ease',
        }}
      >
        {submitting && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
        {submitting ? 'Submitting…' : active.confirmLabel}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={active.title}
      footer={footer}
      maxWidth={active.maxWidth}
      showCloseButton={!submitting}
    >
      {/* [Component] Render the correct workflow body based on decision prop */}
      {decision === 'approve' && (
        <ApproveBody
          app={app}
          officerRemarks={officerRemarks}
          onRemarksChange={onRemarksChange}
        />
      )}

      {decision === 'reject' && (
        <RejectBody
          app={app}
          rejectReason={rejectReason}
          officerRemarks={officerRemarks}
          onReasonChange={onReasonChange}
          onRemarksChange={onRemarksChange}
        />
      )}

      {decision === 'query' && (
        <QueryBody
          app={app}
          queryText={queryText}
          onQueryChange={onQueryChange}
        />
      )}
    </Modal>
  );
}
