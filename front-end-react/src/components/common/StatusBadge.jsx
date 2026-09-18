// src/components/common/StatusBadge.jsx
// Universal Status Badge component and status helper for DigiConnect.
// React concepts: Components, Props

import React from 'react';

/**
 * Normalizes an application status string and categorizes it into standard buckets.
 * @param {string} statusStr - Raw status from backend (e.g. 'QUERY_RAISED', 'under-review', 'certificate-generated')
 * @returns {Object} Categorization flags, normalized slug, and corresponding badge class & label
 */
export function checkStatusCategory(statusStr) {
  const s = (statusStr || '').toLowerCase().trim().replace(/[\s_]+/g, '-');

  const isApproved = [
    'approved',
    'completed',
    'certificate-generated',
    'certificate_generated',
    'issued',
  ].includes(s);

  const isQuery = [
    'query',
    'query-raised',
    'query_raised',
    'action-required',
    'needs-response',
  ].includes(s);

  const isRejected = ['rejected', 'denied'].includes(s);

  const isEscalated = ['escalated', 'escalated-review'].includes(s);

  const isDraft = ['draft', 'saved'].includes(s);

  const isUnderReview =
    [
      'submitted',
      'under-review',
      'in-review',
      'officer-approved',
      'supervisor-review',
      'pending',
      'pending-review',
      'pending-officer-review',
      'pending-external-verification',
      'verification',
    ].includes(s) || (!isApproved && !isQuery && !isRejected && !isEscalated && !isDraft);

  let badgeClass = 'badge-info';
  let badgeLabel = 'Under Review';

  if (isApproved) {
    badgeClass = 'badge-success';
    badgeLabel = 'Approved';
  } else if (isRejected) {
    badgeClass = 'badge-danger';
    badgeLabel = 'Rejected';
  } else if (isQuery) {
    badgeClass = 'badge-warning';
    badgeLabel = 'Query Raised';
  } else if (isEscalated) {
    badgeClass = 'badge-purple';
    badgeLabel = 'Escalated';
  } else if (isDraft) {
    badgeClass = 'badge-neutral';
    badgeLabel = 'Draft';
  }

  return {
    isApproved,
    isQuery,
    isUnderReview,
    isRejected,
    isEscalated,
    isDraft,
    s,
    normalized: s,
    badgeClass,
    badgeLabel,
  };
}

/**
 * Returns CSS badge class for a given status string.
 */
export function getStatusBadgeClass(statusStr) {
  return checkStatusCategory(statusStr).badgeClass;
}

/**
 * Returns user-facing label for a given status string.
 */
export function getStatusLabel(statusStr) {
  return checkStatusCategory(statusStr).badgeLabel;
}

/**
 * Reusable StatusBadge UI component
 * Props:
 *   status {string} - Raw status value from backend
 *   className {string} - Optional extra CSS classes
 */
export default function StatusBadge({ status, className = '' }) {
  const { badgeClass, badgeLabel } = checkStatusCategory(status);
  return (
    <span className={`badge ${badgeClass} ${className}`.trim()}>
      {badgeLabel}
    </span>
  );
}
