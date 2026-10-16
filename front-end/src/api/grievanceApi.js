// src/api/grievanceApi.js
// Centralized API service for Department Grievance Cell (Appeals & Redressal)
// Communicates with the NestJS backend via apiFetch client (attaches governance headers automatically)

import { apiFetch } from './client';

/**
 * Fetch all grievances for officer/grievance queue (paginated).
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 50)
 */
export const apiGetGrievances = (page = 1, limit = 50) =>
  apiFetch(`/grievances?page=${page}&limit=${limit}`);

/**
 * Fetch a single grievance by ID (e.g., 'GRV-AP-001').
 * @param {string} id - Grievance ID
 */
export const apiGetGrievanceById = (id) =>
  apiFetch(`/grievances/${id}`);

/**
 * Update grievance status and notes (e.g., 'investigating', 'escalated').
 * @param {string} id - Grievance ID
 * @param {Object} data - Payload containing status, remarks, or resolutionNote
 */
export const apiUpdateGrievanceStatus = (id, data) =>
  apiFetch(`/grievances/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

/**
 * Explicit Grievance Resolution Action (Sections 28-32).
 * Supports the 3 legal resolution outcomes:
 *  1. 'UPHOLD_REJECTION'
 *  2. 'DIRECT_RE_VERIFICATION'
 *  3. 'OVERRULE_AND_ISSUE_CERTIFICATE'
 * @param {string} id - Grievance ID
 * @param {Object} payload - { action, remarks }
 */
export const apiResolveGrievance = (id, { action, remarks } = {}) =>
  apiFetch(`/grievances/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ action, remarks }),
  });

/**
 * Fetch linked application details associated with this grievance appeal.
 * @param {string} appId - Application ID (e.g., 'APP-AP-1002')
 */
export const apiGetLinkedApplication = (appId) =>
  apiFetch(`/applications/${appId}`);
