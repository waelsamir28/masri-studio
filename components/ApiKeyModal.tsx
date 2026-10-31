import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, lang }) => {
  const [key, setKey] = useState(localStorage.getItem('masri-gemini-api-key') || '');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('masri-gemini-api-key', key.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative glass-card p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center icon-3d">
              <i className="fas fa-key text-accent text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-txt-primary">
                {lang === 'ar' ? 'مفتاح API' : 'API Key'}
              </h3>
              <p className="text-[10px] text-txt-muted">
                {lang === 'ar' ? 'Google Gemini API Key' : 'Google Gemini API Key'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-highlight flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <p className="text-xs text-yellow-400 flex items-start gap-2">
            <i className="fas fa-exclamation-triangle mt-0.5 shrink-0"></i>
            <span>
              {lang === 'ar' 
                ? 'مفتاح API مطلوب لتشغيل التطبيق. احصل عليه مجاناً من Google AI Studio.'
                : 'API Key is required to run the app. Get it free from Google AI Studio.'}
            </span>
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline block mt-2"
          >
            <i className="fas fa-external-link-alt ml-1"></i>
            {lang === 'ar' ? 'احصل على مفتاح API من Google AI Studio' : 'Get API Key from Google AI Studio'}
          </a>
        </div>

        <div className="relative mb-4">
          <input
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-xl bg-highlight border border-border text-txt-primary placeholder-txt-muted focus:border-accent outline-none transition-all text-left"
            dir="ltr"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-accent transition-colors"
          >
            <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all btn-3d flex items-center justify-center gap-2 ${
            saved
              ? 'bg-green-500 text-white'
              : key.trim()
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                : 'bg-highlight text-txt-muted cursor-not-allowed border border-border'
          }`}
        >
          {saved ? (
            <><i className="fas fa-check"></i> {lang === 'ar' ? 'تم الحفظ!' : 'Saved!'}</>
          ) : (
            <><i className="fas fa-save"></i> {lang === 'ar' ? 'حفظ المفتاح' : 'Save Key'}</>
          )}
        </button>

        <p className="text-[9px] text-txt-muted text-center mt-3">
          {lang === 'ar'
            ? 'يتم حفظ المفتاح محلياً في متصفحك فقط ولا يُرسل لأي جهة'
            : 'Key is stored locally in your browser only and never sent anywhere'}
        </p>
      </div>
    </div>
  );
};
