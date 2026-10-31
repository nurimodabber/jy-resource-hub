import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Clock,
  MapPin,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { Language } from '../../../types';
import { SPY_PACKS, SpyLocation } from '../../../data/roleContent';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn, secondaryBtn, Stepper, ToggleSwitch, PlayerSetupSection, usePlayerList } from '../../tools/common';
import { PassAround } from '../../tools/PassAround';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface SpyCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'play';

export const SpyCompanion: React.FC<SpyCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<Phase>('setup');

  const {
    playerCount,
    setPlayerCount,
    playerNames,
    handleRename,
    handleResetToGroup,
    hasGroupNames,
  } = usePlayerList(5, language, 3);

  // Imposters count
  const [imposterCount, setImposterCount] = useState<number>(1);

  // Imposter hint toggle (yes/no)
  const [imposterHint, setImposterHint] = useState<boolean>(false);

  // Selected Category Pack ID or 'all'
  const [selectedPackId, setSelectedPackId] = useState<string>(SPY_PACKS[0]?.id || 'places');

  // Round Timer toggle & duration in minutes
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [timerMinutes, setTimerMinutes] = useState<number>(8);

  // Dealing outcome
  const [deal, setDeal] = useState<{
    location: SpyLocation;
    packName: string;
    spyNames: string[];
    roles: Record<string, string>;
  } | null>(null);

  // Active round timer
  const [secondsLeft, setSecondsLeft] = useState(480);
  const [timerRunning, setTimerRunning] = useState(false);
  const endRef = useRef(0);

  // Voting assistant
  const [accusedPlayer, setAccusedPlayer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useWakeLock(phase !== 'setup');

  // Adjust max imposters when player count changes
  useEffect(() => {
    const maxAllowed = Math.max(1, playerCount - 1);
    if (imposterCount > maxAllowed) {
      setImposterCount(maxAllowed);
    }
  }, [playerCount, imposterCount]);

  // Timer countdown loop
  useEffect(() => {
    if (!timerRunning || phase !== 'play' || !timerEnabled) return;
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
  }, [timerRunning, phase, timerEnabled]);

  const toggleTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      const current = secondsLeft > 0 ? secondsLeft : timerMinutes * 60;
      if (secondsLeft <= 0) {
        setSecondsLeft(current);
      }
      endRef.current = Date.now() + current * 1000;
      setTimerRunning(true);
    }
  };

  const resetTimer = () => {
    const total = timerMinutes * 60;
    setSecondsLeft(total);
    if (timerRunning) {
      endRef.current = Date.now() + total * 1000;
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
    if (playerNames.length < 3) {
      alert(
        L(
          'Für Spion werden mindestens 3 Personen benötigt.',
          'Spy requires at least 3 players.'
        )
      );
      return;
    }

    // Pick location from chosen pack or all packs
    const poolPacks =
      selectedPackId === 'all'
        ? SPY_PACKS
        : SPY_PACKS.filter((p) => p.id === selectedPackId);
    const chosenPack = shuffle(poolPacks)[0] || SPY_PACKS[0];
    const loc = shuffle(chosenPack.locations)[0];
    const shuffledRoles = shuffle(loc.roles).map((r) => r[language]);

    // Choose N spies
    const shuffledPlayers = shuffle([...playerNames]);
    const chosenSpies = shuffledPlayers.slice(0, imposterCount);

    const rolesMap: Record<string, string> = {};
    let rolePointer = 0;

    playerNames.forEach((p) => {
      if (chosenSpies.includes(p)) {
        rolesMap[p] = 'SPY';
      } else {
        rolesMap[p] = shuffledRoles[rolePointer % shuffledRoles.length];
        rolePointer++;
      }
    });

    setDeal({
      location: loc,
      packName: chosenPack.name[language],
      spyNames: chosenSpies,
      roles: rolesMap,
    });
    setPhase('deal');
  };

  const finishDealAndStartGame = () => {
    setSecondsLeft(timerMinutes * 60);
    setTimerRunning(false);
    setAccusedPlayer(null);
    setIsRevealed(false);
    setPhase('play');
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const currentPack = SPY_PACKS.find((p) => p.id === selectedPackId);

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* PHASE 1: EINHEITLICHES, KLARES SETUP OHNE KARTEN-VERSCHACHTELUNG    */}
      {/* =================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-5 text-left w-full max-w-2xl">
          <Panel className="p-5 sm:p-6 space-y-4">
            {/* 1. Spielende & Namen */}
            <PlayerSetupSection
              language={language}
              playerCount={playerCount}
              playerNames={playerNames}
              minPlayers={3}
              maxPlayers={25}
              onCountChange={setPlayerCount}
              onRename={handleRename}
              onResetToGroup={handleResetToGroup}
              hasGroupNames={hasGroupNames}
              countLabel={L('Spielende', 'Players')}
              countSubtitle={L('Gesamtzahl der Personen im Kreis', 'Total number of people in the circle')}
            />

            {/* 3. Spione (Imposters) */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50">
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                  <span>{L('Spione', 'Spies')}</span>
                </span>
                <p className="text-2xs text-text-tertiary">
                  {L('Wie viele Personen den Ort nicht kennen', 'How many players are in the dark')}
                </p>
              </div>
              <div className="w-36 shrink-0 flex justify-end">
                <Stepper
                  value={imposterCount}
                  min={1}
                  max={Math.max(1, playerCount - 1)}
                  onChange={(n) => setImposterCount(n)}
                  label={L('Anzahl Spione', 'Number of spies')}
                />
              </div>
            </div>

            {/* 4. Spion-Hinweis (Imposter Hint Toggle) */}
            <div
              onClick={() => setImposterHint(!imposterHint)}
              className="flex items-center justify-between gap-4 py-2 border-b border-border/50 cursor-pointer select-none"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-accent" />
                  <span>{L('Spion-Hinweis', 'Spy Hint')}</span>
                </span>
                <p className="text-2xs text-text-tertiary">
                  {L('Gibt dem Spion einen dezenten Hinweis auf die Kategorie', 'Gives the spy a subtle hint about the category')}
                </p>
              </div>
              <div className="w-36 shrink-0 flex justify-end">
                <ToggleSwitch
                  checked={imposterHint}
                  onChange={setImposterHint}
                  label={L('Spion-Hinweis', 'Spy Hint')}
                />
              </div>
            </div>

            {/* 5. Runden-Timer (Standard Toggle + Duration Stepper) */}
            <div className="py-2 border-b border-border/50 space-y-2">
              <div
                onClick={() => setTimerEnabled(!timerEnabled)}
                className="flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>{L('Runden-Timer', 'Round Timer')}</span>
                  </span>
                  <p className="text-2xs text-text-tertiary">
                    {timerEnabled
                      ? `${timerMinutes} ${L('Minuten Diskussion mit Schlusston', 'minutes with alert')}`
                      : L('Ohne Zeitbegrenzung spielen', 'Play without time limit')}
                  </p>
                </div>
                <div className="w-36 shrink-0 flex justify-end">
                  <ToggleSwitch
                    checked={timerEnabled}
                    onChange={setTimerEnabled}
                    label={L('Runden-Timer', 'Round Timer')}
                  />
                </div>
              </div>

              {timerEnabled && (
                <div className="flex items-center justify-between pt-1 text-2xs">
                  <span className="text-text-secondary font-medium">
                    {L('Dauer festlegen:', 'Set duration:')}
                  </span>
                  <div className="w-36 flex justify-end">
                    <Stepper
                      value={timerMinutes}
                      min={3}
                      max={15}
                      onChange={setTimerMinutes}
                      label={L('Dauer in Minuten', 'Duration in minutes')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. Kategorien Dropdown */}
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text uppercase tracking-wider">
                  {L('Kategorien', 'Categories')}
                </span>
                <span className="text-2xs text-text-tertiary">
                  {currentPack ? `${currentPack.locations.length} ${L('Orte', 'locations')}` : L('Alle gemischt', 'All mixed')}
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedPackId}
                  onChange={(e) => setSelectedPackId(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-control bg-surface-2 border border-border/80 text-xs font-bold text-text cursor-pointer pr-9 focus:border-accent focus:outline-hidden"
                >
                  <option value="all">{L('Alle Kategorien gemischt', 'All Categories Mixed')}</option>
                  {SPY_PACKS.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.name[language]} ({pack.locations.length})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </Panel>

          {/* Big Start Button */}
          <button
            type="button"
            onClick={startDealing}
            className={`${primaryBtn} w-full py-3.5 text-base flex items-center justify-center gap-2`}
          >
            <Eye className="w-4 h-4" />
            <span>{L('Rollen geheim verteilen', 'Deal secret roles')}</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: GEHEIME ROLLENVERTEILUNG (PASS-AROUND)                    */}
      {/* =================================================================== */}
      {phase === 'deal' && deal && (
        <PassAround
          language={language}
          players={playerNames}
          doneLabel={L('Verteilung abgeschlossen · Runde starten', 'Deal complete · Start round')}
          onDone={finishDealAndStartGame}
          renderCard={(playerIdx) => {
            const p = playerNames[playerIdx];
            const isSpy = deal.spyNames.includes(p);

            return (
              <div className="space-y-4 py-2 text-center w-full">
                {isSpy ? (
                  <div className="space-y-3.5 p-6 rounded-card bg-surface-2 border border-accent/40 text-text">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent block">
                      {L('Deine geheime Rolle', 'Your Secret Role')}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                      {L('Du bist der Spion!', 'You are the Spy!')}
                    </h3>

                    {imposterHint && (
                      <div className="p-2.5 rounded-control bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
                        {L('Kategorie-Hinweis:', 'Category hint:')} „{deal.packName}“
                      </div>
                    )}

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {L(
                        'Du weißt nicht, an welchem Ort die anderen sind. Höre allen Fragen und Antworten genau zu und errate den Ort, ohne aufzufliegen.',
                        'You do not know the secret location. Listen carefully to questions and deduce where you are without getting caught.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-6 rounded-card bg-surface-2 border border-border text-text">
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
                        'Give answers that signal you know the location without giving it away to the spy.'
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
      {/* PHASE 3: SPIELPHASE (TIMER & ABSTIMMUNG)                            */}
      {/* =================================================================== */}
      {phase === 'play' && deal && (
        <div className="space-y-6 text-left w-full max-w-2xl">
          {/* Active Round Timer Card (if enabled) */}
          {timerEnabled && (
            <Panel className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                <Clock className="w-4 h-4 text-accent" />
                <span>{L('Runden-Timer', 'Round Timer')}</span>
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
                  title={L('30 Sekunden abziehen', 'Subtract 30 seconds')}
                >
                  -30s
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimer(60)}
                  className={secondaryBtn}
                  title={L('1 Minute hinzufügen', 'Add 1 minute')}
                >
                  +1m
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  className={secondaryBtn}
                  title={L('Timer zurücksetzen', 'Reset timer')}
                  aria-label={L('Timer zurücksetzen', 'Reset timer')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </Panel>
          )}

          {/* Voting Assistant */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-text">
                {L('Abstimmung: Wer wird verdächtigt?', 'Voting: Who is suspected?')}
              </h3>
              <p className="text-2xs text-text-tertiary">
                {L(
                  'Tippe auf den Namen der Person, die die Gruppe als Spion anklagt.',
                  'Tap the name of the player the group accuses of being a spy.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {playerNames.map((p) => {
                const isSelected = accusedPlayer === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAccusedPlayer(isSelected ? null : p)}
                    className={`p-3 rounded-card border font-bold text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-accent ring-1 ring-accent/30'
                        : 'bg-surface border-border hover:bg-surface-2 text-text'
                    }`}
                  >
                    <span className="truncate">{p}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-accent shrink-0" />}
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
                  {L('Erst aufdecken, wenn die Abstimmung fertig ist.', 'Reveal only once voting has ended.')}
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
              <div className="pt-2 border-t border-border/50 space-y-2.5">
                <div className="p-3.5 rounded-control bg-surface border border-accent/40 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">
                    {deal.spyNames.length > 1
                      ? L('Die Spione waren:', 'The spies were:')
                      : L('Der Spion war:', 'The spy was:')}
                  </span>
                  <span className="font-bold text-text text-sm">
                    {deal.spyNames.join(', ')}
                  </span>
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