// ═══════════════════════════════════════════
// api.js — Centralized HTTP API Client
// Replaces all localStorage fake-backend calls with real NestJS backend calls.
// Backend: http://localhost:3000/api/v1
// Auth: No JWT — roles passed via x-role header (per professor requirements)
// ═══════════════════════════════════════════

const API_BASE = 'http://localhost:3000/api/v1';

/**
 * Get current session from localStorage (session stays local — no auth endpoint needed)
 */
function getSessionHeaders() {
  try {
    const session = JSON.parse(localStorage.getItem('DigiConnect_session'));
    if (!session) return {};
    return {
      'x-role': session.role || '',
      'x-user-id': session.id || '',
    };
  } catch {
    return {};
  }
}

/**
 * Core HTTP request function
 * @param {string} method - GET | POST | PATCH | DELETE
 * @param {string} path - e.g. '/applications'
 * @param {object|null} body - request body
 * @param {object} extraHeaders - any additional headers
 * @returns {Promise<any>} - parsed response data
 */
export async function apiRequest(method, path, body = null, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getSessionHeaders(),
    ...extraHeaders,
  };

  const options = { method, headers };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    const json = await res.json();

    if (!res.ok) {
      // Return error with backend message
      throw new Error(json.message || `Request failed: ${res.status}`);
    }
    return json;
  } catch (err) {
    console.error(`[API Error] ${method} ${path}:`, err.message);
    throw err;
  }
}

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════

/**
 * Login a user
 * POST /users/login
 */
export async function apiLogin(email, password) {
  return apiRequest('POST', '/users/login', { email, password });
}

/**
 * Request Aadhaar OTP simulation
 * POST /users/request-otp
 */
export async function apiRequestOtp(phone, aadhaar) {
  return apiRequest('POST', '/users/request-otp', { phone, aadhaar });
}

/**
 * Register a new citizen
 * POST /users/register
 */
export async function apiRegister(userData) {
  return apiRequest('POST', '/users/register', userData);
}

/**
 * Change user password
 * PATCH /users/:id/password
 */
export async function apiChangePassword(id, currentPassword, newPassword) {
  return apiRequest('PATCH', `/users/${id}/password`, { currentPassword, newPassword });
}

// ══════════════════════════════════════════
// SERVICES CATALOG
// ══════════════════════════════════════════

/**
 * Get all active services (public)
 * GET /services
 */
export async function apiGetServices() {
  return apiRequest('GET', '/services');
}

/**
 * Get all services including drafts (Super User only)
 * GET /services/all
 */
export async function apiGetAllServices() {
  return apiRequest('GET', '/services/all');
}

/**
 * Get a single service by ID
 * GET /services/:id
 */
export async function apiGetServiceById(id) {
  return apiRequest('GET', `/services/${id}`);
}

/**
 * Create a new service (Super User only)
 * POST /services
 */
export async function apiCreateService(serviceData) {
  return apiRequest('POST', '/services', serviceData);
}

/**
 * Update a service (Super User only)
 * PATCH /services/:id
 */
export async function apiUpdateService(id, serviceData) {
  return apiRequest('PATCH', `/services/${id}`, serviceData);
}

/**
 * Toggle service status (Super User only)
 * PATCH /services/:id/toggle
 */
export async function apiToggleService(id) {
  return apiRequest('PATCH', `/services/${id}/toggle`);
}

// ══════════════════════════════════════════
// APPLICATIONS
// ══════════════════════════════════════════

/**
 * Simulate payment gateway handshake (2-second async delay)
 * POST /applications/simulate-payment
 */
export async function apiSimulatePayment(serviceId, citizenId, amount) {
  return apiRequest('POST', '/applications/simulate-payment', { serviceId, citizenId, amount });
}

/**
 * Submit a new application (Citizen)
 * POST /applications
 */
export async function apiSubmitApplication(applicationData) {
  return apiRequest('POST', '/applications', applicationData);
}

/**
 * Get applications assigned to a specific officer
 * GET /applications?officerId=X&page=1&limit=50
 */
export async function apiGetOfficerApplications(officerId, page = 1, limit = 50) {
  return apiRequest('GET', `/applications?officerId=${officerId}&page=${page}&limit=${limit}`);
}

/**
 * Get applications by status
 * GET /applications?status=X
 */
export async function apiGetApplicationsByStatus(status, page = 1, limit = 50) {
  return apiRequest('GET', `/applications?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`);
}

/**
 * Get all applications (Officer/Supervisor/SuperUser)
 * GET /applications
 */
export async function apiGetAllApplications(page = 1, limit = 50) {
  return apiRequest('GET', `/applications?page=${page}&limit=${limit}`);
}

/**
 * Get citizen's own applications
 * GET /applications/my
 */
export async function apiGetMyApplications(page = 1, limit = 50) {
  return apiRequest('GET', `/applications/my?page=${page}&limit=${limit}`);
}

/**
 * Track an application by reference number
 * GET /applications/track/:ref
 */
export async function apiTrackApplication(ref) {
  return apiRequest('GET', `/applications/track/${ref}`);
}

/**
 * Get application by ID
 * GET /applications/:id
 */
export async function apiGetApplicationById(id) {
  return apiRequest('GET', `/applications/${id}`);
}

/**
 * Update application status (Officer/Supervisor)
 * PATCH /applications/:id/status
 */
export async function apiUpdateApplicationStatus(id, status, remarks) {
  return apiRequest('PATCH', `/applications/${id}/status`, { status, remarks });
}

/**
 * Request cross-department verification (Officer)
 * POST /applications/:id/request-verification
 */
export async function apiRequestVerification(id, targetDept, reason) {
  return apiRequest('POST', `/applications/${id}/request-verification`, { targetDept, reason });
}

/**
 * Resolve cross-department verification (Officer)
 * POST /applications/:id/resolve-verification
 */
export async function apiResolveVerification(id, remarks) {
  return apiRequest('POST', `/applications/${id}/resolve-verification`, { remarks });
}

/**
 * Withdraw an application (Citizen)
 * DELETE /applications/:id
 */
export async function apiWithdrawApplication(id) {
  return apiRequest('DELETE', `/applications/${id}`);
}

/**
 * Respond to an officer query (Citizen)
 * PATCH /applications/:id/query-response
 */
export async function apiRespondToQuery(id, response) {
  return apiRequest('PATCH', `/applications/${id}/query-response`, { response });
}

// ══════════════════════════════════════════
// GRIEVANCES
// ══════════════════════════════════════════

/**
 * Raise a new grievance (Citizen)
 * POST /grievances
 */
export async function apiRaiseGrievance(grievanceData) {
  return apiRequest('POST', '/grievances', grievanceData);
}

/**
 * Get grievances for the grievance officer (filtered by jurisdiction)
 * GET /grievances
 */
export async function apiGetAllGrievances(page = 1, limit = 50) {
  return apiRequest('GET', `/grievances?page=${page}&limit=${limit}`);
}

/**
 * Get citizen's own grievances
 * GET /grievances/my
 */
export async function apiGetMyGrievances(page = 1, limit = 50) {
  return apiRequest('GET', `/grievances/my?page=${page}&limit=${limit}`);
}

/**
 * Get grievance by ID
 * GET /grievances/:id
 */
export async function apiGetGrievanceById(id) {
  return apiRequest('GET', `/grievances/${id}`);
}

/**
 * Update grievance status (Grievance Officer/Supervisor)
 * PATCH /grievances/:id/status
 */
export async function apiUpdateGrievanceStatus(id, status, resolutionNote) {
  return apiRequest('PATCH', `/grievances/${id}/status`, { status, resolutionNote });
}

/**
 * Reply to a grievance (Citizen)
 * PATCH /grievances/:id/reply
 */
export async function apiReplyToGrievance(id, reply) {
  return apiRequest('PATCH', `/grievances/${id}/reply`, { reply });
}

// ══════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════

/**
 * Get notifications for the logged-in user
 * GET /notifications
 */
export async function apiGetNotifications() {
  return apiRequest('GET', '/notifications');
}

/**
 * Get unread notification count
 * GET /notifications/count
 */
export async function apiGetNotificationCount() {
  return apiRequest('GET', '/notifications/count');
}

/**
 * Mark a notification as read
 * PATCH /notifications/:id/read
 */
export async function apiMarkNotificationRead(id) {
  return apiRequest('PATCH', `/notifications/${id}/read`);
}

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
export async function apiMarkAllNotificationsRead() {
  return apiRequest('PATCH', '/notifications/read-all');
}

// ══════════════════════════════════════════
// SUPERVISOR
// ══════════════════════════════════════════

/**
 * Get supervisor dashboard statistics
 * GET /supervisor/dashboard
 */
export async function apiGetSupervisorDashboard() {
  return apiRequest('GET', '/supervisor/dashboard');
}

/**
 * Get all escalated applications and grievances
 * GET /supervisor/escalated
 */
export async function apiGetEscalated() {
  return apiRequest('GET', '/supervisor/escalated');
}

/**
 * Get officer workload report
 * GET /supervisor/workload
 */
export async function apiGetWorkload() {
  return apiRequest('GET', '/supervisor/workload');
}

/**
 * Manually assign an application to an officer
 * POST /supervisor/assign
 */
export async function apiAssignApplication(appId, officerId) {
  return apiRequest('POST', '/supervisor/assign', { appId, officerId });
}

/**
 * Supervisor reviews an escalated case
 * PATCH /supervisor/review/:id
 */
export async function apiReviewEscalated(id, action, remarks) {
  return apiRequest('PATCH', `/supervisor/review/${id}`, { action, remarks });
}

// ══════════════════════════════════════════
// SUPER USER
// ══════════════════════════════════════════

/**
 * Get super user system dashboard stats
 * GET /super-user/dashboard
 */
export async function apiGetSuperUserDashboard() {
  return apiRequest('GET', '/super-user/dashboard');
}

/**
 * Get all pending officer applications
 * GET /super-user/pending-officers
 */
export async function apiGetPendingOfficers() {
  return apiRequest('GET', '/super-user/pending-officers');
}

/**
 * Approve a pending officer
 * PATCH /super-user/pending-officers/:id/approve
 */
export async function apiApproveOfficer(id) {
  return apiRequest('PATCH', `/super-user/pending-officers/${id}/approve`);
}

/**
 * Reject a pending officer
 * PATCH /super-user/pending-officers/:id/reject
 */
export async function apiRejectOfficer(id) {
  return apiRequest('PATCH', `/super-user/pending-officers/${id}/reject`);
}

/**
 * Get system settings
 * GET /super-user/settings
 */
export async function apiGetSettings() {
  return apiRequest('GET', '/super-user/settings');
}

/**
 * Update system settings
 * PATCH /super-user/settings
 */
export async function apiUpdateSettings(settings) {
  return apiRequest('PATCH', '/super-user/settings', settings);
}

/**
 * Get all users (Super User only)
 * GET /users
 */
export async function apiGetAllUsers() {
  return apiRequest('GET', '/users');
}

/**
 * Create a new user (Super User only)
 * POST /users
 */
export async function apiCreateUser(userData) {
  return apiRequest('POST', '/users', userData);
}

/**
 * Update a user (Super User only)
 * PATCH /users/:id
 */
export async function apiUpdateUser(id, userData) {
  return apiRequest('PATCH', `/users/${id}`, userData);
}

/**
 * Delete a user (Super User only)
 * DELETE /users/:id
 */
export async function apiDeleteUser(id) {
  return apiRequest('DELETE', `/users/${id}`);
}

/**
 * Onboard a new officer directly (Super User only)
 * POST /super-user/onboard-officer
 */
export async function apiOnboardOfficer(officerData) {
  return apiRequest('POST', '/super-user/onboard-officer', officerData);
}

// ══════════════════════════════════════════
// WORKFLOW
// ══════════════════════════════════════════

/**
 * Get workflow state machine configuration
 * GET /workflow/config
 */
export async function apiGetWorkflowConfig() {
  return apiRequest('GET', '/workflow/config');
}

/**
 * Get application timeline
 * GET /workflow/history/:appId
 */
export async function apiGetApplicationHistory(appId) {
  return apiRequest('GET', `/workflow/history/${appId}`);
}

/**
 * Get audit logs
 * GET /workflow/audit-logs
 */
export async function apiGetAuditLogs() {
  return apiRequest('GET', '/workflow/audit-logs');
}
