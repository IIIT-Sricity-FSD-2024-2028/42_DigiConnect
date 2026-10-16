// src/pages/common/ProfilePage.jsx
// React concepts used:
// 1. Components (ProfilePage, Header Banner, Tabs, Document Table, ChangePasswordModal)
// 2. State management (useState for active tab, form inputs, modal visibility, saving states)
// 3. Side effects (useEffect to fetch extended profile on mount)
// 4. Controlled forms (inputs, selects, textareas, checkboxes)
// 5. Context API (useAuth to read session and synchronize updated profile)
// 6. Feedback & Toasts (useToast, Toast)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiGetUserById, apiUpdateProfile, apiChangePassword } from '../../api/authApi';
import useToast from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

const STATES = [
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Tamil Nadu',
  'Telangana',
  'Maharashtra',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
  'Other',
];

export default function ProfilePage() {
  const { user, login } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  // ── Tab State ('personal' | 'contact' | 'documents' | 'security' | 'notifications') ──
  const [activeTab, setActiveTab] = useState('personal');

  // ── Profile Fields State ──
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    altPhone: '',
    email: '',
    aadhaar: '',
    dob: '',
    gender: 'Male',
    religion: 'Hindu',
    caste: 'General',
    income: '',
    address: '',
    state: '',
    district: '',
    mandal: '',
    pincode: '',
  });

  // ── Loading & Modal State ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ── Password Form State ──
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // ── Two-Factor Authentication & Notification Preferences State ──
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState({
    appUpdates: { sms: true, email: true },
    grievances: { sms: true, email: true },
    announcements: { sms: false, email: true },
    security: { sms: true, email: true },
  });

  // ── Documents State (Role-Aware) ──
  const [documents, setDocuments] = useState([]);

  // Sync role-aware documents whenever user changes
  useEffect(() => {
    if (!user) return;
    if (Array.isArray(user.documents) && user.documents.length > 0) {
      setDocuments(user.documents);
      return;
    }
    const regDate = user.createdAt ? new Date(user.createdAt) : new Date(Date.now() - 30 * 86400000);
    const dateStr = regDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const isCitizen = !user.role || user.role === 'citizen';
    if (isCitizen) {
      setDocuments([
        {
          id: 'doc-cit-1',
          name: 'Aadhaar Card',
          type: 'Identity',
          uploadedOn: dateStr,
          status: 'Verified',
          badgeClass: 'badge-success',
        },
        {
          id: 'doc-cit-2',
          name: 'Ration Card / Rice Card',
          type: 'Family Record',
          uploadedOn: dateStr,
          status: 'Verified',
          badgeClass: 'badge-success',
        },
        {
          id: 'doc-cit-3',
          name: 'Integrated Caste & Income Certificate',
          type: 'Income / Caste',
          uploadedOn: dateStr,
          status: 'Verified',
          badgeClass: 'badge-success',
        },
        {
          id: 'doc-cit-4',
          name: 'Permanent Residence / Domicile Certificate',
          type: 'Residence',
          uploadedOn: dateStr,
          status: 'Verified',
          badgeClass: 'badge-success',
        },
      ]);
    } else {
      setDocuments([
        {
          id: 'doc-off-1',
          name: 'Department Appointment & Cadre Order',
          type: 'Service Record',
          uploadedOn: dateStr,
          status: 'Verified',
          badgeClass: 'badge-success',
        },
        {
          id: 'doc-off-2',
          name: 'Official Government Employee ID Card',
          type: 'Credential',
          uploadedOn: dateStr,
          status: 'Verified',
          badgeClass: 'badge-success',
        },
        {
          id: 'doc-off-3',
          name: 'Digital Signature Certificate (DSC - Class 3)',
          type: 'Security & Signing',
          uploadedOn: dateStr,
          status: 'Active',
          badgeClass: 'badge-success',
        },
        {
          id: 'doc-off-4',
          name: 'Vigilance & Service Integrity Clearance',
          type: 'Compliance',
          uploadedOn: dateStr,
          status: 'Verified',
          badgeClass: 'badge-success',
        },
      ]);
    }
  }, [user]);

  // ── Fetch Profile on Mount ──
  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    // Pre-populate immediately from session
    const nameParts = (user.name || '').split(' ');
    setProfileData((prev) => ({
      ...prev,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: user.phone || '',
      email: user.email || '',
      state: user.stateName || user.state || '',
      district: user.district || user.assignedNodeId || '',
    }));

    // Fetch extended user data from backend
    const userId = user.id || user.sub;
    apiGetUserById(userId)
      .then((res) => {
        if (!isMounted) return;
        const u = res.data || res || {};
        const parts = (u.name || user.name || '').split(' ');
        setProfileData({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          phone: u.phone || user.phone || '',
          altPhone: u.altPhone || '',
          email: u.email || user.email || '',
          aadhaar: u.aadhaar || user.aadhaar || '',
          dob: u.dob || user.dob || '',
          gender: u.gender || user.gender || 'Male',
          religion: u.religion || user.religion || '',
          caste: u.caste || user.caste || '',
          income: u.income || user.income || '',
          address: u.address || user.address || '',
          state: u.state || user.stateName || user.state || '',
          district: u.district || user.district || user.jurisdiction || '',
          mandal: u.mandal || user.mandal || '',
          pincode: u.pincode || user.pincode || '',
        });
      })
      .catch((err) => {
        console.warn('Extended profile data unavailable:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // ── Input Change Handler ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Save Profile Handler ──
  const handleSaveProfile = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      showToast('First and last name are required.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const userId = user.id || user.sub;
      const fullName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`;
      const payload = {
        name: fullName,
        phone: profileData.phone.trim(),
        email: profileData.email.trim(),
        dob: profileData.dob,
        gender: profileData.gender,
        religion: profileData.religion,
        caste: profileData.caste,
        income: profileData.income,
        address: profileData.address.trim(),
        state: profileData.state,
        district: profileData.district.trim(),
        mandal: profileData.mandal.trim(),
        pincode: profileData.pincode.trim(),
      };

      await apiUpdateProfile(userId, payload);

      // Synchronize AuthContext and local storage so Topbar/Sidebar show updated info
      login({
        ...user,
        name: fullName,
        email: payload.email,
        phone: payload.phone,
      });

      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Change Password Handler (Modal or Security Tab) ──
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      showToast('Please enter your current password.', 'warning');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      const userId = user.id || user.sub;
      await apiChangePassword(userId, currentPassword, newPassword);
      showToast('Password updated successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ── Document Actions ──
  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Document removed.', 'info');
  };

  // User Initials & Full Name
  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || user?.name || 'User Profile';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const aadhaarValue = profileData.aadhaar || user?.aadhaar || '';
  const maskedAadhaar = aadhaarValue.replace(/\s/g, '').length >= 4
    ? '•••• •••• ' + aadhaarValue.replace(/\s/g, '').slice(-4)
    : (user?.role === 'CITIZEN' ? '•••• •••• 8901' : 'Not Linked');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: 'var(--space-2xl)' }}>
      <Toast toast={toast} onClose={hideToast} />

      {/* ── Profile Header Card ── */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', overflow: 'visible', padding: 0 }}>
        {/* Banner with gradient */}
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
          />
        </div>

        {/* User Info & Action Buttons */}
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
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
              <div
                style={{
                  marginTop: '-44px',
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'var(--navy-700)',
                  color: '#fff',
                  border: '4px solid #fff',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
              <div style={{ paddingBottom: 'var(--space-xs)' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  {fullName}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {user?.role || 'CITIZEN'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    ID: {user?.id || 'USR-CIT-01'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ paddingBottom: 'var(--space-xs)', display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowPasswordModal(true)}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--color-border)', marginBottom: 'var(--space-xl)', overflowX: 'auto' }}>
        {[
          { id: 'personal', label: 'Personal Details' },
          { id: 'contact', label: 'Contact & Address' },
          { id: 'documents', label: 'Documents' },
          { id: 'security', label: 'Security' },
          { id: 'notifications', label: 'Notifications' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--navy-600)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '3px solid var(--navy-600)' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ════════ Tab 1: Personal Details ════════ */}
      {activeTab === 'personal' && (
        <div className="card" style={{ padding: 'var(--space-xl)' }}>
          <div className="form-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              1. Personal Information
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                value={profileData.firstName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                value={profileData.lastName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="aadhaar">
                Aadhaar Number
              </label>
              <input
                type="text"
                id="aadhaar"
                className="form-input"
                value={maskedAadhaar}
                readOnly
                style={{ background: 'var(--slate-50, #f8fafc)', cursor: 'not-allowed', color: 'var(--color-text-muted)' }}
              />
              <div className="form-hint" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Aadhaar is locked for identity integrity. Contact nodal office for updates.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dob">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                className="form-input"
                value={profileData.dob}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">
                Gender
              </label>
              <select id="gender" name="gender" className="form-input" value={profileData.gender} onChange={handleInputChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="religion">
                Religion
              </label>
              <select id="religion" name="religion" className="form-input" value={profileData.religion} onChange={handleInputChange}>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="caste">
                Caste Category
              </label>
              <select id="caste" name="caste" className="form-input" value={profileData.caste} onChange={handleInputChange}>
                <option value="General">General / OC</option>
                <option value="OBC">OBC / BC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="income">
                Annual Household Income (₹)
              </label>
              <input
                type="number"
                id="income"
                name="income"
                className="form-input"
                placeholder="e.g. 350000"
                value={profileData.income}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════ Tab 2: Contact & Address ════════ */}
      {activeTab === 'contact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <div className="form-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                2. Contact Information
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Mobile Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={profileData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="altPhone">
                  Alternate Mobile Number
                </label>
                <input
                  type="tel"
                  id="altPhone"
                  name="altPhone"
                  className="form-input"
                  placeholder="Optional"
                  value={profileData.altPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <div className="form-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                3. Permanent Address
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="address">
                  Street Address <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="form-input"
                  rows={2}
                  value={profileData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State <span className="required">*</span>
                </label>
                <select id="state" name="state" className="form-input" value={profileData.state} onChange={handleInputChange}>
                  <option value="">Select state</option>
                  {STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="district">
                  District <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  className="form-input"
                  value={profileData.district}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mandal">
                  Mandal / Tehsil
                </label>
                <input
                  type="text"
                  id="mandal"
                  name="mandal"
                  className="form-input"
                  value={profileData.mandal}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pincode">
                  PIN Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  className="form-input"
                  maxLength={6}
                  value={profileData.pincode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Tab 3: Documents ════════ */}
      {activeTab === 'documents' && (
        <div className="card" style={{ padding: 'var(--space-xl)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-lg)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                4. Verified Digital Documents
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {user?.role === 'citizen'
                  ? 'These documents are linked to your profile and automatically attachable to applications.'
                  : 'Official service credentials and verified departmental records linked to your administrative profile.'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => showToast('Document upload module ready.', 'info')}
            >
              + Upload Document
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '10px' }}>Document Name</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Uploaded On</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--navy-900)' }}>
                      📄 {doc.name}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="badge badge-info">{doc.type}</span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      {doc.uploadedOn}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge ${doc.badgeClass}`}>{doc.status}</span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', marginRight: '6px' }}
                        onClick={() => showToast(`Viewing ${doc.name}`, 'info')}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', color: 'var(--red-600)', borderColor: 'var(--red-200)' }}
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════ Tab 4: Security ════════ */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: 'var(--space-md)' }}>
              Password & Authentication
            </span>

            <div style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="secCurrPw">
                  Current Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="secCurrPw"
                  className="form-input"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="secNewPw">
                  New Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="secNewPw"
                  className="form-input"
                  placeholder="Min 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="secConfirmPw">
                  Confirm New Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="secConfirmPw"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePasswordSubmit}
                disabled={updatingPassword}
                style={{ alignSelf: 'flex-start' }}
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-xl) 0' }} />

            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: 'var(--space-sm)' }}>
              Two-Factor Authentication (2FA)
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-md) var(--space-lg)',
                background: 'var(--slate-50, #f8fafc)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                maxWidth: '600px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>SMS OTP Verification</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Receive a 6-digit OTP on your registered phone for every login.
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => {
                  setTwoFactorEnabled(e.target.checked);
                  showToast(e.target.checked ? '2FA enabled' : '2FA disabled', 'info');
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════ Tab 5: Notifications ════════ */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: 'var(--space-xl)' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: 'var(--space-sm)' }}>
            Notification Preferences
          </span>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
            Choose how you would like to receive updates regarding your applications, grievances, and announcements.
          </p>

          <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {[
              { key: 'appUpdates', title: 'Application Status Updates', desc: 'When your application status changes (approved, queried, dispatched)' },
              { key: 'grievances', title: 'Grievance Redressal Alerts', desc: 'Officer assignment, resolution notes, and escalation events' },
              { key: 'announcements', title: 'State Welfare Schemes & Announcements', desc: 'New state schemes, eligibility alerts, and portals news' },
              { key: 'security', title: 'Account & Security Alerts', desc: 'Password updates, logins from new devices, and 2FA notices' },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-md)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.9rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifPrefs[item.key].sms}
                      onChange={(e) =>
                        setNotifPrefs((prev) => ({
                          ...prev,
                          [item.key]: { ...prev[item.key], sms: e.target.checked },
                        }))
                      }
                    />
                    SMS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifPrefs[item.key].email}
                      onChange={(e) =>
                        setNotifPrefs((prev) => ({
                          ...prev,
                          [item.key]: { ...prev[item.key], email: e.target.checked },
                        }))
                      }
                    />
                    Email
                  </label>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: 'var(--space-md)' }}
              onClick={() => showToast('Notification preferences saved successfully!', 'success')}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ════════ Change Password Modal ════════ */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 'var(--space-md)',
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '440px', padding: 'var(--space-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--navy-900)' }}>
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Current Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updatingPassword}>
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
