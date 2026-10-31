import React, { useState, useRef } from 'react';

interface AppSettings {
  theme: 'light' | 'dark';
  accentColor: string;
  bannerUrl: string;
  showBanner: boolean;
  buttonStyle: 'flat' | '3d' | 'glass' | 'neon' | 'soft';
  fontSize: 'small' | 'medium' | 'large';
  appName: string;
  appDescription: string;
  navItems: { id: string; label: string; labelAr: string; icon: string; visible: boolean }[];
}

interface AdminPanelProps {
  lang: 'en' | 'ar';
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
  onLogout: () => void;
}

const ACCENT_COLORS = [
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, settings, onSaveSettings, onClose, onLogout }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'banner' | 'navigation'>('general');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => { onSaveSettings(localSettings); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => { const result = ev.target?.result as string; setLocalSettings(prev => ({ ...prev, bannerUrl: result, showBanner: true })); }; reader.readAsDataURL(file); }
  };
  const toggleNavItem = (id: string) => { setLocalSettings(prev => ({ ...prev, navItems: prev.navItems.map(item => item.id === id ? { ...item, visible: !item.visible } : item) })); };
  const updateNavItem = (id: string, field: string, value: string) => { setLocalSettings(prev => ({ ...prev, navItems: prev.navItems.map(item => item.id === id ? { ...item, [field]: value } : item) })); };
  const removeBanner = () => { setLocalSettings(prev => ({ ...prev, bannerUrl: '', showBanner: false })); };

  const tabs = [
    { id: 'general' as const, label: lang === 'ar' ? 'عام' : 'General', icon: 'fa-gear' },
    { id: 'appearance' as const, label: lang === 'ar' ? 'المظهر' : 'Appearance', icon: 'fa-palette' },
    { id: 'banner' as const, label: lang === 'ar' ? 'البانر' : 'Banner', icon: 'fa-image' },
    { id: 'navigation' as const, label: lang === 'ar' ? 'القائمة' : 'Menu', icon: 'fa-bars' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-sliders text-sm"></i></div>
            <div><h1 className="font-semibold text-sm text-txt-primary">{lang === 'ar' ? 'لوحة التحكم' : 'Control Panel'}</h1><p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'مرحباً، المشرف' : 'Welcome, Admin'}</p></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleSave} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all btn-soft flex items-center gap-1.5 ${saved ? 'bg-emerald-500 text-white' : 'bg-accent text-white'}`}>{saved ? <><i className="fas fa-check"></i>{lang === 'ar' ? 'تم' : 'Saved'}</> : <><i className="fas fa-save"></i>{lang === 'ar' ? 'حفظ' : 'Save'}</>}</button>
            <button onClick={onClose} className="px-3 py-2 rounded-lg bg-surface2 border border-border text-xs font-medium text-txt-secondary hover:text-txt-primary transition-all flex items-center gap-1.5"><i className="fas fa-arrow-right text-[10px]"></i>{lang === 'ar' ? 'العودة' : 'Back'}</button>
            <button onClick={onLogout} className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-500 text-xs font-medium hover:bg-red-100 transition-all flex items-center gap-1.5"><i className="fas fa-arrow-right-from-bracket text-[10px]"></i>{lang === 'ar' ? 'خروج' : 'Logout'}</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <div className="card-soft p-2 space-y-1 sticky top-20">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-accent-soft text-accent' : 'text-txt-muted hover:text-txt-secondary hover:bg-surface2'}`}>
                <i className={`fas ${tab.icon} w-4 text-center text-[10px]`}></i><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="card-soft p-5 animate-fade-in space-y-5">
              <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2"><div className="w-7 h-7 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-gear text-xs"></i></div>{lang === 'ar' ? 'الإعدادات العامة' : 'General'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-txt-secondary mb-1.5">{lang === 'ar' ? 'اسم التطبيق' : 'App Name'}</label><input type="text" value={localSettings.appName} onChange={(e) => setLocalSettings(prev => ({ ...prev, appName: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg input-soft text-sm" /></div>
                <div><label className="block text-xs font-medium text-txt-secondary mb-1.5">{lang === 'ar' ? 'الوصف' : 'Description'}</label><input type="text" value={localSettings.appDescription} onChange={(e) => setLocalSettings(prev => ({ ...prev, appDescription: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg input-soft text-sm" /></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-2">{lang === 'ar' ? 'حجم الخط' : 'Font Size'}</label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button key={size} onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: size }))} className={`flex-1 py-2.5 rounded-lg border text-xs font-medium transition-all ${localSettings.fontSize === size ? 'bg-accent border-accent text-white' : 'border-border text-txt-muted hover:border-accent/30'}`}>{lang === 'ar' ? (size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير') : size.charAt(0).toUpperCase() + size.slice(1)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-2">{lang === 'ar' ? 'الوضع' : 'Theme'}</label>
                <div className="flex gap-2">
                  <button onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'light' }))} className={`flex-1 py-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${localSettings.theme === 'light' ? 'bg-accent border-accent text-white' : 'border-border text-txt-muted'}`}><i className="fas fa-sun"></i>{lang === 'ar' ? 'فاتح' : 'Light'}</button>
                  <button onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'dark' }))} className={`flex-1 py-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${localSettings.theme === 'dark' ? 'bg-accent border-accent text-white' : 'border-border text-txt-muted'}`}><i className="fas fa-moon"></i>{lang === 'ar' ? 'داكن' : 'Dark'}</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card-soft p-5 animate-fade-in space-y-6">
              <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2"><div className="w-7 h-7 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-palette text-xs"></i></div>{lang === 'ar' ? 'المظهر والألوان' : 'Appearance'}</h2>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-2">{lang === 'ar' ? 'اللون الرئيسي' : 'Accent Color'}</label>
                <div className="grid grid-cols-5 gap-2">
                  {ACCENT_COLORS.map(color => (
                    <button key={color.value} onClick={() => setLocalSettings(prev => ({ ...prev, accentColor: color.value }))} className={`relative aspect-square rounded-xl ${color.bg} transition-all hover:scale-105 ${localSettings.accentColor === color.value ? 'ring-2 ring-accent ring-offset-2 scale-105' : ''}`} title={color.name}>
                      {localSettings.accentColor === color.value && <i className="fas fa-check text-white absolute inset-0 flex items-center justify-center drop-shadow"></i>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-2">{lang === 'ar' ? 'نمط الأزرار' : 'Button Style'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['flat', '3d', 'glass', 'neon', 'soft'] as const).map(style => (
                    <button key={style} onClick={() => setLocalSettings(prev => ({ ...prev, buttonStyle: style }))} className={`py-2.5 rounded-lg border text-xs font-medium transition-all ${localSettings.buttonStyle === style ? 'bg-accent border-accent text-white' : 'border-border text-txt-muted hover:border-accent/30'}`}>{style.charAt(0).toUpperCase() + style.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banner' && (
            <div className="card-soft p-5 animate-fade-in space-y-5">
              <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2"><div className="w-7 h-7 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-image text-xs"></i></div>{lang === 'ar' ? 'البانر' : 'Banner'}</h2>
              <div className="relative rounded-xl overflow-hidden border border-border aspect-[3/1] bg-surface2">
                {localSettings.bannerUrl ? <img src={localSettings.bannerUrl} alt="Banner" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-txt-muted gap-2"><i className="fas fa-image text-3xl opacity-30"></i><p className="text-xs">{lang === 'ar' ? 'لا يوجد بانر' : 'No banner'}</p></div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 rounded-lg bg-accent text-white text-xs font-medium btn-soft flex items-center gap-1.5"><i className="fas fa-upload text-[10px]"></i>{lang === 'ar' ? 'رفع بانر' : 'Upload'}</button>
                {localSettings.bannerUrl && <button onClick={removeBanner} className="px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-500 text-xs font-medium hover:bg-red-100 transition-all flex items-center gap-1.5"><i className="fas fa-trash text-[10px]"></i>{lang === 'ar' ? 'حذف' : 'Remove'}</button>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="card-soft p-5 animate-fade-in space-y-4">
              <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2"><div className="w-7 h-7 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-bars text-xs"></i></div>{lang === 'ar' ? 'القائمة' : 'Navigation'}</h2>
              <p className="text-xs text-txt-muted">{lang === 'ar' ? 'إظهار/إخفاء العناصر وتغيير الأيقونات' : 'Toggle visibility and change icons'}</p>
              <div className="space-y-2">
                {localSettings.navItems.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.visible ? 'border-border bg-surface2' : 'border-border/50 opacity-50'}`}>
                    <button onClick={() => toggleNavItem(item.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs ${item.visible ? 'bg-accent text-white' : 'bg-surface2 text-txt-muted border border-border'}`}><i className={`fas ${item.visible ? 'fa-eye' : 'fa-eye-slash'}`}></i></button>
                    <input type="text" value={item.icon} onChange={(e) => updateNavItem(item.id, 'icon', e.target.value)} placeholder="fa-icon" className="w-20 px-2 py-1.5 rounded-lg input-soft text-[10px]" />
                    <input type="text" value={item.label} onChange={(e) => updateNavItem(item.id, 'label', e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg input-soft text-xs" />
                    <input type="text" value={item.labelAr} onChange={(e) => updateNavItem(item.id, 'labelAr', e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg input-soft text-xs text-right" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export type { AppSettings };
export { ACCENT_COLORS };
