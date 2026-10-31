import React, { useState } from 'react';

interface NavbarProps {
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
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

export const Navbar: React.FC<NavbarProps> = ({ lang, theme, currentUser, isAdmin, onToggleTheme, onToggleLang, onLogout, onOpenAdmin, onOpenApiKey, onNavigate, currentPage, navItems, appName }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-primary/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 rounded-lg icon-soft flex items-center justify-center">
              <i className="fas fa-microphone text-sm"></i>
            </div>
            <span className="font-semibold text-sm text-txt-primary hidden sm:block">{appName}</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.filter(item => item.visible).map(item => (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${currentPage === item.id ? 'bg-accent-soft text-accent' : 'text-txt-secondary hover:text-txt-primary hover:bg-surface2'}`}>
                <i className={`fas ${item.icon} text-[11px]`}></i>
                <span>{lang === 'ar' ? item.labelAr : item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            <button onClick={onToggleTheme} className="w-8 h-8 rounded-lg bg-surface2 text-txt-secondary hover:text-accent hover:bg-accent-soft transition-all flex items-center justify-center" title={theme === 'light' ? 'Dark' : 'Light'}>
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-xs`}></i>
            </button>
            <button onClick={onToggleLang} className="h-8 px-2.5 rounded-lg bg-surface2 text-[10px] font-semibold text-txt-secondary hover:text-accent hover:bg-accent-soft transition-all">{lang === 'ar' ? 'EN' : 'AR'}</button>

            {/* User Menu */}
            <div className="relative group">
              <button className="h-8 px-2.5 rounded-lg bg-accent-soft text-accent text-xs font-medium flex items-center gap-1.5 hover:bg-accent/20 transition-all">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <i className="fas fa-user text-[7px] text-white"></i>
                </div>
                <span className="hidden sm:inline">{currentUser}</span>
                {isAdmin && <i className="fas fa-crown text-amber-500 text-[9px]"></i>}
              </button>

              <div className="absolute left-0 top-full mt-1 w-44 bg-primary border border-border rounded-xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg">
                {isAdmin && <button onClick={onOpenAdmin} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-txt-secondary hover:text-accent hover:bg-accent-soft transition-all"><i className="fas fa-sliders w-4 text-center text-[11px]"></i><span>{lang === 'ar' ? 'لوحة التحكم' : 'Control Panel'}</span></button>}
                <button onClick={onOpenApiKey} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-txt-secondary hover:text-accent hover:bg-accent-soft transition-all"><i className="fas fa-key w-4 text-center text-[11px]"></i><span>{lang === 'ar' ? 'مفتاح API' : 'API Key'}</span></button>
                <div className="h-px bg-border my-1"></div>
                <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"><i className="fas fa-arrow-right-from-bracket w-4 text-center text-[11px]"></i><span>{lang === 'ar' ? 'خروج' : 'Logout'}</span></button>
              </div>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-8 h-8 rounded-lg bg-surface2 text-txt-secondary flex items-center justify-center">
              <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xs`}></i>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.filter(item => item.visible).map(item => (
                <button key={item.id} onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }} className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${currentPage === item.id ? 'bg-accent-soft text-accent' : 'text-txt-secondary hover:text-txt-primary hover:bg-surface2'}`}>
                  <i className={`fas ${item.icon} w-4 text-center text-[11px]`}></i>
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
