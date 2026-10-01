import React from 'react';
import { Users, Clock, ChevronRight, Bookmark, Sparkles } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { Badge, BadgeCategory } from './ui/Badge';
import { IconButton } from './ui/IconButton';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  compact?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelect,
  language,
  isFavorite,
  onToggleFavorite,
  compact = false,
}) => {
  const t = UI_TRANSLATIONS[language];

  const getCategory = (): BadgeCategory => {
    switch (game.category) {
      case 'cooperative': return 'cooperative';
      case 'competitive': return 'competitive';
      case 'social_deduction': return 'social';
      case 'energizer': return 'energizer';
    }
  };

  const getCategoryLabel = () => {
    switch (game.category) {
      case 'cooperative': return t.filterCooperative;
      case 'competitive': return t.filterCompetitive;
      case 'social_deduction': return t.filterSocialDeduction;
      case 'energizer': return t.filterEnergizer;
    }
  };

  const getEnergyLabel = () => {
    switch (game.energyLevel) {
      case 'high': return t.filterHighEnergy;
      case 'medium': return t.filterMediumEnergy;
      case 'calm': return t.filterCalmEnergy;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(game);
    }
  };

  // Compact View Layout (Real dense list: title, tags, group, time, bookmark)
  if (compact) {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={() => onSelect(game)}
        onKeyDown={handleKeyDown}
        className="group relative bg-surface rounded-xl border border-border p-3 sm:px-4 sm:py-2.5 shadow-xs hover:border-brand/40 hover:bg-surface-2 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 outline-hidden focus-visible:ring-2 focus-visible:ring-brand min-h-[48px]"
        aria-label={`${game.title[language]} (${getCategoryLabel()})`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Badge category={getCategory()} size="sm">
            {getCategoryLabel()}
          </Badge>
          {game.prepLevel === 'instant' && (
            <span className="hidden xs:inline-flex text-2xs font-bold text-sage bg-sage-subtle px-2 py-0.5 rounded-full shrink-0">
              0′
            </span>
          )}
          <h3 className="text-xs sm:text-sm font-bold text-text group-hover:text-brand transition-colors truncate">
            {game.title[language]}
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-2xs text-text-secondary">
          <span className="hidden sm:inline-flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.groupSize.min}–{game.groupSize.max}</span>
          </span>

          <span className="inline-flex items-center gap-1 font-semibold text-text">
            <Clock className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.durationMinutes}′</span>
          </span>

          <IconButton
            label={isFavorite ? t.savedItems : `${t.savedItems} (hinzufügen)`}
            onClick={(e) => onToggleFavorite(game.id, e)}
            size="sm"
            className={
              isFavorite
                ? 'text-accent-contrast bg-accent hover:bg-accent-hover'
                : 'text-text-tertiary hover:text-text'
            }
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </IconButton>
        </div>
      </article>
    );
  }

  // Standard Card Layout (Compact: 1 tag row, title max 2 lines, summary max 2 lines, meta row)
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(game)}
      onKeyDown={handleKeyDown}
      className="group relative bg-surface rounded-2xl border border-border p-4 sm:p-4.5 shadow-xs hover:shadow-apple-card-hover hover:border-brand/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
      aria-label={`${game.title[language]} (${getCategoryLabel()})`}
    >
      <div>
        {/* Top Tag Row: Category + Intensity + "0′ Prep" Badge + Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <Badge category={getCategory()} size="sm">
              {getCategoryLabel()}
            </Badge>
            <Badge category="neutral" size="sm">
              {getEnergyLabel()}
            </Badge>
            {game.prepLevel === 'instant' && (
              <span className="inline-flex items-center gap-0.5 text-2xs font-bold text-sage bg-sage-subtle px-2 py-0.5 rounded-full shrink-0">
                <Sparkles className="w-3 h-3" />
                <span>0′ Prep</span>
              </span>
            )}
          </div>

          <IconButton
            label={isFavorite ? t.savedItems : `${t.savedItems} (hinzufügen)`}
            onClick={(e) => onToggleFavorite(game.id, e)}
            size="sm"
            className={
              isFavorite
                ? 'text-accent-contrast bg-accent hover:bg-accent-hover'
                : 'text-text-tertiary hover:text-text'
            }
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </IconButton>
        </div>

        {/* Title (max 2 lines) */}
        <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-brand transition-colors mb-1.5 line-clamp-2 leading-snug">
          {game.title[language]}
        </h3>

        {/* Summary (max 2 lines) */}
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
          {game.summary[language]}
        </p>
      </div>

      {/* Bottom Compact Meta Row: Group size + Duration */}
      <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2 text-2xs sm:text-xs text-text-secondary">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-medium shrink-0" title={`${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`}>
            <Users className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.groupSize.min}–{game.groupSize.max}</span>
          </span>

          <span className="inline-flex items-center gap-1 font-semibold text-text shrink-0" title={`${game.durationMinutes} Minuten`}>
            <Clock className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.durationMinutes}′</span>
          </span>
        </div>

        <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </article>
  );
};
