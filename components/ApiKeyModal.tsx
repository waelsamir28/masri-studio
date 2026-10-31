import React, { useState } from 'react';

interface ApiKeyModalProps { isOpen: boolean; onClose: () => void; lang: 'en' | 'ar'; }

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, lang }) => {
  const [key, setKey] = useState(localStorage.getItem('masri-gemini-api-key') || '');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => { localStorage.setItem('masri-gemini-api-key', key.trim()); setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 1500); };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative card p-5 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl icon-3d-yellow icon-3d flex items-center justify-center"><i className="fas fa-key text-sm"></i></div>
            <h3 className="text-sm font-bold text-txt-primary">{lang === 'ar' ? 'مفتاح API' : 'API Key'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors"><i className="fas fa-times text-xs"></i></button>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
          <p className="text-[11px] text-amber-300 flex items-start gap-1.5"><i className="fas fa-exclamation-triangle mt-0.5 shrink-0"></i><span>{lang === 'ar' ? 'احصل على مفتاح مجاني' : 'Get a free key'}</span></p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[11px] text-accent hover:underline block mt-1.5"><i className="fas fa-external-link-alt ml-1"></i>{lang === 'ar' ? 'Google AI Studio' : 'Google AI Studio'}</a>
        </div>
        <div className="relative mb-4">
          <input type={showKey ? 'text' : 'password'} value={key} onChange={(e) => setKey(e.target.value)} placeholder="AIzaSy..." className="input w-full px-3 py-3 text-sm" dir="ltr" />
          <button onClick={() => setShowKey(!showKey)} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-accent transition-colors"><i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i></button>
        </div>
        <button onClick={handleSave} disabled={!key.trim()} className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${saved ? 'bg-emerald-500 text-white' : key.trim() ? 'btn-primary' : 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'}`}>
          {saved ? <><i className="fas fa-check"></i>{lang === 'ar' ? 'تم الحفظ' : 'Saved'}</> : <><i className="fas fa-save"></i>{lang === 'ar' ? 'حفظ' : 'Save'}</>}
        </button>
        <p className="text-[9px] text-txt-muted text-center mt-2.5">{lang === 'ar' ? 'يُحفظ محلياً فقط' : 'Stored locally only'}</p>
      </div>
    </div>
  );
};
