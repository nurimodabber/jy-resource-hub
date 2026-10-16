import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import { Language, GamePurpose, EnergyLevel } from '../types';
import { GAMES_DATA } from '../data/games';
import { GameCard } from './GameCard';
import { GamePage } from './GamePage';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Badge } from './ui/Badge';
import { Sheet } from './ui/Sheet';
import { Stepper } from './ui/Stepper';
import { Switch } from './ui/Switch';
import { Select } from './ui/Select';
import { SegmentedControl } from './ui/SegmentedControl';
import { UI_TRANSLATIONS } from '../data/translations';
import {
  parseGameFilters,
  serializeGameFilters,
  filterGames,
  countActiveFilters,
  GameFilterState,
} from '../utils/gameFilter';
import { loadActiveGroupCount } from '../utils/groupNames';
import { tr } from './tools/common';

interface GamesViewProps {
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  language,
  favorites,
  onToggleFavorite,
}) => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);

  // User active group size from settings/presence
  const [userGroupSize, setUserGroupSize] = useState<number | null>(() => loadActiveGroupCount());
  useEffect(() => {
    setUserGroupSize(loadActiveGroupCount());
  }, []);

  // Filter sheet visibility state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Filters initialized from URL search params
  const [filters, setFilters] = useState<GameFilterState>(() =>
    parseGameFilters(searchParams),
  );

  // Sync state when URL searchParams change
  useEffect(() => {
    const parsed = parseGameFilters(searchParams);
    setFilters(parsed);
  }, [searchParams]);

  // Update URL whenever filters change (push history for discrete filter actions, replace for text typing)
  const updateFilters = (newFilters: GameFilterState, replaceHistory = false) => {
    setFilters(newFilters);
    const params = serializeGameFilters(newFilters);
    setSearchParams(params, { replace: replaceHistory });
  };

  // If a single game ID is passed in route: /games/:id
  const activeGame = useMemo(() => {
    if (!id) return undefined;
    return GAMES_DATA.find((g) => g.id === id);
  }, [id]);

  // Filtered game list (hook called unconditionally)
  const filteredGames = useMemo(() => {
    return filterGames(GAMES_DATA, filters, language);
  }, [filters, language]);

  if (id) {
    if (!activeGame) {
      return (
        <div className="max-w-3xl mx-auto py-12 px-4">
          <EmptyState
            title={t.gameNotFoundTitle}
            description={t.gameNotFoundDesc}
            actionLabel={t.backToGamesOverview}
            onAction={() => window.location.assign('/games')}
          />
          <div className="mt-6 text-center">
            <Link
              to="/games"
              className="inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToGamesOverview}
            </Link>
          </div>
        </div>
      );
    }
    return (
      <GamePage
        game={activeGame}
        language={language}
        isFavorite={favorites.includes(activeGame.id)}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  // Count active sheet filters (excluding horizontal purpose chips)
  const activeFilterCount = countActiveFilters(filters);

  // Purposes for horizontal chip row
  const PURPOSES: { id: GamePurpose | 'all'; label: string }[] = [
    { id: 'all', label: t.purposeAll },
    { id: 'kennenlernen', label: t.purposeKennenlernen },
    { id: 'energie', label: t.purposeEnergie },
    { id: 'zusammenarbeit', label: t.purposeZusammenarbeit },
    { id: 'ruhe', label: t.purposeRuhe },
    { id: 'raten', label: t.purposeRaten },
  ];

  const handlePurposeSelect = (purposeId: GamePurpose | 'all') => {
    updateFilters({
      ...filters,
      wirkung: purposeId === 'all' ? null : purposeId,
    });
  };

  const handleResetFilters = () => {
    updateFilters({
      q: filters.q,
      wirkung: null,
      personen: null,
      dauer: null,
      energie: null,
      material: null,
      sort: 'match',
    });
  };

  const handleClearAll = () => {
    updateFilters({
      q: undefined,
      wirkung: null,
      personen: null,
      dauer: null,
      energie: null,
      material: null,
      sort: 'match',
    });
  };

  // Energy options for SegmentedControl in Filter Sheet
  const energyOptions: { id: string; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'calm', label: t.filterCalmEnergy },
    { id: 'medium', label: t.filterMediumEnergy },
    { id: 'high', label: t.filterHighEnergy },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 sm:px-6">
      {/* 1. Header: H1, one sentence, live count */}
      <header className="mb-6">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            {t.tabGames}
          </h1>
          <div aria-live="polite" aria-atomic="true">
            <Badge category="neutral" size="md">
              {filteredGames.length} {t.gamesFound}
            </Badge>
          </div>
        </div>
        <p className="text-sm sm:text-base text-text-secondary mt-1 max-w-2xl">
          {L(
            `${GAMES_DATA.length} Spiele für den Kreis, die Wiese und den Gruppenraum.`,
            `${GAMES_DATA.length} games for the circle, lawn, and group room.`
          )}
        </p>
      </header>

      {/* 2. Search row + Filter Button */}
      <div className="flex items-center gap-2 mb-4">
        {/* Search input with icons */}
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.q || ''}
            onChange={(e) =>
              updateFilters(
                {
                  ...filters,
                  q: e.target.value || undefined,
                },
                true
              )
            }
            placeholder={L('Spiel suchen...', 'Search games...')}
            aria-label={L('Spiel suchen', 'Search games')}
            className="w-full h-11 pl-10 pr-11 rounded-control bg-surface border border-border text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, q: undefined })}
              aria-label={L('Suche löschen', 'Clear search')}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-tertiary hover:text-text rounded-control focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Sheet trigger button */}
        <Button
          variant={activeFilterCount > 0 ? 'primary' : 'outline'}
          size="md"
          className="shrink-0 min-h-[44px]"
          onClick={() => setIsFilterSheetOpen(true)}
          aria-label={`${t.filterButton} (${activeFilterCount} ${t.activeFiltersLabel})`}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          <span>{t.filterButton}</span>
          {activeFilterCount > 0 && (
            <span
              className={`ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                activeFilterCount > 0
                  ? 'bg-white text-accent'
                  : 'bg-surface-2 text-text'
              }`}
            >
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* 3. Horizontal single-line scrollable chip row for PURPOSE (Wirkung) */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4 select-none"
        role="group"
        aria-label={t.purposeLabel}
      >
        {PURPOSES.map((p) => {
          const isSelected =
            p.id === 'all'
              ? !filters.wirkung
              : filters.wirkung === p.id;
          return (
            <Chip
              key={p.id}
              selected={isSelected}
              onClick={() => handlePurposeSelect(p.id)}
            >
              {p.label}
            </Chip>
          );
        })}
      </div>

      {/* Quick Ort filter chips (Drinnen / Draußen) */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-4 select-none"
        role="group"
        aria-label={L('Ort', 'Setting')}
      >
        <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary mr-1 shrink-0">
          {L('Ort:', 'Setting:')}
        </span>
        <button
          type="button"
          onClick={() => updateFilters({ ...filters, ort: null })}
          className={`px-3 py-1 rounded-chip text-xs font-semibold transition-colors min-h-[32px] cursor-pointer ${
            !filters.ort ? 'bg-action text-action-contrast' : 'bg-surface-2 text-text hover:bg-surface-2/80'
          }`}
        >
          {L('Alle', 'All')}
        </button>
        <button
          type="button"
          onClick={() => updateFilters({ ...filters, ort: filters.ort === 'drinnen' ? null : 'drinnen' })}
          className={`px-3 py-1 rounded-chip text-xs font-semibold transition-colors min-h-[32px] cursor-pointer ${
            filters.ort === 'drinnen' ? 'bg-action text-action-contrast' : 'bg-surface-2 text-text hover:bg-surface-2/80'
          }`}
        >
          {L('Drinnen', 'Indoors')}
        </button>
        <button
          type="button"
          onClick={() => updateFilters({ ...filters, ort: filters.ort === 'draussen' ? null : 'draussen' })}
          className={`px-3 py-1 rounded-chip text-xs font-semibold transition-colors min-h-[32px] cursor-pointer ${
            filters.ort === 'draussen' ? 'bg-action text-action-contrast' : 'bg-surface-2 text-text hover:bg-surface-2/80'
          }`}
        >
          {L('Draußen', 'Outdoors')}
        </button>
      </div>

      {/* 4. Active removable filter chips */}
      {(activeFilterCount > 0 || filters.wirkung || filters.ort) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 pt-1">
          <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider mr-1">
            {t.activeFiltersLabel}:
          </span>

          {filters.ort && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, ort: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-line bg-surface-2 text-text text-xs font-semibold hover:border-action transition-colors"
              aria-label={L('Ort Filter entfernen', 'Remove setting filter')}
            >
              <span>{L('Ort', 'Setting')}: {filters.ort === 'drinnen' ? L('Drinnen', 'Indoors') : L('Draußen', 'Outdoors')}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {filters.wirkung && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, wirkung: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-line bg-surface-2 text-text text-xs font-semibold hover:border-accent transition-colors"
              aria-label={`${t.purposeLabel} Filter entfernen`}
            >
              <span>{t.purposeLabel}: {PURPOSES.find((p) => p.id === filters.wirkung)?.label}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {filters.personen != null && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, personen: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-line bg-surface-2 text-text text-xs font-semibold hover:border-accent transition-colors"
              aria-label={`${t.filterGroupSize} Filter entfernen`}
            >
              <span>{t.filterGroupSize}: {filters.personen}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {filters.dauer != null && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, dauer: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-line bg-surface-2 text-text text-xs font-semibold hover:border-accent transition-colors"
              aria-label={`${t.filterDuration} Filter entfernen`}
            >
              <span>{t.filterDuration}: ≤ {filters.dauer} Min</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {filters.energie != null && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, energie: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-line bg-surface-2 text-text text-xs font-semibold hover:border-accent transition-colors"
              aria-label={`${t.filterEnergy} Filter entfernen`}
            >
              <span>{t.filterEnergy}: {filters.energie === 'calm' ? t.filterCalmEnergy : filters.energie === 'medium' ? t.filterMediumEnergy : t.filterHighEnergy}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {filters.material === 'ohne' && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, material: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-line bg-surface-2 text-text text-xs font-semibold hover:border-accent transition-colors"
              aria-label={`${t.filterNoMaterial} Filter entfernen`}
            >
              <span>{t.filterNoMaterial}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {filters.sort && filters.sort !== 'match' && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, sort: 'match' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-line bg-surface-2 text-text text-xs font-semibold hover:border-accent transition-colors"
              aria-label={`${t.filterSort} Filter entfernen`}
            >
              <span>{t.filterSort}: {filters.sort === 'duration' ? t.sortDuration : t.sortGroupSize}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-text-secondary hover:text-text underline min-h-[32px] px-2"
          >
            {t.clearAllFilters}
          </button>
        </div>
      )}

      {/* 5. Games Grid: 1 col on mobile, 2 cols on tablet, 3 cols from 1120px */}
      <h2 className="sr-only">{t.tabGames}</h2>
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 min-[1120px]:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              language={language}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
              userGroupSize={filters.personen || userGroupSize}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={L('Keine Spiele gefunden', 'No games found')}
          description={L(
            'Passe die Filtereinstellungen an oder suche nach einem anderen Begriff.',
            'Adjust the filter options or try searching with a different keyword.',
          )}
          actionLabel={t.resetFilters}
          onAction={handleClearAll}
        />
      )}

      {/* 6. Filter Sheet */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title={t.filterDialogTitle}
      >
        <div className="space-y-6 py-2">
          {/* Personenzahl (Stepper) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text">
                {t.filterGroupSize}
              </label>
              {filters.personen != null && (
                <button
                  type="button"
                  onClick={() => updateFilters({ ...filters, personen: null })}
                  className="text-xs text-text-secondary hover:text-text underline"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Stepper
                value={filters.personen || 12}
                min={2}
                max={40}
                onChange={(val) =>
                  updateFilters({
                    ...filters,
                    personen: val,
                  })
                }
                label={t.filterGroupSize}
              />
              <span className="text-xs text-text-secondary">
                {filters.personen == null
                  ? L('(nicht gefiltert)', '(not filtered)')
                  : `${filters.personen} ${t.peopleSuffix}`}
              </span>
            </div>
          </div>

          {/* Dauer (Chips: Bis 10, Bis 20, Bis 30, Egal) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">
              {t.filterDuration}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { val: null, label: t.filterDurationAny },
                { val: 10, label: t.filterDuration10 },
                { val: 20, label: t.filterDuration20 },
                { val: 30, label: t.filterDuration30 },
              ].map((opt) => {
                const isSelected = filters.dauer === opt.val;
                return (
                  <Chip
                    key={String(opt.val)}
                    selected={isSelected}
                    onClick={() => updateFilters({ ...filters, dauer: opt.val })}
                  >
                    {opt.label}
                  </Chip>
                );
              })}
            </div>
          </div>

          {/* Energie (SegmentedControl: Alle, Ruhig, Mittel, Lebhaft) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">
              {t.filterEnergy}
            </label>
            <div>
              <SegmentedControl
                options={energyOptions}
                value={filters.energie || 'all'}
                onChange={(val) =>
                  updateFilters({
                    ...filters,
                    energie: val === 'all' ? null : (val as EnergyLevel),
                  })
                }
              />
            </div>
          </div>

          {/* Material (Switch: Ohne Material) */}
          <div className="space-y-2 pt-1 border-t border-border">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-text">
                  {t.filterNoMaterial}
                </p>
                <p className="text-xs text-text-secondary">
                  {L(
                    'Nur Spiele ohne vorbereitetes Material anzeigen',
                    'Show only games needing no prepared materials',
                  )}
                </p>
              </div>
              <Switch
                checked={filters.material === 'ohne'}
                onChange={(checked) =>
                  updateFilters({
                    ...filters,
                    material: checked ? 'ohne' : null,
                  })
                }
                label={t.filterNoMaterial}
              />
            </div>
          </div>

          {/* Ort (Drinnen / Draußen) */}
          <div className="space-y-2 pt-1 border-t border-border">
            <label className="text-sm font-semibold text-text">
              {L('Ort / Spielfläche', 'Setting')}
            </label>
            <SegmentedControl
              options={[
                { id: 'all', label: L('Alle', 'All') },
                { id: 'drinnen', label: L('Drinnen', 'Indoors') },
                { id: 'draussen', label: L('Draußen', 'Outdoors') },
              ]}
              value={filters.ort || 'all'}
              onChange={(val) =>
                updateFilters({
                  ...filters,
                  ort: val === 'all' ? null : (val as 'drinnen' | 'draussen'),
                })
              }
            />
          </div>

          {/* Sortierung (Select: Passend, Kürzeste zuerst, Gruppengröße) */}
          <div className="space-y-2 pt-1 border-t border-border">
            <label className="text-sm font-semibold text-text">
              {t.filterSort}
            </label>
            <Select
              value={filters.sort || 'match'}
              onChange={(e) =>
                updateFilters({
                  ...filters,
                  sort: e.target.value as 'match' | 'duration' | 'groupSize',
                })
              }
              options={[
                { value: 'match', label: t.sortMatch },
                { value: 'duration', label: t.sortDuration },
                { value: 'groupSize', label: t.sortGroupSize },
              ]}
            />
          </div>

          {/* Sheet Footer actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={handleResetFilters}
            >
              {t.resetFilters}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => setIsFilterSheetOpen(false)}
            >
              {t.showResults} ({filteredGames.length})
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};
