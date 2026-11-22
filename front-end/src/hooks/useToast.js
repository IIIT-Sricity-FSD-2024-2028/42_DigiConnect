import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  showToast as showToastAction,
  hideToast as hideToastAction,
  selectToast,
} from '../store/slices/uiSlice';

function useToast(duration = 3500) {
  const dispatch = useAppDispatch();
  const reduxToast = useAppSelector(selectToast);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearTimer();
    dispatch(hideToastAction());
  }, [clearTimer, dispatch]);

  const showToast = useCallback(
    (message, type = 'success', customDuration) => {
      clearTimer();
      const delay = customDuration !== undefined ? customDuration : duration;
      dispatch(showToastAction({ message, type, duration: delay }));
    },
    [clearTimer, dispatch, duration]
  );

  // Auto-dismissal effect triggered when Redux toast is visible or when a new toast is shown (id increments)
  useEffect(() => {
    if (reduxToast.visible) {
      clearTimer();
      const delay =
        reduxToast.duration !== undefined ? reduxToast.duration : duration;
      if (delay > 0) {
        timerRef.current = setTimeout(() => {
          dispatch(hideToastAction());
          timerRef.current = null;
        }, delay);
      }
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [
    reduxToast.id,
    reduxToast.visible,
    reduxToast.duration,
    duration,
    clearTimer,
    dispatch,
  ]);

  // Derived toast object: null when not visible, object when visible (matching legacy useToast return value)
  const toast = reduxToast.visible
    ? {
        id: reduxToast.id,
        message: reduxToast.message,
        type: reduxToast.type,
      }
    : null;

  return { toast, showToast, hideToast };
}

export default useToast;
