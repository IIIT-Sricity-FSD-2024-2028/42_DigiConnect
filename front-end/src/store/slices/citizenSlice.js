// src/store/slices/citizenSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetServices,
  apiGetServiceById,
  apiGetMyApplications,
  apiSubmitApplication,
  apiTrackApplication,
  apiGetMyGrievances,
  apiGetGeographyTree,
  apiWithdrawApplication,
  apiRespondToQuery,
  apiSimulatePayment,
} from '../../api/citizenApi';
import { normalizeApplications, normalizeApplication } from '../../utils/applicationMapper';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASYNC THUNKS (createAsyncThunk + rejectWithValue + existing citizenApi)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 1. Fetch Citizen's Applications List
export const fetchMyApplications = createAsyncThunk(
  'citizen/fetchMyApplications',
  async (params = { page: 1, limit: 100 }, { rejectWithValue }) => {
    try {
      const page = typeof params === 'object' && params.page ? params.page : 1;
      const limit = typeof params === 'object' && params.limit ? params.limit : 100;
      const res = await apiGetMyApplications(page, limit);
      const appsList = Array.isArray(res) ? res : res?.data || res?.items || [];
      return normalizeApplications(appsList);
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch citizen applications');
    }
  }
);

// 2. Fetch Catalog of All Available Services
export const fetchServices = createAsyncThunk(
  'citizen/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetServices();
      const services = Array.isArray(res) ? res : res?.data || [];
      return services;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch services catalog');
    }
  }
);

// 3. Fetch Single Service Details by ID
export const fetchServiceById = createAsyncThunk(
  'citizen/fetchServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiGetServiceById(id);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch service details');
    }
  }
);

// 4. Track Application by ID / ARN
export const trackApplicationById = createAsyncThunk(
  'citizen/trackApplicationById',
  async (refCode, { rejectWithValue }) => {
    try {
      if (!refCode || !refCode.trim()) {
        return rejectWithValue('Application reference code is required.');
      }
      const cleanCode = refCode.trim().toUpperCase();
      const res = await apiTrackApplication(cleanCode);
      const data = res?.data || res;
      if (!data || !data.id) {
        return rejectWithValue('Application not found. Please verify the Application ID.');
      }
      return normalizeApplication(data);
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to track application');
    }
  }
);

// 5. Submit Dynamic Service Application
export const submitNewApplication = createAsyncThunk(
  'citizen/submitNewApplication',
  async (applicationData, { rejectWithValue }) => {
    try {
      const res = await apiSubmitApplication(applicationData);
      const createdApp = res?.data || res;
      return normalizeApplication(createdApp);
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to submit application');
    }
  }
);

// 6. Simulate Fee Payment for Application
export const simulateApplicationPayment = createAsyncThunk(
  'citizen/simulateApplicationPayment',
  async ({ serviceId, citizenId, amount, stateId }, { rejectWithValue }) => {
    try {
      const res = await apiSimulatePayment(serviceId, citizenId, amount, stateId);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to process fee payment simulation');
    }
  }
);

// 7. Withdraw Citizen Application
export const withdrawCitizenApplication = createAsyncThunk(
  'citizen/withdrawCitizenApplication',
  async (id, { rejectWithValue }) => {
    try {
      await apiWithdrawApplication(id);
      return id;
    } catch (err) {
      console.warn('Backend withdraw error, removing locally:', err?.message);
      return id;
    }
  }
);

// 8. Respond to Officer Clarification Query
export const respondToApplicationQuery = createAsyncThunk(
  'citizen/respondToApplicationQuery',
  async ({ id, response, files = [] }, { rejectWithValue }) => {
    try {
      const res = await apiRespondToQuery(id, response, files);
      const updatedApp = res?.data || res;
      return normalizeApplication(updatedApp);
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to submit response to query');
    }
  }
);

// 9. Fetch Live Geography Jurisdiction Tree for State
export const fetchGeographyTree = createAsyncThunk(
  'citizen/fetchGeographyTree',
  async (stateId = 'state_ap', { rejectWithValue }) => {
    try {
      const res = await apiGetGeographyTree(stateId);
      const tree = Array.isArray(res) ? res : res?.data || [];
      return tree;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to load geography jurisdiction hierarchy');
    }
  }
);

// 10. Fetch Citizen Grievances
export const fetchMyGrievances = createAsyncThunk(
  'citizen/fetchMyGrievances',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetMyGrievances();
      const list = Array.isArray(res) ? res : res?.data || res?.items || [];
      return list;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to load citizen grievances');
    }
  }
);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CITIZEN SLICE INITIAL STATE & REDUCERS
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Helper to calculate summary metrics for stat cards & Redux DevTools inspection
const calculateStats = (applications = []) => {
  let approved = 0;
  let underReview = 0;
  let query = 0;
  let rejected = 0;
  let escalated = 0;

  applications.forEach((app) => {
    const s = (app?.status || '').toLowerCase().trim().replace(/[\s_]+/g, '-');
    if (['approved', 'completed', 'certificate-generated', 'certificate_generated', 'issued'].includes(s)) {
      approved += 1;
    } else if (
      ['query', 'query-raised', 'action-required', 'clarification-needed', 'query-pending'].includes(s) ||
      (Array.isArray(app?.queries) && app.queries.some((q) => q.status === 'OPEN' || q.status === 'PENDING'))
    ) {
      query += 1;
    } else if (['rejected', 'denied'].includes(s)) {
      rejected += 1;
    } else if (['escalated', 'overdue', 'breached'].includes(s)) {
      escalated += 1;
    } else {
      underReview += 1;
    }
  });

  const total = applications.length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return {
    total,
    approved,
    underReview,
    query,
    rejected,
    escalated,
    approvalRate,
  };
};

const initialState = {
  // Applications list & computed metrics
  applications: [],
  totalApplications: 0,
  stats: {
    total: 0,
    approved: 0,
    underReview: 0,
    query: 0,
    rejected: 0,
    escalated: 0,
    approvalRate: 0,
  },
  loadingApplications: false,
  applicationsError: null,

  // Services catalog
  services: [],
  selectedService: null,
  loadingServices: false,
  servicesError: null,

  // Tracking by ARN / ID
  trackedApplication: null,
  loadingTrack: false,
  trackError: null,

  // Application submission wizard
  submittingApplication: false,
  submitSuccess: false,
  submittedAppId: null,
  submitError: null,

  // Payment simulation
  paymentProcessing: false,
  paymentReceipt: null,
  paymentError: null,

  // Geography jurisdiction tree
  geographyTree: [],
  loadingGeography: false,
  geographyError: null,

  // Citizen Grievances
  grievances: [],
  loadingGrievances: false,
  grievancesError: null,

  // Filters & Search
  filterStatus: 'all',
  filterType: '',
  searchTerm: '',
};

export const citizenSlice = createSlice({
  name: 'citizen',
  initialState,
  reducers: {
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearTrackedApplication: (state) => {
      state.trackedApplication = null;
      state.trackError = null;
    },
    setCitizenFilters: (state, action) => {
      if (action.payload.filterStatus !== undefined) state.filterStatus = action.payload.filterStatus;
      if (action.payload.filterType !== undefined) state.filterType = action.payload.filterType;
      if (action.payload.searchTerm !== undefined) state.searchTerm = action.payload.searchTerm;
    },
    resetSubmitState: (state) => {
      state.submittingApplication = false;
      state.submitSuccess = false;
      state.submittedAppId = null;
      state.submitError = null;
    },
    resetPaymentState: (state) => {
      state.paymentProcessing = false;
      state.paymentReceipt = null;
      state.paymentError = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchMyApplications ──
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.loadingApplications = true;
        state.applicationsError = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loadingApplications = false;
        state.applications = action.payload;
        state.totalApplications = action.payload.length;
        state.stats = calculateStats(action.payload);
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loadingApplications = false;
        state.applicationsError = action.payload;
      });

    // ── fetchServices ──
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loadingServices = true;
        state.servicesError = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loadingServices = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loadingServices = false;
        state.servicesError = action.payload;
      });

    // ── fetchServiceById ──
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.loadingServices = true;
        state.servicesError = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loadingServices = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loadingServices = false;
        state.servicesError = action.payload;
      });

    // ── trackApplicationById ──
    builder
      .addCase(trackApplicationById.pending, (state) => {
        state.loadingTrack = true;
        state.trackError = null;
      })
      .addCase(trackApplicationById.fulfilled, (state, action) => {
        state.loadingTrack = false;
        state.trackedApplication = action.payload;
        state.trackError = null;
      })
      .addCase(trackApplicationById.rejected, (state, action) => {
        state.loadingTrack = false;
        state.trackedApplication = null;
        state.trackError = action.payload;
      });

    // ── submitNewApplication ──
    builder
      .addCase(submitNewApplication.pending, (state) => {
        state.submittingApplication = true;
        state.submitSuccess = false;
        state.submittedAppId = null;
        state.submitError = null;
      })
      .addCase(submitNewApplication.fulfilled, (state, action) => {
        state.submittingApplication = false;
        state.submitSuccess = true;
        state.submittedAppId = action.payload?.id || action.payload?.arn;
        state.applications.unshift(action.payload);
        state.totalApplications = state.applications.length;
        state.stats = calculateStats(state.applications);
      })
      .addCase(submitNewApplication.rejected, (state, action) => {
        state.submittingApplication = false;
        state.submitSuccess = false;
        state.submitError = action.payload;
      });

    // ── simulateApplicationPayment ──
    builder
      .addCase(simulateApplicationPayment.pending, (state) => {
        state.paymentProcessing = true;
        state.paymentError = null;
      })
      .addCase(simulateApplicationPayment.fulfilled, (state, action) => {
        state.paymentProcessing = false;
        state.paymentReceipt = action.payload;
      })
      .addCase(simulateApplicationPayment.rejected, (state, action) => {
        state.paymentProcessing = false;
        state.paymentError = action.payload;
      });

    // ── withdrawCitizenApplication ──
    builder
      .addCase(withdrawCitizenApplication.fulfilled, (state, action) => {
        const id = action.payload;
        state.applications = state.applications.filter((a) => a.id !== id);
        state.totalApplications = state.applications.length;
        state.stats = calculateStats(state.applications);
        if (state.trackedApplication && state.trackedApplication.id === id) {
          state.trackedApplication = {
            ...state.trackedApplication,
            status: 'WITHDRAWN',
          };
        }
      });

    // ── respondToApplicationQuery ──
    builder
      .addCase(respondToApplicationQuery.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated.id) {
          state.trackedApplication = updated;
          const idx = state.applications.findIndex((a) => a.id === updated.id);
          if (idx !== -1) {
            state.applications[idx] = updated;
            state.stats = calculateStats(state.applications);
          }
        }
      });

    // ── fetchGeographyTree ──
    builder
      .addCase(fetchGeographyTree.pending, (state) => {
        state.loadingGeography = true;
        state.geographyError = null;
      })
      .addCase(fetchGeographyTree.fulfilled, (state, action) => {
        state.loadingGeography = false;
        state.geographyTree = action.payload;
      })
      .addCase(fetchGeographyTree.rejected, (state, action) => {
        state.loadingGeography = false;
        state.geographyError = action.payload;
      });

    // ── fetchMyGrievances ──
    builder
      .addCase(fetchMyGrievances.pending, (state) => {
        state.loadingGrievances = true;
        state.grievancesError = null;
      })
      .addCase(fetchMyGrievances.fulfilled, (state, action) => {
        state.loadingGrievances = false;
        state.grievances = action.payload;
      })
      .addCase(fetchMyGrievances.rejected, (state, action) => {
        state.loadingGrievances = false;
        state.grievancesError = action.payload;
      });
  },
});

export const {
  setSelectedService,
  clearTrackedApplication,
  setCitizenFilters,
  resetSubmitState,
  resetPaymentState,
} = citizenSlice.actions;

export default citizenSlice.reducer;
