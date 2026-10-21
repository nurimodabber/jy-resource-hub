import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Language } from '../../../types';
import { SPY_PACKS, SpyLocation } from '../../../data/roleContent';
import { loadPresentNames } from '../../../utils/groupNames';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn, secondaryBtn } from '../../tools/common';
import { PassAround } from '../../tools/PassAround';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface SpyCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'play';

export const SpyCompanion: React.FC<SpyCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<string[]>(() => loadPresentNames());
  const [packId, setPackId] = useState<string>(SPY_PACKS[0]?.id || 'schule');

  // Dealing outcome
  const [deal, setDeal] = useState<{
    location: SpyLocation;
    spyName: string;
    roles: Record<string, string>;
  } | null>(null);

  // Round Timer (8 minutes default = 480 seconds)
  const [secondsLeft, setSecondsLeft] = useState(480);
  const [timerRunning, setTimerRunning] = useState(false);
  const endRef = useRef(0);

  // Voting assistant
  const [accusedPlayer, setAccusedPlayer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useWakeLock(phase !== 'setup');

  const selectedPack = SPY_PACKS.find((p) => p.id === packId) || SPY_PACKS[0];

  // Timer countdown loop
  useEffect(() => {
    if (!timerRunning || phase !== 'play') return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        setTimerRunning(false);
        try {
          navigator.vibrate?.([200, 100, 200]);
        } catch {
          /* ignore */
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [timerRunning, phase]);

  const toggleTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      endRef.current = Date.now() + secondsLeft * 1000;
      setTimerRunning(true);
    }
  };

  const adjustTimer = (delta: number) => {
    const updated = Math.max(10, secondsLeft + delta);
    setSecondsLeft(updated);
    if (timerRunning) {
      endRef.current += delta * 1000;
    }
  };

  const startDealing = () => {
    if (players.length < 3) {
      alert(
        L(
          'Für Spion werden mindestens 3 Personen benötigt.',
          'Spy requires at least 3 players.'
        )
      );
      return;
    }

    const loc = shuffle(selectedPack.locations)[0];
    const shuffledRoles = shuffle(loc.roles).map((r) => r[language]);
    const spyIdx = Math.floor(Math.random() * players.length);
    const spyName = players[spyIdx];

    const rolesMap: Record<string, string> = {};
    let rolePointer = 0;

    players.forEach((p) => {
      if (p === spyName) {
        rolesMap[p] = 'SPY';
      } else {
        rolesMap[p] = shuffledRoles[rolePointer % shuffledRoles.length];
        rolePointer++;
      }
    });

    setDeal({
      location: loc,
      spyName,
      roles: rolesMap,
    });
    setPhase('deal');
  };

  const finishDealAndStartGame = () => {
    setSecondsLeft(480);
    setTimerRunning(false);
    setAccusedPlayer(null);
    setIsRevealed(false);
    setPhase('play');
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* PHASE 1: SETUP & PACK-AUSWAHL                                       */}
      {/* =================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-6 text-left">
          {/* Intro Box */}
          <div className="p-4 rounded-card bg-surface-2 border border-border space-y-1">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{L('Spion Assistent', 'Spy Game Assistant')}</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {L(
                'Alle Spieler erhalten denselben geheimen Ort und eine passende Rolle – außer der Spion, der nicht weiß, wo er ist. Durch geschickte Fragen versucht die Gruppe den Spion zu entlarven.',
                'All players receive the same location and a role – except the spy, who has no idea where they are. Ask questions to unmask the spy.'
              )}
            </p>
          </div>

          {/* Group Presence */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-card bg-surface border border-border">
            <div>
              <span className="text-xs font-bold text-text block">
                {players.length} {L('Personen in der Gruppe', 'players in group')}
              </span>
              <p className="text-2xs text-text-tertiary">
                {players.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPlayers(loadPresentNames())}
              className="px-2.5 py-1 text-2xs font-semibold rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-text transition-colors cursor-pointer"
            >
              {L('Aktualisieren', 'Refresh')}
            </button>
          </div>

          {/* Pack Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary block">
              {L('Themenpaket wählen', 'Choose Theme Pack')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPY_PACKS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPackId(p.id)}
                  className={`p-3 rounded-card border text-left transition-all cursor-pointer ${
                    packId === p.id
                      ? 'bg-accent/15 border-accent text-accent'
                      : 'bg-surface border-border hover:bg-surface-2 text-text'
                  }`}
                >
                  <p className="font-bold text-xs">{p.name[language]}</p>
                  <p className="text-2xs text-text-tertiary mt-0.5">
                    {p.locations.length} {L('Orte', 'locations')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Locations Preview */}
          <div className="p-4 rounded-card bg-surface border border-border space-y-2">
            <p className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
              {L('Enthaltene Orte im Paket:', 'Included locations in pack:')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedPack.locations.map((loc) => (
                <span
                  key={loc.id}
                  className="text-2xs px-2.5 py-1 rounded-control bg-surface-2 text-text border border-border"
                >
                  {loc.name[language]}
                </span>
              ))}
            </div>
          </div>

          {/* Start Dealing Button */}
          <button
            type="button"
            onClick={startDealing}
            className={`${primaryBtn} w-full py-3 text-base flex items-center justify-center gap-2`}
          >
            <Eye className="w-4 h-4" />
            <span>{L('Rollen geheim verteilen (Handy weitergeben)', 'Deal secret roles (Pass phone)')}</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: GEHEIME ROLLENVERTEILUNG (PASS-AROUND)                    */}
      {/* =================================================================== */}
      {phase === 'deal' && deal && (
        <PassAround
          language={language}
          players={players}
          doneLabel={L('Verteilung abgeschlossen · Spiel starten', 'Deal complete · Start game')}
          onDone={finishDealAndStartGame}
          renderCard={(playerIdx) => {
            const p = players[playerIdx];
            const isSpy = deal.roles[p] === 'SPY';

            return (
              <div className="space-y-4 py-2 text-center w-full">
                {isSpy ? (
                  <div className="space-y-3 p-5 rounded-card bg-red-500/10 border border-red-500/30">
                    <span className="text-3xl">🕵️</span>
                    <h3 className="text-2xl font-black text-red-400 tracking-tight">
                      {L('Du bist der SPION!', 'You are the SPY!')}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {L(
                        'Du weißt nicht, an welchem Ort die anderen sind! Höre den Fragen und Antworten genau zu und versuche den Ort zu erraten, ohne dich zu verraten.',
                        'You don\'t know the secret location! Listen carefully to questions and try to deduce where you are without getting caught.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-5 rounded-card bg-surface-2 border border-border">
                    <div className="space-y-1">
                      <span className="text-2xs font-bold uppercase tracking-wider text-accent flex items-center justify-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{L('Geheimer Ort', 'Secret Location')}</span>
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-text">
                        {deal.location.name[language]}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <span className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">
                        {L('Deine Rolle', 'Your Role')}
                      </span>
                      <p className="text-base font-bold text-text">
                        {deal.roles[p]}
                      </p>
                    </div>

                    <p className="text-2xs text-text-tertiary pt-1">
                      {L(
                        'Antworte so, dass Mitwisser verstehen, dass du den Ort kennst – aber nicht so deutlich, dass der Spion es sofort weiß.',
                        'Give answers that signal you know the location without making it too obvious for the spy.'
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          }}
        />
      )}

      {/* =================================================================== */}
      {/* PHASE 3: RUNDEN-TIMER & ABSTIMMUNGSHILFE                            */}
      {/* =================================================================== */}
      {phase === 'play' && deal && (
        <div className="space-y-6 text-left">
          {/* Active Round Timer Card */}
          <Panel className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
              <Clock className="w-4 h-4 text-accent" />
              <span>{L('Runden-Timer (8 Minuten)', 'Round Timer (8 minutes)')}</span>
            </div>

            <div className="text-6xl sm:text-7xl font-sans font-black tabular-nums tracking-tight text-text">
              {fmt(secondsLeft)}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={toggleTimer}
                className={`${primaryBtn} min-w-[130px]`}
              >
                {timerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{timerRunning ? L('Pause', 'Pause') : L('Start', 'Start')}</span>
              </button>

              <button
                type="button"
                onClick={() => adjustTimer(-30)}
                className={secondaryBtn}
              >
                -30s
              </button>
              <button
                type="button"
                onClick={() => adjustTimer(60)}
                className={secondaryBtn}
              >
                +1m
              </button>
            </div>
          </Panel>

          {/* Voting Assistant */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-text">
                {L('Abstimmungshilfe: Wer wird verdächtigt?', 'Voting: Who is suspected?')}
              </h3>
              <p className="text-2xs text-text-tertiary">
                {L(
                  'Wenn die Zeit abgelaufen ist oder ein Spieler eine Anklage erhebt, tippe auf den verdächtigten Namen.',
                  'When time is up or an accusation is made, select the suspected player.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {players.map((p) => {
                const isSelected = accusedPlayer === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAccusedPlayer(isSelected ? null : p)}
                    className={`p-3 rounded-card border font-bold text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 ring-1 ring-amber-500/30'
                        : 'bg-surface border-border hover:bg-surface-2 text-text'
                    }`}
                  >
                    <span>{p}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solution / Reveal Section */}
          <div className="p-5 rounded-card bg-surface-2 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                  {L('Auflösung der Runde', 'Round Solution')}
                </h4>
                <p className="text-2xs text-text-tertiary">
                  {L('Nur aufdecken, wenn die Abstimmung abgeschlossen ist.', 'Reveal only once voting has ended.')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRevealed(!isRevealed)}
                className="px-3.5 py-1.5 min-h-[38px] rounded-control bg-surface hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
              >
                {isRevealed ? L('Verbergen', 'Hide') : L('Rollen aufdecken', 'Reveal roles')}
              </button>
            </div>

            {isRevealed && (
              <div className="pt-2 border-t border-border/50 space-y-3">
                <div className="p-3.5 rounded-control bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{L('Der Spion war:', 'The spy was:')}</span>
                  <span className="font-black text-red-400 text-sm">{deal.spyName}</span>
                </div>

                <div className="p-3.5 rounded-control bg-accent/10 border border-accent/30 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{L('Der geheime Ort war:', 'Secret location was:')}</span>
                  <span className="font-bold text-accent text-sm">{deal.location.name[language]}</span>
                </div>
              </div>
            )}
          </div>

          {/* New Round */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{L('Neue Runde spielen', 'Play new round')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
