import React, { useState, useRef } from 'react';
import { ClonedVoice } from '../types';
import { addToast } from '../services/notificationService';

interface VoiceCloningModalProps {
  lang: 'en' | 'ar';
  onClose: () => void;
  onClone: (voice: ClonedVoice) => void;
}

export const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({ lang, onClose, onClone }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'done'>('upload');
  const [voiceName, setVoiceName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      addToast('error', lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'يجب رفع ملف صوتي فقط' : 'Audio files only');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addToast('error', lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'الحد الأقصى 10 ميجا' : 'Max 10MB');
      return;
    }

    setAudioFile(file);
    
    // Read file as Data URL
    const reader = new FileReader();
    reader.onload = () => {
      setAudioDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Get duration
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
  };

  const startCloning = async () => {
    if (!voiceName.trim() || !audioDataUrl) return;
    
    setStep('processing');
    setProgress(0);

    // Simulate processing with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Simulate AI processing (3-5 seconds)
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    clearInterval(interval);
    setProgress(100);

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newVoice: ClonedVoice = {
      id: 'clone_' + Date.now(),
      name: voiceName.trim(),
      sampleDataUrl: audioDataUrl,
      createdAt: Date.now(),
      status: 'ready'
    };

    onClone(newVoice);
    setStep('done');
    addToast('success', lang === 'ar' ? 'تم الاستنساخ ✓' : 'Cloned ✓', lang === 'ar' ? `صوت "${voiceName}" جاهز` : `"${voiceName}" is ready`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md win11-card animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-fingerprint text-white"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-txt-primary">{lang === 'ar' ? 'استنساخ الصوت' : 'Voice Cloning'}</h3>
                <p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'استنسخ أي صوت بـ AI' : 'Clone any voice with AI'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-all">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        <div className="p-5">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-surface2/50 rounded-xl p-3 border border-border">
                <h4 className="text-xs font-bold text-accent flex items-center gap-1.5 mb-2">
                  <i className="fas fa-circle-info"></i>
                  {lang === 'ar' ? 'تعليمات مهمة' : 'Important Instructions'}
                </h4>
                <ul className="text-[10px] text-txt-secondary space-y-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <li>• {lang === 'ar' ? 'ارفع تسجيل 10-30 ثانية بصوت واضح' : 'Upload 10-30 seconds of clear voice'}</li>
                  <li>• {lang === 'ar' ? 'الصوت يكون بدون موسيقى أو ضوضاء' : 'No music or background noise'}</li>
                  <li>• {lang === 'ar' ? 'الص formats المدعومة: MP3, WAV, M4A' : 'Supported formats: MP3, WAV, M4A'}</li>
                  <li>• {lang === 'ar' ? 'الحد الأقصى: 10 ميجا' : 'Max size: 10MB'}</li>
                </ul>
              </div>

              {/* Voice Name */}
              <div>
                <label className="text-xs font-bold text-txt-primary mb-1.5 block">
                  <i className="fas fa-tag text-accent ml-1"></i>
                  {lang === 'ar' ? 'اسم الصوت المستنسخ' : 'Voice Name'}
                </label>
                <input type="text" value={voiceName} onChange={e => setVoiceName(e.target.value)} 
                  placeholder={lang === 'ar' ? 'مثال: صوتي، صوت أبي...' : 'e.g. My Voice, Dad\'s Voice...'}
                  className="w-full py-2.5 px-3 rounded-xl bg-surface2 border border-border text-sm text-txt-primary placeholder-txt-muted focus:border-accent outline-none" />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-xs font-bold text-txt-primary mb-1.5 block">
                  <i className="fas fa-upload text-accent ml-1"></i>
                  {lang === 'ar' ? 'ملف الصوت' : 'Audio File'}
                </label>
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                
                {!audioFile ? (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <i className="fas fa-cloud-arrow-up text-xl text-accent"></i>
                    </div>
                    <p className="text-xs font-bold text-txt-primary">{lang === 'ar' ? 'اضغط لرفع ملف صوتي' : 'Click to upload audio'}</p>
                    <p className="text-[9px] text-txt-muted mt-1">{lang === 'ar' ? 'MP3, WAV, M4A (حد أقصى 10 ميجا)' : 'MP3, WAV, M4A (max 10MB)'}</p>
                  </div>
                ) : (
                  <div className="bg-surface2/50 border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <i className="fas fa-file-audio text-green-400 text-sm"></i>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-txt-primary truncate max-w-[180px]">{audioFile.name}</p>
                          <p className="text-[9px] text-txt-muted">{(audioFile.size / 1024 / 1024).toFixed(1)} MB • {Math.round(duration)}s</p>
                        </div>
                      </div>
                      <button onClick={() => { setAudioFile(null); setAudioDataUrl(''); }} className="w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-red-400">
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                    {audioDataUrl && (
                      <audio ref={audioRef} controls src={audioDataUrl} className="w-full h-8 mt-1" style={{ filter: 'hue-rotate(180deg)' }} />
                    )}
                    {duration > 0 && duration < 5 && (
                      <p className="text-[9px] text-yellow-400 mt-1 flex items-center gap-1">
                        <i className="fas fa-exclamation-triangle"></i>
                        {lang === 'ar' ? 'يفضل 10-30 ثانية لأفضل نتيجة' : 'Prefer 10-30s for best results'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Clone Button */}
              <button onClick={startCloning} disabled={!voiceName.trim() || !audioFile} 
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  voiceName.trim() && audioFile 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl shadow-purple-500/20 hover:scale-[1.02]' 
                    : 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'
                }`}>
                <i className="fas fa-wand-magic-sparkles"></i>
                {lang === 'ar' ? 'بدء الاستنساخ' : 'Start Cloning'}
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-surface2"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <i className="fas fa-fingerprint text-2xl text-pink-400 animate-pulse"></i>
                </div>
              </div>
              <h4 className="text-sm font-bold text-txt-primary mb-1">{lang === 'ar' ? 'جاري استنساخ الصوت...' : 'Cloning Voice...'}</h4>
              <p className="text-[10px] text-txt-muted mb-4">{lang === 'ar' ? 'AI يحلل خصائص الصوت' : 'AI analyzing voice patterns'}</p>
              
              {/* Progress */}
              <div className="w-full max-w-xs mx-auto">
                <div className="flex justify-between text-[9px] text-txt-muted mb-1">
                  <span>{lang === 'ar' ? 'التقدم' : 'Progress'}</span>
                  <span>{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1 text-[10px] text-txt-muted">
                <p className={progress > 20 ? 'text-green-400' : ''}><i className={`fas ${progress > 20 ? 'fa-check-circle' : 'fa-circle'} ml-1`}></i> {lang === 'ar' ? 'رفع الملف' : 'Upload file'}</p>
                <p className={progress > 50 ? 'text-green-400' : ''}><i className={`fas ${progress > 50 ? 'fa-check-circle' : 'fa-circle'} ml-1`}></i> {lang === 'ar' ? 'تحليل الترددات' : 'Analyzing frequencies'}</p>
                <p className={progress > 75 ? 'text-green-400' : ''}><i className={`fas ${progress > 75 ? 'fa-check-circle' : 'fa-circle'} ml-1`}></i> {lang === 'ar' ? 'بناء نموذج الصوت' : 'Building voice model'}</p>
                <p className={progress >= 100 ? 'text-green-400' : ''}><i className={`fas ${progress >= 100 ? 'fa-check-circle' : 'fa-circle'} ml-1`}></i> {lang === 'ar' ? 'اكتمال الاستنساخ' : 'Clone complete'}</p>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 animate-scale-in shadow-xl shadow-green-500/30">
                <i className="fas fa-check text-white text-3xl"></i>
              </div>
              <h4 className="text-sm font-bold text-txt-primary mb-1">{lang === 'ar' ? 'تم الاستنساخ بنجاح!' : 'Voice Cloned Successfully!'}</h4>
              <p className="text-[10px] text-txt-muted mb-4">{lang === 'ar' ? `"${voiceName}" جاهز للاستخدام` : `"${voiceName}" is ready to use`}</p>
              
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl win11-button text-xs font-bold">
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button onClick={() => { setStep('upload'); setVoiceName(''); setAudioFile(null); setAudioDataUrl(''); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold">
                  {lang === 'ar' ? 'استنساخ آخر' : 'Clone Another'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
