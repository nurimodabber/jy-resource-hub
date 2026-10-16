import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Bookmark } from 'lucide-react';
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

export const EnergyDots: React.FC<{ energyLevel: Game['energyLevel']; label?: string }> = ({
  energyLevel,
}) => {
  const filledCount = energyLevel === 'high' ? 3 : energyLevel === 'medium' ? 2 : 1;
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((idx) => (
        <span
          key={idx}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            idx < filledCount ? 'bg-accent' : 'bg-border-strong opacity-40'
          }`}
        />
      ))}
    </span>
  );
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

  const hasGroup = typeof userGroupSize === 'number' && userGroupSize >= 2 && userGroupSize <= 40;
  const matchesGroup = !hasGroup || (userGroupSize >= game.groupSize.min && userGroupSize <= game.groupSize.max);

  return (
    <div
      className={`group relative h-full flex flex-col justify-between bg-surface border border-border rounded-card hover:border-accent hover:shadow-xs transition-all p-4 ${
        !matchesGroup ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <Link
        to={`/games/${game.id}`}
        className="block flex-1 min-w-0 pr-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control"
      >
        <div className="mb-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent/15 text-accent">
            {purposeLabel}
          </span>
        </div>
        <h3 className="text-base font-semibold text-text leading-snug line-clamp-1 group-hover:text-accent transition-colors">
          {game.title[language]}
        </h3>
        {/* Uniform height subtitle row */}
        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
          {subtitle || <span className="opacity-0" aria-hidden="true">—</span>}
        </p>
      </Link>

      {/* Top right bookmark button: touch target min 44x44px */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(game.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${game.title[language]}`}
        className={`absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite ? 'text-accent' : 'text-text-tertiary hover:text-text'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Meta row with icons and 3-dot energy meter */}
      <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/50 text-xs text-text-secondary">
        <div
          className="inline-flex items-center gap-1.5 shrink-0"
          title={`${t.filterGroupSize}: ${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`}
        >
          <Users className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
          <span className="sr-only">{t.filterGroupSize}: </span>
          <span>{game.groupSize.min}–{game.groupSize.max}</span>
          <span className="sr-only"> {t.peopleSuffix}</span>
        </div>

        <span className="text-border" aria-hidden="true">·</span>

        <div
          className="inline-flex items-center gap-1.5 shrink-0"
          title={`${t.filterDuration}: ${game.durationMinutes}`}
        >
          <Clock className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
          <span className="sr-only">{t.filterDuration}: </span>
          <span>{game.durationMinutes}</span>
        </div>

        <span className="text-border" aria-hidden="true">·</span>

        <div
          className="inline-flex items-center gap-1.5 ml-auto shrink-0"
          title={`${t.filterEnergy}: ${energyLabel}`}
        >
          <EnergyDots energyLevel={game.energyLevel} />
          <span className="sr-only">{t.filterEnergy}: </span>
          <span className="text-xs text-text-secondary">{energyLabel}</span>
        </div>
      </div>
    </div>
  );
};
