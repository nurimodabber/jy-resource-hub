import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  as: Component = 'article',
  hoverable = false,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={`bg-surface rounded-2xl border border-border p-5 sm:p-6 transition-colors duration-150 ${
        hoverable ? 'hover:shadow-apple-card-hover hover:border-border cursor-pointer ' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';
