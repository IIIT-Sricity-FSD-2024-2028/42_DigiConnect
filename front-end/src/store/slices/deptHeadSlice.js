// src/store/slices/deptHeadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetDeptAnalytics,
  apiGetDeptServices,
} from '../../api/departmentHeadApi';

/**
 * Initial State for Member 3: Department Head & Dynamic Service Builder
 * Manages domain entities:
 * - stats: Department KPI metrics (active services, officers, designations, applications, revenue)
 * - services: List of configured dynamic citizen services
 * - selectedService: Full dynamic service schema loaded for editing
 * - designations: Role designations for the department (VRO, MRO, etc.)
 * - officers: Onboarded field officers mapped to jurisdiction nodes
 * - jurisdictionNodes: Scoping geography nodes for officer onboarding
 * - revenue: Department financial revenue analytics and transaction ledger
 * - loading: Global/page loading state
 * - error: Operational or network error messages
 */
const initialState = {
  stats: {
    activeServices: 0,
    totalServices: 0,
    totalDesignations: 0,
    totalOfficers: 0,
    totalApplications: 0,
    totalRevenue: 0,
  },
  services: [],
  selectedService: null,
  designations: [],
  officers: [],
  jurisdictionNodes: [],
  revenue: null,
  loading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * 1. Fetch Department Analytics
 * GET /department-head/analytics?departmentId=...
 */
export const fetchDeptAnalytics = createAsyncThunk(
  'deptHead/fetchAnalytics',
  async (departmentId, { rejectWithValue }) => {
    try {
      const res = await apiGetDeptAnalytics(departmentId);
      return res?.data || res || {};
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to fetch department analytics.'
      );
    }
  }
);

/**
 * 2. Fetch Department Configured Services
 * GET /department-head/services?departmentId=...&stateId=...
 */
export const fetchDeptServices = createAsyncThunk(
  'deptHead/fetchServices',
  async (arg, { rejectWithValue }) => {
    try {
      const departmentId = typeof arg === 'string' ? arg : arg?.departmentId;
      const stateId = typeof arg === 'object' ? arg?.stateId : undefined;
      const res = await apiGetDeptServices(departmentId, stateId);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to fetch department services.'
      );
    }
  }
);

// ── Slice Definition ─────────────────────────────────────────────────────────

export const deptHeadSlice = createSlice({
  name: 'deptHead',
  initialState,
  reducers: {
    clearDeptHeadError: (state) => {
      state.error = null;
    },
    resetDeptHeadState: () => initialState,
  },
  extraReducers: (builder) => {
    // ── fetchDeptAnalytics ──
    builder
      .addCase(fetchDeptAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeptAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = {
          ...state.stats,
          ...action.payload,
        };
        state.error = null;
      })
      .addCase(fetchDeptAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchDeptServices ──
    builder
      .addCase(fetchDeptServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeptServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
        // Keep activeServices metric aligned if analytics returned 0
        if (action.payload.length > 0 && !state.stats.activeServices) {
          state.stats.activeServices = action.payload.length;
          state.stats.totalServices = action.payload.length;
        }
        state.error = null;
      })
      .addCase(fetchDeptServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDeptHeadError, resetDeptHeadState } = deptHeadSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectDeptHeadState = (state) => state?.deptHead || initialState;
export const selectDeptHeadStats = (state) => selectDeptHeadState(state).stats;
export const selectDeptHeadServices = (state) => selectDeptHeadState(state).services || [];
export const selectSelectedService = (state) => selectDeptHeadState(state).selectedService;
export const selectDeptHeadDesignations = (state) => selectDeptHeadState(state).designations || [];
export const selectDeptHeadOfficers = (state) => selectDeptHeadState(state).officers || [];
export const selectJurisdictionNodes = (state) => selectDeptHeadState(state).jurisdictionNodes || [];
export const selectDeptHeadRevenue = (state) => selectDeptHeadState(state).revenue;
export const selectDeptHeadLoading = (state) => Boolean(selectDeptHeadState(state).loading);
export const selectDeptHeadError = (state) => selectDeptHeadState(state).error || null;

export default deptHeadSlice.reducer;
