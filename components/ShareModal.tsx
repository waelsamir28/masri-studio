import React from 'react';
import { addToast } from '../services/notificationService';

interface ShareModalProps { isOpen: boolean; onClose: () => void; text: string; actorName: string; lang: 'en' | 'ar'; }

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, text, actorName, lang }) => {
  if (!isOpen) return null;
  const shareText = lang === 'ar' ? `🎙️ من ستوديو مصر!\nالمؤدي: ${actorName}\n"${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"` : `🎙️ MASRI Studio!\nActor: ${actorName}\n"${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`;
  const shareUrl = 'https://masri-studio.app';

  const shareLinks = [
    { name: lang === 'ar' ? 'واتساب' : 'WhatsApp', icon: 'fa-brands fa-whatsapp', color: 'bg-green-500', url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}` },
    { name: lang === 'ar' ? 'تيليجرام' : 'Telegram', icon: 'fa-brands fa-telegram', color: 'bg-sky-500', url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
    { name: lang === 'ar' ? 'فيسبوك' : 'Facebook', icon: 'fa-brands fa-facebook', color: 'bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: lang === 'ar' ? 'تويتر' : 'Twitter', icon: 'fa-brands fa-x-twitter', color: 'bg-gray-700', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: lang === 'ar' ? 'نسخ' : 'Copy', icon: 'fa-copy', color: 'bg-slate-500', url: '' },
  ];

  const handleShare = (link: typeof shareLinks[0]) => {
    if (link.name === (lang === 'ar' ? 'نسخ' : 'Copy')) { navigator.clipboard.writeText(shareText + '\n' + shareUrl); addToast('success', lang === 'ar' ? 'تم النسخ' : 'Copied', ''); }
    else { window.open(link.url, '_blank', 'width=600,height=400'); }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative card p-5 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl icon-3d-blue icon-3d flex items-center justify-center"><i className="fas fa-share-nodes text-sm"></i></div>
            <h3 className="text-sm font-bold text-txt-primary">{lang === 'ar' ? 'مشاركة' : 'Share'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors"><i className="fas fa-times text-xs"></i></button>
        </div>
        {navigator.share && (
          <button onClick={async () => { try { await navigator.share({ title: 'MASRI Studio', text: shareText, url: shareUrl }); } catch(e) {} }} className="w-full mb-3 py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-1.5"><i className="fas fa-share"></i>{lang === 'ar' ? 'مشاركة سريعة' : 'Quick Share'}</button>
        )}
        <div className="grid grid-cols-5 gap-2">
          {shareLinks.map((link, idx) => (
            <button key={idx} onClick={() => handleShare(link)} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-surface2 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center shadow-lg icon-3d group-hover:scale-110 transition-transform`}><i className={`${link.icon} text-white text-lg`}></i></div>
              <span className="text-[8px] font-bold text-txt-muted">{link.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
