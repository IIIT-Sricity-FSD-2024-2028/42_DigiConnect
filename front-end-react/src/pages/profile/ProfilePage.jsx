// src/pages/profile/ProfilePage.jsx
// Complete Officer / User Profile page matching front-end/profile.html and front-end/js/auth.js exactly
// React concepts: Components, State, Effects, Controlled Form Inputs, Tabs, Modals, API Integration, Toast Feedback

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiGetUserById, apiUpdateProfile, apiChangePassword } from '../../api/authApi';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [_loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    aadhaar: '',
    dob: '',
    gender: 'Male',
    religion: 'Hindu',
    casteCategory: 'General',
    phone: '',
    altPhone: '',
    email: '',
    address: '',
    state: '',
    district: '',
    mandal: '',
    pincode: '',
  });

  // Password Change States (Security Tab)
  const [secPassword, setSecPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [secPwLoading, setSecPwLoading] = useState(false);

  // Password Change States (Modal)
  const [modalPassword, setModalPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [modalPwLoading, setModalPwLoading] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    'Application submitted': { sms: true, email: true },
    'Application status update': { sms: true, email: true },
    'Application approved': { sms: true, email: true },
    'Application rejected': { sms: true, email: true },
    'Query raised on application': { sms: true, email: true },
    'Grievance update': { sms: true, email: true },
    'Grievance resolved': { sms: true, email: true },
    'Payment confirmation': { sms: true, email: true },
  });

  // 2FA Toggle
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Documents list
  const [documents, setDocuments] = useState([
    {
      name: 'Aadhaar Card',
      type: 'Identity',
      uploadedOn: '12 Jan 2025',
      status: 'Verified',
      badgeClass: 'badge-success',
    },
    {
      name: 'Department Appointment Order',
      type: 'Service Record',
      uploadedOn: '01 Feb 2025',
      status: 'Verified',
      badgeClass: 'badge-success',
    },
    {
      name: 'Employee ID Card',
      type: 'Credential',
      uploadedOn: '15 Feb 2025',
      status: 'Verified',
      badgeClass: 'badge-success',
    },
  ]);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Populate form initially from session user
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').trim().split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      const rawAadhaar = (user.aadhaar || '').replace(/\s/g, '');
      const maskedAadhaar = rawAadhaar.length >= 4 ? 'XXXX XXXX ' + rawAadhaar.slice(-4) : '— Not on record —';

      setFormData((prev) => ({
        ...prev,
        firstName: fName,
        lastName: lName,
        aadhaar: maskedAadhaar,
        phone: user.phone || '',
        email: user.email || '',
        dob: user.dob || '1990-05-15',
        gender: user.gender || 'Male',
        address: user.address || '',
        state: user.state || user.stateName || 'Andhra Pradesh',
        district: user.district || '',
        mandal: user.mandal || '',
        pincode: user.pincode || '',
      }));

      // Fetch extended details if user ID exists
      if (user.id) {
        setLoading(true);
        apiGetUserById(user.id)
          .then((res) => {
            const data = res?.data || res || {};
            const parts = (data.name || user.name || '').trim().split(' ');
            const rawA = (data.aadhaar || user.aadhaar || '').replace(/\s/g, '');
            const mA = rawA.length >= 4 ? 'XXXX XXXX ' + rawA.slice(-4) : '— Not on record —';

            setFormData((p) => ({
              ...p,
              firstName: parts[0] || p.firstName,
              lastName: parts.slice(1).join(' ') || p.lastName,
              aadhaar: mA,
              phone: data.phone || p.phone,
              email: data.email || p.email,
              dob: data.dob || p.dob,
              gender: data.gender || p.gender,
              address: data.address || p.address,
              state: data.state || p.state,
              district: data.district || p.district,
              mandal: data.mandal || p.mandal,
              pincode: data.pincode || p.pincode,
            }));
          })
          .catch((err) => {
            console.warn('Could not fetch extended profile details:', err.message);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast('First and last name are required.', 'warning');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Mobile phone number is required.', 'warning');
      return;
    }

    setSaving(true);
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const payload = {
      name: fullName,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      dob: formData.dob,
      gender: formData.gender,
      religion: formData.religion,
      casteCategory: formData.casteCategory,
      address: formData.address.trim(),
      state: formData.state,
      district: formData.district.trim(),
      mandal: formData.mandal.trim(),
      pincode: formData.pincode.trim(),
    };

    try {
      if (user?.id) {
        await apiUpdateProfile(user.id, payload);
      }
      // Update local session context
      updateUser({
        ...user,
        name: fullName,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        state: payload.state,
        district: payload.district,
        mandal: payload.mandal,
        pincode: payload.pincode,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change logic
  const handlePasswordSubmit = async (isModal = false) => {
    const data = isModal ? modalPassword : secPassword;
    const setLoadingFn = isModal ? setModalPwLoading : setSecPwLoading;

    if (!data.currentPassword) {
      showToast('Enter your current password.', 'warning');
      return;
    }
    if (!data.newPassword || data.newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'warning');
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setLoadingFn(true);
      if (user?.id) {
        await apiChangePassword(user.id, data.currentPassword, data.newPassword);
      }
      showToast('Password updated successfully!', 'success');

      if (isModal) {
        setModalPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      } else {
        setSecPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setLoadingFn(false);
    }
  };

  // Display initial avatar and role
  const displayName = user?.name || (formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Grievance Officer');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabelMap = {
    grievance: 'Grievance Redressal Officer',
    grievance_officer: 'Grievance Redressal Officer',
    officer: 'Verification Field Officer',
    department_head: 'Department Head',
    state_admin: 'State Administrator',
    central_admin: 'Central Administrator',
    super_user: 'Super Administrator',
    citizen: 'Citizen Applicant',
  };
  const roleLabel = user?.designation || roleLabelMap[(user?.role || '').toLowerCase()] || user?.role || 'Officer';

  return (
    <div className="profile-page-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background:
              toastMessage.type === 'success'
                ? '#166534'
                : toastMessage.type === 'error'
                ? '#991b1b'
                : toastMessage.type === 'warning'
                ? '#92400e'
                : 'var(--navy-800)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Profile Header Banner Card */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', overflow: 'visible', padding: 0 }}>
        {/* Banner Gradient Bar */}
        <div
          style={{
            height: '110px',
            background: 'linear-gradient(135deg, var(--navy-800) 0%, var(--navy-600) 50%, var(--navy-500) 100%)',
            position: 'relative',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>
        </div>

        {/* Profile Info Area */}
        <div style={{ padding: '0 var(--space-xl) var(--space-xl)', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 'var(--space-md)',
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar & Title */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
              <div
                className="avatar avatar-xl"
                id="profileAvatarBig"
                style={{
                  marginTop: '-45px',
                  border: '4px solid white',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--navy-600), var(--navy-400))',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {initials}
              </div>
              <div style={{ paddingBottom: 'var(--space-sm)' }}>
                <h1
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: 'var(--navy-900)',
                    margin: '0 0 4px 0',
                  }}
                  id="profileFullName"
                >
                  {displayName}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  <span className="badge badge-warning" id="profileRoleBadge" style={{ fontWeight: 700 }}>
                    {roleLabel}
                  </span>
                  {user?.stateName && (
                    <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      • {user.stateName}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Banner Buttons */}
            <div style={{ paddingBottom: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowPasswordModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Change Password</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs" style={{ marginBottom: 'var(--space-lg)' }}>
        {[
          { key: 'personal', label: 'Personal Details' },
          { key: 'contact', label: 'Contact & Address' },
          { key: 'documents', label: 'Documents' },
          { key: 'security', label: 'Security' },
          { key: 'notifications', label: 'Notifications' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Personal Details */}
      {activeTab === 'personal' && (
        <div className="tab-content active" id="tab-personal">
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">1</div>
              <span className="form-section-title">Personal Information</span>
            </div>
            <div className="form-section-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    id="pfFirstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    id="pfLastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Aadhaar Number</label>
                  <input
                    type="text"
                    className="form-input"
                    id="pfAadhaar"
                    value={formData.aadhaar}
                    readOnly
                    style={{ background: 'var(--slate-50)', cursor: 'not-allowed' }}
                  />
                  <div className="form-hint">Aadhaar cannot be changed. Contact office for corrections.</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    id="pfDob"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    id="pfGender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Transgender</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Religion</label>
                  <select
                    className="form-input"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                  >
                    <option>Hindu</option>
                    <option>Muslim</option>
                    <option>Christian</option>
                    <option>Sikh</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Caste Category</label>
                  <select
                    className="form-input"
                    value={formData.casteCategory}
                    onChange={(e) => handleInputChange('casteCategory', e.target.value)}
                  >
                    <option>General</option>
                    <option>OBC</option>
                    <option>SC</option>
                    <option>ST</option>
                    <option>EWS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Contact & Address */}
      {activeTab === 'contact' && (
        <div className="tab-content active" id="tab-contact">
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">2</div>
              <span className="form-section-title">Contact Details</span>
            </div>
            <div className="form-section-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Primary Mobile Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    id="pfPhone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alternate Mobile</label>
                  <input
                    type="tel"
                    className="form-input"
                    id="pfAltPhone"
                    placeholder="Optional"
                    value={formData.altPhone}
                    onChange={(e) => handleInputChange('altPhone', e.target.value)}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    id="pfEmail"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">3</div>
              <span className="form-section-title">Current Address</span>
            </div>
            <div className="form-section-body">
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label">
                    Street Address <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-input"
                    rows="2"
                    id="pfAddress"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    State <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    id="pfState"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  >
                    <option value="">Select state</option>
                    <option>Andhra Pradesh</option>
                    <option>Telangana</option>
                    <option>Tamil Nadu</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Gujarat</option>
                    <option>Rajasthan</option>
                    <option>Uttar Pradesh</option>
                    <option>West Bengal</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    District <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    id="pfDistrict"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mandal / Tehsil</label>
                  <input
                    type="text"
                    className="form-input"
                    id="pfMandal"
                    value={formData.mandal}
                    onChange={(e) => handleInputChange('mandal', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    PIN Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    id="pfPincode"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Documents */}
      {activeTab === 'documents' && (
        <div className="tab-content active" id="tab-documents">
          <div className="form-section">
            <div className="form-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="form-section-number">4</div>
                <span className="form-section-title">Uploaded Documents</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const el = document.getElementById('docUploadInput');
                  if (el) el.click();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload New</span>
              </button>
              <input
                type="file"
                id="docUploadInput"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setDocuments((prev) => [
                      ...prev,
                      {
                        name: file.name,
                        type: 'Attachment',
                        uploadedOn: 'Today',
                        status: 'Pending Verification',
                        badgeClass: 'badge-warning',
                      },
                    ]);
                    showToast(`Uploaded ${file.name} successfully!`, 'success');
                  }
                }}
              />
            </div>

            <div className="form-section-body">
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Type</th>
                      <th>Uploaded On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: 'var(--navy-100)',
                                color: 'var(--navy-600)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span style={{ fontWeight: 600 }}>{doc.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{doc.type}</span>
                        </td>
                        <td>{doc.uploadedOn}</td>
                        <td>
                          <span className={`badge ${doc.badgeClass}`}>{doc.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn-icon"
                              title="View Document"
                              onClick={() => showToast(`Previewing ${doc.name}...`, 'info')}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              title="Download Copy"
                              onClick={() => showToast(`Downloading ${doc.name}...`, 'success')}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security */}
      {activeTab === 'security' && (
        <div className="tab-content active" id="tab-security">
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">5</div>
              <span className="form-section-title">Password & Security</span>
            </div>
            <div className="form-section-body">
              <div style={{ maxWidth: '480px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Current Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    id="secCurrPw"
                    placeholder="Enter current password"
                    value={secPassword.currentPassword}
                    onChange={(e) => setSecPassword((p) => ({ ...p, currentPassword: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    New Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    id="secNewPw"
                    placeholder="Min 8 characters"
                    value={secPassword.newPassword}
                    onChange={(e) => setSecPassword((p) => ({ ...p, newPassword: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Confirm New Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    id="secConfirmPw"
                    placeholder="Re-enter new password"
                    value={secPassword.confirmPassword}
                    onChange={(e) => setSecPassword((p) => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  id="updatePasswordBtn"
                  onClick={() => handlePasswordSubmit(false)}
                  disabled={secPwLoading}
                >
                  {secPwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>

              <div className="divider" style={{ margin: 'var(--space-xl) 0', borderBottom: '1px solid var(--color-border)' }}></div>

              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Two-Factor Authentication
              </h4>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-md) var(--space-lg)',
                  background: 'var(--slate-50)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-xl)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>SMS OTP Verification</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Receive OTP on verified phone {formData.phone ? `(+91 ${formData.phone.slice(-4).padStart(10, '•')})` : ''} for each login
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => {
                    setTwoFactorEnabled(e.target.checked);
                    showToast(e.target.checked ? '2FA enabled' : '2FA disabled', 'info');
                  }}
                  style={{ accentColor: 'var(--navy-600)', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Active Sessions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)',
                    background: 'var(--navy-50)',
                    border: '1px solid var(--navy-100)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'var(--navy-100)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--navy-600)',
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                        Current Session (This Device)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Web Browser • Active Now • IP Verified
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="tab-content active" id="tab-notifications">
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">6</div>
              <span className="form-section-title">Notification Preferences</span>
            </div>
            <div className="form-section-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: 'var(--space-xs)' }}>
                  Notify me about
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 'var(--space-md) var(--space-xl)',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    paddingBottom: '8px',
                    borderBottom: '1.5px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Event Type</span>
                  <span style={{ fontWeight: 700, color: 'var(--slate-600)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SMS
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--slate-600)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email
                  </span>
                </div>

                {Object.entries(notifPrefs).map(([event, prefs]) => (
                  <div
                    key={event}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: 'var(--space-md) var(--space-xl)',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--slate-100)',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--slate-800)', fontSize: '0.875rem' }}>
                      {event}
                    </span>
                    <input
                      type="checkbox"
                      checked={prefs.sms}
                      onChange={(e) =>
                        setNotifPrefs((prev) => ({
                          ...prev,
                          [event]: { ...prev[event], sms: e.target.checked },
                        }))
                      }
                      style={{ accentColor: 'var(--navy-600)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <input
                      type="checkbox"
                      checked={prefs.email}
                      onChange={(e) =>
                        setNotifPrefs((prev) => ({
                          ...prev,
                          [event]: { ...prev[event], email: e.target.checked },
                        }))
                      }
                      style={{ accentColor: 'var(--navy-600)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--space-xl)' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => showToast('Notification preferences saved successfully!', 'success')}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay active" id="changePasswordModal" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" style={{ maxWidth: '440px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="modal-title">Change Password</span>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowPasswordModal(false)}
                aria-label="Close modal"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Current Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  id="modalCurrPw"
                  placeholder="••••••••"
                  value={modalPassword.currentPassword}
                  onChange={(e) => setModalPassword((p) => ({ ...p, currentPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  New Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  id="modalNewPw"
                  placeholder="Min 8 characters"
                  value={modalPassword.newPassword}
                  onChange={(e) => setModalPassword((p) => ({ ...p, newPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm New Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  id="modalConfirmPw"
                  placeholder="Re-enter new password"
                  value={modalPassword.confirmPassword}
                  onChange={(e) => setModalPassword((p) => ({ ...p, confirmPassword: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                id="updatePasswordModalBtn"
                onClick={() => handlePasswordSubmit(true)}
                disabled={modalPwLoading}
              >
                {modalPwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
