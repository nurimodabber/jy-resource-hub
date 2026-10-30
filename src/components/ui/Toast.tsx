import React from 'react';
import { uiText } from './closeLabel';
import { Check, AlertCircle, Info } from 'lucide-react';

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
      aria-label={uiText('Statusbenachrichtigung', 'Status notification')}
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-70 flex items-center gap-2.5 px-4 py-2.5 rounded-control bg-text/92 backdrop-blur-md text-bg shadow-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-150 ease-out select-none safe-bottom pointer-events-none"
    >
      {type === 'success' && <Check className="w-4 h-4 text-success shrink-0" strokeWidth={1.75} />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-danger shrink-0" strokeWidth={1.75} />}
      {type === 'info' && <Info className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />}
      <span>{message}</span>
    </aside>
  );
};
