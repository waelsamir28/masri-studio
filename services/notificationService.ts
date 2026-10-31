/**
 * Notification Service
 * Handles browser notifications and in-app toasts
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Show browser notification
export const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'masri-notification'
    });
    
    setTimeout(() => notification.close(), 5000);
  }
};

// Add in-app toast
export const addToast = (type: NotificationType, title: string, message: string, duration = 5000) => {
  const toast: ToastMessage = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    title,
    message,
    duration,
    timestamp: Date.now()
  };
  
  toasts = [toast, ...toasts].slice(0, 5); // Max 5 toasts
  notifyListeners();
  
  if (duration > 0) {
    setTimeout(() => removeToast(toast.id), duration);
  }
  
  return toast.id;
};

// Remove toast
export const removeToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
};

// Subscribe to toast changes
export const subscribeToasts = (listener: (toasts: ToastMessage[]) => void) => {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter(l => l !== listener);
  };
};

// Get current toasts
export const getToasts = () => toasts;

const notifyListeners = () => {
  toastListeners.forEach(listener => listener([...toasts]));
};

// Clear all toasts
export const clearToasts = () => {
  toasts = [];
  notifyListeners();
};

// Notification sound
export const playNotificationSound = (type: NotificationType = 'success') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.value = 0.1;
    
    if (type === 'success') {
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
    } else if (type === 'error') {
      oscillator.frequency.value = 300;
      oscillator.type = 'square';
    } else {
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
    }
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Silently fail
  }
};
