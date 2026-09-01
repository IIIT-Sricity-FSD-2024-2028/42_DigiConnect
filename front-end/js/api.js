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
    'x-role': session?.backendRole || session?.actualRole || session?.role || '',
    'x-user-id': session?.id || '',
    'x-state-id': session?.stateId || 'state_ap',
    'x-department-id': session?.departmentId || 'dept_rev_ap',
    'x-assigned-node-id': session?.assignedNodeId || '',
    'x-designation-id': session?.designationId || '',
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
    cache: 'no-store',
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

const INITIAL_LOCAL_SERVICES = [
  // ─── 1. AP REVENUE ───
  {
    id: 'srv_caste_income_ap',
    departmentId: 'dept_rev_ap',
    stateId: 'state_ap',
    dept: 'Revenue, Registration & Stamps Department',
    name: 'Integrated Community, Nativity & Date of Birth Certificate',
    code: 'CASTE_CERT_AP',
    category: 'Certificate',
    cat: 'Certificate',
    description: 'Official statutory certificate verifying caste, nativity, and parental ancestry in Andhra Pradesh.',
    status: 'ACTIVE',
    serviceFee: 35,
    platformFee: 15,
    totalFee: 50,
    fee: 50,
    feeLabel: '₹50',
    sla: 7,
    slaDays: 7,
    workflowSummary: 'VRO ➔ Tahsildar',
    docs: ['Aadhaar Card Proof', 'Ration Card / Voter ID Copy'],
    fields: [
      { id: 'applicant_name', label: 'Full Name of Applicant', type: 'TEXT', required: true },
      { id: 'aadhaar_number', label: 'Aadhaar Card Number', type: 'TEXT', required: true },
      { id: 'caste_category', label: 'Social Category / Caste', type: 'DROPDOWN', required: true },
      { id: 'annual_income', label: 'Annual Family Income (INR)', type: 'NUMBER', required: true },
      { id: 'dob', label: 'Date of Birth', type: 'DATE', required: true },
    ],
    documentRequirements: [
      { id: 'doc_aadhaar', name: 'Aadhaar Card Proof', required: true },
      { id: 'doc_ration_card', name: 'Ration Card / Voter ID Copy', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'VRO Verification & Field Inquiry', requiredDesignationId: 'desig_vro_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Tahsildar Digital Approval & DSC Signoff', requiredDesignationId: 'desig_tah_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_land_mutation_ap',
    departmentId: 'dept_rev_ap',
    stateId: 'state_ap',
    dept: 'Revenue, Registration & Stamps Department',
    name: 'Agricultural Land Mutation & Pattadar Passbook',
    code: 'LAND_MUTATION_AP',
    category: 'Correction',
    cat: 'Correction',
    description: 'Title deed transfer and title passbook endorsement for agricultural holdings.',
    status: 'ACTIVE',
    serviceFee: 85,
    platformFee: 15,
    totalFee: 100,
    fee: 100,
    feeLabel: '₹100',
    sla: 14,
    slaDays: 14,
    workflowSummary: 'RI ➔ Tahsildar',
    docs: ['Registered Sale Deed Copy', 'Existing Pattadar Passbook Copy'],
    fields: [
      { id: 'survey_number', label: 'Survey Number / Sub-division', type: 'TEXT', required: true },
      { id: 'land_extent_acres', label: 'Land Extent (Acres / Cents)', type: 'NUMBER', required: true },
      { id: 'registered_deed_no', label: 'Registered Document / Sale Deed No.', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_sale_deed', name: 'Registered Sale Deed Copy', required: true },
      { id: 'doc_pattadar_book', name: 'Existing Pattadar Passbook Copy', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Revenue Inspector Spot Survey', requiredDesignationId: 'desig_ri_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Tahsildar Record Mutation & Issue', requiredDesignationId: 'desig_tah_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 2. AP WELFARE ───
  {
    id: 'srv_vidya_deevena_ap',
    departmentId: 'dept_wel_ap',
    stateId: 'state_ap',
    dept: 'Social Welfare & Empowerment Department',
    name: 'Jagananna Vidya Deevena Full Fee Reimbursement',
    code: 'VIDYA_DEEVENA_AP',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'Post-matric 100% tuition fee reimbursement for students belonging to SC/ST/BC/EBC communities.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'WEA ➔ ASWO ➔ DSWO',
    docs: ['College Admission Allotment Order', 'Valid Income Certificate'],
    fields: [
      { id: 'student_name', label: 'Student Name', type: 'TEXT', required: true },
      { id: 'college_code', label: 'College / Institution Code', type: 'TEXT', required: true },
      { id: 'course_name', label: 'Course / Degree Name', type: 'TEXT', required: true },
      { id: 'annual_income', label: 'Annual Family Income (INR)', type: 'NUMBER', required: true },
    ],
    documentRequirements: [
      { id: 'doc_college_id', name: 'College Admission Allotment Order', required: true },
      { id: 'doc_income_cert', name: 'Valid Income Certificate', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Welfare Assistant College Attendance Audit', requiredDesignationId: 'desig_wea_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'ASWO Scrutiny & Sanction', requiredDesignationId: 'desig_aswo_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 3, stepName: 'DSWO Final DBT Disbursement Order', requiredDesignationId: 'desig_dswo_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_cheyutha_ap',
    departmentId: 'dept_wel_ap',
    stateId: 'state_ap',
    dept: 'Social Welfare & Empowerment Department',
    name: 'YSR Cheyutha Women Livelihood Grant',
    code: 'CHEYUTHA_AP',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'Annual ₹18,750 financial grant for women aged 45-60 belonging to minority and backward communities.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'WEA ➔ DSWO',
    docs: ['Aadhaar Card Proof', 'Bank Passbook First Page Copy'],
    fields: [
      { id: 'beneficiary_name', label: 'Woman Beneficiary Full Name', type: 'TEXT', required: true },
      { id: 'age', label: 'Age (Years)', type: 'NUMBER', required: true },
      { id: 'bank_account_no', label: 'Aadhaar Seeded Bank Account No.', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_aadhaar', name: 'Aadhaar Card Proof', required: true },
      { id: 'doc_bank_passbook', name: 'Bank Passbook First Page Copy', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Welfare Assistant Field Eligibility Audit', requiredDesignationId: 'desig_wea_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'DSWO Sanction & Direct Credit', requiredDesignationId: 'desig_dswo_ap', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 3. KA REVENUE ───
  {
    id: 'srv_caste_income_ka',
    departmentId: 'dept_rev_ka',
    stateId: 'state_ka',
    dept: 'Revenue & Disaster Management Department',
    name: 'Caste & Income Certificate (Nadakacheri / AJSK)',
    code: 'CASTE_CERT_KA',
    category: 'Certificate',
    cat: 'Certificate',
    description: 'Official statutory caste & income certificate under Atalji Janasnehi Kendra (Nadakacheri).',
    status: 'ACTIVE',
    serviceFee: 40,
    platformFee: 10,
    totalFee: 50,
    fee: 50,
    feeLabel: '₹50',
    sla: 7,
    slaDays: 7,
    workflowSummary: 'VAO ➔ RI ➔ Tahsildar',
    docs: ['Aadhaar Card Proof', 'Karnataka Ration Card Copy'],
    fields: [
      { id: 'applicant_name', label: 'Applicant Name', type: 'TEXT', required: true },
      { id: 'aadhaar_number', label: 'Aadhaar Number', type: 'TEXT', required: true },
      { id: 'category', label: 'Category (Cat-1 / 2A / 2B / 3A / 3B / SC / ST)', type: 'DROPDOWN', required: true },
      { id: 'annual_income', label: 'Annual Income (INR)', type: 'NUMBER', required: true },
    ],
    documentRequirements: [
      { id: 'doc_aadhaar', name: 'Aadhaar Card Proof', required: true },
      { id: 'doc_ration_card', name: 'Karnataka Ration Card Copy', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'VAO / ARO Desk Scrutiny', requiredDesignationId: 'desig_vao_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Hobli Revenue Inspector Inquiry', requiredDesignationId: 'desig_ri_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 3, stepName: 'Tahsildar Approval & Nadakacheri Issuance', requiredDesignationId: 'desig_tah_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_bhoomi_rtc_ka',
    departmentId: 'dept_rev_ka',
    stateId: 'state_ka',
    dept: 'Revenue & Disaster Management Department',
    name: 'Bhoomi RTC Land Record Mutation & Extract',
    code: 'BHOOMI_RTC_KA',
    category: 'Correction',
    cat: 'Correction',
    description: 'Land Rights, Tenancy and Crops (RTC / Pahani) mutation and certified digitally signed extract.',
    status: 'ACTIVE',
    serviceFee: 50,
    platformFee: 15,
    totalFee: 65,
    fee: 65,
    feeLabel: '₹65',
    sla: 14,
    slaDays: 14,
    workflowSummary: 'RI ➔ Tahsildar',
    docs: ['Applicant Identity Proof'],
    fields: [
      { id: 'hissa_no', label: 'Hissa / Survey Number', type: 'TEXT', required: true },
      { id: 'hobli_name', label: 'Hobli / Taluk Name', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_id_proof', name: 'Applicant Identity Proof', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Hobli Revenue Inspector Verification', requiredDesignationId: 'desig_ri_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Tahsildar Final Bhoomi Endorsement', requiredDesignationId: 'desig_tah_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 4. KA WELFARE ───
  {
    id: 'srv_vidyasiri_ka',
    departmentId: 'dept_wel_ka',
    stateId: 'state_ka',
    dept: 'Social Welfare Department',
    name: 'Vidyasiri Post-Matric Student Scholarship',
    code: 'VIDYASIRI_KA',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'State scholarship and hostel fee assistance for post-matric students of backward classes.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'TWO ➔ DWO',
    docs: ['Nadakacheri Income & Caste Certificate', 'College Fee Receipt'],
    fields: [
      { id: 'student_name', label: 'Student Name', type: 'TEXT', required: true },
      { id: 'college_registration_no', label: 'College Registration / USN Number', type: 'TEXT', required: true },
      { id: 'annual_income', label: 'Annual Income (INR)', type: 'NUMBER', required: true },
    ],
    documentRequirements: [
      { id: 'doc_income_caste', name: 'Nadakacheri Income & Caste Certificate', required: true },
      { id: 'doc_fee_receipt', name: 'College Fee Receipt', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Taluk Welfare Officer Scrutiny', requiredDesignationId: 'desig_two_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'District Welfare Officer Sanction Order', requiredDesignationId: 'desig_dwo_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_gruha_lakshmi_ka',
    departmentId: 'dept_wel_ka',
    stateId: 'state_ka',
    dept: 'Social Welfare Department',
    name: 'Gruha Lakshmi Monthly Financial Grant',
    code: 'GRUHA_LAKSHMI_KA',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'Direct benefit transfer of ₹2,000 monthly to female heads of eligible households in Karnataka.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'TWO ➔ DWO',
    docs: ['Ration Card Copy', 'Bank Passbook Copy'],
    fields: [
      { id: 'woman_head_name', label: 'Name of Woman Head', type: 'TEXT', required: true },
      { id: 'ration_card_no', label: 'Ration Card Number (BPL / AAY)', type: 'TEXT', required: true },
      { id: 'bank_account_no', label: 'Bank Account Number for DBT', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_ration_card', name: 'Ration Card Copy', required: true },
      { id: 'doc_bank_passbook', name: 'Bank Passbook Copy', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Taluk Welfare Officer Eligibility Verification', requiredDesignationId: 'desig_two_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'District Welfare Officer DBT Sanction', requiredDesignationId: 'desig_dwo_ka', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 5. KL REVENUE ───
  {
    id: 'srv_caste_income_kl',
    departmentId: 'dept_rev_kl',
    stateId: 'state_kl',
    dept: 'Revenue & Land Reforms Department',
    name: 'E-District Caste, Community & Income Certificate',
    code: 'CASTE_CERT_KL',
    category: 'Certificate',
    cat: 'Certificate',
    description: 'Official revenue certificate for caste and annual income issued via Kerala e-District.',
    status: 'ACTIVE',
    serviceFee: 30,
    platformFee: 10,
    totalFee: 40,
    fee: 40,
    feeLabel: '₹40',
    sla: 7,
    slaDays: 7,
    workflowSummary: 'VO ➔ DTah ➔ Tahsildar',
    docs: ['Aadhaar Card Proof', 'SSLC Book Copy (Religion / Caste page)'],
    fields: [
      { id: 'applicant_name', label: 'Applicant Name', type: 'TEXT', required: true },
      { id: 'aadhaar_number', label: 'Aadhaar Number', type: 'TEXT', required: true },
      { id: 'community', label: 'Community / Religion', type: 'TEXT', required: true },
      { id: 'annual_income', label: 'Annual Income (INR)', type: 'NUMBER', required: true },
    ],
    documentRequirements: [
      { id: 'doc_aadhaar', name: 'Aadhaar Card Proof', required: true },
      { id: 'doc_sslc_book', name: 'SSLC Book Copy (Religion / Caste page)', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Village Officer Desk Verification', requiredDesignationId: 'desig_vo_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Deputy Tahsildar Endorsement', requiredDesignationId: 'desig_dtah_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 3, stepName: 'Tahsildar Digital Signature & e-District Issue', requiredDesignationId: 'desig_tah_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_possession_cert_kl',
    departmentId: 'dept_rev_kl',
    stateId: 'state_kl',
    dept: 'Revenue & Land Reforms Department',
    name: 'Possession & Non-Attachment Certificate',
    code: 'POSSESSION_CERT_KL',
    category: 'Certificate',
    cat: 'Certificate',
    description: 'Statutory proof of physical possession and encumbrance-free title of landed property in Kerala.',
    status: 'ACTIVE',
    serviceFee: 60,
    platformFee: 15,
    totalFee: 75,
    fee: 75,
    feeLabel: '₹75',
    sla: 14,
    slaDays: 14,
    workflowSummary: 'VO ➔ Tahsildar',
    docs: ['Latest Land Tax Receipt', 'Registered Title Deed Copy'],
    fields: [
      { id: 'survey_resurvey_no', label: 'Re-survey / Survey Number', type: 'TEXT', required: true },
      { id: 'thandaper_no', label: 'Thandaper Number', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_land_tax_receipt', name: 'Latest Land Tax Receipt', required: true },
      { id: 'doc_title_deed', name: 'Registered Title Deed Copy', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Village Officer Spot Inquiry', requiredDesignationId: 'desig_vo_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Tahsildar Final Possession Certificate', requiredDesignationId: 'desig_tah_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 6. KL WELFARE ───
  {
    id: 'srv_vidyakiranam_kl',
    departmentId: 'dept_wel_kl',
    stateId: 'state_kl',
    dept: 'Social Justice & Women Empowerment Department',
    name: 'Vidyakiranam Educational Assistance Scheme',
    code: 'VIDYAKIRANAM_KL',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'Educational scholarship grant for children of disabled or economically backward parents in Kerala.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'TSJO ➔ DSJO',
    docs: ['Parent Disability Certificate / Income Proof', 'Institution Study Certificate'],
    fields: [
      { id: 'student_name', label: 'Student Name', type: 'TEXT', required: true },
      { id: 'school_college_name', label: 'School / College Name', type: 'TEXT', required: true },
      { id: 'annual_income', label: 'Family Annual Income (INR)', type: 'NUMBER', required: true },
    ],
    documentRequirements: [
      { id: 'doc_disability_cert', name: 'Parent Disability Certificate / Income Proof', required: true },
      { id: 'doc_study_cert', name: 'Institution Study Certificate', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Taluk Social Justice Officer Scrutiny', requiredDesignationId: 'desig_tsjo_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'District Social Justice Officer Sanction Order', requiredDesignationId: 'desig_dsjo_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_karunya_kl',
    departmentId: 'dept_wel_kl',
    stateId: 'state_kl',
    dept: 'Social Justice & Women Empowerment Department',
    name: 'Karunya Benevolent Health Care Scheme',
    code: 'KARUNYA_KL',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'Financial assistance for critical medical treatments and surgeries for underprivileged families.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'TSJO ➔ DSJO',
    docs: ['Government Hospital Treatment Estimate', 'Income Certificate'],
    fields: [
      { id: 'patient_name', label: 'Patient Name', type: 'TEXT', required: true },
      { id: 'ailment_details', label: 'Critical Illness / Treatment Details', type: 'TEXT', required: true },
      { id: 'estimated_cost', label: 'Estimated Hospital Treatment Cost (INR)', type: 'NUMBER', required: true },
    ],
    documentRequirements: [
      { id: 'doc_hospital_estimate', name: 'Government Hospital Treatment Estimate', required: true },
      { id: 'doc_income_cert', name: 'Income Certificate', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'TSJO Medical Record Scrutiny', requiredDesignationId: 'desig_tsjo_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'DSJO Sanction & Hospital Release', requiredDesignationId: 'desig_dsjo_kl', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 7. TN REVENUE ───
  {
    id: 'srv_community_cert_tn',
    departmentId: 'dept_rev_tn',
    stateId: 'state_tn',
    dept: 'Revenue & Disaster Management Department',
    name: 'Community & Nativity Certificate (e-Sevai)',
    code: 'COMMUNITY_CERT_TN',
    category: 'Certificate',
    cat: 'Certificate',
    description: 'Official statutory community and nativity certificate issued through Tamil Nadu e-Sevai portal.',
    status: 'ACTIVE',
    serviceFee: 35,
    platformFee: 15,
    totalFee: 50,
    fee: 50,
    feeLabel: '₹50',
    sla: 7,
    slaDays: 7,
    workflowSummary: 'VAO ➔ RI ➔ Tahsildar',
    docs: ['Aadhaar Card Proof', 'Parent Community Certificate Copy'],
    fields: [
      { id: 'applicant_name', label: 'Applicant Name', type: 'TEXT', required: true },
      { id: 'aadhaar_number', label: 'Aadhaar Number', type: 'TEXT', required: true },
      { id: 'community', label: 'Community (BC / MBC / SC / ST / OC)', type: 'DROPDOWN', required: true },
      { id: 'father_caste', label: 'Father Community / Caste', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_aadhaar', name: 'Aadhaar Card Proof', required: true },
      { id: 'doc_parent_community', name: 'Parent Community Certificate Copy', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'VAO / Urban VAO Verification', requiredDesignationId: 'desig_vao_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Revenue Inspector Spot Inquiry', requiredDesignationId: 'desig_ri_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 3, stepName: 'Zonal Deputy Tahsildar e-Sevai Signature', requiredDesignationId: 'desig_tah_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_legal_heir_tn',
    departmentId: 'dept_rev_tn',
    stateId: 'state_tn',
    dept: 'Revenue & Disaster Management Department',
    name: 'Legal Heir Certificate (Varisu Sanrithu)',
    code: 'LEGAL_HEIR_TN',
    category: 'Certificate',
    cat: 'Certificate',
    description: 'Statutory certificate declaring surviving legal heirs of a deceased person in Tamil Nadu.',
    status: 'ACTIVE',
    serviceFee: 50,
    platformFee: 10,
    totalFee: 60,
    fee: 60,
    feeLabel: '₹60',
    sla: 14,
    slaDays: 14,
    workflowSummary: 'VAO ➔ RI ➔ Tahsildar',
    docs: ['Original Death Certificate', 'Notarized Legal Heir Affidavit'],
    fields: [
      { id: 'deceased_name', label: 'Deceased Person Full Name', type: 'TEXT', required: true },
      { id: 'date_of_death', label: 'Date of Death', type: 'DATE', required: true },
      { id: 'number_of_heirs', label: 'Total Number of Surviving Legal Heirs', type: 'NUMBER', required: true },
    ],
    documentRequirements: [
      { id: 'doc_death_cert', name: 'Original Death Certificate', required: true },
      { id: 'doc_legal_heir_affidavit', name: 'Notarized Legal Heir Affidavit', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'VAO Heir Scrutiny & Family Tree Inquiry', requiredDesignationId: 'desig_vao_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'Revenue Inspector Inquiry Report', requiredDesignationId: 'desig_ri_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 3, stepName: 'Tahsildar Legal Heir Certificate Issuance', requiredDesignationId: 'desig_tah_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 8. TN WELFARE ───
  {
    id: 'srv_pudhumai_penn_tn',
    departmentId: 'dept_wel_tn',
    stateId: 'state_tn',
    dept: 'Adi Dravidar & Tribal Welfare Department',
    name: 'Moovalur Ramamirtham Ammaiyar Pudhumai Penn Scheme',
    code: 'PUDHUMAI_PENN_TN',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'Monthly ₹1,000 higher education financial grant for female students who studied in government schools.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'ST ➔ DADWO',
    docs: ['Govt School Study Certificate (Classes 6-12)', 'Current College ID / Admission Proof'],
    fields: [
      { id: 'student_name', label: 'Girl Student Name', type: 'TEXT', required: true },
      { id: 'emis_number', label: 'School EMIS Number', type: 'TEXT', required: true },
      { id: 'college_name', label: 'Present College / University Name', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_school_bonafide', name: 'Govt School Study Certificate (Classes 6-12)', required: true },
      { id: 'doc_college_id', name: 'Current College ID / Admission Proof', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Special Tahsildar EMIS School Record Scrutiny', requiredDesignationId: 'desig_st_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'District Welfare Officer Sanction & DBT Credit', requiredDesignationId: 'desig_dadwo_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'srv_adw_scholarship_tn',
    departmentId: 'dept_wel_tn',
    stateId: 'state_tn',
    dept: 'Adi Dravidar & Tribal Welfare Department',
    name: 'Post-Matric Adi Dravidar Welfare Scholarship',
    code: 'ADW_SCHOLARSHIP_TN',
    category: 'Welfare',
    cat: 'Welfare',
    description: 'Tuition and maintenance scholarship for SC/ST students enrolled in undergraduate and postgraduate programs.',
    status: 'ACTIVE',
    serviceFee: 0,
    platformFee: 0,
    totalFee: 0,
    fee: 0,
    feeLabel: 'Free',
    sla: 15,
    slaDays: 15,
    workflowSummary: 'ST ➔ DADWO',
    docs: ['Community Certificate', 'College Fee Structure & Bonafide'],
    fields: [
      { id: 'student_name', label: 'Student Name', type: 'TEXT', required: true },
      { id: 'degree_course', label: 'Degree / Program of Study', type: 'TEXT', required: true },
      { id: 'community_cert_no', label: 'Community Certificate Number', type: 'TEXT', required: true },
    ],
    documentRequirements: [
      { id: 'doc_community', name: 'Community Certificate', required: true },
      { id: 'doc_college_bonafide', name: 'College Fee Structure & Bonafide', required: true },
    ],
    workflowSteps: [
      { stepNumber: 1, stepName: 'Special Tahsildar Welfare Verification', requiredDesignationId: 'desig_st_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false },
      { stepNumber: 2, stepName: 'DADWO Scholarship Sanction Order', requiredDesignationId: 'desig_dadwo_tn', canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function getStoredServices() {
  try {
    const raw = localStorage.getItem('DigiConnect_services');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  saveStoredServices(INITIAL_LOCAL_SERVICES);
  return [...INITIAL_LOCAL_SERVICES];
}

function saveStoredServices(list) {
  try {
    localStorage.setItem('DigiConnect_services', JSON.stringify(list));
  } catch (e) {}
}

/** Get all active services: GET /services */
export async function apiGetServices(deptId) {
  try {
    const url = deptId ? `/services?departmentId=${deptId}` : '/services';
    const res = await apiFetch(url);
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      saveStoredServices(res.data);
      return res;
    }
  } catch (e) {}
  const list = getStoredServices().filter(s => !deptId || s.departmentId === deptId || s.deptId === deptId);
  return { success: true, data: list };
}

/** Get all services including inactive: GET /services/all */
export async function apiGetAllServices() {
  return apiGetServices();
}

/** Create a service: POST /services */
export async function apiCreateService(data) {
  let created = null;
  try {
    const res = await apiFetch('/services', { method: 'POST', body: JSON.stringify(data) });
    if (res && res.data) created = res.data;
  } catch (e) {}

  if (!created) {
    created = {
      id: `srv_${(data.code || 'service').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`,
      departmentId: data.departmentId || 'dept_rev_ap',
      name: data.name,
      code: data.code || 'SRV_CODE',
      description: data.description || '',
      status: data.status || 'ACTIVE',
      serviceFee: data.serviceFee || 35,
      platformFee: data.platformFee || 15,
      totalFee: (data.serviceFee || 35) + (data.platformFee || 15),
      slaDays: data.slaDays || 7,
      workflowSteps: data.workflowSteps || [],
      fields: data.fields || [],
      documentRequirements: data.documentRequirements || [],
      createdAt: new Date().toISOString(),
    };
  }

  const list = getStoredServices();
  const idx = list.findIndex(s => s.id === created.id);
  if (idx >= 0) list[idx] = created;
  else list.unshift(created);
  saveStoredServices(list);
  return { success: true, data: created };
}

/** Update a service: PATCH /services/:id */
export async function apiUpdateService(id, data) {
  try {
    const res = await apiFetch(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    if (res && res.data) {
      const list = getStoredServices();
      const idx = list.findIndex(s => s.id === id);
      if (idx >= 0) list[idx] = { ...list[idx], ...res.data };
      saveStoredServices(list);
      return res;
    }
  } catch (e) {}

  const list = getStoredServices();
  const idx = list.findIndex(s => s.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data };
    saveStoredServices(list);
    return { success: true, data: list[idx] };
  }
  return { success: true, data };
}

/** Delete a service: DELETE /services/:id or /department-head/services/:id */
export async function apiDeleteService(id) {
  try {
    const res = await apiFetch(`/department-head/services/${id}`, { method: 'DELETE' });
    if (res && res.success) return res;
  } catch (e) {}
  try {
    await apiFetch(`/services/${id}`, { method: 'DELETE' });
  } catch (e) {}
  const list = getStoredServices();
  const idx = list.findIndex(s => s.id === id);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveStoredServices(list);
  }
  return { success: true, message: 'Service deleted' };
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

/** Onboard a new officer directly: POST /department-head/officers */
export async function apiOnboardOfficer(data) {
  return apiOnboardDepartmentOfficer(data);
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

// ──────────────────────────────────────────
// GEOGRAPHY / DYNAMIC JURISDICTION TREE
// ──────────────────────────────────────────

export async function apiGetJurisdictionStats(stateId = 'state_ap') {
  return apiFetch(`/geography/stats?stateId=${stateId}`);
}

export async function apiGetJurisdictionTree(stateId = 'state_ap') {
  return apiFetch(`/geography/tree?stateId=${stateId}`);
}

export async function apiGetJurisdictionNode(nodeId) {
  return apiFetch(`/geography/nodes/${nodeId}`);
}

export async function apiGetJurisdictionDetails(nodeId) {
  return apiFetch(`/geography/nodes/${nodeId}/details`);
}

export async function apiGetJurisdictionChildren(nodeId, stateId = 'state_ap') {
  return apiFetch(`/geography/nodes/${nodeId}/children?stateId=${stateId}`);
}

export async function apiGetJurisdictionAncestors(nodeId) {
  return apiFetch(`/geography/nodes/${nodeId}/ancestors`);
}

export async function apiCreateJurisdictionNode(data) {
  return apiFetch('/geography/nodes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateJurisdictionNode(nodeId, data) {
  return apiFetch(`/geography/nodes/${nodeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiToggleJurisdictionStatus(nodeId, status) {
  return apiFetch(`/geography/nodes/${nodeId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiDeleteJurisdictionNode(nodeId, cascade = false) {
  const url = cascade
    ? `/geography/nodes/${nodeId}?cascade=true`
    : `/geography/nodes/${nodeId}`;
  return apiFetch(url, { method: 'DELETE' });
}

export async function apiGetJurisdictionAudit(stateId = 'state_ap') {
  return apiFetch(`/geography/audit?stateId=${stateId}`);
}

// ──────────────────────────────────────────
// CENTRAL GOVERNMENT (MAIN ADMIN)
// ──────────────────────────────────────────

export async function apiGetStates() {
  return apiFetch('/central/states');
}

export async function apiCreateState(data) {
  return apiFetch('/central/states', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteState(id) {
  return apiFetch(`/central/states/${id}`, {
    method: 'DELETE',
  });
}

export async function apiGetStateDetails(id) {
  return apiFetch(`/central/states/${id}/details`);
}

export async function apiUpdateState(id, data) {
  return apiFetch(`/central/states/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiSetStateStatus(id, status) {
  return apiFetch(`/central/states/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiSetStateAdminStatus(id, status) {
  return apiFetch(`/central/states/${id}/admin/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiResetStateAdminPassword(id) {
  return apiFetch(`/central/states/${id}/admin/reset-password`, {
    method: 'POST',
  });
}

export async function apiGetCentralRevenue() {
  return apiFetch('/central/analytics/revenue');
}

export async function apiGetCentralMetrics() {
  return apiFetch('/central/analytics/metrics');
}



// ──────────────────────────────────────────
// STATE GOVERNMENT (STATE ADMIN)
// ──────────────────────────────────────────

const INITIAL_LOCAL_DEPARTMENTS = [
  // ─── AP DEPARTMENTS ───
  {
    id: 'dept_rev_ap',
    stateId: 'state_ap',
    name: 'Revenue, Registration & Stamps Department',
    code: 'REV-AP',
    description: 'Land records, patta passbooks, caste, income, and residence certificates',
    status: 'ACTIVE',
    headUserId: 'USR-DH-REV-AP',
    headName: 'Dr. B. R. Ambedkar IAS',
    headEmail: 'head.rev@ap.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 4,
    grievancesCount: 2,
    designationsCount: 7,
    hasGrievanceCell: true,
    grievanceCellName: 'Revenue Department Grievance Redressal Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_ap',
    stateId: 'state_ap',
    name: 'Social Welfare & Empowerment Department',
    code: 'WEL-AP',
    description: 'Welfare schemes, fee reimbursements, livelihood grants, and educational assistance',
    status: 'ACTIVE',
    headUserId: 'USR-DH-WEL-AP',
    headName: 'Sri K. Harshavardhan IAS',
    headEmail: 'head.wel@ap.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 2,
    grievancesCount: 1,
    designationsCount: 6,
    hasGrievanceCell: true,
    grievanceCellName: 'Social Welfare Grievance Redressal Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── KA DEPARTMENTS ───
  {
    id: 'dept_rev_ka',
    stateId: 'state_ka',
    name: 'Revenue Department (Kandaya Ilakhe)',
    code: 'REV-KA',
    description: 'Bhoomi RTC land records, caste & income certificates (Nadakacheri / AJSK)',
    status: 'ACTIVE',
    headUserId: 'USR-DH-REV-KA',
    headName: 'Sri Rajender Kumar Kataria IAS',
    headEmail: 'head.rev@ka.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 2,
    grievancesCount: 1,
    designationsCount: 6,
    hasGrievanceCell: true,
    grievanceCellName: 'Revenue Department (Kandaya Ilakhe) Grievance Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_ka',
    stateId: 'state_ka',
    name: 'Social Welfare & Backward Classes Department',
    code: 'WEL-KA',
    description: 'Student scholarships, Gruha Lakshmi benefits, and backward classes empowerment',
    status: 'ACTIVE',
    headUserId: 'USR-DH-WEL-KA',
    headName: 'Dr. R. Vishal IAS',
    headEmail: 'head.wel@ka.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 1,
    grievancesCount: 1,
    designationsCount: 6,
    hasGrievanceCell: true,
    grievanceCellName: 'Social Welfare & Backward Classes Grievance Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── KL DEPARTMENTS ───
  {
    id: 'dept_rev_kl',
    stateId: 'state_kl',
    name: 'Revenue Department (Keralam E-District)',
    code: 'REV-KL',
    description: 'e-District land records, revenue certificates, and possession certificates',
    status: 'ACTIVE',
    headUserId: 'USR-DH-REV-KL',
    headName: 'Dr. A. Jayathilak IAS',
    headEmail: 'head.rev@kl.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 2,
    grievancesCount: 1,
    designationsCount: 6,
    hasGrievanceCell: true,
    grievanceCellName: 'Revenue Department (Keralam E-District) Grievance Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_kl',
    stateId: 'state_kl',
    name: 'Social Justice & Empowerment Department',
    code: 'WEL-KL',
    description: 'Vidyakiranam, Karunya scheme, disabled welfare, and social pensions',
    status: 'ACTIVE',
    headUserId: 'USR-DH-WEL-KL',
    headName: 'Dr. Sharmila Mary Joseph IAS',
    headEmail: 'head.wel@kl.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 1,
    grievancesCount: 1,
    designationsCount: 6,
    hasGrievanceCell: true,
    grievanceCellName: 'Social Justice & Empowerment Grievance Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── TN DEPARTMENTS ───
  {
    id: 'dept_rev_tn',
    stateId: 'state_tn',
    name: 'Revenue & Disaster Management Department',
    code: 'REV-TN',
    description: 'e-Sevai community, nativity, legal heir certificates, and land administration',
    status: 'ACTIVE',
    headUserId: 'USR-DH-REV-TN',
    headName: 'Thiru Kumar Jayant IAS',
    headEmail: 'head.rev@tn.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 2,
    grievancesCount: 1,
    designationsCount: 6,
    hasGrievanceCell: true,
    grievanceCellName: 'Revenue & Disaster Management (e-Sevai) Grievance Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_tn',
    stateId: 'state_tn',
    name: 'Adi Dravidar & Tribal Welfare Department',
    code: 'WEL-TN',
    description: 'Pudhumai Penn grants, tribal welfare, and higher education scholarships',
    status: 'ACTIVE',
    headUserId: 'USR-DH-WEL-TN',
    headName: 'Thiru Laxmi Narayan IAS',
    headEmail: 'head.wel@tn.gov.in',
    servicesCount: 2,
    officersCount: 4,
    applicationsCount: 1,
    grievancesCount: 1,
    designationsCount: 6,
    hasGrievanceCell: true,
    grievanceCellName: 'Adi Dravidar & Tribal Welfare Grievance Cell',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const INITIAL_LOCAL_GRIEVANCE_CELLS = [
  // ── AP ──
  {
    id: 'cell_dept_rev_ap',
    stateId: 'state_ap',
    departmentId: 'dept_rev_ap',
    deptName: 'Revenue, Registration & Stamps Department',
    cellName: 'Revenue Department Grievance Redressal Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'Sub-Division Grievance Officer ➔ District Grievance Officer ➔ State Appellate Authority',
    status: 'ACTIVE',
  },
  {
    id: 'cell_dept_wel_ap',
    stateId: 'state_ap',
    departmentId: 'dept_wel_ap',
    deptName: 'Social Welfare & Empowerment Department',
    cellName: 'Social Welfare Grievance Redressal Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'District Welfare Grievance Officer ➔ State Welfare Appellate Authority',
    status: 'ACTIVE',
  },

  // ── KA ──
  {
    id: 'cell_dept_rev_ka',
    stateId: 'state_ka',
    departmentId: 'dept_rev_ka',
    deptName: 'Revenue Department (Kandaya Ilakhe)',
    cellName: 'Revenue Department (Kandaya Ilakhe) Grievance Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'Taluk Grievance Officer ➔ District Grievance Authority',
    status: 'ACTIVE',
  },
  {
    id: 'cell_dept_wel_ka',
    stateId: 'state_ka',
    departmentId: 'dept_wel_ka',
    deptName: 'Social Welfare & Backward Classes Department',
    cellName: 'Social Welfare & Backward Classes Grievance Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'District Welfare Grievance Officer ➔ State Welfare Appellate Authority',
    status: 'ACTIVE',
  },

  // ── KL ──
  {
    id: 'cell_dept_rev_kl',
    stateId: 'state_kl',
    departmentId: 'dept_rev_kl',
    deptName: 'Revenue Department (Keralam E-District)',
    cellName: 'Revenue Department (Keralam E-District) Grievance Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'Taluk Grievance Officer ➔ District Collectorate Appellate Authority',
    status: 'ACTIVE',
  },
  {
    id: 'cell_dept_wel_kl',
    stateId: 'state_kl',
    departmentId: 'dept_wel_kl',
    deptName: 'Social Justice & Empowerment Department',
    cellName: 'Social Justice & Empowerment Grievance Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'District Social Justice Officer ➔ Directorate Appellate Authority',
    status: 'ACTIVE',
  },

  // ── TN ──
  {
    id: 'cell_dept_rev_tn',
    stateId: 'state_tn',
    departmentId: 'dept_rev_tn',
    deptName: 'Revenue & Disaster Management Department',
    cellName: 'Revenue & Disaster Management (e-Sevai) Grievance Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'Taluk Grievance Officer ➔ District Revenue Officer (DRO)',
    status: 'ACTIVE',
  },
  {
    id: 'cell_dept_wel_tn',
    stateId: 'state_tn',
    departmentId: 'dept_wel_tn',
    deptName: 'Adi Dravidar & Tribal Welfare Department',
    cellName: 'Adi Dravidar & Tribal Welfare Grievance Cell',
    jurisdictionTier: 'DISTRICT',
    slaDays: 7,
    workflowSummary: 'District Welfare Grievance Officer ➔ State Directorate Appellate Authority',
    status: 'ACTIVE',
  },
];

function getStoredDepartments() {
  try {
    const raw = localStorage.getItem('DigiConnect_departments');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  saveStoredDepartments(INITIAL_LOCAL_DEPARTMENTS);
  return [...INITIAL_LOCAL_DEPARTMENTS];
}

function saveStoredDepartments(list) {
  try {
    localStorage.setItem('DigiConnect_departments', JSON.stringify(list));
  } catch (e) {}
}

function getStoredGrievanceCells() {
  try {
    const raw = localStorage.getItem('DigiConnect_grievance_cells');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Purge stale cells whose department no longer exists in stored departments
        const depts = getStoredDepartments();
        const deptIds = new Set(depts.map(d => d.id));
        const valid = parsed.filter(c => !c.departmentId || deptIds.has(c.departmentId));
        if (valid.length !== parsed.length) {
          // Stale cells found — save the cleaned list back
          saveStoredGrievanceCells(valid);
        }
        if (valid.length > 0) return valid;
      }
    }
  } catch (e) {}
  saveStoredGrievanceCells(INITIAL_LOCAL_GRIEVANCE_CELLS);
  return [...INITIAL_LOCAL_GRIEVANCE_CELLS];
}

function saveStoredGrievanceCells(list) {
  try {
    localStorage.setItem('DigiConnect_grievance_cells', JSON.stringify(list));
  } catch (e) {}
}

export async function apiGetStateDashboard(stateId = 'state_ap') {
  try {
    return await apiFetch(`/state-admin/dashboard?stateId=${stateId}`);
  } catch (e) {
    const totalDepartments = getStoredDepartments().filter(d => d.stateId === stateId).length;
    return { success: true, data: { summary: { totalDepartments } } };
  }
}

export async function apiGetStateDepartments(stateId = 'state_ap') {
  try {
    const res = await apiFetch(`/state-admin/departments?stateId=${stateId}`);
    if (res && res.data && Array.isArray(res.data)) {
      saveStoredDepartments(res.data);
      return res;
    }
  } catch (e) {}
  const list = getStoredDepartments().filter(d => !stateId || d.stateId === stateId);
  return { success: true, data: list };
}

export async function apiGetDepartmentById(id) {
  try {
    const res = await apiFetch(`/state-admin/departments/${id}`);
    if (res && res.data) return res;
  } catch (e) {}
  const dept = getStoredDepartments().find(d => d.id === id);
  if (!dept) throw new Error(`Department '${id}' not found.`);
  return {
    success: true,
    data: {
      ...dept,
      metrics: {
        servicesCount: dept.servicesCount || 0,
        officersCount: dept.officersCount || 0,
        applicationsCount: dept.applicationsCount || 0,
        grievancesCount: dept.grievancesCount || 0,
        designationsCount: dept.designationsCount || 0,
      },
      headUser: dept.headName ? { id: dept.headUserId || 'DH-01', name: dept.headName, email: dept.headEmail } : null,
      grievanceCell: { cellName: dept.grievanceCellName || `${dept.name} Grievance Cell`, workflowSteps: [{ roleTitle: 'District Grievance Officer' }, { roleTitle: 'State Appellate Authority' }] },
    },
  };
}

export async function apiCreateDepartment(data) {
  let created = null;
  try {
    const res = await apiFetch('/state-admin/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.data) created = res.data;
  } catch (e) {}

  if (!created) {
    const deptId = `dept_${data.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    created = {
      id: deptId,
      stateId: data.stateId || 'state_ap',
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      description: data.description || `${data.name} Line Department`,
      status: 'ACTIVE',
      headUserId: `USR-DH-${Date.now().toString().slice(-4)}`,
      headName: data.headUserName || data.headName || `${data.name} Head`,
      headEmail: data.headUserEmail || data.headEmail || `head@gov.in`,
      servicesCount: 0,
      officersCount: 0,
      applicationsCount: 0,
      grievancesCount: 0,
      designationsCount: 0,
      hasGrievanceCell: false,
      createdAt: new Date().toISOString(),
    };
  }

  const list = getStoredDepartments();
  const existingIdx = list.findIndex(d => d.id === created.id);
  if (existingIdx >= 0) {
    list[existingIdx] = created;
  } else {
    list.unshift(created);
  }
  saveStoredDepartments(list);
  return { success: true, data: created };
}

export async function apiUpdateDepartment(id, data) {
  let updated = null;
  try {
    const res = await apiFetch(`/state-admin/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.data) updated = res.data;
  } catch (e) {}

  const list = getStoredDepartments();
  const dept = list.find(d => d.id === id);
  if (!dept && !updated) throw new Error(`Department '${id}' not found.`);
  if (dept) {
    if (data.name) dept.name = data.name.trim();
    if (data.code) dept.code = data.code.trim().toUpperCase();
    if (data.description !== undefined) dept.description = data.description;
    if (data.status) dept.status = data.status;
    saveStoredDepartments(list);
    return { success: true, data: dept };
  }
  return { success: true, data: updated };
}

export async function apiUpdateDepartmentStatus(id, status) {
  try {
    await apiFetch(`/state-admin/departments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (e) {}
  const list = getStoredDepartments();
  const dept = list.find(d => d.id === id);
  if (!dept) throw new Error(`Department '${id}' not found.`);
  dept.status = status;
  saveStoredDepartments(list);
  return { success: true, data: dept };
}

export async function apiAssignDepartmentHead(id, name, email) {
  try {
    await apiFetch(`/state-admin/departments/${id}/head`, {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  } catch (e) {}
  const list = getStoredDepartments();
  const dept = list.find(d => d.id === id);
  if (!dept) throw new Error(`Department '${id}' not found.`);
  dept.headUserId = `USR-DH-${Date.now().toString().slice(-4)}`;
  dept.headName = name.trim();
  dept.headEmail = email.trim();
  saveStoredDepartments(list);
  return { success: true, data: dept };
}

export async function apiRemoveDepartmentHead(id) {
  try {
    await apiFetch(`/state-admin/departments/${id}/head`, {
      method: 'DELETE',
    });
  } catch (e) {}
  const list = getStoredDepartments();
  const dept = list.find(d => d.id === id);
  if (!dept) throw new Error(`Department '${id}' not found.`);
  dept.headUserId = null;
  dept.headName = null;
  dept.headEmail = null;
  saveStoredDepartments(list);
  return { success: true, data: dept };
}

export async function apiDeleteDepartment(id) {
  try {
    await apiFetch(`/state-admin/departments/${id}`, {
      method: 'DELETE',
    });
  } catch (e) {}
  const list = getStoredDepartments();
  const index = list.findIndex(d => d.id === id);
  if (index === -1) throw new Error(`Department '${id}' not found.`);
  const dept = list[index];
  if ((dept.servicesCount && dept.servicesCount > 0) || (dept.officersCount && dept.officersCount > 0) || (dept.applicationsCount && dept.applicationsCount > 0)) {
    throw new Error(`Cannot delete department '${dept.name}' because historical/operational records depend on it: ${dept.servicesCount || 0} services, ${dept.officersCount || 0} officers, ${dept.applicationsCount || 0} applications. Please suspend/deactivate the department instead.`);
  }
  list.splice(index, 1);
  saveStoredDepartments(list);
  return { success: true, message: `Department '${dept.name}' deleted.` };
}

export async function apiGetGrievanceCells(stateId = 'state_ap') {
  try {
    const res = await apiFetch(`/state-admin/grievance-cells?stateId=${stateId}`);
    if (res && res.data && Array.isArray(res.data)) {
      saveStoredGrievanceCells(res.data);
      return res;
    }
  } catch (e) {}
  const list = getStoredGrievanceCells().filter(c => !stateId || c.stateId === stateId);
  return { success: true, data: list };
}

export async function apiConfigureGrievanceCell(data) {
  let configured = null;
  const tier = data.jurisdictionTier || 'DISTRICT';
  const sla = data.slaDays || 7;
  const deptName = data.deptName || 'Department';

  const defaultSteps =
    tier === 'SUB_DIVISION'
      ? [
          { stepNumber: 1, roleTitle: `${deptName} Sub-Division Grievance Officer`, jurisdictionTier: 'SUB_DIVISION' },
          { stepNumber: 2, roleTitle: `${deptName} District Grievance Officer`, jurisdictionTier: 'DISTRICT' },
          { stepNumber: 3, roleTitle: `${deptName} State Appellate Authority`, jurisdictionTier: 'STATE' },
        ]
      : tier === 'STATE'
      ? [
          { stepNumber: 1, roleTitle: `${deptName} State Grievance Redressal Authority`, jurisdictionTier: 'STATE' },
        ]
      : [
          { stepNumber: 1, roleTitle: `${deptName} District Grievance Officer`, jurisdictionTier: 'DISTRICT' },
          { stepNumber: 2, roleTitle: `${deptName} State Appellate Authority`, jurisdictionTier: 'STATE' },
        ];

  const payload = {
    stateId: data.stateId || 'state_ap',
    departmentId: data.departmentId,
    cellName: data.cellName,
    jurisdictionTier: tier,
    slaDays: sla,
    deptName: deptName,
    workflowSteps: data.workflowSteps && data.workflowSteps.length > 0 ? data.workflowSteps : defaultSteps,
  };

  try {
    const res = await apiFetch('/state-admin/grievance-cells', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.data) configured = res.data;
  } catch (e) {
    console.warn('apiConfigureGrievanceCell backend fallback:', e);
  }

  const depts = getStoredDepartments();
  const dept = depts.find(d => d.id === data.departmentId);

  if (dept) {
    dept.hasGrievanceCell = true;
    dept.grievanceCellName = data.cellName;
    saveStoredDepartments(depts);
  }

  if (!configured) {
    configured = {
      id: `cell_${data.departmentId}`,
      stateId: data.stateId || 'state_ap',
      departmentId: data.departmentId,
      deptName: deptName,
      cellName: data.cellName,
      jurisdictionTier: tier,
      slaDays: sla,
      workflowSteps: payload.workflowSteps,
      workflowSummary: payload.workflowSteps.map(s => s.roleTitle).join(' ➔ '),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  } else {
    configured.deptName = deptName;
    configured.workflowSummary =
      configured.workflowSummary ||
      (configured.workflowSteps?.length > 0
        ? configured.workflowSteps.map(s => s.roleTitle).join(' ➔ ')
        : 'District Grievance Officer ➔ State Appellate Authority');
    configured.status = 'ACTIVE';
  }

  const cells = getStoredGrievanceCells();
  const existingIdx = cells.findIndex(c => c.departmentId === data.departmentId);
  if (existingIdx >= 0) {
    cells[existingIdx] = { ...cells[existingIdx], ...configured };
  } else {
    cells.unshift(configured);
  }
  saveStoredGrievanceCells(cells);
  return { success: true, data: configured };
}

export async function apiGetStateRevenue(stateId = 'state_ap') {
  return apiFetch(`/state-admin/analytics/revenue?stateId=${stateId}`);
}

export async function apiGetStateAnalytics(stateId = 'state_ap') {
  return apiFetch(`/state-admin/analytics/kpis?stateId=${stateId}`);
}

export async function apiGetStateKpis(stateId = 'state_ap') {
  return apiFetch(`/state-admin/analytics/kpis?stateId=${stateId}`);
}


// ──────────────────────────────────────────
// DEPARTMENT HEAD
// ──────────────────────────────────────────

const INITIAL_LOCAL_DESIGNATIONS = [
  {
    id: 'desig_vro',
    departmentId: 'dept_rev_ap',
    title: 'Village Revenue Officer (VRO)',
    code: 'VRO',
    description: 'Village Revenue Officer — First Level Verification & Nativity Inspection',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'desig_mro',
    departmentId: 'dept_rev_ap',
    title: 'Mandal Revenue Officer (MRO)',
    code: 'MRO',
    description: 'Mandal Revenue Officer / Tehsildar — Intermediate Review & Endorsement',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'desig_tahsildar',
    departmentId: 'dept_rev_ap',
    title: 'Tahsildar',
    code: 'TAHSILDAR',
    description: 'Tahsildar — Issuing & Digital Approval Authority with DSC Signoff',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'desig_ri',
    departmentId: 'dept_rev_ap',
    title: 'Revenue Inspector (RI)',
    code: 'RI',
    description: 'Revenue Inspector — Field Assessment & Spot Verification',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function getStoredDesignations() {
  try {
    const raw = localStorage.getItem('DigiConnect_designations');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  saveStoredDesignations(INITIAL_LOCAL_DESIGNATIONS);
  return [...INITIAL_LOCAL_DESIGNATIONS];
}

function saveStoredDesignations(list) {
  try {
    localStorage.setItem('DigiConnect_designations', JSON.stringify(list));
  } catch (e) {}
}

export async function apiGetDesignations(departmentId = 'dept_rev_ap') {
  try {
    const res = await apiFetch(`/department-head/designations?departmentId=${departmentId}`);
    if (res && res.data && Array.isArray(res.data)) {
      saveStoredDesignations(res.data);
      return res;
    }
  } catch (e) {}
  const list = getStoredDesignations().filter(d => !departmentId || d.departmentId === departmentId);
  return { success: true, data: list };
}

export async function apiCreateDesignation(data) {
  let created = null;
  try {
    const res = await apiFetch('/department-head/designations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.data) created = res.data;
  } catch (e) {}

  if (!created) {
    created = {
      id: `desig_${data.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`,
      departmentId: data.departmentId || 'dept_rev_ap',
      title: data.title.trim(),
      code: data.code.trim().toUpperCase(),
      description: data.description || 'Department operational job role',
      createdAt: new Date().toISOString(),
    };
  }

  const list = getStoredDesignations();
  const existingIdx = list.findIndex(d => d.id === created.id);
  if (existingIdx >= 0) {
    list[existingIdx] = created;
  } else {
    list.unshift(created);
  }
  saveStoredDesignations(list);
  return { success: true, data: created };
}

export async function apiDeleteDesignation(id) {
  try {
    await apiFetch(`/department-head/designations/${id}`, {
      method: 'DELETE',
    });
  } catch (e) {}
  const list = getStoredDesignations();
  const index = list.findIndex(d => d.id === id);
  if (index >= 0) {
    list.splice(index, 1);
    saveStoredDesignations(list);
  }
  return { success: true, message: 'Designation deleted' };
}

export async function apiGetDepartmentOfficers(deptId = 'dept_rev_ap') {
  try {
    const res = await apiFetch(`/department-head/officers?departmentId=${deptId}`);
    if (res && res.data) return res;
  } catch (e) {}
  return {
    success: true,
    data: [
      { id: 'OFF-VRO-01', name: 'R. Somasekhar', email: 'vro.chandragiri@ap.gov.in', designationId: 'desig_vro', designationTitle: 'Village Revenue Officer (VRO)', assignedNodeId: 'node_cg_vil', status: 'ACTIVE' },
      { id: 'OFF-RI-01', name: 'K. Venkataramana', email: 'ri.tirupati@ap.gov.in', designationId: 'desig_ri', designationTitle: 'Revenue Inspector (RI)', assignedNodeId: 'node_tpt', status: 'ACTIVE' },
      { id: 'OFF-MRO-01', name: 'M. Padmavathi', email: 'mro.tirupati@ap.gov.in', designationId: 'desig_mro', designationTitle: 'Mandal Revenue Officer (MRO)', assignedNodeId: 'node_tpt', status: 'ACTIVE' },
      { id: 'OFF-TAH-01', name: 'P. Subba Rao', email: 'tahsildar.tirupati@ap.gov.in', designationId: 'desig_tahsildar', designationTitle: 'Tahsildar', assignedNodeId: 'node_tpt', status: 'ACTIVE' },
    ],
  };
}

export async function apiOnboardDepartmentOfficer(data) {
  return apiFetch('/department-head/officers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateOfficerStatus(officerId, status) {
  return apiFetch(`/department-head/officers/${officerId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiGetDepartmentAnalytics(deptId = 'dept_rev_ap') {
  try {
    const res = await apiFetch(`/department-head/analytics?departmentId=${deptId}`);
    if (res && res.data) return res;
  } catch (e) {}
  return {
    success: true,
    data: {
      totalServices: 2,
      activeServices: 2,
      totalDesignations: 4,
      totalOfficers: 4,
      totalApplications: 2,
      totalRevenue: 150,
      totalPlatformFee: 40,
      totalServiceFee: 110,
    },
  };
}

export async function apiGetDepartmentRevenue(deptId = 'dept_rev_ap') {
  try {
    const res = await apiFetch(`/department-head/revenue?departmentId=${deptId}`);
    if (res && res.data) return res;
  } catch (e) {}
  return {
    success: true,
    data: {
      departmentId: deptId,
      departmentName: 'Department',
      totalRevenue: 150,
      totalPlatformFee: 40,
      totalServiceFee: 110,
      paidTransactionsCount: 2,
      totalApplications: 2,
      serviceBreakdown: [],
      transactions: [],
    },
  };
}

export async function apiGetDepartmentServices(deptId = 'dept_rev_ap') {
  try {
    const res = await apiFetch(`/department-head/services?departmentId=${deptId}`);
    if (res && res.data) return res;
  } catch (e) {}
  return {
    success: true,
    data: [
      {
        id: 'srv_caste_income_ap',
        departmentId: 'dept_rev_ap',
        name: 'Integrated Community, Nativity & Date of Birth Certificate',
        code: 'CASTE_CERT_AP',
        slaDays: 7,
        totalFee: 50,
        serviceFee: 35,
        platformFee: 15,
        status: 'ACTIVE',
        workflowSteps: [
          { stepNumber: 1, stepName: 'VRO Verification & Field Inquiry', requiredDesignationId: 'desig_vro', canApprove: true, canReject: true, canRaiseQuery: true },
          { stepNumber: 2, stepName: 'MRO Verification & Scrutiny', requiredDesignationId: 'desig_mro', canApprove: true, canReject: true, canRaiseQuery: true },
          { stepNumber: 3, stepName: 'Tahsildar Digital Approval & DSC Signoff', requiredDesignationId: 'desig_tahsildar', canApprove: true, canReject: true, isFinalApprovalStep: true },
        ],
      },
      {
        id: 'srv_income_ap',
        departmentId: 'dept_rev_ap',
        name: 'Income & Asset Certificate',
        code: 'INCOME_CERT_AP',
        slaDays: 5,
        totalFee: 35,
        serviceFee: 20,
        platformFee: 15,
        status: 'ACTIVE',
        workflowSteps: [
          { stepNumber: 1, stepName: 'VRO Income Verification', requiredDesignationId: 'desig_vro', canApprove: true, canReject: true, canRaiseQuery: true },
          { stepNumber: 2, stepName: 'Tahsildar Approval & DSC Issuance', requiredDesignationId: 'desig_tahsildar', canApprove: true, canReject: true, isFinalApprovalStep: true },
        ],
      },
      {
        id: 'srv_land_mutation_ap',
        departmentId: 'dept_rev_ap',
        name: 'Agricultural Land Mutation & Pattadar Passbook',
        code: 'LAND_MUTATION_AP',
        slaDays: 14,
        totalFee: 100,
        serviceFee: 75,
        platformFee: 25,
        status: 'ACTIVE',
        workflowSteps: [
          { stepNumber: 1, stepName: 'Revenue Inspector Spot Survey', requiredDesignationId: 'desig_ri', canApprove: true, canReject: true, canRaiseQuery: true },
          { stepNumber: 2, stepName: 'MRO Endorsement & Verification', requiredDesignationId: 'desig_mro', canApprove: true, canReject: true, canRaiseQuery: true },
          { stepNumber: 3, stepName: 'Tahsildar Record Mutation & Issue', requiredDesignationId: 'desig_tahsildar', canApprove: true, canReject: true, isFinalApprovalStep: true },
        ],
      },
      {
        id: 'srv_residence_ap',
        departmentId: 'dept_rev_ap',
        name: 'Residence & Domicile Certificate',
        code: 'RESIDENCE_CERT_AP',
        slaDays: 7,
        totalFee: 30,
        serviceFee: 20,
        platformFee: 10,
        status: 'ACTIVE',
        workflowSteps: [
          { stepNumber: 1, stepName: 'VRO Verification & Field Inquiry', requiredDesignationId: 'desig_vro', canApprove: true, canReject: true, canRaiseQuery: true },
          { stepNumber: 2, stepName: 'MRO Approval & DSC Issuance', requiredDesignationId: 'desig_mro', canApprove: true, canReject: true, isFinalApprovalStep: true },
        ],
      },
    ],
  };
}

export async function apiGetDepartmentServiceById(id) {
  return apiFetch(`/department-head/services/${id}`);
}

export async function apiCreateDynamicService(data) {
  return apiFetch('/department-head/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateDynamicService(id, data) {
  return apiFetch(`/department-head/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateServiceStatus(id, status) {
  return apiFetch(`/department-head/services/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ──────────────────────────────────────────
// THE 3 PRIMARY OFFICER ACTIONS (Sections 18-22)
// ──────────────────────────────────────────

export async function apiOfficerApprove(appId, remarks = '') {
  return apiFetch(`/applications/${appId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ remarks }),
  });
}

export async function apiOfficerReject(appId, reason = '') {
  return apiFetch(`/applications/${appId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function apiOfficerRaiseQuery(appId, queryText = '') {
  return apiFetch(`/applications/${appId}/raise-query`, {
    method: 'POST',
    body: JSON.stringify({ queryText }),
  });
}

// ──────────────────────────────────────────
// CLOSED GRIEVANCE REDRESSAL LOOP (Sections 28-32)
// ──────────────────────────────────────────

export async function apiResolveGrievance(grievanceId, action, remarks = '') {
  return apiFetch(`/grievances/${grievanceId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ action, remarks }),
  });
}

// ──────────────────────────────────────────
// DEMO CERTIFICATES
// ──────────────────────────────────────────

export async function apiGetCertificate(certId) {
  return apiFetch(`/certificates/${certId}`);
}

export async function apiGetAppCertificate(appId) {
  return apiFetch(`/certificates/application/${appId}`);
}

