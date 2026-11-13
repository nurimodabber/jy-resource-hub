import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shuffle, ArrowLeft, ArrowRight, HelpCircle, 
  ExternalLink, BookOpen
} from 'lucide-react';
import { Language } from '../../types';
import { DISCUSSION_CARDS } from '../../data/toolkits';
import { shuffle, stripQuotes } from '../../utils/random';
import { tr, Panel, primaryBtn } from './common';
import { getBahaiLibraryUrl } from '../../utils/libraryLinks';

export const CardsTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [showHelp, setShowHelp] = useState(false);

  // Kein Themenfilter mehr: 24 Themen mit je einer Karte machten ihn nutzlos, am Handy war er zudem abgeschnitten.
  const [deck, setDeck] = useState(() => shuffle(DISCUSSION_CARDS));
  const [i, setI] = useState(0);

  const card = deck[i];
  const deepening = useMemo(() => card?.deepeningQuestions[language] ?? [], [card, language]);

  const next = useCallback(() => {
    if (i + 1 >= deck.length) {
      setDeck(shuffle(DISCUSSION_CARDS));
      setI(0);
    } else {
      setI((curr) => curr + 1);
    }
  }, [i, deck.length]);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);

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

  const quoteText = card ? stripQuotes(card.quoteSnippet[language]) : '';
  const formattedQuote = language === 'de' ? `„${quoteText}“` : `“${quoteText}”`;

  return (
    <div className="space-y-4">
      {/* 1. Compact Unified Toolbar: Counter, Prev/Next, Shuffle & Help */}
      <div className="bg-surface rounded-card border border-border p-2.5 sm:p-3 space-y-2 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-text-secondary tabular-nums font-semibold px-1">
            {deck.length > 0 ? `${i + 1} / ${deck.length}` : '0 / 0'}
          </span>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={prev}
              disabled={i === 0}
              className="p-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              title={L('Vorherige Karte', 'Previous card')}
              aria-label={L('Vorherige Karte', 'Previous card')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={deck.length <= 1}
              className="p-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              title={L('Nächste Karte', 'Next card')}
              aria-label={L('Nächste Karte', 'Next card')}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleShuffle}
              className="p-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ml-0.5"
              title={L('Neu mischen', 'Shuffle deck')}
              aria-label={L('Neu mischen', 'Shuffle deck')}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`p-2 rounded-control border text-xs font-semibold flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
                showHelp
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-surface-2 hover:bg-surface-raised border-border text-text-secondary hover:text-text'
              }`}
              title={L('Hilfe', 'Help')}
              aria-label={L('Hilfe', 'Help')}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Help */}
      {showHelp && (
        <div className="bg-surface-2 rounded-card border border-border p-3 text-xs text-text-secondary leading-relaxed animate-in fade-in duration-150">
          <p>
            {L(
              'Gesprächskarten für Reflexionsrunden im Kreis. Lies die Karte vor und vertiefe das Gespräch mit den Zusatzfragen. Zitate enthalten anklickbare Quellen zur Bahá’í-Bibliothek.',
              'Conversation cards for reflection in the circle. Read the card aloud and deepen the discussion with follow-up questions. All quotes include clickable source links.'
            )}
          </p>
        </div>
      )}

      <>
          {/* Main Card View with Swipe gesture */}
          {card && (
            <Panel className="py-5 sm:py-8 space-y-4 sm:space-y-5 select-none touch-pan-y shadow-xs">
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="space-y-6"
              >
                {/* Theme & book as a plain meta line (no pills above the heading) */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-accent-text font-semibold inline-flex items-center">
                    {card.theme[language]}
                  </span>
                  {card.book && (
                    <span className="text-text-secondary font-medium inline-flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-text-tertiary" />
                      {card.book[language]}
                    </span>
                  )}
                </div>

                {/* Core Discussion Question */}
                <h2 className="text-2xl sm:text-3xl font-bold text-text leading-snug text-balance">
                  {stripQuotes(card.coreQuestion[language])}
                </h2>

                {/* Sacred Quote in Lora Serif font with clickable authoritative source */}
                <div className="my-6 py-1.5 space-y-2">
                  <blockquote className="font-serif text-lg sm:text-xl text-text leading-relaxed italic select-text">
                    {formattedQuote}
                  </blockquote>
                  {card.source && (
                    <cite className="not-italic flex items-baseline gap-1 text-xs sm:text-sm text-text-secondary font-sans font-medium">
                      —{' '}
                      <a
                        href={getBahaiLibraryUrl(card.source[language], language)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={
                          language === 'de'
                            ? `Quelle „${card.source.de}“ in der Bahá'í-Bibliothek öffnen`
                            : `Open source "${card.source.en}" in Bahá'í Reference Library`
                        }
                        className="hover:text-accent hover:underline inline-flex items-center gap-1 transition-colors group/src"
                      >
                        <span>{card.source[language]}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/src:opacity-80 transition-opacity shrink-0" />
                      </a>
                    </cite>
                  )}
                </div>

                {/* Deepening Questions */}
                {deepening.length > 0 && (
                  <div className="pt-6 border-t border-border space-y-3">
                    <p className="text-xs font-bold text-text-secondary">
                      {L('Zum Vertiefen im Kreis', 'To go deeper in the circle')}
                    </p>
                    <ul className="space-y-2.5 text-sm sm:text-base text-text-secondary leading-relaxed">
                      {deepening.map((q, k) => (
                        <li key={k} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Bottom Action Button */}
          <button type="button" onClick={next} className={`${primaryBtn} w-full`}>
            <span>{L('Nächste Karte', 'Next card')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
      </>
    </div>
  );
};
