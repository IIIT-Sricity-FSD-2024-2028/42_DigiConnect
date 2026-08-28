import React, { useState } from 'react';
import { submitApplicationApi } from '../../services/api';
import '../../styles/applications.css';

function StepIndicator({ step }) {
    const steps = ['1. Personal Details', '2. Service Details', '3. Review & Submit'];
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            {steps.map((label, i) => (
                <span
                    key={i}
                    style={{
                        fontWeight: step === i + 1 ? 'bold' : 'normal',
                        color: step === i + 1 ? '#2557a0' : '#64748b',
                    }}
                >
                    {label}
                </span>
            ))}
        </div>
    );
}

// ── 2. Child: Step Form Fields (Props + Callback) ──
function FormStep({ step, formData, onChange }) {
    if (step === 1) {
        return (
            <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Applicant Full Name</label>
                <input
                    type="text"
                    className="search-box-input"
                    value={formData.fullName}
                    onChange={(e) => onChange('fullName', e.target.value)}
                    placeholder="Enter applicant name"
                />
                <label style={{ display: 'block', fontWeight: 600, marginTop: '12px', marginBottom: '6px' }}>Aadhaar Number</label>
                <input
                    type="text"
                    className="search-box-input"
                    value={formData.aadhaar}
                    onChange={(e) => onChange('aadhaar', e.target.value)}
                    placeholder="Enter 12-digit Aadhaar"
                />
            </div>
        );
    }

    if (step === 2) {
        return (
            <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Select Service</label>
                <select
                    className="form-select"
                    style={{ width: '100%' }}
                    value={formData.serviceName}
                    onChange={(e) => onChange('serviceName', e.target.value)}
                >
                    <option value="Income Certificate">Income Certificate (Revenue Dept)</option>
                    <option value="Birth Certificate">Birth Certificate (Health Dept)</option>
                    <option value="Trade License">Trade License (Commercial Dept)</option>
                </select>
                <label style={{ display: 'block', fontWeight: 600, marginTop: '12px', marginBottom: '6px' }}>Application Purpose</label>
                <input
                    type="text"
                    className="search-box-input"
                    value={formData.purpose}
                    onChange={(e) => onChange('purpose', e.target.value)}
                    placeholder="Reason for application"
                />
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ marginBottom: '8px', color: '#0f2044' }}>Review Details</h4>
            <p><strong>Name:</strong> {formData.fullName}</p>
            <p><strong>Aadhaar:</strong> {formData.aadhaar}</p>
            <p><strong>Service:</strong> {formData.serviceName}</p>
            <p><strong>Purpose:</strong> {formData.purpose}</p>
        </div>
    );
}

// ── 3. Child: Navigation Buttons (Callbacks to Parent) ──
function StepControls({ step, onPrev, onNext, onSubmit }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            {step > 1 ? (
                <button type="button" className="btn btn-outline" onClick={onPrev}>
                    ← Previous
                </button>
            ) : <div />}

            {step < 3 ? (
                <button type="button" className="btn btn-primary" onClick={onNext}>
                    Next Step →
                </button>
            ) : (
                <button type="button" className="btn btn-primary" onClick={onSubmit}>
                    Submit Application ✓
                </button>
            )}
        </div>
    );
}

// ── 4. Parent Component: Holds Lifted State (step & formData) ──
export default function ApplyServicePage({ onNavigate }) {
    // Lifted State
    const [step, setStep] = useState(1);
    const [submittedId, setSubmittedId] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        aadhaar: '',
        serviceName: 'Income Certificate',
        purpose: '',
    });

    // Callback to update parent form state from child
    const handleFieldChange = (key, val) => {
        setFormData((prev) => ({ ...prev, [key]: val }));
    };

    const handleNext = () => setStep((s) => s + 1);
    const handlePrev = () => setStep((s) => s - 1);

    const handleSubmit = async () => {
        const res = await submitApplicationApi({
            serviceName: formData.serviceName,
            formData,
        });
        setSubmittedId(res?.id || `APP-2024-${Math.floor(1000 + Math.random() * 9000)}`);
    };

    return (
        <div style={{ maxWidth: '640px' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Apply for Service</h1>
                    <p className="page-subtitle">Simple multi-step application form.</p>
                </div>
            </div>

            {submittedId ? (
                <div className="app-card" style={{ padding: '24px', textAlign: 'center' }}>
                    <h3>🎉 Application Submitted Successfully!</h3>
                    <p style={{ margin: '12px 0' }}>Your Application ID: <strong>{submittedId}</strong></p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {onNavigate && (
                            <button className="btn btn-primary" onClick={() => onNavigate('my-applications')}>
                                View My Applications
                            </button>
                        )}
                        <button className="btn btn-outline" onClick={() => { setSubmittedId(null); setStep(1); }}>
                            Apply Again
                        </button>
                    </div>
                </div>
            ) : (
                <div className="app-card" style={{ padding: '24px' }}>
                    {/* 1. StepIndicator (Props: step) */}
                    <StepIndicator step={step} />

                    {/* 2. FormStep (Props: step, formData; Callback: onChange) */}
                    <FormStep step={step} formData={formData} onChange={handleFieldChange} />

                    {/* 3. StepControls (Props: step; Callbacks: onPrev, onNext, onSubmit) */}
                    <StepControls
                        step={step}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onSubmit={handleSubmit}
                    />
                </div>
            )}
        </div>
    );
}
