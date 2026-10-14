import React from 'react';

/**
 * One static label style. Colour never encodes category; the `category`
 * prop is kept only so existing call sites keep compiling.
 */
export type BadgeCategory =
  | 'cooperative' | 'social' | 'competitive' | 'energizer'
  | 'service' | 'arts' | 'devotional' | 'study' | 'neutral' | 'accent';

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
  const tone =
    category === 'accent'
      ? 'bg-accent-subtle text-accent-text'
      : 'bg-surface-2 text-text-secondary';
  const sizeStyles = {
    sm: 'text-2xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };
  return (
    <span className={`inline-flex items-center font-medium rounded-lg ${sizeStyles[size]} ${tone} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
