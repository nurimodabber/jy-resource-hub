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
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  const sizeStyles = {
    sm: 'p-1 gap-1 text-xs',
    md: 'p-1.5 gap-1.5 text-xs sm:text-sm',
  };

  const itemHeightStyles = {
    sm: 'min-h-[40px] sm:min-h-[32px] px-3 py-1',
    md: 'min-h-[44px] sm:min-h-[36px] px-3.5 py-1.5',
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-surface-2 p-1 rounded-full border border-border-subtle max-w-full overflow-x-auto custom-scrollbar ${sizeStyles[size]} ${className}`}
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
            className={`inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none shrink-0 gap-1.5 ${itemHeightStyles[size]} ${
              isSelected
                ? 'bg-surface text-text shadow-apple-pill font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span className="truncate">{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`text-2xs px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-black/5 dark:bg-white/10 text-text' : 'text-text-tertiary'
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
