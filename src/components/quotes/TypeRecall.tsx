import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RotateCcw, HelpCircle, CheckCircle2, Award, Keyboard } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { SegmentedControl } from '../ui/SegmentedControl';
import { splitWord, hasLetter, normalizeTyped } from './textParts';
import { LetterSlots } from './LetterSlots';

interface TypeRecallProps {
  quote: QuoteItem;
  language: Language;
}

type TypingMode = 'initials' | 'full';

export const TypeRecall: React.FC<TypeRecallProps> = ({ quote, language }) => {
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const [mode, setMode] = useState<TypingMode>('initials');

  const words = useMemo(() => quoteText.split(/\s+/).map(splitWord), [quoteText]);

  // Target sequence for initials mode. Tokens without a letter (a standalone "–") are skipped:
  // there is no key to press for them, so the run used to get stuck there.
  // askBefore[i] = how many askable words come before token i (drives what is revealed).
  const { initialsSequence, askBefore } = useMemo(() => {
    const seq: string[] = [];
    const before: number[] = [];
    words.forEach((w) => {
      before.push(seq.length);
      if (hasLetter(w.core)) seq.push(normalizeTyped(w.core.charAt(0)));
    });
    return { initialsSequence: seq, askBefore: before };
  }, [words]);

  // Full-text mode compares in normalised form (see normalizeTyped). origEnd[k] maps the first
  // k+1 normalised characters back to an end offset in the original text for display.
  const { normQuote, origEnd } = useMemo(() => {
    let norm = '';
    const ends: number[] = [];
    for (let i = 0; i < quoteText.length; i++) {
      const n = normalizeTyped(quoteText[i]);
      norm += n;
      for (let j = 0; j < n.length; j++) ends.push(i + 1);
    }
    return { normQuote: norm, origEnd: ends };
  }, [quoteText]);

  // Current typed index
  const [typedCount, setTypedCount] = useState<number>(0);
  const [fullTypedText, setFullTypedText] = useState<string>('');
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [shake, setShake] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // No focus here: focusing on mount jumped the page and opened the phone keyboard uninvited.
  const resetPractice = useCallback(() => {
    setTypedCount(0);
    setFullTypedText('');
    setErrorsCount(0);
    setShake(false);
  }, []);

  const handleRestart = () => {
    resetPractice();
    inputRef.current?.focus();
  };

  useEffect(() => {
    resetPractice();
  }, [quote, language, mode, resetPractice]);

  // Handle typing input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') return;

    if (mode === 'initials') {
      e.preventDefault();
      if (typedCount >= initialsSequence.length) return;

      if (e.key.length !== 1) return;
      const expected = initialsSequence[typedCount];
      const pressed = normalizeTyped(e.key);

      if (pressed === expected) {
        setTypedCount((prev) => prev + 1);
      } else if (hasLetter(pressed)) {
        setErrorsCount((prev) => prev + 1);
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    }
  };

  const handleFullInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode !== 'full') return;
    const val = e.target.value;

    if (normQuote.startsWith(normalizeTyped(val))) {
      setFullTypedText(val);
    } else {
      setErrorsCount((prev) => prev + 1);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const typedNormLength = normalizeTyped(fullTypedText).length;
  const typedOrigLength = typedNormLength > 0 ? origEnd[typedNormLength - 1] : 0;

  const isCompleted = mode === 'initials'
    ? typedCount >= initialsSequence.length
    : typedNormLength >= normQuote.length;

  const handleHint = () => {
    if (mode === 'initials') {
      if (typedCount < initialsSequence.length) {
        setTypedCount((prev) => prev + 1);
      }
    } else {
      if (typedNormLength < normQuote.length) {
        setFullTypedText(normQuote.slice(0, typedNormLength + 1));
      }
    }
    inputRef.current?.focus();
  };

  const progressPercent = mode === 'initials'
    ? Math.round((typedCount / Math.max(1, initialsSequence.length)) * 100)
    : Math.round((typedNormLength / Math.max(1, normQuote.length)) * 100);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>
          {mode === 'initials'
            ? (language === 'de'
                ? 'Tippe fortlaufend die Anfangsbuchstaben der Wörter aus dem Gedächtnis.'
                : 'Type the first letter of each word consecutively from memory.')
            : (language === 'de'
                ? 'Tippe den gesamten Text Buchstabe für Buchstabe ein.'
                : 'Type out the entire text verbatim letter-by-letter.')}
        </p>

        {/* Mode Selector */}
        <SegmentedControl<TypingMode>
          value={mode}
          onChange={(newMode) => setMode(newMode)}
          options={[
            { id: 'initials', label: language === 'de' ? 'Anfangsbuchstaben' : 'First letters' },
            { id: 'full', label: language === 'de' ? 'Vollständiger Text' : 'Full Text' },
          ]}
        />
      </div>

      {/* Main Typing Canvas */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`bg-surface rounded-card border border-border p-4 sm:p-10 shadow-xs space-y-4 sm:space-y-6 cursor-text transition-all ${
          shake ? 'ring-2 ring-danger/40 bg-danger/5' : ''
        }`}
      >
        {/* Progress Bar */}
        <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-accent transition-all duration-200 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Render for Mode 'initials' */}
        {mode === 'initials' && (
          <div className="flex flex-wrap justify-center items-center gap-0 font-serif text-xl sm:text-3xl leading-relaxed text-center min-h-[140px] pr-[var(--quote-gap)]">
            {words.map((w, idx) => {
              const word = w.lead + w.core + w.trail;
              if (!hasLetter(w.core)) {
                // Nothing to type: shown as is, once the words before it are done.
                const reached = typedCount >= askBefore[idx];
                return (
                  <span key={idx} className={`select-none ${reached ? 'text-text' : 'text-text-tertiary opacity-40'}`}>
                    {word}
                  </span>
                );
              }
              const isTyped = askBefore[idx] < typedCount;
              const isCurrent = askBefore[idx] === typedCount;

              return (
                <span
                  key={idx}
                  className={`px-1 py-0.5 rounded-control border transition-colors duration-150 select-none ${
                    isTyped
                      ? 'text-text border-transparent'
                      : isCurrent
                      ? 'bg-accent-subtle text-accent-text border-accent'
                      : 'text-text-tertiary border-transparent'
                  }`}
                >
                  {/* Untyped words show only their letter count: the first letter is what the group recalls. */}
                  {isTyped ? (
                    <span>{word}</span>
                  ) : (
                    <span>
                      {w.lead}
                      <LetterSlots text={w.core} language={language} />
                      {w.trail}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Render for Mode 'full' */}
        {mode === 'full' && (
          <div className="font-serif text-lg sm:text-2xl leading-relaxed text-center min-h-[140px] flex items-center justify-center">
            <p className="max-w-3xl pr-[var(--quote-gap)]">
              <span className="text-success font-bold bg-success/15 px-1 rounded-sm border border-success/20">
                {quoteText.slice(0, typedOrigLength)}
              </span>
              <span className="inline-block w-0.5 h-6 bg-accent align-middle motion-safe:animate-pulse mx-0.5" />
              <span className="text-text-tertiary opacity-40">
                {quoteText.slice(typedOrigLength)}
              </span>
            </p>
          </div>
        )}

        {/* Hidden Input Field to capture typing cleanly on mobile & desktop */}
        <div className="relative opacity-0 pointer-events-auto h-0 overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={mode === 'full' ? fullTypedText : ''}
            onChange={handleFullInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label={language === 'de' ? 'Tippfeld für Zitat' : 'Type the quote'}
          />
        </div>

        {/* Completion Banner */}
        {isCompleted ? (
          <div className="p-4 bg-success/10 border border-success/20 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-text animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              <div className="text-xs">
                <strong className="font-semibold block text-success">
                  {language === 'de' ? 'Perfekt gemeistert.' : 'Flawlessly mastered.'}
                </strong>
                <span className="text-text-secondary">
                  {errorsCount === 0
                    ? (language === 'de' ? 'Fehlerfrei durchgetippt.' : 'Completed without mistakes.')
                    : language === 'de'
                    ? `Durchgetippt (${errorsCount} Tippfehler korrigiert).`
                    : `Completed (${errorsCount} ${errorsCount === 1 ? 'mistake' : 'mistakes'} corrected).`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="px-3.5 py-1.5 bg-accent text-accent-contrast rounded-control text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs shrink-0 cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              <span>{language === 'de' ? 'Noch einmal' : 'Repeat'}</span>
            </button>
          </div>
        ) : (
          /* Prompt to tap to type */
          <div className="text-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.focus();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-surface-2 border border-border px-3.5 py-2 min-h-[44px] rounded-control cursor-pointer hover:text-text outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>
                {isFocused
                  ? (language === 'de' ? 'Tippe auf der Tastatur einfach los...' : 'Start typing directly on your keyboard...')
                  : (language === 'de' ? 'Zum Starten hier tippen' : 'Tap here to start typing')}
              </span>
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleHint}
              disabled={isCompleted}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-control hover:bg-surface-2 disabled:opacity-30 transition-colors cursor-pointer min-h-[44px]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent-text" />
              <span>{language === 'de' ? 'Buchstabe aufdecken' : 'Reveal letter'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-control hover:bg-surface-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Neu starten' : 'Restart'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-accent-text" />
              <span>{progressPercent}%</span>
            </span>
            <span className="font-serif italic text-text-tertiary">
              — {quote.source[language]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
