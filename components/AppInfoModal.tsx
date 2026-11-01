import React from 'react';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  stats: { members: number; generations: number; favorites: number };
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({ isOpen, onClose, lang, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative win11-card p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl icon-3d-cyan icon-3d flex items-center justify-center animate-float">
              <i className="fas fa-microphone text-2xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-txt-primary">MASRI Studio</h3>
              <p className="text-[10px] text-txt-muted">v2.0.0</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg win11-button flex items-center justify-center text-txt-muted hover:text-txt-primary">
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-txt-muted mb-6 leading-relaxed" dir="rtl">
          {lang === 'ar' 
            ? 'أقوى استوديو صوتي بالذكاء الاصطناعي في مصر. ولّد أصواتاً واقعية بأكثر من ٢٠ مؤدي و٨٠+ نبرة مختلفة.'
            : 'The most powerful AI voice studio in Egypt. Generate realistic voices with 20+ actors and 80+ tones.'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-xl bg-surface2/50 border border-border">
            <div className="text-2xl font-bold text-cyan-400">{stats.members}</div>
            <div className="text-[9px] text-txt-muted mt-1">{lang === 'ar' ? 'عضو' : 'Members'}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface2/50 border border-border">
            <div className="text-2xl font-bold text-purple-400">{stats.generations}</div>
            <div className="text-[9px] text-txt-muted mt-1">{lang === 'ar' ? 'توليد' : 'Generations'}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface2/50 border border-border">
            <div className="text-2xl font-bold text-pink-400">{stats.favorites}</div>
            <div className="text-[9px] text-txt-muted mt-1">{lang === 'ar' ? 'مفضلة' : 'Favorites'}</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-txt-primary mb-2">{lang === 'ar' ? 'المميزات' : 'Features'}</h4>
          {[
            { icon: 'fa-microphone', label: lang === 'ar' ? '٢٠ مؤدي صوتي' : '20 Voice Actors', color: 'icon-3d-blue' },
            { icon: 'fa-wand-magic-sparkles', label: lang === 'ar' ? 'مؤلف ذكي' : 'AI Writer', color: 'icon-3d-purple' },
            { icon: 'fa-sliders', label: lang === 'ar' ? '٨٠+ نبرة' : '80+ Tones', color: 'icon-3d-orange' },
            { icon: 'fa-layer-group', label: lang === 'ar' ? 'توليد متعدد' : 'Batch Mode', color: 'icon-3d-green' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs">
              <div className={`w-8 h-8 rounded-lg ${f.color} icon-3d flex items-center justify-center shrink-0`}>
                <i className={`fas ${f.icon} text-xs`}></i>
              </div>
              <span className="text-txt-secondary">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-[10px] text-txt-muted">{lang === 'ar' ? 'تصميم وتطوير' : 'Designed by'} <span className="text-cyan-400 font-bold">WAEL SAMIR</span> © 2025</p>
        </div>
      </div>
    </div>
  );
};
