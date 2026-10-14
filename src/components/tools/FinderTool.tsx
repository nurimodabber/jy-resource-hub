import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { GAMES_DATA } from '../../data/games';
import { parseMinutes, shuffle } from '../../utils/random';
import { gameMeta } from '../GameCard';
import { tr, Panel, Label, Stepper, ChoiceChips, primaryBtn } from './common';

export const FinderTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [size, setSize] = useState(12);
  const [maxMin, setMaxMin] = useState<string | null>('20');
  const [energy, setEnergy] = useState<string | null>(null);
  const [noPrep, setNoPrep] = useState(true);
  const [round, setRound] = useState(0);

  const matches = useMemo(
    () =>
      GAMES_DATA.filter((g) => {
        if (size < g.groupSize.min || size > g.groupSize.max) return false;
        if (maxMin && parseMinutes(g.durationMinutes)[0] > Number(maxMin)) return false;
        if (energy && g.energyLevel !== energy) return false;
        if (noPrep && g.prepLevel === 'materials_needed') return false;
        return true;
      }),
    [size, maxMin, energy, noPrep],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shown = useMemo(() => shuffle(matches).slice(0, 3), [matches, round]);

  return (
    <div className="space-y-5">
      <Panel className="space-y-4">
        <div>
          <Label>{L('Wie viele seid ihr?', 'How many are you?')}</Label>
          <Stepper value={size} min={2} max={40} onChange={setSize} label={L('Gruppengröße', 'Group size')} />
        </div>
        <div>
          <Label>{L('Höchstens wie lang?', 'How long at most?')}</Label>
          <ChoiceChips
            value={maxMin}
            onChange={setMaxMin}
            allLabel={L('Egal', 'Any')}
            options={[
              { id: '10', label: '10 min' },
              { id: '20', label: '20 min' },
              { id: '30', label: '30 min' },
            ]}
          />
        </div>
        <div>
          <Label>{L('Energie', 'Energy')}</Label>
          <ChoiceChips
            value={energy}
            onChange={setEnergy}
            allLabel={L('Egal', 'Any')}
            options={[
              { id: 'high', label: L('Lebhaft', 'Lively') },
              { id: 'medium', label: L('Mittel', 'Medium') },
              { id: 'calm', label: L('Ruhig', 'Calm') },
            ]}
          />
        </div>
        <label className="flex items-center gap-2 text-sm min-h-[40px]">
          <input type="checkbox" checked={noPrep} onChange={(e) => setNoPrep(e.target.checked)} className="w-4 h-4" />
          {L('Ohne besonderes Material', 'No special materials')}
        </label>
      </Panel>

      <p className="text-sm text-text-secondary tabular-nums">{L(`${matches.length} passende Spiele`, `${matches.length} matching games`)}</p>

      <ul className="space-y-2">
        {shown.map((g) => (
          <li key={g.id}>
            <Link to={`/games/${g.id}`} className="flex items-center gap-3 border border-border rounded-xl bg-surface p-4 hover:bg-surface-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text">{g.title[language]}</p>
                <p className="text-sm text-text-secondary line-clamp-2">{g.summary[language]}</p>
                <p className="text-xs text-text-tertiary mt-1 tabular-nums">
                  {gameMeta(g, language).join(' · ')}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-tertiary shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      {matches.length > 3 && (
        <button type="button" onClick={() => setRound(round + 1)} className={`${primaryBtn} w-full`}>
          <Shuffle className="w-4 h-4" />
          {L('Andere Vorschläge', 'Other suggestions')}
        </button>
      )}
    </div>
  );
};
