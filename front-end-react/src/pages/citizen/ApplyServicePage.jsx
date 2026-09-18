// src/pages/citizen/ApplyServicePage.jsx
// React concepts used: Components, Props, State (useState), Events (onClick, onChange, onSubmit),
// Lists (.map), Hooks (useState, useEffect), Forms (controlled inputs), Context (useAuth),
// Router (useNavigate, useSearchParams, Link), API calls (apiGetServices, apiSubmitApplication),
// Prop drilling (passing state down to child components), Callbacks (handling child events).

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetServices, apiSubmitApplication } from '../../api/citizenApi';

// Member 4's child components
import ServiceCard from '../../components/citizen/ServiceCard';
import FormStepper from '../../components/citizen/FormStepper';
import DynamicField from '../../components/citizen/DynamicField';
import FileUploadDropzone from '../../components/citizen/FileUploadDropzone';
import SearchBar from '../../components/common/SearchBar';

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

export default function ApplyServicePage() {
  // ── 1. Context & Router ──
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // Step 1: Personal & Address details form state
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
    pincode: '517101',
    areaType: 'RURAL',
    stateId: 'state_ap',
    district: 'node_tpt',
    subDivision: 'node_tpt_sub',
    tier4: 'node_cg_man',
    leafNode: 'node_cg_vil',
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

  // Autofill applicant details from authenticated user session
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      setApplicantInfo((prev) => ({
        ...prev,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
        aadhaar: user.aadhaar || '',
        dob: user.dob || '',
        gender: user.gender || 'Male',
        stateId: user.stateId || 'state_ap',
      }));
    }
  }, [user]);

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

  // ── 5. Callbacks: Step 1 (Applicant Info & Dynamic Inputs) ──
  const handleApplicantInfoChange = (e) => {
    const { name, value } = e.target;
    setApplicantInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleDynamicFieldChange = (fieldKey, value) => {
    setDynamicAnswers((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleStep1Continue = (e) => {
    e.preventDefault();
    // Validate required personal fields
    if (!applicantInfo.firstName || !applicantInfo.aadhaar || !applicantInfo.mobile || !applicantInfo.dob) {
      alert('Please fill all mandatory personal information fields marked with *');
      return;
    }
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
  };

  const handleStep2Continue = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 7. Callbacks: Step 3 (Declaration) ──
  const handleDeclarationChange = (declKey) => {
    setDeclarations((prev) => ({ ...prev, [declKey]: !prev[declKey] }));
  };

  const handleStep3Continue = () => {
    if (!declarations.decl1 || !declarations.decl2 || !declarations.decl3) {
      alert('Please accept all declaration conditions before proceeding to payment.');
      return;
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 8. Callbacks: Step 4 (Payment & Final Submission) ──
  const handleSubmitApplication = async () => {
    if (!selectedService) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Assemble payload matching backend CreateApplicationDto
      const feeAmount = Number(selectedService.fee ?? selectedService.totalFee ?? 0);
      const randomRef = 'TXN-' + Math.floor(100000 + Math.random() * 900000);

      const payload = {
        serviceId: selectedService.id,
        citizenId: user?.id || 'CIT-1001',
        dept: selectedService.dept,
        fee: feeAmount,
        paymentMethod: paymentMethod,
        paymentTransactionId: randomRef,
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

      const res = await apiSubmitApplication(payload);
      const createdApp = res?.data || res;
      setSubmittedAppId(createdApp?.id || 'APP-' + Math.floor(10000 + Math.random() * 90000));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 9. Filtered Services for Step 0 ──
  const filteredServices = services
    .filter((s) => s.status === 'Active' || s.status === 'ACTIVE' || !s.status)
    .filter((s) => {
      if (selectedCategory === 'all') return true;
      return (s.cat || '').toLowerCase() === selectedCategory.toLowerCase();
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.desc || '').toLowerCase().includes(q) ||
        (s.dept || '').toLowerCase().includes(q)
      );
    });

  // Dynamic schema resolution
  const serviceFields =
    selectedService?.fields && selectedService.fields.length > 0
      ? selectedService.fields
      : DEFAULT_SERVICE_SCHEMAS[selectedService?.name] || DEFAULT_SERVICE_SCHEMAS['default'];

  // Required docs resolution
  const requiredDocs =
    selectedService?.docs && selectedService.docs.length > 0
      ? selectedService.docs
      : ['Identity Proof (Aadhaar Card)', 'Address Proof (Ration Card / Voter ID)'];

  // Fee breakdown calculations
  const serviceFee = Number(selectedService?.fee ?? selectedService?.totalFee ?? 0);
  const processingCharge = serviceFee > 0 ? 15 : 0;
  const gstAmount = serviceFee > 0 ? Math.round((serviceFee + processingCharge) * 0.18) : 0;
  const totalPayable = serviceFee + processingCharge + gstAmount;

  // ─────────────────────────────────────────────────────────────
  // RENDER: SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────
  if (submittedAppId) {
    return (
      <div style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
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
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
              Choose a Service
            </h1>
            <p className="page-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Select the government service or certificate you would like to apply for.
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
            No services found matching your search.
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
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <span>{selectedService.dept}</span>
              &nbsp;·&nbsp; SLA: <strong>{selectedService.sla || 7} days</strong>
              &nbsp;·&nbsp; Fee: <strong>{selectedService.fee === 0 ? 'Free' : `₹${selectedService.fee || 0}`}</strong>
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={handleResetService}>
          ← Choose Different Service
        </button>
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
                <div className="form-group">
                  <label className="form-label">State <span className="required">*</span></label>
                  <select className="form-input" name="stateId" value={applicantInfo.stateId} onChange={handleApplicantInfoChange}>
                    <option value="state_ap">Andhra Pradesh</option>
                    <option value="state_ka">Karnataka</option>
                    <option value="state_kl">Kerala</option>
                    <option value="state_tn">Tamil Nadu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District <span className="required">*</span></label>
                  <select className="form-input" name="district" value={applicantInfo.district} onChange={handleApplicantInfoChange}>
                    <option value="node_tpt">Tirupati District</option>
                    <option value="node_bengaluru">Bengaluru Urban</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {applicantInfo.areaType === 'RURAL' ? 'Mandal' : 'Municipal Ward'} <span className="required">*</span>
                  </label>
                  <select className="form-input" name="tier4" value={applicantInfo.tier4} onChange={handleApplicantInfoChange}>
                    <option value="node_cg_man">Chandragiri Mandal</option>
                    <option value="node_tpt_man">Tirupati Rural Mandal</option>
                    <option value="node_tmc">Tirupati Municipal Corporation (TMC)</option>
                  </select>
                </div>
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
                <FileUploadDropzone
                  key={docLabel}
                  label={docLabel}
                  required={true}
                  file={uploadedFiles[docLabel] || null}
                  onFileSelect={(file) => handleFileUpload(docLabel, file)}
                />
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
                    APP-2025-XXXX
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Save this reference for tracking
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
    </div>
  );
}
