import React, { useState, useEffect } from 'react';
import { ToastMessage, subscribeToasts, removeToast } from '../services/notificationService';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToasts(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fa-check-circle text-green-400';
      case 'error': return 'fa-times-circle text-red-400';
      case 'warning': return 'fa-exclamation-triangle text-yellow-400';
      case 'info': return 'fa-info-circle text-blue-400';
      default: return 'fa-bell text-accent';
    }
  };

  const getBorder = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/30';
      case 'error': return 'border-red-500/30';
      case 'warning': return 'border-yellow-500/30';
      case 'info': return 'border-blue-500/30';
      default: return 'border-accent/30';
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast, idx) => (
        <div
          key={toast.id}
          className={`pointer-events-auto glass border ${getBorder(toast.type)} rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm w-full animate-slide-down`}
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <i className={`fas ${getIcon(toast.type)} text-xl icon-3d`}></i>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-txt-primary">{toast.title}</p>
            <p className="text-[10px] text-txt-muted truncate">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-txt-muted hover:text-txt-primary transition-colors shrink-0"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      ))}
    </div>
  );
};
