"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Clock } from 'lucide-react';

interface SpeechTimerProps {
  maxDuration: number; // in seconds (e.g., 420 for 7 minutes)
  role: string;
  onTimeUpdate: (elapsed: number) => void;
  onComplete: () => void;
  isActive: boolean;
}

const SpeechTimer: React.FC<SpeechTimerProps> = ({
  maxDuration,
  role,
  onTimeUpdate,
  onComplete,
  isActive
}) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning && isActive) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const totalElapsed = Math.floor((now - (startTimeRef.current || 0)) / 1000) - pausedTimeRef.current;
        
        if (totalElapsed >= maxDuration) {
          setElapsed(maxDuration);
          setIsRunning(false);
          onTimeUpdate(maxDuration);
          onComplete();
        } else {
          setElapsed(totalElapsed);
          onTimeUpdate(totalElapsed);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isActive, maxDuration, onTimeUpdate, onComplete]);

  const start = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    } else if (isPaused) {
      // Resume from pause
      const pauseDuration = Date.now() - (startTimeRef.current + elapsed * 1000);
      pausedTimeRef.current += Math.floor(pauseDuration / 1000);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsed(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    onTimeUpdate(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (elapsed / maxDuration) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    const percentage = (elapsed / maxDuration) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const progress = Math.min((elapsed / maxDuration) * 100, 100);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Speech Timer - {role}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getTimeColor()}`}>
            {formatTime(elapsed)}
          </div>
          <div className="text-sm text-muted-foreground">
            / {formatTime(maxDuration)}
          </div>
        </div>

        <Progress value={progress} className="h-3">
          <div 
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </Progress>

        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={start} disabled={!isActive || elapsed >= maxDuration}>
              <Play className="mr-2 h-4 w-4" />
              {isPaused ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button onClick={pause} variant="outline">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          <Button onClick={stop} variant="outline" disabled={elapsed === 0}>
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>

        {/* Time markers */}
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className={elapsed >= 60 ? 'text-green-600 font-medium' : ''}>
            1:00 - POI start
          </div>
          <div className={elapsed >= 360 ? 'text-orange-600 font-medium' : ''}>
            6:00 - POI end
          </div>
          <div className={elapsed >= maxDuration ? 'text-red-600 font-medium' : ''}>
            {formatTime(maxDuration)} - Time up
          </div>
        </div>

        {elapsed >= maxDuration && (
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-md">
            <span className="text-red-800 font-medium">Time's up!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpeechTimer;