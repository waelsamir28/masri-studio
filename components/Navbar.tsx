import React, { useState } from 'react';

interface NavbarProps {
  lang: 'en' | 'ar';
  currentUser: string;
  isAdmin: boolean;
  onToggleLang: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenApiKey: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  navItems: { id: string; label: string; labelAr: string; icon: string; visible: boolean }[];
  appName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, currentUser, isAdmin, onToggleLang, onLogout, onOpenAdmin, onOpenApiKey, onNavigate, currentPage, navItems, appName }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-surface/80 backdrop-blur-lg border-b border-border sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 rounded-xl icon-3d-cyan icon-3d flex items-center justify-center animate-bounce-soft">
              <i className="fas fa-microphone text-sm"></i>
            </div>
            <span className="font-bold text-sm text-txt-primary hidden sm:block">{appName}</span>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.filter(item => item.visible).map(item => (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentPage === item.id ? 'bg-accent-soft text-accent' : 'text-txt-muted hover:text-txt-secondary hover:bg-surface2'}`}>
                <i className={`fas ${item.icon} text-[11px]`}></i>
                <span>{lang === 'ar' ? item.labelAr : item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            <button onClick={onToggleLang} className="h-8 px-2.5 rounded-lg win11-button text-[10px] font-bold text-txt-secondary">{lang === 'ar' ? 'EN' : 'AR'}</button>

            {/* User Menu - Windows 7 Style */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="h-8 px-2.5 rounded-lg win11-button text-xs font-bold text-accent flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center">
                  <i className="fas fa-user text-[7px] text-white"></i>
                </div>
                <span className="hidden sm:inline">{currentUser}</span>
                {isAdmin && <i className="fas fa-crown text-yellow-400 text-[9px]"></i>}
                <i className={`fas fa-chevron-down text-[8px] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Windows 7 Style Dropdown */}
              {userMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 win7-dropdown animate-fade-in z-50">
                  {isAdmin && <div className="win7-dropdown-item flex items-center gap-2" onClick={() => { onOpenAdmin(); setUserMenuOpen(false); }}><i className="fas fa-sliders w-4 text-center text-xs"></i><span>{lang === 'ar' ? 'لوحة التحكم' : 'Control Panel'}</span></div>}
                  <div className="win7-dropdown-item flex items-center gap-2" onClick={() => { onOpenApiKey(); setUserMenuOpen(false); }}><i className="fas fa-key w-4 text-center text-xs"></i><span>{lang === 'ar' ? 'مفتاح API' : 'API Key'}</span></div>
                  <div className="h-px bg-gray-300 my-1"></div>
                  <div className="win7-dropdown-item flex items-center gap-2 text-red-600" onClick={() => { onLogout(); setUserMenuOpen(false); }}><i className="fas fa-arrow-right-from-bracket w-4 text-center text-xs"></i><span>{lang === 'ar' ? 'خروج' : 'Logout'}</span></div>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-8 h-8 rounded-lg win11-button flex items-center justify-center text-txt-secondary">
              <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xs`}></i>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.filter(item => item.visible).map(item => (
                <button key={item.id} onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }} className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${currentPage === item.id ? 'bg-accent-soft text-accent' : 'text-txt-muted hover:text-txt-primary hover:bg-surface2'}`}>
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
