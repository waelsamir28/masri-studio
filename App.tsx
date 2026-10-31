import React, { useState, useEffect } from 'react';
import { VoiceForm } from './components/SongForm'; 
import { ResultsView } from './components/ResultsView';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel, AppSettings } from './components/AdminPanel';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { GeneratedSpeech, GenerationState, VoicePreset, VoiceActor } from './types';
import { generateSpeech } from './services/geminiService';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#8b5cf6',
  bannerUrl: '/banner.jpg',
  showBanner: true,
  buttonStyle: '3d',
  fontSize: 'medium',
  appName: 'MASRI STUDIO',
  appDescription: 'ستوديو مصر للصوتيات',
  navItems: [
    { id: 'home', label: 'Home', labelAr: 'الرئيسية', icon: 'fa-home', visible: true },
    { id: 'studio', label: 'Studio', labelAr: 'الاستوديو', icon: 'fa-microphone-lines', visible: true },
    { id: 'history', label: 'History', labelAr: 'السجل', icon: 'fa-clock-rotate-left', visible: true },
    { id: 'favorites', label: 'Favorites', labelAr: 'المفضلة', icon: 'fa-heart', visible: true },
  ]
};

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // App State
  const [status, setStatus] = useState<GenerationState>(GenerationState.IDLE);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load saved state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('masri-current-user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setCurrentUser(user.username);
      setIsAdmin(user.role === 'admin');
    }

    const savedSettings = localStorage.getItem('masri-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      setTheme(parsed.theme || 'dark');
      if (parsed.theme === 'light') document.body.classList.add('light-mode');
    }

    const savedLang = localStorage.getItem('masri-lang');
    if (savedLang) setLang(savedLang as 'en' | 'ar');

    const savedHistory = localStorage.getItem('masri-history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch(e) {}
    }
  }, []);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', settings.accentColor);
    document.documentElement.style.setProperty('--color-accent-dim', settings.accentColor);
    document.documentElement.style.setProperty('--color-accent-glow', settings.accentColor + '25');
  }, [settings.accentColor]);

  // Apply font size
  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('masri-history', JSON.stringify(history.slice(0, 50)));
    }
  }, [history]);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    setIsAdmin(username === 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('masri-current-user');
    setIsAuthenticated(false);
    setCurrentUser('');
    setIsAdmin(false);
    setShowAdmin(false);
    setCurrentPage('home');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('masri-settings', JSON.stringify({ ...settings, theme: newTheme }));
    
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('masri-lang', newLang);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setTheme(newSettings.theme);
    localStorage.setItem('masri-settings', JSON.stringify(newSettings));
    
    if (newSettings.theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  const handleGenerate = async (text: string, actor: VoiceActor, preset: VoicePreset | null, customTone: string) => {
    setStatus(GenerationState.GENERATING);
    setErrorMessage(null);
    try {
      const audioUrl = await generateSpeech(text, actor, preset, customTone);
      const newSpeech: GeneratedSpeech = {
        id: Date.now().toString(),
        text,
        actor,
        preset,
        customTone: customTone || undefined,
        audioUrl,
        timestamp: Date.now()
      };
      setHistory(prev => [newSpeech, ...prev]);
      setStatus(GenerationState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setStatus(GenerationState.ERROR);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setTimeout(() => setErrorMessage(null), 7000);
    }
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Show Login Screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} lang={lang} />;
  }

  // Show Admin Panel
  if (showAdmin && isAdmin) {
    return (
      <AdminPanel
        lang={lang}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClose={() => setShowAdmin(false)}
        onLogout={handleLogout}
      />
    );
  }

  // Main App Layout
  return (
    <div className={`min-h-screen flex flex-col ${lang === 'ar' ? 'dir-rtl' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Error Banner */}
      {errorMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg animate-bounce-in-custom">
          <div className="glass border-red-500/50 text-red-100 px-4 py-3 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] backdrop-blur-md flex items-center gap-3">
            <i className="fas fa-circle-exclamation text-red-400 text-xl icon-3d"></i>
            <div className="flex-1 text-xs font-bold">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-white/40 hover:text-white transition-colors">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        lang={lang}
        theme={theme}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onToggleTheme={toggleTheme}
        onToggleLang={toggleLang}
        onLogout={handleLogout}
        onOpenAdmin={() => setShowAdmin(true)}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        navItems={settings.navItems}
        appName={settings.appName}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        
        {/* Home Page */}
        {currentPage === 'home' && (
          <HomePage
            lang={lang}
            bannerUrl={settings.bannerUrl}
            appName={settings.appName}
            onNavigate={setCurrentPage}
          />
        )}

        {/* Studio Page */}
        {currentPage === 'studio' && (
          <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <VoiceForm 
              onSubmit={handleGenerate} 
              isLoading={status === GenerationState.GENERATING} 
              lang={lang}
            />
          </div>
        )}

        {/* History Page */}
        {currentPage === 'history' && (
          <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <i className="fas fa-clock-rotate-left text-accent"></i>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-txt-primary">
                  {lang === 'ar' ? 'السجل' : 'History'}
                </h2>
                <p className="text-xs text-txt-muted">
                  {lang === 'ar' ? `${history.length} تسجيل` : `${history.length} recordings`}
                </p>
              </div>
            </div>
            <ResultsView history={history} onDelete={handleDelete} lang={lang} />
            {history.length === 0 && (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-highlight flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-inbox text-txt-muted text-2xl"></i>
                </div>
                <p className="text-txt-muted text-sm">
                  {lang === 'ar' ? 'لا توجد تسجيلات بعد' : 'No recordings yet'}
                </p>
                <button
                  onClick={() => setCurrentPage('studio')}
                  className="mt-4 px-6 py-2 rounded-xl bg-accent/10 text-accent text-sm font-bold hover:bg-accent/20 transition-all"
                >
                  <i className="fas fa-plus ml-2"></i>
                  {lang === 'ar' ? 'إنشاء تسجيل جديد' : 'Create New Recording'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Favorites Page */}
        {currentPage === 'favorites' && (
          <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <i className="fas fa-heart text-accent"></i>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-txt-primary">
                  {lang === 'ar' ? 'المفضلة' : 'Favorites'}
                </h2>
                <p className="text-xs text-txt-muted">
                  {lang === 'ar' ? 'تسجيلاتك المحفوظة' : 'Your saved recordings'}
                </p>
              </div>
            </div>
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-highlight flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart text-red-400/50 text-2xl"></i>
              </div>
              <p className="text-txt-muted text-sm">
                {lang === 'ar' ? 'اضغط على القلب في أي تسجيل لإضافته للمفضلة' : 'Press the heart on any recording to add it to favorites'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {currentPage === 'home' ? null : (
        <footer className="border-t border-border mt-8 py-4 text-center">
          <p className="text-txt-muted text-xs">
            {lang === 'ar' ? 'تصميم وتطوير' : 'Designed & Developed by'}
            <span className="text-accent font-bold mx-1">WAEL SAMIR</span>
            <span>© 2025</span>
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;
