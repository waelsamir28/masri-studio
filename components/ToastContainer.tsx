import React, { useState, useEffect } from 'react';
import { ToastMessage, subscribeToasts, removeToast } from '../services/notificationService';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  useEffect(() => { const unsubscribe = subscribeToasts(setToasts); return unsubscribe; }, []);
  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) { case 'success': return 'fa-check-circle text-emerald-400'; case 'error': return 'fa-xmark-circle text-red-400'; case 'warning': return 'fa-exclamation-triangle text-amber-400'; case 'info': return 'fa-info-circle text-cyan-400'; default: return 'fa-bell text-accent'; }
  };

  const getBg = (type: string) => {
    switch (type) { case 'success': return 'bg-emerald-500/10 border-emerald-500/20'; case 'error': return 'bg-red-500/10 border-red-500/20'; case 'warning': return 'bg-amber-500/10 border-amber-500/20'; default: return 'bg-cyan-500/10 border-cyan-500/20'; }
  };

  return (
    <div className="fixed top-16 left-4 right-4 z-[200] flex flex-col items-center gap-2 pointer-events-none max-w-sm mx-auto">
      {toasts.map((toast, idx) => (
        <div key={toast.id} className={`pointer-events-auto ${getBg(toast.type)} border rounded-xl px-3.5 py-2.5 shadow-2xl flex items-center gap-2.5 w-full animate-slide-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
          <i className={`fas ${getIcon(toast.type)} text-base`}></i>
          <div className="flex-1 min-w-0"><p className="text-xs font-bold text-txt-primary">{toast.title}</p><p className="text-[10px] text-txt-muted truncate">{toast.message}</p></div>
          <button onClick={() => removeToast(toast.id)} className="text-txt-muted hover:text-txt-primary transition-colors shrink-0"><i className="fas fa-times text-[10px]"></i></button>
        </div>
      ))}
    </div>
  );
};
