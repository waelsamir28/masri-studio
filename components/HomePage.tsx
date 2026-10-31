import React, { useState, useEffect } from 'react';

interface HomePageProps {
  lang: 'en' | 'ar';
  bannerUrl: string;
  appName: string;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ lang, bannerUrl, appName, onNavigate }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); setShowInstallPrompt(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') setShowInstallPrompt(false); setDeferredPrompt(null); }
  };

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border border-border">
        {bannerUrl ? (
          <div className="relative">
            <img src={bannerUrl} alt="Banner" className="w-full h-40 sm:h-52 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-5">
              <h1 className="text-xl font-bold text-white">{appName}</h1>
              <p className="text-white/80 text-xs mt-0.5">{lang === 'ar' ? 'توليد صوتي بالذكاء الاصطناعي' : 'AI Voice Generation'}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-40 sm:h-52 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl icon-soft flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-microphone text-2xl"></i>
              </div>
              <h1 className="text-xl font-bold text-txt-primary">{appName}</h1>
              <p className="text-txt-muted text-xs mt-1">{lang === 'ar' ? 'أصوات حقيقية بلمسة ذكية' : 'Real voices with a smart touch'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Install PWA */}
      {showInstallPrompt && (
        <div className="card-soft p-4 mb-4 flex items-center gap-3 border-accent/30 animate-slide-up">
          <div className="w-10 h-10 rounded-xl icon-soft flex items-center justify-center shrink-0"><i className="fas fa-download"></i></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-txt-primary">{lang === 'ar' ? 'ثبّت التطبيق!' : 'Install the app!'}</p>
            <p className="text-[10px] text-txt-muted">{lang === 'ar' ? 'استخدمه كتطبيق حقيقي' : 'Use it as a real app'}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleInstall} className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-dim transition-all">{lang === 'ar' ? 'تثبيت' : 'Install'}</button>
            <button onClick={() => setShowInstallPrompt(false)} className="px-2.5 py-2 rounded-lg bg-surface2 text-txt-muted text-xs"><i className="fas fa-times"></i></button>
          </div>
        </div>
      )}

      {/* Quick Start */}
      <button onClick={() => onNavigate('studio')} className="w-full card-soft p-5 mb-6 flex items-center gap-4 group text-right">
        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0 shadow-sm">
          <i className="fas fa-play text-white text-lg"></i>
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-txt-primary">{lang === 'ar' ? 'ابدأ التوليد' : 'Start Creating'}</h2>
          <p className="text-xs text-txt-muted mt-0.5">{lang === 'ar' ? 'اختر صوتاً واكتب نصك' : 'Choose a voice and write your text'}</p>
        </div>
        <i className="fas fa-arrow-left text-txt-muted group-hover:text-accent transition-colors text-sm"></i>
      </button>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: 'fa-microphone', label: lang === 'ar' ? '٢٠ مؤدي' : '20 Actors', color: 'bg-blue-500' },
          { icon: 'fa-wand-magic-sparkles', label: lang === 'ar' ? 'مؤلف ذكي' : 'AI Writer', color: 'bg-purple-500' },
          { icon: 'fa-sliders', label: lang === 'ar' ? '٨٠+ نبرة' : '80+ Tones', color: 'bg-amber-500' },
          { icon: 'fa-file-lines', label: lang === 'ar' ? 'قوالب' : 'Templates', color: 'bg-emerald-500' },
        ].map((f, i) => (
          <div key={i} className="card-soft p-4 flex items-center gap-3 cursor-pointer hover:border-accent/50 transition-all" onClick={() => onNavigate('studio')}>
            <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center shrink-0`}><i className={`fas ${f.icon} text-white text-sm`}></i></div>
            <div>
              <p className="text-xs font-semibold text-txt-primary">{f.label}</p>
              <p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'اضغط للبدء' : 'Tap to start'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New Features */}
      <div className="card-soft p-5 mb-6">
        <h3 className="text-sm font-semibold text-txt-primary mb-3 flex items-center gap-2"><i className="fas fa-sparkles text-accent text-xs"></i>{lang === 'ar' ? 'ميزات جديدة' : 'New Features'}</h3>
        <div className="space-y-2.5">
          {[
            { icon: 'fa-bell', label: lang === 'ar' ? 'إشعارات ذكية' : 'Smart Notifications' },
            { icon: 'fa-layer-group', label: lang === 'ar' ? 'توليد متعدد' : 'Batch Generation' },
            { icon: 'fa-share-nodes', label: lang === 'ar' ? 'مشاركة مباشرة' : 'Direct Sharing' },
            { icon: 'fa-heart', label: lang === 'ar' ? 'مكتبة مفضلة' : 'Favorites Library' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs">
              <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center shrink-0"><i className={`fas ${f.icon} text-accent text-[10px]`}></i></div>
              <span className="text-txt-secondary">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <div className="h-px w-16 bg-border mx-auto mb-3"></div>
        <p className="text-txt-muted text-xs">{lang === 'ar' ? 'تصميم' : 'Designed by'} <span className="text-accent font-medium">WAEL SAMIR</span> © 2025</p>
      </div>
    </div>
  );
};
