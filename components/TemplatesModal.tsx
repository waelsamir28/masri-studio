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

  const filteredTemplates = selectedCategory === 'ALL' ? TEXT_TEMPLATES : TEXT_TEMPLATES.filter(t => t.category === selectedCategory);
  const allCategories = [{ id: 'ALL', label: lang === 'ar' ? 'الكل' : 'All', icon: 'fa-th-large' }, ...TEMPLATE_CATEGORIES];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative card-soft p-5 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg icon-soft flex items-center justify-center"><i className="fas fa-file-lines text-sm"></i></div>
            <h3 className="text-sm font-semibold text-txt-primary">{lang === 'ar' ? 'قوالب جاهزة' : 'Templates'}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors"><i className="fas fa-times text-xs"></i></button>
        </div>

        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar shrink-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {allCategories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-accent border-accent text-white' : 'border-border text-txt-muted hover:text-txt-secondary bg-surface2'}`}>
              <i className={`fas ${cat.icon} text-[9px]`}></i><span>{lang === 'ar' ? cat.labelAr : cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredTemplates.map(template => (
            <button key={template.id} onClick={() => { onSelect(template); onClose(); }} className="w-full p-3 card-soft hover:border-accent/50 transition-all group text-right" dir="rtl">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg icon-soft flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><i className={`fas ${template.icon} text-xs`}></i></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-medium text-txt-primary">{lang === 'ar' ? template.titleAr : template.title}</h4>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-accent-soft text-accent">{lang === 'ar' ? template.categoryAr : template.category}</span>
                  </div>
                  <p className="text-[10px] text-txt-muted leading-relaxed line-clamp-2">{template.text.substring(0, 100)}...</p>
                </div>
                <i className="fas fa-chevron-left text-txt-muted group-hover:text-accent transition-colors mt-1 shrink-0 text-[10px]"></i>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
