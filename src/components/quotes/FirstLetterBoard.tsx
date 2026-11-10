import React, { useState, useMemo, useEffect } from 'react';
import { Eraser, RotateCcw, CheckCircle2 } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';
import { splitWord } from './textParts';
import { LetterSlots } from './LetterSlots';

interface FirstLetterBoardProps {
  quote: QuoteItem;
  language: Language;
}

export const FirstLetterBoard: React.FC<FirstLetterBoardProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const rawWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  // wordState: 'initial' | 'blank' | 'revealed'
  const [wordStates, setWordStates] = useState<('initial' | 'blank' | 'revealed')[]>([]);

  useEffect(() => {
    setWordStates(new Array(rawWords.length).fill('initial'));
  }, [quote, language, rawWords.length]);

  const handleEraseNext = () => {
    const initialIndices = wordStates
      .map((state, idx) => (state === 'initial' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (initialIndices.length === 0) return;

    // Pick 2-3 random initials to blank out
    const countToHide = Math.min(initialIndices.length, Math.floor(Math.random() * 2) + 2);
    const shuffled = [...initialIndices].sort(() => 0.5 - Math.random());
    const toBlank = shuffled.slice(0, countToHide);

    setWordStates((prev) => {
      const next = [...prev];
      toBlank.forEach((i) => {
        next[i] = 'blank';
      });
      return next;
    });
  };

  const handleReset = () => {
    setWordStates(new Array(rawWords.length).fill('initial'));
  };

  const handleToggleWord = (idx: number) => {
    setWordStates((prev) => {
      const next = [...prev];
      if (next[idx] === 'initial') next[idx] = 'revealed';
      else if (next[idx] === 'revealed') next[idx] = 'blank';
      else next[idx] = 'initial';
      return next;
    });
  };

  const visibleInitialsCount = wordStates.filter((s) => s === 'initial' || s === 'revealed').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.firstLetterSubtitle}</p>
        <span className="tabular-nums text-2xs bg-surface-2 border border-border px-3 py-1 rounded-control text-text self-start sm:self-auto shrink-0">
          {visibleInitialsCount} / {rawWords.length} {t.wordsRemaining}
        </span>
      </div>

      {/* Blackboard Canvas */}
      <div className="bg-surface-raised text-text rounded-card p-4 sm:p-10 shadow-xs border border-border space-y-4 sm:space-y-6 text-center">
        <div className="flex flex-wrap justify-center items-center gap-0 font-serif text-xl sm:text-3xl leading-relaxed min-h-[140px] pr-[var(--quote-gap)]">
          {rawWords.map((word, idx) => {
            const state = wordStates[idx] || 'initial';
            const { lead, core, trail } = splitWord(word);
            const [initialChar = '', ...rest] = Array.from(core);

            return (
              <button
                type="button"
                key={idx}
                onClick={() => handleToggleWord(idx)}
                className={`cursor-pointer transition-all duration-200 select-none px-1 min-h-[44px] rounded-control font-serif text-xl sm:text-3xl outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                  state === 'revealed'
                    ? 'text-accent-text font-semibold bg-accent-subtle'
                    : state === 'blank'
                    ? 'text-text-tertiary hover:bg-surface-2'
                    : 'text-text hover:bg-surface-2'
                }`}
                title={t.tapWordHint}
              >
                {state === 'revealed' && word}
                {state === 'initial' && (
                  <>
                    {lead}
                    <strong className="font-bold">{initialChar}</strong>
                    <span className="text-text-tertiary">
                      <LetterSlots text={rest.join('')} language={language} />
                    </span>
                    {trail}
                  </>
                )}
                {state === 'blank' && (
                  <>
                    {lead}
                    <LetterSlots text={core} language={language} />
                    {trail}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls right under the text, so they stay on screen on a phone. */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEraseNext}
              disabled={wordStates.every((s) => s === 'blank')}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-contrast text-xs font-semibold rounded-control hover:bg-accent-hover disabled:opacity-40 transition-colors shadow-xs cursor-pointer min-h-[44px]"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{t.eraseInitialsBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-control hover:bg-surface-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetInitials}</span>
            </button>
          </div>

          {wordStates.every((s) => s === 'blank') && (
            <p className="text-xs font-semibold text-success animate-in fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.allInitialsHidden}</span>
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
          <span className="font-serif italic">— {quote.source[language]} ({quote.book[language]})</span>
          <span className="text-2xs text-text-tertiary">
            {t.tapWordHint}
          </span>
        </div>
      </div>
    </div>
  );
};
