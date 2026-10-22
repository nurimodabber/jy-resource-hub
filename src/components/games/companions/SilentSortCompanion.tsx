import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shuffle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  VolumeX,
} from 'lucide-react';
import { Language } from '../../../types';
import { SORT_CRITERIA, SortCriterion, SortCategory } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn } from '../../tools/common';

interface SilentSortCompanionProps {
  language: Language;
}

const CATEGORY_LABELS: Record<SortCategory, { de: string; en: string }> = {
  zahlen: { de: 'Zahlen & Maße', en: 'Numbers & Sizes' },
  alltag: { de: 'Alltag & Rhythmus', en: 'Daily Life & Routine' },
  sprache: { de: 'Alphabet & Sprache', en: 'Alphabet & Language' },
  vorlieben: { de: 'Vorlieben & Freizeit', en: 'Preferences & Hobbies' },
};

export const SilentSortCompanion: React.FC<SilentSortCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [selectedCategory, setSelectedCategory] = useState<SortCategory | 'all'>('all');

  const filteredCriteria = useMemo(() => {
    if (selectedCategory === 'all') return SORT_CRITERIA;
    return SORT_CRITERIA.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  const [deck, setDeck] = useState<SortCriterion[]>(() => shuffle(SORT_CRITERIA));
  const [index, setIndex] = useState(0);

  // Reshuffle when category filter changes
  useEffect(() => {
    setDeck(shuffle(filteredCriteria));
    setIndex(0);
  }, [filteredCriteria]);

  const current = deck[index] || deck[0];

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleShuffle = () => {
    setDeck(shuffle(filteredCriteria));
    setIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="space-y-4 text-left w-full max-w-2xl">
      {/* Top Toolbar: Symmetrical single-row controls with Shuffle on the far right */}
      <div className="flex items-center justify-between gap-2.5 w-full flex-nowrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SortCategory | 'all')}
              aria-label={L('Kategorie wählen', 'Choose category')}
              className="appearance-none pl-3.5 pr-8 h-10 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text cursor-pointer focus:border-accent focus:outline-hidden transition-colors"
            >
              <option value="all">{L('Alle Kriterien', 'All criteria')} ({SORT_CRITERIA.length})</option>
              {(Object.keys(CATEGORY_LABELS) as SortCategory[]).map((catKey) => {
                const count = SORT_CRITERIA.filter((c) => c.category === catKey).length;
                return (
                  <option key={catKey} value={catKey}>
                    {CATEGORY_LABELS[catKey][language]} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-tertiary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-xs font-bold text-text-tertiary tabular-nums whitespace-nowrap px-2.5 py-1 rounded-full bg-surface-2 border border-border/60">
            {index + 1} / {deck.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="w-10 h-10 rounded-control bg-surface-2 hover:bg-surface-raised border border-border flex items-center justify-center text-text-secondary hover:text-text transition-colors cursor-pointer shrink-0 active:scale-95 ml-auto"
          title={L('Zufällig mischen', 'Shuffle')}
          aria-label={L('Zufällig mischen', 'Shuffle')}
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* Main Sort Criteria Card: Left-aligned, generous typography */}
      <Panel className="p-6 sm:p-8 space-y-4 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-2xs font-semibold text-text-secondary">
          <VolumeX className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{L('Schweigend sortieren – nur Gesten & Blicke', 'Silent sorting – gestures and eye contact only')}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-text tracking-tight leading-tight break-words">
          {current?.text[language]}
        </h3>
      </Panel>

      {/* Controls: Full-width symmetrical controls */}
      <div className="flex items-center justify-between gap-3 w-full">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="px-4 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{L('Zurück', 'Previous')}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`${primaryBtn} px-6 py-2.5 min-h-[44px] text-sm flex items-center gap-2 shadow-sm`}
        >
          <span>{L('Nächste Aufgabe', 'Next task')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
