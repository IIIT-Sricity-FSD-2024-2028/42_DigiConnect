// ═══════════════════════════════════════════
// workflow.js — Shared cross-actor workflow helpers (API-backed)
// All data operations now go through the backend API.
// ═══════════════════════════════════════════

import { getSession } from './auth.js';
import { apiUpdateApplicationStatus, apiUpdateGrievanceStatus, apiCreateNotification, apiCreateAuditLog } from './api.js';

// ── Event Permission is the ONLY service where Officer approval is FINAL
const OFFICER_FINAL_SERVICES = ['Event Permission'];

// ── Department → Supervisor mapping
const DEPT_MAP = {
  'Revenue': { supervisor: 'EMP-003' },
  'Welfare':  { supervisor: 'EMP-003' },
  'General':  { supervisor: 'EMP-003' },
};

// Service → Department mapping
const SERVICE_DEPT_MAP = {
  'Income Certificate':    'Revenue',
  'Caste Certificate':     'Revenue',
  'Residence Certificate': 'Revenue',
  'Record Correction':     'Revenue',
  'Welfare Scheme':        'Welfare',
  'Event Permission':      'General',
};

// ─────────────────────────────────────────
// AUDIT TRAIL — Now handled server-side
// ─────────────────────────────────────────

/**
 * Add an audit log entry (no-op on frontend — backend handles this via status updates)
 */
export async function addAuditEntry(action, details, actorOverride) {
  try {
    const raw = sessionStorage.getItem('digi_user') || localStorage.getItem('digi_user');
    const session = raw ? JSON.parse(raw) : null;
    if (session && session.role === 'super_user') {
      await apiCreateAuditLog({
        action: action,
        details: details
      });
    }
  } catch(e) {
    // Non-critical background audit logging
  }
}

// ─────────────────────────────────────────
// SUPERVISOR HELPERS
// ─────────────────────────────────────────

/**
 * Get supervisor ID for a service based on department
 */
export function getSupervisorByDept(serviceName) {
  const dept = SERVICE_DEPT_MAP[serviceName] || 'General';
  return DEPT_MAP[dept]?.supervisor || 'EMP-003';
}

/**
 * Returns true if officer approval is FINAL for this service
 */
export function isOfficerFinalService(serviceName) {
  return OFFICER_FINAL_SERVICES.includes(serviceName);
}

// ─────────────────────────────────────────
// UPDATE MASTER APPLICATION STATUS (via API)
// ─────────────────────────────────────────

/**
 * Update the status of an application via the backend API
 */
export async function updateMasterApp(appId, newStatus, timelineAction, timelineNote, actor) {
  try {
    const res = await apiUpdateApplicationStatus(appId, {
      status: newStatus,
      remarks: timelineNote || timelineAction,
    });
    return res.data || null;
  } catch (e) {
    console.error('[updateMasterApp]', e.message);
    return null;
  }
}

// ─────────────────────────────────────────
// SUPERVISOR FINAL APPROVALS
// ─────────────────────────────────────────

/**
 * Push officer-approved app to supervisor queue via API status update
 */
export async function pushToSuperApprovals(queueEntry, session, masterApp) {
  // The backend automatically knows to put it in supervisor's queue when status is 'officer-approved'
  // This is a no-op — status was already updated via updateMasterApp
}

/**
 * Push a grievance escalation to supervisor via API
 */
export async function pushToEscalatedCases(grievance, session, reason) {
  try {
    await apiUpdateGrievanceStatus(grievance.id, {
      status: 'escalated',
      remarks: reason || 'Escalated by Grievance Officer',
    });
  } catch (e) {
    console.error('[pushToEscalatedCases]', e.message);
  }
}

// ─────────────────────────────────────────
// NOTIFICATION WRAPPERS — Handled server-side
// ─────────────────────────────────────────

/**
 * Notify a citizen (now a no-op — backend creates notifications as side effects)
 */
export async function notifyCitizen(citizenId, title, message, type, appId) {
  try {
    await apiCreateNotification({
      userId: citizenId,
      title: title,
      message: message,
      type: type || 'info',
      link: appId ? `citizen/track-application.html?id=${appId}` : '#'
    });
  } catch(e) { console.error('[Notify Citizen Error]', e.message); }
}

export async function notifyOfficer(officerId, title, message, appId) {
  try {
    await apiCreateNotification({
      userId: officerId,
      title: title,
      message: message,
      type: 'warning',
      link: appId ? `officer/review-application.html?id=${appId}` : '#'
    });
  } catch(e) { console.error('[Notify Officer Error]', e.message); }
}

export async function notifySupervisor(supervisorId, title, message, type, link) {
  try {
    await apiCreateNotification({
      userId: supervisorId,
      title: title,
      message: message,
      type: type || 'warning',
      link: link || '#'
    });
  } catch(e) { console.error('[Notify Supervisor Error]', e.message); }
}

export async function notifyGrievanceOfficer(officerId, title, message, grievanceId) {
  try {
    await apiCreateNotification({
      userId: officerId,
      title: title,
      message: message,
      type: 'info',
      link: grievanceId ? `grievance/review-issue.html?id=${grievanceId}` : '#'
    });
  } catch(e) { console.error('[Notify GO Error]', e.message); }
}

// ─────────────────────────────────────────
// LEGACY STUBS (kept for call-site compatibility)
// ─────────────────────────────────────────

export function pushToOfficerQueue(app, service) {
  // No-op — officer queue is managed server-side
}

export async function pushOfficerQuery(queueEntry, queryText) {
  // Raise query notification to citizen
  if(queueEntry && queueEntry.app) {
     await notifyCitizen(queueEntry.app.citizenId, 'Query Raised', queryText, 'warning', queueEntry.app.id);
     await addAuditEntry('Officer Raised Query', `Query on ${queueEntry.app.id}: ${queryText}`);
  }
}

export function assignOfficerByDept(serviceName) {
  return { officerId: 'EMP-001', officerName: 'Suresh Reddy' };
}

export function assignGrievanceOfficer() {
  return { officerId: 'EMP-004', officerName: 'Priya Nair' };
}
