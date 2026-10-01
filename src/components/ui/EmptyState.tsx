import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`py-12 sm:py-16 px-6 text-center bg-surface rounded-3xl border border-border flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      {/* Friendly logo color circular illustration */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-brand">
            {icon || <div className="w-4 h-4 rounded-full bg-sage" />}
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sage/30 border-2 border-surface" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-text mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-secondary max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
