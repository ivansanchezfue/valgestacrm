import { useEffect, useRef, useCallback } from "react";

interface UseInactivityTimeoutOptions {
  timeout: number;
  onTimeout: () => void;
  enabled: boolean;
}

export const useInactivityTimeout = ({ timeout, onTimeout, enabled }: UseInactivityTimeoutOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onTimeoutRef.current(), timeout);
  }, [timeout]);

  useEffect(() => {
    if (!enabled) return;

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [enabled, resetTimer]);
};
