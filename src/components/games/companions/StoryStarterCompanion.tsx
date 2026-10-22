import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Shuffle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Language } from '../../../types';
import { STORY_STARTERS, StoryStarter } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn } from '../../tools/common';

interface StoryStarterCompanionProps {
  language: Language;
}

export const StoryStarterCompanion: React.FC<StoryStarterCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const filteredStarters = useMemo(() => {
    if (selectedGenre === 'all') return STORY_STARTERS;
    return STORY_STARTERS.filter((s) => s.genre === selectedGenre);
  }, [selectedGenre]);

  const [deck, setDeck] = useState<StoryStarter[]>(() => shuffle(STORY_STARTERS));
  const [index, setIndex] = useState(0);

  // When genre filter changes, reshuffle filtered starters
  useEffect(() => {
    setDeck(shuffle(filteredStarters));
    setIndex(0);
  }, [filteredStarters]);

  const current = deck[index] || deck[0];

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleShuffle = () => {
    setDeck(shuffle(filteredStarters));
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

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const genreLabels: Record<string, { de: string; en: string }> = {
    adventure: { de: 'Abenteuer', en: 'Adventure' },
    mystery: { de: 'Mysterium', en: 'Mystery' },
    funny: { de: 'Lustig', en: 'Funny' },
    fantasy: { de: 'Fantasie', en: 'Fantasy' },
    everyday: { de: 'Alltag', en: 'Everyday' },
  };

  return (
    <div className="space-y-4 text-center max-w-xl mx-auto">
      {/* Top Toolbar: Dropdown Genre Selection · Index · Shuffle */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              aria-label={L('Genre wählen', 'Choose genre')}
              className="appearance-none pl-3 pr-8 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text cursor-pointer focus:border-accent focus:outline-hidden transition-colors"
            >
              <option value="all">{L('Alle Genres', 'All genres')} ({STORY_STARTERS.length})</option>
              {Object.entries(genreLabels).map(([key, label]) => {
                const count = STORY_STARTERS.filter((s) => s.genre === key).length;
                return (
                  <option key={key} value={key}>
                    {label[language]} ({count})
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

      {/* Story Starter Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="touch-pan-y"
      >
        <Panel className="p-6 sm:p-10 min-h-[220px] flex flex-col justify-center items-center text-center space-y-3">
          <BookOpen className="w-6 h-6 text-accent shrink-0" strokeWidth={1.75} />
          <div className="text-xl sm:text-2xl font-bold text-text tracking-tight max-w-lg leading-relaxed font-serif">
            „{current?.text[language]}“
          </div>
          <p className="text-2xs text-text-tertiary pt-1">
            {L('Reihum die Geschichte weiterspinnen · Wische oder tippe auf Weiter', 'Continue the story in turn · Swipe or tap next')}
          </p>
        </Panel>
      </div>

      {/* Navigation Controls */}
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
          <span>{L('Nächster Anfang', 'Next opener')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};