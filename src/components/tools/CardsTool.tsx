import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Shuffle, ArrowLeft, ArrowRight, Maximize2, Minimize2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../../types';
import { DISCUSSION_CARDS } from '../../data/toolkits';
import { shuffle, stripQuotes } from '../../utils/random';
import { useWakeLock } from '../../hooks/useWakeLock';
import { tr, Panel, primaryBtn } from './common';

export const CardsTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [deck, setDeck] = useState(() => shuffle(DISCUSSION_CARDS));
  const [i, setI] = useState(0);
  const [isBeamer, setIsBeamer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useWakeLock(isBeamer);

  const card = deck[i];
  const deepening = useMemo(() => card?.deepeningQuestions[language] ?? [], [card, language]);

  const next = useCallback(() => {
    setI((curr) => {
      if (curr + 1 >= deck.length) {
        setDeck(shuffle(DISCUSSION_CARDS));
        return 0;
      }
      return curr + 1;
    });
  }, [deck.length]);

  const prev = useCallback(() => {
    setI((curr) => Math.max(0, curr - 1));
  }, []);

  const handleShuffle = () => {
    setDeck(shuffle(DISCUSSION_CARDS));
    setI(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape' && isBeamer) {
        setIsBeamer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, isBeamer]);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      next(); // Swiped left -> next
    } else if (diff < -50) {
      prev(); // Swiped right -> prev
    }
    touchStartX.current = null;
  };

  if (!card) return null;

  const quoteText = stripQuotes(card.quoteSnippet[language]);
  const formattedQuote = language === 'de' ? `„${quoteText}“` : `“${quoteText}”`;

  return (
    <div className="space-y-6">
      {/* "So geht's" Expandable Help */}
      <div className="bg-surface-2 rounded-card border border-border p-4">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-text" />
            <span>{L('So geht’s: Gesprächskarten im Kreis', 'How it works: Conversation cards')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Gesprächskarten für Reflexionsrunden im Kreis. Lass eine Karte vorlesen, gib der Gruppe Zeit zum Nachdenken und vertiefe das Gespräch mit den Zusatzfragen.',
              'Conversation cards for reflection in the circle. Read a card aloud, give the group time to think, and deepen the discussion with follow-up questions.'
            )}
          </p>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={i === 0}
            className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={L('Vorherige Karte', 'Previous card')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-tertiary tabular-nums font-semibold px-2">
            {i + 1} / {deck.length}
          </span>
          <button
            type="button"
            onClick={next}
            className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={L('Nächste Karte', 'Next card')}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={L('Neu mischen', 'Shuffle deck')}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsBeamer(true)}
            className="px-3.5 py-2 rounded-control bg-accent text-accent-contrast font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{L('Beamer', 'Projector')}</span>
          </button>
        </div>
      </div>

      {/* Main Card View with Swipe gesture */}
      <Panel
        className="py-8 sm:py-12 space-y-6 select-none touch-pan-y"
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="space-y-6"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-medium">
            <span className="px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary font-semibold">
              {card.theme[language]}
            </span>
            <span className="tabular-nums">
              {i + 1} / {deck.length}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-text leading-snug text-balance">
            {stripQuotes(card.coreQuestion[language])}
          </h2>

          {/* Reverent quote display in Lora serif font */}
          <div className="my-6 p-6 rounded-card bg-surface-2/60 border border-border">
            <blockquote className="font-serif text-lg sm:text-xl text-text leading-relaxed italic">
              {formattedQuote}
            </blockquote>
          </div>

          {deepening.length > 0 && (
            <div className="pt-6 border-t border-border space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {L('Zum Vertiefen', 'To go deeper')}
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-text-secondary leading-relaxed">
                {deepening.map((q, k) => (
                  <li key={k} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-text mt-2 shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Panel>

      {/* Bottom Action Button */}
      <button type="button" onClick={next} className={`${primaryBtn} w-full`}>
        <span>{L('Nächste Karte', 'Next card')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Beamer Fullscreen Presentation Mode */}
      {isBeamer && (
        <div
          className="fixed inset-0 z-80 bg-bg text-text p-6 sm:p-12 flex flex-col justify-between safe-top safe-bottom animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-surface-2 text-text font-bold text-xs">
                {card.theme[language]}
              </span>
              <span className="text-xs text-text-tertiary tabular-nums font-semibold">
                {i + 1} / {deck.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsBeamer(false)}
              className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised text-text font-bold text-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{L('Schließen', 'Close')}</span>
            </button>
          </div>

          {/* Centered Large Card Content */}
          <div className="my-auto max-w-4xl mx-auto w-full space-y-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-text leading-tight text-balance">
              {stripQuotes(card.coreQuestion[language])}
            </h2>

            <div className="p-8 sm:p-10 rounded-card bg-surface border border-border shadow-xs max-w-3xl mx-auto">
              <blockquote className="font-serif text-2xl sm:text-3xl text-text leading-relaxed italic">
                {formattedQuote}
              </blockquote>
            </div>

            {deepening.length > 0 && (
              <div className="max-w-2xl mx-auto text-left space-y-3 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary text-center">
                  {L('Zum Vertiefen', 'To go deeper')}
                </p>
                <div className="grid gap-2">
                  {deepening.map((q, k) => (
                    <div key={k} className="p-3 rounded-control bg-surface-2 text-sm sm:text-base text-text-secondary">
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar in Beamer mode */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={prev}
              disabled={i === 0}
              className="px-5 py-3 rounded-control bg-surface-2 hover:bg-surface-raised text-text font-bold text-sm disabled:opacity-30 cursor-pointer min-h-[48px] flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{L('Zurück', 'Previous')}</span>
            </button>
            <div className="text-xs text-text-tertiary hidden sm:block">
              {L('Pfeiltasten oder Leertaste zum Weiterschalten', 'Use arrow keys or space to advance')}
            </div>
            <button
              type="button"
              onClick={next}
              className="px-6 py-3 rounded-control bg-accent text-accent-contrast font-bold text-sm cursor-pointer min-h-[48px] flex items-center gap-2 shadow-xs"
            >
              <span>{L('Weiter', 'Next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
