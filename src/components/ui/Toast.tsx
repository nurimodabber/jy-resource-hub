import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
}) => {
  if (!message) return null;

  return (
    <aside
      aria-label="Statusbenachrichtigung"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-70 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-text text-bg shadow-apple-modal border border-border/20 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 select-none safe-bottom pointer-events-none"
    >
      {type === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      <span>{message}</span>
    </aside>
  );
};
