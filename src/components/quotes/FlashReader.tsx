import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Eye, CheckCircle2 } from 'lucide-react';
import { QuoteItem, Language } from '../../types';

interface FlashReaderProps {
  quote: QuoteItem;
  language: Language;
}

export const FlashReader: React.FC<FlashReaderProps> = ({ quote, language }) => {
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const rawWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  const [wpm, setWpm] = useState<number>(180);
  const [chunkSize, setChunkSize] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showFullText, setShowFullText] = useState<boolean>(false);

  // Group into chunks
  const chunks = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < rawWords.length; i += chunkSize) {
      list.push(rawWords.slice(i, i + chunkSize).join(' '));
    }
    return list;
  }, [rawWords, chunkSize]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Interval ms based on WPM and chunk size
    const msPerWord = (60 / wpm) * 1000;
    const intervalMs = msPerWord * chunkSize;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= chunks.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, wpm, chunkSize, chunks.length]);

  const handleTogglePlay = () => {
    if (currentIndex >= chunks.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const isFinished = currentIndex >= chunks.length - 1 && !isPlaying;

  return (
    <div className="space-y-6">
      {/* Top Header & Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>
          {language === 'de'
            ? 'Blitz-Lesen trainiert den Blickfokus und eliminiert Verzögerungen beim Abrufen des Textes.'
            : 'Rapid serial visual presentation builds instantaneous recall and rhythmic focus.'}
        </p>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="font-mono text-2xs bg-surface-2 border border-border px-3 py-1 rounded-full text-text flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-text" />
            <span>{wpm} WPM</span>
          </span>

          <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-full border border-border">
            <button
              type="button"
              onClick={() => { setChunkSize(1); setCurrentIndex(0); }}
              className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold transition-all cursor-pointer ${
                chunkSize === 1 ? 'bg-accent text-accent-contrast shadow-xs' : 'text-text-secondary'
              }`}
            >
              1W
            </button>
            <button
              type="button"
              onClick={() => { setChunkSize(2); setCurrentIndex(0); }}
              className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold transition-all cursor-pointer ${
                chunkSize === 2 ? 'bg-accent text-accent-contrast shadow-xs' : 'text-text-secondary'
              }`}
            >
              2W
            </button>
          </div>
        </div>
      </div>

      {/* Main Flash Canvas */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-12 shadow-xs space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-accent transition-all duration-150 rounded-full"
            style={{ width: `${Math.round(((currentIndex + 1) / chunks.length) * 100)}%` }}
          />
        </div>

        {/* Big Focal Word Display */}
        <div className="min-h-[160px] flex flex-col items-center justify-center py-6 text-center select-none relative">
          <div className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-text leading-tight animate-in fade-in duration-75">
            {chunks[currentIndex] || '...'}
          </div>

          <span className="text-2xs font-mono text-text-tertiary mt-4 block">
            {currentIndex + 1} / {chunks.length}
          </span>
        </div>

        {/* Completion Message */}
        {isFinished && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <strong className="font-semibold block">
                  {language === 'de' ? 'Durchlauf beendet!' : 'Run completed!'}
                </strong>
                <span className="text-emerald-700 dark:text-emerald-300">
                  {language === 'de' ? 'Jetzt das Zitat flüssig im Chor aus dem Gedächtnis sprechen.' : 'Now recite the verse fluently from memory.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFullText(!showFullText)}
              className="px-3 py-1.5 bg-surface text-text hover:bg-surface-2 rounded-xl text-xs font-semibold border border-border transition-colors shrink-0 cursor-pointer min-h-[36px]"
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              <span>{showFullText ? (language === 'de' ? 'Verbergen' : 'Hide') : (language === 'de' ? 'Volltext prüfen' : 'Check text')}</span>
            </button>
          </div>
        )}

        {/* Full Text Reveal if toggled */}
        {showFullText && (
          <div className="p-4 rounded-2xl bg-surface-2 border border-border text-center font-serif italic text-sm sm:text-base text-text animate-in fade-in">
            „{quoteText}“
          </div>
        )}

        {/* Speed Slider & Controls */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-accent text-accent-contrast hover:bg-accent-hover transition-colors shadow-xs cursor-pointer min-h-[40px]"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? (language === 'de' ? 'Pause' : 'Pause') : (language === 'de' ? 'Starten' : 'Start')}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-full border border-border bg-surface text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed range */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-text-secondary font-medium whitespace-nowrap">
              {language === 'de' ? 'Tempo:' : 'Speed:'}
            </span>
            <input
              type="range"
              min="100"
              max="350"
              step="20"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-full sm:w-36 accent-accent"
            />
            <span className="text-xs font-mono font-semibold text-text w-16 text-right">
              {wpm} wpm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
