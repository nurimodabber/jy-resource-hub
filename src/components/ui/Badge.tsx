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
    cooperative: 'bg-[var(--cat-cooperative-subtle)] text-[var(--cat-cooperative)] border-[var(--cat-cooperative)]/20',
    social: 'bg-[var(--cat-social-subtle)] text-[var(--cat-social)] border-[var(--cat-social)]/20',
    competitive: 'bg-[var(--cat-competitive-subtle)] text-[var(--cat-competitive)] border-[var(--cat-competitive)]/20',
    energizer: 'bg-[var(--cat-energizer-subtle)] text-[var(--cat-energizer)] border-[var(--cat-energizer)]/20',
    service: 'bg-[var(--cat-service-subtle)] text-[var(--cat-service)] border-[var(--cat-service)]/20',
    arts: 'bg-[var(--cat-arts-subtle)] text-[var(--cat-arts)] border-[var(--cat-arts)]/20',
    devotional: 'bg-[var(--cat-devotional-subtle)] text-[var(--cat-devotional)] border-[var(--cat-devotional)]/20',
    study: 'bg-[var(--cat-study-subtle)] text-[var(--cat-study)] border-[var(--cat-study)]/20',
    neutral: 'bg-surface-2 text-text-secondary border-border-subtle',
    accent: 'bg-accent/10 text-accent border-accent/20',
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
