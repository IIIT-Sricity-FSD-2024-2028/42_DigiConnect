
import { configureStore } from '@reduxjs/toolkit';
import citizenReducer from './slices/citizenSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import grievanceReducer from './slices/grievanceSlice';
import officerReducer from './slices/officerSlice';

// Placeholder reducers for modules still under development
const initialPlaceholder = (name) => (state = { status: 'idle' }) => state;

export const store = configureStore({
  reducer: {
    citizen: citizenReducer,
    auth: authReducer,
    officer: officerReducer,
    centralAdmin: initialPlaceholder('centralAdmin'),
    deptHead: initialPlaceholder('deptHead'),
    stateAdmin: initialPlaceholder('stateAdmin'),
    grievance: grievanceReducer,
    ui: uiReducer,
    notification: notificationReducer,
    notifications: notificationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
