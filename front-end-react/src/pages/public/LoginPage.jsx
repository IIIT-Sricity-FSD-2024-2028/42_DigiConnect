// src/pages/public/LoginPage.jsx
// React concepts used: Components, Props (internal), State (useState), Events (onClick, onSubmit, onChange),
// Lists (roles.map, demoCredentials.map), Hooks (useState, useEffect), Forms (controlled inputs),
// Context (useAuth), Router (useNavigate, Link), API calls (apiLogin), Callbacks (handleSubmit, selectRole, fillDemo)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiLogin } from '../../api/authApi';

// ── Role configuration list (used to render the role-selector grid via .map) ──
const ROLES = [
  {
    value: 'citizen',
    label: 'Citizen',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    value: 'officer',
    label: 'Officer',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'department_head',
    label: 'Dept Head',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: 'state_admin',
    label: 'State Admin',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    value: 'central_admin',
    label: 'Central Admin',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    value: 'grievance',
    label: 'Grievance',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

// ── Demo credentials list (rendered via .map for the quick-fill box) ──
const DEMO_CREDENTIALS = [
  { role: 'citizen', email: 'ravi.ap@gmail.com', label: 'Citizen', color: '#0284c7' },
  { role: 'officer', email: 'suresh.vro@ap.gov.in', label: 'Officer', color: '#16a34a' },
  { role: 'department_head', email: 'head.rev@ap.gov.in', label: 'Dept Head', color: '#9333ea' },
  { role: 'state_admin', email: 'admin@ap.gov.in', label: 'State Admin', color: '#d97706' },
  { role: 'central_admin', email: 'superuser@gov.in', label: 'Central Admin', color: '#dc2626' },
  { role: 'grievance', email: 'hemalatha.grv@ap.gov.in', label: 'Grievance', color: '#0891b2' },
];

// ── Dynamic login-ID label map (changes when a role is selected) ──
const LOGIN_ID_LABELS = {
  citizen: 'Phone / Aadhaar / Email',
  officer: 'Officer Email / Employee ID',
  department_head: 'Dept Head Email / Username',
  state_admin: 'State Admin Email / Username',
  central_admin: 'Central Admin Username / Email',
  grievance: 'Grievance Officer ID / Email',
};

// ── Role → dashboard redirect map (used after successful login) ──
const ROLE_REDIRECT_MAP = {
  citizen: '/citizen/dashboard',
  officer: '/officer/dashboard',
  department_head: '/department-head/dashboard',
  state_admin: '/state-admin/dashboard',
  central_admin: '/central-admin/dashboard',
  grievance: '/grievance/dashboard',
  grievance_officer: '/grievance/dashboard',
  super_user: '/central-admin/dashboard',
};

// ── Role mapping: form-value → backend role string ──
const ROLE_MAP = {
  citizen: 'citizen',
  officer: 'officer',
  department_head: 'department_head',
  supervisor: 'department_head',
  state_admin: 'state_admin',
  central_admin: 'super_user',
  super_user: 'super_user',
  admin: 'super_user',
  super_admin: 'super_user',
  grievance: 'grievance',
};

export default function LoginPage() {
  // ── State ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot-password modal state
  const [fpOpen, setFpOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpIdentity, setFpIdentity] = useState('');
  const [fpFoundName, setFpFoundName] = useState('');
  const [fpSecurityQuestion, setFpSecurityQuestion] = useState('');
  const [fpSecurityAnswer, setFpSecurityAnswer] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpUserId, setFpUserId] = useState(null);

  // ── Context & Router hooks ──
  const { login, isLoggedIn, role } = useAuth();
  const navigate = useNavigate();

  // ── Effect: redirect already-logged-in users to their dashboard ──
  useEffect(() => {
    if (isLoggedIn && role) {
      const dest = ROLE_REDIRECT_MAP[role] || '/citizen/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isLoggedIn, role, navigate]);

  // ── Callback: select a role (click handler passed to each role card) ──
  const handleSelectRole = (roleValue) => {
    setSelectedRole(roleValue);
  };

  // ── Callback: fill demo credentials (click handler on demo buttons) ──
  const handleFillDemo = (demoRole, demoEmail) => {
    setSelectedRole(demoRole);
    setEmail(demoEmail);
    setPassword('password123');
  };

  // ── Callback: toggle password visibility ──
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // ── Callback: form submit → API call → context login → navigate ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // [API call] POST /users/login
      const res = await apiLogin(email, password);
      const user = res.data;

      // Role matching (same logic as original auth.js)
      const mappedRole = ROLE_MAP[selectedRole] || selectedRole;
      const userRoleLower = (user.role || '').toLowerCase();

      const isRoleMatch =
        userRoleLower === mappedRole.toLowerCase() ||
        (mappedRole === 'super_user' && (userRoleLower === 'central_admin' || userRoleLower === 'super_admin')) ||
        (mappedRole === 'department_head' && userRoleLower === 'supervisor') ||
        (mappedRole === 'grievance' && userRoleLower === 'grievance_officer');

      if (!isRoleMatch) {
        setError(`This account is not registered as ${selectedRole.replace(/_/g, ' ')}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      // Build session object (matches original auth.js structure)
      const session = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role === 'super_user' || user.role === 'central_admin' ? 'central_admin' : user.role,
        roleKey: user.role === 'super_user' || user.role === 'central_admin' ? 'central_admin' : user.role,
        backendRole: user.backendRole || user.role,
        actualRole: user.role,
        stateId: user.stateId || '',
        departmentId: user.departmentId || '',
        assignedNodeId: user.assignedNodeId || user.jurisdiction || '',
        designationId: user.designationId || '',
        title: user.title,
        phone: user.phone,
        loginTime: new Date().toISOString(),
      };

      // [Context] Store session in AuthContext (which syncs to localStorage)
      login(session);

      // [Router] Navigate to the role-specific dashboard
      const dest = ROLE_REDIRECT_MAP[session.role] || ROLE_REDIRECT_MAP[session.roleKey] || '/citizen/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password Handlers ──
  const handleFpFindAccount = async () => {
    setFpError('');
    if (!fpIdentity.trim()) {
      setFpError('Please enter your username, email, or phone number.');
      return;
    }
    try {
      // We use the apiGetUsers or a lookup - for now search by fetching users
      const { apiGetUsers } = await import('../../api/authApi');
      const res = await apiGetUsers();
      const users = res.data || res;
      const found = (Array.isArray(users) ? users : []).find(
        (u) =>
          (u.email && u.email.toLowerCase() === fpIdentity.trim().toLowerCase()) ||
          (u.username && u.username.toLowerCase() === fpIdentity.trim().toLowerCase()) ||
          (u.phone && u.phone === fpIdentity.trim())
      );
      if (!found) {
        setFpError('Account not found. Please check your details.');
        return;
      }
      setFpUserId(found.id);
      setFpFoundName(found.name || found.email);
      setFpSecurityQuestion(found.securityQuestion || 'What is your mother\'s maiden name?');
      setFpStep(2);
    } catch (err) {
      setFpError(err.message || 'Error looking up account.');
    }
  };

  const handleFpVerifyAnswer = () => {
    setFpError('');
    if (!fpSecurityAnswer.trim()) {
      setFpError('Please enter your answer.');
      return;
    }
    // In a real app this would verify server-side; for demo we proceed
    setFpStep(3);
  };

  const handleFpResetPassword = async () => {
    setFpError('');
    if (!fpNewPassword || fpNewPassword.length < 8) {
      setFpError('Password must be at least 8 characters.');
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('Passwords do not match.');
      return;
    }
    try {
      const { apiUpdateProfile } = await import('../../api/authApi');
      await apiUpdateProfile(fpUserId, { password: fpNewPassword });
      // Close modal and show success
      setFpOpen(false);
      setFpStep(1);
      setFpIdentity('');
      setFpSecurityAnswer('');
      setFpNewPassword('');
      setFpConfirmPassword('');
      setError(''); // clear any login error
      // Could show a toast here, but keeping it simple
      alert('Password reset successful! You can now sign in with your new password.');
    } catch (err) {
      setFpError(err.message || 'Error resetting password.');
    }
  };

  const closeFpModal = () => {
    setFpOpen(false);
    setFpStep(1);
    setFpError('');
  };

  // ── Render ──
  return (
    <div className="auth-page">

      {/* ── Left Decorative Panel ── */}
      <div className="auth-panel">
        <div className="auth-panel-grid"></div>

        <div className="auth-panel-brand">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="auth-brand-logo">
              <div className="auth-brand-icon">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <div className="auth-brand-name">DigiConnect</div>
                <div className="auth-brand-tagline">Unified Citizen Service Delivery</div>
              </div>
            </div>
          </Link>

          <div className="auth-panel-heading">
            <h1>Welcome<br />back to<br /><span>Digital</span><br />Governance</h1>
            <p>Access government services, track your applications, and manage your documents — all in one secure portal.</p>
          </div>
        </div>

        {/* Feature list (rendered using .map on an array — Lists concept) */}
        <div className="auth-features">
          {[
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
              text: 'Secure, encrypted access',
            },
            {
              icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
              text: 'Real-time application tracking',
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
              text: '24/7 service availability',
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
              text: 'Integrated online payments',
            },
          ].map((feature, idx) => (
            <div className="auth-feature" key={idx}>
              <div className="auth-feature-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <span className="auth-feature-text">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="auth-panel-footer">
          © 2025 DigiConnect – Digital Governance &amp; E-Services
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          <div className="auth-form-header">
            <h2 className="auth-form-title">Sign in to your account</h2>
            <p className="auth-form-subtitle">
              Don't have an account? <Link to="/register">Register now</Link>
            </p>
          </div>

          {/* ── Role Selector (renders from ROLES list via .map) ── */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="form-label" style={{ marginBottom: 'var(--space-sm)' }}>Sign in as</div>
            <div className="role-selector" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`role-option${selectedRole === r.value ? ' selected' : ''}`}
                  onClick={() => handleSelectRole(r.value)}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={selectedRole === r.value}
                    onChange={() => handleSelectRole(r.value)}
                  />
                  <div className="role-option-icon">{r.icon}</div>
                  <span className="role-option-label">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Login Form (controlled inputs) ── */}
          <form onSubmit={handleSubmit}>

            {/* Email / ID field */}
            <div className="form-group">
              <label className="form-label" htmlFor="loginId">
                <span>{LOGIN_ID_LABELS[selectedRole] || 'Username'}</span>
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  id="loginId"
                  className="form-input has-icon"
                  placeholder="Enter your ID"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setFpOpen(true); setFpStep(1); setFpError(''); }}
                  style={{ fontSize: '0.8rem', color: 'var(--navy-500)', fontWeight: 600 }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input has-icon has-icon-right"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="input-right-btn" onClick={handleTogglePassword}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showPassword ? (
                      /* eye-off icon */
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                    ) : (
                      /* eye icon */
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="checkbox-row" style={{ marginBottom: 'var(--space-xl)' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me for 30 days</label>
            </div>

            {/* Error alert (conditionally rendered via state) */}
            {error && (
              <div className="alert alert-danger" style={{ display: 'flex', marginBottom: 'var(--space-lg)' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit button with loading spinner */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {loading && (
                <div
                  className="spinner"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                ></div>
              )}
            </button>

            {/* ── Quick Demo Credentials (renders from DEMO_CREDENTIALS via .map) ── */}
            <div style={{
              marginTop: '18px', padding: '12px', background: '#f8fafc',
              border: '1px dashed #cbd5e1', borderRadius: '8px',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
              }}>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                  color: '#475569', letterSpacing: '0.05em',
                }}>
                  Quick Demo Credentials (Password: password123)
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '0.75rem' }}>
                {DEMO_CREDENTIALS.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    className="btn btn-sm"
                    style={{
                      textAlign: 'left', justifyContent: 'flex-start', padding: '5px 8px',
                      border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.72rem',
                    }}
                    onClick={() => handleFillDemo(demo.role, demo.email)}
                  >
                    <span style={{ fontWeight: 700, color: demo.color, marginRight: '4px' }}>
                      {demo.label}:
                    </span>
                    {demo.email}
                  </button>
                ))}
              </div>
            </div>
          </form>

          <br />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal (state-driven visibility) ── */}
      <div
        className={`modal-overlay${fpOpen ? ' active' : ''}`}
        id="forgotPasswordModal"
        onClick={(e) => { if (e.target === e.currentTarget) closeFpModal(); }}
      >
        <div className="modal-card" style={{ maxWidth: '440px', width: '90%', padding: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>Reset Password</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Step {fpStep} of 3 — {fpStep === 1 ? 'Find Account' : fpStep === 2 ? 'Security Question' : 'New Password'}
              </p>
            </div>
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.5rem', lineHeight: 1 }}
              onClick={closeFpModal}
            >
              &times;
            </button>
          </div>

          {/* Step indicator pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-xl)' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1, height: '4px', borderRadius: '2px',
                  background: fpStep >= s ? 'var(--navy-500)' : 'var(--slate-200)',
                  transition: 'background 0.3s',
                }}
              ></div>
            ))}
          </div>

          {/* Step 1: Find Account */}
          {fpStep === 1 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                Enter your username, email, or phone number to find your account.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="fpIdentity">Username / Email / Phone</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    id="fpIdentity"
                    className="form-input has-icon"
                    placeholder="Enter your username, email or phone"
                    value={fpIdentity}
                    onChange={(e) => setFpIdentity(e.target.value)}
                  />
                </div>
              </div>
              {fpError && (
                <div className="alert alert-danger" style={{ display: 'flex', marginBottom: 'var(--space-md)' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                  </svg>
                  <span>{fpError}</span>
                </div>
              )}
              <button type="button" className="auth-submit-btn" onClick={handleFpFindAccount}>Find My Account</button>
            </div>
          )}

          {/* Step 2: Security Question */}
          {fpStep === 2 && (
            <div>
              <div style={{
                background: 'var(--slate-50)', border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Account Found
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>{fpFoundName}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Security Question</label>
                <div style={{
                  fontSize: '0.9375rem', fontWeight: 600, color: 'var(--navy-900)',
                  padding: '12px 14px', background: '#fff', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-200)',
                }}>
                  {fpSecurityQuestion}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fpSecurityAnswer">Your Answer <span className="required">*</span></label>
                <input
                  type="text"
                  id="fpSecurityAnswer"
                  className="form-input"
                  placeholder="Type your answer here"
                  value={fpSecurityAnswer}
                  onChange={(e) => setFpSecurityAnswer(e.target.value)}
                />
              </div>
              {fpError && (
                <div className="alert alert-danger" style={{ display: 'flex', marginBottom: 'var(--space-md)' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                  </svg>
                  <span>{fpError}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setFpStep(1); setFpError(''); }}>← Back</button>
                <button type="button" className="auth-submit-btn" style={{ flex: 2 }} onClick={handleFpVerifyAnswer}>Verify Answer</button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {fpStep === 3 && (
            <div>
              <div style={{
                background: '#f0fdf4', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)',
                marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              }}>
                <svg width="20" height="20" fill="none" stroke="var(--green-500)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>Identity verified! Set your new password below.</span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fpNewPassword">New Password <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    id="fpNewPassword"
                    className="form-input has-icon"
                    placeholder="Min 8 characters"
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fpConfirmPassword">Confirm Password <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    id="fpConfirmPassword"
                    className="form-input has-icon"
                    placeholder="Re-enter new password"
                    value={fpConfirmPassword}
                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              {fpError && (
                <div className="alert alert-danger" style={{ display: 'flex', marginBottom: 'var(--space-md)' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                  </svg>
                  <span>{fpError}</span>
                </div>
              )}
              <button type="button" className="auth-submit-btn" onClick={handleFpResetPassword}>Reset Password</button>
            </div>
          )}
        </div>
      </div>

      {/* Toast container placeholder (for teammates who implement toast) */}
      <div id="toast-container"></div>
    </div>
  );
}
