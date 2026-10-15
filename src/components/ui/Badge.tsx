import React from 'react';

export type BadgeCategory =
  | 'cooperative' | 'social' | 'competitive' | 'energizer'
  | 'service' | 'arts' | 'devotional' | 'study' | 'neutral' | 'accent' | 'success' | 'danger';

export interface BadgeProps {
  category?: BadgeCategory;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  category = 'neutral',
  children,
  icon,
  className = '',
  size = 'md',
}) => {
  const toneMap: Record<BadgeCategory, string> = {
    accent: 'bg-accent-subtle text-accent-text',
    success: 'bg-success/15 text-success',
    danger: 'bg-danger/15 text-danger',
    neutral: 'bg-surface-2 text-text-secondary',
    cooperative: 'bg-surface-2 text-text-secondary',
    social: 'bg-surface-2 text-text-secondary',
    competitive: 'bg-surface-2 text-text-secondary',
    energizer: 'bg-surface-2 text-text-secondary',
    service: 'bg-surface-2 text-text-secondary',
    arts: 'bg-surface-2 text-text-secondary',
    devotional: 'bg-surface-2 text-text-secondary',
    study: 'bg-surface-2 text-text-secondary',
  };

  const tone = toneMap[category] || 'bg-surface-2 text-text-secondary';
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-chip ${sizeStyles[size]} ${tone} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
