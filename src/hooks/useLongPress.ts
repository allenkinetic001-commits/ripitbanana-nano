import { useState, useRef, useCallback } from 'react';

export const useLongPress = (callback: () => void, ms = 500) => {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      callback();
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.stopPropagation();
      e.preventDefault();
      // Reset for next click
      isLongPressRef.current = false;
    }
  }, []);

  return {
    isPressing,
    handlers: {
      onPointerDown: start,
      onPointerUp: stop,
      onPointerLeave: stop,
      onPointerCancel: stop,
      onClickCapture,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(), // Disable context menu on long press
    }
  };
};
