import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Shuffle } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

interface CodeClickerProps {
  quote: QuoteItem;
  language: Language;
}

interface ActionBadge {
  type: 'clap' | 'snap' | 'stomp';
  icon: string;
  labelDe: string;
  labelEn: string;
}

const ACTIONS: ActionBadge[] = [
  { type: 'clap', icon: '👏', labelDe: 'Klatschen', labelEn: 'Clap' },
  { type: 'snap', icon: '🫰', labelDe: 'Schnippen', labelEn: 'Snap' },
  { type: 'stomp', icon: '🦶', labelDe: 'Stampfen', labelEn: 'Stomp' },
];

export const CodeClicker: React.FC<CodeClickerProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const rawWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  // Taboo word assignments: Map of cleanWord.toLowerCase() -> ActionBadge
  const [tabooWords, setTabooWords] = useState<Record<string, ActionBadge>>({});

  const pickRandomCodeWords = useCallback(() => {
    const uniqueCleanWords = Array.from(
      new Set(rawWords.map((w) => w.replace(/[.,;:!?„"«»]/g, '').toLowerCase()))
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

  const handleToggleTaboo = (word: string) => {
    const clean = word.replace(/[.,;:!?„"«»]/g, '').toLowerCase();
    setTabooWords((prev) => {
      const next = { ...prev };
      if (next[clean]) {
        delete next[clean];
      } else {
        next[clean] = ACTIONS[0];
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.codeClickerSubtitle}</p>
        <span className="font-mono text-2xs bg-surface-2 border border-border px-3 py-1 rounded-full text-text self-start sm:self-auto shrink-0">
          {Object.keys(tabooWords).length} {language === 'de' ? 'Aktionswörter aktiv' : 'Action words active'}
        </span>
      </div>

      {/* Main Reading Canvas */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
        {/* Active Action Words Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent-text border border-accent/20 cursor-pointer hover:bg-accent/20 transition-colors"
                  title={language === 'de' ? 'Klicken zum Entfernen' : 'Click to remove'}
                >
                  <span>{action.icon}</span>
                  <span className="capitalize">{word}</span>
                  <span className="text-2xs text-accent-text">({language === 'de' ? action.labelDe : action.labelEn})</span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={pickRandomCodeWords}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-text hover:bg-surface-2 rounded-full transition-colors border border-border cursor-pointer min-h-[32px]"
          >
            <Shuffle className="w-3 h-3 text-accent-text" />
            <span>{t.newCodeWords}</span>
          </button>
        </div>

        {/* Text with replaced words */}
        <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed text-text text-center min-h-[140px]">
          {rawWords.map((word, idx) => {
            const clean = word.replace(/[.,;:!?„"«»]/g, '').toLowerCase();
            const punctuation = word.replace(/[a-zA-ZäöüÄÖÜß0-9]/g, '');
            const action = tabooWords[clean];

            return (
              <button
                type="button"
                key={idx}
                onClick={() => handleToggleTaboo(word)}
                className={`cursor-pointer transition-all duration-200 select-none px-2 py-0.5 rounded-xl font-serif text-xl sm:text-3xl ${
                  action
                    ? 'bg-accent-subtle text-accent-text font-bold border border-accent/30'
                    : 'hover:bg-surface-2'
                }`}
                title={language === 'de' ? 'Klicken zum Umschalten' : 'Click to toggle'}
              >
                {action ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-xs font-sans uppercase font-bold text-accent-text">
                      [{language === 'de' ? action.labelDe : action.labelEn}]
                    </span>
                    <span className="opacity-70">{punctuation}</span>
                  </span>
                ) : (
                  word
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
          <span className="font-serif italic">— {quote.source[language]}</span>
          <span className="text-2xs text-text-tertiary">
            {language === 'de' ? 'Tipp: Klicke auf jedes Wort, um es als Aktionswort festzulegen.' : 'Tip: Click any word to set or unset it as an action trigger.'}
          </span>
        </div>
      </div>
    </div>
  );
};
