// src/store/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetNotifications,
  apiGetUnreadCount,
  apiMarkAsRead,
  apiMarkAllAsRead,
  apiCreateNotification,
} from '../../api/notificationApi';

/**
 * Initial State for Notification Domain
 * Strictly manages backend-persisted application notifications:
 * - items: list of notification objects ({ id, userId, title, message, type, read, date, link })
 * - unreadCount: count of unread notifications for badge display in Topbar
 * - loading: loading indicator when fetching full notification list
 * - fetchingCount: background indicator for unread count checks
 * - error: captures any operational error message
 * - lastFetched: ISO timestamp of last successful fetch
 *
 * NOTE: Ephemeral UI feedback (success/error toast messages) is strictly owned by uiSlice.js.
 */
const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  fetchingCount: false,
  error: null,
  lastFetched: null,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * 1. Fetch all notifications for the current authenticated user
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetNotifications();
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      const unreadCount = items.filter((n) => !n.read).length;
      return { items, unreadCount };
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to fetch notifications from server.'
      );
    }
  }
);

/**
 * 2. Fetch unread notification count for badge display
 */
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetUnreadCount();
      let count = 0;
      if (res && res.data && typeof res.data.count === 'number') {
        count = res.data.count;
      } else if (res && typeof res.count === 'number') {
        count = res.count;
      }
      return count;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to fetch unread notification count.'
      );
    }
  }
);

/**
 * 3. Mark a single notification as read by ID
 * Updates Redux state ONLY after successful backend response.
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiMarkAsRead(id);
      return {
        id,
        updatedNotification: res?.data || res,
      };
    } catch (err) {
      return rejectWithValue(
        err?.message || `Failed to mark notification ${id} as read.`
      );
    }
  }
);

/**
 * 4. Mark all notifications as read for current user
 * Updates Redux state ONLY after successful backend response.
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiMarkAllAsRead();
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to mark all notifications as read.'
      );
    }
  }
);

/**
 * 5. Create a new notification (dispatched by officers, admins, or grievance workflows)
 */
export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notificationData, { rejectWithValue }) => {
    try {
      const res = await apiCreateNotification(notificationData);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to create application notification.'
      );
    }
  }
);

// ── Slice Definition ─────────────────────────────────────────────────────────

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    resetNotificationState: () => initialState,
    setUnreadCountDirect: (state, action) => {
      state.unreadCount = typeof action.payload === 'number' ? action.payload : 0;
    },
  },
  extraReducers: (builder) => {
    // ── fetchNotifications ──
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchUnreadCount ──
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.fetchingCount = true;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.fetchingCount = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.fetchingCount = false;
        state.error = action.payload;
      });

    // ── markNotificationAsRead ──
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload.id;
        const target = state.items.find((n) => n.id === id);
        if (target) {
          if (!target.read) {
            target.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        } else {
          // If the notification was marked outside the current cached items
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── markAllNotificationsAsRead ──
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── createNotification ──
    builder
      .addCase(createNotification.fulfilled, (state, action) => {
        const newNotif = action.payload;
        if (newNotif && typeof newNotif === 'object' && newNotif.id) {
          state.items.unshift(newNotif);
          if (!newNotif.read) {
            state.unreadCount += 1;
          }
        }
      });
  },
});

export const {
  clearNotificationError,
  resetNotificationState,
  setUnreadCountDirect,
} = notificationSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
// Supports accessing state via either `state.notification` or `state.notifications`

export const selectNotificationState = (state) =>
  state?.notification || state?.notifications || {};

export const selectNotifications = (state) =>
  selectNotificationState(state).items || [];

export const selectUnreadCount = (state) =>
  selectNotificationState(state).unreadCount ?? 0;

export const selectNotificationLoading = (state) =>
  Boolean(selectNotificationState(state).loading);

export const selectIsFetchingCount = (state) =>
  Boolean(selectNotificationState(state).fetchingCount);

export const selectNotificationError = (state) =>
  selectNotificationState(state).error || null;

export const selectLastFetched = (state) =>
  selectNotificationState(state).lastFetched || null;

export const selectUnreadNotifications = (state) =>
  (selectNotificationState(state).items || []).filter((n) => !n.read);

export const selectNotificationById = (id) => (state) =>
  (selectNotificationState(state).items || []).find((n) => n.id === id);

export default notificationSlice.reducer;
