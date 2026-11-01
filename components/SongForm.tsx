
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
  GENERAL: { en: 'General', ar: 'عام' }, STARS: { en: 'Stars', ar: 'نجوم' }, ADS: { en: 'Ads', ar: 'إعلانات' },
  CHARACTER: { en: 'Characters', ar: 'شخصيات' }, PROFESSION: { en: 'Jobs', ar: 'مهن' },
  EMOTION: { en: 'Emotions', ar: 'مشاعر' }, FAMILY: { en: 'Family', ar: 'عائلة' }, COMEDY: { en: 'Comedy', ar: 'كوميديا' },
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
  { label: '😄 ضحكة', value: ' (ضحكة) ' }, { label: '😔 تنهيدة', value: ' (تنهيدة) ' },
  { label: '🤫 همس', value: ' (همس) ' }, { label: '⏳ صمت', value: ' ... ' },
  { label: '🔥 حماس', value: ' (بمنتهى الحماس) ' }, { label: '✨ تشويق', value: ' (بتشويق) ' },
  { label: '💪 ثقة', value: ' (واثق) ' }, { label: '⚡ سرعة', value: ' (بسرع) ' },
  { label: '🐢 بطء', value: ' (ببطء) ' }, { label: '😲 مفاجأة', value: ' (متفاجئ) ' },
  { label: '❓ تساؤل', value: ' (مستفهم) ' }, { label: '📢 نداء', value: ' (منادي) ' },
  { label: '💰 إغراء', value: ' (مغري) ' }, { label: '🎙️ رسمي', value: ' (رسمي) ' },
  { label: '😨 خوف', value: ' (خايف) ' }, { label: '😠 غضب', value: ' (غاضب) ' },
];

const PREVIEW_TEXT = "أهلاً بكم في ستوديو مصر";

// Colorful 3D gradient map for actors
const ACTOR_GRADIENTS = [
  'from-blue-500 to-blue-700', 'from-cyan-500 to-cyan-700', 'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700', 'from-orange-500 to-orange-700', 'from-emerald-500 to-emerald-700',
  'from-red-500 to-red-700', 'from-teal-500 to-teal-700', 'from-indigo-500 to-indigo-700',
  'from-amber-500 to-amber-700',
];

const ACTOR_EMOJIS: Record<string, string> = {
  actor_hassan: '🎙️', actor_amr: '📻', actor_mido: '⚡', actor_sherif: '🔥',
  actor_tarek: '💪', actor_khaled: '🎬', actor_magdy: '👴', actor_youssef: '🧠',
  actor_seif: '⚔️', actor_kareem: '💻', actor_moataz: '🌙',
  actor_layla: '🌸', actor_dalia: '📺', actor_sarah: '✨', actor_rania: '💋',
  actor_hoda: '🎉', actor_nour: '🌹', actor_menna: '📱', actor_salma: '👩‍💼', actor_faten: '🎭',
};

// 3D icon colors for tone presets
const TONE_ICON_COLORS: Record<string, string> = {
  GENERAL: 'icon-3d-blue', STARS: 'icon-3d-yellow', ADS: 'icon-3d-orange',
  CHARACTER: 'icon-3d-green', PROFESSION: 'icon-3d-purple', EMOTION: 'icon-3d-pink',
  FAMILY: 'icon-3d-teal', COMEDY: 'icon-3d-red',
};

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
  const [showTemplates, setShowTemplates] = useState(false);

  const previewCache = useRef<Record<string, string>>({});
  const processorRef = useRef<VoiceProcessor | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredActors = VOICE_ACTORS.filter(a => a.gender === selectedGender);

  useEffect(() => {
    if (filteredActors.length > 0) {
      const current = VOICE_ACTORS.find(a => a.id === selectedActorId);
      if (!current || current.gender !== selectedGender) setSelectedActorId(filteredActors[0].id);
    }
  }, [selectedGender, filteredActors, selectedActorId]);

  useEffect(() => { processorRef.current = new VoiceProcessor(); return () => { processorRef.current?.stop(); }; }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && selectedActorId) {
      const actor = VOICE_ACTORS.find(a => a.id === selectedActorId)!;
      const preset = selectedPresetId ? VOICE_PRESETS.find(p => p.id === selectedPresetId) || null : null;
      onSubmit(text, actor, preset, customTone);
    }
  };

  const handleMagicWrite = async () => {
    if (!scriptTopic.trim()) return; setIsScriptLoading(true);
    try { const s = await generateTextScript(scriptTopic, scriptLength, lang); setText(s); setScriptTopic(''); } catch(e) { console.error(e); }
    finally { setIsScriptLoading(false); }
  };

  const handleEnhanceText = async () => {
    if (!text.trim() || !selectedActorId) return; setIsEnhancing(true);
    try { const actor = VOICE_ACTORS.find(a => a.id === selectedActorId)!; setText(await enhanceScriptWithActor(text, actor, lang)); } catch(e) { console.error(e); }
    finally { setIsEnhancing(false); }
  };

  const insertAtCursor = (tagValue: string) => {
    const ta = textareaRef.current;
    if (!ta) { setText(p => p + tagValue); return; }
    const s = ta.selectionStart, e = ta.selectionEnd, t = ta.value;
    setText(t.substring(0, s) + tagValue + t.substring(e));
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + tagValue.length; }, 0);
  };

  const handlePreview = async (e: React.MouseEvent, actor: VoiceActor) => {
    e.stopPropagation(); setPreviewError(null);
    if (previewPlayingId === actor.id) { processorRef.current?.stop(); setPreviewPlayingId(null); return; }
    if (previewLoadingId) return; processorRef.current?.stop(); setPreviewPlayingId(null); setPreviewLoadingId(actor.id);
    try {
      let url = previewCache.current[actor.id];
      if (!url) { url = await generateSpeech(PREVIEW_TEXT, actor, null, ""); previewCache.current[actor.id] = url; }
      setPreviewLoadingId(null); setPreviewPlayingId(actor.id);
      await processorRef.current?.processAndPlay(url, 1.0, 1.0, () => { setPreviewPlayingId(null); });
    } catch (error: any) {
      setPreviewLoadingId(null); setPreviewPlayingId(null);
      setPreviewError(error.message?.includes('Limit') ? (lang === 'ar' ? '⚠️ تجاوزت الحد' : '⚠️ Limit') : (lang === 'ar' ? '⚠️ خطأ' : '⚠️ Error'));
      setTimeout(() => setPreviewError(null), 3000);
    }
  };

  const handleRandomize = () => {
    const ra = filteredActors[Math.floor(Math.random() * filteredActors.length)]; setSelectedActorId(ra.id);
    const rp = VOICE_PRESETS[Math.floor(Math.random() * VOICE_PRESETS.length)];
    setSelectedCategory(rp.category); setSelectedPresetId(rp.id); setCustomTone('');
  };

  const handleTemplateSelect = (template: TextTemplate) => { setText(template.text); if (template.suggestedTone) setCustomTone(template.suggestedTone); };

  const currentTabPresets = VOICE_PRESETS.filter(p => p.category === selectedCategory);
  const categoryOrder = ['GENERAL', 'STARS', 'ADS', 'EMOTION', 'CHARACTER', 'PROFESSION', 'FAMILY', 'COMEDY'];
  const toneIconColor = TONE_ICON_COLORS[selectedCategory] || 'icon-3d-blue';

  return (
    <div className="w-full win11-card overflow-hidden relative animate-fade-in">
      
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center gap-3 bg-gradient-to-r from-accent/5 to-transparent">
        <div className="w-12 h-12 rounded-xl icon-3d-cyan icon-3d flex items-center justify-center">
          <i className="fas fa-microphone text-lg"></i>
        </div>
        <div><h1 className="text-lg font-bold text-txt-primary">{lang === 'ar' ? 'الاستوديو' : 'Voice Studio'}</h1><p className="text-[10px] text-txt-muted">{lang === 'ar' ? 'اختر المؤدي والنبرة' : 'Select actor & tone'}</p></div>
      </div>

      <div className="p-5 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Gender */}
          <div className="flex gap-2">
            {(['MALE', 'FEMALE'] as Gender[]).map(g => (
              <button key={g} type="button" onClick={() => setSelectedGender(g)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedGender === g ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/20' : 'win11-button text-txt-muted'}`}>
                <i className={`fas ${g === 'MALE' ? 'fa-mars' : 'fa-venus'} text-base`}></i>
                <span>{lang === 'ar' ? (g === 'MALE' ? 'رجال' : 'سيدات') : g}</span>
              </button>
            ))}
          </div>

          {/* ACTOR SELECTION - LARGER 3D BUTTONS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-accent flex items-center gap-1.5">
                <i className="fas fa-users"></i>
                {lang === 'ar' ? 'اختر المؤدي' : 'Voice Actor'}
              </label>
              {previewError && <div className="text-[10px] text-red-400 px-2 py-1 rounded-lg bg-red-500/10 animate-fade-in">{previewError}</div>}
              <button type="button" onClick={handleRandomize} className="text-[10px] text-txt-muted hover:text-accent flex items-center gap-1"><i className="fas fa-dice"></i>{lang === 'ar' ? 'عشوائي' : 'Random'}</button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {filteredActors.map((actor, idx) => {
                const isSelected = selectedActorId === actor.id;
                const isPlaying = previewPlayingId === actor.id;
                const isLoading = previewLoadingId === actor.id;
                const gradient = ACTOR_GRADIENTS[idx % ACTOR_GRADIENTS.length];
                const emoji = ACTOR_EMOJIS[actor.id] || '🎤';

                return (
                  <button key={actor.id} type="button" onClick={() => setSelectedActorId(actor.id)} className="group relative flex flex-col items-center gap-2">
                    {/* Large 3D Avatar - 72px */}
                    <div className={`relative w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center transition-all duration-200 shadow-xl ${
                      isSelected 
                        ? 'ring-3 ring-accent ring-offset-2 ring-offset-surface scale-110 shadow-[0_0_30px_rgba(6,182,212,0.5)]' 
                        : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'
                    }`}>
                      {/* 3D shine */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></div>
                      
                      {/* Emoji */}
                      <span className="text-3xl drop-shadow-lg z-10">{emoji}</span>
                      
                      {/* Selection ring */}
                      {isSelected && <div className="absolute -inset-1 rounded-2xl border-2 border-accent/50 animate-pulse-soft"></div>}

                      {/* Preview button */}
                      <div onClick={(e) => handlePreview(e, actor)} className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center z-20 border-2 border-surface shadow-md transition-all ${
                        isPlaying ? 'bg-accent text-white scale-110' : isLoading ? 'bg-surface2 text-accent' : 'bg-surface2 text-txt-muted hover:bg-accent hover:text-white'
                      }`}>
                        {isLoading ? <i className="fas fa-circle-notch fa-spin text-[8px]"></i> : <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'} text-[7px] pl-[1px]`}></i>}
                      </div>
                    </div>
                    
                    {/* Name */}
                    <div className="text-center w-full">
                      <span className={`text-[11px] font-bold truncate block ${isSelected ? 'text-accent' : 'text-txt-muted'}`}>
                        {lang === 'ar' ? actor.nameAr : actor.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

          {/* Tone Selection with 3D Icons */}
          <div>
            <label className="text-xs font-bold text-accent flex items-center gap-1.5 mb-3">
              <i className="fas fa-sliders"></i>
              {lang === 'ar' ? 'النبرة والأداء' : 'Tone & Performance'}
            </label>

            <div className="flex flex-wrap gap-2 mb-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {categoryOrder.map(cat => (
                <button key={cat} type="button" onClick={() => { setSelectedCategory(cat); setCustomTone(''); }} className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${selectedCategory === cat ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/20' : 'win11-button text-txt-muted'}`}>
                  {lang === 'ar' ? CATEGORY_LABELS[cat].ar : CATEGORY_LABELS[cat].en}
                </button>
              ))}
            </div>

            <div className="relative mb-4">
              <input type="text" value={customTone} onChange={(e) => { setCustomTone(e.target.value); if (e.target.value) setSelectedPresetId(null); }} placeholder={lang === 'ar' ? '✨ وصف خاص...' : '✨ Custom tone...'} className={`w-full py-3 px-4 rounded-xl bg-surface2 border border-border text-sm text-txt-primary placeholder-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all ${customTone ? 'border-accent' : ''} ${lang === 'ar' ? 'text-right' : ''}`} />
            </div>

            <div className={`transition-opacity duration-200 ${customTone ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {currentTabPresets.map(preset => (
                  <button key={preset.id} type="button" onClick={() => { setSelectedPresetId(preset.id); setCustomTone(''); }} className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${selectedPresetId === preset.id ? 'bg-accent-soft border-accent text-accent shadow-lg' : 'win11-button text-txt-muted'}`}>
                    {/* 3D Icon */}
                    <div className={`w-12 h-12 rounded-xl ${selectedPresetId === preset.id ? 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white' : toneIconColor} flex items-center justify-center icon-3d shadow-md transition-all`}>
                      <i className={`fas ${preset.icon} text-lg`}></i>
                    </div>
                    <span className="text-[10px] font-bold leading-tight">{lang === 'ar' ? preset.labelAr : preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

          {/* Magic Writer */}
          <div className="win11-card p-4 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl icon-3d-purple icon-3d flex items-center justify-center"><i className="fas fa-wand-magic-sparkles"></i></div>
              <div><h3 className="text-xs font-bold text-txt-primary">{lang === 'ar' ? 'المؤلف الذكي' : 'Magic Writer'}</h3><p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'اكتب فكرة نكتب النص' : 'AI writes for you'}</p></div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="text" value={scriptTopic} onChange={(e) => setScriptTopic(e.target.value)} placeholder={lang === 'ar' ? 'فكرة: إعلان كشري، قصة...' : 'Topic...'} className="w-full py-2.5 px-3 rounded-xl bg-surface2 border border-border text-sm text-txt-primary placeholder-txt-muted focus:border-accent outline-none" />
              <div className="flex items-center gap-2">
                <div className="flex bg-surface2 p-0.5 rounded-lg">
                  {(['SHORT', 'MEDIUM', 'LONG'] as const).map(len => (
                    <button key={len} type="button" onClick={() => setScriptLength(len)} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${scriptLength === len ? 'bg-cyan-500 text-white' : 'text-txt-muted'}`}>
                      {len === 'SHORT' ? (lang === 'ar' ? 'قصير' : 'Short') : len === 'MEDIUM' ? (lang === 'ar' ? 'متوسط' : 'Medium') : (lang === 'ar' ? 'طويل' : 'Long')}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={handleMagicWrite} disabled={isScriptLoading || !scriptTopic.trim()} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${!scriptTopic.trim() ? 'bg-surface2 text-txt-muted cursor-not-allowed border border-border' : 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg'}`}>
                  {isScriptLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-pen-nib"></i>}
                  {lang === 'ar' ? 'تأليف' : 'Compose'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Phrases */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {QUICK_PHRASES.map((phrase, idx) => (
              <button key={idx} type="button" onClick={() => setText(phrase)} className="whitespace-nowrap px-3 py-1.5 rounded-xl win11-button text-[10px] shrink-0">{phrase}</button>
            ))}
          </div>

          {/* Text Input */}
          <div className="relative">
            <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} placeholder={lang === 'ar' ? 'اكتب النص هنا...' : 'Type script here...'} rows={4} className="w-full p-4 pb-10 rounded-xl bg-surface2 border border-border text-sm text-txt-primary placeholder-txt-muted focus:border-accent outline-none resize-none" dir="rtl" />
            <div className="absolute bottom-3 left-3 text-[9px] text-txt-muted">{text.length} chars</div>
            <button type="button" onClick={handleEnhanceText} disabled={!text.trim() || isEnhancing || !selectedActorId} title={lang === 'ar' ? 'تحسين' : 'Enhance'} className={`absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-xl text-xs transition-all ${!text.trim() || isEnhancing ? 'bg-surface2 text-txt-muted cursor-not-allowed' : 'icon-3d-purple icon-3d'}`}>
              {isEnhancing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            </button>
          </div>
          
          {/* Emotion Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <span className="text-[10px] font-bold text-accent shrink-0 flex items-center gap-1"><i className="fas fa-face-grin-stars"></i>{lang === 'ar' ? 'انفعالات:' : 'Emotions:'}</span>
            {EMOTION_TAGS.map((tag, idx) => (
              <button key={idx} type="button" onClick={() => insertAtCursor(tag.value)} className="whitespace-nowrap px-2.5 py-1.5 rounded-xl win11-button text-[10px] shrink-0">{tag.label}</button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <button type="button" onClick={() => setShowTemplates(true)} className="px-3 py-2 rounded-xl win11-button text-xs font-bold flex items-center gap-1.5"><i className="fas fa-file-lines text-[11px]"></i>{lang === 'ar' ? 'قوالب' : 'Templates'}</button>
            <BatchGenerate text={text} lang={lang} onGenerated={onBatchGenerated || (() => {})} />
            <GenerationTimer isActive={isLoading} />
          </div>
        </form>

        {/* Submit Button */}
        <button type="submit" onClick={handleSubmit} disabled={isLoading || !text.trim()} className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isLoading || !text.trim() ? 'bg-surface2 text-txt-muted cursor-not-allowed border border-border' : 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40'}`}>
          {isLoading ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : <><i className="fas fa-play"></i><span>{lang === 'ar' ? 'توليد الصوت الآن' : 'GENERATE AUDIO'}</span></>}
        </button>
      </div>

      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} lang={lang} />
    </div>
  );
};
