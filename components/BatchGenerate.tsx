import React, { useState } from 'react';
import { VoiceActor, VOICE_ACTORS, Gender, GeneratedSpeech } from '../types';
import { generateSpeech } from '../services/geminiService';
import { addToast, showBrowserNotification, playNotificationSound } from '../services/notificationService';

interface BatchGenerateProps {
  text: string;
  lang: 'en' | 'ar';
  onGenerated: (speeches: GeneratedSpeech[]) => void;
}

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
      try {
        const audioUrl = await generateSpeech(text, actor, null, '');
        speeches.push({ id: Date.now().toString() + i, text, actor, preset: null, audioUrl, timestamp: Date.now() });
        setProgress(Math.round(((i + 1) / selectedActors.length) * 100));
      } catch (err) { console.error(err); }
    }
    setIsGenerating(false);
    onGenerated(speeches);
    addToast('success', lang === 'ar' ? 'اكتمل التوليد' : 'Done!', lang === 'ar' ? `تم توليد ${speeches.length} صوت` : `Generated ${speeches.length} voices`);
    showBrowserNotification('MASRI Studio', lang === 'ar' ? `تم توليد ${speeches.length} صوت` : `${speeches.length} voices generated`);
    playNotificationSound('success');
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} disabled={!text.trim()} className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all btn-soft ${text.trim() ? 'bg-surface2 border border-border text-txt-secondary hover:text-accent hover:border-accent/30' : 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'}`}>
        <i className="fas fa-layer-group text-[11px]"></i>{lang === 'ar' ? 'توليد متعدد' : 'Batch'}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={() => !isGenerating && setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative card-soft p-5 w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-layer-group text-sm"></i></div>
            <h3 className="text-sm font-semibold text-txt-primary">{lang === 'ar' ? 'توليد متعدد' : 'Batch Generate'}</h3>
          </div>
          <button onClick={() => !isGenerating && setIsOpen(false)} className="w-7 h-7 rounded-lg bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors"><i className="fas fa-times text-xs"></i></button>
        </div>

        <div className="flex gap-1.5 mb-3 shrink-0">
          {(['MALE', 'FEMALE'] as Gender[]).map(g => (
            <button key={g} onClick={() => { setGender(g); setSelectedActors([]); }} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${gender === g ? 'bg-accent text-white' : 'bg-surface2 text-txt-muted border border-border'}`}><i className={`fas ${g === 'MALE' ? 'fa-mars' : 'fa-venus'}`}></i>{lang === 'ar' ? (g === 'MALE' ? 'رجال' : 'سيدات') : g}</button>
          ))}
        </div>

        <button onClick={selectAll} className="w-full py-1.5 mb-3 rounded-lg border border-border text-[10px] font-medium text-txt-muted hover:text-accent hover:border-accent/30 transition-all shrink-0">
          {selectedActors.length === filteredActors.length ? (lang === 'ar' ? 'إلغاء الكل' : 'Deselect All') : (lang === 'ar' ? `تحديد الكل (${filteredActors.length})` : `Select All (${filteredActors.length})`)}
        </button>

        <div className="flex-1 overflow-y-auto mb-4">
          <div className="grid grid-cols-4 gap-2">
            {filteredActors.map(actor => {
              const isSelected = selectedActors.includes(actor.id);
              return (
                <button key={actor.id} onClick={() => toggleActor(actor.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? 'bg-accent-soft border border-accent/30' : 'hover:bg-surface2 border border-transparent'}`}>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${actor.imageColor} flex items-center justify-center ${isSelected ? 'ring-2 ring-accent scale-105' : 'opacity-70'}`}><span className="text-[10px] font-bold text-white/90">{actor.name.charAt(0)}</span></div>
                  <span className={`text-[8px] font-medium truncate w-full text-center ${isSelected ? 'text-accent' : 'text-txt-muted'}`}>{lang === 'ar' ? actor.nameAr : actor.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isGenerating && (
          <div className="mb-3 shrink-0">
            <div className="flex items-center justify-between text-[10px] text-txt-muted mb-1"><span>{lang === 'ar' ? 'جاري...' : 'Generating...'}</span><span>{progress}%</span></div>
            <div className="h-1.5 rounded-full bg-surface2 overflow-hidden"><div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
          </div>
        )}

        <button onClick={handleGenerate} disabled={selectedActors.length === 0 || isGenerating} className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all btn-soft flex items-center justify-center gap-1.5 shrink-0 ${selectedActors.length === 0 || isGenerating ? 'bg-surface2 text-txt-muted cursor-not-allowed border border-border' : 'bg-accent text-white'}`}>
          {isGenerating ? <><i className="fas fa-spinner fa-spin"></i>{lang === 'ar' ? 'جاري...' : 'Generating...'}</> : <><i className="fas fa-layer-group"></i>{lang === 'ar' ? `توليد (${selectedActors.length})` : `Generate (${selectedActors.length})`}</>}
        </button>
      </div>
    </div>
  );
};
