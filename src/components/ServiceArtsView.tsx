import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, X, ArrowLeft, BookOpen, Tag, SlidersHorizontal } from 'lucide-react';
import {
  Language,
  ActivityItem,
  ActivityKind,
} from '../types';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { useAdminData } from '../context/AdminDataContext';
import { UI_TRANSLATIONS } from '../data/translations';
import { ServiceArtsCard } from './ServiceArtsCard';
import { ServiceArtsDetail } from './ServiceArtsDetail';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { SegmentedControl } from './ui/SegmentedControl';
import { FilterPillDropdown } from './ui/FilterPillDropdown';
import { ScrollableFilterBar } from './ui/ScrollableFilterBar';
import { JY_BOOKS } from '../utils/bookProgress';
import { tr } from './tools/common';

interface ServiceArtsViewProps {
  language: Language;
  searchQuery?: string;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
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

  const adminData = useAdminData();
  const activeServiceProjects = adminData.serviceProjects.length > 0 ? adminData.serviceProjects : SERVICE_PROJECTS_DATA;
  const activeArtsPrompts = adminData.artsPrompts.length > 0 ? adminData.artsPrompts : ARTS_PROMPTS_DATA;

  // Combine items according to fixedKind or unified list
  const allActivities = useMemo<ActivityItem[]>(() => {
    if (fixedKind === 'dienst') return activeServiceProjects;
    if (fixedKind === 'kunst') return activeArtsPrompts;
    return [...activeServiceProjects, ...activeArtsPrompts];
  }, [fixedKind, activeServiceProjects, activeArtsPrompts]);

  // Active game or activity for detail view
  const activeActivity = useMemo(() => {
    if (!id) return undefined;
    const pool = [...activeServiceProjects, ...activeArtsPrompts];
    return pool.find((a) => a.id === id);
  }, [id, activeServiceProjects, activeArtsPrompts]);

  // Filter states parsed from URL searchParams
  const [query, setQuery] = useState(
    searchParams.get('q') || externalSearchQuery || '',
  );
  const [activeKind, setActiveKind] = useState<'all' | ActivityKind>(
    fixedKind || (searchParams.get('art') as 'all' | ActivityKind) || 'all',
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    searchParams.get('kategorie') || 'all',
  );
  const [selectedBook, setSelectedBook] = useState<string>(
    searchParams.get('buch') || 'all',
  );
  const [selectedTheme, setSelectedTheme] = useState<string>(
    searchParams.get('thema') || 'all',
  );
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    const kat = searchParams.get('kategorie');
    const buch = searchParams.get('buch');
    const thema = searchParams.get('thema');
    const art = searchParams.get('art');
    return Boolean(kat || buch || thema || (art && art !== 'all'));
  });

  // Keep state synced with URL searchParams
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const art = (searchParams.get('art') as 'all' | ActivityKind) || 'all';
    const kat = searchParams.get('kategorie') || 'all';
    const buch = searchParams.get('buch') || 'all';
    const thema = searchParams.get('thema') || 'all';

    setQuery(q);
    setActiveKind(art);
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

      // 2. Category or ArtForm (Art)
      if (selectedSubCategory !== 'all') {
        if (item.kind === 'dienst' && item.category !== selectedSubCategory) return false;
        if (item.kind === 'kunst' && item.artForm !== selectedSubCategory) return false;
      }

      // 3. Book filter
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

      // 4. Theme filter
      if (selectedTheme !== 'all') {
        if (!item.theme || (item.theme.de !== selectedTheme && item.theme.en !== selectedTheme)) {
          return false;
        }
      }

      // 5. Search text
      if (q) {
        const title = item.title[language].toLowerCase();
        const obj =
          item.kind === 'dienst'
            ? (item.guidedBy ? item.guidedBy[language].toLowerCase() : item.objective[language].toLowerCase())
            : item.description[language].toLowerCase();
        if (!title.includes(q) && !obj.includes(q)) return false;
      }

      return true;
    });
  }, [
    allActivities,
    activeKind,
    selectedSubCategory,
    selectedBook,
    selectedTheme,
    query,
    language,
  ]);

  // Count active sheet filters
  const activeSheetFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSubCategory !== 'all') count++;
    if (selectedBook !== 'all') count++;
    if (selectedTheme !== 'all') count++;
    return count;
  }, [selectedSubCategory, selectedBook, selectedTheme]);

  const handleClearAll = () => {
    updateParams({
      q: null,
      art: null,
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

  // 1. Art / Category options for FilterPillDropdown
  const categoryOptions = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [
      {
        value: 'all',
        label:
          fixedKind === 'dienst'
            ? L('Alle Dienst-Bereiche', 'All service areas')
            : fixedKind === 'kunst'
            ? L('Alle Kunstformen', 'All art forms')
            : L('Alle Bereiche & Formen', 'All areas & forms'),
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

  // 2. Book options
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

  // 3. Theme options
  const themeOptions = useMemo(() => {
    const unique = new Map<string, string>();
    allActivities.forEach((p) => {
      if (p.theme && !unique.has(p.theme.de)) {
        unique.set(p.theme.de, p.theme[language]);
      }
    });

    return [
      { value: 'all', label: L('Alle Themen', 'All themes') },
      ...Array.from(unique.entries()).map(([deKey, localizedLabel]) => ({
        value: deKey,
        label: localizedLabel,
      })),
    ];
  }, [allActivities, language, L]);

  const activeThemeOption = themeOptions.find((t) => t.value === selectedTheme);
  const activeThemeLabel = activeThemeOption && activeThemeOption.value !== 'all' ? activeThemeOption.label : undefined;

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
      <header className="mb-6 sm:mb-8">
        <div className="flex items-baseline gap-3.5 flex-wrap">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.12]">
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
        <p className="text-base sm:text-lg text-text-secondary mt-2 max-w-2xl font-normal leading-relaxed">
          {pageDesc}
        </p>
      </header>

      {/* 2. Search Input + Filter Toggle Button */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 group">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent pointer-events-none transition-colors duration-150"
            aria-hidden="true"
          />
          <input
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateParams({ q: e.target.value || null });
            }}
            placeholder={searchPlaceholderText}
            aria-label={L('Suchen', 'Search')}
            className="w-full h-11 pl-10 pr-11 rounded-control bg-surface-2/60 hover:bg-surface-2/80 focus:bg-surface border border-line hover:border-text-tertiary/60 focus:border-accent text-sm text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-3 focus:ring-accent/15 transition-all shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                updateParams({ q: null });
              }}
              aria-label={L('Suche löschen', 'Clear search')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text hover:bg-surface-2/80 active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
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
          aria-controls="service-filters-drawer"
          aria-label={
            showFilters
              ? L('Filter schließen', 'Hide filters')
              : L('Filter öffnen', 'Show filters')
          }
          className={`h-11 px-3.5 sm:px-4 rounded-control border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 min-w-[44px] justify-center shadow-2xs ${
            showFilters || activeSheetFilterCount > 0
              ? 'bg-accent/12 border-accent/40 text-accent'
              : 'bg-surface hover:bg-surface-2 border-border/80 text-text-secondary hover:text-text'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{L('Filter', 'Filters')}</span>
          {activeSheetFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-accent-contrast text-2xs font-bold inline-flex items-center justify-center">
              {activeSheetFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick category chips row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-4 -mx-1 px-1">
        {categoryOptions.map((opt) => {
          const isSelected = selectedSubCategory === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                const next = opt.value;
                setSelectedSubCategory(next);
                updateParams({ kategorie: next === 'all' ? null : next });
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer min-h-[36px] flex items-center ${
                isSelected
                  ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                  : 'bg-surface hover:bg-surface-2 text-text-secondary hover:text-text border border-border/80'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 3. Collapsible Filter Bar */}
      {showFilters && (
        <div id="service-filters-drawer" className="mb-3 animate-in fade-in duration-150">
          <ScrollableFilterBar
            activeFilterCount={activeSheetFilterCount + (query ? 1 : 0)}
            onClearAll={handleClearAll}
            clearLabel={L('Filter zurücksetzen', 'Reset filters')}
          >
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

            {/* 1. Art / Bereich Dropdown Pill */}
            <FilterPillDropdown
              label={fixedKind === 'kunst' ? L('Kunstform', 'Art form') : L('Art des Projekts', 'Type of activity')}
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

            {/* 2. Thema Dropdown Pill */}
            <FilterPillDropdown
              label={L('Thema', 'Theme')}
              activeLabel={activeThemeLabel}
              isActive={selectedTheme !== 'all'}
              icon={<Tag className="w-3.5 h-3.5 shrink-0" />}
              options={themeOptions}
              selectedValue={selectedTheme}
              onSelect={(val) => {
                const next = (val as string) || 'all';
                setSelectedTheme(next);
                updateParams({ thema: next === 'all' ? null : next });
              }}
            />

            {/* 3. Juniorjugend-Buch Dropdown Pill */}
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
          </ScrollableFilterBar>
        </div>
      )}

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
