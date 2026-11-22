// src/store/slices/stateAdminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetStateDashboard,
  apiGetJurisdictionStats,
  apiGetDepartments,
  apiCreateDepartment,
  apiAssignDepartmentHead,
  apiUpdateDepartmentStatus,
  apiGetJurisdictionsTree,
  apiAddJurisdictionNode,
  apiUpdateJurisdictionNode,
  apiGetGrievanceCells,
  apiConfigureGrievanceCell,
} from '../../api/stateAdminApi';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RECURSIVE JURISDICTION TREE HELPERS (Immer-compatible)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Recursively insert a new child node into the hierarchical tree.
 * If parentId matches a node, appends to its children array.
 * If parentId is not found (or is root state), appends to root list.
 */
function insertNodeRecursive(nodes, parentId, newNode) {
  if (!parentId) {
    nodes.push(newNode);
    return true;
  }
  for (const node of nodes) {
    if (node.id === parentId) {
      if (!Array.isArray(node.children)) {
        node.children = [];
      }
      node.children.push(newNode);
      return true;
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      const inserted = insertNodeRecursive(node.children, parentId, newNode);
      if (inserted) return true;
    }
  }
  return false;
}

/**
 * Recursively locate a node by ID and update its properties in-place.
 */
function updateNodeRecursive(nodes, nodeId, updateData) {
  for (const node of nodes) {
    if (node.id === nodeId) {
      Object.assign(node, updateData);
      return true;
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      const updated = updateNodeRecursive(node.children, nodeId, updateData);
      if (updated) return true;
    }
  }
  return false;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INITIAL STATE
 * ─────────────────────────────────────────────────────────────────────────────
 */
const initialState = {
  // 1. Executive Dashboard Domain
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  // 2. Departments Management Domain (CRUD)
  departments: [],
  departmentsLoading: false,
  departmentsError: null,
  departmentActionLoading: false,
  departmentActionError: null,

  // 3. Dynamic Jurisdiction Tree Domain (Hierarchical CRUD)
  jurisdictionTree: [],
  jurisdictionStats: {
    districtsCount: 0,
    subDivisionsCount: 0,
    mandalsCount: 0,
    villagesCount: 0,
    municipalitiesCount: 0,
    wardsCount: 0,
  },
  jurisdictionLoading: false,
  jurisdictionError: null,
  jurisdictionActionLoading: false,
  jurisdictionActionError: null,

  // 4. Department Grievance Cells Domain (CRUD)
  grievanceCells: [],
  grievanceCellsLoading: false,
  grievanceCellsError: null,
  grievanceCellActionLoading: false,
  grievanceCellActionError: null,
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASYNC THUNKS (1:1 Mapping with stateAdminApi.js)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 1. Fetch State Executive Dashboard Data (KPIs + Jurisdiction Stats)
export const fetchStateDashboard = createAsyncThunk(
  'stateAdmin/fetchDashboard',
  async (stateId, { rejectWithValue }) => {
    try {
      const res = await apiGetStateDashboard(stateId);
      const data = res?.data || res || {};

      try {
        const statsRes = await apiGetJurisdictionStats(stateId);
        if (statsRes?.data || statsRes) {
          data.jurisdiction = statsRes.data || statsRes;
        }
      } catch {
        // Fallback gracefully if stats endpoint is temporarily unavailable
      }

      return data;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to load State Administration Dashboard'
      );
    }
  }
);

// 2. Fetch All State Departments (READ)
export const fetchDepartments = createAsyncThunk(
  'stateAdmin/fetchDepartments',
  async (stateId, { rejectWithValue }) => {
    try {
      const data = await apiGetDepartments(stateId);
      return Array.isArray(data) ? data : data?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to load state departments'
      );
    }
  }
);

// 3. Create a New State Department & Appoint Head (CREATE)
export const createDepartment = createAsyncThunk(
  'stateAdmin/createDepartment',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiCreateDepartment(payload);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to create department'
      );
    }
  }
);

// 4. Appoint or Replace Department Head (UPDATE)
export const assignDepartmentHead = createAsyncThunk(
  'stateAdmin/assignDepartmentHead',
  async ({ departmentId, headData }, { rejectWithValue }) => {
    try {
      const res = await apiAssignDepartmentHead(departmentId, headData);
      return {
        departmentId,
        headData,
        result: res?.data || res,
      };
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to appoint Department Head'
      );
    }
  }
);

// 5. Update Department Operational Status (ACTIVE / SUSPENDED) (UPDATE)
export const updateDepartmentStatus = createAsyncThunk(
  'stateAdmin/updateDepartmentStatus',
  async ({ departmentId, status }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateDepartmentStatus(departmentId, status);
      return {
        departmentId,
        status,
        result: res?.data || res,
      };
    } catch (err) {
      return rejectWithValue(
        err?.message || `Failed to update status to ${status}`
      );
    }
  }
);

// 6. Fetch Full Hierarchical Jurisdiction Tree (READ)
export const fetchJurisdictionsTree = createAsyncThunk(
  'stateAdmin/fetchJurisdictionsTree',
  async (stateId, { rejectWithValue }) => {
    try {
      const data = await apiGetJurisdictionsTree(stateId);
      return Array.isArray(data) ? data : data?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to load jurisdiction hierarchy tree'
      );
    }
  }
);

// 7. Fetch Jurisdiction Tier Statistics (READ)
export const fetchJurisdictionStats = createAsyncThunk(
  'stateAdmin/fetchJurisdictionStats',
  async (stateId, { rejectWithValue }) => {
    try {
      const res = await apiGetJurisdictionStats(stateId);
      return res?.data || res || {};
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to load jurisdiction tier statistics'
      );
    }
  }
);

// 8. Add Dynamic Jurisdiction Node (CREATE)
export const addJurisdictionNode = createAsyncThunk(
  'stateAdmin/addJurisdictionNode',
  async (nodeData, { rejectWithValue }) => {
    try {
      const res = await apiAddJurisdictionNode(nodeData);
      const createdNode = res?.data || res;
      return {
        parentId: nodeData.parentId,
        newNode: createdNode,
        tierLevel: nodeData.tierLevel,
      };
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to add jurisdiction node'
      );
    }
  }
);

// 9. Update Jurisdiction Node Boundary Name / Code (UPDATE)
export const updateJurisdictionNode = createAsyncThunk(
  'stateAdmin/updateJurisdictionNode',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateJurisdictionNode(id, updateData);
      return {
        id,
        updateData,
        result: res?.data || res,
      };
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to update jurisdiction boundary'
      );
    }
  }
);

// 10. Fetch All Department Grievance Cells (READ)
export const fetchGrievanceCells = createAsyncThunk(
  'stateAdmin/fetchGrievanceCells',
  async (stateId, { rejectWithValue }) => {
    try {
      const res = await apiGetGrievanceCells(stateId);
      return Array.isArray(res) ? res : res?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to load department grievance cells'
      );
    }
  }
);

// 11. Configure Department Grievance Cell (CREATE / UPDATE)
export const configureGrievanceCell = createAsyncThunk(
  'stateAdmin/configureGrievanceCell',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiConfigureGrievanceCell(data);
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to configure department grievance cell'
      );
    }
  }
);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SLICE DEFINITION & REDUCERS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const stateAdminSlice = createSlice({
  name: 'stateAdmin',
  initialState,
  reducers: {
    clearStateAdminError: (state) => {
      state.dashboardError = null;
      state.departmentsError = null;
      state.departmentActionError = null;
      state.jurisdictionError = null;
      state.jurisdictionActionError = null;
      state.grievanceCellsError = null;
      state.grievanceCellActionError = null;
    },
    resetStateAdminState: () => initialState,
  },
  extraReducers: (builder) => {
    // ── fetchStateDashboard ──
    builder
      .addCase(fetchStateDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchStateDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardData = action.payload;
        state.dashboardError = null;
      })
      .addCase(fetchStateDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      });

    // ── fetchDepartments ──
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.departmentsLoading = true;
        state.departmentsError = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departmentsLoading = false;
        state.departments = action.payload;
        state.departmentsError = null;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departmentsLoading = false;
        state.departmentsError = action.payload;
      });

    // ── createDepartment ──
    builder
      .addCase(createDepartment.pending, (state) => {
        state.departmentActionLoading = true;
        state.departmentActionError = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departmentActionLoading = false;
        const newDept = action.payload;
        if (newDept && newDept.id) {
          // If not already in list, prepend/append to Redux state
          const exists = state.departments.some((d) => d.id === newDept.id);
          if (!exists) {
            state.departments.unshift(newDept);
          }
        }
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.departmentActionLoading = false;
        state.departmentActionError = action.payload;
      });

    // ── assignDepartmentHead ──
    builder
      .addCase(assignDepartmentHead.pending, (state) => {
        state.departmentActionLoading = true;
        state.departmentActionError = null;
      })
      .addCase(assignDepartmentHead.fulfilled, (state, action) => {
        state.departmentActionLoading = false;
        const { departmentId, headData } = action.payload;
        const dept = state.departments.find((d) => d.id === departmentId);
        if (dept) {
          dept.headName = headData.name;
          dept.headEmail = headData.email;
        }
      })
      .addCase(assignDepartmentHead.rejected, (state, action) => {
        state.departmentActionLoading = false;
        state.departmentActionError = action.payload;
      });

    // ── updateDepartmentStatus ──
    builder
      .addCase(updateDepartmentStatus.pending, (state) => {
        state.departmentActionLoading = true;
        state.departmentActionError = null;
      })
      .addCase(updateDepartmentStatus.fulfilled, (state, action) => {
        state.departmentActionLoading = false;
        const { departmentId, status } = action.payload;
        const dept = state.departments.find((d) => d.id === departmentId);
        if (dept) {
          dept.status = status;
        }
      })
      .addCase(updateDepartmentStatus.rejected, (state, action) => {
        state.departmentActionLoading = false;
        state.departmentActionError = action.payload;
      });

    // ── fetchJurisdictionsTree ──
    builder
      .addCase(fetchJurisdictionsTree.pending, (state) => {
        state.jurisdictionLoading = true;
        state.jurisdictionError = null;
      })
      .addCase(fetchJurisdictionsTree.fulfilled, (state, action) => {
        state.jurisdictionLoading = false;
        state.jurisdictionTree = action.payload;
        state.jurisdictionError = null;
      })
      .addCase(fetchJurisdictionsTree.rejected, (state, action) => {
        state.jurisdictionLoading = false;
        state.jurisdictionError = action.payload;
      });

    // ── fetchJurisdictionStats ──
    builder
      .addCase(fetchJurisdictionStats.pending, (state) => {
        state.jurisdictionError = null;
      })
      .addCase(fetchJurisdictionStats.fulfilled, (state, action) => {
        state.jurisdictionStats = {
          ...state.jurisdictionStats,
          ...action.payload,
        };
      })
      .addCase(fetchJurisdictionStats.rejected, (state, action) => {
        state.jurisdictionError = action.payload;
      });

    // ── addJurisdictionNode ──
    builder
      .addCase(addJurisdictionNode.pending, (state) => {
        state.jurisdictionActionLoading = true;
        state.jurisdictionActionError = null;
      })
      .addCase(addJurisdictionNode.fulfilled, (state, action) => {
        state.jurisdictionActionLoading = false;
        const { parentId, newNode, tierLevel } = action.payload;
        if (newNode && newNode.id) {
          insertNodeRecursive(state.jurisdictionTree, parentId, newNode);
          // Increment aggregated tier counts
          if (tierLevel === 'DISTRICT') state.jurisdictionStats.districtsCount += 1;
          else if (tierLevel === 'SUB_DIVISION') state.jurisdictionStats.subDivisionsCount += 1;
          else if (tierLevel === 'MANDAL') state.jurisdictionStats.mandalsCount += 1;
          else if (tierLevel === 'VILLAGE' || tierLevel === 'GRAM_PANCHAYAT') state.jurisdictionStats.villagesCount += 1;
          else if (tierLevel === 'MUNICIPALITY') state.jurisdictionStats.municipalitiesCount += 1;
          else if (tierLevel === 'WARD') state.jurisdictionStats.wardsCount += 1;
        }
      })
      .addCase(addJurisdictionNode.rejected, (state, action) => {
        state.jurisdictionActionLoading = false;
        state.jurisdictionActionError = action.payload;
      });

    // ── updateJurisdictionNode ──
    builder
      .addCase(updateJurisdictionNode.pending, (state) => {
        state.jurisdictionActionLoading = true;
        state.jurisdictionActionError = null;
      })
      .addCase(updateJurisdictionNode.fulfilled, (state, action) => {
        state.jurisdictionActionLoading = false;
        const { id, updateData } = action.payload;
        updateNodeRecursive(state.jurisdictionTree, id, updateData);
      })
      .addCase(updateJurisdictionNode.rejected, (state, action) => {
        state.jurisdictionActionLoading = false;
        state.jurisdictionActionError = action.payload;
      });

    // ── fetchGrievanceCells ──
    builder
      .addCase(fetchGrievanceCells.pending, (state) => {
        state.grievanceCellsLoading = true;
        state.grievanceCellsError = null;
      })
      .addCase(fetchGrievanceCells.fulfilled, (state, action) => {
        state.grievanceCellsLoading = false;
        state.grievanceCells = action.payload;
        state.grievanceCellsError = null;
      })
      .addCase(fetchGrievanceCells.rejected, (state, action) => {
        state.grievanceCellsLoading = false;
        state.grievanceCellsError = action.payload;
      });

    // ── configureGrievanceCell ──
    builder
      .addCase(configureGrievanceCell.pending, (state) => {
        state.grievanceCellActionLoading = true;
        state.grievanceCellActionError = null;
      })
      .addCase(configureGrievanceCell.fulfilled, (state, action) => {
        state.grievanceCellActionLoading = false;
        const updatedCell = action.payload;
        if (updatedCell && (updatedCell.id || updatedCell.departmentId)) {
          const index = state.grievanceCells.findIndex(
            (c) =>
              (updatedCell.id && c.id === updatedCell.id) ||
              (updatedCell.departmentId && c.departmentId === updatedCell.departmentId)
          );
          if (index !== -1) {
            state.grievanceCells[index] = {
              ...state.grievanceCells[index],
              ...updatedCell,
            };
          } else {
            state.grievanceCells.unshift(updatedCell);
          }
        }
      })
      .addCase(configureGrievanceCell.rejected, (state, action) => {
        state.grievanceCellActionLoading = false;
        state.grievanceCellActionError = action.payload;
      });
  },
});

export const { clearStateAdminError, resetStateAdminState } =
  stateAdminSlice.actions;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SELECTORS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const selectStateAdminState = (state) => state.stateAdmin || {};

// Dashboard Selectors
export const selectStateDashboardData = (state) =>
  selectStateAdminState(state).dashboardData;
export const selectStateDashboardLoading = (state) =>
  Boolean(selectStateAdminState(state).dashboardLoading);
export const selectStateDashboardError = (state) =>
  selectStateAdminState(state).dashboardError;

// Departments Selectors
export const selectDepartments = (state) =>
  selectStateAdminState(state).departments || [];
export const selectDepartmentsLoading = (state) =>
  Boolean(selectStateAdminState(state).departmentsLoading);
export const selectDepartmentsError = (state) =>
  selectStateAdminState(state).departmentsError;
export const selectDepartmentActionLoading = (state) =>
  Boolean(selectStateAdminState(state).departmentActionLoading);
export const selectDepartmentActionError = (state) =>
  selectStateAdminState(state).departmentActionError;

// Jurisdictions Tree & Stats Selectors
export const selectJurisdictionTree = (state) =>
  selectStateAdminState(state).jurisdictionTree || [];
export const selectJurisdictionStats = (state) =>
  selectStateAdminState(state).jurisdictionStats || {};
export const selectJurisdictionLoading = (state) =>
  Boolean(selectStateAdminState(state).jurisdictionLoading);
export const selectJurisdictionError = (state) =>
  selectStateAdminState(state).jurisdictionError;
export const selectJurisdictionActionLoading = (state) =>
  Boolean(selectStateAdminState(state).jurisdictionActionLoading);
export const selectJurisdictionActionError = (state) =>
  selectStateAdminState(state).jurisdictionActionError;

// Grievance Cells Selectors
export const selectGrievanceCells = (state) =>
  selectStateAdminState(state).grievanceCells || [];
export const selectGrievanceCellsLoading = (state) =>
  Boolean(selectStateAdminState(state).grievanceCellsLoading);
export const selectGrievanceCellsError = (state) =>
  selectStateAdminState(state).grievanceCellsError;
export const selectGrievanceCellActionLoading = (state) =>
  Boolean(selectStateAdminState(state).grievanceCellActionLoading);
export const selectGrievanceCellActionError = (state) =>
  selectStateAdminState(state).grievanceCellActionError;

export default stateAdminSlice.reducer;
