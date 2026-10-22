import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Shuffle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { Language } from '../../../types';
import { STORY_STARTERS, StoryStarter } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn, chipCls } from '../../tools/common';

interface StoryStarterCompanionProps {
  language: Language;
}

export const StoryStarterCompanion: React.FC<StoryStarterCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [storyMode, setStoryMode] = useState<'word' | 'sentence'>('word');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const filteredStarters = useMemo(() => {
    if (!selectedGenre) return STORY_STARTERS;
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
    <div className="space-y-6 text-center">
      {/* Mode Selector: Word vs Sentence */}
      <div className="bg-surface-2/60 p-1.5 rounded-control border border-border inline-flex items-center gap-1 mx-auto" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={storyMode === 'word'}
          onClick={() => setStoryMode('word')}
          className={`px-3.5 py-1.5 min-h-[38px] rounded-control text-xs font-bold transition-all cursor-pointer ${
            storyMode === 'word'
              ? 'bg-accent text-accent-contrast shadow-xs'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          {L('Wort für Wort', 'Word by word')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={storyMode === 'sentence'}
          onClick={() => setStoryMode('sentence')}
          className={`px-3.5 py-1.5 min-h-[38px] rounded-control text-xs font-bold transition-all cursor-pointer ${
            storyMode === 'sentence'
              ? 'bg-accent text-accent-contrast shadow-xs'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          {L('Satz für Satz', 'Sentence by sentence')}
        </button>
      </div>

      {/* Quick Rule Reminder Pill */}
      <p className="text-2xs text-text-tertiary">
        {storyMode === 'word'
          ? L('Spielregel: Reihum steuert jede Person genau 1 Wort bei.', 'Rule: Each person contributes exactly 1 word in turn.')
          : L('Spielregel: Reihum steuert jede Person genau 1 vollständigen Satz bei.', 'Rule: Each person contributes exactly 1 full sentence in turn.')}
      </p>

      {/* Genre Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedGenre(null)}
          className={chipCls(selectedGenre === null)}
        >
          {L('Alle Genres', 'All genres')}
        </button>
        {Object.entries(genreLabels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedGenre(key)}
            className={chipCls(selectedGenre === key)}
          >
            {label[language]}
          </button>
        ))}
      </div>

      {/* Header index & Shuffle */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
          {current?.genre && (
            <span className="text-accent mr-2">
              • {genreLabels[current.genre]?.[language]}
            </span>
          )}
          {index + 1} / {deck.length}
        </span>

        <button
          type="button"
          onClick={handleShuffle}
          className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
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
        <Panel className="p-8 sm:p-14 min-h-[240px] flex flex-col justify-center items-center text-center space-y-4">
          <BookOpen className="w-6 h-6 text-accent" />
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text tracking-tight max-w-xl leading-relaxed font-serif">
            „{current?.text[language]}“
          </div>
          <p className="text-2xs text-text-tertiary pt-2">
            {L('Wische oder tippe auf Weiter für den nächsten Anfang', 'Swipe or click next for another opener')}
          </p>
        </Panel>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{L('Vorheriger', 'Previous')}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`${primaryBtn} px-6 py-2.5 min-h-[44px] text-sm sm:text-base flex items-center gap-1.5`}
        >
          <span>{L('Nächster Anfang', 'Next opener')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
