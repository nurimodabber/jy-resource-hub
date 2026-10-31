import React, { useState } from 'react';
import {
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RotateCcw,
  Eye,
  EyeOff,
  Crown,
  Info,
  X,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Language } from '../../../types';
import {
  WEREWOLF_ROLES,
  WEREWOLF_NARRATOR,
  WerewolfRole,
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

interface WerewolfCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'narrator';

export const WerewolfCompanion: React.FC<WerewolfCompanionProps> = ({ language }) => {
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

  // Standard roles
  const [wolvesCount, setWolvesCount] = useState(2);
  const [includeSeer, setIncludeSeer] = useState(true);
  const [includeWitch, setIncludeWitch] = useState(true);
  const [includeHunter, setIncludeHunter] = useState(false);
  const [includeProtector, setIncludeProtector] = useState(false);
  const [includeCupid, setIncludeCupid] = useState(false);

  // Extended classic roles
  const [showExtendedRoles, setShowExtendedRoles] = useState(false);
  const [includeGirl, setIncludeGirl] = useState(false);
  const [includeUrwolf, setIncludeUrwolf] = useState(false);
  const [includeWhiteWolf, setIncludeWhiteWolf] = useState(false);
  const [includeThief, setIncludeThief] = useState(false);
  const [includePiper, setIncludePiper] = useState(false);

  // Dealt roles map: player -> WerewolfRole
  const [assignments, setAssignments] = useState<Record<string, WerewolfRole>>({});

  // Narrator step
  const [narratorStepIdx, setNarratorStepIdx] = useState(0);

  // Facilitator Master View & Mayor
  const [showRoleMaster, setShowRoleMaster] = useState(false);
  const [mayorName, setMayorName] = useState<string | null>(null);

  // Active Rule Info Modal
  const [infoRole, setInfoRole] = useState<WerewolfRole | null>(null);

  useWakeLock(phase !== 'setup');

  // Calculate roles tally
  const activeExtendedCount =
    (includeGirl ? 1 : 0) +
    (includeUrwolf ? 1 : 0) +
    (includeWhiteWolf ? 1 : 0) +
    (includeThief ? 1 : 0) +
    (includePiper ? 1 : 0);

  const specialCount =
    wolvesCount +
    (includeSeer ? 1 : 0) +
    (includeWitch ? 1 : 0) +
    (includeHunter ? 1 : 0) +
    (includeProtector ? 1 : 0) +
    (includeCupid ? 1 : 0) +
    activeExtendedCount;

  const villagerCount = Math.max(0, playerNames.length - specialCount);
  const isOverAllocated = specialCount > playerNames.length;

  const startDealing = () => {
    if (playerNames.length < 5) {
      alert(
        L(
          'Werwölfe benötigt mindestens 5 Personen.',
          'Werewolf requires at least 5 players.'
        )
      );
      return;
    }
    if (isOverAllocated) {
      alert(
        L(
          'Es sind mehr Sonderrollen ausgewählt als Spielende mitspielen. Bitte passe die Rollenauswahl an.',
          'More special roles are selected than available players. Please adjust the roles.'
        )
      );
      return;
    }

    const deck: WerewolfRole[] = [];
    const getRole = (id: string) => WEREWOLF_ROLES.find((r) => r.id === id)!;

    const wolfRole = getRole('werwolf');
    const villagerRole = getRole('dorfbewohner');

    // Standard
    for (let i = 0; i < wolvesCount; i++) deck.push(wolfRole);
    if (includeSeer) deck.push(getRole('seherin'));
    if (includeWitch) deck.push(getRole('hexe'));
    if (includeHunter) deck.push(getRole('jaeger'));
    if (includeProtector) deck.push(getRole('beschuetzer'));
    if (includeCupid) deck.push(getRole('amor'));

    // Extended
    if (includeGirl) deck.push(getRole('maedchen'));
    if (includeUrwolf) deck.push(getRole('urwolf'));
    if (includeWhiteWolf) deck.push(getRole('weisser-werwolf'));
    if (includeThief) deck.push(getRole('dieb'));
    if (includePiper) deck.push(getRole('floetenspieler'));

    // Fill remainder with villagers
    while (deck.length < playerNames.length) {
      deck.push(villagerRole);
    }

    const shuffledDeck = shuffle(deck);
    const map: Record<string, WerewolfRole> = {};
    playerNames.forEach((p, idx) => {
      map[p] = shuffledDeck[idx] || villagerRole;
    });

    setAssignments(map);
    setMayorName(null);
    setShowRoleMaster(false);
    setPhase('deal');
  };

  const finishDealAndStartNarrator = () => {
    setNarratorStepIdx(0);
    setPhase('narrator');
  };

  // Filter narrator steps to only include active roles in game
  const activeNarratorSteps = WEREWOLF_NARRATOR.filter((step) => {
    if (step.id.includes('dieb') && !includeThief) return false;
    if (step.id.includes('amor') && !includeCupid) return false;
    if (step.id.includes('beschuetzer') && !includeProtector) return false;
    if (step.id.includes('seherin') && !includeSeer) return false;
    if (step.id.includes('urwolf') && !includeUrwolf) return false;
    if (step.id.includes('weisser-werwolf') && !includeWhiteWolf) return false;
    if (step.id.includes('hexe') && !includeWitch) return false;
    if (step.id.includes('floetenspieler') && !includePiper) return false;
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
        <div className="space-y-5 text-left w-full max-w-2xl pb-16 md:pb-0">
          {/* 1. Spielende & Namen */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <PlayerSetupSection
              language={language}
              playerCount={playerCount}
              playerNames={playerNames}
              minPlayers={5}
              maxPlayers={25}
              onCountChange={setPlayerCount}
              onRename={handleRename}
              onResetToGroup={handleResetToGroup}
              hasGroupNames={hasGroupNames}
              countLabel={L('Spielende', 'Players')}
              countSubtitle={L('Gesamtzahl der Personen im Kreis (mind. 5)', 'Total people in the circle (min. 5)')}
            />
          </Panel>

          {/* 2. Rollen-Konfiguration */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                {L('Rollen im Spiel', 'Roles in game')}
              </h3>
              <span className="text-2xs font-semibold text-text-tertiary">
                {specialCount} / {playerNames.length} {L('belegt', 'assigned')}
              </span>
            </div>

            {/* Werwölfe Count */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-bold text-xs text-text">{L('Werwölfe', 'Werewolves')}</p>
                <p className="text-2xs text-text-tertiary">
                  {L('Erwachen nachts und wählen lautlos ein Opfer', 'Wake at night to choose a victim')}
                </p>
              </div>
              <div className="w-36 shrink-0 flex justify-end">
                <Stepper
                  value={wolvesCount}
                  min={1}
                  max={Math.max(1, Math.floor(playerNames.length / 2))}
                  onChange={setWolvesCount}
                  label={L('Anzahl Werwölfe', 'Number of werewolves')}
                />
              </div>
            </div>

            {/* Standard Special Roles in clean responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                {
                  id: 'seherin',
                  role: WEREWOLF_ROLES.find((r) => r.id === 'seherin')!,
                  checked: includeSeer,
                  set: setIncludeSeer,
                },
                {
                  id: 'hexe',
                  role: WEREWOLF_ROLES.find((r) => r.id === 'hexe')!,
                  checked: includeWitch,
                  set: setIncludeWitch,
                },
                {
                  id: 'jaeger',
                  role: WEREWOLF_ROLES.find((r) => r.id === 'jaeger')!,
                  checked: includeHunter,
                  set: setIncludeHunter,
                },
                {
                  id: 'beschuetzer',
                  role: WEREWOLF_ROLES.find((r) => r.id === 'beschuetzer')!,
                  checked: includeProtector,
                  set: setIncludeProtector,
                },
                {
                  id: 'amor',
                  role: WEREWOLF_ROLES.find((r) => r.id === 'amor')!,
                  checked: includeCupid,
                  set: setIncludeCupid,
                },
              ].map(({ id, role, checked, set }) => (
                <div
                  key={id}
                  onClick={() => set(!checked)}
                  className={`flex items-center justify-between gap-2.5 p-2.5 rounded-control border transition-all cursor-pointer select-none active:scale-[0.99] ${
                    checked
                      ? 'bg-accent/10 border-accent/40 text-text ring-1 ring-accent/20'
                      : 'bg-surface border-border hover:bg-surface-2 text-text'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-text truncate">{role.name[language]}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoRole(role);
                        }}
                        className="text-text-tertiary hover:text-accent p-0.5 cursor-pointer shrink-0"
                        title={L('Rollenregeln anzeigen', 'Show role rules')}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-2xs text-text-tertiary truncate">
                      {role.description[language]}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <ToggleSwitch
                      checked={checked}
                      onChange={set}
                      label={role.name[language]}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Extended Roles Collapsible */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowExtendedRoles(!showExtendedRoles)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>{L('Weitere klassische Rollen', 'Additional classic roles')}</span>
                  {activeExtendedCount > 0 && (
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-accent text-accent-contrast font-semibold">
                      {activeExtendedCount} {L('aktiv', 'active')}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                    showExtendedRoles ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showExtendedRoles && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5">
                  {[
                    {
                      id: 'maedchen',
                      role: WEREWOLF_ROLES.find((r) => r.id === 'maedchen')!,
                      checked: includeGirl,
                      set: setIncludeGirl,
                    },
                    {
                      id: 'urwolf',
                      role: WEREWOLF_ROLES.find((r) => r.id === 'urwolf')!,
                      checked: includeUrwolf,
                      set: setIncludeUrwolf,
                    },
                    {
                      id: 'weisser-werwolf',
                      role: WEREWOLF_ROLES.find((r) => r.id === 'weisser-werwolf')!,
                      checked: includeWhiteWolf,
                      set: setIncludeWhiteWolf,
                    },
                    {
                      id: 'dieb',
                      role: WEREWOLF_ROLES.find((r) => r.id === 'dieb')!,
                      checked: includeThief,
                      set: setIncludeThief,
                    },
                    {
                      id: 'floetenspieler',
                      role: WEREWOLF_ROLES.find((r) => r.id === 'floetenspieler')!,
                      checked: includePiper,
                      set: setIncludePiper,
                    },
                  ].map(({ id, role, checked, set }) => (
                    <div
                      key={id}
                      onClick={() => set(!checked)}
                      className={`flex items-center justify-between gap-2.5 p-2.5 rounded-control border transition-all cursor-pointer select-none active:scale-[0.99] ${
                        checked
                          ? 'bg-accent/10 border-accent/40 text-text ring-1 ring-accent/20'
                          : 'bg-surface border-border hover:bg-surface-2 text-text'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-text truncate">{role.name[language]}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInfoRole(role);
                            }}
                            className="text-text-tertiary hover:text-accent p-0.5 cursor-pointer shrink-0"
                            title={L('Rollenregeln anzeigen', 'Show role rules')}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-2xs text-text-tertiary truncate">
                          {role.description[language]}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <ToggleSwitch
                          checked={checked}
                          onChange={set}
                          label={role.name[language]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Villager Remainder Summary & Overflow Alert */}
            <div className="pt-2">
              {isOverAllocated ? (
                <div className="p-3 rounded-control bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {L(
                      `Zu viele Rollen (${specialCount}) für ${playerNames.length} Spielende ausgewählt.`,
                      `Too many roles (${specialCount}) selected for ${playerNames.length} players.`
                    )}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-control bg-surface-2 border border-border flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-medium">
                    {L('Dorfbewohner (automatisch aufgefüllt):', 'Villagers (automatically filled):')}
                  </span>
                  <span className="font-bold text-text tabular-nums text-sm">
                    {villagerCount}
                  </span>
                </div>
              )}
            </div>
          </Panel>

          {/* Start Dealing (sticky on mobile for instant thumb access, inline on desktop) */}
          <div className="sticky md:static bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-auto z-30 pt-2 pb-2 md:p-0">
            <button
              type="button"
              disabled={isOverAllocated}
              onClick={startDealing}
              className={`${primaryBtn} w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-lg md:shadow-none`}
            >
              <Eye className="w-4 h-4" />
              <span>{L('Rollen geheim verteilen', 'Deal roles secretly')}</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: GEHEIME ROLLENVERTEILUNG (PASS-AROUND)                    */}
      {/* =================================================================== */}
      {phase === 'deal' && (
        <PassAround
          language={language}
          players={playerNames}
          doneLabel={L('Verteilung abgeschlossen · Erzähler starten', 'Deal complete · Start narrator')}
          onDone={finishDealAndStartNarrator}
          renderCard={(playerIdx) => {
            const p = playerNames[playerIdx];
            const role = assignments[p];
            const isWolf = role.team === 'wolves';

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
                    {role.team === 'wolves'
                      ? L('Team Werwölfe', 'Werewolf Team')
                      : role.team === 'neutral'
                      ? L('Neutral / Eigenes Ziel', 'Neutral Team')
                      : L('Team Dorf', 'Village Team')}
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
        <div className="space-y-6 text-left w-full max-w-2xl">
          {/* Top Bar: Phase Badge & Step Counter & Mayor & Master Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
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

            <div className="flex items-center gap-2">
              {/* Mayor Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={mayorName || ''}
                  onChange={(e) => setMayorName(e.target.value || null)}
                  className="px-3 py-1.5 rounded-full liquid-pill-secondary text-2xs font-bold text-text cursor-pointer focus:outline-hidden"
                >
                  <option value="">{L('Bürgermeister wählen...', 'Select Mayor...')}</option>
                  {playerNames.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Master Overview Toggle */}
              <button
                type="button"
                onClick={() => setShowRoleMaster(!showRoleMaster)}
                className="px-3 py-1.5 rounded-full liquid-pill-secondary text-2xs font-bold text-text flex items-center gap-1 cursor-pointer"
                title={L('Rollenübersicht ein-/ausblenden', 'Toggle roles master view')}
              >
                {showRoleMaster ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showRoleMaster ? L('Verbergen', 'Hide') : L('Spielleiter-Liste', 'Master')}</span>
              </button>

              <span className="text-xs font-bold text-text-tertiary tabular-nums pl-1">
                {narratorStepIdx + 1} / {activeNarratorSteps.length}
              </span>
            </div>
          </div>

          {/* Facilitator Master List */}
          {showRoleMaster && (
            <div className="p-4 rounded-card bg-surface-2 border border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold uppercase tracking-wider text-accent">
                  {L('Geheime Spielleiter-Übersicht:', 'Secret Roles Master View:')}
                </span>
                <span className="text-2xs text-text-tertiary">
                  {L('Nur für deine Augen', 'Facilitator only')}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {playerNames.map((p) => {
                  const role = assignments[p];
                  const isMayor = mayorName === p;
                  return (
                    <div
                      key={p}
                      className="p-2 rounded-control bg-surface border border-border flex items-center justify-between text-2xs"
                    >
                      <div className="min-w-0 pr-1">
                        <p className="font-bold text-text truncate flex items-center gap-1">
                          {isMayor && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                          <span>{p}</span>
                        </p>
                      </div>
                      <span
                        className={`font-semibold shrink-0 ${
                          role?.team === 'wolves'
                            ? 'text-red-400'
                            : role?.team === 'neutral'
                            ? 'text-amber-400'
                            : 'text-accent'
                        }`}
                      >
                        {role?.name[language]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Narrator Script Card */}
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

      {/* Role Rule Info Modal */}
      {infoRole && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-sm glass-surface-panel rounded-dialog shadow-2 border border-border p-5 space-y-4 text-left outline-hidden">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-text">{infoRole.name[language]}</h4>
                <span className="text-2xs font-semibold uppercase text-accent">
                  {infoRole.team === 'wolves'
                    ? L('Team Werwölfe', 'Werewolves')
                    : infoRole.team === 'neutral'
                    ? L('Neutral / Eigenes Ziel', 'Neutral')
                    : L('Team Dorf', 'Village')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInfoRole(null)}
                className="p-1 rounded-control hover:bg-surface-2 text-text-tertiary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {infoRole.description[language]}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoRole(null)}
                className="px-4 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised text-xs font-semibold text-text border border-border cursor-pointer"
              >
                {L('Verstanden', 'Got it')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
