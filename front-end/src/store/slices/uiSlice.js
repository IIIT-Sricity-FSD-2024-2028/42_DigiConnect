import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial State for Global UI Presentation
 * Strictly manages ephemeral presentation state:
 * - Toast notifications (visibility, message, type, duration)
 * - Sidebar state (isOpen for responsive mobile drawer)
 * - Global shared modal dialog state
 */
const initialState = {
  toast: {
    id: 0,
    visible: false,
    message: '',
    type: 'success', // 'success' | 'error' | 'warning' | 'info'
    duration: 3500,
  },
  sidebar: {
    isOpen: false,
  },
  modal: {
    isOpen: false,
    modalType: null,
    modalProps: {},
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ── Toast Notification Reducers ──
    showToast: (state, action) => {
      const payload = action.payload;
      state.toast.id = (state.toast.id || 0) + 1;
      state.toast.visible = true;
      if (typeof payload === 'string') {
        state.toast.message = payload;
        state.toast.type = 'success';
        state.toast.duration = 3500;
      } else if (payload && typeof payload === 'object') {
        state.toast.message = payload.message || '';
        state.toast.type = payload.type || 'success';
        state.toast.duration =
          payload.duration !== undefined ? payload.duration : 3500;
      }
    },
    hideToast: (state) => {
      state.toast.visible = false;
      state.toast.message = '';
    },

    // ── Sidebar Reducers ──
    openSidebar: (state) => {
      state.sidebar.isOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebar.isOpen = false;
    },
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },

    // ── Shared Modal Reducers ──
    openModal: (state, action) => {
      const payload = action.payload || {};
      state.modal.isOpen = true;
      state.modal.modalType = payload.modalType || null;
      state.modal.modalProps = payload.modalProps || {};
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.modalType = null;
      state.modal.modalProps = {};
    },
  },
});

export const {
  showToast,
  hideToast,
  openSidebar,
  closeSidebar,
  toggleSidebar,
  openModal,
  closeModal,
} = uiSlice.actions;

// Selectors
export const selectToast = (state) => state.ui.toast;
export const selectSidebarOpen = (state) => state.ui.sidebar.isOpen;
export const selectModal = (state) => state.ui.modal;

export default uiSlice.reducer;

