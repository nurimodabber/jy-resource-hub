import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Shuffle,
  RotateCw,
  Copy,
  Check,
  HelpCircle,
  Award,
  Plus,
  Minus,
  X,
  AlertTriangle,
  Undo2,
  RotateCcw,
  Eye,
  ListPlus,
  ClipboardPaste,
} from 'lucide-react';
import { Glass } from 'glisse';
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
import { Switch } from '../ui/Switch';
import { GlassIconButton } from '../ui/Button';

// Teamfarbe nur als kleiner Punkt: ruhig, und am Beamer trotzdem unterscheidbar.
const TEAM_DOTS = [
  'bg-blue-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-indigo-500',
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
  const [showPaste, setShowPaste] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const pasteCount = parseNames(pasteInput).length;
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
    if (addNames(newNameInput)) setNewNameInput('');
  };

  // Einfügen einer ganzen Liste nutzt dieselbe Logik (inkl. Doppelte-Namen-Rückfrage)
  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addNames(pasteInput)) {
      setPasteInput('');
      setShowPaste(false);
    }
  };

  /** true = sofort übernommen; false = nichts zu tun oder Rückfrage wegen doppeltem Namen offen. */
  const addNames = (raw: string): boolean => {
    const trimmed = raw.trim();
    if (!trimmed) return false;
    const items = parseNames(trimmed);
    if (items.length === 0) return false;

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
      return false;
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
    return true;
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
    setPasteInput('');
    setShowPaste(false);
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
  const stepValue = splitMode === 'byCount' ? teamCount : teamSize;
  const canDecrease = stepValue > 2;
  const canIncrease = splitMode === 'byCount' ? teamCount < maxTeamCount : teamSize < maxTeamSize;
  const isPairs = splitMode === 'bySize' && teamSize === 2;
  const primaryLabel = result.length > 0 ? L('Neu mischen', 'Reshuffle') : L('Teams bilden', 'Make teams');

  const stepBy = (delta: number) => {
    if (splitMode === 'byCount') setTeamCount((prev) => Math.min(maxTeamCount, Math.max(2, prev + delta)));
    else setTeamSize((prev) => Math.min(maxTeamSize, Math.max(2, prev + delta)));
  };

  const stepperButton =
    'w-14 h-14 min-w-[56px] rounded-full bg-surface-2 hover:bg-surface-3 text-text flex items-center justify-center cursor-pointer transition-colors disabled:opacity-35 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent';
  const secondaryButton =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-control bg-surface-2 hover:bg-surface-3 text-sm font-semibold text-text cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent';

  return (
    // Unten Platz für das schwebende Aktions-Dock (mobil), damit es nie Inhalt verdeckt
    <div className="space-y-4 pb-24 md:pb-0">
      {/* 1. WER IST DA? Namen eintippen oder Liste einfügen */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-text">
            {L('Wer ist da?', "Who's here?")}{' '}
            <span className="text-text-secondary font-medium tabular-nums">
              · {names.length} {names.length === 1 ? L('Person', 'person') : L('Personen', 'people')}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            aria-expanded={showHelp}
            className={`w-11 h-11 -mr-2 rounded-full flex items-center justify-center cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
              showHelp ? 'bg-surface-2 text-text' : 'text-text-secondary hover:text-text hover:bg-surface-2'
            }`}
            title={L('Hilfe', 'Help')}
            aria-label={L('Hilfe', 'Help')}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp && (
          <p className="text-sm text-text-secondary leading-relaxed bg-surface-2 rounded-control p-3">
            {L(
              'Trag die Namen ein (oder füg eine ganze Liste ein), wähl Anzahl Teams oder Personen pro Team und tippe auf „Teams bilden“. „Rotieren“ schickt alle reihum ins nächste Team, ideal für Stationen. Tippe auf einen Namen, um ihn in ein anderes Team zu verschieben.',
              'Enter names (or paste a whole list), choose number of teams or people per team and tap "Make teams". "Rotate" moves everyone round-robin to the next team, ideal for stations. Tap a name to move it to another team.'
            )}
          </p>
        )}

        {/* Ein Feld + Hinzufügen. Komma oder Zeilenumbruch trennt mehrere Namen. */}
        <form onSubmit={handleAddPerson} className="flex items-stretch gap-2">
          <label htmlFor="teams-name-input" className="sr-only">
            {L('Name hinzufügen', 'Add name')}
          </label>
          <input
            id="teams-name-input"
            type="text"
            value={newNameInput}
            onChange={(e) => setNewNameInput(e.target.value)}
            placeholder={L('Name eingeben', 'Enter a name')}
            autoComplete="off"
            enterKeyHint="done"
            className="flex-1 min-w-0 h-12 px-4 rounded-control bg-surface-2 border border-transparent focus:border-accent focus:bg-surface text-base text-text placeholder:text-text-tertiary focus:outline-hidden transition-colors"
          />
          <button
            type="submit"
            disabled={!newNameInput.trim()}
            className="w-12 h-12 min-w-[48px] rounded-control bg-surface-2 hover:bg-surface-3 text-text flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={L('Hinzufügen', 'Add')}
            title={L('Hinzufügen', 'Add')}
          >
            <Plus className="w-5 h-5" strokeWidth={2.25} />
          </button>
        </form>

        {showPaste ? (
          <form onSubmit={handlePasteSubmit} className="space-y-2">
            <label htmlFor="teams-paste" className="block text-sm font-medium text-text">
              {L('Liste einfügen (ein Name pro Zeile oder mit Komma)', 'Paste a list (one name per line or comma-separated)')}
            </label>
            <textarea
              id="teams-paste"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              rows={5}
              autoFocus
              className="w-full px-4 py-3 rounded-control bg-surface-2 border border-transparent focus:border-accent focus:bg-surface text-base text-text placeholder:text-text-tertiary focus:outline-hidden transition-colors resize-y"
              placeholder={'Anna\nBen\nCara'}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPaste(false);
                  setPasteInput('');
                }}
                className="min-h-[44px] px-4 rounded-control text-sm font-semibold text-text-secondary hover:text-text hover:bg-surface-2 cursor-pointer transition-colors"
              >
                {L('Abbrechen', 'Cancel')}
              </button>
              <button type="submit" disabled={!pasteInput.trim()} className={secondaryButton}>
                <ListPlus className="w-4 h-4" />
                {pasteCount > 0
                  ? L(`${pasteCount} übernehmen`, `Add ${pasteCount}`)
                  : L('Übernehmen', 'Add')}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowPaste(true)}
            className="inline-flex items-center gap-2 min-h-[44px] -ml-1 px-1 text-sm font-semibold text-accent-text hover:underline cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4" />
            {L('Liste einfügen', 'Paste a list')}
          </button>
        )}

        {/* Anwesende als entfernbare Chips: ganzer Chip ist das Touch-Ziel */}
        {names.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label={L('Anwesend', 'Present')}>
            {names.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => handleRemovePerson(name)}
                  className="inline-flex items-center gap-1.5 min-h-[44px] pl-3.5 pr-2.5 rounded-full bg-surface-2 hover:bg-surface-3 text-sm font-semibold text-text cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={L(`${name} entfernen`, `Remove ${name}`)}
                >
                  <span className="truncate max-w-[160px]">{name}</span>
                  <X className="w-4 h-4 text-text-tertiary" strokeWidth={2.25} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Nicht da: ein Tipp holt die Person zurück */}
        {absentNames.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-line">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-text-secondary">{L('Nicht da', 'Not here')}</span>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="min-h-[44px] px-2 text-sm font-semibold text-accent-text hover:underline cursor-pointer"
              >
                {L('Alle dazuholen', 'Add everyone')}
              </button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {absentNames.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => handleAddAbsentPerson(name)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] pl-2.5 pr-3.5 rounded-full border border-dashed border-border-strong text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-2 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={L(`${name} dazuholen`, `Add ${name}`)}
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span className="truncate max-w-[160px]">{name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {/* 2. EINTEILUNG: Methode + großer Stepper */}
      <Panel className="space-y-5">
        <h2 className="text-base font-semibold text-text">{L('Einteilung', 'Division')}</h2>
        <SegmentedControl<'byCount' | 'bySize'>
          fullWidth
          value={splitMode}
          onChange={(mode) => setSplitMode(mode)}
          options={[
            { id: 'byCount', label: L('Anzahl Teams', 'Number of teams') },
            { id: 'bySize', label: L('Pro Team', 'Per team') },
          ]}
        />

        <div className="flex items-center justify-center gap-6 sm:gap-8">
          <button
            type="button"
            disabled={!canDecrease}
            onClick={() => stepBy(-1)}
            className={stepperButton}
            aria-label={L('Weniger', 'Fewer')}
          >
            <Minus className="w-6 h-6" strokeWidth={2.25} />
          </button>
          <div className="min-w-[96px] text-center" aria-live="polite">
            <span className="block text-5xl font-bold text-text tabular-nums leading-none">{stepValue}</span>
            <span className="block mt-1.5 text-sm font-medium text-text-secondary">
              {splitMode === 'byCount'
                ? L('Teams', 'teams')
                : isPairs
                ? L('pro Team (Tandems)', 'per team (pairs)')
                : L('pro Team', 'per team')}
            </span>
          </div>
          <button
            type="button"
            disabled={!canIncrease}
            onClick={() => stepBy(1)}
            className={stepperButton}
            aria-label={L('Mehr', 'More')}
          >
            <Plus className="w-6 h-6" strokeWidth={2.25} />
          </button>
        </div>

        <p className="text-center text-sm text-text-secondary">
          {names.length < 2
            ? L('Trag mindestens 2 Personen ein.', 'Add at least 2 people.')
            : formatDivisionPreview(currentPlan, splitMode, currentSettingValue, language)}
        </p>

        <div className="pt-4 border-t border-line space-y-2">
          <Switch
            checked={avoid}
            onChange={setAvoid}
            label={L('Paarungen nicht wiederholen', "Don't repeat pairings")}
            description={L('Wer schon zusammen war, kommt möglichst in andere Teams.', 'People who were together go to different teams where possible.')}
            // Der Text füllt die ganze Zeile bis zum Schalter, so ist die gesamte Zeile anklickbar (mind. 44 px hoch).
            className="w-full min-h-[44px] [&>label]:flex-1 [&>label]:py-2"
          />
          {(round > 1 || Object.keys(seen).length > 0) && (
            <button
              type="button"
              onClick={handleResetHistory}
              className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-text-secondary hover:text-text cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {L('Verlauf zurücksetzen', 'Reset history')}
            </button>
          )}
        </div>
      </Panel>

      {/* 3a. Desktop: Aktionen im Fluss */}
      <div className="hidden md:flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleShuffle}
          disabled={names.length < 2}
          className="flex-1 min-h-[52px] px-5 rounded-control bg-accent hover:bg-accent-hover text-accent-contrast font-semibold text-base flex items-center justify-center gap-2 shadow-1 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Shuffle className="w-5 h-5" />
          {primaryLabel}
        </button>
        {result.length > 0 && (
          <button type="button" onClick={handleRotate} disabled={names.length < 2} className={`${secondaryButton} min-h-[52px] px-5`}>
            <RotateCw className="w-4 h-4" />
            {L('Rotieren', 'Rotate')}
          </button>
        )}
        {history && (
          <button type="button" onClick={handleUndo} className={`${secondaryButton} min-h-[52px]`} aria-label={L('Rückgängig', 'Undo')} title={L('Rückgängig', 'Undo')}>
            <Undo2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3b. Mobil: Glas-Dock schwebt immer über der Tab-Leiste (Glas-Regel: schwebende Bedienelemente).
          Portal in <body>: Der Seiten-Wrapper animiert mit transform, und ein transformierter Vorfahr
          macht position: fixed relativ zu sich statt zum Bildschirm. */}
      {createPortal(
      <div className="jy-action-dock fixed left-0 right-0 z-30 flex justify-center px-3 pointer-events-none md:hidden print:hidden">
        <Glass className="pointer-events-auto w-full max-w-md p-1.5 rounded-full shadow-2 flex items-center gap-1.5">
          {history && (
            <GlassIconButton
              label={L('Rückgängig', 'Undo')}
              icon={<Undo2 className="w-5 h-5" />}
              onClick={handleUndo}
            />
          )}
          <button
            type="button"
            onClick={handleShuffle}
            disabled={names.length < 2}
            className="flex-1 min-w-0 h-12 px-4 rounded-full bg-accent hover:bg-accent-hover text-accent-contrast font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Shuffle className="w-5 h-5 shrink-0" />
            <span className="truncate">{names.length < 2 ? L('Erst Namen eintragen', 'Add names first') : primaryLabel}</span>
          </button>
          {result.length > 0 && (
            <GlassIconButton
              label={L('Rotieren: alle reihum ins nächste Team', 'Rotate: everyone to the next team')}
              icon={<RotateCw className="w-5 h-5" />}
              onClick={handleRotate}
              disabled={names.length < 2}
            />
          )}
        </Glass>
      </div>,
      document.body,
      )}

      {rotateNotice && (
        <div role="status" className="p-3 rounded-control bg-surface-2 text-sm font-medium text-text flex items-center gap-2">
          <RotateCw className="w-4 h-4 shrink-0 text-text-secondary" />
          <span>{rotateNotice}</span>
        </div>
      )}

      {/* 4. ERGEBNIS: gestapelte Team-Karten, große Namen, Teamfarbe nur als Punkt */}
      {result.length > 0 && (
        <section
          ref={resultsRef}
          key={resultFlashKey}
          aria-label={L('Ergebnis', 'Result')}
          className="space-y-3 pt-2 scroll-mt-20 animate-in fade-in duration-200"
        >
          {isOutdated && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-control bg-surface border border-border text-sm text-text">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber" />
                <span>{L('Einstellungen geändert, Einteilung ist veraltet.', 'Settings changed, division is outdated.')}</span>
              </div>
              <button type="button" onClick={handleShuffle} className={`${secondaryButton} shrink-0`}>
                {L('Neu mischen', 'Reshuffle')}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="text-xl font-bold text-text tracking-tight">
                {isPairs ? L('Tandems', 'Pairs') : L('Teams', 'Teams')}
                <span className="ml-2 text-base font-medium text-text-secondary">
                  {L(`Runde ${round}`, `Round ${round}`)}
                </span>
              </h2>
              <p className="text-sm text-text-secondary">
                {L('Tippe auf einen Namen, um ihn zu verschieben.', 'Tap a name to move it.')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setShowGroupView(true)} className={secondaryButton}>
                <Eye className="w-4 h-4" />
                {L('Gruppe zeigen', 'Show group')}
              </button>
              <button type="button" onClick={copy} className={secondaryButton} aria-label={L('Ergebnis kopieren', 'Copy result')} title={L('Ergebnis kopieren', 'Copy result')}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? L('Kopiert', 'Copied') : L('Kopieren', 'Copy')}</span>
              </button>
              <button type="button" onClick={exportToScoreboard} className={secondaryButton} title={L('Teams in die Punktetafel übernehmen', 'Send teams to the scoreboard')}>
                <Award className="w-4 h-4" />
                {L('Punktetafel', 'Scoreboard')}
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isOutdated ? 'opacity-60' : ''}`}>
            {result.map((team, teamIdx) => (
              <div key={teamIdx} className="bg-surface rounded-card shadow-1 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 pb-2">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold text-text">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${TEAM_DOTS[teamIdx % TEAM_DOTS.length]}`} aria-hidden="true" />
                    {label(teamIdx)}
                  </h3>
                  <span className="text-sm text-text-secondary tabular-nums">
                    {team.length} {team.length === 1 ? L('Person', 'person') : L('Personen', 'people')}
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-x-2">
                  {team.map((person) => (
                    <li key={person} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setMovingPerson({ person, fromTeam: teamIdx })}
                        className="w-full text-left min-h-[44px] px-2 -mx-2 rounded-control text-xl font-semibold text-text hover:bg-surface-2 cursor-pointer transition-colors truncate focus-visible:ring-2 focus-visible:ring-accent"
                        title={L(`${person} verschieben`, `Move ${person}`)}
                      >
                        {person}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
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
                      <span className={`w-3 h-3 rounded-full shrink-0 ${TEAM_DOTS[targetIdx % TEAM_DOTS.length]}`} aria-hidden="true" />
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

      {/* 6. FULLSCREEN "GRUPPE ZEIGEN" VIEW (Feature 14)
          Portal in <body> und z-50: Nur so liegt die Großansicht über Kopfzeile und Tab-Leiste (beide z-40)
          und deckt wirklich den ganzen Bildschirm statt nur den Seiteninhalt. */}
      {showGroupView && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={L('Großansicht für die Gruppe', 'Fullscreen group view')}
          className="fixed inset-0 z-50 bg-surface flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto animate-fade-in select-none"
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
              <span className="text-sm sm:text-base font-semibold text-text-secondary">
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
                const dot = TEAM_DOTS[tIdx % TEAM_DOTS.length];
                const teamLabel = label(tIdx);
                return (
                  <div
                    key={tIdx}
                    className="p-5 sm:p-6 rounded-card bg-surface border border-border shadow-1 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-4 h-4 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
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
                            className="text-2xl lg:text-4xl font-bold text-text py-1.5 flex items-center gap-3"
                          >
                            <span
                              className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full shrink-0 ${dot}`}
                              aria-hidden="true"
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
              className="text-sm text-text-tertiary hover:text-text min-h-[44px] py-2 px-4 rounded-full transition-colors cursor-pointer"
            >
              {L('Tippen, nach unten wischen oder Esc drücken zum Schließen', 'Tap, swipe down or press Esc to close')}
            </button>
          </div>
        </div>,
        document.body,
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
