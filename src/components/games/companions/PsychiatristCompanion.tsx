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

interface PsychiatristCompanionProps {
  language: Language;
}

export const PsychiatristCompanion: React.FC<PsychiatristCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isConcealed, setIsConcealed] = useState(false);

  const filteredRules = useMemo(() => {
    if (difficultyFilter === 'all') return PSYCHIATRIST_RULES;
    const num = Number(difficultyFilter);
    return PSYCHIATRIST_RULES.filter((r) => r.difficulty === num);
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
    <div className="space-y-4 text-center max-w-xl mx-auto">
      {/* Top Toolbar: Dropdown Difficulty Selection · Conceal Button · Shuffle */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              aria-label={L('Schwierigkeitsgrad wählen', 'Choose difficulty level')}
              className="appearance-none pl-3 pr-8 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text cursor-pointer focus:border-accent focus:outline-hidden transition-colors"
            >
              <option value="all">{L('Alle Stufen', 'All levels')} ({PSYCHIATRIST_RULES.length})</option>
              <option value="1">{L('Stufe 1 (Einfach)', 'Level 1 (Easy)')}</option>
              <option value="2">{L('Stufe 2 (Mittel)', 'Level 2 (Medium)')}</option>
              <option value="3">{L('Stufe 3 (Knifflig)', 'Level 3 (Tricky)')}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-tertiary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-xs font-bold text-text-tertiary tabular-nums whitespace-nowrap">
            {index + 1} / {deck.length}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsConcealed(!isConcealed)}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
            title={L('Verbergen, wenn die Person den Raum betritt', 'Hide when person re-enters the room')}
          >
            {isConcealed ? <Eye className="w-3.5 h-3.5 text-accent" /> : <EyeOff className="w-3.5 h-3.5 text-text-tertiary" />}
            <span className="hidden sm:inline">{isConcealed ? L('Aufdecken', 'Show') : L('Verbergen', 'Conceal')}</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
            title={L('Zufällig mischen', 'Shuffle')}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{L('Mischen', 'Shuffle')}</span>
          </button>
        </div>
      </div>

      {/* Main Rule Card */}
      <Panel className="p-6 sm:p-10 min-h-[220px] flex flex-col justify-center items-center text-center space-y-3">
        {isConcealed ? (
          <div className="space-y-2 py-4">
            <EyeOff className="w-8 h-8 text-text-tertiary mx-auto opacity-60" />
            <h3 className="text-lg sm:text-xl font-bold text-text-secondary">
              {L('Regel ist verborgen', 'Rule is hidden')}
            </h3>
            <p className="text-2xs text-text-tertiary max-w-sm mx-auto">
              {L(
                'Der Psychiater ist jetzt im Raum. Tippe auf „Aufdecken“, wenn die Runde vorbei ist.',
                'The psychiatrist is in the room. Tap "Show" once the round is over.'
              )}
            </p>
          </div>
        ) : (
          <>
            <span className="text-2xs font-bold uppercase tracking-wider text-accent px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/20">
              {L('Geheime Gruppenregel', 'Secret group rule')} · {L('Stufe', 'Level')} {current?.difficulty}
            </span>

            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text tracking-tight max-w-lg leading-snug">
              „{current?.text[language]}“
            </div>

            <p className="text-2xs text-text-secondary pt-1 max-w-md">
              {L(
                'Alle im Raum merken sich diese Regel, danach verbergen und die Person hereinholen.',
                'Everyone memorizes this rule, then conceal it and call the psychiatrist in.'
              )}
            </p>
          </>
        )}
      </Panel>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto pt-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{L('Vorherige', 'Previous')}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`${primaryBtn} px-6 py-2.5 min-h-[44px] text-sm flex items-center gap-1.5`}
        >
          <span>{L('Nächste Regel', 'Next rule')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};