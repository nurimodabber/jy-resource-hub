import React, { useState, useMemo, useEffect } from 'react';
import {
  Shuffle,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Language } from '../../../types';
import { PSYCHIATRIST_RULES, RuleIdea } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import { tr, Panel, primaryBtn, chipCls } from '../../tools/common';

interface PsychiatristCompanionProps {
  language: Language;
}

export const PsychiatristCompanion: React.FC<PsychiatristCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [isConcealed, setIsConcealed] = useState(false);

  const filteredRules = useMemo(() => {
    if (!difficultyFilter) return PSYCHIATRIST_RULES;
    return PSYCHIATRIST_RULES.filter((r) => r.difficulty === difficultyFilter);
  }, [difficultyFilter]);

  const [deck, setDeck] = useState<RuleIdea[]>(() => shuffle(PSYCHIATRIST_RULES));
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
    <div className="space-y-6 text-center">
      {/* Difficulty Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setDifficultyFilter(null)}
          className={chipCls(difficultyFilter === null)}
        >
          {L('Alle Stufen', 'All levels')}
        </button>
        <button
          type="button"
          onClick={() => setDifficultyFilter(1)}
          className={chipCls(difficultyFilter === 1)}
        >
          {L('Stufe 1 (Einfach)', 'Level 1 (Easy)')}
        </button>
        <button
          type="button"
          onClick={() => setDifficultyFilter(2)}
          className={chipCls(difficultyFilter === 2)}
        >
          {L('Stufe 2 (Mittel)', 'Level 2 (Medium)')}
        </button>
        <button
          type="button"
          onClick={() => setDifficultyFilter(3)}
          className={chipCls(difficultyFilter === 3)}
        >
          {L('Stufe 3 (Knifflig)', 'Level 3 (Tricky)')}
        </button>
      </div>

      {/* Header index & Conceal button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="text-accent mr-2">
            • {L('Stufe', 'Level')} {current?.difficulty}
          </span>
          {index + 1} / {deck.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsConcealed(!isConcealed)}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            title={L('Verbergen, wenn die Person den Raum betritt', 'Hide when person re-enters the room')}
          >
            {isConcealed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isConcealed ? L('Aufdecken', 'Show') : L('Regel verbergen', 'Conceal rule')}</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{L('Mischen', 'Shuffle')}</span>
          </button>
        </div>
      </div>

      {/* Main Rule Card */}
      <Panel className="p-8 sm:p-14 min-h-[240px] flex flex-col justify-center items-center text-center space-y-4">
        {isConcealed ? (
          <div className="space-y-3 py-4">
            <EyeOff className="w-8 h-8 text-text-tertiary mx-auto" />
            <h3 className="text-xl sm:text-2xl font-bold text-text-secondary">
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
          <>
            <span className="text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20">
              {L('Geheime Gruppenregel', 'Secret group rule')}
            </span>

            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight max-w-xl leading-snug">
              „{current?.text[language]}“
            </div>

            <p className="text-xs text-text-secondary pt-2 max-w-md">
              {L(
                'Alle im Raum merken sich diese Regel. Wenn alle sie verstanden haben, verberge die Regel und hole die Person herein.',
                'Everyone in the room memorizes this rule. Once understood, conceal the rule and call the person back in.'
              )}
            </p>
          </>
        )}
      </Panel>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{L('Vorherige', 'Previous')}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`${primaryBtn} px-6 py-2.5 min-h-[44px] text-sm sm:text-base flex items-center gap-1.5`}
        >
          <span>{L('Nächste Regel', 'Next rule')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
