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
      className="group bg-white rounded-xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Meta Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
              {getCategoryLabel()}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
              game.energyLevel === 'high' ? 'bg-amber-50 text-amber-900 border border-amber-200/60' :
              game.energyLevel === 'calm' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/60' :
              'bg-stone-50 text-stone-700 border border-stone-200/60'
            }`}>
              {getEnergyLabel()}
            </span>
          </div>

          <button
            onClick={(e) => onToggleFavorite(game.id, e)}
            className={`p-1.5 rounded-md transition-colors ${
              isFavorite
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
            }`}
            title={t.savedItems}
            aria-label={t.savedItems}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors mb-2 leading-snug">
          {game.title[language]}
        </h3>

        {/* Summary */}
        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
          {game.summary[language]}
        </p>
      </div>

      {/* Bottom Info & Action */}
      <div className="pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            {game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            {game.durationMinutes}
          </span>
          <span className="flex items-center gap-1 font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
            <Zap className="w-3 h-3 text-stone-500" />
            {game.prepLevel === 'instant' ? (language === 'de' ? '0 Min' : '0 Min') : (language === 'de' ? 'Material' : 'Props')}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-900">
          <span>{t.viewDetails}</span>
          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
