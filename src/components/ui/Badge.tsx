import React from 'react';

export type BadgeCategory = 
  | 'cooperative' 
  | 'social' 
  | 'competitive' 
  | 'energizer' 
  | 'service' 
  | 'arts' 
  | 'devotional' 
  | 'study' 
  | 'neutral'
  | 'accent';

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
  const categoryStyles: Record<BadgeCategory, string> = {
    cooperative: 'bg-[var(--cat-cooperative-bg)] text-[var(--cat-cooperative-text)] border-[var(--cat-cooperative-text)]/20',
    social: 'bg-[var(--cat-social-bg)] text-[var(--cat-social-text)] border-[var(--cat-social-text)]/20',
    competitive: 'bg-[var(--cat-competitive-bg)] text-[var(--cat-competitive-text)] border-[var(--cat-competitive-text)]/20',
    energizer: 'bg-[var(--cat-energizer-bg)] text-[var(--cat-energizer-text)] border-[var(--cat-energizer-text)]/20',
    service: 'bg-[var(--cat-service-bg)] text-[var(--cat-service-text)] border-[var(--cat-service-text)]/20',
    arts: 'bg-[var(--cat-arts-bg)] text-[var(--cat-arts-text)] border-[var(--cat-arts-text)]/20',
    devotional: 'bg-[var(--cat-devotional-bg)] text-[var(--cat-devotional-text)] border-[var(--cat-devotional-text)]/20',
    study: 'bg-[var(--cat-study-bg)] text-[var(--cat-study-text)] border-[var(--cat-study-text)]/20',
    neutral: 'bg-surface-2 text-text-secondary border-border-subtle',
    accent: 'bg-accent-subtle text-accent-text border-accent/20',
  };

  const sizeStyles = {
    sm: 'text-2xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeStyles[size]} ${categoryStyles[category]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
