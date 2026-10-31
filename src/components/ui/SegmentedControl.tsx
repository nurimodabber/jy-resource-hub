import React, { useRef, useState, useEffect, useCallback } from 'react';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const updateIndicator = useCallback(() => {
    const activeEl = buttonRefs.current.get(value);
    if (activeEl && containerRef.current) {
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [value]);

  useEffect(() => {
    setIsMounted(true);
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative ${
        fullWidth ? 'flex w-full' : 'inline-flex max-w-full'
      } items-center bg-surface-2 p-1 rounded-chip border-0 overflow-x-auto no-scrollbar ${sizeStyles[size]} ${className}`}
    >
      {/* Liquid Glass / Surface Sliding Pill Indicator */}
      {indicator && (
        <div
          className="absolute top-1 bottom-1 rounded-chip bg-surface text-text shadow-1 border border-border/40 transition-all duration-220 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none motion-reduce:transition-none"
          style={{
            transform: `translate3d(${indicator.left}px, 0, 0)`,
            width: `${indicator.width}px`,
          }}
        >
          {/* Subtle liquid specular reflection line on top */}
          <span
            className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 dark:via-white/20 to-transparent pointer-events-none rounded-t-full"
            aria-hidden="true"
          />
        </div>
      )}

      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            ref={(el) => {
              if (el) buttonRefs.current.set(option.id, el);
              else buttonRefs.current.delete(option.id);
            }}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            className={`relative z-10 inline-flex items-center justify-center rounded-chip font-medium transition-colors duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none gap-2 border-0 active:scale-[0.98] motion-reduce:transform-none ${
              fullWidth ? 'flex-1' : 'shrink-0'
            } ${itemHeightStyles[size]} ${
              !isMounted && isSelected ? 'bg-surface shadow-1 font-semibold text-text' : ''
            } ${
              isSelected
                ? 'text-text font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {option.icon && (
              <span
                className={`shrink-0 transition-colors duration-150 ${
                  isSelected ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary'
                }`}
              >
                {option.icon}
              </span>
            )}
            <span className="truncate">{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`text-xs px-2 py-0.5 rounded-chip tabular-nums font-semibold transition-colors duration-150 ${
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
