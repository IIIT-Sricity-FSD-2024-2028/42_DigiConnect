// src/hooks/useToast.js
// Custom hook that encapsulates toast notification state and logic.
//
// React Concepts Demonstrated:
//  [Hooks]  — useState for storing the current toast message
//  [State]  — toast state holds { message, type } or null when no toast is shown
//
// Usage:
//   const { toast, showToast, hideToast } = useToast();
//   showToast('Done!', 'success');   // type: 'success' | 'error' | 'warning' | 'info'

import { useState } from 'react';

function useToast(duration = 3500) {
  const [toast, setToast] = useState(null);

  // Show a toast message — auto-dismisses after `duration` ms
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Manually hide the toast (used by the close button callback)
  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
}

export default useToast;
