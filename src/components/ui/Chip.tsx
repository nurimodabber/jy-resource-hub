import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(({
  children,
  selected = false,
  count,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex items-center shrink-0 px-3.5 py-1.5 min-h-[44px] sm:min-h-[36px] rounded-full text-xs font-medium transition-all duration-150 outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none gap-1.5 active:scale-95 ${
        selected
          ? 'bg-text text-bg font-semibold shadow-apple-pill'
          : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-black/10 dark:hover:bg-white/10 border border-border-subtle'
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={`text-2xs px-1.5 py-0.5 rounded-full font-mono ${
            selected ? 'bg-bg/20 text-bg' : 'bg-black/5 dark:bg-white/10 text-text-tertiary'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

Chip.displayName = 'Chip';
