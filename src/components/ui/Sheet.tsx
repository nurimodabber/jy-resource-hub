import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
  showCloseButton?: boolean;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'bottom',
  showCloseButton = true,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      {position === 'bottom' ? (
        <div
          ref={sheetRef}
          tabIndex={-1}
          className="fixed inset-x-0 bottom-0 z-10 max-h-[90vh] bg-surface rounded-t-3xl border-t border-border shadow-apple-modal flex flex-col animate-in slide-in-from-bottom duration-250 outline-hidden safe-bottom"
        >
          {/* Mobile Handle Bar */}
          <div className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full mx-auto mt-3 shrink-0" />

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle shrink-0">
              <div>
                {title && (
                  <h2 id="sheet-title" className="text-base sm:text-lg font-semibold text-text">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-xs text-text-secondary mt-0.5">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <IconButton label="Schließen" onClick={onClose} size="sm">
                  <X className="w-4 h-4" />
                </IconButton>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
            {children}
          </div>
        </div>
      ) : (
        <div
          ref={sheetRef}
          tabIndex={-1}
          className="relative z-10 w-full max-w-md h-full bg-surface border-l border-border shadow-apple-modal flex flex-col animate-in slide-in-from-right duration-250 outline-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border-subtle shrink-0">
            <div>
              {title && (
                <h2 id="sheet-title" className="text-lg font-semibold text-text">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-text-secondary mt-0.5">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <IconButton label="Schließen" onClick={onClose} size="sm">
                <X className="w-4 h-4" />
              </IconButton>
            )}
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
