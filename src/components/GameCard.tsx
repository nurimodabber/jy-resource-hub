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
}

export const gameMeta = (game: Game, language: Language) => {
  const t = UI_TRANSLATIONS[language];
  const energy = game.energyLevel === 'high' ? t.filterHighEnergy : game.energyLevel === 'medium' ? t.filterMediumEnergy : t.filterCalmEnergy;
  return [`${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`, game.durationMinutes, energy];
};

/** Fixed meta order everywhere: group size, duration, energy. */
export const GameCard: React.FC<GameCardProps> = ({ game, language, isFavorite, onToggleFavorite }) => {
  const t = UI_TRANSLATIONS[language];
  return (
    <div className="relative h-full flex items-stretch bg-surface border border-border rounded-xl hover:border-text-tertiary transition-colors">
      <Link to={`/games/${game.id}`} className="flex-1 min-w-0 p-4 pr-12 rounded-xl">
        <h3 className="text-base font-semibold text-text leading-snug line-clamp-2">{game.title[language]}</h3>
        <p className="text-sm text-text-secondary mt-1 line-clamp-2">{game.summary[language]}</p>
        <p className="text-xs text-text-tertiary mt-2 tabular-nums">{gameMeta(game, language).join(' · ')}</p>
      </Link>
      <button
        type="button"
        onClick={(e) => onToggleFavorite(game.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${game.title[language]}`}
        className={`absolute top-1.5 right-1.5 w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-surface-2 ${
          isFavorite ? 'text-accent-text' : 'text-text-tertiary'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};
