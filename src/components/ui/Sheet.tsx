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
  const [dragOffset, setDragOffset] = React.useState(0);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 75) {
      onClose();
    }
    setDragOffset(0);
    touchStartY.current = null;
  };

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      setDragOffset(0);
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
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-150 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      {position === 'bottom' ? (
        <div
          ref={sheetRef}
          tabIndex={-1}
          style={
            dragOffset > 0
              ? { transform: `translateY(${dragOffset}px)`, transition: 'none' }
              : undefined
          }
          className="relative z-10 w-full sm:max-w-lg max-h-[88vh] sm:max-h-[80vh] glass-surface-panel rounded-t-sheet sm:rounded-dialog shadow-2 border-0 sm:border sm:border-border flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150 ease-out outline-hidden safe-bottom"
        >
          {/* Mobile Handle Bar with touch dismiss */}
          <div
            className="w-full pt-3 pb-1 cursor-grab active:cursor-grabbing sm:hidden flex flex-col items-center justify-center touch-none select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            aria-hidden="true"
          >
            <div className="w-12 h-1.5 bg-border rounded-full hover:bg-border-strong transition-colors" />
          </div>

          {/* Header */}
          {(title || showCloseButton) && (
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b border-line glass-surface shrink-0 select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
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
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Schließen"
                  className="min-w-[44px] min-h-[44px] -mr-2 rounded-control flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X className="w-5 h-5" strokeWidth={1.75} />
                </button>
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
          className="relative z-10 w-full max-w-md h-full glass-surface-panel shadow-2 border-0 flex flex-col animate-in slide-in-from-right duration-150 ease-out outline-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-line glass-surface shrink-0">
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
