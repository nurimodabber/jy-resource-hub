import React, { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { useModal } from '../../hooks/useModal';
import { closeLabel } from './closeLabel';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Unique ids: two dialogs can be open at once
  const titleId = useId();
  const descId = useId();
  useModal(dialogRef, isOpen, onClose);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
    '4xl': 'max-w-[1040px]',
    full: 'max-w-full m-2 sm:m-6',
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses[maxWidth]} glass-surface-panel rounded-dialog shadow-2 border border-border overflow-hidden z-10 my-auto flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] animate-in fade-in zoom-in-95 duration-150 ease-out outline-hidden`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-line bg-surface/50 backdrop-blur-xs sticky top-0 z-10 shrink-0">
            <div>
              {title && (
                <h2 id={titleId} className="text-xl font-bold tracking-tight text-text">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-sm text-text-secondary mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <IconButton
                label={closeLabel()}
                onClick={onClose}
                size="md"
                variant="ghost"
                className="text-text-secondary hover:text-text -mr-2"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </IconButton>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
