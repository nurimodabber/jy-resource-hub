import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { splitWord } from './textParts';
import { LetterSlots } from './LetterSlots';

interface ClozeTestProps {
  quote: QuoteItem;
  language: Language;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export const ClozeTest: React.FC<ClozeTestProps> = ({ quote, language }) => {
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const rawWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);
  const wordParts = useMemo(() => rawWords.map(splitWord), [rawWords]);

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [blankIndices, setBlankIndices] = useState<number[]>([]);
  // Map of word index -> selected word string from candidate pool
  const [filledWords, setFilledWords] = useState<Record<number, string>>({});
  const [selectedBlank, setSelectedBlank] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // Initialize blanks based on difficulty
  const initBlanks = useCallback(() => {
    setIsChecked(false);
    setFilledWords({});

    const eligibleIndices = wordParts
      .map((w, idx) => ({ idx, length: w.core.length }))
      .filter((item) => item.length >= 3)
      .map((item) => item.idx);

    let ratio = 0.25;
    if (difficulty === 'medium') ratio = 0.45;
    if (difficulty === 'hard') ratio = 0.65;

    const targetCount = Math.max(2, Math.floor(eligibleIndices.length * ratio));
    const shuffled = [...eligibleIndices].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, targetCount).sort((a, b) => a - b);

    setBlankIndices(selected);
    setSelectedBlank(selected[0] ?? null);
  }, [wordParts, difficulty]);

  useEffect(() => {
    initBlanks();
  }, [initBlanks]);

  // Candidate pool: All target missing words + extra distractors if needed
  const candidatePool = useMemo(() => {
    const list: string[] = [];
    blankIndices.forEach((idx) => {
      list.push(wordParts[idx].core);
    });

    // Shuffle pool
    return [...list].sort(() => 0.5 - Math.random());
  }, [blankIndices, wordParts]);

  // Which candidate instances are already used
  const usedCandidates = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(filledWords).forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
    return counts;
  }, [filledWords]);

  const handleSelectWordForBlank = (word: string) => {
    if (selectedBlank === null) {
      // Find first empty blank
      const firstEmpty = blankIndices.find((i) => !filledWords[i]);
      if (firstEmpty !== undefined) {
        setFilledWords((prev) => ({ ...prev, [firstEmpty]: word }));
        // Advance selection to next empty
        const nextEmpty = blankIndices.find((i) => i !== firstEmpty && !filledWords[i]);
        setSelectedBlank(nextEmpty ?? null);
      }
      return;
    }

    setFilledWords((prev) => ({ ...prev, [selectedBlank]: word }));

    // Advance to next unfilled blank
    const nextEmpty = blankIndices.find((i) => i > selectedBlank && !filledWords[i]) ??
      blankIndices.find((i) => !filledWords[i] && i !== selectedBlank);
    setSelectedBlank(nextEmpty ?? null);
  };

  const handleRemoveFromBlank = (idx: number) => {
    setFilledWords((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
    setSelectedBlank(idx);
    setIsChecked(false);
  };

  const handleHint = () => {
    const empty = blankIndices.filter((i) => !filledWords[i]);
    if (empty.length === 0) return;
    const target = empty[0];
    const correctClean = wordParts[target].core;
    setFilledWords((prev) => ({ ...prev, [target]: correctClean }));
    setSelectedBlank(empty[1] ?? null);
  };

  const allFilled = blankIndices.length > 0 && blankIndices.every((i) => !!filledWords[i]);

  const isAllCorrect = useMemo(() => {
    if (!allFilled) return false;
    return blankIndices.every((i) => {
      const cleanExpected = wordParts[i].core.toLowerCase();
      const actual = (filledWords[i] || '').toLowerCase();
      return cleanExpected === actual;
    });
  }, [allFilled, blankIndices, wordParts, filledWords]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Bar with Difficulty & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>
          {language === 'de'
            ? 'Fülle die fehlenden Lücken im heiligen Zitat aus dem Wortspeicher aus.'
            : 'Fill in the missing blanks in the sacred quote using words from the pool.'}
        </p>

        {/* Difficulty switcher */}
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-full border border-border self-start sm:self-auto shrink-0">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[44px] outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                difficulty === d
                  ? 'bg-accent text-accent-contrast shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {d === 'easy'
                ? (language === 'de' ? 'Leicht' : 'Easy')
                : d === 'medium'
                ? (language === 'de' ? 'Mittel' : 'Medium')
                : (language === 'de' ? 'Schwer' : 'Hard')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Quote Canvas with Interactive Blanks */}
      <div className="bg-surface rounded-card border border-border p-4 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-wrap justify-center items-center gap-0 font-serif text-lg sm:text-2xl leading-relaxed text-text text-center min-h-[140px] pr-[var(--quote-gap)]">
          {rawWords.map((word, idx) => {
            const isBlank = blankIndices.includes(idx);
            const { lead, core: cleanExpected, trail } = wordParts[idx];

            if (!isBlank) {
              return (
                <span key={idx} className="select-none px-1">
                  {word}
                </span>
              );
            }

            const currentVal = filledWords[idx];
            const isSelected = selectedBlank === idx;
            const isSlotCorrect = isChecked && currentVal?.toLowerCase() === cleanExpected.toLowerCase();
            const isSlotWrong = isChecked && currentVal && currentVal.toLowerCase() !== cleanExpected.toLowerCase();

            return (
              // Trailing punctuation goes inside the filled button so it sits right at the word,
              // not behind the button's padding.
              <span key={idx} className="inline-flex items-baseline my-0.5">
                {lead && <span className="select-none">{lead}</span>}
                <button
                  type="button"
                  onClick={() => {
                    if (currentVal) {
                      handleRemoveFromBlank(idx);
                    } else {
                      setSelectedBlank(idx);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-control text-lg sm:text-2xl font-serif border transition-all cursor-pointer select-none inline-block min-h-[44px] outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                    isSlotCorrect
                      ? 'bg-success/15 border-success/40 text-success font-semibold'
                      : isSlotWrong
                      ? 'bg-danger/15 border-danger/40 text-danger'
                      : isSelected
                      ? 'bg-accent/15 border-accent text-accent-text ring-2 ring-accent/30'
                      : currentVal
                      ? 'bg-surface-2 border-border text-text hover:border-accent'
                      : 'bg-surface-2/60 border-dashed border-border-subtle text-text-tertiary hover:border-accent hover:bg-surface-2'
                  }`}
                  title={currentVal ? (language === 'de' ? 'Klicken zum Entfernen' : 'Click to remove') : (language === 'de' ? 'Klicken zum Auswählen' : 'Click to select')}
                >
                  {currentVal ? `${currentVal}${trail}` : <LetterSlots text={cleanExpected} language={language} />}
                </button>
                {trail && !currentVal && <span className="select-none">{trail}</span>}
              </span>
            );
          })}
        </div>

        {/* Word Pool: directly under the text, so on a phone the words are near their gaps. */}
        {!isAllCorrect && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-text-tertiary block">
                {language === 'de' ? 'Wortspeicher (Klicken zum Einfügen):' : 'Word Pool (Click to insert):'}
              </span>
              <span className="text-2xs text-text-tertiary">
                {Object.keys(filledWords).length} / {blankIndices.length} {language === 'de' ? 'eingesetzt' : 'placed'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {candidatePool.map((word, pIdx) => {
                // Used words leave the pool, so it shrinks as the gaps fill (less scrolling on a phone).
                // With duplicates ("Liebe" twice) the first copies are the used ones.
                const copiesBefore = candidatePool.slice(0, pIdx).filter((w) => w === word).length;
                if (copiesBefore < (usedCandidates[word] || 0)) return null;

                return (
                  <button
                    key={`${word}-${pIdx}`}
                    type="button"
                    onClick={() => handleSelectWordForBlank(word)}
                    className="px-3.5 py-2 rounded-control text-sm font-medium border shadow-xs transition-all select-none cursor-pointer min-h-[44px] flex items-center justify-center bg-surface-2 hover:bg-surface-raised border-border text-text hover:border-accent"
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Banner */}
        {allFilled && isAllCorrect && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-text animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              <div className="text-xs">
                <strong className="font-semibold block text-success">
                  {language === 'de' ? 'Fantastisch. Alle Lücken korrekt ausgefüllt.' : 'Superb. All blanks correctly completed.'}
                </strong>
                <span className="text-text-secondary">
                  {language === 'de' ? 'Jetzt das Zitat im Chor laut aufsagen.' : 'Now recite the verse aloud in unison.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={initBlanks}
              className="px-3.5 py-1.5 bg-accent text-accent-contrast rounded-control text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs shrink-0 cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              <span>{language === 'de' ? 'Noch einmal' : 'Play again'}</span>
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {!isAllCorrect && (
              <button
                type="button"
                onClick={() => setIsChecked(true)}
                disabled={!allFilled}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-contrast text-xs font-semibold rounded-control hover:bg-accent-hover disabled:opacity-40 transition-colors shadow-xs cursor-pointer min-h-[44px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Prüfen' : 'Check'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleHint}
              disabled={isAllCorrect || blankIndices.every((i) => !!filledWords[i])}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-control hover:bg-surface-2 disabled:opacity-30 transition-colors cursor-pointer min-h-[44px]"
              title={language === 'de' ? 'Ein Wort aufdecken' : 'Reveal one word'}
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent-text" />
              <span>{language === 'de' ? 'Tipp' : 'Hint'}</span>
            </button>

            <button
              type="button"
              onClick={initBlanks}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-control hover:bg-surface-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Neu mischen' : 'Reset'}</span>
            </button>
          </div>

          <span className="text-xs text-text-tertiary font-serif italic">
            — {quote.source[language]}
          </span>
        </div>
      </div>

    </div>
  );
};
