import React, { useState } from 'react';

interface NavbarProps {
  lang: 'en' | 'ar';
  theme: 'dark' | 'light';
  currentUser: string;
  isAdmin: boolean;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenApiKey: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  navItems: { id: string; label: string; labelAr: string; icon: string; visible: boolean }[];
  appName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang, theme, currentUser, isAdmin, onToggleTheme, onToggleLang, onLogout, onOpenAdmin, onOpenApiKey, onNavigate, currentPage, navItems, appName
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shadow-lg shadow-purple-500/20 icon-3d">
              <i className="fas fa-microphone-lines text-white text-lg"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg text-txt-primary leading-tight">{appName}</h1>
              <p className="text-[9px] text-txt-muted uppercase tracking-widest">AI Voice Studio</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.filter(item => item.visible).map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  currentPage === item.id
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-txt-muted hover:text-txt-primary hover:bg-highlight'
                }`}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{lang === 'ar' ? item.labelAr : item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-xl bg-highlight border border-border text-txt-secondary hover:text-accent hover:border-accent/30 transition-all flex items-center justify-center"
              title={theme === 'dark' ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="h-9 px-3 rounded-xl bg-highlight border border-border text-[11px] font-bold text-txt-secondary hover:text-accent hover:border-accent/30 transition-all"
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="h-9 px-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-accent/20 text-accent text-xs font-bold flex items-center gap-2 hover:bg-accent/20 transition-all">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <i className="fas fa-user text-[8px] text-white"></i>
                </div>
                <span className="hidden sm:inline">{currentUser}</span>
                {isAdmin && <i className="fas fa-crown text-yellow-500 text-[10px]"></i>}
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-2 w-48 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-2xl">
                {isAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-txt-secondary hover:text-accent hover:bg-accent/5 transition-all"
                  >
                    <i className="fas fa-sliders w-4 text-center"></i>
                    <span>{lang === 'ar' ? 'لوحة التحكم' : 'Control Panel'}</span>
                  </button>
                )}
                <button
                  onClick={onOpenApiKey}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-txt-secondary hover:text-accent hover:bg-accent/5 transition-all"
                >
                  <i className="fas fa-key w-4 text-center"></i>
                  <span>{lang === 'ar' ? 'مفتاح API' : 'API Key'}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/5 transition-all"
                >
                  <i className="fas fa-sign-out-alt w-4 text-center"></i>
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-highlight border border-border text-txt-secondary flex items-center justify-center"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-down">
            <div className="flex flex-col gap-1">
              {navItems.filter(item => item.visible).map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                    currentPage === item.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-txt-muted hover:text-txt-primary hover:bg-highlight'
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center`}></i>
                  <span>{lang === 'ar' ? item.labelAr : item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
