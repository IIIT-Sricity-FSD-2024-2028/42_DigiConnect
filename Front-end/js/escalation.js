// ═══════════════════════════════════════════
// escalation.js — SLA monitoring & Supervisor page controllers
// ═══════════════════════════════════════════

import { getApplications, setApplications, getGrievances, getUsers, getSession, getSuperEscSlaCases, setSuperEscSlaCases, getSuperApprovals, setSuperApprovals, getSuperApprovedToday, setSuperApprovedToday } from './state.js';
import { initPage } from './navigation.js';
import { showToast, formatDate, formatDateTime, openModal, closeModal, generateId } from './utils.js';
import { renderNotifPanel } from './notifications.js';
import { SUPER_ESC_SLA_CASES, SUPER_ESC_GRIEVANCE_CASES, SUPER_OFFICER_APPROVED, SUPER_TEAM, SUPER_PENDING_APPS } from './mock-data.js';

/**
 * Check SLA status of an application
 * @param {object} app
 * @returns {object} { status: 'ok'|'warning'|'breach', daysLeft, text }
 */
export function checkSLA(app) {
  if (!app.slaDate) return { status: 'ok', daysLeft: null, text: 'No SLA' };
  const now = new Date();
  const sla = new Date(app.slaDate);
  const diffMs = sla - now;
  const daysLeft = Math.ceil(diffMs / 86400000);

  if (app.status === 'approved' || app.status === 'rejected' || app.status === 'resolved') {
    return { status: 'ok', daysLeft, text: 'Completed' };
  }
  if (daysLeft < 0) return { status: 'breach', daysLeft, text: `${Math.abs(daysLeft)} days overdue` };
  if (daysLeft <= 2) return { status: 'warning', daysLeft, text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` };
  return { status: 'ok', daysLeft, text: `${daysLeft} days left` };
}

/**
 * Get all applications that are breaching or near-breach SLA
 * @returns {Array}
 */
export function getEscalatedApplications() {
  const apps = getApplications();
  return apps.filter(app => {
    const sla = checkSLA(app);
    return sla.status === 'breach' || sla.status === 'warning';
  });
}

// ══════════════════════════════════════════
// Supervisor: Escalated Cases
// ══════════════════════════════════════════

export function initEscalatedCases() {
  const session = initPage({ title: 'Escalated Cases', breadcrumbs: [{ label: 'Supervisor Portal', href: 'supervisor-dashboard.html' }, { label: 'Escalated Cases' }], requiredRole: 'supervisor' });
  if (!session) return;
  renderNotifPanel();

  let activeCards = getSuperEscSlaCases();
  let activeFilter = 'all';

  window.setFilter = function(f, btn) {
    activeFilter = f;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if(btn) btn.classList.add('active');
    renderEscGrid();
  };

  function updateStats() {
    const totalCount = activeCards.length;
    const slaCount = activeCards.filter(c => c.type === 'sla').length;
    const grievanceCount = activeCards.filter(c => c.type === 'grievance').length;
    const urgentCount = activeCards.filter(c => c.urgent).length;

    const elTotal = document.getElementById('stat-total');
    if (elTotal) elTotal.textContent = totalCount;
    const elSla = document.getElementById('stat-sla');
    if (elSla) elSla.textContent = slaCount;
    const elGrievance = document.getElementById('stat-grievance');
    if (elGrievance) elGrievance.textContent = grievanceCount;
    const elUrgent = document.getElementById('stat-urgent');
    if (elUrgent) elUrgent.textContent = urgentCount;

    const chipAll = document.getElementById('chip-all');
    if (chipAll) chipAll.innerHTML = `All Cases (${totalCount})`;
    
    const chipSla = document.getElementById('chip-sla');
    if (chipSla) chipSla.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> SLA Breaches (${slaCount})`;
    
    const chipGrievance = document.getElementById('chip-grievance');
    if (chipGrievance) chipGrievance.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg> Grievance Escalations (${grievanceCount})`;
    
    const chipUrgent = document.getElementById('chip-urgent');
    if (chipUrgent) chipUrgent.innerHTML = `<svg width="12" height="12" fill="none" stroke="var(--red-500)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01"/></svg> Urgent Only (${urgentCount})`;
  }

  function renderEscGrid() {
    let data = activeCards;
    if (activeFilter === 'sla') data = activeCards.filter(c => c.type === 'sla');
    else if (activeFilter === 'grievance') data = activeCards.filter(c => c.type === 'grievance');
    else if (activeFilter === 'urgent') data = activeCards.filter(c => c.urgent);

    const grid = document.getElementById('escGrid');
    const empty = document.getElementById('emptyState');
    if (!grid || !empty) return;

    if (!data.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    grid.innerHTML = data.map(c => {
      const isSla = c.type === 'sla';
      return `
        <div class="esc-card ${isSla ? 'sla-type' : 'grievance-type'}">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:var(--space-sm);">
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
                <span style="font-family:var(--font-mono);font-size:0.8rem;font-weight:800;color:${isSla?'var(--red-600)':'var(--amber-700)'};">${c.id}</span>
                ${isSla ? '<span class="flow-pill sla" style="font-size:0.65rem;">ESCALATED_SLA</span>' : `<span class="badge ${c.badge}" style="font-size:0.65rem;">${c.subtype}</span><span class="flow-pill grievance" style="font-size:0.65rem;">GRIEVANCE_ESCALATED</span>`}
                ${c.urgent ? '<span class="badge badge-danger" style="font-size:0.6rem;animation:pulse 2s infinite;">URGENT</span>' : ''}
              </div>
              <div style="font-size:0.9375rem;font-weight:700;color:var(--navy-900);">${c.service}</div>
              <div style="font-size:0.8rem;color:var(--color-text-muted);">${c.citizen} &middot; Officer: ${c.officer}</div>
            </div>
            ${isSla ? `<span class="badge badge-danger" style="flex-shrink:0;">+${c.overdue} days</span>` : ''}
          </div>

          <div style="background:${isSla?'var(--red-50)':'var(--amber-50)'};border-radius:var(--radius-md);padding:10px 12px;margin-bottom:var(--space-md);">
            <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${isSla?'var(--red-700)':'var(--amber-700)'};margin-bottom:4px;">${isSla?'Escalation Reason':'Grievance Summary'}</div>
            <p style="font-size:0.8125rem;color:var(--slate-700);line-height:1.6;margin:0;">${c.summary}</p>
          </div>

          <div style="font-size:0.72rem;color:var(--color-text-muted);margin-bottom:var(--space-md);">
            ${isSla ? `System auto-escalated on <strong>${c.on}</strong>` : `Escalated by <strong>${c.go}</strong> (Grievance Officer) &middot; ${c.on} &nbsp;|&nbsp; Officer decision: <span style="color:var(--red-600);font-weight:600;">${c.officerDecision}</span>`}
          </div>

          <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
            ${isSla ? `<button class="btn btn-sm btn-success" onclick="quickAct('${c.id}','approve')"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Approve</button><a href="supervisor-review.html?id=${c.id}&mode=escalation" class="btn btn-sm btn-primary">Full Review</a>` : `<a href="supervisor-review.html?id=${c.id}&mode=grievance" class="btn btn-sm btn-primary"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> Investigate &amp; Decide</a>`}
          </div>
        </div>
      `;
    }).join('');
  }

  window.quickAct = function(id, action) {
    showToast(`${id} ${action==='approve'?'approved — certificate issued':'rejected'}. Audit trail updated.`, action==='approve'?'success':'warning');
    activeCards = activeCards.filter(c => c.id !== id);
    setSuperEscSlaCases(activeCards);
    renderEscGrid();
    updateStats();
  };
  
  window.showToast = showToast;

  updateStats();
  renderEscGrid();
}

// ══════════════════════════════════════════
// Supervisor: Override & Review
// ══════════════════════════════════════════

export function initSupervisorReview() {
  const session = initPage({ title: 'Override & Review', breadcrumbs: [{ label: 'Supervisor Portal', href: 'supervisor-dashboard.html' }, { label: 'Override & Review' }], requiredRole: 'supervisor' });
  if (!session) return;
  renderNotifPanel();

  let activeEscalated = getSuperEscSlaCases();  // persisted SLA cases from localStorage
  let activeFinalApprovals = getSuperApprovals();
  let selectedFinal = null, selectedOverride = null;

  const params = new URLSearchParams(location.search);
  const urlId   = params.get('id');
  const urlMode = params.get('mode') || '';

  window.showTab = function(id) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
    history.replaceState(null, '', 'supervisor-review.html');
  };

  // ── Syncs both tab badge counts and card-header badge from live data ──
  function syncReviewBadges() {
    const finalBadge    = document.getElementById('badge-final');
    const overrideBadge = document.getElementById('badge-override');
    const cardBadge     = document.getElementById('badge-escalated-count');
    if (finalBadge)    finalBadge.textContent    = activeFinalApprovals.length;
    if (overrideBadge) overrideBadge.textContent = activeEscalated.length;
    if (cardBadge)     cardBadge.textContent     = activeEscalated.length;
  }

  /** FINAL APPROVAL TAB **/
  window.renderFinalList = function() {
    const list = document.getElementById('finalList');
    if(!list) return;
    list.innerHTML = activeFinalApprovals.map(a => {
      let isSelected = selectedFinal?.id === a.id ? 'selected' : '';
      let slaColor = a.slaLeft <= 2 ? 'var(--red-500)' : a.slaLeft <= 4 ? 'var(--amber-500)' : 'var(--green-600)';
      let slaWarning = a.slaLeft <= 2 ? '&#9888; ' : '';
      return `
      <div class="case-row ${isSelected}" onclick="selectFinal('${a.id}')">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
            <span style="font-family:var(--font-mono);font-size:0.75rem;font-weight:800;color:var(--navy-600);">${a.id}</span>
          </div>
          <div style="font-size:0.8rem;font-weight:600;color:var(--navy-900);">${a.service}</div>
          <div style="font-size:0.7rem;color:var(--color-text-muted);">${a.citizen} &middot; ${a.officer}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:0.72rem;font-weight:700;color:${slaColor};">${slaWarning}${a.slaLeft}d</div>
        </div>
      </div>`;
    }).join('');
    syncReviewBadges();
  };

  window.selectFinal = function(id) {
    selectedFinal = activeFinalApprovals.find(a => a.id === id);
    const breadcrumb = document.getElementById('breadcrumbId');
    if(breadcrumb) breadcrumb.textContent = id;
    window.renderFinalList();
    window.renderFinalDetail();
  };

  window.renderFinalDetail = function() {
    if (!selectedFinal) return;
    const a = selectedFinal;
    const detail = document.getElementById('finalDetail');
    if(!detail) return;
    
    let docsHtml = a.docs.map(d => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--slate-50);border-radius:var(--radius-sm);border:1px solid var(--color-border);">
        <div style="display:flex;align-items:center;gap:8px;">
          <svg width="13" height="13" fill="none" stroke="var(--navy-500)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span style="font-size:0.8rem;">${d}</span>
        </div>
        <button class="btn btn-ghost btn-sm" style="font-size:0.7rem;" onclick="showToast('Document opened.','info')">View</button>
      </div>`
    ).join('');

    let timelineHtml = a.timeline.map(t => {
      let color = t.t === 'success' ? 'var(--green-500)' : t.t === 'warn' ? 'var(--amber-400)' : t.t === 'danger' ? 'var(--red-500)' : 'var(--navy-400)';
      return `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${color};"></div>
        <div>
          <div style="font-size:0.7rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;">${t.d}</div>
          <div style="font-size:0.8125rem;color:var(--slate-700);margin-top:2px;">${t.e}</div>
        </div>
      </div>`;
    }).join('');

    let slaColor = a.slaLeft <= 2 ? 'var(--red-500)' : 'var(--navy-700)';

    detail.innerHTML = `
      <div style="padding:var(--space-lg) var(--space-xl);border-bottom:1px solid var(--color-border);background:var(--green-50);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-family:var(--font-mono);font-size:0.875rem;font-weight:800;color:var(--navy-600);">${a.id}</span>
              <span class="flow-pill approved"><svg width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>OFFICER_APPROVED</span>
            </div>
            <div style="font-size:1.125rem;font-weight:800;color:var(--navy-900);">${a.service}</div>
            <div style="font-size:0.875rem;color:var(--color-text-muted);margin-top:2px;">${a.citizen} &middot; Verified by ${a.officer} (${a.role})</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.5rem;font-weight:800;color:${slaColor};">${a.slaLeft}</div>
            <div style="font-size:0.7rem;font-weight:600;color:var(--color-text-muted);">DAYS LEFT</div>
          </div>
        </div>
      </div>
      <div style="padding:var(--space-xl);display:flex;flex-direction:column;gap:var(--space-xl);">
        <div class="alert alert-info" style="font-size:0.8125rem;">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          You are the final authority. Your decision issues the certificate or closes the application. All decisions are logged in the audit trail.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);">
          <div>
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Application Details</div>
            <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
              <div class="review-row"><span class="review-key">Application ID</span><span class="review-val" style="font-family:var(--font-mono);color:var(--navy-600);">${a.id}</span></div>
              <div class="review-row"><span class="review-key">Service</span><span class="review-val">${a.service}</span></div>
              <div class="review-row"><span class="review-key">Citizen</span><span class="review-val">${a.citizen}</span></div>
              <div class="review-row"><span class="review-key">Submitted</span><span class="review-val">${a.submitted} 2025</span></div>
              <div class="review-row"><span class="review-key">Verified by</span><span class="review-val">${a.officer} (${a.role})</span></div>
              <div class="review-row" style="background:var(--green-50);"><span class="review-key">Officer Decision</span><span class="review-val" style="color:var(--green-600);">Approved &check;</span></div>
            </div>
          </div>
          <div>
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Documents</div>
            <div style="display:flex;flex-direction:column;gap:6px;">${docsHtml}</div>
          </div>
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Officer's Verification Note</div>
          <div style="background:var(--green-50);border:1px solid var(--green-200);border-radius:var(--radius-md);padding:var(--space-md);">
            <p style="font-size:0.875rem;color:var(--slate-700);line-height:1.6;margin:0;">${a.officerNote}</p>
          </div>
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Application History</div>
          <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-md);">${timelineHtml}</div>
        </div>
        <div style="background:var(--navy-50);border:1px solid var(--navy-100);border-radius:var(--radius-lg);padding:var(--space-lg);">
          <div style="font-size:0.875rem;font-weight:800;color:var(--navy-900);margin-bottom:var(--space-lg);">Your Final Decision</div>
          <div class="form-group" style="margin-bottom:var(--space-md);">
            <label class="form-label">Decision Remarks <span style="font-weight:400;color:var(--color-text-muted);">(optional for approval, required for rejection)</span></label>
            <textarea class="form-textarea" id="finalRemarks" rows="3" placeholder="Add remarks to be recorded in the audit trail…"></textarea>
          </div>
          <div style="display:flex;gap:var(--space-sm);justify-content:flex-end;">
            <button class="btn btn-danger" onclick="submitFinal('reject')">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Reject Application
            </button>
            <button class="btn btn-success" onclick="submitFinal('approve')">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Approve — Issue Certificate
            </button>
          </div>
        </div>
      </div>`;
  };

  window.submitFinal = function(action) {
    const el = document.getElementById('finalRemarks');
    const remarks = el ? el.value : '';
    if (action === 'reject' && (!remarks || remarks.trim().length < 5)) {
      showToast('Rejection requires remarks (min 5 characters).', 'warning'); return;
    }
    const msgs = {
      approve: `${selectedFinal.id} approved. Certificate issued to ${selectedFinal.citizen}. Status → APPROVED. Audit trail updated.`,
      reject:  `${selectedFinal.id} rejected. ${selectedFinal.citizen} notified. Status → REJECTED. Audit trail updated.`
    };
    showToast(msgs[action], action === 'approve' ? 'success' : 'warning');
    setTimeout(() => {
      activeFinalApprovals = activeFinalApprovals.filter(a => a.id !== selectedFinal.id);
      setSuperApprovals(activeFinalApprovals);
      if (action === 'approve') {
          setSuperApprovedToday(getSuperApprovedToday() + 1);
      }
      selectedFinal = null;
      window.renderFinalList();
      syncReviewBadges();
      const det = document.getElementById('finalDetail');
      if(det) det.innerHTML = '<div class="detail-empty"><div style="color:var(--green-500);font-size:1rem;font-weight:700;">Decision recorded successfully. Please select another application from the list.</div></div>';
    }, 1500);
  };

  /** OVERRIDE ESCALATION TAB **/
  window.renderOverrideList = function() {
    const list = document.getElementById('overrideList');
    if(!list) return;
    list.innerHTML = activeEscalated.map(e => {
      const isSla = e.type === 'sla';
      const isSelected = selectedOverride?.id === e.id ? 'selected' : '';
      const typeClass = isSla ? 'sla-type' : 'grievance-type';
      const idColor = isSla ? 'var(--red-600)' : 'var(--amber-700)';
      
      const urgentDot = e.urgent ? '<span style="width:7px;height:7px;border-radius:50%;background:var(--red-500);flex-shrink:0;animation:pulse 2s infinite;"></span>' : '';
      const tagHtml = isSla 
        ? `<span style="font-size:0.6rem;background:var(--red-100);color:var(--red-700);padding:1px 6px;border-radius:8px;font-weight:700;">SLA +${e.overdue}d</span>`
        : `<span style="font-size:0.6rem;background:var(--amber-100);color:var(--amber-700);padding:1px 6px;border-radius:8px;font-weight:700;">${e.subtype}</span>`;

      return `
      <div class="case-row ${typeClass} ${isSelected}" onclick="selectOverride('${e.id}')">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
            <span style="font-family:var(--font-mono);font-size:0.72rem;font-weight:800;color:${idColor};">${e.id}</span>
            ${urgentDot}
          </div>
          <div style="font-size:0.8rem;font-weight:600;color:var(--navy-900);">${e.service}</div>
          <div style="font-size:0.7rem;color:var(--color-text-muted);">${e.citizen}</div>
          <div style="margin-top:4px;">${tagHtml}</div>
        </div>
      </div>`;
    }).join('');
    syncReviewBadges();
  };

  window.selectOverride = function(id) {
    selectedOverride = activeEscalated.find(e => e.id === id);
    const bc = document.getElementById('breadcrumbId');
    if(bc) bc.textContent = id;
    window.renderOverrideList();
    window.renderOverrideDetail();
  };

  window.renderOverrideDetail = function() {
    if (!selectedOverride) return;
    const e = selectedOverride;
    const isSla = e.type === 'sla';
    const accentColor = isSla ? 'var(--red-600)' : 'var(--amber-700)';
    const detail = document.getElementById('overrideDetail');
    if(!detail) return;

    let tagLineHtml = isSla 
      ? '<span style="background:var(--red-100);color:var(--red-700);padding:2px 8px;border-radius:8px;font-size:0.7rem;font-weight:700;">ESCALATED_SLA</span>'
      : `<span class="badge badge-warning" style="font-size:0.7rem;">${e.subtype}</span><span style="background:var(--amber-100);color:var(--amber-700);padding:2px 8px;border-radius:8px;font-size:0.7rem;font-weight:700;">GRIEVANCE_ESCALATED</span>`;
    
    let urgentBadge = e.urgent ? '<span class="badge badge-danger" style="font-size:0.62rem;animation:pulse 2s infinite;">URGENT</span>' : '';
    let overdueBlock = isSla ? `<div style="text-align:right;"><div style="font-size:1.5rem;font-weight:800;color:var(--red-500);">+${e.overdue}</div><div style="font-size:0.7rem;color:var(--red-500);font-weight:600;">DAYS OVERDUE</div></div>` : '';

    let officerDecisionClass = isSla ? 'var(--slate-500)' : 'var(--red-600)';

    let docsHtml = e.docs.map(d => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--slate-50);border-radius:var(--radius-sm);border:1px solid var(--color-border);">
        <span style="font-size:0.8rem;">${d}</span>
        <button class="btn btn-ghost btn-sm" style="font-size:0.7rem;" onclick="showToast('Document opened.','info')">View</button>
      </div>`
    ).join('');

    let timelineHtml = e.timeline.map(t => {
      let color = t.t === 'danger' ? 'var(--red-500)' : t.t === 'warn' ? 'var(--amber-400)' : 'var(--navy-400)';
      return `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${color};"></div>
        <div>
          <div style="font-size:0.7rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;">${t.d}</div>
          <div style="font-size:0.8125rem;color:var(--slate-700);margin-top:2px;">${t.e}</div>
        </div>
      </div>`;
    }).join('');

    let misconductWarning = (e.type === 'grievance' && e.subtype === 'Misconduct Complaint')
      ? `<div class="alert alert-danger" style="margin-bottom:var(--space-md);font-size:0.8125rem;">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> 
          <strong>Misconduct complaint active.</strong> Application must be reassigned to a different officer pending investigation.
        </div>` : '';

    let reassignOptions = SUPER_TEAM.filter(o => o.name !== e.officer).map(o => `<option value="${o.name}">${o.name} (${o.role}) &mdash; ${o.pending} pending</option>`).join('');
    
    let approveRejectBtns = (e.type !== 'grievance' || e.subtype !== 'Misconduct Complaint') 
      ? (`<button class="btn btn-success" onclick="submitOverride('approve')"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Override — Approve</button>
         <button class="btn btn-danger" onclick="submitOverride('reject')"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Override — Reject</button>`) : '';

    let reassignText = (e.type === 'grievance' && e.subtype === 'Misconduct Complaint') ? 'Reassign & Investigate' : 'Reassign';

    detail.innerHTML = `
      <div style="padding:var(--space-lg) var(--space-xl);border-bottom:1px solid var(--color-border);background:${isSla?'var(--red-50)':'var(--amber-50)'};">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
              <span style="font-family:var(--font-mono);font-size:0.875rem;font-weight:800;color:${accentColor};">${e.id}</span>
              ${tagLineHtml} ${urgentBadge}
            </div>
            <div style="font-size:1.125rem;font-weight:800;color:var(--navy-900);">${e.service}</div>
            <div style="font-size:0.875rem;color:var(--color-text-muted);margin-top:2px;">${e.citizen} &middot; ${e.officer} ${isSla ? '' : ' &middot; Escalated by ' + e.go}</div>
          </div>
          ${overdueBlock}
        </div>
      </div>
      <div style="padding:var(--space-xl);display:flex;flex-direction:column;gap:var(--space-xl);">
        <div class="alert alert-warning" style="font-size:0.8125rem;">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          All supervisor override decisions are <strong>permanently recorded</strong> in the audit trail.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);">
          <div>
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Case Details</div>
            <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
              <div class="review-row"><span class="review-key">Application</span><span class="review-val" style="font-family:var(--font-mono);color:var(--navy-600);">${e.id}</span></div>
              <div class="review-row"><span class="review-key">Service</span><span class="review-val">${e.service}</span></div>
              <div class="review-row"><span class="review-key">Citizen</span><span class="review-val">${e.citizen}</span></div>
              <div class="review-row"><span class="review-key">Officer</span><span class="review-val">${e.officer}</span></div>
              ${isSla ? ('<div class="review-row" style="background:var(--red-50);"><span class="review-key">Days Overdue</span><span class="review-val" style="color:var(--red-500);">+' + e.overdue + ' days</span></div>') : ''}
              <div class="review-row"><span class="review-key">Officer Decision</span><span class="review-val" style="color:${officerDecisionClass};">${e.officerDecision}</span></div>
            </div>
          </div>
          <div>
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Documents</div>
            <div style="display:flex;flex-direction:column;gap:6px;">${docsHtml}</div>
          </div>
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Escalation Summary</div>
          <div style="background:${isSla?'var(--red-50)':'var(--amber-50)'};border:1px solid ${isSla?'var(--red-200)':'var(--amber-200)'};border-radius:var(--radius-md);padding:var(--space-md);">
            <p style="font-size:0.875rem;color:var(--slate-700);line-height:1.7;margin:0;">${e.summary}</p>
          </div>
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Case History</div>
          <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-md);">${timelineHtml}</div>
        </div>
        <div style="background:var(--navy-50);border:1px solid var(--navy-100);border-radius:var(--radius-lg);padding:var(--space-lg);">
          <div style="font-size:0.875rem;font-weight:800;color:var(--navy-900);margin-bottom:var(--space-lg);">Supervisor Override Decision</div>
          ${misconductWarning}
          <div class="form-group" style="margin-bottom:var(--space-md);">
            <label class="form-label">Reassign to Officer ${(e.type==='grievance'&&e.subtype==='Misconduct Complaint'?'<span class="required">*</span>':'<span style="font-weight:400;color:var(--color-text-muted);">(optional)</span>')}</label>
            <select class="form-select" id="overrideReassignOfficer">
              <option value="">Keep current officer (${e.officer})</option>
              ${reassignOptions}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:var(--space-lg);">
            <label class="form-label">Override Justification <span class="required">*</span></label>
            <textarea class="form-textarea" id="overrideJustification" rows="4" placeholder="State the basis for this supervisor override. This is mandatory and permanently logged…"></textarea>
          </div>
          <div style="display:flex;gap:var(--space-sm);justify-content:flex-end;flex-wrap:wrap;">
            ${approveRejectBtns}
            <button class="btn btn-outline" onclick="submitOverride('reassign')"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> ${reassignText}</button>
          </div>
        </div>
      </div>`;
  };

  window.submitOverride = function(action) {
    if (action === 'reassign' && selectedOverride) {
      const offEl = document.getElementById('overrideReassignOfficer');
      const offName = offEl ? offEl.value : '';
      // Do NOT remove from localStorage here — removal happens only on Confirm Reassignment in workload-management
      let url = `workload-management.html?reassignId=${selectedOverride.id}`;
      if (offName) url += `&targetOfficer=${encodeURIComponent(offName)}`;
      window.location.href = url;
      return;
    }
    const el = document.getElementById('overrideJustification');
    const j = el ? el.value : '';
    if (!j || j.trim().length < 10) { showToast('Justification required (min 10 characters).', 'warning'); return; }
    const msgs = {
      approve:  `Override applied: ${selectedOverride.id} approved. Certificate issued. Audit trail updated.`,
      reject:   `Override applied: ${selectedOverride.id} rejected. Citizen notified. Audit trail updated.`,
      reassign: `${selectedOverride.id} reassigned. Both officers notified.`
    };
    showToast(msgs[action], action === 'approve' ? 'success' : 'warning');
    // Persist removal to localStorage so dashboard stat also stays in sync
    activeEscalated = activeEscalated.filter(e => e.id !== selectedOverride.id);
    setSuperEscSlaCases(activeEscalated);
    selectedOverride = null;
    syncReviewBadges();
    setTimeout(() => {
      window.renderOverrideList();
      const det = document.getElementById('overrideDetail');
      if(det) det.innerHTML = '<div class="detail-empty"><div style="color:var(--green-500);font-size:1rem;font-weight:700;">Decision recorded successfully. Please select another application.</div></div>';
    }, 1500);
  };

  const initMode = urlMode || 'final';
  if (initMode === 'final' || initMode === '') window.showTab('final');
  else window.showTab('override');

  if (urlId) {
    if (initMode === 'final') window.selectFinal(urlId);
    else window.selectOverride(urlId);
  }

  window.renderFinalList();
  window.renderOverrideList();
  window.showToast = showToast;
}

// ══════════════════════════════════════════
// Supervisor: Workload Management
// ══════════════════════════════════════════

export function initWorkloadManagement() {
  const session = initPage({ title: 'Workload Management', breadcrumbs: [{ label: 'Supervisor Portal', href: 'supervisor-dashboard.html' }, { label: 'Workload Management' }], requiredRole: 'supervisor' });
  if (!session) return;
  renderNotifPanel();

  // Derive app list from the same source as Override/Escalation tab
  function escToApp(e) {
    return { id: e.id, service: e.service, citizen: e.citizen, officer: e.officer, slaLeft: e.type === 'sla' ? -(e.overdue || 0) : 0 };
  }

  let displayReassignApps = getSuperEscSlaCases().map(escToApp);
  let selectedReassignApp   = null;
  let selectedTargetOfficer = null;

  const params = new URLSearchParams(location.search);
  const reassignId   = params.get('reassignId');
  const targetOfficer = params.get('targetOfficer');

  /* ── Workload bars ── */
  function renderWorkload() {
    const list = document.getElementById('workloadList');
    if (!list) return;
    const max = Math.max(...SUPER_TEAM.map(o => o.pending));
    list.innerHTML = SUPER_TEAM.map(o => `
      <div style="display:flex;gap:var(--space-md);align-items:center;padding:12px 20px;border-bottom:1px solid var(--slate-100);">
        <div class="avatar" style="width:36px;height:36px;font-size:0.75rem;background:var(--navy-600);flex-shrink:0;">${o.initials}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:0.875rem;font-weight:600;">${o.name}</span>
            <span style="font-size:0.75rem;font-weight:700;color:${o.pending>25?'var(--red-600)':o.pending>15?'var(--amber-600)':'var(--green-600)'};">${o.pending} pending</span>
          </div>
          <div class="sla-bar" style="height:6px;">
            <div style="height:100%;border-radius:3px;background:${o.pending>25?'var(--red-400)':o.pending>15?'var(--amber-400)':'var(--green-400)'};width:${(o.pending/max)*100}%;"></div>
          </div>
          <div style="font-size:0.7rem;color:var(--color-text-muted);margin-top:3px;">
            ${o.role} · ${o.sla}% SLA
            ${o.breach > 0 ? `· <span style="color:var(--red-500);font-weight:600;">${o.breach} breach${o.breach>1?'es':''}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ── Application list ── */
  window.filterReassign = function(officer) {
    displayReassignApps = officer
      ? getSuperEscSlaCases().filter(e => e.officer === officer).map(escToApp)
      : getSuperEscSlaCases().map(escToApp);
    selectedReassignApp = null;
    selectedTargetOfficer = null;
    const officerPickCard = document.getElementById('officerPickCard');
    const reassignSubmit = document.getElementById('reassignSubmit');
    const reassignFormBody = document.getElementById('reassignFormBody');
    if (officerPickCard) officerPickCard.style.display = 'none';
    if (reassignSubmit) reassignSubmit.style.display = 'none';
    if (reassignFormBody) {
      reassignFormBody.innerHTML = `
        <div style="text-align:center;padding:var(--space-2xl);color:var(--color-text-muted);">
          <svg width="40" height="40" fill="none" stroke="var(--slate-300)" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          <div style="margin-top:var(--space-md);font-size:0.875rem;">Select an application from the list</div>
        </div>`;
    }
    window.renderReassignAppList();
  };

  window.renderReassignAppList = function() {
    const list = document.getElementById('reassignAppList');
    if (!list) return;
    list.innerHTML = displayReassignApps.map(a => `
      <div class="app-row ${selectedReassignApp?.id===a.id?'selected':''}" onclick="pickReassignApp('${a.id}')">
        <div style="width:3px;height:36px;border-radius:2px;background:${a.slaLeft<0?'var(--red-500)':a.slaLeft<=2?'var(--amber-400)':'var(--slate-200)'};flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-family:var(--font-mono);font-size:0.72rem;font-weight:800;color:var(--navy-600);">${a.id}</span>
            ${a.slaLeft < 0 ? `<span class="badge badge-danger" style="font-size:0.6rem;">${Math.abs(a.slaLeft)}d overdue</span>` : ''}
          </div>
          <div style="font-size:0.8125rem;font-weight:600;color:var(--navy-900);">${a.service}</div>
          <div style="font-size:0.72rem;color:var(--color-text-muted);">${a.citizen} · ${a.officer}</div>
        </div>
        ${selectedReassignApp?.id===a.id ? `<svg width="15" height="15" fill="none" stroke="var(--navy-600)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>` : ''}
      </div>
    `).join('');
  };

  window.pickReassignApp = function(id) {
    selectedReassignApp = displayReassignApps.find(a => a.id === id);
    selectedTargetOfficer = null;
    window.renderReassignAppList();
    const a = selectedReassignApp;
    const body = document.getElementById('reassignFormBody');
    if (body) {
      body.innerHTML = `
        <div style="padding:var(--space-md);">
          <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
            <div class="review-row"><span class="review-key">Application</span><span class="review-val" style="font-family:var(--font-mono);color:var(--navy-600);">${a.id}</span></div>
            <div class="review-row"><span class="review-key">Service</span><span class="review-val">${a.service}</span></div>
            <div class="review-row"><span class="review-key">Citizen</span><span class="review-val">${a.citizen}</span></div>
            <div class="review-row"><span class="review-key">Current Officer</span><span class="review-val">${a.officer}</span></div>
            <div class="review-row"><span class="review-key">SLA Status</span><span class="review-val" style="color:${a.slaLeft<0?'var(--red-500)':'var(--green-600)'};">${a.slaLeft<0?Math.abs(a.slaLeft)+'d overdue':a.slaLeft+'d remaining'}</span></div>
          </div>
        </div>
      `;
    }
    const officerPickCard = document.getElementById('officerPickCard');
    const reassignSubmit = document.getElementById('reassignSubmit');
    if (officerPickCard) officerPickCard.style.display = 'block';
    if (reassignSubmit) reassignSubmit.style.display = 'none';
    window.renderOfficerPicks();
  };

  window.renderOfficerPicks = function() {
    const list = document.getElementById('officerPickBody');
    if (!list) return;
    list.innerHTML = SUPER_TEAM
      .filter(o => o.name !== selectedReassignApp?.officer)
      .map(o => `
        <div class="officer-pick ${selectedTargetOfficer?.name===o.name?'selected':''}" onclick="pickOfficer('${o.name}')">
          <div style="display:flex;align-items:center;gap:var(--space-md);">
            <div class="avatar" style="width:36px;height:36px;font-size:0.75rem;background:var(--navy-600);">${o.initials}</div>
            <div style="flex:1;">
              <div style="font-weight:700;color:var(--navy-900);">${o.name}</div>
              <div style="font-size:0.75rem;color:var(--color-text-muted);">${o.role} · ${o.pending} pending · ${o.sla}% SLA</div>
            </div>
            <span class="badge ${o.pending<=15?'badge-success':o.pending<=25?'badge-warning':'badge-danger'}">${o.pending<=15?'Light load':o.pending<=25?'Moderate':'Overloaded'}</span>
          </div>
        </div>
      `).join('');
  };

  window.pickOfficer = function(name) {
    selectedTargetOfficer = SUPER_TEAM.find(o => o.name === name);
    window.renderOfficerPicks();
    const submit = document.getElementById('reassignSubmit');
    if (submit) submit.style.display = 'block';
  };

  window.submitReassign = function() {
    const reasonEl = document.getElementById('reassignReason');
    const reason = reasonEl ? reasonEl.value : '';
    if (!reason) { showToast('Please select a reassignment reason.', 'warning'); return; }
    const reassignedId = selectedReassignApp.id;
    showToast(
      `${selectedReassignApp.id} reassigned from ${selectedReassignApp.officer} to ${selectedTargetOfficer.name}. Both officers notified. Logged in audit trail.`,
      'success'
    );
    // Remove from the escalated cases list — single source of truth for both Override & Review and Workload Management
    const updatedEsc = getSuperEscSlaCases().filter(e => e.id !== reassignedId);
    setSuperEscSlaCases(updatedEsc);
    displayReassignApps = updatedEsc.map(escToApp);
    selectedReassignApp = null;
    selectedTargetOfficer = null;
    const body = document.getElementById('reassignFormBody');
    if (body) body.innerHTML = `<div style="text-align:center;padding:var(--space-2xl);color:var(--green-600);font-size:0.875rem;font-weight:700;">Reassignment recorded successfully. Please select another application.</div>`;
    const officerPickCard = document.getElementById('officerPickCard');
    const reassignSubmit = document.getElementById('reassignSubmit');
    if (officerPickCard) officerPickCard.style.display = 'none';
    if (reassignSubmit) reassignSubmit.style.display = 'none';
    window.renderReassignAppList();
  };

  /* ── Performance Actions card ── */
  function renderPerformanceActions() {
    const list = document.getElementById('performanceActions');
    if (!list) return;
    list.innerHTML = SUPER_TEAM.map(o => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--slate-100);">
        <div style="display:flex;align-items:center;gap:var(--space-md);">
          <div class="avatar" style="width:32px;height:32px;font-size:0.7rem;background:var(--navy-600);">${o.initials}</div>
          <div>
            <div style="font-size:0.875rem;font-weight:600;">${o.name}</div>
            <div style="font-size:0.72rem;color:var(--color-text-muted);">${o.sla}% SLA · ${o.pending} pending${o.breach>0?` · <span style="color:var(--red-500);">${o.breach} breach${o.breach>1?'es':''}</span>`:``}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" style="font-size:0.72rem;" onclick="showToast('Reminder sent to ${o.name}.','info')">Remind</button>
          ${o.sla < 90 || o.breach > 0
            ? `<button class="btn btn-sm btn-danger" style="font-size:0.72rem;" onclick="showToast('Performance warning issued to ${o.name}.','warning')">Warn</button>`
            : `<span class="badge badge-success" style="font-size:0.65rem;">On Track</span>`
          }
        </div>
      </div>
    `).join('');
  }

  window.showToast = showToast;

  renderWorkload();
  window.renderReassignAppList();
  renderPerformanceActions();

  if (reassignId) {
    setTimeout(() => {
      window.pickReassignApp(reassignId);
      const appRow = document.querySelector(`.app-row[onclick="pickReassignApp('${reassignId}')"]`);
      if (appRow) appRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (targetOfficer) {
        setTimeout(() => {
          window.pickOfficer(targetOfficer);
          const offRow = document.querySelector(`.officer-pick[onclick="pickOfficer('${targetOfficer}')"]`);
          if (offRow) offRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }, 100);
  }
}

// ══════════════════════════════════════════
// Auto-init based on data-page attribute
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  switch (page) {
    case 'escalated-cases': initEscalatedCases(); break;
    case 'supervisor-review': initSupervisorReview(); break;
    case 'workload-management': initWorkloadManagement(); break;
  }
});
