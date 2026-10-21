import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Check,
  Tag,
} from 'lucide-react';
import { Language } from '../../../types';
import { WHO_AM_I_PACKS } from '../../../data/roleContent';
import { loadPresentNames } from '../../../utils/groupNames';
import { shuffle } from '../../../utils/random';
import { tr, primaryBtn } from '../../tools/common';
import { PassAround } from '../../tools/PassAround';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface WhoAmICompanionProps {
  language: Language;
}

type Phase = 'setup' | 'deal' | 'play';

export const WhoAmICompanion: React.FC<WhoAmICompanionProps> = ({ language }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<string[]>(() => loadPresentNames());
  const [packId, setPackId] = useState<string>(WHO_AM_I_PACKS[0]?.id || 'tiere');

  // Dealt words per player: map of player -> word
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [showSpoilers, setShowSpoilers] = useState(false);

  useWakeLock(phase !== 'setup');

  const selectedPack = WHO_AM_I_PACKS.find((p) => p.id === packId) || WHO_AM_I_PACKS[0];

  const startDealing = () => {
    if (players.length < 2) {
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
    players.forEach((p, idx) => {
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
        <div className="space-y-6 text-left">
          {/* Header Box */}
          <div className="p-4 rounded-card bg-surface-2 border border-border space-y-1">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{L('Wer bin ich? Assistent', 'Who am I? Assistant')}</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {L(
                'Jede Person erhält einen geheimen Begriff, den alle anderen sehen, nur sie selbst nicht. Per Ja/Nein-Fragen errät reihum jeder seine Identität.',
                'Each player receives a secret concept visible to everyone else except themselves. Ask yes/no questions to figure out who you are.'
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

          {/* Pack Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary block">
              {L('Themenpaket wählen', 'Choose Topic Pack')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {WHO_AM_I_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setPackId(pack.id)}
                  className={`p-3.5 rounded-card border text-left transition-all cursor-pointer ${
                    packId === pack.id
                      ? 'bg-accent/15 border-accent text-accent'
                      : 'bg-surface border-border hover:bg-surface-2 text-text'
                  }`}
                >
                  <p className="font-bold text-xs">{pack.name[language]}</p>
                  <div className="flex items-center gap-1 mt-1 text-2xs text-text-tertiary">
                    <span>{pack.entries.length} {L('Begriffe', 'terms')}</span>
                    <span>·</span>
                    <span>
                      {pack.difficulty === 1
                        ? L('Leicht', 'Easy')
                        : pack.difficulty === 2
                        ? L('Mittel', 'Medium')
                        : L('Schwer', 'Hard')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Dealing Button */}
          <button
            type="button"
            onClick={startDealing}
            className={`${primaryBtn} w-full py-3 text-base flex items-center justify-center gap-2`}
          >
            <Tag className="w-4 h-4" />
            <span>{L('Begriffe geheim austeilen (Handy weitergeben)', 'Deal terms secretly (Pass phone)')}</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: BEGRIFFE VERTEILEN (PASS-AROUND)                          */}
      {/* =================================================================== */}
      {phase === 'deal' && (
        <PassAround
          language={language}
          players={players}
          doneLabel={L('Alle Begriffe verteilt · Spiel starten', 'All terms dealt · Start game')}
          onDone={finishDealAndPlay}
          hiddenHint={(name) =>
            L(
              `Zeige diesen Bildschirm allen anderen im Raum – aber ${name} darf nicht hinschauen!`,
              `Show this screen to everyone in the room – but ${name} must not look!`
            )
          }
          renderCard={(playerIdx) => {
            const p = players[playerIdx];
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
        <div className="space-y-6 text-left">
          {/* Rules Reminder Card */}
          <div className="p-4 rounded-card bg-surface-2 border border-border space-y-2">
            <h3 className="text-sm font-bold text-text">
              {L('Regeln für die Fragerunde:', 'Rules for questioning:')}
            </h3>
            <ul className="text-xs text-text-secondary space-y-1.5 pl-4 list-disc">
              <li>
                {L(
                  'Reihum stellt jede Person eine Ja/Nein-Frage zu ihrer Identität (z. B. „Bin ich ein Tier?“, „Lebe ich im Wasser?“).',
                  'In turns, each player asks a Yes/No question about their identity (e.g. "Am I an animal?", "Do I live in water?").'
                )}
              </li>
              <li>
                {L(
                  'Bei „Ja“ darf die Person noch eine Frage stellen.',
                  'On "Yes", the player may ask one more question.'
                )}
              </li>
              <li>
                {L(
                  'Bei „Nein“ ist sofort die nächste Person im Kreis an der Reihe.',
                  'On "No", the turn passes immediately to the next person.'
                )}
              </li>
            </ul>
          </div>

          {/* Overview of assignments for Facilitator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text">
                  {L('Spielleiter-Übersicht', 'Facilitator Overview')}
                </h3>
                <p className="text-2xs text-text-tertiary">
                  {L('Tippe auf eine Person, wenn sie ihren Begriff erraten hat.', 'Tap a player once they guessed their term.')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSpoilers(!showSpoilers)}
                className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showSpoilers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSpoilers ? L('Verbergen', 'Hide') : L('Begriffe anzeigen', 'Show terms')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {players.map((p) => {
                const isDone = !!solved[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleSolved(p)}
                    className={`p-3.5 rounded-card border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-surface-2/40 border-border opacity-50 line-through text-text-tertiary'
                        : 'bg-surface border-border hover:bg-surface-2 text-text'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-text">{p}</p>
                      <p className="text-2xs text-accent font-semibold mt-0.5 truncate">
                        {showSpoilers ? assignments[p] : '••••••••'}
                      </p>
                    </div>
                    {isDone && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
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
