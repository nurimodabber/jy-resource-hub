import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft, Clock, Users, Flame, Compass, ArrowUpDown, MapPin, Shuffle, SlidersHorizontal } from 'lucide-react';
import { Language, GamePurpose, EnergyLevel } from '../types';
import { GAMES_DATA } from '../data/games';
import { GameCard } from './GameCard';
import { GamePage } from './GamePage';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { FilterPillDropdown, FilterPillButton } from './ui/FilterPillDropdown';
import { ScrollableFilterBar } from './ui/ScrollableFilterBar';
import { UI_TRANSLATIONS } from '../data/translations';
import { useAdminData } from '../context/AdminDataContext';
import {
  parseGameFilters,
  serializeGameFilters,
  filterGames,
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const adminData = useAdminData();
  const allGames = adminData.games.length > 0 ? adminData.games : GAMES_DATA;

  // User active group size from settings/presence
  const [userGroupSize, setUserGroupSize] = useState<number | null>(() => loadActiveGroupCount());
  useEffect(() => {
    setUserGroupSize(loadActiveGroupCount());
  }, []);

  // Filters initialized from URL search params
  const [filters, setFilters] = useState<GameFilterState>(() =>
    parseGameFilters(searchParams),
  );
  const [showFilters, setShowFilters] = useState(false);

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

  // Filtered game list (hook called unconditionally)
  const filteredGames = useMemo(() => {
    return filterGames(allGames, filters, language);
  }, [allGames, filters, language]);

  const handleRandomGame = () => {
    if (filteredGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredGames.length);
    const randomGame = filteredGames[randomIndex];
    navigate(`/games/${randomGame.id}`);
  };

  // Purpose options for FilterPillDropdown
  const purposeOptions = [
    { value: null, label: t.purposeAll },
    { value: 'kennenlernen' as GamePurpose, label: t.purposeKennenlernen },
    { value: 'energie' as GamePurpose, label: t.purposeEnergie },
    { value: 'zusammenarbeit' as GamePurpose, label: t.purposeZusammenarbeit },
    { value: 'ruhe' as GamePurpose, label: t.purposeRuhe },
    { value: 'raten' as GamePurpose, label: t.purposeRaten },
  ];

  const activePurposeOption = purposeOptions.find((p) => p.value === filters.wirkung);
  const activePurposeLabel =
    activePurposeOption && activePurposeOption.value !== null ? activePurposeOption.label : undefined;

  // Setting options for FilterPillDropdown
  const ortOptions = [
    { value: null, label: L('Alle Orte', 'All settings') },
    { value: 'drinnen', label: L('Drinnen', 'Indoors') },
    { value: 'draussen', label: L('Draußen', 'Outdoors') },
  ];
  const activeOrtOption = ortOptions.find((o) => o.value === filters.ort);
  const activeOrtLabel = activeOrtOption && activeOrtOption.value !== null ? activeOrtOption.label : undefined;

  // Duration options for FilterPillDropdown
  const durationOptions = [
    { value: null, label: t.filterDurationAny },
    { value: 10, label: t.filterDuration10 },
    { value: 20, label: t.filterDuration20 },
    { value: 30, label: t.filterDuration30 },
    { value: 45, label: 'Bis 45 Min.' },
  ];

  // Group size options for FilterPillDropdown
  const groupSizeOptions = useMemo(() => {
    const opts: Array<{ value: number | null; label: string }> = [
      { value: null, label: L('Alle Gruppengrößen', 'All group sizes') },
    ];
    if (userGroupSize && userGroupSize !== 6 && userGroupSize !== 12 && userGroupSize !== 16) {
      opts.push({
        value: userGroupSize,
        label: `${L('Meine Gruppe', 'My group')} (${userGroupSize} ${t.peopleSuffix})`,
      });
    }
    opts.push(
      { value: 6, label: L('Kleine Gruppe (bis 6 Personen)', 'Small group (up to 6)') },
      { value: 12, label: L('Mittlere Gruppe (6 bis 12 Personen)', 'Medium group (6 to 12)') },
      { value: 16, label: L('Große Gruppe (über 12 Personen)', 'Large group (over 12)') },
    );
    return opts;
  }, [userGroupSize, t, L]);

  const activeGroupLabel =
    filters.personen === 6
      ? L('≤ 6 Pers.', '≤ 6 people')
      : filters.personen === 12
      ? L('6–12 Pers.', '6–12 people')
      : filters.personen === 16
      ? L('12+ Pers.', '12+ people')
      : filters.personen != null
      ? `${filters.personen} ${t.peopleSuffix}`
      : undefined;

  // Energy options for FilterPillDropdown
  const energyOptions = [
    { value: null, label: t.filterAll },
    { value: 'calm' as EnergyLevel, label: t.filterCalmEnergy },
    { value: 'medium' as EnergyLevel, label: t.filterMediumEnergy },
    { value: 'high' as EnergyLevel, label: t.filterHighEnergy },
  ];

  const activeEnergyOption = energyOptions.find((e) => e.value === filters.energie);
  const activeEnergyLabel =
    activeEnergyOption && activeEnergyOption.value !== null ? activeEnergyOption.label : undefined;

  // Sort options for FilterPillDropdown
  const sortOptions = [
    { value: 'match' as const, label: t.sortMatch },
    { value: 'duration' as const, label: t.sortDuration },
    { value: 'groupSize' as const, label: t.sortGroupSize },
  ];

  const activeSortLabel =
    filters.sort === 'duration' ? t.sortDuration : filters.sort === 'groupSize' ? t.sortGroupSize : undefined;

  // Total active filter count
  const totalActiveFilterCount = useMemo(() => {
    let count = 0;
    if (filters.wirkung) count++;
    if (filters.ort) count++;
    if (filters.material === 'ohne') count++;
    if (filters.dauer != null) count++;
    if (filters.personen != null) count++;
    if (filters.energie) count++;
    if (filters.sort && filters.sort !== 'match') count++;
    return count;
  }, [filters]);

  const handleClearAll = () => {
    updateFilters({
      q: undefined,
      wirkung: null,
      personen: null,
      dauer: null,
      energie: null,
      material: null,
      ort: null,
      sort: 'match',
    });
  };

  // If a single game ID is passed in route: /games/:id
  const activeGame = useMemo(() => {
    if (!id) return undefined;
    return allGames.find((g) => g.id === id);
  }, [id, allGames]);

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

  const hasActiveFilterOrSearch = Boolean(filters.q || totalActiveFilterCount > 0);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* 1. Header: H1, one sentence, count on search/filter, and random button aligned right */}
      <header className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3.5 flex-wrap">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.12]">
              {t.tabGames}
            </h1>
            {hasActiveFilterOrSearch && (
              <div aria-live="polite" aria-atomic="true">
                <Badge category="neutral" size="md">
                  {filteredGames.length} {t.gamesFound}
                </Badge>
              </div>
            )}
          </div>
          <p className="text-base sm:text-lg text-text-secondary mt-2 max-w-2xl font-normal leading-relaxed">
            {L(
              'Spiele für den Kreis, die Wiese und den Gruppenraum.',
              'Games for the circle, lawn, and group room.'
            )}
          </p>
        </div>

        {/* Random Game Button (aligned with header) */}
        {filteredGames.length > 0 && (
          <button
            type="button"
            onClick={handleRandomGame}
            aria-label={language === 'de' ? 'Zufälliges Spiel' : 'Random game'}
            title={language === 'de' ? 'Zufälliges Spiel' : 'Random game'}
            className="p-3 rounded-full bg-surface hover:bg-surface-2 border border-border/80 text-text-secondary hover:text-accent transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* 2. Search Input with Filter Button on the right */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-0">
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
            className="w-full h-11 pl-10 pr-11 rounded-control bg-surface border border-border/80 text-sm text-text placeholder:text-text-tertiary focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all shadow-2xs"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => updateFilters({ ...filters, q: undefined })}
              aria-label={L('Suche löschen', 'Clear search')}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-tertiary hover:text-text rounded-control focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          aria-expanded={showFilters}
          aria-controls="games-filters-drawer"
          aria-label={
            showFilters
              ? L('Filter schließen', 'Hide filters')
              : L('Filter öffnen', 'Show filters')
          }
          className={`h-11 px-3.5 sm:px-4 rounded-control border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 min-w-[44px] justify-center shadow-2xs ${
            showFilters || totalActiveFilterCount > 0
              ? 'bg-accent/12 border-accent/40 text-accent'
              : 'bg-surface hover:bg-surface-2 border-border/80 text-text-secondary hover:text-text'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{L('Filter', 'Filters')}</span>
          {totalActiveFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-accent-contrast text-2xs font-bold inline-flex items-center justify-center">
              {totalActiveFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. Collapsible Filter Bar */}
      {showFilters && (
        <div id="games-filters-drawer" className="mb-3 animate-in fade-in duration-150">
          <ScrollableFilterBar
            activeFilterCount={totalActiveFilterCount}
            onClearAll={handleClearAll}
            clearLabel={t.clearAllFilters}
          >
            {/* Wirkung Dropdown */}
            <FilterPillDropdown
              label={t.purposeLabel}
              activeLabel={activePurposeLabel}
              isActive={Boolean(filters.wirkung)}
              icon={<Compass className="w-3.5 h-3.5 shrink-0" />}
              options={purposeOptions}
              selectedValue={filters.wirkung || null}
              onSelect={(val) => updateFilters({ ...filters, wirkung: (val as GamePurpose) || null })}
            />

            {/* Ort Dropdown */}
            <FilterPillDropdown
              label={L('Ort', 'Setting')}
              activeLabel={activeOrtLabel}
              isActive={Boolean(filters.ort)}
              icon={<MapPin className="w-3.5 h-3.5 shrink-0" />}
              options={ortOptions}
              selectedValue={filters.ort || null}
              onSelect={(val) => updateFilters({ ...filters, ort: (val as 'drinnen' | 'draussen') || null })}
            />

            {/* Ohne Material Pill (1-Click Toggle) */}
            <FilterPillButton
              label={t.filterNoMaterial}
              isActive={filters.material === 'ohne'}
              onClick={() =>
                updateFilters({
                  ...filters,
                  material: filters.material === 'ohne' ? null : 'ohne',
                })
              }
            />

            {/* Dauer Dropdown */}
            <FilterPillDropdown
              label={t.filterDuration}
              activeLabel={filters.dauer ? `≤ ${filters.dauer} Min.` : undefined}
              isActive={filters.dauer != null}
              icon={<Clock className="w-3.5 h-3.5 shrink-0" />}
              options={durationOptions}
              selectedValue={filters.dauer || null}
              onSelect={(val) => updateFilters({ ...filters, dauer: val as number | null })}
            />

            {/* Gruppengröße Dropdown */}
            <FilterPillDropdown
              label={t.groupLabel}
              activeLabel={activeGroupLabel}
              isActive={filters.personen != null}
              icon={<Users className="w-3.5 h-3.5 shrink-0" />}
              options={groupSizeOptions}
              selectedValue={filters.personen || null}
              onSelect={(val) => updateFilters({ ...filters, personen: val as number | null })}
            />

            {/* Energie Dropdown */}
            <FilterPillDropdown
              label={t.filterEnergy}
              activeLabel={activeEnergyLabel}
              isActive={Boolean(filters.energie)}
              icon={<Flame className="w-3.5 h-3.5 shrink-0" />}
              options={energyOptions}
              selectedValue={filters.energie || null}
              onSelect={(val) => updateFilters({ ...filters, energie: (val as EnergyLevel) || null })}
            />

            {/* Sortierung Dropdown */}
            <FilterPillDropdown
              label={t.filterSort}
              activeLabel={activeSortLabel}
              isActive={Boolean(filters.sort && filters.sort !== 'match')}
              icon={<ArrowUpDown className="w-3.5 h-3.5 shrink-0" />}
              options={sortOptions}
              selectedValue={filters.sort || 'match'}
              onSelect={(val) => updateFilters({ ...filters, sort: (val as 'match' | 'duration' | 'groupSize') || 'match' })}
            />
          </ScrollableFilterBar>
        </div>
      )}

      {/* Live count */}
      <div className="flex items-center justify-between gap-3 text-xs text-text-secondary pt-0.5 pb-2">
        <span className="font-medium">
          {filteredGames.length} {filteredGames.length === 1 ? (language === 'de' ? 'Spiel gefunden' : 'game found') : (language === 'de' ? 'Spiele gefunden' : 'games found')}
        </span>
      </div>

      {/* 4. Games Grid: 1 col on mobile, 2 cols on tablet, 3 cols from 1120px */}
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
    </div>
  );
};
