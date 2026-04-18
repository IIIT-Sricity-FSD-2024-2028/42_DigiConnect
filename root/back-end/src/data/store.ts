import { User } from '../models/user.model';
import { Application } from '../models/application.model';
import { Grievance } from '../models/grievance.model';
import { GovtService } from '../models/service.model';
import { Notification } from '../models/notification.model';
import { Role, AppStatus, GrievanceStatus } from '../models/enums';

// Include basic interfaces here to avoid circular logic for mock shapes
export interface SystemSettings {
  [key: string]: any;
}
export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  role: string;
  date: string;
  details: string;
}
export interface PendingOfficer {
  id: string;
  name: string;
  title: string;
  dept: string;
  jurisdiction: string;
  applied: string;
  docs: string[];
  email: string;
  phone: string;
  services: string[];
}
export interface OfficerQueueItem {
  id: string;
  service: string;
  citizen: string;
  phone: string;
  submitted: string;
  slaLeft: number;
  slaTotal: number;
  status: string;
  aadhaar: string;
  dob: string;
  gender: string;
  address: string;
  income?: string;
  community?: string;
  religion?: string;
  category?: string;
  purpose?: string;
  occupation?: string;
  duration?: string;
  residenceType?: string;
  recordType?: string;
  incorrect?: string;
  correct?: string;
  reason?: string;
  docs: any[];
  history: any[];
  checklist: string[];
  citizenResponse?: string;
}

export const db: {
  users: User[];
  applications: Application[];
  grievances: Grievance[];
  services: GovtService[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  officerQueue: OfficerQueueItem[];
  pendingOfficers: PendingOfficer[];
  settings: SystemSettings;
} = {
  users: [
    { id: 'CIT-001', name: 'Ravi Kumar', role: Role.CITIZEN, email: 'ravi.k@gmail.com', phone: '9876543200', aadhaar: '895421674301', joinedDate: '10 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-' },
    { id: 'CIT-002', name: 'Meena Devi', role: Role.CITIZEN, email: 'meena.d@gmail.com', phone: '9876543201', aadhaar: '895421674302', joinedDate: '12 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-' },
    { id: 'CIT-003', name: 'Gopal Rao', role: Role.CITIZEN, email: 'gopal.r@gmail.com', phone: '9876543202', aadhaar: '895421674303', joinedDate: '15 Jan 2024', status: 'Suspended', dept: '-', jurisdiction: '-' },
    { id: 'CIT-004', name: 'Sunita Verma', role: Role.CITIZEN, email: 'sunita.v@gmail.com', phone: '9876543203', aadhaar: '895421674304', joinedDate: '18 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-' },
    { id: 'CIT-005', name: 'Arun Prasad', role: Role.CITIZEN, email: 'arun.p@gmail.com', phone: '9876543204', aadhaar: '895421674305', joinedDate: '20 Jan 2024', status: 'Active', dept: '-', jurisdiction: '-' },
    { id: 'EMP-001', name: 'Suresh Reddy', role: Role.OFFICER, title: 'VRO', email: 's.reddy@gov.in', phone: '9876543210', aadhaar: '895421675001', joinedDate: '15 Mar 2023', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Secunderabad', services: ['Income Certificate', 'Caste Certificate'] },
    { id: 'EMP-002', name: 'Anita Sharma', role: Role.OFFICER, title: 'RI', email: 'a.sharma@gov.in', phone: '9876543211', aadhaar: '895421675002', joinedDate: '20 Jan 2023', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Hyderabad Central', services: ['Income Certificate', 'Residence Certificate'] },
    { id: 'EMP-003', name: 'Ramesh Kumar', role: Role.SUPERVISOR, title: 'MRO', email: 'r.kumar@gov.in', phone: '9876543212', aadhaar: '895421675003', joinedDate: '10 Jun 2022', status: 'Active', dept: 'Revenue Department', jurisdiction: 'LB Nagar', services: ['Income Certificate', 'Caste Certificate', 'Record Correction'] },
    { id: 'EMP-004', name: 'Priya Nair', role: Role.OFFICER, title: 'Welfare Officer', email: 'p.nair@gov.in', phone: '9876543213', aadhaar: '895421675004', joinedDate: '01 Aug 2022', status: 'Active', dept: 'Welfare Department', jurisdiction: 'All Mandals', services: ['Welfare Scheme', 'Scholarship Application'] },
    { id: 'EMP-005', name: 'Kiran Babu', role: Role.OFFICER, title: 'VRO', email: 'k.babu@gov.in', phone: '9876543214', aadhaar: '895421675005', joinedDate: '05 Nov 2023', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Uppal', services: ['Income Certificate', 'Caste Certificate'] },
    { id: 'SUP-001', name: 'Deepak Verma', role: Role.SUPERVISOR, title: 'Supervisor', email: 'd.verma@gov.in', phone: '9876543220', aadhaar: '895421676001', joinedDate: '01 Jan 2022', status: 'Active', dept: 'Revenue Department', jurisdiction: 'Hyderabad District', services: [] },
    { id: 'SUP-002', name: 'Kavitha Reddy', role: Role.SUPERVISOR, title: 'Supervisor', email: 'k.reddy@gov.in', phone: '9876543221', aadhaar: '895421676002', joinedDate: '15 Feb 2022', status: 'Active', dept: 'Welfare Department', jurisdiction: 'Telangana State', services: [] },
    { id: 'GRV-001', name: 'Nalini Rao', role: Role.GRIEVANCE, title: 'Grievance Officer', email: 'n.rao@gov.in', phone: '9876543230', aadhaar: '895421677001', joinedDate: '10 Mar 2022', status: 'Active', dept: 'Grievance Cell', jurisdiction: 'Hyderabad', services: [] },
    { id: 'GRV-002', name: 'Srinivas Goud', role: Role.GRIEVANCE, title: 'Grievance Officer', email: 's.goud@gov.in', phone: '9876543231', aadhaar: '895421677002', joinedDate: '20 Apr 2022', status: 'Pending', dept: 'Grievance Cell', jurisdiction: 'Warangal', services: [] },
    { id: 'ADM-001', name: 'Super User', role: Role.SUPER_USER, title: 'Super User', email: 'superuser@gov.in', phone: '9876543299', aadhaar: '895421678001', joinedDate: '01 Jan 2020', status: 'Active', dept: 'IT Admin', jurisdiction: 'All', services: [] }
  ],
  applications: [
    {
      id: 'APP-1001', serviceId: 'SVC-001', serviceName: 'Income Certificate', serviceType: 'certificate',
      citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Revenue Department', status: AppStatus.APPROVED, submittedDate: '2023-11-10', slaDate: '2023-11-17',
      fee: 50, paymentStatus: 'paid', remarks: 'Approved.',
      timeline: [
        { action: 'Application Submitted', date: '2023-11-10T09:00:00', actor: 'Ravi Kumar', note: 'Application received.' },
        { action: 'Certificate Issued', date: '2023-11-15T11:00:00', actor: 'System', note: 'Certificate available for download.' }
      ],
      documents: [{ name: 'Aadhaar_Card.pdf', type: 'Identity Proof', date: '2023-11-10', status: 'verified' }]
    },
    {
      id: 'APP-1002', serviceId: 'SVC-003', serviceName: 'Residence Certificate', serviceType: 'certificate',
      citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Revenue Department', status: AppStatus.COMPLETED, submittedDate: '2023-10-05', slaDate: '2023-10-12',
      fee: 30, paymentStatus: 'paid', remarks: 'Completed.',
      timeline: [
        { action: 'Application Submitted', date: '2023-10-05T09:00:00', actor: 'Ravi Kumar', note: 'Application received.' },
        { action: 'Service Completed', date: '2023-10-10T11:00:00', actor: 'System', note: 'Service delivered.' }
      ],
      documents: [{ name: 'Electricity_Bill.pdf', type: 'Address Proof', date: '2023-10-05', status: 'verified' }]
    },
    {
      id: 'APP-2488', serviceId: 'SVC-002', serviceName: 'Caste Certificate', serviceType: 'certificate',
      citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Revenue Department', status: AppStatus.ESCALATED, submittedDate: '2025-01-10', slaDate: '2025-01-17',
      fee: 50, paymentStatus: 'paid', remarks: 'Under verification delayed.',
      timeline: [
        { action: 'Application Submitted', date: '2025-01-10T09:00:00', actor: 'Ravi Kumar', note: 'Citizen submitted application.' },
        { action: 'Under Verification', date: '2025-01-12T14:30:00', actor: 'Suresh Reddy', note: 'Application delayed at officer review stage.' }
      ],
      documents: [{ name: 'Aadhaar.pdf', type: 'ID', date: '2025-01-10', status: 'verified' }]
    },
    {
      id: 'APP-2456', serviceId: 'SVC-001', serviceName: 'Income Certificate', serviceType: 'certificate',
      citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Revenue Department', status: AppStatus.APPROVED, submittedDate: '2025-01-15', slaDate: '2025-01-22',
      fee: 50, paymentStatus: 'paid', remarks: 'All documents verified. Certificate issued.',
      timeline: [
        { action: 'Application Submitted', date: '2025-01-15T10:30:00', actor: 'Ravi Kumar', note: 'Application received.' },
        { action: 'Payment Confirmed', date: '2025-01-15T10:31:00', actor: 'System', note: '₹50 via UPI. TXN: TXN8847291' },
      ],
      documents: [{ name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-15', status: 'verified' }]
    },
    {
      id: 'APP-2489', serviceId: 'SVC-002', serviceName: 'Caste Certificate', serviceType: 'certificate',
      citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Revenue Department', status: AppStatus.QUERY, submittedDate: '2026-03-21', slaDate: '2026-04-04',
      fee: 50, paymentStatus: 'paid', remarks: 'Query raised.',
      timeline: [
        { action: 'Application Submitted', date: '2026-03-21T10:15:00', actor: 'Ravi Kumar', note: 'Application received.' },
      ],
      documents: [{ name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-20', status: 'verified' }]
    },
    {
      id: 'APP-2398', serviceId: 'SVC-004', serviceName: 'PM Kisan Welfare Scheme', serviceType: 'welfare',
      citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-002', officerName: 'Anita Sharma',
      dept: 'Welfare Department', status: AppStatus.APPROVED, submittedDate: '2024-12-05', slaDate: '2024-12-19',
      fee: 0, paymentStatus: 'waived', remarks: 'Approved. First installment credited.',
      timeline: [
        { action: 'Application Submitted', date: '2024-12-05T09:00:00', actor: 'Ravi Kumar', note: 'Application received.' }
      ],
      documents: [{ name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2024-12-05', status: 'verified' }]
    },
    {
      id: 'APP-2301', serviceId: 'SVC-006', serviceName: 'Event Permission', serviceType: 'permission',
      citizenId: 'CIT-002', citizenName: 'Meena Devi', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Municipal Corporation', status: AppStatus.REJECTED, submittedDate: '2024-11-10', slaDate: '2024-11-15',
      fee: 200, paymentStatus: 'paid', remarks: 'Rejected - venue in restricted zone.',
      timeline: [
        { action: 'Application Submitted', date: '2024-11-10T10:00:00', actor: 'Meena Devi', note: 'Application submitted.' }
      ],
      documents: [{ name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2024-11-10', status: 'verified' }]
    },
    {
      id: 'APP-2490', serviceId: 'SVC-001', serviceName: 'Income Certificate', serviceType: 'certificate',
      citizenId: 'CIT-003', citizenName: 'Gopal Rao', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Revenue Department', status: AppStatus.UNDER_REVIEW, submittedDate: '2025-01-22', slaDate: '2025-01-29',
      fee: 50, paymentStatus: 'paid', remarks: '',
      timeline: [
        { action: 'Application Submitted', date: '2025-01-22T09:00:00', actor: 'Gopal Rao', note: 'Application submitted online.' }
      ],
      documents: [{ name: 'Aadhaar_Card.pdf', type: 'Identity Proof', date: '2025-01-22', status: 'verified' }]
    },
    {
      id: 'APP-2399', serviceId: 'SVC-004', serviceName: 'Welfare / Subsidy Scheme', serviceType: 'welfare',
      citizenId: 'CIT-004', citizenName: 'Sunita Verma', officerId: 'EMP-004', officerName: 'Priya Nair',
      dept: 'Welfare Department', status: AppStatus.UNDER_REVIEW, submittedDate: '2025-01-10', slaDate: '2025-01-24',
      fee: 0, paymentStatus: 'waived', remarks: '',
      timeline: [{ action: 'Application Submitted', date: '2025-01-10T10:00:00', actor: 'Sunita Verma', note: 'Application received.' }],
      documents: [{ name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-10', status: 'verified' }]
    },
    {
      id: 'APP-2510', serviceId: 'SVC-003', serviceName: 'Residence Certificate', serviceType: 'certificate',
      citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'EMP-001', officerName: 'Suresh Reddy',
      dept: 'Revenue Department', status: AppStatus.UNDER_REVIEW, submittedDate: '2026-03-11', slaDate: '2026-04-04',
      fee: 30, paymentStatus: 'paid', remarks: 'Under officer review.',
      timeline: [{ action: 'Application Submitted', date: '2026-03-11T09:00:00', actor: 'Ravi Kumar', note: 'Application received.' }],
      documents: [{ name: 'Aadhaar Card.pdf', type: 'Identity Proof', date: '2025-01-25', status: 'verified' }]
    },
    {
      id: 'APP-2254', serviceId: 'SVC-007', serviceName: 'Vendor License', serviceType: 'permission',
      citizenId: 'CIT-002', citizenName: 'Meena Devi', officerId: 'EMP-003', officerName: 'Ramesh Kumar',
      dept: 'Municipal Corporation', status: AppStatus.APPROVED, submittedDate: '2024-11-20', slaDate: '2024-11-27',
      fee: 500, paymentStatus: 'paid', remarks: 'Approved after grievance resolution.',
      timeline: [{ action: 'Application Submitted', date: '2024-11-20T10:00:00', actor: 'Meena Devi', note: 'New vendor license requested.' }],
      documents: [{ name: 'Aadhaar_Card.pdf', type: 'Identity Proof', date: '2024-11-20', status: 'verified' }]
    }
  ],
  services: [
    { id: 'SVC-001', name: 'Income Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 50, desc: 'Certificate proving annual family income.', docs: ['Aadhaar Card', 'Ration Card', 'Salary Slip / Income Proof'], stages: 3, status: 'Active', apps: 892 },
    { id: 'SVC-002', name: 'Caste Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 50, desc: 'Official certificate proving caste for reservations.', docs: ['Aadhaar Card', 'Ration Card', 'Father\'s Caste Certificate', 'School Certificate'], stages: 3, status: 'Active', apps: 674 },
    { id: 'SVC-003', name: 'Residence Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 30, desc: 'Proof of domicile / residence.', docs: ['Aadhaar Card', 'Electricity Bill / Rent Agreement'], stages: 3, status: 'Active', apps: 408 },
    { id: 'SVC-004', name: 'Welfare / Subsidy Scheme', cat: 'Welfare', dept: 'Welfare Department', sla: 14, fee: 0, desc: 'Direct income support under PM Kisan.', docs: ['Aadhaar Card', 'Land Records', 'Bank Passbook', 'Income Certificate', 'Affidavit'], stages: 4, status: 'Active', apps: 521 },
    { id: 'SVC-005', name: 'Scholarship Application', cat: 'Welfare', dept: 'Welfare Department', sla: 21, fee: 0, desc: 'Post-matric scholarship for SC/ST/OBC.', docs: ['Aadhaar Card', 'Income Certificate', 'Caste Certificate', 'Mark Sheets', 'Bank Passbook', 'Fee Receipt'], stages: 4, status: 'Active', apps: 134 },
    { id: 'SVC-006', name: 'Event Permission', cat: 'Permission', dept: 'Municipal Corporation', sla: 5, fee: 200, desc: 'Permission for public events or gatherings.', docs: ['Aadhaar Card', 'Event Detail Letter', 'Venue Proof'], stages: 2, status: 'Active', apps: 287 },
    { id: 'SVC-007', name: 'Vendor License', cat: 'Permission', dept: 'Municipal Corporation', sla: 7, fee: 500, desc: 'License to operate a shop or business.', docs: ['Aadhaar Card', 'Shop Photo', 'Ownership/Rent Agreement', 'NOC from Landlord'], stages: 3, status: 'Active', apps: 156 },
    { id: 'SVC-008', name: 'Record Correction', cat: 'Correction', dept: 'Revenue Department', sla: 10, fee: 100, desc: 'Correction of name in official records.', docs: ['Aadhaar Card', 'Gazette Notification/Affidavit', 'Original Record'], stages: 3, status: 'Active', apps: 186 },
    { id: 'SVC-009', name: 'Marriage Certificate', cat: 'Certificate', dept: 'Revenue Department', sla: 7, fee: 50, desc: 'Official certificate proving marriage.', docs: ['Aadhaar Card', 'Marriage Invitation', 'Photos', 'Affidavit'], stages: 3, status: 'Draft', apps: 0 },
    { id: 'SVC-010', name: 'Death Certificate', cat: 'Certificate', dept: 'Municipal Corporation', sla: 3, fee: 20, desc: 'Official certificate for registering death.', docs: ['Aadhaar Card', 'Hospital Record'], stages: 2, status: 'Inactive', apps: 0 },
  ],
  grievances: [
    {
      id: 'GRV-051', citizenId: 'CIT-001', citizenName: 'Ravi Kumar', officerId: 'GRV-001', officerName: 'Nalini Rao',
      category: 'delay', subject: 'Caste Certificate delayed for 12 days', description: 'My application has been stuck.',
      relatedAppId: 'APP-2488', status: GrievanceStatus.OPEN, priority: 'high', slaStatus: 'breach',
      filedDate: '2025-01-28', lastUpdated: '2025-01-28',
      history: [{ action: 'Grievance Raised', date: '2025-01-28T10:00:00', actor: 'Ravi Kumar', note: 'Citizen raised grievance due to delay.' }]
    },
    {
      id: 'GRV-049', citizenId: 'CIT-002', citizenName: 'Meena Devi', officerId: 'GRV-001', officerName: 'Nalini Rao',
      category: 'delay', subject: 'Event permission pending 28 days — event is next week', description: 'I applied for event permission 28 days ago.',
      relatedAppId: 'APP-2301', status: GrievanceStatus.INVESTIGATING, priority: 'high', slaStatus: 'breach',
      filedDate: '2025-01-20', lastUpdated: '2025-01-25',
      history: [{ action: 'Grievance Filed', date: '2025-01-20T09:00:00', actor: 'Meena Devi', note: 'Event permission pending 23 days past SLA.' }]
    },
    {
      id: 'GRV-047', citizenId: 'CIT-003', citizenName: 'Gopal Rao', officerId: 'GRV-001', officerName: 'Nalini Rao',
      category: 'misconduct', subject: 'Officer demanded informal payment for processing', description: 'When I visited the Revenue Office... ',
      relatedAppId: 'APP-2490', status: GrievanceStatus.OPEN, priority: 'high', slaStatus: 'breach',
      filedDate: '2025-01-18', lastUpdated: '2025-01-18',
      history: [{ action: 'Grievance Filed', date: '2025-01-18T16:00:00', actor: 'Gopal Rao', note: 'Formal bribery allegation.' }]
    },
    {
      id: 'GRV-046', citizenId: 'CIT-004', citizenName: 'Sunita Verma', officerId: 'GRV-001', officerName: 'Nalini Rao',
      category: 'misconduct', subject: 'Repeated harassment at Welfare Department office', description: 'I have been to the Welfare Department five times.',
      relatedAppId: 'APP-2399', status: GrievanceStatus.ESCALATED, priority: 'high', slaStatus: 'breach',
      filedDate: '2025-01-10', lastUpdated: '2025-01-26',
      history: [{ action: 'Grievance Filed', date: '2025-01-10T10:00:00', actor: 'Sunita Verma', note: 'Complaint about repeated demands.' }]
    },
    {
      id: 'GRV-045', citizenId: 'CIT-005', citizenName: 'Arun Prasad', officerId: 'EMP-004', officerName: 'Priya Nair',
      category: 'delay', subject: 'Income certificate delayed by 15 days past SLA', description: 'Income certificate application pending.',
      relatedAppId: 'APP-2415', status: GrievanceStatus.RESOLVED, priority: 'medium', slaStatus: 'warn',
      filedDate: '2025-01-05', lastUpdated: '2025-01-12',
      history: [{ action: 'Grievance Filed', date: '2025-01-05T09:00:00', actor: 'Arun Prasad', note: 'Delay in income certificate.' }]
    },
    {
      id: 'GRV-042', citizenId: 'CIT-003', citizenName: 'Gopal Rao', officerId: 'EMP-004', officerName: 'Priya Nair',
      category: 'rejection', subject: 'Bribery allegation — no evidence found', description: 'Citizen claimed officer demanded payment.',
      relatedAppId: 'APP-2101', status: GrievanceStatus.REJECTED, priority: 'medium', slaStatus: 'safe',
      filedDate: '2024-12-01', lastUpdated: '2024-12-09',
      history: [{ action: 'Grievance Filed', date: '2024-12-01T14:00:00', actor: 'Gopal Rao', note: 'Bribery allegation.' }]
    },
    {
      id: 'GRV-038', citizenId: 'CIT-4421', citizenName: 'Gopal Rao', officerId: 'EMP-004', officerName: 'Priya Nair',
      category: 'delay', subject: 'Event permission SLA breached — escalated to Supervisor', description: 'Event permission application pending 45 days.',
      relatedAppId: 'APP-2301', status: GrievanceStatus.ESCALATED_RESOLVED, priority: 'high', slaStatus: 'breach',
      filedDate: '2024-09-12', lastUpdated: '2024-09-22',
      history: [{ action: 'Grievance Filed', date: '2024-09-12T09:00:00', actor: 'Gopal Rao', note: 'SLA breached by 15 days.' }]
    }
  ],
  notifications: [
    { id: 'NOT-001', userId: 'CIT-001', title: 'Application Approved!', message: 'Your Income Certificate has been approved.', type: 'success', read: false, date: '2025-01-18T09:45:00' },
    { id: 'NOT-002', userId: 'CIT-001', title: 'Query Raised', message: 'Officer has requested additional documents.', type: 'warning', read: false, date: '2025-01-23T11:00:00' },
    { id: 'NOT-003', userId: 'CIT-001', title: 'New Scheme Available', message: 'PM Kisan Scholarship 2025 applications are now open.', type: 'info', read: false, date: '2025-01-20T08:00:00' },
    { id: 'NOT-004', userId: 'EMP-001', title: 'New Application Assigned', message: 'Residence Certificate application assigned to you.', type: 'info', read: false, date: '2025-01-25T09:05:00' },
    { id: 'NOT-005', userId: 'EMP-002', title: 'SLA Breach Warning', message: 'Application APP-2489 is approaching SLA deadline.', type: 'warning', read: false, date: '2025-01-25T08:00:00' },
    { id: 'NOT-006', userId: 'EMP-004', title: 'New Grievance Assigned', message: 'Grievance GRV-051 assigned to you.', type: 'info', read: false, date: '2025-01-28T10:05:00' },
    { id: 'NOT-007', userId: 'EMP-004', title: 'SLA Breach Alert', message: 'Grievance GRV-048 has breached SLA.', type: 'danger', read: false, date: '2025-01-25T08:00:00' },
  ],
  auditLogs: [
    { id: 'LOG-001', action: 'User Login', actor: 'admin@DigiConnect.com', role: 'admin', date: '2025-01-25T08:00:00', details: 'Admin logged in.' },
    { id: 'LOG-002', action: 'Service Created', actor: 'admin@DigiConnect.com', role: 'admin', date: '2025-01-24T14:00:00', details: 'Added new service: Birth Certificate.' },
    { id: 'LOG-003', action: 'Application Approved', actor: 'officer1@DigiConnect.com', role: 'officer', date: '2025-01-18T09:45:00', details: 'Approved APP-2456.' },
    { id: 'LOG-004', action: 'Grievance Filed', actor: 'citizen1@DigiConnect.com', role: 'citizen', date: '2025-01-22T14:00:00', details: 'Filed GRV-048 regarding delay.' },
    { id: 'LOG-005', action: 'Officer Onboarded', actor: 'admin@DigiConnect.com', role: 'admin', date: '2025-01-20T10:00:00', details: 'Onboarded new officer: Deepak Menon.' },
    { id: 'LOG-006', action: 'Grievance Escalated', actor: 'grievance@DigiConnect.com', role: 'grievance', date: '2025-01-26T14:00:00', details: 'GRV-046 escalated to Dept. Supervisor.' },
    { id: 'LOG-007', action: 'Grievance Resolved', actor: 'grievance@DigiConnect.com', role: 'grievance', date: '2025-01-12T16:00:00', details: 'GRV-045 resolved.' },
  ],
  pendingOfficers: [
    { id: 'EMP-039', name: 'Vijay Teja', title: 'VRO', dept: 'Revenue Department', jurisdiction: 'Malkajgiri', applied: '24 Jan 2025', docs: ['Employee ID', 'Appointment Order'], email: 'v.teja@gov.in', phone: '9876549901', services: ['Income Certificate'] },
    { id: 'EMP-040', name: 'Lakshmi Devi', title: 'Welfare Officer', dept: 'Welfare Department', jurisdiction: 'Warangal', applied: '25 Jan 2025', docs: ['Employee ID', 'Training Certificate'], email: 'l.devi@gov.in', phone: '9876549902', services: ['Welfare / Subsidy Scheme'] },
    { id: 'EMP-041', name: 'Arjun Reddy', title: 'RI', dept: 'Revenue Department', jurisdiction: 'Karimnagar', applied: '26 Jan 2025', docs: ['Employee ID', 'Appointment Order', 'NOC'], email: 'a.reddy@gov.in', phone: '9876549903', services: ['Caste Certificate'] },
  ],
  officerQueue: [
    {
      id: 'APP-2501', service: 'Income Certificate', citizen: 'Arjun Mehta', phone: '9876540001', submitted: '23 Jan 2025', slaLeft: 5, slaTotal: 7, status: 'new', aadhaar: 'XXXX XXXX 7721', dob: '12 Mar 1989', gender: 'Male', address: '15-2-301, Malakpet, Hyderabad – 500036', income: '1,60,000', purpose: 'Scholarship Application', occupation: 'Salaried – IT Sector', docs: [{ name: 'Aadhaar_Card.pdf', size: '310 KB', type: 'Identity Proof', icon: 'pdf' }], history: [{ label: 'Application Submitted', ts: '23 Jan 2025', detail: 'Submitted online.', dot: 'submitted' }], checklist: ['Identity verified']
    }
  ],
  settings: {
    maintenanceMode: false,
    autoAssign: true
  }
};
