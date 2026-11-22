import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetNationalMetrics,
  apiGetCentralStates,
  apiGetCentralStateById,
  apiGetCentralStateDetails,
  apiCreateCentralState,
  apiUpdateCentralState,
  apiSetCentralStateStatus,
  apiResetCentralStateAdminPassword,
  apiGetCentralRevenueAnalytics,
  apiGetCentralTrends,
} from '../../api/centralAdminApi';
import { getNationalAnalyticsData } from '../../api/nationalAnalyticsService';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASYNC THUNKS (createAsyncThunk + rejectWithValue + existing APIs)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 1. Fetch Complete National Analytics Data
export const fetchNationalAnalytics = createAsyncThunk(
  'centralAdmin/fetchNationalAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getNationalAnalyticsData();
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch national analytics data');
    }
  }
);

// 2. Fetch Executive National Metrics
export const fetchNationalMetrics = createAsyncThunk(
  'centralAdmin/fetchNationalMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGetNationalMetrics();
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch national metrics');
    }
  }
);

// 3. Fetch All State Governments
export const fetchCentralStates = createAsyncThunk(
  'centralAdmin/fetchCentralStates',
  async (_, { rejectWithValue }) => {
    try {
      const states = await apiGetCentralStates();
      return states;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch central states registry');
    }
  }
);

// 4. Fetch State Details by ID
export const fetchCentralStateById = createAsyncThunk(
  'centralAdmin/fetchCentralStateById',
  async (id, { rejectWithValue }) => {
    try {
      const state = await apiGetCentralStateById(id);
      return state;
    } catch (err) {
      return rejectWithValue(err?.message || `Failed to fetch state ${id}`);
    }
  }
);

// 5. Fetch Complete State Monitoring Breakdown
export const fetchCentralStateDetails = createAsyncThunk(
  'centralAdmin/fetchCentralStateDetails',
  async (id, { rejectWithValue }) => {
    try {
      const details = await apiGetCentralStateDetails(id);
      return details;
    } catch (err) {
      return rejectWithValue(err?.message || `Failed to fetch state monitoring details for ${id}`);
    }
  }
);

// 6. Onboard New State Government
export const createCentralState = createAsyncThunk(
  'centralAdmin/createCentralState',
  async (stateData, { rejectWithValue }) => {
    try {
      const result = await apiCreateCentralState(stateData);
      return result;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to onboard state government');
    }
  }
);

// 7. Update State Metadata
export const updateCentralState = createAsyncThunk(
  'centralAdmin/updateCentralState',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const updated = await apiUpdateCentralState(id, updateData);
      return { id, updateData, updated };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to update state metadata');
    }
  }
);

// 8. Toggle State Status (Active / Inactive) with Immediate In-Memory Update
export const setCentralStateStatus = createAsyncThunk(
  'centralAdmin/setCentralStateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await apiSetCentralStateStatus(id, status);
      return { id, status, res };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to update state status');
    }
  }
);

// 9. Reset State Admin Password
export const resetCentralStateAdminPassword = createAsyncThunk(
  'centralAdmin/resetCentralStateAdminPassword',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiResetCentralStateAdminPassword(id);
      return { id, res };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to reset state admin password');
    }
  }
);

// 10. Fetch Central Revenue Analytics
export const fetchCentralRevenueAnalytics = createAsyncThunk(
  'centralAdmin/fetchCentralRevenueAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGetCentralRevenueAnalytics();
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch central revenue analytics');
    }
  }
);

// 11. Fetch Central Trends
export const fetchCentralTrends = createAsyncThunk(
  'centralAdmin/fetchCentralTrends',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGetCentralTrends();
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch central trends');
    }
  }
);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INITIAL STATE
 * ─────────────────────────────────────────────────────────────────────────────
 */
const initialState = {
  nationalData: null,
  metrics: null,
  states: [],
  currentState: null,
  currentStateDetails: null,
  revenueAnalytics: null,
  trends: null,

  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SLICE DEFINITION (createSlice + Immer mutating logic)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const centralAdminSlice = createSlice({
  name: 'centralAdmin',
  initialState,
  reducers: {
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    clearCentralAdminError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    // Instant local state status toggle
    updateLocalStateStatus: (state, action) => {
      const { id, status } = action.payload;
      if (Array.isArray(state.states)) {
        const found = state.states.find(
          (s) => String(s.id).toLowerCase() === String(id).toLowerCase()
        );
        if (found) {
          found.status = status;
        }
      }
      if (state.nationalData?.states && Array.isArray(state.nationalData.states)) {
        const found = state.nationalData.states.find(
          (s) => String(s.id).toLowerCase() === String(id).toLowerCase()
        );
        if (found) {
          found.status = status;
        }
      }
      if (state.currentState && String(state.currentState.id).toLowerCase() === String(id).toLowerCase()) {
        state.currentState.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch National Analytics ──
      .addCase(fetchNationalAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNationalAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalData = action.payload;
        if (action.payload?.states) {
          state.states = action.payload.states;
        }
      })
      .addCase(fetchNationalAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch National Metrics ──
      .addCase(fetchNationalMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })

      // ── Fetch Central States ──
      .addCase(fetchCentralStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCentralStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCentralStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch State By ID ──
      .addCase(fetchCentralStateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCentralStateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentState = action.payload;
      })
      .addCase(fetchCentralStateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch State Details ──
      .addCase(fetchCentralStateDetails.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCentralStateDetails.fulfilled, (state, action) => {
        state.currentStateDetails = action.payload;
      })
      .addCase(fetchCentralStateDetails.rejected, (state, action) => {
        state.actionError = action.payload;
      })

      // ── Create State ──
      .addCase(createCentralState.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createCentralState.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.states.unshift(action.payload);
        }
      })
      .addCase(createCentralState.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ── Update State ──
      .addCase(updateCentralState.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateCentralState.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, updateData, updated } = action.payload;
        const target = updated || updateData;
        const idx = state.states.findIndex(
          (s) => String(s.id).toLowerCase() === String(id).toLowerCase()
        );
        if (idx !== -1) {
          state.states[idx] = { ...state.states[idx], ...target };
        }
        if (state.currentState && String(state.currentState.id).toLowerCase() === String(id).toLowerCase()) {
          state.currentState = { ...state.currentState, ...target };
        }
      })
      .addCase(updateCentralState.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ── Set State Status (Immediate In-Memory Update) ──
      .addCase(setCentralStateStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(setCentralStateStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, status } = action.payload;
        const idx = state.states.findIndex(
          (s) => String(s.id).toLowerCase() === String(id).toLowerCase()
        );
        if (idx !== -1) {
          state.states[idx].status = status;
        }
        if (state.nationalData?.states) {
          const nIdx = state.nationalData.states.findIndex(
            (s) => String(s.id).toLowerCase() === String(id).toLowerCase()
          );
          if (nIdx !== -1) {
            state.nationalData.states[nIdx].status = status;
          }
        }
        if (state.currentState && String(state.currentState.id).toLowerCase() === String(id).toLowerCase()) {
          state.currentState.status = status;
        }
      })
      .addCase(setCentralStateStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ── Reset Admin Password ──
      .addCase(resetCentralStateAdminPassword.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(resetCentralStateAdminPassword.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(resetCentralStateAdminPassword.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ── Fetch Central Revenue Analytics ──
      .addCase(fetchCentralRevenueAnalytics.fulfilled, (state, action) => {
        state.revenueAnalytics = action.payload;
      })

      // ── Fetch Central Trends ──
      .addCase(fetchCentralTrends.fulfilled, (state, action) => {
        state.trends = action.payload;
      });
  },
});

export const {
  setCurrentState,
  clearCentralAdminError,
  updateLocalStateStatus,
} = centralAdminSlice.actions;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SELECTORS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const selectNationalData = (state) => state.centralAdmin.nationalData;
export const selectNationalMetrics = (state) => state.centralAdmin.metrics;
export const selectCentralStates = (state) => state.centralAdmin.states;
export const selectCurrentCentralState = (state) => state.centralAdmin.currentState;
export const selectCurrentCentralStateDetails = (state) => state.centralAdmin.currentStateDetails;
export const selectCentralRevenueAnalytics = (state) => state.centralAdmin.revenueAnalytics;
export const selectCentralTrends = (state) => state.centralAdmin.trends;
export const selectCentralAdminLoading = (state) => state.centralAdmin.loading;
export const selectCentralAdminActionLoading = (state) => state.centralAdmin.actionLoading;
export const selectCentralAdminError = (state) => state.centralAdmin.error;
export const selectCentralAdminActionError = (state) => state.centralAdmin.actionError;

export default centralAdminSlice.reducer;
