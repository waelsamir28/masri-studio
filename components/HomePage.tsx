import React from 'react';

interface HomePageProps {
  lang: 'en' | 'ar';
  bannerUrl: string;
  appName: string;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ lang, bannerUrl, appName, onNavigate }) => {
  return (
    <div className="animate-fade-in">
      {/* Banner Section */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-border shadow-2xl">
        {bannerUrl ? (
          <img 
            src={bannerUrl} 
            alt="Banner" 
            className="w-full h-48 sm:h-64 md:h-80 object-cover"
          />
        ) : (
          <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              {/* Floating Music Notes */}
              <div className="absolute top-8 left-[15%] text-violet-300/40 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>
                <i className="fas fa-music"></i>
              </div>
              <div className="absolute top-16 right-[20%] text-purple-300/40 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>
                <i className="fas fa-headphones"></i>
              </div>
              <div className="absolute bottom-12 left-[30%] text-blue-300/40 text-4xl animate-float" style={{ animationDelay: '2s' }}>
                <i className="fas fa-microphone-lines"></i>
              </div>
              <div className="absolute bottom-8 right-[15%] text-indigo-300/40 text-2xl animate-float" style={{ animationDelay: '0.8s' }}>
                <i className="fas fa-waveform-lines"></i>
              </div>
              
              {/* Waveform decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center gap-[2px] opacity-20">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-violet-500 to-purple-300 rounded-full"
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Banner Content */}
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
              <div className="flex items-center gap-2 mt-4">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-violet-400"></div>
                <span className="text-violet-300 text-[10px] uppercase tracking-[0.3em]">Premium AI Voice</span>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-violet-400"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay for readability */}
        {!bannerUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>}
      </div>

      {/* Quick Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'fa-microphone-lines', label: lang === 'ar' ? '٢٠ مؤدي صوتي' : '20 Voice Actors', color: 'from-violet-500 to-purple-600', desc: lang === 'ar' ? 'أصوات متنوعة' : 'Diverse voices' },
          { icon: 'fa-wand-magic-sparkles', label: lang === 'ar' ? 'مؤلف سحري' : 'Magic Writer', color: 'from-blue-500 to-cyan-600', desc: lang === 'ar' ? 'كتابة بالذكاء الاصطناعي' : 'AI Writing' },
          { icon: 'fa-sliders', label: lang === 'ar' ? '٨٠+ نبرة' : '80+ Tones', color: 'from-amber-500 to-orange-600', desc: lang === 'ar' ? 'تحكم كامل' : 'Full control' },
          { icon: 'fa-download', label: lang === 'ar' ? 'تحميل مباشر' : 'Direct Download', color: 'from-emerald-500 to-green-600', desc: lang === 'ar' ? 'جودة عالية' : 'High quality' },
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
