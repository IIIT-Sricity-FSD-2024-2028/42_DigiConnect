// src/pages/citizen/RaiseGrievancePage.jsx
// React concepts used:
// 1. Components (RaiseGrievancePage, Sub-steps, Review Card)
// 2. Props & Callbacks (FormStepper, FileUploadDropzone)
// 3. State management (useState for steps, form fields, evidence, validation, submission)
// 4. Side effects (useEffect for applications fetch, query param pre-fills)
// 5. Controlled forms (inputs, selects, textareas, checkboxes)
// 6. Context API (useAuth for citizenId and user session)
// 7. Conditional rendering (step wizard: Step 1 -> 2 -> 3 -> 4 -> Success)

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGetMyApplications, apiRaiseGrievance } from '../../api/citizenApi';
import FormStepper from '../../components/citizen/FormStepper';
import FileUploadDropzone from '../../components/citizen/FileUploadDropzone';
import useToast from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

const CATEGORIES = [
  {
    id: 'delay',
    label: 'Delay in Service',
    desc: 'Application stuck or SLA exceeded without resolution.',
    colorBg: 'var(--amber-100)',
    iconColor: 'var(--amber-600)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'rejection',
    label: 'Wrongful Rejection',
    desc: 'Application rejected without valid reason or due process.',
    colorBg: 'var(--red-100)',
    iconColor: 'var(--red-500)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'misconduct',
    label: 'Officer Misconduct',
    desc: 'Rude behaviour, bribery, harassment or unprofessional conduct.',
    colorBg: 'var(--purple-100)',
    iconColor: '#6b21a8',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'technical',
    label: 'Technical Issue',
    desc: 'Portal errors, payment issues, or document upload failures.',
    colorBg: 'var(--navy-100)',
    iconColor: 'var(--navy-600)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'wrong-info',
    label: 'Wrong Information Issued',
    desc: 'Certificate or document contains incorrect data or errors.',
    colorBg: 'var(--green-100)',
    iconColor: 'var(--green-600)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: 'other',
    label: 'Other Issue',
    desc: 'Any other grievance not covered by the above categories.',
    colorBg: 'var(--slate-100)',
    iconColor: 'var(--slate-500)',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

const DEFAULT_DEPARTMENTS = [
  'Revenue Department',
  'Welfare Department',
  'Municipal Corporation',
  'Rural Development',
  'Civil Supplies & Consumer Affairs',
  'Other',
];

export default function RaiseGrievancePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  // ── Step Navigation State (1: Category, 2: Details, 3: Evidence, 4: Review, 5: Success) ──
  const [currentStep, setCurrentStep] = useState(1);

  // ── Form State ──
  const [category, setCategory] = useState('');
  const [formData, setFormData] = useState({
    relatedAppId: '',
    department: '',
    title: '',
    description: '',
    priority: 'normal',
    preferredResolution: 'Process my application immediately',
    officerNames: '',
  });

  // ── Declarations & Evidence State ──
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [consents, setConsents] = useState({
    truthful: false,
    liability: false,
    shareInfo: false,
  });

  // ── Supporting Data & Feedback State ──
  const [myApplications, setMyApplications] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [submittedGrievance, setSubmittedGrievance] = useState(null);

  // ── Step 1: Fetch Citizen Applications for Validation & Prefill ──
  useEffect(() => {
    let isMounted = true;
    apiGetMyApplications()
      .then((res) => {
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.data || res?.items || [];
          setMyApplications(list);
        }
      })
      .catch((err) => {
        console.error('Failed to load applications for verification:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute dynamic department choices from citizen applications & state departments
  const departmentOptions = useMemo(() => {
    const set = new Set();
    myApplications.forEach((a) => {
      const d = a.dept || a.departmentName || a.department;
      if (d) set.add(d);
    });
    [
      'Revenue, Registration & Stamps Department',
      'Social Welfare Department',
      'Municipal Administration & Urban Development',
      'Rural Development & Panchayat Raj',
      'Civil Supplies & Consumer Affairs',
      'Health & Family Welfare',
      'Other Department',
    ].forEach((d) => set.add(d));
    return Array.from(set);
  }, [myApplications]);

  // ── Step 2: Handle URL Query Pre-fill (e.g. from rejection appeal link) ──
  useEffect(() => {
    const prefillAppId = searchParams.get('appId');
    const prefillService = searchParams.get('service');
    const prefillReason = searchParams.get('reason');

    if (prefillAppId) {
      setCategory('rejection');
      setFormData((prev) => ({
        ...prev,
        relatedAppId: prefillAppId,
        title: `Appeal Against Rejection of ${prefillService || prefillAppId}`,
        description: `My application ${prefillAppId} for ${prefillService || 'statutory service'} was rejected with reason: "${prefillReason || 'Documentation mismatch'}". I request an appeal and review under the Grievance Redressal Cell.`,
      }));
      setCurrentStep(2);
    }
  }, [searchParams]);

  // ── Real-time Application Selection & Department Auto-fill ──
  const handleRelatedAppChange = (selectedAppId) => {
    const appId = (selectedAppId || '').trim();
    const matchedApp = myApplications.find(
      (a) => (a.id || a.applicationNumber || '').toUpperCase() === appId.toUpperCase()
    );

    setFormData((prev) => {
      const next = { ...prev, relatedAppId: appId };
      if (matchedApp) {
        const d = matchedApp.dept || matchedApp.departmentName || matchedApp.department;
        if (d) next.department = d;
        if (matchedApp.officerName || matchedApp.assignedOfficerName) {
          next.officerNames = matchedApp.officerName || matchedApp.assignedOfficerName;
        }
        if (!prev.title || prev.title.startsWith('Grievance regarding') || prev.title.startsWith('Delay in Processing') || prev.title.startsWith('Appeal Against')) {
          if (category === 'delay') {
            next.title = `Delay in Processing: ${matchedApp.serviceName || appId}`;
          } else if (category === 'rejection') {
            next.title = `Appeal Against Rejection: ${matchedApp.serviceName || appId}`;
          } else {
            next.title = `Grievance regarding ${matchedApp.serviceName || appId}`;
          }
        }
      }
      return next;
    });

    if (matchedApp && (matchedApp.status === 'approved' || matchedApp.status === 'completed')) {
      setFormErrors((prev) => ({
        ...prev,
        relatedAppId: 'This application is already approved. Grievances cannot be filed for approved applications.',
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, relatedAppId: '' }));
    }
  };

  // ── Controlled Input Change Handler ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'relatedAppId') {
      handleRelatedAppChange(value);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ── Auto-fill Department when valid Application ID is typed ──
  const handleAppIdBlur = () => {
    const appId = formData.relatedAppId.trim();
    if (!appId) return;

    if (!/^APP-[A-Z0-9-]+$/i.test(appId)) {
      setFormErrors((prev) => ({
        ...prev,
        relatedAppId: 'Please enter a valid Application ID (e.g., APP-AP-1001)',
      }));
      return;
    }

    handleRelatedAppChange(appId);
  };

  // ── Step Navigation & Validation ──
  const handleNextFromStep1 = () => {
    if (!category) {
      setFormErrors({ category: 'Please select a grievance category to continue.' });
      showToast('Please select a grievance category to continue.', 'warning');
      return;
    }
    setFormErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    const errors = {};
    if (!formData.department) {
      errors.department = 'Please select the concerned department.';
    }
    if (!formData.title.trim()) {
      errors.title = 'Please enter a grievance title.';
    }
    if (!formData.description.trim()) {
      errors.description = 'Please describe the issue in detail.';
    }

    if (formData.relatedAppId.trim()) {
      const appId = formData.relatedAppId.trim();
      if (!/^APP-[A-Z0-9-]+$/i.test(appId)) {
        errors.relatedAppId = 'Invalid Application ID format (e.g. APP-AP-1001).';
      } else if (myApplications && myApplications.length > 0) {
        const found = myApplications.find(
          (a) => (a.id || a.applicationNumber || '').toUpperCase() === appId.toUpperCase()
        );
        if (!found) {
          errors.relatedAppId = 'Application ID not found in your records.';
        } else if (found.status === 'approved' || found.status === 'completed') {
          errors.relatedAppId = 'This application is already approved. Cannot raise grievance.';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      showToast(firstError || 'Please fill all required fields.', 'warning');
      return;
    }

    setFormErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep3 = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Grievance Submission Handler ──
  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    if (!consents.truthful || !consents.liability || !consents.shareInfo) {
      showToast('Please agree to all declarations before submitting.', 'warning');
      setErrorBanner('Please agree to all three declarations before submitting your grievance.');
      return;
    }

    setSubmitting(true);
    setErrorBanner('');

    try {
      const citizenId = user?.id || user?.sub;
      let payload;

      if (evidenceFile) {
        payload = new FormData();
        payload.append('citizenId', citizenId);
        payload.append('category', category || 'delay');
        payload.append('subject', formData.title.trim());
        payload.append('description', formData.description.trim());
        if (formData.relatedAppId.trim()) {
          payload.append('relatedAppId', formData.relatedAppId.trim());
        }
        payload.append('priority', formData.priority || 'normal');
        payload.append('evidence', evidenceFile);
      } else {
        payload = {
          citizenId,
          category: category || 'delay',
          subject: formData.title.trim(),
          description: formData.description.trim(),
          relatedAppId: formData.relatedAppId.trim() || undefined,
          priority: formData.priority || 'normal',
        };
      }

      const res = await apiRaiseGrievance(payload);
      setSubmittedGrievance(res.data);
      showToast('Grievance submitted successfully!', 'success');
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast(err.message || 'Failed to submit grievance', 'error');
      setErrorBanner(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category);

  const priorityLabels = {
    normal: 'Normal (7 working days)',
    high: 'High – Affecting livelihood/health (3 working days)',
    urgent: 'Urgent – Critical / Emergency (24 hours)',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: 'var(--space-2xl)' }}>
      {/* ── Toast Notification ── */}
      <Toast toast={toast} onClose={hideToast} />

      {/* ── Page Header ── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <div>
          <h1 className="page-title">Raise a Grievance</h1>
          <p className="page-subtitle">
            Submit a complaint about delays, rejections, misconduct, or any issue related to your service applications.
          </p>
        </div>
        <Link to="/citizen/my-grievances" className="btn btn-outline btn-sm">
          View My Grievances
        </Link>
      </div>

      {/* ── Stepper Indicator (Steps 1-4) ── */}
      {currentStep <= 4 && (
        <FormStepper
          steps={['Grievance Type', 'Details', 'Evidence', 'Confirmation']}
          currentStep={currentStep}
        />
      )}

      {/* ── Error Banner ── */}
      {errorBanner && (
        <div
          style={{
            background: 'var(--red-50, #fef2f2)',
            border: '1px solid var(--red-200, #fecaca)',
            color: 'var(--red-700, #b91c1c)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorBanner}</span>
        </div>
      )}

      {/* ── Main Layout: Form (Left) & Guidance Sidebar (Right) ── */}
      {currentStep <= 4 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-xl)', alignItems: 'start' }}>
          {/* ════════ Left: Wizard Steps ════════ */}
          <div style={{ minWidth: 0 }}>
            {/* ── STEP 1: Grievance Category Selection ── */}
            {currentStep === 1 && (
              <div className="card" style={{ padding: 'var(--space-xl)' }}>
                <div className="form-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: 'var(--navy-600)',
                        color: '#fff',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                      }}
                    >
                      01
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      What is your grievance about?
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Select the category that best describes your complaint.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id);
                          setFormErrors((prev) => ({ ...prev, category: '' }));
                        }}
                        style={{
                          padding: 'var(--space-lg)',
                          border: isSelected ? '2px solid var(--navy-600)' : '2px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          background: isSelected ? 'var(--navy-50, #f0f4f8)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            background: cat.colorBg,
                            color: cat.iconColor,
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 'var(--space-sm)',
                          }}
                        >
                          {cat.icon}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                          {cat.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {formErrors.category && (
                  <div style={{ color: 'var(--red-600)', fontSize: '0.875rem', marginTop: 'var(--space-md)' }}>
                    {formErrors.category}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
                  <button type="button" className="btn btn-primary" onClick={handleNextFromStep1}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Grievance Details Form ── */}
            {currentStep === 2 && (
              <div className="card" style={{ padding: 'var(--space-xl)' }}>
                <div className="form-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: 'var(--navy-600)',
                        color: '#fff',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                      }}
                    >
                      02
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      Grievance Details
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Provide complete details to help the grievance officer investigate effectively.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                  {/* Related Application ID */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="relatedAppId">
                      Related Application
                    </label>
                    {myApplications.length > 0 && (
                      <select
                        className="form-input"
                        style={{ marginBottom: '8px', background: '#f8fafc' }}
                        value={formData.relatedAppId}
                        onChange={(e) => handleRelatedAppChange(e.target.value)}
                      >
                        <option value="">-- Choose from your active applications --</option>
                        {myApplications.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.id} — {app.serviceName || 'Service'} ({app.status})
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="text"
                      id="relatedAppId"
                      name="relatedAppId"
                      className="form-input"
                      placeholder="Or enter Application ID manually (e.g. APP-AP-1001)"
                      style={{ fontFamily: 'var(--font-mono)' }}
                      value={formData.relatedAppId}
                      onChange={handleInputChange}
                      onBlur={handleAppIdBlur}
                    />
                    <div className="form-hint" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Selecting an application automatically detects the concerned department and processing officer. Leave blank if this is a general complaint.
                    </div>
                    {formErrors.relatedAppId && (
                      <div style={{ color: 'var(--red-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        {formErrors.relatedAppId}
                      </div>
                    )}
                  </div>

                  {/* Department / Service */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="department">
                      Department / Service <span style={{ color: 'var(--red-500)' }}>*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Select department</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {formErrors.department && (
                      <div style={{ color: 'var(--red-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        {formErrors.department}
                      </div>
                    )}
                  </div>

                  {/* Grievance Title */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="title">
                      Grievance Title <span style={{ color: 'var(--red-500)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-input"
                      placeholder="Brief title, e.g. 'Caste Certificate delayed beyond SLA for 10 days'"
                      maxLength={120}
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      <span>Be specific and concise.</span>
                      <span>{formData.title.length}/120</span>
                    </div>
                    {formErrors.title && (
                      <div style={{ color: 'var(--red-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        {formErrors.title}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="description">
                      Detailed Description <span style={{ color: 'var(--red-500)' }}>*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-input"
                      rows={5}
                      maxLength={1000}
                      placeholder="Describe the issue in detail. Include:&#10;• What happened and when&#10;• Officer name (if applicable)&#10;• Previous attempts to resolve (if any)&#10;• Impact on you"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      <span>Minimum 50 characters required.</span>
                      <span>{formData.description.length}/1000</span>
                    </div>
                    {formErrors.description && (
                      <div style={{ color: 'var(--red-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        {formErrors.description}
                      </div>
                    )}
                  </div>

                  {/* Priority & Preferred Resolution Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="priority">
                        Priority <span style={{ color: 'var(--red-500)' }}>*</span>
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        className="form-input"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="normal">Normal (7 working days)</option>
                        <option value="high">High – Affecting livelihood/health (3 working days)</option>
                        <option value="urgent">Urgent – Critical / Emergency (24 hours)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="preferredResolution">
                        Preferred Resolution
                      </label>
                      <select
                        id="preferredResolution"
                        name="preferredResolution"
                        className="form-input"
                        value={formData.preferredResolution}
                        onChange={handleInputChange}
                      >
                        <option>Process my application immediately</option>
                        <option>Re-examine my application</option>
                        <option>Action against officer</option>
                        <option>Issue corrected document</option>
                        <option>Refund of fee</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Officer Names */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="officerNames">
                      Names of Involved Officers (if known)
                    </label>
                    <input
                      type="text"
                      id="officerNames"
                      name="officerNames"
                      className="form-input"
                      placeholder="e.g. Suresh Reddy (VRO), Anita Sharma (RI)"
                      value={formData.officerNames}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                    ← Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleNextFromStep2}>
                    Continue to Evidence →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Evidence Upload ── */}
            {currentStep === 3 && (
              <div className="card" style={{ padding: 'var(--space-xl)' }}>
                <div className="form-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: 'var(--navy-600)',
                        color: '#fff',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                      }}
                    >
                      03
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      Supporting Evidence (Optional)
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Attach any documents, screenshots, receipts, or other evidence that supports your grievance.
                  </p>
                </div>

                <FileUploadDropzone
                  label="Attach Evidence Document / Screenshot"
                  required={false}
                  file={evidenceFile}
                  onFileSelect={setEvidenceFile}
                  maxSizeMB={5}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(2)}>
                    ← Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleNextFromStep3}>
                    Continue to Confirmation →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Confirmation ── */}
            {currentStep === 4 && (
              <div className="card" style={{ padding: 'var(--space-xl)' }}>
                <div className="form-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: 'var(--navy-600)',
                        color: '#fff',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                      }}
                    >
                      04
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                      Review & Confirmation
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Please review your grievance details and accept the declarations before final submission.
                  </p>
                </div>

                {/* Review Card Summary */}
                <div
                  style={{
                    background: 'var(--slate-50, #f8fafc)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-lg)',
                    marginBottom: 'var(--space-xl)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                    Grievance Summary
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Category:</span>
                    <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                      {selectedCategoryObj?.label || 'General'}
                    </span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Related Application ID:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formData.relatedAppId || 'None (General complaint)'}
                    </span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Department / Service:</span>
                    <span style={{ fontWeight: 600 }}>{formData.department || 'Not specified'}</span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Priority:</span>
                    <span style={{ fontWeight: 600 }}>{priorityLabels[formData.priority]}</span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Grievance Title:</span>
                    <span style={{ fontWeight: 600 }}>{formData.title}</span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Description:</span>
                    <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{formData.description}</span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Preferred Resolution:</span>
                    <span>{formData.preferredResolution}</span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Involved Officers:</span>
                    <span>{formData.officerNames || 'None specified'}</span>

                    <span style={{ color: 'var(--color-text-muted)' }}>Attached Evidence:</span>
                    <span>{evidenceFile ? evidenceFile.name : 'No files attached (Optional)'}</span>
                  </div>
                </div>

                {/* Consent & Declarations */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: 'var(--space-sm)' }}>
                    Consent & Declaration
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={consents.truthful}
                        onChange={(e) => setConsents((prev) => ({ ...prev, truthful: e.target.checked }))}
                        style={{ marginTop: '3px' }}
                      />
                      <span>I declare that the information provided in this grievance is true and accurate to the best of my knowledge.</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={consents.liability}
                        onChange={(e) => setConsents((prev) => ({ ...prev, liability: e.target.checked }))}
                        style={{ marginTop: '3px' }}
                      />
                      <span>I understand that filing a false grievance may result in action being taken against me.</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={consents.shareInfo}
                        onChange={(e) => setConsents((prev) => ({ ...prev, shareInfo: e.target.checked }))}
                        style={{ marginTop: '3px' }}
                      />
                      <span>I consent to my grievance details being shared with the concerned department for investigation.</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(3)} disabled={submitting}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmitGrievance}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Grievance
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ════════ Right: Guidance Sidebar ════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: 'var(--space-sm)' }}>
                Tips for Fast Resolution
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Always link your Application ID if filing about a specific service.</li>
                <li>Be concise in title and detailed in description with timeline events.</li>
                <li>Attach screenshots or acknowledgment receipts if applicable.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: 'var(--space-sm)' }}>
                SLA & Turnaround Time
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Urgent:</span>
                  <span style={{ fontWeight: 600, color: 'var(--red-600)' }}>Within 24 Hours</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>High:</span>
                  <span style={{ fontWeight: 600, color: 'var(--amber-600)' }}>3 Working Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Normal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--navy-700)' }}>7 Working Days</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: 'var(--space-sm)' }}>
                Need Help?
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                For technical issues filing this form, contact the Citizen Redressal Helpline:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--navy-600)', fontSize: '0.95rem' }}>
                📞 1800-425-0012 (Toll Free)
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ════════ STEP 5: Success Screen ════════ */
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: 'var(--space-3xl) var(--space-xl)',
            maxWidth: '680px',
            margin: '0 auto',
          }}
        >
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
            <svg width="40" height="40" fill="none" stroke="var(--green-600)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: 'var(--space-sm)' }}>
            Grievance Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: 'var(--space-xl)' }}>
            Your complaint has been registered with the State Grievance Redressal Cell. An officer has been assigned to investigate.
          </p>

          <div
            style={{
              background: 'var(--slate-50, #f8fafc)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              marginBottom: 'var(--space-2xl)',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              gap: '12px',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>Grievance ID:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy-900)' }}>
              {submittedGrievance?.id || 'GRV-NEW'}
            </span>

            <span style={{ color: 'var(--color-text-muted)' }}>Category:</span>
            <span style={{ fontWeight: 600 }}>{selectedCategoryObj?.label || 'General'}</span>

            <span style={{ color: 'var(--color-text-muted)' }}>Related Application:</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formData.relatedAppId || '—'}</span>

            <span style={{ color: 'var(--color-text-muted)' }}>Priority:</span>
            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{formData.priority}</span>

            <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
            <span>
              <span className="badge badge-amber">SUBMITTED</span>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Link to="/citizen/my-grievances" className="btn btn-primary">
              View My Grievances
            </Link>
            <Link to="/citizen/dashboard" className="btn btn-outline">
              Back to Citizen Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
