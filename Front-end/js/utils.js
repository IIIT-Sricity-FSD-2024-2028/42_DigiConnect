// ═══════════════════════════════════════════
// utils.js — Shared utility functions
// ═══════════════════════════════════════════

/**
 * Show a toast notification
 * @param {string} msg - Message to display
 * @param {string} type - Toast type: success, error, warning, info, danger
 */
export function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Validate form fields within a designated container.
 * Enforces requirement (marked by *), email format, mobile format (10 digits), and Aadhaar format (12 digits).
 * @param {string|HTMLElement} container - Selector or Element
 * @returns {boolean}
 */
export function validateForm(container) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return true; // nothing to validate

  let isValid = true;
  let firstErrorField = null;

  // Clear previous errors (inputs usually use var(--color-border))
  root.querySelectorAll('.form-input, .form-select').forEach(input => {
    input.style.borderColor = ''; 
  });

  const inputs = root.querySelectorAll('.form-input, .form-select');
  
  for (const input of inputs) {
    // Find associated label
    let labelText = '';
    const id = input.id;
    if (id) {
       const lbl = root.querySelector(`label[for="${id}"]`);
       if (lbl) labelText = lbl.textContent.toLowerCase();
    }
    if (!labelText && input.previousElementSibling && input.previousElementSibling.tagName === 'LABEL') {
      labelText = input.previousElementSibling.textContent.toLowerCase();
    }
    if (!labelText && input.closest('.form-group')) {
      const lbl = input.closest('.form-group').querySelector('label');
      if (lbl) labelText = lbl.textContent.toLowerCase();
    }
    
    // Determine if field is required (has asterisk, required attr, or * in placeholder)
    const isRequired = labelText.includes('*') || input.hasAttribute('required') || (input.placeholder && input.placeholder.includes('*'));
    const val = input.value.trim();

    if (isRequired && !val) {
      setError(input, 'Please fill out all required fields marked with *');
      continue;
    }

    if (val) {
      // Email validation
      if (labelText.includes('email') || input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val)) {
          setError(input, 'Please enter a valid email address (e.g., name@domain.com).');
          continue;
        }
      }

      // Mobile/Phone validation (exactly 10 digits, not all zeros)
      if (labelText.includes('mobile') || labelText.includes('phone') || input.id.toLowerCase().includes('phone')) {
        const cleanPhone = val.replace(/\s|\+|-/g, ''); // ignore spaces/dashes if any
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(cleanPhone) || /^0{10}$/.test(cleanPhone)) {
          setError(input, 'Please enter a valid 10-digit mobile number.');
          continue;
        }
      }

      // Aadhaar validation (exactly 12 digits, ignoring spaces, not all zeros)
      if (labelText.includes('aadhaar')) {
        const cleanAadhaar = val.replace(/\s/g, '');
        const aadhaarRegex = /^\d{12}$/;
        if (!aadhaarRegex.test(cleanAadhaar) || /^0{12}$/.test(cleanAadhaar)) {
          setError(input, 'Please enter a valid 12-digit Aadhaar number.');
          continue;
        }
      }

      // Date of Birth validation (must be 18+)
      if (labelText.includes('date of birth') || input.id.toLowerCase().includes('dob')) {
        const birthDate = new Date(val);
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        
        if (birthDate > eighteenYearsAgo) {
          setError(input, 'You must be at least 18 years old to register.');
          continue;
        }
      }
    }
  }

  function setError(el, msg) {
    el.style.borderColor = 'var(--red-500)';
    if (isValid) {
      // Only show toast and scroll to the FIRST error found
      showToast(msg, 'error');
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      } catch (e) {}
      firstErrorField = el;
      isValid = false;
    }
  }

  return isValid;
}
window.validateForm = validateForm;


/**
 * Generate a unique ID with prefix
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(prefix = 'ID') {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

/**
 * Format a date string to readable format
 * @param {string} dateStr - ISO date string or date-like string
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr || dateStr === '—') return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format date with time
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hr = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const h = hr % 12 || 12;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${min} ${ampm}`;
}

/**
 * Toggle password visibility
 * @param {string} inputId
 * @param {HTMLElement} btn
 */
export function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  if (btn) {
    btn.innerHTML = isText
      ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`
      : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`;
  }
}

/**
 * Format Aadhaar number with spaces
 * @param {HTMLInputElement} input
 */
export function formatAadhaar(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 12);
  let formatted = '';
  for (let i = 0; i < v.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += v[i];
  }
  input.value = formatted;
}

/**
 * Format card number with spaces
 * @param {HTMLInputElement} input
 */
export function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  let formatted = '';
  for (let i = 0; i < v.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += v[i];
  }
  input.value = formatted;
}

/**
 * Check username validity
 * @param {HTMLInputElement} input
 */
export function checkUsername(input) {
  const valid = /^[a-zA-Z0-9_]{3,20}$/.test(input.value);
  input.style.borderColor = input.value ? (valid ? 'var(--green-500)' : 'var(--red-500)') : '';
}

/**
 * Check password strength and update UI
 * @param {string} pw
 */
export function checkStrength(pw) {
  const wrap = document.getElementById('strengthWrap');
  const label = document.getElementById('strengthLabel');
  if (!wrap || !label) return;
  if (!pw) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const colors = ['var(--red-500)', 'var(--red-500)', 'var(--amber-400)', 'var(--green-500)', 'var(--green-500)'];
  const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const cls = score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong';

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById('sb' + i);
    if (bar) {
      bar.className = 'strength-bar';
      if (i <= score) bar.classList.add(cls);
    }
  }
  label.textContent = labels[score];
  label.style.color = colors[score];
}

/**
 * Move focus to next OTP input
 * @param {HTMLInputElement} input
 */
export function nextOtp(input) {
  if (input.value.length === 1) {
    const next = input.nextElementSibling;
    if (next && next.tagName === 'INPUT') next.focus();
  }
}

/**
 * Get greeting based on time of day
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get user initials from name
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Close all open dropdown menus
 */
export function closeDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
}

/**
 * Close all modals
 */
export function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
}

/**
 * Setup global click handlers for dropdowns and modals
 */
export function setupGlobalClickHandlers() {
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) closeDropdowns();
    if (e.target.classList.contains('modal-overlay')) closeAllModals();
    const notifPanel = document.getElementById('notifPanel');
    if (notifPanel && !e.target.closest('#notifPanel') && !e.target.closest('.notif-btn')) {
      notifPanel.classList.remove('open');
    }
  });
}

/**
 * Toggle sidebar open/close
 */
export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

/**
 * Open a modal by ID
 * @param {string} id
 */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}
window.openModal = function(id) { openModal(id); };

/**
 * Close a modal by ID
 * @param {string} id
 */
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}
window.closeModal = function(id) { closeModal(id); };
window.showToast = showToast;

/**
 * Get URL query parameter
 * @param {string} key
 * @returns {string|null}
 */
export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ══════════════════════════════════════════
// Global Event Delegation System
// Handles data-* attributes so HTML files need NO inline JS
// ══════════════════════════════════════════

/**
 * Initialize event delegation for common UI patterns.
 * Called once on DOMContentLoaded from every page module.
 */
export function initEventDelegation() {
  // Keep inline handlers intact to support window-attached functions
  // document.querySelectorAll('[onclick]').forEach(el => el.removeAttribute('onclick'));
  // document.querySelectorAll('[oninput]').forEach(el => el.removeAttribute('oninput'));
  // document.querySelectorAll('[onsubmit]').forEach(el => el.removeAttribute('onsubmit'));

  // ── Toast buttons ──
  document.querySelectorAll('[data-toast-msg]').forEach(el => {
    el.addEventListener('click', () => {
      showToast(el.dataset.toastMsg, el.dataset.toastType || 'info');
    });
  });

  // ── Modal open/close ──
  document.querySelectorAll('[data-open-modal]').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.openModal));
  });
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      closeModal(el.dataset.closeModal);
      // Also show toast if present
      if (el.dataset.toastMsg) showToast(el.dataset.toastMsg, el.dataset.toastType || 'info');
    });
  });

  // ── Navigation ──
  document.querySelectorAll('[data-href]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.clearSession === 'true') sessionStorage.clear();
      window.location.href = el.dataset.href;
    });
  });

  // ── Sidebar toggle ──
  document.querySelectorAll('[data-toggle-sidebar]').forEach(el => {
    el.addEventListener('click', () => toggleSidebar());
  });

  // ── Notification panel toggle ──
  document.querySelectorAll('[data-toggle-notif]').forEach(el => {
    el.addEventListener('click', () => {
      const panel = document.getElementById('notifPanel');
      if (panel) panel.classList.toggle('open');
    });
  });

  // ── Dropdown toggle ──
  document.querySelectorAll('[data-toggle-dropdown]').forEach(el => {
    el.addEventListener('click', () => {
      const menu = el.closest('.dropdown')?.querySelector('.dropdown-menu');
      if (menu) menu.classList.toggle('open');
    });
  });

  // ── Password toggle ──
  document.querySelectorAll('[data-toggle-pw]').forEach(el => {
    el.addEventListener('click', () => togglePassword(el.dataset.togglePw, el));
  });

  // ── Upload triggers ──
  document.querySelectorAll('[data-trigger-upload]').forEach(el => {
    el.addEventListener('click', () => {
      const target = document.getElementById(el.dataset.triggerUpload);
      if (target) target.click();
    });
  });

  // Fix DOB minimum and dynamic 18+ maximum globally
  document.querySelectorAll('input[type="date"]').forEach(el => {
    if (!el.min) el.min = '1900-01-01';
    
    const idStr = (el.id || '').toLowerCase();
    const isDob = idStr.includes('dob') || (el.previousElementSibling && el.previousElementSibling.textContent.toLowerCase().includes('birth'));
    if (isDob) {
       const today = new Date();
       const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
       el.max = maxDate.toISOString().split('T')[0];
    }
  });

  // ── Edge Cases: Maintenance Time ──
  const maintStart = document.getElementById('maintStart');
  const maintEnd = document.getElementById('maintEnd');
  if (maintStart && maintEnd) {
    const enforceMaintTime = () => {
      if (maintStart.value && maintEnd.value && new Date(maintEnd.value) < new Date(maintStart.value)) {
        if(window.showToast) window.showToast("Maintenance end time cannot be before start time.", "error");
        maintEnd.value = maintStart.value;
      }
    };
    maintStart.addEventListener('change', enforceMaintTime);
    maintEnd.addEventListener('change', enforceMaintTime);
  }

  // ── Global Input Restrictors ──
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.tagName === 'INPUT') {
      const idStr = (el.id || '').toLowerCase();
      
      // Restrict Phone/Mobile: Only numbers allowed
      if (el.type === 'tel' || idStr.includes('phone') || idStr.includes('mobile')) {
        el.value = el.value.replace(/[^0-9]/g, '');
      }
      
      // Restrict Names (Including "Name on Card"): Only alphabets and spaces
      const isNameField = idStr.includes('firstname') || idStr.includes('lastname') || idStr === 'uname' || idStr.includes('fullname') || (el.placeholder && el.placeholder.includes('As printed'));
      if (isNameField && !idStr.includes('username')) {
        el.value = el.value.replace(/[^a-zA-Z\s]/g, '');
      }

      // Restrict OTP & CVV: Max limits and numbers only
      if (el.classList.contains('otp-input') || (el.placeholder && el.placeholder.includes('•••'))) {
        el.value = el.value.replace(/[^0-9]/g, '');
      }

      // Restrict Card Expiry (MM/YY): Only numbers and slashes allowed
      if (el.placeholder === 'MM/YY') {
        el.value = el.value.replace(/[^0-9/]/g, '');
      }

      // Restrict Pincode: Max 6 digits
      if (idStr.includes('pincode') || idStr === 'pin') {
        if (el.value.length > 6) el.value = el.value.slice(0, 6);
      }

      // Restrict Employee ID: Alphanumeric and hyphens only
      if (idStr.includes('empid') || idStr.includes('emp_id') || idStr === 'ofempid' || idStr === 'uempid') {
        el.value = el.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
      }
    }
  });

  // Block e, -, +, . on number inputs (since app uses strictly positive integers)
  document.addEventListener('keydown', e => {
    const el = e.target;
    if (el.tagName === 'INPUT' && el.type === 'number') {
      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
        e.preventDefault();
      }
    }
  });

  // ── Global click handlers ──
  setupGlobalClickHandlers();
}

