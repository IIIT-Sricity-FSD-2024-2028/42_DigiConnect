// ═══════════════════════════════════════════
// dashboard.js — Dashboard page controllers for all roles
// ═══════════════════════════════════════════

import { getSession, getApplications, getGrievances, getUsers, getServices, getAuditLogs, setGrievances, getOfficerQueue, setOfficerQueue, getOfficerQueries, setOfficerQueries, getSuperApprovals, setSuperApprovals, getSuperApprovedToday, setSuperApprovedToday, getSuperEscSlaCases, setSuperEscSlaCases } from './state.js';
import { initPage } from './navigation.js';
import { showToast, getGreeting, formatDate, formatDateTime } from './utils.js';
import { renderNotifPanel } from './notifications.js';
import { checkSLA } from './escalation.js';
import { OFFICER_QUERIES, OFFICER_ACTIVITY, OFFICER_SLA_RISKS, OFFICER_WEEK_CHART, SUPER_OFFICER_APPROVED, SUPER_SLA_BREACHES, SUPER_GRIEVANCES, SUPER_TEAM } from './mock-data.js';

// ══════════════════════════════════════════
// Citizen Dashboard
// ══════════════════════════════════════════

export function initCitizenDashboard() {
  const session = initPage({
    title: `${getGreeting()}, ${(getSession()?.name || 'User').split(' ')[0]}!`,
    breadcrumbs: [{ label: 'Citizen Portal' }, { label: 'Dashboard' }],
    requiredRole: 'citizen',
  });
  if (!session) return;
  renderNotifPanel();

  const apps = getApplications().filter(a => a.citizenId === session.id);
  const grievances = getGrievances().filter(g => g.citizenId === session.id);

  // Handle alerts for applications with query status (Ownership-based)
  const alertContainer = document.getElementById('dashboardAlerts');
  if (alertContainer) {
    const queryApps = apps.filter(a => a.status === 'query');
    alertContainer.innerHTML = queryApps.map(a => `
      <div class="alert alert-warning" style="margin-bottom:var(--space-lg);">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <strong>Action Required:</strong> Officer has raised a query on your ${a.serviceName} application (${a.id}). Please upload the requested documents within <strong>3 days</strong>.
          <a href="track-application.html?id=${a.id}" style="color:var(--amber-600);font-weight:700;margin-left:8px;">Respond Now →</a>
        </div>
      </div>
    `).join('');
  }

  const totalApps = apps.length;
  const approved = apps.filter(a => a.status === 'approved').length;
  const pending = apps.filter(a => a.status !== 'approved' && a.status !== 'rejected').length;
  const openGriev = grievances.filter(g => !['resolved', 'rejected', 'escalated-resolved'].includes(g.status)).length;

  setTextContent('statTotalApps', totalApps);
  setTextContent('statApproved', approved);
  setTextContent('statPending', pending);
  setTextContent('statOpenGrievances', openGriev);

  const recentAppsContainer = document.getElementById('recentApplications');
  if (recentAppsContainer) {
    const recent = apps.slice(0, 4);
    recentAppsContainer.innerHTML = recent.map(a => {
      const typeClass = a.serviceType === 'certificate' ? 'cert' : a.serviceType === 'welfare' ? 'welfare' : a.serviceType === 'permission' ? 'permission' : 'correction';
      const statusClass = a.status === 'approved' ? 'badge-success' : a.status === 'rejected' ? 'badge-danger' : a.status === 'query' ? 'badge-warning' : 'badge-info';
      const statusLabel = a.status === 'under-review' ? 'Under Review' : a.status.charAt(0).toUpperCase() + a.status.slice(1);
      return `
        <div class="application-item" style="cursor:pointer;" onclick="window.location.href='track-application.html?id=${a.id}'" data-testid="recent-app-${a.id}">
          <div class="app-type-icon ${typeClass}"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
          <div class="app-info">
            <div class="app-title">${a.serviceName}</div>
            <div class="app-meta">${a.id} · Submitted ${formatDate(a.submittedDate)}</div>
          </div>
          <span class="badge ${statusClass}">${statusLabel}</span>
        </div>`;
    }).join('') || '<div style="padding:var(--space-lg);text-align:center;color:var(--color-text-muted);">No applications yet. <a href="apply-service.html">Apply now</a></div>';
  }

  const grievContainer = document.getElementById('recentGrievances');
  if (grievContainer) {
    const active = ['new', 'open', 'under-review', 'escalated'];
    const recent = grievances.filter(g => active.includes(g.status)).slice(0, 3);
    grievContainer.innerHTML = recent.map(g => `
      <div class="application-item" style="cursor:pointer;" onclick="window.location.href='my-grievances.html?id=${g.id}'" data-testid="recent-griev-${g.id}">
        <div class="app-type-icon grievance"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg></div>
        <div class="app-info">
          <div class="app-title">${g.subject}</div>
          <div class="app-meta">${g.id} · Filed ${formatDate(g.filedDate)}</div>
        </div>
        <span class="badge badge-info">${g.status === 'under-review' || g.status === 'open' ? 'Under Review' : g.status.charAt(0).toUpperCase() + g.status.slice(1)}</span>
      </div>
    `).join('') || '<div style="padding:var(--space-md);text-align:center;color:var(--color-text-muted);">No open grievances</div>';
  }

  document.querySelectorAll('[data-action="download-cert"]').forEach(btn => {
    btn.addEventListener('click', () => showToast('Certificate downloaded!', 'success'));
  });
}

// ══════════════════════════════════════════
// Officer Dashboard
// ══════════════════════════════════════════

export function initOfficerDashboard() {
  const session = initPage({
    title: `${getGreeting()}, ${(getSession()?.name || 'Officer').split(' ')[0]}!`,
    breadcrumbs: [{ label: 'Officer Portal' }, { label: 'Dashboard' }],
    requiredRole: 'officer',
  });
  if (!session) return;
  renderNotifPanel();

  // Local state for queue
  let currentServiceFilter = '';
  let currentSortFilter = 'sla';
  const isActive = a => !['approve', 'reject'].includes(a.status);
  
  let officerQueue = getOfficerQueue();
  let displayQueue = [...officerQueue].filter(a => a.slaLeft >= 0 && isActive(a));
  const urgency = a => a.slaLeft < 0 ? 0 : a.slaLeft;
  displayQueue.sort((a,b) => urgency(a) - urgency(b));

  function priColor(a) { return a.slaLeft < 0 ? 'var(--red-500)' : a.slaLeft <= 2 ? 'var(--amber-400)' : a.slaLeft <= 4 ? 'var(--orange-300)' : 'var(--slate-200)'; }
  function priLabel(a) { return a.slaLeft < 0 ? `${Math.abs(a.slaLeft)}d overdue` : a.slaLeft <= 2 ? `${a.slaLeft}d left ⚠` : a.slaLeft + ` days left`; }
  function priClass(a) { return a.slaLeft < 0 ? 'breach' : a.slaLeft <= 2 ? 'warn' : 'safe'; }

  function renderQueue() {
    const container = document.getElementById('queueList');
    if (!container) return;
    container.innerHTML = displayQueue.slice(0, 6).map(a => `
      <div class="app-row" onclick="window.openReview('${a.id}')">
        <div class="priority-bar" style="background:${priColor(a)};"></div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;">
            <span style="font-family:var(--font-mono);font-size:0.75rem;font-weight:800;color:var(--navy-600);">${a.id}</span>
            <span class="badge ${a.status==='new'?'badge-info':a.status==='urgent'?'badge-danger':'badge-warning'}">${a.status==='new'?'New':a.status==='urgent'?'Urgent':'In Review'}</span>
          </div>
          <div style="font-size:0.875rem;font-weight:600;color:var(--navy-900);">${a.service}</div>
          <div style="font-size:0.75rem;color:var(--color-text-muted);">${a.citizen} &nbsp;·&nbsp; Submitted ${a.submitted}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:0.75rem;font-weight:700;color:${a.slaLeft<0?'var(--red-500)':a.slaLeft<=2?'var(--amber-600)':'var(--green-600)'};">${priLabel(a)}</div>
          <div class="sla-bar" style="width:80px;height:4px;margin-top:5px;margin-left:auto;"><div class="sla-fill ${priClass(a)}" style="width:${Math.max(5,Math.min(100,(a.slaLeft/Math.max(a.slaTotal,1))*100))}%;"></div></div>
          <div style="display:flex;gap:4px;margin-top:6px;justify-content:flex-end;">
            <button class="action-chip chip-approve" onclick="event.stopPropagation();window.quickAction('${a.id}','approve')">✓ Approve</button>
          </div>
        </div>
      </div>
    `).join('') || '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-muted);">No applications found</div>';
  }

  function renderBreachList() {
    officerQueue = getOfficerQueue();
    const breaches = [...officerQueue].filter(a => a.slaLeft < 0 && isActive(a));
    const container = document.getElementById('breachList');
    if (!container) return;
    container.innerHTML = breaches.map(a => `
      <div class="app-row" onclick="window.openReview('${a.id}')" style="border-left:none;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--red-100);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="18" height="18" fill="none" stroke="var(--red-500)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
            <span style="font-family:var(--font-mono);font-size:0.8rem;font-weight:800;color:var(--red-600);">${a.id}</span>
            <span class="badge badge-danger">${Math.abs(a.slaLeft)} days overdue</span>
          </div>
          <div style="font-size:0.9rem;font-weight:600;color:var(--navy-900);">${a.service} — ${a.citizen}</div>
          <div style="font-size:0.75rem;color:var(--color-text-muted);">Submitted ${a.submitted} · SLA: ${a.slaTotal} days</div>
          <div class="alert alert-danger" style="margin-top:8px;padding:6px 10px;font-size:0.75rem;">If not processed within 24 hours, this case will be auto-escalated to your Supervisor.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
          <button class="btn btn-success btn-sm" onclick="event.stopPropagation();window.quickAction('${a.id}','approve')">Approve Now</button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();window.quickAction('${a.id}','reject')">Reject</button>
        </div>
      </div>
    `).join('') || '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-muted);">No breached applications</div>';
  }

  function renderQueriesList() {
    const container = document.getElementById('queriesList');
    if (!container) return;
    const queries = getOfficerQueries();
    container.innerHTML = queries.map(q => `
      <div class="app-row">
        <div style="width:36px;height:36px;border-radius:50%;background:${q.responded?'var(--green-100)':'var(--amber-100)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="16" height="16" fill="none" stroke="${q.responded?'var(--green-500)':'var(--amber-600)'}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${q.responded?'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z':'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
            <span style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;color:var(--navy-600);">${q.id}</span>
            <span class="badge ${q.responded?'badge-success':'badge-warning'}">${q.responded?'Responded':'Awaiting'}</span>
          </div>
          <div style="font-size:0.875rem;font-weight:600;color:var(--navy-900);">${q.citizen} — ${q.service}</div>
          <div style="font-size:0.75rem;color:var(--slate-600);margin-top:2px;">"${q.query}"</div>
          <div style="font-size:0.72rem;color:var(--color-text-muted);margin-top:3px;">Sent ${q.sent} · Response deadline: <strong>${q.deadline}</strong></div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          ${q.responded?`<button class="btn btn-success btn-sm" onclick="event.stopPropagation();window.location.href='review-application.html?id=${q.id}'">Review</button>`:`<button class="btn btn-outline btn-sm" onclick="window.showToast('SMS reminder sent to ${q.citizen}.','info')">Send Reminder</button>`}
        </div>
      </div>
    `).join('') || '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-muted);">No active queries</div>';
  }

  function renderActivityList() {
    const container = document.getElementById('activityList');
    if (!container) return;
    const dateEl = document.getElementById('actDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

    const paths = {
      check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      query: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      reject: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      login: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
    };
    container.innerHTML = OFFICER_ACTIVITY.map(a => `
      <div style="display:flex;gap:14px;padding:12px 20px;border-bottom:1px solid var(--slate-100);align-items:flex-start;">
        <div style="width:32px;height:32px;border-radius:50%;background:${a.color}20;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
          <svg width="14" height="14" fill="none" stroke="${a.color}" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${paths[a.icon]}"/></svg>
        </div>
        <div style="flex:1;font-size:0.8125rem;color:var(--slate-700);line-height:1.5;">${a.msg}</div>
        <div style="font-size:0.72rem;color:var(--color-text-muted);white-space:nowrap;">${a.time}</div>
      </div>
    `).join('');
  }

  function renderSLARisks() {
    const container = document.getElementById('slaRiskList');
    if (!container) return;
    container.innerHTML = OFFICER_SLA_RISKS.map(s => `
      <div onclick="window.openReview('${s.id}')" style="cursor:pointer;">
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:2px;"><span style="color:var(--slate-600);">${s.id}</span><span style="font-weight:700;color:${s.status==='breach'?'var(--red-500)':'var(--amber-500)'};">${s.status==='breach'?'BREACH':'At Risk'}</span></div>
        <div class="sla-bar" style="height:5px;margin-bottom:4px;"><div class="sla-fill ${s.status}" style="width:${s.pct}%;"></div></div>
      </div>
    `).join('');
  }

  function renderWeekChart() {
    const chart = document.getElementById('weekChart');
    const labels = document.getElementById('weekLabels');
    if (!chart || !labels) return;
    const { days, vals } = OFFICER_WEEK_CHART;
    const max = Math.max(...vals) || 1;
    chart.innerHTML = vals.map((v,i) => `<div style="flex:1;display:flex;align-items:flex-end;"><div class="mini-chart-bar" style="height:${Math.max(v/max*72,v>0?4:4)}px;background:${i===4?'var(--navy-600)':'var(--navy-200)'};" title="${v} approved"></div></div>`).join('');
    labels.innerHTML = days.map(d => `<span>${d}</span>`).join('');
  }

  // Bind inline functions to window for dashboard
  window.filterQueue = function(service) {
    currentServiceFilter = service || '';
    applyFilters();
  };

  window.sortQueue = function(by) {
    currentSortFilter = by || 'sla';
    applyFilters();
  };

  function applyFilters() {
    officerQueue = getOfficerQueue();
    displayQueue = [...officerQueue].filter(a => a.slaLeft >= 0 && isActive(a));
    if (currentServiceFilter) {
      displayQueue = displayQueue.filter(a => a.service === currentServiceFilter);
    }
    displayQueue.sort((a,b) => {
      if (currentSortFilter === 'date') return 0; // simplified
      if (currentSortFilter === 'sla') return urgency(a) - urgency(b);
      return a.service.localeCompare(b.service);
    });
    renderQueue();
  }

  let currentApp = null;
  window.openReview = function(id) {
    officerQueue = getOfficerQueue();
    currentApp = officerQueue.find(a => a.id === id);
    if (!currentApp) return;
    document.getElementById('reviewTitle').textContent = `Review: ${currentApp.id} — ${currentApp.service}`;
    document.getElementById('reviewBody').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-lg);">
        <div>
          <div class="review-card"><div class="review-grid">
            <div class="review-item"><span class="review-key">Applicant</span><span class="review-value">${currentApp.citizen}</span></div>
            <div class="review-item"><span class="review-key">Service</span><span class="review-value">${currentApp.service}</span></div>
            <div class="review-item"><span class="review-key">Submitted</span><span class="review-value">${currentApp.submitted} 2025</span></div>
            <div class="review-item"><span class="review-key">SLA Status</span><span class="review-value" style="font-weight:700;color:${currentApp.slaLeft<0?'var(--red-500)':currentApp.slaLeft<=2?'var(--amber-500)':'var(--green-500)'};">${currentApp.slaLeft<0?Math.abs(currentApp.slaLeft)+' days overdue':currentApp.slaLeft+' days left'}</span></div>
            ${currentApp.income?`<div class="review-item"><span class="review-key">Annual Income</span><span class="review-value">₹${currentApp.income}</span></div>`:''}
            ${currentApp.community?`<div class="review-item"><span class="review-key">Community</span><span class="review-value">${currentApp.community}</span></div>`:''}
            ${currentApp.purpose?`<div class="review-item"><span class="review-key">Purpose</span><span class="review-value">${currentApp.purpose}</span></div>`:''}
          </div></div>
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Uploaded Documents</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${['Aadhaar Card.pdf','Ration Card / Utility Bill.jpg','Salary Slip 2024.pdf','Self-Declaration.pdf'].slice(0,currentApp.docs).map(d=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--slate-50);border-radius:var(--radius-sm);border:1px solid var(--color-border);"><span style="font-size:0.8rem;">${d}</span><button class="btn btn-ghost btn-sm" style="font-size:0.72rem;" onclick="window.showToast('Document opened.','info')">View</button></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Officer Remarks <span style="color:var(--color-text-muted);font-weight:400;">(required for rejection / query)</span></label>
        <textarea class="form-input" id="officerRemarks" rows="3" placeholder="Add your remarks, field verification notes, or reason for query/rejection…"></textarea>
      </div>
    `;
    document.getElementById('reviewModal').classList.add('active');
  };

  window.closeModal = function(id) {
    document.getElementById(id)?.classList.remove('active');
  };

  window.doAction = function(action) {
    if (action === 'query') {
      if (currentApp) window.location.href = `review-application.html?id=${currentApp.id}&action=query`;
      return;
    }
    window.closeModal('reviewModal');
    if (currentApp) {
      currentApp.status = action; // 'approve' or 'reject'
      officerQueue = getOfficerQueue();
      const index = officerQueue.findIndex(a => a.id === currentApp.id);
      if (index > -1) {
        officerQueue[index] = currentApp;
        setOfficerQueue(officerQueue);
      }
    }
    const msgs = {
      approve:`${currentApp?.id} approved! Certificate queued for issue. Citizen notified.`,
      reject:`${currentApp?.id} rejected. Citizen has been notified with reason.`,
      query:`Query raised on ${currentApp?.id}. Citizen notified via SMS & portal.`
    };
    showToast(msgs[action], action==='approve'?'success':action==='reject'?'warning':'info');
    
    // Re-render lists to hide the actioned application
    applyFilters();
    renderBreachList();
    updateOfficerCounters();
  };

  function updateOfficerCounters() {
    officerQueue = getOfficerQueue();
    const queueCount = [...officerQueue].filter(a => a.slaLeft >= 0 && isActive(a)).length;
    const breachCount = [...officerQueue].filter(a => a.slaLeft < 0 && isActive(a)).length;
    const officerQueries = getOfficerQueries();
    const queriesCount = officerQueries.filter(q => !q.responded).length;
    const approvedCount = 14 + [...officerQueue].filter(a => a.status === 'approve').length;
    
    if (document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = queueCount;
    if (document.getElementById('stat-approved')) document.getElementById('stat-approved').textContent = approvedCount;
    if (document.getElementById('stat-breached')) document.getElementById('stat-breached').textContent = breachCount;
    if (document.getElementById('stat-queries')) document.getElementById('stat-queries').textContent = queriesCount;
    
    if (document.getElementById('tab-badge-queue')) document.getElementById('tab-badge-queue').textContent = queueCount;
    if (document.getElementById('tab-badge-breach')) document.getElementById('tab-badge-breach').textContent = breachCount;
    if (document.getElementById('tab-badge-queries')) document.getElementById('tab-badge-queries').textContent = queriesCount;
  }

  window.quickAction = function(id, action) {
    officerQueue = getOfficerQueue();
    currentApp = officerQueue.find(a => a.id === id);
    window.doAction(action);
  };

  window.showTab = function(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
    const panel = document.getElementById(`panel-${tabId}`);
    if (panel) panel.classList.add('active');
  };

  window.showToast = showToast;

  // Initial render
  renderQueue();
  renderBreachList();
  renderQueriesList();
  renderActivityList();
  renderSLARisks();
  renderWeekChart();
  updateOfficerCounters();
}

// ══════════════════════════════════════════
// Supervisor Dashboard
// ══════════════════════════════════════════

export function initSupervisorDashboard() {
  const session = initPage({
    title: `${getGreeting()}, ${(getSession()?.name || 'Supervisor').split(' ')[0]}!`,
    breadcrumbs: [{ label: 'Supervisor Portal' }, { label: 'Dashboard' }],
    requiredRole: 'supervisor',
  });
  if (!session) return;
  renderNotifPanel();

  // ── Persisted state from localStorage ──
  let pendingApprovals  = getSuperApprovals();
  let approvedToday     = getSuperApprovedToday();
  let allEscalated      = getSuperEscSlaCases();   // combined SLA + grievance list
  let slaOnlyCases      = allEscalated.filter(c => c.type === 'sla');
  let grievanceOnlyCases = allEscalated.filter(c => c.type === 'grievance');
  let displayApprovals  = [...pendingApprovals];

  // ── Stat + badge helpers ──
  function updateStats() {
    const pendEl          = document.getElementById('sup-stat-pending');
    const appEl           = document.getElementById('sup-stat-approved');
    const badgeEl         = document.getElementById('badge-approvals');
    const slaEl           = document.getElementById('sup-stat-sla');
    const slaBadgeEl      = document.getElementById('badge-sla');
    const grievEl         = document.getElementById('sup-stat-grievance');
    const grievBadgeEl    = document.getElementById('badge-grievance');
    if (pendEl)       pendEl.textContent       = pendingApprovals.length;
    if (appEl)        appEl.textContent        = approvedToday;
    if (badgeEl)      badgeEl.textContent      = pendingApprovals.length;
    if (slaEl)        slaEl.textContent        = slaOnlyCases.length;
    if (slaBadgeEl)   slaBadgeEl.textContent   = slaOnlyCases.length;
    if (grievEl)      grievEl.textContent      = grievanceOnlyCases.length;
    if (grievBadgeEl) grievBadgeEl.textContent = grievanceOnlyCases.length;
  }

  window.filterApprovals = function(service) {
    displayApprovals = service
      ? pendingApprovals.filter(a => a.service === service)
      : [...pendingApprovals];
    renderApprovals();
  };

  function renderApprovals() {
    const tbody = document.getElementById('approvalsTable');
    if (!tbody) return;
    if (displayApprovals.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:var(--space-xl);color:var(--color-text-muted);">No pending approvals — all caught up!</td></tr>';
      return;
    }
    tbody.innerHTML = displayApprovals.map(a => `
      <tr>
        <td><span style="font-family:var(--font-mono);font-size:0.8rem;font-weight:800;color:var(--navy-600);">${a.id}</span></td>
        <td style="font-size:0.8125rem;font-weight:600;">${a.service}</td>
        <td style="font-size:0.8125rem;">${a.citizen}</td>
        <td>
          <div style="font-size:0.8rem;">${a.officer}</div>
          <div style="font-size:0.7rem;color:var(--color-text-muted);">${a.role}</div>
        </td>
        <td>
          <span class="flow-pill approved">
            <svg width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            Officer Approved
          </span>
        </td>
        <td style="font-size:0.8rem;color:var(--color-text-muted);">${a.submitted}</td>
        <td>
          <span style="font-size:0.8rem;font-weight:700;color:${a.slaLeft<=2?'var(--red-500)':a.slaLeft<=4?'var(--amber-500)':'var(--green-600)'};">  
            ${a.slaLeft<=2?'⚠ ':''}${a.slaLeft}d left
          </span>
        </td>
        <td>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-success" style="font-size:0.72rem;" onclick="quickApprove('${a.id}','${a.citizen}')">
              <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Approve
            </button>
            <a href="supervisor-review.html?id=${a.id}&mode=final" class="btn btn-sm btn-outline" style="font-size:0.72rem;">Full Review</a>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.quickApprove = function(id, citizen) {
    showToast(`${id} approved. Certificate issued to ${citizen}. Audit trail updated.`, 'success');
    pendingApprovals  = pendingApprovals.filter(a => a.id !== id);
    displayApprovals  = displayApprovals.filter(a => a.id !== id);
    approvedToday    += 1;
    setSuperApprovals(pendingApprovals);
    setSuperApprovedToday(approvedToday);
    renderApprovals();
    updateStats();
  };

  function renderSlaTable() {
    const tbody = document.getElementById('slaTable');
    if (!tbody) return;
    if (slaOnlyCases.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:var(--space-xl);color:var(--color-text-muted);">No SLA breaches — all resolved!</td></tr>';
      return;
    }
    tbody.innerHTML = slaOnlyCases.map(b => `
      <tr>
        <td><span style="font-family:var(--font-mono);font-size:0.8rem;font-weight:700;color:var(--red-600);">${b.id}</span></td>
        <td style="font-size:0.8125rem;">${b.service}</td>
        <td style="font-size:0.8125rem;">${b.citizen}</td>
        <td style="font-size:0.8125rem;">${b.officer}</td>
        <td><span class="badge badge-danger">${typeof b.overdue === 'number' ? b.overdue + ' days' : b.overdue}</span></td>
        <td style="font-size:0.75rem;color:var(--color-text-muted);">${b.on}</td>
        <td>
          <div style="display:flex;gap:4px;">
            <a href="supervisor-review.html?id=${b.id}&mode=escalation" class="btn btn-sm btn-primary" style="font-size:0.7rem;">Review</a>
            <button class="btn btn-sm btn-outline" style="font-size:0.7rem;" onclick="showToast('Reminder sent to ${b.officer}.','warning')">Remind</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderGrievances() {
    const grid = document.getElementById('grievanceGrid');
    if (!grid) return;
    if (grievanceOnlyCases.length === 0) {
      grid.innerHTML = '<div style="text-align:center;padding:var(--space-2xl);color:var(--color-text-muted);">No grievance escalations — all resolved!</div>';
      return;
    }
    grid.innerHTML = grievanceOnlyCases.map(g => `
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-left:4px solid var(--amber-400);border-radius:var(--radius-lg);padding:var(--space-lg);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:var(--space-sm);">
          <div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;">
              <span style="font-family:var(--font-mono);font-size:0.8rem;font-weight:800;color:var(--amber-700);">${g.id}</span>
              <span class="badge ${g.badge || 'badge-warning'}" style="font-size:0.65rem;">${g.subtype}</span>
              ${g.urgent ? '<span class="badge badge-danger" style="font-size:0.6rem;animation:pulse 2s infinite;">URGENT</span>' : ''}
            </div>
            <div style="font-size:0.9375rem;font-weight:700;color:var(--navy-900);">${g.service}</div>
            <div style="font-size:0.8rem;color:var(--color-text-muted);">${g.citizen} · via ${g.officer}</div>
          </div>
          <span class="flow-pill grievance" style="flex-shrink:0;font-size:0.65rem;">GRIEVANCE_ESCALATED</span>
        </div>
        <div style="background:var(--amber-50);border-radius:var(--radius-md);padding:10px 12px;margin-bottom:var(--space-md);">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--amber-700);margin-bottom:4px;">Summary</div>
          <p style="font-size:0.8125rem;color:var(--slate-700);line-height:1.6;margin:0;">${g.summary}</p>
        </div>
        <div style="font-size:0.72rem;color:var(--color-text-muted);margin-bottom:var(--space-md);">
          Escalated by <strong>${g.go}</strong> (Grievance Officer) · ${g.on} Jan &nbsp;|&nbsp;
          Officer decision: <span style="color:var(--red-600);font-weight:600;">${g.officerDecision}</span>
        </div>
        <div style="display:flex;gap:6px;justify-content:flex-end;">
          <a href="supervisor-review.html?id=${g.id}&mode=grievance" class="btn btn-sm btn-primary" style="font-size:0.75rem;">
            Investigate &amp; Decide
          </a>
        </div>
      </div>
    `).join('');
  }

  function renderTeam() {
    const grid = document.getElementById('teamGrid');
    if (!grid) return;
    grid.innerHTML = SUPER_TEAM.map(o => `
      <div class="officer-card">
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-md);">
          <div class="avatar" style="width:44px;height:44px;font-size:0.875rem;background:var(--navy-600);">${o.initials}</div>
          <div>
            <div style="font-weight:700;color:var(--navy-900);">${o.name}</div>
            <div style="font-size:0.75rem;color:var(--color-text-muted);">${o.role}</div>
          </div>
          <span class="badge ${o.sla>=95?'badge-success':o.sla>=85?'badge-warning':'badge-danger'}" style="margin-left:auto;">${o.sla}% SLA</span>
        </div>
        <div class="sla-bar" style="height:6px;margin-bottom:var(--space-md);"><div class="sla-fill ${o.sla>=95?'safe':o.sla>=85?'warn':'breach'}" style="width:${o.sla}%;"></div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-sm);margin-bottom:var(--space-md);text-align:center;">
          <div style="background:var(--amber-50);padding:8px;border-radius:var(--radius-sm);"><div style="font-size:1.125rem;font-weight:800;color:var(--amber-600);">${o.pending}</div><div style="font-size:0.65rem;color:var(--color-text-muted);font-weight:600;">PENDING</div></div>
          <div style="background:var(--green-50);padding:8px;border-radius:var(--radius-sm);"><div style="font-size:1.125rem;font-weight:800;color:var(--green-600);">${o.approved}</div><div style="font-size:0.65rem;color:var(--color-text-muted);font-weight:600;">APPROVED</div></div>
          <div style="background:${o.breach>0?'var(--red-50)':'var(--slate-50)'};padding:8px;border-radius:var(--radius-sm);"><div style="font-size:1.125rem;font-weight:800;color:${o.breach>0?'var(--red-600)':'var(--slate-400)'}">${o.breach}</div><div style="font-size:0.65rem;color:var(--color-text-muted);font-weight:600;">BREACHED</div></div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-outline btn-sm" style="flex:1;" onclick="window.showToast('Reminder sent to ${o.name}.','info')">Remind</button>
          <a href="workload-management.html" class="btn btn-outline btn-sm" style="flex:1;text-align:center;">Reassign</a>
        </div>
        ${o.breach > 0 ? `<div style="margin-top:8px;font-size:0.72rem;color:var(--red-600);text-align:center;font-weight:600;">${o.breach} breach${o.breach>1?'es':''} — action needed</div>` : ''}
      </div>
    `).join('');
  }

  const supDate = document.getElementById('supDate');
  if (supDate) {
    supDate.textContent = new Date().toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  window.showTab = function(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
    const panel = document.getElementById(`panel-${tabId}`);
    if (panel) panel.classList.add('active');
  };

  window.showToast = showToast;

  // Initial render
  renderApprovals();
  renderSlaTable();
  renderGrievances();
  renderTeam();
  updateStats();
}

// ══════════════════════════════════════════
// Super User Dashboard
// ══════════════════════════════════════════

export function initAdminDashboard() {
  const session = initPage({
    title: 'System Dashboard',
    breadcrumbs: [{ label: 'Super User Portal' }, { label: 'Dashboard' }],
    requiredRole: 'super_user',
  });
  if (!session) return;
  renderNotifPanel();

  // Make showToast available globally for inline onclick handlers in HTML
  window.showToast = showToast;

  window.updateAdminStats = () => {
      const apps = getApplications();
      const users = getUsers();
      const services = getServices();
      const grievances = getGrievances();

      const approvedCount = apps.filter(a => a.status === 'approved').length;
      const pendingCount = apps.filter(a => a.status !== 'approved' && a.status !== 'rejected').length;
      const citizenCount = users.filter(u => u.role === 'citizen').length;
      const officerCount = users.filter(u => u.role === 'officer').length;
      const activeGrievanceCount = grievances.filter(g => !['resolved','rejected','escalated-resolved'].includes(g.status)).length;
      const activeServiceCount = services.filter(s => s.status === 'Active').length;

      if(document.getElementById('admin-stat-total-apps')) document.getElementById('admin-stat-total-apps').textContent = apps.length.toLocaleString();
      if(document.getElementById('admin-stat-approved')) document.getElementById('admin-stat-approved').textContent = approvedCount.toLocaleString();
      if(document.getElementById('admin-stat-pending')) document.getElementById('admin-stat-pending').textContent = pendingCount.toLocaleString();
      if(document.getElementById('admin-stat-citizens')) document.getElementById('admin-stat-citizens').textContent = citizenCount.toLocaleString();
      if(document.getElementById('admin-stat-officers')) document.getElementById('admin-stat-officers').textContent = officerCount.toLocaleString();
      if(document.getElementById('admin-stat-grievances')) document.getElementById('admin-stat-grievances').textContent = activeGrievanceCount.toLocaleString();
      if(document.getElementById('admin-stat-services')) document.getElementById('admin-stat-services').textContent = activeServiceCount.toLocaleString();
  };
  window.updateAdminStats();

  // Date
  const dateEl = document.getElementById('todayDate');
  if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Bar Chart
  const cats = [
      { label: 'Income Certificate', val: 892, pct: 92, color: 'var(--navy-500)' },
      { label: 'Caste Certificate', val: 674, pct: 70, color: 'var(--navy-400)' },
      { label: 'Welfare / Subsidy', val: 521, pct: 54, color: 'var(--green-500)' },
      { label: 'Residence Certificate', val: 408, pct: 42, color: 'var(--navy-300)' },
      { label: 'Permissions & Auth', val: 287, pct: 30, color: 'var(--amber-500)' },
      { label: 'Record Correction', val: 186, pct: 19, color: 'var(--purple-500)' },
      { label: 'Grievances', val: 879, pct: 91, color: 'var(--orange-500)' },
  ];
  const chartBars = document.getElementById('chartBars');
  if (chartBars) {
      chartBars.innerHTML = cats.map(c => `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
              <div style="min-width:160px;font-size:0.8rem;color:var(--slate-700);font-weight:500;">${c.label}</div>
              <div style="flex:1;height:10px;background:var(--slate-100);border-radius:5px;overflow:hidden;">
                  <div style="height:100%;width:${c.pct}%;background:${c.color};border-radius:5px;transition:width 0.8s ease;"></div>
              </div>
              <div style="min-width:40px;text-align:right;font-size:0.8125rem;font-weight:700;color:var(--navy-900);">${c.val}</div>
          </div>
      `).join('');
  }

  // Services table
  const services = [
      { name: 'Income Certificate', cat: 'Certificate', apps: 892, sla: '7 days', status: 'Active' },
      { name: 'Caste Certificate', cat: 'Certificate', apps: 674, sla: '7 days', status: 'Active' },
      { name: 'Welfare Scheme', cat: 'Welfare', apps: 521, sla: '14 days', status: 'Active' },
      { name: 'Event Permission', cat: 'Permission', apps: 287, sla: '5 days', status: 'Active' },
      { name: 'Marriage Certificate', cat: 'Certificate', apps: 0, sla: '7 days', status: 'Draft' },
      { name: 'Scholarship', cat: 'Welfare', apps: 134, sla: '21 days', status: 'Active' },
  ];
  const servicesTable = document.getElementById('servicesTable');
  if (servicesTable) {
      servicesTable.innerHTML = services.map(s => `
          <tr>
              <td style="font-weight:600;color:var(--navy-900);">${s.name}</td>
              <td><span class="badge ${s.cat === 'Certificate' ? 'badge-info' : s.cat === 'Welfare' ? 'badge-success' : 'badge-warning'}">${s.cat}</span></td>
              <td>${s.apps.toLocaleString()}</td>
              <td><span style="font-size:0.8rem;color:var(--color-text-muted);">${s.sla}</span></td>
              <td><span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-neutral'}">${s.status}</span></td>
              <td>
                  <div style="display:flex;gap:4px;">
                      <button class="btn-icon" title="Edit" onclick="window.location.href='manage-services.html'"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button class="btn-icon" title="${s.status === 'Active' ? 'Deactivate' : 'Activate'}" onclick="showToast('Service status updated!','success')"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
                  </div>
              </td>
          </tr>
      `).join('');
  }

  // Officer Workload
  const officers = [
      { name: 'Suresh Reddy', role: 'VRO', load: 28, max: 35 },
      { name: 'Anita Sharma', role: 'RI', load: 34, max: 35 },
      { name: 'Ramesh Kumar', role: 'MRO', load: 18, max: 35 },
      { name: 'Priya Nair', role: 'Welfare Officer', load: 22, max: 35 },
      { name: 'Kiran Babu', role: 'VRO', load: 31, max: 35 },
  ];
  const officerLoad = document.getElementById('officerLoad');
  if (officerLoad) {
      officerLoad.innerHTML = officers.map(o => {
          const pct = Math.round(o.load / o.max * 100);
          const color = pct > 90 ? 'var(--red-500)' : pct > 70 ? 'var(--amber-400)' : 'var(--green-500)';
          return `
              <div style="padding:10px var(--space-lg);border-bottom:1px solid var(--slate-100);">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                          <div class="avatar" style="width:28px;height:28px;font-size:0.7rem;">${o.name.split(' ').map(n => n[0]).join('')}</div>
                          <div>
                              <div style="font-size:0.8125rem;font-weight:600;color:var(--navy-900);">${o.name}</div>
                              <div style="font-size:0.72rem;color:var(--color-text-muted);">${o.role}</div>
                          </div>
                      </div>
                      <span style="font-size:0.75rem;font-weight:700;color:${color};">${o.load}/${o.max}</span>
                  </div>
                  <div class="sla-bar"><div class="sla-fill ${pct > 90 ? 'breach' : pct > 70 ? 'warn' : 'safe'}" style="width:${pct}%;"></div></div>
              </div>
          `;
      }).join('');
  }

  // SLA Breached table
  let adminSlaData = [
      { id: 'APP-2415', service: 'Income Certificate', citizen: 'Ravi Kumar', officer: 'Suresh R.', due: '18 Jan 2025', overdue: '5 days' },
      { id: 'APP-2389', service: 'Caste Certificate', citizen: 'Meena Devi', officer: 'Anita S.', due: '16 Jan 2025', overdue: '7 days' },
      { id: 'APP-2401', service: 'Welfare Scheme', citizen: 'Gopal Rao', officer: 'Ramesh K.', due: '20 Jan 2025', overdue: '3 days' },
      { id: 'APP-2356', service: 'Event Permission', citizen: 'Sunil Events', officer: 'Priya N.', due: '15 Jan 2025', overdue: '8 days' },
  ];

  function renderAdminSlaTable() {
      const slaTable = document.getElementById('slaTable');
      if (!slaTable) return;
      if (adminSlaData.length === 0) {
          slaTable.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:var(--space-lg);color:var(--color-text-muted);">No SLA breaches found</td></tr>';
          return;
      }
      slaTable.innerHTML = adminSlaData.map(r => `
          <tr>
              <td><span style="font-family:var(--font-mono);font-size:0.8rem;color:var(--navy-600);font-weight:600;">${r.id}</span></td>
              <td>${r.service}</td>
              <td>${r.citizen}</td>
              <td>${r.officer}</td>
              <td style="color:var(--red-500);font-weight:600;">${r.due}</td>
              <td><span class="badge badge-danger">${r.overdue}</span></td>
              <td>
                  <div style="display:flex;gap:4px;">
                      <button class="btn btn-sm btn-danger" onclick="window.escalateAdminSla('${r.id}')" style="font-size:0.72rem;padding:4px 10px;">Escalate</button>
                      <button class="btn btn-sm btn-outline" onclick="showToast('Reminder sent to officer!','info')" style="font-size:0.72rem;padding:4px 10px;">Remind</button>
                  </div>
              </td>
          </tr>
      `).join('');
  }

  window.escalateAdminSla = (id) => {
      adminSlaData = adminSlaData.filter(r => r.id !== id);
      renderAdminSlaTable();
      showToast('Escalation sent successfully!', 'success');
  };

  renderAdminSlaTable();

  // Audit list
  const audits = [
      { icon: 'check-circle', color: 'var(--green-500)', msg: 'Application APP-2480 approved by Officer Suresh Reddy', time: '2 min ago' },
      { icon: 'alert', color: 'var(--amber-500)', msg: 'SLA breach detected for APP-2415 – escalation triggered', time: '10 min ago' },
      { icon: 'user-plus', color: 'var(--navy-400)', msg: 'New officer Kiran Babu onboarded (VRO, Hyderabad)', time: '1 hr ago' },
      { icon: 'settings', color: 'var(--purple-500)', msg: 'Service "Marriage Certificate" created and set to Draft', time: '3 hrs ago' },
      { icon: 'x-circle', color: 'var(--red-500)', msg: 'Application APP-2378 rejected by Officer Anita Sharma', time: '5 hrs ago' },
      { icon: 'message', color: 'var(--navy-400)', msg: 'Grievance GRV-087 resolved by Grievance Officer', time: '6 hrs ago' },
  ];
  const iconPaths = {
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'alert': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'user-plus': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'x-circle': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'message': 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  };
  const auditList = document.getElementById('auditList');
  if (auditList) {
      auditList.innerHTML = audits.map(a => `
          <div style="display:flex;gap:var(--space-md);padding:12px var(--space-lg);border-bottom:1px solid var(--slate-100);align-items:center;">
              <div style="width:32px;height:32px;border-radius:50%;background:${a.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="14" height="14" fill="none" stroke="${a.color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${iconPaths[a.icon]}"/></svg>
              </div>
              <div style="flex:1;font-size:0.8125rem;color:var(--slate-700);">${a.msg}</div>
              <div style="font-size:0.72rem;color:var(--color-text-muted);white-space:nowrap;">${a.time}</div>
          </div>
      `).join('');
  }
}

// ══════════════════════════════════════════
// Grievance Officer Dashboard
// ══════════════════════════════════════════

export function initGrievanceDashboard() {
  const session = initPage({
    title: `${getGreeting()}, ${(getSession()?.name || 'Officer').split(' ')[0]}!`,
    breadcrumbs: [{ label: 'Grievance Portal' }, { label: 'Dashboard' }],
    requiredRole: 'grievance',
  });
  if (!session) return;
  renderNotifPanel();

  // ── State ──
  const TERMINAL = ['resolved', 'rejected', 'escalated-resolved', 'escalated'];
  const allGrievances = getGrievances();
  // Active grievances only for dashboard
  const activeGrievances = allGrievances.filter(g => !TERMINAL.includes(g.status));

  let filteredData = [...activeGrievances];
  let currentFilter = 'all';
  let activeCatFilter = '';
  let activeSearchQ = '';
  let currentPage = 1;
  let pageSize = 10;
  // ── Summary Counts ──
  const countNew = activeGrievances.filter(g => g.status === 'new').length;
  const countOpen = activeGrievances.filter(g => g.status === 'open').length;
  const countResolved = allGrievances.filter(g => g.status === 'resolved').length;
  const countBreach = activeGrievances.filter(g => g.slaStatus === 'breach').length;

  setTextContent('countNew', countNew);
  setTextContent('countOpen', countOpen);
  setTextContent('countResolved', countResolved);
  setTextContent('countBreach', countBreach);

  // ── Stat Cards (for card row, if present) ──
  setTextContent('statTotalGrievances', allGrievances.length);
  setTextContent('statOpenGrievances', activeGrievances.length);
  setTextContent('statResolvedGrievances', allGrievances.filter(g => TERMINAL.includes(g.status)).length);
  setTextContent('statHighPriority', activeGrievances.filter(g => g.priority === 'high').length);

  // ── Helpers ──
  function getCatLabel(c) { return { delay: 'Service Delay', rejection: 'App. Rejection', payment: 'Payment Issue', misconduct: 'Officer Misconduct' }[c] || 'Other'; }
  function getCatClass(c) { return { delay: 'cat-delay', rejection: 'cat-rejection', payment: 'cat-payment', misconduct: 'cat-misconduct' }[c] || ''; }
  function getPriorityColor(p) { return { high: 'var(--red-500)', medium: 'var(--amber-600)', low: '#166534' }[p] || 'var(--slate-500)'; }
  function getStatusInfo(s) {
    return {
      new: { label: 'New', cls: 'badge-info', srs: 'NEW_GRIEVANCE' },
      open: { label: 'Investigating', cls: 'badge-warning', srs: 'UNDER_INVESTIGATION' },
      escalated: { label: 'Escalated', cls: 'badge-danger', srs: 'GRIEVANCE_ESCALATED' },
      resolved: { label: 'Resolved', cls: 'badge-success', srs: 'GRIEVANCE_RESOLVED' },
      rejected: { label: 'Rejected', cls: 'badge-neutral', srs: 'GRIEVANCE_REJECTED' },
    }[s] || { label: s, cls: 'badge-neutral', srs: '' };
  }
  function getSlaDisplay(g) {
    const s = g.slaStatus || 'safe';
    const labels = { safe: 'On Track', warn: 'At Risk', breach: 'Breached' };
    return { status: s, text: labels[s] || s };
  }

  // ── Render ──
  function render() {
    const tbody = document.getElementById('grievanceTableBody');
    if (!tbody) return;

    const total = filteredData.length;
    const pageStart = (currentPage - 1) * pageSize;
    const pageItems = filteredData.slice(pageStart, pageStart + pageSize);
    const totalPgs = Math.max(1, Math.ceil(total / pageSize));

    setTextContent('shownCount', pageItems.length);
    setTextContent('totalCount', total);
    setTextContent('currentPage', currentPage);
    setTextContent('totalPages', totalPgs);

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPgs;

    tbody.innerHTML = pageItems.map(g => {
      const sm = getStatusInfo(g.status);
      const sla = getSlaDisplay(g);
      const initials = g.citizenName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      return `
        <tr class="grievance-table-row" data-testid="griev-row-${g.id}">
          <td><span class="grievance-id">${g.id}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="assign-avatar">${initials}</div>
              <span style="font-size:0.875rem;font-weight:500;">${g.citizenName}</span>
            </div>
          </td>
          <td style="font-family:var(--font-mono);font-size:0.78rem;color:var(--navy-600);">${g.relatedAppId || '—'}</td>
          <td><span class="category-tag ${getCatClass(g.category)}">${getCatLabel(g.category)}</span></td>
          <td><div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:${getPriorityColor(g.priority)};display:inline-block;flex-shrink:0;"></span><span style="font-weight:600;font-size:0.8125rem;">${g.priority.charAt(0).toUpperCase() + g.priority.slice(1)}</span></div></td>
          <td>
            <span class="badge ${sm.cls}">${sm.label}</span>
            ${sm.srs ? `<div style="font-size:0.6rem;font-family:var(--font-mono);color:var(--color-text-muted);margin-top:2px;">${sm.srs}</div>` : ''}
          </td>
          <td>
            <div class="sla-indicator">
              <div style="flex:1;height:6px;border-radius:3px;background:var(--slate-200);overflow:hidden;">
                <div style="height:100%;background:${sla.status === 'breach' ? 'var(--red-500)' : sla.status === 'warn' ? 'var(--amber-400)' : 'var(--green-500)'};width:${sla.status === 'breach' ? '100' : sla.status === 'warn' ? '70' : '30'}%;border-radius:3px;"></div>
              </div>
              <span class="sla-text ${sla.status}">${sla.text}</span>
            </div>
          </td>
          <td>${formatDate(g.filedDate)}</td>
          <td onclick="event.stopPropagation()">
            <div style="display:flex;gap:4px;">
              <button class="btn-icon" title="Quick View" onclick="window.quickView('${g.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn-icon" title="Open Detail" onclick="window.openDetail('${g.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('') || `<tr><td colspan="10" style="text-align:center;padding:var(--space-xl);color:var(--color-text-muted);">No grievances match your filters</td></tr>`;
  }

  // ── Filters ──
  function applyFilters() {
    filteredData = activeGrievances.filter(g => {
      const matchStatus = currentFilter === 'all' || g.status === currentFilter || (currentFilter === 'breach' && g.slaStatus === 'breach');
      const matchCat = !activeCatFilter || g.category === activeCatFilter;
      const matchSearch = !activeSearchQ ||
        g.id.toLowerCase().includes(activeSearchQ.toLowerCase()) ||
        g.citizenName.toLowerCase().includes(activeSearchQ.toLowerCase()) ||
        g.subject.toLowerCase().includes(activeSearchQ.toLowerCase());
      return matchStatus && matchCat && matchSearch;
    });
    currentPage = 1;
    render();
  }

  // ── Window-exposed functions (called by HTML onclick) ──
  window.filterTable = function (status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    currentFilter = status;
    applyFilters();
  };

  window.filterByStatus = function (status) {
    currentFilter = status;
    const btn = document.querySelector(`[data-filter="${status}"]`);
    if (btn) { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
    applyFilters();
  };

  window.filterByCategory = function (cat) { activeCatFilter = cat; applyFilters(); };

  window.searchTable = function (q) { activeSearchQ = q; applyFilters(); };

  window.sortTable = function (by) {
    filteredData.sort((a, b) => {
      if (by === 'date_desc') return new Date(b.filedDate) - new Date(a.filedDate);
      if (by === 'date_asc') return new Date(a.filedDate) - new Date(b.filedDate);
      if (by === 'priority') { const p = { high: 0, medium: 1, low: 2 }; return (p[a.priority] || 1) - (p[b.priority] || 1); }
      if (by === 'sla') { const s = { breach: 0, warn: 1, safe: 2 }; return (s[a.slaStatus] || 2) - (s[b.slaStatus] || 2); }
      return 0;
    });
    render();
  };

  window.changePage = function (dir) {
    const totalPgs = Math.max(1, Math.ceil(filteredData.length / pageSize));
    currentPage = Math.max(1, Math.min(totalPgs, currentPage + dir));
    render();
  };

  window.changePageSize = function (size) { pageSize = size; currentPage = 1; render(); };


  // ── Quick View Modal ──
  window.quickView = function (id) {
    const g = activeGrievances.find(x => x.id === id) || allGrievances.find(x => x.id === id);
    if (!g) return;
    const sm = getStatusInfo(g.status);
    const sla = getSlaDisplay(g);
    setTextContent('modalGrvId', g.id);
    const actionBtn = document.getElementById('modalActionBtn');
    if (actionBtn) actionBtn.onclick = () => window.openDetail(g.id);
    const modalBody = document.getElementById('modalBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-lg);">
          <div><div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Citizen</div><div style="font-weight:600;">${g.citizenName}</div></div>
          <div><div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Application ID</div><div style="font-family:var(--font-mono);font-size:0.82rem;font-weight:700;color:var(--navy-600);">${g.relatedAppId || '—'}</div></div>
          <div><div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Status</div>
            <div><span class="badge ${sm.cls}">${sm.label}</span>${sm.srs ? `<div style="font-size:0.6rem;font-family:var(--font-mono);color:var(--color-text-muted);margin-top:2px;">${sm.srs}</div>` : ''}</div>
          </div>
          <div><div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Category</div><span class="category-tag ${getCatClass(g.category)}">${getCatLabel(g.category)}</span></div>
          <div><div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Priority</div><div style="font-weight:700;color:${getPriorityColor(g.priority)};">${g.priority.charAt(0).toUpperCase() + g.priority.slice(1)}</div></div>
          <div><div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">SLA</div><span class="sla-text ${sla.status}">${sla.text}</span></div>
          <div><div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Submitted</div><div style="font-size:0.875rem;">${formatDate(g.filedDate)}</div></div>
        </div>
        <div style="font-size:0.72rem;color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Complaint</div>
        <div style="font-size:0.875rem;color:var(--slate-700);line-height:1.6;background:var(--slate-50);padding:var(--space-md);border-radius:var(--radius-md);">${g.description}</div>`;
    }
    openModalEl('quickViewModal');
  };

  window.openDetail = function (id) { window.location.href = `grievance-detail.html?id=${id}`; };

  let _assigningId = '';
  window.openAssign = function (id) { _assigningId = id; openModalEl('assignModal'); };

  window.confirmAssign = function () {
    const officer = document.getElementById('assignOfficer')?.value;
    if (!officer) { showToast('Please select an officer', 'warning'); return; }
    closeModalEl('assignModal');
    showToast(`${_assigningId} reassigned to ${officer}`, 'success');
  };

  window.closeModal = function (id) { closeModalEl(id); };

  function openModalEl(id) { document.getElementById(id)?.classList.add('active'); }
  function closeModalEl(id) { document.getElementById(id)?.classList.remove('active'); }

  // Modal backdrop click
  document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));

  // Initial render
  render();
}

// ── Helper ──
function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ══════════════════════════════════════════
// Auto-init based on data-page attribute
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  switch (page) {
    case 'citizen-dashboard': initCitizenDashboard(); break;
    case 'officer-dashboard': initOfficerDashboard(); break;
    case 'supervisor-dashboard': initSupervisorDashboard(); break;
    case 'admin-dashboard': initAdminDashboard(); break;
    case 'grievance-dashboard': initGrievanceDashboard(); break;
  }
});