// src/components/citizen/DynamicField.jsx
// React concepts used: Components, Props (field, value, onChange), Events (onChange), Forms (controlled inputs), Callbacks (onChange(key, val))

import React from 'react';

/**
 * DynamicField — Generates a controlled form input matching the service's schema.
 *
 * Props:
 *   field    {Object}   - Schema specification { id, key, label, type, required, options, placeholder, min, max, colSpan }
 *   value    {string}   - Current input value from parent state
 *   onChange {Function} - Callback returning (fieldKey, newValue)
 */
export default function DynamicField({ field, value = '', onChange }) {
  const fieldKey = field.key || field.id;
  const fieldType = (field.type || 'text').toLowerCase();
  const isRequired = !!field.required;
  const options = field.options || field.constraints?.options || [];

  const handleChange = (e) => {
    onChange(fieldKey, e.target.value);
  };

  const handleCheckboxChange = (e) => {
    onChange(fieldKey, e.target.checked);
  };

  const isColSpanFull = field.colSpan === 'full' || fieldType === 'textarea';

  return (
    <div className={`form-group ${isColSpanFull ? 'col-span-full' : ''}`.trim()}>
      <label className="form-label">
        {field.label} {isRequired && <span className="required">*</span>}
      </label>

      {fieldType === 'select' || fieldType === 'dropdown' ? (
        <select
          className="form-input"
          value={value}
          onChange={handleChange}
          required={isRequired}
        >
          <option value="">{`-- Select ${field.label} --`}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : fieldType === 'checkbox' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={handleCheckboxChange}
            required={isRequired}
            style={{ accentColor: 'var(--navy-600)', width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
            {field.placeholder || `Confirm ${field.label}`}
          </span>
        </label>
      ) : fieldType === 'textarea' ? (
        <textarea
          className="form-input"
          rows={3}
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value}
          onChange={handleChange}
          required={isRequired}
        />
      ) : (
        <input
          type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
          className="form-input"
          placeholder={field.placeholder || `Enter ${field.label}`}
          min={field.min}
          max={field.max}
          value={value}
          onChange={handleChange}
          required={isRequired}
        />
      )}
    </div>
  );
}
