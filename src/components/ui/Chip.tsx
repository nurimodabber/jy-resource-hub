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
      className={`inline-flex items-center shrink-0 px-3.5 py-1.5 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-medium transition-all duration-150 outline-hidden focus-visible:ring-2 focus-visible:ring-brand select-none gap-1.5  ${
        selected
          ? 'bg-accent-subtle text-accent-text border border-accent/40 font-semibold'
          : 'bg-surface text-text-secondary hover:text-text hover:bg-surface-2 border border-border'
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={`text-2xs px-1.5 py-0.5 rounded-lg tabular-nums ${
            selected ? 'bg-accent-contrast/15 text-accent-contrast' : 'bg-black/5 dark:bg-white/10 text-text-tertiary'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

Chip.displayName = 'Chip';
