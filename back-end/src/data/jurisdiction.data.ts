import { JurisdictionNode } from '../models/jurisdiction.model';
import { StateGovernment } from '../models/state.model';
import { Department, Designation, OfficerUser } from '../models/department.model';

export const MASTER_STATES: StateGovernment[] = [
  {
    id: 'state_ap',
    name: 'Andhra Pradesh',
    code: 'AP',
    rootNodeId: 'node_ap',
    stateAdminId: 'USR-SA-AP',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'state_ka',
    name: 'Karnataka',
    code: 'KA',
    rootNodeId: 'node_ka',
    stateAdminId: 'USR-SA-KA',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'state_kl',
    name: 'Kerala',
    code: 'KL',
    rootNodeId: 'node_kl',
    stateAdminId: 'USR-SA-KL',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'state_tn',
    name: 'Tamil Nadu',
    code: 'TN',
    rootNodeId: 'node_tn',
    stateAdminId: 'USR-SA-TN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const MASTER_JURISDICTION_NODES: JurisdictionNode[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ANDHRA PRADESH (AP) — District -> Revenue Sub-Division -> Mandal -> Village
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'node_ap',
    stateId: 'state_ap',
    parentId: null,
    name: 'Andhra Pradesh',
    governanceType: 'COMMON',
    tierLevel: 'STATE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_tpt',
    stateId: 'state_ap',
    parentId: 'node_ap',
    name: 'Tirupati District',
    governanceType: 'COMMON',
    tierLevel: 'DISTRICT',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // AP Rural Branch
  {
    id: 'node_rsd',
    stateId: 'state_ap',
    parentId: 'node_tpt',
    name: 'Tirupati Revenue Sub-Division',
    governanceType: 'RURAL',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_cg_mdl',
    stateId: 'state_ap',
    parentId: 'node_rsd',
    name: 'Chandragiri Mandal',
    governanceType: 'RURAL',
    tierLevel: 'MANDAL',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_cg_vil',
    stateId: 'state_ap',
    parentId: 'node_cg_mdl',
    name: 'Chandragiri Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_pn_vil',
    stateId: 'state_ap',
    parentId: 'node_cg_mdl',
    name: 'Panakam Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // AP Urban Branch (Tirupati Municipal Corporation -> Ward 14 / Ward 22)
  {
    id: 'node_usd',
    stateId: 'state_ap',
    parentId: 'node_tpt',
    name: 'Tirupati Urban Sub-Division',
    governanceType: 'URBAN',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_tmc',
    stateId: 'state_ap',
    parentId: 'node_usd',
    name: 'Tirupati Municipal Corporation',
    governanceType: 'URBAN',
    tierLevel: 'MUNICIPALITY',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_w14',
    stateId: 'state_ap',
    parentId: 'node_tmc',
    name: 'Ward 14 - Bhavani Nagar',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_w22',
    stateId: 'state_ap',
    parentId: 'node_tmc',
    name: 'Ward 22 - Korlagunta',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. KARNATAKA (KA) — District -> Taluk -> Hobli/Village & BBMP Wards
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'node_ka',
    stateId: 'state_ka',
    parentId: null,
    name: 'Karnataka',
    governanceType: 'COMMON',
    tierLevel: 'STATE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_mys',
    stateId: 'state_ka',
    parentId: 'node_ka',
    name: 'Mysuru District',
    governanceType: 'COMMON',
    tierLevel: 'DISTRICT',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // KA Rural Branch (Hunsur Taluk -> Bilikere)
  {
    id: 'node_ka_rsd',
    stateId: 'state_ka',
    parentId: 'node_mys',
    name: 'Mysuru Rural Sub-Division',
    governanceType: 'RURAL',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_hunsur_taluk',
    stateId: 'state_ka',
    parentId: 'node_ka_rsd',
    name: 'Hunsur Taluk',
    governanceType: 'RURAL',
    tierLevel: 'MANDAL',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_bilikere_vil',
    stateId: 'state_ka',
    parentId: 'node_hunsur_taluk',
    name: 'Bilikere Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_ratnapuri_vil',
    stateId: 'state_ka',
    parentId: 'node_hunsur_taluk',
    name: 'Ratnapuri Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // KA Urban Branch (Bengaluru Urban -> BBMP -> Ward 150 Bellandur)
  {
    id: 'node_ka_usd',
    stateId: 'state_ka',
    parentId: 'node_mys',
    name: 'Bengaluru Urban Sub-Division',
    governanceType: 'URBAN',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_bbmp',
    stateId: 'state_ka',
    parentId: 'node_ka_usd',
    name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    governanceType: 'URBAN',
    tierLevel: 'MUNICIPALITY',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_bbmp_w150',
    stateId: 'state_ka',
    parentId: 'node_bbmp',
    name: 'Ward 150 - Bellandur',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_bbmp_w174',
    stateId: 'state_ka',
    parentId: 'node_bbmp',
    name: 'Ward 174 - HSR Layout',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. KERALA (KL) — District -> Taluk -> Village & Municipal Corporation
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'node_kl',
    stateId: 'state_kl',
    parentId: null,
    name: 'Kerala',
    governanceType: 'COMMON',
    tierLevel: 'STATE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_tvm',
    stateId: 'state_kl',
    parentId: 'node_kl',
    name: 'Thiruvananthapuram District',
    governanceType: 'COMMON',
    tierLevel: 'DISTRICT',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // KL Rural Branch (Nedumangad Taluk -> Vembayam Village)
  {
    id: 'node_kl_rsd',
    stateId: 'state_kl',
    parentId: 'node_tvm',
    name: 'Nedumangad Revenue Sub-Division',
    governanceType: 'RURAL',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_nedumangad_taluk',
    stateId: 'state_kl',
    parentId: 'node_kl_rsd',
    name: 'Nedumangad Taluk',
    governanceType: 'RURAL',
    tierLevel: 'MANDAL',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_nedumangad_vil',
    stateId: 'state_kl',
    parentId: 'node_nedumangad_taluk',
    name: 'Vembayam Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_karakul_vil',
    stateId: 'state_kl',
    parentId: 'node_nedumangad_taluk',
    name: 'Karakulam Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // KL Urban Branch (Thiruvananthapuram Municipal Corporation -> Ward 12 Palayam)
  {
    id: 'node_tvm_usd',
    stateId: 'state_kl',
    parentId: 'node_tvm',
    name: 'Thiruvananthapuram Urban Sub-Division',
    governanceType: 'URBAN',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_tmc_kl',
    stateId: 'state_kl',
    parentId: 'node_tvm_usd',
    name: 'Thiruvananthapuram Municipal Corporation',
    governanceType: 'URBAN',
    tierLevel: 'MUNICIPALITY',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_tvm_w12',
    stateId: 'state_kl',
    parentId: 'node_tmc_kl',
    name: 'Ward 12 - Palayam',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_tvm_w15',
    stateId: 'state_kl',
    parentId: 'node_tmc_kl',
    name: 'Ward 15 - Vazhuthacaud',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. TAMIL NADU (TN) — District -> Taluk -> Firka/Village & GCC Wards
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'node_tn',
    stateId: 'state_tn',
    parentId: null,
    name: 'Tamil Nadu',
    governanceType: 'COMMON',
    tierLevel: 'STATE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_mdu',
    stateId: 'state_tn',
    parentId: 'node_tn',
    name: 'Madurai District',
    governanceType: 'COMMON',
    tierLevel: 'DISTRICT',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // TN Rural Branch (Thiruparankundram Taluk -> Valayankulam Village)
  {
    id: 'node_tn_rsd',
    stateId: 'state_tn',
    parentId: 'node_mdu',
    name: 'Madurai Revenue Sub-Division',
    governanceType: 'RURAL',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_tpk_taluk',
    stateId: 'state_tn',
    parentId: 'node_tn_rsd',
    name: 'Thiruparankundram Taluk',
    governanceType: 'RURAL',
    tierLevel: 'MANDAL',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_valayankulam_vil',
    stateId: 'state_tn',
    parentId: 'node_tpk_taluk',
    name: 'Valayankulam Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_thanakkankulam_vil',
    stateId: 'state_tn',
    parentId: 'node_tpk_taluk',
    name: 'Thanakkankulam Village',
    governanceType: 'RURAL',
    tierLevel: 'VILLAGE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // TN Urban Branch (Greater Chennai Corporation -> Ward 50 Royapuram)
  {
    id: 'node_tn_usd',
    stateId: 'state_tn',
    parentId: 'node_mdu',
    name: 'Greater Chennai Urban Sub-Division',
    governanceType: 'URBAN',
    tierLevel: 'SUB_DIVISION',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_gcc',
    stateId: 'state_tn',
    parentId: 'node_tn_usd',
    name: 'Greater Chennai Corporation (GCC)',
    governanceType: 'URBAN',
    tierLevel: 'MUNICIPALITY',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_gcc_w50',
    stateId: 'state_tn',
    parentId: 'node_gcc',
    name: 'Ward 50 - Royapuram',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'node_gcc_w114',
    stateId: 'state_tn',
    parentId: 'node_gcc',
    name: 'Ward 114 - T. Nagar',
    governanceType: 'URBAN',
    tierLevel: 'WARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const MASTER_DEPARTMENTS: Department[] = [
  // ─── 1. ANDHRA PRADESH (2 Isolated Departments) ───
  {
    id: 'dept_rev_ap',
    stateId: 'state_ap',
    name: 'Revenue, Registration & Stamps Department',
    code: 'REV-AP',
    description: 'Land records, patta passbooks, caste, income, and residence certificates',
    headUserId: 'USR-DH-REV-AP',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_ap',
    stateId: 'state_ap',
    name: 'Social Welfare & Empowerment Department',
    code: 'WEL-AP',
    description: 'Welfare schemes, fee reimbursements, livelihood grants, and educational assistance',
    headUserId: 'USR-DH-WEL-AP',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 2. KARNATAKA (2 Isolated Departments) ───
  {
    id: 'dept_rev_ka',
    stateId: 'state_ka',
    name: 'Revenue Department (Kandaya Ilakhe)',
    code: 'REV-KA',
    description: 'Bhoomi RTC land records, caste & income certificates (Nadakacheri / AJSK)',
    headUserId: 'USR-DH-REV-KA',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_ka',
    stateId: 'state_ka',
    name: 'Social Welfare & Backward Classes Department',
    code: 'WEL-KA',
    description: 'Student scholarships, Gruha Lakshmi benefits, and backward classes empowerment',
    headUserId: 'USR-DH-WEL-KA',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 3. KERALA (2 Isolated Departments) ───
  {
    id: 'dept_rev_kl',
    stateId: 'state_kl',
    name: 'Revenue Department (Keralam E-District)',
    code: 'REV-KL',
    description: 'E-District certificates, possession certificates, land valuation, and records',
    headUserId: 'USR-DH-REV-KL',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_kl',
    stateId: 'state_kl',
    name: 'SC/ST Development & Social Justice Department',
    code: 'WEL-KL',
    description: 'Social assistance, healthcare schemes, and welfare benefits',
    headUserId: 'USR-DH-WEL-KL',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ─── 4. TAMIL NADU (2 Isolated Departments) ───
  {
    id: 'dept_rev_tn',
    stateId: 'state_tn',
    name: 'Revenue & Disaster Management Department',
    code: 'REV-TN',
    description: 'e-Sevai community, nativity, legal heir certificates, and land administration',
    headUserId: 'USR-DH-REV-TN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_wel_tn',
    stateId: 'state_tn',
    name: 'Adi Dravidar & Tribal Welfare Department',
    code: 'WEL-TN',
    description: 'Pudhumai Penn grants, tribal welfare, and higher education scholarships',
    headUserId: 'USR-DH-WEL-TN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const MASTER_DESIGNATIONS: Designation[] = [
  // ─── AP REVENUE DESIGNATIONS ───
  { id: 'desig_vro', departmentId: 'dept_rev_ap', title: 'Village Revenue Officer (VRO - Rural)', code: 'VRO_AP', description: 'Village desk scrutiny & spot inquiry', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_vro_ap', departmentId: 'dept_rev_ap', title: 'Village Revenue Officer (VRO - Rural)', code: 'VRO_AP', description: 'Village desk scrutiny & spot inquiry', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_wrs_ap', departmentId: 'dept_rev_ap', title: 'Ward Revenue Secretary (WRS - Urban)', code: 'WRS_AP', description: 'Ward Sachivalayam desk scrutiny', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_mro', departmentId: 'dept_rev_ap', title: 'Revenue Inspector (RI / MRO)', code: 'RI_AP', description: 'Mandal & urban spot field inspection', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_ri_ap', departmentId: 'dept_rev_ap', title: 'Revenue Inspector (RI)', code: 'RI_AP', description: 'Mandal & urban spot field inspection', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_tahsildar', departmentId: 'dept_rev_ap', title: 'Tahsildar / Mandal Revenue Officer (MRO)', code: 'TAH_AP', description: 'Statutory approval & DSC digital signature', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_tah_ap', departmentId: 'dept_rev_ap', title: 'Tahsildar / Mandal Revenue Officer (MRO)', code: 'TAH_AP', description: 'Statutory approval & DSC digital signature', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_rev_ap', departmentId: 'dept_rev_ap', title: 'Grievance Redressal Officer (AP Revenue)', code: 'GRO_REV_AP', description: 'Tier 1 Grievance desk investigation', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_rev_ap', departmentId: 'dept_rev_ap', title: 'Appellate Authority (AP Revenue Grievance)', code: 'APP_REV_AP', description: 'Tier 2 Grievance appeals & dispute resolution', createdAt: '2026-01-01T00:00:00.000Z' },


  // ─── AP WELFARE DESIGNATIONS ───
  { id: 'desig_wea_ap', departmentId: 'dept_wel_ap', title: 'Welfare & Education Assistant (WEA - Rural)', code: 'WEA_AP', description: 'Gram Sachivalayam beneficiary verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_ueds_ap', departmentId: 'dept_wel_ap', title: 'Ward Education & Data Processing Secretary (Urban)', code: 'UEDS_AP', description: 'Urban ward applicant eligibility audit', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_aswo_ap', departmentId: 'dept_wel_ap', title: 'Assistant Social Welfare Officer (ASWO)', code: 'ASWO_AP', description: 'Mandal/Division welfare scrutiny', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_dswo_ap', departmentId: 'dept_wel_ap', title: 'District Social Welfare Officer (DSWO)', code: 'DSWO_AP', description: 'Final scheme sanction & DBT disbursement', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_wel_ap', departmentId: 'dept_wel_ap', title: 'Grievance Redressal Officer (AP Welfare)', code: 'GRO_WEL_AP', description: 'Tier 1 Welfare grievance inquiry', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_wel_ap', departmentId: 'dept_wel_ap', title: 'Appellate Authority (AP Welfare Grievance)', code: 'APP_WEL_AP', description: 'Tier 2 Welfare appeals & sanction review', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── KA REVENUE DESIGNATIONS ───
  { id: 'desig_vao_ka', departmentId: 'dept_rev_ka', title: 'Village Administrative Officer (VAO - Rural)', code: 'VAO_KA', description: 'Rural village desk verification (Grama Lekhiga)', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_aro_ka', departmentId: 'dept_rev_ka', title: 'Assistant Revenue Officer (ARO - Urban BBMP)', code: 'ARO_KA', description: 'Urban BBMP desk verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_ri_ka', departmentId: 'dept_rev_ka', title: 'Revenue Inspector (RI - Hobli Level)', code: 'RI_KA', description: 'Hobli spot inspection & land verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_tah_ka', departmentId: 'dept_rev_ka', title: 'Tahsildar (Taluk Head)', code: 'TAH_KA', description: 'Final Nadakacheri digital certificate approval', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_rev_ka', departmentId: 'dept_rev_ka', title: 'Grievance Redressal Officer (KA Revenue)', code: 'GRO_REV_KA', description: 'Tier 1 Bhoomi/Nadakacheri grievance inquiry', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_rev_ka', departmentId: 'dept_rev_ka', title: 'Appellate Authority (KA Revenue Grievance)', code: 'APP_REV_KA', description: 'Tier 2 Land dispute & certificate escalation', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── KA WELFARE DESIGNATIONS ───
  { id: 'desig_gpwc_ka', departmentId: 'dept_wel_ka', title: 'Gram Panchayat Welfare Co-ordinator (Rural)', code: 'GPWC_KA', description: 'Rural beneficiary eligibility verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_ucdo_ka', departmentId: 'dept_wel_ka', title: 'Urban Community Development Officer (Urban)', code: 'UCDO_KA', description: 'Urban applicant eligibility verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_two_ka', departmentId: 'dept_wel_ka', title: 'Taluk Welfare Officer (TWO)', code: 'TWO_KA', description: 'Taluk level scholarship & grant scrutiny', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_dwo_ka', departmentId: 'dept_wel_ka', title: 'District Welfare Officer (DWO)', code: 'DWO_KA', description: 'District level final benefit sanction', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_wel_ka', departmentId: 'dept_wel_ka', title: 'Grievance Redressal Officer (KA Welfare)', code: 'GRO_WEL_KA', description: 'Tier 1 Scheme grievance redressal', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_wel_ka', departmentId: 'dept_wel_ka', title: 'Appellate Authority (KA Welfare Grievance)', code: 'APP_WEL_KA', description: 'Tier 2 Scholarship & welfare escalation', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── KL REVENUE DESIGNATIONS ───
  { id: 'desig_vo_kl', departmentId: 'dept_rev_kl', title: 'Village Officer (VO - Rural)', code: 'VO_KL', description: 'Grama village desk scrutiny & inquiry', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_uvo_kl', departmentId: 'dept_rev_kl', title: 'Urban Village Officer (Urban)', code: 'UVO_KL', description: 'Municipal corporation village officer scrutiny', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_dtah_kl', departmentId: 'dept_rev_kl', title: 'Deputy Tahsildar / Special Revenue Inspector', code: 'DTAH_KL', description: 'Taluk field scrutiny & endorsement', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_tah_kl', departmentId: 'dept_rev_kl', title: 'Tahsildar (Taluk Head)', code: 'TAH_KL', description: 'Statutory e-District certificate approval', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_rev_kl', departmentId: 'dept_rev_kl', title: 'Grievance Redressal Officer (KL Revenue)', code: 'GRO_REV_KL', description: 'Tier 1 Revenue grievance investigation', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_rev_kl', departmentId: 'dept_rev_kl', title: 'Appellate Authority (KL Revenue Grievance)', code: 'APP_REV_KL', description: 'Tier 2 Revenue appellate resolution', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── KL WELFARE DESIGNATIONS ───
  { id: 'desig_veo_kl', departmentId: 'dept_wel_kl', title: 'Village Extension Officer (VEO - Rural)', code: 'VEO_KL', description: 'Rural social assistance verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_usw_kl', departmentId: 'dept_wel_kl', title: 'Urban Social Worker (Urban)', code: 'USW_KL', description: 'Urban ward social welfare verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_tsjo_kl', departmentId: 'dept_wel_kl', title: 'Taluk Social Justice Officer (TSJO)', code: 'TSJO_KL', description: 'Taluk level welfare scheme evaluation', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_dsjo_kl', departmentId: 'dept_wel_kl', title: 'District Social Justice Officer (DSJO)', code: 'DSJO_KL', description: 'District level final benefit sanction', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_wel_kl', departmentId: 'dept_wel_kl', title: 'Grievance Redressal Officer (KL Welfare)', code: 'GRO_WEL_KL', description: 'Tier 1 Social justice complaint investigation', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_wel_kl', departmentId: 'dept_wel_kl', title: 'Appellate Authority (KL Welfare Grievance)', code: 'APP_WEL_KL', description: 'Tier 2 Social justice appellate authority', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── TN REVENUE DESIGNATIONS ───
  { id: 'desig_vao_tn', departmentId: 'dept_rev_tn', title: 'Village Administrative Officer (VAO - Rural)', code: 'VAO_TN', description: 'Village desk verification & spot inquiry', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_uvao_tn', departmentId: 'dept_rev_tn', title: 'Urban VAO / Revenue Assistant (Urban GCC)', code: 'UVAO_TN', description: 'Corporation ward desk verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_ri_tn', departmentId: 'dept_rev_tn', title: 'Revenue Inspector (RI - Firka Level)', code: 'RI_TN', description: 'Firka & zone spot inspection', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_tah_tn', departmentId: 'dept_rev_tn', title: 'Zonal Deputy Tahsildar / Tahsildar', code: 'TAH_TN', description: 'e-Sevai final digital signature & issuance', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_rev_tn', departmentId: 'dept_rev_tn', title: 'Grievance Redressal Officer (TN Revenue)', code: 'GRO_REV_TN', description: 'Tier 1 e-Sevai grievance investigation', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_rev_tn', departmentId: 'dept_rev_tn', title: 'Appellate Authority (TN Revenue Grievance)', code: 'APP_REV_TN', description: 'Tier 2 Revenue appellate dispute resolution', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── TN WELFARE DESIGNATIONS ───
  { id: 'desig_vwf_tn', departmentId: 'dept_wel_tn', title: 'Village Welfare Facilitator (Rural)', code: 'VWF_TN', description: 'Rural welfare applicant verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_uwa_tn', departmentId: 'dept_wel_tn', title: 'Urban Welfare Assistant (Urban)', code: 'UWA_TN', description: 'Urban ward scheme verification', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_st_tn', departmentId: 'dept_wel_tn', title: 'Special Tahsildar (Adi Dravidar Welfare)', code: 'ST_TN', description: 'Taluk level scheme scrutiny & inquiry', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_dadwo_tn', departmentId: 'dept_wel_tn', title: 'District Adi Dravidar Welfare Officer (DADWO)', code: 'DADWO_TN', description: 'District level final grant sanction', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv1_wel_tn', departmentId: 'dept_wel_tn', title: 'Grievance Redressal Officer (TN Welfare)', code: 'GRO_WEL_TN', description: 'Tier 1 Welfare grievance investigation', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'desig_grv2_wel_tn', departmentId: 'dept_wel_tn', title: 'Appellate Authority (TN Welfare Grievance)', code: 'APP_WEL_TN', description: 'Tier 2 Welfare appeals & sanction review', createdAt: '2026-01-01T00:00:00.000Z' },
];

export const MASTER_OFFICERS: OfficerUser[] = [
  // ─── 1. AP REVENUE OFFICERS ───
  { id: 'OFF-AP-REV-VRO-01', name: 'Suresh Reddy', email: 'suresh.vro@ap.gov.in', phone: '9876543201', password: 'password123', departmentId: 'dept_rev_ap', designationId: 'desig_vro_ap', designationTitle: 'Village Revenue Officer (VRO - Rural)', assignedNodeId: 'node_cg_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-REV-WRS-01', name: 'Madhavan Varma', email: 'madhavan.wrs@ap.gov.in', phone: '9876543202', password: 'password123', departmentId: 'dept_rev_ap', designationId: 'desig_wrs_ap', designationTitle: 'Ward Revenue Secretary (WRS - Urban)', assignedNodeId: 'node_w14', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-REV-RI-01', name: 'M. Jagadeesh', email: 'jagadeesh.ri@ap.gov.in', phone: '9876543203', password: 'password123', departmentId: 'dept_rev_ap', designationId: 'desig_ri_ap', designationTitle: 'Revenue Inspector (RI)', assignedNodeId: 'node_cg_mdl', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-REV-TAH-01', name: 'D. Prabhakar Rao', email: 'prabhakar.tah@ap.gov.in', phone: '9876543204', password: 'password123', departmentId: 'dept_rev_ap', designationId: 'desig_tah_ap', designationTitle: 'Tahsildar / Mandal Revenue Officer (MRO)', assignedNodeId: 'node_tpt', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-REV-GRV1-01', name: 'C. Hemalatha', email: 'hemalatha.grv@ap.gov.in', phone: '9876543205', password: 'password123', departmentId: 'dept_rev_ap', designationId: 'desig_grv1_rev_ap', designationTitle: 'Grievance Redressal Officer (AP Revenue)', assignedNodeId: 'node_tpt', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-REV-GRV2-01', name: 'K. Rajendra Prasad', email: 'rajendra.app@ap.gov.in', phone: '9876543206', password: 'password123', departmentId: 'dept_rev_ap', designationId: 'desig_grv2_rev_ap', designationTitle: 'Appellate Authority (AP Revenue Grievance)', assignedNodeId: 'node_ap', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── 2. AP WELFARE OFFICERS ───
  { id: 'OFF-AP-WEL-WEA-01', name: 'B. Sravani', email: 'sravani.wea@ap.gov.in', phone: '9876543211', password: 'password123', departmentId: 'dept_wel_ap', designationId: 'desig_wea_ap', designationTitle: 'Welfare & Education Assistant (WEA - Rural)', assignedNodeId: 'node_cg_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-WEL-UEDS-01', name: 'N. Rajesh Babu', email: 'rajesh.ueds@ap.gov.in', phone: '9876543212', password: 'password123', departmentId: 'dept_wel_ap', designationId: 'desig_ueds_ap', designationTitle: 'Ward Education & Data Processing Secretary (Urban)', assignedNodeId: 'node_w14', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-WEL-ASWO-01', name: 'T. Rama Rao', email: 'ramarao.aswo@ap.gov.in', phone: '9876543213', password: 'password123', departmentId: 'dept_wel_ap', designationId: 'desig_aswo_ap', designationTitle: 'Assistant Social Welfare Officer (ASWO)', assignedNodeId: 'node_cg_mdl', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-WEL-DSWO-01', name: 'Dr. G. Lakshmi Narayana', email: 'lakshminarayana.dswo@ap.gov.in', phone: '9876543214', password: 'password123', departmentId: 'dept_wel_ap', designationId: 'desig_dswo_ap', designationTitle: 'District Social Welfare Officer (DSWO)', assignedNodeId: 'node_tpt', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-WEL-GRV1-01', name: 'V. Sumathi', email: 'sumathi.grv@ap.gov.in', phone: '9876543215', password: 'password123', departmentId: 'dept_wel_ap', designationId: 'desig_grv1_wel_ap', designationTitle: 'Grievance Redressal Officer (AP Welfare)', assignedNodeId: 'node_tpt', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-AP-WEL-GRV2-01', name: 'P. Venkatrami Reddy', email: 'venkatrami.app@ap.gov.in', phone: '9876543216', password: 'password123', departmentId: 'dept_wel_ap', designationId: 'desig_grv2_wel_ap', designationTitle: 'Appellate Authority (AP Welfare Grievance)', assignedNodeId: 'node_ap', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── 3. KA REVENUE OFFICERS ───
  { id: 'OFF-KA-REV-VAO-01', name: 'Basavaraj Shivappa', email: 'basavaraj.vao@ka.gov.in', phone: '9876543301', password: 'password123', departmentId: 'dept_rev_ka', designationId: 'desig_vao_ka', designationTitle: 'Village Administrative Officer (VAO - Rural)', assignedNodeId: 'node_bilikere_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-REV-ARO-01', name: 'Naveen Gowda', email: 'naveen.aro@ka.gov.in', phone: '9876543302', password: 'password123', departmentId: 'dept_rev_ka', designationId: 'desig_aro_ka', designationTitle: 'Assistant Revenue Officer (ARO - Urban BBMP)', assignedNodeId: 'node_bbmp_w150', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-REV-RI-01', name: 'Kumaraswamy H. S.', email: 'kumaraswamy.ri@ka.gov.in', phone: '9876543303', password: 'password123', departmentId: 'dept_rev_ka', designationId: 'desig_ri_ka', designationTitle: 'Revenue Inspector (RI - Hobli Level)', assignedNodeId: 'node_hunsur_taluk', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-REV-TAH-01', name: 'Manjunatha Swamy KAS', email: 'manjunath.tah@ka.gov.in', phone: '9876543304', password: 'password123', departmentId: 'dept_rev_ka', designationId: 'desig_tah_ka', designationTitle: 'Tahsildar (Taluk Head)', assignedNodeId: 'node_mys', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-REV-GRV1-01', name: 'Geetha Shivanand', email: 'geetha.grv@ka.gov.in', phone: '9876543305', password: 'password123', departmentId: 'dept_rev_ka', designationId: 'desig_grv1_rev_ka', designationTitle: 'Grievance Redressal Officer (KA Revenue)', assignedNodeId: 'node_mys', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-REV-GRV2-01', name: 'Dr. Siddalingaiah', email: 'siddalingaiah.app@ka.gov.in', phone: '9876543306', password: 'password123', departmentId: 'dept_rev_ka', designationId: 'desig_grv2_rev_ka', designationTitle: 'Appellate Authority (KA Revenue Grievance)', assignedNodeId: 'node_ka', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── 4. KA WELFARE OFFICERS ───
  { id: 'OFF-KA-WEL-GPWC-01', name: 'Sunanda Bai', email: 'sunanda.gpwc@ka.gov.in', phone: '9876543311', password: 'password123', departmentId: 'dept_wel_ka', designationId: 'desig_gpwc_ka', designationTitle: 'Gram Panchayat Welfare Co-ordinator (Rural)', assignedNodeId: 'node_bilikere_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-WEL-UCDO-01', name: 'Ranganath Murthy', email: 'ranganath.ucdo@ka.gov.in', phone: '9876543312', password: 'password123', departmentId: 'dept_wel_ka', designationId: 'desig_ucdo_ka', designationTitle: 'Urban Community Development Officer (Urban)', assignedNodeId: 'node_bbmp_w150', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-WEL-TWO-01', name: 'Ramesh H. B.', email: 'ramesh.two@ka.gov.in', phone: '9876543313', password: 'password123', departmentId: 'dept_wel_ka', designationId: 'desig_two_ka', designationTitle: 'Taluk Welfare Officer (TWO)', assignedNodeId: 'node_hunsur_taluk', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-WEL-DWO-01', name: 'Dr. Chandrashekar B. KAS', email: 'chandrashekar.dwo@ka.gov.in', phone: '9876543314', password: 'password123', departmentId: 'dept_wel_ka', designationId: 'desig_dwo_ka', designationTitle: 'District Welfare Officer (DWO)', assignedNodeId: 'node_mys', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-WEL-GRV1-01', name: 'Mahalakshmi K.', email: 'mahalakshmi.grv@ka.gov.in', phone: '9876543315', password: 'password123', departmentId: 'dept_wel_ka', designationId: 'desig_grv1_wel_ka', designationTitle: 'Grievance Redressal Officer (KA Welfare)', assignedNodeId: 'node_mys', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KA-WEL-GRV2-01', name: 'G. N. Prasanna', email: 'prasanna.app@ka.gov.in', phone: '9876543316', password: 'password123', departmentId: 'dept_wel_ka', designationId: 'desig_grv2_wel_ka', designationTitle: 'Appellate Authority (KA Welfare Grievance)', assignedNodeId: 'node_ka', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── 5. KL REVENUE OFFICERS ───
  { id: 'OFF-KL-REV-VO-01', name: 'Sajeev Kumar', email: 'sajeev.vo@kl.gov.in', phone: '9876543401', password: 'password123', departmentId: 'dept_rev_kl', designationId: 'desig_vo_kl', designationTitle: 'Village Officer (VO - Rural)', assignedNodeId: 'node_nedumangad_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-REV-UVO-01', name: 'Anil Panicker', email: 'anil.uvo@kl.gov.in', phone: '9876543402', password: 'password123', departmentId: 'dept_rev_kl', designationId: 'desig_uvo_kl', designationTitle: 'Urban Village Officer (Urban)', assignedNodeId: 'node_tvm_w12', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-REV-DTAH-01', name: 'Reshma Nair', email: 'reshma.dtah@kl.gov.in', phone: '9876543403', password: 'password123', departmentId: 'dept_rev_kl', designationId: 'desig_dtah_kl', designationTitle: 'Deputy Tahsildar / Special Revenue Inspector', assignedNodeId: 'node_nedumangad_taluk', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-REV-TAH-01', name: 'Gopalan Nambiar', email: 'gopalan.tah@kl.gov.in', phone: '9876543404', password: 'password123', departmentId: 'dept_rev_kl', designationId: 'desig_tah_kl', designationTitle: 'Tahsildar (Taluk Head)', assignedNodeId: 'node_tvm', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-REV-GRV1-01', name: 'Deepa Varghese', email: 'deepa.grv@kl.gov.in', phone: '9876543405', password: 'password123', departmentId: 'dept_rev_kl', designationId: 'desig_grv1_rev_kl', designationTitle: 'Grievance Redressal Officer (KL Revenue)', assignedNodeId: 'node_tvm', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-REV-GRV2-01', name: 'M. P. Radhakrishnan', email: 'radhakrishnan.app@kl.gov.in', phone: '9876543406', password: 'password123', departmentId: 'dept_rev_kl', designationId: 'desig_grv2_rev_kl', designationTitle: 'Appellate Authority (KL Revenue Grievance)', assignedNodeId: 'node_kl', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── 6. KL WELFARE OFFICERS ───
  { id: 'OFF-KL-WEL-VEO-01', name: 'Bindu Joseph', email: 'bindu.veo@kl.gov.in', phone: '9876543411', password: 'password123', departmentId: 'dept_wel_kl', designationId: 'desig_veo_kl', designationTitle: 'Village Extension Officer (VEO - Rural)', assignedNodeId: 'node_nedumangad_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-WEL-USW-01', name: 'Faisal Mohammed', email: 'faisal.usw@kl.gov.in', phone: '9876543412', password: 'password123', departmentId: 'dept_wel_kl', designationId: 'desig_usw_kl', designationTitle: 'Urban Social Worker (Urban)', assignedNodeId: 'node_tvm_w12', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-WEL-TSJO-01', name: 'Mini Thomas', email: 'mini.tsjo@kl.gov.in', phone: '9876543413', password: 'password123', departmentId: 'dept_wel_kl', designationId: 'desig_tsjo_kl', designationTitle: 'Taluk Social Justice Officer (TSJO)', assignedNodeId: 'node_nedumangad_taluk', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-WEL-DSJO-01', name: 'Dr. Jacob Abraham', email: 'jacob.dsjo@kl.gov.in', phone: '9876543414', password: 'password123', departmentId: 'dept_wel_kl', designationId: 'desig_dsjo_kl', designationTitle: 'District Social Justice Officer (DSJO)', assignedNodeId: 'node_tvm', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-WEL-GRV1-01', name: 'Subhadra Amma', email: 'subhadra.grv@kl.gov.in', phone: '9876543415', password: 'password123', departmentId: 'dept_wel_kl', designationId: 'desig_grv1_wel_kl', designationTitle: 'Grievance Redressal Officer (KL Welfare)', assignedNodeId: 'node_tvm', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-KL-WEL-GRV2-01', name: 'K. R. Vijayan', email: 'vijayan.app@kl.gov.in', phone: '9876543416', password: 'password123', departmentId: 'dept_wel_kl', designationId: 'desig_grv2_wel_kl', designationTitle: 'Appellate Authority (KL Welfare Grievance)', assignedNodeId: 'node_kl', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── 7. TN REVENUE OFFICERS ───
  { id: 'OFF-TN-REV-VAO-01', name: 'Senthil Murugan', email: 'senthil.vao@tn.gov.in', phone: '9876543501', password: 'password123', departmentId: 'dept_rev_tn', designationId: 'desig_vao_tn', designationTitle: 'Village Administrative Officer (VAO - Rural)', assignedNodeId: 'node_valayankulam_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-REV-UVAO-01', name: 'K. Saravanan', email: 'saravanan.uvao@tn.gov.in', phone: '9876543502', password: 'password123', departmentId: 'dept_rev_tn', designationId: 'desig_uvao_tn', designationTitle: 'Urban VAO / Revenue Assistant (Urban GCC)', assignedNodeId: 'node_gcc_w50', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-REV-RI-01', name: 'K. Anbazhagan', email: 'anbazhagan.ri@tn.gov.in', phone: '9876543503', password: 'password123', departmentId: 'dept_rev_tn', designationId: 'desig_ri_tn', designationTitle: 'Revenue Inspector (RI - Firka Level)', assignedNodeId: 'node_tpk_taluk', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-REV-TAH-01', name: 'P. Muthuraman', email: 'muthuraman.tah@tn.gov.in', phone: '9876543504', password: 'password123', departmentId: 'dept_rev_tn', designationId: 'desig_tah_tn', designationTitle: 'Zonal Deputy Tahsildar / Tahsildar', assignedNodeId: 'node_mdu', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-REV-GRV1-01', name: 'Selvi Meenakshi', email: 'meenakshi.grv@tn.gov.in', phone: '9876543505', password: 'password123', departmentId: 'dept_rev_tn', designationId: 'desig_grv1_rev_tn', designationTitle: 'Grievance Redressal Officer (TN Revenue)', assignedNodeId: 'node_mdu', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-REV-GRV2-01', name: 'Thiru R. Natarajan', email: 'natarajan.app@tn.gov.in', phone: '9876543506', password: 'password123', departmentId: 'dept_rev_tn', designationId: 'desig_grv2_rev_tn', designationTitle: 'Appellate Authority (TN Revenue Grievance)', assignedNodeId: 'node_tn', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },

  // ─── 8. TN WELFARE OFFICERS ───
  { id: 'OFF-TN-WEL-VWF-01', name: 'M. Poongodi', email: 'poongodi.vwf@tn.gov.in', phone: '9876543511', password: 'password123', departmentId: 'dept_wel_tn', designationId: 'desig_vwf_tn', designationTitle: 'Village Welfare Facilitator (Rural)', assignedNodeId: 'node_valayankulam_vil', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-WEL-UWA-01', name: 'G. Elango', email: 'elango.uwa@tn.gov.in', phone: '9876543512', password: 'password123', departmentId: 'dept_wel_tn', designationId: 'desig_uwa_tn', designationTitle: 'Urban Welfare Assistant (Urban)', assignedNodeId: 'node_gcc_w50', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-WEL-ST-01', name: 'S. Vijayalakshmi', email: 'vijayalakshmi.st@tn.gov.in', phone: '9876543513', password: 'password123', departmentId: 'dept_wel_tn', designationId: 'desig_st_tn', designationTitle: 'Special Tahsildar (Adi Dravidar Welfare)', assignedNodeId: 'node_tpk_taluk', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-WEL-DADWO-01', name: 'Dr. K. Manimaran', email: 'manimaran.dadwo@tn.gov.in', phone: '9876543514', password: 'password123', departmentId: 'dept_wel_tn', designationId: 'desig_dadwo_tn', designationTitle: 'District Adi Dravidar Welfare Officer (DADWO)', assignedNodeId: 'node_mdu', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-WEL-GRV1-01', name: 'R. Karpagam', email: 'karpagam.grv@tn.gov.in', phone: '9876543515', password: 'password123', departmentId: 'dept_wel_tn', designationId: 'desig_grv1_wel_tn', designationTitle: 'Grievance Redressal Officer (TN Welfare)', assignedNodeId: 'node_mdu', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'OFF-TN-WEL-GRV2-01', name: 'T. Dharmalingam', email: 'dharmalingam.app@tn.gov.in', phone: '9876543516', password: 'password123', departmentId: 'dept_wel_tn', designationId: 'desig_grv2_wel_tn', designationTitle: 'Appellate Authority (TN Welfare Grievance)', assignedNodeId: 'node_tn', status: 'Active', createdAt: '2026-01-01T00:00:00.000Z' },
];
