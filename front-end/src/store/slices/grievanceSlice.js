// src/store/slices/grievanceSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetGrievances,
  apiGetGrievanceById,
  apiGetLinkedApplication,
  apiUpdateGrievanceStatus,
  apiResolveGrievance,
} from '../../api/grievanceApi';
import {
  apiGetMyGrievances,
  apiRaiseGrievance,
  apiGetGrievanceEligibility,
} from '../../api/citizenApi';

// ============================================================================
// ASYNC THUNKS (8 Operations)
// ============================================================================

/**
 * 1. Fetch paginated grievance queue for Grievance Redressal Officer.
 * Maps 1:1 with apiGetGrievances(page, limit).
 */
export const fetchGrievances = createAsyncThunk(
  'grievance/fetchGrievances',
  async (params = {}, { rejectWithValue }) => {
    try {
      const page = typeof params === 'number' ? params : params?.page ?? 1;
      const limit = typeof params === 'object' && params?.limit ? params.limit : 50;
      const response = await apiGetGrievances(page, limit);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch grievance queue');
    }
  }
);

/**
 * 2. Fetch single grievance record by ID (e.g., 'GRV-AP-001').
 * Maps 1:1 with apiGetGrievanceById(id).
 */
export const fetchGrievanceById = createAsyncThunk(
  'grievance/fetchGrievanceById',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('Grievance ID is required');
      }
      const response = await apiGetGrievanceById(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || `Failed to fetch grievance #${id}`);
    }
  }
);

/**
 * 3. Fetch linked application associated with a grievance appeal.
 * Maps 1:1 with apiGetLinkedApplication(appId).
 */
export const fetchLinkedApplication = createAsyncThunk(
  'grievance/fetchLinkedApplication',
  async (appId, { rejectWithValue }) => {
    try {
      if (!appId) {
        return rejectWithValue('Application ID is required');
      }
      const response = await apiGetLinkedApplication(appId);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || `Failed to fetch linked application #${appId}`);
    }
  }
);

/**
 * 4. Update grievance investigation status, category, priority, or notes.
 * Maps 1:1 with apiUpdateGrievanceStatus(id, data).
 * Accepts either { id, data: { status, category, ... } } or { id, status, remarks, ... }.
 */
export const updateGrievanceStatus = createAsyncThunk(
  'grievance/updateGrievanceStatus',
  async ({ id, data, ...rest }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('Grievance ID is required for status update');
      }
      const payload = data !== undefined ? data : rest;
      const response = await apiUpdateGrievanceStatus(id, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update grievance status');
    }
  }
);

/**
 * 5. Execute 3-way statutory appellate resolution action on a grievance ticket.
 * Outcomes:
 *   - 'UPHOLD_REJECTION'
 *   - 'DIRECT_RE_VERIFICATION'
 *   - 'OVERRULE_AND_ISSUE_CERTIFICATE'
 * Maps 1:1 with apiResolveGrievance(id, { action, remarks }).
 */
export const resolveGrievance = createAsyncThunk(
  'grievance/resolveGrievance',
  async ({ id, action, remarks, payload }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('Grievance ID is required for resolution');
      }
      const body = payload || { action, remarks };
      const response = await apiResolveGrievance(id, body);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to submit grievance resolution');
    }
  }
);

/**
 * 6. Fetch citizen's personal grievances list.
 * Maps 1:1 with apiGetMyGrievances().
 */
export const fetchMyGrievances = createAsyncThunk(
  'grievance/fetchMyGrievances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGetMyGrievances();
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch citizen grievances');
    }
  }
);

/**
 * 7. Raise a new citizen grievance against an application.
 * Accepts FormData (with evidence attachment) or plain serializable JSON object.
 * Maps 1:1 with apiRaiseGrievance(data).
 */
export const raiseGrievance = createAsyncThunk(
  'grievance/raiseGrievance',
  async (formDataOrJson, { rejectWithValue }) => {
    try {
      const response = await apiRaiseGrievance(formDataOrJson);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to raise grievance');
    }
  }
);

/**
 * 8. Evaluate category eligibility for an application.
 * Maps 1:1 with apiGetGrievanceEligibility(appId).
 */
export const fetchGrievanceEligibility = createAsyncThunk(
  'grievance/fetchGrievanceEligibility',
  async (appId, { rejectWithValue }) => {
    try {
      if (!appId) {
        return rejectWithValue('Application ID is required to evaluate eligibility');
      }
      const response = await apiGetGrievanceEligibility(appId);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to evaluate grievance eligibility');
    }
  }
);

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Officer Queue
  items: [],
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 1,
  loading: false,
  error: null,

  // Active Grievance & Linked Application Inspection
  current: null,
  detailLoading: false,
  detailError: null,
  linkedApp: null,
  linkedAppLoading: false,
  linkedAppError: null,

  // Status & Resolution Mutation State
  actionLoading: false,
  actionError: null,

  // Citizen-specific State
  myGrievances: [],
  myLoading: false,
  myError: null,
  raiseLoading: false,
  raiseError: null,
  lastSubmitted: null,

  // Dynamic Eligibility
  eligibility: null,
  eligibilityLoading: false,
  eligibilityError: null,
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

export const grievanceSlice = createSlice({
  name: 'grievance',
  initialState,
  reducers: {
    clearCurrentGrievance: (state) => {
      state.current = null;
      state.linkedApp = null;
      state.detailError = null;
      state.linkedAppError = null;
    },
    clearLastSubmitted: (state) => {
      state.lastSubmitted = null;
      state.raiseError = null;
    },
    clearGrievanceErrors: (state) => {
      state.error = null;
      state.detailError = null;
      state.linkedAppError = null;
      state.actionError = null;
      state.myError = null;
      state.raiseError = null;
      state.eligibilityError = null;
    },
    resetGrievanceState: () => initialState,
  },
  extraReducers: (builder) => {
    // ------------------------------------------------------------------------
    // 1. fetchGrievances
    // ------------------------------------------------------------------------
    builder
      .addCase(fetchGrievances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrievances.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : Array.isArray(action.payload)
            ? action.payload
            : [];
        state.items = list;
        state.total = action.payload?.total ?? list.length;
        state.page = action.payload?.page ?? 1;
        state.limit = action.payload?.limit ?? 50;
        state.totalPages = action.payload?.totalPages ?? Math.max(1, Math.ceil(state.total / state.limit));
      })
      .addCase(fetchGrievances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to fetch grievance queue';
      });

    // ------------------------------------------------------------------------
    // 2. fetchGrievanceById
    // ------------------------------------------------------------------------
    builder
      .addCase(fetchGrievanceById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchGrievanceById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detailError = null;
        state.current = action.payload?.data || action.payload;
      })
      .addCase(fetchGrievanceById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || action.error.message || 'Failed to fetch grievance details';
      });

    // ------------------------------------------------------------------------
    // 3. fetchLinkedApplication
    // ------------------------------------------------------------------------
    builder
      .addCase(fetchLinkedApplication.pending, (state) => {
        state.linkedAppLoading = true;
        state.linkedAppError = null;
        state.linkedApp = null;
      })
      .addCase(fetchLinkedApplication.fulfilled, (state, action) => {
        state.linkedAppLoading = false;
        state.linkedAppError = null;
        state.linkedApp = action.payload?.data || action.payload;
      })
      .addCase(fetchLinkedApplication.rejected, (state, action) => {
        state.linkedAppLoading = false;
        state.linkedAppError = action.payload || action.error.message || 'Failed to fetch linked application';
        state.linkedApp = null;
      });

    // ------------------------------------------------------------------------
    // 4. updateGrievanceStatus
    // ------------------------------------------------------------------------
    builder
      .addCase(updateGrievanceStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionError = null;
        const updated = action.payload?.data || action.payload;
        if (updated && updated.id) {
          // Update active inspected grievance
          if (state.current && state.current.id === updated.id) {
            state.current = { ...state.current, ...updated };
          }
          // Update queue record
          const itemIdx = state.items.findIndex((g) => g.id === updated.id);
          if (itemIdx !== -1) {
            state.items[itemIdx] = { ...state.items[itemIdx], ...updated };
          }
          // Update citizen record
          const myIdx = state.myGrievances.findIndex((g) => g.id === updated.id);
          if (myIdx !== -1) {
            state.myGrievances[myIdx] = { ...state.myGrievances[myIdx], ...updated };
          }
        }
      })
      .addCase(updateGrievanceStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || action.error.message || 'Failed to update grievance status';
      });

    // ------------------------------------------------------------------------
    // 5. resolveGrievance (Preserves 3-Way Resolution Outcomes)
    // ------------------------------------------------------------------------
    builder
      .addCase(resolveGrievance.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(resolveGrievance.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionError = null;

        const resData = action.payload?.data || action.payload;
        const resolvedGrievance = resData?.grievance || resData;
        const updatedApp = resData?.application;
        const issuedCert = resData?.certificate;

        // 1. Update Grievance Record
        if (resolvedGrievance && resolvedGrievance.id) {
          if (state.current && state.current.id === resolvedGrievance.id) {
            state.current = { ...state.current, ...resolvedGrievance };
          } else if (!state.current) {
            state.current = resolvedGrievance;
          }

          const itemIdx = state.items.findIndex((g) => g.id === resolvedGrievance.id);
          if (itemIdx !== -1) {
            state.items[itemIdx] = { ...state.items[itemIdx], ...resolvedGrievance };
          }

          const myIdx = state.myGrievances.findIndex((g) => g.id === resolvedGrievance.id);
          if (myIdx !== -1) {
            state.myGrievances[myIdx] = { ...state.myGrievances[myIdx], ...resolvedGrievance };
          }
        }

        // 2. Update Linked Application (for DIRECT_RE_VERIFICATION & OVERRULE_AND_ISSUE_CERTIFICATE)
        if (updatedApp && updatedApp.id) {
          state.linkedApp = {
            ...(state.linkedApp || {}),
            ...updatedApp,
            ...(issuedCert
              ? {
                certificate: issuedCert,
                certificateId: issuedCert.id,
                certificateIssuedDate: issuedCert.issueDate,
                certificateDownloadUrl: issuedCert.downloadUrl,
              }
              : {}),
          };
        }
      })
      .addCase(resolveGrievance.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || action.error.message || 'Failed to resolve grievance';
      });

    // ------------------------------------------------------------------------
    // 6. fetchMyGrievances
    // ------------------------------------------------------------------------
    builder
      .addCase(fetchMyGrievances.pending, (state) => {
        state.myLoading = true;
        state.myError = null;
      })
      .addCase(fetchMyGrievances.fulfilled, (state, action) => {
        state.myLoading = false;
        state.myError = null;
        const list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : Array.isArray(action.payload)
            ? action.payload
            : [];
        state.myGrievances = list;
      })
      .addCase(fetchMyGrievances.rejected, (state, action) => {
        state.myLoading = false;
        state.myError = action.payload || action.error.message || 'Failed to fetch citizen grievances';
      });

    // ------------------------------------------------------------------------
    // 7. raiseGrievance
    // ------------------------------------------------------------------------
    builder
      .addCase(raiseGrievance.pending, (state) => {
        state.raiseLoading = true;
        state.raiseError = null;
        state.lastSubmitted = null;
      })
      .addCase(raiseGrievance.fulfilled, (state, action) => {
        state.raiseLoading = false;
        state.raiseError = null;
        const newGrv = action.payload?.data || action.payload;
        state.lastSubmitted = newGrv;

        if (newGrv && newGrv.id) {
          state.myGrievances.unshift(newGrv);
          state.items.unshift(newGrv);
          state.total += 1;
        }
      })
      .addCase(raiseGrievance.rejected, (state, action) => {
        state.raiseLoading = false;
        state.raiseError = action.payload || action.error.message || 'Failed to submit grievance';
        state.lastSubmitted = null;
      });

    // ------------------------------------------------------------------------
    // 8. fetchGrievanceEligibility
    // ------------------------------------------------------------------------
    builder
      .addCase(fetchGrievanceEligibility.pending, (state) => {
        state.eligibilityLoading = true;
        state.eligibilityError = null;
      })
      .addCase(fetchGrievanceEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityError = null;
        state.eligibility = action.payload?.data || action.payload;
      })
      .addCase(fetchGrievanceEligibility.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityError = action.payload || action.error.message || 'Failed to evaluate grievance eligibility';
        state.eligibility = null;
      });
  },
});

// ============================================================================
// ACTION CREATORS & REDUCER EXPORT
// ============================================================================

export const {
  clearCurrentGrievance,
  clearLastSubmitted,
  clearGrievanceErrors,
  resetGrievanceState,
} = grievanceSlice.actions;

export default grievanceSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectGrievanceState = (state) => state?.grievance || initialState;

// Queue Selectors (Officer)
export const selectGrievanceQueue = (state) => selectGrievanceState(state).items;
export const selectGrievanceTotal = (state) => selectGrievanceState(state).total;
export const selectGrievancePagination = (state) => ({
  page: selectGrievanceState(state).page,
  limit: selectGrievanceState(state).limit,
  totalPages: selectGrievanceState(state).totalPages,
  total: selectGrievanceState(state).total,
});
export const selectGrievanceLoading = (state) => selectGrievanceState(state).loading;
export const selectGrievanceError = (state) => selectGrievanceState(state).error;

// Detail Selectors (Inspection & Investigation)
export const selectCurrentGrievance = (state) => selectGrievanceState(state).current;
export const selectDetailLoading = (state) => selectGrievanceState(state).detailLoading;
export const selectDetailError = (state) => selectGrievanceState(state).detailError;

// Linked Application Selectors
export const selectLinkedApplication = (state) => selectGrievanceState(state).linkedApp;
export const selectLinkedAppLoading = (state) => selectGrievanceState(state).linkedAppLoading;
export const selectLinkedAppError = (state) => selectGrievanceState(state).linkedAppError;

// Action Status Selectors (Status update / Resolution in progress)
export const selectActionLoading = (state) => selectGrievanceState(state).actionLoading;
export const selectActionError = (state) => selectGrievanceState(state).actionError;

// Citizen Selectors
export const selectMyGrievances = (state) => selectGrievanceState(state).myGrievances;
export const selectMyGrievancesLoading = (state) => selectGrievanceState(state).myLoading;
export const selectMyGrievancesError = (state) => selectGrievanceState(state).myError;

// Raise Grievance Selectors
export const selectRaiseLoading = (state) => selectGrievanceState(state).raiseLoading;
export const selectRaiseError = (state) => selectGrievanceState(state).raiseError;
export const selectLastSubmittedGrievance = (state) => selectGrievanceState(state).lastSubmitted;

// Eligibility Selectors
export const selectGrievanceEligibility = (state) => selectGrievanceState(state).eligibility;
export const selectEligibilityLoading = (state) => selectGrievanceState(state).eligibilityLoading;
export const selectEligibilityError = (state) => selectGrievanceState(state).eligibilityError;