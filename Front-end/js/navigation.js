// ═══════════════════════════════════════════
// navigation.js — Dynamic sidebar, topbar, breadcrumb builder
// ═══════════════════════════════════════════

import { getSession, getCurrentRole, getCurrentUserName, getSettings, getUsers } from './state.js';
import { getRoleConfig, svgIcons } from './role-manager.js';
import { getInitials, toggleSidebar, setupGlobalClickHandlers, initEventDelegation, showToast } from './utils.js';
import { logout } from './auth.js';

/**
 * Determine the base path for navigation links based on current page location
 * Pages in subdirectories (Super User/, citizen/, etc.) need '../' prefix
 * Pages at root level need no prefix
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
 * Get the current page filename for active nav detection
 * @returns {string}
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const parts = path.split('/');
  return parts[parts.length - 1] || 'index.html';
}

/**
 * Build the sidebar navigation dynamically
 * @param {string} role
 */
export function buildSidebar(role) {
  const config = getRoleConfig(role);
  const session = getSession();
  const userName = session ? session.name : 'User';
  const initials = getInitials(userName);
  const basePath = getBasePath();
  const currentPage = getCurrentPage();

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Build nav items
  const navItems = config.items.map(item => {
    if (item.type === 'label') {
      return `<div class="nav-section-label">${item.label}</div>`;
    }
    const href = basePath + item.href;
    const isActive = item.href.endsWith(currentPage);
    const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
    return `
      <a href="${href}" class="nav-item${isActive ? ' active' : ''}" data-testid="nav-${item.label.toLowerCase().replace(/\s+/g, '-')}">
        <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          ${svgIcons[item.icon] || ''}
        </svg>
        ${item.label}${badgeHtml}
      </a>`;
  }).join('');

  // Account section
  const accountSection = `
    <div class="nav-section-label">Account</div>
    <a href="${basePath}profile.html" class="nav-item${currentPage === 'profile.html' ? ' active' : ''}" data-testid="nav-my-profile">
      <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        ${svgIcons['user']}
      </svg>
      My Profile
    </a>
    <a href="#" class="nav-item" data-testid="nav-sign-out" id="sidebarLogoutBtn">
      <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        ${svgIcons['logout']}
      </svg>
      Sign Out
    </a>`;

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <a href="${basePath}index.html" class="sidebar-brand-icon">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
        </svg>
      </a>
      <div class="sidebar-brand-text">
        <div class="sidebar-brand-name">${getSettings().general?.platformName || 'DigiConnect'}</div>
        <div class="sidebar-brand-sub" data-testid="sidebar-portal-label">${config.portalLabel}</div>
      </div>
    </div>
    <nav class="sidebar-nav" data-testid="sidebar-nav">
      ${navItems}
      ${accountSection}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="window.location.href='${basePath}profile.html'" data-testid="sidebar-user-info">
        <div class="avatar" data-testid="sidebar-avatar">${initials}</div>
        <div>
          <div class="sidebar-user-name" data-testid="sidebar-user-name">${userName}</div>
          <div class="sidebar-user-role">${config.roleLabel}</div>
        </div>
      </div>
    </div>`;

  // Attach logout handler
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      window.location.href = basePath + 'login.html';
    });
  }
}

/**
 * Build the topbar dynamically
 * @param {string} title - Page title
 * @param {Array} breadcrumbs - Array of { label, href } objects
 */
export function buildTopbar(title, breadcrumbs) {
  const session = getSession();
  const role = session ? session.role : 'citizen';
  const config = getRoleConfig(role);
  const userName = session ? session.name : 'User';
  const initials = getInitials(userName);
  const basePath = getBasePath();

  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const crumbHtml = breadcrumbs.map((c, i) => {
    if (i < breadcrumbs.length - 1) {
      return `<a href="${c.href ? basePath + c.href : '#'}" style="color:var(--navy-500);">${c.label}</a><span class="separator">›</span>`;
    }
    return `<span>${c.label}</span>`;
  }).join('');

  topbar.innerHTML = `
    <div class="topbar-left">
      <button class="sidebar-toggle" data-testid="sidebar-toggle-btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div>
        <div class="topbar-title" data-testid="topbar-title">${title}</div>
        <div class="topbar-breadcrumb" data-testid="topbar-breadcrumb">${crumbHtml}</div>
      </div>
    </div>
    <div class="topbar-right">
      <div style="position:relative;">
        <div class="notif-btn" data-testid="notif-btn" id="topbarNotifBtn">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <div class="notif-dot"></div>
        </div>
        <div class="notif-panel" id="notifPanel" data-testid="notification-panel">
          <div class="card-header" style="padding:12px 16px;">
            <span class="card-title" style="font-size:0.875rem;">Notifications</span>
            <span class="badge badge-danger" data-testid="notif-count">0 new</span>
          </div>
          <div class="notif-list" id="notifList" data-testid="notif-list">
            <div style="padding:20px;text-align:center;color:var(--color-text-muted);font-size:0.85rem;">No new notifications</div>
          </div>
          <div style="padding:12px 16px;text-align:center;border-top:1px solid var(--color-border);">
            <a href="#" style="font-size:0.8rem;color:var(--navy-500);font-weight:600;">View all notifications</a>
          </div>
        </div>
      </div>
      <div class="dropdown">
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 10px;border-radius:var(--radius-md);transition:background 0.2s;" data-testid="user-dropdown-trigger" id="userDropdownTrigger">
          <div class="avatar" data-testid="topbar-avatar">${initials}</div>
          <div>
            <div style="font-size:0.8125rem;font-weight:600;color:var(--navy-900);" data-testid="topbar-user-name">${userName}</div>
            <div style="font-size:0.7rem;color:var(--color-text-muted);">${config.roleLabel}</div>
          </div>
        </div>
        <div class="dropdown-menu" data-testid="user-dropdown-menu">
          <div class="dropdown-header">My Account</div>
          <a href="${basePath}profile.html" class="dropdown-item" data-testid="dropdown-profile">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              ${svgIcons['user']}
            </svg>
            My Profile
          </a>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger" id="topbarLogoutBtn" data-testid="dropdown-sign-out">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              ${svgIcons['logout']}
            </svg>
            Sign Out
          </div>
        </div>
      </div>
    </div>`;

  // Attach event listeners
  const sidebarToggle = topbar.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  const notifBtn = document.getElementById('topbarNotifBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      const panel = document.getElementById('notifPanel');
      if (panel) panel.classList.toggle('open');
    });
  }

  const dropdownTrigger = document.getElementById('userDropdownTrigger');
  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', () => {
      const menu = dropdownTrigger.parentElement.querySelector('.dropdown-menu');
      if (menu) menu.classList.toggle('open');
    });
  }

  const topbarLogout = document.getElementById('topbarLogoutBtn');
  if (topbarLogout) {
    topbarLogout.addEventListener('click', () => {
      logout();
      window.location.href = basePath + 'login.html';
    });
  }
}

/**
 * Initialize a page with sidebar, topbar, and global handlers
 * @param {object} options - { title, breadcrumbs, requiredRole }
 */
export function initPage(options = {}) {
  const session = getSession();

  // Auth check — skip for public pages
  if (options.requiredRole !== false) {
    if (!session) {
      window.location.href = getBasePath() + 'login.html';
      return null;
    }
    if (options.requiredRole && session.role !== options.requiredRole) {
      window.location.href = getBasePath() + 'login.html';
      return null;
    }

    // ── LIVE SYNC: Check User Status (Suspended/Active) ──
    const liveUser = getUsers().find(u => u.id === session.id);
    if (liveUser && liveUser.status === 'Suspended') {
      logout();
      window.location.href = getBasePath() + 'login.html?reason=suspended';
      return null;
    }

    // ── LIVE SYNC: Check Maintenance Mode ──
    const settings = getSettings();
    if (settings.maintenance?.enabled && session.role !== 'super_user') {
      // Redirect to a maintenance view or show overlay
      document.body.innerHTML = `
        <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; font-family:var(--font-sans); background:linear-gradient(135deg, var(--navy-900), var(--navy-700)); color:white;">
          <div style="font-size:4rem; margin-bottom:20px;">🛠️</div>
          <h1 style="font-size:2rem; margin-bottom:10px;">Platform Under Maintenance</h1>
          <p style="max-width:500px; opacity:0.9; margin-bottom:30px;">${settings.maintenance.message || 'System is undergoing scheduled maintenance. Please try again later.'}</p>
          <button onclick="window.location.reload()" class="btn btn-primary" style="background:white; color:var(--navy-900);">Check Again</button>
        </div>
      `;
      return null;
    }
  }

  const settings = getSettings();
  if (settings.general?.platformName) {
      document.title = `${options.title || 'Dashboard'} | ${settings.general.platformName}`;
  }

  const role = session ? session.role : 'citizen';
  const config = getRoleConfig(role);

  // Build navigation
  buildSidebar(role);
  buildTopbar(
    options.title || 'Dashboard',
    options.breadcrumbs || [{ label: config.portalLabel }, { label: 'Dashboard' }]
  );

  // Setup global handlers
  setupGlobalClickHandlers();
  initEventDelegation();

  return session;
}

