import React, { useState, useEffect, useRef } from 'react';
import { VoiceActor, VOICE_ACTORS, Gender, GenerationState } from '../types';
import { generateSpeech } from '../services/geminiService';
import { GeneratedSpeech } from '../types';
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
  const [results, setResults] = useState<GeneratedSpeech[]>([]);

  const filteredActors = VOICE_ACTORS.filter(a => a.gender === gender);

  const toggleActor = (id: string) => {
    setSelectedActors(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedActors.length === filteredActors.length) {
      setSelectedActors([]);
    } else {
      setSelectedActors(filteredActors.map(a => a.id));
    }
  };

  const handleGenerate = async () => {
    if (selectedActors.length === 0 || !text.trim()) return;
    
    setIsGenerating(true);
    setProgress(0);
    setResults([]);
    
    const speeches: GeneratedSpeech[] = [];
    
    for (let i = 0; i < selectedActors.length; i++) {
      const actor = VOICE_ACTORS.find(a => a.id === selectedActors[i])!;
      try {
        const audioUrl = await generateSpeech(text, actor, null, '');
        speeches.push({
          id: Date.now().toString() + i,
          text,
          actor,
          preset: null,
          audioUrl,
          timestamp: Date.now()
        });
        setProgress(Math.round(((i + 1) / selectedActors.length) * 100));
        setResults([...speeches]);
      } catch (err) {
        console.error(`Failed for ${actor.name}:`, err);
      }
    }
    
    setIsGenerating(false);
    onGenerated(speeches);
    
    // Show notification
    const msg = lang === 'ar' 
      ? `تم توليد ${speeches.length} صوت بنجاح!` 
      : `Generated ${speeches.length} voices successfully!`;
    
    addToast('success', lang === 'ar' ? 'اكتمل التوليد' : 'Generation Complete', msg);
    showBrowserNotification('MASRI Studio', msg);
    playNotificationSound('success');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={!text.trim()}
        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          text.trim() 
            ? 'glass border border-border text-txt-secondary hover:text-accent hover:border-accent/30 btn-3d' 
            : 'bg-highlight text-txt-muted cursor-not-allowed border border-border'
        }`}
      >
        <i className="fas fa-layer-group"></i>
        {lang === 'ar' ? 'توليد متعدد' : 'Batch Generate'}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={() => !isGenerating && setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center icon-3d">
              <i className="fas fa-layer-group text-accent text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-txt-primary">
                {lang === 'ar' ? 'توليد متعدد الأصوات' : 'Multi-Voice Generation'}
              </h3>
              <p className="text-[10px] text-txt-muted">
                {lang === 'ar' ? 'ولّد نفس النص بأصوات مختلفة' : 'Generate the same text with different voices'}
              </p>
            </div>
          </div>
          <button onClick={() => !isGenerating && setIsOpen(false)} className="w-8 h-8 rounded-lg bg-highlight flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Gender Toggle */}
        <div className="flex gap-2 mb-4 shrink-0">
          {(['MALE', 'FEMALE'] as Gender[]).map(g => (
            <button
              key={g}
              onClick={() => { setGender(g); setSelectedActors([]); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                gender === g 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' 
                  : 'glass border border-border text-txt-muted'
              }`}
            >
              <i className={`fas ${g === 'MALE' ? 'fa-mars' : 'fa-venus'}`}></i>
              {lang === 'ar' ? (g === 'MALE' ? 'رجال' : 'سيدات') : g}
            </button>
          ))}
        </div>

        {/* Select All */}
        <button
          onClick={selectAll}
          className="w-full py-2 mb-3 rounded-lg border border-border text-[11px] font-bold text-txt-muted hover:text-accent hover:border-accent/30 transition-all shrink-0"
        >
          {selectedActors.length === filteredActors.length
            ? (lang === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All')
            : (lang === 'ar' ? `تحديد الكل (${filteredActors.length})` : `Select All (${filteredActors.length})`)
          }
        </button>

        {/* Actors Grid */}
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {filteredActors.map(actor => {
              const isSelected = selectedActors.includes(actor.id);
              return (
                <button
                  key={actor.id}
                  onClick={() => toggleActor(actor.id)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                    isSelected ? 'bg-accent/10 border border-accent/30' : 'hover:bg-highlight border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${actor.imageColor} flex items-center justify-center icon-3d ${
                    isSelected ? 'ring-2 ring-accent scale-110' : 'opacity-70'
                  }`}>
                    <span className="text-xs font-bold text-white/90">{actor.name.charAt(0)}</span>
                  </div>
                  <span className={`text-[9px] font-bold truncate w-full text-center ${isSelected ? 'text-accent' : 'text-txt-muted'}`}>
                    {lang === 'ar' ? actor.nameAr : actor.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="mb-4 shrink-0">
            <div className="flex items-center justify-between text-[10px] text-txt-muted mb-1">
              <span>{lang === 'ar' ? 'جاري التوليد...' : 'Generating...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-highlight overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={selectedActors.length === 0 || isGenerating}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all btn-3d flex items-center justify-center gap-2 shrink-0 ${
            selectedActors.length === 0 || isGenerating
              ? 'bg-highlight text-txt-muted cursor-not-allowed border border-border'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
          }`}
        >
          {isGenerating ? (
            <><i className="fas fa-spinner fa-spin"></i> {lang === 'ar' ? 'جاري التوليد...' : 'Generating...'}</>
          ) : (
            <><i className="fas fa-layer-group"></i> {lang === 'ar' ? `توليد (${selectedActors.length})` : `Generate (${selectedActors.length})`}</>
          )}
        </button>
      </div>
    </div>
  );
};
