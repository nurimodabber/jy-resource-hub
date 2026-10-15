import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowLeft, Tent } from 'lucide-react';
import {
  Language,
  ActivityItem,
  ActivityKind,
  SessionSlot,
} from '../types';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { UI_TRANSLATIONS } from '../data/translations';
import { ServiceArtsCard } from './ServiceArtsCard';
import { ServiceArtsDetail } from './ServiceArtsDetail';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Badge } from './ui/Badge';
import { Sheet } from './ui/Sheet';
import { Stepper } from './ui/Stepper';
import { Switch } from './ui/Switch';
import { Select } from './ui/Select';
import { SegmentedControl } from './ui/SegmentedControl';
import { tr } from './tools/common';

interface ServiceArtsViewProps {
  language: Language;
  searchQuery?: string;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToPlanner?: (slot: SessionSlot) => void;
}

export const ServiceArtsView: React.FC<ServiceArtsViewProps> = ({
  language,
  searchQuery: externalSearchQuery = '',
  favorites,
  onToggleFavorite,
}) => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);

  // Combine all items into a single unified list
  const allActivities = useMemo<ActivityItem[]>(
    () => [...SERVICE_PROJECTS_DATA, ...ARTS_PROMPTS_DATA],
    [],
  );

  // Active game or activity for /service-arts/:id
  const activeActivity = useMemo(() => {
    if (!id) return undefined;
    return allActivities.find((a) => a.id === id);
  }, [id, allActivities]);

  // Filter states parsed from URL searchParams
  const [query, setQuery] = useState(
    searchParams.get('q') || externalSearchQuery || '',
  );
  const [activeKind, setActiveKind] = useState<'all' | ActivityKind>(
    (searchParams.get('art') as 'all' | ActivityKind) || 'all',
  );
  const [isCampOnly, setIsCampOnly] = useState<boolean>(
    searchParams.get('camp') === '1',
  );
  const [settingFilter, setSettingFilter] = useState<string>(
    searchParams.get('setting') || 'all',
  );
  const [maxDuration, setMaxDuration] = useState<number | null>(() => {
    const d = searchParams.get('dauer');
    return d && !isNaN(Number(d)) ? Number(d) : null;
  });
  const [groupSize, setGroupSize] = useState<number | null>(() => {
    const s = searchParams.get('personen');
    return s && !isNaN(Number(s)) ? Number(s) : null;
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    searchParams.get('kategorie') || 'all',
  );

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Keep state synced with URL searchParams
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const art = (searchParams.get('art') as 'all' | ActivityKind) || 'all';
    const camp = searchParams.get('camp') === '1';
    const setting = searchParams.get('setting') || 'all';
    const d = searchParams.get('dauer');
    const s = searchParams.get('personen');
    const kat = searchParams.get('kategorie') || 'all';

    setQuery(q);
    setActiveKind(art);
    setIsCampOnly(camp);
    setSettingFilter(setting);
    setMaxDuration(d && !isNaN(Number(d)) ? Number(d) : null);
    setGroupSize(s && !isNaN(Number(s)) ? Number(s) : null);
    setSelectedSubCategory(kat);
  }, [searchParams]);

  // Update URL helper
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === '' || v === 'all') next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next, { replace: true });
  };

  // Filtered Activities
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allActivities.filter((item) => {
      // 1. Kind filter: 'all' | 'dienst' | 'kunst'
      if (activeKind !== 'all' && item.kind !== activeKind) return false;

      // 2. Camp only
      if (isCampOnly && item.occasion !== 'camp' && item.occasion !== 'beides') {
        return false;
      }

      // 3. Setting (drinnen / draussen / beides)
      if (settingFilter !== 'all') {
        if (settingFilter === 'drinnen' && item.setting !== 'drinnen' && item.setting !== 'beides') return false;
        if (settingFilter === 'draussen' && item.setting !== 'draussen' && item.setting !== 'beides') return false;
      }

      // 4. Duration (max minutes)
      if (maxDuration != null && item.durationMin > maxDuration) {
        return false;
      }

      // 5. Group size
      if (groupSize != null) {
        if (groupSize < item.groupSize.min || groupSize > item.groupSize.max) return false;
      }

      // 6. Category or ArtForm
      if (selectedSubCategory !== 'all') {
        if (item.kind === 'dienst' && item.category !== selectedSubCategory) return false;
        if (item.kind === 'kunst' && item.artForm !== selectedSubCategory) return false;
      }

      // 7. Search text
      if (q) {
        const title = item.title[language].toLowerCase();
        const obj =
          item.kind === 'dienst'
            ? item.objective[language].toLowerCase()
            : item.description[language].toLowerCase();
        if (!title.includes(q) && !obj.includes(q)) return false;
      }

      return true;
    });
  }, [
    allActivities,
    activeKind,
    isCampOnly,
    settingFilter,
    maxDuration,
    groupSize,
    selectedSubCategory,
    query,
    language,
  ]);

  // Count active sheet filters
  const activeSheetFilterCount = useMemo(() => {
    let count = 0;
    if (isCampOnly) count++;
    if (settingFilter !== 'all') count++;
    if (maxDuration != null) count++;
    if (groupSize != null) count++;
    if (selectedSubCategory !== 'all') count++;
    return count;
  }, [isCampOnly, settingFilter, maxDuration, groupSize, selectedSubCategory]);

  const handleResetFilters = () => {
    updateParams({
      camp: null,
      setting: null,
      dauer: null,
      personen: null,
      kategorie: null,
    });
  };

  const handleClearAll = () => {
    updateParams({
      q: null,
      art: null,
      camp: null,
      setting: null,
      dauer: null,
      personen: null,
      kategorie: null,
    });
  };

  // If viewing a detail page /service-arts/:id
  if (id) {
    if (!activeActivity) {
      return (
        <div className="max-w-3xl mx-auto py-12 px-4">
          <EmptyState
            title={t.activityNotFoundTitle}
            description={t.activityNotFoundDesc}
            actionLabel={t.backToServiceArtsOverview}
            onAction={() => window.location.assign('/service-arts')}
          />
          <div className="mt-6 text-center">
            <Link
              to="/service-arts"
              className="inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToServiceArtsOverview}
            </Link>
          </div>
        </div>
      );
    }
    return (
      <ServiceArtsDetail
        activity={activeActivity}
        language={language}
        isFavorite={favorites.includes(activeActivity.id)}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  // Kind segment options
  const kindSegmentOptions = [
    { id: 'all', label: t.filterAll, count: allActivities.length },
    { id: 'dienst', label: t.subtabServiceProjects, count: SERVICE_PROJECTS_DATA.length },
    { id: 'kunst', label: t.subtabArtsPrompts, count: ARTS_PROMPTS_DATA.length },
  ];

  // Setting options for filter sheet
  const settingOptions = [
    { id: 'all', label: t.filterAll },
    { id: 'drinnen', label: t.settingDrinnen },
    { id: 'draussen', label: t.settingDraussen },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 sm:px-6">
      {/* 1. Header: H1, one sentence, count */}
      <header className="mb-6">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            {t.tabServiceArts}
          </h1>
          <Badge category="neutral" size="md">
            {allActivities.length} {L('Aktivitäten', 'activities')}
          </Badge>
        </div>
        <p className="text-sm sm:text-base text-text-secondary mt-1 max-w-2xl">
          {t.serviceArtsHeaderDesc}
        </p>
      </header>

      {/* 2. Search row + Filter Button */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateParams({ q: e.target.value || null });
            }}
            placeholder={L('Dienstprojekt oder Kunstimpuls suchen...', 'Search service projects or arts prompts...')}
            aria-label={L('Suchen', 'Search')}
            className="w-full h-11 pl-10 pr-10 rounded-control bg-surface border border-border text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                updateParams({ q: null });
              }}
              aria-label={L('Suche löschen', 'Clear search')}
              className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center text-text-tertiary hover:text-text rounded-control"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Sheet trigger button */}
        <Button
          variant={activeSheetFilterCount > 0 ? 'primary' : 'outline'}
          size="md"
          className="shrink-0 min-h-[44px]"
          onClick={() => setIsFilterSheetOpen(true)}
          aria-label={`${t.filterButton} (${activeSheetFilterCount} ${t.activeFiltersLabel})`}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          <span>{t.filterButton}</span>
          {activeSheetFilterCount > 0 && (
            <span
              className={`ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                activeSheetFilterCount > 0 ? 'bg-white text-accent' : 'bg-surface-2 text-text'
              }`}
            >
              {activeSheetFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* 3. Segmented Control row: Alle · Dienst · Kunst */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <SegmentedControl
          options={kindSegmentOptions}
          value={activeKind}
          onChange={(val) => {
            setActiveKind(val as 'all' | ActivityKind);
            updateParams({ art: val === 'all' ? null : val });
          }}
        />

        {/* Quick Camp Toggle Chip */}
        <Chip
          selected={isCampOnly}
          onClick={() => {
            const next = !isCampOnly;
            setIsCampOnly(next);
            updateParams({ camp: next ? '1' : null });
          }}
        >
          <Tent className="w-4 h-4 mr-1 text-accent" />
          {t.forCampFilter}
        </Chip>
      </div>

      {/* 4. Active removable filter chips */}
      {(activeSheetFilterCount > 0 || activeKind !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 mb-6 pt-1">
          <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider mr-1">
            {t.activeFiltersLabel}:
          </span>

          {activeKind !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setActiveKind('all');
                updateParams({ art: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-accent-subtle text-accent-text text-xs font-semibold hover:bg-accent/20 transition-colors"
            >
              <span>{activeKind === 'dienst' ? t.subtabServiceProjects : t.subtabArtsPrompts}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isCampOnly && (
            <button
              type="button"
              onClick={() => {
                setIsCampOnly(false);
                updateParams({ camp: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-accent-subtle text-accent-text text-xs font-semibold hover:bg-accent/20 transition-colors"
            >
              <span>{t.forCampFilter}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {settingFilter !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setSettingFilter('all');
                updateParams({ setting: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-accent-subtle text-accent-text text-xs font-semibold hover:bg-accent/20 transition-colors"
            >
              <span>{t.settingLabel}: {settingFilter === 'drinnen' ? t.settingDrinnen : t.settingDraussen}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {maxDuration != null && (
            <button
              type="button"
              onClick={() => {
                setMaxDuration(null);
                updateParams({ dauer: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-accent-subtle text-accent-text text-xs font-semibold hover:bg-accent/20 transition-colors"
            >
              <span>{t.filterDuration}: ≤ {maxDuration} Min</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {groupSize != null && (
            <button
              type="button"
              onClick={() => {
                setGroupSize(null);
                updateParams({ personen: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-accent-subtle text-accent-text text-xs font-semibold hover:bg-accent/20 transition-colors"
            >
              <span>{t.filterGroupSize}: {groupSize} {t.peopleSuffix}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {selectedSubCategory !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setSelectedSubCategory('all');
                updateParams({ kategorie: null });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-accent-subtle text-accent-text text-xs font-semibold hover:bg-accent/20 transition-colors"
            >
              <span>{t.filterCategoryLabel}: {selectedSubCategory}</span>
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

      {/* 5. Activities Grid: 1 col on mobile, 2 cols on tablet, 3 cols from 1120px */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 min-[1120px]:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <ServiceArtsCard
              key={item.id}
              activity={item}
              language={language}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={L('Keine Einträge gefunden', 'No entries found')}
          description={L(
            'Passe die Filterkriterien an oder wähle einen anderen Bereich.',
            'Adjust the filter criteria or select a different section.',
          )}
          actionLabel={t.resetFilters}
          onAction={handleClearAll}
        />
      )}

      {/* 6. Filter Sheet */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title={L('Dienst & Kunst filtern', 'Filter Service & Arts')}
      >
        <div className="space-y-6 py-2">
          {/* Camp-Tauglichkeit Switch */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-text">{t.forCampFilter}</p>
              <p className="text-xs text-text-secondary">
                {L('Aktivitäten für Camp-Tage oder intensive Wochenenden', 'Activities for camp days or weekend retreats')}
              </p>
            </div>
            <Switch
              checked={isCampOnly}
              onChange={(checked) => {
                setIsCampOnly(checked);
                updateParams({ camp: checked ? '1' : null });
              }}
              label={t.forCampFilter}
            />
          </div>

          {/* Umgebung (Drinnen / Draußen / Beides) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">{t.settingLabel}</label>
            <div>
              <SegmentedControl
                options={settingOptions}
                value={settingFilter}
                onChange={(val) => {
                  setSettingFilter(val);
                  updateParams({ setting: val === 'all' ? null : val });
                }}
              />
            </div>
          </div>

          {/* Dauer (Chips: bis 60, bis 90, bis 120, egal) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">{t.filterDuration}</label>
            <div className="flex flex-wrap gap-2">
              {[
                { val: null, label: t.filterDurationAny },
                { val: 60, label: 'Bis 60 Min' },
                { val: 90, label: 'Bis 90 Min' },
                { val: 120, label: 'Bis 120 Min' },
              ].map((opt) => {
                const isSelected = maxDuration === opt.val;
                return (
                  <Chip
                    key={String(opt.val)}
                    selected={isSelected}
                    onClick={() => {
                      setMaxDuration(opt.val);
                      updateParams({ dauer: opt.val ? String(opt.val) : null });
                    }}
                  >
                    {opt.label}
                  </Chip>
                );
              })}
            </div>
          </div>

          {/* Personenzahl (Stepper) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text">{t.filterGroupSize}</label>
              {groupSize != null && (
                <button
                  type="button"
                  onClick={() => {
                    setGroupSize(null);
                    updateParams({ personen: null });
                  }}
                  className="text-xs text-text-secondary hover:text-text underline"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Stepper
                value={groupSize || 10}
                min={2}
                max={40}
                onChange={(val) => {
                  setGroupSize(val);
                  updateParams({ personen: String(val) });
                }}
                label={t.filterGroupSize}
              />
              <span className="text-xs text-text-secondary">
                {groupSize == null ? L('(nicht gefiltert)', '(not filtered)') : `${groupSize} ${t.peopleSuffix}`}
              </span>
            </div>
          </div>

          {/* Kategorie oder Kunstform (Select) */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-sm font-semibold text-text">{t.filterCategoryLabel}</label>
            <Select
              value={selectedSubCategory}
              onChange={(e) => {
                setSelectedSubCategory(e.target.value);
                updateParams({ kategorie: e.target.value === 'all' ? null : e.target.value });
              }}
              options={[
                { value: 'all', label: L('Alle Kategorien & Formen', 'All categories & art forms') },
                { value: 'environmental', label: `${t.subtabServiceProjects}: ${t.catEnvironmental}` },
                { value: 'neighborhood', label: `${t.subtabServiceProjects}: ${t.catNeighborhood}` },
                { value: 'intergenerational', label: `${t.subtabServiceProjects}: ${t.catIntergenerational}` },
                { value: 'children', label: `${t.subtabServiceProjects}: ${t.catChildren}` },
                { value: 'institutional', label: `${t.subtabServiceProjects}: ${t.catInstitutional}` },
                { value: 'creative', label: `${t.subtabServiceProjects}: ${t.catCreative}` },
                { value: 'drama', label: `${t.subtabArtsPrompts}: ${t.artFormDrama}` },
                { value: 'music_poetry', label: `${t.subtabArtsPrompts}: ${t.artFormMusicPoetry}` },
                { value: 'visual_arts', label: `${t.subtabArtsPrompts}: ${t.artFormVisual}` },
                { value: 'collaborative_mural', label: `${t.subtabArtsPrompts}: ${t.artFormMural}` },
              ]}
            />
          </div>

          {/* Sheet Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button variant="outline" size="md" className="flex-1" onClick={handleResetFilters}>
              {t.resetFilters}
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={() => setIsFilterSheetOpen(false)}>
              {t.showResults} ({filteredList.length})
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};
