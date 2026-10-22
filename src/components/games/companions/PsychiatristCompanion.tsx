import React, { useState, useMemo, useEffect } from 'react';
import {
  Shuffle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Language } from '../../../types';
import { PSYCHIATRIST_RULES, RuleIdea } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn } from '../../tools/common';
import { useAdminData } from '../../../context/AdminDataContext';

interface PsychiatristCompanionProps {
  language: Language;
}

export const PsychiatristCompanion: React.FC<PsychiatristCompanionProps> = ({ language }) => {
  const L = tr(language);
  const adminData = useAdminData();
  const allRules = adminData.psychiatristRules.length > 0 ? adminData.psychiatristRules : PSYCHIATRIST_RULES;
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isConcealed, setIsConcealed] = useState(false);

  const filteredRules = useMemo(() => {
    if (difficultyFilter === 'all') return allRules;
    const num = Number(difficultyFilter);
    return allRules.filter((r) => r.difficulty === num);
  }, [allRules, difficultyFilter]);

  const [deck, setDeck] = useState<RuleIdea[]>(() => shuffle(allRules));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDeck(shuffle(filteredRules));
    setIndex(0);
    setIsConcealed(false);
  }, [filteredRules]);

  const current = deck[index] || deck[0];

  const handleNext = () => {
    setIsConcealed(false);
    if (index + 1 < deck.length) {
      setIndex(index + 1);
    } else {
      setDeck(shuffle(filteredRules));
      setIndex(0);
    }
  };

  const handlePrev = () => {
    setIsConcealed(false);
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleShuffle = () => {
    setIsConcealed(false);
    setDeck(shuffle(filteredRules));
    setIndex(0);
  };

  return (
    <div className="space-y-4 text-left w-full max-w-2xl">
      {/* Top Toolbar: Symmetrical single-row controls with Shuffle on the far right */}
      <div className="flex items-center justify-between gap-2.5 w-full flex-nowrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              aria-label={L('Schwierigkeitsgrad wählen', 'Choose difficulty level')}
              className="appearance-none pl-3.5 pr-8 h-10 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text cursor-pointer focus:border-accent focus:outline-hidden transition-colors"
            >
              <option value="all">{L('Alle Stufen', 'All levels')} ({PSYCHIATRIST_RULES.length})</option>
              <option value="1">{L('Stufe 1 (Einfach)', 'Level 1 (Easy)')}</option>
              <option value="2">{L('Stufe 2 (Mittel)', 'Level 2 (Medium)')}</option>
              <option value="3">{L('Stufe 3 (Knifflig)', 'Level 3 (Tricky)')}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-tertiary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-xs font-bold text-text-tertiary tabular-nums whitespace-nowrap px-2.5 py-1 rounded-full bg-surface-2 border border-border/60">
            {index + 1} / {deck.length}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => setIsConcealed(!isConcealed)}
            className="h-10 px-3.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-95"
            title={L('Verbergen, wenn die Person den Raum betritt', 'Hide when person enters the room')}
          >
            {isConcealed ? <Eye className="w-4 h-4 text-accent shrink-0" /> : <EyeOff className="w-4 h-4 text-text-secondary shrink-0" />}
            <span className="hidden sm:inline">{isConcealed ? L('Aufdecken', 'Show') : L('Verbergen', 'Conceal')}</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="w-10 h-10 rounded-control bg-surface-2 hover:bg-surface-raised border border-border flex items-center justify-center text-text-secondary hover:text-text transition-colors cursor-pointer shrink-0 active:scale-95"
            title={L('Zufällig mischen', 'Shuffle')}
            aria-label={L('Zufällig mischen', 'Shuffle')}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Rule Card: Left-aligned, generous typography */}
      <Panel className="p-6 sm:p-8 space-y-4 text-left">
        {isConcealed ? (
          <div className="space-y-2 py-4 text-center">
            <EyeOff className="w-8 h-8 text-text-tertiary mx-auto opacity-60" />
            <h3 className="text-lg sm:text-xl font-bold text-text-secondary">
              {L('Regel ist verborgen', 'Rule is hidden')}
            </h3>
            <p className="text-xs text-text-tertiary max-w-sm mx-auto">
              {L(
                'Der Psychiater ist jetzt im Raum. Tippe auf „Aufdecken“, wenn die Runde vorbei ist.',
                'The psychiatrist is in the room. Tap "Show" once the round is over.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20 inline-block">
              {L('Geheime Gruppenregel', 'Secret group rule')} · {L('Stufe', 'Level')} {current?.difficulty}
            </span>

            <div className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight leading-snug break-words">
              „{current?.text[language]}“
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {L(
                'Alle im Raum merken sich diese Regel, danach verbergen und die Person hereinholen.',
                'Everyone memorizes this rule, then conceal it and call the psychiatrist in.'
              )}
            </p>
          </div>
        )}
      </Panel>

      {/* Controls: Full-width symmetrical controls */}
      <div className="flex items-center justify-between gap-3 w-full">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="px-4 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{L('Vorherige', 'Previous')}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`${primaryBtn} px-6 py-2.5 min-h-[44px] text-sm flex items-center gap-2 shadow-sm`}
        >
          <span>{L('Nächste Regel', 'Next rule')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
