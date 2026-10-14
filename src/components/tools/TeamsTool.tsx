import React, { useMemo, useState } from 'react';
import { Shuffle, Copy, Check } from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { shuffle } from '../../utils/random';
import { NAMES_KEY, parseNames } from '../../utils/groupNames';
import { tr, Panel, Label, Stepper, primaryBtn, secondaryBtn, chipCls } from './common';

const pairKey = (a: string, b: string) => [a, b].sort().join('||');

const split = (names: string[], count: number): string[][] => {
  const teams: string[][] = Array.from({ length: count }, () => []);
  shuffle(names).forEach((n, i) => teams[i % count].push(n));
  return teams;
};

const repeats = (teams: string[][], seen: Record<string, number>) => {
  let s = 0;
  for (const t of teams) for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) s += seen[pairKey(t[i], t[j])] || 0;
  return s;
};

export const TeamsTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [text, setText] = useLocalState<string>(NAMES_KEY, '');
  const [mode, setMode] = useState<'teams' | 'pairs'>('teams');
  const [count, setCount] = useState(2);
  const [avoid, setAvoid] = useLocalState<boolean>('jy_teams_avoid', true);
  const [seen, setSeen] = useLocalState<Record<string, number>>('jy_teams_seen', {});
  const [result, setResult] = useState<string[][]>([]);
  const [copied, setCopied] = useState(false);
  const names = useMemo(() => parseNames(text), [text]);

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
    for (const t of best) for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) next[pairKey(t[i], t[j])] = (next[pairKey(t[i], t[j])] || 0) + 1;
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
      <Panel className="space-y-4">
        <div>
          <Label htmlFor="teams-names">{L('Namen (ein Name pro Zeile oder mit Komma)', 'Names (one per line or comma-separated)')}</Label>
          <textarea
            id="teams-names"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface-2 border border-border text-sm"
            placeholder="Amin, Leyla, Jonas, Maya"
          />
          <p className="text-xs text-text-tertiary mt-1 tabular-nums">{L(`${names.length} Personen`, `${names.length} people`)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button type="button" aria-pressed={mode === 'teams'} onClick={() => setMode('teams')} className={chipCls(mode === 'teams')}>
              {L('Teams', 'Teams')}
            </button>
            <button type="button" aria-pressed={mode === 'pairs'} onClick={() => setMode('pairs')} className={chipCls(mode === 'pairs')}>
              {L('Zweiergruppen', 'Pairs')}
            </button>
          </div>
          {mode === 'teams' && <Stepper value={count} min={2} max={8} onChange={setCount} label={L('Anzahl Teams', 'Number of teams')} />}
        </div>
        <label className="flex items-center gap-2 text-sm min-h-[40px]">
          <input type="checkbox" checked={avoid} onChange={(e) => setAvoid(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
          {L('Gleiche Paarungen wie in früheren Runden vermeiden', 'Avoid pairings from earlier rounds')}
        </label>
      </Panel>
      <button type="button" onClick={run} disabled={names.length < 2} className={`${primaryBtn} w-full`}>
        <Shuffle className="w-4 h-4" />
        {result.length ? L('Neu mischen', 'Shuffle again') : L('Einteilen', 'Split')}
      </button>

      {result.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.map((t, i) => (
              <div key={i} className="border border-border rounded-xl bg-surface p-4">
                <p className="text-xs text-text-tertiary mb-2">{label(i)}</p>
                <ul className="space-y-1 text-lg text-text">
                  {t.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={copy} className={secondaryBtn}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? L('Kopiert', 'Copied') : L('Kopieren', 'Copy')}
            </button>
            {Object.keys(seen).length > 0 && (
              <button type="button" onClick={() => setSeen({})} className={secondaryBtn}>
                {L('Verlauf löschen', 'Clear history')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
