

import React, { useRef, useState, useEffect } from 'react';
import { GeneratedSpeech } from '../types';
import { VoiceProcessor } from '../services/audioMixer';

interface ResultsViewProps {
  history: GeneratedSpeech[];
  onDelete: (id: string) => void;
  lang: 'en' | 'ar';
}

export const ResultsView: React.FC<ResultsViewProps> = ({ history, onDelete, lang }) => {
  const processorRef = useRef<VoiceProcessor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    processorRef.current = new VoiceProcessor();
    return () => {
      processorRef.current?.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Visualizer Loop
  const drawVisualizer = () => {
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
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Gold Gradient (Uses CSS var logic but in JS, keeping simpler hex for canvas usually fine or get computed style)
        // Sticking to hardcoded Amber for visualizer as it matches the accent
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.2)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };
    draw();
  };

  const handlePlay = async (speech: GeneratedSpeech) => {
    if (!processorRef.current || !speech.audioUrl) return;
    
    if (playingId === speech.id) {
      processorRef.current.stop();
      setPlayingId(null);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    setPlayingId(speech.id);
    await processorRef.current.processAndPlay(speech.audioUrl, 1.0, 1.0);
    
    // Start Visualizer
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setTimeout(drawVisualizer, 100); // Small delay to ensure audio context is ready
  };

  const handleDownload = async (speech: GeneratedSpeech) => {
     if (!processorRef.current || !speech.audioUrl) return;
     try {
       const blob = await processorRef.current.exportProcessedAudio(speech.audioUrl, 1.0, 1.0);
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       const actorName = speech.actor.name;
       const toneName = speech.customTone ? 'Custom' : (speech.preset?.id || 'Tone');
       a.download = `MASRI_${actorName}_${toneName}.mp3`;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
     } catch (e) {
       console.error(e);
     }
  };

  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      {history.map((speech) => {
        const isPlaying = playingId === speech.id;
        
        return (
          <div 
            key={speech.id} 
            className={`relative overflow-hidden transition-all duration-300 rounded-2xl border flex flex-col p-4 gap-4 ${
               isPlaying
               ? 'bg-surface border-accent shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
               : 'bg-highlight border-border hover:bg-surface'
            }`}
          >
             {/* Header Row */}
             <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${speech.actor.imageColor} shadow-lg flex items-center justify-center shrink-0`}>
                    <span className="text-white/40 font-bold text-sm">{speech.actor.name.charAt(0)}</span>
                    {isPlaying && (
                      <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-75"></div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-txt-primary font-bold text-base">{lang === 'ar' ? speech.actor.nameAr : speech.actor.name}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-accent/10 text-accent border border-accent/20">
                           {speech.customTone ? 'CUSTOM' : (lang === 'ar' ? speech.preset?.labelAr : speech.preset?.label)}
                        </span>
                    </div>
                    <p className={`text-txt-secondary text-xs truncate ${lang === 'ar' ? 'font-arabic' : ''}`} dir="rtl">
                        {speech.text}
                    </p>
                </div>
             </div>

             {/* Visualizer & Controls Row */}
             <div className="flex items-center gap-4 mt-2 bg-primary p-2 rounded-xl border border-border">
                
                {/* Visualizer Area */}
                <div className="flex-1 h-12 relative rounded-lg overflow-hidden bg-highlight">
                   {isPlaying ? (
                      <canvas ref={canvasRef} width={300} height={50} className="w-full h-full opacity-80" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center">
                         <div className="h-[2px] w-full bg-border"></div>
                      </div>
                   )}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handlePlay(speech)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isPlaying 
                        ? 'bg-accent text-white hover:bg-accent-dim' 
                        : 'bg-surface border border-border text-txt-muted hover:text-txt-primary hover:bg-highlight'
                      }`}
                    >
                       <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play pl-1'}`}></i>
                    </button>

                    <button 
                      onClick={() => handleDownload(speech)}
                      className="w-10 h-10 rounded-full bg-surface border border-border text-txt-muted hover:text-accent hover:border-accent hover:bg-highlight flex items-center justify-center transition-all"
                    >
                       <i className="fas fa-download"></i>
                    </button>

                    <button 
                      onClick={() => onDelete(speech.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-txt-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                       <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
             </div>
          </div>
        );
      })}
    </div>
  );
};
