import React, { useState, useEffect } from 'react';

interface InstallPromptProps {
  lang: 'en' | 'ar';
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ lang }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] max-w-md mx-auto animate-slide-up">
      <div className="win11-card p-4 flex items-center gap-3 border-cyan-500/30">
        <div className="w-12 h-12 rounded-xl icon-3d-green icon-3d flex items-center justify-center shrink-0">
          <i className="fas fa-download text-lg"></i>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-txt-primary">{lang === 'ar' ? 'ثبّت التطبيق!' : 'Install App!'}</p>
          <p className="text-[10px] text-txt-muted">{lang === 'ar' ? 'استخدمه كتطبيق حقيقي على جهازك' : 'Use it as a real app on your device'}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleInstall} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-700 text-white text-xs font-bold hover:scale-105 transition-transform">
            {lang === 'ar' ? 'تثبيت' : 'Install'}
          </button>
          <button onClick={() => setShowPrompt(false)} className="w-8 h-8 rounded-lg win11-button flex items-center justify-center text-txt-muted">
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
