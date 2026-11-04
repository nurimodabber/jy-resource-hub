import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shuffle,
  RotateCw,
  Copy,
  Check,
  HelpCircle,
  Award,
  Users,
  User,
  Plus,
  Minus,
  X,
  AlertTriangle,
  Undo2,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import {
  loadGroupNames,
  saveGroupNames,
  loadGroupPresent,
  saveGroupPresent,
  parseNames,
} from '../../utils/groupNames';
import {
  calculateTeamPlan,
  formatDivisionPreview,
  splitTeams,
  rotateTeams,
  isResultMatchingPlan,
  pairKey,
} from '../../utils/teamDivision';
import { tr, Panel } from './common';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Sheet } from '../ui/Sheet';
import { Dialog } from '../ui/Dialog';

const TEAM_THEMES = [
  {
    name: 'blue',
    bg: 'bg-blue-500/[0.03] dark:bg-blue-500/[0.08]',
    border: 'border-blue-500/25 dark:border-blue-500/35',
    badge: 'bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25',
    dot: 'bg-blue-500',
    initialBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    name: 'amber',
    bg: 'bg-amber-500/[0.03] dark:bg-amber-500/[0.08]',
    border: 'border-amber-500/25 dark:border-amber-500/35',
    badge: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25',
    dot: 'bg-amber-500',
    initialBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    name: 'emerald',
    bg: 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.08]',
    border: 'border-emerald-500/25 dark:border-emerald-500/35',
    badge: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-500',
    initialBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'rose',
    bg: 'bg-rose-500/[0.03] dark:bg-rose-500/[0.08]',
    border: 'border-rose-500/25 dark:border-rose-500/35',
    badge: 'bg-rose-500/12 text-rose-600 dark:text-rose-400 border-rose-500/25',
    dot: 'bg-rose-500',
    initialBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    name: 'purple',
    bg: 'bg-purple-500/[0.03] dark:bg-purple-500/[0.08]',
    border: 'border-purple-500/25 dark:border-purple-500/35',
    badge: 'bg-purple-500/12 text-purple-600 dark:text-purple-400 border-purple-500/25',
    dot: 'bg-purple-500',
    initialBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  {
    name: 'cyan',
    bg: 'bg-cyan-500/[0.03] dark:bg-cyan-500/[0.08]',
    border: 'border-cyan-500/25 dark:border-cyan-500/35',
    badge: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
    dot: 'bg-cyan-500',
    initialBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  },
  {
    name: 'orange',
    bg: 'bg-orange-500/[0.03] dark:bg-orange-500/[0.08]',
    border: 'border-orange-500/25 dark:border-orange-500/35',
    badge: 'bg-orange-500/12 text-orange-600 dark:text-orange-400 border-orange-500/25',
    dot: 'bg-orange-500',
    initialBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    name: 'indigo',
    bg: 'bg-indigo-500/[0.03] dark:bg-indigo-500/[0.08]',
    border: 'border-indigo-500/25 dark:border-indigo-500/35',
    badge: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
    dot: 'bg-indigo-500',
    initialBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  },
];

const getInitialTeams = (): string[][] => {
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
      const initialPlan = calculateTeamPlan(active.length, 'byCount', 2);
      return splitTeams(active, initialPlan);
    }
    return [];
  } catch {
    return [];
  }
};

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
  const [splitMode, setSplitMode] = useLocalState<'byCount' | 'bySize'>('jy_teams_split_mode', 'byCount');
  const [teamCount, setTeamCount] = useLocalState<number>('jy_teams_team_count', 2);
  const [teamSize, setTeamSize] = useLocalState<number>('jy_teams_team_size', 4);
  const [avoid, setAvoid] = useLocalState<boolean>('jy_teams_avoid', true);
  const [seen, setSeen] = useLocalState<Record<string, number>>('jy_teams_seen', {});
  const [hasManualEdits, setHasManualEdits] = useLocalState<boolean>('jy_teams_has_manual_edits', false);
  const [round, setRound] = useLocalState<number>('jy_teams_round', 1);

  // Undo (1-step history)
  interface HistorySnapshot {
    result: string[][];
    hasManualEdits: boolean;
    round: number;
  }
  const [history, setHistory] = useState<HistorySnapshot | null>(null);

  const pushHistory = () => {
    setHistory({
      result,
      hasManualEdits,
      round,
    });
  };

  const handleUndo = () => {
    if (!history) return;
    setResult(history.result);
    setHasManualEdits(history.hasManualEdits);
    setRound(history.round);
    setHistory(null);
  };

  // Fullscreen "Gruppe zeigen" presentation mode
  const [showGroupView, setShowGroupView] = useState(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!showGroupView) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGroupView(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showGroupView]);

  // Duplicate name prompt state
  interface DuplicatePending {
    existingName: string;
    candidateName: string;
    nextNames: string[];
    nextAll: string[];
    nextPresent: Record<string, boolean>;
  }
  const [duplicatePending, setDuplicatePending] = useState<DuplicatePending | null>(null);

  const currentSettingValue = splitMode === 'byCount' ? teamCount : teamSize;
  const currentPlan = calculateTeamPlan(names.length, splitMode, currentSettingValue);

  const [result, setResult] = useLocalState<string[][]>('jy_teams_last_split', getInitialTeams());

  const isOutdated = result.length > 0 && !isResultMatchingPlan(result, names, currentPlan);

  // If settings or names change and no manual edits exist, auto-recalculate immediately
  useEffect(() => {
    if (result.length > 0 && !hasManualEdits && names.length >= 2) {
      if (!isResultMatchingPlan(result, names, currentPlan)) {
        const fresh = splitTeams(names, currentPlan, seen, avoid);
        setResult(fresh);
      }
    }
  }, [splitMode, teamCount, teamSize, names, hasManualEdits, currentPlan, avoid, seen, result, setResult]);

  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [rotateNotice, setRotateNotice] = useState<string | null>(null);

  // Manual move state: which person is currently selected for moving?
  const [movingPerson, setMovingPerson] = useState<{ person: string; fromTeam: number } | null>(null);

  // Results scroll and flash animation
  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultFlashKey, setResultFlashKey] = useState(0);

  const scrollToResults = () => {
    setResultFlashKey((k) => k + 1);
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }, 50);
  };

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

  // Quick add a new person by typing and submitting (with duplicate detection)
  const handleAddPerson = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newNameInput.trim();
    if (!trimmed) return;
    const items = parseNames(trimmed);
    if (items.length === 0) return;

    // Check if any entered item matches an existing active name
    const existingMatch = items.find((item) =>
      names.some((n) => n.toLowerCase() === item.toLowerCase())
    );

    if (existingMatch) {
      let counter = 2;
      while (
        names.some(
          (n) => n.toLowerCase() === `${existingMatch} ${counter}`.toLowerCase()
        )
      ) {
        counter++;
      }
      const candidateName = `${existingMatch} ${counter}`;

      const updatedNames = [...names];
      const updatedAll = [...allGroupNames];
      const updatedPresent = { ...present };

      items.forEach((item) => {
        if (item.toLowerCase() === existingMatch.toLowerCase()) {
          updatedNames.push(candidateName);
          if (!updatedAll.some((n) => n.toLowerCase() === candidateName.toLowerCase())) {
            updatedAll.push(candidateName);
          }
          updatedPresent[candidateName] = true;
        } else {
          if (!updatedNames.some((n) => n.toLowerCase() === item.toLowerCase())) {
            updatedNames.push(item);
          }
          if (!updatedAll.some((n) => n.toLowerCase() === item.toLowerCase())) {
            updatedAll.push(item);
          }
          updatedPresent[item] = true;
        }
      });

      setDuplicatePending({
        existingName: existingMatch,
        candidateName,
        nextNames: updatedNames,
        nextAll: updatedAll,
        nextPresent: updatedPresent,
      });
      return;
    }

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

  const confirmAddDuplicate = () => {
    if (!duplicatePending) return;
    setNames(duplicatePending.nextNames);
    setAllGroupNames(duplicatePending.nextAll);
    setPresent(duplicatePending.nextPresent);
    saveGroupNames(duplicatePending.nextAll);
    saveGroupPresent(duplicatePending.nextPresent);
    setDuplicatePending(null);
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

  // Reset pairing history and round counter
  const handleResetHistory = () => {
    pushHistory();
    setSeen({});
    setRound(1);
    setRotateNotice(
      L(
        'Paarungs-Verlauf und Runden zurückgesetzt.',
        'Pairing history and rounds reset.'
      )
    );
    setTimeout(() => setRotateNotice(null), 3000);
  };

  // Primary action 1: Random Shuffle
  const handleShuffle = () => {
    if (names.length < 2) return;
    pushHistory();
    setMovingPerson(null);
    setRotateNotice(null);
    setHasManualEdits(false);
    setRound((r) => r + 1);

    const best = splitTeams(names, currentPlan, seen, avoid);
    setResult(best);

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
    scrollToResults();
  };

  // Primary action 2: Durchrotieren (Round-Robin Shift)
  const handleRotate = () => {
    if (names.length < 2) return;
    pushHistory();
    setMovingPerson(null);
    setHasManualEdits(false);
    setRound((r) => r + 1);

    const nextTeams = rotateTeams(result, names, currentPlan, seen, avoid);
    setResult(nextTeams);

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
    scrollToResults();

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
    pushHistory();
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
    setHasManualEdits(true);
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

  // Max value limits
  const maxTeamCount = Math.min(8, Math.max(2, names.length));
  const maxTeamSize = Math.max(2, Math.min(10, names.length));

  return (
    <div className="space-y-4 pb-[calc(110px+env(safe-area-inset-bottom,0px))] md:pb-0">
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
                placeholder={L('+ Name', '+ Name')}
                className="pl-3 pr-7 py-1 text-xs rounded-full bg-surface-2 hover:bg-surface-raised focus:bg-surface border border-dashed border-border focus:border-accent text-text placeholder:text-text-tertiary focus:outline-hidden min-h-[32px] w-28 sm:w-36 transition-all font-medium"
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

        {/* Multi-name paste hint */}
        <p className="text-2xs text-text-tertiary pt-0.5">
          {L(
            'Tipp: Mehrere Namen mit Komma oder Zeilenumbruch einfügen.',
            'Tip: Paste multiple names separated by commas or line breaks.'
          )}
        </p>

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
          <SegmentedControl<'byCount' | 'bySize'>
            fullWidth
            value={splitMode}
            onChange={(mode) => setSplitMode(mode)}
            options={[
              { id: 'byCount', label: L('Anzahl Teams', 'Number of Teams'), icon: <Users className="w-4 h-4" /> },
              { id: 'bySize', label: L('Personen pro Team', 'People per Team'), icon: <User className="w-4 h-4" /> },
            ]}
          />
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
            <span className="font-medium text-accent">➔ {formatDivisionPreview(currentPlan, splitMode, currentSettingValue, language)}</span>
          </div>
        </div>

        {/* Pairing Avoidance Checkbox & Reset History */}
        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
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

          {(round > 1 || Object.keys(seen).length > 0) && (
            <button
              type="button"
              onClick={handleResetHistory}
              className="text-2xs text-text-tertiary hover:text-accent font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title={L('Paarungs-Verlauf und Runden zurücksetzen', 'Reset pairing history and rounds')}
            >
              <RotateCcw className="w-3 h-3 text-accent" />
              <span>{L('Paarungs-Verlauf zurücksetzen', 'Reset pairing history')}</span>
            </button>
          )}
        </div>
      </Panel>

      {/* 3. DUAL ACTION BUTTONS: In-Flow on Desktop, Sticky Glass Bar on Mobile */}
      <div className="space-y-2">
        {/* Desktop in-flow action buttons */}
        <div className="hidden md:grid grid-cols-2 gap-2.5">
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
            <RotateCw className="w-3.5 h-3.5 shrink-0" />
            <span>{rotateNotice}</span>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar directly above the floating Tab Bar */}
      <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 flex justify-center px-3 pointer-events-none md:hidden print:hidden">
        <div className="pointer-events-auto w-full max-w-md p-1.5 rounded-full glass-surface shadow-2 border border-border/80 flex items-center gap-2 backdrop-blur-md">
          {history && (
            <button
              type="button"
              onClick={handleUndo}
              className="p-2.5 rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-text font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-[0.98] transition-transform min-h-[44px] min-w-[44px] shrink-0"
              title={L('Rückgängig', 'Undo')}
              aria-label={L('Rückgängig', 'Undo')}
            >
              <Undo2 className="w-4 h-4 text-text-secondary" />
            </button>
          )}

          <button
            type="button"
            onClick={handleShuffle}
            disabled={names.length < 2}
            className="flex-1 py-2.5 px-3.5 rounded-full bg-accent hover:bg-accent-hover text-accent-contrast font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.98] transition-transform disabled:opacity-40 min-h-[44px]"
          >
            <Shuffle className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {result.length > 0
                ? L('Neu mischen', 'Reshuffle')
                : L('Zufällig mischen', 'Shuffle')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleRotate}
            disabled={names.length < 2}
            className="py-2.5 px-3.5 rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-text font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] transition-transform disabled:opacity-40 min-h-[44px] shrink-0"
            title={L('Durchrotieren', 'Rotate teams')}
          >
            <RotateCw className="w-4 h-4 text-accent shrink-0" />
            <span className="truncate">{L('Rotieren', 'Rotate')}</span>
          </button>
        </div>
      </div>

      {/* 4. RESULTS VIEW */}
      {result.length > 0 && (
        <div
          ref={resultsRef}
          key={resultFlashKey}
          className="space-y-4 pt-2 animate-in fade-in duration-200"
        >
          {/* Outdated Notice Banner when settings changed after manual edits */}
          {isOutdated && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-card bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  {L(
                    'Einstellungen geändert – Einteilung ist veraltet.',
                    'Settings changed – division is outdated.'
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleShuffle}
                className="px-3 py-1.5 rounded-control bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer transition-colors shadow-2xs shrink-0"
              >
                {L('Neu mischen', 'Reshuffle')}
              </button>
            </div>
          )}

          {/* Results Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-card bg-surface-2/60 border border-border">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text">
                  {L('Einteilung:', 'Result:')} {names.length} {L('Personen in', 'people in')}{' '}
                  {result.length}{' '}
                  {splitMode === 'bySize' && teamSize === 2
                    ? L('Tandems', 'pairs')
                    : L('Teams', 'teams')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-accent/15 text-accent border border-accent/25">
                  {L(`Runde ${round}`, `Round ${round}`)}
                </span>
              </div>
              <p className="text-2xs text-text-tertiary">
                {L(
                  'Tippe auf eine Person, um sie unkompliziert in ein anderes Team zu verschieben.',
                  'Tap a person to easily move them to another team.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Feature 12: Undo */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={!history}
                className="px-2.5 py-1.5 min-h-[38px] rounded-control bg-surface hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={L('Letzte Änderung rückgängig machen', 'Undo last change')}
                aria-label={L('Rückgängig', 'Undo')}
              >
                <Undo2 className="w-3.5 h-3.5 text-text-secondary" />
                <span className="hidden sm:inline">{L('Rückgängig', 'Undo')}</span>
              </button>

              {/* Feature 14: Gruppe zeigen */}
              <button
                type="button"
                onClick={() => setShowGroupView(true)}
                className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 cursor-pointer transition-colors"
                title={L('Großansicht für die Gruppe öffnen', 'Open large group view')}
              >
                <Eye className="w-3.5 h-3.5 text-accent" />
                <span>{L('Gruppe zeigen', 'Show to group')}</span>
              </button>

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

          {/* Teams Grid: 2 columns on mobile if max size <= 4, otherwise 1 column */}
          {(() => {
            const maxTeamMemberCount = Math.max(...result.map((t) => t.length), 0);
            const mobileGridCols = maxTeamMemberCount <= 4 ? 'grid-cols-2' : 'grid-cols-1';

            return (
              <div
                className={`grid ${mobileGridCols} sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 ${
                  isOutdated ? 'opacity-60 transition-opacity' : ''
                }`}
              >
                {result.map((team, teamIdx) => {
                  const theme = TEAM_THEMES[teamIdx % TEAM_THEMES.length];

                  return (
                    <div
                      key={teamIdx}
                      className={`rounded-card p-3 sm:p-5 border transition-all duration-200 bg-surface shadow-2xs ${theme.border} ${theme.bg}`}
                    >
                      {/* Team Card Header */}
                      <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs ${theme.badge}`}
                          >
                            {teamIdx + 1}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-text tracking-tight truncate">
                            {label(teamIdx)}
                          </h4>
                        </div>
                        <span
                          className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${theme.badge} shrink-0`}
                        >
                          {team.length}{' '}
                          {team.length === 1
                            ? L('Person', 'person')
                            : L('Personen', 'people')}
                        </span>
                      </div>

                      {/* Members Roster as Compact Tactile Chips */}
                      <div className="pt-2 sm:pt-3 flex flex-wrap gap-1.5">
                        {team.map((person) => {
                          const initial = person.trim().charAt(0).toUpperCase();

                          return (
                            <button
                              key={person}
                              type="button"
                              onClick={() =>
                                setMovingPerson({ person, fromTeam: teamIdx })
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-2 hover:bg-accent hover:text-accent-contrast border border-border/80 hover:border-accent text-xs font-semibold text-text transition-all cursor-pointer active:scale-95 shadow-2xs min-h-[36px] max-w-full group"
                              title={L(
                                `Tippen, um ${person} in ein anderes Team zu verschieben`,
                                `Tap to move ${person} to another team`
                              )}
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors ${theme.initialBg} group-hover:bg-white/20 group-hover:text-white`}
                                aria-hidden="true"
                              >
                                {initial}
                              </span>
                              <span className="truncate max-w-[120px]">{person}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 5. BOTTOM SHEET FOR MOVING A PERSON */}
      <Sheet
        isOpen={movingPerson !== null}
        onClose={() => setMovingPerson(null)}
        title={
          movingPerson
            ? L(
                `„${movingPerson.person}“ verschieben nach:`,
                `Move "${movingPerson.person}" to:`
              )
            : ''
        }
      >
        {movingPerson && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.map((team, targetIdx) => {
                if (targetIdx === movingPerson.fromTeam) return null;
                const targetTheme = TEAM_THEMES[targetIdx % TEAM_THEMES.length];
                const teamLabel = label(targetIdx);
                const countText =
                  team.length === 1
                    ? L('1 Person', '1 person')
                    : L(`${team.length} Personen`, `${team.length} people`);

                return (
                  <button
                    key={targetIdx}
                    type="button"
                    onClick={() =>
                      movePersonToTeam(
                        movingPerson.person,
                        movingPerson.fromTeam,
                        targetIdx
                      )
                    }
                    className="flex items-center justify-between p-3.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border hover:border-accent text-left transition-all active:scale-[0.98] cursor-pointer min-h-[52px] group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${targetTheme.badge}`}
                      >
                        {targetIdx + 1}
                      </div>
                      <span className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                        {teamLabel}
                      </span>
                    </div>
                    <span className="text-xs text-text-tertiary font-medium">
                      {countText}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setMovingPerson(null)}
                className="w-full py-3 rounded-control bg-surface hover:bg-surface-2 border border-border text-text font-semibold text-sm cursor-pointer transition-colors min-h-[44px]"
              >
                {L('Abbrechen', 'Cancel')}
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* 6. FULLSCREEN "GRUPPE ZEIGEN" VIEW (Feature 14) */}
      {showGroupView && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={L('Großansicht für die Gruppe', 'Fullscreen group view')}
          className="fixed inset-0 z-50 bg-surface/98 backdrop-blur-md flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto animate-fadeIn select-none"
          onTouchStart={(e) => {
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            if (touchStartY.current === null) return;
            const deltaY = e.changedTouches[0].clientY - touchStartY.current;
            if (Math.abs(deltaY) > 70) {
              setShowGroupView(false);
            }
            touchStartY.current = null;
          }}
        >
          {/* Top Bar with round / team count & large Close button */}
          <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-black text-text tracking-tight">
                {splitMode === 'bySize' && teamSize === 2
                  ? L('Tandems', 'Pairs')
                  : L('Teams', 'Teams')}
              </span>
              <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25">
                {L(`Runde ${round}`, `Round ${round}`)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGroupView(false)}
              className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              title={L('Ansicht schließen (Esc oder Wischen)', 'Close view (Esc or swipe)')}
              aria-label={L('Schließen', 'Close')}
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">{L('Schließen', 'Close')}</span>
            </button>
          </div>

          {/* Large Team Cards Grid */}
          <div className="flex-1 max-w-5xl mx-auto w-full py-6">
            <div
              className={`grid gap-4 sm:gap-6 ${
                result.length <= 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : result.length <= 4
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {result.map((team, tIdx) => {
                const theme = TEAM_THEMES[tIdx % TEAM_THEMES.length];
                const teamLabel = label(tIdx);
                return (
                  <div
                    key={tIdx}
                    className={`p-5 sm:p-6 rounded-card border-2 ${theme.border} ${theme.bg} shadow-sm space-y-4 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-base sm:text-lg border ${theme.badge}`}
                          >
                            {tIdx + 1}
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-text">
                            {teamLabel}
                          </h3>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-text-tertiary">
                          {team.length === 1
                            ? L('1 Person', '1 person')
                            : L(`${team.length} Personen`, `${team.length} people`)}
                        </span>
                      </div>

                      <div className="pt-3 space-y-2">
                        {team.map((person) => (
                          <div
                            key={person}
                            className="text-base sm:text-lg font-bold text-text px-3 py-2 rounded-control bg-surface/80 border border-border/50 flex items-center gap-2.5"
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dot}`}
                            />
                            <span className="truncate">{person}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom dismiss helper hint */}
          <div className="max-w-5xl mx-auto w-full pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowGroupView(false)}
              className="text-xs text-text-tertiary hover:text-text py-2 px-4 rounded-full transition-colors cursor-pointer"
            >
              {L('Tippen, nach unten wischen oder Esc drücken zum Schließen', 'Tap, swipe down or press Esc to close')}
            </button>
          </div>
        </div>
      )}

      {/* 7. DUPLICATE NAME CONFIRMATION DIALOG (Feature 15) */}
      <Dialog
        isOpen={duplicatePending !== null}
        onClose={() => setDuplicatePending(null)}
        title={L('Name bereits vorhanden', 'Name already exists')}
        maxWidth="sm"
      >
        {duplicatePending && (
          <div className="p-4 sm:p-5 space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              {L(
                `„${duplicatePending.existingName}“ ist bereits in der Gruppe vorhanden. Möchtest du die Person trotzdem als „${duplicatePending.candidateName}“ hinzufügen?`,
                `"${duplicatePending.existingName}" is already in the group. Do you want to add them as "${duplicatePending.candidateName}" anyway?`
              )}
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDuplicatePending(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-semibold text-sm cursor-pointer transition-colors min-h-[44px]"
              >
                {L('Abbrechen', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={confirmAddDuplicate}
                className="w-full sm:w-auto px-5 py-2.5 rounded-control bg-accent hover:bg-accent-hover text-white font-bold text-sm cursor-pointer transition-colors min-h-[44px]"
              >
                {L(
                  `Ja, als „${duplicatePending.candidateName}“ hinzufügen`,
                  `Yes, add as "${duplicatePending.candidateName}"`
                )}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
