import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface GameCardProps {
  game: Game;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  userGroupSize?: number | null;
}

export const gameMeta = (game: Game, language: Language) => {
  const t = UI_TRANSLATIONS[language];
  const energy =
    game.energyLevel === 'high'
      ? t.filterHighEnergy
      : game.energyLevel === 'medium'
      ? t.filterMediumEnergy
      : t.filterCalmEnergy;
  return [`${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`, game.durationMinutes, energy];
};

export const GameCard: React.FC<GameCardProps> = ({
  game,
  language,
  isFavorite,
  onToggleFavorite,
  userGroupSize,
}) => {
  const t = UI_TRANSLATIONS[language];
  const subtitle = game.subtitle ? game.subtitle[language] : (game.summary ? game.summary[language] : '');
  const energyLabel =
    game.energyLevel === 'high'
      ? t.filterHighEnergy
      : game.energyLevel === 'medium'
      ? t.filterMediumEnergy
      : t.filterCalmEnergy;

  const energyBarColor =
    game.energyLevel === 'high'
      ? 'bg-e-lebhaft'
      : game.energyLevel === 'medium'
      ? 'bg-e-mittel'
      : 'bg-e-ruhig';

  const energyTextColor =
    game.energyLevel === 'high'
      ? 'text-e-lebhaft'
      : game.energyLevel === 'medium'
      ? 'text-e-mittel'
      : 'text-e-ruhig';

  const purposeLabel =
    game.purpose === 'kennenlernen'
      ? t.purposeKennenlernen
      : game.purpose === 'energie'
      ? t.purposeEnergie
      : game.purpose === 'zusammenarbeit'
      ? t.purposeZusammenarbeit
      : game.purpose === 'ruhe'
      ? t.purposeRuhe
      : t.purposeRaten;

  // Scale 2 to 40 persons (range 38)
  const minPos = Math.max(0, Math.min(100, ((game.groupSize.min - 2) / 38) * 100));
  const maxPos = Math.max(0, Math.min(100, ((game.groupSize.max - 2) / 38) * 100));
  const barWidth = Math.max(6, maxPos - minPos);

  const hasGroup = typeof userGroupSize === 'number' && userGroupSize >= 2 && userGroupSize <= 40;
  const matchesGroup = !hasGroup || (userGroupSize >= game.groupSize.min && userGroupSize <= game.groupSize.max);
  const userPos = hasGroup ? Math.max(0, Math.min(100, ((userGroupSize - 2) / 38) * 100)) : null;

  return (
    <div
      className={`group relative h-full flex flex-col justify-between bg-surface border border-line rounded-card hover:border-accent/60 transition-all p-4 pl-5 shadow-xs overflow-hidden ${
        !matchesGroup ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      {/* 1. Left vertical energy stripe */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-card ${energyBarColor}`}
        aria-hidden="true"
      />

      <Link
        to={`/games/${game.id}`}
        className="block flex-1 min-w-0 pr-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control"
      >
        <div className="mb-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-control text-2xs font-semibold bg-surface-2 text-text-secondary">
            {purposeLabel}
          </span>
        </div>
        <h3 className="text-base font-bold text-text leading-snug line-clamp-1 group-hover:text-accent transition-colors">
          {game.title[language]}
        </h3>
        {/* Uniform height subtitle row */}
        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5 min-h-[1.25rem]">
          {subtitle || <span className="opacity-0" aria-hidden="true">—</span>}
        </p>
      </Link>

      {/* Top right bookmark button: touch target min 44x44px */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(game.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${game.title[language]}`}
        className={`absolute top-2 right-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-control hover:bg-surface-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
          isFavorite ? 'text-accent' : 'text-text-tertiary hover:text-text'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* 2. Group size mini-scale on 2–40 axis + duration + energy text */}
      <div className="pt-3 mt-3 border-t border-line space-y-1.5">
        <div className="flex items-center justify-between text-2xs font-mono text-text-secondary">
          <span>{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</span>
          <span>{game.durationMinutes}</span>
          <span className={`font-semibold ${energyTextColor}`}>{energyLabel}</span>
        </div>

        {/* Mini range bar (2 to 40 axis) */}
        <div
          className="relative w-full h-1.5 bg-surface-2 rounded-full overflow-hidden"
          title={`2–40: ${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`}
        >
          <div
            className="absolute top-0 bottom-0 bg-accent/70 rounded-full"
            style={{ left: `${minPos}%`, width: `${barWidth}%` }}
          />
          {userPos !== null && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-text shadow-xs z-10"
              style={{ left: `${userPos}%` }}
              title={`Deine Gruppe: ${userGroupSize} ${t.peopleSuffix}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
