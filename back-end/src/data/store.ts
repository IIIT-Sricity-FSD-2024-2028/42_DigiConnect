import { User } from '../models/user.model';
import { Application } from '../models/application.model';
import { Grievance } from '../models/grievance.model';
import { GovtService } from '../models/service.model';
import { Notification } from '../models/notification.model';
import { Role, AppStatus, GrievanceStatus } from '../models/enums';

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
  ip?: string;
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

// ═══════════════════════════════════════════
// mock-data.js — Pre-populate localStorage with mock data
// ═══════════════════════════════════════════

const MOCK_USERS = [
  {
    "id": "ADM-1001",
    "name": "Super User",
    "role": "super_user",
    "title": "Super User",
    "email": "superuser@gov.in",
    "phone": "9876543299",
    "aadhaar": "895421678001",
    "joined": "01 Jan 2020",
    "status": "Active",
    "dept": "IT Admin",
    "jurisdiction": "All",
    "password": "password123",
    "services": [],
    "cases": 0,
    "sla": 100,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "IT Secretariat, Masab Tank",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Masab Tank",
    "pincode": "500028",
    "dob": "1975-06-01",
    "gender": "Male"
  },
  {
    "id": "CIT-1001",
    "name": "Ravi Kumar",
    "role": "citizen",
    "email": "ravi.k@gmail.com",
    "phone": "9876543200",
    "aadhaar": "895421674301",
    "joined": "10 Jan 2024",
    "status": "Active",
    "dept": "-",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Plot 45, MG Road",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1985-04-12",
    "gender": "Male"
  },
  {
    "id": "CIT-1002",
    "name": "Sunita Verma",
    "role": "citizen",
    "email": "sunita.v@gmail.com",
    "phone": "9876543203",
    "aadhaar": "895421674304",
    "joined": "18 Jan 2024",
    "status": "Active",
    "dept": "-",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Street 4, Tarnaka",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500017",
    "dob": "1988-02-14",
    "gender": "Female"
  },
  {
    "id": "CIT-1003",
    "name": "Kaveri Devi",
    "role": "citizen",
    "email": "kaveri.d@gmail.com",
    "phone": "9876543209",
    "aadhaar": "895421674310",
    "joined": "05 Feb 2024",
    "status": "Active",
    "dept": "-",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1985-09-05",
    "gender": "Female"
  },
  {
    "id": "GRV-1001",
    "name": "Nalini Rao",
    "role": "grievance",
    "title": "Grievance Officer",
    "email": "n.rao@gov.in",
    "phone": "9876543230",
    "aadhaar": "895421677001",
    "joined": "10 Mar 2022",
    "status": "Active",
    "dept": "Grievance Cell",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [],
    "cases": 0,
    "sla": 100,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1986-08-25",
    "gender": "Female"
  },
  {
    "id": "SUP-1001",
    "name": "Deepak Verma",
    "role": "supervisor",
    "title": "MRO",
    "email": "d.verma@gov.in",
    "phone": "9876543220",
    "aadhaar": "895421676001",
    "joined": "01 Jan 2022",
    "status": "Active",
    "dept": "Revenue Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [],
    "cases": 0,
    "sla": 100,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1980-09-30",
    "gender": "Male"
  },
  {
    "id": "EMP-1001",
    "name": "Suresh Reddy",
    "role": "officer",
    "title": "VRO",
    "email": "s.reddy@gov.in",
    "phone": "9876543210",
    "aadhaar": "895421675001",
    "joined": "15 Mar 2023",
    "status": "Active",
    "dept": "Revenue Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Income Certificate",
      "Caste Certificate",
      "Residence Certificate",
      "Record Correction"
    ],
    "cases": 28,
    "sla": 91,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1988-06-15",
    "gender": "Male"
  },
  {
    "id": "EMP-1002",
    "name": "Anita Sharma",
    "role": "officer",
    "title": "VRO",
    "email": "a.sharma@gov.in",
    "phone": "9876543211",
    "aadhaar": "895421675002",
    "joined": "20 Jan 2023",
    "status": "Active",
    "dept": "Revenue Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Income Certificate",
      "Caste Certificate",
      "Residence Certificate",
      "Record Correction"
    ],
    "cases": 34,
    "sla": 87,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1990-03-22",
    "gender": "Female"
  },
  {
    "id": "EMP-1003",
    "name": "Ravi Teja",
    "role": "officer",
    "title": "VRO",
    "email": "r.teja@gov.in",
    "phone": "9876543240",
    "aadhaar": "895421675007",
    "joined": "10 Jan 2024",
    "status": "Active",
    "dept": "Revenue Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Income Certificate",
      "Caste Certificate",
      "Residence Certificate",
      "Record Correction"
    ],
    "cases": 15,
    "sla": 90,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1995-01-01",
    "gender": "Male"
  },
  {
    "id": "SUP-1002",
    "name": "Kavitha Reddy",
    "role": "supervisor",
    "title": "DWO",
    "email": "k.reddy@gov.in",
    "phone": "9876543221",
    "aadhaar": "895421676002",
    "joined": "15 Feb 2022",
    "status": "Active",
    "dept": "Welfare Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [],
    "cases": 0,
    "sla": 100,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1982-04-12",
    "gender": "Female"
  },
  {
    "id": "EMP-1004",
    "name": "Priya Nair",
    "role": "officer",
    "title": "Welfare Officer",
    "email": "p.nair@gov.in",
    "phone": "9876543213",
    "aadhaar": "895421675004",
    "joined": "01 Aug 2022",
    "status": "Active",
    "dept": "Welfare Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Welfare / Subsidy Scheme",
      "Scholarship Application"
    ],
    "cases": 22,
    "sla": 93,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1992-07-04",
    "gender": "Female"
  },
  {
    "id": "EMP-1005",
    "name": "Kiran Babu",
    "role": "officer",
    "title": "Welfare Officer",
    "email": "k.babu@gov.in",
    "phone": "9876543214",
    "aadhaar": "895421675005",
    "joined": "05 Nov 2023",
    "status": "Active",
    "dept": "Welfare Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Welfare / Subsidy Scheme",
      "Scholarship Application"
    ],
    "cases": 31,
    "sla": 88,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1993-02-17",
    "gender": "Male"
  },
  {
    "id": "EMP-1006",
    "name": "Aruna Kumari",
    "role": "officer",
    "title": "Welfare Officer",
    "email": "a.kumari@gov.in",
    "phone": "9876543246",
    "aadhaar": "895421675013",
    "joined": "25 Jan 2024",
    "status": "Active",
    "dept": "Welfare Department",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Welfare / Subsidy Scheme",
      "Scholarship Application"
    ],
    "cases": 25,
    "sla": 94,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1989-07-07",
    "gender": "Female"
  },
  {
    "id": "SUP-1003",
    "name": "Lakshmi Narayana",
    "role": "supervisor",
    "title": "Zonal Commissioner",
    "email": "l.narayana@gov.in",
    "phone": "9876543222",
    "aadhaar": "895421676003",
    "joined": "22 May 2021",
    "status": "Active",
    "dept": "Municipal Corporation",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [],
    "cases": 0,
    "sla": 100,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1978-12-05",
    "gender": "Male"
  },
  {
    "id": "EMP-1007",
    "name": "Mohan Das",
    "role": "officer",
    "title": "Sanitary Inspector",
    "email": "m.das@gov.in",
    "phone": "9876543215",
    "aadhaar": "895421675006",
    "joined": "10 Feb 2023",
    "status": "Active",
    "dept": "Municipal Corporation",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Event Permission",
      "Vendor License",
      "Death Certificate"
    ],
    "cases": 14,
    "sla": 92,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1991-05-20",
    "gender": "Male"
  },
  {
    "id": "EMP-1008",
    "name": "Praveen Kumar",
    "role": "officer",
    "title": "Sanitary Inspector",
    "email": "p.kumar@gov.in",
    "phone": "9876543254",
    "aadhaar": "895421675021",
    "joined": "01 Mar 2024",
    "status": "Active",
    "dept": "Municipal Corporation",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Event Permission",
      "Vendor License",
      "Death Certificate"
    ],
    "cases": 10,
    "sla": 98,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1995-03-15",
    "gender": "Male"
  },
  {
    "id": "EMP-1009",
    "name": "Rekha Singh",
    "role": "officer",
    "title": "Sanitary Inspector",
    "email": "r.singh@gov.in",
    "phone": "9876543255",
    "aadhaar": "895421675022",
    "joined": "05 Mar 2024",
    "status": "Active",
    "dept": "Municipal Corporation",
    "jurisdiction": "Secunderabad",
    "password": "password123",
    "services": [
      "Event Permission",
      "Vendor License",
      "Death Certificate"
    ],
    "cases": 11,
    "sla": 96,
    "securityQuestion": "In what city were you born?",
    "securityAnswer": "Hyderabad",
    "address": "Secunderabad",
    "state": "Telangana",
    "district": "Hyderabad",
    "mandal": "Secunderabad",
    "pincode": "500003",
    "dob": "1994-04-16",
    "gender": "Female"
  }
];

const MOCK_PENDING_OFFICERS = [
  { id: 'EMP-039', name: 'Vijay Teja', title: 'VRO', dept: 'Revenue Department', jurisdiction: 'Malkajgiri', applied: '24 Jan 2025', docs: ['Employee ID', 'Appointment Order'], email: 'v.teja@gov.in', phone: '9876549901', services: ['Income Certificate'] },
  { id: 'EMP-040', name: 'Lakshmi Devi', title: 'Welfare Officer', dept: 'Welfare Department', jurisdiction: 'Warangal', applied: '25 Jan 2025', docs: ['Employee ID', 'Training Certificate'], email: 'l.devi@gov.in', phone: '9876549902', services: ['Welfare / Subsidy Scheme'] },
  { id: 'EMP-041', name: 'Arjun Reddy', title: 'VRO', dept: 'Revenue Department', jurisdiction: 'Karimnagar', applied: '26 Jan 2025', docs: ['Employee ID', 'Appointment Order', 'NOC'], email: 'a.reddy@gov.in', phone: '9876549903', services: ['Caste Certificate'] },
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

const MOCK_WORKFLOW_CONFIG = [
  {
    id: 1,
    service: 'Income Certificate',
    dept: 'Revenue Department',
    status: 'Active',
    stages: [
      { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
      { name: 'Field Verification', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
      { name: 'Final Approval', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
    ]
  },
  {
    id: 2,
    service: 'Caste Certificate',
    dept: 'Revenue Department',
    status: 'Active',
    stages: [
      { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
      { name: 'Field Verification', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
      { name: 'Final Approval', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
    ]
  },
  {
    id: 3,
    service: 'Residence Certificate',
    dept: 'Revenue Department',
    status: 'Active',
    stages: [
      { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
      { name: 'Field Verification', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
      { name: 'Final Approval', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
    ]
  },
  {
    id: 4,
    service: 'Welfare / Subsidy Scheme',
    dept: 'Welfare Department',
    status: 'Active',
    stages: [
      { name: 'Eligibility Check', role: 'Welfare Officer', days: 3, type: 'officer' },
      { name: 'Document Verification', role: 'Welfare Officer', days: 3, type: 'officer' },
      { name: 'Field Verification', role: 'Dept. Officer (RI)', days: 4, type: 'officer' },
      { name: 'Final Approval & Disbursement', role: 'Dept. Supervisor (MRO)', days: 4, type: 'supervisor' },
    ]
  },
  {
    id: 5,
    service: 'Scholarship Application',
    dept: 'Welfare Department',
    status: 'Active',
    stages: [
      { name: 'Eligibility Screening', role: 'Welfare Officer', days: 5, type: 'officer' },
      { name: 'Document Review', role: 'Welfare Officer', days: 5, type: 'officer' },
      { name: 'Institute Verification', role: 'Dept. Officer (RI)', days: 5, type: 'officer' },
      { name: 'Scholarship Approval', role: 'Dept. Supervisor (MRO)', days: 6, type: 'supervisor' },
    ]
  },
  {
    id: 6,
    service: 'Event Permission',
    dept: 'Municipal Corporation',
    status: 'Active',
    stages: [
      { name: 'Application Review', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
      { name: 'Approval & Issue', role: 'Dept. Supervisor (MRO)', days: 3, type: 'supervisor' },
    ]
  },
  {
    id: 7,
    service: 'Vendor License',
    dept: 'Municipal Corporation',
    status: 'Active',
    stages: [
      { name: 'Application Review', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
      { name: 'Premises Inspection', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
      { name: 'License Approval', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
    ]
  },
  {
    id: 8,
    service: 'Record Correction',
    dept: 'Revenue Department',
    status: 'Active',
    stages: [
      { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 3, type: 'officer' },
      { name: 'Gazette Verification', role: 'Dept. Officer (RI)', days: 4, type: 'officer' },
      { name: 'Record Update Approval', role: 'Dept. Supervisor (MRO)', days: 3, type: 'supervisor' },
    ]
  },
  {
    id: 9,
    service: 'Marriage Certificate',
    dept: 'Revenue Department',
    status: 'Draft',
    stages: [
      { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
      { name: 'Witness Verification', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
      { name: 'Certificate Approval', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
    ]
  },
  {
    id: 10,
    service: 'Death Certificate',
    dept: 'Municipal Corporation',
    status: 'Inactive',
    stages: [
      { name: 'Hospital Record Verification', role: 'Dept. Officer (VRO)', days: 1, type: 'officer' },
      { name: 'Certificate Issuance', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
    ]
  },
];

const MOCK_APPLICATIONS = [
  {
    "id": "APP-1001",
    "serviceId": "SVC-001",
    "serviceName": "Income Certificate",
    "serviceType": "certificate",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1001",
    "officerName": "Suresh Reddy",
    "dept": "Revenue Department",
    "status": "completed",
    "remarks": "All verified.",
    "fee": 50,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Aadhaar Card.pdf",
        "type": "Identity Proof",
        "date": "2026-04-20T09:00:00.000Z",
        "status": "verified"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-04-20T09:00:00.000Z",
        "actor": "Ravi Kumar",
        "note": ""
      },
      {
        "action": "Status updated to approved",
        "date": "2026-04-22T09:00:00.000Z",
        "actor": "Suresh Reddy",
        "note": "Approved"
      },
      {
        "action": "Supervisor Final Approval",
        "date": "2026-04-23T09:00:00.000Z",
        "actor": "Deepak Verma",
        "note": "Certificate Generated"
      },
      {
        "action": "Certificate Generated",
        "date": "2026-04-23T09:00:00.000Z",
        "actor": "System",
        "note": ""
      }
    ],
    "submittedDate": "2026-04-20T09:00:00.000Z",
    "slaDate": "2026-04-27T09:00:00.000Z"
  },
  {
    "id": "APP-1002",
    "serviceId": "SVC-005",
    "serviceName": "Scholarship Application",
    "serviceType": "welfare",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1004",
    "officerName": "Priya Nair",
    "dept": "Welfare Department",
    "status": "rejected",
    "remarks": "Income exceeds limit for scholarship.",
    "fee": 0,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Income Cert.pdf",
        "type": "Income Proof",
        "date": "2026-04-22T09:00:00.000Z",
        "status": "verified"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-04-22T09:00:00.000Z",
        "actor": "Ravi Kumar",
        "note": ""
      },
      {
        "action": "Status updated to rejected",
        "date": "2026-04-24T09:00:00.000Z",
        "actor": "Priya Nair",
        "note": "Income exceeds limit."
      }
    ],
    "submittedDate": "2026-04-22T09:00:00.000Z",
    "slaDate": "2026-05-13T09:00:00.000Z"
  },
  {
    "id": "APP-1003",
    "serviceId": "SVC-006",
    "serviceName": "Event Permission",
    "serviceType": "permission",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1007",
    "officerName": "Mohan Das",
    "dept": "Municipal Corporation",
    "status": "under-review",
    "remarks": "",
    "fee": 200,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Venue Proof.pdf",
        "type": "Venue Proof",
        "date": "2026-05-03T05:58:07.177Z",
        "status": "uploaded"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-05-03T05:58:07.178Z",
        "actor": "Ravi Kumar",
        "note": ""
      }
    ],
    "submittedDate": "2026-05-03T05:58:07.178Z",
    "slaDate": "2026-05-08T05:58:07.178Z"
  },
  {
    "id": "APP-1004",
    "serviceId": "SVC-002",
    "serviceName": "Caste Certificate",
    "serviceType": "certificate",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1001",
    "officerName": "Suresh Reddy",
    "dept": "Revenue Department",
    "status": "approved",
    "remarks": "Field verification clear.",
    "fee": 50,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Declaration.pdf",
        "type": "Declaration",
        "date": "2026-05-02T05:58:07.178Z",
        "status": "verified"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-05-02T05:58:07.178Z",
        "actor": "Ravi Kumar",
        "note": ""
      },
      {
        "action": "Status updated to approved",
        "date": "2026-05-04T04:58:07.178Z",
        "actor": "Suresh Reddy",
        "note": "Field verification clear."
      }
    ],
    "submittedDate": "2026-05-02T05:58:07.178Z",
    "slaDate": "2026-05-09T05:58:07.178Z"
  },
  {
    "id": "APP-1005",
    "serviceId": "SVC-004",
    "serviceName": "Welfare / Subsidy Scheme",
    "serviceType": "welfare",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1004",
    "officerName": "Priya Nair",
    "dept": "Welfare Department",
    "status": "query",
    "remarks": "Please upload clear bank passbook.",
    "fee": 0,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Aadhaar.pdf",
        "type": "Identity Proof",
        "date": "2026-05-01T05:58:07.178Z",
        "status": "uploaded"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-05-01T05:58:07.178Z",
        "actor": "Ravi Kumar",
        "note": ""
      },
      {
        "action": "Status updated to query",
        "date": "2026-05-03T05:58:07.178Z",
        "actor": "Priya Nair",
        "note": "Please upload clear bank passbook."
      }
    ],
    "submittedDate": "2026-05-01T05:58:07.178Z",
    "slaDate": "2026-05-15T05:58:07.178Z"
  },
  {
    "id": "APP-1006",
    "serviceId": "SVC-007",
    "serviceName": "Vendor License",
    "serviceType": "permission",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1007",
    "officerName": "Mohan Das",
    "dept": "Municipal Corporation",
    "status": "query",
    "remarks": "Provide shop photo.",
    "fee": 500,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Aadhaar.pdf",
        "type": "Identity Proof",
        "date": "2026-04-19T05:58:07.178Z",
        "status": "uploaded"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-04-19T05:58:07.178Z",
        "actor": "Ravi Kumar",
        "note": ""
      },
      {
        "action": "Status updated to query",
        "date": "2026-04-24T05:58:07.178Z",
        "actor": "Mohan Das",
        "note": "Provide shop photo."
      }
    ],
    "submittedDate": "2026-04-19T05:58:07.178Z",
    "slaDate": "2026-04-26T05:58:07.178Z"
  },
  {
    "id": "APP-1007",
    "serviceId": "SVC-008",
    "serviceName": "Record Correction",
    "serviceType": "correction",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1001",
    "officerName": "Suresh Reddy",
    "dept": "Revenue Department",
    "status": "escalated",
    "remarks": "",
    "fee": 100,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Gazette.pdf",
        "type": "Gazette Notification",
        "date": "2026-04-22T05:58:07.178Z",
        "status": "uploaded"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-04-22T05:58:07.178Z",
        "actor": "Ravi Kumar",
        "note": ""
      },
      {
        "action": "SLA Breached",
        "date": "2026-05-02T05:58:07.178Z",
        "actor": "System",
        "note": "Officer failed to act within SLA"
      },
      {
        "action": "Status transitioned to escalated",
        "date": "2026-05-02T05:58:07.178Z",
        "actor": "System Daemon",
        "note": "Auto-Escalated due to SLA breach"
      }
    ],
    "submittedDate": "2026-04-22T05:58:07.178Z",
    "slaDate": "2026-05-02T05:58:07.178Z"
  },
  {
    "id": "APP-2456",
    "serviceId": "SVC-008",
    "serviceName": "Record Correction",
    "serviceType": "correction",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1001",
    "officerName": "Suresh Reddy",
    "dept": "Revenue Department",
    "status": "rejected",
    "remarks": "DOB mismatch between Aadhaar and certificate. UIDAI cross-verification required.",
    "fee": 100,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Aadhaar Card.pdf",
        "type": "Identity Proof",
        "date": "2026-01-18T05:58:07.178Z",
        "status": "uploaded"
      },
      {
        "name": "Original Certificate.pdf",
        "type": "Certificate",
        "date": "2026-01-18T05:58:07.178Z",
        "status": "uploaded"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-01-18T05:58:07.178Z",
        "actor": "Ravi Kumar",
        "note": ""
      },
      {
        "action": "Assigned to Officer",
        "date": "2026-01-19T05:58:07.178Z",
        "actor": "System",
        "note": "Assigned to Suresh Reddy"
      },
      {
        "action": "Application Rejected",
        "date": "2026-01-21T05:58:07.178Z",
        "actor": "Suresh Reddy",
        "note": "DOB mismatch detected between Aadhaar and certificate"
      }
    ],
    "submittedDate": "2026-01-18T05:58:07.178Z",
    "slaDate": "2026-01-25T05:58:07.178Z"
  },
  {
    "id": "APP-1008",
    "serviceId": "SVC-004",
    "serviceName": "Welfare / Subsidy Scheme",
    "serviceType": "welfare",
    "citizenId": "CIT-1002",
    "citizenName": "Sunita Verma",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1004",
    "officerName": "Priya Nair",
    "dept": "Welfare Department",
    "status": "escalated",
    "remarks": "",
    "fee": 0,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Aadhaar.pdf",
        "type": "Identity Proof",
        "date": "2026-04-16T05:58:07.178Z",
        "status": "uploaded"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-04-16T05:58:07.178Z",
        "actor": "Sunita Verma",
        "note": ""
      },
      {
        "action": "SLA Breached",
        "date": "2026-04-30T05:58:07.178Z",
        "actor": "System",
        "note": "Officer failed to act within SLA"
      },
      {
        "action": "Status transitioned to escalated",
        "date": "2026-04-30T05:58:07.178Z",
        "actor": "System Daemon",
        "note": "Auto-Escalated due to SLA breach"
      }
    ],
    "submittedDate": "2026-04-16T05:58:07.178Z",
    "slaDate": "2026-04-30T05:58:07.178Z"
  },
  {
    "id": "APP-1009",
    "serviceId": "SVC-007",
    "serviceName": "Vendor License",
    "serviceType": "permission",
    "citizenId": "CIT-1003",
    "citizenName": "Kaveri Devi",
    "jurisdiction": "Secunderabad",
    "officerId": "EMP-1007",
    "officerName": "Mohan Das",
    "dept": "Municipal Corporation",
    "status": "under-review",
    "remarks": "",
    "fee": 500,
    "paymentStatus": "paid",
    "documents": [
      {
        "name": "Aadhaar.pdf",
        "type": "Identity Proof",
        "date": "2026-04-29T05:58:07.178Z",
        "status": "uploaded"
      }
    ],
    "timeline": [
      {
        "action": "Application Submitted",
        "date": "2026-04-29T05:58:07.178Z",
        "actor": "Kaveri Devi",
        "note": ""
      }
    ],
    "submittedDate": "2026-04-29T05:58:07.178Z",
    "slaDate": "2026-05-06T05:58:07.178Z"
  }
];

// ── Grievance statuses ──
// Active  : 'open'  (NEW_GRIEVANCE) | 'investigating' (UNDER_INVESTIGATION) | 'escalated' (GRIEVANCE_ESCALATED — pending supervisor)
// Terminal: 'resolved' (GRIEVANCE_RESOLVED) | 'rejected' (GRIEVANCE_REJECTED) | 'escalated-resolved' (Supervisor closed)
// ── Categories ──
// 'delay' | 'rejection' | 'payment' | 'misconduct'
// ── SLA status (stored, since dates age) ──
// 'safe' | 'warn' | 'breach'

const MOCK_GRIEVANCES = [
  {
    "id": "GRV-1001",
    "subject": "Payment Receipt Missing",
    "category": "payment",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "relatedAppId": "APP-1003",
    "description": "Amount deducted but receipt not generated.",
    "filedDate": "2026-05-03T18:45:19.670Z",
    "status": "investigating",
    "priority": "low",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-05-03T18:45:19.670Z",
        "note": "Payment dispute"
      },
      {
        "action": "Investigating",
        "date": "2026-05-04T00:45:19.670Z",
        "note": "Checking payment logs"
      }
    ]
  },
  {
    "id": "GRV-1002",
    "subject": "Severe SLA Delay",
    "category": "delay",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "relatedAppId": "APP-1007",
    "description": "Application is overdue by several days.",
    "filedDate": "2026-05-03T06:45:19.670Z",
    "status": "investigating",
    "priority": "high",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-05-03T06:45:19.670Z",
        "note": "Delay complaint"
      },
      {
        "action": "Investigating",
        "date": "2026-05-03T18:45:19.671Z",
        "note": "Validating SLA"
      }
    ]
  },
  {
    "id": "GRV-1003",
    "subject": "Processing is slow",
    "category": "delay",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "relatedAppId": "APP-1004",
    "description": "Officer is taking too much time.",
    "filedDate": "2026-05-03T18:45:19.671Z",
    "status": "investigating",
    "priority": "medium",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-05-03T18:45:19.671Z",
        "note": "Delay complaint"
      },
      {
        "action": "Investigating",
        "date": "2026-05-04T04:45:19.671Z",
        "note": "Validating SLA - Within limits"
      }
    ]
  },
  {
    "id": "GRV-1004",
    "subject": "Unfair Rejection",
    "category": "rejection",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "relatedAppId": "APP-1002",
    "description": "Officer incorrectly calculated my income.",
    "filedDate": "2026-05-02T06:45:19.671Z",
    "status": "investigating",
    "priority": "medium",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-05-02T06:45:19.671Z",
        "note": "Rejection dispute"
      },
      {
        "action": "Investigating",
        "date": "2026-05-03T06:45:19.671Z",
        "note": "Verified documents."
      }
    ]
  },
  {
    "id": "GRV-1005",
    "subject": "Officer asked for bribe",
    "category": "misconduct",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "relatedAppId": "APP-1006",
    "description": "Officer asked for a bribe for vendor license.",
    "filedDate": "2026-05-01T06:45:19.671Z",
    "status": "investigating",
    "priority": "high",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-05-01T06:45:19.671Z",
        "note": "Misconduct complaint"
      },
      {
        "action": "Investigating",
        "date": "2026-05-02T06:45:19.671Z",
        "note": "Gathering internal logs"
      }
    ]
  },
  {
    "id": "GRV-006",
    "subject": "Portal Error Resolved",
    "category": "other",
    "citizenId": "CIT-1001",
    "citizenName": "Ravi Kumar",
    "relatedAppId": "APP-1001",
    "description": "I was not able to download my certificate.",
    "filedDate": "2026-04-24T06:45:19.671Z",
    "status": "resolved",
    "priority": "low",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "daysTaken": 3,
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-04-24T06:45:19.671Z",
        "note": "Technical issue"
      },
      {
        "action": "Resolved",
        "date": "2026-04-27T06:45:19.671Z",
        "note": "Fixed download bug"
      }
    ]
  },
  {
    "id": "GRV-007",
    "subject": "Corruption Allegation",
    "category": "misconduct",
    "citizenId": "CIT-1003",
    "citizenName": "Kaveri Devi",
    "relatedAppId": "APP-1009",
    "description": "Officer demanded money.",
    "filedDate": "2026-04-30T06:45:19.671Z",
    "status": "escalated",
    "priority": "high",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-04-30T06:45:19.671Z",
        "note": "Misconduct complaint"
      },
      {
        "action": "Escalated to Supervisor",
        "date": "2026-05-03T06:45:19.671Z",
        "note": "Serious allegation, sent to MRO"
      }
    ]
  },
  {
    "id": "GRV-008",
    "subject": "Application not moving",
    "category": "delay",
    "citizenId": "CIT-1002",
    "citizenName": "Sunita Verma",
    "relatedAppId": "APP-1008",
    "description": "My application is breached and officer is ignoring.",
    "filedDate": "2026-05-04T05:45:19.671Z",
    "status": "open",
    "priority": "high",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-05-04T05:45:19.671Z",
        "note": "Citizen filed grievance."
      },
      {
        "action": "Assigned to Officer",
        "date": "2026-05-04T06:15:19.671Z",
        "note": "System assigned to Nalini Rao."
      }
    ]
  },
  {
    "id": "GRV-009",
    "subject": "Unfair scheme rejection",
    "category": "rejection",
    "citizenId": "CIT-1002",
    "citizenName": "Sunita Verma",
    "relatedAppId": "APP-1002",
    "description": "I have all docs but got rejected.",
    "filedDate": "2026-05-04T04:45:19.671Z",
    "status": "open",
    "priority": "medium",
    "officerId": "GRV-1001",
    "officerName": "Nalini Rao",
    "jurisdiction": "Secunderabad",
    "history": [
      {
        "action": "Grievance Filed",
        "date": "2026-05-04T04:45:19.671Z",
        "note": "Citizen filed grievance."
      },
      {
        "action": "Assigned to Officer",
        "date": "2026-05-04T05:45:19.671Z",
        "note": "System assigned to Nalini Rao."
      }
    ]
  }
];

const MOCK_NOTIFICATIONS = [
  {
    "id": "NOT-001",
    "userId": "CIT-1001",
    "title": "Application Approved!",
    "message": "Your Income Certificate (APP-1001) has been approved. Download now.",
    "type": "success",
    "read": false,
    "date": "2026-05-04T06:45:19.671Z",
    "link": "citizen/track-application.html?id=APP-1001"
  },
  {
    "id": "NOT-002",
    "userId": "CIT-1001",
    "title": "Query Raised",
    "message": "Officer has requested additional documents for APP-1005. Please respond.",
    "type": "warning",
    "read": false,
    "date": "2026-05-04T05:45:19.671Z",
    "link": "citizen/track-application.html?id=APP-1005"
  },
  {
    "id": "NOT-002b",
    "userId": "CIT-1001",
    "title": "Query Raised",
    "message": "Officer has requested a shop photo for APP-1006. Please respond.",
    "type": "warning",
    "read": false,
    "date": "2026-04-24T06:45:19.671Z",
    "link": "citizen/track-application.html?id=APP-1006"
  },
  {
    "id": "NOT-002c",
    "userId": "CIT-1001",
    "title": "Application Rejected",
    "message": "Your Scholarship Application (APP-1002) has been rejected.",
    "type": "danger",
    "read": false,
    "date": "2026-05-02T06:45:19.671Z",
    "link": "citizen/track-application.html?id=APP-1002"
  },
  {
    "id": "NOT-002d",
    "userId": "CIT-1001",
    "title": "SLA Breach",
    "message": "Your Record Correction (APP-1007) is delayed. Escalated to higher authorities.",
    "type": "info",
    "read": false,
    "date": "2026-05-02T06:45:19.671Z",
    "link": "citizen/track-application.html?id=APP-1007"
  },
  {
    "id": "NOT-003",
    "userId": "CIT-1001",
    "title": "New Scheme Available",
    "message": "PM Kisan Scholarship 2026 applications are now open. Check eligibility.",
    "type": "info",
    "read": false,
    "date": "2026-05-03T06:45:19.671Z",
    "link": "citizen/apply-service.html"
  },
  {
    "id": "NOT-004",
    "userId": "EMP-1007",
    "title": "New Application Assigned",
    "message": "Event Permission application (APP-1003) assigned to you.",
    "type": "info",
    "read": false,
    "date": "2026-05-03T06:45:19.671Z",
    "link": "officer/review-application.html"
  },
  {
    "id": "NOT-005",
    "userId": "SUP-1001",
    "title": "SLA Breach Auto-Escalation",
    "message": "Application APP-1007 has breached SLA and is escalated to you.",
    "type": "danger",
    "read": false,
    "date": "2026-05-02T06:45:19.671Z",
    "link": "supervisor/escalated-cases.html"
  },
  {
    "id": "NOT-006",
    "userId": "GRV-1001",
    "title": "New Grievance Assigned",
    "message": "Grievance GRV-008 regarding application delay assigned to you.",
    "type": "info",
    "read": false,
    "date": "2026-05-04T05:45:19.671Z",
    "link": "grievance/grievance-detail.html?id=GRV-008"
  },
  {
    "id": "NOT-007",
    "userId": "SUP-1003",
    "title": "Grievance Escalation Alert",
    "message": "Grievance GRV-006 (Misconduct) has been escalated to you by GO.",
    "type": "danger",
    "read": false,
    "date": "2026-05-03T06:45:19.671Z",
    "link": "supervisor/supervisor-dashboard.html"
  },
  {
    "id": "NOT-008",
    "userId": "SUP-1002",
    "title": "SLA Breach Auto-Escalation",
    "message": "Application APP-1008 has breached SLA.",
    "type": "danger",
    "read": false,
    "date": "2026-04-30T06:45:19.671Z",
    "link": "supervisor/escalated-cases.html"
  },
  {
    "id": "NOT-009",
    "userId": "SUP-1001",
    "title": "Approval Required",
    "message": "Officer approved APP-1004. Awaiting your final signature.",
    "type": "info",
    "read": false,
    "date": "2026-05-04T05:45:19.671Z",
    "link": "supervisor/supervisor-dashboard.html"
  }
];

const _nowMs = Date.now();
const _hAgo = (h: number) => new Date(_nowMs - h * 3600000).toISOString();
const MOCK_AUDIT_LOGS = [
  {
    "id": "LOG-001",
    "action": "User Login",
    "actor": "superuser@gov.in",
    "role": "super_user",
    "date": "2026-05-04T08:00:00Z",
    "details": "Super User logged in from Hyderabad, Telangana."
  },
  {
    "id": "LOG-002",
    "action": "Application Approved",
    "actor": "s.reddy@gov.in",
    "role": "officer",
    "date": "2026-05-04T07:00:00Z",
    "details": "Officer Suresh Reddy approved APP-1001 (Income Certificate) for citizen Ravi Kumar."
  },
  {
    "id": "LOG-003",
    "action": "Supervisor Final Approval",
    "actor": "d.verma@gov.in",
    "role": "supervisor",
    "date": "2026-05-04T06:00:00Z",
    "details": "Supervisor Deepak Verma issued final approval for APP-1001. Certificate issued to Ravi Kumar."
  },
  {
    "id": "LOG-004",
    "action": "Grievance Filed",
    "actor": "ravi.k@gmail.com",
    "role": "citizen",
    "date": "2026-05-04T05:00:00Z",
    "details": "Citizen Ravi Kumar filed grievance regarding delay in Income Certificate (APP-1007)."
  },
  {
    "id": "LOG-005",
    "action": "SLA Breach Auto-Escalation",
    "actor": "System Daemon",
    "role": "system",
    "date": "2026-05-04T04:00:00Z",
    "details": "APP-1007 auto-escalated to Supervisor Deepak Verma after SLA breach."
  },
  {
    "id": "LOG-006",
    "action": "Grievance Escalated",
    "actor": "n.rao@gov.in",
    "role": "grievance",
    "date": "2026-05-04T03:00:00Z",
    "details": "Grievance Officer Nalini Rao escalated GRV-1004 (Wrongful Rejection) to Supervisor."
  },
  {
    "id": "LOG-007",
    "action": "Warning Issued to Officer",
    "actor": "d.verma@gov.in",
    "role": "supervisor",
    "date": "2026-05-04T02:00:00Z",
    "details": "Supervisor Deepak Verma issued SLA warning to Officer Suresh Reddy for APP-1007."
  },
  {
    "id": "LOG-008",
    "action": "Application Rejected",
    "actor": "p.nair@gov.in",
    "role": "officer",
    "date": "2026-05-04T01:00:00Z",
    "details": "Officer Priya Nair rejected APP-1002 (Scholarship) - Income exceeds limit."
  },
  {
    "id": "LOG-009",
    "action": "Officer Onboarded",
    "actor": "superuser@gov.in",
    "role": "super_user",
    "date": "2026-05-03T08:00:00Z",
    "details": "Super User onboarded Officer Rekha Singh (EMP-1009) for Municipal Corporation, Secunderabad."
  },
  {
    "id": "LOG-010",
    "action": "Service Deactivated",
    "actor": "superuser@gov.in",
    "role": "super_user",
    "date": "2026-05-02T08:00:00Z",
    "details": "Super User deactivated SVC-010 (Death Certificate) pending workflow review."
  },
  {
    "id": "LOG-011",
    "action": "Query Raised",
    "actor": "p.nair@gov.in",
    "role": "officer",
    "date": "2026-05-01T08:00:00Z",
    "details": "Officer Priya Nair raised document query on APP-1005 (Subsidy Scheme) for Citizen Ravi Kumar."
  },
  {
    "id": "LOG-012",
    "action": "Citizen Query Response",
    "actor": "ravi.k@gmail.com",
    "role": "citizen",
    "date": "2026-05-01T09:00:00Z",
    "details": "Citizen Ravi Kumar responded to officer query on APP-1005. SLA timer reset."
  },
  {
    "id": "LOG-013",
    "action": "Grievance Investigating",
    "actor": "n.rao@gov.in",
    "role": "grievance",
    "date": "2026-05-01T10:00:00Z",
    "details": "Grievance Officer Nalini Rao investigating GRV-1001 - Checking payment gateway logs."
  },
  {
    "id": "LOG-014",
    "action": "Supervisor Override",
    "actor": "l.narayana@gov.in",
    "role": "supervisor",
    "date": "2026-04-30T08:00:00Z",
    "details": "Supervisor Lakshmi Narayana overrode officer decision on APP-1003, approving Event Permission."
  },
  {
    "id": "LOG-015",
    "action": "Workflow Config Updated",
    "actor": "superuser@gov.in",
    "role": "super_user",
    "date": "2026-04-20T08:00:00Z",
    "details": "Super User updated workflow stages for Income Certificate - added Field Verification step."
  }
];

/**
 * Initialize localStorage with mock data if not already present
 */
export function initializeMockData() {
  if (!localStorage.getItem('DigiConnect_initialized_v24')) {
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
    localStorage.setItem('DigiConnect_settings', JSON.stringify(MOCK_SETTINGS));
    localStorage.setItem('DigiConnect_initialized_v24', 'true');
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
  localStorage.removeItem('DigiConnect_settings');
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
  { name: 'Anita Sharma', role: 'VRO', initials: 'AS', pending: 34, approved: 18, breach: 3, sla: 87 },
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

const MOCK_SETTINGS = {
  general: {
    platformName: 'DigiConnect Telangana',
    supportEmail: 'support.digiconnect@telangana.gov.in',
    sessionTimeout: 30,
    languageDefault: 'en'
  },
  sla: {
    slaCert: 7,
    slaWelfare: 14,
    slaPermission: 5,
    slaCorrection: 10,
    slaGrievance: 15
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: false,
    pushEnabled: true
  },
  security: {
    twoFactorEnabled: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    aadhaarMasking: true
  },
  maintenance: {
    enabled: false,
    message: 'System is undergoing scheduled maintenance. Please try again later.',
    estimatedEnd: ''
  }
};



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
  officerQueries: any[];
  officerActivity: any[];
  officerSlaRisks: any[];
  officerWeekChart: any;
  superOfficerApproved: any[];
  superSlaBreaches: any[];
  superGrievances: any[];
  superTeam: any[];
  superEscSlaCases: any[];
  superEscGrievanceCases: any[];
  superPendingApps: any[];
  workflowConfig: any[];
} = {
  users: MOCK_USERS as User[],
  applications: MOCK_APPLICATIONS as Application[],
  grievances: MOCK_GRIEVANCES as Grievance[],
  services: MOCK_SERVICES as GovtService[],
  notifications: MOCK_NOTIFICATIONS as Notification[],
  auditLogs: MOCK_AUDIT_LOGS as AuditLog[],
  officerQueue: OFFICER_QUEUE as OfficerQueueItem[],
  pendingOfficers: MOCK_PENDING_OFFICERS as PendingOfficer[],
  settings: MOCK_SETTINGS,
  officerQueries: OFFICER_QUERIES,
  officerActivity: OFFICER_ACTIVITY,
  officerSlaRisks: OFFICER_SLA_RISKS,
  officerWeekChart: OFFICER_WEEK_CHART,
  superOfficerApproved: SUPER_OFFICER_APPROVED,
  superSlaBreaches: SUPER_SLA_BREACHES,
  superGrievances: SUPER_GRIEVANCES,
  superTeam: SUPER_TEAM,
  superEscSlaCases: SUPER_ESC_SLA_CASES,
  superEscGrievanceCases: SUPER_ESC_GRIEVANCE_CASES,
  superPendingApps: SUPER_PENDING_APPS,
  workflowConfig: MOCK_WORKFLOW_CONFIG,
};
