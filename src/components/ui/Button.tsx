import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 select-none outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] sm:min-h-[32px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[44px] sm:min-h-[38px] gap-2',
    lg: 'text-base px-5 py-2.5 min-h-[48px] sm:min-h-[44px] gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-accent hover:bg-accent-hover text-accent-contrast shadow-sm font-semibold',
    secondary: 'bg-surface-2 hover:bg-black/10 dark:hover:bg-white/10 text-text border border-border-subtle',
    outline: 'bg-transparent hover:bg-surface-2 text-text border border-border',
    ghost: 'bg-transparent hover:bg-surface-2 text-text',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-semibold',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
