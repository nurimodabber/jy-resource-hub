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
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-150 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      {position === 'bottom' ? (
        <div
          ref={sheetRef}
          tabIndex={-1}
          className="relative z-10 w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] bg-surface rounded-t-sheet sm:rounded-dialog shadow-2 border-0 sm:border sm:border-border flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150 ease-out outline-hidden safe-bottom"
        >
          {/* Mobile Handle Bar */}
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                {title && (
                  <h2 id="sheet-title" className="text-lg font-bold text-text">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-xs text-text-secondary mt-0.5">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <IconButton label="Schließen" onClick={onClose} size="sm" variant="ghost">
                  <X className="w-4 h-4" strokeWidth={1.75} />
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
          className="relative z-10 w-full max-w-md h-full bg-surface shadow-2 border-0 flex flex-col animate-in slide-in-from-right duration-150 ease-out outline-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
            <div>
              {title && (
                <h2 id="sheet-title" className="text-lg font-bold text-text">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-text-secondary mt-0.5">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <IconButton label="Schließen" onClick={onClose} size="sm" variant="ghost">
                <X className="w-4 h-4" strokeWidth={1.75} />
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
