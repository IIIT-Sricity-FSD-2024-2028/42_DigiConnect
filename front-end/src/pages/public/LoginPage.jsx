// src/pages/public/LoginPage.jsx
// React concepts used: Components, Props (internal), State (useState), Events (onClick, onSubmit, onChange),
// Lists (roles.map, demoCredentials.map), Hooks (useState, useEffect), Forms (controlled inputs),
// Context (useAuth), Router (useNavigate, Link), API calls (apiLogin), Callbacks (handleSubmit, selectRole, fillDemo)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiLogin, apiGetUsers, apiUpdateProfile } from '../../api/authApi';
import Modal from '../../components/common/Modal';

// ── Demo credentials list (rendered via .map for the quick-fill box) ──
const DEMO_CREDENTIALS = [
  { role: 'citizen', email: 'ravi.ap@gmail.com', label: 'Citizen', color: '#0284c7' },
  { role: 'officer', email: 'suresh.vro@ap.gov.in', label: 'Officer (VRO)', color: '#16a34a' },
  { role: 'officer', email: 'jagadeesh.ri@ap.gov.in', label: 'Officer (RI)', color: '#059669' },
  { role: 'officer', email: 'prabhakar.tah@ap.gov.in', label: 'Officer (MRO)', color: '#047857' },
  { role: 'department_head', email: 'head.rev@ap.gov.in', label: 'Dept Head', color: '#9333ea' },
  { role: 'state_admin', email: 'admin@ap.gov.in', label: 'State Admin', color: '#d97706' },
  { role: 'central_admin', email: 'superuser@gov.in', label: 'Central Admin', color: '#dc2626' },
  { role: 'grievance', email: 'hemalatha.grv@ap.gov.in', label: 'Grievance', color: '#0891b2' },
];

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

export default function LoginPage() {
  // ── State ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Deactivated state modal
  const [deactivatedModal, setDeactivatedModal] = useState({
    isOpen: false,
    stateName: '',
  });

  // ── Context & Router hooks ──
  const { login, logout, isLoggedIn, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Effect: check URL for redirect due to deactivated state ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('state_deactivated') === 'true') {
      logout();
      setDeactivatedModal({
        isOpen: true,
        stateName: params.get('stateName') || 'Your State',
      });
    }
  }, [location.search]);

  // ── Effect: redirect already-logged-in users to their dashboard ──
  useEffect(() => {
    if (isLoggedIn && role) {
      if (user?.isStateDeactivated || (user?.stateStatus && user.stateStatus.toUpperCase() === 'INACTIVE')) {
        setDeactivatedModal({
          isOpen: true,
          stateName: user.deactivatedStateName || user.state || 'Your State',
        });
        return;
      }
      const dest = ROLE_REDIRECT_MAP[role] || '/citizen/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isLoggedIn, role, user, navigate]);

  // ── Callback: fill demo credentials (click handler on demo buttons) ──
  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  // ── Callback: toggle password visibility ──
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // ── Callback: close deactivated state modal and go to landing page ──
  const handleCloseDeactivatedModal = () => {
    setDeactivatedModal({ isOpen: false, stateName: '' });
    logout();
    navigate('/', { replace: true });
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

      // Check if user belongs to a deactivated state
      const isDeactivated =
        user?.isStateDeactivated === true ||
        (user?.stateStatus && user.stateStatus.toUpperCase() === 'INACTIVE');

      if (isDeactivated) {
        logout();
        setDeactivatedModal({
          isOpen: true,
          stateName: user.deactivatedStateName || user.state || 'Your State',
        });
        setLoading(false);
        return;
      }

      // Build session object (matches original auth.js structure)
      const rawRole = (user.role || '').toLowerCase();
      const rawBackend = (user.backendRole || '').toLowerCase();
      const normalizedRole =
        rawRole === 'super_user' || rawRole === 'central_admin' || rawBackend === 'central_admin'
          ? 'central_admin'
          : rawRole === 'state_admin' || rawBackend === 'state_admin'
          ? 'state_admin'
          : rawRole === 'department_head' || rawBackend === 'department_head'
          ? 'department_head'
          : rawRole;

      const session = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: normalizedRole,
        roleKey: normalizedRole,
        backendRole: user.backendRole || user.role,
        actualRole: user.role,
        stateId: user.stateId || '',
        state: user.state || '',
        stateStatus: user.stateStatus || 'ACTIVE',
        isStateDeactivated: false,
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
      // Search account by fetching users
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
          © 2026 DigiConnect – Digital Governance &amp; E-Services
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

          {/* ── Login Form (controlled inputs) ── */}
          <form onSubmit={handleSubmit}>

            {/* Email / ID field */}
            <div className="form-group">
              <label className="form-label" htmlFor="loginId">
                <span>Phone / Aadhaar / Email</span>
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
                  placeholder="Enter phone, Aadhaar, or email"
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
                <button
                  type="button"
                  onClick={() => { setFpOpen(true); setFpStep(1); setFpError(''); }}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--navy-500)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Forgot password?
                </button>
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
            <div className="demo-credentials-box">
              <div className="demo-credentials-header">
                <span className="demo-credentials-title">
                  Quick Demo Credentials (Password: password123)
                </span>
              </div>
              <div className="demo-credentials-grid">
                {DEMO_CREDENTIALS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    className="demo-credential-btn"
                    onClick={() => handleFillDemo(demo.email)}
                  >
                    <span
                      className="demo-credential-label"
                      style={{ color: demo.color }}
                    >
                      {demo.label}:
                    </span>
                    <span className="demo-credential-email">
                      {demo.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-lg)' }}>
            By signing in, you agree to our <Link to="/terms" style={{ color: 'var(--navy-600)', fontWeight: 600 }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--navy-600)', fontWeight: 600 }}>Privacy Policy</Link>
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

      {/* State Deactivated Modal */}
      <Modal
        isOpen={deactivatedModal.isOpen}
        onClose={handleCloseDeactivatedModal}
        title="State Government Deactivated"
        maxWidth="520px"
        showCloseButton={false}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCloseDeactivatedModal}
              style={{ minWidth: '200px', fontWeight: 600, padding: '10px 20px' }}
            >
              Go Back to Landing Page
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
            }}
          >
            <svg
              style={{ width: '24px', height: '24px', flexShrink: 0 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Your State Has Been Deactivated
              </div>
              <div style={{ fontSize: '0.825rem', color: '#b91c1c', marginTop: '2px' }}>
                Portal workspaces and public services are temporarily suspended.
              </div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.925rem', lineHeight: 1.6, color: 'var(--slate-700)' }}>
            The <strong>Government of {deactivatedModal.stateName}</strong> has been deactivated by the Central Government Administration.
          </p>

          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--slate-600)' }}>
            All administrative portal dashboards, officer review queues, grievance processing, and citizen service workflows for this state are currently disabled until the state instance is reactivated.
          </p>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: '6px',
              border: '1px solid var(--slate-200)',
              fontSize: '0.825rem',
              color: 'var(--slate-600)',
            }}
          >
            Please go back to the landing page or contact the Central Administration helpdesk for assistance.
          </div>
        </div>
      </Modal>

      {/* Toast container placeholder (for teammates who implement toast) */}
      <div id="toast-container"></div>
    </div>
  );
}
