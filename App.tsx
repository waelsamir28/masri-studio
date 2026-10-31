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
import { requestNotificationPermission, showBrowserNotification, addToast, playNotificationSound } from './services/notificationService';

const THEMES: Record<string, { name: string; nameAr: string; class: string }> = {
  ocean: { name: 'Ocean Deep', nameAr: 'محيط عميق', class: '' },
  warm: { name: 'Warm Sunset', nameAr: 'غروب دافئ', class: 'theme-warm' },
  forest: { name: 'Forest Night', nameAr: 'غابة ليلية', class: 'theme-forest' },
  neon: { name: 'Neon Night', nameAr: 'نيون ليلي', class: 'theme-neon' },
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'ocean',
  accentColor: '#06b6d4',
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

const applyTheme = (themeKey: string) => {
  document.body.className = '';
  const cls = THEMES[themeKey]?.class;
  if (cls) document.body.classList.add(cls);
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<GenerationState>(GenerationState.IDLE);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedUser = localStorage.getItem('masri-current-user');
    if (savedUser) { const user = JSON.parse(savedUser); setIsAuthenticated(true); setCurrentUser(user.username); setIsAdmin(user.role === 'admin'); }

    const savedSettings = localStorage.getItem('masri-settings');
    if (savedSettings) { const parsed = JSON.parse(savedSettings); setSettings({ ...DEFAULT_SETTINGS, ...parsed }); applyTheme(parsed.theme || 'ocean'); }

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
    document.documentElement.style.setProperty('--color-accent-soft', settings.accentColor + '1F');
    document.documentElement.style.setProperty('--color-accent-glow', settings.accentColor + '26');
  }, [settings.accentColor]);

  useEffect(() => {
    const sizes = { small: '14px', medium: '15px', large: '17px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  useEffect(() => { if (history.length > 0) localStorage.setItem('masri-history', JSON.stringify(history.slice(0, 100))); }, [history]);
  useEffect(() => { localStorage.setItem('masri-favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); } }, []);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true); setCurrentUser(username); setIsAdmin(username === 'admin');
    requestNotificationPermission();
    addToast('success', lang === 'ar' ? 'مرحباً!' : 'Welcome!', lang === 'ar' ? `أهلاً ${username}` : `Welcome ${username}`);
  };

  const handleLogout = () => { localStorage.removeItem('masri-current-user'); setIsAuthenticated(false); setCurrentUser(''); setIsAdmin(false); setShowAdmin(false); setCurrentPage('home'); };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings.theme);
    localStorage.setItem('masri-settings', JSON.stringify(newSettings));
  };

  const toggleLang = () => { const nl = lang === 'en' ? 'ar' : 'en'; setLang(nl); localStorage.setItem('masri-lang', nl); };
  const toggleFavorite = (id: string) => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); };

  const handleGenerate = async (text: string, actor: VoiceActor, preset: VoicePreset | null, customTone: string) => {
    setStatus(GenerationState.GENERATING);
    addToast('info', lang === 'ar' ? 'جاري التوليد...' : 'Generating...', lang === 'ar' ? `بصوت ${lang === 'ar' ? actor.nameAr : actor.name}` : `With ${actor.name}`);
    try {
      const t0 = Date.now();
      const audioUrl = await generateSpeech(text, actor, preset, customTone);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      setHistory(prev => [{ id: Date.now().toString(), text, actor, preset, customTone: customTone || undefined, audioUrl, timestamp: Date.now() }, ...prev]);
      setStatus(GenerationState.COMPLETED);
      addToast('success', lang === 'ar' ? 'تم ✓' : 'Done ✓', lang === 'ar' ? `في ${elapsed} ثانية` : `${elapsed}s`);
      showBrowserNotification('MASRI Studio', lang === 'ar' ? `تم في ${elapsed} ثانية` : `Done in ${elapsed}s`);
      playNotificationSound('success');
    } catch (err: any) {
      setStatus(GenerationState.ERROR);
      addToast('error', lang === 'ar' ? 'خطأ!' : 'Error!', err.message || 'Failed');
      playNotificationSound('error');
    }
  };

  const handleDelete = (id: string) => { setHistory(prev => prev.filter(i => i.id !== id)); setFavorites(prev => prev.filter(f => f !== id)); };
  const handleBatchGenerated = (speeches: GeneratedSpeech[]) => { setHistory(prev => [...speeches, ...prev]); };

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} lang={lang} />;
  if (showAdmin && isAdmin) return <AdminPanel lang={lang} settings={settings} onSaveSettings={handleSaveSettings} onClose={() => setShowAdmin(false)} onLogout={handleLogout} />;

  return (
    <div className={`min-h-screen flex flex-col relative ${lang === 'ar' ? 'dir-rtl' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <ToastContainer />
      <ApiKeyModal isOpen={showApiKey} onClose={() => setShowApiKey(false)} lang={lang} />

      <Navbar lang={lang} currentUser={currentUser} isAdmin={isAdmin} onToggleLang={toggleLang} onLogout={handleLogout} onOpenAdmin={() => setShowAdmin(true)} onOpenApiKey={() => setShowApiKey(true)} onNavigate={setCurrentPage} currentPage={currentPage} navItems={settings.navItems} appName={settings.appName} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 relative z-10">
        {currentPage === 'home' && <HomePage lang={lang} appName={settings.appName} onNavigate={setCurrentPage} />}
        {currentPage === 'studio' && <div className="w-full max-w-2xl mx-auto animate-fade-in"><VoiceForm onSubmit={handleGenerate} isLoading={status === GenerationState.GENERATING} lang={lang} onBatchGenerated={handleBatchGenerated} /></div>}
        {currentPage === 'history' && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl icon-3d-cyan icon-3d flex items-center justify-center"><i className="fas fa-clock-rotate-left"></i></div><div><h2 className="text-base font-bold text-txt-primary">{lang === 'ar' ? 'السجل' : 'History'}</h2><p className="text-[10px] text-txt-muted">{lang === 'ar' ? `${history.length} تسجيل` : `${history.length} recordings`}</p></div></div>
            <ResultsView history={history} onDelete={handleDelete} lang={lang} favorites={favorites} onToggleFavorite={toggleFavorite} />
            {history.length === 0 && <div className="card p-10 text-center"><div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4"><i className="fas fa-inbox text-txt-muted text-2xl"></i></div><p className="text-txt-muted text-sm mb-4">{lang === 'ar' ? 'لا توجد تسجيلات' : 'No recordings'}</p><button onClick={() => setCurrentPage('studio')} className="btn-primary px-5 py-2.5 text-sm"><i className="fas fa-plus ml-2"></i>{lang === 'ar' ? 'تسجيل جديد' : 'New Recording'}</button></div>}
          </div>
        )}
        {currentPage === 'library' && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl icon-3d-pink icon-3d flex items-center justify-center"><i className="fas fa-book"></i></div><div><h2 className="text-base font-bold text-txt-primary">{lang === 'ar' ? 'مكتبتي' : 'Library'}</h2><p className="text-[10px] text-txt-muted">{favorites.length} {lang === 'ar' ? 'مفضلة' : 'favorites'}</p></div></div>
            {favorites.length > 0 ? <ResultsView history={history.filter(h => favorites.includes(h.id))} onDelete={handleDelete} lang={lang} favorites={favorites} onToggleFavorite={toggleFavorite} /> : <div className="card p-10 text-center"><div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4"><i className="fas fa-book-open text-txt-muted text-2xl"></i></div><p className="text-txt-muted text-sm">{lang === 'ar' ? 'اضغط القلب لإضافة تسجيلات' : 'Press heart to add recordings'}</p></div>}
          </div>
        )}
      </main>

      {currentPage !== 'home' && <footer className="border-t border-border mt-8 py-4 text-center relative z-10"><p className="text-txt-muted text-xs">{lang === 'ar' ? 'تصميم' : 'Designed by'} <span className="text-accent font-semibold mx-1">WAEL SAMIR</span>© 2025</p></footer>}
    </div>
  );
};

export default App;
