
import React, { useRef, useState, useEffect } from 'react';
import { GeneratedSpeech } from '../types';
import { VoiceProcessor } from '../services/audioMixer';
import { ShareModal } from './ShareModal';

interface ResultsViewProps {
  history: GeneratedSpeech[];
  onDelete: (id: string) => void;
  lang: 'en' | 'ar';
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ history, onDelete, lang, favorites = [], onToggleFavorite }) => {
  const processorRef = useRef<VoiceProcessor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; speech: GeneratedSpeech | null }>({ isOpen: false, speech: null });
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    processorRef.current = new VoiceProcessor();
    return () => {
      processorRef.current?.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

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
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');

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
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setTimeout(drawVisualizer, 100);
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
        const isFavorite = favorites.includes(speech.id);
        
        return (
          <div 
            key={speech.id} 
            className={`relative overflow-hidden transition-all duration-300 glass-card flex flex-col p-4 gap-4 animate-slide-up ${
               isPlaying
               ? 'border-accent shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
               : 'hover:border-accent/30'
            }`}
          >
             {/* Header Row */}
             <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${speech.actor.imageColor} shadow-lg flex items-center justify-center shrink-0 icon-3d`}>
                    <span className="text-white/40 font-bold text-sm font-display">{speech.actor.name.charAt(0)}</span>
                    {isPlaying && (
                      <div className="absolute inset-0 rounded-xl border-2 border-accent animate-ping opacity-75"></div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-txt-primary font-bold text-base font-display">{lang === 'ar' ? speech.actor.nameAr : speech.actor.name}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-accent/10 text-accent border border-accent/20">
                           {speech.customTone ? 'CUSTOM' : (lang === 'ar' ? speech.preset?.labelAr : speech.preset?.label)}
                        </span>
                    </div>
                    <p className={`text-txt-secondary text-xs truncate ${lang === 'ar' ? 'font-arabic' : ''}`} dir="rtl">
                        {speech.text}
                    </p>
                </div>
             </div>

             {/* Visualizer & Controls Row */}
             <div className="flex items-center gap-3 mt-2 p-2 rounded-xl glass border border-border">
                
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
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Play/Stop */}
                    <button 
                      onClick={() => handlePlay(speech)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all btn-3d ${
                        isPlaying 
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' 
                        : 'glass border border-border text-txt-muted hover:text-accent hover:border-accent/30'
                      }`}
                    >
                       <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play pl-0.5'} text-xs`}></i>
                    </button>

                    {/* Download */}
                    <button 
                      onClick={() => handleDownload(speech)}
                      className="w-9 h-9 rounded-xl glass border border-border text-txt-muted hover:text-accent hover:border-accent/30 flex items-center justify-center transition-all btn-3d"
                      title={lang === 'ar' ? 'تحميل' : 'Download'}
                    >
                       <i className="fas fa-download text-xs"></i>
                    </button>

                    {/* Share */}
                    <button 
                      onClick={() => setShareModal({ isOpen: true, speech })}
                      className="w-9 h-9 rounded-xl glass border border-border text-txt-muted hover:text-blue-400 hover:border-blue-400/30 flex items-center justify-center transition-all btn-3d"
                      title={lang === 'ar' ? 'مشاركة' : 'Share'}
                    >
                       <i className="fas fa-share-nodes text-xs"></i>
                    </button>

                    {/* Favorite */}
                    {onToggleFavorite && (
                      <button 
                        onClick={() => onToggleFavorite(speech.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all btn-3d border ${
                          isFavorite 
                            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                            : 'glass border-border text-txt-muted hover:text-red-400 hover:border-red-400/30'
                        }`}
                        title={lang === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites'}
                      >
                         <i className={`fas fa-heart text-xs ${isFavorite ? 'fa-beat' : ''}`}></i>
                      </button>
                    )}

                    {/* Delete */}
                    <button 
                      onClick={() => onDelete(speech.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-txt-muted hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                      title={lang === 'ar' ? 'حذف' : 'Delete'}
                    >
                       <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
             </div>
          </div>
        );
      })}

      {/* Share Modal */}
      {shareModal.speech && (
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false, speech: null })}
          text={shareModal.speech.text}
          actorName={lang === 'ar' ? shareModal.speech.actor.nameAr : shareModal.speech.actor.name}
          lang={lang}
        />
      )}
    </div>
  );
};
