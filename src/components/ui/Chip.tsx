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
      className={`inline-flex items-center shrink-0 px-4 py-2 min-h-[44px] rounded-chip text-sm font-medium transition-colors duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none gap-2 border-0 ${
        selected
          ? 'bg-accent-subtle text-accent-text font-semibold'
          : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-2/80'
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={`text-xs px-2 py-0.5 rounded-chip tabular-nums font-semibold ${
            selected ? 'bg-accent/15 text-accent-text' : 'bg-surface text-text-tertiary'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

Chip.displayName = 'Chip';
