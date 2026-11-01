import React, { useState } from 'react';
import { Team, TeamMember, TeamRole } from '../types';
import { addToast } from '../services/notificationService';

interface TeamWorkspaceProps {
  lang: 'en' | 'ar';
  onClose: () => void;
}

const AVATAR_COLORS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700',
  'from-emerald-500 to-emerald-700',
  'from-orange-500 to-orange-700',
  'from-cyan-500 to-cyan-700',
  'from-red-500 to-red-700',
  'from-teal-500 to-teal-700',
];

const ROLE_LABELS: Record<TeamRole, { en: string; ar: string; color: string }> = {
  admin: { en: 'Admin', ar: 'مدير', color: 'bg-red-500/20 text-red-400' },
  editor: { en: 'Editor', ar: 'محرر', color: 'bg-blue-500/20 text-blue-400' },
  viewer: { en: 'Viewer', ar: 'مشاهد', color: 'bg-green-500/20 text-green-400' },
};

export const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ lang, onClose }) => {
  const [team, setTeam] = useState<Team | null>(() => {
    const saved = localStorage.getItem('masri-team');
    return saved ? JSON.parse(saved) : null;
  });
  const [showCreate, setShowCreate] = useState(!team);
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'settings' | 'activity'>('members');

  const saveTeam = (t: Team) => {
    setTeam(t);
    localStorage.setItem('masri-team', JSON.stringify(t));
  };

  const createTeam = () => {
    if (!teamName.trim()) return;
    const newTeam: Team = {
      id: 'team_' + Date.now(),
      name: teamName.trim(),
      ownerId: 'owner',
      members: [
        { id: 'owner', username: 'admin', nameAr: 'المدير', role: 'admin', joinedAt: Date.now(), generations: 0 }
      ],
      createdAt: Date.now(),
      maxMembers: 10
    };
    saveTeam(newTeam);
    setShowCreate(false);
    addToast('success', lang === 'ar' ? 'تم الإنشاء' : 'Created', lang === 'ar' ? `فريق "${teamName}" جاهز` : `Team "${teamName}" ready`);
  };

  const inviteMember = () => {
    if (!inviteEmail.trim() || !team) return;
    const names = ['أحمد', 'محمود', 'سارة', 'فاطمة', 'يوسف', 'نور', 'خالد', 'مريم'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const roles: TeamRole[] = ['editor', 'viewer'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    const newMember: TeamMember = {
      id: 'member_' + Date.now(),
      username: inviteEmail.split('@')[0] || inviteEmail,
      nameAr: randomName,
      role: randomRole,
      joinedAt: Date.now(),
      generations: 0
    };
    
    const updatedTeam = { ...team, members: [...team.members, newMember] };
    saveTeam(updatedTeam);
    setInviteEmail('');
    addToast('success', lang === 'ar' ? 'تمت الدعوة' : 'Invited', lang === 'ar' ? `تم دعوة ${randomName}` : `Invited ${randomName}`);
  };

  const changeRole = (memberId: string, newRole: TeamRole) => {
    if (!team) return;
    const updatedTeam = {
      ...team,
      members: team.members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
    };
    saveTeam(updatedTeam);
    addToast('info', lang === 'ar' ? 'تم التغيير' : 'Updated', lang === 'ar' ? 'تم تغيير الدور' : 'Role changed');
  };

  const removeMember = (memberId: string) => {
    if (!team) return;
    if (memberId === team.ownerId) return;
    const updatedTeam = { ...team, members: team.members.filter(m => m.id !== memberId) };
    saveTeam(updatedTeam);
    addToast('info', lang === 'ar' ? 'تم الحذف' : 'Removed', lang === 'ar' ? 'تم حذف العضو' : 'Member removed');
  };

  if (showCreate && !team) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative w-full max-w-md win11-card animate-scale-in p-6" onClick={e => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
              <i className="fas fa-users text-white text-2xl"></i>
            </div>
            <h3 className="text-base font-bold text-txt-primary">{lang === 'ar' ? 'إنشاء فريق عمل' : 'Create Team'}</h3>
            <p className="text-[10px] text-txt-muted mt-1">{lang === 'ar' ? 'اعمل فريق وادعي أعضاء' : 'Create a team and invite members'}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-txt-primary mb-1.5 block">{lang === 'ar' ? 'اسم الفريق' : 'Team Name'}</label>
              <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder={lang === 'ar' ? 'مثال: فريق التسويق' : 'e.g. Marketing Team'} className="w-full py-2.5 px-3 rounded-xl bg-surface2 border border-border text-sm text-txt-primary placeholder-txt-muted focus:border-accent outline-none" />
            </div>

            <div className="bg-surface2/50 rounded-xl p-3 border border-border">
              <h4 className="text-[10px] font-bold text-accent mb-2"><i className="fas fa-gift ml-1"></i>{lang === 'ar' ? 'مميزات الفريق' : 'Team Features'}</h4>
              <ul className="text-[10px] text-txt-secondary space-y-1.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <li className="flex items-center gap-1.5"><i className="fas fa-check text-green-400 text-[8px]"></i>{lang === 'ar' ? 'حتى 10 أعضاء' : 'Up to 10 members'}</li>
                <li className="flex items-center gap-1.5"><i className="fas fa-check text-green-400 text-[8px]"></i>{lang === 'ar' ? 'مكتبة مشتركة' : 'Shared library'}</li>
                <li className="flex items-center gap-1.5"><i className="fas fa-check text-green-400 text-[8px]"></i>{lang === 'ar' ? 'صلاحيات مخصصة' : 'Custom permissions'}</li>
                <li className="flex items-center gap-1.5"><i className="fas fa-check text-green-400 text-[8px]"></i>{lang === 'ar' ? 'تتبع النشاط' : 'Activity tracking'}</li>
              </ul>
            </div>

            <button onClick={createTeam} disabled={!teamName.trim()} className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${teamName.trim() ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl' : 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'}`}>
              <i className="fas fa-plus"></i>
              {lang === 'ar' ? 'إنشاء الفريق' : 'Create Team'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col win11-card animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-users text-white"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">{team?.name || (lang === 'ar' ? 'فريق العمل' : 'Team')}</h3>
              <p className="text-[9px] text-txt-muted">{team?.members.length || 0} {lang === 'ar' ? 'أعضاء' : 'members'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-all">
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['members', 'settings', 'activity'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-[10px] font-bold transition-all ${activeTab === tab ? 'text-accent border-b-2 border-accent' : 'text-txt-muted hover:text-txt-primary'}`}>
              {tab === 'members' ? (lang === 'ar' ? 'الأعضاء' : 'Members') : tab === 'settings' ? (lang === 'ar' ? 'الإعدادات' : 'Settings') : (lang === 'ar' ? 'النشاط' : 'Activity')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'members' && team && (
            <>
              {/* Invite */}
              <div className="flex gap-2">
                <input type="text" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder={lang === 'ar' ? 'اسم المستخدم أو الإيميل...' : 'Username or email...'} className="flex-1 py-2 px-3 rounded-xl bg-surface2 border border-border text-xs text-txt-primary placeholder-txt-muted focus:border-accent outline-none" />
                <button onClick={inviteMember} disabled={!inviteEmail.trim()} className={`px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 ${inviteEmail.trim() ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'}`}>
                  <i className="fas fa-user-plus text-[10px]"></i>
                  {lang === 'ar' ? 'دعوة' : 'Invite'}
                </button>
              </div>

              {/* Members List */}
              {team.members.map((member, idx) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface2/30 border border-border">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{member.nameAr.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-txt-primary">{member.nameAr}</p>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${ROLE_LABELS[member.role].color}`}>
                        {lang === 'ar' ? ROLE_LABELS[member.role].ar : ROLE_LABELS[member.role].en}
                      </span>
                    </div>
                    <p className="text-[9px] text-txt-muted">@{member.username} • {member.generations} {lang === 'ar' ? 'توليد' : 'generations'}</p>
                  </div>
                  {member.id !== team.ownerId && (
                    <div className="flex items-center gap-1">
                      <select value={member.role} onChange={e => changeRole(member.id, e.target.value as TeamRole)} className="text-[9px] bg-transparent border border-border rounded-lg px-1.5 py-1 text-txt-muted outline-none">
                        <option value="editor">{lang === 'ar' ? 'محرر' : 'Editor'}</option>
                        <option value="viewer">{lang === 'ar' ? 'مشاهد' : 'Viewer'}</option>
                      </select>
                      <button onClick={() => removeMember(member.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-txt-muted hover:text-red-400">
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    </div>
                  )}
                  {member.id === team.ownerId && (
                    <span className="text-[9px] text-accent"><i className="fas fa-crown"></i></span>
                  )}
                </div>
              ))}

              {/* Capacity */}
              <div className="text-center pt-2">
                <p className="text-[9px] text-txt-muted">{team.members.length} / {team.maxMembers} {lang === 'ar' ? 'أعضاء' : 'members'}</p>
                <div className="w-32 h-1.5 bg-surface2 rounded-full mx-auto mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" style={{ width: `${(team.members.length / team.maxMembers) * 100}%` }}></div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && team && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-txt-primary mb-1.5 block">{lang === 'ar' ? 'اسم الفريق' : 'Team Name'}</label>
                <input type="text" defaultValue={team.name} className="w-full py-2.5 px-3 rounded-xl bg-surface2 border border-border text-sm text-txt-primary focus:border-accent outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-txt-primary mb-1.5 block">{lang === 'ar' ? 'الحد الأقصى للأعضاء' : 'Max Members'}</label>
                <select className="w-full py-2.5 px-3 rounded-xl bg-surface2 border border-border text-sm text-txt-primary focus:border-accent outline-none">
                  <option value="5">5 {lang === 'ar' ? 'أعضاء' : 'members'}</option>
                  <option value="10">10 {lang === 'ar' ? 'أعضاء' : 'members'}</option>
                  <option value="25">25 {lang === 'ar' ? 'عضو' : 'members'}</option>
                  <option value="50">50 {lang === 'ar' ? 'عضو' : 'members'}</option>
                </select>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold">
                <i className="fas fa-save ml-1"></i>
                {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </button>

              <div className="border-t border-border pt-3">
                <button className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all">
                  <i className="fas fa-trash ml-1"></i>
                  {lang === 'ar' ? 'حذف الفريق' : 'Delete Team'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && team && (
            <div className="space-y-2">
              {team.members.map((member, idx) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface2/30 border border-border">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{member.nameAr.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-txt-primary">{member.nameAr}</p>
                    <p className="text-[9px] text-txt-muted">{member.generations} {lang === 'ar' ? 'توليد صوتي' : 'voice generations'} • {lang === 'ar' ? 'انضم' : 'Joined'} {new Date(member.joinedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-accent">{member.generations}</p>
                    <p className="text-[8px] text-txt-muted">{lang === 'ar' ? 'توليد' : 'gens'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
