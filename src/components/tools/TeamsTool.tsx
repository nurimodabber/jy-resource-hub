import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shuffle,
  RotateCw,
  Copy,
  Check,
  HelpCircle,
  ArrowRightLeft,
  Award,
  Users,
  User,
  Plus,
  Minus,
  X,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { shuffle } from '../../utils/random';
import {
  loadGroupNames,
  saveGroupNames,
  loadGroupPresent,
  saveGroupPresent,
  parseNames,
} from '../../utils/groupNames';
import { tr, Panel } from './common';

const pairKey = (a: string, b: string) => [a, b].sort().join('||');

const splitByTeamCount = (names: string[], count: number): string[][] => {
  const safeCount = Math.max(1, count);
  const teams: string[][] = Array.from({ length: safeCount }, () => []);
  shuffle(names).forEach((n, i) => teams[i % safeCount].push(n));
  return teams;
};

const splitByTeamSize = (names: string[], size: number): string[][] => {
  const safeSize = Math.max(1, size);
  const count = Math.max(1, Math.ceil(names.length / safeSize));
  const teams: string[][] = Array.from({ length: count }, () => []);
  shuffle(names).forEach((n, i) => teams[i % count].push(n));
  return teams;
};

/**
 * Berger Round-Robin circle rotation:
 * Keeps participant 0 fixed and cycles all other participants clockwise by 1.
 * Preserves the exact team sizes and guarantees fresh pairings across rounds.
 */
const rotateTeams = (currentTeams: string[][]): string[][] => {
  if (currentTeams.length < 2) return currentTeams;
  const flat = currentTeams.flat();
  if (flat.length < 2) return currentTeams;

  const teamSizes = currentTeams.map((t) => t.length);

  const first = flat[0];
  const rest = flat.slice(1);
  const rotatedRest = [rest[rest.length - 1], ...rest.slice(0, -1)];
  const rotatedFlat = [first, ...rotatedRest];

  const newTeams: string[][] = [];
  let cursor = 0;
  for (const size of teamSizes) {
    newTeams.push(rotatedFlat.slice(cursor, cursor + size));
    cursor += size;
  }

  return newTeams;
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

const TEAM_THEMES = [
  {
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dot: 'bg-blue-500',
  },
  {
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  {
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  {
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  {
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dot: 'bg-purple-500',
  },
  {
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  {
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    dot: 'bg-orange-500',
  },
  {
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
];

export const TeamsTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const navigate = useNavigate();

  // Load roster and attendance
  const [allGroupNames, setAllGroupNames] = useState<string[]>(() => loadGroupNames());
  const [present, setPresent] = useState<Record<string, boolean>>(() => loadGroupPresent());
  const [names, setNames] = useState<string[]>(() => {
    const all = loadGroupNames();
    const p = loadGroupPresent();
    const active = all.filter((n) => p[n] !== false);
    return active.length > 0 ? active : all;
  });

  const [newNameInput, setNewNameInput] = useState('');
  const [splitMode, setSplitMode] = useState<'byCount' | 'bySize'>('byCount');
  const [teamCount, setTeamCount] = useState(2);
  const [teamSize, setTeamSize] = useState(4);
  const [avoid, setAvoid] = useLocalState<boolean>('jy_teams_avoid', true);
  const [seen, setSeen] = useLocalState<Record<string, number>>('jy_teams_seen', {});

  const [result, setResult] = useState<string[][]>(() => {
    try {
      const stored = localStorage.getItem('jy_teams_last_split');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const all = loadGroupNames();
      const p = loadGroupPresent();
      const active = all.filter((n) => p[n] !== false);
      if (active.length >= 2) {
        return splitByTeamCount(active, 2);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [rotateNotice, setRotateNotice] = useState<string | null>(null);

  // Manual move state: which person is currently selected for moving?
  const [movingPerson, setMovingPerson] = useState<{ person: string; fromTeam: number } | null>(null);

  // Absent group members who can be reactivated with a single tap
  const absentNames = allGroupNames.filter((n) => !names.includes(n));

  // Remove person from active list (and mark absent in present map)
  const handleRemovePerson = (nameToRemove: string) => {
    const updated = names.filter((n) => n !== nameToRemove);
    setNames(updated);
    const nextPresent = { ...present, [nameToRemove]: false };
    setPresent(nextPresent);
    saveGroupPresent(nextPresent);
  };

  // Quick add a new person by typing and submitting
  const handleAddPerson = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newNameInput.trim();
    if (!trimmed) return;
    const items = parseNames(trimmed);
    if (items.length === 0) return;

    const updatedNames = [...names];
    const updatedAll = [...allGroupNames];
    const updatedPresent = { ...present };

    items.forEach((item) => {
      if (!updatedNames.some((n) => n.toLowerCase() === item.toLowerCase())) {
        updatedNames.push(item);
      }
      if (!updatedAll.some((n) => n.toLowerCase() === item.toLowerCase())) {
        updatedAll.push(item);
      }
      updatedPresent[item] = true;
    });

    setNames(updatedNames);
    setAllGroupNames(updatedAll);
    setPresent(updatedPresent);
    saveGroupNames(updatedAll);
    saveGroupPresent(updatedPresent);
    setNewNameInput('');
  };

  // Re-add an absent person from group roster
  const handleAddAbsentPerson = (nameToAdd: string) => {
    if (!names.includes(nameToAdd)) {
      const updated = [...names, nameToAdd];
      setNames(updated);
      const nextPresent = { ...present, [nameToAdd]: true };
      setPresent(nextPresent);
      saveGroupPresent(nextPresent);
    }
  };

  // Mark all members from group roster as present
  const handleMarkAllPresent = () => {
    const updated = [...allGroupNames];
    setNames(updated);
    const nextPresent: Record<string, boolean> = {};
    updated.forEach((n) => {
      nextPresent[n] = true;
    });
    setPresent(nextPresent);
    saveGroupPresent(nextPresent);
  };

  // Primary action 1: Random Shuffle
  const handleShuffle = () => {
    if (names.length < 2) return;
    setMovingPerson(null);
    setRotateNotice(null);

    let best: string[][];
    if (splitMode === 'bySize') {
      best = splitByTeamSize(names, Math.max(2, teamSize));
    } else {
      best = splitByTeamCount(names, Math.min(teamCount, names.length));
    }

    if (avoid) {
      let bestScore = repeats(best, seen);
      for (let i = 0; i < 300 && bestScore > 0; i++) {
        const cand =
          splitMode === 'bySize'
            ? splitByTeamSize(names, Math.max(2, teamSize))
            : splitByTeamCount(names, Math.min(teamCount, names.length));
        const score = repeats(cand, seen);
        if (score < bestScore) {
          best = cand;
          bestScore = score;
        }
      }
    }

    setResult(best);
    try {
      localStorage.setItem('jy_teams_last_split', JSON.stringify(best));
    } catch {
      /* ignore */
    }

    // Record pairings in history
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

  // Primary action 2: Durchrotieren (Round-Robin Shift)
  const handleRotate = () => {
    if (names.length < 2) return;
    setMovingPerson(null);

    let nextTeams: string[][];
    if (result.length < 2) {
      // First round if none exist yet
      if (splitMode === 'bySize') {
        nextTeams = splitByTeamSize(names, Math.max(2, teamSize));
      } else {
        nextTeams = splitByTeamCount(names, Math.min(teamCount, names.length));
      }
    } else {
      nextTeams = rotateTeams(result);
    }

    setResult(nextTeams);
    try {
      localStorage.setItem('jy_teams_last_split', JSON.stringify(nextTeams));
    } catch {
      /* ignore */
    }

    // Record rotated pairings in history
    const next = { ...seen };
    for (const t of nextTeams) {
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          next[pairKey(t[i], t[j])] = (next[pairKey(t[i], t[j])] || 0) + 1;
        }
      }
    }
    setSeen(next);

    setRotateNotice(
      L(
        'Runde rotiert: Personen haben im Kreis die Gruppen gewechselt.',
        'Round rotated: participants shifted to next groups.'
      )
    );
    setTimeout(() => setRotateNotice(null), 3000);
  };

  // Move a person from one team to another manually
  const movePersonToTeam = (person: string, fromTeamIdx: number, toTeamIdx: number) => {
    if (fromTeamIdx === toTeamIdx) {
      setMovingPerson(null);
      return;
    }
    const updated = result.map((t, idx) => {
      if (idx === fromTeamIdx) {
        return t.filter((p) => p !== person);
      }
      if (idx === toTeamIdx) {
        return [...t, person];
      }
      return t;
    });
    setResult(updated);
    setMovingPerson(null);
    try {
      localStorage.setItem('jy_teams_last_split', JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const label = (i: number) =>
    splitMode === 'bySize' && teamSize === 2
      ? L(`Tandem ${i + 1}`, `Pair ${i + 1}`)
      : L(`Team ${i + 1}`, `Team ${i + 1}`);

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

  // Export directly to Scoreboard
  const exportToScoreboard = () => {
    if (result.length < 2) return;
    const scoreboardTeams = result.slice(0, 8).map((team, idx) => {
      const defaultName = label(idx);
      const membersText = team.length > 0 ? ` (${team.join(', ')})` : '';
      return {
        id: 't-' + idx + '-' + Date.now(),
        name: `${defaultName}${membersText}`,
        score: 0,
      };
    });
    try {
      localStorage.setItem('jy_scoreboard_teams', JSON.stringify(scoreboardTeams));
      localStorage.setItem('jy_teams_last_split', JSON.stringify(result));
    } catch {
      /* ignore */
    }
    navigate('/tools/scoreboard');
  };

  // Live calculation preview
  const getDivisionPreview = () => {
    if (names.length < 2) {
      return L('Mindestens 2 Personen eintragen', 'Enter at least 2 people');
    }

    const pWord = (n: number) => (n === 1 ? L('Person', 'person') : L('Personen', 'people'));
    const tWord = (n: number) => (n === 1 ? L('Team', 'team') : L('Teams', 'teams'));
    const pairWord = (n: number) => (n === 1 ? L('Tandem', 'pair') : L('Tandems', 'pairs'));

    if (splitMode === 'byCount') {
      const K = Math.min(Math.max(2, teamCount), names.length);
      const base = Math.floor(names.length / K);
      const rem = names.length % K;

      if (rem === 0) {
        return L(
          `Ergibt ${K} ${tWord(K)} mit je ${base} ${pWord(base)}`,
          `Results in ${K} ${tWord(K)} with ${base} ${pWord(base)} each`
        );
      }
      const larger = rem;
      const smaller = K - rem;
      return L(
        `Ergibt ${K} ${tWord(K)} (${larger}× ${base + 1} ${pWord(base + 1)}, ${smaller}× ${base} ${pWord(base)})`,
        `Results in ${K} ${tWord(K)} (${larger}× ${base + 1} ${pWord(base + 1)}, ${smaller}× ${base} ${pWord(base)})`
      );
    } else {
      const targetSize = Math.max(2, teamSize);
      const K = Math.max(1, Math.ceil(names.length / targetSize));
      const base = Math.floor(names.length / K);
      const rem = names.length % K;

      if (targetSize === 2) {
        if (rem === 0) {
          return L(
            `Ergibt ${K} ${pairWord(K)} (je 2 Personen)`,
            `Results in ${K} ${pairWord(K)} (2 people each)`
          );
        }
        return L(
          `Ergibt ${K} ${pairWord(K)} (${rem}× 3 Personen, ${K - rem}× 2 Personen)`,
          `Results in ${K} ${pairWord(K)} (${rem}× 3 people, ${K - rem}× 2 people)`
        );
      }

      if (rem === 0) {
        return L(
          `Ergibt ${K} ${tWord(K)} mit je ${base} ${pWord(base)}`,
          `Results in ${K} ${tWord(K)} with ${base} ${pWord(base)} each`
        );
      }
      const larger = rem;
      const smaller = K - rem;
      return L(
        `Ergibt ${K} ${tWord(K)} (${larger}× ${base + 1} ${pWord(base + 1)}, ${smaller}× ${base} ${pWord(base)})`,
        `Results in ${K} ${tWord(K)} (${larger}× ${base + 1} ${pWord(base + 1)}, ${smaller}× ${base} ${pWord(base)})`
      );
    }
  };

  // Max value limits
  const maxTeamCount = Math.min(8, Math.max(2, names.length));
  const maxTeamSize = Math.max(2, Math.min(10, names.length));

  return (
    <div className="space-y-4">
      {/* 1. TOP OVERVIEW: Participants & Compact Attendance (Space-Saving) */}
      <Panel className="p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-text">
              {L('Teilnehmende Personen', 'Participants')}
            </span>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              {names.length} {L('anwesend', 'present')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {absentNames.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="text-2xs font-semibold px-2.5 py-1 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text cursor-pointer transition-colors"
                title={L('Alle Personen als anwesend markieren', 'Mark all as present')}
              >
                {L('Alle anwesend', 'All present')}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`p-1.5 rounded-control border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer min-h-[32px] min-w-[32px] ${
                showHelp
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-surface-2 hover:bg-surface-raised border-border text-text-secondary hover:text-text'
              }`}
              title={L('Hilfe', 'Help')}
              aria-label={L('Hilfe', 'Help')}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact Chips & Quick-Add Input */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {names.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text shadow-2xs group transition-colors"
            >
              <span className="truncate max-w-[140px]">{name}</span>
              <button
                type="button"
                onClick={() => handleRemovePerson(name)}
                className="p-0.5 rounded-full text-text-tertiary hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors min-h-[20px] min-w-[20px] flex items-center justify-center"
                title={L(`${name} entfernen`, `Remove ${name}`)}
                aria-label={L(`${name} entfernen`, `Remove ${name}`)}
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </span>
          ))}

          {/* Inline Quick-Add Input */}
          <form onSubmit={handleAddPerson} className="inline-flex items-center">
            <div className="relative flex items-center">
              <input
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                placeholder={L('+ Person...', '+ Person...')}
                className="pl-3 pr-7 py-1 text-xs rounded-full bg-surface-2 hover:bg-surface-raised focus:bg-surface border border-dashed border-border focus:border-accent text-text placeholder:text-text-tertiary focus:outline-hidden min-h-[32px] w-32 sm:w-40 transition-all font-medium"
              />
              {newNameInput.trim() && (
                <button
                  type="submit"
                  className="absolute right-1 p-1 rounded-full bg-accent text-accent-contrast hover:bg-accent-hover cursor-pointer"
                  title={L('Hinzufügen', 'Add')}
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Absent members quick toggle */}
        {absentNames.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-2xs text-text-tertiary">
            <span className="font-medium mr-1">
              {L('Abwesend (tippen zum Dazuholen):', 'Absent (tap to include):')}
            </span>
            {absentNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleAddAbsentPerson(name)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2/60 hover:bg-surface-raised border border-border/60 text-text-secondary hover:text-text cursor-pointer transition-colors"
                title={L(`${name} hinzufügen`, `Add ${name}`)}
              >
                <Plus className="w-2.5 h-2.5 text-accent" />
                <span>{name}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* Expandable Help */}
      {showHelp && (
        <div className="bg-surface-2 rounded-card border border-border p-3 text-xs text-text-secondary leading-relaxed animate-in fade-in duration-150">
          <p>
            {L(
              'Teilt die anwesenden Personen automatisch in faire Teams oder Tandems auf. Wähle zwischen der gewünschten Teamanzahl oder Teamgröße, passe die Zahl an und wähle zwischen „Zufällig neu mischen“ und „Durchrotieren“ (ideal für wechselnde Stationsläufe). Einzelne Personen lassen sich anschließend per Klick manuell verschieben.',
              'Automatically divides present participants into fair teams or pairs. Choose between team count or team size, set the number, and choose between "Random Reshuffle" and "Rotate" (ideal for rotating stations). Individuals can also be moved manually by tapping them.'
            )}
          </p>
        </div>
      )}

      {/* 2. DIVISION CONTROLS: Mode Switch & Count Selector */}
      <Panel className="p-4 sm:p-5 space-y-4">
        {/* Simple Mode Switch */}
        <div className="space-y-1.5">
          <label className="block text-2xs font-bold uppercase tracking-wider text-text-tertiary">
            {L('Einteilungsmethode', 'Division method')}
          </label>
          <div className="bg-surface-2 p-1 rounded-control flex items-center border border-border">
            <button
              type="button"
              onClick={() => setSplitMode('byCount')}
              className={`flex-1 py-2 px-3 rounded-control text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5 ${
                splitMode === 'byCount'
                  ? 'bg-surface text-text shadow-xs border border-border'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{L('Anzahl Teams', 'Number of Teams')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('bySize')}
              className={`flex-1 py-2 px-3 rounded-control text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5 ${
                splitMode === 'bySize'
                  ? 'bg-surface text-text shadow-xs border border-border'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{L('Personen pro Team', 'People per Team')}</span>
            </button>
          </div>
        </div>

        {/* Number Selector: Stepper + Quick Number Chips */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-2/60 p-3 rounded-control border border-border/70">
            {/* Stepper with +/- */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  splitMode === 'byCount'
                    ? teamCount <= 2
                    : teamSize <= 2
                }
                onClick={() => {
                  if (splitMode === 'byCount') {
                    setTeamCount((prev) => Math.max(2, prev - 1));
                  } else {
                    setTeamSize((prev) => Math.max(2, prev - 1));
                  }
                }}
                className="w-11 h-11 rounded-control bg-surface hover:bg-surface-raised border border-border text-text font-bold flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors shadow-xs"
                title={L('Verringern', 'Decrease')}
                aria-label={L('Verringern', 'Decrease')}
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="min-w-[120px] text-center px-2">
                <span className="text-xl sm:text-2xl font-black text-text font-sans tabular-nums block">
                  {splitMode === 'byCount' ? teamCount : teamSize}
                </span>
                <span className="text-2xs font-semibold text-text-secondary block">
                  {splitMode === 'byCount'
                    ? L('Teams', 'Teams')
                    : teamSize === 2
                    ? L('Personen (Tandems)', 'People (Pairs)')
                    : L('Personen pro Team', 'People per team')}
                </span>
              </div>

              <button
                type="button"
                disabled={
                  splitMode === 'byCount'
                    ? teamCount >= maxTeamCount
                    : teamSize >= maxTeamSize
                }
                onClick={() => {
                  if (splitMode === 'byCount') {
                    setTeamCount((prev) => Math.min(maxTeamCount, prev + 1));
                  } else {
                    setTeamSize((prev) => Math.min(maxTeamSize, prev + 1));
                  }
                }}
                className="w-11 h-11 rounded-control bg-surface hover:bg-surface-raised border border-border text-text font-bold flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors shadow-xs"
                title={L('Erhöhen', 'Increase')}
                aria-label={L('Erhöhen', 'Increase')}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Quick Visual Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-2xs font-bold text-text-tertiary uppercase tracking-wider mr-1 sm:hidden">
                {L('Schnellwahl:', 'Quick pick:')}
              </span>
              {[2, 3, 4, 5, 6, 8].map((num) => {
                if (num > names.length && num > 2) return null;
                const isActive =
                  splitMode === 'byCount'
                    ? teamCount === num
                    : teamSize === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (splitMode === 'byCount') {
                        setTeamCount(num);
                      } else {
                        setTeamSize(num);
                      }
                    }}
                    className={`min-w-[38px] h-9 px-2 rounded-control text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${
                      isActive
                        ? 'bg-accent text-accent-contrast border-accent shadow-xs'
                        : 'bg-surface hover:bg-surface-raised text-text border-border'
                    }`}
                  >
                    {num === 2 && splitMode === 'bySize' ? L('2 (Tandem)', '2 (Pairs)') : num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Math Preview Line */}
          <div className="flex items-center justify-between gap-2 px-1 text-xs text-text-secondary">
            <span className="font-medium text-accent">➔ {getDivisionPreview()}</span>
          </div>
        </div>

        {/* Pairing Avoidance Checkbox */}
        <div className="pt-2 border-t border-border/50">
          <label className="flex items-center gap-2.5 text-xs font-medium text-text cursor-pointer select-none">
            <input
              type="checkbox"
              checked={avoid}
              onChange={(e) => setAvoid(e.target.checked)}
              className="w-4 h-4 accent-accent rounded-xs"
            />
            <span>
              {L(
                'Gleiche Paarungen aus früheren Runden vermeiden',
                'Avoid repeating pairings from earlier rounds'
              )}
            </span>
          </label>
        </div>
      </Panel>

      {/* 3. DUAL ACTION BUTTONS: Shuffle Randomly or Rotate */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Action 1: Random Shuffle */}
          <button
            type="button"
            onClick={handleShuffle}
            disabled={names.length < 2}
            className="py-3 px-4 rounded-control bg-accent hover:bg-accent-hover text-accent-contrast font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] transition-transform disabled:opacity-40 min-h-[48px]"
          >
            <Shuffle className="w-4 h-4" />
            <span>
              {result.length > 0
                ? L('Zufällig neu mischen', 'Reshuffle randomly')
                : L('Zufällig mischen', 'Shuffle randomly')}
            </span>
          </button>

          {/* Action 2: Durchrotieren */}
          <button
            type="button"
            onClick={handleRotate}
            disabled={names.length < 2}
            className="py-3 px-4 rounded-control bg-surface hover:bg-surface-raised border border-border text-text font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] transition-transform disabled:opacity-40 min-h-[48px]"
            title={L(
              'Personen wandern im Kreis in die nächste Gruppe (ideal für wechselnde Runden)',
              'Rotate members round-robin to the next team (ideal for station rounds)'
            )}
          >
            <RotateCw className="w-4 h-4 text-accent" />
            <span>{L('Durchrotieren', 'Rotate teams')}</span>
          </button>
        </div>

        {/* Rotate Notification Toast */}
        {rotateNotice && (
          <div className="p-2.5 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{rotateNotice}</span>
          </div>
        )}
      </div>

      {/* 4. RESULTS VIEW */}
      {result.length > 0 && (
        <div className="space-y-4 pt-2">
          {/* Results Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-card bg-surface-2/60 border border-border">
            <div>
              <h3 className="text-sm font-bold text-text">
                {L('Einteilung:', 'Result:')} {names.length} {L('Personen in', 'people in')}{' '}
                {result.length}{' '}
                {splitMode === 'bySize' && teamSize === 2
                  ? L('Tandems', 'pairs')
                  : L('Teams', 'teams')}
              </h3>
              <p className="text-2xs text-text-tertiary">
                {L(
                  'Tippe auf eine Person, um sie unkompliziert in ein anderes Team zu verschieben.',
                  'Tap a person to easily move them to another team.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copy}
                className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 cursor-pointer transition-colors"
                title={L('Ergebnis in Zwischenablage kopieren', 'Copy result to clipboard')}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? L('Kopiert!', 'Copied!') : L('Kopieren', 'Copy')}</span>
              </button>

              <button
                type="button"
                onClick={exportToScoreboard}
                className="px-3.5 py-1.5 min-h-[38px] rounded-control bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-semibold text-accent flex items-center gap-1.5 cursor-pointer transition-colors"
                title={L('Diese Teams direkt in die Punktetafel übernehmen', 'Transfer these teams to scoreboard')}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{L('An Punktetafel übergeben', 'Export to scoreboard')}</span>
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {result.map((team, teamIdx) => {
              const theme = TEAM_THEMES[teamIdx % TEAM_THEMES.length];
              return (
                <Panel key={teamIdx} className={`p-4 space-y-3 border ${theme.border}`}>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
                      <span className="text-xs font-extrabold text-text uppercase tracking-wider">
                        {label(teamIdx)}
                      </span>
                    </div>
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                      {team.length} {L('Personen', 'people')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {team.map((person) => {
                      const isSelected =
                        movingPerson?.person === person && movingPerson?.fromTeam === teamIdx;
                      return (
                        <div key={person} className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setMovingPerson(null);
                              } else {
                                setMovingPerson({ person, fromTeam: teamIdx });
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control font-bold text-xs border transition-all cursor-pointer min-h-[36px] ${
                              isSelected
                                ? 'bg-accent text-accent-contrast border-accent ring-2 ring-accent'
                                : 'bg-surface-2 hover:bg-surface-raised text-text border-border'
                            }`}
                            title={L('Tippen, um Person zu verschieben', 'Tap to move person')}
                          >
                            <span>{person}</span>
                            <ArrowRightLeft
                              className={`w-3 h-3 ${
                                isSelected ? 'text-accent-contrast' : 'text-text-tertiary'
                              }`}
                            />
                          </button>

                          {/* Inline Destination Picker Popover */}
                          {isSelected && (
                            <div className="absolute top-full left-0 mt-1.5 z-30 p-2.5 rounded-card glass-surface border border-border shadow-2 space-y-2 min-w-[190px]">
                              <div className="flex items-center justify-between px-1">
                                <p className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                                  {L('Verschieben nach:', 'Move to:')}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMovingPerson(null);
                                  }}
                                  className="text-text-tertiary hover:text-text p-0.5 rounded cursor-pointer"
                                  title={L('Abbrechen', 'Cancel')}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-1">
                                {result.map((_, targetIdx) => {
                                  if (targetIdx === teamIdx) return null;
                                  const targetTheme =
                                    TEAM_THEMES[targetIdx % TEAM_THEMES.length];
                                  return (
                                    <button
                                      key={targetIdx}
                                      type="button"
                                      onClick={() =>
                                        movePersonToTeam(person, teamIdx, targetIdx)
                                      }
                                      className="px-2.5 py-1.5 rounded-control bg-surface-2 hover:bg-accent hover:text-accent-contrast text-xs font-semibold text-text text-left transition-colors cursor-pointer flex items-center gap-2 min-h-[36px]"
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${targetTheme.dot}`}
                                      />
                                      <span>{label(targetIdx)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
