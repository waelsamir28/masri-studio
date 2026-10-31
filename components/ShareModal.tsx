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

  const shareText = lang === 'ar' 
    ? `🎙️ استمع لهذا الصوت من ستوديو مصر!\n\nالمؤدي: ${actorName}\n\n"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"\n\n— MASRI Studio`
    : `🎙️ Listen to this voice from MASRI Studio!\n\nVoice Actor: ${actorName}\n\n"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"\n\n— MASRI Studio`;

  const shareUrl = 'https://masri-studio.app';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MASRI Studio',
          text: shareText,
          url: shareUrl
        });
        addToast('success', 
          lang === 'ar' ? 'تم المشاركة' : 'Shared',
          lang === 'ar' ? 'تم مشاركة التسجيل بنجاح' : 'Recording shared successfully'
        );
      } catch (e) {
        // User cancelled
      }
    }
  };

  const shareLinks = [
    {
      name: lang === 'ar' ? 'واتساب' : 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      color: 'from-green-500 to-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    },
    {
      name: lang === 'ar' ? 'تيليجرام' : 'Telegram',
      icon: 'fa-brands fa-telegram',
      color: 'from-blue-400 to-blue-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: lang === 'ar' ? 'فيسبوك' : 'Facebook',
      icon: 'fa-brands fa-facebook',
      color: 'from-blue-600 to-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: lang === 'ar' ? 'تويتر' : 'Twitter/X',
      icon: 'fa-brands fa-x-twitter',
      color: 'from-gray-700 to-gray-900',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: lang === 'ar' ? 'لينكدإن' : 'LinkedIn',
      icon: 'fa-brands fa-linkedin',
      color: 'from-blue-500 to-blue-600',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: lang === 'ar' ? 'نسخ' : 'Copy',
      icon: 'fa-copy',
      color: 'from-gray-500 to-gray-600',
      url: '' // Special handling
    }
  ];

  const handleShare = (link: typeof shareLinks[0]) => {
    if (link.name === (lang === 'ar' ? 'نسخ' : 'Copy')) {
      navigator.clipboard.writeText(shareText + '\n' + shareUrl);
      addToast('success',
        lang === 'ar' ? 'تم النسخ' : 'Copied',
        lang === 'ar' ? 'تم نسخ النص إلى الحافظة' : 'Text copied to clipboard'
      );
      onClose();
      return;
    }
    window.open(link.url, '_blank', 'width=600,height=400');
    addToast('info',
      lang === 'ar' ? 'تم الفتح' : 'Opened',
      lang === 'ar' ? `جاري المشاركة على ${link.name}` : `Sharing on ${link.name}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      {/* Modal */}
      <div className="relative glass-card p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <i className="fas fa-share-nodes text-accent text-lg"></i>
            </div>
            <h3 className="text-lg font-display font-bold text-txt-primary">
              {lang === 'ar' ? 'مشاركة التسجيل' : 'Share Recording'}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-highlight flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Share Text Preview */}
        <div className="p-3 rounded-xl bg-highlight border border-border mb-5 max-h-20 overflow-y-auto">
          <p className="text-xs text-txt-muted" dir="rtl">{shareText.substring(0, 120)}...</p>
        </div>

        {/* Native Share Button */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 btn-3d"
          >
            <i className="fas fa-share"></i>
            {lang === 'ar' ? 'مشاركة سريعة' : 'Quick Share'}
          </button>
        )}

        {/* Share Links Grid */}
        <div className="grid grid-cols-3 gap-3">
          {shareLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleShare(link)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-accent/30 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg icon-3d group-hover:scale-110 transition-transform`}>
                <i className={`${link.icon} text-white text-lg`}></i>
              </div>
              <span className="text-[10px] font-bold text-txt-muted">{link.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
