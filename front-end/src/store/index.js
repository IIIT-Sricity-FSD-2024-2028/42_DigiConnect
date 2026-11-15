
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import officerReducer from './slices/officerSlice';

// Placeholder reducers so the app never shows a blank screen while teammates build their slices
const initialPlaceholder = (name) => (state = { status: 'idle' }) => state;

export const store = configureStore({
  reducer: {
    citizen: initialPlaceholder('citizen'),
    auth: authReducer,
    officer: officerReducer,
    centralAdmin: initialPlaceholder('centralAdmin'),
    deptHead: initialPlaceholder('deptHead'),
    stateAdmin: initialPlaceholder('stateAdmin'),
    grievance: initialPlaceholder('grievance'),
    ui: uiReducer,
    notification: notificationReducer,
    notifications: notificationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
