// src/components/common/SearchBar.jsx
// Universal SearchBar filter input component for DigiConnect.
// React concepts: Components, Props, State/Controlled Input, Events (onChange, onKeyDown), Callbacks

import React from 'react';

/**
 * Reusable SearchBar component with magnifying glass icon and instant clear button.
 *
 * Props:
 *   value       {string}   - Search input value (controlled)
 *   onChange    {function} - Callback when input changes. Passes (value, event)
 *   placeholder {string}   - Placeholder text (default: 'Search...')
 *   onClear     {function} - Optional callback triggered when clear button is clicked
 *   disabled    {boolean}  - Whether the search input is disabled
 *   className   {string}   - Extra wrapper CSS class
 */
export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  onClear,
  disabled = false,
  className = '',
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  return (
    <div
      className={`search-box ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minWidth: '220px',
        flex: 1,
      }}
    >
      {/* Magnifying Glass Icon */}
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      {/* Search Input */}
      <input
        type="text"
        className="search-box-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '9px 36px 9px 36px',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          background: 'var(--slate-50)',
          color: 'var(--color-text)',
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--navy-400)';
          e.currentTarget.style.background = 'var(--color-surface)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 87, 160, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.background = 'var(--slate-50)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      {/* Clear Button (Shown only when input has text) */}
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '2px 4px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
