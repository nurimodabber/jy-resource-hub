import React, { useState } from 'react';
import {
  RotateCcw,
  Eye,
  Users,
  Moon,
  Search,
} from 'lucide-react';
import { Language } from '../../../types';
import {
  KILLER_ROLES,
  KILLER_VARIANTS,
  KillerRole,
} from '../../../data/roleContent';
import { shuffle } from '../../../utils/random';
import {
  tr,
  Panel,
  primaryBtn,
  Stepper,
  ToggleSwitch,
  PlayerSetupSection,
  usePlayerList,
} from '../../tools/common';
import { PassAround } from '../../tools/PassAround';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface KillerCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'play';

export const KillerCompanion: React.FC<KillerCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<Phase>('setup');

  const {
    playerCount,
    setPlayerCount,
    playerNames,
    handleRename,
    handleResetToGroup,
    hasGroupNames,
  } = usePlayerList(8, language, 5);

  // Settings
  const [killerCount, setKillerCount] = useState(1);
  const [hasDetective, setHasDetective] = useState(true);
  const [interactionMethod, setInteractionMethod] = useState<'wink' | 'handshake' | 'dark'>('wink');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>('schlafmuetze');

  // Dealt roles
  const [assignments, setAssignments] = useState<Record<string, KillerRole>>({});
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [isRevealed, setIsRevealed] = useState(false);

  useWakeLock(phase !== 'setup');

  const selectedVariant = KILLER_VARIANTS.find((v) => v.id === selectedVariantId);

  const startDealing = () => {
    if (playerNames.length < 5) {
      alert(
        L(
          'Mord in der Disco benötigt mindestens 5 Personen.',
          'Wink Murder requires at least 5 players.'
        )
      );
      return;
    }

    const deck: KillerRole[] = [];
    const killerRole = KILLER_ROLES.find((r) => r.id === 'zwinkerer')!;
    const detectiveRole = KILLER_ROLES.find((r) => r.id === 'detektiv')!;
    const citizenRole = KILLER_ROLES.find((r) => r.id === 'mitspieler')!;

    for (let i = 0; i < killerCount; i++) deck.push(killerRole);
    if (hasDetective) deck.push(detectiveRole);
    while (deck.length < playerNames.length) {
      deck.push(citizenRole);
    }

    const shuffledDeck = shuffle(deck);
    const map: Record<string, KillerRole> = {};
    playerNames.forEach((p, idx) => {
      map[p] = shuffledDeck[idx];
    });

    setAssignments(map);
    setGuessesLeft(3);
    setIsRevealed(false);
    setPhase('deal');
  };

  const finishDealAndPlay = () => {
    setPhase('play');
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* PHASE 1: SETUP & VARIANTEN                                          */}
      {/* =================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-5 text-left max-w-lg mx-auto">
          {/* Player Count & Names */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <PlayerSetupSection
              language={language}
              playerCount={playerCount}
              playerNames={playerNames}
              minPlayers={5}
              maxPlayers={30}
              onCountChange={setPlayerCount}
              onRename={handleRename}
              onResetToGroup={handleResetToGroup}
              hasGroupNames={hasGroupNames}
              countLabel={L('Spielende', 'Players')}
              countSubtitle={L('Gesamtzahl der Personen im Kreis (mind. 5)', 'Total people in the circle (min. 5)')}
            />
          </Panel>

          {/* Spiel-Art: Zwinkern vs Händedruck vs Im Dunkeln */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text uppercase tracking-wider block">
              {L('Aktion des Täters', 'Culprit Action')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInteractionMethod('wink')}
                className={`p-3 rounded-card border text-left cursor-pointer transition-all ${
                  interactionMethod === 'wink'
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-surface border-border hover:bg-surface-2 text-text'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>{L('Zwinkern', 'Wink')}</span>
                </div>
                <p className="text-2xs text-text-tertiary mt-1">{L('Blickkontakt im Sitzkreis', 'Eye contact in circle')}</p>
              </button>
              <button
                type="button"
                onClick={() => setInteractionMethod('handshake')}
                className={`p-3 rounded-card border text-left cursor-pointer transition-all ${
                  interactionMethod === 'handshake'
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-surface border-border hover:bg-surface-2 text-text'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{L('Händedruck', 'Handshake')}</span>
                </div>
                <p className="text-2xs text-text-tertiary mt-1">{L('Geheimes Drücken im Stehen', 'Secret squeeze in crowd')}</p>
              </button>
              <button
                type="button"
                onClick={() => setInteractionMethod('dark')}
                className={`p-3 rounded-card border text-left cursor-pointer transition-all ${
                  interactionMethod === 'dark'
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-surface border-border hover:bg-surface-2 text-text'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Moon className="w-3.5 h-3.5 shrink-0" />
                  <span>{L('Im Dunkeln', 'In the dark')}</span>
                </div>
                <p className="text-2xs text-text-tertiary mt-1">{L('Im abgedunkelten Raum', 'In darkened room')}</p>
              </button>
            </div>
          </div>

          {/* Rollen-Konfiguration */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 py-1 border-b border-border/50">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-bold text-xs text-text">{L('Anzahl Täter (Mörder)', 'Culprit count')}</p>
                <p className="text-2xs text-text-tertiary">{L('Empfohlen: 1 bei unter 15 Personen', 'Recommended: 1 under 15 players')}</p>
              </div>
              <div className="w-36 shrink-0 flex justify-end">
                <Stepper
                  value={killerCount}
                  min={1}
                  max={Math.max(1, Math.floor(playerNames.length / 4))}
                  onChange={setKillerCount}
                  label={L('Anzahl Täter', 'Number of culprits')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <span className="text-xs font-bold text-text block">
                    {L('Detektiv ermittelt', 'Detective investigates')}
                  </span>
                  <span className="text-2xs text-text-tertiary">
                    {L('Steht in der Mitte des Kreises', 'Stands in the center of circle')}
                  </span>
                </div>
              </div>
              <div className="w-36 shrink-0 flex justify-end">
                <ToggleSwitch
                  checked={hasDetective}
                  onChange={setHasDetective}
                  label={L('Detektiv ermittelt', 'Detective investigates')}
                />
              </div>
            </div>
          </Panel>

          {/* Niemand-scheidet-aus Varianten */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text uppercase tracking-wider block">
              {L('Variante, wenn man getroffen wird', 'When tagged')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KILLER_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`p-3 rounded-card border text-left cursor-pointer transition-all ${
                    selectedVariantId === v.id
                      ? 'bg-accent/15 border-accent text-accent'
                      : 'bg-surface border-border hover:bg-surface-2 text-text'
                  }`}
                >
                  <p className="font-bold text-xs">{v.name[language]}</p>
                  <p className="text-2xs text-text-tertiary truncate">{v.summary[language]}</p>
                </button>
              ))}
            </div>

            {selectedVariant && (
              <div className="p-3.5 rounded-card bg-surface-2 border border-border text-xs text-text-secondary mt-2">
                <p className="font-bold text-text mb-1">{selectedVariant.summary[language]}</p>
                <p className="text-2xs leading-relaxed">{selectedVariant.rules[language][0]}</p>
              </div>
            )}
          </div>

          {/* Start Dealing */}
          <button
            type="button"
            onClick={startDealing}
            className={`${primaryBtn} w-full py-3.5 text-base flex items-center justify-center gap-2`}
          >
            <Eye className="w-4 h-4" />
            <span>{L('Rollen geheim verteilen', 'Deal roles secretly')}</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: GEHEIME ROLLENVERTEILUNG (PASS-AROUND)                    */}
      {/* =================================================================== */}
      {phase === 'deal' && (
        <PassAround
          language={language}
          players={playerNames}
          doneLabel={L('Verteilung abgeschlossen · Spiel starten', 'Deal complete · Start game')}
          onDone={finishDealAndPlay}
          renderCard={(playerIdx) => {
            const p = playerNames[playerIdx];
            const role = assignments[p];
            const isKiller = role.id === 'zwinkerer';
            const isDetective = role.id === 'detektiv';

            return (
              <div className="space-y-4 py-4 text-center w-full">
                <span className="text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20">
                  {p}
                </span>

                <div
                  className={`p-6 rounded-card border ${
                    isKiller
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : isDetective
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-surface-2 border-border text-text'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    {role.name[language]}
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {role.description[language]}
                </p>
              </div>
            );
          }}
        />
      )}

      {/* =================================================================== */}
      {/* PHASE 3: LIVE-SPIEL (DETEKTIV-RATEVERSUCHE & AUFLÖSUNG)              */}
      {/* =================================================================== */}
      {phase === 'play' && (
        <div className="space-y-6 text-left max-w-xl mx-auto">
          {/* Status Box */}
          <div className="p-4 sm:p-5 rounded-card bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                {hasDetective ? L('Detektiv-Rateversuche', 'Detective Guesses') : L('Status', 'Status')}
              </span>
              {hasDetective && (
                <span className="text-xs font-bold text-accent tabular-nums">
                  {guessesLeft} {L('übrig', 'left')}
                </span>
              )}
            </div>

            {hasDetective && (
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((g) => (
                  <div
                    key={g}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      g <= guessesLeft ? 'bg-accent' : 'bg-surface-2 border border-border'
                    }`}
                  />
                ))}
              </div>
            )}

            <p className="text-xs text-text-secondary leading-relaxed">
              {hasDetective
                ? L(
                    'Der Detektiv steht in der Mitte und hat 3 Versuche, den Täter zu enttarnen.',
                    'The detective stands in the center and has 3 attempts to catch the culprit.'
                  )
                : L(
                    'Das Spiel läuft frei in der Gruppe, bis der Täter enttarnt ist.',
                    'Play freely until the culprit is identified.'
                  )}
            </p>
          </div>

          {/* Facilitator Reveal Section */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                {L('Auflösung für Spielleitung', 'Facilitator Solution')}
              </h3>
              <button
                type="button"
                onClick={() => setIsRevealed(!isRevealed)}
                className="px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text cursor-pointer transition-colors"
              >
                {isRevealed ? L('Verbergen', 'Hide') : L('Aufdecken', 'Reveal')}
              </button>
            </div>

            {isRevealed ? (
              <div className="space-y-2 pt-1">
                <div className="p-3.5 rounded-control bg-red-500/10 border border-red-500/30 text-xs">
                  <span className="font-bold text-red-400 block mb-1">
                    {L('Täter (Mörder):', 'Culprit(s):')}
                  </span>
                  <p className="text-sm font-black text-text">
                    {Object.entries(assignments)
                      .filter(([, r]) => r.id === 'zwinkerer')
                      .map(([name]) => name)
                      .join(', ')}
                  </p>
                </div>

                {hasDetective && (
                  <div className="p-3.5 rounded-control bg-amber-500/10 border border-amber-500/30 text-xs">
                    <span className="font-bold text-amber-400 block mb-1">
                      {L('Detektiv:', 'Detective:')}
                    </span>
                    <p className="text-sm font-black text-text">
                      {Object.entries(assignments)
                        .filter(([, r]) => r.id === 'detektiv')
                        .map(([name]) => name)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-tertiary italic">
                {L('Tippe auf „Aufdecken“, um die geheimen Rollen zu sehen.', 'Tap "Reveal" to view secret roles.')}
              </p>
            )}
          </Panel>

          {/* Reset / New Game */}
          <div className="pt-2 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{L('Neues Spiel einrichten', 'Reset to setup')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
