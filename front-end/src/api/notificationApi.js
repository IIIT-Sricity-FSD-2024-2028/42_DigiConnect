// src/api/notificationApi.js
// Centralized API client for Notification services
// Communicates with NestJS backend via apiFetch (automatically attaches x-user-id and x-role headers)

import { apiFetch } from './client';

/**
 * Fetch all notifications for the current authenticated user.
 */
export const apiGetNotifications = () =>
  apiFetch('/notifications');

/**
 * Fetch unread notification count for the current authenticated user.
 */
export const apiGetUnreadCount = () =>
  apiFetch('/notifications/count');

/**
 * Mark a single notification as read by ID.
 * @param {string} id - Notification ID (e.g. 'NOT-1001')
 */
export const apiMarkAsRead = (id) =>
  apiFetch(`/notifications/${id}/read`, {
    method: 'PATCH',
  });

/**
 * Mark all notifications as read for current user.
 */
export const apiMarkAllAsRead = () =>
  apiFetch('/notifications/read-all', {
    method: 'PATCH',
  });

/**
 * Create a new notification.
 * @param {object} notificationData - { userId, title, message, type, link, ... }
 */
export const apiCreateNotification = (notificationData) =>
  apiFetch('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  });

