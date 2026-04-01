// ═══════════════════════════════════════════
// auth.js — Authentication & session management
// ═══════════════════════════════════════════

import { getUsers, setUsers, getSession, setSession, clearSession, getAuditLogs, setAuditLogs, getApplications, getGrievances, getCurrentRole, getCurrentUserName, getCurrentUserId, getNotifications } from './state.js';
import { showToast, generateId, initEventDelegation, togglePassword, checkStrength, checkUsername, formatAadhaar, nextOtp, setupGlobalClickHandlers, closeAllModals, openModal, closeModal } from './utils.js';
import { getRoleDashboardPath, getLoginRedirectMap, getRoleConfig } from './role-manager.js';
import { initPage } from './navigation.js';
import { renderNotifPanel } from './notifications.js';

/**
 * Attempt login with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} selectedRole - Role selected on login form
 * @returns {object} { success, message, user }
 */
export function login(email, password, selectedRole) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return { success: false, message: 'Invalid credentials. Please check your email and password.' };
  }

  // Map selectedRole from form to stored role
  const roleMap = {
    'citizen': 'citizen',
    'officer': 'officer',
    'supervisor': 'supervisor',
    'grievance': 'grievance',
    'super_user': 'super_user',
    'admin': 'super_user',
    'super_admin': 'super_admin',
  };

  const mappedRole = roleMap[selectedRole] || selectedRole;

  // Check if user role matches selected role (admin can also be super_admin)
  if (user.role !== mappedRole && !(mappedRole === 'super_user' && user.role === 'super_admin')) {
    return { success: false, message: `This account is not registered as ${selectedRole}. Please select the correct role.` };
  }

  // Create session
  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === 'super_admin' ? 'super_user' : user.role,
    actualRole: user.role,
    phone: user.phone,
    loginTime: new Date().toISOString(),
  };

  setSession(session);

  // Log audit
  addAuditLog('User Login', user.email, user.role, `${user.name} logged in as ${user.role}.`);

  return { success: true, message: 'Login successful.', user: session };
}

/**
 * Register a new citizen user
 * @param {object} userData
 * @returns {object} { success, message, user }
 */
export function register(userData) {
  const users = getUsers();

  // Check if email already exists
  if (userData.email && users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser = {
    id: generateId('USR'),
    email: userData.email || `${userData.username}@DigiConnect.com`,
    password: userData.password,
    role: 'citizen',
    name: `${userData.firstName} ${userData.lastName}`,
    phone: userData.phone || '',
    aadhaar: userData.aadhaar || '',
    dob: userData.dob || '',
    gender: userData.gender || '',
    state: userData.state || '',
    district: userData.district || '',
    pincode: userData.pincode || '',
    address: userData.address || '',
    username: userData.username || '',
    securityQuestion: userData.securityQuestion || '',
    securityAnswer: userData.securityAnswer || '',
    registeredDate: new Date().toISOString(),
  };

  users.push(newUser);
  setUsers(users);

  // Auto-login after registration
  const session = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: 'citizen',
    actualRole: 'citizen',
    phone: newUser.phone,
    loginTime: new Date().toISOString(),
  };
  setSession(session);

  addAuditLog('User Registered', newUser.email, 'citizen', `New citizen registered: ${newUser.name}.`);

  return { success: true, message: 'Registration successful!', user: session };
}

/**
 * Logout the current user
 */
export function logout() {
  const session = getSession();
  if (session) {
    addAuditLog('User Logout', session.email, session.role, `${session.name} logged out.`);
  }
  clearSession();
}

/**
 * Change password for current user
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {object} { success, message }
 */
export function changePassword(currentPassword, newPassword) {
  const session = getSession();
  if (!session) return { success: false, message: 'Not logged in.' };

  const users = getUsers();
  const userIdx = users.findIndex(u => u.id === session.id);
  if (userIdx === -1) return { success: false, message: 'User not found.' };

  if (users[userIdx].password !== currentPassword) {
    return { success: false, message: 'Current password is incorrect.' };
  }

  if (newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters.' };
  }

  users[userIdx].password = newPassword;
  setUsers(users);

  addAuditLog('Password Changed', session.email, session.role, `${session.name} changed password.`);

  return { success: true, message: 'Password updated successfully!' };
}

/**
 * Check if current page requires authentication and redirect if needed
 * @param {string} requiredRole - Role required for this page (optional)
 */
export function requireAuth(requiredRole) {
  const session = getSession();
  if (!session) {
    window.location.href = getBasePath() + 'login.html';
    return false;
  }
  if (requiredRole && session.role !== requiredRole && session.actualRole !== 'super_admin') {
    window.location.href = getBasePath() + 'login.html';
    return false;
  }
  return true;
}

/**
 * Redirect logged-in user to their dashboard
 */
export function redirectToDashboard() {
  const session = getSession();
  if (session) {
    window.location.href = getRoleDashboardPath(session.role);
  }
}

/**
 * Get base path relative to current page depth
 * @returns {string}
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/Super User/') || path.includes('/Super%20User/') || path.includes('/citizen/') || path.includes('/officer/') ||
      path.includes('/supervisor/') || path.includes('/grievance/')) {
    return '../';
  }
  return '';
}

/**
 * Add an audit log entry
 */
function addAuditLog(action, actor, role, details) {
  const logs = getAuditLogs();
  logs.unshift({
    id: generateId('LOG'),
    action,
    actor,
    role,
    date: new Date().toISOString(),
    details,
  });
  // Keep only last 100 logs
  if (logs.length > 100) logs.length = 100;
  setAuditLogs(logs);
}

// ══════════════════════════════════════════
// Page Controllers
// ══════════════════════════════════════════

/**
 * Initialize the login page
 */
export function initLoginPage() {
  // If already logged in, redirect
  const session = getSession();
  if (session) {
    redirectToDashboard();
    return;
  }

  let selectedRole = 'citizen';

  // Role selector
  document.querySelectorAll('.role-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) { radio.checked = true; selectedRole = radio.value; }
      const labels = { citizen: 'Phone / Aadhaar / Username', officer: 'Employee ID / Username', supervisor: 'Employee ID / Username', grievance: 'Officer ID / Username', super_user: 'Super User Username', admin: 'Super User Username' };
      const labelEl = document.getElementById('loginIdLabel');
      if (labelEl) labelEl.textContent = labels[selectedRole] || 'Username';
    });
  });

  // Toggle password
  const pwToggle = document.querySelector('.input-right-btn');
  if (pwToggle) pwToggle.addEventListener('click', () => togglePassword('password', pwToggle));

  // Form submit
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const emailInput = document.getElementById('loginId').value.trim();
      const passwordInput = document.getElementById('password').value;
      const btn = document.getElementById('loginBtn');
      const spinner = document.getElementById('loginSpinner');
      const btnText = document.getElementById('loginBtnText');
      const errBox = document.getElementById('loginError');
      const errMsg = document.getElementById('loginErrorMsg');

      if (errBox) errBox.style.display = 'none';
      btn.disabled = true;
      if (spinner) spinner.style.display = 'flex';
      if (btnText) btnText.textContent = 'Signing in...';

      setTimeout(() => {
        const result = login(emailInput, passwordInput, selectedRole);
        if (result.success) {
          const redirectMap = getLoginRedirectMap();
          const dest = redirectMap[result.user.role] || 'citizen/citizen-dashboard.html';
          window.location.href = dest;
        } else {
          if (errBox) { errBox.style.display = 'flex'; }
          if (errMsg) errMsg.textContent = result.message;
          btn.disabled = false;
          if (spinner) spinner.style.display = 'none';
          if (btnText) btnText.textContent = 'Sign In';
        }
      }, 800);
    });
  }
}

/**
 * Initialize the register page
 */
export function initRegisterPage() {
  // If already logged in, redirect
  const session = getSession();
  if (session) { redirectToDashboard(); return; }

  let currentStep = 1;

  function goStep(n) {
    // Global generic validation before advancing
    if (n > currentStep && window.validateForm) {
      if (!window.validateForm('#step' + currentStep)) return;
    }
    // Existing manual validation logic below acts as a fallback or specific check
    if (n === 2 && currentStep === 1) {
      const fname = document.getElementById('firstName')?.value?.trim();
      const lname = document.getElementById('lastName')?.value?.trim();
      const aadh = document.getElementById('aadhaar')?.value?.trim();
      const dob = document.getElementById('dob')?.value;
      const gender = document.getElementById('gender')?.value;
      if (!fname) { showToast('First name is required.', 'warning'); document.getElementById('firstName').focus(); return; }
      if (!lname) { showToast('Last name is required.', 'warning'); document.getElementById('lastName').focus(); return; }
      if (!aadh || aadh.replace(/\s/g, '').length < 12) { showToast('Enter a valid 12-digit Aadhaar number.', 'warning'); document.getElementById('aadhaar').focus(); return; }
      if (!dob) { showToast('Date of birth is required.', 'warning'); document.getElementById('dob').focus(); return; }
      const birthYear = new Date(dob).getFullYear();
      if (birthYear >= 2015) {
        showToast('Registration is only open to individuals born in 2014 or earlier.', 'warning');
        document.getElementById('dob').focus();
        return;
      }
      if (!gender) { showToast('Please select your gender.', 'warning'); document.getElementById('gender').focus(); return; }
    }
    if (n === 3 && currentStep === 2) {
      const phone = document.getElementById('phone')?.value?.trim();
      const state = document.getElementById('state')?.value;
      const district = document.getElementById('district')?.value?.trim();
      const pin = document.getElementById('pincode')?.value?.trim();
      const addr = document.getElementById('address')?.value?.trim();
      if (!phone || phone.replace(/\D/g, '').length < 10) { showToast('Enter a valid 10-digit mobile number.', 'warning'); document.getElementById('phone').focus(); return; }
      if (!state) { showToast('Please select your state.', 'warning'); document.getElementById('state').focus(); return; }
      if (!district) { showToast('District is required.', 'warning'); document.getElementById('district').focus(); return; }
      if (!pin || pin.length < 6) { showToast('Enter a valid 6-digit PIN code.', 'warning'); document.getElementById('pincode').focus(); return; }
      if (!addr) { showToast('Full address is required.', 'warning'); document.getElementById('address').focus(); return; }
    }
    const prev = document.getElementById('step' + currentStep);
    const next = document.getElementById('step' + n);
    if (prev) prev.style.display = 'none';
    if (next) next.style.display = 'block';
    for (let i = 1; i <= 3; i++) {
      const pill = document.getElementById('pill-' + i);
      if (pill) pill.style.background = i <= n ? 'var(--navy-500)' : 'var(--slate-200)';
    }
    currentStep = n;
    // Scroll to top of form
    document.querySelector('.auth-form-container')?.scrollTo(0, 0);
  }

  // Wire up step navigation buttons via data-go-step
  document.querySelectorAll('[data-go-step]').forEach(btn => {
    btn.addEventListener('click', () => goStep(parseInt(btn.dataset.goStep)));
  });

  // Aadhaar formatting
  const aadhaarInput = document.getElementById('aadhaar');
  if (aadhaarInput) aadhaarInput.addEventListener('input', () => formatAadhaar(aadhaarInput));

  // Username check
  const usernameInput = document.getElementById('username');
  if (usernameInput) usernameInput.addEventListener('input', () => checkUsername(usernameInput));

  // Password strength
  const pwInput = document.getElementById('newPassword');
  if (pwInput) pwInput.addEventListener('input', () => checkStrength(pwInput.value));

  // Password toggle
  const pwToggle = document.querySelector('.input-right-btn');
  if (pwToggle) pwToggle.addEventListener('click', () => togglePassword('newPassword', pwToggle));

  // OTP inputs
  document.querySelectorAll('.otp-input').forEach(input => {
    input.addEventListener('input', () => nextOtp(input));
  });

  const regBtn = document.getElementById('registerBtn');
  if (regBtn) {
    regBtn.addEventListener('click', () => {
      if (window.validateForm && !window.validateForm('#step3')) return;
      
      const uname = document.getElementById('username')?.value?.trim();
      const pw = document.getElementById('newPassword')?.value;
      const cpw = document.getElementById('confirmPassword')?.value;
      const secQ = document.getElementById('securityQuestion')?.value;
      const secA = document.getElementById('securityAnswer')?.value?.trim();
      const terms = document.getElementById('agreeTerms')?.checked;
      const dataConsent = document.getElementById('agreeData')?.checked;

      if (!uname || uname.length < 3) { showToast('Username must be at least 3 characters.', 'warning'); return; }
      if (!pw || pw.length < 8) { showToast('Password must be at least 8 characters.', 'warning'); return; }
      if (pw !== cpw) { showToast('Passwords do not match.', 'danger'); return; }
      if (!secQ) { showToast('Please select a security question.', 'warning'); return; }
      if (!secA) { showToast('Please answer the security question.', 'warning'); return; }
      if (!terms || !dataConsent) { showToast('Please accept the required agreements.', 'warning'); return; }

      const sp = document.getElementById('regSpinner');
      const bt = document.getElementById('registerBtnText');
      regBtn.disabled = true;
      if (sp) sp.style.display = 'flex';
      if (bt) bt.textContent = 'Creating...';

      setTimeout(() => {
        const result = register({
          firstName: document.getElementById('firstName')?.value?.trim(),
          lastName: document.getElementById('lastName')?.value?.trim(),
          email: document.getElementById('email')?.value?.trim() || '',
          phone: document.getElementById('phone')?.value?.trim() || '',
          password: pw,
          aadhaar: document.getElementById('aadhaar')?.value?.trim(),
          dob: document.getElementById('dob')?.value,
          gender: document.getElementById('gender')?.value,
          state: document.getElementById('state')?.value,
          district: document.getElementById('district')?.value?.trim(),
          pincode: document.getElementById('pincode')?.value?.trim(),
          address: document.getElementById('address')?.value?.trim(),
          username: uname,
          securityQuestion: secQ,
          securityAnswer: secA,
        });

        if (result.success) {
          document.getElementById('step3').style.display = 'none';
          document.getElementById('successScreen').style.display = 'block';
          for (let i = 1; i <= 3; i++) {
            const pill = document.getElementById('pill-' + i);
            if (pill) pill.style.background = 'var(--green-500)';
          }
          showToast('Account created successfully!', 'success');
        } else {
          showToast(result.message, 'error');
          regBtn.disabled = false;
          if (sp) sp.style.display = 'none';
          if (bt) bt.textContent = 'Create Account';
        }
      }, 1500);
    });
  }

  // OTP verify button (go to dashboard)
  const verifyBtn = document.getElementById('verifyOtpBtn');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', e => {
      e.preventDefault();
      showToast('Mobile number verified!', 'success');
      setTimeout(() => { window.location.href = 'citizen/citizen-dashboard.html'; }, 600);
    });
  }
}

/**
 * Initialize the profile page
 */
export function initProfilePage() {
  const session = initPage({ title: 'My Profile', breadcrumbs: [{ label: 'Dashboard' }, { label: 'Profile' }] });
  if (!session) return;
  renderNotifPanel();

  const config = getRoleConfig(session.role);

  // ── Load full user data from localStorage ──
  const users = getUsers();
  const userData = users.find(u => u.id === session.id) || {};

  // Profile header
  const initials = session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarBig = document.getElementById('profileAvatarBig');
  if (avatarBig) avatarBig.textContent = initials;
  const fullName = document.getElementById('profileFullName');
  if (fullName) fullName.textContent = session.name;
  const roleBadge = document.getElementById('profileRoleBadge');
  if (roleBadge) { roleBadge.textContent = config.roleLabel; roleBadge.className = `badge ${config.badge}`; }

  // Stats from localStorage
  const apps = getApplications();
  const grievances = getGrievances();
  const myApps = apps.filter(a => a.citizenId === session.id || a.officerId === session.id);
  const myGrievances = grievances.filter(g => g.citizenId === session.id || g.officerId === session.id);

  setText('statApps', myApps.length);
  setText('statApproved', myApps.filter(a => a.status === 'approved').length);
  setText('statPending', myApps.filter(a => a.status !== 'approved' && a.status !== 'rejected').length);
  setText('statGriev', myGrievances.length);

  // ── Populate Personal Details tab ──
  const nameParts = session.name.split(' ');
  setText('pfFirstName', nameParts[0] || '', true);
  setText('pfLastName', nameParts.slice(1).join(' ') || '', true);
  setText('pfDob', userData.dob || '', true);

  // Gender select
  const genderSel = document.getElementById('pfGender');
  if (genderSel && userData.gender) {
    for (const opt of genderSel.options) {
      if (opt.textContent === userData.gender || opt.value === userData.gender) { opt.selected = true; break; }
    }
  }

  // Aadhaar (masked display — show only last 4 digits for all roles)
  const aadhaarField = document.getElementById('pfAadhaar');
  if (aadhaarField) {
    const raw = (userData.aadhaar || '').replace(/\s/g, '');
    if (raw.length >= 4) {
      // Format: XXXX XXXX followed by last 4 digits (e.g. XXXX XXXX 4301)
      aadhaarField.value = 'XXXX XXXX ' + raw.slice(-4);
    } else if (raw.length > 0) {
      aadhaarField.value = 'XXXX XXXX ' + raw;
    } else {
      aadhaarField.value = '— Not on record —';
    }
  }

  // ── Populate Contact & Address tab ──
  setText('pfPhone', userData.phone || session.phone || '', true);
  setText('pfEmail', userData.email || session.email || '', true);
  setText('pfAddress', userData.address || '', true);
  setText('pfDistrict', userData.district || '', true);
  setText('pfPincode', userData.pincode || '', true);

  // State select
  const stateSel = document.getElementById('pfState');
  if (stateSel && userData.state) {
    for (const opt of stateSel.options) {
      if (opt.textContent === userData.state || opt.value === userData.state) { opt.selected = true; break; }
    }
  }

  // ── Tab switching ──
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (!tabId) return;
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const tab = document.getElementById('tab-' + tabId);
      if (tab) tab.classList.add('active');
      btn.classList.add('active');
    });
  });

  // ── Save profile ──
  const saveBtn = document.querySelector('[data-action="save-profile"]');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (window.validateForm && !window.validateForm('.tab-content.active')) return;

      const firstName = document.getElementById('pfFirstName')?.value?.trim();
      const lastName = document.getElementById('pfLastName')?.value?.trim();
      if (!firstName || !lastName) { showToast('First and last name are required.', 'warning'); return; }

      const updatedName = `${firstName} ${lastName}`;
      const userIdx = users.findIndex(u => u.id === session.id);
      if (userIdx !== -1) {
        users[userIdx].name = updatedName;
        users[userIdx].dob = document.getElementById('pfDob')?.value || users[userIdx].dob;
        users[userIdx].gender = document.getElementById('pfGender')?.value || users[userIdx].gender;
        users[userIdx].phone = document.getElementById('pfPhone')?.value?.trim() || users[userIdx].phone;
        users[userIdx].email = document.getElementById('pfEmail')?.value?.trim() || users[userIdx].email;
        users[userIdx].address = document.getElementById('pfAddress')?.value?.trim() || users[userIdx].address;
        users[userIdx].state = document.getElementById('pfState')?.value || users[userIdx].state;
        users[userIdx].district = document.getElementById('pfDistrict')?.value?.trim() || users[userIdx].district;
        users[userIdx].pincode = document.getElementById('pfPincode')?.value?.trim() || users[userIdx].pincode;
        setUsers(users);

        // Update session name if changed
        if (session.name !== updatedName) {
          session.name = updatedName;
          session.email = users[userIdx].email;
          session.phone = users[userIdx].phone;
          setSession(session);
          if (fullName) fullName.textContent = updatedName;
          const newInitials = updatedName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          if (avatarBig) avatarBig.textContent = newInitials;
        }
      }
      showToast('Profile updated successfully!', 'success');
    });
  }

  // ── Change password modal open ──
  const changePwBtn = document.querySelector('[data-action="change-password"]');
  if (changePwBtn) changePwBtn.addEventListener('click', () => openModal('changePasswordModal'));

  // ── Password update (security tab) ──
  const updatePwBtn = document.getElementById('updatePasswordBtn');
  if (updatePwBtn) {
    updatePwBtn.addEventListener('click', () => {
      const curr = document.getElementById('secCurrPw')?.value?.trim();
      const newPw = document.getElementById('secNewPw')?.value?.trim();
      const confirm = document.getElementById('secConfirmPw')?.value?.trim();
      if (!curr) { showToast('Enter your current password.', 'error'); return; }
      if (!newPw || newPw.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return; }
      if (newPw !== confirm) { showToast('Passwords do not match.', 'error'); return; }
      const result = changePassword(curr, newPw);
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) { document.getElementById('secCurrPw').value = ''; document.getElementById('secNewPw').value = ''; document.getElementById('secConfirmPw').value = ''; }
    });
  }

  // ── Password update (modal) ──
  const modalPwBtn = document.getElementById('updatePasswordModalBtn');
  if (modalPwBtn) {
    modalPwBtn.addEventListener('click', () => {
      const curr = document.getElementById('modalCurrPw')?.value?.trim();
      const newPw = document.getElementById('modalNewPw')?.value?.trim();
      const confirm = document.getElementById('modalConfirmPw')?.value?.trim();
      if (!curr) { showToast('Enter your current password.', 'error'); return; }
      if (!newPw || newPw.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return; }
      if (newPw !== confirm) { showToast('Passwords do not match.', 'error'); return; }
      const result = changePassword(curr, newPw);
      if (result.success) { closeModal('changePasswordModal'); document.getElementById('modalCurrPw').value = ''; document.getElementById('modalNewPw').value = ''; document.getElementById('modalConfirmPw').value = ''; }
      showToast(result.message, result.success ? 'success' : 'error');
    });
  }

  // ── Notification preferences grid ──
  buildNotifGrid(session.role);

  // Setup global click handlers
  setupGlobalClickHandlers();
}

function buildNotifGrid(role) {
  const commonItems = ['Application submitted', 'Application status update', 'Application approved', 'Application rejected', 'Query raised on application', 'Grievance update', 'Grievance resolved', 'Payment confirmation'];
  const roleExtra = {
    citizen: ['New scheme available', 'SLA deadline reminder'],
    officer: ['New application assigned', 'SLA breach warning'],
    supervisor: ['Officer SLA breach', 'Escalation received', 'Override required'],
    super_user: ['Officer onboarding request', 'SLA breach detected', 'System security alert', 'Config change log'],
    grievance: ['New grievance assigned', 'Escalation to supervisor'],
  };
  const items = [...commonItems, ...(roleExtra[role] || [])];
  const container = document.getElementById('notifGrid');
  if (!container) return;
  container.innerHTML = items.map(item => `
    <div style="padding:12px 0;border-bottom:1px solid var(--slate-100);display:grid;grid-template-columns:1fr auto auto;gap:var(--space-md) var(--space-xl);align-items:center;">
      <span style="font-size:0.875rem;color:var(--slate-700);">${item}</span>
      <input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--navy-600);cursor:pointer;"/>
      <input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--navy-600);cursor:pointer;"/>
    </div>`).join('');
}

function setText(id, value, isInput) {
  const el = document.getElementById(id);
  if (!el) return;
  if (isInput) el.value = value;
  else el.textContent = value;
}

/**
 * Initialize the landing page (index.html)
 */
export function initLandingPage() {
  // Navbar scroll effect
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
  }
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

// ══════════════════════════════════════════
// Auto-init based on data-page attribute
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  initEventDelegation();
  switch (page) {
    case 'login': initLoginPage(); break;
    case 'register': initRegisterPage(); break;
    case 'profile': initProfilePage(); break;
    case 'landing': initLandingPage(); break;
  }
});

