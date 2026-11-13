// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiLogin,
  apiRegister,
  apiRequestOtp,
  apiGetUsers,
  apiUpdateProfile,
  apiChangePassword,
} from '../../api/authApi';

// Helper to safely load initial session from localStorage
const loadInitialSession = () => {
  try {
    const saved = localStorage.getItem('DigiConnect_session');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

// Helper to synchronize session with localStorage
const persistSession = (session) => {
  if (session) {
    localStorage.setItem('DigiConnect_session', JSON.stringify(session));
    localStorage.setItem('active_role', session.roleKey || session.role || 'citizen');
    localStorage.setItem('current_user', JSON.stringify(session));
  } else {
    localStorage.removeItem('DigiConnect_session');
    localStorage.removeItem('active_role');
    localStorage.removeItem('current_user');
  }
};

// Helper to normalize user session structure
const normalizeSession = (user) => {
  if (!user) return null;
  const rawRole = (user.role || '').toLowerCase();
  const rawBackend = (user.backendRole || '').toLowerCase();
  const normalizedRole =
    rawRole === 'super_user' || rawRole === 'central_admin' || rawBackend === 'central_admin'
      ? 'central_admin'
      : rawRole === 'state_admin' || rawBackend === 'state_admin'
      ? 'state_admin'
      : rawRole === 'department_head' || rawBackend === 'department_head'
      ? 'department_head'
      : rawRole || 'citizen';

  return {
    id: user.id || user._id || user.sub,
    email: user.email || '',
    name: user.name || '',
    role: normalizedRole,
    roleKey: normalizedRole,
    backendRole: user.backendRole || user.role,
    actualRole: user.role,
    stateId: user.stateId || '',
    state: user.state || user.stateName || '',
    stateStatus: user.stateStatus || 'ACTIVE',
    isStateDeactivated: user.isStateDeactivated || false,
    departmentId: user.departmentId || '',
    assignedNodeId: user.assignedNodeId || user.jurisdiction || '',
    designationId: user.designationId || '',
    title: user.title || '',
    phone: user.phone || '',
    loginTime: user.loginTime || new Date().toISOString(),
    ...(user.documents ? { documents: user.documents } : {}),
  };
};

const initialSession = loadInitialSession();

const initialState = {
  user: initialSession,
  role: initialSession?.role?.toLowerCase() || '',
  isLoggedIn: Boolean(initialSession),
  loading: false,
  error: null,
  usersList: [],
  otpSent: false,
  simulatedOtp: '',
  stateDeactivatedError: null,
  officerSuspendedError: null,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

// 1. User Login Thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await apiLogin(email, password);
      const user = res.data || res;

      // Check if user's state is deactivated
      const isDeactivated =
        user?.isStateDeactivated === true ||
        (user?.stateStatus && user.stateStatus.toUpperCase() === 'INACTIVE');
      if (isDeactivated) {
        return rejectWithValue({
          type: 'STATE_DEACTIVATED',
          stateName: user.deactivatedStateName || user.state || 'Your State',
          message: 'Your state account is currently deactivated.',
        });
      }

      // Check if officer is suspended
      const isSuspendedOfficer =
        (user?.role === 'officer' || (user?.backendRole || '').toLowerCase() === 'officer') &&
        (user?.isSuspended === true || user?.status === 'Suspended' || user?.status === 'Inactive');
      if (isSuspendedOfficer) {
        return rejectWithValue({
          type: 'OFFICER_SUSPENDED',
          officerName: user.name || '',
          departmentHeadName: user.suspendedBy || 'the Department Head',
          message: 'Your officer account has been suspended.',
        });
      }

      const session = normalizeSession(user);
      persistSession(session);
      return session;
    } catch (err) {
      return rejectWithValue(err.message || 'Invalid credentials. Please check your email and password.');
    }
  }
);

// 2. User Registration Thunk
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await apiRegister(userData);
      const returnedUser = res.data || {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: 'citizen',
        roleKey: 'citizen',
        jurisdiction: userData.jurisdiction,
        selectedJurisdictionNodeId: userData.selectedJurisdictionNodeId,
        stateId: userData.stateId,
      };

      const session = normalizeSession(returnedUser);
      persistSession(session);
      return session;
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed. Please try again.');
    }
  }
);

// 3. Request OTP Thunk
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async ({ phone, aadhaar }, { rejectWithValue }) => {
    try {
      const res = await apiRequestOtp(phone, aadhaar);
      return {
        otp: res.otp || '123456',
        message: res.message || `OTP sent to mobile ${phone}`,
      };
    } catch (err) {
      // In case backend is in simulation/mock mode
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        otp: fallbackOtp,
        message: `Simulation: OTP is ${fallbackOtp}`,
        isFallback: true,
      };
    }
  }
);

// 4. Update Profile Thunk
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const res = await apiUpdateProfile(id, data);
      const currentUser = getState().auth.user;
      const updatedUser = {
        ...currentUser,
        ...(res.data || res || {}),
        name: data.name || currentUser?.name,
        email: data.email || currentUser?.email,
        phone: data.phone || currentUser?.phone,
        ...data,
      };
      persistSession(updatedUser);
      return updatedUser;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update profile.');
    }
  }
);

// 5. Change Password Thunk
export const changeUserPassword = createAsyncThunk(
  'auth/changeUserPassword',
  async ({ id, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await apiChangePassword(id, currentPassword, newPassword);
      return res.message || 'Password changed successfully.';
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to change password.');
    }
  }
);

// 6. Fetch Users List (for forgot-password account search)
export const fetchUsersList = createAsyncThunk(
  'auth/fetchUsersList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiGetUsers();
      return Array.isArray(res) ? res : res?.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch users list.');
    }
  }
);

// ── Slice Definition ─────────────────────────────────────────────────────────

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = '';
      state.isLoggedIn = false;
      state.error = null;
      state.stateDeactivatedError = null;
      state.officerSuspendedError = null;
      persistSession(null);
    },
    clearAuthError: (state) => {
      state.error = null;
      state.stateDeactivatedError = null;
      state.officerSuspendedError = null;
    },
    setSession: (state, action) => {
      const session = normalizeSession(action.payload);
      state.user = session;
      state.role = session?.role?.toLowerCase() || '';
      state.isLoggedIn = Boolean(session);
      persistSession(session);
    },
    updateUserLocal: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        persistSession(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    // ── loginUser ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.stateDeactivatedError = null;
        state.officerSuspendedError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload?.role?.toLowerCase() || '';
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object') {
          if (action.payload.type === 'STATE_DEACTIVATED') {
            state.stateDeactivatedError = action.payload;
          } else if (action.payload.type === 'OFFICER_SUSPENDED') {
            state.officerSuspendedError = action.payload;
          }
          state.error = action.payload.message || 'Authentication failed.';
        } else {
          state.error = action.payload || 'Authentication failed.';
        }
      });

    // ── registerUser ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload?.role?.toLowerCase() || '';
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed.';
      });

    // ── requestOtp ──
    builder
      .addCase(requestOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.simulatedOtp = action.payload.otp;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to request OTP.';
      });

    // ── updateUserProfile ──
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile.';
      });

    // ── changeUserPassword ──
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to change password.';
      });

    // ── fetchUsersList ──
    builder
      .addCase(fetchUsersList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.loading = false;
        state.usersList = action.payload;
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, setSession, updateUserLocal } = authSlice.actions;
export default authSlice.reducer;

