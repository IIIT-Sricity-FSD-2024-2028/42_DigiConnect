
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';

// Placeholder reducers so the app never shows a blank screen while teammates build their slices
const initialPlaceholder = (name) => (state = { status: 'idle' }) => state;

export const store = configureStore({
  reducer: {
    citizen: initialPlaceholder('citizen'),
    auth: initialPlaceholder('auth'),
    officer: initialPlaceholder('officer'),
    centralAdmin: initialPlaceholder('centralAdmin'),
    deptHead: initialPlaceholder('deptHead'),
    stateAdmin: initialPlaceholder('stateAdmin'),
    grievance: initialPlaceholder('grievance'),
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
