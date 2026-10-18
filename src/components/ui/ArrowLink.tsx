import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export interface ArrowLinkProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  direction?: 'left' | 'right';
  variant?: 'accent' | 'secondary' | 'contrast';
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

export const ArrowLink: React.FC<ArrowLinkProps> = ({
  children,
  to,
  href,
  onClick,
  direction = 'right',
  variant = 'accent',
  size = 'sm',
  className = '',
  ariaLabel,
}) => {
  const variantStyles = {
    accent: 'text-accent hover:underline',
    secondary: 'text-text-secondary hover:text-text hover:underline',
    contrast: 'text-accent-contrast hover:underline',
  };

  const sizeStyles = {
    sm: 'text-xs font-semibold gap-1.5 px-2 py-1.5 min-h-[44px] min-w-[44px]',
    md: 'text-sm font-semibold gap-2 px-2.5 py-2 min-h-[44px] min-w-[44px]',
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const baseStyles = `group inline-flex items-center whitespace-nowrap rounded-control transition-colors duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const content = (
    <>
      {direction === 'left' && (
        <ArrowLeft
          className={`${iconSize} shrink-0 group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-none transition-transform duration-150`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
      {direction === 'right' && (
        <ArrowRight
          className={`${iconSize} shrink-0 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-none transition-transform duration-150`}
          aria-hidden="true"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseStyles} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseStyles} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseStyles} aria-label={ariaLabel}>
      {content}
    </button>
  );
};
