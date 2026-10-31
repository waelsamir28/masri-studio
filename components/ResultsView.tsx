
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

const ACTOR_GRADIENTS = [
  'from-blue-500 to-blue-700', 'from-cyan-500 to-cyan-700', 'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700', 'from-orange-500 to-orange-700', 'from-emerald-500 to-emerald-700',
  'from-red-500 to-red-700', 'from-teal-500 to-teal-700', 'from-indigo-500 to-indigo-700', 'from-amber-500 to-amber-700',
];
const ACTOR_EMOJIS: Record<string, string> = {
  actor_hassan: '🎙️', actor_amr: '📻', actor_mido: '⚡', actor_sherif: '🔥', actor_tarek: '💪', actor_khaled: '🎬',
  actor_magdy: '👴', actor_youssef: '🧠', actor_seif: '⚔️', actor_kareem: '💻', actor_moataz: '🌙',
  actor_layla: '🌸', actor_dalia: '📺', actor_sarah: '✨', actor_rania: '💋', actor_hoda: '🎉',
  actor_nour: '🌹', actor_menna: '📱', actor_salma: '👩‍💼', actor_faten: '🎭',
};

export const ResultsView: React.FC<ResultsViewProps> = ({ history, onDelete, lang, favorites = [], onToggleFavorite }) => {
  const processorRef = useRef<VoiceProcessor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; speech: GeneratedSpeech | null }>({ isOpen: false, speech: null });
  const animationFrameRef = useRef<number>();

  useEffect(() => { processorRef.current = new VoiceProcessor(); return () => { processorRef.current?.stop(); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); }; }, []);

  const drawVisualizer = () => {
    if (!canvasRef.current || !processorRef.current) return;
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); if (!ctx) return;
    const analyser = processorRef.current.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight; let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#06b6d4'); gradient.addColorStop(1, 'rgba(6,182,212,0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const handlePlay = async (speech: GeneratedSpeech) => {
    if (!processorRef.current || !speech.audioUrl) return;
    if (playingId === speech.id) { processorRef.current.stop(); setPlayingId(null); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); return; }
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
      const a = document.createElement('a'); a.href = url;
      a.download = `MASRI_${speech.actor.name}.mp3`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) { console.error(e); }
  };

  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {history.map((speech, idx) => {
        const isPlaying = playingId === speech.id;
        const isFavorite = favorites.includes(speech.id);
        const gradient = ACTOR_GRADIENTS[VOICE_ACTORS_INDEX(speech.actor.id) % ACTOR_GRADIENTS.length];
        const emoji = ACTOR_EMOJIS[speech.actor.id] || '🎤';
        return (
          <div key={speech.id} className={`card p-4 flex flex-col gap-3 animate-slide-up ${isPlaying ? 'border-accent shadow-[0_0_20px_rgba(6,182,212,0.15)]' : ''}`}>
             <div className="flex items-center gap-3">
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                    <span className="text-xl z-10">{emoji}</span>
                    {isPlaying && <div className="absolute inset-0 rounded-xl border-2 border-accent animate-ping opacity-75"></div>}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-txt-primary font-bold text-sm">{lang === 'ar' ? speech.actor.nameAr : speech.actor.name}</span>
                        <span className="px-1.5 py-0.5 rounded-lg text-[8px] font-bold bg-accent-soft text-accent">{speech.customTone ? 'CUSTOM' : (lang === 'ar' ? speech.preset?.labelAr : speech.preset?.label)}</span>
                    </div>
                    <p className="text-txt-muted text-[11px] truncate" dir="rtl">{speech.text}</p>
                </div>
             </div>

             <div className="flex items-center gap-2 p-2 rounded-xl bg-surface2 border border-border">
                <div className="flex-1 h-10 relative rounded-lg overflow-hidden">
                   {isPlaying ? <canvas ref={canvasRef} width={300} height={40} className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center"><div className="h-px w-full bg-border"></div></div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handlePlay(speech)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all text-xs ${isPlaying ? 'bg-accent text-white shadow-lg' : 'bg-surface border border-border text-txt-muted hover:text-accent hover:border-accent/30'}`}><i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play pl-0.5'}`}></i></button>
                    <button onClick={() => handleDownload(speech)} className="w-9 h-9 rounded-xl bg-surface border border-border text-txt-muted hover:text-accent hover:border-accent/30 flex items-center justify-center transition-all text-xs"><i className="fas fa-download"></i></button>
                    <button onClick={() => setShareModal({ isOpen: true, speech })} className="w-9 h-9 rounded-xl bg-surface border border-border text-txt-muted hover:text-blue-400 flex items-center justify-center transition-all text-xs"><i className="fas fa-share-nodes"></i></button>
                    {onToggleFavorite && (
                      <button onClick={() => onToggleFavorite(speech.id)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all text-xs border ${isFavorite ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-surface border-border text-txt-muted hover:text-red-400'}`}><i className={`fas fa-heart ${isFavorite ? 'fa-beat' : ''}`}></i></button>
                    )}
                    <button onClick={() => onDelete(speech.id)} className="w-9 h-9 rounded-xl bg-surface border border-border text-txt-muted hover:text-red-400 flex items-center justify-center transition-all text-xs"><i className="fas fa-trash-alt"></i></button>
                </div>
             </div>
          </div>
        );
      })}
      {shareModal.speech && <ShareModal isOpen={shareModal.isOpen} onClose={() => setShareModal({ isOpen: false, speech: null })} text={shareModal.speech.text} actorName={lang === 'ar' ? shareModal.speech.actor.nameAr : shareModal.speech.actor.name} lang={lang} />}
    </div>
  );
};

const VOICE_ACTORS_INDEX = (id: string): number => {
  const ids = ['actor_hassan','actor_amr','actor_mido','actor_sherif','actor_tarek','actor_khaled','actor_magdy','actor_youssef','actor_seif','actor_kareem','actor_moataz','actor_layla','actor_dalia','actor_sarah','actor_rania','actor_hoda','actor_nour','actor_menna','actor_salma','actor_faten'];
  return ids.indexOf(id);
};
