import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface FilterOption<T = string | number | null> {
  value: T;
  label: string;
}

export interface FilterPillDropdownProps<T = string | number | null> {
  label: string;
  activeLabel?: string;
  isActive: boolean;
  options: FilterOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  icon?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function FilterPillDropdown<T = string | number | null>({
  label,
  activeLabel,
  isActive,
  options,
  selectedValue,
  onSelect,
  icon,
  align = 'left',
  className = '',
}: FilterPillDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const displayLabel = isActive && activeLabel ? activeLabel : label;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none shrink-0 ${
          isActive
            ? 'bg-accent text-accent-ink border-accent shadow-xs'
            : 'bg-surface text-text-secondary border-border hover:border-text-secondary hover:text-text'
        }`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 z-50 min-w-[200px] max-w-[280px] bg-surface border border-border rounded-dialog shadow-md p-1.5 max-h-72 overflow-y-auto ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === selectedValue;
            return (
              <button
                key={String(option.value ?? idx)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-control text-xs transition-colors flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-text hover:bg-surface-2 font-normal'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-accent" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface FilterPillButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function FilterPillButton({
  label,
  isActive,
  onClick,
  icon,
  className = '',
  ariaLabel,
}: FilterPillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={ariaLabel || label}
      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border outline-hidden focus-visible:ring-2 focus-visible:ring-accent select-none shrink-0 ${
        isActive
          ? 'bg-accent text-accent-ink border-accent shadow-xs'
          : 'bg-surface text-text-secondary border-border hover:border-text-secondary hover:text-text'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
