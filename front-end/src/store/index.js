
import { configureStore } from '@reduxjs/toolkit';
import citizenReducer from './slices/citizenSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import deptHeadReducer from './slices/deptHeadSlice';
import grievanceReducer from './slices/grievanceSlice';
import officerReducer from './slices/officerSlice';
import centralAdminReducer from './slices/centralAdminSlice';
import stateAdminReducer from './slices/stateAdminSlice';


export const store = configureStore({
  reducer: {
    citizen: citizenReducer,
    auth: authReducer,
    officer: officerReducer,
    deptHead: deptHeadReducer,
    centralAdmin: centralAdminReducer,
    stateAdmin: stateAdminReducer,
    grievance: grievanceReducer,
    ui: uiReducer,
    notification: notificationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
