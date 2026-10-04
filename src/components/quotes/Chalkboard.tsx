import React, { useState, useMemo } from 'react';
import { Eraser, RotateCcw, Sparkles } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

interface ChalkboardProps {
  quote: QuoteItem;
  language: Language;
}

export const Chalkboard: React.FC<ChalkboardProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const currentWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);

  const handleEraseMoreWords = () => {
    const unhidden = currentWords.map((_, i) => i).filter((i) => !hiddenIndices.includes(i));
    if (unhidden.length === 0) return;
    const countToHide = Math.min(unhidden.length, Math.floor(Math.random() * 2) + 2);
    const shuffled = [...unhidden].sort(() => 0.5 - Math.random());
    setHiddenIndices((prev) => [...prev, ...shuffled.slice(0, countToHide)]);
  };

  const handleResetChalkboard = () => {
    setHiddenIndices([]);
  };

  const allHidden = hiddenIndices.length === currentWords.length;
  const visibleCount = currentWords.length - hiddenIndices.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.boardSubtitle}</p>
        <span className="font-mono text-2xs bg-surface-2 border border-border px-3 py-1 rounded-full text-text self-start sm:self-auto shrink-0">
          {visibleCount} / {currentWords.length} {t.wordsRemaining}
        </span>
      </div>

      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-12 text-center space-y-6 shadow-xs">
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed text-text min-h-[140px]">
          {currentWords.map((word, idx) => {
            const isHidden = hiddenIndices.includes(idx);
            const punctuation = word.replace(/[a-zA-ZäöüÄÖÜß0-9]/g, '');

            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setHiddenIndices((prev) =>
                    prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                  );
                }}
                className={`cursor-pointer transition-all duration-200 select-none px-2 py-0.5 rounded-lg font-serif text-xl sm:text-3xl focus:outline-hidden ${
                  isHidden
                    ? 'text-text-tertiary border-b-2 border-border opacity-40 font-mono tracking-widest'
                    : 'text-text hover:text-accent-text hover:bg-surface-2'
                }`}
                title={language === 'de' ? 'Klicken zum Ein-/Ausblenden' : 'Click to toggle'}
              >
                {isHidden ? `____${punctuation}` : word}
              </button>
            );
          })}
        </div>

        {allHidden ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.allWordsHidden}</span>
          </div>
        ) : (
          <p className="text-xs text-text-tertiary font-serif italic">
            — {quote.source[language]} ({quote.book[language]})
          </p>
        )}

        <div className="flex items-center justify-center gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleEraseMoreWords}
            disabled={allHidden}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-semibold text-xs transition-colors shadow-xs cursor-pointer min-h-[40px] disabled:opacity-40"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>{t.eraseNextWord}</span>
          </button>

          <button
            type="button"
            onClick={handleResetChalkboard}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetBoard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
