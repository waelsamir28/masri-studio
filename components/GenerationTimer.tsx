import React, { useState, useEffect, useRef } from 'react';

interface GenerationTimerProps { isActive: boolean; }

export const GenerationTimer: React.FC<GenerationTimerProps> = ({ isActive }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) { setSeconds(0); intervalRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000); }
    else { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive]);

  const formatTime = (secs: number): string => { const m = Math.floor(secs / 60); const s = secs % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };
  if (!isActive && seconds === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${isActive ? 'bg-accent-soft border-accent/30 text-accent' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
      <i className={`fas ${isActive ? 'fa-clock' : 'fa-check-circle'} text-[10px] ${isActive ? 'animate-pulse' : ''}`}></i>
      <span className="text-[10px] font-mono font-bold">{formatTime(seconds)}</span>
    </div>
  );
};
