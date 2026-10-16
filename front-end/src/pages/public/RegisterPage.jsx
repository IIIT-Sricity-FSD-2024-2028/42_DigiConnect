// src/pages/public/RegisterPage.jsx
// React concepts used:
// 1. Components (RegisterPage, Left Branding Panel, Multi-Step Form, OTP Simulator)
// 2. State management (useState for steps, form fields, password toggle, strength, OTP inputs)
// 3. Side effects (useEffect for timer countdown & redirect if logged in)
// 4. Controlled forms (inputs, selects, textareas, checkboxes)
// 5. Context API (useAuth for auto-login upon registration)
// 6. Navigation (react-router-dom Link, useNavigate)
// 7. Toast feedback (useToast, Toast)

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequestOtp, apiRegister } from '../../api/authApi';
import { apiFetch } from '../../api/client';
import useToast from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

const FALLBACK_STATES = [
  { id: 'state_ap', name: 'Andhra Pradesh', code: 'AP' },
  { id: 'state_ka', name: 'Karnataka', code: 'KA' },
  { id: 'state_kl', name: 'Kerala', code: 'KL' },
  { id: 'state_tn', name: 'Tamil Nadu', code: 'TN' },
];

const FALLBACK_DISTRICTS = {
  state_ap: [
    { id: 'node_tpt', name: 'Tirupati District' },
    { id: 'node_vsp', name: 'Visakhapatnam District' },
    { id: 'node_kri', name: 'Krishna District' },
    { id: 'node_gun', name: 'Guntur District' },
    { id: 'node_ant', name: 'Anantapur District' },
  ],
  state_ka: [
    { id: 'node_blr', name: 'Bengaluru Urban District' },
    { id: 'node_mys', name: 'Mysuru District' },
    { id: 'node_bel', name: 'Belagavi District' },
  ],
  state_kl: [
    { id: 'node_tvm', name: 'Thiruvananthapuram District' },
    { id: 'node_ekm', name: 'Ernakulam District' },
    { id: 'node_clt', name: 'Kozhikode District' },
  ],
  state_tn: [
    { id: 'node_chn', name: 'Chennai District' },
    { id: 'node_cbe', name: 'Coimbatore District' },
    { id: 'node_mdu', name: 'Madurai District' },
  ],
};

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  'What was the name of your first school?',
  "What is your pet's name?",
  'What city were you born in?',
];

export default function RegisterPage() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  // ── Step Navigation (1: Personal, 2: Contact, 3: Credentials, 4: OTP Verification) ──
  const [currentStep, setCurrentStep] = useState(1);

  // ── Form State ──
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    aadhaar: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    state: '',
    district: '',
    pincode: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    agreeTerms: false,
    agreeData: false,
  });

  // ── UI & Security Helper State ──
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 4
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── OTP State ──
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const otpInputsRef = useRef([]);

  // ── Existing Jurisdiction State from Backend ──
  const [availableStates, setAvailableStates] = useState(FALLBACK_STATES);
  const [allJurisdictionNodes, setAllJurisdictionNodes] = useState([]);
  const [districtsForState, setDistrictsForState] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState('');
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);

  // Fetch registered states and jurisdiction hierarchy on mount
  useEffect(() => {
    let isMounted = true;
    async function loadJurisdictions() {
      try {
        const [statesRes, nodesRes] = await Promise.all([
          apiFetch('/geography/states').catch(() => null),
          apiFetch('/geography/nodes').catch(() => null),
        ]);
        if (isMounted) {
          if (statesRes?.data && Array.isArray(statesRes.data) && statesRes.data.length > 0) {
            setAvailableStates(statesRes.data);
          }
          if (nodesRes?.data && Array.isArray(nodesRes.data) && nodesRes.data.length > 0) {
            setAllJurisdictionNodes(nodesRes.data);
          }
        }
      } catch (err) {
        console.warn('Could not load existing jurisdiction records:', err);
      }
    }
    loadJurisdictions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/citizen/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (currentStep === 4 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, otpTimer]);

  // ── Controlled Input Handlers ──
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Format Aadhaar: "1234 5678 9012"
  const handleAadhaarChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    let formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData((prev) => ({ ...prev, aadhaar: formatted }));
    if (formErrors.aadhaar) setFormErrors((prev) => ({ ...prev, aadhaar: '' }));
  };

  // Format Phone: Digits only, max 10
  const handlePhoneChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: raw }));
    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
  };

  // Pincode: Digits only, max 6
  const handlePincodeChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: raw }));
    if (formErrors.pincode) setFormErrors((prev) => ({ ...prev, pincode: '' }));
  };

  // District: Letters and spaces only (Custom fallback)
  const handleDistrictChange = (e) => {
    let raw = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setFormData((prev) => ({ ...prev, district: raw, selectedJurisdictionNodeId: '' }));
    if (formErrors.district) setFormErrors((prev) => ({ ...prev, district: '' }));
  };

  // State dropdown selection - dynamically filters district nodes
  const handleStateSelectChange = (e) => {
    const selectedName = e.target.value;
    const matchedState = availableStates.find((st) => st.name === selectedName);
    const stateId = matchedState?.id || '';
    setSelectedStateId(stateId);

    setFormData((prev) => ({
      ...prev,
      state: selectedName,
      district: '',
      selectedJurisdictionNodeId: '',
    }));

    if (formErrors.state) setFormErrors((prev) => ({ ...prev, state: '' }));
    if (formErrors.district) setFormErrors((prev) => ({ ...prev, district: '' }));

    if (!selectedName || selectedName === 'Other') {
      setDistrictsForState([]);
      setIsCustomDistrict(true);
      return;
    }

    // Filter existing district nodes belonging to this state
    let districts = allJurisdictionNodes.filter(
      (n) => n.stateId === stateId && (n.tierLevel || '').toUpperCase() === 'DISTRICT'
    );
    if (districts.length === 0 && FALLBACK_DISTRICTS[stateId]) {
      districts = FALLBACK_DISTRICTS[stateId];
    }

    setDistrictsForState(districts);
    setIsCustomDistrict(districts.length === 0);
  };

  // District dropdown selection
  const handleDistrictSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__OTHER__') {
      setIsCustomDistrict(true);
      setFormData((prev) => ({ ...prev, district: '', selectedJurisdictionNodeId: '' }));
      return;
    }

    const matchedNode = districtsForState.find((d) => d.name === val || d.id === val);
    setFormData((prev) => ({
      ...prev,
      district: matchedNode?.name || val,
      selectedJurisdictionNodeId: matchedNode?.id || '',
    }));
    if (formErrors.district) setFormErrors((prev) => ({ ...prev, district: '' }));
  };

  // Password Strength Calculator
  const handlePasswordChange = (e) => {
    const pw = e.target.value;
    setFormData((prev) => ({ ...prev, password: pw }));

    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setPasswordStrength(score);

    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
  };

  // ── Step 1 Validation ──
  const handleNextFromStep1 = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';

    const plainAadhaar = formData.aadhaar.replace(/\s/g, '');
    if (!plainAadhaar || plainAadhaar.length < 12) {
      errors.aadhaar = 'Enter a valid 12-digit Aadhaar number.';
    }

    if (!formData.dob) {
      errors.dob = 'Date of birth is required.';
    } else {
      const birthYear = new Date(formData.dob).getFullYear();
      if (birthYear >= 2015) {
        errors.dob = 'Registration is open to individuals born in 2014 or earlier.';
      }
    }

    if (!formData.gender) errors.gender = 'Please select your gender.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(Object.values(errors)[0], 'warning');
      return;
    }

    setFormErrors({});
    setCurrentStep(2);
  };

  // ── Step 2 Validation ──
  const handleNextFromStep2 = () => {
    const errors = {};
    if (!formData.phone || formData.phone.length < 10) {
      errors.phone = 'Enter a valid 10-digit mobile number.';
    }
    if (!formData.state) errors.state = 'Please select your state.';
    if (!formData.district.trim()) errors.district = 'District is required.';
    if (!formData.pincode || formData.pincode.length < 6) {
      errors.pincode = 'Enter a valid 6-digit PIN code.';
    }
    if (!formData.address.trim()) errors.address = 'Full address is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(Object.values(errors)[0], 'warning');
      return;
    }

    setFormErrors({});
    setCurrentStep(3);
  };

  // ── Step 3 Validation & Request OTP ──
  const handleCreateAccount = async () => {
    const errors = {};
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.securityQuestion) {
      errors.securityQuestion = 'Please select a security question.';
    }
    if (!formData.securityAnswer.trim()) {
      errors.securityAnswer = 'Please answer the security question.';
    }
    if (!formData.agreeTerms || !formData.agreeData) {
      errors.agreements = 'Please accept both required agreements to continue.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(Object.values(errors)[0], 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Call request-otp simulation API
      const plainAadhaar = formData.aadhaar.replace(/\s/g, '');
      const otpRes = await apiRequestOtp(formData.phone, plainAadhaar);
      const generatedOtp = otpRes.otp || '123456';
      setSimulatedOtp(generatedOtp);
      setOtp(generatedOtp.split('')); // Auto-fill the simulated OTP for smooth testing!
      setOtpTimer(30);

      setCurrentStep(4);
      showToast(otpRes.message || `OTP sent to mobile ${formData.phone}`, 'info');
    } catch (err) {
      // Fallback for offline/simulation
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(fallbackOtp);
      setOtp(fallbackOtp.split(''));
      setOtpTimer(30);
      setCurrentStep(4);
      showToast(`Simulation: OTP is ${fallbackOtp}`, 'info');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 4: OTP Input Handler ──
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto focus next box
    if (digit && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    try {
      const plainAadhaar = formData.aadhaar.replace(/\s/g, '');
      const res = await apiRequestOtp(formData.phone, plainAadhaar);
      const code = res.otp || '123456';
      setSimulatedOtp(code);
      setOtp(code.split(''));
      setOtpTimer(30);
      showToast(`New OTP sent: ${code}`, 'info');
    } catch {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(code);
      setOtp(code.split(''));
      setOtpTimer(30);
      showToast(`Simulation: OTP is ${code}`, 'info');
    }
  };

  // ── Final Verification & Registration Submit ──
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      showToast('Please enter the full 6-digit OTP.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const plainAadhaar = formData.aadhaar.replace(/\s/g, '');
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim() || `${formData.username}@DigiConnect.com`,
        phone: formData.phone,
        aadhaar: plainAadhaar,
        jurisdiction: formData.district || formData.state || 'General',
        selectedJurisdictionNodeId: formData.selectedJurisdictionNodeId || '',
        stateId: selectedStateId || 'state_ap',
        password: formData.password,
        otp: enteredOtp,
        role: 'CITIZEN',
      };

      const res = await apiRegister(payload);
      showToast('Account created and verified successfully!', 'success');

      // Auto-login into session
      const userSession = res.data || {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: 'citizen',
        roleKey: 'citizen',
        jurisdiction: payload.jurisdiction,
        selectedJurisdictionNodeId: payload.selectedJurisdictionNodeId,
        stateId: payload.stateId,
      };

      login(userSession);
      setTimeout(() => {
        navigate('/citizen/dashboard');
      }, 700);
    } catch (err) {
      showToast(err.message || 'Registration failed. Please check OTP.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f59e0b', '#2563eb', '#16a34a'];

  return (
    <div className="auth-page">
      <Toast toast={toast} onClose={hideToast} />

      {/* ── Left Branding Panel ── */}
      <div className="auth-panel">
        <div className="auth-panel-grid"></div>

        <div className="auth-panel-brand">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="auth-brand-logo">
              <div className="auth-brand-icon">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <div>
                <div className="auth-brand-name">DigiConnect</div>
                <div className="auth-brand-tagline">Unified Citizen Service Delivery</div>
              </div>
            </div>
          </Link>

          <div className="auth-panel-heading">
            <h1>
              Start Your
              <br />
              <span>Digital</span>
              <br />
              Citizen
              <br />
              Journey
            </h1>
            <p>
              Register once and access 50+ government services online — certificates, welfare schemes, permissions, and more.
            </p>
          </div>
        </div>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="auth-feature-text">50+ government services</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="auth-feature-text">Real-time SMS & email alerts</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="auth-feature-text">Upload documents once, use everywhere</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="auth-feature-text">Raise & track grievances online</span>
          </div>
        </div>

        <div className="auth-panel-footer">© 2026 DigiConnect – Digital Governance &amp; E-Services</div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-container" style={{ maxWidth: '480px', width: '100%' }}>
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-subtitle">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {/* Step Pill Indicators (Steps 1 to 3) */}
          {currentStep <= 3 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-xl)' }}>
              <div
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: currentStep >= 1 ? 'var(--navy-500)' : 'var(--slate-200)',
                  transition: 'background 0.3s ease',
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: currentStep >= 2 ? 'var(--navy-500)' : 'var(--slate-200)',
                  transition: 'background 0.3s ease',
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: currentStep >= 3 ? 'var(--navy-500)' : 'var(--slate-200)',
                  transition: 'background 0.3s ease',
                }}
              />
            </div>
          )}

          {/* ════════ STEP 1: Personal Details ════════ */}
          {currentStep === 1 && (
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--navy-500)',
                  marginBottom: 'var(--space-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Step 1 of 3 — Personal Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-input"
                    placeholder="Ravi"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  {formErrors.firstName && (
                    <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {formErrors.firstName}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-input"
                    placeholder="Kumar"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  {formErrors.lastName && (
                    <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {formErrors.lastName}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aadhaar">
                  Aadhaar Number <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                  </svg>
                  <input
                    type="text"
                    id="aadhaar"
                    name="aadhaar"
                    className="form-input has-icon"
                    placeholder="5482 1904 2318"
                    maxLength={14}
                    value={formData.aadhaar}
                    onChange={handleAadhaarChange}
                  />
                </div>
                <div className="form-hint">Your Aadhaar is used for identity verification only.</div>
                {formErrors.aadhaar && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.aadhaar}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dob">
                  Date of Birth <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="form-input"
                  max="2014-12-31"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
                {formErrors.dob && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.dob}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gender">
                  Gender <span className="required">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-input"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {formErrors.gender && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.gender}
                  </div>
                )}
              </div>

              <button type="button" className="auth-submit-btn" onClick={handleNextFromStep1}>
                Continue
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: '8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

          {/* ════════ STEP 2: Contact & Location ════════ */}
          {currentStep === 2 && (
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--navy-500)',
                  marginBottom: 'var(--space-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Step 2 of 3 — Contact & Location
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Mobile Number <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input has-icon"
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>
                {formErrors.phone && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.phone}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input has-icon"
                    placeholder="ravi.kumar@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-hint">Optional but recommended for notifications.</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State / Jurisdiction <span className="required">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleStateSelectChange}
                >
                  <option value="">Select state jurisdiction</option>
                  {availableStates.map((st) => (
                    <option key={st.id || st.name} value={st.name}>
                      {st.name} {st.code ? `(${st.code})` : ''}
                    </option>
                  ))}
                  <option value="Other">Other State</option>
                </select>
                {formErrors.state && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.state}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="district">
                    District <span className="required">*</span>
                  </label>
                  {!isCustomDistrict && districtsForState.length > 0 ? (
                    <select
                      id="district"
                      name="district"
                      className="form-input"
                      value={formData.district}
                      onChange={handleDistrictSelectChange}
                      disabled={!formData.state}
                    >
                      <option value="">{formData.state ? 'Select district' : 'Select state first'}</option>
                      {districtsForState.map((d) => (
                        <option key={d.id || d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                      <option value="__OTHER__">Other / Unlisted District</option>
                    </select>
                  ) : (
                    <div>
                      <input
                        type="text"
                        id="district"
                        name="district"
                        className="form-input"
                        placeholder={formData.state ? 'Enter district name' : 'Select state first'}
                        value={formData.district}
                        onChange={handleDistrictChange}
                      />
                      {districtsForState.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomDistrict(false);
                            setFormData((prev) => ({ ...prev, district: '', selectedJurisdictionNodeId: '' }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--navy-600)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            marginTop: '4px',
                            textDecoration: 'underline',
                            padding: 0,
                          }}
                        >
                          ← Choose from existing districts
                        </button>
                      )}
                    </div>
                  )}
                  {formErrors.district && (
                    <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {formErrors.district}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">
                    PIN Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    className="form-input"
                    placeholder="500001"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                  />
                  {formErrors.pincode && (
                    <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {formErrors.pincode}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  Full Address <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="form-input"
                  rows={2}
                  placeholder="House No., Street, Village/Town"
                  style={{ resize: 'none' }}
                  value={formData.address}
                  onChange={handleInputChange}
                />
                {formErrors.address && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.address}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCurrentStep(1)}>
                  ← Back
                </button>
                <button type="button" className="auth-submit-btn" style={{ flex: 2 }} onClick={handleNextFromStep2}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP 3: Create Credentials ════════ */}
          {currentStep === 3 && (
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--navy-500)',
                  marginBottom: 'var(--space-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Step 3 of 3 — Create Credentials
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  Username <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-input has-icon"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-hint">3–20 characters, letters and numbers only.</div>
                {formErrors.username && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.username}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input has-icon has-icon-right"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    className="input-right-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength" style={{ marginTop: '8px' }}>
                    <div className="strength-bars" style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          style={{
                            flex: 1,
                            borderRadius: '2px',
                            background: bar <= passwordStrength ? strengthColors[passwordStrength - 1] : 'var(--slate-200)',
                            transition: 'background 0.2s ease',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: strengthColors[passwordStrength - 1] || 'var(--color-text-muted)' }}>
                      {strengthLabels[passwordStrength - 1] || 'Weak'}
                    </div>
                  </div>
                )}

                {formErrors.password && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.password}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input has-icon"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="securityQuestion">
                  Security Question <span className="required">*</span>
                </label>
                <select
                  id="securityQuestion"
                  name="securityQuestion"
                  className="form-input"
                  value={formData.securityQuestion}
                  onChange={handleInputChange}
                >
                  <option value="">Choose a security question</option>
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                {formErrors.securityQuestion && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.securityQuestion}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="securityAnswer">
                  Answer <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="securityAnswer"
                  name="securityAnswer"
                  className="form-input"
                  placeholder="Your answer"
                  value={formData.securityAnswer}
                  onChange={handleInputChange}
                />
                {formErrors.securityAnswer && (
                  <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    {formErrors.securityAnswer}
                  </div>
                )}
              </div>

              <div className="checkbox-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="agreeTerms" style={{ fontSize: '0.85rem' }}>
                  I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy-600)', fontWeight: 600 }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy-600)', fontWeight: 600 }}>Privacy Policy</Link>
                </label>
              </div>

              <div className="checkbox-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: 'var(--space-xl)' }}>
                <input
                  type="checkbox"
                  id="agreeData"
                  name="agreeData"
                  checked={formData.agreeData}
                  onChange={handleInputChange}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="agreeData" style={{ fontSize: '0.85rem' }}>
                  I consent to the processing of my data as per Digital Governance guidelines
                </label>
              </div>

              {formErrors.agreements && (
                <div style={{ color: 'var(--red-500)', fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>
                  {formErrors.agreements}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCurrentStep(2)} disabled={submitting}>
                  ← Back
                </button>
                <button type="button" className="auth-submit-btn" style={{ flex: 2 }} onClick={handleCreateAccount} disabled={submitting}>
                  {submitting ? 'Generating OTP...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP 4: Success & OTP Verification ════════ */}
          {currentStep === 4 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  background: 'var(--green-100)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-lg)',
                  color: 'var(--green-500)',
                }}
              >
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: 'var(--space-sm)' }}>
                Account Created!
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-xl)' }}>
                Your citizen registration is initiated. Please verify your mobile number via the 6-digit Aadhaar OTP sent to{' '}
                <strong>+91 {formData.phone}</strong>.
              </p>

              {simulatedOtp && (
                <div
                  style={{
                    background: 'var(--blue-50, #eff6ff)',
                    border: '1px solid var(--blue-200, #bfdbfe)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    color: 'var(--blue-800, #1e40af)',
                    marginBottom: 'var(--space-lg)',
                    display: 'inline-block',
                  }}
                >
                  Simulation OTP: <strong>{simulatedOtp}</strong>
                </div>
              )}

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: 'var(--space-md)' }}>
                  Enter 6-Digit OTP
                </label>
                <div className="otp-inputs" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      className="otp-input"
                      maxLength={1}
                      style={{
                        width: '46px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
                  {otpTimer > 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Resend OTP in <strong>0:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--navy-600)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Didn't receive? Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="auth-submit-btn"
                onClick={handleVerifyOtp}
                disabled={submitting}
                style={{ marginTop: 'var(--space-md)' }}
              >
                {submitting ? 'Verifying...' : 'Verify & Go to Dashboard →'}
              </button>

              <div style={{ marginTop: 'var(--space-lg)' }}>
                <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  or sign in manually
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
