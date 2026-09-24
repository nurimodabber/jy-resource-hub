import React, { useState, useMemo } from 'react';
import { Sparkles, RotateCcw, Zap } from 'lucide-react';
import { Game, GameCategory, EnergyLevel, Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { GameCard } from './GameCard';
import { GameModal } from './GameModal';
import { UI_TRANSLATIONS } from '../data/translations';

interface GamesViewProps {
  searchQuery: string;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showOnlyFavorites: boolean;
}

export const GamesView: React.FC<GamesViewProps> = ({
  searchQuery,
  language,
  favorites,
  onToggleFavorite,
  showOnlyFavorites,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | 'all'>('all');
  const [onlyInstantPrep, setOnlyInstantPrep] = useState(false);
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const t = UI_TRANSLATIONS[language];

  const categories: { id: GameCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'cooperative', label: t.filterCooperative },
    { id: 'competitive', label: t.filterCompetitive },
    { id: 'social_deduction', label: t.filterSocialDeduction },
    { id: 'energizer', label: t.filterEnergizer },
  ];

  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter((game) => {
      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(game.id)) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = game.title[language].toLowerCase().includes(q);
        const matchesSummary = game.summary[language].toLowerCase().includes(q);
        const matchesIdea = game.idea[language].toLowerCase().includes(q);
        const matchesRules = game.rules[language].some((r) => r.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesIdea && !matchesRules) return false;
      }

      // Category
      if (selectedCategory !== 'all' && game.category !== selectedCategory) {
        return false;
      }

      // Energy
      if (selectedEnergy !== 'all' && game.energyLevel !== selectedEnergy) {
        return false;
      }

      // Instant prep
      if (onlyInstantPrep && game.prepLevel !== 'instant') {
        return false;
      }

      return true;
    });
  }, [searchQuery, language, selectedCategory, selectedEnergy, onlyInstantPrep, showOnlyFavorites, favorites]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedEnergy !== 'all' || onlyInstantPrep;

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedEnergy('all');
    setOnlyInstantPrep(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {showOnlyFavorites ? t.savedItems : t.gamesHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-xl font-normal leading-relaxed">
            {showOnlyFavorites ? t.noSavedItems : t.gamesHeaderDesc}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#86868b] font-medium">
            {filteredGames.length} {filteredGames.length === 1 ? t.gameFound : t.gamesFound}
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-xs text-[#0071e3] hover:underline font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Streamlined Apple Filter Bar */}
      <div className="flex flex-col gap-3">
        {/* Primary Category Segmented Control */}
        <div className="overflow-x-auto pb-1 custom-scrollbar">
          <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Refinement Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Instant Prep Toggle */}
          <button
            onClick={() => setOnlyInstantPrep(!onlyInstantPrep)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium transition-all border ${
              onlyInstantPrep
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-apple-pill'
                : 'bg-white text-[#6e6e73] border-black/[0.06] hover:bg-black/[0.02]'
            }`}
          >
            <Zap className={`w-3 h-3 ${onlyInstantPrep ? 'text-white' : 'text-emerald-600'}`} />
            <span>{t.quickFilterInstant}</span>
          </button>

          {/* Energy Level Filter Pills */}
          {(['all', 'calm', 'medium', 'high'] as const).map((energy) => {
            const isSelected = selectedEnergy === energy;
            const label = energy === 'all' 
              ? (language === 'de' ? 'Alle Intensitäten' : 'All Intensities')
              : energy === 'calm'
                ? t.filterCalmEnergy
                : energy === 'medium'
                  ? t.filterMediumEnergy
                  : t.filterHighEnergy;

            return (
              <button
                key={energy}
                onClick={() => setSelectedEnergy(energy)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all border ${
                  isSelected && energy !== 'all'
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-apple-pill'
                    : isSelected && energy === 'all'
                      ? 'bg-black/[0.05] text-[#1d1d1f] border-transparent font-semibold'
                      : 'bg-white text-[#86868b] border-black/[0.06] hover:text-[#1d1d1f]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Games Cards Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={setActiveGame}
              language={language}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-black/[0.06] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-black/[0.04] text-[#86868b] flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#1d1d1f]">
            {language === 'de' ? 'Keine Spiele gefunden' : 'No games match your criteria'}
          </h3>
          <p className="text-xs text-[#86868b] max-w-sm mx-auto">
            {language === 'de' 
              ? 'Passe deine Filtereinstellungen oder Suchbegriffe an, um mehr Ergebnisse anzuzeigen.'
              : 'Try adjusting your filters or search term to discover available activities.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#1d1d1f] text-white shadow-apple-pill hover:bg-black transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>
      )}

      {/* Game Details Modal */}
      {activeGame && (
        <GameModal
          game={activeGame}
          onClose={() => setActiveGame(null)}
          language={language}
          isFavorite={favorites.includes(activeGame.id)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
};
