// ═══════════════════════════════════════════
// mock-data.js — Pre-populate localStorage with mock data
// ═══════════════════════════════════════════

const MOCK_USERS = [
  // Migrated from legacy ALL_USERS
  { id: 'CIT-001', name: 'Ravi Kumar', role: 'citizen', email: 'ravi.k@gmail.com', phone: '9876543200', aadhaar: '895421674301', joined: '10 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-', password: 'password123', securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'CIT-002', name: 'Meena Devi', role: 'citizen', email: 'meena.d@gmail.com', phone: '9876543201', aadhaar: '895421674302', joined: '12 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-', password: 'password123', securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'CIT-003', name: 'Gopal Rao', role: 'citizen', email: 'gopal.r@gmail.com', phone: '9876543202', aadhaar: '895421674303', joined: '15 Jan 2024', status: 'Suspended', dept: '-', jurisdiction: '-', password: 'password123', securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'CIT-004', name: 'Sunita Verma', role: 'citizen', email: 'sunita.v@gmail.com', phone: '9876543203', aadhaar: '895421674304', joined: '18 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-', password: 'password123', securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'CIT-005', name: 'Arun Prasad', role: 'citizen', email: 'arun.p@gmail.com', phone: '9876543204', aadhaar: '895421674305', joined: '20 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-', password: 'password123', securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'EMP-001', name: 'Suresh Reddy', role: 'officer', title: 'VRO', email: 's.reddy@gov.in', phone: '9876543210', aadhaar: '895421675001', joined: '15 Mar 2023', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Secunderabad', password: 'password123', services: ['Income Certificate', 'Caste Certificate'], cases: 28, sla: 91, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'EMP-002', name: 'Anita Sharma', role: 'officer', title: 'RI', email: 'a.sharma@gov.in', phone: '9876543211', aadhaar: '895421675002', joined: '20 Jan 2023', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Hyderabad Central', password: 'password123', services: ['Income Certificate', 'Residence Certificate'], cases: 34, sla: 87, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'EMP-003', name: 'Ramesh Kumar', role: 'supervisor', title: 'MRO', email: 'r.kumar@gov.in', phone: '9876543212', aadhaar: '895421675003', joined: '10 Jun 2022', status: 'Active', dept: 'Revenue Department', jurisdiction: 'LB Nagar', password: 'password123', services: ['Income Certificate', 'Caste Certificate', 'Record Correction'], cases: 18, sla: 95, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'EMP-004', name: 'Priya Nair', role: 'officer', title: 'Welfare Officer', email: 'p.nair@gov.in', phone: '9876543213', aadhaar: '895421675004', joined: '01 Aug 2022', status: 'Active', dept: 'Welfare Department', jurisdiction: 'All Mandals', password: 'password123', services: ['Welfare Scheme', 'Scholarship Application'], cases: 22, sla: 93, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'EMP-005', name: 'Kiran Babu', role: 'officer', title: 'VRO', email: 'k.babu@gov.in', phone: '9876543214', aadhaar: '895421675005', joined: '05 Nov 2023', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Uppal', password: 'password123', services: ['Income Certificate', 'Caste Certificate'], cases: 31, sla: 88, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'SUP-001', name: 'Deepak Verma', role: 'supervisor', title: 'Supervisor', email: 'd.verma@gov.in', phone: '9876543220', aadhaar: '895421676001', joined: '01 Jan 2022', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Hyderabad District', password: 'password123', services: [], cases: 0, sla: 100, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'SUP-002', name: 'Kavitha Reddy', role: 'supervisor', title: 'Supervisor', email: 'k.reddy@gov.in', phone: '9876543221', aadhaar: '895421676002', joined: '15 Feb 2022', status: 'Active', dept: 'Welfare Department', jurisdiction: 'Telangana State', password: 'password123', services: [], cases: 0, sla: 100, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'GRV-001', name: 'Nalini Rao', role: 'grievance', title: 'Grievance Officer', email: 'n.rao@gov.in', phone: '9876543230', aadhaar: '895421677001', joined: '10 Mar 2022', status: 'Active', dept: 'Grievance Cell', jurisdiction: 'Hyderabad', password: 'password123', services: [], cases: 0, sla: 100, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'GRV-002', name: 'Srinivas Goud', role: 'grievance', title: 'Grievance Officer', email: 's.goud@gov.in', phone: '9876543231', aadhaar: '895421677002', joined: '20 Apr 2022', status: 'Pending', dept: 'Grievance Cell', jurisdiction: 'Warangal', password: 'password123', services: [], cases: 0, sla: 100, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' },
  { id: 'ADM-001', name: 'Super User', role: 'super_user', title: 'Super User', email: 'superuser@gov.in', phone: '9876543299', aadhaar: '895421678001', joined: '01 Jan 2020', status: 'Active', dept: 'IT Admin', jurisdiction: 'All', password: 'password123', services: [], cases: 0, sla: 100, securityQuestion: 'In what city were you born?', securityAnswer: 'Hyderabad' }
];

const MOCK_PENDING_OFFICERS = [
  { id: 'EMP-039', name: 'Vijay Teja', title: 'VRO', dept: 'Revenue Department', jurisdiction: 'Malkajgiri', applied: '24 Jan 2025', docs: ['Employee ID', 'Appointment Order'], email: 'v.teja@gov.in', phone: '9876549901', services: ['Income Certificate'] },
  { id: 'EMP-040', name: 'Lakshmi Devi', title: 'Welfare Officer', dept: 'Welfare Department', jurisdiction: 'Warangal', applied: '25 Jan 2025', docs: ['Employee ID', 'Training Certificate'], email: 'l.devi@gov.in', phone: '9876549902', services: ['Welfare / Subsidy Scheme'] },
  { id: 'EMP-041', name: 'Arjun Reddy', title: 'RI', dept: 'Revenue Department', jurisdiction: 'Karimnagar', applied: '26 Jan 2025', docs: ['Employee ID', 'Appointment Order', 'NOC'], email: 'a.reddy@gov.in', phone: '9876549903', services: ['Caste Certificate'] },
];

const MOCK_SERVICES = [
  { id: 'SVC-001', name: 'Income Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 50, feeLabel: '₹50', desc: 'Certificate proving annual family income.', docs: ['Aadhaar Card', 'Ration Card', 'Salary Slip / Income Proof'], icon: 'cert', stages: 3, status: 'Active', apps: 892, color: 'var(--navy-500)' },
  { id: 'SVC-002', name: 'Caste Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 50, feeLabel: '₹50', desc: 'Official certificate proving caste for reservations.', docs: ['Aadhaar Card', 'Ration Card', 'Father\'s Caste Certificate', 'School Certificate'], icon: 'cert', stages: 3, status: 'Active', apps: 674, color: 'var(--navy-400)' },
  { id: 'SVC-003', name: 'Residence Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 30, feeLabel: '₹30', desc: 'Proof of domicile / residence.', docs: ['Aadhaar Card', 'Electricity Bill / Rent Agreement'], icon: 'cert', stages: 3, status: 'Active', apps: 408, color: 'var(--navy-300)' },
  { id: 'SVC-004', name: 'Welfare / Subsidy Scheme', cat: 'Welfare', dept: 'Welfare Department', sla: 14, fee: 0, feeLabel: 'Free', desc: 'Direct income support under PM Kisan.', docs: ['Aadhaar Card', 'Land Records', 'Bank Passbook', 'Income Certificate', 'Affidavit'], icon: 'welfare', stages: 4, status: 'Active', apps: 521, color: 'var(--green-500)' },
  { id: 'SVC-005', name: 'Scholarship Application', cat: 'Welfare', dept: 'Welfare Department', sla: 21, fee: 0, feeLabel: 'Free', desc: 'Post-matric scholarship for SC/ST/OBC.', docs: ['Aadhaar Card', 'Income Certificate', 'Caste Certificate', 'Mark Sheets', 'Bank Passbook', 'Fee Receipt'], icon: 'welfare', stages: 4, status: 'Active', apps: 134, color: '#22c55e' },
  { id: 'SVC-006', name: 'Event Permission', cat: 'Permission', dept: 'Municipal Corporation', sla: 5, fee: 200, feeLabel: '₹200', desc: 'Permission for public events or gatherings.', docs: ['Aadhaar Card', 'Event Detail Letter', 'Venue Proof'], icon: 'permission', stages: 2, status: 'Active', apps: 287, color: 'var(--amber-500)' },
  { id: 'SVC-007', name: 'Vendor License', cat: 'Permission', dept: 'Municipal Corporation', sla: 7, fee: 500, feeLabel: '₹500', desc: 'License to operate a shop or business.', docs: ['Aadhaar Card', 'Shop Photo', 'Ownership/Rent Agreement', 'NOC from Landlord'], icon: 'permission', stages: 3, status: 'Active', apps: 156, color: 'var(--amber-400)' },
  { id: 'SVC-008', name: 'Record Correction', cat: 'Correction', dept: 'Revenue Department', sla: 10, fee: 100, feeLabel: '₹100', desc: 'Correction of name in official records.', docs: ['Aadhaar Card', 'Gazette Notification/Affidavit', 'Original Record'], icon: 'correction', stages: 3, status: 'Active', apps: 186, color: 'var(--purple-500)' },
  { id: 'SVC-009', name: 'Marriage Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 50, feeLabel: '₹50', desc: 'Official certificate proving marriage.', docs: ['Aadhaar Card', 'Marriage Invitation', 'Photos', 'Affidavit'], icon: 'cert', stages: 3, status: 'Draft', apps: 0, color: 'var(--slate-400)' },
  { id: 'SVC-010', name: 'Death Certificate', cat: 'Certificate', dept: 'Municipal Corporation', sla: 3, fee: 20, feeLabel: '₹20', desc: 'Official certificate for registering death.', docs: ['Aadhaar Card', 'Hospital Record'], icon: 'cert', stages: 2, status: 'Inactive', apps: 0, color: 'var(--slate-400)' },
];

const MOCK_APPLICATIONS = [
  {
    id: 'APP-2488', serviceId: 'SVC-002', serviceName: 'Caste Certificate', serviceType: 'certificate',
    citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
    dept: 'Revenue Department', status: 'escalated', submittedDate: '2025-01-10', slaDate: '2025-01-17',
    fee: 50, paymentMethod: 'UPI', paymentStatus: 'paid',
    remarks: 'Under verification delayed.',
    timeline: [
      { action: 'Application Submitted', date: '2025-01-10T09:00:00', actor: 'Ravi Kumar', note: 'Citizen submitted application.' },
      { action: 'Under Verification', date: '2025-01-12T14:30:00', actor: 'Suresh Reddy', note: 'Application delayed at officer review stage.' }
    ],
    documents: [{ name: 'Aadhaar.pdf', type: 'ID', date: '2025-01-10', status: 'verified' }]
  },
  {
    id: 'APP-2456', serviceId: 'SVC-001', serviceName: 'Income Certificate', serviceType: 'certificate',
    citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
    dept: 'Revenue Department', status: 'approved', submittedDate: '2025-01-15', slaDate: '2025-01-22',
    fee: 50, paymentMethod: 'UPI', paymentStatus: 'paid',
    remarks: 'All documents verified. Certificate issued.',
    timeline: [
      { action: 'Application Submitted', date: '2025-01-15T10:30:00', actor: 'Ravi Kumar', note: 'Application received.' },
      { action: 'Payment Confirmed', date: '2025-01-15T10:31:00', actor: 'System', note: '₹50 via UPI. TXN: TXN8847291' },
      { action: 'Documents Verified', date: '2025-01-16T14:15:00', actor: 'Suresh Reddy', note: 'All docs verified.' },
      { action: 'Officer Approved', date: '2025-01-17T11:00:00', actor: 'Suresh Reddy', note: 'Application approved.' },
      { action: 'Certificate Issued', date: '2025-01-18T09:45:00', actor: 'System', note: 'Certificate available for download.' },
    ],
    documents: [
      { name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-15', status: 'verified' },
      { name: 'Ration_Card.jpg', type: 'Address Proof', date: '2025-01-15', status: 'verified' },
      { name: 'Salary_Slip.pdf', type: 'Income Proof', date: '2025-01-15', status: 'verified' },
    ],
  },
  {
    id: 'APP-2489', serviceId: 'SVC-002', serviceName: 'Caste Certificate', serviceType: 'certificate',
    citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
    dept: 'Revenue Department', status: 'query', submittedDate: '2026-03-21', slaDate: '2026-04-04',
    fee: 50, paymentMethod: 'UPI', paymentStatus: 'paid',
    remarks: 'Query raised - need updated community certificate.',
    timeline: [
      { action: 'Application Submitted', date: '2026-03-21T10:15:00', actor: 'Ravi Kumar', note: 'Application received.' },
      { action: 'Payment Confirmed', date: '2026-03-21T10:16:00', actor: 'System', note: '₹50 via UPI.' },
      { action: 'Documents Verified', date: '2026-03-22T15:30:00', actor: 'Suresh Reddy', note: 'Most docs verified.' },
      { action: 'Query Raised', date: '2026-03-24T11:00:00', actor: 'Suresh Reddy', note: 'Please upload updated community certificate.' },
    ],
    documents: [
      { name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-20', status: 'verified' },
      { name: 'Ration_Card.jpg', type: 'Address Proof', date: '2025-01-20', status: 'verified' },
      { name: 'Community_Cert.pdf', type: 'Community Proof', date: '2025-01-20', status: 'query' },
      { name: 'Caste_Decl.pdf', type: 'Self Declaration', date: '2025-01-20', status: 'verified' },
    ],
  },
  {
    id: 'APP-2398', serviceId: 'SVC-004', serviceName: 'PM Kisan Welfare Scheme', serviceType: 'welfare',
    citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-002', officerName: 'Anita Sharma',
    dept: 'Welfare Department', status: 'approved', submittedDate: '2024-12-05', slaDate: '2024-12-19',
    fee: 0, paymentMethod: 'free', paymentStatus: 'waived',
    remarks: 'Approved. First installment credited.',
    timeline: [
      { action: 'Application Submitted', date: '2024-12-05T09:00:00', actor: 'Ravi Kumar', note: 'Application received.' },
      { action: 'Eligibility Verified', date: '2024-12-08T14:00:00', actor: 'Anita Sharma', note: 'Income and land records eligible.' },
      { action: 'Approved', date: '2024-12-15T16:00:00', actor: 'Anita Sharma', note: 'Application approved.' },
      { action: 'Benefit Disbursed', date: '2024-12-18T08:00:00', actor: 'System', note: '₹2,000 credited to bank account.' },
    ],
    documents: [
      { name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2024-12-05', status: 'verified' },
      { name: 'Land_Records.pdf', type: 'Land Proof', date: '2024-12-05', status: 'verified' },
      { name: 'Bank_Passbook.jpg', type: 'Bank Proof', date: '2024-12-05', status: 'verified' },
    ],
  },
  {
    id: 'APP-2301', serviceId: 'SVC-006', serviceName: 'Event Permission', serviceType: 'permission',
    citizenId: 'CIT-002', citizenName: 'Meena Devi', officerId: 'EMP-001', officerName: 'Suresh Reddy',
    dept: 'Municipal Corporation', status: 'rejected', submittedDate: '2024-11-10', slaDate: '2024-11-15',
    fee: 200, paymentMethod: 'card', paymentStatus: 'paid',
    remarks: 'Rejected - venue in restricted zone.',
    timeline: [
      { action: 'Application Submitted', date: '2024-11-10T10:00:00', actor: 'Meena Devi', note: 'Application submitted.' },
      { action: 'Field Inspection', date: '2024-11-12T14:00:00', actor: 'Suresh Reddy', note: 'Venue inspection conducted.' },
      { action: 'Rejected', date: '2024-11-14T16:00:00', actor: 'Suresh Reddy', note: 'Venue in restricted zone.' },
    ],
    documents: [
      { name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2024-11-10', status: 'verified' },
      { name: 'Event_Letter.pdf', type: 'Event Details', date: '2024-11-10', status: 'verified' },
    ],
  },
  {
    id: 'APP-2490', serviceId: 'SVC-001', serviceName: 'Income Certificate', serviceType: 'certificate',
    citizenId: 'CIT-003', citizenName: 'Gopal Rao', officerId: 'EMP-001', officerName: 'Suresh Reddy',
    dept: 'Revenue Department', status: 'under-review', submittedDate: '2025-01-22', slaDate: '2025-01-29',
    fee: 50, paymentMethod: 'UPI', paymentStatus: 'paid',
    remarks: '',
    timeline: [
      { action: 'Application Submitted', date: '2025-01-22T09:00:00', actor: 'Gopal Rao', note: 'Application submitted online.' },
    ],
    documents: [
      { name: 'Aadhaar_Card.pdf', type: 'Identity Proof', date: '2025-01-22', status: 'verified' },
    ],
  },
  {
    id: 'APP-2399', serviceId: 'SVC-004', serviceName: 'Welfare / Subsidy Scheme', serviceType: 'welfare',
    citizenId: 'CIT-004', citizenName: 'Sunita Verma', officerId: 'EMP-004', officerName: 'Priya Nair',
    dept: 'Welfare Department', status: 'under-review', submittedDate: '2025-01-10', slaDate: '2025-01-24',
    fee: 0, paymentMethod: 'free', paymentStatus: 'waived',
    remarks: '',
    timeline: [
      { action: 'Application Submitted', date: '2025-01-10T10:00:00', actor: 'Sunita Verma', note: 'Application received.' },
    ],
    documents: [
      { name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-10', status: 'verified' },
    ],
  },
  {
    id: 'APP-2510', serviceId: 'SVC-003', serviceName: 'Residence Certificate', serviceType: 'certificate',
    citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
    dept: 'Revenue Department', status: 'under-review', submittedDate: '2026-03-11', slaDate: '2026-04-04',
    fee: 30, paymentMethod: 'UPI', paymentStatus: 'paid',
    remarks: 'Under officer review.',
    timeline: [
      { action: 'Application Submitted', date: '2026-03-11T09:00:00', actor: 'Ravi Kumar', note: 'Application received.' },
      { action: 'Payment Confirmed', date: '2026-03-11T09:01:00', actor: 'System', note: '₹30 via UPI.' },
      { action: 'Under Review', date: '2026-03-12T11:00:00', actor: 'Suresh Reddy', note: 'Documents being reviewed.' },
    ],
    documents: [
      { name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-25', status: 'verified' },
      { name: 'Electricity_Bill.pdf', type: 'Address Proof', date: '2025-01-25', status: 'pending' },
    ],
  },
  {
    id: 'APP-2254',
    serviceId: 'SVC-007',
    serviceName: 'Vendor License',
    serviceType: 'permission',
    citizenId: 'CIT-002',
    citizenName: 'Meena Devi',
    officerId: 'EMP-003',
    officerName: 'Ramesh Kumar',
    dept: 'Municipal Corporation',
    status: 'approved',
    submittedDate: '2024-11-20',
    slaDate: '2024-11-27',
    fee: 500,
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    remarks: 'Approved after grievance resolution.',
    timeline: [
      { action: 'Application Submitted', date: '2024-11-20T10:00:00', actor: 'Meena Devi', note: 'New vendor license requested.' },
      { action: 'Payment Confirmed', date: '2024-11-20T10:05:00', actor: 'System', note: '₹500 via UPI.' },
      { action: 'Officer Rejected', date: '2024-12-05T14:30:00', actor: 'Ramesh Kumar', note: 'Rejected for incomplete documentation.' },
      { action: 'Application Reopened', date: '2024-12-12T11:00:00', actor: 'Priya Nair', note: 'Reopened following grievance review (GRV-043).' },
      { action: 'Documents Verified', date: '2024-12-15T09:00:00', actor: 'Ramesh Kumar', note: 'NOC successfully re-uploaded.' },
      { action: 'License Issued', date: '2024-12-18T15:00:00', actor: 'Municipal Corporation', note: 'Vendor license granted.' },
    ],
    documents: [
      { name: 'Aadhaar_Card.pdf', type: 'Identity Proof', date: '2024-11-20', status: 'verified' },
      { name: 'Shop_Photo.jpg', type: 'Shop Image', date: '2024-11-20', status: 'verified' },
      { name: 'Agreement.pdf', type: 'Rent Agreement', date: '2024-11-20', status: 'verified' },
      { name: 'NOC_Landlord.pdf', type: 'NOC', date: '2024-12-14', status: 'verified' },
    ],
  },
];

// ── Grievance statuses ──
// Active  : 'new'  (NEW_GRIEVANCE) | 'open' (UNDER_INVESTIGATION) | 'escalated' (GRIEVANCE_ESCALATED — pending supervisor)
// Terminal: 'resolved' (GRIEVANCE_RESOLVED) | 'rejected' (GRIEVANCE_REJECTED) | 'escalated-resolved' (Supervisor closed)
// ── Categories ──
// 'delay' | 'rejection' | 'payment' | 'misconduct'
// ── SLA status (stored, since dates age) ──
// 'safe' | 'warn' | 'breach'

const MOCK_GRIEVANCES = [

  /* ════════════ ACTIVE GRIEVANCES (shown on Dashboard) ════════════ */

  {
    id: 'GRV-051', citizenId: 'CIT-001', citizenName: 'Ravi Kumar',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'delay', subject: 'Caste Certificate delayed for 12 days',
    description: 'My application has been stuck under verification with the assigned officer. The SLA is breached and I am reporting this delay.',
    relatedAppId: 'APP-2488', status: 'new', priority: 'high', slaStatus: 'breach',
    filedDate: '2025-01-28', lastUpdated: '2025-01-28',
    history: [
      { action: 'Grievance Raised', date: '2025-01-28T10:00:00', actor: 'Ravi Kumar', note: 'Citizen raised grievance due to delay at officer level.' },
      { action: 'Assigned to Grievance Officer', date: '2025-01-28T10:05:00', actor: 'System', note: 'Assigned to Priya Nair for investigation.' },
    ],
  },
  {
    id: 'GRV-050', citizenId: 'CIT-001', citizenName: 'Ravi Kumar',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'rejection', subject: 'Caste certificate rejected without proper reason',
    description: 'My caste certificate application was rejected without any explanation or reference to which document was found insufficient. The rejection letter only says "Does not meet requirements".',
    relatedAppId: 'APP-2432', status: 'new', priority: 'medium', slaStatus: 'safe',
    filedDate: '2025-01-27', lastUpdated: '2025-01-27',
    history: [
      { action: 'Grievance Filed', date: '2025-01-27T14:30:00', actor: 'Ravi Kumar', note: 'Complaint about vague rejection.' },
      { action: 'Assigned to Officer', date: '2025-01-27T14:35:00', actor: 'System', note: 'Assigned to Priya Nair (Grievance Officer).' },
    ],
  },
  {
    id: 'GRV-049', citizenId: 'CIT-002', citizenName: 'Meena Devi',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'delay', subject: 'Event permission pending 28 days — event is next week',
    description: 'I applied for event permission 28 days ago. The SLA is 5 days. I visited the office three times and each time told to come back later. My event is scheduled for next week and I risk losing my deposit.',
    relatedAppId: 'APP-2301', status: 'open', priority: 'high', slaStatus: 'breach',
    filedDate: '2025-01-20', lastUpdated: '2025-01-25',
    history: [
      { action: 'Grievance Filed', date: '2025-01-20T09:00:00', actor: 'Meena Devi', note: 'Event permission pending 23 days past SLA.' },
      { action: 'Assigned to Officer', date: '2025-01-20T09:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2025-01-25T11:00:00', actor: 'Priya Nair', note: 'Investigating with Municipal Corporation.' },
    ],
  },
  {
    id: 'GRV-048', citizenId: 'CIT-001', citizenName: 'Ravi Kumar',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'delay', subject: 'Delay in Caste Certificate Processing',
    description: 'My caste certificate application (APP-2489) has been pending for over a week with no update. The SLA deadline has passed and no communication has been received from the officer.',
    relatedAppId: 'APP-2489', status: 'open', priority: 'high', slaStatus: 'breach',
    filedDate: '2025-01-22', lastUpdated: '2025-01-24',
    history: [
      { action: 'Grievance Filed', date: '2025-01-22T14:00:00', actor: 'Ravi Kumar', note: 'Complaint about delay in caste certificate.' },
      { action: 'Assigned to Officer', date: '2025-01-22T14:30:00', actor: 'System', note: 'Assigned to Priya Nair (Grievance Officer).' },
      { action: 'Under Investigation', date: '2025-01-24T10:00:00', actor: 'Priya Nair', note: 'Investigating the delay with Revenue Department.' },
    ],
  },
  {
    id: 'GRV-047', citizenId: 'CIT-003', citizenName: 'Gopal Rao',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'misconduct', subject: 'Officer demanded informal payment for processing',
    description: 'When I visited the Revenue Office to inquire about my application, the officer (OFF-067) implied that the processing would be faster if I paid an "informal facilitation fee". I refused and want to formally report this misconduct.',
    relatedAppId: 'APP-2490', status: 'open', priority: 'high', slaStatus: 'breach',
    filedDate: '2025-01-18', lastUpdated: '2025-01-23',
    history: [
      { action: 'Grievance Filed', date: '2025-01-18T16:00:00', actor: 'Gopal Rao', note: 'Formal bribery allegation against OFF-067.' },
      { action: 'Assigned to Officer', date: '2025-01-18T16:10:00', actor: 'System', note: 'Assigned to Priya Nair (Grievance Officer). CRITICAL PRIORITY.' },
      { action: 'Audit Review Initiated', date: '2025-01-23T10:00:00', actor: 'Priya Nair', note: 'Reviewing audit logs and officer action history.' },
    ],
  },
  {
    id: 'GRV-046', citizenId: 'CIT-004', citizenName: 'Sunita Verma',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'misconduct', subject: 'Repeated harassment at Welfare Department office',
    description: 'I have been to the Welfare Department five times for my PM Kisan application. Each time a different officer handles it and says the previous officer made an error. I have been asked to re-submit documents three times already.',
    relatedAppId: 'APP-2399', status: 'escalated', priority: 'high', slaStatus: 'breach',
    filedDate: '2025-01-10', lastUpdated: '2025-01-26',
    history: [
      { action: 'Grievance Filed', date: '2025-01-10T10:00:00', actor: 'Sunita Verma', note: 'Complaint about repeated document re-submission demands.' },
      { action: 'Assigned to Officer', date: '2025-01-10T10:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2025-01-15T11:00:00', actor: 'Priya Nair', note: 'Reviewing case history with Welfare Department.' },
      { action: 'Escalated to Supervisor', date: '2025-01-26T14:00:00', actor: 'Priya Nair', note: 'Systemic issue found — escalating to Dept. Supervisor for corrective action.' },
    ],
  },

  /* ════════════ TERMINAL GRIEVANCES (shown on History page) ════════════ */

  {
    id: 'GRV-045', citizenId: 'CIT-005', citizenName: 'Arun Prasad',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'delay', subject: 'Income certificate delayed by 15 days past SLA',
    description: 'Income certificate application pending for 22 days — SLA is 7 days. No communication received.',
    relatedAppId: 'APP-2415', status: 'resolved', priority: 'medium', slaStatus: 'warn',
    filedDate: '2025-01-05', lastUpdated: '2025-01-12', closedDate: '2025-01-12', daysTaken: 7,
    resolvedBy: 'Priya Nair', resolutionNote: 'Confirmed officer was on leave without handover. Application reassigned and processed in 24 hours. Citizen notified.',
    history: [
      { action: 'Grievance Filed', date: '2025-01-05T09:00:00', actor: 'Arun Prasad', note: 'Delay in income certificate.' },
      { action: 'Assigned to Officer', date: '2025-01-05T09:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2025-01-08T10:00:00', actor: 'Priya Nair', note: 'Found officer on leave without handover.' },
      { action: 'Resolved', date: '2025-01-12T16:00:00', actor: 'Priya Nair', note: 'Application reassigned and processed. Certificate issued.' },
    ],
  },
  {
    id: 'GRV-044', citizenId: 'CIT-001', citizenName: 'Ravi Kumar',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'payment', subject: 'Welfare subsidy not credited for 2 months',
    description: 'PM Kisan subsidy not credited for October and November despite approved application and correct bank details.',
    relatedAppId: 'APP-2201', status: 'resolved', priority: 'high', slaStatus: 'safe',
    filedDate: '2024-12-20', lastUpdated: '2024-12-28', closedDate: '2024-12-28', daysTaken: 8,
    resolvedBy: 'Priya Nair', resolutionNote: 'Found incorrect IFSC stored due to bank branch migration. Updated and both months subsidy credited within 3 working days.',
    history: [
      { action: 'Grievance Filed', date: '2024-12-20T10:00:00', actor: 'Ravi Kumar', note: 'Missing subsidy for 2 months.' },
      { action: 'Assigned to Officer', date: '2024-12-20T10:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2024-12-22T11:00:00', actor: 'Priya Nair', note: 'Checking payment gateway logs.' },
      { action: 'Root Cause Found', date: '2024-12-24T14:00:00', actor: 'Priya Nair', note: 'Incorrect IFSC due to bank branch migration.' },
      { action: 'Resolved', date: '2024-12-28T09:00:00', actor: 'Priya Nair', note: 'Both subsidy amounts credited successfully.' },
    ],
  },
  {
    id: 'GRV-043', citizenId: 'CIT-002', citizenName: 'Meena Devi',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'rejection', subject: 'Vendor license rejected — no reason given',
    description: 'My trade license application was rejected with only "Incomplete Documentation" mentioned, but all listed documents were uploaded.',
    relatedAppId: 'APP-2254', status: 'resolved', priority: 'medium', slaStatus: 'safe',
    filedDate: '2024-12-10', lastUpdated: '2024-12-18', closedDate: '2024-12-18', daysTaken: 8,
    resolvedBy: 'Priya Nair', resolutionNote: 'Found officer rejected without reviewing all documents. Application reopened. Citizen asked to re-upload NOC which was missing from portal upload (upload error, not citizen fault). Certificate issued.',
    history: [
      { action: 'Grievance Filed', date: '2024-12-10T11:00:00', actor: 'Meena Devi', note: 'Rejection without clear reason.' },
      { action: 'Assigned to Officer', date: '2024-12-10T11:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2024-12-12T10:00:00', actor: 'Priya Nair', note: 'Reviewing rejection and documents.' },
      { action: 'Resolved', date: '2024-12-18T15:00:00', actor: 'Priya Nair', note: 'Application reopened. Upload error fixed. License issued.' },
    ],
  },
  {
    id: 'GRV-042', citizenId: 'CIT-003', citizenName: 'Gopal Rao',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'rejection', subject: 'Bribery allegation — no evidence found',
    description: 'Citizen claimed officer demanded payment for caste certificate. Citizen had no supporting evidence — no call records, no written communication.',
    relatedAppId: 'APP-2101', status: 'rejected', priority: 'medium', slaStatus: 'safe',
    filedDate: '2024-12-01', lastUpdated: '2024-12-09', closedDate: '2024-12-09', daysTaken: 8,
    resolvedBy: 'Priya Nair', resolutionNote: 'Investigation found no supporting evidence. Audit logs showed officer processed all cases within SLA. Complaint could not be substantiated. Grievance rejected.',
    history: [
      { action: 'Grievance Filed', date: '2024-12-01T14:00:00', actor: 'Gopal Rao', note: 'Bribery allegation, no supporting evidence provided.' },
      { action: 'Assigned to Officer', date: '2024-12-01T14:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2024-12-03T10:00:00', actor: 'Priya Nair', note: 'Reviewing audit logs and officer history.' },
      { action: 'Grievance Rejected', date: '2024-12-09T11:00:00', actor: 'Priya Nair', note: 'Complaint unsubstantiated — no evidence found. Case closed.' },
    ],
  },
  {
    id: 'GRV-041', citizenId: 'CIT-001', citizenName: 'Ravi Kumar',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'misconduct', subject: 'Unprofessional behavior at Revenue Office',
    description: 'During my visit to the Revenue Office for document verification, the officer was rude and unhelpful. Refused to explain the process and dismissed my queries.',
    relatedAppId: 'APP-2456', status: 'resolved', priority: 'medium', slaStatus: 'safe',
    filedDate: '2024-11-15', lastUpdated: '2024-11-28', closedDate: '2024-11-28', daysTaken: 13,
    resolvedBy: 'Priya Nair', resolutionNote: 'Investigation confirmed officer behavior was inappropriate. Officer counselled. Formal warning issued. Citizen compensated with priority processing on pending application.',
    history: [
      { action: 'Grievance Filed', date: '2024-11-15T09:00:00', actor: 'Ravi Kumar', note: 'Complaint about officer behavior.' },
      { action: 'Assigned', date: '2024-11-15T09:30:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Investigation Complete', date: '2024-11-22T15:00:00', actor: 'Priya Nair', note: 'Investigated and confirmed. Warning issued.' },
      { action: 'Resolved', date: '2024-11-28T11:00:00', actor: 'Priya Nair', note: 'Officer counseled. Formal warning issued.' },
    ],
  },
  {
    id: 'GRV-040', citizenId: 'CIT-004', citizenName: 'Sunita Verma',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'payment', subject: 'Duplicate payment deducted during application',
    description: 'Two UPI payments of ₹200 each were deducted for a single Event Permission application. Portal showed payment successful but two transactions appear in bank statement.',
    relatedAppId: 'APP-2301', status: 'resolved', priority: 'low', slaStatus: 'safe',
    filedDate: '2024-11-02', lastUpdated: '2024-11-07', closedDate: '2024-11-07', daysTaken: 5,
    resolvedBy: 'Priya Nair', resolutionNote: 'Payment gateway logs confirmed duplicate deduction due to network timeout. Refund of ₹200 processed to citizen\'s bank within 3 business days.',
    history: [
      { action: 'Grievance Filed', date: '2024-11-02T12:00:00', actor: 'Sunita Verma', note: 'Duplicate payment of ₹200 reported.' },
      { action: 'Assigned to Officer', date: '2024-11-02T12:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Payment Verified', date: '2024-11-04T10:00:00', actor: 'Priya Nair', note: 'Duplicate confirmed in payment gateway logs.' },
      { action: 'Resolved', date: '2024-11-07T11:00:00', actor: 'Priya Nair', note: 'Refund of ₹200 processed to bank.' },
    ],
  },
  {
    id: 'GRV-039', citizenId: 'CIT-005', citizenName: 'Arun Prasad',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'delay', subject: 'Residence certificate pending beyond SLA — duplicate filing',
    description: 'Citizen filed a duplicate grievance for the same application that was already resolved under GRV-033. Current application still shows pending but was in fact processed.',
    relatedAppId: 'APP-2180', status: 'rejected', priority: 'low', slaStatus: 'safe',
    filedDate: '2024-10-20', lastUpdated: '2024-10-28', closedDate: '2024-10-28', daysTaken: 8,
    resolvedBy: 'Priya Nair', resolutionNote: 'Found this is a duplicate filing for an already-resolved case (GRV-033). The certificate was issued and available for download. Citizen was notified and shown how to access the certificate. Grievance rejected as duplicate.',
    history: [
      { action: 'Grievance Filed', date: '2024-10-20T10:00:00', actor: 'Arun Prasad', note: 'Second complaint about same pending application.' },
      { action: 'Assigned to Officer', date: '2024-10-20T10:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Duplicate Identified', date: '2024-10-25T11:00:00', actor: 'Priya Nair', note: 'GRV-033 already resolved this case. Certificate was available.' },
      { action: 'Grievance Rejected', date: '2024-10-28T09:00:00', actor: 'Priya Nair', note: 'Rejected as duplicate. Citizen notified and guided to download certificate.' },
    ],
  },
  {
    id: 'GRV-038', citizenId: 'CIT-4421', citizenName: 'Gopal Rao',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'delay', subject: 'Event permission SLA breached — escalated to Supervisor',
    description: 'Event permission application pending 45 days. SLA breached by 15 days. Citizen visited office twice. Event date approaching in 3 days.',
    relatedAppId: 'APP-2301', status: 'escalated-resolved', priority: 'high', slaStatus: 'breach',
    filedDate: '2024-09-12', lastUpdated: '2024-09-22', closedDate: '2024-09-22', daysTaken: 10,
    resolvedBy: 'Supervisor: Anita Sharma', resolutionNote: 'Escalated to Department Supervisor. Supervisor directly approved the application and issued formal warning to officer for SLA breach. Permission issued within 24 hours of escalation.',
    history: [
      { action: 'Grievance Filed', date: '2024-09-12T09:00:00', actor: 'Gopal Rao', note: 'SLA breached by 15 days. Event approaching.' },
      { action: 'Assigned to Officer', date: '2024-09-12T09:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2024-09-14T10:00:00', actor: 'Priya Nair', note: 'Confirmed SLA breach. Officer found non-responsive.' },
      { action: 'Escalated to Supervisor', date: '2024-09-15T14:00:00', actor: 'Priya Nair', note: 'Escalated to Dept. Supervisor Anita Sharma. GRIEVANCE_ESCALATED.' },
      { action: 'Supervisor Action', date: '2024-09-16T11:00:00', actor: 'Anita Sharma', note: 'Supervisor directly approved application and issued warning to officer.' },
      { action: 'Case Closed', date: '2024-09-22T16:00:00', actor: 'Anita Sharma', note: 'Grievance closed. Citizen notified.' },
    ],
  },
  {
    id: 'GRV-037', citizenId: 'CIT-2941', citizenName: 'Mohammed Ali',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'misconduct', subject: 'Officer solicited bribe — evidence provided',
    description: 'Officer (OFF-071) solicited informal payment for certificate processing. Citizen has call recording as evidence.',
    relatedAppId: 'APP-2144', status: 'escalated-resolved', priority: 'high', slaStatus: 'breach',
    filedDate: '2024-08-09', lastUpdated: '2024-08-21', closedDate: '2024-08-21', daysTaken: 12,
    resolvedBy: 'Supervisor: Anita Sharma', resolutionNote: 'Escalated due to seriousness. Supervisor launched departmental inquiry. Officer found guilty. Disciplinary action initiated. Certificate issued to citizen directly by supervisor. Formal vigilance complaint filed.',
    history: [
      { action: 'Grievance Filed', date: '2024-08-09T11:00:00', actor: 'Mohammed Ali', note: 'Bribery allegation with call recording evidence.' },
      { action: 'Assigned to Officer', date: '2024-08-09T11:05:00', actor: 'System', note: 'Assigned to Priya Nair. CRITICAL.' },
      { action: 'Escalated to Supervisor', date: '2024-08-10T09:00:00', actor: 'Priya Nair', note: 'Misconduct too serious for officer level — escalated.' },
      { action: 'Departmental Inquiry', date: '2024-08-11T10:00:00', actor: 'Anita Sharma', note: 'Formal inquiry launched against OFF-071.' },
      { action: 'Certificate Issued', date: '2024-08-12T15:00:00', actor: 'Anita Sharma', note: 'Supervisor directly issued certificate to citizen.' },
      { action: 'Case Closed', date: '2024-08-21T11:00:00', actor: 'Anita Sharma', note: 'Grievance closed. Vigilance case ongoing separately.' },
    ],
  },
  {
    id: 'GRV-036', citizenId: 'CIT-1677', citizenName: 'Swathi Priya',
    officerId: 'EMP-004', officerName: 'Priya Nair',
    category: 'rejection', subject: 'Residence certificate — data entry error by system',
    description: 'Certificate issued with incorrect address. System auto-populated old address from legacy record.',
    relatedAppId: 'APP-1998', status: 'resolved', priority: 'medium', slaStatus: 'safe',
    filedDate: '2024-07-06', lastUpdated: '2024-07-14', closedDate: '2024-07-14', daysTaken: 8,
    resolvedBy: 'Priya Nair', resolutionNote: 'Verified citizen documents. Address was incorrectly auto-populated from legacy record. Certificate recalled and re-issued with correct data. System admin notified to fix legacy data migration.',
    history: [
      { action: 'Grievance Filed', date: '2024-07-06T15:00:00', actor: 'Swathi Priya', note: 'Wrong address on certificate.' },
      { action: 'Assigned to Officer', date: '2024-07-06T15:05:00', actor: 'System', note: 'Assigned to Priya Nair.' },
      { action: 'Under Investigation', date: '2024-07-08T10:00:00', actor: 'Priya Nair', note: 'Confirmed legacy data migration error.' },
      { action: 'Certificate Recalled', date: '2024-07-10T13:00:00', actor: 'Priya Nair', note: 'Erroneous certificate revoked.' },
      { action: 'Resolved', date: '2024-07-14T10:30:00', actor: 'Priya Nair', note: 'Corrected certificate issued. Citizen notified.' },
    ],
  },
];

const MOCK_NOTIFICATIONS = [
  { id: 'NOT-001', userId: 'CIT-001', title: 'Application Approved!', message: 'Your Income Certificate (APP-2456) has been approved. Download now.', type: 'success', read: false, date: '2025-01-18T09:45:00', link: 'citizen/track-application.html?id=APP-2456' },
  { id: 'NOT-002', userId: 'CIT-001', title: 'Query Raised', message: 'Officer has requested additional documents for APP-2489. Please respond.', type: 'warning', read: false, date: '2025-01-23T11:00:00', link: 'citizen/track-application.html?id=APP-2489' },
  { id: 'NOT-003', userId: 'CIT-001', title: 'New Scheme Available', message: 'PM Kisan Scholarship 2025 applications are now open. Check eligibility.', type: 'info', read: false, date: '2025-01-20T08:00:00', link: 'citizen/apply-service.html' },
  { id: 'NOT-004', userId: 'EMP-001', title: 'New Application Assigned', message: 'Residence Certificate application (APP-2510) assigned to you.', type: 'info', read: false, date: '2025-01-25T09:05:00', link: 'officer/review-application.html' },
  { id: 'NOT-005', userId: 'EMP-002', title: 'SLA Breach Warning', message: 'Application APP-2489 is approaching SLA deadline.', type: 'warning', read: false, date: '2025-01-25T08:00:00', link: 'supervisor/escalated-cases.html' },
  { id: 'NOT-006', userId: 'EMP-004', title: 'New Grievance Assigned', message: 'Grievance GRV-051 regarding scholarship disbursement assigned to you.', type: 'info', read: false, date: '2025-01-28T10:05:00', link: 'grievance/grievance-detail.html?id=GRV-051' },
  { id: 'NOT-007', userId: 'EMP-004', title: 'SLA Breach Alert', message: 'Grievance GRV-048 has breached SLA. Immediate action required.', type: 'danger', read: false, date: '2025-01-25T08:00:00', link: 'grievance/grievance-detail.html?id=GRV-048' },
];

const MOCK_AUDIT_LOGS = [
  { id: 'LOG-001', action: 'User Login', actor: 'admin@DigiConnect.com', role: 'admin', date: '2025-01-25T08:00:00', details: 'Admin logged in.' },
  { id: 'LOG-002', action: 'Service Created', actor: 'admin@DigiConnect.com', role: 'admin', date: '2025-01-24T14:00:00', details: 'Added new service: Birth Certificate.' },
  { id: 'LOG-003', action: 'Application Approved', actor: 'officer1@DigiConnect.com', role: 'officer', date: '2025-01-18T09:45:00', details: 'Approved APP-2456 (Income Certificate).' },
  { id: 'LOG-004', action: 'Grievance Filed', actor: 'citizen1@DigiConnect.com', role: 'citizen', date: '2025-01-22T14:00:00', details: 'Filed GRV-048 regarding delay in caste certificate.' },
  { id: 'LOG-005', action: 'Officer Onboarded', actor: 'admin@DigiConnect.com', role: 'admin', date: '2025-01-20T10:00:00', details: 'Onboarded new officer: Deepak Menon.' },
  { id: 'LOG-006', action: 'Grievance Escalated', actor: 'grievance@DigiConnect.com', role: 'grievance', date: '2025-01-26T14:00:00', details: 'GRV-046 escalated to Dept. Supervisor.' },
  { id: 'LOG-007', action: 'Grievance Resolved', actor: 'grievance@DigiConnect.com', role: 'grievance', date: '2025-01-12T16:00:00', details: 'GRV-045 resolved — officer leave handover issue.' },
];

/**
 * Initialize localStorage with mock data if not already present
 */
export function initializeMockData() {
  if (!localStorage.getItem('DigiConnect_initialized_v21')) {
    localStorage.clear();
    localStorage.setItem('DigiConnect_users', JSON.stringify(MOCK_USERS));
    localStorage.setItem('DigiConnect_services', JSON.stringify(MOCK_SERVICES));
    localStorage.setItem('DigiConnect_applications', JSON.stringify(MOCK_APPLICATIONS));
    localStorage.setItem('DigiConnect_grievances', JSON.stringify(MOCK_GRIEVANCES));
    localStorage.setItem('DigiConnect_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
    localStorage.setItem('DigiConnect_audit_logs', JSON.stringify(MOCK_AUDIT_LOGS));
    localStorage.setItem('DigiConnect_pending_officers', JSON.stringify(MOCK_PENDING_OFFICERS));
    localStorage.setItem('DigiConnect_officer_queue', JSON.stringify(OFFICER_QUEUE));
    localStorage.setItem('DigiConnect_officer_queries', JSON.stringify(OFFICER_QUERIES));
    localStorage.setItem('DigiConnect_super_approvals', JSON.stringify(SUPER_OFFICER_APPROVED));
    localStorage.setItem('DigiConnect_super_approved_today', '42');
    localStorage.setItem('DigiConnect_super_esc_sla_cases', JSON.stringify([...SUPER_ESC_SLA_CASES, ...SUPER_ESC_GRIEVANCE_CASES]));
    localStorage.setItem('DigiConnect_super_pending_apps', JSON.stringify(SUPER_PENDING_APPS));
    localStorage.setItem('DigiConnect_initialized_v21', 'true');
  }
}

/**
 * Reset all mock data (useful for testing)
 */
export function resetMockData() {
  localStorage.removeItem('DigiConnect_initialized_v4');
  localStorage.removeItem('DigiConnect_users');
  localStorage.removeItem('DigiConnect_services');
  localStorage.removeItem('DigiConnect_applications');
  localStorage.removeItem('DigiConnect_grievances');
  localStorage.removeItem('DigiConnect_notifications');
  localStorage.removeItem('DigiConnect_audit_logs');
  localStorage.removeItem('DigiConnect_pending_officers');
  localStorage.removeItem('DigiConnect_officer_queue');
  localStorage.removeItem('DigiConnect_officer_queries');
  localStorage.removeItem('DigiConnect_super_approvals');
  localStorage.removeItem('DigiConnect_super_approved_today');
  localStorage.removeItem('DigiConnect_super_esc_sla_cases');
  localStorage.removeItem('DigiConnect_super_pending_apps');
  localStorage.removeItem('DigiConnect_session');
  initializeMockData();
}

// ── Dashboard Layout Specific Mock Data ──
const OFFICER_QUEUE = [
  {
    id: 'APP-2501', service: 'Income Certificate', citizen: 'Arjun Mehta', phone: '9876540001',
    submitted: '23 Jan 2025', slaLeft: 5, slaTotal: 7, status: 'new',
    aadhaar: 'XXXX XXXX 7721', dob: '12 Mar 1989', gender: 'Male',
    address: '15-2-301, Malakpet, Hyderabad – 500036',
    income: '1,60,000', purpose: 'Scholarship Application', occupation: 'Salaried – IT Sector',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Ration_Card.jpg', size: '420 KB', type: 'Address Proof', icon: 'img' },
      { name: 'Salary_Slip_Dec24.pdf', size: '640 KB', type: 'Income Proof', icon: 'pdf' },
    ],
    history: [
      { label: 'Application Submitted', ts: '23 Jan 2025, 10:22 AM', detail: 'Submitted online via Citizen Portal. Payment ₹50 via UPI confirmed.', dot: 'submitted' },
      { label: 'Assigned to Officer', ts: '23 Jan 2025, 10:45 AM', detail: 'Auto-assigned to Suresh Reddy (VRO) based on queue rotation.', dot: 'assign' },
    ],
    checklist: ['Aadhaar identity verified against database', 'Address matches submitted documents', 'Income amount is consistent across all proofs', 'Occupation and income source are plausible', 'No duplicate application found in system'],
  },
  {
    id: 'APP-2498', service: 'Caste Certificate', citizen: 'Sunita Devi', phone: '9876540002',
    submitted: '21 Jan 2025', slaLeft: 2, slaTotal: 7, status: 'review',
    aadhaar: 'XXXX XXXX 4432', dob: '05 Jun 1975', gender: 'Female',
    address: '8-3-22, Ameerpet, Hyderabad – 500016',
    community: 'Scheduled Caste (SC)', religion: 'Hindu', category: 'SC', purpose: 'Govt. Scheme Eligibility',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Ration_Card.jpg', size: '512 KB', type: 'Address Proof', icon: 'img' },
      { name: 'Community_Decl.pdf', size: '220 KB', type: 'Community Declaration', icon: 'pdf' },
      { name: 'School_Certificate.pdf', size: '890 KB', type: 'School Records', icon: 'pdf' },
    ],
    history: [
      { label: 'Application Submitted', ts: '21 Jan 2025, 09:10 AM', detail: 'Submitted online. Payment ₹50 confirmed.', dot: 'submitted' },
      { label: 'Assigned to Officer', ts: '21 Jan 2025, 09:30 AM', detail: 'Assigned to Suresh Reddy.', dot: 'assign' },
      { label: 'Under Review', ts: '22 Jan 2025, 02:00 PM', detail: 'Officer began document review.', dot: 'review' },
    ],
    checklist: ['Aadhaar identity verified', 'Community/caste matches declaration letter', 'School certificate confirms community', 'No inconsistency in submitted records', 'Applicant is not already holding a valid certificate'],
  },
  {
    id: 'APP-2495', service: 'Residence Certificate', citizen: 'Gopal Sharma', phone: '9876540003',
    submitted: '20 Jan 2025', slaLeft: 1, slaTotal: 5, status: 'urgent',
    aadhaar: 'XXXX XXXX 9910', dob: '28 Sep 1968', gender: 'Male',
    address: 'H.No 4-2-8, Uppal, Hyderabad – 500039',
    duration: '12 years', residenceType: 'Own House', purpose: 'Domicile Proof',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Electricity_Bill.pdf', size: '480 KB', type: 'Address Proof', icon: 'pdf' },
    ],
    history: [
      { label: 'Application Submitted', ts: '20 Jan 2025, 11:00 AM', detail: 'Submitted online.', dot: 'submitted' },
      { label: 'Assigned', ts: '20 Jan 2025, 11:20 AM', detail: 'Assigned to Suresh Reddy.', dot: 'assign' },
      { label: 'Under Review', ts: '21 Jan 2025, 10:00 AM', detail: 'Documents under verification.', dot: 'review' },
    ],
    checklist: ['Aadhaar address matches stated address', 'Utility bill is recent (within 3 months)', 'Duration of stay is consistent with records', 'No conflicting address in other applications', 'Field verification completed if required'],
  },
  {
    id: 'APP-2490', service: 'Income Certificate', citizen: 'Gopal Rao', phone: '9876540004',
    submitted: '22 Jan 2025', slaLeft: 4, slaTotal: 7, status: 'new',
    aadhaar: 'XXXX XXXX 6603', dob: '14 Feb 1992', gender: 'Female',
    address: 'Plot 22, Kondapur, Hyderabad – 500084',
    income: '95,000', purpose: 'Bank Loan', occupation: 'Agriculture',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Land_Records.pdf', size: '1.2 MB', type: 'Land Proof', icon: 'pdf' },
      { name: 'Income_Affidavit.pdf', size: '380 KB', type: 'Income Proof', icon: 'pdf' },
    ],
    history: [
      { label: 'Application Submitted', ts: '22 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '22 Jan 2025', detail: 'Assigned to Suresh Reddy.', dot: 'assign' },
    ],
    checklist: ['Aadhaar identity verified', 'Land records confirm agricultural occupation', 'Income figure is consistent', 'No prior income certificate conflict', 'Purpose is valid for certificate use'],
  },
  {
    id: 'APP-2487', service: 'Caste Certificate', citizen: 'Meena Reddy', phone: '9876540005',
    submitted: '19 Jan 2025', slaLeft: 3, slaTotal: 7, status: 'new',
    aadhaar: 'XXXX XXXX 2281', dob: '03 Nov 1988', gender: 'Female',
    address: '5-8-999, Dilsukhnagar, Hyderabad – 500060',
    community: 'OBC', religion: 'Hindu', category: 'OBC', purpose: 'Education Reservation',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Ration_Card.jpg', size: '495 KB', type: 'Address Proof', icon: 'img' },
      { name: 'Community_Cert_Old.pdf', size: '640 KB', type: 'Old Certificate', icon: 'pdf' },
      { name: 'School_Certificate.pdf', size: '720 KB', type: 'School Records', icon: 'pdf' },
    ],
    history: [
      { label: 'Application Submitted', ts: '19 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '19 Jan 2025', detail: null, dot: 'assign' },
    ],
    checklist: ['Identity verified via Aadhaar', 'Community OBC consistent across documents', 'Old certificate cross-verified', 'No duplicate found', 'School records support community claim'],
  },
  {
    id: 'APP-2483', service: 'Record Correction', citizen: 'Kiran Bose', phone: '9876540006',
    submitted: '18 Jan 2025', slaLeft: 4, slaTotal: 10, status: 'new',
    aadhaar: 'XXXX XXXX 5507', dob: '22 Jul 1980', gender: 'Male',
    address: '3-4-567, Secunderabad – 500015',
    recordType: 'Ration Card', incorrect: 'Kiran K. Bose', correct: 'Kiran Bose', reason: 'Spelling error in surname initial',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Affidavit_Correction.pdf', size: '560 KB', type: 'Affidavit', icon: 'pdf' },
      { name: 'Ration_Card_Original.jpg', size: '680 KB', type: 'Original Record', icon: 'img' },
    ],
    history: [
      { label: 'Application Submitted', ts: '18 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '18 Jan 2025', detail: null, dot: 'assign' },
    ],
    checklist: ['Aadhaar identity verified', 'Affidavit is properly notarized', 'Original record submitted correctly', 'Correction is minor clerical in nature', 'No fraud indicators present'],
  },
  {
    id: 'APP-2415', service: 'Income Certificate', citizen: 'Venkat Rao', phone: '9876540007',
    submitted: '13 Jan 2025', slaLeft: -5, slaTotal: 7, status: 'breach',
    aadhaar: 'XXXX XXXX 8839', dob: '09 Dec 1972', gender: 'Male',
    address: '2-1-88, Secunderabad – 500003',
    income: '2,10,000', purpose: 'Education Admission', occupation: 'Salaried – Govt.',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Ration_Card.jpg', size: '490 KB', type: 'Address Proof', icon: 'img' },
      { name: 'Salary_Slip.pdf', size: '720 KB', type: 'Income Proof', icon: 'pdf' },
    ],
    history: [
      { label: 'Application Submitted', ts: '13 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '13 Jan 2025', detail: null, dot: 'assign' },
      { label: 'SLA Warning (Day 5)', ts: '18 Jan 2025', detail: 'System auto-reminder sent to officer.', dot: 'warning' },
      { label: 'SLA Breached (Day 7)', ts: '20 Jan 2025', detail: 'SLA deadline passed. Escalation pending.', dot: 'breach' },
    ],
    checklist: ['Aadhaar identity verified', 'Salary slip is current', 'Income figure cross-verified with Form 16', 'Purpose aligns with salary level', 'No duplicate detected'],
  },
  {
    id: 'APP-2389', service: 'Caste Certificate', citizen: 'Lalitha M.', phone: '9876540008',
    submitted: '11 Jan 2025', slaLeft: -7, slaTotal: 7, status: 'breach',
    aadhaar: 'XXXX XXXX 3344', dob: '17 Mar 1990', gender: 'Female',
    address: '9-5-44, LB Nagar, Hyderabad – 500074',
    community: 'Scheduled Tribe (ST)', religion: 'Hindu', category: 'ST', purpose: 'Reservation Benefit',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Ration_Card.jpg', size: '510 KB', type: 'Address Proof', icon: 'img' },
      { name: 'Tribe_Decl.pdf', size: '340 KB', type: 'Tribe Declaration', icon: 'pdf' },
      { name: 'School_Certificate.pdf', size: '660 KB', type: 'School Records', icon: 'pdf' },
    ],
    history: [
      { label: 'Application Submitted', ts: '11 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '11 Jan 2025', detail: null, dot: 'assign' },
      { label: 'SLA Breached', ts: '18 Jan 2025', detail: '7-day SLA exceeded. Auto-escalation triggered.', dot: 'breach' },
    ],
    checklist: ['Aadhaar identity verified', 'ST community document verified', 'School records confirm ST status', 'No duplicate', 'Declaration letter is notarized'],
  },
  {
    id: 'APP-2463', service: 'Residence Certificate', citizen: 'Arun Nair', phone: '9876540021',
    submitted: '20 Jan 2025', slaLeft: 3, slaTotal: 7, status: 'review',
    aadhaar: 'XXXX XXXX 1122', dob: '10 Oct 1985', gender: 'Male',
    address: 'Plot 10, Jubilee Hills, Hyderabad – 500033',
    duration: '5 years', residenceType: 'Rented', purpose: 'Passport Application',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Rental_Agreement.pdf', size: '880 KB', type: 'Address Proof', icon: 'pdf' },
      { name: 'Aadhaar_Updated.pdf', size: '320 KB', type: 'Address Proof (New)', icon: 'pdf' }
    ],
    history: [
      { label: 'Application Submitted', ts: '20 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '20 Jan 2025', detail: null, dot: 'assign' },
      { label: 'Query Raised', ts: '21 Jan 2025', detail: 'Address in Aadhaar does not match address stated in application. Clarify or upload supporting document.', dot: 'warning' },
      { label: 'Response Received', ts: '22 Jan 2025', detail: 'Citizen uploaded new document.', dot: 'review' }
    ],
    checklist: ['Aadhaar address matches stated address', 'Utility bill is recent (within 3 months)', 'Duration of stay is consistent with records', 'No conflicting address in other applications', 'Field verification completed if required'],
    citizenResponse: 'I have updated my Aadhaar card with the correct address and uploaded the new copy. Please review.'
  },
  {
    id: 'APP-2451', service: 'Caste Certificate', citizen: 'Suma Reddy', phone: '9876540022',
    submitted: '18 Jan 2025', slaLeft: 2, slaTotal: 7, status: 'review',
    aadhaar: 'XXXX XXXX 3344', dob: '05 May 1990', gender: 'Female',
    address: 'Flat 202, Madhapur, Hyderabad – 500081',
    community: 'OBC', religion: 'Hindu', category: 'OBC', purpose: 'Job Application',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Community_Decl_Old.pdf', size: '220 KB', type: 'Community Declaration', icon: 'pdf' },
      { name: 'Community_Decl_Attested.pdf', size: '300 KB', type: 'Community Declaration (New)', icon: 'pdf' }
    ],
    history: [
      { label: 'Application Submitted', ts: '18 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '18 Jan 2025', detail: null, dot: 'assign' },
      { label: 'Query Raised', ts: '20 Jan 2025', detail: 'Community declaration not self-attested. Please upload attested copy.', dot: 'warning' },
      { label: 'Response Received', ts: '21 Jan 2025', detail: 'Citizen uploaded new document.', dot: 'review' }
    ],
    checklist: ['Identity verified via Aadhaar', 'Community OBC consistent across documents', 'Old certificate cross-verified', 'No duplicate found', 'School records support community claim'],
    citizenResponse: 'I mistakenly uploaded the un-attested copy earlier. The self-attested document has now been uploaded.'
  },
  {
    id: 'APP-2489', service: 'Caste Certificate', citizen: 'Ravi Kumar', phone: '9876540023',
    submitted: '21 Jan 2025', slaLeft: 4, slaTotal: 7, status: 'review',
    aadhaar: 'XXXX XXXX 5566', dob: '15 Aug 2000', gender: 'Male',
    address: 'Door 1, Kukatpally, Hyderabad – 500072',
    community: 'SC', religion: 'Hindu', category: 'SC', purpose: 'Education Admissions',
    docs: [
      { name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' },
      { name: 'Ration_Card.pdf', size: '220 KB', type: 'Address Proof', icon: 'pdf' }
    ],
    history: [
      { label: 'Application Submitted', ts: '21 Jan 2025', detail: null, dot: 'submitted' },
      { label: 'Assigned', ts: '21 Jan 2025', detail: null, dot: 'assign' },
      { label: 'Query Raised', ts: '23 Jan 2025', detail: 'Please upload self-attested community cert from school records or local sarpanch.', dot: 'warning' },
    ],
    checklist: ['Identity verified via Aadhaar', 'Community SC consistent across documents', 'Old certificate cross-verified', 'No duplicate found', 'School records support community claim'],
  }
];

const OFFICER_QUERIES = [
  { id: 'APP-2489', service: 'Caste Certificate', citizen: 'Ravi Kumar', query: 'Please upload self-attested community cert from school records or local sarpanch.', sent: '23 Jan', deadline: '26 Jan', responded: false },
  { id: 'APP-2477', service: 'Income Certificate', citizen: 'Priya Sharma', query: 'Salary slip provided is older than 6 months. Please submit current salary slip or Form 16.', sent: '22 Jan', deadline: '25 Jan', responded: false },
  { id: 'APP-2463', service: 'Residence Certificate', citizen: 'Arun Nair', query: 'Address in Aadhaar does not match address stated in application. Clarify or upload supporting document.', sent: '21 Jan', deadline: '24 Jan', responded: true },
  { id: 'APP-2451', service: 'Caste Certificate', citizen: 'Suma Reddy', query: 'Community declaration not self-attested. Please upload attested copy.', sent: '20 Jan', deadline: '23 Jan', responded: true },
  { id: 'APP-2438', service: 'Income Certificate', citizen: 'Venkat Pillai', query: 'Form 16 has unclear watermark. Please upload higher quality scan.', sent: '19 Jan', deadline: '22 Jan', responded: false },
];

const OFFICER_ACTIVITY = [
  { icon: 'check', color: 'var(--green-500)', msg: 'Approved APP-2480 — Income Certificate for Ravi Kumar', time: '4:52 PM' },
  { icon: 'query', color: 'var(--amber-500)', msg: 'Raised query on APP-2489 — Requested updated community certificate from Ravi Kumar', time: '3:10 PM' },
  { icon: 'reject', color: 'var(--red-500)', msg: 'Rejected APP-2471 — Duplicate application detected (APP-2392 already processed)', time: '1:45 PM' },
  { icon: 'check', color: 'var(--green-500)', msg: 'Approved APP-2468 — Residence Certificate for Gopal Sharma', time: '11:20 AM' },
  { icon: 'check', color: 'var(--green-500)', msg: 'Approved APP-2461 — Income Certificate for Priya Sharma', time: '10:05 AM' },
  { icon: 'login', color: 'var(--navy-400)', msg: 'Logged in. 28 applications in queue.', time: '9:02 AM' },
];

const OFFICER_SLA_RISKS = [
  { id: 'APP-2498', label: 'Caste Cert — Sunita Devi', pct: 71, status: 'warn' },
  { id: 'APP-2495', label: 'Residence Cert — Gopal Sharma', pct: 80, status: 'warn' },
  { id: 'APP-2489', label: 'Caste Cert — Ravi Kumar', pct: 71, status: 'warn' },
  { id: 'APP-2415', label: 'Income Cert — Venkat Rao', pct: 100, status: 'breach' }
];

const OFFICER_WEEK_CHART = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  vals: [12, 18, 8, 22, 14, 0, 0]
};

const SUPER_OFFICER_APPROVED = [
  { id: 'APP-2521', service: 'Income Certificate', citizen: 'Ravi Shankar', officer: 'Suresh Reddy', role: 'VRO', submitted: '22 Jan', slaLeft: 3, docs: ['Aadhaar Card.pdf', 'Salary Slip.pdf', 'Form 16.pdf'], officerNote: 'All documents verified. Income ₹1,40,000 — within limit. Recommend approval.', timeline: [{ d: '22 Jan', e: 'Application submitted', t: 'info' }, { d: '23 Jan', e: 'Assigned to Suresh Reddy (VRO)', t: 'info' }, { d: '24 Jan', e: 'Documents verified by officer', t: 'info' }, { d: '25 Jan', e: 'Officer approved — awaiting supervisor final decision', t: 'success' }] },
  { id: 'APP-2519', service: 'Caste Certificate', citizen: 'Asha Devi', officer: 'Anita Sharma', role: 'RI', submitted: '21 Jan', slaLeft: 4, docs: ['Aadhaar Card.pdf', 'Community Declaration.pdf', 'School Certificate.pdf'], officerNote: 'Community SC verified via school records and Aadhaar. Documents genuine. Recommend approval.', timeline: [{ d: '21 Jan', e: 'Application submitted', t: 'info' }, { d: '22 Jan', e: 'Assigned to Anita Sharma (RI)', t: 'info' }, { d: '23 Jan', e: 'Officer raised query — additional doc requested', t: 'warn' }, { d: '24 Jan', e: 'Citizen responded with supplementary doc', t: 'info' }, { d: '25 Jan', e: 'Officer approved — awaiting supervisor final decision', t: 'success' }] },
  { id: 'APP-2517', service: 'Residence Certificate', citizen: 'Prakash Nair', officer: 'Ramesh Kumar', role: 'MRO', submitted: '20 Jan', slaLeft: 2, docs: ['Aadhaar Card.pdf', 'Rent Agreement.pdf', 'Utility Bill.pdf'], officerNote: 'Address verified via Aadhaar and utility bills. 3+ year residency confirmed.', timeline: [{ d: '20 Jan', e: 'Application submitted', t: 'info' }, { d: '21 Jan', e: 'Assigned to Ramesh Kumar (MRO)', t: 'info' }, { d: '22 Jan', e: 'Field verification done', t: 'info' }, { d: '23 Jan', e: 'Officer approved — awaiting supervisor final decision', t: 'success' }] },
  { id: 'APP-2514', service: 'Welfare Scheme', citizen: 'Gopal Rao', officer: 'Priya Nair', role: 'Welfare Officer', submitted: '19 Jan', slaLeft: 5, docs: ['Aadhaar Card.pdf', 'Income Certificate.pdf', 'Ration Card.jpg'], officerNote: 'Income ₹68,000 — below scheme threshold of ₹1,50,000. All eligibility criteria met.', timeline: [{ d: '19 Jan', e: 'Application submitted', t: 'info' }, { d: '20 Jan', e: 'Assigned to Priya Nair (Welfare Officer)', t: 'info' }, { d: '22 Jan', e: 'Eligibility verified', t: 'info' }, { d: '24 Jan', e: 'Officer approved — awaiting supervisor final decision', t: 'success' }] },
  { id: 'APP-2511', service: 'Income Certificate', citizen: 'Santosh Pillai', officer: 'Suresh Reddy', role: 'VRO', submitted: '19 Jan', slaLeft: 1, docs: ['Aadhaar Card.pdf', 'Form 16.pdf'], officerNote: 'Income ₹95,000. Documents authentic.', timeline: [{ d: '19 Jan', e: 'Application submitted', t: 'info' }, { d: '20 Jan', e: 'Assigned to officer', t: 'info' }, { d: '24 Jan', e: 'Officer approved', t: 'success' }] },
  { id: 'APP-2508', service: 'Caste Certificate', citizen: 'Rekha Kumari', officer: 'Anita Sharma', role: 'RI', submitted: '18 Jan', slaLeft: 3, docs: ['Aadhaar Card.pdf', 'Community Declaration.pdf'], officerNote: 'Community OBC verified. Documents consistent.', timeline: [{ d: '18 Jan', e: 'Application submitted', t: 'info' }, { d: '19 Jan', e: 'Assigned to officer', t: 'info' }, { d: '23 Jan', e: 'Officer approved', t: 'success' }] },
  { id: 'APP-2503', service: 'Welfare Scheme', citizen: 'Gopal Varma', officer: 'Priya Nair', role: 'Welfare Officer', submitted: '17 Jan', slaLeft: 6, docs: ['Aadhaar.pdf', 'Income.pdf'], officerNote: 'Application okay.', timeline: [{ d: '17 Jan', e: 'Application submitted', t: 'info' }] },
  { id: 'APP-2499', service: 'Record Correction', citizen: 'Sunita Bose', officer: 'Ramesh Kumar', role: 'MRO', submitted: '16 Jan', slaLeft: 4, docs: ['Aadhaar.pdf'], officerNote: 'Verified.', timeline: [{ d: '16 Jan', e: 'Application submitted', t: 'info' }] }
];

const SUPER_SLA_BREACHES = [
  { id: 'APP-2415', service: 'Income Certificate', citizen: 'Venkat Rao', officer: 'Suresh Reddy', overdue: '5 days', on: '20 Jan' },
  { id: 'APP-2389', service: 'Caste Certificate', citizen: 'Lalitha M.', officer: 'Anita Sharma', overdue: '7 days', on: '18 Jan' },
  { id: 'APP-2356', service: 'Income Certificate', citizen: 'Raju Pillai', officer: 'Anita Sharma', overdue: '3 days', on: '22 Jan' },
  { id: 'APP-2341', service: 'Caste Certificate', citizen: 'Uma Shankar', officer: 'Ramesh Kumar', overdue: '4 days', on: '21 Jan' },
  { id: 'APP-2329', service: 'Residence Certificate', citizen: 'Kavya Nair', officer: 'Anita Sharma', overdue: '2 days', on: '23 Jan' },
  { id: 'APP-2301', service: 'Income Certificate', citizen: 'Sanjay Gupta', officer: 'Suresh Reddy', overdue: '9 days', on: '16 Jan' },
];

const SUPER_GRIEVANCES = [
  { id: 'APP-2498', service: 'Caste Certificate', citizen: 'Arjun Mehta', officer: 'Suresh Reddy', subtype: 'Misconduct Complaint', badge: 'badge-danger', go: 'Renu Verma', on: '24', summary: 'Citizen alleges officer requested unofficial payment to expedite processing. Grievance Officer investigated and escalated for supervisor disciplinary action.', officerDecision: 'Application held', urgent: true },
  { id: 'APP-2401', service: 'Welfare Scheme', citizen: 'Gopal Rao', officer: 'Priya Nair', subtype: 'Rejection Dispute', badge: 'badge-warning', go: 'Renu Verma', on: '23', summary: 'Officer rejected citing income ₹1,72,000 exceeds scheme limit. Citizen disputes — claims data entry error (actual income ₹72,000). Grievance Officer unable to resolve independently.', officerDecision: 'Rejected — income limit', urgent: false },
  { id: 'APP-2456', service: 'Record Correction', citizen: 'Sunita Devi', officer: 'Ramesh Kumar', subtype: 'Rejection Dispute', badge: 'badge-warning', go: 'Renu Verma', on: '22', summary: 'DOB mismatch between Aadhaar and certificate. Citizen claims Aadhaar itself has an error — supervisor-level UIDAI cross-verification required.', officerDecision: 'Rejected — DOB mismatch', urgent: false },
  { id: 'APP-2312', service: 'Welfare Scheme', citizen: 'Meena Devi', officer: 'Priya Nair', subtype: 'Repeated Rejection', badge: 'badge-warning', go: 'Renu Verma', on: '20', summary: 'Third application for same scheme within 4 months, all rejected. Grievance Officer flagged pattern for supervisor review before officer issues final rejection.', officerDecision: 'Recommended rejection', urgent: false },
];

const SUPER_TEAM = [
  { name: 'Suresh Reddy', role: 'VRO', initials: 'SR', pending: 28, approved: 14, breach: 2, sla: 91 },
  { name: 'Anita Sharma', role: 'RI', initials: 'AS', pending: 34, approved: 18, breach: 3, sla: 87 },
  { name: 'Ramesh Kumar', role: 'MRO', initials: 'RK', pending: 18, approved: 10, breach: 1, sla: 95 },
  { name: 'Priya Nair', role: 'Welfare Officer', initials: 'PN', pending: 7, approved: 5, breach: 0, sla: 97 },
];

const SUPER_ESC_SLA_CASES = [
  { id: 'APP-2415', type: 'sla', service: 'Income Certificate', citizen: 'Venkat Rao', officer: 'Suresh Reddy', overdue: 5, on: '20 Jan', urgent: true, officerDecision: 'No decision — SLA exceeded', docs: ['Aadhaar Card.pdf', 'Salary Slip.pdf'], summary: 'Officer did not act for 5 days past SLA. Citizen flagged scholarship application deadline.', timeline: [{ d: '13 Jan', e: 'Application submitted', t: 'info' }, { d: '14 Jan', e: 'Assigned to Suresh Reddy', t: 'info' }, { d: '16 Jan', e: 'Officer raised query', t: 'warn' }, { d: '18 Jan', e: 'Citizen responded', t: 'info' }, { d: '20 Jan', e: 'SLA exceeded — no officer action', t: 'danger' }, { d: '25 Jan', e: 'Auto-escalated to supervisor', t: 'danger' }] },
  { id: 'APP-2389', type: 'sla', service: 'Caste Certificate', citizen: 'Lalitha M.', officer: 'Anita Sharma', overdue: 7, on: '18 Jan', urgent: true, officerDecision: 'No decision — SLA exceeded', docs: ['Aadhaar Card.pdf', 'Community Declaration.pdf'], summary: '7 days overdue. Officer raised document dispute on day 3, citizen did not respond. Auto-escalated.', timeline: [{ d: '11 Jan', e: 'Application submitted', t: 'info' }, { d: '12 Jan', e: 'Assigned to Anita Sharma', t: 'info' }, { d: '14 Jan', e: 'Officer disputed document — asked for re-upload', t: 'warn' }, { d: '18 Jan', e: 'SLA exceeded', t: 'danger' }, { d: '25 Jan', e: 'Auto-escalated — 7 days overdue', t: 'danger' }] },
  { id: 'APP-2356', type: 'sla', service: 'Income Certificate', citizen: 'Raju Pillai', officer: 'Anita Sharma', overdue: 3, on: '22 Jan', urgent: false, officerDecision: 'No decision — SLA exceeded', docs: ['Aadhaar Card.pdf'], summary: '3 days overdue. Officer workload flagged as high — 34 pending applications. Auto-escalated.', timeline: [{ d: '22 Jan', e: 'Application submitted', t: 'info' }, { d: '23 Jan', e: 'SLA exceeded', t: 'danger' }] },
  { id: 'APP-2341', type: 'sla', service: 'Caste Certificate', citizen: 'Uma Shankar', officer: 'Ramesh Kumar', overdue: 4, on: '21 Jan', urgent: false, officerDecision: 'No decision — SLA exceeded', docs: ['Aadhaar Card.pdf', 'Community Declaration.pdf'], summary: '4 days overdue. No officer activity recorded since assignment. Auto-escalated.', timeline: [{ d: '21 Jan', e: 'Application submitted', t: 'info' }, { d: '22 Jan', e: 'SLA exceeded', t: 'danger' }] },
  { id: 'APP-2329', type: 'sla', service: 'Residence Certificate', citizen: 'Kavya Nair', officer: 'Anita Sharma', overdue: 2, on: '23 Jan', urgent: false, officerDecision: 'No decision — SLA exceeded', docs: ['Aadhaar Card.pdf', 'Utility Bill.pdf'], summary: '2 days overdue. System escalated after no action taken post-deadline.', timeline: [{ d: '23 Jan', e: 'Application submitted', t: 'info' }, { d: '24 Jan', e: 'SLA exceeded', t: 'danger' }] },
  { id: 'APP-2301', type: 'sla', service: 'Income Certificate', citizen: 'Sanjay Gupta', officer: 'Suresh Reddy', overdue: 9, on: '16 Jan', urgent: true, officerDecision: 'No decision — SLA exceeded', docs: ['Aadhaar Card.pdf', 'Salary Slip.pdf'], summary: '9 days overdue — longest outstanding case. Multiple auto-escalation reminders sent to officer with no response.', timeline: [{ d: '16 Jan', e: 'Application submitted', t: 'info' }, { d: '17 Jan', e: 'SLA exceeded', t: 'danger' }] }
];

const SUPER_ESC_GRIEVANCE_CASES = [
  { id: 'APP-2498', type: 'grievance', subtype: 'Misconduct Complaint', service: 'Caste Certificate', citizen: 'Arjun Mehta', officer: 'Suresh Reddy', on: '24 Jan', urgent: true, officerDecision: 'Application held', docs: ['Aadhaar Card.pdf', 'Community Certificate.pdf'], go: 'Renu Verma', summary: 'Citizen alleges officer requested unofficial payment to expedite application. Grievance Officer investigated and escalated.', timeline: [{ d: '21 Jan', e: 'Application submitted', t: 'info' }, { d: '22 Jan', e: 'Assigned to Suresh Reddy', t: 'info' }, { d: '23 Jan', e: 'Citizen called helpline — reported alleged payment request', t: 'danger' }, { d: '24 Jan', e: 'Grievance Officer escalated to supervisor', t: 'danger' }] },
  { id: 'APP-2401', type: 'grievance', subtype: 'Rejection Dispute', service: 'Welfare Scheme', citizen: 'Gopal Rao', officer: 'Priya Nair', on: '23 Jan', urgent: false, officerDecision: 'Rejected — income limit exceeded', docs: ['Aadhaar Card.pdf', 'Income Certificate.pdf'], go: 'Renu Verma', summary: 'Officer rejected citing income ₹1,72,000 above limit. Citizen disputes — claims data entry error (actual: ₹72,000).', timeline: [{ d: '19 Jan', e: 'Application submitted', t: 'info' }, { d: '20 Jan', e: 'Assigned to Priya Nair', t: 'info' }, { d: '22 Jan', e: 'Officer rejected — income ₹1,72,000 above limit', t: 'danger' }, { d: '23 Jan', e: 'Citizen raised grievance: data entry error claimed', t: 'warn' }, { d: '24 Jan', e: 'Grievance Officer escalated to supervisor', t: 'warn' }] },
  { id: 'APP-2456', type: 'grievance', subtype: 'Rejection Dispute', service: 'Record Correction', citizen: 'Sunita Devi', officer: 'Ramesh Kumar', on: '22 Jan', urgent: false, officerDecision: 'Rejected — DOB mismatch', docs: ['Aadhaar Card.pdf', 'Original Certificate.pdf'], go: 'Renu Verma', summary: 'DOB mismatch between Aadhaar and certificate. Citizen claims Aadhaar itself has an error — requires UIDAI cross-verification.', timeline: [{ d: '18 Jan', e: 'Application submitted', t: 'info' }, { d: '19 Jan', e: 'Assigned to Ramesh Kumar', t: 'info' }, { d: '21 Jan', e: 'Officer rejected — DOB mismatch detected', t: 'danger' }, { d: '22 Jan', e: 'Citizen raised grievance — claims Aadhaar error', t: 'warn' }, { d: '23 Jan', e: 'Grievance Officer escalated to supervisor', t: 'warn' }] },
  { id: 'APP-2312', type: 'grievance', subtype: 'Repeated Rejection', service: 'Welfare Scheme', citizen: 'Meena Devi', officer: 'Priya Nair', on: '20 Jan', urgent: false, officerDecision: 'Recommended rejection', docs: ['Aadhaar Card.pdf', 'Land Records.pdf'], go: 'Renu Verma', summary: 'Third application for same scheme in 4 months, all rejected. Grievance Officer flagged pattern for supervisor review.', timeline: [{ d: '15 Jan', e: 'Application submitted (3rd attempt)', t: 'info' }, { d: '16 Jan', e: 'Assigned to Priya Nair', t: 'info' }, { d: '18 Jan', e: 'Officer recommended rejection — prior rejections cited', t: 'warn' }, { d: '20 Jan', e: 'Grievance Officer escalated for supervisor review', t: 'warn' }] }
];

const SUPER_PENDING_APPS = [
  { id: 'APP-2501', service: 'Income Certificate', citizen: 'Arjun Mehta', officer: 'Anita Sharma', slaLeft: 5 },
  { id: 'APP-2495', service: 'Residence Certificate', citizen: 'Gopal Sharma', officer: 'Anita Sharma', slaLeft: 1 },
  { id: 'APP-2490', service: 'Welfare Scheme', citizen: 'Gopal Rao', officer: 'Anita Sharma', slaLeft: 4 },
  { id: 'APP-2487', service: 'Caste Certificate', citizen: 'Meena Reddy', officer: 'Suresh Reddy', slaLeft: 3 },
  { id: 'APP-2483', service: 'Record Correction', citizen: 'Kiran Bose', officer: 'Anita Sharma', slaLeft: 4 },
  { id: 'APP-2415', service: 'Income Certificate', citizen: 'Venkat Rao', officer: 'Suresh Reddy', slaLeft: -5 },
  { id: 'APP-2389', service: 'Caste Certificate', citizen: 'Lalitha M.', officer: 'Anita Sharma', slaLeft: -7 },
];

export { MOCK_USERS, MOCK_SERVICES, MOCK_APPLICATIONS, MOCK_GRIEVANCES, MOCK_NOTIFICATIONS, MOCK_AUDIT_LOGS, MOCK_PENDING_OFFICERS, OFFICER_QUEUE, OFFICER_QUERIES, OFFICER_ACTIVITY, OFFICER_SLA_RISKS, OFFICER_WEEK_CHART, SUPER_OFFICER_APPROVED, SUPER_SLA_BREACHES, SUPER_GRIEVANCES, SUPER_TEAM, SUPER_ESC_SLA_CASES, SUPER_ESC_GRIEVANCE_CASES, SUPER_PENDING_APPS };
