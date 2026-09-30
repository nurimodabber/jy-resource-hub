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
      className={`py-12 sm:py-16 px-6 text-center bg-surface rounded-3xl border border-border-subtle flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-surface-2 text-text-secondary flex items-center justify-center mb-4 border border-border-subtle">
          {icon}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-text mb-1">
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
