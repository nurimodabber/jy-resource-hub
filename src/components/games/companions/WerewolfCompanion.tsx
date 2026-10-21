import React, { useState } from 'react';
import {
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';
import { Language } from '../../../types';
import {
  WEREWOLF_ROLES,
  WEREWOLF_NARRATOR,
  WEREWOLF_VARIANTS,
  WerewolfRole,
} from '../../../data/roleContent';
import { loadPresentNames } from '../../../utils/groupNames';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn, Stepper } from '../../tools/common';
import { PassAround } from '../../tools/PassAround';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface WerewolfCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'narrator';

export const WerewolfCompanion: React.FC<WerewolfCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<string[]>(() => loadPresentNames());

  // Role configuration counts
  const [wolvesCount, setWolvesCount] = useState(2);
  const [includeSeer, setIncludeSeer] = useState(true);
  const [includeWitch, setIncludeWitch] = useState(true);
  const [includeHunter, setIncludeHunter] = useState(false);
  const [includeProtector, setIncludeProtector] = useState(false);
  const [includeCupid, setIncludeCupid] = useState(false);

  // Variant ("Niemand scheidet aus")
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Dealt roles map: player -> WerewolfRole
  const [assignments, setAssignments] = useState<Record<string, WerewolfRole>>({});

  // Narrator step
  const [narratorStepIdx, setNarratorStepIdx] = useState(0);

  useWakeLock(phase !== 'setup');

  const selectedVariant = WEREWOLF_VARIANTS.find((v) => v.id === selectedVariantId);

  // Calculate villagers automatically
  const specialCount =
    wolvesCount +
    (includeSeer ? 1 : 0) +
    (includeWitch ? 1 : 0) +
    (includeHunter ? 1 : 0) +
    (includeProtector ? 1 : 0) +
    (includeCupid ? 1 : 0);
  const villagerCount = Math.max(0, players.length - specialCount);

  const startDealing = () => {
    if (players.length < 3) {
      alert(
        L(
          'Werwölfe benötigt mindestens 3 Personen.',
          'Werewolf requires at least 3 players.'
        )
      );
      return;
    }

    const deck: WerewolfRole[] = [];
    const wolfRole = WEREWOLF_ROLES.find((r) => r.id === 'werwolf')!;
    const villagerRole = WEREWOLF_ROLES.find((r) => r.id === 'dorfbewohner')!;
    const seerRole = WEREWOLF_ROLES.find((r) => r.id === 'seherin')!;
    const witchRole = WEREWOLF_ROLES.find((r) => r.id === 'hexe')!;
    const hunterRole = WEREWOLF_ROLES.find((r) => r.id === 'jaeger')!;
    const protectorRole = WEREWOLF_ROLES.find((r) => r.id === 'beschuetzer')!;
    const cupidRole = WEREWOLF_ROLES.find((r) => r.id === 'amor')!;

    for (let i = 0; i < wolvesCount; i++) deck.push(wolfRole);
    if (includeSeer) deck.push(seerRole);
    if (includeWitch) deck.push(witchRole);
    if (includeHunter) deck.push(hunterRole);
    if (includeProtector) deck.push(protectorRole);
    if (includeCupid) deck.push(cupidRole);

    while (deck.length < players.length) {
      deck.push(villagerRole);
    }

    const shuffledDeck = shuffle(deck);
    const map: Record<string, WerewolfRole> = {};
    players.forEach((p, idx) => {
      map[p] = shuffledDeck[idx] || villagerRole;
    });

    setAssignments(map);
    setPhase('deal');
  };

  const finishDealAndStartNarrator = () => {
    setNarratorStepIdx(0);
    setPhase('narrator');
  };

  // Filter narrator steps to only include relevant roles
  const activeNarratorSteps = WEREWOLF_NARRATOR.filter((step) => {
    if (step.id.includes('amor') && !includeCupid) return false;
    if (step.id.includes('beschuetzer') && !includeProtector) return false;
    if (step.id.includes('seherin') && !includeSeer) return false;
    if (step.id.includes('hexe') && !includeWitch) return false;
    if (step.id.includes('jaeger') && !includeHunter) return false;
    return true;
  });

  const currentNarratorStep = activeNarratorSteps[narratorStepIdx] || activeNarratorSteps[0];

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* PHASE 1: SETUP & ROLLEN-AUSWAHL                                     */}
      {/* =================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-6 text-left">
          {/* Header Box */}
          <div className="p-4 rounded-card bg-surface-2 border border-border space-y-1">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{L('Werwölfe Assistent & Erzähler', 'Werewolf Assistant & Narrator')}</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {L(
                'Konfiguriere Rollen und Varianten, verteile sie geheim per Handy-Weitergabe und führe die Gruppe mit dem integrierten Erzähler-Skript Schritt für Schritt durch Nacht und Tag.',
                'Configure roles and variants, deal them via phone pass-around, and guide the group through night and day with the narrator script.'
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

          {/* Role Configuration Panel */}
          <Panel className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              {L('Rollen im Spiel', 'Roles in game')}
            </h3>

            {/* Werewolves count */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <p className="font-bold text-sm text-text">🐺 {L('Werwölfe', 'Werewolves')}</p>
                <p className="text-2xs text-text-tertiary">
                  {L('Erwachen nachts und wählen ein Opfer', 'Wake at night to choose a victim')}
                </p>
              </div>
              <Stepper
                value={wolvesCount}
                min={1}
                max={Math.max(1, Math.floor(players.length / 3))}
                onChange={setWolvesCount}
                label={L('Anzahl Werwölfe', 'Number of werewolves')}
              />
            </div>

            {/* Special roles toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label className="flex items-center gap-2.5 p-2.5 rounded-control bg-surface-2 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSeer}
                  onChange={(e) => setIncludeSeer(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded-xs"
                />
                <span className="text-xs font-bold text-text">🔮 {L('Seherin', 'Seer')}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-control bg-surface-2 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWitch}
                  onChange={(e) => setIncludeWitch(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded-xs"
                />
                <span className="text-xs font-bold text-text">🧙‍♀️ {L('Hexe', 'Witch')}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-control bg-surface-2 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHunter}
                  onChange={(e) => setIncludeHunter(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded-xs"
                />
                <span className="text-xs font-bold text-text">🏹 {L('Jäger', 'Hunter')}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-control bg-surface-2 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProtector}
                  onChange={(e) => setIncludeProtector(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded-xs"
                />
                <span className="text-xs font-bold text-text">🛡️ {L('Beschützer', 'Protector')}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-control bg-surface-2 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCupid}
                  onChange={(e) => setIncludeCupid(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded-xs"
                />
                <span className="text-xs font-bold text-text">💘 {L('Amor', 'Cupid')}</span>
              </label>

              <div className="p-2.5 rounded-control bg-surface-2/60 border border-border text-xs text-text-secondary flex items-center justify-between">
                <span>🌾 {L('Dorfbewohner (Rest):', 'Villagers (remainder):')}</span>
                <span className="font-bold text-text">{villagerCount}</span>
              </div>
            </div>
          </Panel>

          {/* Option: Niemand scheidet aus */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary block">
              {L('Option: Niemand scheidet aus', 'Option: Nobody leaves the game')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedVariantId(null)}
                className={`p-3 rounded-card border text-left cursor-pointer transition-all ${
                  selectedVariantId === null
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-surface border-border hover:bg-surface-2 text-text'
                }`}
              >
                <p className="font-bold text-xs">{L('Klassisch', 'Classic')}</p>
                <p className="text-2xs text-text-tertiary">{L('Mit Ausscheiden', 'With elimination')}</p>
              </button>

              {WEREWOLF_VARIANTS.map((v) => (
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
            className={`${primaryBtn} w-full py-3 text-base flex items-center justify-center gap-2`}
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
          players={players}
          doneLabel={L('Verteilung abgeschlossen · Erzähler starten', 'Deal complete · Start narrator')}
          onDone={finishDealAndStartNarrator}
          renderCard={(playerIdx) => {
            const p = players[playerIdx];
            const role = assignments[p];
            const isWolf = role.id === 'werwolf';

            return (
              <div className="space-y-4 py-3 text-center w-full">
                <span className="text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20">
                  {p}
                </span>

                <div
                  className={`p-6 rounded-card border ${
                    isWolf
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-surface-2 border-border text-text'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    {role.name[language]}
                  </div>
                  <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                    {role.team === 'wolves' ? L('Team Werwölfe', 'Werewolf Team') : L('Team Dorf', 'Village Team')}
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
      {/* PHASE 3: VOLLWERTIGER ERZÄHLER-MODUS                                */}
      {/* =================================================================== */}
      {phase === 'narrator' && (
        <div className="space-y-6 text-left">
          {/* Phase Badge & Step Navigation */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 ${
                currentNarratorStep.phase === 'night'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : currentNarratorStep.phase === 'day'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-surface-2 text-text border border-border'
              }`}
            >
              {currentNarratorStep.phase === 'night' ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>{L('Nachtphase', 'Night phase')}</span>
                </>
              ) : currentNarratorStep.phase === 'day' ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>{L('Tagphase', 'Day phase')}</span>
                </>
              ) : (
                <span>{L('Vorbereitung', 'Setup')}</span>
              )}
            </span>

            <span className="text-xs font-bold text-text-tertiary tabular-nums">
              {narratorStepIdx + 1} / {activeNarratorSteps.length}
            </span>
          </div>

          {/* Main Narrator Script Card (Big typography for facilitator) */}
          <Panel className="p-6 sm:p-10 space-y-4 min-h-[220px] flex flex-col justify-center">
            <h3 className="text-base sm:text-lg font-bold text-accent uppercase tracking-wider">
              {currentNarratorStep.title[language]}
            </h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text leading-snug">
              „{currentNarratorStep.script[language]}“
            </p>
          </Panel>

          {/* Narrator Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={narratorStepIdx === 0}
              onClick={() => setNarratorStepIdx((i) => Math.max(0, i - 1))}
              className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{L('Vorheriger Schritt', 'Previous')}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setNarratorStepIdx((i) =>
                  i + 1 < activeNarratorSteps.length ? i + 1 : 0
                )
              }
              className={`${primaryBtn} px-6 py-2.5 min-h-[44px] flex items-center gap-1.5 text-sm sm:text-base`}
            >
              <span>
                {narratorStepIdx + 1 < activeNarratorSteps.length
                  ? L('Nächster Schritt', 'Next step')
                  : L('Neue Runde beginnen', 'Start new round')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Restart */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-3.5 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{L('Neues Spiel einrichten', 'Reset to setup')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
