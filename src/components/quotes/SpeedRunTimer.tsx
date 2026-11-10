import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Trophy } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

interface SpeedRunTimerProps {
  quote: QuoteItem;
  language: Language;
}

export const SpeedRunTimer: React.FC<SpeedRunTimerProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);
  const [isRecordBeaten, setIsRecordBeaten] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  const updateTimer = () => {
    setElapsedMs(Date.now() - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  // Every start is a fresh run: the group speaks the whole passage again, so resuming the old
  // time made no sense.
  const handleStart = () => {
    setIsRunning(true);
    setIsRecordBeaten(false);
    setElapsedMs(0);
    startTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const finalMs = Date.now() - startTimeRef.current;
    setElapsedMs(finalMs);

    // The first run only sets the best time; a "new record" needs an earlier one to beat.
    if (bestTimeMs === null || finalMs < bestTimeMs) {
      setBestTimeMs(finalMs);
      setIsRecordBeaten(bestTimeMs !== null);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setElapsedMs(0);
    setIsRecordBeaten(false);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    const secs = totalSec % 60;
    const mins = Math.floor(totalSec / 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.speedRunSubtitle}</p>
        {bestTimeMs !== null && (
          <span className="tabular-nums text-2xs bg-accent-subtle text-accent-text border border-accent/20 px-3 py-1 rounded-lg self-start sm:self-auto shrink-0 flex items-center gap-1.5 font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.currentRecord}: {formatTime(bestTimeMs)}</span>
          </span>
        )}
      </div>

      {/* Quote on its own calm card: no timer or trophy directly at the sacred text. */}
      <figure className="bg-surface rounded-card border border-border p-4 sm:p-10 shadow-xs text-center space-y-2">
        <blockquote className="font-serif italic text-lg sm:text-2xl text-text leading-relaxed pr-[var(--quote-gap)]">
          {language === 'de' ? `„${quoteText}“` : `“${quoteText}”`}
        </blockquote>
        <figcaption className="text-xs text-text-secondary font-medium">
          — {quote.source[language]} ({quote.book[language]})
        </figcaption>
      </figure>

      {/* Stopwatch Card */}
      <div className="bg-surface rounded-card border border-border p-4 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        {/* Digital Stopwatch Display */}
        <div className="py-4 text-center space-y-2">
          <div className="tabular-nums text-5xl sm:text-7xl font-bold tracking-tight text-accent-text select-none">
            {formatTime(elapsedMs)}
          </div>
          <span className="text-xs text-text-secondary font-medium block">
            {language === 'de' ? 'Reihum im Kreis sprechen, bis das letzte Wort ertönt.' : 'Speak in turns around the circle until the last word is spoken.'}
          </span>
        </div>

        {/* Record Beaten Announcement */}
        {isRecordBeaten && (
          <p role="status" className="flex items-center justify-center gap-2 text-accent-text font-semibold text-sm animate-in fade-in">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>{t.recordBeaten} ({formatTime(elapsedMs)})</span>
          </p>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isRunning ? handleStop : handleStart}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-control text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px] ${
                isRunning
                  ? // Tinted, not filled: --danger is light in dark mode, white text on it would fail contrast.
                    'bg-danger/10 text-danger border border-danger/40 hover:bg-danger/15'
                  : 'bg-accent text-accent-contrast hover:bg-accent-hover'
              }`}
            >
              {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? t.stopTimer : t.startTimer}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-control border border-border bg-surface text-text text-xs font-medium hover:bg-surface-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetTimer}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
