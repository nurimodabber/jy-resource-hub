import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Shuffle } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';
import { splitWord } from './textParts';

const keyOf = (word: string) => splitWord(word).core.toLowerCase();

interface CodeClickerProps {
  quote: QuoteItem;
  language: Language;
}

interface ActionBadge {
  type: 'clap' | 'snap' | 'stomp';
  labelDe: string;
  labelEn: string;
}

const ACTIONS: ActionBadge[] = [
  { type: 'clap', labelDe: 'Klatschen', labelEn: 'Clap' },
  { type: 'snap', labelDe: 'Schnippen', labelEn: 'Snap' },
  { type: 'stomp', labelDe: 'Stampfen', labelEn: 'Stomp' },
];

export const CodeClicker: React.FC<CodeClickerProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const rawWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  // Taboo word assignments: Map of cleanWord.toLowerCase() -> ActionBadge
  const [tabooWords, setTabooWords] = useState<Record<string, ActionBadge>>({});

  const pickRandomCodeWords = useCallback(() => {
    const uniqueCleanWords = Array.from(
      new Set(rawWords.map(keyOf))
    ).filter((w) => w.length >= 2);

    if (uniqueCleanWords.length === 0) return;

    const shuffled = [...uniqueCleanWords].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(2, shuffled.length));

    const mapping: Record<string, ActionBadge> = {};
    if (picked[0]) mapping[picked[0]] = ACTIONS[0];
    if (picked[1]) mapping[picked[1]] = ACTIONS[1];

    setTabooWords(mapping);
  }, [rawWords]);

  useEffect(() => {
    pickRandomCodeWords();
  }, [pickRandomCodeWords]);

  // Each tap moves a word to the next action (Klatschen, Schnippen, Stampfen) and then back to normal.
  const handleToggleTaboo = (clean: string) => {
    if (!clean) return;
    setTabooWords((prev) => {
      const next = { ...prev };
      const pos = next[clean] ? ACTIONS.indexOf(next[clean]) : -1;
      if (pos === ACTIONS.length - 1) delete next[clean];
      else next[clean] = ACTIONS[pos + 1];
      return next;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.codeClickerSubtitle}</p>
        <span className="tabular-nums text-2xs bg-surface-2 border border-border px-3 py-1 rounded-lg text-text self-start sm:self-auto shrink-0">
          {Object.keys(tabooWords).length} {language === 'de' ? 'Aktionswörter aktiv' : 'Action words active'}
        </span>
      </div>

      {/* Main Reading Canvas */}
      <div className="bg-surface rounded-card border border-border p-4 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        {/* Active Action Words Pills */}
        <div className="pb-3 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">{t.codeWordsLabel}</span>
            {Object.entries(tabooWords).length === 0 ? (
              <span className="text-xs text-text-tertiary italic">
                {language === 'de' ? 'Klicke auf beliebige Wörter im Text, um sie zu Tabus zu machen.' : 'Click words in the text to turn them into action triggers.'}
              </span>
            ) : (
              Object.entries(tabooWords).map(([word, action]) => (
                <button
                  type="button"
                  key={word}
                  onClick={() => handleToggleTaboo(word)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs bg-accent-subtle text-accent-text border border-accent/20 cursor-pointer hover:bg-accent/20 transition-colors min-h-[44px]"
                  title={language === 'de' ? 'Klicken zum Wechseln' : 'Click to change'}
                >
                  <span className="font-semibold">{word}</span>
                  <span aria-hidden="true">·</span>
                  <span>{language === 'de' ? action.labelDe : action.labelEn}</span>
                </button>
              ))
            )}
          </div>

        </div>

        {/* Text with replaced words */}
        <div className="flex flex-wrap justify-center items-center gap-0 font-serif text-xl sm:text-3xl leading-relaxed text-text text-center min-h-[140px] pr-[var(--quote-gap)]">
          {rawWords.map((word, idx) => {
            const { lead, core, trail } = splitWord(word);
            const action = tabooWords[core.toLowerCase()];

            return (
              <button
                type="button"
                key={idx}
                onClick={() => handleToggleTaboo(core.toLowerCase())}
                className="cursor-pointer transition-colors duration-200 select-none px-1 min-h-[44px] rounded-control font-serif text-xl sm:text-3xl hover:bg-surface-2 outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                title={language === 'de' ? 'Klicken zum Wechseln' : 'Click to change'}
              >
                {action ? (
                  <>
                    {lead}
                    <span className="inline-flex items-center align-middle px-2.5 py-1 rounded-control bg-accent-subtle text-accent-text border border-accent/30 font-sans text-sm sm:text-base font-semibold">
                      {language === 'de' ? action.labelDe : action.labelEn}
                    </span>
                    {trail}
                  </>
                ) : (
                  word
                )}
              </button>
            );
          })}
        </div>

        {/* Shuffle sits under the text: it is used once per round and cost a line above the quote. */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
          <button
            type="button"
            onClick={pickRandomCodeWords}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-text hover:bg-surface-2 rounded-control transition-colors border border-border cursor-pointer min-h-[44px]"
          >
            <Shuffle className="w-3.5 h-3.5 text-accent-text" />
            <span>{t.newCodeWords}</span>
          </button>
          <span className="font-serif italic">— {quote.source[language]}</span>
          <span className="text-2xs text-text-tertiary">
            {language === 'de' ? 'Tippe auf ein Wort: Klatschen, Schnippen, Stampfen, dann wieder normal.' : 'Tap a word: clap, snap, stomp, then back to normal.'}
          </span>
        </div>
      </div>
    </div>
  );
};
