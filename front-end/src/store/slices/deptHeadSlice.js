// src/store/slices/deptHeadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetDeptAnalytics,
  apiGetDeptServices,
  apiGetDeptServiceById,
  apiCreateService,
  apiUpdateService,
  apiGetDeptOfficers,
  apiOnboardOfficer,
  apiUpdateOfficerStatus,
  apiGetDesignations,
  apiCreateDesignation,
  apiDeleteDesignation,
  apiDeleteService,
  apiGetStateJurisdictionNodes,
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

/**
 * 3. Fetch Department Officers (Read)
 * GET /department-head/officers?departmentId=...
 */
export const fetchDeptOfficers = createAsyncThunk(
  'deptHead/fetchOfficers',
  async (departmentId, { rejectWithValue }) => {
    try {
      const res = await apiGetDeptOfficers(departmentId);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to fetch department officers.'
      );
    }
  }
);

/**
 * 4. Onboard Field Officer (Create)
 * POST /department-head/officers
 * State updates strictly after positive DB response in .fulfilled
 */
export const onboardOfficer = createAsyncThunk(
  'deptHead/onboardOfficer',
  async (officerData, { rejectWithValue }) => {
    try {
      const res = await apiOnboardOfficer(officerData);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to onboard field officer.'
      );
    }
  }
);

/**
 * 5. Update Officer Status (Update)
 * PATCH /department-head/officers/:id/status
 * State updates strictly after positive DB response in .fulfilled (no optimistic updates)
 */
export const updateOfficerStatus = createAsyncThunk(
  'deptHead/updateOfficerStatus',
  async ({ officerId, status }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateOfficerStatus(officerId, status);
      const updated = res?.data || res;
      return { officerId, status, officer: updated };
    } catch (err) {
      return rejectWithValue(
        err?.message || `Failed to update status for officer ${officerId}.`
      );
    }
  }
);

/**
 * 6. Fetch Department Designations
 * GET /department-head/designations?departmentId=...
 */
export const fetchDesignations = createAsyncThunk(
  'deptHead/fetchDesignations',
  async (departmentId, { rejectWithValue }) => {
    try {
      const res = await apiGetDesignations(departmentId);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to fetch department designations.'
      );
    }
  }
);

/**
 * 7. Fetch Jurisdiction Nodes (Scoping)
 * GET /geography/nodes?stateId=...
 */
export const fetchJurisdictionNodes = createAsyncThunk(
  'deptHead/fetchJurisdictionNodes',
  async (stateId, { rejectWithValue }) => {
    try {
      const res = await apiGetStateJurisdictionNodes(stateId);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to fetch jurisdiction nodes.'
      );
    }
  }
);

/**
 * 8. Create Designation (Create)
 * POST /department-head/designations
 * State updates strictly after positive DB response in .fulfilled
 */
export const createDesignation = createAsyncThunk(
  'deptHead/createDesignation',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiCreateDesignation(data);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to create designation.'
      );
    }
  }
);

/**
 * 9. Delete Designation (Delete)
 * DELETE /department-head/designations/:id
 * State updates strictly after positive DB response in .fulfilled
 */
export const deleteDesignation = createAsyncThunk(
  'deptHead/deleteDesignation',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiDeleteDesignation(id);
      return { id, response: res };
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to delete designation.'
      );
    }
  }
);

/**
 * 10. Delete Department Dynamic Service (Delete)
 * DELETE /department-head/services/:id
 * State updates strictly after positive DB response in .fulfilled
 */
export const deleteService = createAsyncThunk(
  'deptHead/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiDeleteService(id);
      return { id, response: res };
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to delete dynamic service.'
      );
    }
  }
);

/**
 * 11. Fetch Single Service by ID (for builder editing)
 * GET /department-head/services/:id
 */
export const fetchDeptServiceById = createAsyncThunk(
  'deptHead/fetchServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiGetDeptServiceById(id);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || `Failed to fetch service ${id}.`
      );
    }
  }
);

/**
 * 12. Create Dynamic Service (Create)
 * POST /department-head/services
 * State updates strictly after positive DB response in .fulfilled
 */
export const createService = createAsyncThunk(
  'deptHead/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const res = await apiCreateService(serviceData);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to create dynamic service.'
      );
    }
  }
);

/**
 * 13. Update Dynamic Service (Update)
 * PUT /department-head/services/:id
 * State updates strictly after positive DB response in .fulfilled
 */
export const updateService = createAsyncThunk(
  'deptHead/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateService(id, serviceData);
      const updated = res?.data || res;
      return { id, service: updated };
    } catch (err) {
      return rejectWithValue(
        err?.message || `Failed to update service ${id}.`
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
    clearSelectedService: (state) => {
      state.selectedService = null;
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

    // ── fetchDeptOfficers ──
    builder
      .addCase(fetchDeptOfficers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeptOfficers.fulfilled, (state, action) => {
        state.loading = false;
        state.officers = action.payload;
        state.stats.totalOfficers = action.payload.length;
        state.error = null;
      })
      .addCase(fetchDeptOfficers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── onboardOfficer (CRUD: Create -> DB success -> Redux) ──
    builder
      .addCase(onboardOfficer.pending, (state) => {
        state.error = null;
      })
      .addCase(onboardOfficer.fulfilled, (state, action) => {
        const newOff = action.payload;
        if (newOff && newOff.id) {
          const exists = state.officers.some((o) => o.id === newOff.id);
          if (!exists) {
            state.officers.push(newOff);
          }
          state.stats.totalOfficers = state.officers.length;
        }
        state.error = null;
      })
      .addCase(onboardOfficer.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── updateOfficerStatus (CRUD: Update -> DB success -> Redux) ──
    builder
      .addCase(updateOfficerStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOfficerStatus.fulfilled, (state, action) => {
        const { officerId, status, officer } = action.payload;
        const idx = state.officers.findIndex((o) => o.id === officerId);
        if (idx !== -1) {
          state.officers[idx] = {
            ...state.officers[idx],
            ...(officer || {}),
            status,
          };
        }
        state.error = null;
      })
      .addCase(updateOfficerStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── fetchDesignations ──
    builder
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        state.designations = action.payload;
        state.stats.totalDesignations = action.payload.length;
        state.error = null;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── createDesignation (CRUD: Create -> DB success -> Redux) ──
    builder
      .addCase(createDesignation.pending, (state) => {
        state.error = null;
      })
      .addCase(createDesignation.fulfilled, (state, action) => {
        const created = action.payload;
        if (created && created.id) {
          const exists = state.designations.some((d) => d.id === created.id);
          if (!exists) {
            state.designations.push(created);
          }
          state.stats.totalDesignations = state.designations.length;
        }
        state.error = null;
      })
      .addCase(createDesignation.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── deleteDesignation (CRUD: Delete -> DB success -> Redux) ──
    builder
      .addCase(deleteDesignation.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteDesignation.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.designations = state.designations.filter((d) => d.id !== id);
        state.stats.totalDesignations = state.designations.length;
        state.error = null;
      })
      .addCase(deleteDesignation.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── deleteService (CRUD: Delete -> DB success -> Redux) ──
    builder
      .addCase(deleteService.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.services = state.services.filter((s) => s.id !== id);
        state.stats.activeServices = state.services.length;
        state.stats.totalServices = state.services.length;
        state.error = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── fetchDeptServiceById ──
    builder
      .addCase(fetchDeptServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeptServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload;
        state.error = null;
      })
      .addCase(fetchDeptServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── createService (CRUD: Create -> DB success -> Redux) ──
    builder
      .addCase(createService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload;
        if (created && created.id) {
          const exists = state.services.some((s) => s.id === created.id);
          if (!exists) {
            state.services.push(created);
          }
          state.stats.activeServices = state.services.length;
          state.stats.totalServices = state.services.length;
        }
        state.selectedService = created;
        state.error = null;
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── updateService (CRUD: Update -> DB success -> Redux) ──
    builder
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const { id, service } = action.payload;
        const idx = state.services.findIndex((s) => s.id === id);
        if (idx !== -1) {
          state.services[idx] = {
            ...state.services[idx],
            ...(service || {}),
          };
        }
        state.selectedService = service;
        state.error = null;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchJurisdictionNodes ──
    builder
      .addCase(fetchJurisdictionNodes.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchJurisdictionNodes.fulfilled, (state, action) => {
        state.jurisdictionNodes = action.payload;
        state.error = null;
      })
      .addCase(fetchJurisdictionNodes.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearDeptHeadError, clearSelectedService, resetDeptHeadState } = deptHeadSlice.actions;

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
