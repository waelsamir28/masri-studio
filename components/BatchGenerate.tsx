import React, { useState } from 'react';
import { VoiceActor, VOICE_ACTORS, Gender, GeneratedSpeech } from '../types';
import { generateSpeech } from '../services/geminiService';
import { addToast, showBrowserNotification, playNotificationSound } from '../services/notificationService';

interface BatchGenerateProps { text: string; lang: 'en' | 'ar'; onGenerated: (speeches: GeneratedSpeech[]) => void; }

const ACTOR_GRADIENTS = ['from-blue-500 to-blue-700','from-cyan-500 to-cyan-700','from-purple-500 to-purple-700','from-pink-500 to-pink-700','from-orange-500 to-orange-700','from-emerald-500 to-emerald-700','from-red-500 to-red-700','from-teal-500 to-teal-700','from-indigo-500 to-indigo-700','from-amber-500 to-amber-700'];
const ACTOR_EMOJIS: Record<string, string> = { actor_hassan:'🎙️',actor_amr:'📻',actor_mido:'⚡',actor_sherif:'🔥',actor_tarek:'💪',actor_khaled:'🎬',actor_magdy:'👴',actor_youssef:'🧠',actor_seif:'⚔️',actor_kareem:'💻',actor_moataz:'🌙',actor_layla:'🌸',actor_dalia:'📺',actor_sarah:'✨',actor_rania:'💋',actor_hoda:'🎉',actor_nour:'🌹',actor_menna:'📱',actor_salma:'👩‍💼',actor_faten:'🎭' };

export const BatchGenerate: React.FC<BatchGenerateProps> = ({ text, lang, onGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActors, setSelectedActors] = useState<string[]>([]);
  const [gender, setGender] = useState<Gender>('MALE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const filteredActors = VOICE_ACTORS.filter(a => a.gender === gender);
  const toggleActor = (id: string) => { setSelectedActors(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]); };
  const selectAll = () => { setSelectedActors(selectedActors.length === filteredActors.length ? [] : filteredActors.map(a => a.id)); };

  const handleGenerate = async () => {
    if (selectedActors.length === 0 || !text.trim()) return;
    setIsGenerating(true); setProgress(0);
    const speeches: GeneratedSpeech[] = [];
    for (let i = 0; i < selectedActors.length; i++) {
      const actor = VOICE_ACTORS.find(a => a.id === selectedActors[i])!;
      try { const url = await generateSpeech(text, actor, null, ''); speeches.push({ id: Date.now().toString() + i, text, actor, preset: null, audioUrl: url, timestamp: Date.now() }); setProgress(Math.round(((i + 1) / selectedActors.length) * 100)); } catch (err) { console.error(err); }
    }
    setIsGenerating(false); onGenerated(speeches);
    addToast('success', lang === 'ar' ? 'اكتمل التوليد' : 'Done!', `${speeches.length} ${lang === 'ar' ? 'صوت' : 'voices'}`);
    showBrowserNotification('MASRI Studio', `${speeches.length} voices generated`);
    playNotificationSound('success');
  };

  if (!isOpen) {
    return <button onClick={() => setIsOpen(true)} disabled={!text.trim()} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all btn-soft ${text.trim() ? 'btn-secondary' : 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'}`}><i className="fas fa-layer-group text-[11px]"></i>{lang === 'ar' ? 'توليد متعدد' : 'Batch'}</button>;
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={() => !isGenerating && setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative card p-5 w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl icon-3d-purple icon-3d flex items-center justify-center"><i className="fas fa-layer-group text-sm"></i></div>
            <h3 className="text-sm font-bold text-txt-primary">{lang === 'ar' ? 'توليد متعدد' : 'Batch Generate'}</h3>
          </div>
          <button onClick={() => !isGenerating && setIsOpen(false)} className="w-8 h-8 rounded-xl bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors"><i className="fas fa-times text-xs"></i></button>
        </div>

        <div className="flex gap-1.5 mb-3 shrink-0">
          {(['MALE', 'FEMALE'] as Gender[]).map(g => (
            <button key={g} onClick={() => { setGender(g); setSelectedActors([]); }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${gender === g ? 'btn-primary shadow-lg' : 'btn-secondary'}`}><i className={`fas ${g === 'MALE' ? 'fa-mars' : 'fa-venus'}`}></i>{lang === 'ar' ? (g === 'MALE' ? 'رجال' : 'سيدات') : g}</button>
          ))}
        </div>

        <button onClick={selectAll} className="w-full py-1.5 mb-3 rounded-xl border border-border text-[10px] font-bold text-txt-muted hover:text-accent hover:border-accent/30 transition-all shrink-0">{selectedActors.length === filteredActors.length ? (lang === 'ar' ? 'إلغاء الكل' : 'Deselect All') : (lang === 'ar' ? `تحديد الكل (${filteredActors.length})` : `Select All (${filteredActors.length})`)}</button>

        <div className="flex-1 overflow-y-auto mb-4">
          <div className="grid grid-cols-4 gap-2">
            {filteredActors.map((actor, idx) => {
              const isSelected = selectedActors.includes(actor.id);
              const gradient = ACTOR_GRADIENTS[idx % ACTOR_GRADIENTS.length];
              const emoji = ACTOR_EMOJIS[actor.id] || '🎤';
              return (
                <button key={actor.id} onClick={() => toggleActor(actor.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? 'bg-accent-soft border border-accent/30' : 'hover:bg-surface2 border border-transparent'}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${isSelected ? 'ring-2 ring-accent scale-105' : 'opacity-80'}`}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                    <span className="text-lg z-10">{emoji}</span>
                  </div>
                  <span className={`text-[8px] font-bold truncate w-full text-center ${isSelected ? 'text-accent' : 'text-txt-muted'}`}>{lang === 'ar' ? actor.nameAr : actor.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isGenerating && (
          <div className="mb-3 shrink-0">
            <div className="flex items-center justify-between text-[10px] text-txt-muted mb-1"><span>{lang === 'ar' ? 'جاري...' : 'Generating...'}</span><span>{progress}%</span></div>
            <div className="h-2 rounded-full bg-surface2 overflow-hidden"><div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
          </div>
        )}

        <button onClick={handleGenerate} disabled={selectedActors.length === 0 || isGenerating} className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 ${selectedActors.length === 0 || isGenerating ? 'bg-surface2 text-txt-muted cursor-not-allowed border border-border' : 'btn-primary shadow-lg'}`}>
          {isGenerating ? <><i className="fas fa-spinner fa-spin"></i>{lang === 'ar' ? 'جاري...' : 'Generating...'}</> : <><i className="fas fa-layer-group"></i>{lang === 'ar' ? `توليد (${selectedActors.length})` : `Generate (${selectedActors.length})`}</>}
        </button>
      </div>
    </div>
  );
};
