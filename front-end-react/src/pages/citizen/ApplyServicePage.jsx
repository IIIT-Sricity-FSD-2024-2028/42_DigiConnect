// src/pages/citizen/ApplyServicePage.jsx
// React concepts used: Components, Props, State (useState), Events (onClick, onChange, onSubmit),
// Lists (.map), Hooks (useState, useEffect), Forms (controlled inputs), Context (useAuth),
// Router (useNavigate, useSearchParams, Link), API calls (apiGetServices, apiSubmitApplication),
// Prop drilling (passing state down to child components), Callbacks (handling child events).

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetServices, apiSubmitApplication, apiGetGeographyTree, apiSimulatePayment } from '../../api/citizenApi';

// Member 4's child components
import ServiceCard from '../../components/citizen/ServiceCard';
import FormStepper from '../../components/citizen/FormStepper';
import DynamicField from '../../components/citizen/DynamicField';
import FileUploadDropzone from '../../components/citizen/FileUploadDropzone';
import SearchBar from '../../components/common/SearchBar';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';

const WIZARD_STEPS = [
  'Personal Details',
  'Documents',
  'Declaration',
  'Payment & Submit',
];

// Fallback schema for common services if backend service does not define custom fields
const DEFAULT_SERVICE_SCHEMAS = {
  'Income Certificate': [
    { key: 'annualIncome', label: 'Annual Family Income (₹)', type: 'number', required: true, placeholder: 'e.g. 120000' },
    { key: 'incomeSource', label: 'Income Source', type: 'select', required: true, options: ['Agriculture', 'Daily Wage', 'Salaried', 'Business', 'Pension'] },
    { key: 'occupation', label: 'Occupation', type: 'text', required: true, placeholder: 'e.g. Farmer / Private Employee' },
    { key: 'purpose', label: 'Purpose of Certificate', type: 'select', required: true, options: ['School / College Admission', 'Government Scheme', 'Bank Loan', 'Legal Purpose', 'Other'] },
  ],
  'Caste Certificate': [
    { key: 'caste', label: 'Caste', type: 'text', required: true, placeholder: 'e.g. Yadav / Reddy / Verma' },
    { key: 'subCaste', label: 'Sub-caste', type: 'text', required: false, placeholder: 'If applicable' },
    { key: 'category', label: 'Category', type: 'select', required: true, options: ['SC', 'ST', 'OBC', 'EWS', 'General'] },
    { key: 'religion', label: 'Religion', type: 'select', required: true, options: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Other'] },
    { key: 'purpose', label: 'Purpose', type: 'select', required: true, options: ['Education Reservation', 'Govt Job Reservation', 'Welfare Scheme', 'Other'] },
  ],
  'Residence Certificate': [
    { key: 'durationOfStay', label: 'Duration of Stay (Years)', type: 'number', required: true, min: 1, placeholder: 'e.g. 10' },
    { key: 'residenceType', label: 'Type of Residence', type: 'select', required: true, options: ['Own House', 'Rented', 'Government Quarters'] },
    { key: 'purpose', label: 'Purpose of Certificate', type: 'select', required: true, options: ['Domicile Proof', 'School Admission', 'Legal Purpose', 'Other'] },
  ],
  'default': [
    { key: 'remarks', label: 'Additional Information / Purpose', type: 'textarea', required: false, placeholder: 'Enter any additional details required for this application…' },
  ],
};

// ── Master Geography Datasets & Fallbacks (matching backend master-architecture) ──
const DEFAULT_STATES = [
  { id: 'state_ap', name: 'Andhra Pradesh' },
  { id: 'state_ka', name: 'Karnataka' },
  { id: 'state_kl', name: 'Kerala' },
  { id: 'state_tn', name: 'Tamil Nadu' },
];

const JURISDICTION_FALLBACK_DATA = {
  state_ap: {
    name: 'Andhra Pradesh',
    districts: [{ id: 'node_tpt', name: 'Tirupati District' }],
    RURAL: {
      tier4Label: 'Mandal',
      tier5Label: 'Village / Gram Panchayat',
      tier4: [{ id: 'node_cg_mdl', name: 'Chandragiri Mandal', districtId: 'node_tpt' }],
      leaves: {
        node_cg_mdl: [
          { id: 'node_cg_vil', name: 'Chandragiri Village' },
          { id: 'node_pn_vil', name: 'Panakam Village' },
        ],
      },
    },
    URBAN: {
      tier4Label: 'Municipal Corporation',
      tier5Label: 'Urban Ward',
      tier4: [{ id: 'node_tmc', name: 'Tirupati Municipal Corporation', districtId: 'node_tpt' }],
      leaves: {
        node_tmc: [
          { id: 'node_w14', name: 'Ward 14 - Bhavani Nagar' },
          { id: 'node_w22', name: 'Ward 22 - Korlagunta' },
        ],
      },
    },
  },
  state_ka: {
    name: 'Karnataka',
    districts: [{ id: 'node_mys', name: 'Mysuru District' }],
    RURAL: {
      tier4Label: 'Taluk',
      tier5Label: 'Village',
      tier4: [{ id: 'node_hunsur_taluk', name: 'Hunsur Taluk', districtId: 'node_mys' }],
      leaves: {
        node_hunsur_taluk: [
          { id: 'node_bilikere_vil', name: 'Bilikere Village' },
          { id: 'node_ratnapuri_vil', name: 'Ratnapuri Village' },
        ],
      },
    },
    URBAN: {
      tier4Label: 'City Corporation',
      tier5Label: 'Urban Ward',
      tier4: [{ id: 'node_bbmp', name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)', districtId: 'node_mys' }],
      leaves: {
        node_bbmp: [
          { id: 'node_bbmp_w150', name: 'Ward 150 - Bellandur' },
          { id: 'node_bbmp_w174', name: 'Ward 174 - HSR Layout' },
        ],
      },
    },
  },
  state_kl: {
    name: 'Kerala',
    districts: [{ id: 'node_tvm', name: 'Thiruvananthapuram District' }],
    RURAL: {
      tier4Label: 'Taluk',
      tier5Label: 'Village',
      tier4: [{ id: 'node_ned_taluk', name: 'Nedumangad Taluk', districtId: 'node_tvm' }],
      leaves: {
        node_ned_taluk: [
          { id: 'node_vembayam_vil', name: 'Vembayam Village' },
          { id: 'node_karakulam_vil', name: 'Karakulam Village' },
        ],
      },
    },
    URBAN: {
      tier4Label: 'Municipal Corporation',
      tier5Label: 'Urban Ward',
      tier4: [{ id: 'node_tvm_corp', name: 'Thiruvananthapuram Municipal Corporation', districtId: 'node_tvm' }],
      leaves: {
        node_tvm_corp: [
          { id: 'node_tvm_w12', name: 'Ward 12 - Palayam' },
          { id: 'node_tvm_w18', name: 'Ward 18 - Pattom' },
        ],
      },
    },
  },
  state_tn: {
    name: 'Tamil Nadu',
    districts: [{ id: 'node_madurai', name: 'Madurai District' }],
    RURAL: {
      tier4Label: 'Taluk',
      tier5Label: 'Village',
      tier4: [{ id: 'node_tpk_taluk', name: 'Thiruparankundram Taluk', districtId: 'node_madurai' }],
      leaves: {
        node_tpk_taluk: [
          { id: 'node_valayankulam_vil', name: 'Valayankulam Village' },
          { id: 'node_nilaiyur_vil', name: 'Nilaiyur Village' },
        ],
      },
    },
    URBAN: {
      tier4Label: 'City Corporation',
      tier5Label: 'Urban Ward',
      tier4: [{ id: 'node_gcc', name: 'Greater Chennai Corporation (GCC)', districtId: 'node_madurai' }],
      leaves: {
        node_gcc: [
          { id: 'node_gcc_w50', name: 'Ward 50 - Royapuram' },
          { id: 'node_gcc_w114', name: 'Ward 114 - T. Nagar' },
        ],
      },
    },
  },
};

/**
 * Traverses a backend recursive jurisdiction tree and categorizes nodes by tierLevel.
 */
function extractJurisdictionsFromTree(treeNodes, areaType = 'RURAL') {
  const districts = [];
  const tier4Map = {};
  const leavesMap = {};

  const targetArea = (areaType || 'RURAL').toUpperCase();

  const traverse = (node, currentDistrictId, currentTier4Id) => {
    if (!node) return;

    let distId = currentDistrictId;
    let t4Id = currentTier4Id;

    const tier = (node.tierLevel || '').toUpperCase();
    const govType = (node.governanceType || node.areaType || '').toUpperCase();
    const matchesArea = !govType || govType === 'COMMON' || govType === targetArea;

    if (tier === 'DISTRICT') {
      distId = node.id;
      if (!districts.some((d) => d.id === node.id)) {
        districts.push({ id: node.id, name: node.name });
      }
    } else if (
      tier === 'MANDAL' ||
      tier === 'MUNICIPALITY' ||
      tier === 'MUNICIPAL_CORP' ||
      tier === 'TALUK' ||
      node.id.includes('mdl') ||
      node.id.includes('man') ||
      node.id.includes('taluk') ||
      node.id.includes('tmc') ||
      node.id.includes('corp') ||
      node.id.includes('bbmp') ||
      node.id.includes('gcc')
    ) {
      if (matchesArea && distId) {
        t4Id = node.id;
        if (!tier4Map[distId]) tier4Map[distId] = [];
        if (!tier4Map[distId].some((t) => t.id === node.id)) {
          tier4Map[distId].push({ id: node.id, name: node.name, areaType: govType });
        }
      }
    } else if (
      tier === 'VILLAGE' ||
      tier === 'WARD' ||
      node.id.includes('vil') ||
      node.id.includes('ward') ||
      node.id.startsWith('node_w') ||
      node.id.includes('_w')
    ) {
      if (matchesArea && t4Id) {
        if (!leavesMap[t4Id]) leavesMap[t4Id] = [];
        if (!leavesMap[t4Id].some((l) => l.id === node.id)) {
          leavesMap[t4Id].push({ id: node.id, name: node.name });
        }
      }
    }

    if (Array.isArray(node.children)) {
      node.children.forEach((child) => traverse(child, distId, t4Id));
    }
  };

  (Array.isArray(treeNodes) ? treeNodes : [treeNodes]).forEach((root) =>
    traverse(root, null, null)
  );

  return { districts, tier4Map, leavesMap };
}

/**
 * Resolves the authenticated citizen's state jurisdiction
 */
function getCitizenStateId(user) {
  if (!user) return 'state_ap';
  if (user.stateId) return user.stateId.toLowerCase();

  const stateStr = (user.state || user.stateName || '').toLowerCase();
  if (stateStr.includes('andhra') || stateStr === 'ap') return 'state_ap';
  if (stateStr.includes('karn') || stateStr === 'ka') return 'state_ka';
  if (stateStr.includes('keral') || stateStr === 'kl') return 'state_kl';
  if (stateStr.includes('tamil') || stateStr === 'tn') return 'state_tn';

  const idStr = (user.id || '').toUpperCase();
  if (idStr.includes('-AP-') || idStr.includes('_AP_')) return 'state_ap';
  if (idStr.includes('-KA-') || idStr.includes('_KA_')) return 'state_ka';
  if (idStr.includes('-KL-') || idStr.includes('_KL_')) return 'state_kl';
  if (idStr.includes('-TN-') || idStr.includes('_TN_')) return 'state_tn';

  const juris = (user.jurisdiction || user.assignedNodeId || '').toLowerCase();
  if (juris.includes('_ap') || juris.includes('_cg_') || juris.includes('_tpt')) return 'state_ap';
  if (juris.includes('_ka') || juris.includes('_mys') || juris.includes('_bbmp')) return 'state_ka';
  if (juris.includes('_kl') || juris.includes('_tvm') || juris.includes('_ned_')) return 'state_kl';
  if (juris.includes('_tn') || juris.includes('_madurai') || juris.includes('_gcc')) return 'state_tn';

  return 'state_ap';
}

function getStateDisplayName(stateId) {
  const s = (stateId || '').toLowerCase();
  if (s === 'state_ap') return 'Andhra Pradesh';
  if (s === 'state_ka') return 'Karnataka';
  if (s === 'state_kl') return 'Kerala';
  if (s === 'state_tn') return 'Tamil Nadu';
  return 'All Jurisdictions';
}

export default function ApplyServicePage() {
  // ── 1. Context & Router ──
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Citizen State Jurisdiction
  const citizenStateId = getCitizenStateId(user);

  // ── 2. State ──
  // Backend services catalog & loading/error
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState(null);

  // Filter and search state for Step 0
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Multi-step wizard state
  const [selectedService, setSelectedService] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal & Address details form state (manual entry, no auto-fill)
  const [applicantInfo, setApplicantInfo] = useState({
    firstName: '',
    lastName: '',
    aadhaar: '',
    dob: '',
    gender: 'Male',
    guardianName: '',
    mobile: '',
    email: '',
    street: '',
    pincode: '',
    areaType: 'RURAL',
    stateId: citizenStateId || 'state_ap',
    district: '',
    subDivision: '',
    tier4: '',
    leafNode: '',
  });

  // Step 1: Dynamic service-specific fields state
  const [dynamicAnswers, setDynamicAnswers] = useState({});

  // Step 2: Uploaded documents state (map: docName -> File object)
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Step 3: Declaration checkboxes state
  const [declarations, setDeclarations] = useState({
    decl1: false,
    decl2: false,
    decl3: false,
  });

  // Step 4: Payment method state
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Success state
  const [submittedAppId, setSubmittedAppId] = useState(null);

  // Unified Toast & Validation Feedback States
  const { toast, showToast, hideToast } = useToast();
  const [personalErrors, setPersonalErrors] = useState({});
  const [docErrors, setDocErrors] = useState({});
  const [declError, setDeclError] = useState('');

  // ── 3. Effects: Fetch services from backend & auto-fill citizen details ──
  useEffect(() => {
    async function loadServices() {
      try {
        setLoadingServices(true);
        setServiceError(null);
        const res = await apiGetServices();
        const data = Array.isArray(res) ? res : res?.data || [];
        setServices(data);
      } catch (err) {
        setServiceError(err.message || 'Failed to load services');
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  // Sync category filter from URL parameter (e.g. /citizen/apply?type=welfare)
  useEffect(() => {
    const urlType = searchParams.get('type');
    if (urlType) {
      const typeMap = {
        certificate: 'Certificate',
        welfare: 'Welfare',
        permission: 'Permission',
        correction: 'Correction',
      };
      if (typeMap[urlType.toLowerCase()]) {
        setSelectedCategory(typeMap[urlType.toLowerCase()]);
      }
    }
  }, [searchParams]);

  // Synchronize stateId jurisdiction without auto-filling citizen personal details
  useEffect(() => {
    if (user) {
      const detectedStateId = getCitizenStateId(user);
      setApplicantInfo((prev) => ({
        ...prev,
        stateId: detectedStateId || prev.stateId || 'state_ap',
      }));
    }
  }, [user]);

  // ── Dynamic Geography & Cascading Jurisdiction State ──
  const [geoData, setGeoData] = useState(() => {
    const fb = JURISDICTION_FALLBACK_DATA['state_ap'];
    const r = fb.RURAL;
    return {
      districts: fb.districts,
      tier4Map: { [fb.districts[0].id]: r.tier4 },
      leavesMap: r.leaves,
    };
  });

  // Fetch live geography tree whenever selected state or area type changes
  useEffect(() => {
    let isMounted = true;
    async function fetchTree() {
      try {
        const res = await apiGetGeographyTree(applicantInfo.stateId || 'state_ap');
        const tree = Array.isArray(res) ? res : res?.data || [];
        if (tree.length > 0 && isMounted) {
          const parsed = extractJurisdictionsFromTree(tree, applicantInfo.areaType);
          if (parsed.districts.length > 0) {
            setGeoData(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not load geography tree, using fallback hierarchy:', err);
      }
    }

    fetchTree();
    return () => {
      isMounted = false;
    };
  }, [applicantInfo.stateId, applicantInfo.areaType]);

  const fallback =
    JURISDICTION_FALLBACK_DATA[applicantInfo.stateId] || JURISDICTION_FALLBACK_DATA['state_ap'];
  const fallbackArea = fallback[applicantInfo.areaType] || fallback.RURAL;

  const currentDistricts =
    geoData.districts && geoData.districts.length > 0 ? geoData.districts : fallback.districts;

  const activeDistrictId = applicantInfo.district || currentDistricts[0]?.id || 'node_tpt';

  const currentTier4List =
    geoData.tier4Map?.[activeDistrictId] && geoData.tier4Map[activeDistrictId].length > 0
      ? geoData.tier4Map[activeDistrictId]
      : fallbackArea.tier4;

  const activeTier4Id = applicantInfo.tier4 || currentTier4List[0]?.id || '';

  const currentLeavesList =
    geoData.leavesMap?.[activeTier4Id] && geoData.leavesMap[activeTier4Id].length > 0
      ? geoData.leavesMap[activeTier4Id]
      : fallbackArea.leaves?.[activeTier4Id] || Object.values(fallbackArea.leaves || {})[0] || [];

  const tier4Label =
    applicantInfo.areaType === 'RURAL' ? 'Mandal / Taluk' : 'Municipal Corporation / Zone';
  const leafLabel =
    applicantInfo.areaType === 'RURAL' ? 'Village / Gram Panchayat' : 'Urban Ward (Leaf Node)';

  // Synchronize downstream jurisdiction selections when parent level changes
  useEffect(() => {
    setApplicantInfo((prev) => {
      const distValid = currentDistricts.some((d) => d.id === prev.district);
      const nextDist = distValid ? prev.district : currentDistricts[0]?.id || '';

      const tier4ForDist =
        geoData.tier4Map?.[nextDist] && geoData.tier4Map[nextDist].length > 0
          ? geoData.tier4Map[nextDist]
          : fallbackArea.tier4;
      const tier4Valid = tier4ForDist.some((t) => t.id === prev.tier4);
      const nextTier4 = tier4Valid ? prev.tier4 : tier4ForDist[0]?.id || '';

      const leavesForTier4 =
        geoData.leavesMap?.[nextTier4] && geoData.leavesMap[nextTier4].length > 0
          ? geoData.leavesMap[nextTier4]
          : fallbackArea.leaves?.[nextTier4] || Object.values(fallbackArea.leaves || {})[0] || [];
      const leafValid = leavesForTier4.some((l) => l.id === prev.leafNode);
      const nextLeaf = leafValid ? prev.leafNode : leavesForTier4[0]?.id || '';

      if (nextDist === prev.district && nextTier4 === prev.tier4 && nextLeaf === prev.leafNode) {
        return prev;
      }

      return {
        ...prev,
        district: nextDist,
        tier4: nextTier4,
        leafNode: nextLeaf,
      };
    });
  }, [applicantInfo.stateId, applicantInfo.areaType, activeDistrictId, activeTier4Id, currentDistricts, currentTier4List, currentLeavesList, fallbackArea]);

  // ── 4. Callbacks: Step 0 (Service Selection) ──
  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentStep(1);
    setDynamicAnswers({});
    setUploadedFiles({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetService = () => {
    setSelectedService(null);
    setCurrentStep(1);
    setSubmittedAppId(null);
    setSubmitError(null);
  };

  // Auto-select service if serviceId query param is passed in URL (e.g. from featured scheme banner)
  useEffect(() => {
    const urlServiceId = searchParams.get('serviceId');
    if (urlServiceId && services.length > 0 && !selectedService) {
      const match = services.find((s) => s.id === urlServiceId);
      if (match) {
        handleSelectService(match);
      }
    }
  }, [searchParams, services, selectedService]);

  // ── 5. Callbacks: Step 1 (Applicant Info & Dynamic Inputs) ──
  const handleApplicantInfoChange = (e) => {
    const { name, value } = e.target;
    setApplicantInfo((prev) => ({ ...prev, [name]: value }));
    if (personalErrors[name]) {
      setPersonalErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleDynamicFieldChange = (fieldKey, value) => {
    setDynamicAnswers((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleStep1Continue = (e) => {
    e.preventDefault();
    const errors = {};
    if (!applicantInfo.firstName?.trim()) errors.firstName = 'First Name is required.';
    if (!applicantInfo.aadhaar?.trim()) errors.aadhaar = 'Aadhaar Number is required.';
    if (!applicantInfo.mobile?.trim()) errors.mobile = 'Mobile Number is required.';
    if (!applicantInfo.dob?.trim()) errors.dob = 'Date of Birth is required.';

    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      showToast('Please fill all mandatory personal information fields marked with *', 'warning');
      return;
    }
    setPersonalErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 6. Callbacks: Step 2 (Document Uploads) ──
  const handleFileUpload = (docName, file) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      if (file) {
        copy[docName] = file;
      } else {
        delete copy[docName];
      }
      return copy;
    });
    if (file && docErrors[docName]) {
      setDocErrors((prev) => {
        const copy = { ...prev };
        delete copy[docName];
        return copy;
      });
    }
  };

  const handleStep2Continue = () => {
    const missingDocs = requiredDocs.filter((doc) => !uploadedFiles[doc]);
    if (missingDocs.length > 0) {
      const errMap = {};
      missingDocs.forEach((doc) => {
        errMap[doc] = `${doc} is mandatory. Please upload a document.`;
      });
      setDocErrors(errMap);
      showToast('Please upload all required supporting documents before proceeding.', 'warning');
      return;
    }
    setDocErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 7. Callbacks: Step 3 (Declaration) ──
  const handleDeclarationChange = (declKey) => {
    setDeclarations((prev) => ({ ...prev, [declKey]: !prev[declKey] }));
    setDeclError('');
  };

  const handleStep3Continue = () => {
    if (!declarations.decl1 || !declarations.decl2 || !declarations.decl3) {
      setDeclError('Please accept all declaration conditions before proceeding to payment.');
      showToast('Please accept all declaration conditions before proceeding to payment.', 'warning');
      return;
    }
    setDeclError('');
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Save Draft Helper ──
  const handleSaveDraft = () => {
    try {
      const draft = {
        serviceId: selectedService?.id,
        applicantInfo,
        dynamicAnswers,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`digiconnect_draft_${selectedService?.id || 'service'}`, JSON.stringify(draft));
      showToast('Draft application saved successfully!', 'success');
    } catch {
      showToast('Failed to save draft application.', 'error');
    }
  };

  // ── 8. Callbacks: Step 4 (Payment & Final Submission) ──
  const handleSubmitApplication = async () => {
    if (!selectedService) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Assemble payload matching backend CreateApplicationDto
      const feeAmount = Number(selectedService.fee ?? selectedService.totalFee ?? 0);
      // Real payment simulation handshake if fee > 0
      let transactionId = 'TXN-EXEMPT-000';
      if (feeAmount > 0) {
        try {
          const paymentStateId = applicantInfo.stateId || selectedService.stateId || user?.stateId;
          const payRes = await apiSimulatePayment(selectedService.id, user?.id || 'CIT-1001', feeAmount, paymentStateId);
          transactionId = payRes?.transactionId || `TXN-${Math.floor(1000000 + Math.random() * 9000000)}A`;
        } catch (payErr) {
          console.warn('Payment simulation fallback:', payErr.message);
          transactionId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}A`;
        }
      }

      // Check if actual File instances were uploaded to send via FormData
      const hasRealFiles = Object.values(uploadedFiles).some((f) => f instanceof File);

      let payload;
      if (hasRealFiles) {
        const fd = new FormData();
        fd.append('serviceId', selectedService.id);
        fd.append('citizenId', user?.id || 'CIT-1001');
        if (selectedService.dept) fd.append('dept', selectedService.dept);
        fd.append('fee', String(feeAmount));
        fd.append('paymentMethod', paymentMethod);
        fd.append('paymentTransactionId', transactionId);
        fd.append('selectedJurisdictionNodeId', applicantInfo.leafNode || 'node_cg_vil');
        fd.append(
          'formData',
          JSON.stringify({
            ...applicantInfo,
            ...dynamicAnswers,
          })
        );

        // Append actual binary files under 'documents' field for NestJS Multer FilesInterceptor
        Object.keys(uploadedFiles).forEach((docName) => {
          const file = uploadedFiles[docName];
          if (file instanceof File) {
            fd.append('documents', file);
          }
        });

        payload = fd;
      } else {
        payload = {
          serviceId: selectedService.id,
          citizenId: user?.id || 'CIT-1001',
          dept: selectedService.dept,
          fee: feeAmount,
          paymentMethod: paymentMethod,
          paymentTransactionId: transactionId,
          selectedJurisdictionNodeId: applicantInfo.leafNode || 'node_cg_vil',
          formData: {
            ...applicantInfo,
            ...dynamicAnswers,
          },
          documents: Object.keys(uploadedFiles).map((docName) => ({
            name: docName,
            fileName: uploadedFiles[docName]?.name || docName,
            size: uploadedFiles[docName]?.size || 0,
          })),
        };
      }

      const res = await apiSubmitApplication(payload);
      const createdApp = res?.data || res;
      setSubmittedAppId(createdApp?.id || 'APP-' + Math.floor(10000 + Math.random() * 90000));
      showToast('Application submitted successfully!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 9. Filtered Services for Step 0 (Filtered by Citizen Jurisdiction) ──
  const filteredServices = services
    .filter((s) => s.status === 'Active' || s.status === 'ACTIVE' || !s.status)
    // Filter strictly by the citizen's jurisdiction (e.g. AP citizen sees only AP services)
    .filter((s) => {
      if (!citizenStateId || citizenStateId === 'all') return true;
      const sState = (s.stateId || '').toLowerCase();
      if (sState === 'central' || sState === 'all' || sState === 'national') return true;
      if (sState === citizenStateId) return true;

      // Suffix check for department, code or service ID (e.g., _ap, _ka, _kl, _tn)
      const suffix = citizenStateId.replace('state_', '');
      if ((s.departmentId || '').toLowerCase().endsWith(`_${suffix}`)) return true;
      if ((s.code || '').toLowerCase().endsWith(`_${suffix}`)) return true;
      if ((s.id || '').toLowerCase().endsWith(`_${suffix}`)) return true;
      return false;
    })
    .filter((s) => {
      if (selectedCategory === 'all') return true;
      const cat = (s.cat || s.category || '').toLowerCase();
      return cat === selectedCategory.toLowerCase();
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.code || '').toLowerCase().includes(q) ||
        (s.desc || s.description || '').toLowerCase().includes(q) ||
        (s.dept || s.departmentName || s.departmentId || '').toLowerCase().includes(q)
      );
    });

  // Dynamic schema resolution
  const serviceFields =
    selectedService?.fields && selectedService.fields.length > 0
      ? selectedService.fields
      : DEFAULT_SERVICE_SCHEMAS[selectedService?.name] || DEFAULT_SERVICE_SCHEMAS['default'];

  // Required docs resolution (handle both string array and object array with { name })
  const requiredDocs =
    selectedService?.docs && selectedService.docs.length > 0
      ? selectedService.docs.map((d) => (typeof d === 'string' ? d : d.name))
      : ['Identity Proof (Aadhaar Card)', 'Address Proof (Ration Card / Voter ID)'];

  // Fee breakdown calculations
  const srvFee = Number(selectedService?.serviceFee ?? selectedService?.fee ?? 0);
  const platFee = Number(selectedService?.platformFee ?? 15);
  const totalServiceFee = Number(selectedService?.totalFee ?? (srvFee + platFee));
  const serviceFee = srvFee > 0 ? srvFee : (totalServiceFee > platFee ? totalServiceFee - platFee : totalServiceFee);
  const processingCharge = platFee;
  const gstAmount = Math.round((serviceFee + processingCharge) * 0.18);
  const totalPayable = serviceFee + processingCharge + gstAmount;

  // ─────────────────────────────────────────────────────────────
  // RENDER: SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────
  if (submittedAppId) {
    return (
      <div style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        <Toast toast={toast} onClose={hideToast} />
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          {/* Green check icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'var(--green-100)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-xl)',
            }}
          >
            <svg width="40" height="40" fill="none" stroke="var(--green-500)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: 'var(--space-sm)' }}>
            Application Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
            Your application for <strong>{selectedService?.name}</strong> has been received and routed to the assigned department officer.
          </p>

          {/* Reference Card */}
          <div
            style={{
              background: 'var(--navy-50)',
              border: '2px solid var(--navy-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)',
              display: 'inline-block',
              marginBottom: 'var(--space-xl)',
              minWidth: '280px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--navy-500)', marginBottom: '4px' }}>
              Application Reference ID
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {submittedAppId}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Expected processing SLA: <strong>{selectedService?.sla || 7} working days</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/citizen/track?id=${submittedAppId}`)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Track Application
            </button>
            <button type="button" className="btn btn-outline" onClick={handleResetService}>
              Apply for Another Service
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/citizen/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: STEP 0 — SERVICE SELECTION CATALOG
  // ─────────────────────────────────────────────────────────────
  if (!selectedService) {
    return (
      <div id="stepServiceSelect">
        <Toast toast={toast} onClose={hideToast} />
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--navy-50)',
                border: '1px solid var(--navy-200)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 14px',
                marginBottom: '10px',
                fontSize: '0.8125rem',
                color: 'var(--navy-800)',
                fontWeight: 600,
              }}
            >
              <span>📍 Jurisdiction:</span>
              <strong style={{ color: 'var(--navy-900)' }}>{getStateDisplayName(citizenStateId)}</strong>
              {user?.district ? ` (${user.district})` : ''}
              <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Active State Services Only
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
              Choose a Service
            </h1>
            <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Showing verified government services available under <strong>{getStateDisplayName(citizenStateId)}</strong> jurisdiction.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ maxWidth: '480px', marginBottom: 'var(--space-xl)' }}>
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search services e.g. Income, Caste, Permission…"
          />
        </div>

        {/* Category Tabs */}
        <div className="tabs" style={{ marginBottom: 'var(--space-xl)' }}>
          {[
            { id: 'all', label: 'All Services' },
            { id: 'Certificate', label: 'Certificates' },
            { id: 'Welfare', label: 'Welfare & Subsidies' },
            { id: 'Permission', label: 'Permissions' },
            { id: 'Correction', label: 'Record Corrections' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`tab-btn ${selectedCategory === cat.id ? 'active' : ''}`.trim()}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {serviceError && (
          <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
            {serviceError}
          </div>
        )}

        {/* Loading Spinner / State */}
        {loadingServices ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            <p>Loading available government services from backend…</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            No services found for {getStateDisplayName(citizenStateId)} matching your criteria.
          </div>
        ) : (
          /* Grid of Service Cards using Member 4's ServiceCard component */
          <div
            id="serviceCardsGrid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)',
            }}
          >
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={handleSelectService}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: STEPS 1 to 4 — APPLICATION WIZARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div id="applicationForm">
      {/* Selected Service Banner */}
      <div
        id="selectedServiceBanner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: 'var(--space-xl)',
          padding: 'var(--space-md) var(--space-lg)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div
            className="service-card-icon"
            style={{
              width: '44px',
              height: '44px',
              background: 'var(--navy-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <svg width="22" height="22" fill="none" stroke="var(--navy-600)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {selectedService.name}
              {selectedService.code && (
                <span className="badge badge-purple" style={{ marginLeft: '8px', fontSize: '0.75rem' }}>
                  {selectedService.code}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <span>{selectedService.dept || selectedService.departmentName || 'Revenue Department'}</span>
              &nbsp;·&nbsp; SLA: <strong>{selectedService.sla || selectedService.slaDays || 7} days</strong>
              &nbsp;·&nbsp; Fee: <strong>{totalServiceFee === 0 ? 'Free' : `₹${totalServiceFee}`}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleSaveDraft} title="Save current form draft">
            💾 Save Draft
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleResetService}>
            ← Choose Different Service
          </button>
        </div>
      </div>

      {/* Multi-Step Wizard Progress Stepper */}
      <FormStepper steps={WIZARD_STEPS} currentStep={currentStep} />

      {/* Global Error Banner */}
      {submitError && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-lg)' }}>
          {submitError}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: Personal Details & Service-Specific Information
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <form onSubmit={handleStep1Continue}>
          {/* Section 1: Personal Info */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">1</div>
              <div>
                <div className="form-section-title">Applicant Information</div>
              </div>
            </div>
            <div className="form-section-body">
              <div className="alert alert-info" style={{ marginBottom: 'var(--space-lg)' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fields marked with * are mandatory for processing.
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    name="firstName"
                    value={applicantInfo.firstName}
                    onChange={handleApplicantInfoChange}
                    required
                  />
                  {personalErrors.firstName && <div className="field-error">{personalErrors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    name="lastName"
                    value={applicantInfo.lastName}
                    onChange={handleApplicantInfoChange}
                    required
                  />
                  {personalErrors.lastName && <div className="field-error">{personalErrors.lastName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    name="aadhaar"
                    maxLength="12"
                    placeholder="12 digit Aadhaar number"
                    value={applicantInfo.aadhaar}
                    onChange={handleApplicantInfoChange}
                    required
                  />
                  {personalErrors.aadhaar && <div className="field-error">{personalErrors.aadhaar}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth <span className="required">*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    name="dob"
                    value={applicantInfo.dob}
                    onChange={handleApplicantInfoChange}
                    required
                  />
                  {personalErrors.dob && <div className="field-error">{personalErrors.dob}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Gender <span className="required">*</span></label>
                  <select
                    className="form-input"
                    name="gender"
                    value={applicantInfo.gender}
                    onChange={handleApplicantInfoChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Father / Husband Name</label>
                  <input
                    type="text"
                    className="form-input"
                    name="guardianName"
                    value={applicantInfo.guardianName}
                    onChange={handleApplicantInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    className="form-input"
                    name="mobile"
                    maxLength="10"
                    placeholder="10 digit mobile number"
                    value={applicantInfo.mobile}
                    onChange={handleApplicantInfoChange}
                    required
                  />
                  {personalErrors.mobile && <div className="field-error">{personalErrors.mobile}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    value={applicantInfo.email}
                    onChange={handleApplicantInfoChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Residential Address & Jurisdiction Selector */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">2</div>
              <div>
                <div className="form-section-title">Residential Address & Jurisdiction</div>
                <div className="form-section-subtitle">Specifies which field verification officer reviews this application.</div>
              </div>
            </div>
            <div className="form-section-body">
              {/* Area Type Toggle */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 'var(--space-md)' }}>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>Jurisdiction Type *</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="areaType"
                      value="RURAL"
                      checked={applicantInfo.areaType === 'RURAL'}
                      onChange={handleApplicantInfoChange}
                    />
                    🌾 Rural Jurisdiction
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="areaType"
                      value="URBAN"
                      checked={applicantInfo.areaType === 'URBAN'}
                      onChange={handleApplicantInfoChange}
                    />
                    🏙️ Urban Jurisdiction
                  </label>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group col-span-full">
                  <label className="form-label">Door No / Street / Locality <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    name="street"
                    placeholder="Enter full block/street details"
                    value={applicantInfo.street}
                    onChange={handleApplicantInfoChange}
                    required
                  />
                </div>
                {/* Dynamic State Selector */}
                <div className="form-group">
                  <label className="form-label">State <span className="required">*</span></label>
                  <select
                    className="form-input"
                    name="stateId"
                    value={applicantInfo.stateId}
                    onChange={handleApplicantInfoChange}
                    required
                  >
                    {DEFAULT_STATES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic District Selector */}
                <div className="form-group">
                  <label className="form-label">District <span className="required">*</span></label>
                  <select
                    className="form-input"
                    name="district"
                    value={applicantInfo.district}
                    onChange={handleApplicantInfoChange}
                    required
                  >
                    {currentDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Mandal / Municipal Corporation Selector */}
                <div className="form-group">
                  <label className="form-label">
                    {tier4Label} <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    name="tier4"
                    value={applicantInfo.tier4}
                    onChange={handleApplicantInfoChange}
                    required
                  >
                    {currentTier4List.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Village / Ward (Leaf Node) Selector */}
                <div className="form-group">
                  <label className="form-label">
                    {leafLabel} <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    name="leafNode"
                    value={applicantInfo.leafNode}
                    onChange={handleApplicantInfoChange}
                    required
                  >
                    {currentLeavesList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PIN Code */}
                <div className="form-group">
                  <label className="form-label">PIN Code <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    name="pincode"
                    maxLength="6"
                    value={applicantInfo.pincode}
                    onChange={handleApplicantInfoChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Service-Specific Fields */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">3</div>
              <div>
                <div className="form-section-title">{selectedService.name} — Specific Information</div>
                <div className="form-section-subtitle">Particular details demanded specifically by this department.</div>
              </div>
            </div>
            <div className="form-section-body">
              <div className="form-grid">
                {serviceFields.map((field) => (
                  <DynamicField
                    key={field.key || field.id}
                    field={field}
                    value={dynamicAnswers[field.key || field.id] || ''}
                    onChange={handleDynamicFieldChange}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <button type="submit" className="btn btn-primary">
              Continue to Documents
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: Document Uploads
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div>
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">1</div>
              <div>
                <div className="form-section-title">Upload Required Documents</div>
                <div className="form-section-subtitle">
                  Upload clear, legible proofs. Supported formats: PDF, JPG, PNG (Max 5 MB each).
                </div>
              </div>
            </div>
            <div className="form-section-body">
              {requiredDocs.map((docLabel) => (
                <div key={docLabel}>
                  <FileUploadDropzone
                    label={docLabel}
                    required={true}
                    file={uploadedFiles[docLabel] || null}
                    onFileSelect={(file) => handleFileUpload(docLabel, file)}
                  />
                  {docErrors[docLabel] && (
                    <div className="field-error" style={{ marginTop: '-8px', marginBottom: 'var(--space-md)' }}>
                      {docErrors[docLabel]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Optional Document */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">2</div>
              <div>
                <div className="form-section-title">Additional Supporting Document (Optional)</div>
                <div className="form-section-subtitle">Upload any other supporting certification you feel is relevant.</div>
              </div>
            </div>
            <div className="form-section-body">
              <FileUploadDropzone
                label="Other Relevant Attachment"
                required={false}
                file={uploadedFiles['Other Attachment'] || null}
                onFileSelect={(file) => handleFileUpload('Other Attachment', file)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(1)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary" onClick={handleStep2Continue}>
              Continue to Declaration
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: Review & Declaration
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div>
          {/* Review Summary */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">1</div>
              <div>
                <div className="form-section-title">Review Application Summary</div>
                <div className="form-section-subtitle">Carefully check the entered information before signing declaration.</div>
              </div>
            </div>
            <div className="form-section-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                {/* Personal Card */}
                <div className="review-card">
                  <div className="review-card-title">Personal Information</div>
                  <div className="review-row">
                    <span className="review-label">Full Name</span>
                    <span className="review-value">{applicantInfo.firstName} {applicantInfo.lastName}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Aadhaar</span>
                    <span className="review-value">{applicantInfo.aadhaar || '—'}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Date of Birth</span>
                    <span className="review-value">{applicantInfo.dob || '—'}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Mobile</span>
                    <span className="review-value">{applicantInfo.mobile || '—'}</span>
                  </div>
                </div>

                {/* Address Card */}
                <div className="review-card">
                  <div className="review-card-title">Address & Jurisdiction</div>
                  <div className="review-row">
                    <span className="review-label">Street</span>
                    <span className="review-value">{applicantInfo.street || '—'}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Area Type</span>
                    <span className="review-value">{applicantInfo.areaType}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">PIN Code</span>
                    <span className="review-value">{applicantInfo.pincode || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Service Details Card */}
              <div className="review-card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="review-card-title">Service Details</div>
                <div className="review-row">
                  <span className="review-label">Service Name</span>
                  <span className="review-value" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>{selectedService.name}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Department</span>
                  <span className="review-value">{selectedService.dept}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Processing SLA</span>
                  <span className="review-value">{selectedService.sla || 7} Working Days</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Documents Attached</span>
                  <span className="review-value">{Object.keys(uploadedFiles).length} files</span>
                </div>
              </div>
            </div>
          </div>

          {/* Declaration Checkboxes */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">2</div>
              <div>
                <div className="form-section-title">Declaration & Terms</div>
                <div className="form-section-subtitle">Read and accept the declaration conditions before submitting.</div>
              </div>
            </div>
            <div className="form-section-body">
              <div
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-lg)',
                  fontSize: '0.875rem',
                  lineHeight: 1.8,
                  color: 'var(--slate-700)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                I, the undersigned, hereby solemnly affirm and declare that all particulars entered in this application
                and accompanying attachments are complete, authentic, and truthful. I understand that any deliberate
                misrepresentation will lead to summary rejection and legal action under the Information Technology Act.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={declarations.decl1}
                    onChange={() => handleDeclarationChange('decl1')}
                    style={{ marginTop: '3px', accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                    I declare that all submitted information is accurate and verified.
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={declarations.decl2}
                    onChange={() => handleDeclarationChange('decl2')}
                    style={{ marginTop: '3px', accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                    I consent to on-ground field inspection by the assigned verification officer.
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={declarations.decl3}
                    onChange={() => handleDeclarationChange('decl3')}
                    style={{ marginTop: '3px', accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                    I agree to DigiConnect’s Terms of Service and Privacy Policy.
                  </span>
                </label>
              </div>
              {declError && (
                <div className="field-error" style={{ marginTop: 'var(--space-md)', fontSize: '0.8125rem' }}>
                  {declError}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(2)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary" onClick={handleStep3Continue}>
              Proceed to Payment
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: Payment & Final Submission
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div id="formStep4">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 'var(--space-xl)', alignItems: 'start' }}>

            {/* Left: Payment Form Section */}
            <div className="form-section" style={{ margin: 0 }}>
              <div className="form-section-header">
                <div className="form-section-number">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <div className="form-section-title">Payment Method</div>
                  <div className="form-section-subtitle">Choose how you'd like to pay the application fee.</div>
                </div>
              </div>

              <div className="form-section-body">
                {/* 4 Payment Method Selector Tabs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-xl)',
                  }}
                >
                  {/* 1. UPI */}
                  <div
                    className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`.trim()}
                    id="pm_upi"
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>UPI</span>
                  </div>

                  {/* 2. Card */}
                  <div
                    className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`.trim()}
                    id="pm_card"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Card</span>
                  </div>

                  {/* 3. Net Banking */}
                  <div
                    className={`payment-method-card ${paymentMethod === 'netbanking' ? 'active' : ''}`.trim()}
                    id="pm_netbanking"
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span>Net Banking</span>
                  </div>

                  {/* 4. Free / Waived */}
                  <div
                    className={`payment-method-card ${paymentMethod === 'free' ? 'active' : ''}`.trim()}
                    id="pm_free"
                    onClick={() => setPaymentMethod('free')}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Free / Waived</span>
                  </div>
                </div>

                {/* Sub-form: UPI */}
                {paymentMethod === 'upi' && (
                  <div id="upiForm">
                    <div className="form-group">
                      <label className="form-label">UPI ID <span className="required">*</span></label>
                      <div className="input-wrapper" style={{ position: 'relative' }}>
                        <svg
                          className="input-icon"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        <input
                          type="text"
                          className="form-input has-icon"
                          placeholder="yourname@upi"
                          style={{ paddingLeft: '38px' }}
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: 'var(--space-md)' }}>
                      {['@phonepe', '@gpay', '@paytm'].map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setUpiId((prev) => (prev ? prev.split('@')[0] + handle : 'citizen' + handle))}
                        >
                          {handle === '@phonepe' ? 'PhonePe' : handle === '@gpay' ? 'Google Pay' : 'Paytm'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-form: Card */}
                {paymentMethod === 'card' && (
                  <div id="cardForm">
                    <div className="form-group">
                      <label className="form-label">Card Number <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        defaultValue="4111 2222 3333 4444"
                      />
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY) <span className="required">*</span></label>
                        <input type="text" className="form-input" placeholder="MM/YY" maxLength="5" defaultValue="12/28" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV <span className="required">*</span></label>
                        <input type="password" className="form-input" placeholder="•••" maxLength="3" defaultValue="123" />
                      </div>
                      <div className="form-group col-span-full">
                        <label className="form-label">Name on Card <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="As printed on card"
                          defaultValue={`${applicantInfo.firstName} ${applicantInfo.lastName}`.trim() || 'Citizen Applicant'}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form: Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div id="netbankingForm">
                    <div className="form-group">
                      <label className="form-label">Select Bank <span className="required">*</span></label>
                      <select className="form-input" defaultValue="State Bank of India">
                        <option value="">-- Select your bank --</option>
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Bank of Baroda</option>
                        <option>Punjab National Bank</option>
                        <option>Canara Bank</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Sub-form: Free */}
                {paymentMethod === 'free' && (
                  <div id="freeForm">
                    <div className="alert alert-success">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      This service is free of charge for eligible citizen categories. No payment required.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Payment Summary Card */}
            <div>
              <div className="payment-summary">
                <div className="payment-summary-title">Payment Summary</div>

                <div className="payment-summary-row">
                  <span>Application Fee</span>
                  <span>{paymentMethod === 'free' || serviceFee === 0 ? '₹0.00' : `₹${serviceFee.toFixed(2)}`}</span>
                </div>

                <div className="payment-summary-row">
                  <span>Processing Charge</span>
                  <span>{paymentMethod === 'free' || serviceFee === 0 ? '₹0.00' : `₹${processingCharge.toFixed(2)}`}</span>
                </div>

                <div className="payment-summary-row">
                  <span>GST (18%)</span>
                  <span>{paymentMethod === 'free' || serviceFee === 0 ? '₹0.00' : `₹${gstAmount.toFixed(2)}`}</span>
                </div>

                <div className="payment-summary-divider"></div>

                <div className="payment-summary-total">
                  <span>Total Payable</span>
                  <span style={{ color: paymentMethod === 'free' || totalPayable === 0 ? 'var(--green-600)' : 'var(--navy-900)' }}>
                    {paymentMethod === 'free' || totalPayable === 0 ? 'Free' : `₹${totalPayable.toFixed(2)}`}
                  </span>
                </div>

                {/* Application Reference Preview Box */}
                <div
                  style={{
                    marginTop: 'var(--space-lg)',
                    padding: 'var(--space-md)',
                    background: 'var(--navy-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--navy-100)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy-600)', marginBottom: '4px' }}>
                    Application Reference
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                    APP-2026-XXXX
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Official tracking reference assigned upon submission
                  </div>
                </div>

                {/* Security Badge */}
                <div
                  style={{
                    marginTop: 'var(--space-md)',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="var(--green-500)" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secured by 256-bit SSL encryption
                </div>
              </div>
            </div>

          </div>

          {/* Navigation & Submit Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(3)} disabled={submitting}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitApplication}
              disabled={submitting}
              style={{ minWidth: '220px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {submitting ? 'Submitting Application…' : 'Pay & Submit Application'}
            </button>
          </div>
        </div>
      )}

      {/* Global Toast Notification Container */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
