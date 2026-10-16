import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetNotifications,
  apiGetUnreadCount,
  apiMarkAsRead,
  apiMarkAllAsRead,
} from '../../api/notificationApi';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getNotificationIcon(type = '') {
  switch (type.toLowerCase()) {
    case 'success':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'danger':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default function Topbar({ title = 'Dashboard', breadcrumbs = [], onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const roleNameMap = {
    officer: 'Department Officer',
    department_head: 'Department Head',
    supervisor: 'Supervisor',
    state_admin: 'State Admin',
    central_admin: 'Central Admin',
    super_user: 'Super User',
    grievance: 'Grievance Officer',
    grievance_officer: 'Grievance Officer',
    citizen: 'Citizen',
  };

  const roleDisplay =
    user?.designation ||
    user?.roleLabel ||
    roleNameMap[user?.role?.toLowerCase()] ||
    user?.role ||
    'Citizen';

  // Resolve complete officer name from existing user/profile data (combining name fields if necessary)
  const getCompleteName = (u) => {
    if (!u) return '';
    if (u.fullName && typeof u.fullName === 'string' && u.fullName.trim()) {
      return u.fullName.trim();
    }
    if (u.name && typeof u.name === 'string' && u.name.trim()) {
      return u.name.trim();
    }
    if (u.firstName || u.lastName) {
      const combined = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      if (combined) return combined;
    }
    return u.email || '';
  };

  const completeOfficerName = getCompleteName(user) || roleDisplay;
  const userName = completeOfficerName;
  const initials = completeOfficerName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  // Ensure complete officer name is displayed in dashboard topbar title instead of truncated/initial "C."
  const displayTitle = React.useMemo(() => {
    if (!title || typeof title !== 'string') return title;
    if (title.includes(', C.!')) {
      return title.replace(', C.!', `, ${completeOfficerName}!`);
    }
    const greetingMatch = title.match(/^(Good\s+(?:morning|afternoon|evening)),\s*([^!]+)!/i);
    if (greetingMatch && completeOfficerName) {
      const currentGreeting = greetingMatch[1];
      const nameInGreeting = greetingMatch[2].trim();
      if (nameInGreeting === 'C.' || nameInGreeting.length <= 2 || nameInGreeting === 'Officer') {
        return `${currentGreeting}, ${completeOfficerName}!`;
      }
    }
    return title;
  }, [title, completeOfficerName]);

  // Fetch unread count initially and periodically
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await apiGetUnreadCount();
      if (res && res.data && typeof res.data.count === 'number') {
        setUnreadCount(res.data.count);
      }
    } catch {
      // Quiet fail on count check to avoid disrupting UX
    }
  };

  // Fetch full notification list
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setNotifLoading(true);
      setNotifError(null);
      const res = await apiGetNotifications();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifications(list);
      const unread = list.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      setNotifError(err.message || 'Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [user]);

  // Load notifications whenever panel is opened
  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
  }, [notifOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await apiMarkAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Continue even if network error
      }
    }

    setNotifOpen(false);

    // Resolve navigation link safely
    if (notif.link) {
      const raw = notif.link;
      const trackMatch = raw.match(/id=([A-Z0-9_-]+)/i);
      if (trackMatch && trackMatch[1]) {
        const id = trackMatch[1];
        if (id.startsWith('GRV-')) {
          navigate(`/grievance/detail/${id}`);
          return;
        }
        navigate(`/citizen/track?id=${id}`);
        return;
      }
      if (raw.startsWith('/')) {
        navigate(raw);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setNotifError(err.message || 'Failed to mark all as read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      {/* Left section: Breadcrumbs and Title */}
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle"
          aria-label="Toggle Sidebar"
          onClick={() => {
            if (onToggleSidebar) onToggleSidebar();
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <div className="topbar-title" data-testid="topbar-title">{displayTitle}</div>
          <div className="topbar-breadcrumb" data-testid="topbar-breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label || idx}>
                {crumb.to ? (
                  <Link to={crumb.to} style={{ color: 'var(--navy-500)' }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="separator">›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Right section: Notification Bell & User Dropdown */}
      <div className="topbar-right">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="notif-btn"
            id="topbarNotifBtn"
            data-testid="notif-btn"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && <div className="notif-dot"></div>}
          </button>

          {notifOpen && (
            <div className="notif-panel open" style={{ display: 'flex' }}>
              <div
                className="card-header"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="card-title" style={{ fontSize: '0.875rem', margin: 0 }}>
                    Notifications
                  </span>
                  <span
                    className={`badge ${unreadCount > 0 ? 'badge-info' : 'badge-neutral'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {unreadCount} new
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--navy-600)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifLoading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 8px auto' }}></div>
                    Loading notifications...
                  </div>
                ) : notifError ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--red-600)', fontSize: '0.85rem' }}>
                    <p style={{ margin: '0 0 8px 0' }}>{notifError}</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={fetchNotifications}
                      style={{ fontSize: '0.75rem' }}
                    >
                      Retry
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 8px auto', color: 'var(--slate-400)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.875rem' }}>
                      No notifications yet
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>
                      You're all caught up with your updates!
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-item-icon">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="notif-item-text">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">{formatRelativeTime(n.date)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="dropdown" ref={userRef}>
          <div
            id="userDropdownTrigger"
            data-testid="user-dropdown-trigger"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              transition: 'background 0.2s',
            }}
            onClick={() => {
              setNotifOpen(false);
              setDropdownOpen((prev) => !prev);
            }}
          >
            <div className="avatar" data-testid="topbar-avatar">{initials}</div>
            <div>
              <div
                style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy-900)' }}
                data-testid="topbar-user-name"
              >
                {userName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {roleDisplay}
              </div>
            </div>
          </div>

          <div
            className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}
            data-testid="user-dropdown-menu"
          >
            <div className="dropdown-header">My Account</div>
            <div
              className="dropdown-item"
              data-testid="dropdown-profile"
              onClick={() => {
                setDropdownOpen(false);
                navigate('/profile');
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </div>
            <div className="dropdown-divider"></div>
            <div
              className="dropdown-item danger"
              id="topbarLogoutBtn"
              data-testid="dropdown-sign-out"
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
