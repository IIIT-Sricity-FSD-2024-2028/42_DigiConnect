import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetOfficerQueue,
  apiGetOfficerQueries,
  apiGetOfficerSlaRisks,
  apiGetOfficerWeekChart,
  apiGetApplicationById,
  apiApproveApplication,
  apiRejectApplication,
  apiRaiseQueryApplication,
  apiCreateNotification,
} from '../../api/officerApi';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASYNC THUNKS (createAsyncThunk + rejectWithValue + existing officerApi)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 1. Fetch Officer Verification Queue
export const fetchOfficerQueue = createAsyncThunk(
  'officer/fetchOfficerQueue',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetOfficerQueue();
      const rawQueue = res?.data || (Array.isArray(res) ? res : []);
      return rawQueue;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch officer queue');
    }
  }
);

// 2. Fetch Active Queries Sent by Officer
export const fetchOfficerQueries = createAsyncThunk(
  'officer/fetchOfficerQueries',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetOfficerQueries();
      const queries = res?.data || (Array.isArray(res) ? res : []);
      return queries;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch officer queries');
    }
  }
);

// 3. Fetch SLA At-Risk Applications
export const fetchOfficerSlaRisks = createAsyncThunk(
  'officer/fetchOfficerSlaRisks',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetOfficerSlaRisks();
      const risks = res?.data || (Array.isArray(res) ? res : []);
      return risks;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch SLA risk applications');
    }
  }
);

// 4. Fetch Weekly Activity / Volume Chart Data
export const fetchOfficerWeekChart = createAsyncThunk(
  'officer/fetchOfficerWeekChart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetOfficerWeekChart();
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch officer weekly chart');
    }
  }
);

// 5. Fetch Single Application by ID
export const fetchApplicationById = createAsyncThunk(
  'officer/fetchApplicationById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiGetApplicationById(id);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(err?.message || `Failed to fetch application ${id}`);
    }
  }
);

// 6. Officer Action: Approve Application (Updates queue in-memory immediately)
export const approveApplication = createAsyncThunk(
  'officer/approveApplication',
  async ({ appId, remarks = '' }, { rejectWithValue }) => {
    try {
      const res = await apiApproveApplication(appId, remarks);
      return { appId, remarks, response: res?.data || res };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to approve application');
    }
  }
);

// 7. Officer Action: Reject Application (Updates queue in-memory immediately)
export const rejectApplication = createAsyncThunk(
  'officer/rejectApplication',
  async ({ appId, reason = '' }, { rejectWithValue }) => {
    try {
      const res = await apiRejectApplication(appId, reason);
      return { appId, reason, response: res?.data || res };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to reject application');
    }
  }
);

// 8. Officer Action: Raise Query (Workflow paused until citizen responds)
export const raiseQueryApplication = createAsyncThunk(
  'officer/raiseQueryApplication',
  async ({ appId, queryText = '' }, { rejectWithValue }) => {
    try {
      const res = await apiRaiseQueryApplication(appId, queryText);
      return { appId, queryText, response: res?.data || res };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to raise query on application');
    }
  }
);

// 9. Send Notification / Reminder to Citizen
export const sendCitizenReminder = createAsyncThunk(
  'officer/sendCitizenReminder',
  async (notificationData, { rejectWithValue }) => {
    try {
      const res = await apiCreateNotification(notificationData);
      return { notificationData, response: res?.data || res };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to send citizen reminder');
    }
  }
);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INITIAL STATE
 * ─────────────────────────────────────────────────────────────────────────────
 */
const initialState = {
  queue: [], // Active verification queue
  queries: [], // Queries awaiting citizen response
  slaRisks: [], // Applications close to SLA breach
  weekChart: null, // Weekly performance chart data
  currentApplication: null, // Currently inspected application details
  carouselIndex: 0, // Carousel index for review navigation
  
  // Loading & error lifecycle
  loading: false,
  error: null,
  actionLoading: false, // For approve/reject/raise-query submission
  actionError: null,
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SLICE DEFINITION (createSlice + Immer mutating logic)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const officerSlice = createSlice({
  name: 'officer',
  initialState,
  reducers: {
    // Review carousel navigation
    setCarouselIndex: (state, action) => {
      state.carouselIndex = action.payload;
    },
    nextCarouselItem: (state) => {
      if (state.carouselIndex < state.queue.length - 1) {
        state.carouselIndex += 1;
      }
    },
    prevCarouselItem: (state) => {
      if (state.carouselIndex > 0) {
        state.carouselIndex -= 1;
      }
    },

    // Immediate in-memory queue management
    removeQueueItem: (state, action) => {
      const idToRemove = String(action.payload).toLowerCase();
      state.queue = state.queue.filter(
        (item) => String(item.id).toLowerCase() !== idToRemove
      );
      if (state.carouselIndex >= state.queue.length && state.queue.length > 0) {
        state.carouselIndex = state.queue.length - 1;
      }
    },
    updateQueueItem: (state, action) => {
      const updated = action.payload;
      const index = state.queue.findIndex(
        (item) => String(item.id).toLowerCase() === String(updated.id).toLowerCase()
      );
      if (index !== -1) {
        state.queue[index] = { ...state.queue[index], ...updated };
      }
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    clearOfficerError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Queue ──
      .addCase(fetchOfficerQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficerQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.queue = action.payload;
        // Keep carousel index in bounds
        if (state.carouselIndex >= action.payload.length) {
          state.carouselIndex = 0;
        }
      })
      .addCase(fetchOfficerQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch Queries ──
      .addCase(fetchOfficerQueries.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchOfficerQueries.fulfilled, (state, action) => {
        state.queries = action.payload;
      })
      .addCase(fetchOfficerQueries.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── Fetch SLA Risks ──
      .addCase(fetchOfficerSlaRisks.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchOfficerSlaRisks.fulfilled, (state, action) => {
        state.slaRisks = action.payload;
      })
      .addCase(fetchOfficerSlaRisks.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── Fetch Week Chart ──
      .addCase(fetchOfficerWeekChart.fulfilled, (state, action) => {
        state.weekChart = action.payload;
      })

      // ── Fetch Single Application ──
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Approve Application (Immediate In-Memory Queue Update) ──
      .addCase(approveApplication.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(approveApplication.fulfilled, (state, action) => {
        state.actionLoading = false;
        const appId = String(action.payload.appId).toLowerCase();
        // Immediately remove approved application from active queue
        state.queue = state.queue.filter(
          (item) => String(item.id).toLowerCase() !== appId
        );
        if (state.carouselIndex >= state.queue.length && state.queue.length > 0) {
          state.carouselIndex = state.queue.length - 1;
        }
        if (state.currentApplication && String(state.currentApplication.id).toLowerCase() === appId) {
          state.currentApplication.status = 'approved';
        }
      })
      .addCase(approveApplication.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ── Reject Application (Immediate In-Memory Queue Update) ──
      .addCase(rejectApplication.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
        state.actionLoading = false;
        const appId = String(action.payload.appId).toLowerCase();
        // Immediately remove rejected application from active queue
        state.queue = state.queue.filter(
          (item) => String(item.id).toLowerCase() !== appId
        );
        if (state.carouselIndex >= state.queue.length && state.queue.length > 0) {
          state.carouselIndex = state.queue.length - 1;
        }
        if (state.currentApplication && String(state.currentApplication.id).toLowerCase() === appId) {
          state.currentApplication.status = 'rejected';
        }
      })
      .addCase(rejectApplication.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ── Raise Query (Immediate In-Memory Update) ──
      .addCase(raiseQueryApplication.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(raiseQueryApplication.fulfilled, (state, action) => {
        state.actionLoading = false;
        const appId = String(action.payload.appId).toLowerCase();
        // Remove from active queue since it is now paused waiting for citizen
        state.queue = state.queue.filter(
          (item) => String(item.id).toLowerCase() !== appId
        );
        if (state.carouselIndex >= state.queue.length && state.queue.length > 0) {
          state.carouselIndex = state.queue.length - 1;
        }
      })
      .addCase(raiseQueryApplication.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const {
  setCarouselIndex,
  nextCarouselItem,
  prevCarouselItem,
  removeQueueItem,
  updateQueueItem,
  clearCurrentApplication,
  clearOfficerError,
} = officerSlice.actions;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SELECTORS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const selectOfficerQueue = (state) => state.officer.queue;
export const selectOfficerQueries = (state) => state.officer.queries;
export const selectOfficerSlaRisks = (state) => state.officer.slaRisks;
export const selectOfficerWeekChart = (state) => state.officer.weekChart;
export const selectCurrentApplication = (state) => state.officer.currentApplication;
export const selectOfficerCarouselIndex = (state) => state.officer.carouselIndex;
export const selectOfficerLoading = (state) => state.officer.loading;
export const selectOfficerActionLoading = (state) => state.officer.actionLoading;
export const selectOfficerError = (state) => state.officer.error;
export const selectOfficerActionError = (state) => state.officer.actionError;

export default officerSlice.reducer;
