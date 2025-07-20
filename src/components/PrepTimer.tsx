"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTimer } from '@/hooks/useTimer';
import { Clock, Play, Pause, RotateCcw, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrepTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  onStartDebate: (timeUsed: number) => void;
  sessionId?: string; // For persistence
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const PrepTimer: React.FC<PrepTimerProps> = ({
  duration,
  onComplete,
  onStartDebate,
  sessionId
}) => {
  const { toast } = useToast();
  const persistKey = sessionId ? `prep-timer-${sessionId}` : undefined;
  
  const {
    time,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    getTimeUsed
  } = useTimer({
    duration,
    autoStart: false,
    onComplete,
    persistKey
  });

  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    setProgress((time / duration) * 100);
  }, [time, duration]);

  useEffect(() => {
    // Show notifications at specific time points
    if (time === 300) { // 5 minutes left
      toast({
        title: "5 Minutes Remaining",
        description: "You have 5 minutes left in your preparation time.",
      });
    } else if (time === 60) { // 1 minute left
      toast({
        title: "1 Minute Remaining",
        description: "You have 1 minute left in your preparation time.",
      });
    }
  }, [time, toast]);

  const handleStartDebate = () => {
    const timeUsed = getTimeUsed();
    onStartDebate(timeUsed);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Preparation Timer
        </CardTitle>
        <CardDescription>
          Use this time to prepare your arguments before the debate begins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-5xl font-bold mb-2">
            {formatTime(time)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isRunning ? 'Time Remaining' : isPaused ? 'Timer Paused' : 'Timer Ready'}
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="grid grid-cols-3 gap-2">
          {!isRunning && !isPaused ? (
            <Button onClick={start} className="col-span-3">
              <Play className="mr-2 h-4 w-4" /> Start Preparation
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button onClick={pause} variant="outline">
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </Button>
              ) : (
                <Button onClick={start} variant="outline">
                  <Play className="mr-2 h-4 w-4" /> Resume
                </Button>
              )}
              <Button onClick={reset} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button onClick={handleStartDebate} variant="default">
                <ArrowRight className="mr-2 h-4 w-4" /> Start Debate
              </Button>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>
          {isRunning || isPaused ? `${Math.floor(getTimeUsed() / 60)} minutes used` : 'Timer not started'}
        </div>
        <div>
          {time === 0 ? 'Time\'s up!' : `${Math.floor(time / 60)} minutes remaining`}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PrepTimer;