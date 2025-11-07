'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/90 border-green-500 text-green-800 dark:text-green-100',
    error: 'bg-red-50 dark:bg-red-900/90 border-red-500 text-red-800 dark:text-red-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900/90 border-yellow-500 text-yellow-800 dark:text-yellow-100',
    info: 'bg-blue-50 dark:bg-blue-900/90 border-blue-500 text-blue-800 dark:text-blue-100',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg
        ${colors[toast.type]}
        animate-slide-in backdrop-blur-sm
      `}
      style={{ minWidth: '320px', maxWidth: '420px' }}
    >
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 font-bold text-lg">
        {icons[toast.type]}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b overflow-hidden">
          <div
            className={`h-full ${progressColors[toast.type]} animate-shrink`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-shrink {
          animation: shrink linear forwards;
        }
      `}</style>
    </div>
  );
}
