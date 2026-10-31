
import React, { useState, useEffect, useRef } from 'react';
import { VoicePreset, VOICE_PRESETS, VOICE_ACTORS, VoiceActor, Gender, GeneratedSpeech } from '../types';
import { generateTextScript, enhanceScriptWithActor, generateSpeech } from '../services/geminiService';
import { VoiceProcessor } from '../services/audioMixer';
import { TemplatesModal } from './TemplatesModal';
import { BatchGenerate } from './BatchGenerate';
import { GenerationTimer } from './GenerationTimer';
import { TextTemplate } from '../services/templates';

interface VoiceFormProps {
  onSubmit: (text: string, actor: VoiceActor, preset: VoicePreset | null, customTone: string) => void;
  isLoading: boolean;
  lang: 'en' | 'ar';
  onBatchGenerated?: (speeches: GeneratedSpeech[]) => void;
}

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  GENERAL: { en: 'General', ar: 'عام' },
  STARS: { en: 'Stars', ar: 'نجوم' },
  ADS: { en: 'Ads', ar: 'إعلانات' },
  CHARACTER: { en: 'Characters', ar: 'شخصيات' },
  PROFESSION: { en: 'Jobs', ar: 'مهن' },
  EMOTION: { en: 'Emotions', ar: 'مشاعر' },
  FAMILY: { en: 'Family', ar: 'عائلة' },
  COMEDY: { en: 'Comedy', ar: 'كوميديا' },
};

const QUICK_PHRASES = [
  "عرض خاص جداً لفترة محدودة! الحق الفرصة دي ماتتعوضش",
  "أقوى الخصومات في مصر، أسعارنا مش هتتكرر تاني",
  "بتدور على الأناقة والشياكة؟ يبقى طلبك عندنا وبس",
  "اطلب دلوقتي ويوصلك لحد باب البيت، والشحن مجاناً!",
  "ماتفوتش عروض الموسم، خصومات تصل لـ ٥٠٪ على كل المنتجات",
  "طعم يجنن وريحة تاخود العقل، جرب مرة ومش هتندم أبداً"
];

const EMOTION_TAGS = [
  { label: '😄 ضحكة', value: ' (ضحكة) ' },
  { label: '😔 تنهيدة', value: ' (تنهيدة) ' },
  { label: '🤫 همس', value: ' (همس) ' },
  { label: '⏳ صمت', value: ' ... ' },
  { label: '🔥 حماس', value: ' (بمنتهى الحماس والطاقة) ' },
  { label: '✨ تشويق', value: ' (نبرة تشويق وإثارة) ' },
  { label: '💪 ثقة', value: ' (نبرة واثقة وقوية) ' },
  { label: '⚡ سرعة', value: ' (تكلم بسرعة) ' },
  { label: '🐢 بطء', value: ' (تكلم ببطء وتأكيد) ' },
  { label: '😲 مفاجأة', value: ' (نبرة تعجب ومفاجأة) ' },
  { label: '❓ تساؤل', value: ' (نبرة استفهام) ' },
  { label: '📢 نداء', value: ' (بصوت عالي ومنادي) ' },
  { label: '💰 إغراء', value: ' (نبرة إغراء وعرض لا يقاوم) ' },
  { label: '🎙️ رسمي', value: ' (نبرة رسمية إخبارية) ' },
  { label: '😨 خوف', value: ' (بخوف وتوتر) ' },
  { label: '😠 غضب', value: ' (بغضب وصوت عالي) ' },
  { label: '🤧 كحة', value: ' (كحة) ' },
  { label: '😲 شهقة', value: ' (شهقة) ' },
  { label: '😘 بوسة', value: ' (بوسة) ' },
  { label: '🥱 تثاؤب', value: ' (تثاؤب) ' },
];

const PREVIEW_TEXT = "أهلاً بكم في ستوديو مصر. برعاية الجَمَّال للإعلان";

export const VoiceForm: React.FC<VoiceFormProps> = ({ onSubmit, isLoading, lang, onBatchGenerated }) => {
  const [text, setText] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>('MALE');
  const [selectedActorId, setSelectedActorId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('GENERAL');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('p_natural');
  const [customTone, setCustomTone] = useState('');

  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptLength, setScriptLength] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // New modals
  const [showTemplates, setShowTemplates] = useState(false);
  
  const previewCache = useRef<Record<string, string>>({});
  const processorRef = useRef<VoiceProcessor | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredActors = VOICE_ACTORS.filter(a => a.gender === selectedGender);

  useEffect(() => {
    if (filteredActors.length > 0) {
      const current = VOICE_ACTORS.find(a => a.id === selectedActorId);
      if (!current || current.gender !== selectedGender) {
        setSelectedActorId(filteredActors[0].id);
      }
    }
  }, [selectedGender, filteredActors, selectedActorId]);

  useEffect(() => {
    processorRef.current = new VoiceProcessor();
    return () => {
      processorRef.current?.stop();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && selectedActorId) {
      const actor = VOICE_ACTORS.find(a => a.id === selectedActorId)!;
      const preset = selectedPresetId ? VOICE_PRESETS.find(p => p.id === selectedPresetId) || null : null;
      onSubmit(text, actor, preset, customTone);
    }
  };

  const handleMagicWrite = async () => {
    if (!scriptTopic.trim()) return;
    setIsScriptLoading(true);
    try {
      const generatedScript = await generateTextScript(scriptTopic, scriptLength, lang);
      setText(generatedScript);
      setScriptTopic('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsScriptLoading(false);
    }
  };
  
  const handleEnhanceText = async () => {
    if (!text.trim() || !selectedActorId) return;
    setIsEnhancing(true);
    try {
      const actor = VOICE_ACTORS.find(a => a.id === selectedActorId)!;
      const enhanced = await enhanceScriptWithActor(text, actor, lang);
      setText(enhanced);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const insertAtCursor = (tagValue: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
        setText(prev => prev + tagValue);
        return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const newText = currentText.substring(0, start) + tagValue + currentText.substring(end);
    setText(newText);
    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + tagValue.length;
    }, 0);
  };

  const handlePreview = async (e: React.MouseEvent, actor: VoiceActor) => {
    e.stopPropagation();
    setPreviewError(null);

    if (previewPlayingId === actor.id) {
       processorRef.current?.stop();
       setPreviewPlayingId(null);
       return;
    }

    if (previewLoadingId) return;
    processorRef.current?.stop();
    setPreviewPlayingId(null);

    setPreviewLoadingId(actor.id);
    try {
        let audioUrl = previewCache.current[actor.id];
        if (!audioUrl) {
           audioUrl = await generateSpeech(PREVIEW_TEXT, actor, null, "");
           previewCache.current[actor.id] = audioUrl;
        }
        
        setPreviewLoadingId(null);
        setPreviewPlayingId(actor.id);
        
        await processorRef.current?.processAndPlay(audioUrl, 1.0, 1.0, () => {
            setPreviewPlayingId(null);
        });
    } catch (error: any) {
        console.error("Preview failed:", error);
        setPreviewLoadingId(null);
        setPreviewPlayingId(null);
        
        const msg = (error.message && error.message.includes('Limit')) 
           ? (lang === 'ar' ? '⚠️ عفشاً، تجاوزت الحد' : '⚠️ Limit Exceeded') 
           : (lang === 'ar' ? '⚠️ خطأ في المعاينة' : '⚠️ Preview Failed');
        
        setPreviewError(msg);
        setTimeout(() => setPreviewError(null), 3000);
    }
  };

  const handleRandomize = () => {
    const randomActor = filteredActors[Math.floor(Math.random() * filteredActors.length)];
    setSelectedActorId(randomActor.id);
    const randomPreset = VOICE_PRESETS[Math.floor(Math.random() * VOICE_PRESETS.length)];
    setSelectedCategory(randomPreset.category);
    setSelectedPresetId(randomPreset.id);
    setCustomTone('');
  };

  const handleTemplateSelect = (template: TextTemplate) => {
    setText(template.text);
    if (template.suggestedTone) {
      setCustomTone(template.suggestedTone);
    }
  };

  const currentTabPresets = VOICE_PRESETS.filter(p => p.category === selectedCategory);
  const categoryOrder = ['GENERAL', 'STARS', 'ADS', 'EMOTION', 'CHARACTER', 'PROFESSION', 'FAMILY', 'COMEDY'];

  return (
    <div className="w-full glass-card overflow-hidden relative shadow-2xl transition-all duration-300">
      
      {/* LUXURY HEADER */}
      <div className="bg-gradient-to-r from-violet-900/80 via-purple-900/60 to-indigo-900/80 p-8 flex flex-col items-center justify-center border-b border-border relative overflow-hidden transition-colors duration-300">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50"></div>
         
         {/* Floating elements */}
         <div className="absolute top-4 left-8 text-violet-400/20 text-xl animate-float"><i className="fas fa-music"></i></div>
         <div className="absolute bottom-4 right-12 text-purple-400/20 text-lg animate-float" style={{ animationDelay: '1s' }}><i className="fas fa-headphones"></i></div>
         
         <div className="flex items-center gap-4 z-10 relative">
            <div className="w-14 h-14 rounded-2xl border border-accent/50 flex items-center justify-center bg-accent/10 shadow-[0_0_30px_rgba(139,92,246,0.3)] icon-3d">
              <i className="fas fa-microphone-lines text-accent text-2xl"></i>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold tracking-tight text-white">MASRI <span className="text-gradient">STUDIO</span></h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="h-[1px] w-4 bg-accent/50"></span>
                <p className="text-[10px] text-violet-300/80 uppercase tracking-[0.2em]">Premium AI Voice Generator</p>
                <span className="h-[1px] w-4 bg-accent/50"></span>
              </div>
            </div>
         </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. GENDER TOGGLE */}
          <div className="flex justify-center">
            <div className="glass p-1.5 rounded-2xl border border-border inline-flex shadow-lg">
              {(['MALE', 'FEMALE'] as Gender[]).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGender(g)}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 ${
                    selectedGender === g 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' 
                    : 'text-txt-muted hover:text-txt-primary hover:bg-highlight'
                  }`}
                >
                  <i className={`fas ${g === 'MALE' ? 'fa-mars text-lg' : 'fa-venus text-lg'}`}></i>
                  <span>{lang === 'ar' ? (g === 'MALE' ? 'رجال' : 'سيدات') : g}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. ACTOR SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-5 px-2 relative">
               <label className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-users text-sm"></i>
                  {lang === 'ar' ? 'اختر المؤدي' : 'Voice Actor'}
               </label>
               
               {previewError && (
                 <div className="absolute left-1/2 -translate-x-1/2 -top-8 glass border-red-500/50 text-red-400 text-[10px] px-3 py-1 rounded-full shadow-lg whitespace-nowrap animate-pulse z-30">
                   {previewError}
                 </div>
               )}

               <button 
                 type="button" 
                 onClick={handleRandomize}
                 className="text-[10px] text-txt-muted hover:text-accent transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:border-accent/30"
               >
                 <i className="fas fa-dice"></i> {lang === 'ar' ? 'اختيار عشوائي' : 'Randomize'}
               </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-x-4 gap-y-6">
              {filteredActors.map(actor => {
                const isSelected = selectedActorId === actor.id;
                const isPreviewPlaying = previewPlayingId === actor.id;
                const isPreviewLoading = previewLoadingId === actor.id;

                return (
                  <button
                    key={actor.id}
                    type="button"
                    onClick={() => setSelectedActorId(actor.id)}
                    className="group relative flex flex-col items-center gap-2 transition-all outline-none"
                  >
                    {/* Avatar Circle */}
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${actor.imageColor} shadow-lg flex items-center justify-center transition-all duration-300
                      ${isSelected 
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface scale-110 grayscale-0 shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                        : 'grayscale-[0.5] opacity-70 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105'
                      }`}
                    >
                      <span className="text-lg font-bold text-white/90 drop-shadow-md font-display">{actor.name.charAt(0)}</span>
                      
                      {/* Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-surface flex items-center justify-center shadow-sm z-10 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                           <i className="fas fa-check text-[10px] text-black font-bold"></i>
                        </div>
                      )}

                      {/* PREVIEW BUTTON */}
                      <div 
                         onClick={(e) => handlePreview(e, actor)}
                         className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center z-20 shadow-md border-2 border-surface transition-all
                            ${isPreviewPlaying 
                                ? 'bg-accent text-white scale-110' 
                                : 'bg-slate-700 text-white hover:bg-accent hover:text-white'
                            }
                         `}
                         title={lang === 'ar' ? "استمع لصوت المؤدي" : "Preview Voice"}
                      >
                         {isPreviewLoading ? (
                             <i className="fas fa-circle-notch fa-spin text-[10px]"></i>
                         ) : (
                             <i className={`fas ${isPreviewPlaying ? 'fa-stop' : 'fa-play'} text-[8px] pl-[1px]`}></i>
                         )}
                      </div>
                    </div>
                    
                    {/* Name Label */}
                    <div className="text-center w-full">
                      <div className={`text-[10px] font-bold uppercase tracking-wider transition-colors truncate
                        ${isSelected ? 'text-accent' : 'text-txt-muted group-hover:text-txt-secondary'}`}>
                        {lang === 'ar' ? actor.nameAr : actor.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent"></div>

          {/* 3. TONE SELECTION */}
          <div>
             <label className={`text-xs font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse justify-start' : ''}`}>
                <i className="fas fa-sliders text-sm"></i>
                {lang === 'ar' ? 'النبرة والأداء' : 'Tone & Performance'}
             </label>

             {/* TABS */}
             <div className="flex flex-wrap gap-2 mb-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {categoryOrder.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setSelectedCategory(cat); setCustomTone(''); }}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border
                      ${selectedCategory === cat 
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-accent text-white shadow-lg shadow-purple-500/20' 
                        : 'glass border-border text-txt-muted hover:text-txt-primary hover:border-accent/30'
                      }`}
                  >
                    {lang === 'ar' ? CATEGORY_LABELS[cat].ar : CATEGORY_LABELS[cat].en}
                  </button>
                ))}
             </div>

             {/* CUSTOM INPUT */}
             <div className="relative mb-6">
                <input 
                   type="text"
                   value={customTone}
                   onChange={(e) => {
                      setCustomTone(e.target.value);
                      if (e.target.value) setSelectedPresetId(null);
                   }}
                   placeholder={lang === 'ar' ? '✨ اكتب وصفاً خاصاً (مثال: يهمس بخوف شديد)...' : '✨ Describe a custom tone...'}
                   className={`w-full py-4 px-5 rounded-xl glass border text-sm transition-all
                      ${customTone 
                        ? 'border-accent text-txt-primary shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                        : 'border-border text-txt-muted focus:border-accent/50 focus:text-txt-primary'
                      } ${lang === 'ar' ? 'text-right' : ''}`}
                />
             </div>

             {/* PRESETS GRID */}
             <div className={`transition-opacity duration-300 ${customTone ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {currentTabPresets.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => { setSelectedPresetId(preset.id); setCustomTone(''); }}
                      className={`group p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-3 relative overflow-hidden
                        ${selectedPresetId === preset.id
                          ? 'bg-gradient-to-br from-violet-600 to-purple-600 border-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                          : 'glass border-border text-txt-muted hover:text-txt-primary hover:border-accent/30'
                        }`}
                    >
                      <div className={`text-xl ${selectedPresetId === preset.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform icon-3d`}>
                        <i className={`fas ${preset.icon}`}></i>
                      </div>
                      <span className="text-[11px] font-bold leading-tight">
                        {lang === 'ar' ? preset.labelAr : preset.label}
                      </span>
                      
                      {selectedPresetId === preset.id && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                      )}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent"></div>

          {/* 4. TEXT INPUT AREA & MAGIC WRITER */}
          <div>
             
             {/* MAGIC WRITER SECTION */}
             <div className="mb-8 relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-accent/50 via-transparent to-accent/50 rounded-2xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                <div className="relative glass-card overflow-hidden shadow-2xl">
                    <div className="h-1 w-full bg-gradient-to-r from-accent via-accent/50 to-accent"></div>

                    <div className="p-5 md:p-6 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-[0_0_15px_rgba(139,92,246,0.1)] icon-3d">
                                     <i className="fas fa-wand-magic-sparkles text-accent text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-txt-primary uppercase tracking-widest font-display">{lang === 'ar' ? 'المؤلف السحري' : 'Magic Script Writer'}</h3>
                                    <p className="text-[10px] text-txt-muted uppercase tracking-wider">{lang === 'ar' ? 'اكتب فكرة وسيب الباقي علينا' : 'AI-Powered Creative Assistant'}</p>
                                </div>
                            </div>
                            <div className="px-2 py-1 rounded-md bg-black/20 border border-white/5 text-[9px] text-txt-muted font-mono hidden sm:block">
                                AI V2.5
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                             <div className="relative">
                                <input 
                                   type="text" 
                                   value={scriptTopic}
                                   onChange={(e) => setScriptTopic(e.target.value)}
                                   placeholder={lang === 'ar' ? 'اكتب فكرة: اعلان كشري، قصة رعب، رسالة حب...' : 'Topic: Coffee ad, Horror story, Love letter...'}
                                   className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-sm text-txt-primary focus:border-accent/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.05)] outline-none transition-all placeholder:text-txt-muted/50 ${lang === 'ar' ? 'text-right' : ''}`}
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 text-txt-muted/30 pointer-events-none ${lang === 'ar' ? 'left-3' : 'right-3'}`}>
                                    <i className="fas fa-keyboard"></i>
                                </div>
                             </div>
                             
                             <div className="flex flex-wrap items-center justify-between gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                 <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                                    {(['SHORT', 'MEDIUM', 'LONG'] as const).map(len => (
                                       <button
                                         key={len}
                                         type="button"
                                         onClick={() => setScriptLength(len)}
                                         className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                                             scriptLength === len 
                                             ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md' 
                                             : 'text-txt-muted hover:text-white hover:bg-white/5'
                                         }`}
                                       >
                                          {len === 'SHORT' ? (lang === 'ar' ? 'قصير' : 'Short') : 
                                           len === 'MEDIUM' ? (lang === 'ar' ? 'متوسط' : 'Medium') : 
                                           (lang === 'ar' ? 'طويل' : 'Long')}
                                       </button>
                                    ))}
                                 </div>

                                 <button
                                    type="button"
                                    onClick={handleMagicWrite}
                                    disabled={isScriptLoading || !scriptTopic.trim()}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg btn-3d ${
                                       !scriptTopic.trim() 
                                       ? 'bg-white/5 text-txt-muted cursor-not-allowed border border-white/5' 
                                       : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/10'
                                    }`}
                                 >
                                    {isScriptLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-pen-nib"></i>}
                                    {lang === 'ar' ? 'تأليف النص' : 'Compose'}
                                 </button>
                             </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Quick Phrases */}
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {QUICK_PHRASES.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setText(phrase)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full glass border border-border text-[10px] text-txt-muted hover:text-accent hover:border-accent/30 transition-colors flex-shrink-0"
                  >
                    {phrase}
                  </button>
                ))}
             </div>

             <div className="relative group">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب النص هنا...' : 'Type script here...'}
                  rows={4}
                  className={`w-full p-5 pb-12 rounded-2xl glass border border-border text-txt-primary placeholder-txt-muted focus:border-accent outline-none transition-all resize-none ${lang === 'ar' ? 'text-right' : ''}`}
                  dir="rtl"
                />
                <div className="absolute bottom-4 left-4 text-[10px] text-txt-muted font-mono">
                   {text.length} chars
                </div>

                <button
                  type="button"
                  onClick={handleEnhanceText}
                  disabled={!text.trim() || isEnhancing || !selectedActorId}
                  title={lang === 'ar' ? 'تحسين النص باستخدام الذكاء الاصطناعي' : 'Enhance text with AI'}
                  className={`absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-all shadow-lg hover:scale-110 btn-3d
                     ${!text.trim() || isEnhancing
                       ? 'bg-highlight text-txt-muted cursor-not-allowed border border-border'
                       : isEnhancing 
                         ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white animate-pulse' 
                         : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                     }`}
                >
                  {isEnhancing ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-wand-magic-sparkles"></i>
                  )}
                </button>
             </div>
             
             {/* EMOTION TAGS */}
             <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                 <span className="text-[10px] font-bold text-accent shrink-0 uppercase tracking-widest px-1 flex items-center gap-1">
                     <i className="fas fa-face-grin-stars"></i>
                     {lang === 'ar' ? 'انفعالات:' : 'Emotions:'}
                 </span>
                 {EMOTION_TAGS.map((tag, idx) => (
                     <button
                        key={idx}
                        type="button"
                        onClick={() => insertAtCursor(tag.value)}
                        className="whitespace-nowrap px-3 py-1 rounded-full glass border border-border text-[10px] font-bold text-txt-secondary hover:bg-accent hover:text-white hover:border-accent transition-all shrink-0"
                     >
                        {tag.label}
                     </button>
                 ))}
             </div>

             {/* Action Bar: Templates + Batch + Timer */}
             <div className="mt-4 flex flex-wrap items-center gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <button
                  type="button"
                  onClick={() => setShowTemplates(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold glass border border-border text-txt-secondary hover:text-accent hover:border-accent/30 transition-all flex items-center gap-2 btn-3d"
                >
                  <i className="fas fa-file-lines"></i>
                  {lang === 'ar' ? 'قوالب جاهزة' : 'Templates'}
                </button>

                <BatchGenerate 
                  text={text} 
                  lang={lang} 
                  onGenerated={onBatchGenerated || (() => {})} 
                />

                <GenerationTimer isActive={isLoading} />
             </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className={`w-full py-5 rounded-2xl font-bold text-sm tracking-[3px] uppercase transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group btn-3d
               ${isLoading || !text.trim()
               ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
               : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]'
            }`}
          >
            {isLoading ? (
               <i className="fas fa-circle-notch fa-spin text-lg"></i>
            ) : (
               <>
                 <span className="relative z-10">{lang === 'ar' ? 'توليد الصوت الآن' : 'GENERATE AUDIO'}</span>
                 <i className="fas fa-play relative z-10"></i>
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               </>
            )}
          </button>

        </form>
      </div>

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
        lang={lang}
      />
    </div>
  );
};
