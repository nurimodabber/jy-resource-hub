import React, { useRef, useState, useEffect, useCallback } from 'react';
import { uiText } from './closeLabel';
import { RotateCcw } from 'lucide-react';

export interface ScrollableFilterBarProps {
  children: React.ReactNode;
  activeFilterCount?: number;
  onClearAll?: () => void;
  clearLabel?: string;
  className?: string;
}

export const ScrollableFilterBar: React.FC<ScrollableFilterBarProps> = ({
  children,
  activeFilterCount = 0,
  onClearAll,
  clearLabel = 'Filter zurücksetzen',
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(checkScroll);
      observer.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      if (observer) observer.disconnect();
    };
  }, [checkScroll]);

  return (
    <div className={`relative w-full mb-4 select-none ${className}`}>
      {/* Left overflow fade */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg to-transparent pointer-events-none z-10 transition-opacity duration-150 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Right overflow fade */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg to-transparent pointer-events-none z-10 transition-opacity duration-150 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full py-0.5 snap-x snap-mandatory scroll-smooth"
        role="toolbar"
        aria-label={uiText('Filter-Optionen', 'Filter options')}
      >
        {children}

        {/* Clear all filters button */}
        {activeFilterCount > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-semibold text-text-secondary hover:text-text rounded-full hover:bg-surface-2 transition-colors shrink-0 snap-start focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            aria-label={clearLabel}
            title={clearLabel}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{clearLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
