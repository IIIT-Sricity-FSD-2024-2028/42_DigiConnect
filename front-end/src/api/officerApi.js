// src/api/officerApi.js
// Centralized API client for Department Field Officer Module
// Communicates with backend endpoints using apiFetch (which automatically attaches governance headers)

import { apiFetch } from './client';

/**
 * Get officer's assigned applications queue
 * GET /applications/officer-queue
 */
export const apiGetOfficerQueue = () => apiFetch('/applications/officer-queue');

/**
 * Get active queries sent by officer awaiting citizen response
 * GET /applications/officer-queries
 */
export const apiGetOfficerQueries = () => apiFetch('/applications/officer-queries');

/**
 * Get officer's recent activity / audit trail for today
 * GET /applications/officer-activity
 */
export const apiGetOfficerActivity = () => apiFetch('/applications/officer-activity');

/**
 * Get SLA at-risk applications for this officer
 * GET /applications/officer-sla-risks
 */
export const apiGetOfficerSlaRisks = () => apiFetch('/applications/officer-sla-risks');

/**
 * Get officer's weekly performance / volume chart data
 * GET /applications/officer-week-chart
 */
export const apiGetOfficerWeekChart = () => apiFetch('/applications/officer-week-chart');

/**
 * Get single application details by ID (including formData, documents, timeline, and SLA)
 * GET /applications/:id
 */
export const apiGetApplicationById = (id) => apiFetch(`/applications/${id}`);

/**
 * Officer Action 1: APPROVE application stage (or final approval)
 * POST /applications/:id/approve
 * @param {string} appId
 * @param {string} remarks - Field verification observations / remarks
 */
export const apiOfficerApprove = (appId, remarks = '') =>
  apiFetch(`/applications/${appId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ remarks }),
  });

// Alias matching roadmap naming convention
export const apiApproveApplication = apiOfficerApprove;

/**
 * Officer Action 2: REJECT application
 * POST /applications/:id/reject
 * @param {string} appId
 * @param {string} reason - Mandatory rejection reason
 */
export const apiOfficerReject = (appId, reason = '') =>
  apiFetch(`/applications/${appId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

// Alias matching roadmap naming convention
export const apiRejectApplication = apiOfficerReject;

/**
 * Officer Action 3: RAISE QUERY (Workflow paused until citizen responds)
 * POST /applications/:id/raise-query
 * @param {string} appId
 * @param {string} queryText - Description of clarification or document required
 */
export const apiOfficerRaiseQuery = (appId, queryText = '') =>
  apiFetch(`/applications/${appId}/raise-query`, {
    method: 'POST',
    body: JSON.stringify({ queryText }),
  });

// Alias matching roadmap naming convention
export const apiRaiseQueryApplication = apiOfficerRaiseQuery;

/**
 * Create a notification / send SMS reminder to citizen
 * POST /notifications
 * Same endpoint as apiCreateNotification in the original api.js —
 * just imported here for the officer module's convenience.
 */
export const apiCreateNotification = (notificationData) =>
  apiFetch('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  });

/**
 * Get digital certificate metadata for an approved application
 * GET /applications/:id/certificate or /certificates/application/:id
 */
export const apiGetAppCertificate = (appId) =>
  apiFetch(`/applications/${appId}/certificate`);
