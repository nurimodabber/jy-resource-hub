import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({
  children,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-control transition-colors duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shrink-0';

  const sizeStyles = {
    sm: 'w-11 h-11 min-w-[44px] min-h-[44px]',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px]',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-accent hover:bg-accent-hover text-accent-contrast shadow-1',
    secondary: 'bg-surface-2 hover:bg-surface-2/80 text-text',
    outline: 'bg-transparent hover:bg-surface-2 text-text border border-border',
    ghost: 'bg-transparent hover:bg-surface-2 text-text-secondary hover:text-text',
  };

  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';
