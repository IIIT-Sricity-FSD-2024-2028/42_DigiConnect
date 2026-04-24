// ═══════════════════════════════════════════
// state.js — Centralized state management via localStorage
// Session data only — all transactional data fetched from real backend API
// ═══════════════════════════════════════════


/**
 * Get a collection from localStorage
 * @param {string} key - Storage key (without prefix)
 * @returns {Array}
 */
export function getCollection(key) {
  try {
    return JSON.parse(localStorage.getItem(`DigiConnect_${key}`)) || [];
  } catch {
    return [];
  }
}

/**
 * Set a collection in localStorage
 * @param {string} key
 * @param {Array} data
 */
export function setCollection(key, data) {
  localStorage.setItem(`DigiConnect_${key}`, JSON.stringify(data));
}

/**
 * Get current session
 * @returns {object|null} Session object with user data and role
 */
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('DigiConnect_session'));
  } catch {
    return null;
  }
}

/**
 * Set session data
 * @param {object} sessionData
 */
export function setSession(sessionData) {
  localStorage.setItem('DigiConnect_session', JSON.stringify(sessionData));
}

/**
 * Clear session
 */
export function clearSession() {
  localStorage.removeItem('DigiConnect_session');
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Get current user's role
 * @returns {string|null}
 */
export function getCurrentRole() {
  const session = getSession();
  return session ? session.role : null;
}

/**
 * Get current user's name
 * @returns {string}
 */
export function getCurrentUserName() {
  const session = getSession();
  return session ? session.name : 'User';
}

/**
 * Get current user's ID
 * @returns {string|null}
 */
export function getCurrentUserId() {
  const session = getSession();
  return session ? session.id : null;
}

/**
 * Get current user's email
 * @returns {string|null}
 */
export function getCurrentUserEmail() {
  const session = getSession();
  return session ? session.email : null;
}

// Convenience getters for specific collections
export function getUsers() { return getCollection('users'); }
export function getServices() { return getCollection('services'); }
export function getApplications() { return getCollection('applications'); }
export function getGrievances() { return getCollection('grievances'); }
export function getNotifications() { return getCollection('notifications'); }
export function getAuditLogs() { return getCollection('audit_logs'); }
export function getPendingOfficers() { return getCollection('pending_officers'); }
export function getOfficerQueue() { return getCollection('officer_queue'); }
export function getOfficerQueries() { return getCollection('officer_queries'); }
export function getSuperApprovals() { return getCollection('super_approvals'); }
export function getSuperApprovedToday() { return parseInt(localStorage.getItem('DigiConnect_super_approved_today') || '42', 10); }
export function getSuperEscSlaCases() { return getCollection('super_esc_sla_cases'); }
export function getSuperPendingApps() { return getCollection('super_pending_apps'); }

// Setters
export function setUsers(data) { setCollection('users', data); }
export function setServices(data) { setCollection('services', data); }
export function setApplications(data) { setCollection('applications', data); }
export function setGrievances(data) { setCollection('grievances', data); }
export function setNotifications(data) { setCollection('notifications', data); }
export function setAuditLogs(data) { setCollection('audit_logs', data); }
export function setPendingOfficers(data) { setCollection('pending_officers', data); }
export function setOfficerQueue(data) { setCollection('officer_queue', data); }
export function setOfficerQueries(data) { setCollection('officer_queries', data); }
export function setSuperApprovals(data) { setCollection('super_approvals', data); }
export function setSuperApprovedToday(count) { localStorage.setItem('DigiConnect_super_approved_today', String(count)); }
export function setSuperEscSlaCases(data) { setCollection('super_esc_sla_cases', data); }
export function setSuperPendingApps(data) { setCollection('super_pending_apps', data); }

/**
 * Get platform settings
 * @returns {object}
 */
export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('DigiConnect_settings')) || {};
  } catch {
    return {};
  }
}

/**
 * Set platform settings
 * @param {object} settings
 */
export function setSettings(settings) {
  localStorage.setItem('DigiConnect_settings', JSON.stringify(settings));
}

