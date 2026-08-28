import React from 'react';

// Citizen Document Uploader Component
export default function DocumentUploader({ label, required = false, fileName, onFileSelect }) {
  return (
    <div
      style={{
        border: '1.5px dashed #cbd5e1',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        background: '#f8fafc',
        marginBottom: '12px',
      }}
    >
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
        {fileName ? `Selected: ${fileName}` : 'Upload PDF, JPG, PNG (Max 2MB)'}
      </div>
      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
        Choose File
        <input
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => onFileSelect && onFileSelect(e.target.files[0])}
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </label>
    </div>
  );
}
