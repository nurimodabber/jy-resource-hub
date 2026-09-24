import React, { useState, useMemo, useEffect } from 'react';
import { Eraser, RotateCcw, Eye, Sparkles } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#86868b]">
        <p>{t.firstLetterSubtitle}</p>
        <span className="font-mono text-[11px] bg-black/[0.04] px-3 py-1 rounded-full text-[#1d1d1f] self-start sm:self-auto shrink-0">
          {visibleInitialsCount} / {rawWords.length} {t.wordsRemaining}
        </span>
      </div>

      {/* Blackboard Canvas */}
      <div className="bg-[#1d1d1f] text-white rounded-2xl p-8 sm:p-12 shadow-inner border border-black/40 space-y-6 text-center">
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed tracking-wide min-h-[140px]">
          {rawWords.map((word, idx) => {
            const state = wordStates[idx] || 'initial';
            const cleanWord = word.replace(/[.,;:!?„"«»]/g, '');
            const punctuation = word.replace(/[a-zA-ZäöüÄÖÜß0-9]/g, '');
            const initialChar = cleanWord.charAt(0);
            const underscores = '_'.repeat(Math.max(1, Math.min(cleanWord.length - 1, 4)));

            return (
              <span
                key={idx}
                onClick={() => handleToggleWord(idx)}
                className={`cursor-pointer transition-all duration-200 select-none inline-block ${
                  state === 'revealed'
                    ? 'text-emerald-400 font-bold px-1.5 py-0.5 bg-white/10 rounded-lg'
                    : state === 'blank'
                    ? 'text-neutral-600 border-b border-neutral-700 px-1.5'
                    : 'text-neutral-100 hover:text-emerald-300'
                }`}
                title={t.tapWordHint}
              >
                {state === 'revealed' && word}
                {state === 'initial' && (
                  <span>
                    <strong className="text-white font-bold">{initialChar}</strong>
                    <span className="opacity-40">{underscores}</span>
                    <span className="opacity-70">{punctuation}</span>
                  </span>
                )}
                {state === 'blank' && (
                  <span>
                    ____<span className="opacity-70">{punctuation}</span>
                  </span>
                )}
              </span>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <span className="font-serif italic">— {quote.source[language]} ({quote.book[language]})</span>
          <span className="text-[11px] text-neutral-400">
            {t.tapWordHint}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleEraseNext}
            disabled={wordStates.every((s) => s === 'blank')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0071e3] text-white text-xs font-semibold rounded-full hover:bg-[#0077ed] disabled:opacity-40 transition-all shadow-apple-pill"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>{t.eraseInitialsBtn}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-black/[0.08] text-[#1d1d1f] text-xs font-medium rounded-full hover:bg-black/[0.04] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetInitials}</span>
          </button>
        </div>

        {wordStates.every((s) => s === 'blank') && (
          <p className="text-xs font-semibold text-emerald-600 animate-in fade-in flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.allInitialsHidden}</span>
          </p>
        )}
      </div>
    </div>
  );
};
