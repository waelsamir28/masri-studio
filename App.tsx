import React, { useState, useEffect } from 'react';
import { VoiceForm } from './components/SongForm'; 
import { ResultsView } from './components/ResultsView';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel, AppSettings } from './components/AdminPanel';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ToastContainer } from './components/ToastContainer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GeneratedSpeech, GenerationState, VoicePreset, VoiceActor } from './types';
import { generateSpeech } from './services/geminiService';
import { 
  requestNotificationPermission, 
  showBrowserNotification, 
  addToast, 
  playNotificationSound 
} from './services/notificationService';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accentColor: '#3b82f6',
  bannerUrl: '',
  showBanner: true,
  buttonStyle: 'soft',
  fontSize: 'medium',
  appName: 'MASRI Studio',
  appDescription: 'ستوديو مصر',
  navItems: [
    { id: 'home', label: 'Home', labelAr: 'الرئيسية', icon: 'fa-house', visible: true },
    { id: 'studio', label: 'Studio', labelAr: 'الاستوديو', icon: 'fa-microphone', visible: true },
    { id: 'history', label: 'History', labelAr: 'السجل', icon: 'fa-clock-rotate-left', visible: true },
    { id: 'library', label: 'Library', labelAr: 'المكتبة', icon: 'fa-book', visible: true },
  ]
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<GenerationState>(GenerationState.IDLE);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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
      setTheme(parsed.theme || 'light');
      if (parsed.theme === 'dark') document.body.classList.add('dark-mode');
    }

    const savedLang = localStorage.getItem('masri-lang');
    if (savedLang) setLang(savedLang as 'en' | 'ar');

    const savedHistory = localStorage.getItem('masri-history');
    if (savedHistory) { try { setHistory(JSON.parse(savedHistory)); } catch(e) {} }

    const savedFavorites = localStorage.getItem('masri-favorites');
    if (savedFavorites) { try { setFavorites(JSON.parse(savedFavorites)); } catch(e) {} }

    if (savedUser) requestNotificationPermission();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', settings.accentColor);
    document.documentElement.style.setProperty('--color-accent-dim', settings.accentColor);
    document.documentElement.style.setProperty('--color-accent-soft', settings.accentColor + '14');
    document.documentElement.style.setProperty('--color-accent-glow', settings.accentColor + '12');
  }, [settings.accentColor]);

  useEffect(() => {
    const sizes = { small: '14px', medium: '15px', large: '17px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  useEffect(() => {
    if (history.length > 0) localStorage.setItem('masri-history', JSON.stringify(history.slice(0, 100)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('masri-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed:', err));
    }
  }, []);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    setIsAdmin(username === 'admin');
    requestNotificationPermission();
    addToast('success', lang === 'ar' ? 'مرحباً!' : 'Welcome!', lang === 'ar' ? `أهلاً ${username}` : `Welcome ${username}`);
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
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('masri-settings', JSON.stringify({ ...settings, theme: newTheme }));
    if (newTheme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
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
    if (newSettings.theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleGenerate = async (text: string, actor: VoiceActor, preset: VoicePreset | null, customTone: string) => {
    setStatus(GenerationState.GENERATING);
    setErrorMessage(null);
    addToast('info', lang === 'ar' ? 'جاري التوليد...' : 'Generating...', lang === 'ar' ? `يتم توليد الصوت بصوت ${lang === 'ar' ? actor.nameAr : actor.name}` : `Generating with ${actor.name}`);
    try {
      const startTime = Date.now();
      const audioUrl = await generateSpeech(text, actor, preset, customTone);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const newSpeech: GeneratedSpeech = { id: Date.now().toString(), text, actor, preset, customTone: customTone || undefined, audioUrl, timestamp: Date.now() };
      setHistory(prev => [newSpeech, ...prev]);
      setStatus(GenerationState.COMPLETED);
      addToast('success', lang === 'ar' ? 'تم التوليد ✓' : 'Done ✓', lang === 'ar' ? `تم في ${elapsed} ثانية` : `Completed in ${elapsed}s`);
      showBrowserNotification('MASRI Studio', lang === 'ar' ? `تم توليد الصوت في ${elapsed} ثانية` : `Voice generated in ${elapsed}s`);
      playNotificationSound('success');
    } catch (err: any) {
      console.error(err);
      setStatus(GenerationState.ERROR);
      setErrorMessage(err.message || "An unexpected error occurred.");
      addToast('error', lang === 'ar' ? 'خطأ!' : 'Error!', err.message || 'Generation failed');
      playNotificationSound('error');
      setTimeout(() => setErrorMessage(null), 7000);
    }
  };

  const handleBatchGenerated = (speeches: GeneratedSpeech[]) => {
    setHistory(prev => [...speeches, ...prev]);
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    setFavorites(prev => prev.filter(f => f !== id));
  };

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} lang={lang} />;

  if (showAdmin && isAdmin) {
    return <AdminPanel lang={lang} settings={settings} onSaveSettings={handleSaveSettings} onClose={() => setShowAdmin(false)} onLogout={handleLogout} />;
  }

  return (
    <div className={`min-h-screen flex flex-col relative ${lang === 'ar' ? 'dir-rtl' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <ToastContainer />
      
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-slide-up">
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl flex items-center gap-3">
            <i className="fas fa-circle-exclamation text-red-500"></i>
            <div className="flex-1 text-xs font-medium">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600"><i className="fas fa-times text-xs"></i></button>
          </div>
        </div>
      )}

      <Navbar lang={lang} theme={theme} currentUser={currentUser} isAdmin={isAdmin} onToggleTheme={toggleTheme} onToggleLang={toggleLang} onLogout={handleLogout} onOpenAdmin={() => setShowAdmin(true)} onOpenApiKey={() => setShowApiKey(true)} onNavigate={setCurrentPage} currentPage={currentPage} navItems={settings.navItems} appName={settings.appName} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 relative z-10">
        {currentPage === 'home' && <HomePage lang={lang} bannerUrl={settings.bannerUrl} appName={settings.appName} onNavigate={setCurrentPage} />}
        {currentPage === 'studio' && <div className="w-full max-w-2xl mx-auto animate-fade-in"><VoiceForm onSubmit={handleGenerate} isLoading={status === GenerationState.GENERATING} lang={lang} onBatchGenerated={handleBatchGenerated} /></div>}
        {currentPage === 'history' && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl icon-soft flex items-center justify-center"><i className="fas fa-clock-rotate-left"></i></div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-txt-primary">{lang === 'ar' ? 'السجل' : 'History'}</h2>
                <p className="text-xs text-txt-muted">{lang === 'ar' ? `${history.length} تسجيل` : `${history.length} recordings`}</p>
              </div>
            </div>
            <ResultsView history={history} onDelete={handleDelete} lang={lang} favorites={favorites} onToggleFavorite={toggleFavorite} />
            {history.length === 0 && (
              <div className="card-soft p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4"><i className="fas fa-inbox text-txt-muted text-2xl"></i></div>
                <p className="text-txt-muted text-sm mb-4">{lang === 'ar' ? 'لا توجد تسجيلات بعد' : 'No recordings yet'}</p>
                <button onClick={() => setCurrentPage('studio')} className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dim transition-all"><i className="fas fa-plus ml-2"></i>{lang === 'ar' ? 'تسجيل جديد' : 'New Recording'}</button>
              </div>
            )}
          </div>
        )}
        {currentPage === 'library' && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl icon-soft flex items-center justify-center"><i className="fas fa-book"></i></div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-txt-primary">{lang === 'ar' ? 'مكتبتي' : 'Library'}</h2>
                <p className="text-xs text-txt-muted">{lang === 'ar' ? `${favorites.length} مفضلة` : `${favorites.length} favorites`}</p>
              </div>
            </div>
            {favorites.length > 0 ? (
              <ResultsView history={history.filter(h => favorites.includes(h.id))} onDelete={handleDelete} lang={lang} favorites={favorites} onToggleFavorite={toggleFavorite} />
            ) : (
              <div className="card-soft p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4"><i className="fas fa-book-open text-txt-muted text-2xl"></i></div>
                <p className="text-txt-muted text-sm">{lang === 'ar' ? 'اضغط على القلب في أي تسجيل' : 'Press the heart icon on any recording'}</p>
                <button onClick={() => setCurrentPage('history')} className="mt-4 px-5 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-all"><i className="fas fa-clock-rotate-left ml-2"></i>{lang === 'ar' ? 'عرض السجل' : 'View History'}</button>
              </div>
            )}
          </div>
        )}
      </main>

      {currentPage !== 'home' && (
        <footer className="border-t border-border mt-8 py-4 text-center">
          <p className="text-txt-muted text-xs">{lang === 'ar' ? 'تصميم وتطوير' : 'Designed by'} <span className="text-accent font-semibold mx-1">WAEL SAMIR</span>© 2025</p>
        </footer>
      )}

      <ApiKeyModal isOpen={showApiKey} onClose={() => setShowApiKey(false)} lang={lang} />
    </div>
  );
};

export default App;
