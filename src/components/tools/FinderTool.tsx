import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, EnergyLevel } from '../../types';
import { GAMES_DATA } from '../../data/games';
import { useAdminData } from '../../context/AdminDataContext';
import { shuffle } from '../../utils/random';
import { filterGames, serializeGameFilters } from '../../utils/gameFilter';
import { gameMeta } from '../GameCard';
import { tr, Panel, Label, Stepper, ChoiceChips, primaryBtn } from './common';

export const FinderTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const adminData = useAdminData();
  const allGames = adminData.games.length > 0 ? adminData.games : GAMES_DATA;
  const [size, setSize] = useState(12);
  const [maxMin, setMaxMin] = useState<string | null>('20');
  const [energy, setEnergy] = useState<string | null>(null);
  const [noPrep, setNoPrep] = useState(true);
  const [round, setRound] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const filterState = useMemo(() => ({
    personen: size,
    dauer: maxMin ? Number(maxMin) : null,
    energie: (energy as EnergyLevel) || null,
    material: noPrep ? ('ohne' as const) : null,
  }), [size, maxMin, energy, noPrep]);

  const matches = useMemo(
    () => filterGames(allGames, filterState, language),
    [allGames, filterState, language],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shown = useMemo(() => shuffle(matches).slice(0, 3), [matches, round]);

  const searchParams = useMemo(() => serializeGameFilters(filterState).toString(), [filterState]);

  return (
    <div className="space-y-6">
      {/* "So geht's" Expandable Help */}
      <div className="bg-surface-2 rounded-card border border-border p-4">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-text" />
            <span>{L('So geht’s: Schneller Spielfinder', 'How it works: Quick game finder')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Finde schnell das passende Spiel für deine Gruppe. Wähle Gruppengröße, Zeit und Energielevel, um maßgeschneiderte Vorschläge zu erhalten.',
              'Quickly find the right game for your group. Select group size, time, and energy level to get tailored suggestions.'
            )}
          </p>
        )}
      </div>

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
              { id: 'high', label: L('Lebhaft', 'Active') },
              { id: 'medium', label: L('Mittel', 'Medium') },
              { id: 'calm', label: L('Ruhig', 'Calm') },
            ]}
          />
        </div>
        <label className="flex items-center gap-2 text-sm min-h-[40px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={noPrep}
            onChange={(e) => setNoPrep(e.target.checked)}
            className="w-4 h-4 rounded text-accent focus:ring-accent"
          />
          {L('Ohne besonderes Material', 'No special materials')}
        </label>
      </Panel>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary tabular-nums font-medium">
          {L(`${matches.length} passende Spiele`, `${matches.length} matching games`)}
        </p>
        {matches.length > 0 && (
          <Link
            to={`/games?${searchParams}`}
            className="text-xs text-accent-text hover:underline font-semibold"
          >
            {L('In Spieleliste öffnen', 'Open in games list')} →
          </Link>
        )}
      </div>

      <ul className="space-y-3">
        {shown.map((g) => (
          <li key={g.id}>
            <Link
              to={`/games/${g.id}`}
              className="flex items-center gap-4 rounded-card bg-surface border border-border p-4 hover:bg-surface-2 transition-colors duration-150 shadow-xs"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text text-base">{g.title[language]}</p>
                {g.subtitle && (
                  <p className="text-xs text-text-secondary mt-0.5">{g.subtitle[language]}</p>
                )}
                <p className="text-xs text-text-tertiary mt-2 tabular-nums">
                  {gameMeta(g, language).join(' · ')}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-text-tertiary shrink-0" />
            </Link>
          </li>
        ))}
      </ul>

      {matches.length > 3 && (
        <button
          type="button"
          onClick={() => setRound(round + 1)}
          className={`${primaryBtn} w-full`}
        >
          <Shuffle className="w-4 h-4" />
          <span>{L('Andere Vorschläge', 'Other suggestions')}</span>
        </button>
      )}
    </div>
  );
};
