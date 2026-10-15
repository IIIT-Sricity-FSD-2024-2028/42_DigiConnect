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
  // ── ANDHRA PRADESH CITIZENS (All 5 Districts) ──
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
    jurisdiction: 'node_vsp',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    mandal: 'Visakhapatnam Urban',
    pincode: '530002',
    address: 'Flat 101, Beach Road Towers, Visakhapatnam - 530002',
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
    jurisdiction: 'node_kri',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    mandal: 'Vijayawada Rural',
    pincode: '520008',
    address: '7-12, Bandar Road, Krishna District - 520008',
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
    jurisdiction: 'node_gun',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Guntur City',
    pincode: '522002',
    address: '2-140, Arundalpet, Guntur - 522002',
    password: 'password123',
  },
  {
    id: 'CIT-AP-007',
    name: 'N. Raghava Rao',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'raghava.ap07@gmail.com',
    phone: '9876541007',
    aadhaar: '895421990017',
    dob: '1980-04-12',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_ant',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Anantapur',
    mandal: 'Anantapur Central',
    pincode: '515001',
    address: '15-42, Clock Tower Center, Anantapur - 515001',
    password: 'password123',
  },
  {
    id: 'CIT-AP-008',
    name: 'T. Sailaja',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'sailaja.ap08@gmail.com',
    phone: '9876541008',
    aadhaar: '895421990018',
    dob: '1992-09-21',
    gender: 'Female',
    status: 'Active',
    jurisdiction: 'node_w14',
    stateId: 'state_ap',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    mandal: 'Tirupati Urban',
    pincode: '517501',
    address: '3-19, Bhavani Nagar, Tirupati - 517501',
    password: 'password123',
  },

  // ── KARNATAKA CITIZENS (All 5 Districts) ──
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
    address: 'Farmer Colony, Bilikere Village, Hunsur, Mysuru - 571103',
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
    address: '88, Lake View Layout, Bellandur, Bengaluru Urban - 560103',
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
    jurisdiction: 'node_bel',
    stateId: 'state_ka',
    state: 'Karnataka',
    district: 'Belagavi',
    mandal: 'Belagavi City',
    pincode: '590001',
    address: '12, Tilakwadi Main Road, Belagavi - 590001',
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
    jurisdiction: 'node_mng',
    stateId: 'state_ka',
    state: 'Karnataka',
    district: 'Dakshina Kannada',
    mandal: 'Mangaluru South',
    pincode: '575001',
    address: 'Penthouse 5B, Kadri Hills, Mangaluru, Dakshina Kannada - 575001',
    password: 'password123',
  },
  {
    id: 'CIT-KA-007',
    name: 'Girish Patil',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'girish.ka07@gmail.com',
    phone: '9876542007',
    aadhaar: '895421990027',
    dob: '1984-06-18',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_hub',
    stateId: 'state_ka',
    state: 'Karnataka',
    district: 'Dharwad',
    mandal: 'Hubballi North',
    pincode: '580020',
    address: '22/4, Vidyanagar, Hubballi, Dharwad - 580020',
    password: 'password123',
  },

  // ── KERALA CITIZENS (All 5 Districts) ──
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
    address: 'Varma Nivas, Market Junction, Nedumangad, TVM - 695615',
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
    jurisdiction: 'node_ekm',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Ernakulam',
    mandal: 'Kochi Central',
    pincode: '682011',
    address: 'Rose Villa, Marine Drive, Kochi, Ernakulam - 682011',
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
    jurisdiction: 'node_clt',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Kozhikode',
    mandal: 'Kozhikode Urban',
    pincode: '673001',
    address: 'Krishna Kripa, Mavoor Road, Kozhikode - 673001',
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
    jurisdiction: 'node_klm',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Kollam',
    mandal: 'Kollam Town',
    pincode: '691001',
    address: 'Flat 402, Beach Road, Kollam - 691001',
    password: 'password123',
  },
  {
    id: 'CIT-KL-007',
    name: 'Mathew Thomas',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'mathew.kl07@gmail.com',
    phone: '9876543007',
    aadhaar: '895421990037',
    dob: '1988-12-03',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_tsr',
    stateId: 'state_kl',
    state: 'Kerala',
    district: 'Thrissur',
    mandal: 'Thrissur City',
    pincode: '680001',
    address: 'Round West, Swaraj Round, Thrissur - 680001',
    password: 'password123',
  },

  // ── TAMIL NADU CITIZENS (All 5 Districts) ──
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
    jurisdiction: 'node_chn',
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
    jurisdiction: 'node_cbe',
    stateId: 'state_tn',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    mandal: 'Coimbatore South',
    pincode: '641018',
    address: 'Agricultural Co-op Colony, Gandhipuram, Coimbatore - 641018',
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
    jurisdiction: 'node_slm',
    stateId: 'state_tn',
    state: 'Tamil Nadu',
    district: 'Salem',
    mandal: 'Salem Town',
    pincode: '636001',
    address: 'Block 2, Fairlands Enclave, Salem - 636001',
    password: 'password123',
  },
  {
    id: 'CIT-TN-007',
    name: 'V. Murugesan',
    role: 'citizen',
    backendRole: Role.CITIZEN,
    email: 'murugesan.tn07@gmail.com',
    phone: '9876544007',
    aadhaar: '895421990047',
    dob: '1981-11-15',
    gender: 'Male',
    status: 'Active',
    jurisdiction: 'node_try',
    stateId: 'state_tn',
    state: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    mandal: 'Tiruchirappalli Fort',
    pincode: '620002',
    address: '45, Main Guard Gate, Tiruchirappalli - 620002',
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
          district: citizen.district,
          mandal: citizen.mandal,
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
            ...(srv.serviceName.toLowerCase().includes('income')
              ? { annualIncome: '180000', occupation: 'Agriculture / Private Enterprise', purpose: 'Higher Education & Statutory Benefits', familyCount: '4' }
              : srv.serviceName.toLowerCase().includes('caste') || srv.serviceName.toLowerCase().includes('community')
              ? { communityCategory: 'OBC / BC', caste: 'BC-A', subCaste: 'Traditional Craft', purpose: 'Higher Education & Examination Registration' }
              : srv.serviceName.toLowerCase().includes('mutation') || srv.serviceName.toLowerCase().includes('land') || srv.serviceName.toLowerCase().includes('patta')
              ? { surveyNumber: '142/3B', extentAcres: '2.45 Acres', mutationReason: 'Sale Deed Purchase', previousOwner: 'K. Venkateswara Rao' }
              : srv.serviceName.toLowerCase().includes('building') || srv.serviceName.toLowerCase().includes('trade')
              ? { plotNumber: 'Plot 48', buildingType: 'Residential G+1', estimatedArea: '1850 sq.ft' }
              : { servicePurpose: 'Statutory Certification', remarks: 'All mandatory citizen declarations affirmed' }),
          },
          documents: [
            {
              id: `doc_${appId}_1`,
              name: `Aadhaar_${citizen.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              size: '340 KB',
              type: 'Identity Proof',
              status: 'verified',
              date: submittedDate,
              url: '#',
            },
            ...(srv.serviceName.toLowerCase().includes('income')
              ? [
                  {
                    id: `doc_${appId}_2`,
                    name: 'Salary_Slip_or_Pattadar_Passbook.pdf',
                    size: '520 KB',
                    type: 'Income Proof',
                    status: 'verified',
                    date: submittedDate,
                    url: '#',
                  },
                  {
                    id: `doc_${appId}_3`,
                    name: 'Ration_Card_Family_Proof.pdf',
                    size: '410 KB',
                    type: 'Family & Residence Proof',
                    status: 'verified',
                    date: submittedDate,
                    url: '#',
                  },
                ]
              : srv.serviceName.toLowerCase().includes('caste') || srv.serviceName.toLowerCase().includes('community')
              ? [
                  {
                    id: `doc_${appId}_2`,
                    name: 'School_Transfer_Certificate.pdf',
                    size: '480 KB',
                    type: 'School Study Proof',
                    status: 'verified',
                    date: submittedDate,
                    url: '#',
                  },
                  {
                    id: `doc_${appId}_3`,
                    name: 'Father_Caste_Certificate.pdf',
                    size: '390 KB',
                    type: 'Parental Caste Proof',
                    status: 'verified',
                    date: submittedDate,
                    url: '#',
                  },
                ]
              : srv.serviceName.toLowerCase().includes('mutation') || srv.serviceName.toLowerCase().includes('land') || srv.serviceName.toLowerCase().includes('patta')
              ? [
                  {
                    id: `doc_${appId}_2`,
                    name: 'Registered_Sale_Deed.pdf',
                    size: '1.2 MB',
                    type: 'Sale Deed',
                    status: 'verified',
                    date: submittedDate,
                    url: '#',
                  },
                  {
                    id: `doc_${appId}_3`,
                    name: 'Encumbrance_Certificate_EC.pdf',
                    size: '640 KB',
                    type: 'EC Search (13 Years)',
                    status: 'verified',
                    date: submittedDate,
                    url: '#',
                  },
                ]
              : [
                  {
                    id: `doc_${appId}_2`,
                    name: 'Supporting_Self_Declaration.pdf',
                    size: '310 KB',
                    type: 'Supporting Document',
                    status: 'verified',
                    date: submittedDate,
                    url: '#',
                  },
                ]),
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
    const daysTaken = isResolved
      ? Math.max(1, Math.round((new Date(app.lastUpdated).getTime() - new Date(app.submittedDate).getTime()) / (1000 * 60 * 60 * 24)))
      : undefined;

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
      closedDate: isResolved ? app.lastUpdated : undefined,
      daysTaken,
      resolvedBy: isResolved ? gro.officerName : undefined,
      resolutionNote: isResolved ? 'Inquiry completed and resolution communicated to applicant.' : undefined,
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
