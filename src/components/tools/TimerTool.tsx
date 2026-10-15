import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, HelpCircle, ChevronDown, ChevronUp, Clock, Repeat } from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { tr, Panel, primaryBtn, secondaryBtn, chipCls } from './common';

const PRESETS = [60, 120, 180, 300, 600, 900];

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export const TimerTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [timerMode, setTimerMode] = useState<'standard' | 'interval'>('standard');
  const [total, setTotal] = useLocalState<number>('jy_timer_total', 300);
  const [sound, setSound] = useLocalState<boolean>('jy_timer_sound', true);
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const [isBeamer, setIsBeamer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Interval timer states
  const [intervalWork, setIntervalWork] = useLocalState<number>('jy_timer_work', 120);
  const [intervalRest, setIntervalRest] = useLocalState<number>('jy_timer_rest', 30);
  const [intervalRounds, setIntervalRounds] = useLocalState<number>('jy_timer_rounds', 5);
  const [currentRound, setCurrentRound] = useState(1);
  const [intervalPhase, setIntervalPhase] = useState<'work' | 'pause'>('work');

  const endRef = useRef(0);
  useWakeLock(running || isBeamer);

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
            // switch to rest
            setIntervalPhase('pause');
            setRemaining(intervalRest);
            endRef.current = Date.now() + intervalRest * 1000;
          } else {
            // rest finished
            if (currentRound < intervalRounds) {
              setCurrentRound((r) => r + 1);
              setIntervalPhase('work');
              setRemaining(intervalWork);
              endRef.current = Date.now() + intervalWork * 1000;
            } else {
              // all rounds finished
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
    const start = remaining === 0 ? (timerMode === 'standard' ? total : (intervalPhase === 'work' ? intervalWork : intervalRest)) : remaining;
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

  const addMinute = () => {
    endRef.current += 60000;
    setRemaining((r) => r + 60);
    if (!running && timerMode === 'standard') setTotal(total + 60);
  };

  const currentDurationTotal = timerMode === 'standard' ? total : (intervalPhase === 'work' ? intervalWork : intervalRest);
  const pct = currentDurationTotal > 0 ? Math.max(0, Math.min(1, remaining / currentDurationTotal)) : 0;

  return (
    <div className="space-y-6 text-center">
      {/* "So geht's" Expandable Help */}
      <div className="bg-surface-2 rounded-card border border-border p-4 text-left">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-text" />
            <span>{L('So geht’s: Timer & Intervalluhr', 'How it works: Timer & Intervals')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Große, ablenkungsfreie Zeitanzeige für Spiele, Vorträge oder Stationenläufe. Funktioniert zuverlässig auch wenn der Bildschirm ausgeht, mit akustischem Gong.',
              'Clean, distraction-free countdown for games, talks, or station challenges. Continues running accurately even in the background, with an audible chime.'
            )}
          </p>
        )}
      </div>

      {/* Mode Switcher: Countdown vs Intervall */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setTimerMode('standard');
            setRemaining(total);
          }}
          className={chipCls(timerMode === 'standard')}
        >
          <Clock className="w-4 h-4 inline mr-1.5" />
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
          <Repeat className="w-4 h-4 inline mr-1.5" />
          <span>{L('Intervall (Runden & Pause)', 'Intervals')}</span>
        </button>
      </div>

      {/* Main Display: HUGE digits (>= 30vw on mobile, pure clean font-mono) */}
      <div className="py-8 sm:py-14 border border-border rounded-card bg-surface relative shadow-xs">
        {/* Phase pill if interval mode */}
        {timerMode === 'interval' && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-chip font-bold text-xs ${
              intervalPhase === 'work' ? 'bg-accent-subtle text-accent-text' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            }`}>
              {intervalPhase === 'work' ? L(`Aktiv (Runde ${currentRound} / ${intervalRounds})`, `Active (Round ${currentRound} / ${intervalRounds})`) : L(`Pause (vor Runde ${currentRound + 1})`, `Rest (before round ${currentRound + 1})`)}
            </span>
          </div>
        )}

        <div
          className={`text-[30vw] sm:text-[9rem] leading-none font-extrabold font-mono tabular-nums tracking-tight select-none ${
            remaining === 0 ? 'text-accent-text' : 'text-text'
          }`}
          role="timer"
          aria-live="off"
        >
          {fmt(remaining)}
        </div>

        {/* Progress Bar */}
        <div className="mx-auto mt-6 h-2 w-2/3 max-w-md rounded-full bg-surface-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${intervalPhase === 'pause' ? 'bg-emerald-500' : 'bg-accent'}`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className={`${primaryBtn} min-w-[140px] text-base`}
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
          onClick={addMinute}
          className={secondaryBtn}
          title={L('+1 Minute hinzufügen', '+1 minute')}
        >
          +1m
        </button>

        <button
          type="button"
          onClick={() => setSound(!sound)}
          className={secondaryBtn}
          aria-label={sound ? L('Ton ausschalten', 'Mute') : L('Ton einschalten', 'Unmute')}
        >
          {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-text-tertiary" />}
        </button>

        <button
          type="button"
          onClick={() => setIsBeamer(true)}
          className={secondaryBtn}
          title={L('Beamer-Vollbild', 'Fullscreen projector view')}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Presets / Interval Settings Panel */}
      {timerMode === 'standard' ? (
        <Panel className="space-y-3">
          <p className="text-xs font-semibold text-text-secondary">{L('Schnellwahl', 'Presets')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => choosePreset(s)}
                className={chipCls(total === s && !running)}
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
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-bold"
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
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-bold"
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

      {/* Fullscreen Beamer Mode Overlay */}
      {isBeamer && (
        <div
          className="fixed inset-0 z-80 bg-bg text-text p-6 sm:p-10 flex flex-col justify-between safe-top safe-bottom animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-text" />
              <span className="text-sm font-bold text-text">{L('Timer-Beamer', 'Projector Timer')}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBeamer(false)}
              className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised text-text font-bold text-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{L('Schließen', 'Close')}</span>
            </button>
          </div>

          {/* Huge Screen Digits */}
          <div className="my-auto max-w-4xl mx-auto w-full text-center space-y-6">
            {timerMode === 'interval' && (
              <span className={`inline-flex items-center px-4 py-1.5 rounded-chip font-bold text-sm sm:text-base ${
                intervalPhase === 'work' ? 'bg-accent-subtle text-accent-text' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              }`}>
                {intervalPhase === 'work' ? L(`Aktiv (Runde ${currentRound} / ${intervalRounds})`, `Active (Round ${currentRound} / ${intervalRounds})`) : L(`Pause`, `Rest`)}
              </span>
            )}

            <div className="text-[28vw] sm:text-[14rem] leading-none font-mono font-black text-accent-text select-none tracking-tight">
              {fmt(remaining)}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={toggle}
                className="px-8 py-4 rounded-control bg-accent text-accent-contrast font-bold text-lg flex items-center gap-2 shadow-xs cursor-pointer min-h-[56px]"
              >
                {running ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                <span>{running ? L('Pause', 'Pause') : L('Start', 'Start')}</span>
              </button>

              <button
                type="button"
                onClick={reset}
                className="px-6 py-4 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-bold text-base cursor-pointer min-h-[56px]"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-text-tertiary">
            {L('Bildschirm bleibt an (Wake Lock aktiv)', 'Screen kept awake (Wake Lock active)')}
          </div>
        </div>
      )}
    </div>
  );
};
