import React, { useState } from 'react';
import { TEXT_TEMPLATES, TEMPLATE_CATEGORIES, TextTemplate } from '../services/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: TextTemplate) => void;
  lang: 'en' | 'ar';
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose, onSelect, lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'ALL' 
    ? TEXT_TEMPLATES 
    : TEXT_TEMPLATES.filter(t => t.category === selectedCategory);

  const allCategories = [
    { id: 'ALL', label: lang === 'ar' ? 'الكل' : 'All', icon: 'fa-th-large' },
    ...TEMPLATE_CATEGORIES
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative glass-card p-6 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center icon-3d">
              <i className="fas fa-file-lines text-accent text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-txt-primary">
                {lang === 'ar' ? 'قوالب جاهزة' : 'Ready Templates'}
              </h3>
              <p className="text-[10px] text-txt-muted">
                {lang === 'ar' ? 'اختر قالب واستخدمه مباشرة' : 'Choose a template and use it directly'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-highlight flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar shrink-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {allCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-accent text-white'
                  : 'glass border-border text-txt-muted hover:text-txt-primary'
              }`}
            >
              <i className={`fas ${cat.icon}`}></i>
              <span>{lang === 'ar' ? cat.labelAr : cat.label}</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => { onSelect(template); onClose(); }}
              className="w-full p-4 glass-card text-right hover:border-accent/30 transition-all group"
              dir="rtl"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 icon-3d group-hover:scale-110 transition-transform">
                  <i className={`fas ${template.icon} text-accent`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-txt-primary font-display">
                      {lang === 'ar' ? template.titleAr : template.title}
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {lang === 'ar' ? template.categoryAr : template.category}
                    </span>
                  </div>
                  <p className="text-xs text-txt-muted leading-relaxed line-clamp-2">
                    {template.text.substring(0, 120)}...
                  </p>
                </div>
                <i className="fas fa-chevron-left text-txt-muted group-hover:text-accent transition-colors mt-2 shrink-0"></i>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
