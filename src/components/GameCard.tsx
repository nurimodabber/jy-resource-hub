import React from 'react';
import { Users, Clock, ChevronRight, Bookmark, Zap } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

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

  const getCategoryLabel = () => {
    switch (game.category) {
      case 'cooperative': return t.filterCooperative;
      case 'competitive': return t.filterCompetitive;
      case 'social_deduction': return t.filterSocialDeduction;
      case 'energizer': return t.filterEnergizer;
    }
  };

  const getEnergyColor = () => {
    switch (game.energyLevel) {
      case 'high':
        return 'bg-amber-500/10 text-amber-800';
      case 'calm':
        return 'bg-blue-500/10 text-blue-800';
      default:
        return 'bg-black/[0.04] text-[#6e6e73]';
    }
  };

  const getEnergyLabel = () => {
    switch (game.energyLevel) {
      case 'high': return t.filterHighEnergy;
      case 'medium': return t.filterMediumEnergy;
      case 'calm': return t.filterCalmEnergy;
    }
  };

  return (
    <div 
      onClick={() => onSelect(game)}
      className="group bg-white rounded-2xl border border-black/[0.06] p-5 shadow-apple-card hover:shadow-apple-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Meta Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#1d1d1f]">
              {getCategoryLabel()}
            </span>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${getEnergyColor()}`}>
              {getEnergyLabel()}
            </span>
          </div>

          <button
            onClick={(e) => onToggleFavorite(game.id, e)}
            className={`p-1.5 rounded-full transition-colors ${
              isFavorite
                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
            title={t.savedItems}
            aria-label={t.savedItems}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors mb-1.5 leading-snug">
          {game.title[language]}
        </h3>

        {/* Summary */}
        <p className="text-xs text-[#6e6e73] line-clamp-2 leading-relaxed mb-4">
          {game.summary[language]}
        </p>
      </div>

      {/* Bottom Info & Action */}
      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#86868b]">
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-[#aeaeb2]" />
            {game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#aeaeb2]" />
            {game.durationMinutes}
          </span>
          {game.prepLevel === 'instant' && (
            <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
              0 Min
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 text-xs font-semibold text-[#0071e3] group-hover:translate-x-0.5 transition-transform">
          <span>{t.viewDetails}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
