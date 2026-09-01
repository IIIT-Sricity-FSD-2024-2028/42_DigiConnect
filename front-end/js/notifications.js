// ═══════════════════════════════════════════
// notifications.js — Notification management via API
// ═══════════════════════════════════════════

import { getSession } from './auth.js';
import { formatDateTime } from './utils.js';
import { apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead } from './api.js';

// Cache for the current page load
let _notifCache = null;

/**
 * Fetch and cache notifications from the backend
 */
async function loadNotifications() {
  try {
    const res = await apiGetNotifications();
    _notifCache = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    _notifCache = [];
  }
  return _notifCache;
}

/**
 * Render the notification panel in the topbar
 * Call after buildTopbar() to populate the panel with actual data
 */
export async function renderNotifPanel() {
  const session = getSession();
  if (!session) return;

  const notifications = await loadNotifications();
  const unread = notifications.filter(n => !n.read);

  // Update badge count
  const countBadge = document.querySelector('[data-testid="notif-count"]');
  if (countBadge) {
    countBadge.textContent = `${unread.length} new`;
    countBadge.style.display = unread.length > 0 ? '' : 'none';
  }

  // Update notification dot
  const notifDot = document.querySelector('.notif-dot');
  if (notifDot) notifDot.style.display = unread.length > 0 ? '' : 'none';

  // Render notification list
  const notifList = document.getElementById('notifList');
  if (!notifList) return;

  const typeIcons = {
    success: { bg: 'var(--green-100)', color: 'var(--green-500)', path: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
    warning: { bg: 'var(--amber-100)', color: 'var(--amber-600)', path: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>' },
    info: { bg: 'var(--navy-100)', color: 'var(--navy-500)', path: '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
    error: { bg: 'var(--red-100)', color: 'var(--red-500)', path: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  };

  if (notifications.length === 0) {
    notifList.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-text-muted);font-size:0.85rem;">No notifications</div>';
    return;
  }

  const recentNotifs = notifications.slice(0, 5);
  notifList.innerHTML = recentNotifs.map(n => {
    const icon = typeIcons[n.type] || typeIcons.info;
    const timeAgo = getTimeAgo(n.date);
    return `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-testid="notif-item-${n.id}" style="cursor:pointer;" data-notif-id="${n.id}" data-notif-link="${n.link || '#'}">
        <div class="notif-item-icon" style="background:${icon.bg};color:${icon.color};">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icon.path}</svg>
        </div>
        <div class="notif-item-text">
          <div class="notif-item-title">${n.title}</div>
          <div class="notif-item-msg">${n.message}</div>
          <div class="notif-item-time">${timeAgo}</div>
        </div>
      </div>`;
  }).join('');

  // Click handler for notifications
  notifList.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', async () => {
      const nid = el.dataset.notifId;
      const link = el.dataset.notifLink;
      try {
        await apiMarkNotificationRead(nid);
      } catch (e) { /* ignore */ }
      el.classList.remove('unread');
      if (link && link !== '#') {
        const cleanLink = link.replace(/^\/+/, '');
        const inSubdir = window.location.pathname.includes('/central-admin/') ||
          window.location.pathname.includes('/state-admin/') ||
          window.location.pathname.includes('/department-head/') ||
          window.location.pathname.includes('/citizen/') ||
          window.location.pathname.includes('/officer/') ||
          window.location.pathname.includes('/grievance/');
        const basePath = inSubdir ? '../' : '';
        window.location.href = basePath + cleanLink;
      }
    });
  });

  // Mark all as read button
  const markAllBtn = document.getElementById('markAllReadBtn');
  if (markAllBtn) {
    markAllBtn.onclick = async () => {
      try {
        await apiMarkAllNotificationsRead();
        notifList.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread'));
        if (countBadge) countBadge.style.display = 'none';
        if (notifDot) notifDot.style.display = 'none';
      } catch (e) { /* ignore */ }
    };
  }
}

/**
 * Get a human-readable time ago string
 */
function getTimeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return formatDateTime(dateStr);
}
