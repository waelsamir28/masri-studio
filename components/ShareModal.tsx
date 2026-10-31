import React from 'react';
import { addToast } from '../services/notificationService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  actorName: string;
  lang: 'en' | 'ar';
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, text, actorName, lang }) => {
  if (!isOpen) return null;
  const shareText = lang === 'ar' ? `🎙️ من ستوديو مصر!\n\nالمؤدي: ${actorName}\n\n"${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"` : `🎙️ From MASRI Studio!\n\nActor: ${actorName}\n\n"${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`;
  const shareUrl = 'https://masri-studio.app';

  const shareLinks = [
    { name: lang === 'ar' ? 'واتساب' : 'WhatsApp', icon: 'fa-brands fa-whatsapp', color: 'bg-green-500', url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}` },
    { name: lang === 'ar' ? 'تيليجرام' : 'Telegram', icon: 'fa-brands fa-telegram', color: 'bg-sky-500', url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
    { name: lang === 'ar' ? 'فيسبوك' : 'Facebook', icon: 'fa-brands fa-facebook', color: 'bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: lang === 'ar' ? 'تويتر' : 'Twitter', icon: 'fa-brands fa-x-twitter', color: 'bg-gray-800', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: lang === 'ar' ? 'نسخ' : 'Copy', icon: 'fa-copy', color: 'bg-gray-400', url: '' },
  ];

  const handleShare = (link: typeof shareLinks[0]) => {
    if (link.name === (lang === 'ar' ? 'نسخ' : 'Copy')) {
      navigator.clipboard.writeText(shareText + '\n' + shareUrl);
      addToast('success', lang === 'ar' ? 'تم النسخ' : 'Copied', lang === 'ar' ? 'تم نسخ النص' : 'Text copied');
    } else {
      window.open(link.url, '_blank', 'width=600,height=400');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative card-soft p-5 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-share-nodes text-sm"></i></div>
            <h3 className="text-sm font-semibold text-txt-primary">{lang === 'ar' ? 'مشاركة' : 'Share'}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors"><i className="fas fa-times text-xs"></i></button>
        </div>
        {navigator.share && (
          <button onClick={async () => { try { await navigator.share({ title: 'MASRI Studio', text: shareText, url: shareUrl }); } catch(e) {} }} className="w-full mb-3 py-2.5 rounded-lg bg-accent text-white text-xs font-medium flex items-center justify-center gap-1.5 btn-soft">
            <i className="fas fa-share"></i>{lang === 'ar' ? 'مشاركة سريعة' : 'Quick Share'}
          </button>
        )}
        <div className="grid grid-cols-5 gap-2">
          {shareLinks.map((link, idx) => (
            <button key={idx} onClick={() => handleShare(link)} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-surface2 transition-all group">
              <div className={`w-9 h-9 rounded-xl ${link.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}><i className={`${link.icon} text-white text-sm`}></i></div>
              <span className="text-[8px] font-medium text-txt-muted">{link.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
