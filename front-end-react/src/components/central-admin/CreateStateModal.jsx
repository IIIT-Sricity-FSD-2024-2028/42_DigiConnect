// src/components/central-admin/CreateStateModal.jsx
// 2-Step State Government Onboarding Wizard for Central Administrator
// React concepts: useState, Controlled Forms, Props, Callbacks, Modal reuse, Validation

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { apiCreateCentralState } from '../../api/centralAdminApi';

export default function CreateStateModal({
  isOpen,
  onClose,
  onCreated,
  existingStates = [],
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    govName: '',
    stateAdminName: '',
    stateAdminEmail: '',
    stateAdminPhone: '',
    stateAdminUsername: '',
    stateAdminPassword: 'GovAdmin@2026',
  });

  const [duplicateError, setDuplicateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: '',
        code: '',
        govName: '',
        stateAdminName: '',
        stateAdminEmail: '',
        stateAdminPhone: '',
        stateAdminUsername: '',
        stateAdminPassword: 'GovAdmin@2026',
      });
      setDuplicateError('');
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'code') {
      nextValue = value.toUpperCase();
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: nextValue };
      if (name === 'name') {
        const trimmed = nextValue.trim();
        updated.govName = trimmed ? `Government of ${trimmed}` : '';
        // Duplicate check
        const isDuplicate = existingStates.some(
          (s) => s.name?.toLowerCase() === trimmed.toLowerCase()
        );
        if (isDuplicate) {
          setDuplicateError('⚠️ State Government already exists for this state. Only 1 State Government is permitted per state.');
        } else {
          setDuplicateError('');
        }
      }
      return updated;
    });
  };

  const handleProceedToConfirmation = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { name, code, govName, stateAdminName, stateAdminEmail } = formData;
    if (!name.trim() || !code.trim() || !govName.trim() || !stateAdminName.trim() || !stateAdminEmail.trim()) {
      setErrorMessage('Please fill in all required fields marked with *');
      return;
    }

    // Strict validation
    const duplicate = existingStates.some(
      (s) =>
        s.name?.toLowerCase() === name.trim().toLowerCase() ||
        s.code?.toUpperCase() === code.trim().toUpperCase()
    );
    if (duplicate) {
      setDuplicateError('State Government already exists for this state or state code.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        stateAdminName: formData.stateAdminName.trim(),
        stateAdminEmail: formData.stateAdminEmail.trim(),
        stateAdminPhone: formData.stateAdminPhone.trim(),
        stateAdminPassword: formData.stateAdminPassword.trim() || 'GovAdmin@2026',
      };

      const result = await apiCreateCentralState(payload);
      if (onCreated) {
        onCreated(result);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create State Government');
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? '🏛️ Create State Government' : 'Confirm State Government Onboarding'}
      maxWidth="620px"
    >
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: 'var(--radius-md, 6px)',
            padding: '10px 14px',
            fontSize: '0.875rem',
            marginBottom: '16px',
            fontWeight: 500,
          }}
        >
          {errorMessage}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleProceedToConfirmation}>
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--navy-600, #2563eb)',
                marginBottom: '12px',
              }}
            >
              1. State Entity Information
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                State Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Karnataka, Kerala, Tamil Nadu"
                required
              />
              {duplicateError && (
                <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>
                  {duplicateError}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                State Code (2-3 chars) *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                maxLength={4}
                className="form-input"
                placeholder="e.g. KA, KL, TN"
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                State Government Official Title *
              </label>
              <input
                type="text"
                name="govName"
                value={formData.govName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Government of Karnataka"
                required
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--slate-200, #e2e8f0)', paddingTop: '16px', marginTop: '16px' }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--navy-600, #2563eb)',
                marginBottom: '12px',
              }}
            >
              2. Designated State Administrator (Strict 1:1 Rule)
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                State Admin Full Name *
              </label>
              <input
                type="text"
                name="stateAdminName"
                value={formData.stateAdminName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Ramesh Kumar IAS"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Official Email *
              </label>
              <input
                type="email"
                name="stateAdminEmail"
                value={formData.stateAdminEmail}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. admin@ka.gov.in"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Official Phone
              </label>
              <input
                type="tel"
                name="stateAdminPhone"
                value={formData.stateAdminPhone}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 98765 43200"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Initial Temporary Password
              </label>
              <input
                type="password"
                name="stateAdminPassword"
                value={formData.stateAdminPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!!duplicateError}>
              Review & Confirm →
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md, 6px)',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px', fontSize: '0.9375rem' }}>
              Confirm State Government Federation Onboarding
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.5 }}>
              Please review the details below. Once created, the State Admin account will be issued and granted exclusive governance authority over the state portal.
            </div>
          </div>

          <div
            style={{
              background: 'var(--slate-50, #f8fafc)',
              border: '1px solid var(--slate-200, #e2e8f0)',
              borderRadius: 'var(--radius-md, 6px)',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: 'var(--slate-500, #64748b)' }}>State Name:</span>
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>{formData.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: 'var(--slate-500, #64748b)' }}>State Code:</span>
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>{formData.code}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: 'var(--slate-500, #64748b)' }}>Government Entity:</span>
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>{formData.govName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: 'var(--slate-500, #64748b)' }}>Designated Administrator:</span>
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>{formData.stateAdminName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--slate-500, #64748b)' }}>Official Email:</span>
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>{formData.stateAdminEmail}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              ← Back to Edit
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating State Government...' : 'Create State Government'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
