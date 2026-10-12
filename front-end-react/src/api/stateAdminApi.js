// src/api/stateAdminApi.js
// API helper functions for State Admin portal
// Uses centralized apiFetch client from ./client.js
// Allowed concepts: API calls (async functions)

import { apiFetch } from './client';

/**
 * Fetch the full hierarchical jurisdiction tree for a given state.
 * @param {string} stateId - State identifier (defaults to 'state_ap')
 * @returns {Promise<Array>} Array of root jurisdiction tree nodes
 */
export async function apiGetJurisdictionsTree(stateId = 'state_ap') {
  // API Call: GET request to retrieve hierarchical jurisdiction tree
  const res = await apiFetch(`/geography/tree?stateId=${stateId}`);
  const data = Array.isArray(res) ? res : res?.data || [];
  return data;
}

/**
 * Create a new child jurisdiction node under a parent node.
 * @param {Object} nodeData - Node payload { stateId, parentId, tierLevel, governanceType, name, code, status }
 * @returns {Promise<Object>} Created jurisdiction node
 */
export async function apiAddJurisdictionNode(nodeData) {
  // API Call: POST request to create dynamic jurisdiction node
  const res = await apiFetch('/geography/nodes', {
    method: 'POST',
    body: JSON.stringify(nodeData),
  });
  return res?.data || res;
}

/**
 * Update jurisdiction node name and properties.
 * @param {string} id - Jurisdiction node ID
 * @param {Object} updateData - Updated fields { name, code, ... }
 * @returns {Promise<Object>} Updated jurisdiction node
 */
export async function apiUpdateJurisdictionNode(id, updateData) {
  // API Call: PUT request to rename / update jurisdiction node
  const res = await apiFetch(`/geography/nodes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  return res?.data || res;
}

/**
 * Fetch aggregated statistics across all tiers for a state.
 * @param {string} stateId - State identifier (defaults to 'state_ap')
 * @returns {Promise<Object>} Tier counts: districtsCount, mandalsCount, etc.
 */
export async function apiGetJurisdictionStats(stateId = 'state_ap') {
  // API Call: GET request for jurisdiction tier statistics
  const res = await apiFetch(`/geography/stats?stateId=${stateId}`);
  return res?.data || res;
}

/**
 * Fetch all registered departments for a state.
 * @param {string} stateId - State identifier (defaults to 'state_ap')
 * @returns {Promise<Array>} List of state departments
 */
export async function apiGetDepartments(stateId = 'state_ap') {
  // API Call: GET request to retrieve department list
  const res = await apiFetch(`/state-admin/departments?stateId=${stateId}`);
  const list = Array.isArray(res) ? res : res?.data || [];
  return list;
}

/**
 * Create a new state department and appoint an IAS Department Head.
 * @param {Object} data - Payload { stateId, name, code, description, headUserName, headUserEmail }
 * @returns {Promise<Object>} Created department object
 */
export async function apiCreateDepartment(data) {
  // API Call: POST request to register state department
  const res = await apiFetch('/state-admin/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res?.data || res;
}

/**
 * Appoint or replace the IAS Department Head for a department.
 * @param {string} departmentId - Department ID
 * @param {Object} headData - Head info { name, email }
 * @returns {Promise<Object>} Updated department object
 */
export async function apiAssignDepartmentHead(departmentId, { name, email }) {
  // API Call: POST request to assign department head
  const res = await apiFetch(`/state-admin/departments/${departmentId}/head`, {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
  return res?.data || res;
}

/**
 * Toggle or update department operational status (ACTIVE / SUSPENDED / INACTIVE).
 * @param {string} departmentId - Department ID
 * @param {string} status - New status string
 * @returns {Promise<Object>} Updated department object
 */
export async function apiUpdateDepartmentStatus(departmentId, status) {
  // API Call: PATCH request to update operational status
  const res = await apiFetch(`/state-admin/departments/${departmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res?.data || res;
}

/**
 * Fetch state dashboard overview data (KPIs, summaries, leaderboard, activity).
 * @param {string} stateId - State identifier (defaults to 'state_ap')
 * @returns {Promise<Object>} Dashboard overview data
 */
export async function apiGetStateDashboard(stateId = 'state_ap') {
  // API Call: GET request for high-level state dashboard analytics
  const res = await apiFetch(`/state-admin/dashboard?stateId=${stateId}`);
  return res?.data || res;
}

/**
 * Fetch all configured grievance cells for a state.
 * @param {string} stateId - State identifier (defaults to 'state_ap')
 * @returns {Promise<Array>} List of configured grievance cells
 */
export async function apiGetGrievanceCells(stateId = 'state_ap') {
  // API Call: GET request to retrieve grievance cells for state
  const res = await apiFetch(`/state-admin/grievance-cells?stateId=${stateId}`);
  const list = Array.isArray(res) ? res : res?.data || [];
  return list;
}

/**
 * Configure department grievance cell and its multi-tier appellate workflow.
 * @param {Object} data - Payload { stateId, departmentId, cellName, jurisdictionTier, slaDays, deptName }
 * @returns {Promise<Object>} Created or updated grievance cell
 */
export async function apiConfigureGrievanceCell(data) {
  // API Call: POST request to configure grievance cell
  const res = await apiFetch('/state-admin/grievance-cells', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res?.data || res;
}
