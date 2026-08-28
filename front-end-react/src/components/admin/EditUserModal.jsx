import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

/**
 * Child Component: EditUserModal (Add/Edit User Modal)
 * Handles form validation and communicates submitted user data to the parent via onSave callback.
 * 
 * Props:
 *  - isOpen: boolean
 *  - user: User object (or null for adding new user)
 *  - mode: 'add' | 'edit'
 *  - onSave: Callback (userData) => void
 *  - onClose: Callback () => void
 */
export default function EditUserModal({
  isOpen,
  user,
  mode = 'add',
  onSave,
  onClose,
}) {
  const initialFormState = {
    name: '',
    email: '',
    role: 'citizen',
    phone: '',
    dept: '',
    jurisdiction: '',
    designation: '',
    empId: '',
    status: 'Active',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Sync form data whenever modal opens or active user changes
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        role: (user.role || 'citizen').toLowerCase(),
        phone: user.phone || '',
        dept: user.dept === '—' ? '' : (user.dept || ''),
        jurisdiction: user.jurisdiction || '',
        designation: user.designation === '—' ? '' : (user.designation || ''),
        empId: user.empId === '—' ? '' : (user.empId || ''),
        status: user.status || 'Active',
        joined: user.joined || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [user, mode, isOpen]);

  if (!isOpen) return null;

  const isOfficerOrSupervisor = ['officer', 'supervisor', 'grievance'].includes(formData.role);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }
    if (isOfficerOrSupervisor && !formData.dept) {
      errs.dept = 'Department is required for official roles';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      id: formData.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      joined: formData.joined || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dept: formData.dept || '—',
      designation: formData.designation || '—',
      empId: formData.empId || '—',
    };

    onSave(payload);
  };

  const title = mode === 'edit' ? `Edit User: ${user?.name || ''}` : 'Add New User';

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <div className="modal-actions-right">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {mode === 'edit' ? 'Update User' : 'Create User'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="admin-modal-form">
        <div className="form-grid-2">
          {/* Full Name */}
          <div className="form-field-group">
            <label className="form-field-label">
              Full Name <span className="req-star">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Ravi Kumar"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="field-error-msg">{errors.name}</span>}
          </div>

          {/* Role */}
          <div className="form-field-group">
            <label className="form-field-label">
              Role <span className="req-star">*</span>
            </label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <option value="citizen">Citizen</option>
              <option value="officer">Department Officer</option>
              <option value="supervisor">Department Supervisor</option>
              <option value="grievance">Grievance Officer</option>
              <option value="super_user">Super User (Admin)</option>
            </select>
          </div>

          {/* Email */}
          <div className="form-field-group">
            <label className="form-field-label">
              Email Address <span className="req-star">*</span>
            </label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && <span className="field-error-msg">{errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-field-group">
            <label className="form-field-label">
              Phone Number <span className="req-star">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
          </div>

          {/* Status */}
          <div className="form-field-group">
            <label className="form-field-label">Account Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending Approval</option>
            </select>
          </div>

          {/* Jurisdiction */}
          <div className="form-field-group">
            <label className="form-field-label">Jurisdiction / Zone</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Secunderabad, Central Zone"
              value={formData.jurisdiction}
              onChange={(e) => handleChange('jurisdiction', e.target.value)}
            />
          </div>
        </div>

        {/* Conditional Officer / Supervisor Fields */}
        {isOfficerOrSupervisor && (
          <div className="role-specific-section">
            <h4 className="section-subtitle">Official Department Assignment</h4>
            <div className="form-grid-2">
              <div className="form-field-group">
                <label className="form-field-label">
                  Department <span className="req-star">*</span>
                </label>
                <select
                  className={`form-select ${errors.dept ? 'input-error' : ''}`}
                  value={formData.dept}
                  onChange={(e) => handleChange('dept', e.target.value)}
                >
                  <option value="">Select Department</option>
                  <option value="Revenue Department">Revenue Department</option>
                  <option value="Welfare Department">Welfare Department</option>
                  <option value="Health & Municipal Dept">Health & Municipal Dept</option>
                  <option value="Commercial Licensing Dept">Commercial Licensing Dept</option>
                  <option value="Police & Civic Admin">Police & Civic Admin</option>
                  <option value="Rural Development">Rural Development</option>
                </select>
                {errors.dept && <span className="field-error-msg">{errors.dept}</span>}
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MRO, RI, Welfare Officer"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Employee ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. EMP-1042"
                  value={formData.empId}
                  onChange={(e) => handleChange('empId', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
