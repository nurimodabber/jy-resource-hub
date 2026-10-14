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

/** One empty-state pattern: icon, one sentence, at most one action. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`py-12 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
    {icon && <div className="mb-3 text-text-tertiary">{icon}</div>}
    <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
    <p className="text-sm text-text-secondary mb-4 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} variant="primary" size="md">
        {actionLabel}
      </Button>
    )}
  </div>
);
