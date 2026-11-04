import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Bookmark, Play, Flame } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { getGameIcon } from '../data/gameIcons';
import { IconTile } from './ui/IconTile';

export const COMPANION_GAME_IDS = new Set([
  'empire',
  'spion',
  'wer-bin-ich',
  'werwolf',
  'schlafmuetze-moerder',
  'stumme-reihe',
  'ein-wort-geschichte',
  'psychiater',
]);

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

export const EnergyDots: React.FC<{
  energyLevel: Game['energyLevel'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  energyLevel,
  size = 'sm',
  className = '',
}) => {
  const filledCount = energyLevel === 'high' ? 3 : energyLevel === 'medium' ? 2 : 1;
  const dotSize =
    size === 'lg' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5';
  const gap = size === 'lg' ? 'gap-1.5' : 'gap-1';

  return (
    <span className={`inline-flex items-center ${gap} ${className}`} aria-hidden="true">
      {[0, 1, 2].map((idx) => (
        <span
          key={idx}
          className={`${dotSize} rounded-full transition-colors ${
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
  const energyLabel =
    game.energyLevel === 'high'
      ? t.filterHighEnergy
      : game.energyLevel === 'medium'
      ? t.filterMediumEnergy
      : t.filterCalmEnergy;

  const description = (game.summary && game.summary[language]) || (game.subtitle && game.subtitle[language]) || '';

  const hasGroup = typeof userGroupSize === 'number' && userGroupSize >= 2 && userGroupSize <= 40;
  const matchesGroup = !hasGroup || (userGroupSize >= game.groupSize.min && userGroupSize <= game.groupSize.max);
  const hasCompanion = COMPANION_GAME_IDS.has(game.id);

  return (
    <div
      className={`group relative h-full flex flex-col justify-between bg-surface border border-border/80 rounded-card hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2 transition-all duration-200 ease-out px-3.5 pb-3.5 pt-3 sm:px-5 sm:pb-4 sm:pt-3.5 shadow-2xs ${
        !matchesGroup ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <Link
        to={`/games/${game.id}`}
        className="block flex-1 min-w-0 pr-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control after:absolute after:inset-0 after:rounded-card after:z-0"
      >
        <div className="flex items-center justify-between gap-2 relative z-[1]">
          <div className="flex items-center gap-3 min-w-0">
            <IconTile icon={getGameIcon(game.id)} />
            <h3 className="text-lg font-semibold text-text leading-snug line-clamp-2 group-hover:text-accent transition-colors min-w-0 tracking-tight">
              {game.title[language]}
            </h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary line-clamp-1 mt-1.5 sm:mt-2 leading-relaxed relative z-[1]">
          {description}
        </p>
      </Link>

      {/* Top right bookmark button: touch target min 44x44px, stays above stretched link */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(game.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${game.title[language]}`}
        className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite
            ? 'text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs'
            : 'text-text-tertiary hover:text-text hover:bg-surface-2'
        }`}
      >
        <Bookmark className={`w-4 h-4 transition-transform duration-150 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
      </button>

      {/* Untere Zeile: nur Personen, Minuten, Energie (Kategorie steckt in den Filtern) */}
      <div className="relative z-[1] pointer-events-none flex flex-row-reverse items-center justify-between gap-2 flex-wrap mt-2.5 text-xs text-text-secondary">
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {hasCompanion && (
            <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-contrast shadow-2xs">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>{language === 'de' ? 'Spielen' : 'Play'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0 text-2xs sm:text-xs text-text-tertiary font-medium">
          <div
            className="inline-flex items-center gap-1 shrink-0"
            title={`${t.filterGroupSize}: ${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`}
          >
            <Users className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
            <span className="sr-only">{t.filterGroupSize}: </span>
            <span>{game.groupSize.min}–{game.groupSize.max}</span>
            <span className="sr-only"> {t.peopleSuffix}</span>
          </div>

          <span className="text-border" aria-hidden="true">·</span>

          <div
            className="inline-flex items-center gap-1 shrink-0"
            title={`${t.filterDuration}: ${game.durationMinutes}`}
          >
            <Clock className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
            <span className="sr-only">{t.filterDuration}: </span>
            <span>{game.durationMinutes}</span>
          </div>

          <span className="text-border" aria-hidden="true">·</span>

          <span className="inline-flex items-center gap-1" title={`${t.filterEnergy}: ${energyLabel}`}>
            <Flame className="w-3 h-3 text-amber-500 shrink-0" strokeWidth={2} aria-hidden="true" />
            <EnergyDots energyLevel={game.energyLevel} />
            <span className="sr-only">{t.filterEnergy}: {energyLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
