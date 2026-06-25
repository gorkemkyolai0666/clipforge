'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }

const ToastContext = createContext<{ toast: (m: string, t?: ToastType) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismiss = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={cn(
            'flex min-w-[280px] items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm',
            t.type === 'success' && 'border-success/40 bg-success/10 text-success',
            t.type === 'error' && 'border-destructive/40 bg-destructive/10 text-destructive',
            t.type === 'info' && 'border-coral/40 bg-coral/10 text-foreground',
          )}>
            {t.type === 'success' ? <CheckCircle className="h-4 w-4" /> : null}
            {t.type === 'error' ? <AlertCircle className="h-4 w-4" /> : null}
            <span className="flex-1 text-sm">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Kapat"><X className="h-4 w-4 opacity-60" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
