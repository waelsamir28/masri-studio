import React, { useRef, useEffect, useState } from 'react';
import { GeneratedSpeech } from '../types';
import { VoiceProcessor } from '../services/audioMixer';

interface AudioPlayerModalProps {
  speech: GeneratedSpeech | null;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ speech, onClose, lang }) => {
  const processorRef = useRef<VoiceProcessor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    processorRef.current = new VoiceProcessor();
    return () => {
      processorRef.current?.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (speech?.audioUrl && processorRef.current) {
      setIsPlaying(true);
      processorRef.current.processAndPlay(speech.audioUrl, 1.0, 1.0, () => setIsPlaying(false));
      
      // Visualizer
      setTimeout(() => {
        if (!canvasRef.current || !processorRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const analyser = processorRef.current.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const draw = () => {
          animationFrameRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight, x = 0;
          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#06b6d4');
            gradient.addColorStop(1, 'rgba(6,182,212,0.2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        draw();
      }, 200);
    }
  }, [speech]);

  if (!speech) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      processorRef.current?.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      processorRef.current?.processAndPlay(speech.audioUrl!, 1.0, 1.0, () => setIsPlaying(false));
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative win11-card p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl icon-3d-cyan icon-3d flex items-center justify-center">
              <i className="fas fa-music text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">{lang === 'ar' ? 'الصوت المولد' : 'Generated Audio'}</h3>
              <p className="text-[10px] text-txt-muted">{lang === 'ar' ? speech.actor.nameAr : speech.actor.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg win11-button flex items-center justify-center text-txt-muted hover:text-txt-primary">
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Text Preview */}
        <div className="p-3 rounded-lg bg-surface2/50 border border-border mb-4 max-h-24 overflow-y-auto">
          <p className="text-xs text-txt-muted" dir="rtl">{speech.text}</p>
        </div>

        {/* Visualizer */}
        <div className="h-24 rounded-lg bg-surface2/30 border border-border overflow-hidden mb-4">
          <canvas ref={canvasRef} width={400} height={100} className="w-full h-full"></canvas>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePlayPause}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl pl-1`}></i>
          </button>
        </div>

        {/* Status */}
        <p className="text-center text-[10px] text-txt-muted mt-3">
          {isPlaying ? (lang === 'ar' ? 'جاري التشغيل...' : 'Playing...') : (lang === 'ar' ? 'متوقف' : 'Paused')}
        </p>
      </div>
    </div>
  );
};
