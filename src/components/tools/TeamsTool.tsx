import React, { useState } from 'react';
import { Shuffle, Copy, Check, Maximize2, Minimize2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { shuffle } from '../../utils/random';
import { loadPresentNames } from '../../utils/groupNames';
import { tr, Panel, Stepper, primaryBtn, chipCls } from './common';
import { GroupManager } from './GroupManager';

const pairKey = (a: string, b: string) => [a, b].sort().join('||');

const split = (names: string[], count: number): string[][] => {
  const teams: string[][] = Array.from({ length: count }, () => []);
  shuffle(names).forEach((n, i) => teams[i % count].push(n));
  return teams;
};

const repeats = (teams: string[][], seen: Record<string, number>) => {
  let s = 0;
  for (const t of teams) {
    for (let i = 0; i < t.length; i++) {
      for (let j = i + 1; j < t.length; j++) {
        s += seen[pairKey(t[i], t[j])] || 0;
      }
    }
  }
  return s;
};

export const TeamsTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [names, setNames] = useState<string[]>(() => loadPresentNames());
  const [mode, setMode] = useState<'teams' | 'pairs'>('teams');
  const [count, setCount] = useState(2);
  const [avoid, setAvoid] = useLocalState<boolean>('jy_teams_avoid', true);
  const [seen, setSeen] = useLocalState<Record<string, number>>('jy_teams_seen', {});
  const [result, setResult] = useState<string[][]>([]);
  const [copied, setCopied] = useState(false);
  const [isBeamer, setIsBeamer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useWakeLock(isBeamer);

  const run = () => {
    if (names.length < 2) return;
    const n = mode === 'pairs' ? Math.ceil(names.length / 2) : Math.min(count, names.length);
    let best = split(names, n);
    if (avoid) {
      let bestScore = repeats(best, seen);
      for (let i = 0; i < 300 && bestScore > 0; i++) {
        const cand = split(names, n);
        const score = repeats(cand, seen);
        if (score < bestScore) {
          best = cand;
          bestScore = score;
        }
      }
    }
    setResult(best);
    const next = { ...seen };
    for (const t of best) {
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          next[pairKey(t[i], t[j])] = (next[pairKey(t[i], t[j])] || 0) + 1;
        }
      }
    }
    setSeen(next);
  };

  const label = (i: number) => (mode === 'pairs' ? L(`Tandem ${i + 1}`, `Pair ${i + 1}`) : L(`Team ${i + 1}`, `Team ${i + 1}`));

  const copy = async () => {
    const out = result.map((t, i) => `${label(i)}: ${t.join(', ')}`).join('\n');
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-5">
      {/* "So geht's" Expandable Help */}
      <div className="bg-surface-2 rounded-card border border-border p-4">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-text" />
            <span>{L('So geht’s: Teams und Zweiergruppen', 'How it works: Teams and Pairs')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Teilt die anwesenden Jugendlichen automatisch in faire Teams oder Tandems auf. Der Zufallsgenerator merkt sich frühere Runden, sodass nicht immer wieder dieselben Personen zusammenarbeiten.',
              'Divides the present youth into fair teams or buddy pairs. The randomiser avoids past pairings so participants rotate and connect with everyone.'
            )}
          </p>
        )}
      </div>

      {/* 1. Shared Group Manager */}
      <GroupManager
        language={language}
        onNamesChange={(presentList) => setNames(presentList)}
      />

      {/* 2. Controls Panel */}
      <Panel className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={mode === 'teams'}
              onClick={() => setMode('teams')}
              className={chipCls(mode === 'teams')}
            >
              {L('Gleichmäßige Teams', 'Even teams')}
            </button>
            <button
              type="button"
              aria-pressed={mode === 'pairs'}
              onClick={() => setMode('pairs')}
              className={chipCls(mode === 'pairs')}
            >
              {L('Zweiergruppen (Rotation)', 'Pairs (Rotation)')}
            </button>
          </div>

          {mode === 'teams' && (
            <Stepper
              value={count}
              min={2}
              max={8}
              onChange={setCount}
              label={L('Anzahl Teams', 'Number of teams')}
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-text min-h-[40px] cursor-pointer">
          <input
            type="checkbox"
            checked={avoid}
            onChange={(e) => setAvoid(e.target.checked)}
            className="w-4 h-4 accent-accent rounded-xs"
          />
          <span>{L('Gleiche Paarungen aus früheren Runden vermeiden', 'Avoid repeating pairings from earlier rounds')}</span>
        </label>
      </Panel>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={run}
        disabled={names.length < 2}
        className={`${primaryBtn} w-full`}
      >
        <Shuffle className="w-4 h-4" />
        <span>{L('Jetzt Teams mischen', 'Shuffle teams now')}</span>
      </button>

      {/* Results View */}
      {result.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">
              {L('Einteilung', 'Result')} ({names.length} {L('Personen', 'people')})
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBeamer(true)}
                className="px-3 py-1.5 rounded-control bg-accent text-accent-contrast font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{L('Beamer-Ansicht', 'Projector view')}</span>
              </button>

              <button
                type="button"
                onClick={copy}
                className="px-3 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? L('Kopiert!', 'Copied!') : L('Kopieren', 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {result.map((team, i) => (
              <Panel key={i} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-text uppercase tracking-wider">
                    {label(i)}
                  </span>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-chip bg-surface-2 text-text-tertiary">
                    {team.length} {L('Personen', 'people')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {team.map((person) => (
                    <span
                      key={person}
                      className="inline-flex items-center px-3 py-1 rounded-control bg-surface-2 text-text font-bold text-xs border border-border"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Beamer View */}
      {isBeamer && result.length > 0 && (
        <div
          className="fixed inset-0 z-80 bg-bg text-text p-6 sm:p-10 flex flex-col justify-between safe-top safe-bottom animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight">
                {L('Gruppeneinteilung', 'Team Allocation')}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {names.length} {L('Personen in', 'people in')} {result.length} {mode === 'pairs' ? L('Tandems', 'pairs') : L('Teams', 'teams')}
              </p>
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

          <div className="my-auto max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 overflow-y-auto">
            {result.map((team, i) => (
              <div key={i} className="p-6 rounded-card bg-surface border border-border shadow-xs space-y-4">
                <div className="text-sm font-bold text-accent-text uppercase tracking-wider border-b border-border pb-2">
                  {label(i)}
                </div>
                <ul className="space-y-2">
                  {team.map((person) => (
                    <li key={person} className="text-lg sm:text-xl font-extrabold text-text flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      <span>{person}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4 shrink-0 text-xs text-text-tertiary">
            <span>{L('Bildschirm bleibt an (Wake Lock aktiv)', 'Screen kept awake (Wake Lock active)')}</span>
            <button
              type="button"
              onClick={run}
              className="px-4 py-2 rounded-control bg-accent text-accent-contrast font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>{L('Neu mischen', 'Shuffle again')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
