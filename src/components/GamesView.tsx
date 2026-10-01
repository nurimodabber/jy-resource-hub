import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { Game, GameCategory, EnergyLevel, Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { GameCard } from './GameCard';
import { GameModal } from './GameModal';
import { Sheet } from './ui/Sheet';
import { EmptyState } from './ui/EmptyState';
import { UI_TRANSLATIONS } from '../data/translations';

interface GamesViewProps {
  searchQuery: string;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showOnlyFavorites: boolean;
  onClearShowOnlyFavorites?: () => void;
  selectedGameId?: string | null;
  onSelectGame?: (game: Game | null) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  searchQuery,
  language,
  favorites,
  onToggleFavorite,
  showOnlyFavorites,
  onClearShowOnlyFavorites,
  selectedGameId: propGameId,
  onSelectGame,
}) => {
  const { id: routeGameId } = useParams<{ id?: string }>();
  const effectiveGameId = propGameId ?? routeGameId;
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [onlyInstantPrep, setOnlyInstantPrep] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [activeGame, setActiveGame] = useState<Game | null>(() => {
    if (effectiveGameId) {
      return GAMES_DATA.find((g) => g.id === effectiveGameId) || null;
    }
    return null;
  });

  // Sync external deep link
  React.useEffect(() => {
    if (effectiveGameId) {
      const match = GAMES_DATA.find((g) => g.id === effectiveGameId);
      if (match) setActiveGame(match);
    } else {
      setActiveGame(null);
    }
  }, [effectiveGameId]);

  const t = UI_TRANSLATIONS[language];

  const categories: { id: GameCategory; label: string }[] = [
    { id: 'cooperative', label: t.filterCooperative },
    { id: 'social_deduction', label: t.filterSocialDeduction },
    { id: 'competitive', label: t.filterCompetitive },
    { id: 'energizer', label: t.filterEnergizer },
  ];

  const energyLevels: { id: EnergyLevel; label: string }[] = [
    { id: 'calm', label: t.filterCalmEnergy },
    { id: 'medium', label: t.filterMediumEnergy },
    { id: 'high', label: t.filterHighEnergy },
  ];

  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter((game) => {
      if (showOnlyFavorites && !favorites.includes(game.id)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = game.title[language].toLowerCase().includes(q);
        const matchesSummary = game.summary[language].toLowerCase().includes(q);
        const matchesIdea = game.idea[language].toLowerCase().includes(q);
        const matchesRules = game.rules[language].some((r) => r.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesIdea && !matchesRules) return false;
      }

      if (selectedCategory && game.category !== selectedCategory) {
        return false;
      }

      if (selectedEnergy && game.energyLevel !== selectedEnergy) {
        return false;
      }

      if (onlyInstantPrep && game.prepLevel !== 'instant') {
        return false;
      }

      return true;
    });
  }, [searchQuery, language, selectedCategory, selectedEnergy, onlyInstantPrep, showOnlyFavorites, favorites]);

  const handleOpenGame = (game: Game) => {
    setActiveGame(game);
    if (onSelectGame) onSelectGame(game);
  };

  const handleCloseGame = () => {
    setActiveGame(null);
    if (onSelectGame) onSelectGame(null);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedEnergy(null);
    setOnlyInstantPrep(false);
    if (onClearShowOnlyFavorites) onClearShowOnlyFavorites();
  };

  const hasActiveFilters = selectedCategory !== null || selectedEnergy !== null || onlyInstantPrep || showOnlyFavorites;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* 1. Header & Quick Filter Bar */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              {t.tabGames}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5 truncate">
              {language === 'de'
                ? `${GAMES_DATA.length} erprobte Gruppenspiele mit Regeln und Tipps.`
                : `${GAMES_DATA.length} field-tested games with rules and tips.`}
            </p>
          </div>

          {/* Action Row: Compact View Toggle & Filter Sheet */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCompactView(!isCompactView)}
              className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={isCompactView ? 'Kartenansicht' : 'Kompaktansicht'}
              aria-label="Ansicht umschalten"
            >
              {isCompactView ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer min-h-[40px] ${
                hasActiveFilters
                  ? 'bg-accent text-accent-contrast border-accent'
                  : 'bg-surface-2 text-text-secondary hover:text-text border-border'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Filter' : 'Filters'}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-accent-contrast ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Category Chips Row (No "Alle..." chips) */}
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {/* Quick toggle Instant Prep */}
          <button
            type="button"
            onClick={() => setOnlyInstantPrep(!onlyInstantPrep)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] cursor-pointer flex items-center gap-1 ${
              onlyInstantPrep
                ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.filterInstantPrep}</span>
          </button>
        </div>

        {/* Removable Active Filter Chips */}
        {hasActiveFilters && (
          <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap items-center gap-2 text-xs">
            <span className="text-text-tertiary">{language === 'de' ? 'Aktiv:' : 'Active:'}</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text">
                <span>{categories.find((c) => c.id === selectedCategory)?.label}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedCategory(null)} />
              </span>
            )}
            {selectedEnergy && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text">
                <span>{energyLevels.find((e) => e.id === selectedEnergy)?.label}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedEnergy(null)} />
              </span>
            )}
            {onlyInstantPrep && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text">
                <span>{t.filterInstantPrep}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setOnlyInstantPrep(false)} />
              </span>
            )}
            {showOnlyFavorites && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text">
                <span>{t.savedItems}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={onClearShowOnlyFavorites} />
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-2xs font-semibold text-accent-text hover:underline ml-1 cursor-pointer"
            >
              {language === 'de' ? 'Alle zurücksetzen' : 'Reset all'}
            </button>
          </div>
        )}
      </div>

      {/* 2. Games Grid or Compact List */}
      <div className={isCompactView ? 'space-y-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4'}>
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            language={language}
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
            onSelect={handleOpenGame}
            compact={isCompactView}
          />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <EmptyState
          title={language === 'de' ? 'Keine Spiele gefunden' : 'No games found'}
          description={language === 'de' ? 'Versuche, deine Filter zurückzusetzen oder einen anderen Suchbegriff einzugeben.' : 'Try clearing your filters or using a different search term.'}
          actionLabel={hasActiveFilters ? (language === 'de' ? 'Filter zurücksetzen' : 'Reset filters') : undefined}
          onAction={hasActiveFilters ? handleClearAllFilters : undefined}
        />
      )}

      {/* 3. Game Detail Modal */}
      {activeGame && (
        <GameModal
          game={activeGame}
          onClose={handleCloseGame}
          language={language}
          isFavorite={favorites.includes(activeGame.id)}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* 4. Filter Sheet */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title={language === 'de' ? 'Spiele filtern' : 'Filter Games'}
        position="bottom"
      >
        <div className="space-y-5 pb-4">
          {/* Energy Filter */}
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              {language === 'de' ? 'Intensität & Energie' : 'Energy Level'}
            </label>
            <div className="flex flex-wrap gap-2">
              {energyLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedEnergy(selectedEnergy === lvl.id ? null : lvl.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedEnergy === lvl.id
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prep filter */}
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              {language === 'de' ? 'Vorbereitung' : 'Preparation'}
            </label>
            <button
              type="button"
              onClick={() => setOnlyInstantPrep(!onlyInstantPrep)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                onlyInstantPrep
                  ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                  : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
              }`}
            >
              {t.filterInstantPrep} (0′ Prep)
            </button>
          </div>

          {/* Submit button showing dynamic count */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(false)}
              className="w-full py-3 rounded-xl bg-accent text-accent-contrast font-semibold text-xs transition-colors cursor-pointer"
            >
              {language === 'de' ? `${filteredGames.length} Spiele anzeigen` : `Show ${filteredGames.length} Games`}
            </button>
          </div>
        </div>
      </Sheet>

    </div>
  );
};
