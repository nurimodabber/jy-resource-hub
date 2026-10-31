import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number }>({ top: 0, left: 0 });

  const updateCoords = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 220;
    const padding = 12;

    let left: number | undefined;
    let right: number | undefined;

    if (align === 'right' || rect.left + menuWidth > window.innerWidth - padding) {
      right = Math.max(padding, window.innerWidth - rect.right);
    } else {
      left = Math.max(padding, rect.left);
    }

    setCoords({
      top: rect.bottom + 6,
      left,
      right,
    });
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }
      updateCoords();
    };

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updateCoords]);

  const displayLabel = isActive && activeLabel ? activeLabel : label;

  return (
    <div className={`relative inline-block shrink-0 snap-start ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg select-none shrink-0 cursor-pointer ${
          isActive
            ? 'liquid-pill-primary border-white/20'
            : 'liquid-pill-secondary'
        }`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="max-w-[150px] truncate">{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              right: coords.right,
              zIndex: 9999,
            }}
            className="min-w-[200px] max-w-[320px] glass-surface border border-border rounded-dialog shadow-2 p-1.5 max-h-72 overflow-y-auto"
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
                  className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-control text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
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
          </div>,
          document.body
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
      className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg select-none shrink-0 snap-start cursor-pointer ${
        isActive
          ? 'liquid-pill-primary border-white/20'
          : 'liquid-pill-secondary'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
