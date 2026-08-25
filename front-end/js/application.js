// ═══════════════════════════════════════════
// application.js — Application lifecycle management
// ═══════════════════════════════════════════

import { getSession } from './auth.js';
import { initPage } from './navigation.js';
import { showToast, generateId, formatDate, formatDateTime, openModal, closeModal, getQueryParam, formatCard, downloadFile } from './utils.js';
import { renderNotifPanel } from './notifications.js';
import { checkSLA } from './escalation.js';
import { apiGetServices, apiSubmitApplication, apiGetMyApplications, apiWithdrawApplication, apiGetApplicationById, apiRespondToQuery, apiGetAllApplications, apiUpdateApplicationStatus } from './api.js';

// ══════════════════════════════════════════
// Citizen: Apply for Service
// ══════════════════════════════════════════

export async function initApplyService() {
  const session = initPage({ title: 'Apply for Service', breadcrumbs: [{ label: 'Citizen Portal', href: 'citizen/citizen-dashboard.html' }, { label: 'Apply for Service' }], requiredRole: 'citizen' });
  if (!session) return;
  renderNotifPanel();
  
  let services = [];
  try {
      const res = await apiGetServices();
      services = (res.data || []).filter(s => s.status === 'Active');
  } catch(e) { console.error(e); }
  let selectedService = null;
  let currentStep = 1;

  // Populate service cards grid
  const serviceGrid = document.getElementById('serviceCardsGrid') || document.getElementById('serviceGrid');
  if (serviceGrid) {
    renderServiceCards(services);
  }

  // If user just submitted an application and page reloads via file watcher, persist the success screen
  const savedAppStr = sessionStorage.getItem('lastSubmittedApp');
  if (savedAppStr) {
    try {
      const savedApp = JSON.parse(savedAppStr);
      if (savedApp && savedApp.id) {
        const stepSelect = document.getElementById('stepServiceSelect');
        const appForm = document.getElementById('applicationForm');
        if (stepSelect) stepSelect.style.display = 'none';
        if (appForm) appForm.style.display = 'block';
        for (let i = 1; i <= 4; i++) {
          const el = document.getElementById('formStep' + i);
          if (el) el.style.display = 'none';
        }
        const stepper = document.getElementById('formStepper');
        if (stepper) stepper.style.display = 'none';
        const banner = document.getElementById('selectedServiceBanner');
        if (banner) banner.style.display = 'none';
        const success = document.getElementById('successScreen');
        if (success) {
          success.style.display = 'block';
          setTC('successAppId', savedApp.id);
          setTC('appRefId', savedApp.id);
          const trackBtn = success.querySelector('button.btn-primary');
          if (trackBtn) {
            trackBtn.removeAttribute('onclick');
            trackBtn.onclick = () => {
              sessionStorage.removeItem('lastSubmittedApp');
              window.location.href = `track-application.html?id=${savedApp.id}`;
            };
          }
        }
      }
    } catch(e) {}
  }

  // Pre-filter by URL ?type= param (from dashboard category shortcut buttons)
  const urlType = getQueryParam('type');
  if (urlType) {
    sessionStorage.removeItem('lastSubmittedApp');
    const catMap = {
      'certificate': 'Certificate',
      'welfare':     'Welfare',
      'permission':  'Permission',
      'correction':  'Correction'
    };
    const catName = catMap[urlType.toLowerCase()];
    if (catName) {
      // Activate the matching tab button
      document.querySelectorAll('.tabs .tab-btn').forEach(b => {
        const matches = b.textContent.trim().toLowerCase().startsWith(catName.toLowerCase());
        b.classList.toggle('active', matches);
      });
      renderServiceCards(services.filter(s => s.cat === catName));
    }
  }

  function renderServiceCards(list) {
    if (!serviceGrid) return;
    const iconMap = { Certificate: 'cert', Welfare: 'welfare', Permission: 'permission', Correction: 'correction' };
    serviceGrid.innerHTML = list.map(s => `
      <div class="service-card" data-testid="service-card-${s.id}" data-service-id="${s.id}" data-cat="${s.cat}" style="cursor:pointer;padding:var(--space-lg);border:2px solid var(--color-border);border-radius:var(--radius-lg);transition:all 0.2s;background:var(--color-surface);">
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-sm);">
          <div class="service-card-icon ${iconMap[s.cat] || 'cert'}"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:0.9375rem;color:var(--navy-900);">${s.name}</div>
            <div style="font-size:0.75rem;color:var(--color-text-muted);">${s.dept}</div>
          </div>
        </div>
        <div style="font-size:0.8rem;color:var(--slate-600);margin-bottom:var(--space-sm);line-height:1.5;">${s.desc}</div>
        <div style="display:flex;gap:var(--space-md);font-size:0.75rem;color:var(--color-text-muted);margin-bottom:var(--space-md);">
          <span>SLA: <strong>${s.sla} days</strong></span>
          <span>Fee: <strong>${s.feeLabel}</strong></span>
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%;" onclick="window.selectService('${s.id}')">Apply Now</button>
      </div>
    `).join('');

    serviceGrid.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--navy-400)'; card.style.boxShadow = 'var(--shadow-md)'; });
      card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--color-border)'; card.style.boxShadow = 'none'; });
    });
  }

  const specificFields = {
    'Income Certificate': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Annual Income (₹) <span class="required">*</span></label><input type="number" class="form-input" placeholder="e.g. 120000" min="0" /></div>
        <div class="form-group"><label class="form-label">Income Source <span class="required">*</span></label><select class="form-input"><option>Agriculture</option><option>Daily Wage</option><option>Salaried</option><option>Business</option><option>Pension</option></select></div>
        <div class="form-group"><label class="form-label">Occupation <span class="required">*</span></label><input type="text" class="form-input" placeholder="e.g. Farmer" oninput="this.value=this.value.replace(/[^A-Za-z\\s]/g,'')" /></div>
        <div class="form-group"><label class="form-label">Purpose of Certificate <span class="required">*</span></label><select class="form-input"><option>School / College Admission</option><option>Government Scheme</option><option>Bank Loan</option><option>Legal Purpose</option><option>Other</option></select></div>
      </div>`,
    'Caste Certificate': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Caste <span class="required">*</span></label><input type="text" class="form-input" placeholder="e.g. Yadav" oninput="this.value=this.value.replace(/[^A-Za-z\\s]/g,'')" /></div>
        <div class="form-group"><label class="form-label">Sub-caste</label><input type="text" class="form-input" placeholder="If applicable" oninput="this.value=this.value.replace(/[^A-Za-z\\s]/g,'')" /></div>
        <div class="form-group"><label class="form-label">Category <span class="required">*</span></label><select class="form-input"><option>SC</option><option>ST</option><option>OBC</option><option>EWS</option></select></div>
        <div class="form-group"><label class="form-label">Religion <span class="required">*</span></label><select class="form-input"><option>Hindu</option><option>Muslim</option><option>Christian</option><option>Sikh</option><option>Buddhist</option><option>Other</option></select></div>
        <div class="form-group col-span-full"><label class="form-label">Purpose <span class="required">*</span></label><select class="form-input"><option>Education Reservation</option><option>Govt. Job Reservation</option><option>Welfare Scheme</option><option>Other</option></select></div>
      </div>`,
    'Residence Certificate': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Duration of Stay (Years) <span class="required">*</span></label><input type="number" class="form-input" placeholder="e.g. 10" min="1" /></div>
        <div class="form-group"><label class="form-label">Type of Residence <span class="required">*</span></label><select class="form-input"><option>Own House</option><option>Rented</option><option>Government Quarters</option></select></div>
        <div class="form-group col-span-full"><label class="form-label">Purpose of Certificate <span class="required">*</span></label><select class="form-input"><option>Domicile Proof</option><option>School Admission</option><option>Legal Purpose</option><option>Other</option></select></div>
      </div>`,
    'Welfare / Subsidy Scheme': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Land Holding (Acres) <span class="required">*</span></label><input type="text" class="form-input" placeholder="e.g. 2.5" oninput="this.value=this.value.replace(/[^0-9.]/g, '').replace(/(\\..*?)\\..*/g, '$1')" /></div>
        <div class="form-group"><label class="form-label">Land Survey Number <span class="required">*</span></label><input type="text" class="form-input" placeholder="As per Patta" /></div>
        <div class="form-group"><label class="form-label">Bank Account Number <span class="required">*</span></label><input type="text" class="form-input" placeholder="For direct benefit transfer" oninput="this.value=this.value.replace(/[^0-9]/g, '')" /></div>
        <div class="form-group"><label class="form-label">IFSC Code <span class="required">*</span></label><input type="text" class="form-input" id="f_ifsc" placeholder="e.g. SBIN0001234" maxlength="11" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" /></div>
      </div>`,
    'Scholarship Application': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Course Name <span class="required">*</span></label><input type="text" class="form-input" placeholder="e.g. B.Tech Computer Science" /></div>
        <div class="form-group"><label class="form-label">Institution Name <span class="required">*</span></label><input type="text" class="form-input" placeholder="College / University name" /></div>
        <div class="form-group"><label class="form-label">Admission Year <span class="required">*</span></label><input type="number" class="form-input" placeholder="e.g. 2024" min="0" /></div>
        <div class="form-group"><label class="form-label">Annual Tuition Fee (₹) <span class="required">*</span></label><input type="number" class="form-input" placeholder="As per fee receipt" min="0" /></div>
      </div>`,
    'Event Permission': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Event Name <span class="required">*</span></label><input type="text" class="form-input" placeholder="e.g. Annual Cultural Fest" oninput="this.value=this.value.replace(/[^A-Za-z0-9\\s]/g,'')" /></div>
        <div class="form-group"><label class="form-label">Event Type <span class="required">*</span></label><select class="form-input"><option>Cultural</option><option>Religious</option><option>Political</option><option>Sports</option><option>Commercial</option></select></div>
        <div class="form-group"><label class="form-label">Event Date <span class="required">*</span></label><input type="date" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Duration (Hours) <span class="required">*</span></label><input type="number" class="form-input" placeholder="e.g. 8" min="0" /></div>
        <div class="form-group"><label class="form-label">Venue Address <span class="required">*</span></label><input type="text" class="form-input" placeholder="Full venue address" /></div>
        <div class="form-group"><label class="form-label">Expected Attendance <span class="required">*</span></label><input type="number" class="form-input" placeholder="e.g. 500" min="0" /></div>
      </div>`,
    'Vendor License': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Business / Trade Name <span class="required">*</span></label><input type="text" class="form-input" placeholder="e.g. Ravi General Store" oninput="this.value=this.value.replace(/[^A-Za-z0-9\\s]/g,'')" /></div>
        <div class="form-group"><label class="form-label">Type of Business <span class="required">*</span></label><select class="form-input"><option>Retail Shop</option><option>Food Vendor</option><option>Mobile Vendor</option><option>Kiosk</option><option>Service Business</option></select></div>
        <div class="form-group"><label class="form-label">Business Address <span class="required">*</span></label><input type="text" class="form-input" placeholder="Full address of business" /></div>
        <div class="form-group"><label class="form-label">Ownership Type</label><select class="form-input"><option>Own Property</option><option>Rented</option></select></div>
      </div>`,
    'Record Correction': `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Record Type <span class="required">*</span></label><select class="form-input"><option>Ration Card</option><option>Land Records</option><option>Birth Certificate</option><option>Death Certificate</option><option>Other Govt. Record</option></select></div>
        <div class="form-group"><label class="form-label">Record / Document Number <span class="required">*</span></label><input type="text" class="form-input" placeholder="e.g. Ration Card No." oninput="this.value=this.value.replace(/[^A-Za-z0-9\\s\\-]/g,'')" /></div>
        <div class="form-group"><label class="form-label">Current (Incorrect) Name <span class="required">*</span></label><input type="text" class="form-input" placeholder="As in the document" oninput="this.value=this.value.replace(/[^A-Za-z\\s]/g,'')" /></div>
        <div class="form-group"><label class="form-label">Correct Name <span class="required">*</span></label><input type="text" class="form-input" placeholder="As per Aadhaar / proof" oninput="this.value=this.value.replace(/[^A-Za-z\\s]/g,'')" /></div>
        <div class="form-group col-span-full"><label class="form-label">Reason for Correction <span class="required">*</span></label><textarea class="form-input" rows="3" placeholder="Briefly explain why the correction is needed…"></textarea></div>
      </div>`
  };

  function selectService(serviceId) {
    selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) return;
    // Update selected service banner
    setTC('selectedSvcName', selectedService.name);
    setTC('selectedSvcDept', selectedService.dept);
    setTC('selectedSvcSla', selectedService.sla + ' days');
    setTC('selectedSvcFee', selectedService.feeLabel);
    setTC('ps_fee', selectedService.feeLabel);
    setTC('rev_svc', selectedService.name);
    setTC('rev_fee', selectedService.feeLabel);
    // Application reference will be assigned by backend on submission
    setTC('appRefId', 'Pending...');
    setTC('successAppId', '...');

    // Dynamic payment summary
    const fee = selectedService.fee || 0;
    const processing = fee > 0 ? 5 : 0;
    const gst = fee > 0 ? Math.round((fee + processing) * 0.18) : 0;
    const total = fee + processing + gst;
    setTC('ps_fee', fee > 0 ? '\u20B9' + fee.toFixed(2) : 'Free');
    setTC('ps_processing', fee > 0 ? '\u20B9' + processing.toFixed(2) : '\u20B90.00');
    setTC('ps_gst', fee > 0 ? '\u20B9' + gst.toFixed(2) : '\u20B90.00');
    setTC('ps_total', fee > 0 ? '\u20B9' + total.toFixed(2) : 'Free');

    // Show/hide payment method options based on fee
    const freeCard = document.getElementById('pm_free');
    const upiCard  = document.getElementById('pm_upi');
    if (freeCard) freeCard.style.display = fee === 0 ? 'flex' : 'none';
    if (upiCard)  upiCard.style.display  = fee === 0 ? 'none' : 'flex';
    const pm_card      = document.getElementById('pm_card');
    const pm_netbanking= document.getElementById('pm_netbanking');
    if (pm_card)       pm_card.style.display       = fee === 0 ? 'none' : 'flex';
    if (pm_netbanking) pm_netbanking.style.display  = fee === 0 ? 'none' : 'flex';
    
    // Populate service specific fields
    const specificBody = document.getElementById('specificBody');
    if (specificBody) {
      specificBody.innerHTML = specificFields[selectedService.name] || '<p style="color:var(--color-text-muted);font-size:0.875rem;">No additional fields required.</p>';
    }

    // Docs upload slots
    const docUploadList = document.getElementById('docUploadList');
    if (docUploadList && selectedService.docs) {
      docUploadList.innerHTML = selectedService.docs.map((d, i) => `
      <div class="upload-slot" id="slot_${i}" onclick="triggerUpload(${i})">
        <div class="upload-slot-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.875rem;font-weight:600;color:var(--navy-900);">${d}</div>
          <div style="font-size:0.75rem;color:var(--color-text-muted);" id="slot_status_${i}">Click to upload · PDF, JPG, PNG (max 2MB)</div>
        </div>
        <div style="flex-shrink:0;">
          <span id="slot_badge_${i}" class="badge badge-neutral">Pending</span>
        </div>
        <input type="file" style="display:none;" id="fileInput_${i}" accept=".pdf,.jpg,.jpeg,.png" onchange="uploadFile(${i}, this)" />
      </div>
      `).join('');
    }

    // Show application form, hide service selection
    const stepSelect = document.getElementById('stepServiceSelect');
    const appForm = document.getElementById('applicationForm');
    if (stepSelect) stepSelect.style.display = 'none';
    if (appForm) appForm.style.display = 'block';

    const success = document.getElementById('successScreen');
    if (success) success.style.display = 'none';
    const stepper = document.getElementById('formStepper');
    if (stepper) stepper.style.display = 'flex';
    const banner = document.getElementById('selectedServiceBanner');
    if (banner) banner.style.display = 'flex';

    goToFormStep(1);
  }

  window.selectService = selectService;

  window.triggerUpload = function(i) {
    const fileInput = document.getElementById('fileInput_' + i);
    if (fileInput) fileInput.click();
  };

  window.uploadFile = function(i, input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit

    if (file.size > maxSizeBytes) {
      if (window.showToast) {
        window.showToast(`File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB size limit. Please upload a smaller file.`, 'error');
      }
      input.value = ''; // Reset file input
      return;
    }

    const slot = document.getElementById('slot_' + i);
    const status = document.getElementById('slot_status_' + i);
    const badge = document.getElementById('slot_badge_' + i);
    if (slot) {
      slot.classList.add('uploaded');
      const iconWrap = slot.querySelector('.upload-slot-icon');
      if (iconWrap) iconWrap.innerHTML = `<svg width="18" height="18" fill="none" stroke="var(--green-600)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    }
    if (status) {
      status.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
      status.style.color = 'var(--green-600)';
    }
    if (badge) {
      badge.className = 'badge badge-success';
      badge.textContent = 'Uploaded';
    }
  };

  window.handleDragOver = function(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  window.handleDrop = function(e, zoneId) {
    e.preventDefault();
    const zone = document.getElementById(zoneId);
    if (zone) zone.classList.remove('dragover');
    if (window.showToast) window.showToast(`${e.dataTransfer.files.length} file(s) added.`, 'success');
  };

  window.handleFileSelect = function(input, zoneId) {
    if (input.files && input.files.length > 0) {
      const maxSizeBytes = 5 * 1024 * 1024;
      const oversized = Array.from(input.files).filter(f => f.size > maxSizeBytes);
      if (oversized.length > 0) {
        if (window.showToast) {
          window.showToast(`One or more files exceed the 5MB size limit. Please choose files under 5MB.`, 'error');
        }
        input.value = '';
        return;
      }
      if (window.showToast) window.showToast(`${input.files.length} file(s) added.`, 'success');
    }
  };

  // Category filter tabs
  window.filterCategory = (cat, btn) => {
    document.querySelectorAll('.tabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (cat === 'all') {
      renderServiceCards(services);
    } else {
      renderServiceCards(services.filter(s => s.cat === cat));
    }
  };

  // Service search
  window.filterServiceCards = (q) => {
    q = q.toLowerCase();
    const filtered = services.filter(s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.dept.toLowerCase().includes(q));
    renderServiceCards(filtered);
  };

  window.goBack = () => {
    document.getElementById('stepServiceSelect').style.display = 'block';
    document.getElementById('applicationForm').style.display = 'none';
  };

  window.nextStep = (stepNum) => {
    if (stepNum > currentStep) {
      if (window.validateForm && !window.validateForm('#formStep' + currentStep)) return;
      if (currentStep === 1) {
        const aadhaar = document.getElementById('f_aadhaar')?.value;
        if (aadhaar && aadhaar.length !== 12) {
          if(window.showToast) window.showToast('Aadhaar Number must be exactly 12 digits.', 'warning');
          return;
        }
        const mobile = document.getElementById('f_mobile')?.value;
        if (mobile && mobile.length !== 10) {
          if(window.showToast) window.showToast('Mobile Number must be exactly 10 digits.', 'warning');
          return;
        }
        const email = document.getElementById('f_email')?.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) {
          if(window.showToast) window.showToast('Please enter a valid Email Address.', 'warning');
          return;
        }
        const pincode = document.getElementById('f_pincode')?.value;
        if (pincode) {
          if (pincode.length !== 6) {
            if(window.showToast) window.showToast('PIN Code must be exactly 6 digits.', 'warning');
            return;
          }
          if (/^0+$/.test(pincode)) {
            if(window.showToast) window.showToast('PIN Code cannot be all zeros. Please enter a valid PIN Code.', 'warning');
            return;
          }
        }

        const ifsc = document.getElementById('f_ifsc')?.value;
        if (ifsc) {
          const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
          if (!ifscPattern.test(ifsc)) {
            if(window.showToast) window.showToast('Invalid IFSC Code. Please enter a valid 11-char code (e.g. SBIN0001234)', 'warning');
            return;
          }
        }
      }

      if (currentStep === 2) {
        const slots = document.querySelectorAll('#docUploadList .upload-slot');
        const uploaded = document.querySelectorAll('#docUploadList .upload-slot.uploaded');
        if (slots.length > 0 && uploaded.length < slots.length) {
          if (window.showToast) window.showToast('Please upload all required documents to proceed.', 'warning');
          return;
        }
      }
    }
    goToFormStep(stepNum);
  };

  function goToFormStep(step) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('formStep' + i);
      if (el) el.style.display = i === step ? 'block' : 'none';
      const pill = document.getElementById('fstep' + i);
      if (pill) {
        pill.classList.remove('active', 'completed');
        if (i < step) pill.classList.add('completed');
        if (i === step) pill.classList.add('active');
      }
    }
    currentStep = step;

    // ── Sync Data to Stage 3 Review ──
    if (step === 3) {
      const v = (id) => document.getElementById(id)?.value?.trim() || '—';
      const tc = (id, val) => { 
        const el = document.getElementById(id); 
        if (el) el.textContent = val || '—'; 
      };

      const first = v('f_firstName');
      const last = v('f_lastName');
      tc('rev_name', [first, last].filter(s => s && s !== '—').join(' ') || '—');
      tc('rev_aadhaar', v('f_aadhaar'));
      tc('rev_dob', v('f_dob'));
      
      const genderSelect = document.getElementById('f_gender');
      tc('rev_gender', genderSelect?.options[genderSelect.selectedIndex]?.text);
      
      tc('rev_mobile', v('f_mobile'));
      tc('rev_street', v('f_street'));
      tc('rev_district', v('districtSelect'));
      tc('rev_state', v('f_state'));
      tc('rev_pincode', v('f_pincode'));

      if (selectedService) {
        tc('rev_svc', selectedService.name);
        tc('rev_dept', selectedService.dept);
        tc('rev_sla', selectedService.sla + ' Working Days');
        tc('rev_fee', selectedService.feeLabel);
      }

      // Count uploaded slots by checking for the 'uploaded' class
      const uploadedSlots = document.querySelectorAll('#docUploadList .upload-slot.uploaded');
      const uploadedNames = Array.from(uploadedSlots).map(slot => {
        const statusEl = slot.querySelector('[id^="slot_status_"]');
        if (statusEl && statusEl.textContent.startsWith('\u2713')) {
          return statusEl.textContent.replace(/^\u2713\s*/, '').replace(/\s*\(.*\)$/, '').trim();
        }
        return slot.querySelector('[style*="font-weight:600"]')?.textContent || 'document';
      });
      tc('rev_docs', uploadedSlots.length > 0
        ? `${uploadedSlots.length} document(s): ${uploadedNames.join(', ')}`
        : 'No documents uploaded');
    }
  }

  window.validateDecl = () => {
    const d1 = document.getElementById('decl1')?.checked;
    const d2 = document.getElementById('decl2')?.checked;
    const d3 = document.getElementById('decl3')?.checked;
    if (!d1 || !d2 || !d3) { if(window.showToast) window.showToast('Please accept all declarations before proceeding.', 'warning'); return; }
    goToFormStep(4);

    // Reset payment UI to correct default based on service fee
    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
    ['upiForm', 'cardForm', 'netbankingForm', 'freeForm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    if (selectedService && selectedService.fee === 0) {
      // Free service — show Free panel, activate Free tab
      const freeCard = document.getElementById('pm_free');
      if (freeCard) freeCard.classList.add('active');
      const freeForm = document.getElementById('freeForm');
      if (freeForm) freeForm.style.display = 'block';
    } else {
      // Paid service — show UPI panel by default, activate UPI tab
      const upiCard = document.getElementById('pm_upi');
      if (upiCard) upiCard.classList.add('active');
      const upiForm = document.getElementById('upiForm');
      if (upiForm) upiForm.style.display = 'block';
    }
  };

  window.selectPayment = (type) => {
    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById('pm_' + type);
    if(card) card.classList.add('active');
    ['upiForm', 'cardForm', 'netbankingForm', 'freeForm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const formId = type + 'Form';
    const form = document.getElementById(formId); 
    if (form) form.style.display = 'block';
  };

  // UPI quick-fill buttons
  document.querySelectorAll('.btn-outline.btn-sm').forEach(btn => {
    const text = btn.textContent.trim();
    if (['PhonePe', 'Google Pay', 'Paytm'].includes(text)) {
      const valMap = { 'PhonePe': '@phonepe', 'Google Pay': '@gpay', 'Paytm': '@paytm' };
      btn.addEventListener('click', () => {
        const upiInput = document.getElementById('upiId');
        if (upiInput) upiInput.value = valMap[text];
      });
    }
  });

  // Submit application
  window.submitApplication = () => {
    const submitBtn = document.getElementById('submitBtn');
    if (!selectedService) { if(window.showToast) window.showToast('No service selected.', 'error'); return; }

    // Only validate the VISIBLE payment form panel, not all hidden ones
    const activePaymentMethod = document.querySelector('.payment-method-card.active');
    const pmType = activePaymentMethod?.id?.replace('pm_', '') || 'upi';

    if (selectedService.fee > 0 && pmType !== 'free') {
      if (pmType === 'upi') {
        const upiVal = document.getElementById('upiId')?.value?.trim();
        if (!upiVal) {
          if (window.showToast) window.showToast('Please enter your UPI ID to proceed.', 'warning');
          document.getElementById('upiId')?.focus();
          return;
        }
      } else if (pmType === 'card') {
        const cardNum = document.querySelector('#cardForm input[placeholder="1234 5678 9012 3456"]')?.value?.replace(/\s/g,'');
        if (!cardNum || cardNum.length < 16) {
          if (window.showToast) window.showToast('Please enter a valid 16-digit card number.', 'warning');
          return;
        }
        const expiry = document.querySelector('#cardForm input[placeholder="MM/YY"]')?.value?.trim();
        if (!expiry || expiry.length < 5) {
          if (window.showToast) window.showToast('Please enter a valid expiry date (MM/YY).', 'warning');
          return;
        }
        const cvv = document.querySelector('#cardForm input[placeholder="•••"]')?.value?.trim();
        if (!cvv || cvv.length < 3) {
          if (window.showToast) window.showToast('Please enter the CVV to proceed.', 'warning');
          return;
        }
      } else if (pmType === 'netbanking') {
        const bank = document.querySelector('#netbankingForm select')?.value;
        if (!bank) {
          if (window.showToast) window.showToast('Please select your bank to proceed.', 'warning');
          return;
        }
      }
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:#fff;width:18px;height:18px;"></div> Processing Payment...';
    }

    setTimeout(async () => {
      // ── Read ALL service-specific and personal fields from the form DOM ──
      const v = (id) => document.getElementById(id)?.value?.trim() || null;
      const vq = (selector) => document.querySelector(selector);
      // Helper: get value from the nth input/select inside specificBody
      const sf = (idx) => {
        const inputs = document.getElementById('specificBody')?.querySelectorAll('input,select,textarea');
        return inputs?.[idx]?.value?.trim() || null;
      };

      // Personal / common fields — IDs match apply-service.html exactly
      const formFirst   = v('f_firstName') || '';
      const formLast    = v('f_lastName')  || '';
      const formName    = [formFirst, formLast].filter(Boolean).join(' ') || session.name;
      const formDob     = v('f_dob');
      const formGender  = v('f_gender') || document.getElementById('f_gender')?.options?.[document.getElementById('f_gender')?.selectedIndex]?.text;
      const formGuardian= v('f_guardianName');
      const formPhone   = v('f_mobile') || session.phone;
      const formAadhaar = v('f_aadhaar') || session.aadhaar;
      // Compose full address from all address sub-fields
      const formStreet  = v('f_street')   || '';
      const formVillage = v('f_village')  || '';
      const formMandal  = v('f_mandal')   || '';
      const formDistrict= v('districtSelect') || '';
      const formState   = v('f_state')    || '';
      const formPincode = v('f_pincode')  || '';
      const formAddress = [formStreet, formVillage, formMandal, formDistrict, formState, formPincode]
        .filter(Boolean).join(', ') || null;

      // Service-specific fields — positionally from specificBody
      let svcFields = {};
      const sName = selectedService.name;
      if (sName === 'Income Certificate') {
        svcFields = { income: sf(0), incomeSource: sf(1), occupation: sf(2), purpose: sf(3) };
      } else if (sName === 'Caste Certificate') {
        svcFields = { community: sf(0), subCaste: sf(1), category: sf(2), religion: sf(3), purpose: sf(4) };
      } else if (sName === 'Residence Certificate') {
        svcFields = { duration: sf(0), residenceType: sf(1), purpose: sf(2) };
      } else if (sName === 'Welfare / Subsidy Scheme') {
        svcFields = { landHolding: sf(0), surveyNo: sf(1), bankAccount: sf(2), ifsc: sf(3) };
      } else if (sName === 'Scholarship Application') {
        svcFields = { courseName: sf(0), institution: sf(1), admissionYear: sf(2), tuitionFee: sf(3) };
      } else if (sName === 'Event Permission') {
        svcFields = { eventName: sf(0), eventType: sf(1), eventDate: sf(2), eventDuration: sf(3), venueAddress: sf(4), attendance: sf(5) };
      } else if (sName === 'Vendor License') {
        svcFields = { businessName: sf(0), businessType: sf(1), businessAddress: sf(2), ownershipType: sf(3) };
      } else if (sName === 'Record Correction') {
        svcFields = { recordType: sf(0), recordNo: sf(1), incorrect: sf(2), correct: sf(3), reason: sf(4) };
      }

      const paymentTxnId = selectedService.fee === 0 ? null : (window.mockPaymentTxn || `TXN-${Math.floor(1000000+Math.random()*9000000)}`);
      const paymentMethodLabel = selectedService.fee === 0 ? 'Free'
        : pmType === 'card' ? 'Debit/Credit Card'
        : pmType === 'netbanking' ? 'Net Banking'
        : pmType === 'upi' ? 'UPI'
        : 'Other';
      
      // Collect ALL uploaded files from every doc slot + additional input
      const allUploadedFiles = [];
      if (selectedService.docs) {
        for (let i = 0; i < selectedService.docs.length; i++) {
          const fi = document.getElementById('fileInput_' + i);
          if (fi && fi.files && fi.files[0]) {
            allUploadedFiles.push(fi.files[0]);
          }
        }
      }
      const additionalFi = document.getElementById('additionalFileInput');
      if (additionalFi && additionalFi.files) {
        Array.from(additionalFi.files).forEach(f => allUploadedFiles.push(f));
      }

      const formObj = {
        dob: formDob, gender: formGender, address: formAddress, pincode: formPincode,
        phone: formPhone, aadhaar: formAadhaar, guardianName: formGuardian,
        street: formStreet, village: formVillage, mandal: formMandal,
        district: formDistrict, state: formState,
        ...svcFields
      };

      let payload;
      if (allUploadedFiles.length > 0) {
        const fd = new FormData();
        fd.append('serviceId', selectedService.id);
        fd.append('citizenId', session.id);
        fd.append('dept', selectedService.dept);
        fd.append('fee', selectedService.fee || 0);
        if (paymentTxnId) fd.append('paymentTransactionId', paymentTxnId);
        if (paymentMethodLabel) fd.append('paymentMethod', paymentMethodLabel);
        fd.append('remarks', `Applied for ${selectedService.name}`);
        fd.append('formData', JSON.stringify(formObj));
        allUploadedFiles.forEach(f => fd.append('documents', f));
        payload = fd;
      } else {
        payload = {
          serviceId: selectedService.id,
          citizenId: session.id,
          dept: selectedService.dept,
          fee: selectedService.fee,
          paymentTransactionId: paymentTxnId,
          paymentMethod: paymentMethodLabel,
          documents: selectedService.docs.map((d, i) => {
            const fileInput = document.getElementById('fileInput_' + i);
            const actualName = (fileInput && fileInput.files && fileInput.files.length > 0) ? fileInput.files[0].name : d + '.pdf';
            return { name: actualName, type: d, date: new Date().toISOString(), status: 'pending' };
          }),
          formData: formObj
        };
      }

      try {
        const res = await apiSubmitApplication(payload);
        const newApp = res.data;
        sessionStorage.setItem('lastSubmittedApp', JSON.stringify(newApp));
        
        // Show success screen
        for (let i = 1; i <= 4; i++) {
          const el = document.getElementById('formStep' + i);
          if (el) el.style.display = 'none';
        }
        
        const stepper = document.getElementById('formStepper');
        if (stepper) stepper.style.display = 'none';
        
        const banner = document.getElementById('selectedServiceBanner');
        if (banner) banner.style.display = 'none';

        const success = document.getElementById('successScreen');
        if (success) {
          success.style.display = 'block';
          setTC('successAppId', newApp.id);
          setTC('appRefId', newApp.id);
          const trackBtn = success.querySelector('button.btn-primary');
          if (trackBtn) {
            trackBtn.removeAttribute('onclick');
            trackBtn.onclick = () => {
              sessionStorage.removeItem('lastSubmittedApp');
              window.location.href = `track-application.html?id=${newApp.id}`;
            };
          }
        }
        
        if (window.showToast) window.showToast('Application submitted successfully!', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch(e) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pay & Submit Application
          `;
        }
        if(window.showToast) window.showToast(e.message, 'error');
      }
    }, 1000);
  };

  function setTC(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
}

// ══════════════════════════════════════════
// Citizen: My Applications
// ══════════════════════════════════════════

export async function initMyApplications() {
  const session = initPage({ title: 'My Applications', breadcrumbs: [{ label: 'Citizen Portal', href: 'citizen/citizen-dashboard.html' }, { label: 'My Applications' }], requiredRole: 'citizen' });
  if (!session) return;
  renderNotifPanel();

  // Helper — sets text of first element matching a CSS selector
  function setT(selector, val) {
    const el = document.querySelector(selector);
    if (el) el.textContent = val;
  }

  const tbody = document.getElementById('appsTableBody') || document.getElementById('applicationsTableBody');
  const cardGrid = document.getElementById('appsCardGrid');

  let baseApps = [];
  try {
      const res = await apiGetMyApplications(1, 100); // Pagination disabled effectively
      baseApps = res.data || [];
  } catch(e) {
      console.error(e);
  }
  
  let filterStatus = 'all';
  let filterType = '';
  let query = '';
  let sortBy = 'date-desc';
  let currentView = 'table';
  


  async function renderView() {
    // Re-fetch from live storage so new submissions appear immediately
    try {
        const res = await apiGetMyApplications(1, 100);
        baseApps = res.data || [];
    } catch(e) { console.error(e); }

    let filtered = baseApps.filter(a => {
      // Treat 'completed' as 'approved' — same terminal success state
      const effectiveStatus = a.status === 'completed' ? 'approved' : a.status;
      if (filterStatus !== 'all' && effectiveStatus !== filterStatus) return false;
      if (filterType && a.serviceType && a.serviceType.toLowerCase() !== filterType) return false;
      if (query && !a.id.toLowerCase().includes(query) && !a.serviceName.toLowerCase().includes(query)) return false;
      return true;
    });

    if (sortBy === 'date-desc') filtered.sort((a,b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    if (sortBy === 'date-asc') filtered.sort((a,b) => new Date(a.submittedDate) - new Date(b.submittedDate));
    if (sortBy === 'status') filtered.sort((a,b) => a.status.localeCompare(b.status));
    if (sortBy === 'sla') filtered.sort((a,b) => checkSLA(a).daysLeft - checkSLA(b).daysLeft);

    const totalItems = filtered.length;
    const paginated = filtered;

    const visibleCount = document.getElementById('visibleCount');
    if (visibleCount) visibleCount.textContent = totalItems;
    const visibleCountTotal = document.getElementById('visibleCountTotal');
    if (visibleCountTotal) visibleCountTotal.textContent = totalItems;

    if (currentView === 'table' && tbody) {
      document.getElementById('tableView').style.display = 'block';
      document.getElementById('cardView').style.display = 'none';

      tbody.innerHTML = paginated.map(a => {
        const clsMap = { 
          'approved': 'badge-success', 
          'completed': 'badge-success',   // completed = approved (same thing)
          'rejected': 'badge-danger', 
          'query': 'badge-warning', 
          'escalated': 'badge-purple',
          'draft': 'badge-neutral', 
          'under-review': 'badge-info'
        };
        const statusClass = clsMap[a.status] || 'badge-info';
        // Display 'Approved' for completed apps — same meaning, simpler label
        const rawLabel = a.status === 'completed' ? 'approved' : a.status;
        const statusLabel = rawLabel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const typeClassMap = { 'certificate': 'svc-certificate', 'welfare': 'svc-welfare', 'permission': 'svc-permission', 'correction': 'svc-record' };
        const typeClass = typeClassMap[(a.serviceType||'').toLowerCase()] || 'svc-certificate';
        const typeLabel = a.serviceType ? a.serviceType.charAt(0).toUpperCase() + a.serviceType.slice(1) : 'Service';
        
        const sla = checkSLA(a);
        const isClosed = ['approved', 'completed', 'rejected'].includes(a.status);
        const slaText = isClosed ? 'Closed' : (sla.daysLeft !== null ? (sla.daysLeft >= 0 ? `${sla.daysLeft} days left` : `${Math.abs(sla.daysLeft)} days overdue`) : '—');
        const slaCls = isClosed ? (a.status === 'rejected' ? 'breach' : 'safe') : (sla.daysLeft === null ? '' : sla.daysLeft > 4 ? 'safe' : sla.daysLeft >= 0 ? 'warn' : 'breach');
        const slaWidth = isClosed ? 100 : Math.max(0, sla.daysLeft||0) * 10;

        return `
          <tr data-testid="app-row-${a.id}">
            <td class="app-id">${a.id}</td>
            <td><div style="font-weight:600;color:var(--navy-900);">${a.serviceName}</div><div style="font-size:0.75rem;color:var(--color-text-muted);">${a.dept}</div></td>
            <td><span class="service-tag ${typeClass}">${typeLabel}</span></td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            <td>${formatDate(a.submittedDate)}</td>
            <td>
              <div class="sla-wrap">
                <div class="sla-bar-bg"><div class="sla-bar-fill ${slaCls}" style="width:${slaWidth}%"></div></div>
                <div class="sla-text ${slaCls}">${slaText}</div>
              </div>
            </td>
            <td>${a.officerName || '—'}</td>
            <td>
              <div class="row-actions">
                <a href="track-application.html?id=${a.id}" class="icon-btn" title="Track"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></a>
                ${a.status==='draft' ? `<button class="icon-btn" style="color:var(--red-500);" onclick="window.confirmWithdrawApp('${a.id}')"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>` : ''}
              </div>
            </td>
          </tr>`;
      }).join('') || '<tr><td colspan="8" style="text-align:center;padding:var(--space-xl);color:var(--color-text-muted);">No applications found</td></tr>';
    } 
    else if (currentView === 'card' && cardGrid) {
      document.getElementById('tableView').style.display = 'none';
      document.getElementById('cardView').style.display = 'block';
      cardGrid.innerHTML = paginated.map(a => {
        const clsMap = { 
          'approved': 'badge-success', 
          'completed': 'badge-success',
          'rejected': 'badge-danger', 
          'query': 'badge-warning', 
          'escalated': 'badge-purple',
          'draft': 'badge-neutral', 
          'under-review': 'badge-info' 
        };
        const rawLabel = a.status === 'completed' ? 'approved' : a.status;
        const statusLabel = rawLabel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
          <div class="app-card" onclick="window.location.href='track-application.html?id=${a.id}'">
            <div class="app-card-header">
              <div class="app-card-meta">
                <div class="app-card-id">${a.id}</div>
                <div class="app-card-title">${a.serviceName}</div>
                <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px;">${a.dept}</div>
              </div>
            </div>
            <div class="app-card-body">
              <div class="app-card-row"><span class="app-card-label">Submitted</span><span class="app-card-value">${formatDate(a.submittedDate)}</span></div>
              <div class="app-card-row"><span class="app-card-label">Status</span><span class="badge ${clsMap[a.status]||'badge-info'}">${statusLabel}</span></div>
            </div>
          </div>`;
      }).join('');
    }
    
    // Update stats chips dynamically from live data
    const IN_PROGRESS = ['submitted', 'under-review', 'officer-approved', 'supervisor-review', 'pending_external_verification'];
    setT('.chip-all .summary-chip-val', baseApps.length);
    setT('.chip-pending .summary-chip-val', baseApps.filter(a => IN_PROGRESS.includes(a.status)).length);
    setT('.chip-query .summary-chip-val', baseApps.filter(a => a.status === 'query').length);
    setT('.chip-approved .summary-chip-val', baseApps.filter(a => a.status === 'approved' || a.status === 'completed').length);
    setT('.chip-rejected .summary-chip-val', baseApps.filter(a => a.status === 'rejected').length);
    setT('.chip-escalated .summary-chip-val', baseApps.filter(a => a.status === 'escalated').length);
  }

  window.handleSearch = () => { query = document.getElementById('searchInput')?.value.toLowerCase() || ''; renderView(); };
  window.handleServiceFilter = (val) => { filterType = val.toLowerCase(); renderView(); };
  window.handleSort = (val) => { sortBy = val; renderView(); };
  
  window.filterByStatus = (status, el) => {
    filterStatus = status;
    document.querySelectorAll('.summary-chip').forEach(c => c.classList.remove('active-filter'));
    if (el) el.classList.add('active-filter');
    
    document.querySelectorAll('.filter-btn').forEach(b => {
      if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + status + "'")) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    renderView();
  };
  
  window.setFilter = (status, el) => {
    filterStatus = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    
    document.querySelectorAll('.summary-chip').forEach(c => {
      if (c.getAttribute('onclick') && c.getAttribute('onclick').includes("'" + status + "'")) {
        c.classList.add('active-filter');
      } else {
        c.classList.remove('active-filter');
      }
    });

    renderView();
  };

  window.setView = (view) => {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(view + 'ViewBtn');
    if (btn) btn.classList.add('active');
    renderView();
  };

  let withdrawCandidate = null;
  window.confirmWithdrawApp = (id) => {
    withdrawCandidate = id;
    const el = document.getElementById('withdrawAppId');
    if(el) el.textContent = id;
    window.openModal('withdrawModal');
  };
  window.confirmWithdraw = async () => {
    if(withdrawCandidate) {
      try {
        await apiWithdrawApplication(withdrawCandidate);
        baseApps = baseApps.filter(a => a.id !== withdrawCandidate);
        window.closeModal('withdrawModal');
        if(window.showToast) window.showToast('Application withdrawn successfully.', 'success');
        renderView();
      } catch(e) {
        if(window.showToast) window.showToast(e.message, 'error');
      }
    }
  };

  renderView();
}

// ══════════════════════════════════════════
// Citizen: Track Application
// ══════════════════════════════════════════

export async function initTrackApplication() {
  const session = initPage({ title: 'Track Application', breadcrumbs: [{ label: 'Citizen Portal', href: 'citizen/citizen-dashboard.html' }, { label: 'Track Application' }], requiredRole: 'citizen' });
  if (!session) return;
  renderNotifPanel();

  const appId = getQueryParam('id');
  const emptyState = document.getElementById('emptyState');
  const appDetail = document.getElementById('appDetail');
  const trackInput = document.getElementById('trackInput');

  async function loadApplication(id) {
    let app = null;
    try {
      const res = await apiGetApplicationById(id);
      app = res.data;
    } catch(e) {
      showToast('Application not found. Check the ID and try again.', 'error');
      if (appDetail) appDetail.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    // ── PRIVACY CHECK: Ensure the citizen owns this application ──
    if (app.citizenId !== session.id) {
      showToast('You are not authorized to track this application.', 'error');
      // Hide details and show empty state if an unauthorized ID was entered
      if (appDetail) appDetail.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    // Hide empty state, show detail
    if (emptyState) emptyState.style.display = 'none';
    if (appDetail) appDetail.style.display = 'block';

    // Populate header
    setTC('detailAppId', app.id);
    setTC('detailServiceName', app.serviceName);
    setTC('detailDept', app.dept);
    setTC('detailSubmitted', formatDate(app.submittedDate));
    setTC('detailSla', formatDate(app.slaDate));
    setTC('detailOfficer', app.officerName || 'Not assigned');

    // Status badge
    const badge = document.getElementById('detailBadge');
    if (badge) {
      const cls = app.status === 'approved' ? 'badge-success'
        : app.status === 'rejected' ? 'badge-danger'
        : app.status === 'query' ? 'badge-warning'
        : 'badge-info';
      badge.className = `badge ${cls}`;
      badge.textContent = app.status === 'under-review' ? 'Under Review'
        : app.status.charAt(0).toUpperCase() + app.status.slice(1);
    }

    // Payment status badge — show green tick when paid, amber when pending
    let payBadge = document.getElementById('paymentStatusBadge');
    if (!payBadge) {
      payBadge = document.createElement('span');
      payBadge.id = 'paymentStatusBadge';
      payBadge.style.marginLeft = '6px';
      badge?.parentNode?.insertBefore(payBadge, badge.nextSibling);
    }
    if (app.fee === 0) {
      payBadge.className = 'badge badge-success';
      payBadge.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="vertical-align:-1px;margin-right:3px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Free / No Fee`;
    } else if (app.paymentStatus === 'paid') {
      payBadge.className = 'badge badge-success';
      payBadge.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="vertical-align:-1px;margin-right:3px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Payment Confirmed`;
    } else {
      payBadge.className = 'badge badge-warning';
      payBadge.textContent = 'Payment Pending';
    }

    // Days left & SLA bar
    const slaCheck = checkSLA(app);
    const isClosed = ['approved', 'completed', 'rejected'].includes(app.status);
    const slaCls = isClosed ? (app.status === 'rejected' ? 'breach' : 'safe') : (slaCheck.daysLeft === null ? '' : slaCheck.daysLeft > 4 ? 'safe' : slaCheck.daysLeft >= 0 ? 'warn' : 'breach');
    
    setTC('detailDaysLeft', isClosed ? '—' : (slaCheck.daysLeft !== null ? Math.abs(slaCheck.daysLeft) : '—'));

    const totalDays = Math.max(1, Math.ceil((new Date(app.slaDate) - new Date(app.submittedDate)) / 86400000));
    const usedDays = isClosed ? totalDays : Math.ceil((new Date() - new Date(app.submittedDate)) / 86400000);
    const perc = isClosed ? 100 : Math.min(100, Math.max(0, Math.round((usedDays / totalDays) * 100)));
    
    setTC('slaPercText', isClosed ? 'Closed' : perc + '%');
    setTC('slaDayUsed', usedDays + ' days used');
    setTC('slaDayTotal', totalDays + ' days total');
    const slaFill = document.getElementById('slaFill');
    if (slaFill) { 
      slaFill.style.width = perc + '%'; 
      slaFill.className = `sla-fill ${slaCls}`; 
    }

    // Stage bar — maps all real statuses to progress steps
    // Steps: 1=Submitted, 2=Payment, 3=Officer Verified, 4=Supervisor Review, 5=Approved/Completed
    const STATUS_STEP = {
      'pending':              1,
      'submitted':            2,  // submitted means payment was done
      'under-review':         3,
      'query':                3,
      'pending_external_verification': 3,
      'officer-approved':     3,
      'escalated':            4,
      'supervisor-review':    4,
      'approved':             5,
      'completed':            5,
      'rejected':             -1,
    };

    // Payment step is done when fee=0 (free) or paymentStatus=paid
    const paymentDone = app.fee === 0 || app.paymentStatus === 'paid';

    // Helper: map a timeline action string to a step number
    function actionToStep(action) {
      const a = (action || '').toLowerCase();
      if (a.includes('submit')) return 2;
      if (a.includes('payment') || a.includes('paid')) return 2;
      if (a.includes('approv') && (a.includes('officer') || a.includes('final'))) return 3;
      if (a.includes('supervisor') || a.includes('final approv')) return 4;
      if ((a.includes('approv') || a.includes('complet')) && !a.includes('officer')) return 5;
      if (a.includes('officer-approved') || a.includes('officer_approved')) return 3;
      if (a.includes('escalat')) return 4;
      if (a.includes('under') || a.includes('review') || a.includes('query') || a.includes('pending')) return 3;
      if (a.includes('reject')) return -1;
      return 0;
    }

    // ── Derive the highest step ever reached from the full timeline ──
    let maxStepReached = STATUS_STEP[app.status] ?? 0;
    // Payment step is always done if fee paid
    if (paymentDone && maxStepReached >= 1) maxStepReached = Math.max(maxStepReached, 2);
    if (app.timeline && app.timeline.length) {
      for (const t of app.timeline) {
        const s = actionToStep(t.action);
        if (s > maxStepReached) maxStepReached = s;
      }
    }
    const currStep = STATUS_STEP[app.status] ?? 0;

    const stages = [
      { label: 'Application\nSubmitted',   step: 1 },
      { label: 'Payment\nConfirmed',        step: 2 },
      { label: 'Officer\nVerified',         step: 3 },
      { label: 'Supervisor\nReview',        step: 4 },
      { label: 'Approved /\nCompleted',     step: 5 },
    ];

    const stageBar = document.getElementById('stageBar');
    if (stageBar) {
      stageBar.innerHTML = stages.map(s => {
        let stStatus;

        if (app.status === 'rejected') {
          // Mark all stages up to the point of rejection as done, rest empty
          stStatus = s.step <= maxStepReached ? 'done' : '';
        } else if (app.status === 'escalated') {
          // Steps 1 (Submitted) and 2 (Payment) are done, Officer(3) is breach, Supervisor(4) is active
          if (s.step <= 2) stStatus = 'done';
          else if (s.step === 3) stStatus = 'breach';
          else if (s.step === 4) stStatus = 'active';
          else stStatus = '';
        } else {
          // General case: use the high-water mark from timeline
          if (s.step <= maxStepReached) {
            stStatus = 'done';
          } else if (s.step === maxStepReached + 1) {
            stStatus = 'active';
          } else {
            stStatus = '';
          }
        }

        const iconMap = {
          'done':   '<svg width="16" height="16" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
          'active': '<svg width="14" height="14" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
          'breach': '<svg width="14" height="14" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
        };

        return `
        <div class="stage-node ${stStatus}">
          <div class="stage-circle">
            ${iconMap[stStatus] || '○'}
          </div>
          <div class="stage-label">${s.label.replace('\n', '<br>')}</div>
        </div>
      `;
      }).join('');
    }

    // Action alert (query)
    const actionAlert = document.getElementById('actionAlert');
    if (actionAlert) {
      actionAlert.style.display = app.status === 'query' ? 'block' : 'none';
      const qt = document.getElementById('queryText');
      if (qt && app.status === 'query') {
        const queryNote = app.timeline.find(t => t.action.includes('Query'))?.note || 'Please provide additional details requested by the officer.';
        qt.textContent = `Officer ${app.officerName || 'Assigned'} has raised a query: "${queryNote}"`;
      }
    }

    // Timeline
    const timeline = document.getElementById('appTimeline');
    if (timeline && app.timeline) {
      timeline.innerHTML = app.timeline.map((t, i) => {
        const isLast = i === app.timeline.length - 1;
        let dot = 'success';
        const actionText = t.action.toLowerCase();
        if (actionText.includes('escalate') || actionText.includes('reject') || actionText.includes('breach')) {
          dot = 'danger';
        } else if (isLast) {
          dot = (app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'active');
        }
        
        return `
      <div class="timeline-item">
        <div class="timeline-dot ${dot}">
          ${dot === 'success' ? '<svg width="14" height="14" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'}
        </div>
        <div class="timeline-content">
          <div class="timeline-label">${t.action}</div>
          <div style="font-size:0.8125rem;color:var(--slate-600);margin-top:2px;">${t.note || ''}</div>
          <div class="timeline-time">${formatDateTime(t.date)}</div>
        </div>
      </div>
        `;
      }).join('');
    }

    // Documents
    const docsBody = document.getElementById('docsTableBody');
    if (docsBody && app.documents) {
      docsBody.innerHTML = app.documents.map(d => {
        const bdgClass = d.status === 'verified' ? 'badge-success' : d.status === 'query' ? 'badge-warning' : 'badge-neutral';
        const bdgText = d.status === 'verified' ? 'Verified' : d.status === 'query' ? 'Query Raised' : 'Uploaded';
        const fileUrl = d.path ? `http://localhost:3000/${d.path.replace(/\\/g, '/').replace(/^\/+/, '')}` : '';
        const viewAction = fileUrl 
          ? `window.open('${fileUrl}', '_blank')`
          : `if(window.showToast) window.showToast('No physical file attached for ${d.name} (sample record).','warning')`;
        const downloadAction = fileUrl
          ? `<button class="btn btn-outline btn-sm" style="font-size:0.72rem;" onclick="downloadFile('${fileUrl}', '${d.name}')" title="Download copy">↓</button>`
          : `<button class="btn btn-outline btn-sm" style="font-size:0.72rem;" onclick="if(window.showToast) window.showToast('Sample file cannot be downloaded.','warning')">↓</button>`;

        return `
      <tr>
        <td style="font-weight:600;color:var(--navy-900);">${d.name}</td>
        <td><span style="font-size:0.8rem;color:var(--color-text-muted);">${d.type}</span></td>
        <td>${formatDate(d.date)}</td>
        <td><span class="badge ${bdgClass}">${bdgText}</span></td>
        <td>
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="btn btn-ghost btn-sm" style="font-size:0.72rem;" onclick="${viewAction}">View</button>
            ${downloadAction}
          </div>
        </td>
      </tr>`;
      }).join('');
    }

    // Details grid
    const detailsGrid = document.getElementById('detailsGrid');
    if (detailsGrid) {
      const details = [
        { k: 'Application ID', v: app.id }, { k: 'Service', v: app.serviceName },
        { k: 'Applicant Name', v: app.citizenName || session.name }, 
        { k: 'Department', v: app.dept }, { k: 'Submitted On', v: formatDate(app.submittedDate) },
        { k: 'SLA Due Date', v: formatDate(app.slaDate) }, { k: 'Assigned Officer', v: app.officerName || '—' },
        { k: 'Fee Paid', v: app.fee > 0 ? '₹' + app.fee : 'Free' }, { k: 'Payment Method', v: app.paymentMethod },
        { k: 'Status', v: app.status.toUpperCase() },
      ];
      detailsGrid.innerHTML = details.map(d => `
      <div class="review-item"><span class="review-key">${d.k}</span><span class="review-value">${d.v}</span></div>
      `).join('');
    }

    // Download cert button
    const certBtn = document.getElementById('downloadCertBtn');
    if (certBtn) {
      certBtn.style.display = (app.status === 'approved' || app.status === 'completed') ? 'inline-flex' : 'none';
      certBtn.onclick = () => window.downloadDigitalCertificate(app);
    }
  }

  // Auto-load if ID in URL
  if (appId) {
    loadApplication(appId);
  } else {
    // If no ID is passed, default to first citizen application if tracking from menu.
    apiGetMyApplications().then(res => {
      const myApps = res.data || [];
      if(myApps.length > 0) loadApplication(myApps[0].id);
    }).catch(e => {
      if (emptyState) emptyState.style.display = 'block';
    });
  }

  // Search button / enter
  if (trackInput) {
    trackInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') loadApplication(trackInput.value.trim().toUpperCase());
    });
  }
  const trackBtn = document.querySelector('.btn-primary');
  if (trackBtn && trackBtn.closest('#emptyState, [style*="display"]')) {
    document.querySelectorAll('.btn-primary').forEach(btn => {
      if (btn.textContent.includes('Track') && !btn.textContent.includes('Application')) {
        btn.addEventListener('click', () => {
          if (trackInput) loadApplication(trackInput.value.trim().toUpperCase());
        });
      }
    });
  }

  // Tab switching and Modals exported to window
  window.trackApplication = function(id) {
    if (id) loadApplication(id.trim().toUpperCase());
  };

  window.switchTab = function(id, el) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    
    const panel = document.getElementById('tab-' + id);
    if(panel) panel.classList.add('active');
    
    if(el) el.classList.add('active');
  };

  window.openQueryResponseModal = function() {
    const modal = document.getElementById('queryModal');
    if (modal) modal.classList.add('active');
  };

  window.handleQueryFileSelect = function(input) {
    const uploadedFile = document.getElementById('uploadedFile');
    const submitBtn = document.getElementById('submitResponseBtn');
    
    if (!input.files || input.files.length === 0) return;

    const maxSizeBytes = 5 * 1024 * 1024;
    const oversized = Array.from(input.files).filter(f => f.size > maxSizeBytes);
    if (oversized.length > 0) {
      if (window.showToast) {
        window.showToast(`File exceeds 5MB size limit. Please upload files under 5MB.`, 'error');
      }
      input.value = '';
      if (uploadedFile) uploadedFile.style.display = 'none';
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    const files = Array.from(input.files);
    const fileListHtml = files.map(f => {
      const sizeKb = (f.size / 1024).toFixed(0);
      const sizeStr = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
      return `<div style="display:flex;align-items:center;gap:8px;background:var(--green-50);padding:8px 12px;border-radius:var(--radius-sm);border:1px solid var(--green-200);margin-bottom:4px;">
        <svg width="14" height="14" fill="none" stroke="var(--green-500)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span style="font-size:0.8125rem;font-weight:600;color:var(--navy-900);flex:1;">${f.name}</span>
        <span style="font-size:0.72rem;color:var(--color-text-muted);">${sizeStr}</span>
      </div>`;
    }).join('');

    if (uploadedFile) {
      uploadedFile.style.display = 'block';
      uploadedFile.innerHTML = fileListHtml;
    }
    // Enable the Submit button now that files are chosen
    if (submitBtn) submitBtn.disabled = false;
  };


  window.submitQueryResponse = async function() {
    const modal = document.getElementById('queryModal');
    const noteText = document.getElementById('queryResponseNote')?.value?.trim();
    const fileInput = document.getElementById('queryFileInput');
    const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;
    const fileNames = hasFiles
      ? Array.from(fileInput.files).map(f => f.name).join(', ')
      : null;
    
    // Build response message from note + uploaded file names
    const responseText = [noteText, fileNames ? `Attached: ${fileNames}` : null]
      .filter(Boolean).join(' | ') || 'Citizen uploaded requested documents.';

    const currentAppId = document.getElementById('detailAppId')?.textContent || getQueryParam('id');

    if (currentAppId) {
      const submitBtn = document.getElementById('submitResponseBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:#fff;width:14px;height:14px;"></div> Submitting...';
      }
      try {
        if (hasFiles) {
          const fd = new FormData();
          fd.append('response', responseText);
          Array.from(fileInput.files).forEach(f => fd.append('documents', f));
          await apiRespondToQuery(currentAppId, fd);
        } else {
          await apiRespondToQuery(currentAppId, responseText);
        }
      } catch(e) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Submit Response';
        }
        if(window.showToast) window.showToast(e.message, 'error');
        return;
      }
    }

    if (modal) modal.classList.remove('active');
    if (window.showToast) window.showToast('Response submitted! Officer has been notified and your application is back under review.', 'success');
    const alertBox = document.getElementById('actionAlert');
    if (alertBox) alertBox.style.display = 'none';

    if (currentAppId) {
      setTimeout(() => loadApplication(currentAppId), 800);
    }
  };

  function setTC(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
}

// ══════════════════════════════════════════
// Officer: Review Application
// ══════════════════════════════════════════

export async function initReviewApplication() {
  const session = initPage({ title: 'Review Applications', breadcrumbs: [{ label: 'Officer Portal', href: 'officer/officer-dashboard.html' }, { label: 'Review Applications' }], requiredRole: 'officer' });
  if (!session) return;
  renderNotifPanel();

  let officerQueue = [];
  let myApps = [];
  try {
      const { apiGetOfficerQueue } = await import('./api.js');
      const res = await apiGetOfficerQueue();
      officerQueue = res.data || [];
      // officerQueue is already shaped by backend: has service, citizen, submitted, slaLeft, slaTotal
      // Enrich with history from timeline if present
      officerQueue = officerQueue.map(a => ({
          ...a,
          docs: a.documents ? a.documents.map(d => ({ name: d.name, size: '—', type: d.type, icon: d.name.endsWith('pdf') ? 'pdf' : 'img' })) : [],
          history: a.timeline ? a.timeline.map(t => ({ label: t.action, ts: formatDateTime(t.date), detail: t.note, dot: 'review' })) : []
      }));
      // All apps in officer-queue are active (pending/under-review/query/escalated)
      myApps = officerQueue.filter(a => !['approved', 'rejected', 'completed'].includes(a.status));
  } catch(e) { console.error('Failed to load officer queue:', e); }
  
  // State 
  let currentIdx = 0;
  let currentDecision = 'approve';
  let checkState = {};

  const dotColors = {
      submitted:'var(--navy-500)', assign:'var(--slate-500)',
      review:'var(--amber-400)', warning:'var(--amber-500)',
      breach:'var(--red-500)', approved:'#10b981', rejected:'var(--red-500)'
  };
  const dotIcons = {
      submitted:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
      assign:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
      review:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
      warning:'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      breach:'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      approved:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const setTC = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  window.loadApp = function(idx) {
      if (myApps.length === 0) {
        document.getElementById('appHero').innerHTML = '<div style="text-align:center;padding:var(--space-xl);color:var(--color-text-muted);">No applications to review.</div>';
        return;
      }
      currentIdx = idx;
      const a = myApps[idx];
      if (!a) return;

      // Init check state
      checkState = {};
      if (a.checklist) a.checklist.forEach((_, i) => checkState[i] = false);

      // Hero
      setTC('heroAppId', a.id);
      setTC('heroTitle', `${a.service} — Review`);
      setTC('heroCitizen', a.citizen);
      setTC('heroPhone', a.phone);
      setTC('heroSubmitted', a.submitted);
      setTC('breadcrumbId', a.id);
      setTC('queuePos', `Application ${idx+1} of ${myApps.length}`);
      
      const prevBtn = document.getElementById('prevBtn');
      if (prevBtn) prevBtn.disabled = idx === 0;
      const nextBtn = document.getElementById('nextBtn');
      if (nextBtn) nextBtn.disabled = idx === myApps.length - 1;

      const badge = document.getElementById('heroBadge');
      if (badge) {
          const bMap = {new:'badge-info',review:'badge-warning',urgent:'badge-danger',breach:'badge-danger'};
          const lMap = {new:'New',review:'In Review',urgent:'Urgent',breach:'SLA Breach'};
          badge.className = 'badge ' + (bMap[a.status]||'badge-info');
          badge.textContent = lMap[a.status]||'New';
      }

      // SLA Hero
      const pct = Math.min(100, Math.abs((a.slaLeft||0)/(a.slaTotal||1)*100));
      const slaCol = a.slaLeft < 0 ? 'var(--red-500)' : a.slaLeft <= 2 ? 'var(--amber-500)' : '#10b981';
      const slaBarCol = a.slaLeft < 0 ? 'var(--red-500)' : a.slaLeft <= 2 ? 'var(--amber-400)' : '#10b981';
      
      const valEl = document.getElementById('slaHeroVal');
      if(valEl) {
        valEl.style.color = slaCol;
        valEl.textContent = a.slaLeft < 0 ? `+${Math.abs(a.slaLeft)}d` : `${a.slaLeft}d`;
      }
      setTC('slaHeroSub', a.slaLeft < 0 ? 'overdue' : 'remaining');
      
      const barEl = document.getElementById('slaHeroBar');
      if(barEl) {
        barEl.style.width = pct + '%';
        barEl.style.background = slaBarCol;
      }
      setTC('slaHeroFoot', `${Math.max(0, (a.slaTotal||0) - Math.max(0, a.slaLeft||0))} of ${a.slaTotal||0} days used`);

      // Applicant Grid
      const applicantFields = [
          {k:'Full Name', v:a.citizen}, {k:'Aadhaar', v:a.aadhaar || 'XXXX XXXX 0000'},
          {k:'Date of Birth', v:a.dob || '—'}, {k:'Gender', v:a.gender || '—'},
          {k:'Mobile', v:a.phone}, {k:'Address', v:a.address || '—'},
      ];
      const appGrid = document.getElementById('applicantGrid');
      if (appGrid) {
        appGrid.innerHTML = applicantFields.map(f => `
            <div>
                <div class="detail-field-label">${f.k}</div>
                <div class="detail-field-value">${f.v}</div>
            </div>
        `).join('');
      }

      // Service-specific fields
      const svcFields = buildServiceFields(a);
      setTC('serviceInfoTitle', `${a.service} — Details`);
      const svcGrid = document.getElementById('serviceGrid');
      if (svcGrid) {
        svcGrid.innerHTML = svcFields.map(f => `
            <div>
                <div class="detail-field-label">${f.k}</div>
                <div class="detail-field-value">${f.v}</div>
            </div>
        `).join('');
      }

      // Documents
      const rawDocs = (a.documents && a.documents.length) ? a.documents : (a.docs && Array.isArray(a.docs)) ? a.docs : [];
      if (rawDocs.length > 0 && typeof rawDocs[0] === 'object') {
          setTC('docCountBadge', `${rawDocs.length} files`);
          const pdfBg = '#eff6ff', pdfCol = '#1d4ed8', imgBg = '#f0fdf4', imgCol = '#166534';
          const docsBody = document.getElementById('docsBody');
          if (docsBody) {
            docsBody.innerHTML = rawDocs.map(d => {
              const fileUrl = d.path ? `http://localhost:3000/${d.path.replace(/\\/g, '/').replace(/^\/+/, '')}` : '';
              const viewAction = fileUrl 
                ? `window.open('${fileUrl}', '_blank')`
                : `window.showToast&&window.showToast('No physical file attached for ${d.name} (sample record).','warning')`;
              const downloadAction = fileUrl
                ? `<button class="btn btn-outline btn-sm" onclick="downloadFile('${fileUrl}', '${d.name}')" title="Download copy">↓</button>`
                : `<button class="btn btn-outline btn-sm" onclick="window.showToast&&window.showToast('Sample file cannot be downloaded.','warning')">↓</button>`;

              return `
                <div class="doc-row">
                    <div class="doc-icon" style="background:${d.name?.endsWith('pdf')?pdfBg:imgBg};color:${d.name?.endsWith('pdf')?pdfCol:imgCol};">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            ${d.name?.endsWith('pdf')
                                ?'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>'
                                :'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>'}
                        </svg>
                    </div>
                    <div>
                        <div class="doc-name">${d.name}</div>
                        <div class="doc-size">${d.type || 'Document'} · ${d.size || '—'}</div>
                    </div>
                    <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="${viewAction}">View</button>
                    ${downloadAction}
                </div>`;
            }).join('');
          }
      } else if (a.docs && typeof a.docs === 'number') {
          // Fallback if data just had a number of docs
          setTC('docCountBadge', `${a.docs} files`);
          const defaultDocs = ['Aadhaar Card.pdf','Ration Card / Utility Bill.jpg','Income Proof.pdf','Self-Declaration.pdf'].slice(0,a.docs);
          const docsBody = document.getElementById('docsBody');
          if (docsBody) {
            docsBody.innerHTML = defaultDocs.map(d => `
                <div class="doc-row">
                    <div class="doc-icon" style="background:#eff6ff;color:#1d4ed8;"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg></div>
                    <div><div class="doc-name">${d}</div><div class="doc-size">Document · ~400 KB</div></div>
                    <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="window.showToast('Opening document…','info')">View</button>
                </div>
            `).join('');
          }
      } else {
        const docsBody = document.getElementById('docsBody');
        if (docsBody) docsBody.innerHTML = '<div style="padding:var(--space-md);color:var(--color-text-muted);">No documents available.</div>';
      }
      // Citizen Response
      const crBlock = document.getElementById('citizenResponseBlock');
      const crText = document.getElementById('citizenResponseText');
      if (crBlock && crText) {
          if (a.citizenResponse) {
              crBlock.style.display = 'block';
              crText.innerHTML = `&ldquo;${a.citizenResponse}&rdquo;`;
          } else {
              crBlock.style.display = 'none';
          }
      }

      // Checklist
      window.renderChecklist(a);

      // History
      const histEl = document.getElementById('historyTl');
      if (histEl) {
        if (a.history && a.history.length) {
          histEl.innerHTML = a.history.map(ev => `
              <div class="history-item">
                  <div class="history-dot" style="background:${dotColors[ev.dot]||'var(--slate-400)'};">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="${dotIcons[ev.dot]||'M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0'}"/>
                      </svg>
                  </div>
                  <div class="history-label">${ev.label}</div>
                  <div class="history-ts">${ev.ts}</div>
                  ${ev.detail?`<div class="history-detail">${ev.detail}</div>`:''}
              </div>
          `).join('');
        } else {
          histEl.innerHTML = '<div style="color:var(--color-text-muted);font-size:0.875rem;">No history available.</div>';
        }
      }

      // Queue nav
      const qNav = document.getElementById('queueNavList');
      if (qNav) {
        qNav.innerHTML = myApps.map((q, qi) => {
            const pip = q.slaLeft < 0 ? 'var(--red-500)' : q.slaLeft <= 2 ? 'var(--amber-400)' : '#10b981';
            return `<div class="queue-nav-item ${qi===idx?'current':''}" onclick="window.loadApp(${qi})">
                <div class="priority-pip" style="background:${pip};"></div>
                <div>
                    <div class="queue-nav-id">${q.id}</div>
                    <div class="queue-nav-name">${q.service} · ${(q.citizen||'').split(' ')[0]}</div>
                </div>
                <span class="badge ${q.status==='breach'?'badge-danger':q.status==='urgent'?'badge-danger':q.status==='review'?'badge-warning':'badge-info'}" style="font-size:0.65rem;">${q.status==='breach'?'Breach':q.status==='urgent'?'Urgent':q.status==='review'?'Review':'New'}</span>
            </div>`;
        }).join('');
        const qCountSpan = document.querySelector('.queue-nav-header span:last-child');
        if (qCountSpan) qCountSpan.textContent = `${myApps.length} application${myApps.length === 1 ? '' : 's'}`;
      }

      // Reset decision
      window.selectDecision('approve');
  };

  function buildServiceFields(a) {
      // First try to pull from master app (for newly submitted apps)
      const merged = a; // Already contains full data from backend

      const base = [{k:'Service Type', v: merged.service || merged.serviceName || '—'}];

      // Personal details visible to officer
      if (merged.guardianName) base.push({k:'Father / Husband Name', v: merged.guardianName});
      const addr = merged.address || [merged.street, merged.village, merged.mandal, merged.district, merged.state, merged.pincode].filter(Boolean).join(', ');
      if (addr) base.push({k:'Full Address', v: addr});

      // Purpose / service-specific info
      if (merged.purpose) base.push({k:'Purpose', v: merged.purpose});
      else if (merged.remarks) base.push({k:'Purpose / Remarks', v: merged.remarks});

      // Service-specific details — all service types
      if (merged.income) base.push({k:'Annual Income (₹)', v:'₹'+merged.income}, {k:'Occupation', v:merged.occupation||'—'}, {k:'Income Source', v:merged.incomeSource||'—'});
      if (merged.community) base.push({k:'Community/Caste', v:merged.community}, {k:'Category', v:merged.category||'—'}, {k:'Religion', v:merged.religion||'—'});
      if (merged.duration) base.push({k:'Duration of Stay', v:merged.duration+' years'}, {k:'Residence Type', v:merged.residenceType||'—'});
      if (merged.recordType) base.push({k:'Record Type', v:merged.recordType}, {k:'Record No.', v:merged.recordNo||'—'}, {k:'Incorrect Name', v:merged.incorrect||'—'}, {k:'Correct Name', v:merged.correct||'—'}, {k:'Reason', v:merged.reason||'—'});
      if (merged.eventName) base.push({k:'Event Name', v:merged.eventName}, {k:'Event Type', v:merged.eventType||'—'}, {k:'Event Date', v:merged.eventDate||'—'}, {k:'Duration', v:merged.eventDuration ? merged.eventDuration+' hrs' : '—'}, {k:'Venue', v:merged.venueAddress||'—'}, {k:'Expected Attendance', v:merged.attendance||'—'});
      if (merged.businessName) base.push({k:'Business Name', v:merged.businessName}, {k:'Business Type', v:merged.businessType||'—'}, {k:'Business Address', v:merged.businessAddress||'—'}, {k:'Ownership Type', v:merged.ownershipType||'—'});
      if (merged.landHolding) base.push({k:'Land Holding (acres)', v:merged.landHolding}, {k:'Survey No.', v:merged.surveyNo||'—'}, {k:'Bank Account', v:merged.bankAccount||'—'}, {k:'IFSC Code', v:merged.ifsc||'—'});
      if (merged.courseName) base.push({k:'Course Name', v:merged.courseName}, {k:'Institution', v:merged.institution||'—'}, {k:'Admission Year', v:merged.admissionYear||'—'}, {k:'Annual Tuition Fee', v:merged.tuitionFee ? '₹'+merged.tuitionFee : '—'});

      // Documents info
      if (merged.documents?.length) {
        base.push({k:'Documents Submitted', v: merged.documents.map(d=>d.name).join(', ')});
      }

      // Payment info
      base.push({k:'Fee Paid', v: merged.fee > 0 ? '₹'+merged.fee+' ('+merged.paymentMethod+')' : 'Free'});
      base.push({k:'Submitted On', v: merged.submittedDate ? new Date(merged.submittedDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : a.submitted || '—'});

      return base;
  }


  window.renderChecklist = function(a) {
      if (!a.checklist) return;
      const done = Object.values(checkState).filter(Boolean).length;
      setTC('checkProgress', `${done} / ${a.checklist.length} done`);
      const body = document.getElementById('checklistBody');
      if (body) {
        body.innerHTML = a.checklist.map((c, i) => `
            <div class="check-item">
                <div class="check-toggle ${checkState[i]?'checked':''}" onclick="window.toggleCheck(${i})">
                    <svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>
                </div>
                <span class="check-label ${checkState[i]?'done':''}">${c}</span>
            </div>
        `).join('');
      }
  };

  window.toggleCheck = function(i) {
      checkState[i] = !checkState[i];
      window.renderChecklist(myApps[currentIdx]);
  };

  /* ── Decision Logic ── */
  window.selectDecision = function(type) {
      currentDecision = type;
      ['approve','query','reject'].forEach(t => {
          const el = document.getElementById('dec-'+t);
          if (el) el.className = 'decision-card' + (t===type ? ` selected-${t}` : '');
      });
      document.getElementById('rejectPanel')?.classList.toggle('show', type==='reject');
      document.getElementById('queryPanel')?.classList.toggle('show', type==='query');

      const cta = document.getElementById('submitCta');
      const label = document.getElementById('ctaLabel');
      if (!cta || !label) return;
      
      if (type === 'approve') {
          cta.className = 'submit-cta cta-approve';
          label.textContent = 'Approve & Issue Certificate';
      } else if (type === 'query') {
          cta.className = 'submit-cta cta-query';
          label.textContent = 'Send Query to Citizen';
      } else {
          cta.className = 'submit-cta cta-reject';
          label.textContent = 'Reject Application';
      }
  };

  window.submitDecision = function() {
      const a = myApps[currentIdx];
      if (currentDecision === 'reject' && !document.getElementById('rejectReason')?.value) {
          window.showToast('Please select a rejection reason.', 'warning');
          return;
      }
      if (currentDecision === 'query' && !document.getElementById('queryText')?.value.trim()) {
          window.showToast('Please enter the query text for the citizen.', 'warning');
          return;
      }

      const confirmData = {
          approve: { icon:'#d1fae5', iconStroke:'#10b981', iconPath:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title:'Confirm Approval', msg:`You are about to approve application <strong>${a.id}</strong>. A certificate will be issued and the citizen notified.`, btnBg:'#10b981', btnLabel:'Confirm Approval' },
          query: { icon:'#fffbeb', iconStroke:'var(--amber-500)', iconPath:'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', title:'Send Query', msg:`A query will be sent to ${a.citizen} via SMS and portal. They have 3 days to respond.`, btnBg:'var(--amber-400)', btnLabel:'Send Query' },
          reject: { icon:'#fef2f2', iconStroke:'var(--red-500)', iconPath:'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', title:'Confirm Rejection', msg:`You are about to reject <strong>${a.id}</strong>. The citizen will be notified with the reason.`, btnBg:'var(--red-500)', btnLabel:'Confirm Rejection' },
      };
      const cd = confirmData[currentDecision];
      
      const confirmIcon = document.getElementById('confirmIcon');
      if (confirmIcon) {
        confirmIcon.style.background = cd.icon;
        const svg = confirmIcon.querySelector('svg');
        if (svg) svg.style.stroke = cd.iconStroke;
        const path = confirmIcon.querySelector('path, polyline');
        if (path) path.setAttribute('d', cd.iconPath);
      }
      setTC('confirmTitle', cd.title);
      const msgEl = document.getElementById('confirmMsg');
      if (msgEl) msgEl.innerHTML = cd.msg;
      setTC('confirmAppId', a.id);
      
      const confirmBtn = document.getElementById('confirmBtn');
      if (confirmBtn) {
        confirmBtn.style.background = cd.btnBg;
        if (confirmBtn.lastChild && confirmBtn.lastChild.nodeType === 3) confirmBtn.lastChild.textContent = ' ' + cd.btnLabel;
      }
      document.getElementById('confirmModal')?.classList.add('active');
  };

  window.finalSubmit = async function() {
      window.closeModal('confirmModal');
      const a = myApps[currentIdx];
      if (!a) return;

      const msgs = {
          approve: 'Application approved! Sent to Supervisor for final approval. Citizen notified.',
          query: 'Query sent to citizen via SMS and portal notification.',
          reject: 'Application rejected. Citizen notified with reason provided.',
      };
      
      const rejectReason = document.getElementById('rejectReason')?.value || 'Reason not specified';
      const queryText = document.getElementById('queryText')?.value?.trim() || '';

      const statusMap = {
          approve: 'approved',
          reject: 'rejected',
          query: 'query'
      };

      const payload = {
          status: statusMap[currentDecision],
          remarks: currentDecision === 'query' ? queryText : (currentDecision === 'reject' ? rejectReason : 'Approved by Officer')
      };

      try {
          await apiUpdateApplicationStatus(a.id, payload);
          window.showToast(msgs[currentDecision], currentDecision==='approve'?'success':currentDecision==='reject'?'warning':'info');
          
          // Re-fetch queue
          const { apiGetOfficerQueue } = await import('./api.js');
          const res = await apiGetOfficerQueue();
          officerQueue = res.data || [];
          officerQueue = officerQueue.map(app => ({
              ...app,
              docs: app.documents ? app.documents.map(d => ({ name: d.name, size: '—', type: d.type, icon: d.name.endsWith('pdf') ? 'pdf' : 'img' })) : [],
              history: app.timeline ? app.timeline.map(t => ({ label: t.action, ts: formatDateTime(t.date), detail: t.note, dot: 'review' })) : []
          }));
          myApps = officerQueue.filter(a => !['approved', 'rejected', 'completed'].includes(a.status));
          
          // Auto-advance
          setTimeout(() => {
              if (myApps.length === 0) {
                  window.loadApp(0);
              } else {
                  let nextIdx = currentIdx >= myApps.length ? myApps.length - 1 : currentIdx;
                  window.loadApp(nextIdx);
              }
          }, 1200);

      } catch(e) {
          window.showToast(e.message, 'error');
      }
  };

  window.navApp = function(dir) {
      const next = currentIdx + dir;
      if (next >= 0 && next < myApps.length) window.loadApp(next);
  };
  
  window.closeModal = window.closeModal || function(id) { document.getElementById(id)?.classList.remove('active'); };

  /* ── URL param support ── */
  const searchParams = new URLSearchParams(window.location.search);
  const urlId = searchParams.get('id');
  let startIdx = 0;
  
  if (urlId) {
      // Look in filtered pending list first
      const pendingIdx = myApps.findIndex(a => a.id === urlId);
      if (pendingIdx !== -1) {
          startIdx = pendingIdx;
      } else {
          // Look in full officer queue (could be already approved/rejected)
          const fullApp = officerQueue.find(a => a.id === urlId);
          if (fullApp) {
              // Add it to myApps temporarily if it's missing (so it can be loaded)
              myApps.push(fullApp);
              startIdx = myApps.length - 1;
          }
      }
  }
  
  window.loadApp(startIdx);

  const action = searchParams.get('action');
  if (action && window.selectDecision) {
    setTimeout(() => window.selectDecision(action), 0);
  }
}

// ── Helper ──
function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ══════════════════════════════════════════
// Auto-init based on data-page attribute
// ══════════════════════════════════════════

// ── Certificate Download Generator ──
window.downloadDigitalCertificate = function(app) {
  if (!app) return;
  const certWindow = window.open('', '_blank');
  if (!certWindow) {
    if (window.showToast) window.showToast('Popup blocked. Please allow popups to view certificate.', 'warning');
    return;
  }
  const certHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Certificate - ${app.serviceName || app.service || 'Service'} (${app.id})</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; text-align: center; }
      .cert-container { max-width: 750px; margin: 0 auto; background: white; border: 12px double #1e3a8a; padding: 40px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
      .emblem { font-size: 3rem; margin-bottom: 10px; }
      .title { font-size: 1.8rem; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
      .sub { font-size: 0.95rem; color: #64748b; margin-top: 5px; }
      .details-table { width: 100%; border-collapse: collapse; margin: 25px 0; text-align: left; }
      .details-table td { padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 0.95rem; }
      .details-table td:first-child { font-weight: bold; background: #f1f5f9; width: 35%; }
      .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
      .sign { text-align: center; }
      .sign-line { width: 180px; border-bottom: 1px solid #0f172a; margin-bottom: 6px; }
      .qr-mock { width: 70px; height: 70px; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; }
      @media print { body { background: white; padding: 0; } .cert-container { box-shadow: none; border-color: #000; } button { display: none; } }
    </style>
  </head>
  <body>
    <div class="cert-container">
      <div class="header">
        <div class="emblem">🏛️</div>
        <div class="title">Government of Telangana</div>
        <div class="sub">Unified Citizen Service & Delivery Platform — DigiConnect</div>
      </div>
      <h2 style="color:#047857; margin:0 0 15px;">OFFICIAL CERTIFICATE</h2>
      <p style="color:#64748b; font-size:0.9rem;">Application Reference ID: <strong>${app.id}</strong></p>
      
      <table class="details-table">
        <tr><td>Service Name</td><td><strong>${app.serviceName || app.service || 'Citizen Service'}</strong></td></tr>
        <tr><td>Applicant Name</td><td><strong>${app.citizenName || app.citizen || 'Citizen'}</strong></td></tr>
        <tr><td>Department</td><td>${app.dept || 'Government Department'}</td></tr>
        <tr><td>Jurisdiction / Mandal</td><td>${app.jurisdiction || 'Secunderabad'}</td></tr>
        <tr><td>Approval Date</td><td>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
        <tr><td>Issuing Officer</td><td>${app.officerName || app.officer || 'Competent Authority'}</td></tr>
        <tr><td>Status</td><td><span style="color:#047857; font-weight:bold;">Digitally Verified & Approved</span></td></tr>
      </table>

      <div class="footer">
        <div class="qr-mock">DIGITAL QR<br>VERIFIED</div>
        <div class="sign">
          <div class="sign-line"></div>
          <div style="font-size:0.85rem; font-weight:bold;">${app.officerName || app.officer || 'Competent Authority'}</div>
          <div style="font-size:0.75rem; color:#64748b;">${app.dept || 'Government Authority'}</div>
        </div>
      </div>

      <div style="margin-top:30px;">
        <button onclick="window.print()" style="padding:10px 24px; background:#1e3a8a; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">🖨️ Print / Save as PDF</button>
      </div>
    </div>
  </body>
  </html>
  `;
  certWindow.document.write(certHtml);
  certWindow.document.close();
};

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  switch (page) {
    case 'apply-service': initApplyService(); break;
    case 'my-applications': initMyApplications(); break;
    case 'track-application': initTrackApplication(); break;
    case 'review-application': initReviewApplication(); break;
  }
});


