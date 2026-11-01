import React, { useState, useEffect } from 'react';
import { VoiceForm } from './components/SongForm'; 
import { ResultsView } from './components/ResultsView';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel, AppSettings } from './components/AdminPanel';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { SplashScreen } from './components/SplashScreen';
import { AudioPlayerModal } from './components/AudioPlayerModal';
import { InstallPrompt } from './components/InstallPrompt';
import { AppInfoModal } from './components/AppInfoModal';
import { ToastContainer } from './components/ToastContainer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AIAssistant } from './components/AIAssistant';
import { VoiceCloningModal } from './components/VoiceCloningModal';
import { Dashboard } from './components/Dashboard';
import { TeamWorkspace } from './components/TeamWorkspace';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { GeneratedSpeech, GenerationState, VoicePreset, VoiceActor, ClonedVoice, Folder } from './types';
import { generateSpeech } from './services/geminiService';
import { requestNotificationPermission, showBrowserNotification, addToast, playNotificationSound } from './services/notificationService';

const THEMES: Record<string, { name: string; nameAr: string; class: string }> = {
  ocean: { name: 'Ocean Deep', nameAr: 'محيط عميق', class: '' },
  warm: { name: 'Warm Sunset', nameAr: 'غروب دافئ', class: 'theme-warm' },
  forest: { name: 'Forest Night', nameAr: 'غابة ليلية', class: 'theme-forest' },
  neon: { name: 'Neon Night', nameAr: 'نيون ليلي', class: 'theme-neon' },
  light: { name: 'Light Mode', nameAr: 'الوضع النهاري', class: 'theme-light' },
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
    { id: 'dashboard', label: 'Dashboard', labelAr: 'التحكم', icon: 'fa-chart-line', visible: true },
  ]
};

const applyTheme = (themeKey: string) => {
  document.body.className = '';
  const cls = THEMES[themeKey]?.class;
  if (cls) document.body.classList.add(cls);
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
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
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [playingSpeech, setPlayingSpeech] = useState<GeneratedSpeech | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // New features state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showVoiceCloning, setShowVoiceCloning] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

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
    
    const savedClonedVoices = localStorage.getItem('masri-cloned-voices');
    if (savedClonedVoices) { try { setClonedVoices(JSON.parse(savedClonedVoices)); } catch(e) {} }
    const savedFolders = localStorage.getItem('masri-folders');
    if (savedFolders) { try { setFolders(JSON.parse(savedFolders)); } catch(e) {} }
    
    if (savedUser) requestNotificationPermission();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', settings.accentColor);
    document.documentElement.style.setProperty('--color-accent-dim', settings.accentColor);
    document.documentElement.style.setProperty('--color-accent-soft', settings.accentColor + '1F');
    document.documentElement.style.setProperty('--color-accent-glow', settings.accentColor + '26');
  }, [settings.accentColor]);

  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  useEffect(() => { if (history.length > 0) localStorage.setItem('masri-history', JSON.stringify(history.slice(0, 100))); }, [history]);
  useEffect(() => { localStorage.setItem('masri-favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('masri-cloned-voices', JSON.stringify(clonedVoices)); }, [clonedVoices]);
  useEffect(() => { localStorage.setItem('masri-folders', JSON.stringify(folders)); }, [folders]);
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
      const newSpeech: GeneratedSpeech = { id: Date.now().toString(), text, actor, preset, customTone: customTone || undefined, audioUrl, timestamp: Date.now() };
      setHistory(prev => [newSpeech, ...prev]);
      setStatus(GenerationState.COMPLETED);
      setPlayingSpeech(newSpeech); // Show audio player modal
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
  const handleCloneVoice = (voice: ClonedVoice) => { setClonedVoices(prev => [voice, ...prev]); };
  const handleAITextUse = (text: string) => { setCurrentPage('studio'); addToast('info', lang === 'ar' ? 'استخدم النص في الاستوديو' : 'Use text in studio', text.substring(0, 30) + '...'); };

  const getUsers = () => {
    const u = localStorage.getItem('masri-users');
    return u ? JSON.parse(u) : [];
  };

  const stats = {
    members: getUsers().length + 1, // +1 for admin
    generations: history.length,
    favorites: favorites.length,
  };

  // Show Splash Screen first
  if (showSplash) {
    return <SplashScreen appName={settings.appName} onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} lang={lang} />;
  if (showAdmin && isAdmin) return <AdminPanel lang={lang} settings={settings} onSaveSettings={handleSaveSettings} onClose={() => setShowAdmin(false)} onLogout={handleLogout} />;

  return (
    <div className={`min-h-screen flex flex-col relative ${lang === 'ar' ? 'dir-rtl' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <ToastContainer />
      <ApiKeyModal isOpen={showApiKey} onClose={() => setShowApiKey(false)} lang={lang} />
      <AudioPlayerModal speech={playingSpeech} onClose={() => setPlayingSpeech(null)} lang={lang} />
      <AppInfoModal isOpen={showAppInfo} onClose={() => setShowAppInfo(false)} lang={lang} stats={stats} />
      <InstallPrompt lang={lang} />
      
      {/* New Feature Modals */}
      {showAIAssistant && <AIAssistant lang={lang} onClose={() => setShowAIAssistant(false)} onUseText={handleAITextUse} />}
      {showVoiceCloning && <VoiceCloningModal lang={lang} onClose={() => setShowVoiceCloning(false)} onClone={handleCloneVoice} />}
      {showTeam && <TeamWorkspace lang={lang} onClose={() => setShowTeam(false)} />}
      {showSubscription && <SubscriptionPlans lang={lang} onClose={() => setShowSubscription(false)} />}

      <Navbar lang={lang} currentUser={currentUser} isAdmin={isAdmin} onToggleLang={toggleLang} onLogout={handleLogout} onOpenAdmin={() => setShowAdmin(true)} onOpenApiKey={() => setShowApiKey(true)} onNavigate={setCurrentPage} currentPage={currentPage} navItems={settings.navItems} appName={settings.appName} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 relative z-10 pb-24">
        {currentPage === 'home' && <HomePage lang={lang} appName={settings.appName} onNavigate={setCurrentPage} />}
        {currentPage === 'studio' && <div className="w-full max-w-2xl mx-auto animate-fade-in"><VoiceForm onSubmit={handleGenerate} isLoading={status === GenerationState.GENERATING} lang={lang} onBatchGenerated={handleBatchGenerated} /></div>}
        {currentPage === 'history' && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl icon-3d-cyan icon-3d flex items-center justify-center"><i className="fas fa-clock-rotate-left"></i></div><div><h2 className="text-base font-bold text-txt-primary">{lang === 'ar' ? 'السجل' : 'History'}</h2><p className="text-[10px] text-txt-muted">{lang === 'ar' ? `${history.length} تسجيل` : `${history.length} recordings`}</p></div></div>
            <ResultsView history={history} onDelete={handleDelete} lang={lang} favorites={favorites} onToggleFavorite={toggleFavorite} />
            {history.length === 0 && <div className="win11-card p-10 text-center"><div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4"><i className="fas fa-inbox text-txt-muted text-2xl"></i></div><p className="text-txt-muted text-sm mb-4">{lang === 'ar' ? 'لا توجد تسجيلات' : 'No recordings'}</p><button onClick={() => setCurrentPage('studio')} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-700 text-white text-sm font-bold hover:scale-105 transition-transform"><i className="fas fa-plus ml-2"></i>{lang === 'ar' ? 'تسجيل جديد' : 'New Recording'}</button></div>}
          </div>
        )}
        {currentPage === 'library' && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl icon-3d-pink icon-3d flex items-center justify-center"><i className="fas fa-book"></i></div><div><h2 className="text-base font-bold text-txt-primary">{lang === 'ar' ? 'مكتبتي' : 'Library'}</h2><p className="text-[10px] text-txt-muted">{favorites.length} {lang === 'ar' ? 'مفضلة' : 'favorites'}</p></div></div>
            {favorites.length > 0 ? <ResultsView history={history.filter(h => favorites.includes(h.id))} onDelete={handleDelete} lang={lang} favorites={favorites} onToggleFavorite={toggleFavorite} /> : <div className="win11-card p-10 text-center"><div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4"><i className="fas fa-book-open text-txt-muted text-2xl"></i></div><p className="text-txt-muted text-sm">{lang === 'ar' ? 'اضغط القلب لإضافة تسجيلات' : 'Press heart to add recordings'}</p></div>}
          </div>
        )}
        {currentPage === 'dashboard' && (
          <Dashboard lang={lang} history={history} favorites={favorites} folders={folders} clonedVoices={clonedVoices} onNavigate={setCurrentPage} onToggleFavorite={toggleFavorite} onDelete={handleDelete} onPlayAudio={setPlayingSpeech} />
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
        {/* AI Assistant Button */}
        <button onClick={() => setShowAIAssistant(true)} className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-xl shadow-purple-500/30 hover:scale-110 transition-transform animate-glow-pulse" title={lang === 'ar' ? 'المساعد الذكي' : 'AI Assistant'} style={{ boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
          <i className="fas fa-robot text-lg"></i>
        </button>
        {/* Voice Cloning Button */}
        <button onClick={() => setShowVoiceCloning(true)} className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-xl shadow-pink-500/30 hover:scale-110 transition-transform" title={lang === 'ar' ? 'استنساخ صوت' : 'Voice Cloning'}>
          <i className="fas fa-fingerprint text-lg"></i>
        </button>
        {/* App Info Button */}
        <button onClick={() => setShowAppInfo(true)} className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/30 hover:scale-110 transition-transform fab-button" title={lang === 'ar' ? 'معلومات التطبيق' : 'App Info'}>
          <i className="fas fa-info text-lg"></i>
        </button>
      </div>

      {/* Quick Action Bar - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-primary via-primary/98 to-primary/90 backdrop-blur-xl border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-around">
          <button onClick={() => setShowSubscription(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-surface2/50 transition-all">
            <i className="fas fa-crown text-yellow-400 text-sm"></i>
            <span className="text-[8px] font-bold text-txt-muted">{lang === 'ar' ? 'الاشتراك' : 'Subscribe'}</span>
          </button>
          <button onClick={() => setShowTeam(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-surface2/50 transition-all">
            <i className="fas fa-users text-blue-400 text-sm"></i>
            <span className="text-[8px] font-bold text-txt-muted">{lang === 'ar' ? 'الفريق' : 'Team'}</span>
          </button>
          <button onClick={() => setCurrentPage('dashboard')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${currentPage === 'dashboard' ? 'bg-accent/10' : 'hover:bg-surface2/50'}`}>
            <i className="fas fa-chart-line text-accent text-sm"></i>
            <span className="text-[8px] font-bold text-accent">{lang === 'ar' ? 'التحكم' : 'Dashboard'}</span>
          </button>
          <button onClick={() => setCurrentPage('studio')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${currentPage === 'studio' ? 'bg-accent/10' : 'hover:bg-surface2/50'}`}>
            <i className="fas fa-microphone text-green-400 text-sm"></i>
            <span className="text-[8px] font-bold text-txt-muted">{lang === 'ar' ? 'الاستوديو' : 'Studio'}</span>
          </button>
          <button onClick={() => setCurrentPage('home')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${currentPage === 'home' ? 'bg-accent/10' : 'hover:bg-surface2/50'}`}>
            <i className="fas fa-house text-cyan-400 text-sm"></i>
            <span className="text-[8px] font-bold text-txt-muted">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>
        </div>
      </div>

      {currentPage !== 'home' && <footer className="border-t border-border mt-8 py-4 text-center relative z-10"><p className="text-txt-muted text-xs">{lang === 'ar' ? 'تصميم' : 'Designed by'} <span className="text-cyan-400 font-bold">WAEL SAMIR</span> © 2025</p></footer>}
    </div>
  );
};

export default App;
