import { useState, useRef, useEffect, useCallback } from 'react';

function useToast(duration = 3500) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Show a toast message — auto-dismisses after `duration` ms
  const showToast = useCallback((message, type = 'success', customDuration) => {
    clearTimer();
    setToast({ message, type });
    const delay = customDuration !== undefined ? customDuration : duration;
    if (delay > 0) {
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, delay);
    }
  }, [duration, clearTimer]);

  // Manually hide the toast (used by the close button callback)
  const hideToast = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  return { toast, showToast, hideToast };
}

export default useToast;
