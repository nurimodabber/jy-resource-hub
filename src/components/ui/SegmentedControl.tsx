import React from 'react';

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
  fullWidth = false,
}: SegmentedControlProps<T>) {
  const sizeStyles = {
    sm: 'p-1 gap-1 text-xs',
    md: 'p-1.5 gap-1.5 text-xs sm:text-sm',
  };

  const itemHeightStyles = {
    sm: fullWidth ? 'min-h-[36px] px-2 py-1.5' : 'min-h-[36px] px-3.5 py-1.5',
    md: fullWidth ? 'min-h-[44px] px-2.5 py-2' : 'min-h-[44px] px-4 py-2',
  };

  return (
    <div
      role="tablist"
      className={`${
        fullWidth ? 'flex w-full' : 'inline-flex max-w-full'
      } items-center bg-surface-2 p-1 rounded-chip border-0 overflow-x-auto no-scrollbar ${sizeStyles[size]} ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            className={`inline-flex items-center justify-center rounded-chip font-medium transition-all duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none gap-2 border-0 ${
              fullWidth ? 'flex-1' : 'shrink-0'
            } ${itemHeightStyles[size]} ${
              isSelected
                ? 'bg-surface text-text shadow-1 font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span className="truncate">{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`text-xs px-2 py-0.5 rounded-chip tabular-nums font-semibold ${
                  isSelected ? 'bg-surface-2 text-text' : 'bg-surface/60 text-text-tertiary'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
