import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { tr, primaryBtn, secondaryBtn, chipCls } from './common';

const PRESETS = [60, 120, 180, 300, 600, 900];

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export const TimerTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [total, setTotal] = useLocalState<number>('jy_timer_total', 300);
  const [sound, setSound] = useLocalState<boolean>('jy_timer_sound', true);
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);
  useWakeLock(running);

  const chime = useCallback(() => {
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      /* ignore */
    }
    if (!sound) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.2);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 1.3);
      });
    } catch {
      /* audio blocked */
    }
  }, [sound]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        chime();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, chime]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    const start = remaining === 0 ? total : remaining;
    setRemaining(start);
    endRef.current = Date.now() + start * 1000;
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setRemaining(total);
  };
  const choose = (s: number) => {
    setRunning(false);
    setTotal(s);
    setRemaining(s);
  };
  const addMinute = () => {
    endRef.current += 60000;
    setRemaining((r) => r + 60);
    if (!running) setTotal(total + 60);
  };

  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  return (
    <div className="space-y-6 text-center">
      <div className="py-8 sm:py-14 border border-border rounded-2xl bg-surface">
        <div
          className={`text-[22vw] sm:text-[9rem] leading-none font-semibold tabular-nums tracking-tight select-none ${remaining === 0 ? 'text-accent-text' : 'text-text'}`}
          role="timer"
          aria-live="off"
        >
          {fmt(remaining)}
        </div>
        <div className="mx-auto mt-6 h-1.5 w-2/3 max-w-md rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={toggle} className={`${primaryBtn} min-w-[160px]`}>
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {running ? L('Anhalten', 'Pause') : L('Start', 'Start')}
        </button>
        <button type="button" onClick={addMinute} className={secondaryBtn}>
          +1 {L('Min', 'min')}
        </button>
        <button type="button" onClick={reset} className={secondaryBtn} aria-label={L('Zurücksetzen', 'Reset')}>
          <RotateCcw className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setSound(!sound)} className={secondaryBtn} aria-label={L('Ton', 'Sound')} aria-pressed={sound}>
          {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((s) => (
          <button key={s} type="button" onClick={() => choose(s)} aria-pressed={total === s} className={chipCls(total === s)}>
            {s / 60} {L('Min', 'min')}
          </button>
        ))}
      </div>
    </div>
  );
};
