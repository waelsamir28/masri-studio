import React from 'react';

interface HomePageProps { lang: 'en' | 'ar'; appName: string; onNavigate: (page: string) => void; }

export const HomePage: React.FC<HomePageProps> = ({ lang, appName, onNavigate }) => {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="win11-card p-8 text-center mb-6 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="w-20 h-20 rounded-2xl icon-3d-cyan icon-3d flex items-center justify-center mx-auto mb-4 animate-float">
          <i className="fas fa-microphone text-3xl"></i>
        </div>
        <h1 className="text-2xl font-black text-txt-primary mb-2">{appName}</h1>
        <p className="text-txt-muted text-sm max-w-md mx-auto">{lang === 'ar' ? 'أقوى استوديو صوتي بالذكاء الاصطناعي' : 'Most Powerful AI Voice Studio'}</p>
      </div>

      {/* Quick Start */}
      <button onClick={() => onNavigate('studio')} className="w-full win11-card p-5 mb-6 flex items-center gap-4 group text-right hover:border-accent transition-all">
        <div className="w-14 h-14 rounded-2xl icon-3d-cyan icon-3d flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <i className="fas fa-play text-xl"></i>
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-txt-primary">{lang === 'ar' ? 'ابدأ التوليد' : 'Start Creating'}</h2>
          <p className="text-xs text-txt-muted mt-0.5">{lang === 'ar' ? 'اختر صوتاً واكتب نصك' : 'Choose a voice and write'}</p>
        </div>
        <i className="fas fa-arrow-left text-txt-muted group-hover:text-accent transition-colors text-sm"></i>
      </button>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: 'fa-microphone', label: lang === 'ar' ? '٢٠ مؤدي' : '20 Actors', color: 'icon-3d-blue' },
          { icon: 'fa-wand-magic-sparkles', label: lang === 'ar' ? 'مؤلف ذكي' : 'AI Writer', color: 'icon-3d-purple' },
          { icon: 'fa-sliders', label: lang === 'ar' ? '٨٠+ نبرة' : '80+ Tones', color: 'icon-3d-orange' },
          { icon: 'fa-file-lines', label: lang === 'ar' ? 'قوالب' : 'Templates', color: 'icon-3d-green' },
        ].map((f, i) => (
          <div key={i} className="win11-card p-4 flex items-center gap-3 cursor-pointer hover:border-accent transition-all" onClick={() => onNavigate('studio')}>
            <div className={`w-12 h-12 rounded-xl ${f.color} icon-3d flex items-center justify-center shrink-0`}><i className={`fas ${f.icon} text-lg`}></i></div>
            <div><p className="text-xs font-bold text-txt-primary">{f.label}</p><p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'اضغط للبدء' : 'Tap to start'}</p></div>
          </div>
        ))}
      </div>

      {/* New Features */}
      <div className="win11-card p-5 mb-6">
        <h3 className="text-sm font-bold text-txt-primary mb-3 flex items-center gap-2"><i className="fas fa-sparkles text-accent text-xs"></i>{lang === 'ar' ? 'ميزات جديدة' : 'New Features'}</h3>
        <div className="space-y-2.5">
          {[
            { icon: 'fa-bell', label: lang === 'ar' ? 'إشعارات ذكية' : 'Smart Notifications', color: 'icon-3d-yellow' },
            { icon: 'fa-layer-group', label: lang === 'ar' ? 'توليد متعدد' : 'Batch Generation', color: 'icon-3d-purple' },
            { icon: 'fa-share-nodes', label: lang === 'ar' ? 'مشاركة' : 'Sharing', color: 'icon-3d-blue' },
            { icon: 'fa-heart', label: lang === 'ar' ? 'مفضلة' : 'Favorites', color: 'icon-3d-pink' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs">
              <div className={`w-8 h-8 rounded-lg ${f.color} icon-3d flex items-center justify-center shrink-0`}><i className={`fas ${f.icon} text-xs`}></i></div>
              <span className="text-txt-secondary font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <div className="h-px w-16 bg-border mx-auto mb-3"></div>
        <p className="text-txt-muted text-xs">{lang === 'ar' ? 'تصميم' : 'Designed by'} <span className="text-accent font-bold">WAEL SAMIR</span> © 2025</p>
      </div>
    </div>
  );
};
