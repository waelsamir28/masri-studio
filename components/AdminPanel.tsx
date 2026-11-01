import React, { useState, useRef } from 'react';

interface AppSettings {
  theme: string;
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

const THEMES = [
  { id: 'ocean', name: 'Ocean Deep', nameAr: 'محيط عميق', colors: ['#0a1628', '#0f2035', '#06b6d4', '#152d47'], gradient: 'from-slate-900 via-blue-900 to-cyan-900' },
  { id: 'warm', name: 'Warm Sunset', nameAr: 'غروب دافئ', colors: ['#1c0f0a', '#2d1810', '#f59e0b', '#3d2218'], gradient: 'from-amber-950 via-orange-900 to-red-950' },
  { id: 'forest', name: 'Forest Night', nameAr: 'غابة ليلية', colors: ['#0a1f10', '#0f2d18', '#10b981', '#183d22'], gradient: 'from-emerald-950 via-green-900 to-teal-950' },
  { id: 'neon', name: 'Neon Night', nameAr: 'نيون ليلي', colors: ['#0a0a1a', '#12122a', '#a855f7', '#1a1a3a'], gradient: 'from-purple-950 via-violet-900 to-indigo-950' },
  { id: 'light', name: 'Light Mode', nameAr: 'الوضع النهاري', colors: ['#f0f4f8', '#ffffff', '#0ea5e9', '#e2e8f0'], gradient: 'from-sky-100 via-white to-blue-100' },
];

const ACCENT_COLORS = [
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, settings, onSaveSettings, onClose, onLogout }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'banner' | 'navigation'>('general');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => { onSaveSettings(localSettings); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onload = (ev) => { const res = ev.target?.result as string; setLocalSettings(prev => ({ ...prev, bannerUrl: res, showBanner: true })); }; r.readAsDataURL(file); }
  };
  const toggleNavItem = (id: string) => { setLocalSettings(prev => ({ ...prev, navItems: prev.navItems.map(i => i.id === id ? { ...i, visible: !i.visible } : i) })); };
  const updateNavItem = (id: string, field: string, value: string) => { setLocalSettings(prev => ({ ...prev, navItems: prev.navItems.map(i => i.id === id ? { ...i, [field]: value } : i) })); };
  const removeBanner = () => { setLocalSettings(prev => ({ ...prev, bannerUrl: '', showBanner: false })); };

  const tabs = [
    { id: 'general' as const, label: lang === 'ar' ? 'عام' : 'General', icon: 'fa-gear' },
    { id: 'theme' as const, label: lang === 'ar' ? 'الثيمات' : 'Themes', icon: 'fa-palette' },
    { id: 'banner' as const, label: lang === 'ar' ? 'البانر' : 'Banner', icon: 'fa-image' },
    { id: 'navigation' as const, label: lang === 'ar' ? 'القائمة' : 'Menu', icon: 'fa-bars' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {/* Header */}
      <div className="bg-surface/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl icon-3d-purple icon-3d flex items-center justify-center"><i className="fas fa-sliders text-sm"></i></div>
            <div><h1 className="font-bold text-sm text-txt-primary">{lang === 'ar' ? 'لوحة التحكم' : 'Control Panel'}</h1><p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'مرحباً، المشرف' : 'Welcome, Admin'}</p></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleSave} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg'}`}>{saved ? <><i className="fas fa-check"></i>{lang === 'ar' ? 'تم' : 'Saved'}</> : <><i className="fas fa-save"></i>{lang === 'ar' ? 'حفظ' : 'Save'}</>}</button>
            <button onClick={onClose} className="px-3 py-2 rounded-xl win11-button text-xs font-bold flex items-center gap-1.5"><i className="fas fa-arrow-right text-[10px]"></i>{lang === 'ar' ? 'العودة' : 'Back'}</button>
            <button onClick={onLogout} className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"><i className="fas fa-arrow-right-from-bracket text-[10px]"></i>{lang === 'ar' ? 'خروج' : 'Logout'}</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex gap-6">
        <div className="w-48 shrink-0">
          <div className="win11-card p-2 space-y-1 sticky top-20">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-accent-soft text-accent' : 'text-txt-muted hover:text-txt-secondary hover:bg-surface2'}`}>
                <i className={`fas ${tab.icon} w-4 text-center text-[10px]`}></i><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="win11-card p-5 animate-fade-in space-y-5">
              <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2"><div className="w-8 h-8 rounded-xl icon-3d-blue icon-3d flex items-center justify-center"><i className="fas fa-gear text-xs"></i></div>{lang === 'ar' ? 'الإعدادات العامة' : 'General'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-txt-secondary mb-1.5">{lang === 'ar' ? 'اسم التطبيق' : 'App Name'}</label><input type="text" value={localSettings.appName} onChange={(e) => setLocalSettings(prev => ({ ...prev, appName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-border text-sm text-txt-primary focus:border-accent outline-none" /></div>
                <div><label className="block text-xs font-bold text-txt-secondary mb-1.5">{lang === 'ar' ? 'الوصف' : 'Description'}</label><input type="text" value={localSettings.appDescription} onChange={(e) => setLocalSettings(prev => ({ ...prev, appDescription: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-border text-sm text-txt-primary focus:border-accent outline-none" /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-txt-secondary mb-2">{lang === 'ar' ? 'حجم الخط' : 'Font Size'}</label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button key={size} onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: size }))} className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${localSettings.fontSize === size ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg' : 'win11-button text-txt-muted'}`}>{lang === 'ar' ? (size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير') : size.charAt(0).toUpperCase() + size.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="win11-card p-5 animate-fade-in space-y-6">
              <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2"><div className="w-8 h-8 rounded-xl icon-3d-pink icon-3d flex items-center justify-center"><i className="fas fa-palette text-xs"></i></div>{lang === 'ar' ? 'الثيمات والألوان' : 'Themes & Colors'}</h2>
              
              <div>
                <label className="block text-xs font-bold text-txt-secondary mb-3">{lang === 'ar' ? 'اختر الثيم' : 'Choose Theme'}</label>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setLocalSettings(prev => ({ ...prev, theme: t.id }))} className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${localSettings.theme === t.id ? 'border-accent shadow-lg scale-[1.02]' : 'border-border hover:border-accent/30'}`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-80`}></div>
                      <div className="relative z-10 flex items-center gap-2">
                        <div className="flex -space-x-1 space-x-reverse">
                          {t.colors.slice(0, 4).map((c, i) => <div key={i} className="w-5 h-5 rounded-full border-2 border-surface" style={{ background: c }}></div>)}
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-xs">{lang === 'ar' ? t.nameAr : t.name}</p>
                        </div>
                      </div>
                      {localSettings.theme === t.id && <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center z-10"><i className="fas fa-check text-[8px] text-white"></i></div>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-secondary mb-2">{lang === 'ar' ? 'اللون الرئيسي' : 'Accent Color'}</label>
                <div className="grid grid-cols-5 gap-2">
                  {ACCENT_COLORS.map(color => (
                    <button key={color.value} onClick={() => setLocalSettings(prev => ({ ...prev, accentColor: color.value }))} className={`relative aspect-square rounded-xl ${color.bg} transition-all hover:scale-110 ${localSettings.accentColor === color.value ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface scale-110' : ''}`} title={color.name}>
                      {localSettings.accentColor === color.value && <i className="fas fa-check text-white absolute inset-0 flex items-center justify-center drop-shadow"></i>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banner' && (
            <div className="win11-card p-5 animate-fade-in space-y-5">
              <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2"><div className="w-8 h-8 rounded-xl icon-3d-orange icon-3d flex items-center justify-center"><i className="fas fa-image text-xs"></i></div>{lang === 'ar' ? 'البانر' : 'Banner'}</h2>
              <div className="relative rounded-xl overflow-hidden border border-border aspect-[3/1] bg-surface2">
                {localSettings.bannerUrl ? <img src={localSettings.bannerUrl} alt="Banner" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-txt-muted gap-2"><i className="fas fa-image text-3xl opacity-30"></i><p className="text-xs">{lang === 'ar' ? 'لا يوجد بانر' : 'No banner'}</p></div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"><i className="fas fa-upload text-[10px]"></i>{lang === 'ar' ? 'رفع بانر' : 'Upload'}</button>
                {localSettings.bannerUrl && <button onClick={removeBanner} className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"><i className="fas fa-trash text-[10px]"></i>{lang === 'ar' ? 'حذف' : 'Remove'}</button>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="win11-card p-5 animate-fade-in space-y-4">
              <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2"><div className="w-8 h-8 rounded-xl icon-3d-green icon-3d flex items-center justify-center"><i className="fas fa-bars text-xs"></i></div>{lang === 'ar' ? 'القائمة' : 'Navigation'}</h2>
              <p className="text-xs text-txt-muted">{lang === 'ar' ? 'إظهار/إخفاء العناصر' : 'Toggle visibility'}</p>
              <div className="space-y-2">
                {localSettings.navItems.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.visible ? 'border-border bg-surface2' : 'border-border/50 opacity-50'}`}>
                    <button onClick={() => toggleNavItem(item.id)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all text-xs ${item.visible ? 'bg-accent text-white' : 'bg-surface2 text-txt-muted border border-border'}`}><i className={`fas ${item.visible ? 'fa-eye' : 'fa-eye-slash'}`}></i></button>
                    <input type="text" value={item.icon} onChange={(e) => updateNavItem(item.id, 'icon', e.target.value)} className="w-20 px-2 py-1.5 rounded-lg bg-surface2 border border-border text-[10px] text-txt-primary" />
                    <input type="text" value={item.label} onChange={(e) => updateNavItem(item.id, 'label', e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg bg-surface2 border border-border text-xs text-txt-primary" />
                    <input type="text" value={item.labelAr} onChange={(e) => updateNavItem(item.id, 'labelAr', e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg bg-surface2 border border-border text-xs text-txt-primary text-right" />
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
