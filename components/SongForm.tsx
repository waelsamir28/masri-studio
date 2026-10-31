

import React, { useState, useEffect, useRef } from 'react';
import { VoicePreset, VOICE_PRESETS, VOICE_ACTORS, VoiceActor, Gender } from '../types';
import { generateTextScript, enhanceScriptWithActor, generateSpeech } from '../services/geminiService';
import { VoiceProcessor } from '../services/audioMixer';

interface VoiceFormProps {
  onSubmit: (text: string, actor: VoiceActor, preset: VoicePreset | null, customTone: string) => void;
  isLoading: boolean;
  lang: 'en' | 'ar';
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

// Expanded Emotion Tags for insertion (including Ad specific)
const EMOTION_TAGS = [
  // Basic
  { label: '😄 ضحكة', value: ' (ضحكة) ' },
  { label: '😔 تنهيدة', value: ' (تنهيدة) ' },
  { label: '🤫 همس', value: ' (همس) ' },
  { label: '⏳ صمت', value: ' ... ' },
  
  // Ad / Performance
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

  // Physical
  { label: '🤧 كحة', value: ' (كحة) ' },
  { label: '😲 شهقة', value: ' (شهقة) ' },
  { label: '😘 بوسة', value: ' (بوسة) ' },
  { label: '🥱 تثاؤب', value: ' (تثاؤب) ' },
];

const PREVIEW_TEXT = "أهلاً بكم في ستوديو مصر. برعاية الجَمَّال للإعلان";

export const VoiceForm: React.FC<VoiceFormProps> = ({ onSubmit, isLoading, lang }) => {
  const [text, setText] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender>('MALE');
  const [selectedActorId, setSelectedActorId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('GENERAL');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('p_natural');
  const [customTone, setCustomTone] = useState('');

  // Magic Writer States
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptLength, setScriptLength] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Preview States
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // Cache for voice previews to avoid API spam/quota limits
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
    // Initialize audio processor for previews
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
      setScriptTopic(''); // Clear topic after success
    } catch (e) {
      console.error(e);
      // Optional: Show error toast
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

    // Restore focus and move cursor after the inserted tag
    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + tagValue.length;
    }, 0);
  };

  const handlePreview = async (e: React.MouseEvent, actor: VoiceActor) => {
    e.stopPropagation();
    setPreviewError(null);

    // If currently playing this actor, stop it
    if (previewPlayingId === actor.id) {
       processorRef.current?.stop();
       setPreviewPlayingId(null);
       return;
    }

    if (previewLoadingId) return; // Prevent multiple clicks while loading

    // Stop any other preview
    processorRef.current?.stop();
    setPreviewPlayingId(null);

    setPreviewLoadingId(actor.id);
    try {
        let audioUrl = previewCache.current[actor.id];

        if (!audioUrl) {
           // Generate audio on the fly if not cached
           audioUrl = await generateSpeech(PREVIEW_TEXT, actor, null, ""); // Natural tone
           previewCache.current[actor.id] = audioUrl; // Cache result
        }
        
        setPreviewLoadingId(null);
        setPreviewPlayingId(actor.id);
        
        await processorRef.current?.processAndPlay(audioUrl, 1.0, 1.0, () => {
            setPreviewPlayingId(null); // Reset icon when audio ends
        });

    } catch (error: any) {
        console.error("Preview failed:", error);
        setPreviewLoadingId(null);
        setPreviewPlayingId(null);
        
        // Show visual error
        const msg = (error.message && error.message.includes('Limit')) 
           ? (lang === 'ar' ? '⚠️ عفشاً، تجاوزت الحد' : '⚠️ Limit Exceeded') 
           : (lang === 'ar' ? '⚠️ خطأ في المعاينة' : '⚠️ Preview Failed');
        
        setPreviewError(msg);
        setTimeout(() => setPreviewError(null), 3000);
    }
  };

  const handleRandomize = () => {
    // Random Actor matching gender
    const randomActor = filteredActors[Math.floor(Math.random() * filteredActors.length)];
    setSelectedActorId(randomActor.id);
    
    // Random Preset
    const randomPreset = VOICE_PRESETS[Math.floor(Math.random() * VOICE_PRESETS.length)];
    setSelectedCategory(randomPreset.category);
    setSelectedPresetId(randomPreset.id);
    setCustomTone('');
  };

  const currentTabPresets = VOICE_PRESETS.filter(p => p.category === selectedCategory);
  // Added STARS between GENERAL and ADS
  const categoryOrder = ['GENERAL', 'STARS', 'ADS', 'EMOTION', 'CHARACTER', 'PROFESSION', 'FAMILY', 'COMEDY'];

  return (
    <div className="w-full pro-panel rounded-3xl overflow-hidden relative border border-border font-sans shadow-2xl transition-colors duration-300">
      
      {/* LUXURY HEADER */}
      <div className="bg-primary p-8 flex flex-col items-center justify-center border-b border-border relative overflow-hidden transition-colors duration-300">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50"></div>
         <div className="flex items-center gap-4 z-10 relative">
            <div className="w-12 h-12 rounded-2xl border border-accent flex items-center justify-center bg-accent/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <i className="fas fa-microphone-lines text-accent text-xl"></i>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-txt-primary">MASRI <span className="text-accent">STUDIO</span></h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="h-[1px] w-4 bg-accent/50"></span>
                <p className="text-[10px] text-txt-muted uppercase tracking-[0.2em]">Premium AI Voice Generator</p>
                <span className="h-[1px] w-4 bg-accent/50"></span>
              </div>
            </div>
         </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-surface transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. GENDER TOGGLE */}
          <div className="flex justify-center">
            <div className="bg-primary p-1.5 rounded-full border border-border inline-flex shadow-inner">
              {(['MALE', 'FEMALE'] as Gender[]).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGender(g)}
                  className={`px-10 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    selectedGender === g 
                    ? 'bg-accent text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-100' 
                    : 'text-txt-muted hover:text-txt-primary hover:bg-highlight'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className={`fas ${g === 'MALE' ? 'fa-mars' : 'fa-venus'}`}></i>
                    <span>{lang === 'ar' ? (g === 'MALE' ? 'رجال' : 'سيدات') : g}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. ACTOR SELECTION - REDESIGNED COMPACT */}
          <div>
            <div className="flex items-center justify-between mb-5 px-2 relative">
               <label className="text-xs font-bold text-accent uppercase tracking-widest">
                  {lang === 'ar' ? 'اختر المؤدي' : 'Voice Actor'}
               </label>
               
               {/* PREVIEW ERROR TOAST */}
               {previewError && (
                 <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-red-900/90 text-white text-[10px] px-3 py-1 rounded-full border border-red-500/50 shadow-lg whitespace-nowrap animate-pulse z-30">
                   {previewError}
                 </div>
               )}

               <button 
                 type="button" 
                 onClick={handleRandomize}
                 className="text-[10px] text-txt-muted hover:text-accent transition-colors flex items-center gap-1"
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
                    <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${actor.imageColor} shadow-lg flex items-center justify-center transition-all duration-300
                      ${isSelected 
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface scale-110 grayscale-0' 
                        : 'grayscale-[0.5] opacity-70 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105'
                      }`}
                    >
                      <span className="text-lg font-bold text-white/90 drop-shadow-md">{actor.name.charAt(0)}</span>
                      
                      {/* Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#39ff14] rounded-full border-2 border-surface flex items-center justify-center shadow-sm z-10 shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                           <i className="fas fa-check text-[10px] text-black font-bold"></i>
                        </div>
                      )}

                      {/* PREVIEW BUTTON OVERLAY (Top Left or Right) */}
                      <div 
                         onClick={(e) => handlePreview(e, actor)}
                         className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center z-20 shadow-md border border-surface transition-all
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
                    
                    {/* Minimal Name Label */}
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
             <label className={`text-xs font-bold text-accent uppercase tracking-widest mb-4 block ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'النبرة والأداء' : 'Tone & Performance'}
             </label>

             {/* TABS */}
             <div className="flex flex-wrap gap-2 mb-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {categoryOrder.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setSelectedCategory(cat); setCustomTone(''); }}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border backdrop-blur-sm
                      ${selectedCategory === cat 
                        ? 'bg-accent border-accent text-white shadow-lg' 
                        : 'bg-highlight border-border text-txt-muted hover:bg-highlight/50 hover:text-txt-primary'
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
                   className={`w-full py-4 px-5 rounded-xl bg-primary border text-sm transition-all shadow-inner
                      ${customTone 
                        ? 'border-accent text-txt-primary shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
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
                          ? 'bg-accent border-accent text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                          : 'bg-highlight border-border text-txt-muted hover:bg-highlight/80 hover:text-txt-primary'
                        }`}
                    >
                      <div className={`text-xl ${selectedPresetId === preset.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                        <i className={`fas ${preset.icon}`}></i>
                      </div>
                      <span className="text-[11px] font-bold leading-tight">
                        {lang === 'ar' ? preset.labelAr : preset.label}
                      </span>
                      
                      {/* Shine effect */}
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
             
             {/* MAGIC WRITER SECTION WITH NEW PROFESSIONAL FRAME */}
             <div className="mb-8 relative group">
                {/* Gradient Border/Glow Effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-accent/50 via-transparent to-accent/50 rounded-2xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                <div className="relative rounded-2xl bg-surface border border-white/10 overflow-hidden shadow-2xl">
                    {/* Decorative Top Bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-accent via-accent/50 to-accent"></div>

                    <div className="p-5 md:p-6 bg-gradient-to-b from-white/5 to-transparent">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                     <i className="fas fa-wand-magic-sparkles text-accent text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-txt-primary uppercase tracking-widest">{lang === 'ar' ? 'المؤلف السحري' : 'Magic Script Writer'}</h3>
                                    <p className="text-[10px] text-txt-muted uppercase tracking-wider">{lang === 'ar' ? 'اكتب فكرة وسيب الباقي علينا' : 'AI-Powered Creative Assistant'}</p>
                                </div>
                            </div>
                            {/* Optional: Small badge or icon */}
                            <div className="px-2 py-1 rounded-md bg-black/20 border border-white/5 text-[9px] text-txt-muted font-mono hidden sm:block">
                                AI V2.5
                            </div>
                        </div>

                        {/* Inputs Container */}
                        <div className="flex flex-col gap-4">
                             {/* Input Field */}
                             <div className="relative">
                                <input 
                                   type="text" 
                                   value={scriptTopic}
                                   onChange={(e) => setScriptTopic(e.target.value)}
                                   placeholder={lang === 'ar' ? 'اكتب فكرة: اعلان كشري، قصة رعب، رسالة حب...' : 'Topic: Coffee ad, Horror story, Love letter...'}
                                   className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-sm text-txt-primary focus:border-accent/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(245,158,11,0.05)] outline-none transition-all placeholder:text-txt-muted/50 ${lang === 'ar' ? 'text-right' : ''}`}
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 text-txt-muted/30 pointer-events-none ${lang === 'ar' ? 'left-3' : 'right-3'}`}>
                                    <i className="fas fa-keyboard"></i>
                                </div>
                             </div>
                             
                             {/* Controls Row */}
                             <div className="flex flex-wrap items-center justify-between gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                 
                                 {/* Length Selector */}
                                 <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                                    {(['SHORT', 'MEDIUM', 'LONG'] as const).map(len => (
                                       <button
                                         key={len}
                                         type="button"
                                         onClick={() => setScriptLength(len)}
                                         className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                                             scriptLength === len 
                                             ? 'bg-accent text-white shadow-md' 
                                             : 'text-txt-muted hover:text-white hover:bg-white/5'
                                         }`}
                                       >
                                          {len === 'SHORT' ? (lang === 'ar' ? 'قصير' : 'Short') : 
                                           len === 'MEDIUM' ? (lang === 'ar' ? 'متوسط' : 'Medium') : 
                                           (lang === 'ar' ? 'طويل' : 'Long')}
                                       </button>
                                    ))}
                                 </div>

                                 {/* Action Button */}
                                 <button
                                    type="button"
                                    onClick={handleMagicWrite}
                                    disabled={isScriptLoading || !scriptTopic.trim()}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                                       !scriptTopic.trim() 
                                       ? 'bg-white/5 text-txt-muted cursor-not-allowed border border-white/5' 
                                       : 'bg-txt-primary text-primary hover:bg-accent hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-white/10'
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
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-highlight border border-border text-[10px] text-txt-muted hover:text-accent hover:border-accent/30 transition-colors flex-shrink-0"
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
                  className={`w-full p-5 pb-12 rounded-2xl bg-primary border border-border text-txt-primary placeholder-txt-muted focus:border-accent outline-none transition-all resize-none shadow-inner ${lang === 'ar' ? 'text-right' : ''}`}
                  dir="rtl"
                />
                <div className="absolute bottom-4 left-4 text-[10px] text-txt-muted font-mono">
                   {text.length} chars
                </div>

                {/* UPDATED ENHANCE BUTTON - ICON ONLY */}
                <button
                  type="button"
                  onClick={handleEnhanceText}
                  disabled={!text.trim() || isEnhancing || !selectedActorId}
                  title={lang === 'ar' ? 'تحسين النص باستخدام الذكاء الاصطناعي' : 'Enhance text with AI'}
                  className={`absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all shadow-lg hover:scale-110
                     ${!text.trim() || isEnhancing
                       ? 'bg-surface text-txt-muted cursor-not-allowed border border-border'
                       : isEnhancing 
                         ? 'bg-accent text-white animate-pulse' 
                         : 'bg-accent text-white hover:bg-accent-dim shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                     }`}
                >
                  {isEnhancing ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-wand-magic-sparkles"></i>
                  )}
                </button>
             </div>
             
             {/* EMOTION TAGS SHORTCUTS */}
             <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                 <span className="text-[10px] font-bold text-accent shrink-0 uppercase tracking-widest px-1">
                     {lang === 'ar' ? 'انفعالات:' : 'Emotions:'}
                 </span>
                 {EMOTION_TAGS.map((tag, idx) => (
                     <button
                        key={idx}
                        type="button"
                        onClick={() => insertAtCursor(tag.value)}
                        className="whitespace-nowrap px-3 py-1 rounded-full bg-surface border border-border text-[10px] font-bold text-txt-secondary hover:bg-accent hover:text-white hover:border-accent transition-all shrink-0"
                     >
                        {tag.label}
                     </button>
                 ))}
             </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className={`w-full py-5 rounded-xl font-bold text-sm tracking-[3px] uppercase transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group
               ${isLoading || !text.trim()
               ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
               : 'bg-accent text-white hover:bg-accent-dim hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]'
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
    </div>
  );
};
