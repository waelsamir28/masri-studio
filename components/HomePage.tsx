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
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Banner Section */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-border shadow-2xl">
        {bannerUrl ? (
          <div className="relative">
            <img 
              src={bannerUrl} 
              alt="Banner" 
              className="w-full h-48 sm:h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2 drop-shadow-lg">
                {appName || 'MASRI STUDIO'}
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-lg">
                {lang === 'ar' 
                  ? 'أقوى استوديو صوتي بالذكاء الاصطناعي في مصر'
                  : 'The Most Powerful AI Voice Studio in Egypt'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="absolute top-8 left-[15%] text-violet-300/40 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>
                <i className="fas fa-music"></i>
              </div>
              <div className="absolute top-16 right-[20%] text-purple-300/40 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>
                <i className="fas fa-headphones"></i>
              </div>
              <div className="absolute bottom-12 left-[30%] text-blue-300/40 text-4xl animate-float" style={{ animationDelay: '2s' }}>
                <i className="fas fa-microphone-lines"></i>
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 icon-3d shadow-2xl">
                <i className="fas fa-microphone-lines text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2 drop-shadow-lg">
                {appName || 'MASRI STUDIO'}
              </h1>
              <p className="text-violet-200 text-sm sm:text-base max-w-lg">
                {lang === 'ar' 
                  ? 'أقوى استوديو صوتي بالذكاء الاصطناعي في مصر - أصوات حقيقية بلمسة سحرية'
                  : 'The Most Powerful AI Voice Studio in Egypt - Real Voices with a Magic Touch'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Install PWA Banner */}
      {showInstallPrompt && (
        <div className="glass-card p-4 mb-6 flex items-center gap-4 border-accent/30 animate-slide-down">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 icon-3d">
            <i className="fas fa-download text-accent text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-txt-primary">
              {lang === 'ar' ? 'ثبّت التطبيق على جهازك!' : 'Install the app on your device!'}
            </p>
            <p className="text-[10px] text-txt-muted">
              {lang === 'ar' ? 'استخدم التطبيق كتطبيق حقيقي بدون متصفح' : 'Use the app as a real app without a browser'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold btn-3d"
            >
              {lang === 'ar' ? 'تثبيت' : 'Install'}
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-3 py-2 rounded-xl bg-highlight border border-border text-txt-muted text-xs"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'fa-microphone-lines', label: lang === 'ar' ? '٢٠ مؤدي صوتي' : '20 Voice Actors', color: 'from-violet-500 to-purple-600', desc: lang === 'ar' ? 'أصوات متنوعة' : 'Diverse voices' },
          { icon: 'fa-wand-magic-sparkles', label: lang === 'ar' ? 'مؤلف سحري' : 'Magic Writer', color: 'from-blue-500 to-cyan-600', desc: lang === 'ar' ? 'كتابة بالذكاء الاصطناعي' : 'AI Writing' },
          { icon: 'fa-sliders', label: lang === 'ar' ? '٨٠+ نبرة' : '80+ Tones', color: 'from-amber-500 to-orange-600', desc: lang === 'ar' ? 'تحكم كامل' : 'Full control' },
          { icon: 'fa-file-lines', label: lang === 'ar' ? 'قوالب جاهزة' : 'Templates', color: 'from-emerald-500 to-green-600', desc: lang === 'ar' ? 'نصوص معدّة مسبقاً' : 'Pre-made texts' },
        ].map((feature, idx) => (
          <div 
            key={idx} 
            className="glass-card p-5 text-center hover:scale-105 transition-all duration-300 cursor-pointer group"
            onClick={() => onNavigate('studio')}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 icon-3d shadow-lg group-hover:shadow-xl transition-all`}>
              <i className={`fas ${feature.icon} text-white text-lg`}></i>
            </div>
            <h3 className="font-bold text-sm text-txt-primary mb-1">{feature.label}</h3>
            <p className="text-[10px] text-txt-muted">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* New Features Showcase */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-display font-bold text-txt-primary mb-4 flex items-center gap-2">
          <i className="fas fa-sparkles text-accent"></i>
          {lang === 'ar' ? 'مميزات جديدة' : 'New Features'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: 'fa-bell', label: lang === 'ar' ? 'إشعارات ذكية' : 'Smart Notifications', desc: lang === 'ar' ? 'تنبيه عند اكتمال التوليد' : 'Alert when generation completes' },
            { icon: 'fa-layer-group', label: lang === 'ar' ? 'توليد متعدد' : 'Batch Generation', desc: lang === 'ar' ? 'نفس النص بأصوات مختلفة' : 'Same text with different voices' },
            { icon: 'fa-clock', label: lang === 'ar' ? 'مؤقت التوليد' : 'Generation Timer', desc: lang === 'ar' ? 'عداد لوقت المعالجة' : 'Processing time counter' },
            { icon: 'fa-share-nodes', label: lang === 'ar' ? 'مشاركة مباشرة' : 'Direct Sharing', desc: lang === 'ar' ? 'واتساب، تيليجرام، فيسبوك' : 'WhatsApp, Telegram, Facebook' },
            { icon: 'fa-heart', label: lang === 'ar' ? 'مكتبة الأصوات' : 'Voice Library', desc: lang === 'ar' ? 'احفظ تسجيلاتك المفضلة' : 'Save your favorite recordings' },
            { icon: 'fa-mobile-screen', label: lang === 'ar' ? 'تطبيق موبايل' : 'Mobile App', desc: lang === 'ar' ? 'ثبّته على جهازك' : 'Install on your device' },
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-highlight/50 border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <i className={`fas ${feat.icon} text-accent text-xs`}></i>
              </div>
              <div>
                <p className="text-xs font-bold text-txt-primary">{feat.label}</p>
                <p className="text-[9px] text-txt-muted">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent"></div>
            <i className="fas fa-sparkles text-accent text-xl"></i>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent"></div>
          </div>
          <h2 className="text-2xl font-display font-bold text-txt-primary mb-2">
            {lang === 'ar' ? 'جاهز تبدأ؟' : 'Ready to Start?'}
          </h2>
          <p className="text-txt-muted text-sm mb-6 max-w-md mx-auto">
            {lang === 'ar' 
              ? 'اختر المؤدي الصوتي المفضل، حدد النبرة، واكتب النص. الذكاء الاصطناعي سيتكفل بالباقي!'
              : 'Choose your favorite voice actor, select the tone, and write the script. AI will handle the rest!'
            }
          </p>
          <button
            onClick={() => onNavigate('studio')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm tracking-wider shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all btn-3d inline-flex items-center gap-3"
          >
            <i className="fas fa-rocket"></i>
            {lang === 'ar' ? 'ابدأ الآن' : 'Start Now'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 mb-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent"></div>
            <span className="text-accent font-bold uppercase tracking-widest text-[10px]">Design By</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent"></div>
          </div>
          <h3 className="text-txt-primary text-sm font-bold tracking-widest font-display">WAEL SAMIR</h3>
          <div className="flex items-center gap-1 text-txt-muted text-[9px]">
            <span className="border border-txt-muted rounded-full w-3 h-3 flex items-center justify-center text-[7px]">R</span>
            <span>2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};
