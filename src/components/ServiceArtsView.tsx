import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, X, ArrowLeft, Tent, MapPin, BookOpen, RotateCcw } from 'lucide-react';
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
import { Badge } from './ui/Badge';
import { SegmentedControl } from './ui/SegmentedControl';
import { FilterPillDropdown, FilterPillButton } from './ui/FilterPillDropdown';
import { JY_BOOKS } from '../utils/bookProgress';
import { tr } from './tools/common';

interface ServiceArtsViewProps {
  language: Language;
  searchQuery?: string;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToPlanner?: (slot: SessionSlot) => void;
  fixedKind?: 'dienst' | 'kunst';
}

export const ServiceArtsView: React.FC<ServiceArtsViewProps> = ({
  language,
  searchQuery: externalSearchQuery = '',
  favorites,
  onToggleFavorite,
  fixedKind,
}) => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);

  // Combine items according to fixedKind or unified list
  const allActivities = useMemo<ActivityItem[]>(() => {
    if (fixedKind === 'dienst') return SERVICE_PROJECTS_DATA;
    if (fixedKind === 'kunst') return ARTS_PROMPTS_DATA;
    return [...SERVICE_PROJECTS_DATA, ...ARTS_PROMPTS_DATA];
  }, [fixedKind]);

  // Active game or activity for detail view
  const activeActivity = useMemo(() => {
    if (!id) return undefined;
    const pool = [...SERVICE_PROJECTS_DATA, ...ARTS_PROMPTS_DATA];
    return pool.find((a) => a.id === id);
  }, [id]);

  // Filter states parsed from URL searchParams
  const [query, setQuery] = useState(
    searchParams.get('q') || externalSearchQuery || '',
  );
  const [activeKind, setActiveKind] = useState<'all' | ActivityKind>(
    fixedKind || (searchParams.get('art') as 'all' | ActivityKind) || 'all',
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
  const [selectedBook, setSelectedBook] = useState<string>(
    searchParams.get('buch') || 'all',
  );
  const [selectedTheme, setSelectedTheme] = useState<string>(
    searchParams.get('thema') || 'all',
  );

  // Keep state synced with URL searchParams
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const art = (searchParams.get('art') as 'all' | ActivityKind) || 'all';
    const camp = searchParams.get('camp') === '1';
    const setting = searchParams.get('setting') || 'all';
    const d = searchParams.get('dauer');
    const s = searchParams.get('personen');
    const kat = searchParams.get('kategorie') || 'all';
    const buch = searchParams.get('buch') || 'all';
    const thema = searchParams.get('thema') || 'all';

    setQuery(q);
    setActiveKind(art);
    setIsCampOnly(camp);
    setSettingFilter(setting);
    setMaxDuration(d && !isNaN(Number(d)) ? Number(d) : null);
    setGroupSize(s && !isNaN(Number(s)) ? Number(s) : null);
    setSelectedSubCategory(kat);
    setSelectedBook(buch);
    setSelectedTheme(thema);
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
        if (groupSize === 6) {
          if (item.groupSize.min > 6) return false;
        } else if (groupSize === 12) {
          if (item.groupSize.max < 6 || item.groupSize.min > 12) return false;
        } else if (groupSize === 15) {
          if (item.groupSize.max < 12) return false;
        } else {
          if (groupSize < item.groupSize.min || groupSize > item.groupSize.max) return false;
        }
      }

      // 6. Category or ArtForm
      if (selectedSubCategory !== 'all') {
        if (item.kind === 'dienst' && item.category !== selectedSubCategory) return false;
        if (item.kind === 'kunst' && item.artForm !== selectedSubCategory) return false;
      }

      // 7. Book filter
      if (selectedBook !== 'all') {
        const itemBookId = item.relatedBook;
        const matchesBook =
          itemBookId === selectedBook ||
          (item.kind === 'kunst' && (
            (selectedBook === 'breezes' && (item.book.en.includes('Breezes') || item.book.de.includes('Brise'))) ||
            (selectedBook === 'straight-path' && (item.book.en.includes('Straight Path') || item.book.de.includes('geraden Pfad'))) ||
            (selectedBook === 'power-of-word' && (item.book.en.includes('Power of the Word') || item.book.de.includes('Macht der Worte') || item.book.de.includes('Kraft des Wortes'))) ||
            (selectedBook === 'spirit-of-faith' && (item.book.en.includes('Spirit of Faith') || item.book.de.includes('Geist des Glaubens')))
          ));
        if (!matchesBook) return false;
      }

      // 8. Theme filter
      if (selectedTheme !== 'all') {
        if (item.kind !== 'kunst' || (item.theme.de !== selectedTheme && item.theme.en !== selectedTheme)) {
          return false;
        }
      }

      // 9. Search text
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
    selectedBook,
    selectedTheme,
    query,
    language,
  ]);

  // Count active sheet filters
  const activeSheetFilterCount = useMemo(() => {
    let count = 0;
    if (isCampOnly) count++;
    if (fixedKind === 'kunst') {
      if (selectedSubCategory !== 'all') count++;
      if (selectedBook !== 'all') count++;
    } else if (fixedKind === 'dienst') {
      if (selectedSubCategory !== 'all') count++;
      if (settingFilter !== 'all') count++;
    } else {
      if (settingFilter !== 'all') count++;
      if (maxDuration != null) count++;
      if (groupSize != null) count++;
      if (selectedSubCategory !== 'all') count++;
      if (selectedBook !== 'all') count++;
      if (selectedTheme !== 'all') count++;
    }
    return count;
  }, [isCampOnly, fixedKind, settingFilter, maxDuration, groupSize, selectedSubCategory, selectedBook, selectedTheme]);

  const handleClearAll = () => {
    updateParams({
      q: null,
      art: null,
      camp: null,
      setting: null,
      dauer: null,
      personen: null,
      kategorie: null,
      buch: null,
      thema: null,
    });
  };

  // Kind segment options (for fallback when !fixedKind)
  const kindSegmentOptions = [
    { id: 'all', label: t.filterAll },
    { id: 'dienst', label: t.subtabServiceProjects },
    { id: 'kunst', label: t.subtabArtsPrompts },
  ];

  // Setting options for FilterPillDropdown
  const settingOptions = [
    { value: 'all', label: L('Alle Orte', 'All settings') },
    { value: 'drinnen', label: t.settingDrinnen },
    { value: 'draussen', label: t.settingDraussen },
  ];
  const activeSettingLabel =
    settingFilter === 'drinnen'
      ? t.settingDrinnen
      : settingFilter === 'draussen'
      ? t.settingDraussen
      : undefined;

  // Category options for FilterPillDropdown
  const categoryOptions = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [
      {
        value: 'all',
        label:
          fixedKind === 'dienst'
            ? L('Alle Dienst-Kategorien', 'All service categories')
            : fixedKind === 'kunst'
            ? L('Alle Kunstformen', 'All art forms')
            : L('Alle Kategorien & Formen', 'All categories & forms'),
      },
    ];

    if (fixedKind !== 'kunst') {
      opts.push(
        { value: 'neighborhood', label: fixedKind === 'dienst' ? t.catNeighborhood : `${t.subtabServiceProjects}: ${t.catNeighborhood}` },
        { value: 'environmental', label: fixedKind === 'dienst' ? t.catEnvironmental : `${t.subtabServiceProjects}: ${t.catEnvironmental}` },
        { value: 'intergenerational', label: fixedKind === 'dienst' ? t.catIntergenerational : `${t.subtabServiceProjects}: ${t.catIntergenerational}` },
        { value: 'children', label: fixedKind === 'dienst' ? t.catChildren : `${t.subtabServiceProjects}: ${t.catChildren}` },
        { value: 'institutional', label: fixedKind === 'dienst' ? t.catInstitutional : `${t.subtabServiceProjects}: ${t.catInstitutional}` },
        { value: 'creative', label: fixedKind === 'dienst' ? t.catCreative : `${t.subtabServiceProjects}: ${t.catCreative}` },
      );
    }

    if (fixedKind !== 'dienst') {
      opts.push(
        { value: 'drama', label: fixedKind === 'kunst' ? t.artFormDrama : `${t.subtabArtsPrompts}: ${t.artFormDrama}` },
        { value: 'music_poetry', label: fixedKind === 'kunst' ? t.artFormMusicPoetry : `${t.subtabArtsPrompts}: ${t.artFormMusicPoetry}` },
        { value: 'visual_arts', label: fixedKind === 'kunst' ? t.artFormVisual : `${t.subtabArtsPrompts}: ${t.artFormVisual}` },
        { value: 'collaborative_mural', label: fixedKind === 'kunst' ? t.artFormMural : `${t.subtabArtsPrompts}: ${t.artFormMural}` },
      );
    }

    return opts;
  }, [fixedKind, t, L]);

  const activeCategoryOption = categoryOptions.find((o) => o.value === selectedSubCategory);
  const activeCategoryLabel =
    activeCategoryOption && activeCategoryOption.value !== 'all' ? activeCategoryOption.label : undefined;

  // Book options
  const bookOptions = useMemo(() => {
    const relevantBookIds = ['breezes', 'straight-path', 'power-of-word', 'spirit-of-faith'];
    return [
      { value: 'all', label: L('Alle Bücher', 'All books') },
      ...JY_BOOKS.filter((b) => relevantBookIds.includes(b.id)).map((b) => ({
        value: b.id,
        label: b.title[language],
      })),
    ];
  }, [language, L]);

  const activeBookOption = bookOptions.find((b) => b.value === selectedBook);
  const activeBookLabel = activeBookOption && activeBookOption.value !== 'all' ? activeBookOption.label : undefined;

  // If viewing a detail page /service-arts/:id
  if (id) {
    if (!activeActivity) {
      const overviewPath = fixedKind === 'dienst' ? '/service' : fixedKind === 'kunst' ? '/arts' : '/service';
      const overviewLabel = fixedKind === 'dienst' ? t.backToServiceOverview : fixedKind === 'kunst' ? t.backToArtsOverview : t.backToServiceArtsOverview;
      return (
        <div className="max-w-3xl mx-auto py-12 px-4">
          <EmptyState
            title={t.activityNotFoundTitle}
            description={t.activityNotFoundDesc}
            actionLabel={overviewLabel}
            onAction={() => window.location.assign(overviewPath)}
          />
          <div className="mt-6 text-center">
            <Link
              to={overviewPath}
              className="inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {overviewLabel}
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


  const pageTitle = fixedKind === 'dienst'
    ? t.subtabServiceProjects
    : fixedKind === 'kunst'
    ? t.subtabArtsPrompts
    : t.tabServiceArts;

  const pageDesc = fixedKind === 'dienst'
    ? t.serviceHeaderDesc
    : fixedKind === 'kunst'
    ? t.artsHeaderDesc
    : t.serviceArtsHeaderDesc;

  const searchPlaceholderText = fixedKind === 'dienst'
    ? L('Dienstprojekt suchen...', 'Search service projects...')
    : fixedKind === 'kunst'
    ? L('Kreativimpuls oder Kunstaktion suchen...', 'Search creative activity or drama prompt...')
    : L('Dienstprojekt oder Kunstimpuls suchen...', 'Search service projects or arts prompts...');

  const hasActiveFilterOrSearch = Boolean(query || activeSheetFilterCount > 0);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* 1. Header: H1, one sentence, count on search/filter */}
      <header className="mb-6">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            {pageTitle}
          </h1>
          {hasActiveFilterOrSearch && (
            <div aria-live="polite" aria-atomic="true">
              <Badge category="neutral" size="md">
                {filteredList.length} {L('gefunden', 'found')}
              </Badge>
            </div>
          )}
        </div>
        <p className="text-sm sm:text-base text-text-secondary mt-1 max-w-2xl">
          {pageDesc}
        </p>
      </header>

      {/* 2. Full-Width Search Input */}
      <div className="relative mb-3">
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
          placeholder={searchPlaceholderText}
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

      {/* 3. Coherent Filter Bar directly underneath */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full py-0.5 mb-4 select-none">
        {!fixedKind && (
          <div className="mr-1 shrink-0">
            <SegmentedControl
              options={kindSegmentOptions}
              value={activeKind}
              onChange={(val) => {
                setActiveKind(val as 'all' | ActivityKind);
                updateParams({ art: val === 'all' ? null : val });
              }}
            />
          </div>
        )}

        {fixedKind === 'kunst' ? (
          <>
            {/* Kunstform Dropdown Pill */}
            <FilterPillDropdown
              label={L('Kunstform', 'Art form')}
              activeLabel={activeCategoryLabel}
              isActive={selectedSubCategory !== 'all'}
              options={categoryOptions}
              selectedValue={selectedSubCategory}
              onSelect={(val) => {
                const next = (val as string) || 'all';
                setSelectedSubCategory(next);
                updateParams({ kategorie: next === 'all' ? null : next });
              }}
            />

            {/* Book Dropdown Pill */}
            <FilterPillDropdown
              label={L('Buch', 'Book')}
              activeLabel={activeBookLabel}
              isActive={selectedBook !== 'all'}
              icon={<BookOpen className="w-3.5 h-3.5 shrink-0" />}
              options={bookOptions}
              selectedValue={selectedBook}
              onSelect={(val) => {
                const next = (val as string) || 'all';
                setSelectedBook(next);
                updateParams({ buch: next === 'all' ? null : next });
              }}
            />

            {/* Camp Filter Pill (1-Click Toggle) */}
            <FilterPillButton
              label={t.forCampFilter}
              isActive={isCampOnly}
              onClick={() => {
                const next = !isCampOnly;
                setIsCampOnly(next);
                updateParams({ camp: next ? '1' : null });
              }}
              icon={<Tent className="w-3.5 h-3.5 shrink-0" />}
            />
          </>
        ) : fixedKind === 'dienst' ? (
          <>
            {/* Dienst Kategorie Dropdown Pill */}
            <FilterPillDropdown
              label={t.filterCategoryLabel}
              activeLabel={activeCategoryLabel}
              isActive={selectedSubCategory !== 'all'}
              options={categoryOptions}
              selectedValue={selectedSubCategory}
              onSelect={(val) => {
                const next = (val as string) || 'all';
                setSelectedSubCategory(next);
                updateParams({ kategorie: next === 'all' ? null : next });
              }}
            />

            {/* Setting Dropdown Pill */}
            <FilterPillDropdown
              label={L('Ort', 'Setting')}
              activeLabel={activeSettingLabel}
              isActive={settingFilter !== 'all'}
              icon={<MapPin className="w-3.5 h-3.5 shrink-0" />}
              options={settingOptions}
              selectedValue={settingFilter}
              onSelect={(val) => {
                const next = (val as string) || 'all';
                setSettingFilter(next);
                updateParams({ setting: next === 'all' ? null : next });
              }}
            />

            {/* Camp Filter Pill (1-Click Toggle) */}
            <FilterPillButton
              label={t.forCampFilter}
              isActive={isCampOnly}
              onClick={() => {
                const next = !isCampOnly;
                setIsCampOnly(next);
                updateParams({ camp: next ? '1' : null });
              }}
              icon={<Tent className="w-3.5 h-3.5 shrink-0" />}
            />
          </>
        ) : (
          <>
            {/* Combined View */}
            <FilterPillDropdown
              label={L('Kategorie', 'Category')}
              activeLabel={activeCategoryLabel}
              isActive={selectedSubCategory !== 'all'}
              options={categoryOptions}
              selectedValue={selectedSubCategory}
              onSelect={(val) => {
                const next = (val as string) || 'all';
                setSelectedSubCategory(next);
                updateParams({ kategorie: next === 'all' ? null : next });
              }}
            />
            <FilterPillDropdown
              label={L('Buch', 'Book')}
              activeLabel={activeBookLabel}
              isActive={selectedBook !== 'all'}
              icon={<BookOpen className="w-3.5 h-3.5 shrink-0" />}
              options={bookOptions}
              selectedValue={selectedBook}
              onSelect={(val) => {
                const next = (val as string) || 'all';
                setSelectedBook(next);
                updateParams({ buch: next === 'all' ? null : next });
              }}
            />
            <FilterPillButton
              label={t.forCampFilter}
              isActive={isCampOnly}
              onClick={() => {
                const next = !isCampOnly;
                setIsCampOnly(next);
                updateParams({ camp: next ? '1' : null });
              }}
              icon={<Tent className="w-3.5 h-3.5 shrink-0" />}
            />
          </>
        )}

        {/* Clear all filters button if any filter is active */}
        {(activeSheetFilterCount > 0 || query) && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-xs font-medium text-text-tertiary hover:text-accent hover:bg-surface-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ml-1"
            aria-label={L('Filter zurücksetzen', 'Reset filters')}
          >
            <RotateCcw className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{L('Zurücksetzen', 'Reset')}</span>
          </button>
        )}
      </div>

      {/* 4. Activities Grid: 1 col on mobile, 2 cols on tablet, 3 cols from 1120px */}
      <h2 className="sr-only">{t.tabServiceArts}</h2>
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
    </div>
  );
};
