// src/components/department-head/ServiceBuilderForm.jsx
// Core Sub-Component for Member 4: Department Head & Dynamic Service Builder
// React concepts used:
// 1. Components (functional component & modular sections)
// 2. Props (initialData, availableDesignations, onSubmit, onCancel, loading)
// 3. State (useState for metadata, fields array, docs array, workflow steps array, and modal controls)
// 4. Events (onClick, onChange, onSubmit)
// 5. Lists (fields.map, docs.map, workflowSteps.map, availableDesignations.map with unique keys)
// 6. Hooks (useState, useEffect for state synchronization)
// 7. Forms (controlled inputs for all metadata and modal field builders)
// 8. Callbacks (handleAddField, handleRemoveField, handleAddDoc, handleAddStep, etc.)
// 9. Prop Drilling (passing handler functions to modular controls)

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

// Available Dynamic Field Types supported by the backend DTO
const FIELD_TYPES = [
  { value: 'TEXT', label: 'TEXT (Single line text)' },
  { value: 'NUMBER', label: 'NUMBER (Integer / Decimal)' },
  { value: 'DATE', label: 'DATE (Calendar date picker)' },
  { value: 'DROPDOWN', label: 'DROPDOWN (Single select list)' },
  { value: 'RADIO', label: 'RADIO (Single option select)' },
  { value: 'CHECKBOX', label: 'CHECKBOX (Multiple selections)' },
  { value: 'TEXTAREA', label: 'TEXTAREA (Multi-line paragraph)' },
  { value: 'EMAIL', label: 'EMAIL' },
  { value: 'PHONE', label: 'PHONE (10 Digits)' },
];

export default function ServiceBuilderForm({
  initialData = null,
  availableDesignations = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  // ── 1. Basic Metadata & Financials State ──
  const [formData, setFormData] = useState({
    name: 'Integrated Caste & Income Certificate',
    code: 'SRV_CIC',
    description: 'Official dual-purpose caste and income certificate issued by the Revenue Department.',
    serviceFee: 35,
    platformFee: 15,
    termsAndConditions:
      'I hereby declare that all the information and certificates furnished by me are true and accurate to the best of my knowledge under penalty of perjury.',
  });

  // ── 2. Dynamic Schema Array States (The Core Array State Management) ──
  const [fields, setFields] = useState([
    { id: 'f1', label: 'Applicant Full Name', type: 'TEXT', required: true },
    {
      id: 'f2',
      label: 'Aadhaar Card Number',
      type: 'NUMBER',
      required: true,
      constraints: { minLength: 12, maxLength: 12 },
    },
    {
      id: 'f3',
      label: 'Community / Caste Category',
      type: 'DROPDOWN',
      required: true,
      constraints: { options: ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST'] },
    },
    {
      id: 'f4',
      label: 'Annual Household Income (₹)',
      type: 'NUMBER',
      required: true,
      constraints: { min: 0 },
    },
  ]);

  const [docs, setDocs] = useState([
    {
      id: 'd1',
      name: 'Aadhaar Card Copy',
      required: true,
      allowedMimeTypes: ['pdf', 'jpg', 'png'],
      maxSizeBytes: 5242880,
    },
    {
      id: 'd2',
      name: 'Residence Proof / Ration Card',
      required: true,
      allowedMimeTypes: ['pdf', 'jpg'],
      maxSizeBytes: 5242880,
    },
    {
      id: 'd3',
      name: 'Salary Slip / Income Self-Declaration',
      required: false,
      allowedMimeTypes: ['pdf', 'jpg'],
      maxSizeBytes: 5242880,
    },
  ]);

  const [workflowSteps, setWorkflowSteps] = useState([
    {
      stepNumber: 1,
      stepName: 'VRO Verification & Field Inquiry',
      requiredDesignationId: 'desig_vro',
      canApprove: true,
      canReject: true,
      canRaiseQuery: true,
      isFinalApprovalStep: false,
    },
    {
      stepNumber: 2,
      stepName: 'MRO Verification & Scrutiny',
      requiredDesignationId: 'desig_mro',
      canApprove: true,
      canReject: true,
      canRaiseQuery: true,
      isFinalApprovalStep: false,
    },
    {
      stepNumber: 3,
      stepName: 'Tahsildar Digital Approval & DSC Signoff',
      requiredDesignationId: 'desig_tahsildar',
      canApprove: true,
      canReject: true,
      canRaiseQuery: true,
      isFinalApprovalStep: true,
    },
  ]);

  // ── 3. Modal Dialog States ──
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);

  // Field modal controlled state
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('TEXT');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  // Doc modal controlled state
  const [newDocName, setNewDocName] = useState('');
  const [newDocExts, setNewDocExts] = useState('pdf, jpg, png');
  const [newDocRequired, setNewDocRequired] = useState(true);

  // Step modal controlled state
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesignation, setNewStepDesignation] = useState('desig_vro');
  const [newStepCanApprove, setNewStepCanApprove] = useState(true);
  const [newStepCanReject, setNewStepCanReject] = useState(true);
  const [newStepCanQuery, setNewStepCanQuery] = useState(true);
  const [newStepIsFinal, setNewStepIsFinal] = useState(false);

  // ── 4. Hook: Sync with initialData if editing an existing service ──
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        serviceFee: initialData.serviceFee ?? initialData.fee ?? 35,
        platformFee: initialData.platformFee ?? 15,
        termsAndConditions:
          initialData.termsAndConditions ||
          'I hereby declare that all the information and certificates furnished by me are true and accurate to the best of my knowledge.',
      });

      if (Array.isArray(initialData.fields) && initialData.fields.length > 0) {
        setFields(initialData.fields);
      }
      if (
        Array.isArray(initialData.documentRequirements) &&
        initialData.documentRequirements.length > 0
      ) {
        setDocs(initialData.documentRequirements);
      }
      if (
        Array.isArray(initialData.workflowSteps) &&
        initialData.workflowSteps.length > 0
      ) {
        setWorkflowSteps(initialData.workflowSteps);
      }
    }
  }, [initialData]);

  // Computed total fee (Derivation without redundant state)
  const totalFee = Number(formData.serviceFee || 0) + Number(formData.platformFee || 0);

  // ── 5. Form Field Handlers (Adding, Removing, Mutating Arrays) ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddField = () => {
    setNewFieldLabel('');
    setNewFieldType('TEXT');
    setNewFieldRequired(true);
    setNewFieldOptions('');
    setIsFieldModalOpen(true);
  };

  const handleConfirmAddField = () => {
    if (!newFieldLabel.trim()) {
      alert('Field label is required.');
      return;
    }

    const newField = {
      id: `field_${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
    };

    if (
      ['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(newFieldType) &&
      newFieldOptions.trim()
    ) {
      newField.constraints = {
        options: newFieldOptions
          .split(',')
          .map((opt) => opt.trim())
          .filter(Boolean),
      };
    }

    setFields((prev) => [...prev, newField]);
    setIsFieldModalOpen(false);
  };

  const handleRemoveField = (indexToRemove) => {
    setFields((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ── 6. Document Requirement Handlers ──
  const handleOpenAddDoc = () => {
    setNewDocName('');
    setNewDocExts('pdf, jpg, png');
    setNewDocRequired(true);
    setIsDocModalOpen(true);
  };

  const handleConfirmAddDoc = () => {
    if (!newDocName.trim()) {
      alert('Document name is required.');
      return;
    }

    const exts = newDocExts
      .split(',')
      .map((ext) => ext.trim().toLowerCase())
      .filter(Boolean);

    const newDoc = {
      id: `doc_${Date.now()}`,
      name: newDocName.trim(),
      required: newDocRequired,
      allowedMimeTypes: exts.length > 0 ? exts : ['pdf', 'jpg'],
      maxSizeBytes: 5242880,
    };

    setDocs((prev) => [...prev, newDoc]);
    setIsDocModalOpen(false);
  };

  const handleRemoveDoc = (indexToRemove) => {
    setDocs((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ── 7. Workflow Routing Stage Handlers ──
  const handleOpenAddStep = () => {
    setNewStepName('');
    const defaultDesig =
      availableDesignations[0]?.id || 'desig_vro';
    setNewStepDesignation(defaultDesig);
    setNewStepCanApprove(true);
    setNewStepCanReject(true);
    setNewStepCanQuery(true);
    setNewStepIsFinal(false);
    setIsStepModalOpen(true);
  };

  const handleConfirmAddStep = () => {
    if (!newStepName.trim()) {
      alert('Stage name is required.');
      return;
    }

    const newStep = {
      stepNumber: workflowSteps.length + 1,
      stepName: newStepName.trim(),
      requiredDesignationId: newStepDesignation,
      canApprove: newStepCanApprove,
      canReject: newStepCanReject,
      canRaiseQuery: newStepCanQuery,
      isFinalApprovalStep: newStepIsFinal,
    };

    setWorkflowSteps((prev) => [...prev, newStep]);
    setIsStepModalOpen(false);
  };

  const handleRemoveStep = (indexToRemove) => {
    setWorkflowSteps((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      // Re-index remaining steps sequentially
      return filtered.map((step, idx) => ({
        ...step,
        stepNumber: idx + 1,
      }));
    });
  };

  // ── 8. Form Submit Handler ──
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Service Name and Service Code are mandatory.');
      return;
    }

    if (workflowSteps.length === 0) {
      alert('Please add at least one workflow approval stage.');
      return;
    }

    // Prepare complete payload matching CreateDynamicServiceDto
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      serviceFee: parseFloat(formData.serviceFee) || 0,
      platformFee: parseFloat(formData.platformFee) || 0,
      termsAndConditions: formData.termsAndConditions,
      fields,
      documentRequirements: docs,
      workflowSteps,
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ── CARD 1: Basic Service Identification ── */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-xl)' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: 'var(--space-md)' }}>
          1. Basic Service Identification
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="srvName">Service Name *</label>
            <input
              type="text"
              id="srvName"
              name="name"
              className="form-input"
              placeholder="e.g. Integrated Caste & Income Certificate"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="srvCode">Service Code *</label>
            <input
              type="text"
              id="srvCode"
              name="code"
              className="form-input"
              placeholder="e.g. SRV_CIC"
              style={{ textTransform: 'uppercase' }}
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" style={{ fontWeight: 700 }} htmlFor="srvDesc">Service Description</label>
            <textarea
              id="srvDesc"
              name="description"
              className="form-input"
              rows="2"
              placeholder="Describe the citizen service..."
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Configurable Form Fields (Dynamic Array State - Day 3 Focus) ── */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              2. Configurable Form Fields (Dynamic Citizen Inputs)
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Dynamic inputs required from citizens during application submission.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleOpenAddField}
          >
            + Add Input Field
          </button>
        </div>

        {/* Dynamic fields mapped from array state */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fields.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--slate-400)', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              No custom fields configured. Default profile identity fields will apply.
            </div>
          ) : (
            fields.map((f, i) => (
              <div
                key={f.id || i}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--navy-900)' }}>{f.label}</strong>
                  <span className="badge badge-neutral" style={{ marginLeft: '8px' }}>{f.type}</span>
                  {f.required ? (
                    <span className="badge badge-danger" style={{ marginLeft: '4px' }}>Required</span>
                  ) : (
                    <span className="badge badge-neutral" style={{ marginLeft: '4px' }}>Optional</span>
                  )}
                  {f.constraints?.options && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '8px' }}>
                      Options: [{f.constraints.options.join(', ')}]
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444', padding: '4px 8px' }}
                  onClick={() => handleRemoveField(i)}
                  title="Remove Field"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── CARD 3: Document Upload Requirements (Dynamic Array State) ── */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              3. Required Document Proofs (Upload Schema)
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Mandatory and supporting certificates citizens must attach.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleOpenAddDoc}
          >
            + Add Document Proof
          </button>
        </div>

        {/* Dynamic docs mapped from array state */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--slate-400)', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              No document uploads configured for this service.
            </div>
          ) : (
            docs.map((d, i) => (
              <div
                key={d.id || i}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--navy-900)' }}>📄 {d.name}</strong>
                  <span className="badge badge-info" style={{ marginLeft: '8px' }}>
                    {(d.allowedMimeTypes || ['pdf', 'jpg']).join(', ')}
                  </span>
                  {d.required ? (
                    <span className="badge badge-danger" style={{ marginLeft: '4px' }}>Required</span>
                  ) : (
                    <span className="badge badge-neutral" style={{ marginLeft: '4px' }}>Optional</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444', padding: '4px 8px' }}
                  onClick={() => handleRemoveDoc(i)}
                  title="Remove Document"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── CARD 4: Payment & Statutory Terms Configuration ── */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-xl)' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: 'var(--space-md)' }}>
          4. Payment & Statutory Terms Configuration
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Service Fee (₹) *</label>
            <input
              type="number"
              name="serviceFee"
              className="form-input"
              value={formData.serviceFee}
              min="0"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Platform Fee (₹) *</label>
            <input
              type="number"
              name="platformFee"
              className="form-input"
              value={formData.platformFee}
              min="0"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Total Citizen Price</label>
            <input
              type="text"
              className="form-input"
              value={`₹${totalFee}`}
              readOnly
              style={{ fontWeight: 800, background: '#f8fafc', color: '#16a34a' }}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Statutory Terms & Conditions Checkbox Text</label>
          <textarea
            name="termsAndConditions"
            className="form-input"
            rows="2"
            value={formData.termsAndConditions}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>

      {/* ── CARD 5: Configurable Officer Workflow Routing ── */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              5. Configurable Officer Workflow Routing
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              Define the sequential officer designations and authority levels. Applications dynamically traverse this sequence from bottom to top.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleOpenAddStep}
          >
            + Add Workflow Stage
          </button>
        </div>

        {/* Visual Sequence Flow Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            padding: '16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
          }}
        >
          {workflowSteps.length === 0 ? (
            <span style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>
              No stages configured. Click "+ Add Workflow Stage" to define officer routing.
            </span>
          ) : (
            workflowSteps.map((st, i) => {
              const desigObj = availableDesignations.find((d) => d.id === st.requiredDesignationId);
              const desigTitle = desigObj?.title || st.requiredDesignationId.replace('desig_', '').toUpperCase();
              return (
                <React.Fragment key={st.stepNumber || i}>
                  <div
                    style={{
                      background: st.isFinalApprovalStep ? '#dcfce7' : '#eff6ff',
                      border: `1px solid ${st.isFinalApprovalStep ? '#86efac' : '#bfdbfe'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      color: st.isFinalApprovalStep ? '#166534' : '#1e40af',
                    }}
                  >
                    <span>
                      {i + 1}. {st.stepName || desigTitle} ({desigTitle})
                    </span>
                    {st.isFinalApprovalStep && (
                      <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>DSC</span>
                    )}
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 800 }}>➔</span>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Interactive Step Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workflowSteps.map((st, i) => {
            const desigObj = availableDesignations.find((d) => d.id === st.requiredDesignationId);
            const desigTitle = desigObj?.title || st.requiredDesignationId;
            return (
              <div
                key={st.stepNumber || i}
                style={{
                  background: st.isFinalApprovalStep ? '#f0fdf4' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${st.isFinalApprovalStep ? '#16a34a' : '#2563eb'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: '#1e293b',
                        color: '#fff',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {st.stepNumber || i + 1}
                    </span>
                    <strong style={{ color: 'var(--navy-900)', fontSize: '0.9375rem' }}>{st.stepName}</strong>
                    <span className="badge badge-purple">{desigTitle}</span>
                    {st.isFinalApprovalStep && (
                      <span className="badge badge-success">Final DSC Signoff Stage</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '6px', display: 'flex', gap: '14px' }}>
                    <span>{st.canApprove ? '✓ Can Approve/Endorse' : '✗ Cannot Approve'}</span>
                    <span>{st.canReject ? '✓ Can Reject' : '✗ Cannot Reject'}</span>
                    <span>{st.canRaiseQuery ? '✓ Can Raise Query' : '✗ Cannot Query'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444' }}
                  onClick={() => handleRemoveStep(i)}
                  title="Remove Stage"
                >
                  ✕ Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Action Buttons Footer ── */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Publishing Service...' : 'Publish Service & Workflow'}
        </button>
      </div>

      {/* ── MODAL 1: Add Custom Field ── */}
      <Modal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        title="📝 Add Custom Citizen Form Field"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsFieldModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmAddField}>
              Add Field
            </button>
          </div>
        }
      >
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Field Label *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Annual Family Income"
            value={newFieldLabel}
            onChange={(e) => setNewFieldLabel(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Field Type *</label>
          <select
            className="form-input"
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value)}
          >
            {FIELD_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>{ft.label}</option>
            ))}
          </select>
        </div>
        {['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(newFieldType) && (
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Options (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. OC, BC-A, BC-B, SC, ST"
              value={newFieldOptions}
              onChange={(e) => setNewFieldOptions(e.target.value)}
            />
          </div>
        )}
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
            />
            Mandatory / Required Field
          </label>
        </div>
      </Modal>

      {/* ── MODAL 2: Add Document Requirement ── */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="📎 Add Document Proof Requirement"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsDocModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmAddDoc}>
              Add Document
            </button>
          </div>
        }
      >
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Document Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Aadhaar Card, Electricity Bill"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Allowed Extensions (Comma-separated)</label>
          <input
            type="text"
            className="form-input"
            value={newDocExts}
            onChange={(e) => setNewDocExts(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={newDocRequired}
              onChange={(e) => setNewDocRequired(e.target.checked)}
            />
            Mandatory Document Upload
          </label>
        </div>
      </Modal>

      {/* ── MODAL 3: Add Workflow Stage ── */}
      <Modal
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        title="⚡ Add Workflow Routing Stage"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsStepModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmAddStep}>
              Add Stage
            </button>
          </div>
        }
      >
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Stage Name / Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Mandal Revenue Officer Scrutiny"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Required Officer Designation *</label>
          <select
            className="form-input"
            value={newStepDesignation}
            onChange={(e) => setNewStepDesignation(e.target.value)}
          >
            {availableDesignations.length > 0 ? (
              availableDesignations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.code})
                </option>
              ))
            ) : (
              <>
                <option value="desig_vro">Village Revenue Officer (VRO)</option>
                <option value="desig_mro">Mandal Revenue Officer (MRO)</option>
                <option value="desig_tahsildar">Tahsildar</option>
              </>
            )}
          </select>
        </div>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>
            Officer Authority Permissions:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={newStepCanApprove}
                onChange={(e) => setNewStepCanApprove(e.target.checked)}
              />
              Can Forward / Endorse / Approve
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={newStepCanReject}
                onChange={(e) => setNewStepCanReject(e.target.checked)}
              />
              Can Reject Application
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={newStepCanQuery}
                onChange={(e) => setNewStepCanQuery(e.target.checked)}
              />
              Can Raise Resubmission Query to Citizen
            </label>
          </div>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#166534' }}>
            <input
              type="checkbox"
              checked={newStepIsFinal}
              onChange={(e) => setNewStepIsFinal(e.target.checked)}
            />
            Mark as Final Approval Step (Triggers DSC & Certificate Generation)
          </label>
        </div>
      </Modal>
    </form>
  );
}
