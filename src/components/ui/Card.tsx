import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
  variant?: 'tile' | 'list';
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  as: Component = 'article',
  variant = 'tile',
  hoverable = false,
  children,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'bg-surface rounded-card shadow-1 transition-all duration-150 ease-out border-0';
  const hoverStyles = hoverable ? 'hover:shadow-2 cursor-pointer' : '';
  const variantStyles = variant === 'list' ? 'divide-y divide-border overflow-hidden' : 'p-5 sm:p-6';

  return (
    <Component
      ref={ref}
      className={`${baseStyles} ${hoverStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export const CardItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }> = ({
  children,
  hoverable = true,
  className = '',
  ...props
}) => (
  <div
    className={`p-4 sm:p-5 transition-colors duration-150 ease-out ${
      hoverable ? 'hover:bg-surface-2 cursor-pointer' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);
