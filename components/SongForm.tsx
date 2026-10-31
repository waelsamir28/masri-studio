
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

const PREVIEW_TEXT = "أهلاً بكم في ستوديو مصر";

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
    if (!scriptTopic.trim()) return;
    setIsScriptLoading(true);
    try { const generatedScript = await generateTextScript(scriptTopic, scriptLength, lang); setText(generatedScript); setScriptTopic(''); }
    catch (e) { console.error(e); }
    finally { setIsScriptLoading(false); }
  };

  const handleEnhanceText = async () => {
    if (!text.trim() || !selectedActorId) return;
    setIsEnhancing(true);
    try { const actor = VOICE_ACTORS.find(a => a.id === selectedActorId)!; const enhanced = await enhanceScriptWithActor(text, actor, lang); setText(enhanced); }
    catch (e) { console.error(e); }
    finally { setIsEnhancing(false); }
  };

  const insertAtCursor = (tagValue: string) => {
    const textarea = textareaRef.current;
    if (!textarea) { setText(prev => prev + tagValue); return; }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const newText = currentText.substring(0, start) + tagValue + currentText.substring(end);
    setText(newText);
    setTimeout(() => { textarea.focus(); textarea.selectionStart = textarea.selectionEnd = start + tagValue.length; }, 0);
  };

  const handlePreview = async (e: React.MouseEvent, actor: VoiceActor) => {
    e.stopPropagation();
    setPreviewError(null);
    if (previewPlayingId === actor.id) { processorRef.current?.stop(); setPreviewPlayingId(null); return; }
    if (previewLoadingId) return;
    processorRef.current?.stop();
    setPreviewPlayingId(null);
    setPreviewLoadingId(actor.id);
    try {
      let audioUrl = previewCache.current[actor.id];
      if (!audioUrl) { audioUrl = await generateSpeech(PREVIEW_TEXT, actor, null, ""); previewCache.current[actor.id] = audioUrl; }
      setPreviewLoadingId(null);
      setPreviewPlayingId(actor.id);
      await processorRef.current?.processAndPlay(audioUrl, 1.0, 1.0, () => { setPreviewPlayingId(null); });
    } catch (error: any) {
      setPreviewLoadingId(null); setPreviewPlayingId(null);
      const msg = (error.message && error.message.includes('Limit')) ? (lang === 'ar' ? '⚠️ تجاوزت الحد' : '⚠️ Limit') : (lang === 'ar' ? '⚠️ خطأ' : '⚠️ Error');
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

  const handleTemplateSelect = (template: TextTemplate) => { setText(template.text); if (template.suggestedTone) setCustomTone(template.suggestedTone); };

  const currentTabPresets = VOICE_PRESETS.filter(p => p.category === selectedCategory);
  const categoryOrder = ['GENERAL', 'STARS', 'ADS', 'EMOTION', 'CHARACTER', 'PROFESSION', 'FAMILY', 'COMEDY'];

  return (
    <div className="w-full card-soft overflow-hidden relative animate-fade-in">
      
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl icon-soft flex items-center justify-center">
          <i className="fas fa-microphone"></i>
        </div>
        <div>
          <h1 className="text-base font-semibold text-txt-primary">{lang === 'ar' ? 'الاستوديو' : 'Voice Studio'}</h1>
          <p className="text-[10px] text-txt-muted">{lang === 'ar' ? 'اختر المؤدي والنبرة واكتب النص' : 'Select actor, tone & write text'}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Gender Toggle */}
          <div className="flex bg-surface2 rounded-xl p-1">
            {(['MALE', 'FEMALE'] as Gender[]).map(g => (
              <button key={g} type="button" onClick={() => setSelectedGender(g)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${selectedGender === g ? 'bg-primary text-accent shadow-sm' : 'text-txt-muted hover:text-txt-secondary'}`}>
                <i className={`fas ${g === 'MALE' ? 'fa-mars' : 'fa-venus'}`}></i>
                <span>{lang === 'ar' ? (g === 'MALE' ? 'رجال' : 'سيدات') : g}</span>
              </button>
            ))}
          </div>

          {/* Actor Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
               <label className="text-xs font-medium text-txt-secondary flex items-center gap-1.5">
                  <i className="fas fa-users text-[10px]"></i>
                  {lang === 'ar' ? 'المؤدي' : 'Voice Actor'}
               </label>
               {previewError && <div className="text-[10px] text-red-500 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 animate-fade-in">{previewError}</div>}
               <button type="button" onClick={handleRandomize} className="text-[10px] text-txt-muted hover:text-accent flex items-center gap-1"><i className="fas fa-dice"></i>{lang === 'ar' ? 'عشوائي' : 'Random'}</button>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
              {filteredActors.map(actor => {
                const isSelected = selectedActorId === actor.id;
                const isPlaying = previewPlayingId === actor.id;
                const isLoading = previewLoadingId === actor.id;
                return (
                  <button key={actor.id} type="button" onClick={() => setSelectedActorId(actor.id)} className="group relative flex flex-col items-center gap-1.5">
                    <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${actor.imageColor} flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-accent ring-offset-2 scale-105' : 'opacity-70 group-hover:opacity-100'}`}>
                      <span className="text-xs font-bold text-white/90">{actor.name.charAt(0)}</span>
                      {isSelected && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-surface flex items-center justify-center"><i className="fas fa-check text-[7px] text-white"></i></div>}
                      <div onClick={(e) => handlePreview(e, actor)} className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center z-10 border-2 border-surface ${isPlaying ? 'bg-accent text-white' : 'bg-surface2 text-txt-muted hover:bg-accent hover:text-white'}`}>
                         {isLoading ? <i className="fas fa-circle-notch fa-spin text-[7px]"></i> : <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'} text-[6px] pl-[1px]`}></i>}
                      </div>
                    </div>
                    <span className={`text-[9px] font-medium truncate w-full text-center ${isSelected ? 'text-accent' : 'text-txt-muted'}`}>{lang === 'ar' ? actor.nameAr : actor.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divider"></div>

          {/* Tone Selection */}
          <div>
             <label className="text-xs font-medium text-txt-secondary flex items-center gap-1.5 mb-3">
                <i className="fas fa-sliders text-[10px]"></i>
                {lang === 'ar' ? 'النبرة' : 'Tone'}
             </label>

             <div className="flex flex-wrap gap-1.5 mb-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {categoryOrder.map(cat => (
                  <button key={cat} type="button" onClick={() => { setSelectedCategory(cat); setCustomTone(''); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selectedCategory === cat ? 'bg-accent text-white' : 'bg-surface2 text-txt-muted hover:text-txt-secondary border border-border'}`}>
                    {lang === 'ar' ? CATEGORY_LABELS[cat].ar : CATEGORY_LABELS[cat].en}
                  </button>
                ))}
             </div>

             <div className="relative mb-4">
                <input type="text" value={customTone} onChange={(e) => { setCustomTone(e.target.value); if (e.target.value) setSelectedPresetId(null); }} placeholder={lang === 'ar' ? '✨ وصف خاص...' : '✨ Custom tone...'} className={`w-full py-3 px-4 rounded-xl input-soft text-sm ${customTone ? 'border-accent' : ''} ${lang === 'ar' ? 'text-right' : ''}`} />
             </div>

             <div className={`transition-opacity duration-200 ${customTone ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {currentTabPresets.map(preset => (
                    <button key={preset.id} type="button" onClick={() => { setSelectedPresetId(preset.id); setCustomTone(''); }} className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${selectedPresetId === preset.id ? 'bg-accent-soft border-accent text-accent' : 'bg-primary border-border text-txt-muted hover:border-accent/50'}`}>
                      <i className={`fas ${preset.icon} text-sm`}></i>
                      <span className="text-[10px] font-medium leading-tight">{lang === 'ar' ? preset.labelAr : preset.label}</span>
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="divider"></div>

          {/* Magic Writer */}
          <div className="card-soft p-4 border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-wand-magic-sparkles text-sm"></i></div>
              <div>
                <h3 className="text-xs font-semibold text-txt-primary">{lang === 'ar' ? 'المؤلف الذكي' : 'Magic Writer'}</h3>
                <p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'اكتب فكرة نكتب النص' : 'Write an idea, we write the text'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="text" value={scriptTopic} onChange={(e) => setScriptTopic(e.target.value)} placeholder={lang === 'ar' ? 'فكرة: إعلان كشري، قصة...' : 'Topic...'} className="w-full py-2.5 px-3 rounded-lg input-soft text-sm placeholder-txt-muted" />
              <div className="flex items-center gap-2">
                <div className="flex bg-surface2 p-0.5 rounded-lg">
                  {(['SHORT', 'MEDIUM', 'LONG'] as const).map(len => (
                    <button key={len} type="button" onClick={() => setScriptLength(len)} className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all ${scriptLength === len ? 'bg-accent text-white' : 'text-txt-muted hover:text-txt-secondary'}`}>
                      {len === 'SHORT' ? (lang === 'ar' ? 'قصير' : 'Short') : len === 'MEDIUM' ? (lang === 'ar' ? 'متوسط' : 'Medium') : (lang === 'ar' ? 'طويل' : 'Long')}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={handleMagicWrite} disabled={isScriptLoading || !scriptTopic.trim()} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${!scriptTopic.trim() ? 'bg-surface2 text-txt-muted cursor-not-allowed' : 'bg-accent text-white hover:bg-accent-dim'}`}>
                  {isScriptLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-pen-nib"></i>}
                  {lang === 'ar' ? 'تأليف' : 'Compose'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Phrases */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {QUICK_PHRASES.map((phrase, idx) => (
              <button key={idx} type="button" onClick={() => setText(phrase)} className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-surface2 border border-border text-[10px] text-txt-secondary hover:text-accent hover:border-accent/30 transition-all shrink-0">
                {phrase}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <div className="relative">
            <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} placeholder={lang === 'ar' ? 'اكتب النص هنا...' : 'Type script here...'} rows={4} className={`w-full p-4 pb-10 rounded-xl input-soft text-sm resize-none ${lang === 'ar' ? 'text-right' : ''}`} dir="rtl" />
            <div className="absolute bottom-3 left-3 text-[9px] text-txt-muted">{text.length} chars</div>
            <button type="button" onClick={handleEnhanceText} disabled={!text.trim() || isEnhancing || !selectedActorId} title={lang === 'ar' ? 'تحسين' : 'Enhance'} className={`absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${!text.trim() || isEnhancing ? 'bg-surface2 text-txt-muted cursor-not-allowed' : 'bg-accent text-white hover:bg-accent-dim'}`}>
              {isEnhancing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            </button>
          </div>
          
          {/* Emotion Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <span className="text-[10px] font-medium text-txt-muted shrink-0 flex items-center gap-1">
                  <i className="fas fa-face-grin-stars text-accent"></i>
                  {lang === 'ar' ? 'انفعالات:' : 'Emotions:'}
              </span>
              {EMOTION_TAGS.map((tag, idx) => (
                  <button key={idx} type="button" onClick={() => insertAtCursor(tag.value)} className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-surface2 border border-border text-[10px] font-medium text-txt-secondary hover:bg-accent-soft hover:text-accent hover:border-accent/30 transition-all shrink-0">
                      {tag.label}
                  </button>
              ))}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <button type="button" onClick={() => setShowTemplates(true)} className="px-3 py-2 rounded-lg bg-surface2 border border-border text-xs font-medium text-txt-secondary hover:text-accent hover:border-accent/30 transition-all flex items-center gap-1.5 btn-soft">
              <i className="fas fa-file-lines text-[11px]"></i>
              {lang === 'ar' ? 'قوالب' : 'Templates'}
            </button>
            <BatchGenerate text={text} lang={lang} onGenerated={onBatchGenerated || (() => {})} />
            <GenerationTimer isActive={isLoading} />
          </div>
        </form>

        {/* Submit Button */}
        <button type="submit" onClick={handleSubmit} disabled={isLoading || !text.trim()} className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all btn-soft flex items-center justify-center gap-2 ${isLoading || !text.trim() ? 'bg-surface2 text-txt-muted cursor-not-allowed border border-border' : 'bg-accent text-white hover:bg-accent-dim'}`}>
          {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-play text-xs"></i><span>{lang === 'ar' ? 'توليد الصوت' : 'Generate Audio'}</span></>}
        </button>
      </div>

      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} lang={lang} />
    </div>
  );
};
