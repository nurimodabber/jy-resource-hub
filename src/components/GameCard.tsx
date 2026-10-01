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

  // Compact View Layout
  if (compact) {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={() => onSelect(game)}
        onKeyDown={handleKeyDown}
        className="group relative bg-surface rounded-xl border border-border p-3 sm:p-3.5 shadow-xs hover:border-accent/40 hover:bg-surface-2 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 outline-hidden focus-visible:ring-2 focus-visible:ring-accent min-h-[52px]"
        aria-label={`${game.title[language]} (${getCategoryLabel()})`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Badge category={getCategory()} size="sm">
            {getCategoryLabel()}
          </Badge>
          <h3 className="text-xs sm:text-sm font-bold text-text group-hover:text-accent transition-colors truncate">
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
                ? 'text-accent bg-accent-subtle hover:bg-accent/20'
                : 'text-text-tertiary hover:text-text'
            }
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-accent' : ''}`} />
          </IconButton>
        </div>
      </article>
    );
  }

  // Standard Card Layout
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(game)}
      onKeyDown={handleKeyDown}
      className="group relative bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs hover:shadow-apple-card hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`${game.title[language]} (${getCategoryLabel()})`}
    >
      <div>
        {/* Top Meta Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge category={getCategory()} size="sm">
              {getCategoryLabel()}
            </Badge>
            <Badge category="neutral" size="sm">
              {getEnergyLabel()}
            </Badge>
          </div>

          <IconButton
            label={isFavorite ? t.savedItems : `${t.savedItems} (hinzufügen)`}
            onClick={(e) => onToggleFavorite(game.id, e)}
            size="sm"
            className={
              isFavorite
                ? 'text-accent bg-accent-subtle hover:bg-accent/20'
                : 'text-text-tertiary hover:text-text'
            }
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-accent' : ''}`} />
          </IconButton>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-accent transition-colors mb-2 leading-snug">
          {game.title[language]}
        </h3>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4">
          {game.summary[language]}
        </p>
      </div>

      {/* Bottom Info Row - Fix clipping: flex-wrap, no inner overflow truncation */}
      <div className="pt-3.5 border-t border-border flex items-center justify-between gap-2 text-xs text-text-secondary">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-medium shrink-0" title={`${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`}>
            <Users className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.groupSize.min}–{game.groupSize.max}</span>
          </span>

          <span className="inline-flex items-center gap-1 font-semibold text-text shrink-0" title={`${game.durationMinutes} Minuten`}>
            <Clock className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.durationMinutes}′</span>
          </span>

          {game.prepLevel === 'instant' && (
            <span className="hidden xs:inline-flex items-center gap-0.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
              <Sparkles className="w-3 h-3" />
              <span>0′ Prep</span>
            </span>
          )}
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text group-hover:translate-x-0.5 transition-transform shrink-0">
          <span className="hidden sm:inline">{t.viewDetails}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
};
