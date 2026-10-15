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

/** One empty-state pattern: icon in tinted circle, one sentence, at most one action. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`py-12 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
    {icon && (
      <div className="w-14 h-14 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center mb-4 shrink-0">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-bold text-text mb-1.5">{title}</h3>
    <p className="text-sm text-text-secondary mb-5 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} variant="primary" size="md">
        {actionLabel}
      </Button>
    )}
  </div>
);
