import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RotateCcw, HelpCircle, CheckCircle2, Award } from 'lucide-react';
import { QuoteItem, Language } from '../../types';

interface TypeRecallProps {
  quote: QuoteItem;
  language: Language;
}

type TypingMode = 'initials' | 'full';

export const TypeRecall: React.FC<TypeRecallProps> = ({ quote, language }) => {
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const [mode, setMode] = useState<TypingMode>('initials');

  const words = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  // Target sequence for initials mode
  const initialsSequence = useMemo(() => {
    return words.map((w) => {
      const clean = w.replace(/[.,;:!?„"«»]/g, '');
      return clean.charAt(0);
    });
  }, [words]);

  // Current typed index
  const [typedCount, setTypedCount] = useState<number>(0);
  const [fullTypedText, setFullTypedText] = useState<string>('');
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [shake, setShake] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetPractice = useCallback(() => {
    setTypedCount(0);
    setFullTypedText('');
    setErrorsCount(0);
    setShake(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    resetPractice();
  }, [quote, language, mode, resetPractice]);

  // Handle typing input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') return;

    if (mode === 'initials') {
      e.preventDefault();
      if (typedCount >= initialsSequence.length) return;

      const expected = initialsSequence[typedCount].toLowerCase();
      const pressed = e.key.toLowerCase();

      if (pressed === expected) {
        setTypedCount((prev) => prev + 1);
      } else if (pressed.length === 1 && /[a-zA-ZäöüÄÖÜß]/.test(pressed)) {
        setErrorsCount((prev) => prev + 1);
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    }
  };

  const handleFullInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode !== 'full') return;
    const val = e.target.value;
    const targetSubstring = quoteText.slice(0, val.length);

    if (val.toLowerCase() === targetSubstring.toLowerCase()) {
      setFullTypedText(val);
    } else {
      setErrorsCount((prev) => prev + 1);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const isCompleted = mode === 'initials'
    ? typedCount >= initialsSequence.length
    : fullTypedText.length >= quoteText.length;

  const handleHint = () => {
    if (mode === 'initials') {
      if (typedCount < initialsSequence.length) {
        setTypedCount((prev) => prev + 1);
      }
    } else {
      if (fullTypedText.length < quoteText.length) {
        setFullTypedText(quoteText.slice(0, fullTypedText.length + 1));
      }
    }
    inputRef.current?.focus();
  };

  const progressPercent = mode === 'initials'
    ? Math.round((typedCount / Math.max(1, initialsSequence.length)) * 100)
    : Math.round((fullTypedText.length / Math.max(1, quoteText.length)) * 100);

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-full border border-border self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setMode('initials')}
            className={`px-3 py-1 rounded-full text-2xs font-semibold transition-all cursor-pointer ${
              mode === 'initials'
                ? 'bg-accent text-accent-contrast shadow-xs'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {language === 'de' ? 'Anfangsbuchstaben (Speed)' : 'Initials (Fast)'}
          </button>
          <button
            type="button"
            onClick={() => setMode('full')}
            className={`px-3 py-1 rounded-full text-2xs font-semibold transition-all cursor-pointer ${
              mode === 'full'
                ? 'bg-accent text-accent-contrast shadow-xs'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {language === 'de' ? 'Vollständiger Text' : 'Full Text'}
          </button>
        </div>
      </div>

      {/* Main Typing Canvas */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6 cursor-text transition-all ${
          shake ? 'ring-2 ring-red-500/40 bg-red-500/5' : ''
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
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed text-center min-h-[140px]">
            {words.map((word, idx) => {
              const clean = word.replace(/[.,;:!?„"«»]/g, '');
              const punctuation = word.replace(/[a-zA-ZäöüÄÖÜß0-9]/g, '');
              const initial = clean.charAt(0);
              const isTyped = idx < typedCount;
              const isCurrent = idx === typedCount;

              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-xl transition-all duration-150 select-none ${
                    isTyped
                      ? 'text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20'
                      : isCurrent
                      ? 'bg-accent/20 text-accent-text border border-accent ring-2 ring-accent/30 animate-pulse font-bold'
                      : 'text-text-tertiary opacity-40'
                  }`}
                >
                  {isTyped ? (
                    <span>{word}</span>
                  ) : isCurrent ? (
                    <span>
                      <strong className="underline underline-offset-4">{initial}</strong>
                      <span className="opacity-50">...</span>
                    </span>
                  ) : (
                    <span>
                      {initial}
                      <span className="opacity-40">{'_'.repeat(Math.max(1, clean.length - 1))}</span>
                      {punctuation}
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
            <p className="max-w-3xl">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-1 rounded-sm">
                {quoteText.slice(0, fullTypedText.length)}
              </span>
              <span className="inline-block w-0.5 h-6 bg-accent align-middle animate-pulse mx-0.5" />
              <span className="text-text-tertiary opacity-40">
                {quoteText.slice(fullTypedText.length)}
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
            autoFocus
            aria-label="Tippfeld für Zitat"
          />
        </div>

        {/* Completion Banner */}
        {isCompleted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <strong className="font-semibold block">
                  {language === 'de' ? 'Perfekt gemeistert!' : 'Flawlessly mastered!'}
                </strong>
                <span className="text-emerald-700 dark:text-emerald-300">
                  {language === 'de'
                    ? `Fehlerfrei durchgetippt (${errorsCount} Tippfehler korrigiert).`
                    : `Completed with precision (${errorsCount} mistakes corrected).`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetPractice}
              className="px-3.5 py-1.5 bg-accent text-accent-contrast rounded-xl text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs shrink-0 cursor-pointer min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              <span>{language === 'de' ? 'Noch einmal' : 'Repeat'}</span>
            </button>
          </div>
        ) : (
          /* Prompt to tap to type */
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-2xs text-text-tertiary font-mono bg-surface-2 border border-border px-3 py-1 rounded-full">
              <span>⌨️</span>
              <span>
                {language === 'de'
                  ? 'Tippe auf der Tastatur einfach los...'
                  : 'Start typing directly on your keyboard...'}
              </span>
            </span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleHint}
              disabled={isCompleted}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-full hover:bg-surface-2 disabled:opacity-30 transition-colors cursor-pointer min-h-[36px]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent-text" />
              <span>{language === 'de' ? 'Buchstabe aufdecken' : 'Reveal letter'}</span>
            </button>

            <button
              type="button"
              onClick={resetPractice}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-full hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px]"
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
