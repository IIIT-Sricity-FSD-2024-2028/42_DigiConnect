// src/api/client.js
// Centralized fetch client communicating with NestJS backend at http://localhost:3000/api/v1
// Automatically appends governance headers (x-role, x-user-id, x-state-id, etc.)

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api/v1';

export async function apiFetch(endpoint, options = {}) {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem('DigiConnect_session'));
  } catch (e) {
    session = null;
  }

  const defaultRole = session?.backendRole || session?.role || (typeof window !== 'undefined' && window.location.pathname.includes('/citizen') ? 'CITIZEN' : '');
  const defaultUserId = session?.id || (defaultRole === 'CITIZEN' ? 'CIT-AP-001' : '');

  const headers = {
    'Content-Type': 'application/json',
    'x-role': defaultRole,
    'x-user-id': defaultUserId,
    'x-state-id': session?.stateId || session?.state || '',
    'x-department-id': session?.departmentId || '',
    'x-assigned-node-id': session?.assignedNodeId || '',
    'x-designation-id': session?.designationId || '',
    ...(options.headers || {}),
  };

  // When submitting FormData (file uploads), delete Content-Type so the browser sets the multipart boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || `HTTP Error ${response.status}`;
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  return data;
}
