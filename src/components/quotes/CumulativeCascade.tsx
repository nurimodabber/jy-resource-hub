import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Eye, EyeOff, CheckCircle2, RotateCcw, Layers } from 'lucide-react';
import { QuoteItem, Language } from '../../types';

interface CumulativeCascadeProps {
  quote: QuoteItem;
  language: Language;
}

export const CumulativeCascade: React.FC<CumulativeCascadeProps> = ({ quote, language }) => {
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;

  // Split quote into natural clauses / phrases
  const phrases = useMemo(() => {
    // Split by commas, semicolons, colons, periods, or exclamation/question marks
    const rawChunks = quoteText
      .split(/(?<=[,;:.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // If chunks are too long, split further by conjunctions or word count ~5 words
    const fineChunks: string[] = [];
    rawChunks.forEach((chunk) => {
      const words = chunk.split(/\s+/);
      if (words.length > 8) {
        const mid = Math.ceil(words.length / 2);
        fineChunks.push(words.slice(0, mid).join(' '));
        fineChunks.push(words.slice(mid).join(' '));
      } else {
        fineChunks.push(chunk);
      }
    });

    return fineChunks.length > 1 ? fineChunks : [quoteText];
  }, [quoteText]);

  // Current step: 0 to phrases.length (phrases.length means full recitation from memory)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);

  const totalSteps = phrases.length;
  const isFinalStep = currentStep === totalSteps;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      setIsPeeking(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setIsPeeking(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPeeking(false);
  };

  return (
    <div className="space-y-6">
      {/* Subtitle & Step Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>
          {language === 'de'
            ? 'Lerne das Zitat schrittweise Satz für Satz: Neuer Abschnitt lesen, vorangegangene aus dem Kopf ergänzen.'
            : 'Memorise phrase by phrase: Read the new line, recall the previous lines from memory.'}
        </p>

        <span className="font-mono text-2xs bg-surface-2 border border-border px-3 py-1 rounded-full text-text self-start sm:self-auto shrink-0 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent-text" />
          <span>
            {language === 'de' ? `Stufe ${currentStep + 1} von ${totalSteps + 1}` : `Step ${currentStep + 1} of ${totalSteps + 1}`}
          </span>
        </span>
      </div>

      {/* Main Cascade Steps Canvas */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
        {/* Step Indicator Progress Dots */}
        <div className="flex items-center justify-center gap-2 pb-2">
          {Array.from({ length: totalSteps + 1 }).map((_, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-200 ${
                  isCurrent
                    ? 'w-8 bg-accent'
                    : isDone
                    ? 'w-3 bg-emerald-500/80'
                    : 'w-2 bg-surface-2 border border-border'
                }`}
              />
            );
          })}
        </div>

        {/* Phrases List with Stepwise Reveal */}
        <div className="space-y-3 max-w-3xl mx-auto py-2">
          {phrases.map((phrase, pIdx) => {
            const isPast = pIdx < currentStep;
            const isCurrent = pIdx === currentStep;

            // In final step (currentStep === totalSteps), ALL phrases are hidden unless peeking
            const isHiddenFromMemory = isFinalStep ? !isPeeking : isPast && !isPeeking;

            return (
              <div
                key={pIdx}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-accent/10 border-accent/40 shadow-xs'
                    : isPast
                    ? 'bg-surface-2/60 border-border/60'
                    : 'opacity-20 bg-surface-2/20 border-transparent pointer-events-none'
                }`}
              >
                {/* Step badge */}
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-accent text-accent-contrast'
                      : isPast
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-surface-2 text-text-tertiary'
                  }`}
                >
                  {pIdx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-serif text-lg sm:text-2xl leading-relaxed transition-all ${
                      isHiddenFromMemory
                        ? 'blur-md select-none text-text-tertiary opacity-30'
                        : isCurrent
                        ? 'text-text font-semibold'
                        : 'text-text-secondary'
                    }`}
                  >
                    „{phrase}“
                  </p>

                  {isHiddenFromMemory && (
                    <span className="text-2xs font-sans text-accent-text font-medium block mt-1">
                      {language === 'de' ? 'Aus dem Gedächtnis aufsagen...' : 'Recite from memory...'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Step Master Celebration */}
        {isFinalStep && (
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <strong className="font-semibold block text-sm">
                  {language === 'de' ? 'Meisterstufe erreicht! 🎉' : 'Master level unlocked! 🎉'}
                </strong>
                <span className="text-emerald-700 dark:text-emerald-300">
                  {language === 'de'
                    ? 'Die gesamte Zitate-Treppe wurde erklommen. Jetzt das vollständige Zitat fehlerfrei im Chor aufsagen!'
                    : 'The complete cascade has been climbed. Now recite the entire quote in unison from memory!'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-accent text-accent-contrast rounded-xl text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs shrink-0 cursor-pointer min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              <span>{language === 'de' ? 'Neu beginnen' : 'Restart'}</span>
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-full hover:bg-surface-2 disabled:opacity-30 transition-colors cursor-pointer min-h-[36px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'de' ? 'Zurück' : 'Previous'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isFinalStep}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-contrast text-xs font-semibold rounded-full hover:bg-accent-hover disabled:opacity-30 transition-colors shadow-xs cursor-pointer min-h-[36px]"
            >
              <span>{language === 'de' ? 'Nächste Stufe' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {(currentStep > 0 || isFinalStep) && (
              <button
                type="button"
                onClick={() => setIsPeeking(!isPeeking)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border bg-surface text-text text-xs font-medium rounded-full hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px]"
                title={isPeeking ? (language === 'de' ? 'Verbergen' : 'Hide') : (language === 'de' ? 'Kurz spicken' : 'Peek')}
              >
                {isPeeking ? <EyeOff className="w-3.5 h-3.5 text-accent-text" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isPeeking ? (language === 'de' ? 'Verbergen' : 'Hide') : (language === 'de' ? 'Spicken' : 'Peek')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="p-2 border border-border bg-surface text-text-secondary hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
