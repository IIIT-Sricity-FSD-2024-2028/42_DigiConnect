// Centralized API service for DigiConnect React Frontend
// Uses Vite proxy (/api/v1 -> http://localhost:3000/api/v1)
// Includes safe fallback mock data so the UI remains fully functional even if backend is offline.

const API_BASE = '/api/v1';

// Initial fallback mock data for testing/demo when backend is offline
export const INITIAL_MOCK_APPLICATIONS = [
  {
    id: 'APP-2024-0001',
    serviceId: 'SVC-001',
    serviceName: 'Income Certificate',
    serviceType: 'certificate',
    dept: 'Revenue Department',
    status: 'under-review',
    submittedDate: '2024-08-15T10:30:00.000Z',
    slaDate: '2024-08-25T10:30:00.000Z',
    officerName: 'Suresh Reddy',
    officerId: 'EMP-1001',
    fee: 50,
    remarks: 'Application documents undergoing verification.',
    timeline: [
      { action: 'Application Submitted', date: '2024-08-15T10:30:00.000Z', actor: 'Ravi Kumar', note: 'Application form and salary slip submitted.' },
      { action: 'Under Review', date: '2024-08-16T14:20:00.000Z', actor: 'Suresh Reddy', note: 'Officer assigned for physical verification check.' },
    ],
  },
  {
    id: 'APP-2024-0002',
    serviceId: 'SVC-002',
    serviceName: 'Birth Certificate',
    serviceType: 'certificate',
    dept: 'Health & Municipal Dept',
    status: 'approved',
    submittedDate: '2024-08-10T09:00:00.000Z',
    slaDate: '2024-08-17T09:00:00.000Z',
    officerName: 'Anita Sharma',
    officerId: 'EMP-1002',
    fee: 0,
    remarks: 'Certificate generated and digitally signed.',
    timeline: [
      { action: 'Application Submitted', date: '2024-08-10T09:00:00.000Z', actor: 'Ravi Kumar', note: 'Hospital birth slip uploaded.' },
      { action: 'Under Review', date: '2024-08-11T11:00:00.000Z', actor: 'Anita Sharma', note: 'Hospital records matched.' },
      { action: 'Approved', date: '2024-08-13T16:45:00.000Z', actor: 'Anita Sharma', note: 'Certificate approved.' },
    ],
  },
  {
    id: 'APP-2024-0003',
    serviceId: 'SVC-003',
    serviceName: 'Vendor License',
    serviceType: 'permission',
    dept: 'Commercial Licensing Dept',
    status: 'query',
    submittedDate: '2024-08-18T11:15:00.000Z',
    slaDate: '2024-08-28T11:15:00.000Z',
    officerName: 'Ravi Teja',
    officerId: 'EMP-1003',
    fee: 150,
    remarks: 'Please upload updated shop rent agreement or property tax receipt.',
    timeline: [
      { action: 'Application Submitted', date: '2024-08-18T11:15:00.000Z', actor: 'Ravi Kumar', note: 'Trade license request submitted.' },
      { action: 'Query Raised', date: '2024-08-20T10:00:00.000Z', actor: 'Ravi Teja', note: 'Address proof unclear. Please re-upload.' },
    ],
  },
  {
    id: 'APP-2024-0004',
    serviceId: 'SVC-004',
    serviceName: 'Welfare / Subsidy Scheme',
    serviceType: 'welfare',
    dept: 'Agriculture & Welfare Dept',
    status: 'submitted',
    submittedDate: '2024-08-22T08:45:00.000Z',
    slaDate: '2024-09-05T08:45:00.000Z',
    officerName: 'Unassigned',
    officerId: '',
    fee: 0,
    remarks: 'Application queued for officer assignment.',
    timeline: [
      { action: 'Application Submitted', date: '2024-08-22T08:45:00.000Z', actor: 'Ravi Kumar', note: 'Landholding documents uploaded.' },
    ],
  },
  {
    id: 'APP-2024-0005',
    serviceId: 'SVC-005',
    serviceName: 'Event Permission',
    serviceType: 'permission',
    dept: 'Police & Civic Administration',
    status: 'rejected',
    submittedDate: '2024-08-05T14:00:00.000Z',
    slaDate: '2024-08-12T14:00:00.000Z',
    officerName: 'Vikram Singh',
    officerId: 'EMP-1004',
    fee: 200,
    remarks: 'Venue overlaps with scheduled state highway maintenance.',
    timeline: [
      { action: 'Application Submitted', date: '2024-08-05T14:00:00.000Z', actor: 'Ravi Kumar', note: 'Sound permit and venue details submitted.' },
      { action: 'Rejected', date: '2024-08-08T15:30:00.000Z', actor: 'Vikram Singh', note: 'Denied due to safety regulations.' },
    ],
  },
  {
    id: 'APP-2024-0006',
    serviceId: 'SVC-006',
    serviceName: 'Scholarship Application',
    serviceType: 'welfare',
    dept: 'Higher Education Dept',
    status: 'escalated',
    submittedDate: '2024-07-28T16:00:00.000Z',
    slaDate: '2024-08-08T16:00:00.000Z',
    officerName: 'Anita Sharma',
    officerId: 'EMP-1002',
    fee: 0,
    remarks: 'SLA target exceeded. Auto-escalated to Higher Education Supervisor.',
    timeline: [
      { action: 'Application Submitted', date: '2024-07-28T16:00:00.000Z', actor: 'Ravi Kumar', note: 'College admission bonafide certificate attached.' },
      { action: 'Escalated', date: '2024-08-09T09:00:00.000Z', actor: 'System', note: 'SLA timer expired. Sent for expedited supervisor review.' },
    ],
  }
];

// Helper to get request headers with current session
function getHeaders() {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem('DigiConnect_session'));
  } catch (e) {
    // ignore
  }
  return {
    'Content-Type': 'application/json',
    'x-role': session?.role || 'citizen',
    'x-user-id': session?.id || 'CIT-1001',
  };
}

/**
 * Fetch citizen applications from backend NestJS API
 * Fallback to safe initial mock data if API call fails or backend is offline.
 */
export async function getApplications() {
  try {
    const res = await fetch(`${API_BASE}/applications/my?page=1&limit=100`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      // If 404/401, try general applications endpoint as backup
      const resGeneral = await fetch(`${API_BASE}/applications?page=1&limit=100`, {
        headers: getHeaders(),
      });
      if (resGeneral.ok) {
        const jsonGeneral = await resGeneral.json();
        return jsonGeneral.data || INITIAL_MOCK_APPLICATIONS;
      }
      throw new Error(`HTTP Error ${res.status}`);
    }

    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return INITIAL_MOCK_APPLICATIONS;
  } catch (err) {
    console.warn('Backend offline or unreachable, using safe mock applications data.', err.message);
    return INITIAL_MOCK_APPLICATIONS;
  }
}

/**
 * Withdraw an application
 */
export async function withdrawApplicationApi(id) {
  try {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to withdraw application ${id}`);
    }
    return true;
  } catch (err) {
    console.warn('API withdrawal failed or backend offline, updating local state.', err.message);
    return true; // allow optimistic local UI removal
  }
}
