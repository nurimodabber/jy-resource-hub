import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Undo2, Maximize2, Minimize2, Users, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../../types';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { loadPresentNames } from '../../utils/groupNames';
import { tr, Panel } from './common';

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

export const ScoreboardTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [teams, setTeams] = useLocalState<TeamScore[]>('jy_scoreboard_teams', [
    { id: 't1', name: language === 'de' ? 'Team Blau' : 'Blue Team', score: 0 },
    { id: 't2', name: language === 'de' ? 'Team Gelb' : 'Yellow Team', score: 0 },
  ]);
  const [history, setHistory] = useState<ScoreMove[]>([]);
  const [isBeamer, setIsBeamer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useWakeLock(isBeamer);

  const adjustScore = (teamId: string, delta: number) => {
    const target = teams.find((t) => t.id === teamId);
    if (!target) return;
    setHistory((prev) => [...prev, { teamId, delta, prevScore: target.score }]);
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
  };

  const handleUndo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setTeams((prev) =>
      prev.map((t) => (t.id === last.teamId ? { ...t, score: last.prevScore } : t))
    );
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleResetScores = () => {
    if (window.confirm(L('Alle Punktestände auf 0 zurücksetzen?', 'Reset all scores to 0?'))) {
      setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
      setHistory([]);
    }
  };

  const handleAddTeam = () => {
    const nextNum = teams.length + 1;
    const newTeam: TeamScore = {
      id: 'team-' + Date.now(),
      name: language === 'de' ? `Team ${nextNum}` : `Team ${nextNum}`,
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
      alert(L('Bitte zuerst mindestens 2 anwesende Personen in „Meine Gruppe“ eintragen.', 'Please add at least 2 present people in "My Group" first.'));
      return;
    }
    const teamCount = teams.length;
    const teamNames: TeamScore[] = [];
    for (let i = 0; i < teamCount; i++) {
      teamNames.push({
        id: 't-gen-' + i,
        name: L(`Team ${i + 1}`, `Team ${i + 1}`),
        score: 0,
      });
    }
    setTeams(teamNames);
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      {/* "So geht's" Expandable Help */}
      <div className="bg-surface-2 rounded-card border border-border p-4">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-text" />
            <span>{L('So geht’s: Punktetafel für Gruppenaktivitäten', 'How it works: Scoreboard')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Punkte für Stationenläufe, Quizrunden oder Geländespiele eintragen. Standardmäßig werden bewusst nur Summen pro Team ohne Rangliste angezeigt, um Gemeinschaft statt Beschämung zu fördern.',
              'Track points for stations, quiz rounds, or outdoor games. Purposely displays only totals per team without a leaderboard to foster unity over comparison.'
            )}
          </p>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddTeam}
            className="px-3.5 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{L('Team hinzufügen', 'Add team')}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateFromGroup}
            className="px-3.5 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-accent-text" />
            <span>{L('Aus Gruppe', 'From group')}</span>
          </button>

          <button
            type="button"
            disabled={history.length === 0}
            onClick={handleUndo}
            className="px-3.5 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5 disabled:opacity-40"
          >
            <Undo2 className="w-4 h-4" />
            <span>{L('Rückgängig', 'Undo')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBeamer(true)}
            className="px-4 py-2 rounded-control bg-accent text-accent-contrast font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{L('Beamer-Modus', 'Projector view')}</span>
          </button>

          <button
            type="button"
            onClick={handleResetScores}
            className="p-2 rounded-control text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={L('Punkte auf 0', 'Reset scores')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className={`grid gap-4 ${teams.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : teams.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'}`}>
        {teams.map((team, idx) => (
          <Panel key={team.id} className="text-center p-6 space-y-4 relative flex flex-col justify-between">
            {teams.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveTeam(team.id)}
                className="absolute top-3 right-3 text-text-tertiary hover:text-danger p-1 rounded-full cursor-pointer text-xs"
                title={L('Team entfernen', 'Remove team')}
              >
                ✕
              </button>
            )}

            <div>
              <input
                type="text"
                value={team.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, name: val } : t)));
                }}
                className="text-center font-bold text-base sm:text-lg text-text bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-hidden px-1 py-0.5 w-full"
              />
              <span className="text-2xs text-text-tertiary font-semibold uppercase tracking-wider block mt-0.5">
                {L(`Team ${idx + 1}`, `Team ${idx + 1}`)}
              </span>
            </div>

            {/* Score Big Digits */}
            <div className="py-2">
              <div className="text-6xl sm:text-7xl font-mono font-extrabold text-accent-text tabular-nums select-none tracking-tight">
                {team.score}
              </div>
            </div>

            {/* Large + / - Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => adjustScore(team.id, 1)}
                  className="py-3 px-2 rounded-control bg-accent text-accent-contrast font-extrabold text-base flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-transform cursor-pointer min-h-[48px]"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>1</span>
                </button>
                <button
                  type="button"
                  onClick={() => adjustScore(team.id, 5)}
                  className="py-3 px-2 rounded-control bg-accent text-accent-contrast font-extrabold text-base flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-transform cursor-pointer min-h-[48px]"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>5</span>
                </button>
              </div>

              <button
                type="button"
                disabled={team.score <= 0}
                onClick={() => adjustScore(team.id, -1)}
                className="w-full py-2 px-3 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer min-h-[40px]"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
                <span>1</span>
              </button>
            </div>
          </Panel>
        ))}
      </div>

      {/* Beamer Fullscreen Overlay */}
      {isBeamer && (
        <div
          className="fixed inset-0 z-80 bg-bg text-text p-6 sm:p-10 flex flex-col justify-between safe-top safe-bottom animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight">
              {L('Punktestand', 'Scoreboard')}
            </h2>
            <button
              type="button"
              onClick={() => setIsBeamer(false)}
              className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised text-text font-bold text-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{L('Beamer-Modus schließen', 'Exit')}</span>
            </button>
          </div>

          {/* Large Screen Presentation Grid */}
          <div className={`grid gap-6 my-auto max-w-6xl mx-auto w-full ${teams.length === 2 ? 'grid-cols-2' : teams.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {teams.map((team) => (
              <div key={team.id} className="p-8 sm:p-12 rounded-card bg-surface border border-border text-center shadow-xs space-y-4">
                <h3 className="text-xl sm:text-3xl font-extrabold text-text truncate">
                  {team.name}
                </h3>
                <div className="text-7xl sm:text-9xl font-mono font-black text-accent-text select-none tracking-tight">
                  {team.score}
                </div>
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => adjustScore(team.id, 1)}
                    className="w-14 h-14 rounded-control bg-accent text-accent-contrast font-black text-2xl flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-transform"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustScore(team.id, 5)}
                    className="w-14 h-14 rounded-control bg-accent text-accent-contrast font-black text-2xl flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-transform"
                  >
                    +5
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-text-tertiary">
            {L('Bildschirm bleibt an (Wake Lock aktiv)', 'Screen kept awake (Wake Lock active)')}
          </div>
        </div>
      )}
    </div>
  );
};
