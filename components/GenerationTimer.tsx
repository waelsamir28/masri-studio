import React, { useState, useEffect, useRef } from 'react';

interface GenerationTimerProps {
  isActive: boolean;
}

export const GenerationTimer: React.FC<GenerationTimerProps> = ({ isActive }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) { setSeconds(0); intervalRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000); }
    else { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive]);

  const formatTime = (secs: number): string => { const mins = Math.floor(secs / 60); const s = secs % 60; return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };
  if (!isActive && seconds === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${isActive ? 'bg-accent-soft border-accent/30 text-accent' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600'}`}>
      <i className={`fas ${isActive ? 'fa-clock' : 'fa-check-circle'} text-[10px] ${isActive ? 'animate-pulse' : ''}`}></i>
      <span className="text-[10px] font-mono font-medium">{formatTime(seconds)}</span>
    </div>
  );
};
