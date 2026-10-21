import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Clock,
  Repeat,
} from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { tr, Panel, primaryBtn, secondaryBtn, chipCls } from './common';

const PRESETS = [60, 120, 180, 300, 600, 900];

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export const TimerTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [timerMode, setTimerMode] = useState<'standard' | 'interval'>('standard');
  const [total, setTotal] = useLocalState<number>('jy_timer_total', 300);
  const [sound, setSound] = useLocalState<boolean>('jy_timer_sound', true);
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Interval timer states
  const [intervalWork, setIntervalWork] = useLocalState<number>('jy_timer_work', 120);
  const [intervalRest, setIntervalRest] = useLocalState<number>('jy_timer_rest', 30);
  const [intervalRounds, setIntervalRounds] = useLocalState<number>('jy_timer_rounds', 5);
  const [currentRound, setCurrentRound] = useState(1);
  const [intervalPhase, setIntervalPhase] = useState<'work' | 'pause'>('work');

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
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  // Main countdown engine (resilient against backgrounding via endRef timestamp)
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        if (timerMode === 'standard') {
          setRunning(false);
          chime();
        } else {
          // Interval mode logic
          chime();
          if (intervalPhase === 'work') {
            setIntervalPhase('pause');
            setRemaining(intervalRest);
            endRef.current = Date.now() + intervalRest * 1000;
          } else {
            if (currentRound < intervalRounds) {
              setCurrentRound((r) => r + 1);
              setIntervalPhase('work');
              setRemaining(intervalWork);
              endRef.current = Date.now() + intervalWork * 1000;
            } else {
              setRunning(false);
              setIntervalPhase('work');
              setCurrentRound(1);
            }
          }
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, chime, timerMode, intervalPhase, intervalRest, intervalWork, intervalRounds, currentRound]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    const start =
      remaining === 0
        ? timerMode === 'standard'
          ? total
          : intervalPhase === 'work'
          ? intervalWork
          : intervalRest
        : remaining;
    setRemaining(start);
    endRef.current = Date.now() + start * 1000;
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    if (timerMode === 'standard') {
      setRemaining(total);
    } else {
      setIntervalPhase('work');
      setCurrentRound(1);
      setRemaining(intervalWork);
    }
  };

  const choosePreset = (s: number) => {
    setRunning(false);
    setTotal(s);
    setRemaining(s);
  };

  // Quick delta adjustments (+30s, +1m, -30s) during active/paused countdown
  const adjustTime = (deltaSeconds: number) => {
    if (deltaSeconds < 0) {
      const newRemain = Math.max(0, remaining + deltaSeconds);
      setRemaining(newRemain);
      if (running) {
        endRef.current = Math.max(Date.now(), endRef.current + deltaSeconds * 1000);
      }
      if (!running && timerMode === 'standard') {
        setTotal(Math.max(10, total + deltaSeconds));
      }
    } else {
      setRemaining((r) => r + deltaSeconds);
      if (running) {
        endRef.current += deltaSeconds * 1000;
      }
      if (!running && timerMode === 'standard') {
        setTotal((t) => t + deltaSeconds);
      }
    }
  };

  const currentDurationTotal =
    timerMode === 'standard' ? total : intervalPhase === 'work' ? intervalWork : intervalRest;
  const pct =
    currentDurationTotal > 0 ? Math.max(0, Math.min(1, remaining / currentDurationTotal)) : 0;

  // Screen reader announcement at sensible intervals
  const srAnnouncement = (() => {
    if (!running && remaining === 0) {
      return L('Zeit abgelaufen', 'Time is up');
    }
    if (!running) return '';
    if (remaining > 0 && remaining % 60 === 0 && remaining !== currentDurationTotal) {
      const mins = remaining / 60;
      return mins === 1
        ? L('Noch 1 Minute', '1 minute remaining')
        : L(`Noch ${mins} Minuten`, `${mins} minutes remaining`);
    }
    if (remaining === 30 || remaining === 10 || (remaining <= 5 && remaining >= 1)) {
      return L(`Noch ${remaining} Sekunden`, `${remaining} seconds remaining`);
    }
    return '';
  })();

  return (
    <div className="space-y-6 text-center">
      {/* Polite Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      {/* Mode Switcher & Top Utility Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-control">
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setTimerMode('standard');
              setRemaining(total);
            }}
            className={chipCls(timerMode === 'standard')}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            <span>{L('Countdown', 'Countdown')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setTimerMode('interval');
              setIntervalPhase('work');
              setCurrentRound(1);
              setRemaining(intervalWork);
            }}
            className={chipCls(timerMode === 'interval')}
          >
            <Repeat className="w-3.5 h-3.5 inline mr-1" />
            <span>{L('Intervall', 'Intervals')}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-control border text-xs font-semibold flex items-center justify-center min-h-[38px] min-w-[38px] transition-colors cursor-pointer ${
              showHelp
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-surface-2 hover:bg-surface-raised border-border text-text-secondary hover:text-text'
            }`}
            title={L('Hilfe & Anleitung', 'Help & instructions')}
            aria-label={L('Hilfe & Anleitung', 'Help & instructions')}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Help (only when requested) */}
      {showHelp && (
        <div className="bg-surface-2 rounded-card border border-border p-3 text-left text-xs text-text-secondary animate-in fade-in duration-150">
          <p className="leading-relaxed">
            {L(
              'Große Zeitanzeige für Spiele, Vorträge oder Stationenläufe. Tippe auf den Kreis oder nutze Start/Pause und passe die Zeit mit den Schnellknöpfen (+30s / +1m) an.',
              'Clean countdown for games, talks, or stations. Tap the circle or use Start/Pause and adjust time with quick buttons (+30s / +1m).'
            )}
          </p>
        </div>
      )}

      {/* Main Display: Calm Circular Progress Arc (6px stroke) + Large Digits */}
      <div className="py-2 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={toggle}
          aria-label={running ? L('Pause', 'Pause') : L('Start', 'Start')}
          className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center rounded-full transition-transform active:scale-98 cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
        >
          {/* Circular SVG Track & Arc */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
            {/* Background subtle track */}
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="var(--line)"
              strokeWidth="6"
            />
            {/* Animated stroke progress arc - 6px stroke visible across the room */}
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke={
                remaining <= 10 && remaining > 0 && running
                  ? '#EF4444'
                  : intervalPhase === 'pause'
                  ? '#F59E0B'
                  : 'var(--accent)'
              }
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 130}
              strokeDashoffset={2 * Math.PI * 130 * (1 - pct)}
              strokeLinecap="round"
              transform="rotate(-90 150 150)"
              className="transition-[stroke-dashoffset,stroke] duration-300"
            />
          </svg>

          {/* Central Digits & Status */}
          <div className="relative z-10 text-center px-4">
            {timerMode === 'interval' && (
              <span
                className={`inline-block mb-1.5 text-2xs font-sans font-bold px-2.5 py-0.5 rounded-full ${
                  intervalPhase === 'work'
                    ? 'bg-accent/15 text-accent'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {intervalPhase === 'work'
                  ? L(`Runde ${currentRound}/${intervalRounds}`, `Round ${currentRound}/${intervalRounds}`)
                  : L('Pause', 'Rest')}
              </span>
            )}
            <div
              className={`font-sans font-extrabold tabular-nums tracking-tight select-none transition-colors text-5xl sm:text-6xl ${
                remaining <= 10 && remaining > 0 && running
                  ? 'text-red-400'
                  : remaining === 0
                  ? 'text-accent'
                  : 'text-text'
              }`}
              role="timer"
              aria-live="off"
            >
              {fmt(remaining)}
            </div>
            <span className="text-2xs font-sans text-text-tertiary mt-2 block">
              {running
                ? L('Tippen für Pause', 'Tap to pause')
                : remaining === 0
                ? L('Fertig · Tippen für Neustart', 'Done · Tap to restart')
                : L('Tippen zum Starten', 'Tap to start')}
            </span>
          </div>
        </button>
      </div>

      {/* Main Controls Row + Schnellzeit-Knöpfe */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={toggle}
            className={`${primaryBtn} min-w-[130px] sm:min-w-[150px] text-base`}
          >
            {running ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{running ? L('Pause', 'Pause') : L('Start', 'Start')}</span>
          </button>

          <button
            type="button"
            onClick={reset}
            className={secondaryBtn}
            title={L('Zurücksetzen', 'Reset')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSound(!sound)}
            className={secondaryBtn}
            aria-label={sound ? L('Ton ausschalten', 'Mute') : L('Ton einschalten', 'Unmute')}
          >
            {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-text-tertiary" />}
          </button>
        </div>

        {/* Schnellzeit-Knöpfe (-30s, +30s, +1m) */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => adjustTime(-30)}
            disabled={remaining <= 10}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text-secondary hover:text-text disabled:opacity-30 transition-colors cursor-pointer"
            title={L('30 Sekunden abziehen', 'Subtract 30 seconds')}
          >
            -30s
          </button>
          <button
            type="button"
            onClick={() => adjustTime(30)}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text-secondary hover:text-text transition-colors cursor-pointer"
            title={L('30 Sekunden hinzufügen', 'Add 30 seconds')}
          >
            +30s
          </button>
          <button
            type="button"
            onClick={() => adjustTime(60)}
            className="px-3.5 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text-secondary hover:text-text transition-colors cursor-pointer"
            title={L('1 Minute hinzufügen', 'Add 1 minute')}
          >
            +1m
          </button>
        </div>
      </div>

      {/* Presets / Interval Settings Panel */}
      {timerMode === 'standard' ? (
        <Panel className="space-y-3">
          <p className="text-xs font-semibold text-text-secondary">{L('Schnellwahl', 'Presets')}</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => choosePreset(s)}
                className={`${chipCls(total === s && !running)} justify-center text-center`}
              >
                {s >= 60 ? `${s / 60} Min` : `${s}s`}
              </button>
            ))}
          </div>
        </Panel>
      ) : (
        <Panel className="space-y-4 max-w-md mx-auto text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text block mb-1">{L('Aktiv-Zeit', 'Work time')}</label>
              <select
                value={intervalWork}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setIntervalWork(val);
                  if (!running) setRemaining(val);
                }}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-bold text-text"
              >
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>1:00</option>
                <option value={90}>1:30</option>
                <option value={120}>2:00</option>
                <option value={180}>3:00</option>
                <option value={300}>5:00</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-text block mb-1">{L('Pause-Zeit', 'Rest time')}</label>
              <select
                value={intervalRest}
                onChange={(e) => setIntervalRest(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-bold text-text"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>1:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text block mb-1">{L('Rundenanzahl', 'Number of rounds')}</label>
            <div className="flex gap-2">
              {[3, 4, 5, 8, 10].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setIntervalRounds(r)}
                  className={chipCls(intervalRounds === r)}
                >
                  {r} {L('Runden', 'rounds')}
                </button>
              ))}
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
};
