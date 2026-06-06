"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(
  initialSeconds: number,
  onExpire?: () => void,
  autoStart = false
) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    expiredRef.current = false;
    setRunning(true);
  }, []);

  const stop = useCallback(() => setRunning(false), []);

  const reset = useCallback(
    (newSeconds?: number) => {
      expiredRef.current = false;
      setSeconds(newSeconds ?? initialSeconds);
      setRunning(false);
    },
    [initialSeconds]
  );

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const pct = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0;

  return { seconds, display, pct, running, start, stop, reset };
}
