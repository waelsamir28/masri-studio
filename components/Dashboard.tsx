import React, { useState } from 'react';
import { GeneratedSpeech, Folder, ClonedVoice } from '../types';

interface DashboardProps {
  lang: 'en' | 'ar';
  history: GeneratedSpeech[];
  favorites: string[];
  folders: Folder[];
  clonedVoices: ClonedVoice[];
  onNavigate: (page: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onPlayAudio: (speech: GeneratedSpeech) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, history, favorites, folders, clonedVoices, onNavigate, onToggleFavorite, onDelete, onPlayAudio }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'folders' | 'voices'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    totalGenerations: history.length,
    totalFavorites: favorites.length,
    totalFolders: folders.length,
    totalClonedVoices: clonedVoices.length,
    todayGenerations: history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length,
    weekGenerations: history.filter(h => { const d = Date.now() - h.timestamp; return d < 7 * 24 * 60 * 60 * 1000; }).length,
    mostUsedActor: getMostUsedActor(history),
    avgTextLength: history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.text.length, 0) / history.length) : 0,
  };

  function getMostUsedActor(history: GeneratedSpeech[]): string {
    if (history.length === 0) return '-';
    const counts: Record<string, number> = {};
    history.forEach(h => { counts[h.actor.nameAr] = (counts[h.actor.nameAr] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  }

  const filteredHistory = history.filter(h => 
    h.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.actor.nameAr.includes(searchQuery) ||
    h.actor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: 'fa-chart-pie' },
    { id: 'history', label: lang === 'ar' ? 'السجل' : 'History', icon: 'fa-clock-rotate-left' },
    { id: 'folders', label: lang === 'ar' ? 'المجلدات' : 'Folders', icon: 'fa-folder' },
    { id: 'voices', label: lang === 'ar' ? 'الأصوات' : 'Cloned Voices', icon: 'fa-fingerprint' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl icon-3d-purple icon-3d flex items-center justify-center">
            <i className="fas fa-chart-line"></i>
          </div>
          <div>
            <h2 className="text-base font-bold text-txt-primary">{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</h2>
            <p className="text-[10px] text-txt-muted">{lang === 'ar' ? 'إحصائيات وإدارة المحتوى' : 'Stats & content management'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-surface2/50 p-1 rounded-xl border border-border overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === tab.id ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg' : 'text-txt-muted hover:text-txt-primary'}`}>
            <i className={`fas ${tab.icon} text-[10px]`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon="fa-microphone" color="cyan" label={lang === 'ar' ? 'إجمالي التوليدات' : 'Total Generations'} value={stats.totalGenerations} />
            <StatCard icon="fa-heart" color="pink" label={lang === 'ar' ? 'المفضلة' : 'Favorites'} value={stats.totalFavorites} />
            <StatCard icon="fa-calendar-day" color="green" label={lang === 'ar' ? 'اليوم' : 'Today'} value={stats.todayGenerations} />
            <StatCard icon="fa-calendar-week" color="purple" label={lang === 'ar' ? 'هذا الأسبوع' : 'This Week'} value={stats.weekGenerations} />
          </div>

          {/* Detailed Stats */}
          <div className="win11-card p-4 space-y-3">
            <h3 className="text-xs font-bold text-accent flex items-center gap-1.5"><i className="fas fa-chart-simple"></i>{lang === 'ar' ? 'إحصائيات مفصلة' : 'Detailed Stats'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-surface2/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center"><i className="fas fa-user text-orange-400"></i></div>
                <div>
                  <p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'أكثر مؤدي استخداماً' : 'Most Used Actor'}</p>
                  <p className="text-xs font-bold text-txt-primary">{stats.mostUsedActor}</p>
                </div>
              </div>
              <div className="bg-surface2/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center"><i className="fas fa-text-width text-blue-400"></i></div>
                <div>
                  <p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'متوسط طول النص' : 'Avg Text Length'}</p>
                  <p className="text-xs font-bold text-txt-primary">{stats.avgTextLength} {lang === 'ar' ? 'حرف' : 'chars'}</p>
                </div>
              </div>
              <div className="bg-surface2/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center"><i className="fas fa-folder text-emerald-400"></i></div>
                <div>
                  <p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'المجلدات' : 'Folders'}</p>
                  <p className="text-xs font-bold text-txt-primary">{stats.totalFolders}</p>
                </div>
              </div>
              <div className="bg-surface2/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center"><i className="fas fa-fingerprint text-pink-400"></i></div>
                <div>
                  <p className="text-[9px] text-txt-muted">{lang === 'ar' ? 'أصوات مستنسخة' : 'Cloned Voices'}</p>
                  <p className="text-xs font-bold text-txt-primary">{stats.totalClonedVoices}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {history.length > 0 && (
            <div className="win11-card p-4">
              <h3 className="text-xs font-bold text-accent flex items-center gap-1.5 mb-3"><i className="fas fa-clock"></i>{lang === 'ar' ? 'آخر النشاطات' : 'Recent Activity'}</h3>
              <div className="space-y-2">
                {history.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface2/50 transition-all cursor-pointer" onClick={() => onPlayAudio(item)}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.actor.imageColor} flex items-center justify-center shrink-0`}>
                      <i className="fas fa-microphone text-white text-[10px]"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-txt-primary truncate">{item.text.substring(0, 50)}...</p>
                      <p className="text-[9px] text-txt-muted">{item.actor.nameAr} • {getTimeAgo(item.timestamp, lang)}</p>
                    </div>
                    <button className="w-7 h-7 rounded-lg hover:bg-accent/20 flex items-center justify-center text-accent">
                      <i className="fas fa-play text-[9px]"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted text-xs"></i>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={lang === 'ar' ? 'بحث في السجل...' : 'Search history...'} className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-surface2 border border-border text-sm text-txt-primary placeholder-txt-muted focus:border-accent outline-none" />
          </div>

          {filteredHistory.length === 0 ? (
            <div className="win11-card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-inbox text-txt-muted text-xl"></i>
              </div>
              <p className="text-txt-muted text-sm">{lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map(item => (
                <div key={item.id} className="win11-card p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.actor.imageColor} flex items-center justify-center shrink-0`}>
                    <i className="fas fa-microphone text-white text-xs"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-txt-primary truncate">{item.text.substring(0, 60)}{item.text.length > 60 ? '...' : ''}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-accent font-bold">{item.actor.nameAr}</span>
                      <span className="text-[8px] text-txt-muted">{getTimeAgo(item.timestamp, lang)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onPlayAudio(item)} className="w-7 h-7 rounded-lg hover:bg-accent/20 flex items-center justify-center text-accent"><i className="fas fa-play text-[9px]"></i></button>
                    <button onClick={() => onToggleFavorite(item.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${favorites.includes(item.id) ? 'text-red-400 hover:bg-red-500/20' : 'text-txt-muted hover:bg-surface2'}`}><i className={`fas fa-heart text-[9px]`}></i></button>
                    <button onClick={() => onDelete(item.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-txt-muted hover:text-red-400"><i className="fas fa-trash text-[9px]"></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Folders Tab */}
      {activeTab === 'folders' && (
        <div className="space-y-3">
          <button onClick={() => {}} className="w-full py-3 rounded-xl win11-button text-xs font-bold flex items-center justify-center gap-2 hover:border-accent/30">
            <i className="fas fa-plus text-accent"></i>
            {lang === 'ar' ? 'إنشاء مجلد جديد' : 'Create New Folder'}
          </button>

          {folders.length === 0 ? (
            <div className="win11-card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-folder-plus text-txt-muted text-xl"></i>
              </div>
              <p className="text-txt-muted text-sm mb-1">{lang === 'ar' ? 'لا توجد مجلدات' : 'No folders yet'}</p>
              <p className="text-[10px] text-txt-muted">{lang === 'ar' ? 'أنشئ مجلد لتنظيم تسجيلاتك' : 'Create a folder to organize recordings'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {folders.map(folder => (
                <div key={folder.id} className="win11-card p-4 text-center cursor-pointer hover:scale-[1.02] transition-all">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center`} style={{ background: `linear-gradient(135deg, ${folder.color}40, ${folder.color}20)` }}>
                    <i className={`fas ${folder.icon} text-lg`} style={{ color: folder.color }}></i>
                  </div>
                  <p className="text-xs font-bold text-txt-primary">{lang === 'ar' ? folder.nameAr : folder.name}</p>
                  <p className="text-[9px] text-txt-muted">{history.filter(h => h.folder === folder.id).length} {lang === 'ar' ? 'تسجيل' : 'recordings'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cloned Voices Tab */}
      {activeTab === 'voices' && (
        <div className="space-y-3">
          {clonedVoices.length === 0 ? (
            <div className="win11-card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-fingerprint text-txt-muted text-xl"></i>
              </div>
              <p className="text-txt-muted text-sm mb-1">{lang === 'ar' ? 'لا توجد أصوات مستنسخة' : 'No cloned voices'}</p>
              <p className="text-[10px] text-txt-muted mb-3">{lang === 'ar' ? 'استنسخ صوتك أو صوت أي شخص' : 'Clone your voice or anyone\'s'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clonedVoices.map(voice => (
                <div key={voice.id} className="win11-card p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${voice.status === 'ready' ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-yellow-500 to-orange-600'}`}>
                    <i className="fas fa-fingerprint text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-txt-primary">{voice.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${voice.status === 'ready' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {voice.status === 'ready' ? (lang === 'ar' ? 'جاهز' : 'Ready') : (lang === 'ar' ? 'قيد المعالجة' : 'Processing')}
                      </span>
                      <span className="text-[8px] text-txt-muted">{getTimeAgo(voice.createdAt, lang)}</span>
                    </div>
                  </div>
                  {voice.status === 'ready' && voice.sampleDataUrl && (
                    <audio controls src={voice.sampleDataUrl} className="h-7" style={{ filter: 'hue-rotate(180deg)' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ icon: string; color: string; label: string; value: number }> = ({ icon, color, label, value }) => {
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500 to-cyan-700 shadow-cyan-500/20',
    pink: 'from-pink-500 to-pink-700 shadow-pink-500/20',
    green: 'from-green-500 to-green-700 shadow-green-500/20',
    purple: 'from-purple-500 to-purple-700 shadow-purple-500/20',
  };
  return (
    <div className="win11-card p-3 text-center">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
        <i className={`fas ${icon} text-white text-xs`}></i>
      </div>
      <p className="text-lg font-bold text-txt-primary">{value}</p>
      <p className="text-[9px] text-txt-muted">{label}</p>
    </div>
  );
};

// Time ago helper
function getTimeAgo(timestamp: number, lang: 'en' | 'ar'): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return lang === 'ar' ? 'الآن' : 'Just now';
  if (minutes < 60) return lang === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  if (hours < 24) return lang === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
  return lang === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
}
