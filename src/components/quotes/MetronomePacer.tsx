import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

interface MetronomePacerProps {
  quote: QuoteItem;
  language: Language;
}

export const MetronomePacer: React.FC<MetronomePacerProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const rawWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  const [bpm, setBpm] = useState<number>(65);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0); // 0, 1, 2, 3
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClick = useCallback((isFirstBeat: boolean) => {
    if (!isAudioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFirstBeat ? 880 : 440, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio not supported
    }
  }, [isAudioEnabled]);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = (60 / bpm) * 1000;
    const interval = setInterval(() => {
      setCurrentBeat((prevBeat) => {
        const nextBeat = (prevBeat + 1) % 4;
        playClick(nextBeat === 0);
        return nextBeat;
      });

      setActiveWordIndex((prevIndex) => {
        return (prevIndex + 1) % rawWords.length;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, bpm, rawWords.length, playClick]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    setActiveWordIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.metronomeSubtitle}</p>
        <span className="font-mono text-2xs bg-surface-2 border border-border px-3 py-1 rounded-full text-text self-start sm:self-auto shrink-0">
          {bpm} BPM (4/4 Takt)
        </span>
      </div>

      {/* Main Studio Canvas with Pulsing Highlighting */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
        {/* Visual Beat Indicator (4 dots) */}
        <div className="flex items-center justify-center gap-3 pb-2">
          {[0, 1, 2, 3].map((b) => {
            const isCurrent = isPlaying && currentBeat === b;
            return (
              <div
                key={b}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isCurrent
                    ? 'bg-accent scale-125 shadow-xs'
                    : 'bg-surface-2 border border-border'
                }`}
              />
            );
          })}
        </div>

        {/* Text with active beat tracking */}
        <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed text-text text-center min-h-[140px]">
          {rawWords.map((word, idx) => {
            const isActive = isPlaying && activeWordIndex === idx;
            return (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-xl transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-accent text-accent-contrast shadow-xs font-bold scale-105'
                    : 'text-text'
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Metronome Control Panel */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Play/Pause & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-full bg-accent text-accent-contrast hover:bg-accent-hover transition-colors shadow-xs cursor-pointer min-h-[40px]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? t.stopMetronome : t.startMetronome}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-full border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Reset"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-colors cursor-pointer min-h-[40px] ${
                isAudioEnabled
                  ? 'bg-surface-2 border-border text-text font-semibold'
                  : 'border-border text-text-secondary hover:text-text'
              }`}
              title={t.soundToggle}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-accent-text" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{t.soundToggle}</span>
            </button>
          </div>

          {/* BPM Slider */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-text-secondary font-medium whitespace-nowrap">
              {t.bpmLabel}:
            </span>
            <input
              type="range"
              min="40"
              max="120"
              step="5"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full sm:w-36 accent-accent"
            />
            <span className="text-xs font-mono font-semibold text-text w-8 text-right">
              {bpm}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
