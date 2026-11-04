import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Language } from '../../types';

export interface FilterToggleProps {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
  language: Language;
  controlsId?: string;
}

// One filter button for every list page. Games, quotes and projects each used to build their own,
// and the shapes drifted apart (rounded square vs. pill). Shape rule: search fields are pills,
// this button is a 44px circle on phones and a pill with label from sm up, like the other round controls.
export const FilterToggle: React.FC<FilterToggleProps> = ({ open, activeCount, onToggle, language, controlsId }) => {
  const isDe = language === 'de';
  const highlighted = open || activeCount > 0;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-label={open ? (isDe ? 'Filter schließen' : 'Hide filters') : (isDe ? 'Filter öffnen' : 'Show filters')}
      className={`relative h-11 w-11 sm:w-auto sm:px-4 rounded-full border text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
        highlighted
          ? 'bg-accent/12 border-accent/40 text-accent hover:bg-accent/18'
          : 'bg-surface hover:bg-surface-2 border-border/80 text-text-secondary hover:text-text'
      }`}
    >
      <SlidersHorizontal className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">{isDe ? 'Filter' : 'Filters'}</span>
      {activeCount > 0 && (
        <span className="absolute -top-1 -right-1 sm:static min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-accent-contrast text-2xs font-bold inline-flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
};
