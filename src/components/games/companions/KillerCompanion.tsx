import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';
import { Language } from '../../../types';
import {
  KILLER_ROLES,
  KILLER_VARIANTS,
  KillerRole,
} from '../../../data/roleContent';
import { loadPresentNames } from '../../../utils/groupNames';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn, Stepper } from '../../tools/common';
import { PassAround } from '../../tools/PassAround';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface KillerCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'play';

export const KillerCompanion: React.FC<KillerCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<string[]>(() => loadPresentNames());

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
    if (players.length < 5) {
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
    while (deck.length < players.length) {
      deck.push(citizenRole);
    }

    const shuffledDeck = shuffle(deck);
    const map: Record<string, KillerRole> = {};
    players.forEach((p, idx) => {
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
        <div className="space-y-6 text-left">
          {/* Header Box */}
          <div className="p-4 rounded-card bg-surface-2 border border-border space-y-1">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{L('Mord in der Disco', 'Wink Murder')}</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {L(
                'Ein geheimer Täter schaltet Mitspieler unauffällig aus (per Zwinkern, Händedruck oder im Dunkeln). Der Detektiv versucht, ihn vor Ablauf der Runden zu überführen.',
                'A secret culprit eliminates players quietly (by winking, handshake or in the dark). The detective tries to catch them.'
              )}
            </p>
          </div>

          {/* Group Presence Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-card bg-surface border border-border">
            <div>
              <span className="text-xs font-bold text-text block">
                {players.length} {L('Personen bereit', 'players ready')}
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

          {/* Spiel-Art: Zwinkern vs Händedruck vs Im Dunkeln */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary block">
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
                <p className="font-bold text-xs">😉 {L('Zwinkern', 'Wink')}</p>
                <p className="text-2xs text-text-tertiary">{L('Blickkontakt im Sitzkreis', 'Eye contact in circle')}</p>
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
                <p className="font-bold text-xs">🤝 {L('Händedruck', 'Handshake')}</p>
                <p className="text-2xs text-text-tertiary">{L('Geheimes Drücken im Stehen', 'Secret squeeze in crowd')}</p>
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
                <p className="font-bold text-xs">🌑 {L('Mord im Dunkeln', 'In the dark')}</p>
                <p className="text-2xs text-text-tertiary">{L('Im abgedunkelten Raum', 'In darkened room')}</p>
              </button>
            </div>
          </div>

          {/* Rollen-Konfiguration */}
          <Panel className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <div>
                <p className="font-bold text-xs text-text">{L('Anzahl Täter (Mörder)', 'Culprit count')}</p>
                <p className="text-2xs text-text-tertiary">{L('Empfohlen: 1 bei unter 15 Personen', 'Recommended: 1 under 15 players')}</p>
              </div>
              <Stepper
                value={killerCount}
                min={1}
                max={Math.max(1, Math.floor(players.length / 4))}
                onChange={setKillerCount}
                label={L('Anzahl Täter', 'Number of culprits')}
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasDetective}
                onChange={(e) => setHasDetective(e.target.checked)}
                className="w-4 h-4 accent-accent rounded-xs"
              />
              <span className="text-xs font-bold text-text">
                🕵️ {L('Detektiv ermittelt (steht in der Mitte)', 'Detective in the center')}
              </span>
            </label>
          </Panel>

          {/* Niemand-scheidet-aus Varianten */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary block">
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
              <div className="p-3.5 rounded-card bg-surface-2 border border-border text-xs text-text-secondary mt-1">
                <p className="font-bold text-text mb-1">{selectedVariant.summary[language]}</p>
                <p className="text-2xs leading-relaxed">{selectedVariant.rules[language][0]}</p>
              </div>
            )}
          </div>

          {/* Start Dealing Button */}
          <button
            type="button"
            onClick={startDealing}
            className={`${primaryBtn} w-full py-3 text-base flex items-center justify-center gap-2`}
          >
            <Eye className="w-4 h-4" />
            <span>{L('Rollen geheim verteilen', 'Deal secret roles')}</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: GEHEIME ROLLENVERTEILUNG (PASS-AROUND)                    */}
      {/* =================================================================== */}
      {phase === 'deal' && (
        <PassAround
          language={language}
          players={players}
          doneLabel={L('Rollen verteilt · Runde starten', 'Roles dealt · Start round')}
          onDone={finishDealAndPlay}
          renderCard={(playerIdx) => {
            const p = players[playerIdx];
            const role = assignments[p];
            const isKiller = role.id === 'zwinkerer';
            const isDet = role.id === 'detektiv';

            return (
              <div className="space-y-4 py-3 text-center w-full">
                <span className="text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20">
                  {p}
                </span>

                <div
                  className={`p-6 rounded-card border ${
                    isKiller
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : isDet
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-surface-2 border-border text-text'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    {isKiller
                      ? interactionMethod === 'wink'
                        ? L('Der Zwinkerer', 'The Winker')
                        : interactionMethod === 'handshake'
                        ? L('Der Drücker', 'The Squeezer')
                        : L('Der Täter', 'The Culprit')
                      : role.name[language]}
                  </div>
                  <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                    {isKiller
                      ? L('Täter-Rolle', 'Culprit Role')
                      : isDet
                      ? L('Detektiv', 'Detective')
                      : L('Mitspieler', 'Citizen')}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                  {role.description[language]}
                </p>
              </div>
            );
          }}
        />
      )}

      {/* =================================================================== */}
      {/* PHASE 3: SPIELPHASE & DETEKTIV-HILFE                                */}
      {/* =================================================================== */}
      {phase === 'play' && (
        <div className="space-y-6 text-left">
          {/* Rules / Interaction summary */}
          <div className="p-4 rounded-card bg-surface-2 border border-border space-y-2">
            <h3 className="text-sm font-bold text-text">
              {interactionMethod === 'wink'
                ? L('Spiel läuft: Zwinkern im Kreis', 'Play: Winking in the circle')
                : interactionMethod === 'handshake'
                ? L('Spiel läuft: Händedruck im Raum', 'Play: Handshake in the room')
                : L('Spiel läuft: Mord im Dunkeln', 'Play: Murder in the dark')}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {L(
                'Der Detektiv darf genau 3 Mal tippen, wer der Täter ist. Die Mitspieler verhalten sich ruhig und natürlich.',
                'The detective may guess up to 3 times. Citizens behave naturally and follow the chosen variant when tagged.'
              )}
            </p>
          </div>

          {/* Detective Guess Tracker */}
          {hasDetective && (
            <Panel className="p-5 text-center space-y-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Verbleibende Detektiv-Tipps', 'Remaining detective guesses')}
              </span>
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuessesLeft(num - 1)}
                    className={`w-12 h-12 rounded-full font-black text-lg border transition-all cursor-pointer ${
                      num <= guessesLeft
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs'
                        : 'bg-surface-2 text-text-tertiary border-border opacity-30 line-through'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-2xs text-text-tertiary">
                {guessesLeft > 0
                  ? L(`Noch ${guessesLeft} Versuch(e)`, `${guessesLeft} guess(es) remaining`)
                  : L('Keine Versuche mehr! Der Täter gewinnt.', 'No guesses left! Culprit wins.')}
              </p>
            </Panel>
          )}

          {/* Solution / Reveal */}
          <div className="p-4 rounded-card bg-surface-2 border border-border flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-text">{L('Auflösung der Runde', 'Solution')}</p>
              <p className="text-2xs text-text-tertiary">
                {isRevealed
                  ? Object.entries(assignments)
                      .filter(([, r]) => r.id === 'zwinkerer')
                      .map(([p]) => p)
                      .join(', ') + ' ' + L('war der Täter!', 'was the culprit!')
                  : L('Rolle erst am Rundenende aufdecken.', 'Reveal only at end of round.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsRevealed(!isRevealed)}
              className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
            >
              {isRevealed ? L('Verbergen', 'Hide') : L('Aufdecken', 'Reveal')}
            </button>
          </div>

          {/* Reset */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{L('Neue Runde starten', 'Start new round')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
