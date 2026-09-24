import React, { useState, useMemo } from 'react';
import { Filter, Bookmark, Sparkles, X } from 'lucide-react';
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
  const [selectedPrep, setSelectedPrep] = useState<'all' | 'instant' | 'materials'>('all');
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const t = UI_TRANSLATIONS[language];

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

      // Prep
      if (selectedPrep === 'instant' && game.prepLevel !== 'instant') {
        return false;
      }
      if (selectedPrep === 'materials' && game.prepLevel === 'instant') {
        return false;
      }

      return true;
    });
  }, [searchQuery, language, selectedCategory, selectedEnergy, selectedPrep, showOnlyFavorites, favorites]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {showOnlyFavorites ? t.savedItems : t.gamesHeaderTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {showOnlyFavorites ? t.noSavedItems : t.gamesHeaderDesc}
            </p>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {filteredGames.length} {filteredGames.length === 1 ? t.gameFound : t.gamesFound}
          </span>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>{t.filterCategoryLabel}</span>
          </div>

          {(selectedCategory !== 'all' || selectedEnergy !== 'all' || selectedPrep !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedEnergy('all');
                setSelectedPrep('all');
              }}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
            >
              {t.resetFilters}
            </button>
          )}
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => setSelectedCategory('cooperative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'cooperative'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterCooperative}
          </button>
          <button
            onClick={() => setSelectedCategory('competitive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'competitive'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterCompetitive}
          </button>
          <button
            onClick={() => setSelectedCategory('social_deduction')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'social_deduction'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterSocialDeduction}
          </button>
          <button
            onClick={() => setSelectedCategory('energizer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'energizer'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterEnergizer}
          </button>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
          <span className="text-[11px] font-semibold text-stone-400 mr-1">{t.filterVibeLabel}:</span>
          
          <button
            onClick={() => setSelectedEnergy(selectedEnergy === 'high' ? 'all' : 'high')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedEnergy === 'high'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterHighEnergy}
          </button>

          <button
            onClick={() => setSelectedEnergy(selectedEnergy === 'calm' ? 'all' : 'calm')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedEnergy === 'calm'
                ? 'bg-indigo-100 text-indigo-900 font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterCalmEnergy}
          </button>

          <button
            onClick={() => setSelectedPrep(selectedPrep === 'instant' ? 'all' : 'instant')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedPrep === 'instant'
                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.filterInstantPrep}
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-6">
          <p className="text-sm font-semibold text-stone-800">
            {showOnlyFavorites ? t.noSavedItems : 'Keine passenden Spiele gefunden.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedEnergy('all');
              setSelectedPrep('all');
            }}
            className="mt-3 px-4 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
          >
            {t.resetFilters}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <GameModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
        language={language}
        isFavorite={activeGame ? favorites.includes(activeGame.id) : false}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};
