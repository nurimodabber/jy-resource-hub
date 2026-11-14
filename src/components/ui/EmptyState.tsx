import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** 'h1' nur, wenn der Hinweis die ganze Seite ist. In einer Liste ist er Text, keine Überschrift. */
  as?: 'h1' | 'p';
  className?: string;
}

/** One empty-state pattern: icon in tinted circle, one sentence, at most one action. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  as: Title = 'p',
  className = '',
}) => (
  <div className={`py-12 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
    {icon && (
      <div className="w-14 h-14 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center mb-4 shrink-0">
        {icon}
      </div>
    )}
    <Title className="text-lg font-bold text-text mb-1.5">{title}</Title>
    <p className="text-sm text-text-secondary mb-5 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} variant="primary" size="md">
        {actionLabel}
      </Button>
    )}
  </div>
);
