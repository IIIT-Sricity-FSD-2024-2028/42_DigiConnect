// ═══════════════════════════════════════════
// crud.js — Generic CRUD operations + Admin page initializers
// ═══════════════════════════════════════════

import { getCollection, setCollection, getUsers, setUsers, getServices, setServices, getApplications, getGrievances, getAuditLogs, setAuditLogs, getSession, getPendingOfficers, setPendingOfficers, getSettings, setSettings } from './state.js';
import { initPage } from './navigation.js';
import { addAuditEntry } from './workflow.js';
import { showToast, generateId, formatDate, formatDateTime, openModal, closeModal } from './utils.js';

// Expose utils
window.showToast = showToast;
window.openModal = function(id) { if(typeof openModal === 'function') openModal(id); else document.getElementById(id).style.display = 'flex'; };
window.closeModal = function(id) { if(typeof closeModal === 'function') closeModal(id); else document.getElementById(id).style.display = 'none'; };

// ── Generic CRUD helpers ──
export function findById(collectionKey, id) { return getCollection(collectionKey).find(i => i.id === id) || null; }
export function addItem(collectionKey, item) { const items = getCollection(collectionKey); items.push(item); setCollection(collectionKey, items); return item; }
export function updateItem(collectionKey, id, updates) { const items = getCollection(collectionKey); const idx = items.findIndex(i => i.id === id); if (idx === -1) return null; items[idx] = { ...items[idx], ...updates }; setCollection(collectionKey, items); return items[idx]; }
export function deleteItem(collectionKey, id) { const items = getCollection(collectionKey); const filtered = items.filter(i => i.id !== id); setCollection(collectionKey, filtered); return filtered.length < items.length; }
export function filterItems(collectionKey, pred) { return getCollection(collectionKey).filter(pred); }

// Manage Users
export function initManageUsers() {
  const session = initPage({ title: 'Manage Users', breadcrumbs: [{ label: 'Super User Portal', href: 'Super User/dashboard.html' }, { label: 'Manage Users' }], requiredRole: 'super_user' });
  if (!session) return;
  const tbody = document.getElementById('usersTableBody');
  let users = getUsers();
  let currentTab = 'all';
  let searchTerm = '';

  window.switchTab = (tab) => {
    currentTab = tab;
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
      btn.style.background = 'transparent';
      btn.style.color = 'inherit';
    });
    const activeBtn = document.getElementById(`tab-${tab}`);
    if (activeBtn) { activeBtn.style.background = 'var(--navy-600)'; activeBtn.style.color = '#fff'; }
    window.filterUsers();
  };

  window.filterUsers = () => {
    searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const status = document.getElementById('statusFilter')?.value || '';
    let filtered = users.filter(u => {
      if (currentTab !== 'all' && u.role.toLowerCase() !== currentTab) return false;
      if (searchTerm && !u.name.toLowerCase().includes(searchTerm) && !u.email.toLowerCase().includes(searchTerm) && !u.id.toLowerCase().includes(searchTerm)) return false;
      if (status && (u.status || 'Active') !== status) return false;
      return true;
    });
    // Add sorting (A-Z by name)
    filtered.sort((a,b) => a.name.localeCompare(b.name));
    renderUsers(filtered);
    if(document.getElementById('userCount')) document.getElementById('userCount').textContent = filtered.length;
    if(document.getElementById('showingCount')) document.getElementById('showingCount').textContent = filtered.length;
    if(document.getElementById('totalCount')) document.getElementById('totalCount').textContent = users.length;
  };

  function renderUsers(list) {
    if (!tbody) return;
    tbody.innerHTML = list.map(u => `
      <tr data-testid="user-row-${u.id}">
        <td><div style="display:flex;align-items:center;gap:var(--space-sm);">
          <div class="avatar" style="width:32px;height:32px;font-size:0.7rem;background:var(--navy-500);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:50%;">${u.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}</div>
          <div><div style="font-weight:600;font-size:0.875rem;">${u.name}</div><div style="font-size:0.75rem;color:var(--color-text-muted);">${u.id}</div></div>
        </div></td>
        <td><span class="badge badge-${u.role === 'super_user' || u.role === 'super_admin' ? 'danger' : u.role === 'officer' ? 'purple' : u.role === 'supervisor' ? 'orange' : u.role === 'grievance' ? 'warning' : 'info'}">${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span></td>
        <td>${u.email}</td>
        <td>${u.phone || '—'}</td>
        <td style="font-size:0.8125rem;color:var(--color-text-muted);">${u.joined || '—'}</td>
        <td><span class="badge badge-${u.status === 'Suspended' ? 'danger' : 'success'}">${u.status || 'Active'}</span></td>
        <td>
          <div style="display:flex;gap:4px;">
            <button class="btn-icon" title="Edit" onclick="editUser('${u.id}')"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
            <button class="btn-icon" title="Delete" style="color:var(--red-500);" onclick="confirmDelete('${u.id}')"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
          </div>
        </td>
      </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:var(--space-xl);">No users found</td></tr>';
  }

  let editModeUserId = null;
  window.editUser = (id) => {
    editModeUserId = id;
    const user = users.find(u => u.id === id);
    if (!user) return;
    document.getElementById('uName').value = user.name || '';
    document.getElementById('uEmail').value = user.email || '';
    document.getElementById('uRole').value = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('uPhone').value = user.phone || '';
    document.getElementById('uStatus').value = user.status || 'Active';
    document.getElementById('addUserModalTitle').textContent = 'Edit User';
    window.openModal('addUserModal');
  };
  window.openAddUserModal = () => {
    editModeUserId = null;
    document.getElementById('uName').value = '';
    document.getElementById('uEmail').value = '';
    document.getElementById('uRole').value = '';
    document.getElementById('uPhone').value = '';
    document.getElementById('uStatus').value = 'Active';
    document.getElementById('addUserModalTitle').textContent = 'Add New User';
    window.openModal('addUserModal');
  };
  window.saveUser = () => {
    const name = document.getElementById('uName').value.trim();
    const email = document.getElementById('uEmail').value.trim();
    const role = document.getElementById('uRole').value.toLowerCase();
    const phone = document.getElementById('uPhone').value.trim();
    const status = document.getElementById('uStatus').value;
    if (!name || !email || !role) { if(window.showToast) window.showToast('Fill required fields','warning'); return; }
    if (editModeUserId) {
      const u = users.find(u => u.id === editModeUserId);
      Object.assign(u, {name, email, role, phone, status});
      setUsers(users);
      addAuditEntry('User Updated', `Updated user ${name}`);
      if(window.showToast) window.showToast('User updated','success');
    } else {
      users.push({ id: generateId('USR'), name, email, role, phone, status, password: 'password123' });
      setUsers(users);
      addAuditEntry('User Created', `Created user ${name}`);
      if(window.showToast) window.showToast('User created','success');
    }
    window.closeModal('addUserModal');
    window.filterUsers();
    window.updateUsersStats();
  };

  let deleteCandidate = null;
  window.confirmDelete = (id) => { deleteCandidate = id; const u = users.find(u=>u.id===id); if(document.getElementById('deleteUserName')) document.getElementById('deleteUserName').textContent = u?.name || 'User'; window.openModal('deleteUserModal'); };
  window.confirmDeleteUser = () => {
    if(deleteCandidate) {
      deleteItem('users', deleteCandidate);
      users = getUsers();
      addAuditEntry('User Deleted', `Deleted user ${deleteCandidate}`);
      if(window.showToast) window.showToast('User deleted','success');
      window.closeModal('deleteUserModal');
      window.filterUsers();
      window.updateUsersStats();
    }
  };

  window.updateUsersStats = () => {
      const uList = getUsers();
      if(document.getElementById('mu-total')) document.getElementById('mu-total').textContent = uList.length.toLocaleString();
      if(document.getElementById('mu-citizens')) document.getElementById('mu-citizens').textContent = uList.filter(u => u.role === 'citizen').length.toLocaleString();
      if(document.getElementById('mu-officers')) document.getElementById('mu-officers').textContent = uList.filter(u => u.role === 'officer').length.toLocaleString();
      if(document.getElementById('mu-supervisors')) document.getElementById('mu-supervisors').textContent = uList.filter(u => u.role === 'supervisor').length.toLocaleString();
      if(document.getElementById('mu-grievance')) document.getElementById('mu-grievance').textContent = uList.filter(u => u.role === 'grievance').length.toLocaleString();
      if(document.getElementById('mu-admins')) document.getElementById('mu-admins').textContent = uList.filter(u => ['super_user','super_admin'].includes(u.role)).length.toLocaleString();
      if(document.getElementById('mu-suspended')) document.getElementById('mu-suspended').textContent = uList.filter(u => u.status === 'Suspended').length.toLocaleString();
  };

  window.filterUsers();
  window.updateUsersStats();
  window.exportUsers = () => { if(window.showToast) window.showToast('Export triggered','info'); };
  window.toggleRoleFields = () => {};
}

// Manage Services
export function initManageServices() {
  const session = initPage({ title: 'Manage Services', breadcrumbs: [{ label: 'Super User Portal', href: 'Super User/dashboard.html' }, { label: 'Manage Services' }], requiredRole: 'super_user' });
  if (!session) return;
  
  let currentView = 'grid';
  let currentModalStep = 1;
  const totalModalSteps = 4;
  let allServices = getServices();
  let filteredServices = [...allServices];

  window.renderGrid = () => {
    const grid = document.getElementById('servicesGrid');
    if(!grid) return;
    grid.innerHTML = filteredServices.map(s => `
      <div class="card" style="transition:all 0.2s;cursor:pointer;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="height:4px;background:${s.status === 'Active' ? s.color : 'var(--slate-300)'};border-radius:var(--radius-lg) var(--radius-lg) 0 0;"></div>
          <div class="card-body">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:var(--space-md);">
                  <div style="display:flex;align-items:center;gap:var(--space-sm);">
                      <div style="width:40px;height:40px;border-radius:var(--radius-md);background:${s.status === 'Active' ? s.color + '22' : 'var(--slate-100)'};display:flex;align-items:center;justify-content:center;color:${s.status === 'Active' ? s.color : 'var(--slate-400)'};">
                          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      </div>
                      <div>
                          <div style="font-size:0.9375rem;font-weight:700;color:var(--navy-900);">${s.name}</div>
                          <div style="font-size:0.75rem;color:var(--color-text-muted);">${s.dept}</div>
                      </div>
                  </div>
                  <span class="badge ${s.status === 'Active' ? 'badge-success' : s.status === 'Draft' ? 'badge-neutral' : 'badge-danger'}">${s.status}</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);margin-bottom:var(--space-md);">
                  <div style="background:var(--slate-50);padding:8px 12px;border-radius:var(--radius-sm);"><div style="font-size:0.7rem;color:var(--color-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">SLA</div><div style="font-size:0.9375rem;font-weight:700;color:var(--navy-900);">${s.sla} days</div></div>
                  <div style="background:var(--slate-50);padding:8px 12px;border-radius:var(--radius-sm);"><div style="font-size:0.7rem;color:var(--color-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Fee</div><div style="font-size:0.9375rem;font-weight:700;color:var(--navy-900);">${s.fee === 0 ? 'Free' : '₹' + s.fee}</div></div>
                  <div style="background:var(--slate-50);padding:8px 12px;border-radius:var(--radius-sm);"><div style="font-size:0.7rem;color:var(--color-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Req. Docs</div><div style="font-size:0.9375rem;font-weight:700;color:var(--navy-900);">${s.docs.length}</div></div>
                  <div style="background:var(--slate-50);padding:8px 12px;border-radius:var(--radius-sm);"><div style="font-size:0.7rem;color:var(--color-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Applications</div><div style="font-size:0.9375rem;font-weight:700;color:var(--navy-900);">${s.apps ? s.apps.toLocaleString() : '0'}</div></div>
              </div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  <span class="badge ${s.cat === 'Certificate' ? 'badge-info' : s.cat === 'Welfare' ? 'badge-success' : s.cat === 'Permission' ? 'badge-warning' : 'badge-purple'}">${s.cat}</span>
                  <span class="badge badge-neutral">${s.stages || 3} stages</span>
              </div>
          </div>
          <div class="card-footer" style="display:flex;gap:8px;justify-content:flex-end;">
              <button class="btn btn-outline btn-sm" onclick="openServiceModal('${s.id}')"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Edit</button>
              ${s.status === 'Active'
                  ? `<button class="btn btn-outline btn-sm" onclick="confirmDelete('${s.id}')" style="color:var(--red-500);border-color:var(--red-500);">Deactivate</button>`
                  : `<button class="btn btn-success btn-sm" onclick="activateService('${s.id}')">Activate</button>`}
          </div>
      </div>
    `).join('');
  };

  window.renderList = () => {
    const listBody = document.getElementById('servicesListBody');
    if(!listBody) return;
    listBody.innerHTML = filteredServices.map(s => `
      <tr>
          <td style="font-weight:600;color:var(--navy-900);">${s.name}</td>
          <td><span class="badge ${s.cat === 'Certificate' ? 'badge-info' : s.cat === 'Welfare' ? 'badge-success' : s.cat === 'Permission' ? 'badge-warning' : 'badge-purple'}">${s.cat}</span></td>
          <td>${s.sla} days</td>
          <td>${s.fee === 0 ? 'Free' : '₹' + s.fee}</td>
          <td>${s.docs.length}</td>
          <td>${s.stages || 3}</td>
          <td><span class="badge ${s.status === 'Active' ? 'badge-success' : s.status === 'Draft' ? 'badge-neutral' : 'badge-danger'}">${s.status}</span></td>
          <td>
              <div style="display:flex;gap:4px;">
                  <button class="btn btn-outline btn-sm" onclick="openServiceModal('${s.id}')" style="font-size:0.72rem;padding:4px 10px;">Edit</button>
                  ${s.status === 'Active'
                      ? `<button class="btn btn-sm" onclick="confirmDelete('${s.id}')" style="font-size:0.72rem;padding:4px 10px;background:var(--red-100);color:var(--red-500);border:1px solid var(--red-500);">Deactivate</button>`
                      : `<button class="btn btn-success btn-sm" onclick="activateService('${s.id}')" style="font-size:0.72rem;padding:4px 10px;">Activate</button>`}
              </div>
          </td>
      </tr>
    `).join('');
  };

  window.setView = (v) => {
    currentView = v;
    document.getElementById('servicesGrid').style.display = v === 'grid' ? 'grid' : 'none';
    document.getElementById('servicesList').style.display = v === 'list' ? 'block' : 'none';
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    if(gridViewBtn) {
        gridViewBtn.style.background = v === 'grid' ? 'var(--navy-100)' : '';
        gridViewBtn.style.color = v === 'grid' ? 'var(--navy-600)' : '';
    }
    if(listViewBtn) {
        listViewBtn.style.background = v === 'list' ? 'var(--navy-100)' : '';
        listViewBtn.style.color = v === 'list' ? 'var(--navy-600)' : '';
    }
    window.renderList();
  };

  window.filterServices = (q) => { filteredServices = allServices.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.cat.toLowerCase().includes(q.toLowerCase())); window.renderGrid(); window.renderList(); };
  window.filterByCategory = (cat) => { filteredServices = cat ? allServices.filter(s => s.cat === cat) : [...allServices]; window.renderGrid(); window.renderList(); };
  window.filterByStatus = (st) => { filteredServices = st ? allServices.filter(s => s.status === st) : [...allServices]; window.renderGrid(); window.renderList(); };

  const defaultDocs = ['Aadhaar Card (Self-attested)', 'Ration Card', 'Income Proof'];
  const defaultStages = [
      { stage: 'Document Verification', role: 'Department Officer (VRO)', days: 2 },
      { stage: 'Field Verification', role: 'Department Officer (RI)', days: 3 },
      { stage: 'Approval & Issue', role: 'Department Supervisor (MRO)', days: 2 },
  ];

  let currentEditServiceId = null;

  window.openServiceModal = (id) => {
      currentEditServiceId = typeof id === 'string' ? id : null;
      currentModalStep = 1;
      document.getElementById('modalTitle').textContent = currentEditServiceId ? 'Edit Service' : 'Add New Service';
      
      const s = currentEditServiceId ? allServices.find(x => x.id === currentEditServiceId) : null;
      document.getElementById('svcName').value = s ? s.name : '';
      document.getElementById('svcCategory').value = s ? s.cat : '';
      document.getElementById('svcSla').value = s ? s.sla : '';
      document.getElementById('svcFee').value = s ? s.fee : 0;
      
      window.updateModalStep();
      document.getElementById('docList').innerHTML = (s && s.docs ? s.docs : defaultDocs).map(d => window.createDocRow(d)).join('');
      document.getElementById('workflowList').innerHTML = defaultStages.map(stg => window.createStageRow(stg.stage, stg.role, stg.days)).join('');
      document.getElementById('serviceModal').classList.add('active');
  };

  window.createDocRow = (name = '') => {
      return `<div style="display:flex;gap:8px;align-items:center;">
          <input type="text" class="form-input" value="${name}" placeholder="Document name" style="flex:1;" />
          <select class="form-input" style="width:120px;padding:10px 30px 10px 10px;"><option>Mandatory</option><option>Optional</option></select>
          <button class="btn-icon" onclick="this.parentElement.remove()" style="color:var(--red-500);flex-shrink:0;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>`;
  };
  window.addDocRow = () => { document.getElementById('docList').insertAdjacentHTML('beforeend', window.createDocRow()); };

  window.createStageRow = (stage = '', role = '', days = 1) => {
      return `<div style="display:flex;gap:8px;align-items:center;background:var(--slate-50);padding:10px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
          <svg width="14" height="14" fill="none" stroke="var(--slate-400)" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;cursor:grab;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"/></svg>
          <input type="text" class="form-input" value="${stage}" placeholder="Stage name" style="flex:2;" />
          <select class="form-input" style="flex:2;padding:10px 30px 10px 10px;">
              <option ${role.includes('VRO') ? 'selected' : ''}>Department Officer (VRO)</option>
              <option ${role.includes('RI') ? 'selected' : ''}>Department Officer (RI)</option>
              <option ${role.includes('MRO') ? 'selected' : ''}>Department Supervisor (MRO)</option>
              <option ${role.includes('Welfare') ? 'selected' : ''}>Welfare Officer</option>
              <option ${role.includes('Grievance') ? 'selected' : ''}>Grievance Officer</option>
          </select>
          <input type="number" class="form-input" value="${days}" placeholder="Days" style="width:70px;" min="1" />
          <button class="btn-icon" onclick="this.parentElement.remove()" style="color:var(--red-500);flex-shrink:0;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>`;
  };
  window.addWorkflowStage = () => { document.getElementById('workflowList').insertAdjacentHTML('beforeend', window.createStageRow()); };

  window.closeModal = window.closeModal || function(id) {
      if(id && typeof id === 'string') {
          const el = document.getElementById(id);
          if(el) el.classList.remove('active');
      } else {
          document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
  };

  window.modalStep = (dir) => {
      if (dir === 1 && currentModalStep === 1) {
          const name = document.getElementById('svcName').value.trim();
          const cat = document.getElementById('svcCategory').value;
          const sla = document.getElementById('svcSla').value;
          document.getElementById('svcNameErr').style.display = name ? 'none' : 'block';
          document.getElementById('svcCatErr').style.display = cat ? 'none' : 'block';
          document.getElementById('svcSlaErr').style.display = sla ? 'none' : 'block';
          if (!name || !cat || !sla) return;
      }
      
      let nextStep = currentModalStep + dir;
      if (dir === 1 && currentModalStep === totalModalSteps) { 
          const name = document.getElementById('svcName').value.trim();
          const cat = document.getElementById('svcCategory').value;
          const sla = parseInt(document.getElementById('svcSla').value || '0', 10);
          const fee = parseInt(document.getElementById('svcFee').value || '0', 10);
          
          let status = 'Draft';
          document.querySelectorAll('input[name="activate"]').forEach(r => {
              if (r.checked && r.value === 'yes') status = 'Active';
          });

          if (currentEditServiceId) {
              const svcIndex = allServices.findIndex(s => s.id === currentEditServiceId);
              if (svcIndex !== -1) {
                  allServices[svcIndex].name = name;
                  allServices[svcIndex].cat = cat;
                  allServices[svcIndex].sla = sla;
                  allServices[svcIndex].fee = fee;
                  allServices[svcIndex].status = status;
              }
          } else {
              const dept = document.getElementById('svcDept').value || 'Unknown';
              allServices.push({
                  id: 'SVC-' + Math.floor(Math.random() * 900 + 100),
                  name, cat, sla, fee, status, dept,
                  docs: defaultDocs, stages: 3, apps: 0, icon: 'cert', color: 'var(--navy-500)'
              });
          }
          
          // Persist changes to local storage via state.js
          if(typeof setServices === 'function') setServices(allServices);

          // Force local filter arrays to mimic new data
          filteredServices = [...allServices];
          
          window.closeModal('serviceModal'); 
          if(window.showToast) window.showToast('Service saved successfully!', 'success'); 
          window.renderList();
          window.renderGrid();
          return; 
      }
      
      currentModalStep = Math.max(1, Math.min(totalModalSteps, nextStep));
      window.updateModalStep();
  };

  window.updateModalStep = () => {
      for (let i = 1; i <= totalModalSteps; i++) { 
          const el = document.getElementById('mStep' + i); 
          if (el) el.style.display = i === currentModalStep ? 'block' : 'none'; 
      }
      document.querySelectorAll('#modalStepper .stepper-step').forEach((s, i) => { 
          s.classList.toggle('active', i + 1 === currentModalStep); 
          s.classList.toggle('completed', i + 1 < currentModalStep); 
      });
      document.getElementById('modalBackBtn').style.display = currentModalStep > 1 ? 'flex' : 'none';
      document.getElementById('modalNextBtn').textContent = currentModalStep === totalModalSteps ? '✓ Save Service' : 'Continue →';
  };

  let serviceToDeactivate = null;

  window.confirmDelete = (id) => { 
      const s = allServices.find(x => x.id === id);
      if(!s) return;
      serviceToDeactivate = id;
      document.getElementById('deleteServiceName').textContent = s.name; 
      document.getElementById('deleteModal').classList.add('active'); 
  };
  
  window.confirmDeactivate = () => { 
      document.getElementById('deleteModal').classList.remove('active'); 
      if (!serviceToDeactivate) return;
      const sIndex = allServices.findIndex(x => x.id === serviceToDeactivate);
      if(sIndex !== -1) {
          allServices[sIndex].status = 'Inactive';
          if(typeof setServices === 'function') setServices(allServices);
          filteredServices = [...allServices];
          window.renderGrid();
          window.renderList();
          if(window.showToast) window.showToast(`"${allServices[sIndex].name}" deactivated successfully.`, 'warning'); 
      }
      serviceToDeactivate = null;
  };
  
  window.activateService = (id) => { 
      const sIndex = allServices.findIndex(x => x.id === id);
      if(sIndex !== -1) {
          allServices[sIndex].status = 'Active';
          if(typeof setServices === 'function') setServices(allServices);
          filteredServices = [...allServices];
          window.renderGrid();
          window.renderList();
          if(window.showToast) window.showToast(`"${allServices[sIndex].name}" activated successfully!`, 'success'); 
      }
  };

  // Initial render setup
  window.renderGrid();
  window.renderList();
}

// Workflow Config
export function initWorkflowConfig() {
  const session = initPage({ title: 'Workflow Configuration', breadcrumbs: [{ label: 'Super User Portal', href: 'Super User/dashboard.html' }, { label: 'Workflow Config' }], requiredRole: 'super_user' });
  if (!session) return;
  
  const WORKFLOWS = [
      {
          id: 1, service: 'Income Certificate', dept: 'Revenue Department', status: 'Active',
          stages: [
              { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
              { name: 'Field Verification', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
              { name: 'Approval & Issue', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
          ]
      },
      {
          id: 2, service: 'Caste Certificate', dept: 'Revenue Department', status: 'Active',
          stages: [
              { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
              { name: 'Community Verification', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
              { name: 'Final Approval', role: 'Dept. Supervisor (MRO)', days: 2, type: 'supervisor' },
          ]
      },
      {
          id: 3, service: 'Welfare / Subsidy Scheme', dept: 'Welfare Department', status: 'Active',
          stages: [
              { name: 'Eligibility Check', role: 'Welfare Officer', days: 3, type: 'officer' },
              { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 3, type: 'officer' },
              { name: 'Field Survey', role: 'Dept. Officer (RI)', days: 4, type: 'officer' },
              { name: 'Approval & Disbursement', role: 'Dept. Supervisor (MRO)', days: 4, type: 'supervisor' },
          ]
      },
      {
          id: 4, service: 'Event Permission', dept: 'Municipal Corporation', status: 'Active',
          stages: [
              { name: 'Application Review', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
              { name: 'Permission Grant', role: 'Dept. Supervisor (MRO)', days: 3, type: 'supervisor' },
          ]
      },
      {
          id: 5, service: 'Record Correction', dept: 'Revenue Department', status: 'Active',
          stages: [
              { name: 'Document Review', role: 'Dept. Officer (VRO)', days: 3, type: 'officer' },
              { name: 'Original Record Verification', role: 'Dept. Officer (RI)', days: 3, type: 'officer' },
              { name: 'Correction Approval', role: 'Dept. Supervisor (MRO)', days: 4, type: 'supervisor' },
          ]
      },
      {
          id: 6, service: 'Marriage Certificate', dept: 'Revenue Department', status: 'Draft',
          stages: [
              { name: 'Document Verification', role: 'Dept. Officer (VRO)', days: 2, type: 'officer' },
              { name: 'Approval & Issue', role: 'Dept. Supervisor (MRO)', days: 5, type: 'supervisor' },
          ]
      },
  ];
  const allServicesData = getServices();
  WORKFLOWS.forEach(w => {
      const dbSvc = allServicesData.find(s => s.name === w.service);
      if (dbSvc) w.status = dbSvc.status;
  });

  let filteredWorkflows = [...WORKFLOWS];
  window.renderWorkflows = () => {
      const container = document.getElementById('workflowContainer');
      if (!container) return;
      if (filteredWorkflows.length === 0) {
          container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-text-muted);">No workflows found.</div>`;
          return;
      }
      container.innerHTML = filteredWorkflows.map(w => `
          <div class="workflow-card" id="wf-${w.id}">
              <div class="workflow-card-header">
                  <div style="display:flex;align-items:center;gap:var(--space-md);">
                      <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--navy-50);display:flex;align-items:center;justify-content:center;color:var(--navy-600);">
                          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
                      </div>
                      <div>
                          <div style="font-size:1rem;font-weight:700;color:var(--navy-900);">${w.service}</div>
                          <div style="font-size:0.8rem;color:var(--color-text-muted);">${w.dept} · ${w.stages.length} stages · Total SLA: ${w.stages.reduce((a,s)=>a+s.days,0)} days</div>
                      </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;">
                      <span class="badge ${w.status === 'Active' ? 'badge-success' : 'badge-neutral'}">${w.status}</span>
                      <button class="btn btn-outline btn-sm" onclick="toggleEdit(${w.id})">
                          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          Edit Stages
                      </button>
                  </div>
              </div>

              <!-- Visual Stage Flow -->
              <div class="stage-block">
                  <div class="stage-item">
                      <div class="stage-pill" style="background:var(--slate-100);border-color:var(--slate-300);color:var(--slate-600);font-size:0.75rem;">Citizen Submits</div>
                  </div>
                  ${w.stages.map((s, i) => `
                      <div class="stage-arrow">→</div>
                      <div class="stage-item" onclick="openEditStage('${s.name}','${s.role}',${s.days})">
                          <div class="stage-pill ${s.type}">${s.name}</div>
                          <div class="stage-role">${s.role}</div>
                          <div class="stage-days">${s.days} day${s.days > 1 ? 's' : ''}</div>
                      </div>
                  `).join('')}
                  <div class="stage-arrow">→</div>
                  <div class="stage-item">
                      <div class="stage-pill" style="background:#f0fdf4;border-color:#86efac;color:#166534;">Final Decision</div>
                  </div>
              </div>

              <!-- Edit Stages Form (inline) -->
              <div class="edit-stages-form" id="editForm-${w.id}">
                  <h4 style="font-weight:700;color:var(--navy-900);margin-bottom:var(--space-md);">Edit Stages for "${w.service}"</h4>
                  <div id="stagesList-${w.id}" style="display:flex;flex-direction:column;gap:var(--space-sm);">
                      ${w.stages.map((s, i) => `
                          <div style="display:flex;gap:8px;align-items:center;background:var(--slate-50);padding:10px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
                              <span style="font-size:0.75rem;font-weight:700;color:var(--navy-600);min-width:20px;">${i+1}.</span>
                              <input type="text" class="form-input" value="${s.name}" style="flex:2;" placeholder="Stage name" />
                              <select class="form-input" style="flex:2;padding:10px 30px 10px 10px;">
                                  <option ${s.role.includes('VRO') ? 'selected':''}>Dept. Officer (VRO)</option>
                                  <option ${s.role.includes('RI') ? 'selected':''}>Dept. Officer (RI)</option>
                                  <option ${s.role.includes('MRO') ? 'selected':''}>Dept. Supervisor (MRO)</option>
                                  <option ${s.role.includes('Welfare') ? 'selected':''}>Welfare Officer</option>
                                  <option ${s.role.includes('Grievance') ? 'selected':''}>Grievance Officer</option>
                              </select>
                              <input type="number" class="form-input" value="${s.days}" style="width:70px;" min="1" />
                              <button class="btn-icon" onclick="this.parentElement.remove()" style="color:var(--red-500);"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
                          </div>
                      `).join('')}
                  </div>
                  <div style="display:flex;gap:8px;margin-top:var(--space-md);">
                      <button class="btn btn-outline btn-sm" onclick="addStageRow(${w.id})">+ Add Stage</button>
                      <button class="btn btn-primary btn-sm" style="margin-left:auto;" onclick="saveWorkflow(${w.id})">
                          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          Save Workflow
                      </button>
                      <button class="btn btn-ghost btn-sm" onclick="toggleEdit(${w.id})">Cancel</button>
                  </div>
              </div>
          </div>
      `).join('');
  }

  window.filterWorkflows = (q) => {
      filteredWorkflows = q ? WORKFLOWS.filter(w => w.service.toLowerCase().includes(q.toLowerCase())) : [...WORKFLOWS];
      window.renderWorkflows();
  }

  window.filterByDept = (dept) => {
      filteredWorkflows = dept ? WORKFLOWS.filter(w => w.dept === dept) : [...WORKFLOWS];
      window.renderWorkflows();
  }

  window.toggleEdit = (id) => {
      const form = document.getElementById('editForm-' + id);
      if (form && !form.classList.contains('open')) {
          const w = WORKFLOWS.find(x => x.id === id);
          if (w && w.status === 'Inactive') {
              if (window.showToast) window.showToast('Unable to edit deactivated service.', 'danger');
              return;
          }
      }
      if(form) form.classList.toggle('open');
  }

  window.addStageRow = (id) => {
      const list = document.getElementById('stagesList-' + id);
      const count = list.children.length + 1;
      list.insertAdjacentHTML('beforeend', `
          <div style="display:flex;gap:8px;align-items:center;background:var(--slate-50);padding:10px;border-radius:var(--radius-md);border:1px solid var(--color-border);">
              <span style="font-size:0.75rem;font-weight:700;color:var(--navy-600);min-width:20px;">${count}.</span>
              <input type="text" class="form-input" value="" style="flex:2;" placeholder="Stage name" />
              <select class="form-input" style="flex:2;padding:10px 30px 10px 10px;">
                  <option>Dept. Officer (VRO)</option>
                  <option>Dept. Officer (RI)</option>
                  <option>Dept. Supervisor (MRO)</option>
                  <option>Welfare Officer</option>
                  <option>Grievance Officer</option>
              </select>
              <input type="number" class="form-input" value="2" style="width:70px;" min="1" />
              <button class="btn-icon" onclick="this.parentElement.remove()" style="color:var(--red-500);"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
      `);
  }

  window.saveWorkflow = (id) => {
      const w = WORKFLOWS.find(x => x.id === id);
      if(!w) return;
      
      const listContainer = document.getElementById('stagesList-' + id);
      if(listContainer) {
          const newStages = [];
          Array.from(listContainer.children).forEach(row => {
              const nameInput = row.querySelector('input[type="text"]');
              const roleSelect = row.querySelector('select');
              const daysInput = row.querySelector('input[type="number"]');
              
              if(nameInput && roleSelect && daysInput) {
                  const roleValue = roleSelect.value;
                  newStages.push({
                      name: nameInput.value || 'Unnamed Stage',
                      role: roleValue,
                      days: parseInt(daysInput.value, 10) || 1,
                      type: roleValue.includes('Supervisor') || roleValue.includes('MRO') ? 'supervisor' : 'officer'
                  });
              }
          });
          w.stages = newStages;
      }
      
      window.renderWorkflows();
      if(window.showToast) window.showToast('Workflow updated successfully!', 'success');
  };

  window.openEditStage = (name, role, days) => {
      document.getElementById('editStageName').value = name;
      document.getElementById('editStageRole').value = role;
      document.getElementById('editStageDays').value = days;
      const m = document.getElementById('editStageModal');
      if(m) m.classList.add('active');
  }

  window.saveStage = () => {
      const m = document.getElementById('editStageModal');
      if(m) m.classList.remove('active');
      if(window.showToast) window.showToast('Stage updated successfully!', 'success');
  }

  // Ensure modals close out active class, without conflict from `style.display = none`
  const originalCloseModal = window.closeModal;
  window.closeModal = (id) => {
      const el = document.getElementById(id);
      if(el) { el.classList.remove('active'); }
      if (originalCloseModal) originalCloseModal(id);
  };

  window.renderWorkflows();
}

// Officer Onboarding
export function initOfficerOnboarding() {
  const session = initPage({ title: 'Officer Onboarding', breadcrumbs: [{ label: 'Super User Portal', href: 'Super User/dashboard.html' }, { label: 'Officer Onboarding' }], requiredRole: 'super_user' });
  if (!session) return;
  
  const SERVICES_LIST = ['Income Certificate','Caste Certificate','Residence Certificate','Welfare Scheme','Scholarship','Event Permission','Record Correction'];
  
  let OFFICERS = getUsers().filter(u => ['officer', 'supervisor', 'grievance'].includes(u.role));
  let filteredOfficers = [...OFFICERS];

  const serviceGrid = document.getElementById('serviceAssignGrid');
  if (serviceGrid) {
      serviceGrid.innerHTML = SERVICES_LIST.map(s => `
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.8125rem;padding:6px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);">
              <input type="checkbox" style="accent-color:var(--navy-600);" /> ${s}
          </label>
      `).join('');
  }


  window.renderOfficersTable = () => {
      const tbody = document.getElementById('officersTable');
      if (!tbody) return;
      tbody.innerHTML = filteredOfficers.map(o => {
          const isSuspended = o.status === 'Suspended';
          return `
          <tr style="${isSuspended ? 'opacity:0.8; background:var(--red-50);' : ''}">
              <td>
                  <div style="display:flex;align-items:center;gap:10px;">
                      <div class="avatar" style="font-size:0.75rem; ${isSuspended ? 'background:var(--red-200); color:var(--red-800);' : ''}">${o.name.split(' ').map(n=>n[0]).join('')}</div>
                      <div>
                          <div style="font-weight:600;color:var(--navy-900); ${isSuspended ? 'text-decoration:line-through; color:var(--red-800);' : ''}">${o.name}</div>
                          <div style="font-size:0.72rem;color:var(--color-text-muted);font-family:var(--font-mono);">${o.id}</div>
                      </div>
                  </div>
              </td>
              <td><span class="badge badge-info">${o.title || o.role}</span></td>
              <td style="font-size:0.8125rem;">${o.dept}</td>
              <td><div style="display:flex;flex-wrap:wrap;gap:3px;">${o.services.map(s=>`<span class="badge badge-neutral" style="font-size:0.65rem;">${s}</span>`).join('')}</div></td>
              <td><span style="font-weight:700;color:var(--navy-900);">${o.cases}</span></td>
              <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                      <div class="sla-bar" style="width:60px;height:5px;background:var(--slate-100);border-radius:2px;overflow:hidden;"><div class="sla-fill ${o.sla>=90?'safe':o.sla>=75?'warn':'breach'}" style="width:${o.sla}%;height:100%;background:${o.sla>=90?'var(--green-500)':o.sla>=75?'var(--amber-500)':'var(--red-500)'};"></div></div>
                      <span style="font-size:0.8125rem;font-weight:600;color:${o.sla>=90?'var(--green-500)':o.sla>=75?'var(--amber-500)':'var(--red-500)'};">${o.sla}%</span>
                  </div>
              </td>
              <td><span class="badge ${isSuspended ? 'badge-danger' : 'badge-success'}">${o.status}</span></td>
              <td>
                  <div style="display:flex;gap:4px;">
                      <button class="btn-icon" title="View" onclick="viewOfficer('${o.id}')"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                      
                      <button class="btn-icon" title="Edit" onclick="${isSuspended ? `showToast('Cannot edit a suspended officer.','error')` : `openAddModal('${o.id}')`}" ${isSuspended ? 'style="opacity:0.4;cursor:not-allowed;"' : ''}><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      
                      ${isSuspended ? `<button class="btn-icon" title="Restore" onclick="restoreOfficer('${o.id}')" style="color:var(--green-600);"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>` 
                      : `<button class="btn-icon" title="Suspend" onclick="suspendOfficer('${o.id}')" style="color:var(--red-500);"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></button>`}
                  </div>
              </td>
          </tr>
          `;
      }).join('');
  }

  window.filterOfficers = (q) => { filteredOfficers = q ? OFFICERS.filter(o=>o.name.toLowerCase().includes(q.toLowerCase())||(o.title||o.role).toLowerCase().includes(q.toLowerCase())) : [...OFFICERS]; window.renderOfficersTable(); }
  window.filterByRole = (role) => { filteredOfficers = role ? OFFICERS.filter(o=>(o.title||o.role)===role) : [...OFFICERS]; window.renderOfficersTable(); }
  window.filterByStatus = (st) => { filteredOfficers = st ? OFFICERS.filter(o=>o.status===st) : [...OFFICERS]; window.renderOfficersTable(); }

  let currentEditOfficerId = null;

  window.openAddModal = (id) => { 
      currentEditOfficerId = typeof id === 'string' ? id : null;
      const title = document.getElementById('officerModalTitle');
      const submitBtn = document.querySelector('#addOfficerModal .modal-footer .btn-primary');
      const uploadZone = document.querySelector('#addOfficerModal .upload-zone')?.parentElement;
      const casesZone = document.querySelector('#addOfficerModal input[type="number"]')?.parentElement;
      
      document.getElementById('ofFirstName').value = '';
      document.getElementById('ofLastName').value = '';
      document.getElementById('ofEmpId').value = '';
      document.getElementById('ofEmpId').readOnly = false;
      document.getElementById('ofRole').value = '';
      document.getElementById('ofDept').value = '';
      document.getElementById('ofJurisdiction').value = '';
      document.getElementById('ofPhone').value = '';
      document.getElementById('ofEmail').value = '';
      document.querySelectorAll('#serviceAssignGrid input').forEach(c => c.checked = false);

      if (currentEditOfficerId) {
          if (title) title.textContent = 'Edit Officer Details';
          if (submitBtn) submitBtn.innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Save Changes';
          if (uploadZone) uploadZone.style.display = 'none';
          if (casesZone) casesZone.style.display = 'none';
          
          const o = OFFICERS.find(x => x.id === currentEditOfficerId);
          if (o) {
              const names = o.name.split(' ');
              document.getElementById('ofFirstName').value = names[0] || '';
              document.getElementById('ofLastName').value = names.slice(1).join(' ') || '';
              document.getElementById('ofEmpId').value = o.id;
              document.getElementById('ofEmpId').readOnly = true;
              document.getElementById('ofRole').value = o.title || o.role;
              document.getElementById('ofDept').value = o.dept;
              document.getElementById('ofJurisdiction').value = o.jurisdiction;
              document.getElementById('ofPhone').value = o.phone;
              document.getElementById('ofEmail').value = o.email;
              
              const checkboxes = document.querySelectorAll('#serviceAssignGrid label');
              checkboxes.forEach(lbl => {
                  if(o.services.includes(lbl.textContent.trim())) {
                      lbl.querySelector('input').checked = true;
                  }
              });
          }
      } else {
          if (title) title.textContent = 'Add New Officer';
          if (submitBtn) submitBtn.innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Add & Send Credentials';
          if (uploadZone) uploadZone.style.display = 'block';
          if (casesZone) casesZone.style.display = 'block';
      }

      const m = document.getElementById('addOfficerModal');
      if(m) m.classList.add('active'); 
  }
  
  window.viewOfficer = (id) => {
      const o = OFFICERS.find(x=>x.id===id);
      if (!o) return;
      const b = document.getElementById('viewOfficerBody');
      if(b) b.innerHTML = `
          <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);">
              <div class="avatar" style="width:56px;height:56px;font-size:1.125rem;">${o.name.split(' ').map(n=>n[0]).join('')}</div>
              <div>
                  <div style="font-size:1.125rem;font-weight:700;color:var(--navy-900);">${o.name}</div>
                  <div style="font-size:0.875rem;color:var(--color-text-muted);">${o.title || o.role} · ${o.dept}</div>
                  <span class="badge ${o.status === 'Suspended' ? 'badge-danger' : 'badge-success'}" style="margin-top:4px;">${o.status}</span>
              </div>
          </div>
          <div class="review-card" style="padding:var(--space-md);background:var(--slate-50);border-radius:var(--radius-md);"><div class="review-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);">
              <div class="review-item"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">Employee ID</span><span class="review-value" style="font-weight:600;font-family:var(--font-mono);">${o.id}</span></div>
              <div class="review-item"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">Jurisdiction</span><span class="review-value" style="font-weight:600;">${o.jurisdiction}</span></div>
              <div class="review-item"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">Email</span><span class="review-value" style="font-weight:600;">${o.email}</span></div>
              <div class="review-item"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">Phone</span><span class="review-value" style="font-weight:600;">${o.phone}</span></div>
              <div class="review-item"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">Joined</span><span class="review-value" style="font-weight:600;">${o.joined}</span></div>
              <div class="review-item"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">Active Cases</span><span class="review-value" style="font-weight:600;">${o.cases}</span></div>
              <div class="review-item"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">SLA Rate</span><span class="review-value" style="color:var(--green-500);font-weight:700;">${o.sla}%</span></div>
              <div class="review-item" style="grid-column:1/-1;"><span class="review-key" style="font-size:0.75rem;color:var(--color-text-muted);display:block;">Services</span><span class="review-value" style="display:flex;flex-wrap:wrap;gap:4px;">${o.services.map(s=>`<span class="badge badge-info">${s}</span>`).join('')}</span></div>
          </div></div>
      `;
      const m = document.getElementById('viewOfficerModal');
      const footer = m?.querySelector('.modal-footer');
      if (footer) {
          footer.innerHTML = `
              <button class="btn btn-outline" onclick="closeModal('viewOfficerModal')">Close</button>
              ${o.status === 'Suspended'
                  ? `<button class="btn btn-success" onclick="closeModal('viewOfficerModal'); restoreOfficer('${o.id}')">Restore Officer</button>`
                  : `<button class="btn btn-danger" onclick="closeModal('viewOfficerModal'); suspendOfficer('${o.id}')">Suspend Officer</button>`
              }
          `;
      }
      if(m) m.classList.add('active');
  }

  window.suspendOfficer = (id) => {
      const o = OFFICERS.find(x=>x.id===id);
      if(o) {
          o.status = 'Suspended';
          const globalUser = getUsers().find(u => u.id === id);
          if (globalUser) {
              globalUser.status = 'Suspended';
              setUsers(getUsers().map(u => u.id === id ? globalUser : u));
          }
          filteredOfficers = [...OFFICERS];
          window.renderOfficersTable();
          if(window.updateOfficerStats) window.updateOfficerStats();
          if(window.showToast) window.showToast(`Officer ${o.name} has been suspended.`, 'warning');
      }
  };

  window.restoreOfficer = (id) => {
      const o = OFFICERS.find(x=>x.id===id);
      if(o) {
          o.status = 'Active';
          const globalUser = getUsers().find(u => u.id === id);
          if (globalUser) {
              globalUser.status = 'Active';
              setUsers(getUsers().map(u => u.id === id ? globalUser : u));
          }
          filteredOfficers = [...OFFICERS];
          window.renderOfficersTable();
          if(window.updateOfficerStats) window.updateOfficerStats();
          if(window.showToast) window.showToast(`Officer ${o.name} has been restored to Active.`, 'success');
      }
  };

  window.viewOfficerDocs = (name) => { if(window.showToast) window.showToast(`Opening documents for ${name}…`,'info'); }


  window.saveOfficer = () => {
      const fn = document.getElementById('ofFirstName')?.value.trim();
      const ln = document.getElementById('ofLastName')?.value.trim();
      const eid = document.getElementById('ofEmpId')?.value.trim();
      const roleText = document.getElementById('ofRole');
      const role = roleText?.options[roleText.selectedIndex]?.value || '';
      const deptText = document.getElementById('ofDept');
      const dept = deptText?.options[deptText.selectedIndex]?.value || '';
      const jur = document.getElementById('ofJurisdiction')?.value.trim();
      const phone = document.getElementById('ofPhone')?.value.trim();
      const email = document.getElementById('ofEmail')?.value.trim();
      const services = [...document.querySelectorAll('#serviceAssignGrid input:checked')].map(c=>c.parentElement.textContent.trim());

      if (!fn || !ln) { if(window.showToast) window.showToast('First and last name are required.','error'); return; }
      if (!eid) { if(window.showToast) window.showToast('Employee ID is required.','error'); return; }
      if (!role) { if(window.showToast) window.showToast('Please select a role.','error'); return; }
      if (!dept) { if(window.showToast) window.showToast('Please select a department.','error'); return; }
      if (!jur) { if(window.showToast) window.showToast('Jurisdiction is required.','error'); return; }
      if (!phone || !/^\+?[0-9\s]{8,15}$/.test(phone)) { if(window.showToast) window.showToast('Enter a valid mobile number.','error'); return; }
      if (!email || !email.includes('@')) { if(window.showToast) window.showToast('Enter a valid email address.','error'); return; }
      if (services.length === 0) { if(window.showToast) window.showToast('Assign at least one service.','error'); return; }

      if (currentEditOfficerId) {
          const o = OFFICERS.find(x => x.id === currentEditOfficerId);
          if (o) {
              o.name = fn + ' ' + ln;
              o.title = role;
              o.dept = dept;
              o.jurisdiction = jur;
              o.phone = phone;
              o.email = email;
              o.services = services;
              
              const globalUser = getUsers().find(u => u.id === currentEditOfficerId);
              if (globalUser) {
                  Object.assign(globalUser, {
                      name: o.name,
                      title: o.title,
                      dept: o.dept,
                      jurisdiction: o.jurisdiction,
                      phone: o.phone,
                      email: o.email,
                      services: o.services
                  });
                  setUsers(getUsers().map(u => u.id === currentEditOfficerId ? globalUser : u));
              }
          }
          if(window.showToast) window.showToast(`Officer ${fn} ${ln} updated successfully!`, 'success');
      } else {
          const roleMap = {
             'Supervisor': 'supervisor',
             'Grievance Officer': 'grievance'
          };
          const sysRole = roleMap[role] || 'officer';

          const newUser = {
              id: eid, name: fn + ' ' + ln, role: sysRole, title: role, dept, jurisdiction: jur,
              services, cases: 0, sla: 100, status: 'Active',
              email, phone, joined: new Date().toLocaleDateString('en-GB'),
              password: 'password123'
          };
          OFFICERS.push(newUser);
          const allU = getUsers();
          allU.push(newUser);
          setUsers(allU);
          
          if(window.showToast) window.showToast(`Officer ${fn} ${ln} added successfully! Credentials sent.`, 'success');
      }

      filteredOfficers = [...OFFICERS];
      const m = document.getElementById('addOfficerModal');
      if(m) m.classList.remove('active');
      window.renderOfficersTable();
      if(window.updateOfficerStats) window.updateOfficerStats();
  }

  const originalCloseModal = window.closeModal;
  window.closeModal = (id) => {
      const el = document.getElementById(id);
      if(el) { el.classList.remove('active'); }
      if (originalCloseModal) originalCloseModal(id);
  };

  window.updateOfficerStats = () => {
      const active = OFFICERS.filter(o => o.status === 'Active').length;
      const suspended = OFFICERS.filter(o => o.status === 'Suspended').length;
      if(document.getElementById('oo-total')) document.getElementById('oo-total').textContent = OFFICERS.length.toLocaleString();
      if(document.getElementById('oo-active')) document.getElementById('oo-active').textContent = active.toLocaleString();
      if(document.getElementById('oo-suspended')) document.getElementById('oo-suspended').textContent = suspended.toLocaleString();
  };

  window.renderOfficersTable();
  window.updateOfficerStats();
}

// Audit Logs
export function initAuditLogs() {
  const session = initPage({ title: 'Audit Logs', breadcrumbs: [{ label: 'Super User Portal', href: 'Super User/dashboard.html' }, { label: 'Audit Logs' }], requiredRole: 'super_user' });
  if (!session) return;
  
  const getProcessedLogs = () => {
    return getAuditLogs().map(log => {
      // Infer category for UI icons/filters if missing
      let category = log.category || 'config';
      if (!log.category) {
        const act = log.action.toLowerCase();
        if (act.includes('approve') || act.includes('resolved') || act.includes('success')) category = 'approve';
        else if (act.includes('reject')) category = 'reject';
        else if (act.includes('login')) category = 'login';
        else if (act.includes('sla') || act.includes('breach')) category = 'sla';
        else if (act.includes('security') || act.includes('danger')) category = 'security';
      }
      
      // Parse ISO date
      const d = new Date(log.date || Date.now());
      return {
        ...log,
        category,
        displayDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        displayTime: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ip: log.ip || '192.168.1.' + (log.id ? log.id.charCodeAt(log.id.length-1) % 50 : '10')
      };
    });
  };

  let activeCategory = '';

  window.renderLogs = (logs) => {
    const container = document.getElementById('logsContainer');
    if (!container) return;
    if (logs.length === 0) {
      container.innerHTML = "<div style='padding:40px;text-align:center;color:var(--color-text-muted);'>No system events match your current filters.</div>";
      const countEl = document.getElementById('logCount');
      if (countEl) countEl.textContent = 0;
      return;
    }
    container.innerHTML = logs.map(log => `
      <div class="log-row" style="cursor:pointer;" onclick="showLogDetail('${log.id}')">
        <div class="log-icon" style="background:${log.category === 'approve' ? 'var(--green-50)' : log.category === 'reject' ? 'var(--red-50)' : log.category === 'sla' ? 'var(--amber-50)' : 'var(--navy-50)'}; color:${log.category === 'approve' ? 'var(--green-600)' : log.category === 'reject' ? 'var(--red-600)' : log.category === 'sla' ? 'var(--amber-600)' : 'var(--navy-600)'};">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <div class="log-action">
          <div class="log-actor">${log.actor} <span style="font-weight:400;color:var(--color-text-muted);font-size:0.75rem;">(${log.role})</span></div>
          <div style="font-weight:500;">${log.action}</div>
          <div class="log-ip" style="font-size:0.7rem;">IP: ${log.ip}</div>
        </div>
        <div class="log-time" style="text-align:right;">${log.displayDate}<br><span style="color:var(--navy-600);font-weight:600;">${log.displayTime}</span></div>
      </div>
    `).join('');
    const countEl = document.getElementById('logCount');
    if (countEl) countEl.textContent = logs.length;
  }

  window.filterLogs = () => {
    const search = document.getElementById('logSearch')?.value.toLowerCase() || '';
    const role = document.getElementById('roleFilter')?.value || '';
    // LIVE SYNC: Re-fetch latest logs from storage
    const allProcessed = getProcessedLogs(); 
    
    const filtered = allProcessed.filter(log => {
      const matchSearch = log.actor.toLowerCase().includes(search) || log.action.toLowerCase().includes(search) || (log.details && log.details.toLowerCase().includes(search));
      const matchRole = role === '' || log.role.toLowerCase() === role.toLowerCase();
      const matchCat = activeCategory === '' || log.category === activeCategory;
      return matchSearch && matchRole && matchCat;
    });
    window.renderLogs(filtered);
    window.updateAuditLogStats(); // Update stats in real-time too
  }

  window.toggleCat = (el) => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      activeCategory = el.dataset.cat || '';
      window.filterLogs();
  }

  window.showLogDetail = (id) => {
    const allProcessed = getProcessedLogs();
    const log = allProcessed.find(x => String(x.id) === String(id));
    if (!log) return;
    const body = document.getElementById('logDetailBody');
    if(body) {
      body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;font-size:0.85rem;">
              <div><strong>Actor:</strong> ${log.actor} (${log.role})</div>
              <div><strong>Action:</strong> ${log.action}</div>
              ${log.details ? `<div><strong>Details:</strong> <div style="background:var(--slate-50);padding:8px;border-radius:4px;margin-top:4px;">${log.details}</div></div>` : ''}
              <div><strong>Category:</strong> <span class="badge badge-info" style="text-transform:uppercase;">${log.category}</span></div>
              <div><strong>Date:</strong> ${log.displayDate}</div>
              <div><strong>Time:</strong> ${log.displayTime}</div>
              <div><strong>IP Address:</strong> <span style="font-family:var(--font-mono);">${log.ip}</span></div>
              <div><strong>Event ID:</strong> <span style="font-family:var(--font-mono);">${log.id}</span></div>
          </div>
      `;
    }
    const m = document.getElementById('logModal');
    if (m) m.classList.add('active');
  }

  window.updateAuditLogStats = () => {
    const logs = getProcessedLogs();
    const total = logs.length;
    const approvals = logs.filter(l => l.category === 'approve').length;
    const rejections = logs.filter(l => l.category === 'reject').length;
    const sla = logs.filter(l => l.category === 'sla').length;
    const logins = logs.filter(l => l.category === 'login').length;
    const security = logs.filter(l => l.category === 'security').length;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val.toLocaleString(); };
    setVal('al-total', total);
    setVal('al-approvals', approvals);
    setVal('al-rejections', rejections);
    setVal('al-sla', sla);
    setVal('al-logins', logins);
    setVal('al-security', security);
  };

  const initialLogs = getProcessedLogs();
  window.renderLogs(initialLogs);
  window.updateAuditLogStats();
}

// System Settings
export function initSystemSettings() {
  const session = initPage({ title: 'System Settings', breadcrumbs: [{ label: 'Super User Portal', href: 'Super User/dashboard.html' }, { label: 'System Settings' }], requiredRole: 'super_user' });
  if (!session) return;
  
  window.switchTab = (tabId, el) => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
      if(el) el.classList.add('active');
      const tabEl = document.getElementById(`tab-${tabId}`);
      if(tabEl) tabEl.classList.add('active');
  };

  const systemModules = [
      { name:'Application Service',  status:'Operational',    uptime:'99.98%' },
      { name:'Grievance Service',     status:'Operational',    uptime:'99.95%' },
      { name:'Payment Gateway',       status:'Operational',    uptime:'99.90%' },
      { name:'Notification Service',  status:'Degraded',       uptime:'97.20%' },
      { name:'Audit Log Service',     status:'Operational',    uptime:'100%'   },
      { name:'Authentication Service',status:'Operational',    uptime:'99.99%' },
  ];

  // ── LIVE SYNC: Load Settings ──
  window.loadSettings = () => {
      const settings = getSettings();
      if (!settings.general) return;
      
      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
      const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

      // General
      setVal('platformName', settings.general.platformName);
      setVal('supportEmail', settings.general.supportEmail);
      setVal('sessionTimeout', settings.general.sessionTimeout);
      setVal('languageDefault', settings.general.languageDefault);

      // SLA
      setVal('slaCert', settings.sla?.slaCert);
      setVal('slaWelfare', settings.sla?.slaWelfare);
      setVal('slaPermission', settings.sla?.slaPermission);
      setVal('slaCorrection', settings.sla?.slaCorrection);
      setVal('slaGrievance', settings.sla?.slaGrievance);

      // Notifications
      setCheck('emailEnabled', settings.notifications?.emailEnabled);
      setCheck('smsEnabled', settings.notifications?.smsEnabled);
      setCheck('whatsappEnabled', settings.notifications?.whatsappEnabled);
      setCheck('pushEnabled', settings.notifications?.pushEnabled);

      // Security
      setCheck('twoFactorEnabled', settings.security?.twoFactorEnabled);
      setVal('passwordExpiry', settings.security?.passwordExpiry);
      setVal('maxLoginAttempts', settings.security?.maxLoginAttempts);
      setCheck('aadhaarMasking', settings.security?.aadhaarMasking);
      
      // Maintenance
      const mToggle = document.getElementById('maintenanceToggle');
      if (mToggle) mToggle.checked = !!settings.maintenance?.enabled;
      setVal('maintenanceMsg', settings.maintenance?.message);
  };

  window.loadSettings();

  // Bind SLA input auto-saving dynamically over to storage
  ['slaCert', 'slaWelfare', 'slaPermission', 'slaCorrection'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
          el.addEventListener('change', (e) => {
              const val = parseInt(e.target.value, 10);
              const services = getServices();
              let updatedCount = 0;
              
              services.forEach(s => {
                  if (id === 'slaCert' && ['Income Certificate', 'Caste Certificate', 'Residence Certificate', 'Marriage Certificate'].includes(s.name)) {
                      s.sla = val; updatedCount++;
                  } else if (id === 'slaWelfare' && ['Welfare Scheme', 'Scholarship'].includes(s.name)) {
                      s.sla = val; updatedCount++;
                  } else if (id === 'slaPermission' && s.cat === 'Permission') {
                      s.sla = val; updatedCount++;
                  } else if (id === 'slaCorrection' && s.name === 'Record Correction') {
                      s.sla = val; updatedCount++;
                  }
              });
              
              if (updatedCount > 0) {
                  setServices(services);
                  if (window.showToast) window.showToast(`SLA pushed: ${val} days configured for ${updatedCount} services!`, 'success');
              }
          });
      }
  });

  const grievanceEl = document.getElementById('slaGrievance');
  if (grievanceEl) {
      grievanceEl.addEventListener('change', (e) => {
         if (window.showToast) window.showToast(`Grievance SLA bound to ${e.target.value} days.`, 'success');
      });
  }

  window.handleMaintenanceToggle = (el) => {
      if (el.checked) {
          if (window.showToast) window.showToast('⚠ Maintenance mode ENABLED. Citizens cannot access services.', 'warning');
      } else {
          if (window.showToast) window.showToast('Maintenance mode disabled. Platform is live.', 'success');
      }
  };

  window.saveAllSettings = () => {
      const getVal = (id) => document.getElementById(id)?.value?.trim();
      const getCheck = (id) => document.getElementById(id)?.checked;

      const newSettings = {
          general: {
              platformName: getVal('platformName'),
              supportEmail: getVal('supportEmail'),
              sessionTimeout: parseInt(getVal('sessionTimeout'), 10),
              languageDefault: getVal('languageDefault')
          },
          sla: {
              slaCert: parseInt(getVal('slaCert'), 10),
              slaWelfare: parseInt(getVal('slaWelfare'), 10),
              slaPermission: parseInt(getVal('slaPermission'), 10),
              slaCorrection: parseInt(getVal('slaCorrection'), 10),
              slaGrievance: parseInt(getVal('slaGrievance'), 10)
          },
          notifications: {
              emailEnabled: getCheck('emailEnabled'),
              smsEnabled: getCheck('smsEnabled'),
              whatsappEnabled: getCheck('whatsappEnabled'),
              pushEnabled: getCheck('pushEnabled')
          },
          security: {
              twoFactorEnabled: getCheck('twoFactorEnabled'),
              passwordExpiry: parseInt(getVal('passwordExpiry'), 10),
              maxLoginAttempts: parseInt(getVal('maxLoginAttempts'), 10),
              aadhaarMasking: getCheck('aadhaarMasking')
          },
          maintenance: {
              enabled: getCheck('maintenanceToggle'),
              message: getVal('maintenanceMsg'),
              estimatedEnd: ''
          }
      };
      
      setSettings(newSettings);
      if(window.showToast) window.showToast('All system settings saved and synchronized!', 'success');
      addAuditEntry('Settings Updated', 'Full system configuration update by Super User');
  };

  window.confirmDanger = (msg, successMsg) => {
      const confirmMsgEl = document.getElementById('confirmMsg');
      if (confirmMsgEl) confirmMsgEl.textContent = msg;
      
      const confirmOkBtn = document.getElementById('confirmOkBtn');
      if (confirmOkBtn) {
          confirmOkBtn.onclick = () => {
              if (window.closeModal) window.closeModal('confirmModal');
              if (window.showToast) window.showToast(successMsg, 'success');
              addAuditEntry('Danger Action Executed', successMsg);
          };
      }
      
      const confirmModal = document.getElementById('confirmModal');
      if (confirmModal) confirmModal.classList.add('active');
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if(page==='manage-users') initManageUsers();
  if(page==='manage-services') initManageServices();
  if(page==='workflow-config') initWorkflowConfig();
  if(page==='officer-onboarding') initOfficerOnboarding();
  if(page==='audit-logs') initAuditLogs();
  if(page==='system-settings') initSystemSettings();
});

