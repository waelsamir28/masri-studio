import React, { useState, useEffect } from 'react';
import { ToastMessage, subscribeToasts, removeToast } from '../services/notificationService';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  useEffect(() => { const unsubscribe = subscribeToasts(setToasts); return unsubscribe; }, []);
  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) { case 'success': return 'fa-check-circle text-emerald-500'; case 'error': return 'fa-xmark-circle text-red-500'; case 'warning': return 'fa-exclamation-triangle text-amber-500'; case 'info': return 'fa-info-circle text-blue-500'; default: return 'fa-bell text-accent'; }
  };

  return (
    <div className="fixed top-16 left-4 right-4 z-[200] flex flex-col items-center gap-2 pointer-events-none max-w-sm mx-auto">
      {toasts.map((toast, idx) => (
        <div key={toast.id} className="pointer-events-auto bg-primary border border-border rounded-xl px-3.5 py-2.5 shadow-lg flex items-center gap-2.5 w-full animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
          <i className={`fas ${getIcon(toast.type)} text-sm`}></i>
          <div className="flex-1 min-w-0"><p className="text-xs font-medium text-txt-primary">{toast.title}</p><p className="text-[10px] text-txt-muted truncate">{toast.message}</p></div>
          <button onClick={() => removeToast(toast.id)} className="text-txt-muted hover:text-txt-primary transition-colors shrink-0"><i className="fas fa-times text-[10px]"></i></button>
        </div>
      ))}
    </div>
  );
};
