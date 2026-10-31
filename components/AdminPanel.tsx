import React, { useState, useRef } from 'react';

interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: string;
  bannerUrl: string;
  showBanner: boolean;
  buttonStyle: 'flat' | '3d' | 'glass' | 'neon';
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
  { name: 'Purple', value: '#8b5cf6', bg: 'bg-violet-500' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
];

const DEFAULT_BANNER = '';

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, settings, onSaveSettings, onClose, onLogout }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'navigation' | 'banner'>('general');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLocalSettings(prev => ({ ...prev, bannerUrl: result, showBanner: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleNavItem = (id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      navItems: prev.navItems.map(item => 
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    }));
  };

  const updateNavItem = (id: string, field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      navItems: prev.navItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeBanner = () => {
    setLocalSettings(prev => ({ ...prev, bannerUrl: '', showBanner: false }));
  };

  const tabs = [
    { id: 'general' as const, label: lang === 'ar' ? 'عام' : 'General', icon: 'fa-cog' },
    { id: 'appearance' as const, label: lang === 'ar' ? 'المظهر' : 'Appearance', icon: 'fa-palette' },
    { id: 'banner' as const, label: lang === 'ar' ? 'البانر' : 'Banner', icon: 'fa-image' },
    { id: 'navigation' as const, label: lang === 'ar' ? 'القائمة' : 'Navigation', icon: 'fa-bars' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {/* Top Header */}
      <div className="glass sticky top-0 z-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shadow-lg icon-3d">
              <i className="fas fa-sliders text-white"></i>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-txt-primary">
                {lang === 'ar' ? 'لوحة التحكم' : 'Control Panel'}
              </h1>
              <p className="text-txt-muted text-[10px]">
                {lang === 'ar' ? 'مرحباً، المشرف' : 'Welcome, Admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all btn-3d flex items-center gap-2 ${
                saved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              }`}
            >
              {saved ? (
                <><i className="fas fa-check"></i> {lang === 'ar' ? 'تم الحفظ' : 'Saved'}</>
              ) : (
                <><i className="fas fa-save"></i> {lang === 'ar' ? 'حفظ' : 'Save'}</>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-highlight border border-border text-txt-secondary hover:text-txt-primary text-sm font-bold transition-all flex items-center gap-2"
            >
              <i className="fas fa-arrow-right"></i> {lang === 'ar' ? 'العودة' : 'Back'}
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> {lang === 'ar' ? 'خروج' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <div className="glass-card p-4 space-y-2 sticky top-24">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-accent border border-accent/30'
                    : 'text-txt-muted hover:text-txt-primary hover:bg-highlight'
                }`}
              >
                <i className={`fas ${tab.icon} w-5 text-center`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="glass-card p-8 animate-fade-in space-y-6">
              <h2 className="text-xl font-display font-bold text-txt-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <i className="fas fa-cog text-accent"></i>
                </div>
                {lang === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-txt-secondary mb-2">
                    {lang === 'ar' ? 'اسم التطبيق' : 'App Name'}
                  </label>
                  <input
                    type="text"
                    value={localSettings.appName}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, appName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-highlight border border-border text-txt-primary focus:border-accent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-txt-secondary mb-2">
                    {lang === 'ar' ? 'وصف التطبيق' : 'App Description'}
                  </label>
                  <input
                    type="text"
                    value={localSettings.appDescription}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, appDescription: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-highlight border border-border text-txt-primary focus:border-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-txt-secondary mb-3">
                  {lang === 'ar' ? 'حجم الخط' : 'Font Size'}
                </label>
                <div className="flex gap-3">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: size }))}
                      className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                        localSettings.fontSize === size
                          ? 'bg-accent border-accent text-white'
                          : 'border-border text-txt-muted hover:text-txt-primary hover:border-accent/30'
                      }`}
                    >
                      {lang === 'ar' 
                        ? (size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير')
                        : (size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large')
                      }
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-txt-secondary mb-3">
                  {lang === 'ar' ? 'الوضع' : 'Theme'}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'dark' }))}
                    className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      localSettings.theme === 'dark'
                        ? 'bg-accent border-accent text-white'
                        : 'border-border text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    <i className="fas fa-moon"></i>
                    {lang === 'ar' ? 'داكن' : 'Dark'}
                  </button>
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'light' }))}
                    className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      localSettings.theme === 'light'
                        ? 'bg-accent border-accent text-white'
                        : 'border-border text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    <i className="fas fa-sun"></i>
                    {lang === 'ar' ? 'فاتح' : 'Light'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="glass-card p-8 animate-fade-in space-y-8">
              <h2 className="text-xl font-display font-bold text-txt-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <i className="fas fa-palette text-accent"></i>
                </div>
                {lang === 'ar' ? 'المظهر والألوان' : 'Appearance & Colors'}
              </h2>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-bold text-txt-secondary mb-3">
                  {lang === 'ar' ? 'اللون الرئيسي' : 'Accent Color'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {ACCENT_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setLocalSettings(prev => ({ ...prev, accentColor: color.value }))}
                      className={`relative w-full aspect-square rounded-2xl ${color.bg} transition-all hover:scale-110 ${
                        localSettings.accentColor === color.value ? 'ring-4 ring-white/30 scale-110' : ''
                      }`}
                      title={color.name}
                    >
                      {localSettings.accentColor === color.value && (
                        <i className="fas fa-check text-white absolute inset-0 flex items-center justify-center text-lg drop-shadow-lg"></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div>
                <label className="block text-sm font-bold text-txt-secondary mb-3">
                  {lang === 'ar' ? 'نمط الأزرار' : 'Button Style'}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {([
                    { id: 'flat', label: lang === 'ar' ? 'مسطح' : 'Flat', icon: 'fa-square', desc: lang === 'ar' ? 'بسيط ونظيف' : 'Simple & Clean' },
                    { id: '3d', label: lang === 'ar' ? 'مجسم' : '3D', icon: 'fa-cube', desc: lang === 'ar' ? 'بارز ومؤثر' : 'Bold & Impactful' },
                    { id: 'glass', label: lang === 'ar' ? 'زجاجي' : 'Glass', icon: 'fa-gem', desc: lang === 'ar' ? 'شفاف وأنيق' : 'Transparent & Elegant' },
                    { id: 'neon', label: lang === 'ar' ? 'نيون' : 'Neon', icon: 'fa-bolt', desc: lang === 'ar' ? 'مضيء وحيوي' : 'Glowing & Vibrant' },
                  ] as const).map(style => (
                    <button
                      key={style.id}
                      onClick={() => setLocalSettings(prev => ({ ...prev, buttonStyle: style.id }))}
                      className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                        localSettings.buttonStyle === style.id
                          ? 'bg-accent border-accent text-white'
                          : 'border-border text-txt-muted hover:text-txt-primary hover:border-accent/30'
                      }`}
                    >
                      <i className={`fas ${style.icon} text-xl mb-1`}></i>
                      <span className="text-sm font-bold">{style.label}</span>
                      <span className="text-[10px] opacity-70">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-bold text-txt-secondary mb-3">
                  {lang === 'ar' ? 'معاينة' : 'Preview'}
                </label>
                <div className="p-6 rounded-xl bg-highlight border border-border flex flex-wrap gap-4 items-center justify-center">
                  <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold btn-3d">
                    <i className="fas fa-star ml-2"></i>
                    {lang === 'ar' ? 'زر نموذجي' : 'Sample Button'}
                  </button>
                  <button className="px-6 py-3 rounded-xl bg-highlight border-2 border-accent text-accent font-bold">
                    <i className="fas fa-play ml-2"></i>
                    {lang === 'ar' ? 'تشغيل' : 'Play'}
                  </button>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg icon-3d">
                    <i className="fas fa-microphone text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banner */}
          {activeTab === 'banner' && (
            <div className="glass-card p-8 animate-fade-in space-y-6">
              <h2 className="text-xl font-display font-bold text-txt-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <i className="fas fa-image text-accent"></i>
                </div>
                {lang === 'ar' ? 'إدارة البانر' : 'Banner Management'}
              </h2>

              {/* Current Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-border aspect-[3/1] bg-highlight">
                {localSettings.bannerUrl ? (
                  <img src={localSettings.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-txt-muted gap-3">
                    <i className="fas fa-image text-4xl opacity-30"></i>
                    <p className="text-sm">{lang === 'ar' ? 'لا يوجد بانر حالياً' : 'No banner set'}</p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold btn-3d flex items-center gap-2"
                >
                  <i className="fas fa-upload"></i>
                  {lang === 'ar' ? 'رفع بانر جديد' : 'Upload New Banner'}
                </button>
                {localSettings.bannerUrl && (
                  <button
                    onClick={removeBanner}
                    className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-trash"></i>
                    {lang === 'ar' ? 'حذف البانر' : 'Remove Banner'}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-xs text-txt-secondary">
                  <i className="fas fa-info-circle text-accent ml-2"></i>
                  {lang === 'ar' 
                    ? 'الأبعاد الموصى بها: 1200 × 400 بكسل. الصيغ المدعومة: JPG, PNG, WebP'
                    : 'Recommended dimensions: 1200 × 400px. Supported formats: JPG, PNG, WebP'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {activeTab === 'navigation' && (
            <div className="glass-card p-8 animate-fade-in space-y-6">
              <h2 className="text-xl font-display font-bold text-txt-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <i className="fas fa-bars text-accent"></i>
                </div>
                {lang === 'ar' ? 'إدارة القائمة' : 'Navigation Management'}
              </h2>

              <p className="text-sm text-txt-muted">
                {lang === 'ar' 
                  ? 'يمكنك التحكم في عناصر القائمة وإظهارها أو إخفاؤها وتغيير الأيقونات'
                  : 'Control menu items, toggle visibility, and change icons'
                }
              </p>

              <div className="space-y-3">
                {localSettings.navItems.map(item => (
                  <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.visible ? 'border-border bg-highlight' : 'border-border/50 bg-highlight/50 opacity-50'
                  }`}>
                    <button
                      onClick={() => toggleNavItem(item.id)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        item.visible ? 'bg-accent text-white' : 'bg-highlight text-txt-muted border border-border'
                      }`}
                    >
                      <i className={`fas ${item.visible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </button>

                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => updateNavItem(item.id, 'icon', e.target.value)}
                      placeholder="fa-icon"
                      className="w-24 px-3 py-2 rounded-lg bg-primary border border-border text-txt-primary text-xs focus:border-accent outline-none"
                    />

                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateNavItem(item.id, 'label', e.target.value)}
                        placeholder="English label"
                        className="flex-1 px-3 py-2 rounded-lg bg-primary border border-border text-txt-primary text-sm focus:border-accent outline-none"
                      />
                      <input
                        type="text"
                        value={item.labelAr}
                        onChange={(e) => updateNavItem(item.id, 'labelAr', e.target.value)}
                        placeholder="التسمية العربية"
                        className="flex-1 px-3 py-2 rounded-lg bg-primary border border-border text-txt-primary text-sm focus:border-accent outline-none text-right"
                      />
                    </div>

                    <i className={`fas ${item.icon} text-accent text-xl icon-3d`}></i>
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
export { ACCENT_COLORS, DEFAULT_BANNER };
