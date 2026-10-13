// src/api/centralAdminApi.js
// Central Government / National Administration API client
// Connects to NestJS backend /central endpoints (Protected by RolesGuard with CENTRAL_ADMIN)

import { apiFetch } from './client';

/**
 * Fetch national level executive KPIs and aggregated platform performance
 * @returns {Promise<Object>} National metrics (states, citizens, applications, revenue, SLA, grievances)
 */
export async function apiGetNationalMetrics() {
  const res = await apiFetch('/central/analytics/metrics');
  return res?.data || res;
}

/**
 * Fetch all State Governments with metrics and federation status
 * @returns {Promise<Array>} Array of states
 */
export async function apiGetCentralStates() {
  const res = await apiFetch('/central/states');
  return Array.isArray(res) ? res : res?.data || [];
}

/**
 * Fetch a specific State Government by its identifier
 * @param {string} id - State ID (e.g. 'state_ap')
 * @returns {Promise<Object>} State details
 */
export async function apiGetCentralStateById(id) {
  const res = await apiFetch(`/central/states/${id}`);
  return res?.data || res;
}

/**
 * Fetch complete state monitoring breakdown (departments, jurisdictions, officer counts)
 * @param {string} id - State ID
 * @returns {Promise<Object>} Detailed monitoring stats
 */
export async function apiGetCentralStateDetails(id) {
  const res = await apiFetch(`/central/states/${id}/details`);
  return res?.data || res;
}

/**
 * Onboard and create a new State Government in the DigiConnect federation
 * @param {Object} stateData - { name, code, stateAdminName, stateAdminEmail }
 * @returns {Promise<Object>} Created state and initial admin details
 */
export async function apiCreateCentralState(stateData) {
  const res = await apiFetch('/central/states', {
    method: 'POST',
    body: JSON.stringify(stateData),
  });
  return res?.data || res;
}

/**
 * Update State Government metadata
 * @param {string} id - State ID
 * @param {Object} updateData - Partial state properties
 * @returns {Promise<Object>} Updated state
 */
export async function apiUpdateCentralState(id, updateData) {
  const res = await apiFetch(`/central/states/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return res?.data || res;
}

/**
 * Activate or Deactivate a State Government
 * @param {string} id - State ID
 * @param {'ACTIVE' | 'INACTIVE'} status - New state status
 * @returns {Promise<Object>}
 */
export async function apiSetCentralStateStatus(id, status) {
  const res = await apiFetch(`/central/states/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res?.data || res;
}

/**
 * Activate or Deactivate a State Government's primary administrator account
 * @param {string} id - State ID
 * @param {'Active' | 'Inactive'} status - New admin status
 * @returns {Promise<Object>}
 */
export async function apiSetCentralStateAdminStatus(id, status) {
  const res = await apiFetch(`/central/states/${id}/admin/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res?.data || res;
}

/**
 * Reset State Admin temporary credentials (generates new temporary password)
 * @param {string} id - State ID
 * @returns {Promise<Object>}
 */
export async function apiResetCentralStateAdminPassword(id) {
  const res = await apiFetch(`/central/states/${id}/admin/reset-password`, {
    method: 'POST',
  });
  return res?.data || res;
}

/**
 * Deactivate / Delete State Government
 * @param {string} id - State ID
 * @returns {Promise<Object>}
 */
export async function apiDeleteCentralState(id) {
  const res = await apiFetch(`/central/states/${id}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

/**
 * Fetch state-wise and month-wise revenue analytics
 * @returns {Promise<Object>}
 */
export async function apiGetCentralRevenueAnalytics() {
  const res = await apiFetch('/central/analytics/revenue');
  return res?.data || res;
}
