"use client";

import { useState, useEffect, useRef } from 'react';

interface UseTimerProps {
  duration: number; // in seconds
  autoStart?: boolean;
  onComplete?: () => void;
  persistKey?: string; // localStorage key for persistence
}

interface UseTimerReturn {
  time: number; // remaining time in seconds
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  getTimeUsed: () => number;
}

interface TimerState {
  remainingTime: number;
  isRunning: boolean;
  startedAt: number | null;
  pausedAt: number | null;
}

export function useTimer({
  duration,
  autoStart = false,
  onComplete,
  persistKey
}: UseTimerProps): UseTimerReturn {
  const [time, setTime] = useState<number>(duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Load persisted state if available
  useEffect(() => {
    if (persistKey) {
      const savedState = localStorage.getItem(persistKey);
      if (savedState) {
        try {
          const parsedState: TimerState = JSON.parse(savedState);
          
          // If the timer was running when the page was closed/refreshed
          if (parsedState.isRunning && parsedState.startedAt) {
            const elapsedSinceLastSave = Math.floor((Date.now() - parsedState.startedAt) / 1000);
            const newRemainingTime = Math.max(0, parsedState.remainingTime - elapsedSinceLastSave);
            
            setTime(newRemainingTime);
            if (newRemainingTime > 0) {
              // Auto-start if it was running before
              startTimeRef.current = Date.now() - (duration - newRemainingTime) * 1000;
              setIsRunning(true);
            } else {
              // Timer would have completed
              setTime(0);
              if (onComplete) onComplete();
            }
          } else {
            // Timer was paused
            setTime(parsedState.remainingTime);
            setIsPaused(true);
            pausedTimeRef.current = duration - parsedState.remainingTime;
          }
        } catch (error) {
          console.error('Error parsing saved timer state:', error);
        }
      }
    }
  }, [persistKey, duration, onComplete]);

  // Save state when it changes
  useEffect(() => {
    if (persistKey) {
      const stateToSave: TimerState = {
        remainingTime: time,
        isRunning,
        startedAt: startTimeRef.current ? Date.now() : null,
        pausedAt: isPaused ? Date.now() : null
      };
      localStorage.setItem(persistKey, JSON.stringify(stateToSave));
    }
  }, [time, isRunning, isPaused, persistKey]);

  // Auto-start timer if specified
  useEffect(() => {
    if (autoStart) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        const remaining = duration - elapsed - pausedTimeRef.current;
        
        if (remaining <= 0) {
          setTime(0);
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (onComplete) onComplete();
        } else {
          setTime(remaining);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, duration, onComplete]);

  const start = () => {
    if (!isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      } else if (isPaused) {
        // If resuming from pause, adjust the start time
        const pauseDuration = Date.now() - (startTimeRef.current + pausedTimeRef.current * 1000);
        pausedTimeRef.current += Math.floor(pauseDuration / 1000);
      }
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pause = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
    }
  };

  const reset = () => {
    setTime(duration);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getTimeUsed = () => {
    return duration - time;
  };

  return {
    time,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    getTimeUsed
  };
}

export default useTimer;