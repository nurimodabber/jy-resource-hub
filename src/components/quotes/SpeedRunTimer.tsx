import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Trophy, Timer, Sparkles } from 'lucide-react';
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
  const [targetSeconds, setTargetSeconds] = useState<number>(20);
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);
  const [isRecordBeaten, setIsRecordBeaten] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  const updateTimer = () => {
    setElapsedMs(Date.now() - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsRecordBeaten(false);
    startTimeRef.current = Date.now() - elapsedMs;
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    if (bestTimeMs === null || elapsedMs < bestTimeMs) {
      setBestTimeMs(elapsedMs);
      setIsRecordBeaten(true);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.speedRunSubtitle}</p>
        {bestTimeMs !== null && (
          <span className="font-mono text-2xs bg-accent-subtle text-accent-text border border-accent/20 px-3 py-1 rounded-full self-start sm:self-auto shrink-0 flex items-center gap-1.5 font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.currentRecord}: {formatTime(bestTimeMs)}</span>
          </span>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
        {/* Quote Reference */}
        <div className="p-5 rounded-2xl bg-surface-2 border border-border text-center space-y-2">
          <p className="font-serif italic text-lg sm:text-2xl text-text leading-relaxed">
            „{quoteText}“
          </p>
          <span className="text-xs text-text-secondary font-medium block">
            — {quote.source[language]} ({quote.book[language]})
          </span>
        </div>

        {/* Digital Stopwatch Display */}
        <div className="py-4 text-center space-y-2">
          <div className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-accent-text select-none">
            {formatTime(elapsedMs)}
          </div>
          <span className="text-xs text-text-secondary font-medium block">
            {language === 'de' ? 'Reihum im Kreis sprechen, bis das letzte Wort ertönt!' : 'Speak in turns around the circle until the last word is spoken!'}
          </span>
        </div>

        {/* Record Beaten Announcement */}
        {isRecordBeaten && (
          <div className="p-4 bg-accent-subtle border border-accent/20 rounded-2xl flex items-center justify-center gap-2 text-accent-text font-semibold text-xs animate-in fade-in">
            <Sparkles className="w-4 h-4" />
            <span>{t.recordBeaten} ({formatTime(elapsedMs)})</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isRunning ? handleStop : handleStart}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[40px] ${
                isRunning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-accent text-accent-contrast hover:bg-accent-hover'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? t.stopTimer : t.startTimer}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border bg-surface text-text text-xs font-medium hover:bg-surface-2 transition-colors cursor-pointer min-h-[40px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetTimer}</span>
            </button>
          </div>

          {/* Target setter */}
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Timer className="w-3.5 h-3.5 text-accent-text" />
            <span>{t.targetTimeLabel}:</span>
            <div className="flex items-center gap-1">
              {[15, 20, 30].map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setTargetSeconds(sec)}
                  className={`px-3 py-1.5 rounded-full text-2xs font-medium transition-colors cursor-pointer min-h-[32px] ${
                    targetSeconds === sec
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
