// src/components/citizen/FileUploadDropzone.jsx
// React concepts used: Components, Props (label, required, file, onFileSelect), State (dragActive, error), Events (dragOver, drop, change), Callbacks (onFileSelect(file))

import React, { useState } from 'react';

/**
 * FileUploadDropzone — Handles file selection with drag-and-drop and client-side <5MB validation.
 *
 * Props:
 *   label        {string}   - Document label/title
 *   required     {boolean}  - Whether document is mandatory
 *   file         {File}     - Current selected file object (or null)
 *   onFileSelect {Function} - Callback invoked with the selected File or null
 *   maxSizeMB    {number}   - Size limit in Megabytes (default: 5MB)
 */
export default function FileUploadDropzone({
  label = 'Supporting Document',
  required = false,
  file = null,
  onFileSelect,
  maxSizeMB = 5,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  // Validates file size (<5MB) and triggers parent callback
  const validateAndSelect = (selectedFile) => {
    if (!selectedFile) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      const actualMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      setError(`File size (${actualMB} MB) exceeds the ${maxSizeMB} MB limit. Please upload a smaller file.`);
      return;
    }

    setError('');
    onFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const inputId = `file_input_${label.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <div style={{ marginBottom: 'var(--space-md)' }}>
      <div
        className={`upload-slot ${file ? 'uploaded' : ''}`.trim()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderColor: dragActive ? 'var(--navy-600)' : undefined,
          background: dragActive ? 'var(--navy-50)' : undefined,
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {/* Slot Icon: green checkmark if uploaded, upload arrow if empty */}
        <div className="upload-slot-icon">
          {file ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
        </div>

        {/* Slot Label & Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy-900)' }}>
            {label} {required && <span className="required">*</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {file ? (
              <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>
                {file.name} ({formatFileSize(file.size)})
              </span>
            ) : (
              'Accepted: PDF, JPG, PNG (Max 5 MB)'
            )}
          </div>
        </div>

        {/* Action Button: Remove or Browse */}
        <div>
          {file ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--red-600)', padding: '4px 8px' }}
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
            >
              Remove
            </button>
          ) : (
            <button type="button" className="btn btn-outline btn-sm">
              Browse
            </button>
          )}
        </div>

        <input
          id={inputId}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
      </div>

      {/* Validation Error */}
      {error && (
        <div style={{ color: 'var(--red-600)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );
}
