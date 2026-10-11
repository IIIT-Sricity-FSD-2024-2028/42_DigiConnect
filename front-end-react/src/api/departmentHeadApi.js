// src/api/departmentHeadApi.js
// Centralized API client for Member 4: Department Head & Dynamic Service Builder Module
// Communicates with backend endpoints using apiFetch (which automatically attaches governance headers:
// x-role, x-user-id, x-state-id, x-department-id, x-assigned-node-id)

import { apiFetch } from './client';

/**
 * ── 1. DEPARTMENT SERVICES ──────────────────────────────────────────────
 */

/**
 * Get all services configured for a department
 * GET /department-head/services?departmentId=...&stateId=...
 * @param {string} departmentId - Optional department ID filter (defaults to active session department)
 * @param {string} stateId - Optional state ID filter
 */
export const apiGetDeptServices = (departmentId, stateId) => {
  const params = new URLSearchParams();
  if (departmentId) params.append('departmentId', departmentId);
  if (stateId) params.append('stateId', stateId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/department-head/services${query}`);
};

/**
 * Get a single service's full schema specification by ID
 * GET /department-head/services/:id
 * @param {string} id - Service ID (e.g., 'srv_caste_income_ap')
 */
export const apiGetDeptServiceById = (id) => apiFetch(`/department-head/services/${id}`);

/**
 * Create a new dynamic service with custom schema, docs, fees, and workflow stages
 * POST /department-head/services
 * @param {Object} serviceData - CreateDynamicServiceDto payload
 */
export const apiCreateService = (serviceData) =>
  apiFetch('/department-head/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });

/**
 * Update an existing dynamic service schema and workflow stages
 * PUT /department-head/services/:id
 * @param {string} id - Service ID
 * @param {Object} serviceData - Updated service payload
 */
export const apiUpdateService = (id, serviceData) =>
  apiFetch(`/department-head/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
  });

/**
 * Update service operational status ('ACTIVE' | 'DISABLED' | 'SUSPENDED')
 * PATCH /department-head/services/:id/status
 * @param {string} id - Service ID
 * @param {'ACTIVE'|'DISABLED'|'SUSPENDED'} status
 */
export const apiUpdateServiceStatus = (id, status) =>
  apiFetch(`/department-head/services/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

/**
 * Delete a dynamic service from the department catalog
 * DELETE /department-head/services/:id
 * @param {string} id - Service ID
 */
export const apiDeleteService = (id) =>
  apiFetch(`/department-head/services/${id}`, {
    method: 'DELETE',
  });

/**
 * ── 2. ROLE DESIGNATIONS (Operational roles without levels) ─────────────
 */

/**
 * List designations for a department (e.g., VRO, MRO, Tahsildar)
 * GET /department-head/designations?departmentId=...
 * @param {string} departmentId
 */
export const apiGetDesignations = (departmentId) => {
  const query = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
  return apiFetch(`/department-head/designations${query}`);
};

/**
 * Create a new department designation
 * POST /department-head/designations
 * @param {Object} data - { departmentId, title, code, description }
 */
export const apiCreateDesignation = (data) =>
  apiFetch('/department-head/designations', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Delete a designation (blocked by backend if active officers are assigned)
 * DELETE /department-head/designations/:id
 * @param {string} id
 */
export const apiDeleteDesignation = (id) =>
  apiFetch(`/department-head/designations/${id}`, {
    method: 'DELETE',
  });

/**
 * ── 3. FIELD OFFICERS ONBOARDING & JURISDICTION SCOPING ─────────────────
 */

/**
 * List field officers mapped to a department
 * GET /department-head/officers?departmentId=...
 * @param {string} departmentId
 */
export const apiGetDeptOfficers = (departmentId) => {
  const query = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
  return apiFetch(`/department-head/officers${query}`);
};

/**
 * Onboard a field officer bound to an exact jurisdiction node anchor
 * POST /department-head/officers
 * @param {Object} officerData - { name, email, phone, departmentId, designationId, assignedNodeId }
 */
export const apiOnboardOfficer = (officerData) =>
  apiFetch('/department-head/officers', {
    method: 'POST',
    body: JSON.stringify(officerData),
  });

// Alias matching roadmap naming convention
export const apiAssignOfficer = apiOnboardOfficer;

/**
 * Update field officer account status ('Active' | 'Suspended' | 'Inactive')
 * PATCH /department-head/officers/:id/status
 * @param {string} officerId
 * @param {'Active'|'Suspended'|'Inactive'} status
 */
export const apiUpdateOfficerStatus = (officerId, status) =>
  apiFetch(`/department-head/officers/${officerId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

/**
 * ── 4. ANALYTICS & FINANCIAL REVENUE ───────────────────────────────────
 */

/**
 * Get department operational KPI statistics (services count, officers, applications, revenue)
 * GET /department-head/analytics?departmentId=...
 * @param {string} departmentId
 */
export const apiGetDeptAnalytics = (departmentId) => {
  const query = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
  return apiFetch(`/department-head/analytics${query}`);
};

/**
 * Get department financial revenue analytics & transaction ledger
 * GET /department-head/revenue?departmentId=...
 * @param {string} departmentId
 */
export const apiGetDeptRevenue = (departmentId) => {
  const query = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
  return apiFetch(`/department-head/revenue${query}`);
};
