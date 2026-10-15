// back-end/src/data/bottom-up-seeder.ts
// Relational Bottom-Up Data Generator for DigiConnect
// Guarantees: Citizen at Place -> Service -> Assigned Officer -> Dept -> State -> Central

import { Role, AppStatus, GrievanceStatus } from '../models/enums';

export interface SeedCitizen {
  id: string;
  name: string;
  role: string;
  backendRole: Role;
  email: string;
  phone: string;
  aadhaar: string;
  dob: string;
  gender: string;
  status: string;
  jurisdiction: string;
  stateId: string;
  state: string;
  district: string;
  mandal: string;
  pincode: string;
  address: string;
  password: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. GROUNDED CITIZENS ACROSS JURISDICTIONS (AP, KA, KL, TN - Rural & Urban)
// ═══════════════════════════════════════════════════════════════════════════

export const SEED_CITIZENS: SeedCitizen[] = [
  // ── ANDHRA PRADESH CITIZENS ──
  {
    id: 'CIT-AP-003',
    name: 'G. Venkateswarlu',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'venkat.ap03@gmail.com',
    phone: '9876541003',
    aadhaar: '895421990013',
    dob: '1989-03-14',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_cg_vil',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    mandal: 'Chandragiri',
    pincode: '517101',
    address: '4-88, Temple Street, Chandragiri, Tirupati - 517101',
    password: 'password123',
  },
  {
    id: 'CIT-AP-004',
    name: 'K. Padma Priya',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'padma.ap04@gmail.com',
    phone: '9876541004',
    aadhaar: '895421990014',
    dob: '1996-08-20',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_w14',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    mandal: 'Tirupati Urban',
    pincode: '517501',
    address: 'Flat 101, Srinivasa Towers, Bhavani Nagar, Tirupati - 517501',
    password: 'password123',
  },
  {
    id: 'CIT-AP-005',
    name: 'M. Subba Rayudu',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'subba.ap05@gmail.com',
    phone: '9876541005',
    aadhaar: '895421990015',
    dob: '1983-12-05',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_cg_vil',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    mandal: 'Chandragiri',
    pincode: '517101',
    address: '7-12, Rythu Bazar Road, Chandragiri - 517101',
    password: 'password123',
  },
  {
    id: 'CIT-AP-006',
    name: 'B. Anusha Reddy',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'anusha.ap06@gmail.com',
    phone: '9876541006',
    aadhaar: '895421990016',
    dob: '2000-05-18',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_w14',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    mandal: 'Tirupati Urban',
    pincode: '517501',
    address: '2-140, Korlagunta Main Road, Tirupati - 517501',
    password: 'password123',
  },

  // ── KARNATAKA CITIZENS ──
  {
    id: 'CIT-KA-003',
    name: 'Manjunatha Gowda',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'manju.ka03@gmail.com',
    phone: '9876542003',
    aadhaar: '895421990023',
    dob: '1987-04-11',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_bilikere_vil',
    stateId: 'state_ka',
    state: 'Karnataka',
    district: 'Mysuru',
    mandal: 'Hunsur',
    pincode: '571103',
    address: 'Farmer Colony, Bilikere Village, Hunsur - 571103',
    password: 'password123',
  },
  {
    id: 'CIT-KA-004',
    name: 'Soumya Hegde',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'soumya.ka04@gmail.com',
    phone: '9876542004',
    aadhaar: '895421990024',
    dob: '1994-09-25',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_bbmp_w150',
    stateId: 'state_ka',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    mandal: 'Bellandur',
    pincode: '560103',
    address: '88, Lake View Layout, Bellandur, Bengaluru - 560103',
    password: 'password123',
  },
  {
    id: 'CIT-KA-005',
    name: 'Prakash Rao',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'prakash.ka05@gmail.com',
    phone: '9876542005',
    aadhaar: '895421990025',
    dob: '1981-01-30',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_bilikere_vil',
    stateId: 'state_ka',
    state: 'Karnataka',
    district: 'Mysuru',
    mandal: 'Hunsur',
    pincode: '571103',
    address: '12, Main Road, Bilikere, Hunsur - 571103',
    password: 'password123',
  },
  {
    id: 'CIT-KA-006',
    name: 'Kavya Suresh',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'kavya.ka06@gmail.com',
    phone: '9876542006',
    aadhaar: '895421990026',
    dob: '1998-11-12',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_bbmp_w150',
    stateId: 'state_ka',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    mandal: 'Bellandur',
    pincode: '560103',
    address: 'Penthouse 5B, Sun City Apts, Bellandur, Bengaluru - 560103',
    password: 'password123',
  },

  // ── KERALA CITIZENS ──
  {
    id: 'CIT-KL-003',
    name: 'Rahul Varma',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'rahul.kl03@gmail.com',
    phone: '9876543003',
    aadhaar: '895421990033',
    dob: '1991-07-16',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_nedumangad_vil',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    mandal: 'Nedumangad',
    pincode: '695615',
    address: 'Varma Nivas, Market Junction, Nedumangad - 695615',
    password: 'password123',
  },
  {
    id: 'CIT-KL-004',
    name: 'Amina Shaji',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'amina.kl04@gmail.com',
    phone: '9876543004',
    aadhaar: '895421990034',
    dob: '1995-10-02',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_tvm_w12',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    mandal: 'Palayam',
    pincode: '695034',
    address: 'Rose Villa, University Road, Palayam, TVM - 695034',
    password: 'password123',
  },
  {
    id: 'CIT-KL-005',
    name: 'Pradeep Kumar K.',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'pradeep.kl05@gmail.com',
    phone: '9876543005',
    aadhaar: '895421990035',
    dob: '1984-03-22',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_nedumangad_vil',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    mandal: 'Nedumangad',
    pincode: '695615',
    address: 'Krishna Kripa, Vembayam, Nedumangad - 695615',
    password: 'password123',
  },
  {
    id: 'CIT-KL-006',
    name: 'Sneha Mariam Roy',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'sneha.kl06@gmail.com',
    phone: '9876543006',
    aadhaar: '895421990036',
    dob: '1999-06-14',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_tvm_w12',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    mandal: 'Palayam',
    pincode: '695034',
    address: 'Flat 402, Skyline Manor, Palayam, TVM - 695034',
    password: 'password123',
  },

  // ── TAMIL NADU CITIZENS ──
  {
    id: 'CIT-TN-003',
    name: 'S. Alagappan',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'alagappan.tn03@gmail.com',
    phone: '9876544003',
    aadhaar: '895421990043',
    dob: '1986-02-19',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_valayankulam_vil',
    stateId: 'state_tn',
    state: 'Tamil Nadu',
    district: 'Madurai',
    mandal: 'Thiruparankundram',
    pincode: '625022',
    address: 'East Gate, Valayankulam Village, Madurai - 625022',
    password: 'password123',
  },
  {
    id: 'CIT-TN-004',
    name: 'R. Priya Dharshini',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'priya.tn04@gmail.com',
    phone: '9876544004',
    aadhaar: '895421990044',
    dob: '1997-12-08',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_gcc_w50',
    stateId: 'state_tn',
    state: 'Tamil Nadu',
    district: 'Chennai',
    mandal: 'Royapuram',
    pincode: '600013',
    address: '15/3, Kalmandapam Road, Royapuram, Chennai - 600013',
    password: 'password123',
  },
  {
    id: 'CIT-TN-005',
    name: 'K. Muthu Krishnan',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'muthu.tn05@gmail.com',
    phone: '9876544005',
    aadhaar: '895421990045',
    dob: '1982-08-11',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_valayankulam_vil',
    stateId: 'state_tn',
    state: 'Tamil Nadu',
    district: 'Madurai',
    mandal: 'Thiruparankundram',
    pincode: '625022',
    address: 'Agricultural Co-op Colony, Valayankulam - 625022',
    password: 'password123',
  },
  {
    id: 'CIT-TN-006',
    name: 'M. Deepa Lakshmi',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'deepa.tn06@gmail.com',
    phone: '9876544006',
    aadhaar: '895421990046',
    dob: '1993-04-27',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_gcc_w50',
    stateId: 'state_tn',
    state: 'Tamil Nadu',
    district: 'Chennai',
    mandal: 'Royapuram',
    pincode: '600013',
    address: 'Block 2, Harbor View Enclave, Royapuram, Chennai - 600013',
    password: 'password123',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 2. BOTTOM-UP APPLICATION GENERATOR (Relational Integrity Grounded)
// ═══════════════════════════════════════════════════════════════════════════

interface ServiceDef {
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  stateId: string;
  state: string;
  serviceType: string;
  fee: number;
  officersByStep: { officerId: string; officerName: string }[];
}

const SERVICE_REGISTRY: Record<string, ServiceDef[]> = {
  state_ap: [
    {
      serviceId: 'srv_caste_income_ap',
      serviceName: 'Integrated Community, Nativity & Date of Birth Certificate',
      departmentId: 'dept_rev_ap',
      departmentName: 'Revenue, Registration & Stamps Department',
      stateId: 'state_ap',
      state: 'Andhra Pradesh',
      serviceType: 'certificate',
      fee: 50,
      officersByStep: [
        { officerId: 'OFF-AP-REV-VRO-01', officerName: 'Suresh Reddy (VRO)' },
        { officerId: 'OFF-AP-REV-RI-01', officerName: 'M. Jagadeesh (RI)' },
        { officerId: 'OFF-AP-REV-TAH-01', officerName: 'D. Prabhakar Rao (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_land_mutation_ap',
      serviceName: 'Agricultural Land Mutation & Pattadar Passbook',
      departmentId: 'dept_rev_ap',
      departmentName: 'Revenue, Registration & Stamps Department',
      stateId: 'state_ap',
      state: 'Andhra Pradesh',
      serviceType: 'record',
      fee: 100,
      officersByStep: [
        { officerId: 'OFF-AP-REV-RI-01', officerName: 'M. Jagadeesh (RI)' },
        { officerId: 'OFF-AP-REV-TAH-01', officerName: 'D. Prabhakar Rao (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_vidya_deevena_ap',
      serviceName: 'Jagananna Vidya Deevena Full Fee Reimbursement',
      departmentId: 'dept_wel_ap',
      departmentName: 'Social Welfare & Empowerment Department',
      stateId: 'state_ap',
      state: 'Andhra Pradesh',
      serviceType: 'welfare',
      fee: 0,
      officersByStep: [
        { officerId: 'OFF-AP-WEL-WEA-01', officerName: 'B. Sravani (WEA)' },
        { officerId: 'OFF-AP-WEL-DSWO-01', officerName: 'Dr. G. Lakshmi Narayana (DSWO)' },
      ],
    },
  ],
  state_ka: [
    {
      serviceId: 'srv_caste_income_ka',
      serviceName: 'Caste & Income Certificate (Nadakacheri / AJSK)',
      departmentId: 'dept_rev_ka',
      departmentName: 'Revenue Department (Kandaya Ilakhe)',
      stateId: 'state_ka',
      state: 'Karnataka',
      serviceType: 'certificate',
      fee: 40,
      officersByStep: [
        { officerId: 'OFF-KA-REV-VAO-01', officerName: 'Basavaraj Shivappa (VAO)' },
        { officerId: 'OFF-KA-REV-RI-01', officerName: 'Kumaraswamy H. S. (RI)' },
        { officerId: 'OFF-KA-REV-TAH-01', officerName: 'Manjunatha Swamy (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_bhoomi_rtc_ka',
      serviceName: 'Bhoomi RTC Mutation & Certified Land Record Copy',
      departmentId: 'dept_rev_ka',
      departmentName: 'Revenue Department (Kandaya Ilakhe)',
      stateId: 'state_ka',
      state: 'Karnataka',
      serviceType: 'record',
      fee: 50,
      officersByStep: [
        { officerId: 'OFF-KA-REV-RI-01', officerName: 'Kumaraswamy H. S. (RI)' },
        { officerId: 'OFF-KA-REV-TAH-01', officerName: 'Manjunatha Swamy (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_vidyasiri_scholarship_ka',
      serviceName: 'Vidyasiri Post-Matric Hostel & Food Assistance Scheme',
      departmentId: 'dept_wel_ka',
      departmentName: 'Social Welfare & Backward Classes Department',
      stateId: 'state_ka',
      state: 'Karnataka',
      serviceType: 'welfare',
      fee: 0,
      officersByStep: [
        { officerId: 'OFF-KA-WEL-GPWC-01', officerName: 'Sunanda Bai (GPWC)' },
        { officerId: 'OFF-KA-WEL-DWO-01', officerName: 'Dr. Chandrashekar (DWO)' },
      ],
    },
  ],
  state_kl: [
    {
      serviceId: 'srv_edistrict_caste_kl',
      serviceName: 'E-District Community & Non-Creamy Layer Certificate',
      departmentId: 'dept_rev_kl',
      departmentName: 'Revenue Department (Keralam E-District)',
      stateId: 'state_kl',
      state: 'Kerala',
      serviceType: 'certificate',
      fee: 60,
      officersByStep: [
        { officerId: 'OFF-KL-REV-VO-01', officerName: 'Sajeev Kumar (VO)' },
        { officerId: 'OFF-KL-REV-DTAH-01', officerName: 'Reshma Nair (DTAH)' },
        { officerId: 'OFF-KL-REV-TAH-01', officerName: 'Gopalan Nambiar (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_possession_cert_kl',
      serviceName: 'Land Possession & Title Deed Verification Certificate',
      departmentId: 'dept_rev_kl',
      departmentName: 'Revenue Department (Keralam E-District)',
      stateId: 'state_kl',
      state: 'Kerala',
      serviceType: 'record',
      fee: 50,
      officersByStep: [
        { officerId: 'OFF-KL-REV-DTAH-01', officerName: 'Reshma Nair (DTAH)' },
        { officerId: 'OFF-KL-REV-TAH-01', officerName: 'Gopalan Nambiar (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_post_matric_scholarship_kl',
      serviceName: 'Post-Matric Scholarship for SC/ST/OEC Students',
      departmentId: 'dept_wel_kl',
      departmentName: 'SC/ST Development & Social Justice Department',
      stateId: 'state_kl',
      state: 'Kerala',
      serviceType: 'welfare',
      fee: 0,
      officersByStep: [
        { officerId: 'OFF-KL-WEL-VEO-01', officerName: 'Bindu Joseph (VEO)' },
        { officerId: 'OFF-KL-WEL-DSJO-01', officerName: 'Dr. Jacob Abraham (DSJO)' },
      ],
    },
  ],
  state_tn: [
    {
      serviceId: 'srv_community_cert_tn',
      serviceName: 'Permanent Community Certificate (e-Sevai Portal)',
      departmentId: 'dept_rev_tn',
      departmentName: 'Revenue & Disaster Management Department',
      stateId: 'state_tn',
      state: 'Tamil Nadu',
      serviceType: 'certificate',
      fee: 60,
      officersByStep: [
        { officerId: 'OFF-TN-REV-VAO-01', officerName: 'Senthil Murugan (VAO)' },
        { officerId: 'OFF-TN-REV-RI-01', officerName: 'K. Anbazhagan (RI)' },
        { officerId: 'OFF-TN-REV-TAH-01', officerName: 'P. Muthuraman (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_patta_chitta_tn',
      serviceName: 'Patta Transfer & Chitta Land Ownership Register',
      departmentId: 'dept_rev_tn',
      departmentName: 'Revenue & Disaster Management Department',
      stateId: 'state_tn',
      state: 'Tamil Nadu',
      serviceType: 'record',
      fee: 60,
      officersByStep: [
        { officerId: 'OFF-TN-REV-RI-01', officerName: 'K. Anbazhagan (RI)' },
        { officerId: 'OFF-TN-REV-TAH-01', officerName: 'P. Muthuraman (Tahsildar)' },
      ],
    },
    {
      serviceId: 'srv_pudhumai_penn_tn',
      serviceName: 'Moovalur Ramamirtham Ammaiyar Pudhumai Penn Higher Education Grant',
      departmentId: 'dept_wel_tn',
      departmentName: 'Adi Dravidar & Tribal Welfare Department',
      stateId: 'state_tn',
      state: 'Tamil Nadu',
      serviceType: 'welfare',
      fee: 0,
      officersByStep: [
        { officerId: 'OFF-TN-WEL-VWF-01', officerName: 'M. Poongodi (VWF)' },
        { officerId: 'OFF-TN-WEL-DADWO-01', officerName: 'Dr. K. Manimaran (DADWO)' },
      ],
    },
  ],
};

/**
 * Generate 240+ fully grounded applications tied to specific citizens in specific locations
 * spanning months from Jan 2026 to Oct 2026.
 */
export function generateBottomUpApplications(): any[] {
  const generated: any[] = [];
  let appCounter = 1100;
  let txnCounter = 9100;

  // Status distribution weights
  const statusPool = [
    AppStatus.CERTIFICATE_GENERATED,
    AppStatus.CERTIFICATE_GENERATED,
    AppStatus.CERTIFICATE_GENERATED,
    AppStatus.CERTIFICATE_GENERATED,
    AppStatus.APPROVED,
    AppStatus.APPROVED,
    AppStatus.UNDER_REVIEW,
    AppStatus.PENDING_OFFICER_REVIEW,
    AppStatus.QUERY_RAISED,
    AppStatus.REJECTED,
  ];

  // Months in 2026 to populate
  const months = [
    { m: '01', days: 28, label: 'Jan' },
    { m: '02', days: 27, label: 'Feb' },
    { m: '03', days: 30, label: 'Mar' },
    { m: '04', days: 29, label: 'Apr' },
    { m: '05', days: 30, label: 'May' },
    { m: '06', days: 29, label: 'Jun' },
    { m: '07', days: 30, label: 'Jul' },
    { m: '08', days: 30, label: 'Aug' },
    { m: '09', days: 29, label: 'Sep' },
    { m: '10', days: 14, label: 'Oct' },
  ];

  // Distribute applications per citizen across months
  SEED_CITIZENS.forEach((citizen, citizenIdx) => {
    const stateServices = SERVICE_REGISTRY[citizen.stateId] || [];
    if (stateServices.length === 0) return;

    months.forEach((monthObj, monthIdx) => {
      // 1-2 applications per citizen per month
      const countForMonth = (citizenIdx + monthIdx) % 2 === 0 ? 2 : 1;

      for (let i = 0; i < countForMonth; i++) {
        const srv = stateServices[(citizenIdx + monthIdx + i) % stateServices.length];
        const status = statusPool[(citizenIdx * 3 + monthIdx * 2 + i) % statusPool.length];
        const day = String(Math.min(monthObj.days, (i * 12 + citizenIdx * 3 + 2) % monthObj.days + 1)).padStart(2, '0');
        const submittedDate = `2026-${monthObj.m}-${day}T09:30:00.000Z`;

        const stateCode = citizen.stateId.replace('state_', '').toUpperCase();
        const appId = `APP-${stateCode}-${appCounter++}`;
        const txnId = `TXN-${stateCode}-${txnCounter++}`;

        const isClosed = status === AppStatus.CERTIFICATE_GENERATED || status === AppStatus.APPROVED || status === AppStatus.REJECTED;
        const assignedOfficer = srv.officersByStep[Math.min(srv.officersByStep.length - 1, (i + monthIdx) % srv.officersByStep.length)];

        generated.push({
          id: appId,
          serviceId: srv.serviceId,
          serviceName: srv.serviceName,
          serviceType: srv.serviceType,
          departmentId: srv.departmentId,
          dept: srv.departmentName,
          departmentName: srv.departmentName,
          stateId: srv.stateId,
          state: srv.state,
          citizenId: citizen.id,
          citizenName: citizen.name,
          jurisdiction: citizen.jurisdiction,
          status,
          appliedDate: submittedDate,
          submittedDate,
          createdAt: submittedDate,
          lastUpdated: isClosed ? `2026-${monthObj.m}-${Math.min(28, Number(day) + 5)}T16:00:00.000Z` : submittedDate,
          slaDate: `2026-${monthObj.m}-${Math.min(28, Number(day) + 15)}T09:30:00.000Z`,
          slaTotal: 15,
          slaRemaining: isClosed ? 0 : 5,
          slaDaysRemaining: isClosed ? 0 : 5,
          fee: srv.fee,
          paymentStatus: srv.fee > 0 ? 'paid' : 'completed',
          paymentTransactionId: srv.fee > 0 ? txnId : undefined,
          officerId: assignedOfficer.officerId,
          officerName: assignedOfficer.officerName,
          assignedOfficerId: assignedOfficer.officerId,
          assignedOfficerName: assignedOfficer.officerName,
          formData: {
            applicant_name: citizen.name,
            aadhaar_number: citizen.aadhaar,
            address: citizen.address,
            district: citizen.district,
            mandal: citizen.mandal,
          },
          documents: [
            {
              id: `doc_${appId}_1`,
              name: 'Aadhaar_Verified.pdf',
              size: '220 KB',
              type: 'Identity Proof',
              status: 'verified',
              date: submittedDate,
              url: '#',
            },
          ],
          timeline: [
            {
              action: 'Application Submitted',
              stepName: 'Application Submitted',
              date: submittedDate,
              completedDate: submittedDate,
              actor: citizen.name,
              status: 'COMPLETED',
              note: srv.fee > 0 ? `Fee ₹${srv.fee} paid successfully` : 'Eligible application filed',
            },
            ...(isClosed
              ? [
                  {
                    action: status === AppStatus.REJECTED ? 'Application Rejected' : 'Statutory Approval & Digital Endorsement',
                    stepName: 'Final Endorsement',
                    date: `2026-${monthObj.m}-${Math.min(28, Number(day) + 5)}T16:00:00.000Z`,
                    completedDate: `2026-${monthObj.m}-${Math.min(28, Number(day) + 5)}T16:00:00.000Z`,
                    actor: assignedOfficer.officerName,
                    status: status === AppStatus.REJECTED ? 'REJECTED' : 'COMPLETED',
                    note: status === AppStatus.REJECTED ? 'Incomplete land survey proof' : 'Verified, approved, and digitally signed',
                  },
                ]
              : [
                  {
                    action: 'Desk Verification & Scrutiny',
                    stepName: 'Desk Scrutiny',
                    date: submittedDate,
                    completedDate: null,
                    actor: assignedOfficer.officerName,
                    status: 'IN_PROGRESS',
                    note: 'Reviewing attached records against state registry',
                  },
                ]),
          ],
        });
      }
    });
  });

  return generated;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. BOTTOM-UP GRIEVANCE GENERATOR (Tied to Specific Citizens & Applications)
// ═══════════════════════════════════════════════════════════════════════════

const GRO_OFFICERS: Record<string, { officerId: string; officerName: string }> = {
  dept_rev_ap: { officerId: 'OFF-AP-REV-GRV1-01', officerName: 'C. Hemalatha (GRO AP Revenue)' },
  dept_wel_ap: { officerId: 'OFF-AP-WEL-GRV1-01', officerName: 'V. Sumathi (GRO AP Welfare)' },
  dept_rev_ka: { officerId: 'OFF-KA-REV-GRV1-01', officerName: 'Geetha Shivanand (GRO KA Revenue)' },
  dept_wel_ka: { officerId: 'OFF-KA-WEL-GRV1-01', officerName: 'Mahalakshmi K. (GRO KA Welfare)' },
  dept_rev_kl: { officerId: 'OFF-KL-REV-GRV1-01', officerName: 'Deepa Varghese (GRO KL Revenue)' },
  dept_wel_kl: { officerId: 'OFF-KL-WEL-GRV1-01', officerName: 'Subhadra Amma (GRO KL Welfare)' },
  dept_rev_tn: { officerId: 'OFF-TN-REV-GRV1-01', officerName: 'Selvi Meenakshi (GRO TN Revenue)' },
  dept_wel_tn: { officerId: 'OFF-TN-WEL-GRV1-01', officerName: 'M. Poongodi (GRO TN Welfare)' },
};

export function generateBottomUpGrievances(applications: any[]): any[] {
  const grievances: any[] = [];
  let grvCounter = 10;

  // Filter applications that are pending, in review, or query raised to create grievances
  const eligibleApps = applications.filter(
    (a) =>
      a.status === AppStatus.UNDER_REVIEW ||
      a.status === AppStatus.PENDING_OFFICER_REVIEW ||
      a.status === AppStatus.QUERY_RAISED ||
      a.status === AppStatus.REJECTED
  );

  const statuses = [
    GrievanceStatus.RESOLVED,
    GrievanceStatus.RESOLVED,
    GrievanceStatus.INVESTIGATING,
    GrievanceStatus.ESCALATED,
    GrievanceStatus.SUBMITTED,
  ];

  eligibleApps.slice(0, 32).forEach((app, idx) => {
    const gro = GRO_OFFICERS[app.departmentId] || {
      officerId: 'OFF-GEN-GRV',
      officerName: 'Department Grievance Officer',
    };

    const status = statuses[idx % statuses.length];
    const isResolved = status === GrievanceStatus.RESOLVED;
    const stateCode = app.stateId.replace('state_', '').toUpperCase();
    const grvId = `GRV-${stateCode}-${String(grvCounter++).padStart(3, '0')}`;

    grievances.push({
      id: grvId,
      subject: `Delay in processing application ${app.id} (${app.serviceName})`,
      category: idx % 3 === 0 ? 'delay' : idx % 3 === 1 ? 'clarification' : 'rejection_appeal',
      citizenId: app.citizenId,
      citizenName: app.citizenName,
      relatedAppId: app.id,
      description: `Applicant raised inquiry regarding SLA progress on ${app.serviceName}.`,
      filedDate: app.submittedDate,
      lastUpdated: app.lastUpdated,
      status,
      priority: idx % 4 === 0 ? 'high' : 'medium',
      slaStatus: isResolved ? 'safe' : idx % 3 === 0 ? 'warn' : 'safe',
      departmentId: app.departmentId,
      stateId: app.stateId,
      jurisdiction: app.jurisdiction,
      officerId: gro.officerId,
      officerName: gro.officerName,
      assignedOfficerId: gro.officerId,
      assignedOfficerName: gro.officerName,
      history: [
        {
          action: 'Grievance Filed',
          date: app.submittedDate,
          actor: app.citizenName,
          note: `Citizen registered complaint for application ${app.id}`,
        },
        ...(isResolved
          ? [
              {
                action: 'Grievance Resolved',
                date: app.lastUpdated,
                actor: gro.officerName,
                note: 'Inquiry completed and resolution communicated to applicant.',
              },
            ]
          : [
              {
                action: 'Investigation Underway',
                date: app.lastUpdated,
                actor: gro.officerName,
                note: 'Contacted verification cell for expedited scrutiny.',
              },
            ]),
      ],
    });
  });

  return grievances;
}
