import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shuffle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Maximize2,
  Minimize2,
  VolumeX,
} from 'lucide-react';
import { Language } from '../../../types';
import { SORT_CRITERIA, SortCriterion, SortCategory } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn, chipCls } from '../../tools/common';
import { useWakeLock } from '../../../hooks/useWakeLock';

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
  const [isBeamer, setIsBeamer] = useState(false);

  useWakeLock(isBeamer);

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

  // Keyboard navigation (Arrow keys & Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape' && isBeamer) {
        setIsBeamer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isBeamer]);

  return (
    <div className="space-y-6 text-center">
      {/* Intro Box */}
      <div className="p-4 rounded-card bg-surface-2 border border-border space-y-1 text-left">
        <h2 className="text-sm font-bold text-text flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{L('Schweigend sortieren Begleiter', 'Silent Sort Companion')}</span>
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          {L(
            'Alle sortieren sich schweigend in einer Reihe nach dem angezeigten Kriterium. Kein Sprechen, kein Flüstern – nur Zeichensprache, Mimik und Gesten sind erlaubt.',
            'Everyone silently lines up according to the displayed criterion. No talking, no whispering – only sign language, facial expressions and gestures are permitted.'
          )}
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label={L('Kategorien', 'Categories')}>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
          className={chipCls(selectedCategory === 'all')}
        >
          {L('Alle Kriterien', 'All criteria')} ({SORT_CRITERIA.length})
        </button>
        {(Object.keys(CATEGORY_LABELS) as SortCategory[]).map((catKey) => {
          const count = SORT_CRITERIA.filter((c) => c.category === catKey).length;
          return (
            <button
              key={catKey}
              type="button"
              role="tab"
              aria-selected={selectedCategory === catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={chipCls(selectedCategory === catKey)}
            >
              {CATEGORY_LABELS[catKey][language]} ({count})
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
          {current?.category && (
            <span className="text-accent font-semibold">
              • {CATEGORY_LABELS[current.category]?.[language]}
            </span>
          )}
          <span>
            {index + 1} / {deck.length}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            title={L('Kriterien dieser Kategorie neu mischen', 'Reshuffle criteria in this category')}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{L('Mischen', 'Shuffle')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBeamer(true)}
            className="px-3.5 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-text-secondary" />
            <span>{L('Beamer-Modus', 'Projector view')}</span>
          </button>
        </div>
      </div>

      {/* Main Criterion Card */}
      <Panel className="p-8 sm:p-14 min-h-[240px] flex flex-col justify-center items-center text-center space-y-4">
        <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20">
          <VolumeX className="w-3.5 h-3.5" />
          <span>{L('Schweigend ordnen · Gesten erlaubt', 'Sort silently · Gestures only')}</span>
        </div>

        <div className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight max-w-xl leading-snug">
          „{current?.text[language]}“
        </div>

        <p className="text-2xs text-text-tertiary pt-2">
          {L('Tipp: Taste Rechts oder Leertaste für das nächste Kriterium', 'Tip: Right arrow or space for next criterion')}
        </p>
      </Panel>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{L('Vorheriges', 'Previous')}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`${primaryBtn} px-6 py-2.5 min-h-[44px] text-sm sm:text-base flex items-center gap-1.5`}
        >
          <span>{L('Nächstes Kriterium', 'Next criterion')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* BEAMER / PRESENTATION FULLSCREEN OVERLAY                                  */}
      {/* ========================================================================= */}
      {isBeamer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={L('Schweigend sortieren Beamer-Modus', 'Silent sort projector view')}
          className="fixed inset-0 z-50 bg-[#0D131F] text-text flex flex-col justify-between p-6 sm:p-12 select-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              {L('Schweigend sortieren', 'Silent Sort')}
              {current?.category && ` · ${CATEGORY_LABELS[current.category]?.[language]}`} · {index + 1} / {deck.length}
            </span>

            <button
              type="button"
              onClick={() => setIsBeamer(false)}
              className="px-4 py-2 min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{L('Schließen (Esc)', 'Exit (Esc)')}</span>
            </button>
          </div>

          <div className="my-auto text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-400 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30">
              <VolumeX className="w-4 h-4" />
              <span>{L('Schweigend ordnen · Gesten erlaubt', 'Sort silently · Gestures only')}</span>
            </div>

            <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
              „{current?.text[language]}“
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={index === 0}
              onClick={handlePrev}
              className="px-6 py-3 min-h-[48px] rounded-control bg-white/10 hover:bg-white/20 text-sm font-bold text-text disabled:opacity-30 cursor-pointer"
            >
              {L('Vorheriges', 'Previous')}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-10 py-3 min-h-[48px] rounded-control bg-accent hover:bg-accent-hover text-accent-contrast font-extrabold text-base cursor-pointer shadow-2"
            >
              {L('Nächstes Kriterium', 'Next criterion')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
