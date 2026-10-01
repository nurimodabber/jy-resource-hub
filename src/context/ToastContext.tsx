import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  text: string;
  action?: ToastAction;
  undo?: ToastAction;
}

interface ToastContextType {
  toast: ToastMessage | null;
  showToast: (options: {
    text: string;
    action?: ToastAction;
    undo?: ToastAction;
    durationMs?: number;
  }) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(
    ({
      text,
      action,
      undo,
      durationMs = 5000,
    }: {
      text: string;
      action?: ToastAction;
      undo?: ToastAction;
      durationMs?: number;
    }) => {
      const id = Date.now().toString();
      setToast({ id, text, action, undo });

      if (durationMs > 0) {
        setTimeout(() => {
          setToast((current) => (current?.id === id ? null : current));
        }, durationMs);
      }
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-70 max-w-sm sm:max-w-md w-[calc(100%-2rem)] bg-surface-raised border border-border shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <span className="font-medium text-text truncate">{toast.text}</span>
          <div className="flex items-center gap-2 shrink-0">
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  hideToast();
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-accent text-accent-contrast hover:bg-accent-hover transition-colors min-h-[32px] cursor-pointer"
              >
                {toast.action.label}
              </button>
            )}
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.onClick();
                  hideToast();
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors min-h-[32px] cursor-pointer"
              >
                {toast.undo.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
