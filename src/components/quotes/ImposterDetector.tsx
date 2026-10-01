import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, CheckCircle2, RotateCcw } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

interface ImposterDetectorProps {
  quote: QuoteItem;
  language: Language;
}

const DECOY_MAP: Record<string, string[]> = {
  // German decoys
  'Bergwerk': ['Schrank', 'Tresor', 'Palast', 'Brunnen'],
  'Edelsteinen': ['Goldmünzen', 'Diamanten', 'Schätzen', 'Büchern'],
  'Erziehung': ['Disziplin', 'Schule', 'Belehrung', 'Erfahrung'],
  'Schätze': ['Perlen', 'Wunder', 'Geheimnisse', 'Juwelen'],
  'Wahrhaftigkeit': ['Aufrichtigkeit', 'Ehrlichkeit', 'Rechtschaffenheit', 'Zuverlässigkeit'],
  'Grundlage': ['Wurzel', 'Basis', 'Fundament', 'Quelle'],
  'menschlichen': ['irdischen', 'geistigen', 'inneren', 'persönlichen'],
  'Tugenden': ['Kräfte', 'Eigenschaften', 'Werte', 'Geschenke'],
  'Herz': ['Gemüt', 'Wesen', 'Denken', 'Auge'],
  'rein': ['hell', 'klar', 'unschuldig', 'sauber'],
  'Licht': ['Sonne', 'Glanz', 'Feuer', 'Flamme'],
  'Taten': ['Worte', 'Absichten', 'Gedanken', 'Pläne'],
  // English decoys
  'mine': ['vault', 'palace', 'fountain', 'chest'],
  'gems': ['diamonds', 'jewels', 'coins', 'treasures'],
  'education': ['schooling', 'discipline', 'training', 'wisdom'],
  'treasures': ['pearls', 'secrets', 'riches', 'mysteries'],
  'Truthfulness': ['Honesty', 'Sincerity', 'Integrity', 'Loyalty'],
  'foundation': ['cornerstone', 'basis', 'source', 'pillar'],
  'human': ['spiritual', 'earthly', 'inner', 'noble'],
  'virtues': ['qualities', 'strengths', 'gifts', 'deeds'],
  'heart': ['mind', 'soul', 'spirit', 'sight'],
  'pure': ['clean', 'bright', 'clear', 'spotless'],
  'deeds': ['words', 'thoughts', 'intentions', 'plans'],
};

export const ImposterDetector: React.FC<ImposterDetectorProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const rawWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  const [imposterIndex, setImposterIndex] = useState<number>(-1);
  const [decoyWord, setDecoyWord] = useState<string>('');
  const [originalWord, setOriginalWord] = useState<string>('');
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  const generateImposter = useCallback(() => {
    setIsResolved(false);
    setShakeIndex(null);

    const eligibleIndices: { index: number; word: string; decoy: string }[] = [];

    rawWords.forEach((word, idx) => {
      const clean = word.replace(/[.,;:!?„"«»]/g, '');
      const punctuation = word.replace(/[a-zA-ZäöüÄÖÜß0-9]/g, '');

      for (const [key, decoys] of Object.entries(DECOY_MAP)) {
        if (clean.toLowerCase() === key.toLowerCase()) {
          const randomDecoy = decoys[Math.floor(Math.random() * decoys.length)];
          const formattedDecoy = clean.charAt(0) === clean.charAt(0).toUpperCase()
            ? randomDecoy.charAt(0).toUpperCase() + randomDecoy.slice(1)
            : randomDecoy.toLowerCase();
          eligibleIndices.push({ index: idx, word, decoy: formattedDecoy + punctuation });
          return;
        }
      }

      if (clean.length >= 5) {
        const fallbackDecoys = language === 'de'
          ? ['Wunder', 'Gedanke', 'Prüfung', 'Zeichen', 'Hoffnung']
          : ['wonder', 'thought', 'symbol', 'purpose', 'promise'];
        const randomDecoy = fallbackDecoys[Math.floor(Math.random() * fallbackDecoys.length)];
        eligibleIndices.push({ index: idx, word, decoy: randomDecoy + punctuation });
      }
    });

    if (eligibleIndices.length > 0) {
      const chosen = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
      setImposterIndex(chosen.index);
      setDecoyWord(chosen.decoy);
      setOriginalWord(chosen.word);
    } else {
      const fallbackIdx = Math.min(2, rawWords.length - 1);
      setImposterIndex(fallbackIdx);
      setDecoyWord(language === 'de' ? 'Traum' : 'dream');
      setOriginalWord(rawWords[fallbackIdx]);
    }
  }, [rawWords, language]);

  useEffect(() => {
    generateImposter();
  }, [generateImposter]);

  const handleWordClick = (idx: number) => {
    if (isResolved) return;

    if (idx === imposterIndex) {
      setIsResolved(true);
    } else {
      setShakeIndex(idx);
      setTimeout(() => setShakeIndex(null), 600);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.imposterSubtitle}</p>
        <span className="font-mono text-2xs bg-surface-2 border border-border px-3 py-1 rounded-full text-text self-start sm:self-auto shrink-0">
          {isResolved ? '100% Original' : (language === 'de' ? '1 Fehler versteckt' : '1 Decoy hidden')}
        </span>
      </div>

      {/* Main Reading Canvas */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed text-text text-center min-h-[140px]">
          {rawWords.map((word, idx) => {
            const isImposter = idx === imposterIndex;
            const displayedWord = isImposter && !isResolved ? decoyWord : word;
            const isShaking = shakeIndex === idx;

            return (
              <button
                type="button"
                key={idx}
                onClick={() => handleWordClick(idx)}
                className={`cursor-pointer transition-all duration-200 select-none px-2 py-0.5 rounded-xl font-serif text-xl sm:text-3xl ${
                  isImposter && isResolved
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
                    : isImposter && !isResolved
                    ? 'hover:bg-accent-subtle hover:text-accent-text'
                    : isShaking
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                    : 'hover:bg-surface-2'
                }`}
                title={language === 'de' ? 'Klicken zum Prüfen' : 'Click to inspect'}
              >
                {displayedWord}
              </button>
            );
          })}
        </div>

        {/* Resolution Banner */}
        {isResolved ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <strong className="font-semibold block">{t.imposterFound}</strong>
                <span className="text-emerald-700 dark:text-emerald-300">
                  {language === 'de' ? `„${decoyWord}“ wurde durch „${originalWord}“ ersetzt.` : `"${decoyWord}" was corrected to "${originalWord}".`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={generateImposter}
              className="px-4 py-2 bg-accent text-accent-contrast rounded-xl text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs shrink-0 cursor-pointer min-h-[36px]"
            >
              {t.nextImposter}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-accent-text" />
              <span>{language === 'de' ? 'Findet das gefälschte Wort und klickt darauf!' : 'Locate the imposter word and click it!'}</span>
            </span>

            <button
              type="button"
              onClick={generateImposter}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text hover:bg-surface-2 rounded-full transition-colors border border-border cursor-pointer min-h-[32px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.nextImposter}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
