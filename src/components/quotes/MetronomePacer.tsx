import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Activity } from 'lucide-react';
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

  // Play subtle woodblock click using Web Audio API
  const playClick = (isFirstBeat: boolean) => {
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
      // Audio not supported or blocked
    }
  };

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
  }, [isPlaying, bpm, rawWords.length, isAudioEnabled]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    setActiveWordIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#86868b]">
        <p>{t.metronomeSubtitle}</p>
        <span className="font-mono text-[11px] bg-black/[0.04] px-3 py-1 rounded-full text-[#1d1d1f] self-start sm:self-auto shrink-0">
          {bpm} BPM (4/4 Takt)
        </span>
      </div>

      {/* Main Studio Canvas with Pulsing Highlighting */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-10 shadow-apple-card space-y-6">
        {/* Visual Beat Indicator (4 dots) */}
        <div className="flex items-center justify-center gap-3 pb-2">
          {[0, 1, 2, 3].map((b) => {
            const isCurrent = isPlaying && currentBeat === b;
            return (
              <div
                key={b}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isCurrent
                    ? b === 0
                      ? 'bg-[#0071e3] scale-125 shadow-apple-pill'
                      : 'bg-emerald-500 scale-125 shadow-apple-pill'
                    : 'bg-black/[0.08]'
                }`}
              />
            );
          })}
        </div>

        {/* Text with active beat tracking */}
        <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed text-[#1d1d1f] text-center min-h-[140px]">
          {rawWords.map((word, idx) => {
            const isActive = isPlaying && activeWordIndex === idx;
            return (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-xl transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-[#0071e3] text-white shadow-apple-pill font-bold scale-105'
                    : 'text-[#1d1d1f]'
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Metronome Control Panel */}
        <div className="pt-4 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Play/Pause & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-full text-white transition-all shadow-apple-pill ${
                isPlaying ? 'bg-[#1d1d1f] hover:bg-black' : 'bg-[#0071e3] hover:bg-[#0077ed]'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? t.stopMetronome : t.startMetronome}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-full border border-black/[0.08] text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
                isAudioEnabled
                  ? 'bg-black/[0.05] border-black/[0.1] text-[#1d1d1f]'
                  : 'border-black/[0.08] text-[#86868b] hover:text-[#1d1d1f]'
              }`}
              title={t.soundToggle}
            >
              {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{t.soundToggle}</span>
            </button>
          </div>

          {/* BPM Slider */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-[#86868b] font-medium whitespace-nowrap">
              {t.bpmLabel}:
            </span>
            <input
              type="range"
              min="40"
              max="120"
              step="5"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full sm:w-36 accent-[#0071e3]"
            />
            <span className="text-xs font-mono font-semibold text-[#1d1d1f] w-8 text-right">
              {bpm}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
