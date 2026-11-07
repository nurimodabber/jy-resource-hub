import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useConfirm } from '../ui/ConfirmDialog';
import {
  Plus,
  Minus,
  RotateCcw,
  Undo2,
  Users,
  HelpCircle,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { loadPresentNames } from '../../utils/groupNames';
import { tr } from './common';
import { Card } from '../ui/Card';
import { useModal } from '../../hooks/useModal';
import { useBackToClose } from '../../hooks/useBackToClose';

interface TeamScore {
  id: string;
  name: string;
  score: number;
}

interface ScoreMove {
  teamId: string;
  delta: number;
  prevScore: number;
}

const TEAM_THEMES = [
  {
    nameDe: 'Team Blau',
    nameEn: 'Blue Team',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  {
    nameDe: 'Team Gelb',
    nameEn: 'Yellow Team',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  {
    nameDe: 'Team Grün',
    nameEn: 'Green Team',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  {
    nameDe: 'Team Rot',
    nameEn: 'Red Team',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
  {
    nameDe: 'Team Lila',
    nameEn: 'Purple Team',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500',
  },
  {
    nameDe: 'Team Türkis',
    nameEn: 'Cyan Team',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  {
    nameDe: 'Team Orange',
    nameEn: 'Orange Team',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
  },
  {
    nameDe: 'Team Indigo',
    nameEn: 'Indigo Team',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
];

const MAX_TEAMS = 8;

export const ScoreboardTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const pointsFor = (delta: number, name: string) => {
    const n = Math.abs(delta);
    const sign = delta < 0 ? '−' : '+';
    return L(`${sign}${n} ${n === 1 ? 'Punkt' : 'Punkte'} für ${name}`, `${sign}${n} ${n === 1 ? 'point' : 'points'} for ${name}`);
  };
  const [confirm, confirmDialog] = useConfirm();
  const [teams, setTeams] = useLocalState<TeamScore[]>('jy_scoreboard_teams', [
    { id: 't1', name: language === 'de' ? 'Team Blau' : 'Blue Team', score: 0 },
    { id: 't2', name: language === 'de' ? 'Team Gelb' : 'Yellow Team', score: 0 },
  ]);
  const [history, setHistory] = useState<ScoreMove[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [hasImportableTeams, setHasImportableTeams] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stepSize, setStepSize] = useState<1 | 5 | 10>(1);
  const [recentDelta, setRecentDelta] = useState<{ [teamId: string]: { delta: number; key: number } | null }>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jy_teams_last_split');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setHasImportableTeams(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleExitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((currentHistory) => {
      const last = currentHistory[currentHistory.length - 1];
      if (!last) return currentHistory;
      setTeams((prev) =>
        prev.map((t) => (t.id === last.teamId ? { ...t, score: last.prevScore } : t))
      );
      return currentHistory.slice(0, -1);
    });
  }, [setTeams]);

  // Escape, focus, Tab trap and scroll lock come from useModal; Back (phone) closes via useBackToClose.
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const exitFullscreen = useBackToClose(isFullscreen, 'scoreboard', handleExitFullscreen);
  useModal(fullscreenRef, isFullscreen, exitFullscreen);

  // Undo shortcut while in Fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handleUndo]);

  // Synchronize state if user exits native fullscreen via browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  const handleEnterFullscreen = async () => {
    setIsFullscreen(true);
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* fallback to fixed overlay if native request fails */
    }
  };

  const adjustScore = (teamId: string, delta: number) => {
    const target = teams.find((t) => t.id === teamId);
    if (!target) return;
    const newScore = Math.max(0, target.score + delta);
    if (newScore === target.score && delta < 0) return;

    setHistory((prev) => [...prev, { teamId, delta, prevScore: target.score }]);
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: newScore } : t))
    );

    const key = Date.now();
    setRecentDelta((prev) => ({ ...prev, [teamId]: { delta, key } }));
    setTimeout(() => {
      setRecentDelta((prev) => (prev[teamId]?.key === key ? { ...prev, [teamId]: null } : prev));
    }, 900);
  };

  const handleResetScores = async () => {
    const ok = await confirm({
      title: L('Alle Punktestände auf 0 zurücksetzen?', 'Reset all scores to 0?'),
      confirmLabel: L('Zurücksetzen', 'Reset'),
      cancelLabel: L('Abbrechen', 'Cancel'),
    });
    if (ok) {
      setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
      setHistory([]);
    }
  };

  const handleAddTeam = () => {
    if (teams.length >= MAX_TEAMS) return;
    const nextNum = teams.length + 1;
    const theme = TEAM_THEMES[(nextNum - 1) % TEAM_THEMES.length];
    const newTeam: TeamScore = {
      id: 'team-' + Date.now(),
      name: language === 'de' ? theme.nameDe : theme.nameEn,
      score: 0,
    };
    setTeams([...teams, newTeam]);
  };

  const handleRemoveTeam = (teamId: string) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((t) => t.id !== teamId));
  };

  const handleGenerateFromGroup = () => {
    const present = loadPresentNames();
    if (present.length < 2) {
      alert(
        L(
          'Bitte zuerst mindestens 2 anwesende Personen in „Meine Gruppe“ eintragen.',
          'Please add at least 2 present people in "My Group" first.'
        )
      );
      return;
    }
    const teamCount = Math.min(teams.length, MAX_TEAMS);
    const teamNames: TeamScore[] = [];
    for (let i = 0; i < teamCount; i++) {
      const theme = TEAM_THEMES[i % TEAM_THEMES.length];
      teamNames.push({
        id: 't-gen-' + i,
        name: language === 'de' ? theme.nameDe : theme.nameEn,
        score: 0,
      });
    }
    setTeams(teamNames);
    setHistory([]);
  };

  // Import teams directly from Gruppeneinteiler
  const handleImportFromTeamsTool = () => {
    try {
      const stored = localStorage.getItem('jy_teams_last_split');
      if (!stored) return;
      const parsed: string[][] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        const importedTeams: TeamScore[] = parsed.slice(0, MAX_TEAMS).map((members, idx) => {
          const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
          const defaultName = language === 'de' ? theme.nameDe : theme.nameEn;
          const memberPreview = members.length > 0 ? ` (${members.slice(0, 3).join(', ')}${members.length > 3 ? '…' : ''})` : '';
          return {
            id: 't-import-' + idx + '-' + Date.now(),
            name: `${defaultName}${memberPreview}`,
            score: 0,
          };
        });
        setTeams(importedTeams);
        setHistory([]);
      }
    } catch {
      /* ignore */
    }
  };

  // Secondary, not accent: the view keeps one filled accent button ("Vollbild"), three per team drowned it.
  const stepBtn =
    'py-2.5 px-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-extrabold text-sm flex items-center justify-center gap-0.5 active:scale-95 transition-transform cursor-pointer min-h-[44px]';

  // Secondary quick-step based on current primary step
  const quickStep = stepSize === 1 ? 5 : (stepSize === 5 ? 1 : 5);

  // Responsive grid class in Fullscreen mode
  const getFullscreenGridClass = (count: number) => {
    switch (count) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1';
      case 3:
        return 'grid-cols-1 sm:grid-cols-3 grid-rows-3 sm:grid-rows-1';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      case 5:
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2';
      case 7:
      case 8:
      default:
        return 'grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Action toolbar: one line from sm up. On phones it wraps into two rows, because as one
            scrolling line it pushed "Vollbild" (the button needed live in the group) off-screen. */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 w-full bg-surface rounded-card border border-border p-2 sm:p-2.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={handleAddTeam}
              disabled={teams.length >= MAX_TEAMS}
              className="px-2.5 sm:px-3 py-1.5 rounded-nested bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 disabled:opacity-40 whitespace-nowrap"
              title={teams.length >= MAX_TEAMS ? L('Maximal 8 Teams möglich', 'Maximum 8 teams reached') : L('Neues Team hinzufügen', 'Add new team')}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{L('Team', 'Team')}</span>
              {teams.length < MAX_TEAMS && (
                <span className="text-2xs text-text-tertiary">({teams.length}/{MAX_TEAMS})</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleGenerateFromGroup}
              className="px-2.5 sm:px-3 py-1.5 rounded-nested bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 whitespace-nowrap"
              title={L('Teams aus Namensliste der Gruppe bilden', 'Create teams from group member list')}
            >
              <Users className="w-3.5 h-3.5 text-text-secondary" />
              <span>{L('Aus Gruppe', 'From group')}</span>
            </button>

            {hasImportableTeams && (
              <button
                type="button"
                onClick={handleImportFromTeamsTool}
                className="px-2.5 sm:px-3 py-1.5 rounded-control bg-accent/10 hover:bg-accent/20 border border-accent/30 text-xs font-semibold text-accent transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 whitespace-nowrap"
                title={L('Teams aus letzter Gruppeneinteilung laden', 'Load teams from last team shuffle')}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{L('Aus Einteiler', 'From divider')}</span>
                <span className="sm:hidden">{L('Einteiler', 'Divider')}</span>
              </button>
            )}

            <button
              type="button"
              disabled={history.length === 0}
              onClick={handleUndo}
              className="px-2.5 sm:px-3 py-1.5 rounded-nested bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 disabled:opacity-40 whitespace-nowrap"
              title={L('Rückgängig (Cmd/Ctrl+Z)', 'Undo (Cmd/Ctrl+Z)')}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{L('Rückgängig', 'Undo')}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleEnterFullscreen}
              className="px-2.5 sm:px-3 py-1.5 rounded-control bg-accent hover:bg-accent-hover text-accent-contrast font-semibold text-xs transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              title={L('Vollbildmodus aktivieren', 'Enter full screen mode')}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{L('Vollbild', 'Full screen')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`p-2 rounded-control border text-xs font-semibold flex items-center justify-center min-h-[44px] min-w-[38px] transition-colors cursor-pointer ${
                showHelp
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-surface-2 hover:bg-surface-raised border-border text-text-secondary hover:text-text'
              }`}
              title={L('Hilfe', 'Help')}
              aria-label={L('Hilfe', 'Help')}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetScores}
              className="p-2 rounded-control text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer min-h-[44px] min-w-[38px] flex items-center justify-center border border-border"
              title={L('Punkte auf 0 zurücksetzen', 'Reset scores to 0')}
              aria-label={L('Punkte auf 0 zurücksetzen', 'Reset scores to 0')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Help */}
        {showHelp && (
          <div className="bg-surface-2 rounded-card border border-border p-3 text-xs text-text-secondary leading-relaxed animate-in fade-in duration-150">
            <p>
              {L(
                'Punkte für Stationenläufe, Quizrunden oder Geländespiele eintragen. Mit Schnellwahlschritten (+1 / +5 / +10) und Team-Farben. Im Vollbildmodus lassen sich bis zu 8 Teams auf einen Blick ohne Scrollen darstellen. Die Punkte werden gleichwertig nebeneinander ohne bloßstellende Rangliste dargestellt.',
                'Track scores for stations, quiz rounds, or field games. Features quick steps (+1 / +5 / +10) and team colors. In full screen mode, up to 8 teams are visible at a single glance without scrolling. Displayed side-by-side without a shaming ranking.'
              )}
            </p>
          </div>
        )}

        {/* Teams Grid (Normal View) */}
        <div
          className={`grid gap-4 ${
            teams.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : teams.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : teams.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {teams.map((team, idx) => {
            const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
            return (
              // A real card, not Panel: Panel is an unframed section and drops the first item's top
              // border and padding, which pushed team 1 up and left square, half-framed boxes.
              <Card
                as="div"
                key={team.id}
                className="text-center space-y-4 relative flex flex-col justify-between"
              >
                {teams.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTeam(team.id)}
                    className="absolute top-3 right-3 text-text-tertiary hover:text-danger p-1 rounded-full cursor-pointer text-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title={L('Team entfernen', 'Remove team')}
                  >
                    ✕
                  </button>
                )}

                {/* Team Header with Color Dot & Editable Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dot}`} aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, name: val } : t)));
                    }}
                    aria-label={L(`Name für Team ${idx + 1}`, `Name for Team ${idx + 1}`)}
                    className="text-center font-bold text-base sm:text-lg text-text bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-hidden px-1 py-0.5 w-full"
                  />
                </div>

                {/* Score Big Digits (Clickable) */}
                <div className="py-2 relative flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => adjustScore(team.id, 1)}
                    className="group cursor-pointer active:scale-95 transition-transform duration-100 flex items-center justify-center rounded-control p-2 hover:bg-surface-2/60 w-full"
                    title={L('Klicken für +1 Punkt', 'Click for +1 point')}
                    aria-label={L(`${team.name}: ${team.score} Punkte. Tippen für +1`, `${team.name}: ${team.score} points. Tap for +1`)}
                  >
                    <span className="text-6xl sm:text-7xl font-sans font-black text-text tabular-nums select-none tracking-tight group-hover:text-accent transition-colors">
                      {team.score}
                    </span>
                  </button>
                  {recentDelta[team.id] && (
                    <span
                      key={recentDelta[team.id]!.key}
                      className={`absolute top-0 right-4 text-xs font-black px-2 py-0.5 rounded-full animate-in fade-in zoom-in-75 duration-150 pointer-events-none ${
                        recentDelta[team.id]!.delta > 0
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {recentDelta[team.id]!.delta > 0 ? `+${recentDelta[team.id]!.delta}` : recentDelta[team.id]!.delta}
                    </span>
                  )}
                </div>

                {/* Multi-step Score Buttons (+1, +5, +10, -1) */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustScore(team.id, 1)}
                      className={stepBtn}
                      aria-label={pointsFor(1, team.name)}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustScore(team.id, 5)}
                      className={stepBtn}
                      aria-label={pointsFor(5, team.name)}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>5</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustScore(team.id, 10)}
                      className={stepBtn}
                      aria-label={pointsFor(10, team.name)}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>10</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={team.score <= 0}
                    onClick={() => adjustScore(team.id, -1)}
                    aria-label={pointsFor(-1, team.name)}
                    className="w-full py-2 px-3 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer min-h-[44px]"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                    <span>1</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Overlay Mode (All up to 8 teams at a single glance without scrolling) */}
      {/* Portal in <body> und z-50: liegt so über Kopfzeile und Tab-Leiste (z-40), Dialoge (z-60) bleiben darüber. Unten mindestens die
          Safe Area frei, damit die −/+-Reihe am iPhone nicht unter dem Home-Balken sitzt. */}
      {isFullscreen && createPortal(
        <div
          ref={fullscreenRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 bg-bg text-text p-2.5 sm:p-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex flex-col justify-between overflow-hidden select-none"
          role="dialog"
          aria-modal="true"
          aria-label={L('Punktetafel Vollbild', 'Scoreboard Full Screen')}
        >
          {/* Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-border shrink-0 min-h-[44px]">
            {/* Left: Title + Team Counter + Step Selector */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-bold text-sm sm:text-base text-text tracking-tight">
                  {L('Punktetafel', 'Scoreboard')}
                </h2>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary">
                  {teams.length}/{MAX_TEAMS}
                </span>
              </div>

              {/* Adaptive Step Size Selector */}
              <div className="flex items-center gap-1 pl-2 border-l border-border">
                <span className="text-2xs text-text-tertiary hidden md:inline font-medium">
                  {L('Schritt:', 'Step:')}
                </span>
                {([1, 5, 10] as const).map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setStepSize(step)}
                    className={`px-2.5 py-1 rounded-control text-xs font-bold transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      stepSize === step
                        ? 'bg-accent text-accent-contrast shadow-xs'
                        : 'bg-surface-2 hover:bg-surface-raised text-text-secondary border border-border'
                    }`}
                    title={L(`Schrittweite: ${step} Punkte`, `Step: ${step} points`)}
                  >
                    +{step}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {teams.length < MAX_TEAMS && (
                <button
                  type="button"
                  onClick={handleAddTeam}
                  className="px-2.5 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[44px] flex items-center gap-1"
                  title={L('Team hinzufügen (bis zu 8)', 'Add team (up to 8)')}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{L('Team', 'Team')}</span>
                </button>
              )}

              <button
                type="button"
                disabled={history.length === 0}
                onClick={handleUndo}
                className="px-2.5 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[44px] flex items-center gap-1 disabled:opacity-40"
                title={L('Rückgängig (Cmd/Ctrl+Z)', 'Undo (Cmd/Ctrl+Z)')}
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{L('Rückgängig', 'Undo')}</span>
                {history.length > 0 && (
                  <span className="text-2xs px-1 rounded-full bg-surface-3 font-mono">
                    {history.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetScores}
                className="p-2 rounded-control text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer min-h-[44px] min-w-[38px] flex items-center justify-center border border-border"
                title={L('Punkte auf 0 zurücksetzen', 'Reset scores to 0')}
                aria-label={L('Punkte auf 0 zurücksetzen', 'Reset scores to 0')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={exitFullscreen}
                className="px-3 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 shadow-xs"
                title={L('Vollbild beenden (Esc)', 'Exit full screen (Esc)')}
              >
                <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">{L('Vollbild beenden', 'Exit')}</span>
                <span className="sm:hidden">{L('Beenden', 'Exit')}</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Grid View (100% of available height, strictly no scroll) */}
          <div className={`flex-1 min-h-0 py-2 sm:py-3 grid gap-2 sm:gap-3 ${getFullscreenGridClass(teams.length)}`}>
            {teams.map((team, idx) => {
              const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
              const isDense = teams.length > 4;

              return (
                <div
                  key={team.id}
                  className={`relative h-full flex flex-col justify-between rounded-card bg-surface border ${theme.border} ${
                    teams.length === 5 && idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    teams.length === 7 && idx === 6 ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    isDense ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'
                  } transition-all duration-150 overflow-hidden shadow-xs`}
                >
                  {/* Top: Team Color & Name & Delete button */}
                  <div className="relative shrink-0 flex items-center justify-between gap-1 w-full">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dot}`} aria-hidden="true" />
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, name: val } : t)));
                        }}
                        aria-label={L(`Name für Team ${idx + 1}`, `Name for Team ${idx + 1}`)}
                        className="font-bold text-xs sm:text-sm text-text bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-hidden px-1 py-0.5 truncate flex-1 min-w-0"
                      />
                    </div>

                    {teams.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(team.id)}
                        className="p-1 rounded-control text-text-tertiary hover:text-danger hover:bg-danger/10 cursor-pointer text-xs min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                        title={L('Team entfernen', 'Remove team')}
                        aria-label={L('Team entfernen', 'Remove team')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Middle: Clickable Score Number */}
                  <div className="flex-1 min-h-0 flex items-center justify-center relative py-1">
                    <button
                      type="button"
                      onClick={() => adjustScore(team.id, stepSize)}
                      className="group cursor-pointer active:scale-95 transition-transform duration-100 flex items-center justify-center rounded-control p-1 hover:bg-surface-2/60 w-full h-full"
                      title={L(`Klicken für +${stepSize} Punkte`, `Click for +${stepSize} points`)}
                      aria-label={L(`${team.name}: ${team.score} Punkte. Klicken für +${stepSize}`, `${team.name}: ${team.score} points. Click for +${stepSize}`)}
                    >
                      <span
                        className={`font-sans font-black text-text tabular-nums select-none tracking-tight group-hover:text-accent transition-colors ${
                          teams.length <= 3
                            ? 'text-6xl sm:text-7xl lg:text-8xl'
                            : teams.length === 4
                            ? 'text-5xl sm:text-6xl lg:text-7xl'
                            : teams.length <= 6
                            ? 'text-4xl sm:text-5xl lg:text-6xl'
                            : 'text-3xl sm:text-4xl lg:text-5xl'
                        }`}
                      >
                        {team.score}
                      </span>
                    </button>

                    {/* Floating Delta Badge */}
                    {recentDelta[team.id] && (
                      <span
                        key={recentDelta[team.id]!.key}
                        className={`absolute top-0 right-2 sm:right-4 text-xs font-black px-2 py-0.5 rounded-full animate-in fade-in zoom-in-75 duration-150 pointer-events-none shadow-xs ${
                          recentDelta[team.id]!.delta > 0
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {recentDelta[team.id]!.delta > 0 ? `+${recentDelta[team.id]!.delta}` : recentDelta[team.id]!.delta}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Proportional, Balanced Controls */}
                  <div className={`grid ${quickStep !== stepSize ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 sm:gap-2 w-full pt-1 shrink-0`}>
                    {/* Deduct -1 */}
                    <button
                      type="button"
                      disabled={team.score <= 0}
                      onClick={() => adjustScore(team.id, -stepSize)}
                      className="min-h-[44px] px-2 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised active:bg-surface-3 border border-border text-text font-bold text-xs sm:text-sm flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer active:scale-95 transition-transform"
                      title={L(`-${stepSize} Punkte abziehen`, `Deduct -${stepSize} points`)}
                      aria-label={pointsFor(-stepSize, team.name)}
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{stepSize}</span>
                    </button>

                    {/* Add +1 (Primary Accent) */}
                    <button
                      type="button"
                      onClick={() => adjustScore(team.id, stepSize)}
                      className="min-h-[44px] px-2 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised active:bg-surface-3 border border-border text-text font-black text-xs sm:text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
                      title={L(`+${stepSize} Punkte hinzufügen`, `Add +${stepSize} points`)}
                      aria-label={pointsFor(stepSize, team.name)}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{stepSize}</span>
                    </button>

                    {/* Add +quickStep (e.g. +5) */}
                    {quickStep !== stepSize && (
                      <button
                        type="button"
                        onClick={() => adjustScore(team.id, quickStep)}
                        className="min-h-[44px] px-2 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised active:bg-surface-3 border border-border text-text font-bold text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                        title={L(`+${quickStep} Punkte hinzufügen`, `Add +${quickStep} points`)}
                        aria-label={pointsFor(quickStep, team.name)}
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>{quickStep}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Status / Keyboard Hint */}
          <div className="text-2xs text-text-tertiary flex items-center justify-between pt-1 shrink-0 border-t border-border/60">
            <span className="hidden sm:inline">
              {L(
                'Tipp: Klicke direkt auf die Zahl für Punkte. Drücke Esc zum Beenden, Cmd+Z für Rückgängig.',
                'Tip: Click the number to add points. Press Esc to exit, Cmd+Z to undo.'
              )}
            </span>
            <span className="sm:hidden">
              {L('Klicke auf die Zahl für Punkte · Esc zum Beenden', 'Tap number to add points · Esc to exit')}
            </span>
            <span>
              {teams.length} {L('Teams', 'Teams')}
            </span>
          </div>
        </div>,
        document.body,
      )}
      {confirmDialog}
    </>
  );
};
