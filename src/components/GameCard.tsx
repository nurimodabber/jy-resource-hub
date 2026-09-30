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
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelect,
  language,
  isFavorite,
  onToggleFavorite,
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

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(game)}
      onKeyDown={handleKeyDown}
      className="group relative bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-apple-card hover:shadow-apple-card-hover hover:border-border hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`${game.title[language]} (${getCategoryLabel()})`}
    >
      <div>
        {/* Top Meta Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge category={getCategory()} size="md">
              {getCategoryLabel()}
            </Badge>
            <Badge category="neutral" size="md">
              {getEnergyLabel()}
            </Badge>
          </div>

          <IconButton
            label={isFavorite ? t.savedItems : `${t.savedItems} (hinzufügen)`}
            onClick={(e) => onToggleFavorite(game.id, e)}
            size="sm"
            className={
              isFavorite
                ? 'text-accent bg-accent/10 hover:bg-accent/20'
                : 'text-text-tertiary hover:text-text'
            }
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </IconButton>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-accent transition-colors mb-2 leading-snug">
          {game.title[language]}
        </h3>

        {/* Summary */}
        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-5">
          {game.summary[language]}
        </p>
      </div>

      {/* Bottom Info & Action - Single Row Without Line Breaks */}
      <div className="pt-3.5 border-t border-border-subtle flex items-center justify-between gap-2 text-xs text-text-secondary">
        <div className="flex items-center gap-3 truncate">
          <span className="inline-flex items-center gap-1 font-medium shrink-0" title={`${game.groupSize.min}–${game.groupSize.max} ${t.peopleSuffix}`}>
            <Users className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.groupSize.min}–{game.groupSize.max}</span>
          </span>

          <span className="inline-flex items-center gap-1 font-medium shrink-0" title={`${game.durationMinutes} Minuten`}>
            <Clock className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{game.durationMinutes}′</span>
          </span>

          {game.prepLevel === 'instant' && (
            <span className="hidden xs:inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
              <Sparkles className="w-3 h-3" />
              <span>0′ Prep</span>
            </span>
          )}
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform shrink-0">
          <span className="hidden sm:inline">{t.viewDetails}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
};
