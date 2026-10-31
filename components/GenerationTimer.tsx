import React, { useState, useEffect, useRef } from 'react';

interface GenerationTimerProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const GenerationTimer: React.FC<GenerationTimerProps> = ({ isActive, onComplete }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (!isActive && seconds === 0) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
      isActive 
        ? 'bg-accent/5 border-accent/20 text-accent animate-pulse' 
        : 'bg-green-500/5 border-green-500/20 text-green-400'
    }`}>
      <i className={`fas ${isActive ? 'fa-clock fa-spin' : 'fa-check-circle'}`}></i>
      <span className="text-xs font-mono font-bold">{formatTime(seconds)}</span>
      {isActive && (
        <span className="text-[9px] text-txt-muted">
          {seconds > 30 ? '⚡' : '⏳'}
        </span>
      )}
    </div>
  );
};

// Also export a simple hook for timer logic
export const useGenerationTimer = () => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setElapsedTime(0);
    setIsTimerActive(true);
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setElapsedTime(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isTimerActive, elapsedTime, startTimer, stopTimer, resetTimer };
};
