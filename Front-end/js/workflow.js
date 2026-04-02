// ═══════════════════════════════════════════
// workflow.js — Shared cross-actor workflow helpers
// Wires all portal connections: Citizen ↔ Officer ↔ Supervisor ↔ Grievance Officer
// ═══════════════════════════════════════════

import {
  getUsers, getApplications, setApplications,
  getOfficerQueue, setOfficerQueue,
  getOfficerQueries, setOfficerQueries,
  getSuperApprovals, setSuperApprovals,
  getSuperEscSlaCases, setSuperEscSlaCases,
  getGrievances, setGrievances,
  getAuditLogs, setAuditLogs,
  getSession
} from './state.js';
import { addNotification } from './notifications.js';
import { generateId } from './utils.js';

// ── Event Permission is the ONLY service where Officer approval is FINAL
const OFFICER_FINAL_SERVICES = ['Event Permission'];

// ── Department → Officer/Supervisor mapping
const DEPT_MAP = {
  'Revenue': { officers: ['EMP-001'], supervisor: 'EMP-003' },
  'Welfare':  { officers: ['EMP-002'], supervisor: 'EMP-003' },
  'General':  { officers: ['EMP-001', 'EMP-002'], supervisor: 'EMP-003' },
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
// AUDIT TRAIL
// ─────────────────────────────────────────

/**
 * Add an entry to the global audit log
 * @param {string} action - Short action label
 * @param {string} details - Full detail string
 * @param {string} [actorOverride] - Override actor (for system actions)
 */
export function addAuditEntry(action, details, actorOverride) {
  const session = getSession();
  const logs = getAuditLogs();
  logs.unshift({
    id: generateId('LOG'),
    action,
    actor: actorOverride || (session ? session.email : 'system'),
    role: session ? session.role : 'system',
    date: new Date().toISOString(),
    details,
  });
  if (logs.length > 200) logs.length = 200;
  setAuditLogs(logs);
}

// ─────────────────────────────────────────
// ASSIGNMENT HELPERS
// ─────────────────────────────────────────

/**
 * Assign an application to an officer based on service department + least workload
 * @param {string} serviceName
 * @returns {{ officerId: string, officerName: string }}
 */
export function assignOfficerByDept(serviceName) {
  const users = getUsers();
  const queue = getOfficerQueue();
  
  // ── LIVE SYNC: Find officers who are Active AND have this service or department assigned ──
  // Check both service name match and department match
  const dept = SERVICE_DEPT_MAP[serviceName] || 'General';
  
  const eligibleOfficers = users.filter(u => 
    u.role === 'officer' && 
    u.status === 'Active' && 
    (
      (u.services && u.services.includes(serviceName)) || 
      (u.dept && u.dept.includes(dept))
    )
  );

  if (eligibleOfficers.length === 0) {
    // Fallback: search for ANY active officer
    const fallback = users.find(u => u.role === 'officer' && u.status === 'Active') || { id: 'EMP-001', name: 'Suresh Reddy' };
    return { officerId: fallback.id, officerName: fallback.name };
  }

  // Find least-loaded officer from eligible pool
  let bestOfficer = eligibleOfficers[0];
  let minLoad = Infinity;

  eligibleOfficers.forEach(u => {
    const load = queue.filter(q => q.officerId === u.id && !['approve','reject'].includes(q.status)).length;
    if (load < minLoad) { 
      minLoad = load; 
      bestOfficer = u; 
    }
  });

  return { officerId: bestOfficer.id, officerName: bestOfficer.name };
}

/**
 * Get supervisor ID for a service based on department
 * @param {string} serviceName
 * @returns {string} supervisorId
 */
export function getSupervisorByDept(serviceName) {
  const dept = SERVICE_DEPT_MAP[serviceName] || 'General';
  return DEPT_MAP[dept]?.supervisor || 'EMP-003';
}

/**
 * Assign a grievance to a grievance officer with the least active load
 * @returns {{ officerId: string, officerName: string }}
 */
export function assignGrievanceOfficer() {
  const users = getUsers();
  const grievances = getGrievances();
  const ACTIVE_STATUSES = ['open', 'investigating'];

  const grievOfficers = users.filter(u => u.role === 'grievance' && u.status === 'Active');
  if (!grievOfficers.length) return { officerId: 'EMP-004', officerName: 'Priya Nair' };

  const best = grievOfficers.reduce((least, officer) => {
    const load = grievances.filter(g => g.officerId === officer.id && ACTIVE_STATUSES.includes(g.status)).length;
    const leastLoad = grievances.filter(g => g.officerId === least.id && ACTIVE_STATUSES.includes(g.status)).length;
    return load < leastLoad ? officer : least;
  }, grievOfficers[0]);

  return { officerId: best.id, officerName: best.name };
}

// ─────────────────────────────────────────
// CHECK: Does this service need Supervisor approval?
// ─────────────────────────────────────────

/**
 * Returns true if officer approval is FINAL for this service (no supervisor needed)
 * @param {string} serviceName
 */
export function isOfficerFinalService(serviceName) {
  return OFFICER_FINAL_SERVICES.includes(serviceName);
}

// ─────────────────────────────────────────
// OFFICER QUEUE
// ─────────────────────────────────────────

/**
 * Push a new application to the officer's queue
 * @param {object} app - Full application object from DigiConnect_applications
 * @param {object} service - Service config (sla, name)
 */
export function pushToOfficerQueue(app, service) {
  const queue = getOfficerQueue();
  const sla = service?.sla || 7;

  queue.unshift({
    id: app.id,
    officerId: app.officerId,
    service: app.serviceName,
    citizen: app.citizenName,
    phone: app.phone || '—',
    submitted: new Date(app.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    slaLeft: sla,
    slaTotal: sla,
    status: 'new',
    // Personal detail fields
    aadhaar: app.aadhaar ? app.aadhaar.replace(/\d(?=\d{4})/g, 'X') : 'XXXX XXXX ****',
    dob:     app.dob     || '—',
    gender:  app.gender  || '—',
    address: app.address || '—',
    pincode: app.pincode || '—',
    // Service-specific fields — ALL of them from the form
    income:      app.income      || null,
    incomeSource:app.incomeSource|| null,
    occupation:  app.occupation  || null,
    purpose:     app.purpose     || null,
    community:   app.community   || null,
    subCaste:    app.subCaste    || null,
    category:    app.category    || null,
    religion:    app.religion    || null,
    duration:    app.duration    || null,
    residenceType: app.residenceType || null,
    eventName:   app.eventName   || null,
    eventType:   app.eventType   || null,
    eventDate:   app.eventDate   || null,
    eventDuration: app.eventDuration || null,
    venueAddress:app.venueAddress|| null,
    attendance:  app.attendance  || null,
    businessName:app.businessName|| null,
    businessType:app.businessType|| null,
    businessAddress: app.businessAddress || null,
    ownershipType: app.ownershipType || null,
    recordType:  app.recordType  || null,
    recordNo:    app.recordNo    || null,
    incorrect:   app.incorrect   || null,
    correct:     app.correct     || null,
    reason:      app.reason      || null,
    landHolding: app.landHolding || null,
    surveyNo:    app.surveyNo    || null,
    bankAccount: app.bankAccount || null,
    ifsc:        app.ifsc        || null,
    courseName:  app.courseName  || null,
    institution: app.institution || null,
    admissionYear: app.admissionYear || null,
    tuitionFee:  app.tuitionFee  || null,
    // Documents as objects (not just count)
    docs: Array.isArray(app.documents) ? app.documents : (app.documents || []),
    checklist: [
      'Aadhaar identity verified',
      'Documents match application',
      'No duplicate application found',
      'Applicant details cross-checked',
    ],
    history: [
      { label: 'Application Submitted', ts: new Date().toLocaleString('en-IN'), detail: 'Submitted online via Citizen Portal.', dot: 'submitted' },
      { label: 'Assigned to Officer', ts: new Date().toLocaleString('en-IN'), detail: `Auto-assigned to ${app.officerName} by system.`, dot: 'assign' },
    ],
  });
  setOfficerQueue(queue);
}

// ─────────────────────────────────────────
// SUPERVISOR FINAL APPROVALS
// ─────────────────────────────────────────

/**
 * Push an officer-approved application to supervisor's final approval queue
 * @param {object} queueEntry - Officer queue entry
 * @param {object} session - Officer session
 * @param {object} masterApp - Master application record
 */
export function pushToSuperApprovals(queueEntry, session, masterApp) {
  const approvals = getSuperApprovals();
  // Avoid duplicates
  if (approvals.find(a => a.id === queueEntry.id)) return;

  approvals.unshift({
    id: queueEntry.id,
    service: queueEntry.service,
    citizen: queueEntry.citizen,
    officer: session.name,
    role: session.title || session.role || 'VRO',
    submitted: queueEntry.submitted,
    slaLeft: Math.max(1, (queueEntry.slaLeft || 3) - 1),
    officerNote: `Documents verified by ${session.name}. Application meets all requirements.`,
    citizenId: masterApp?.citizenId || null,
    docs: Array.isArray(queueEntry.docs)
      ? queueEntry.docs.map(d => (typeof d === 'string' ? d : d.name || 'Document'))
      : ['Aadhaar Card', 'Supporting Document'],
    timeline: [
      { d: 'Application Submitted', e: `${queueEntry.citizen} submitted online.`, t: 'info' },
      { d: 'Officer Reviewed', e: `Verified by ${session.name}. All documents checked.`, t: 'success' },
      { d: 'Awaiting Supervisor Approval', e: 'Pending final approval from supervisor.', t: 'warn' },
    ],
  });
  setSuperApprovals(approvals);
}

// ─────────────────────────────────────────
// SUPERVISOR ESCALATED CASES
// ─────────────────────────────────────────

/**
 * Push a grievance escalation to supervisor's escalated cases
 * @param {object} grievance - Grievance object
 * @param {object} session - Grievance officer session
 * @param {string} reason - Escalation reason
 */
export function pushToEscalatedCases(grievance, session, reason) {
  const cases = getSuperEscSlaCases();
  if (cases.find(c => c.id === grievance.id)) return;

  const isSerious = grievance.category === 'misconduct';

  cases.unshift({
    id: grievance.id,
    type: 'grievance',
    service: grievance.relatedService || 'Service',
    citizen: grievance.citizenName,
    officer: grievance.officerName || '—',
    go: session.name,
    subtype: { delay: 'Service Delay', rejection: 'App Rejection', payment: 'Payment Issue', misconduct: 'Officer Misconduct' }[grievance.category] || grievance.category,
    badge: isSerious ? 'badge-danger' : 'badge-warning',
    summary: grievance.description,
    officerDecision: reason || 'Escalated by Grievance Officer',
    on: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    urgent: isSerious || grievance.priority === 'high',
    citizenId: grievance.citizenId,
    docs: [],
    timeline: (grievance.history || []).map(h => ({ d: h.action, e: h.note || '', t: 'info' })),
  });
  setSuperEscSlaCases(cases);
}

// ─────────────────────────────────────────
// UPDATE MASTER APPLICATION STATUS
// ─────────────────────────────────────────

/**
 * Update the status and timeline of an application in DigiConnect_applications
 * @param {string} appId
 * @param {string} newStatus
 * @param {string} timelineAction
 * @param {string} timelineNote
 * @param {string} actor
 * @returns {object|null} updated app
 */
export function updateMasterApp(appId, newStatus, timelineAction, timelineNote, actor) {
  const apps = getApplications();
  const idx = apps.findIndex(a => a.id === appId);
  if (idx === -1) return null;

  apps[idx].status = newStatus;
  apps[idx].lastUpdated = new Date().toISOString().split('T')[0];
  if (!apps[idx].timeline) apps[idx].timeline = [];
  apps[idx].timeline.push({
    action: timelineAction,
    date: new Date().toISOString(),
    actor: actor,
    note: timelineNote,
  });
  setApplications(apps);
  return apps[idx];
}

// ─────────────────────────────────────────
// QUERY HELPERS
// ─────────────────────────────────────────

/**
 * Write a query entry to the officer_queries list
 * @param {object} queueEntry
 * @param {string} queryText
 */
export function pushOfficerQuery(queueEntry, queryText) {
  const queries = getOfficerQueries();
  // Remove existing entry for this app if any
  const filtered = queries.filter(q => q.id !== queueEntry.id);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3);

  filtered.unshift({
    id: queueEntry.id,
    service: queueEntry.service,
    citizen: queueEntry.citizen,
    query: queryText,
    sent: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    deadline: deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    responded: false,
  });
  setOfficerQueries(filtered);
}

// ─────────────────────────────────────────
// NOTIFICATION WRAPPERS
// ─────────────────────────────────────────

export function notifyCitizen(citizenId, title, message, type, appId) {
  if (!citizenId) return;
  addNotification({
    userId: citizenId,
    title,
    message,
    type: type || 'info',
    link: appId ? `citizen/track-application.html?id=${appId}` : 'citizen/citizen-dashboard.html',
  });
}

export function notifyOfficer(officerId, title, message, appId) {
  if (!officerId) return;
  addNotification({
    userId: officerId,
    title,
    message,
    type: 'info',
    link: appId ? `officer/review-application.html?id=${appId}` : 'officer/officer-dashboard.html',
  });
}

export function notifySupervisor(supervisorId, title, message, type, link) {
  if (!supervisorId) return;
  addNotification({
    userId: supervisorId,
    title,
    message,
    type: type || 'info',
    link: link || 'supervisor/supervisor-dashboard.html',
  });
}

export function notifyGrievanceOfficer(officerId, title, message, grievanceId) {
  if (!officerId) return;
  addNotification({
    userId: officerId,
    title,
    message,
    type: 'info',
    link: grievanceId ? `grievance/grievance-detail.html?id=${grievanceId}` : 'grievance/grievance-dashboard.html',
  });
}
