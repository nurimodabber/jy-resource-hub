import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Bookmark, Play, Flame } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { getGameIcon } from '../data/gameIcons';
import { PURPOSE_TONE } from '../data/activityTones';
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

const PURPOSE_LABEL = {
  kennenlernen: 'purposeKennenlernen',
  energie: 'purposeEnergie',
  zusammenarbeit: 'purposeZusammenarbeit',
  ruhe: 'purposeRuhe',
  raten: 'purposeRaten',
} as const;

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
  const isDe = language === 'de';
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
      className={`group relative overflow-hidden h-full flex flex-col justify-between bg-surface border border-border/80 rounded-card hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2 transition-all duration-200 ease-out px-3.5 pb-3.5 pt-3.5 sm:px-5 sm:pb-4 sm:pt-4 shadow-2xs ${
        !matchesGroup ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      {/* Subtle Top-Right Ambient Glow in Blue / Accent (Normed for Games page) */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl opacity-10 dark:opacity-20 transition-opacity"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb)) 0%, transparent 70%)' }}
      />

      {/* Top-Right Bookmark Button */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(game.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${language === 'de' ? 'Merken' : 'Save'}: ${game.title[language]}`}
        className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite
            ? 'text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs'
            : 'text-text-tertiary hover:text-text hover:bg-surface-2'
        }`}
      >
        <Bookmark className={`w-4 h-4 transition-transform duration-150 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
      </button>

      {/* Main Content Area (Stretched Link for accessibility) */}
      <Link
        to={`/games/${game.id}`}
        className="block flex-1 min-w-0 pr-10 sm:pr-12 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control after:absolute after:inset-0 after:rounded-card after:z-0 mb-4"
      >
        {/* KONZEPT: große Kachel im Ton der Wirkung, Wirkung als Text unter dem Titel */}
        <div className={`flex items-center gap-3 mb-2.5 relative z-[1] tone-${PURPOSE_TONE[game.purpose]}`}>
          <IconTile icon={getGameIcon(game.id)} size="lg" toneClass="tone-tile" />
          <div className="min-w-0">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-text leading-snug line-clamp-2 group-hover:text-accent transition-colors tracking-tight">
              {game.title[language]}
            </h3>
            <p className="text-2xs sm:text-xs font-semibold tone-text mt-0.5">{t[PURPOSE_LABEL[game.purpose]]}</p>
          </div>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed relative z-[1] max-w-[60ch]">
            {description}
          </p>
        )}
      </Link>

      {/* Full-bleed Footer Divider with Group Size & Duration */}
      <div className="relative z-[1] pointer-events-none -mx-3.5 -mb-3.5 px-3.5 py-3 sm:-mx-5 sm:-mb-4 sm:px-5 sm:py-3.5 border-t border-border/60 bg-surface-2/40 mt-auto flex items-center justify-between text-xs text-text-tertiary">
        {/* Left: Group size & Duration */}
        <div className="flex items-center gap-2 truncate">
          <div
            className="inline-flex items-center gap-1.5 shrink-0"
            title={`${t.filterGroupSize}: ${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`}
          >
            <Users className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
            <span className="sr-only">{t.filterGroupSize}: </span>
            <span>{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</span>
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
        </div>

        {/* Right: Companion Play Badge + Energy Tag */}
        <div className="flex items-center gap-2 shrink-0">
          {hasCompanion && (
            <span
              className="w-7 h-7 min-w-[28px] min-h-[28px] inline-flex items-center justify-center rounded-full bg-accent text-accent-contrast shadow-2xs shrink-0"
              title={isDe ? 'Interaktiver Spielbegleiter vorhanden' : 'Interactive companion available'}
              role="img"
              aria-label={isDe ? 'Interaktiver Spielbegleiter vorhanden' : 'Interactive companion available'}
            >
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </span>
          )}
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 border border-border/60 text-2xs font-medium text-text-secondary"
            title={`${t.filterEnergy}: ${energyLabel}`}
          >
            <Flame className="w-3 h-3 text-amber-500 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{energyLabel}</span>
            <EnergyDots energyLevel={game.energyLevel} className="ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
