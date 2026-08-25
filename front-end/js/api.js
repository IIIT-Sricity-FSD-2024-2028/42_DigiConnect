// ═══════════════════════════════════════════
// api.js — Centralized API client for NestJS backend
// All data fetching goes through this file.
// Session (x-role, x-user-id) is auto-appended to every request.
// ═══════════════════════════════════════════

const BASE = 'http://localhost:3000/api/v1';

/**
 * Build request headers from current session stored in localStorage
 */
function getHeaders() {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem('DigiConnect_session'));
  } catch (e) { /* ignore */ }
  return {
    'Content-Type': 'application/json',
    'x-role': session?.role || '',
    'x-user-id': session?.id || '',
  };
}

/**
 * Generic fetch wrapper — returns parsed JSON or throws on error
 */
export async function apiFetch(path, options = {}) {
  const headers = { ...getHeaders(), ...(options.headers || {}) };
  if (options.body instanceof FormData) {
    delete headers['Content-Type']; // Browser will automatically set multipart/form-data boundary
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 413) {
      throw new Error('File upload limit exceeded: The uploaded file is too large (maximum allowed size is 5MB).');
    }
    const msg = json?.message || `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join('; ') : msg);
  }
  return json;
}

// ──────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────

/** Login: POST /users/login */
export async function apiLogin(email, password) {
  return apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** Register a new citizen: POST /users/register */
export async function apiRegister(userData) {
  return apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/** Change password: PATCH /users/:id/password */
export async function apiChangePassword(id, currentPassword, newPassword) {
  return apiFetch(`/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/** Update user profile: PATCH /users/:id */
export async function apiUpdateUserProfile(id, data) {
  return apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ──────────────────────────────────────────
// USERS (Admin / Super User)
// ──────────────────────────────────────────

/** Get all users: GET /users */
export async function apiGetUsers() {
  return apiFetch('/users');
}

/** Get user by ID: GET /users/:id */
export async function apiGetUserById(id) {
  return apiFetch(`/users/${id}`);
}

/** Create a user: POST /users */
export async function apiCreateUser(data) {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
}

/** Update a user: PATCH /users/:id */
export async function apiUpdateUser(id, data) {
  return apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/** Delete a user: DELETE /users/:id */
export async function apiDeleteUser(id) {
  return apiFetch(`/users/${id}`, { method: 'DELETE' });
}

// ──────────────────────────────────────────
// APPLICATIONS
// ──────────────────────────────────────────

/** Get citizen's own applications: GET /applications/my */
export async function apiGetMyApplications(page = 1, limit = 100) {
  return apiFetch(`/applications/my?page=${page}&limit=${limit}`);
}

/** Get all applications (admin/officer): GET /applications */
export async function apiGetAllApplications(params = '') {
  return apiFetch(`/applications${params}`);
}

/** Get application by ID: GET /applications/:id */
export async function apiGetApplicationById(id) {
  return apiFetch(`/applications/${id}`);
}

/** Track application by reference: GET /applications/track/:ref */
export async function apiTrackApplication(ref) {
  return apiFetch(`/applications/track/${ref}`);
}

/** Submit a new application: POST /applications */
export async function apiSubmitApplication(data) {
  const body = data instanceof FormData ? data : JSON.stringify(data);
  return apiFetch('/applications', { method: 'POST', body });
}

/** Update application status: PATCH /applications/:id/status */
export async function apiUpdateApplicationStatus(id, data) {
  return apiFetch(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Respond to officer query: PATCH /applications/:id/query-response */
export async function apiRespondToQuery(id, data) {
  const body = data instanceof FormData ? data : JSON.stringify(typeof data === 'string' ? { response: data } : data);
  return apiFetch(`/applications/${id}/query-response`, {
    method: 'PATCH',
    body,
  });
}

/** Withdraw application: DELETE /applications/:id */
export async function apiWithdrawApplication(id) {
  return apiFetch(`/applications/${id}`, { method: 'DELETE' });
}

/** Simulate payment: POST /applications/simulate-payment */
export async function apiSimulatePayment(serviceId, citizenId, amount) {
  return apiFetch('/applications/simulate-payment', {
    method: 'POST',
    body: JSON.stringify({ serviceId, citizenId, amount }),
  });
}

// ──────────────────────────────────────────
// OFFICER-SPECIFIC
// ──────────────────────────────────────────

/** Get officer application queue: GET /applications/officer-queue */
export async function apiGetOfficerQueue() {
  return apiFetch('/applications/officer-queue');
}

/** Get officer pending queries: GET /applications/officer-queries */
export async function apiGetOfficerQueries() {
  return apiFetch('/applications/officer-queries');
}

/** Get officer recent activity: GET /applications/officer-activity */
export async function apiGetOfficerActivity() {
  return apiFetch('/applications/officer-activity');
}

/** Get SLA at-risk items: GET /applications/officer-sla-risks */
export async function apiGetOfficerSlaRisks() {
  return apiFetch('/applications/officer-sla-risks');
}

/** Get officer weekly chart: GET /applications/officer-week-chart */
export async function apiGetOfficerWeekChart() {
  return apiFetch('/applications/officer-week-chart');
}

// ──────────────────────────────────────────
// GRIEVANCES
// ──────────────────────────────────────────

/** Get citizen's grievances: GET /grievances/my */
export async function apiGetMyGrievances() {
  return apiFetch('/grievances/my');
}

/** Get all grievances (grievance officer / admin): GET /grievances */
export async function apiGetAllGrievances(page = 1, limit = 200) {
  return apiFetch(`/grievances?page=${page}&limit=${limit}`);
}

/** Get grievance by ID: GET /grievances/:id */
export async function apiGetGrievanceById(id) {
  return apiFetch(`/grievances/${id}`);
}

/** Raise a grievance: POST /grievances */
export async function apiRaiseGrievance(data) {
  const body = data instanceof FormData ? data : JSON.stringify(data);
  return apiFetch('/grievances', { method: 'POST', body });
}

/** Update grievance status: PATCH /grievances/:id/status */
export async function apiUpdateGrievanceStatus(id, data) {
  return apiFetch(`/grievances/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Reply to a grievance: PATCH /grievances/:id/reply */
export async function apiReplyGrievance(id, reply) {
  return apiFetch(`/grievances/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ reply }),
  });
}

// ──────────────────────────────────────────
// SERVICES
// ──────────────────────────────────────────

/** Get all active services: GET /services */
export async function apiGetServices() {
  return apiFetch('/services');
}

/** Get all services including inactive: GET /services/all */
export async function apiGetAllServices() {
  return apiFetch('/services/all');
}

/** Create a service: POST /services */
export async function apiCreateService(data) {
  return apiFetch('/services', { method: 'POST', body: JSON.stringify(data) });
}

/** Update a service: PATCH /services/:id */
export async function apiUpdateService(id, data) {
  return apiFetch(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/** Delete a service: DELETE /services/:id */
export async function apiDeleteService(id) {
  return apiFetch(`/services/${id}`, { method: 'DELETE' });
}

// ──────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────

/** Get notifications for current user: GET /notifications */
export async function apiGetNotifications() {
  return apiFetch('/notifications');
}

/** Get unread count: GET /notifications/count */
export async function apiGetNotificationCount() {
  return apiFetch('/notifications/count');
}

/** Mark all as read: PATCH /notifications/read-all */
export async function apiMarkAllNotificationsRead() {
  return apiFetch('/notifications/read-all', { method: 'PATCH' });
}

/** Mark one as read: PATCH /notifications/:id/read */
export async function apiMarkNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

/** Create manual notification: POST /notifications */
export async function apiCreateNotification(data) {
  return apiFetch('/notifications', { method: 'POST', body: JSON.stringify(data) });
}

// ──────────────────────────────────────────
// SUPERVISOR
// ──────────────────────────────────────────

/** Get supervisor dashboard data: GET /supervisor/dashboard */
export async function apiGetSupervisorDashboard() {
  return apiFetch('/supervisor/dashboard');
}

/** Get escalated cases: GET /supervisor/escalated */
export async function apiGetEscalated() {
  return apiFetch('/supervisor/escalated');
}

/** Get officer workload: GET /supervisor/workload */
export async function apiGetWorkload() {
  return apiFetch('/supervisor/workload');
}

/** Assign application to officer: POST /supervisor/assign */
export async function apiAssignApplication(appId, officerId) {
  return apiFetch('/supervisor/assign', {
    method: 'POST',
    body: JSON.stringify({ appId, officerId }),
  });
}

/** Review escalated case: PATCH /supervisor/review/:id */
export async function apiReviewEscalated(id, action, remarks) {
  return apiFetch(`/supervisor/review/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, remarks }),
  });
}

// ──────────────────────────────────────────
// SUPER USER (Admin)
// ──────────────────────────────────────────

/** Get admin dashboard stats: GET /super-user/dashboard */
export async function apiGetAdminDashboard() {
  return apiFetch('/super-user/dashboard');
}

/** Get system settings: GET /super-user/settings */
export async function apiGetSettings() {
  return apiFetch('/super-user/settings');
}

/** Update system settings: PATCH /super-user/settings */
export async function apiUpdateSettings(data) {
  return apiFetch('/super-user/settings', { method: 'PATCH', body: JSON.stringify(data) });
}

/** Get pending officer registrations: GET /super-user/pending-officers */
export async function apiGetPendingOfficers() {
  return apiFetch('/super-user/pending-officers');
}

/** Onboard a new officer directly: POST /super-user/onboard-officer */
export async function apiOnboardOfficer(data) {
  return apiFetch('/super-user/onboard-officer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Approve pending officer: PATCH /super-user/pending-officers/:id/approve */
export async function apiApproveOfficer(id) {
  return apiFetch(`/super-user/pending-officers/${id}/approve`, { method: 'PATCH' });
}

/** Reject pending officer: PATCH /super-user/pending-officers/:id/reject */
export async function apiRejectOfficer(id) {
  return apiFetch(`/super-user/pending-officers/${id}/reject`, { method: 'PATCH' });
}

/** Get audit logs: GET /super-user/audit-logs */
export async function apiGetAuditLogs() {
  return apiFetch('/super-user/audit-logs');
}

/** Create audit log: POST /super-user/audit-logs */
export async function apiCreateAuditLog(data) {
  return apiFetch('/super-user/audit-logs', { method: 'POST', body: JSON.stringify(data) });
}

// ──────────────────────────────────────────
// WORKFLOW CONFIG
// ──────────────────────────────────────────

/** Get workflow config: GET /workflow/config */
export async function apiGetWorkflowConfig() {
  return apiFetch('/workflow/config');
}

/** Update workflow config: PATCH /workflow/config */
export async function apiUpdateWorkflowConfig(data) {
  return apiFetch('/workflow/config', { method: 'PATCH', body: JSON.stringify(data) });
}
