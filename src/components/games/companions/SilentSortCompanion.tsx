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
    <div className="space-y-4 text-center max-w-xl mx-auto">
      {/* Top Toolbar: Dropdown Category Selection · Index · Shuffle */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SortCategory | 'all')}
              aria-label={L('Kategorie wählen', 'Choose category')}
              className="appearance-none pl-3 pr-8 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text cursor-pointer focus:border-accent focus:outline-hidden transition-colors"
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

          <span className="text-xs font-bold text-text-tertiary tabular-nums whitespace-nowrap">
            {index + 1} / {deck.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-[0.98]"
          title={L('Zufällig mischen', 'Shuffle')}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>{L('Mischen', 'Shuffle')}</span>
        </button>
      </div>

      {/* Main Sort Criteria Card */}
      <Panel className="p-6 sm:p-10 min-h-[220px] flex flex-col justify-center items-center text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-2xs font-semibold text-text-secondary">
          <VolumeX className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{L('Schweigend sortieren – nur Gesten & Blicke', 'Silent sorting – gestures and eye contact only')}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-text tracking-tight max-w-lg leading-snug">
          {current?.text[language]}
        </h3>
      </Panel>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto pt-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{L('Zurück', 'Previous')}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`${primaryBtn} px-6 py-2.5 min-h-[44px] text-sm flex items-center gap-1.5`}
        >
          <span>{L('Nächste Aufgabe', 'Next task')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};