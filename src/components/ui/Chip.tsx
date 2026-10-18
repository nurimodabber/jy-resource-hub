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
      className={`inline-flex items-center shrink-0 px-3.5 py-1.5 min-h-[44px] rounded-control text-sm transition-all duration-120 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none gap-2 ${
        selected
          ? 'bg-accent text-accent-ink font-bold border border-accent shadow-xs'
          : 'bg-surface text-text-secondary border border-line hover:border-text-secondary hover:text-text'
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-control tabular-nums font-semibold ${
            selected ? 'bg-accent-ink/20 text-accent-ink' : 'bg-surface-2 text-text-secondary'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

Chip.displayName = 'Chip';
