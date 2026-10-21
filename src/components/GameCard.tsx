import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Bookmark, Zap } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

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
  const categoryBadge = React.useMemo(() => {
    switch (game.purpose) {
      case 'kennenlernen':
        return language === 'de' ? 'Kennenlernen' : 'Icebreaker';
      case 'zusammenarbeit':
        return language === 'de' ? 'Zusammenarbeit' : 'Cooperation';
      case 'ruhe':
        return language === 'de' ? 'Fokus & Konzentration' : 'Focus & Calm';
      case 'energie':
        return language === 'de' ? 'Bewegung & Dynamik' : 'Movement & Action';
      case 'raten':
        return language === 'de' ? 'Raten & Denken' : 'Guessing & Logic';
      default:
        return language === 'de' ? 'Gruppenspiel' : 'Group Game';
    }
  }, [game.purpose, language]);

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
      className={`group relative h-full flex flex-col justify-between bg-surface border border-border rounded-card hover:bg-surface-2/40 hover:shadow-2 transition-all duration-150 ease-out p-4 ${
        !matchesGroup ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <Link
        to={`/games/${game.id}`}
        className="block flex-1 min-w-0 pr-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control after:absolute after:inset-0 after:rounded-card after:z-0"
      >
        <div className="flex items-center gap-2 relative z-[1]">
          <h3 className="text-base font-semibold text-text leading-snug truncate group-hover:text-accent transition-colors min-w-0">
            {game.title[language]}
          </h3>
          <span
            className="inline-flex items-center shrink-0"
            title={`${t.filterEnergy}: ${energyLabel}`}
            aria-label={`${t.filterEnergy}: ${energyLabel}`}
          >
            <EnergyDots energyLevel={game.energyLevel} />
          </span>
        </div>
        <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed relative z-[1]">
          {description}
        </p>
      </Link>

      {/* Top right bookmark button: touch target min 44x44px, stays above stretched link */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(game.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${game.title[language]}`}
        className={`absolute top-2.5 right-2.5 z-10 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-2 transition-all duration-100 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite ? 'text-accent' : 'text-text-tertiary hover:text-text'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Bottom row: Category badge (and Web-App) on bottom-left, group size & duration on right */}
      <div className="relative z-[1] pointer-events-none flex items-center justify-between gap-2 flex-wrap pt-3 mt-3 border-t border-border/50 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent-subtle text-accent-text">
            {categoryBadge}
          </span>
          {hasCompanion && (
            <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text border border-accent/20">
              <Zap className="w-2.5 h-2.5 text-accent" />
              <span>{language === 'de' ? 'Web-App' : 'Web app'}</span>
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
        </div>
      </div>
    </div>
  );
};
