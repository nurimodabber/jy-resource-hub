import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Tag,
} from 'lucide-react';
import { Language } from '../../../types';
import { WHO_AM_I_PACKS } from '../../../data/roleContent';
import { useAdminData } from '../../../context/AdminDataContext';
import { shuffle } from '../../../utils/random';
import {
  tr,
  Panel,
  primaryBtn,
  PlayerSetupSection,
  usePlayerList,
} from '../../tools/common';
import { PassAround } from '../../tools/PassAround';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface WhoAmICompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'play';

export const WhoAmICompanion: React.FC<WhoAmICompanionProps> = ({ language }) => {
  const L = tr(language);
  const adminData = useAdminData();
  const allPacks = adminData.whoAmIPacks.length > 0 ? adminData.whoAmIPacks : WHO_AM_I_PACKS;
  const [phase, setPhase] = useState<Phase>('setup');

  const {
    playerCount,
    setPlayerCount,
    playerNames,
    handleRename,
    handleResetToGroup,
    hasGroupNames,
  } = usePlayerList(6, language, 2);

  const [packId, setPackId] = useState<string>(allPacks[0]?.id || 'popkultur');

  // Dealt words per player: map of player -> word
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [showSpoilers, setShowSpoilers] = useState(false);

  useWakeLock(phase !== 'setup');

  const selectedPack = allPacks.find((p) => p.id === packId) || allPacks[0];

  const startDealing = () => {
    if (playerNames.length < 2) {
      alert(
        L(
          'Bitte mindestens 2 Personen in der Gruppe haben, um Wer bin ich zu spielen.',
          'Please have at least 2 players to play Who am I.'
        )
      );
      return;
    }

    const shuffledEntries = shuffle(selectedPack.entries).map((e) => e[language]);
    const map: Record<string, string> = {};
    playerNames.forEach((p, idx) => {
      map[p] = shuffledEntries[idx % shuffledEntries.length];
    });

    setAssignments(map);
    setSolved({});
    setShowSpoilers(false);
    setPhase('deal');
  };

  const finishDealAndPlay = () => {
    setPhase('play');
  };

  const toggleSolved = (player: string) => {
    setSolved((prev) => ({ ...prev, [player]: !prev[player] }));
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* PHASE 1: SETUP & PACK-AUSWAHL                                       */}
      {/* =================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-5 text-left w-full max-w-2xl">
          {/* Player Count & Names */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <PlayerSetupSection
              language={language}
              playerCount={playerCount}
              playerNames={playerNames}
              minPlayers={2}
              maxPlayers={25}
              onCountChange={setPlayerCount}
              onRename={handleRename}
              onResetToGroup={handleResetToGroup}
              hasGroupNames={hasGroupNames}
              countLabel={L('Spielende', 'Players')}
              countSubtitle={L('Gesamtzahl der Personen in der Runde', 'Total number of players in this round')}
            />
          </Panel>

          {/* Pack Selection Grouped by Difficulty */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text uppercase tracking-wider block">
                {L('Themenpaket wählen', 'Choose Topic Pack')}
              </label>
              <span className="text-2xs text-text-tertiary">
                {selectedPack.name[language]} ({selectedPack.entries.length})
              </span>
            </div>

            {/* Level 1: Leicht */}
            <div className="space-y-1.5">
              <span className="text-2xs font-bold uppercase tracking-wider text-accent block px-0.5">
                {L('Stufe 1: Leicht & Bekannt', 'Level 1: Easy & Familiar')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allPacks.filter((p) => p.difficulty === 1).map((pack) => {
                  const isSelected = packId === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setPackId(pack.id)}
                      className={`p-2.5 rounded-control border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] active:scale-[0.98] ${
                        isSelected
                          ? 'bg-accent/15 border-accent text-accent font-bold ring-1 ring-accent/30'
                          : 'bg-surface border-border hover:bg-surface-2 text-text'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight truncate">{pack.name[language]}</p>
                      <span className="text-2xs opacity-70 mt-1">
                        {pack.entries.length} {L('Begriffe', 'terms')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 2: Mittel & Herausfordernd */}
            <div className="space-y-1.5 pt-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary block px-0.5">
                {L('Stufe 2: Knifflig & Inspirierend', 'Level 2: Challenging & Thoughtful')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allPacks.filter((p) => p.difficulty >= 2).map((pack) => {
                  const isSelected = packId === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setPackId(pack.id)}
                      className={`p-2.5 rounded-control border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] active:scale-[0.98] ${
                        isSelected
                          ? 'bg-accent/15 border-accent text-accent font-bold ring-1 ring-accent/30'
                          : 'bg-surface border-border hover:bg-surface-2 text-text'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight truncate">{pack.name[language]}</p>
                      <span className="text-2xs opacity-70 mt-1">
                        {pack.entries.length} {L('Begriffe', 'terms')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Start Dealing Button */}
          <button
            type="button"
            onClick={startDealing}
            className={`${primaryBtn} w-full py-3.5 text-base flex items-center justify-center gap-2`}
          >
            <Tag className="w-4 h-4" />
            <span>{L('Begriffe geheim austeilen', 'Deal terms secretly')}</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: BEGRIFFE VERTEILEN (PASS-AROUND)                          */}
      {/* =================================================================== */}
      {phase === 'deal' && (
        <PassAround
          language={language}
          players={playerNames}
          doneLabel={L('Alle Begriffe verteilt · Spiel starten', 'All terms dealt · Start game')}
          onDone={finishDealAndPlay}
          hiddenHint={(name) =>
            L(
              `Zeige diesen Bildschirm allen anderen im Raum – aber ${name} darf nicht hinschauen!`,
              `Show this screen to everyone in the room – but ${name} must not look!`
            )
          }
          renderCard={(playerIdx) => {
            const p = playerNames[playerIdx];
            const word = assignments[p];

            return (
              <div className="space-y-4 py-4 text-center w-full">
                <span className="text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20">
                  {L('Begriff für', 'Term for')} {p}
                </span>

                <div className="p-6 rounded-card bg-surface-2 border border-border">
                  <div className="text-3xl sm:text-4xl font-black text-text tracking-tight">
                    „{word}“
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {L(
                    `Alle außer ${p} lesen den Begriff. Wer Post-its hat, klebt den Begriff auf die Stirn von ${p}!`,
                    `Everyone except ${p} reads the word. If you have sticky notes, stick it onto ${p}'s forehead!`
                  )}
                </p>
              </div>
            );
          }}
        />
      )}

      {/* =================================================================== */}
      {/* PHASE 3: SPIELPHASE & SPICKZETTEL                                   */}
      {/* =================================================================== */}
      {phase === 'play' && (
        <div className="space-y-6 text-left w-full max-w-2xl">
          {/* Rules Reminder Card */}
          <Panel className="p-4 sm:p-5 space-y-2">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              {L('Regeln & Ablauf:', 'Rules & Flow:')}
            </h4>
            <ul className="text-xs text-text-secondary space-y-1.5 pl-4 list-disc">
              <li>
                {L(
                  'Reihum stellt jede Person genau eine Frage, die die Gruppe mit „Ja“ oder „Nein“ beantworten kann.',
                  'In turns, each player asks one question that the group can answer with "Yes" or "No".'
                )}
              </li>
              <li>
                {L(
                  'Bei „Ja“ darf dieselbe Person eine weitere Frage stellen.',
                  'On "Yes", that player may ask another question.'
                )}
              </li>
              <li>
                {L(
                  'Bei „Nein“ ist die nächste Person im Uhrzeigersinn an der Reihe.',
                  'On "No", the turn passes to the next person clockwise.'
                )}
              </li>
            </ul>
          </Panel>

          {/* Facilitator Spoilers Toggle & Status List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                {L('Übersicht & Fortschritt', 'Overview & Progress')}
              </span>
              <button
                type="button"
                onClick={() => setShowSpoilers(!showSpoilers)}
                className="px-2.5 py-1 rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showSpoilers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSpoilers ? L('Begriffe verbergen', 'Hide terms') : L('Spielleiter-Lösung anzeigen', 'Show solutions')}</span>
              </button>
            </div>

            {/* List of Players and Solved state */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {playerNames.map((p) => {
                const isSolved = !!solved[p];
                const word = assignments[p];

                return (
                  <div
                    key={p}
                    onClick={() => toggleSolved(p)}
                    className={`p-3.5 rounded-card border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSolved
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-surface border-border hover:bg-surface-2'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold text-sm ${isSolved ? 'line-through text-text-tertiary' : 'text-text'}`}>
                        {p}
                      </p>
                      {showSpoilers && (
                        <p className="text-xs text-accent font-semibold truncate mt-0.5">
                          „{word}“
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label={L('Als erraten markieren', 'Mark as solved')}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                        isSolved
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-border bg-surface-2 text-text-tertiary hover:border-accent hover:text-accent'
                      }`}
                    >
                      {isSolved && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

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
