import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Search, X, BookOpen, Zap, Layers, Sparkles, Heart,
  ArrowRight, Play, Check, SlidersHorizontal
} from 'lucide-react';
import { QuoteItem, Language, QuoteGeneralTopic, QuoteMethod } from '../types';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { QUOTES_DATA, JUNIOR_YOUTH_BOOKS } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';
import { SegmentedControl } from './ui/SegmentedControl';
import { Sheet } from './ui/Sheet';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { FilterPillDropdown, FilterPillButton } from './ui/FilterPillDropdown';
import { ScrollableFilterBar } from './ui/ScrollableFilterBar';
import { EmptyState } from './ui/EmptyState';

// Quote Card & Detail
import { QuoteCard, isPrayerQuote, formatQuoteSection } from './QuoteCard';
import { QuoteDetail } from './QuoteDetail';

// Interactive Tool Renderer & Maps
import { 
  InteractiveTool, 
  InteractiveToolRenderer, 
  METHOD_TO_TOOL_MAP 
} from './quotes/InteractiveToolRenderer';

interface QuotesViewProps {
  searchQuery?: string;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showOnlyFavorites?: boolean;
  selectedQuoteId?: string | null;
  onSelectQuote?: (quote: QuoteItem) => void;
}

type ViewTab = 'quotes' | 'practice';

export const QuotesView: React.FC<QuotesViewProps> = ({
  searchQuery: externalSearchQuery,
  language,
  favorites,
  onToggleFavorite,
  showOnlyFavorites = false,
  selectedQuoteId: propQuoteId,
}) => {
  const { id: routeQuoteId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const effectiveQuoteId = propQuoteId ?? routeQuoteId;
  const t = UI_TRANSLATIONS[language];
  const isDe = language === 'de';
  const navigate = useNavigate();

  // Route detail page mode: if URL has an ID, display QuoteDetail
  const activeDetailQuote = useMemo(() => {
    if (!effectiveQuoteId) return null;
    return QUOTES_DATA.find((q) => q.id === effectiveQuoteId) || null;
  }, [effectiveQuoteId]);

  // Main 2 Tabs: 'quotes' (Lesen) | 'practice' (Auswendig lernen)
  const [viewTab, setViewTab] = useState<ViewTab>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'practice' || tabParam === 'lernen' || tabParam === 'methods') return 'practice';
    return 'quotes';
  });

  // Filters for Quotes Catalog (initialized from URL searchParams)
  const [localSearch, setLocalSearch] = useState(() => searchParams.get('q') || '');
  const [selectedBook, setSelectedBook] = useState<string>(() => searchParams.get('buch') || 'all');
  const [selectedSection, setSelectedSection] = useState<string>(() => searchParams.get('lektion') || 'all');
  const [selectedTopic, setSelectedTopic] = useState<QuoteGeneralTopic | 'all'>(
    () => (searchParams.get('thema') as QuoteGeneralTopic) || 'all'
  );
  const [onlyPrayers, setOnlyPrayers] = useState<boolean>(() => searchParams.get('gebete') === '1');

  // Practice State
  const [practiceQuote, setPracticeQuote] = useState<QuoteItem>(() => {
    const qParam = searchParams.get('quote');
    if (qParam) {
      const match = QUOTES_DATA.find((q) => q.id === qParam);
      if (match) return match;
    }
    return QUOTES_DATA[0];
  });
  const [activeTool, setActiveTool] = useState<InteractiveTool | null>(() => {
    const toolParam = searchParams.get('tool') as InteractiveTool;
    if (toolParam && Object.values(METHOD_TO_TOOL_MAP).includes(toolParam)) {
      return toolParam;
    }
    if (searchParams.get('practice') === '1') {
      return 'chalkboard';
    }
    return null;
  });
  const [isQuotePickerOpen, setIsQuotePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // 50 Methods Catalog Filter State (search only, no phase filters)
  const [methodSearch, setMethodSearch] = useState('');
  const [selectedMethodForDetail, setSelectedMethodForDetail] = useState<QuoteMethod | null>(null);

  // Sync practice quote & tool when URL searchParams change
  useEffect(() => {
    const qParam = searchParams.get('quote');
    if (qParam) {
      const match = QUOTES_DATA.find((q) => q.id === qParam);
      if (match) {
        setPracticeQuote(match);
      }
    }
    const toolParam = searchParams.get('tool') as InteractiveTool;
    if (toolParam && Object.values(METHOD_TO_TOOL_MAP).includes(toolParam)) {
      setActiveTool(toolParam);
    } else if (searchParams.get('practice') === '1') {
      setActiveTool('chalkboard');
    }
    const tabParam = searchParams.get('tab');
    if (tabParam === 'practice' || tabParam === 'lernen' || tabParam === 'methods') {
      setViewTab('practice');
    } else if (tabParam === 'quotes') {
      setViewTab('quotes');
    }
  }, [searchParams]);

  // Sync external search prop if provided
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setLocalSearch(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // URL Query Params updates helper
  const updateParams = useCallback((newParams: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([k, v]) => {
        if (v === null || v === '' || v === 'all') next.delete(k);
        else next.set(k, v);
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleTabChange = (tab: ViewTab) => {
    setViewTab(tab);
    updateParams({ tab: tab === 'practice' ? 'practice' : null });
  };

  const effectiveSearch = localSearch.trim();

  // Books rank order for sorting
  const getBookRank = (quote: QuoteItem): number => {
    const bookTitleDe = quote.mainBook ? quote.mainBook.de : quote.book.de.split(',')[0].trim();
    const bookTitleEn = quote.mainBook ? quote.mainBook.en : quote.book.en.split(',')[0].trim();
    const matched = JUNIOR_YOUTH_BOOKS.find(
      (b) => b.title.de === bookTitleDe || b.title.en === bookTitleEn
    );
    return matched ? matched.order : 999;
  };

  const getSectionNum = (sectionStr?: string): number => {
    if (!sectionStr) return 999;
    const match = sectionStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
  };

  // Filtered and sorted quotes list
  const filteredQuotes = useMemo(() => {
    const list = QUOTES_DATA.filter((quote) => {
      if (showOnlyFavorites && !favorites.includes(quote.id)) return false;

      if (onlyPrayers && !isPrayerQuote(quote)) return false;

      if (effectiveSearch) {
        const query = effectiveSearch.toLowerCase();
        const textMatch = (isDe ? quote.textDe : quote.textEn).toLowerCase().includes(query);
        const sourceMatch = quote.source[language].toLowerCase().includes(query);
        const themeMatch = quote.theme[language].toLowerCase().includes(query);
        const keywordMatch = quote.keywords?.some((k) => k.toLowerCase().includes(query));
        if (!textMatch && !sourceMatch && !themeMatch && !keywordMatch) return false;
      }

      if (selectedTopic !== 'all' && quote.generalTopic !== selectedTopic) {
        return false;
      }

      if (selectedBook !== 'all') {
        const b = quote.mainBook ? quote.mainBook[language] : quote.book[language].split(',')[0].trim();
        if (b !== selectedBook) return false;
      }

      if (selectedSection !== 'all') {
        if (formatQuoteSection(quote.section?.[language]) !== selectedSection) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      const rankA = getBookRank(a);
      const rankB = getBookRank(b);
      if (rankA !== rankB) return rankA - rankB;

      const secA = getSectionNum(a.section?.de);
      const secB = getSectionNum(b.section?.de);
      if (secA !== secB) return secA - secB;

      return 0;
    });
  }, [effectiveSearch, selectedTopic, selectedBook, selectedSection, onlyPrayers, showOnlyFavorites, favorites, language, isDe]);

  // Unique sections/lessons for selected book
  const availableSections = useMemo(() => {
    if (selectedBook === 'all') return [];
    const set = new Set<string>();
    QUOTES_DATA.forEach((q) => {
      const b = q.mainBook ? q.mainBook[language] : q.book[language].split(',')[0].trim();
      const sec = formatQuoteSection(q.section?.[language]);
      if (b === selectedBook && sec) {
        set.add(sec);
      }
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });
  }, [selectedBook, language]);

  // Dropdown options
  const bookOptions = useMemo(() => [
    { value: 'all', label: isDe ? 'Alle Bücher' : 'All Books' },
    ...JUNIOR_YOUTH_BOOKS.map((b) => ({
      value: b.title[language],
      label: b.title[language],
    })),
  ], [language, isDe]);

  const activeBookOption = bookOptions.find((o) => o.value === selectedBook);
  const activeBookLabel = activeBookOption && activeBookOption.value !== 'all' ? activeBookOption.label : undefined;

  const sectionOptions = useMemo(() => [
    { value: 'all', label: isDe ? 'Alle Lektionen' : 'All Lessons' },
    ...availableSections.map((sec) => ({
      value: sec,
      label: sec,
    })),
  ], [availableSections, isDe]);

  const activeSectionOption = sectionOptions.find((o) => o.value === selectedSection);
  const activeSectionLabel = activeSectionOption && activeSectionOption.value !== 'all' ? activeSectionOption.label : undefined;

  const topicOptions = useMemo(() => [
    { value: 'all', label: isDe ? 'Alle Themen' : 'All Themes' },
    { value: 'einheit', label: t.topicEinheit },
    { value: 'wahrhaftigkeit', label: t.topicWahrhaftigkeit },
    { value: 'dienst', label: t.topicDienst },
    { value: 'gerechtigkeit', label: t.topicGerechtigkeit },
    { value: 'verstand', label: t.topicVerstand },
    { value: 'seele', label: t.topicSeele },
    { value: 'freude', label: t.topicFreude },
    { value: 'gebet', label: t.topicGebet },
  ], [t, isDe]);

  const activeTopicOption = topicOptions.find((o) => o.value === selectedTopic);
  const activeTopicLabel = activeTopicOption && activeTopicOption.value !== 'all' ? activeTopicOption.label : undefined;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBook !== 'all') count++;
    if (selectedSection !== 'all') count++;
    if (selectedTopic !== 'all') count++;
    if (onlyPrayers) count++;
    return count;
  }, [selectedBook, selectedSection, selectedTopic, onlyPrayers]);

  const [showFilters, setShowFilters] = useState<boolean>(() => activeFilterCount > 0);

  const handleResetFilters = () => {
    setSelectedBook('all');
    setSelectedSection('all');
    setSelectedTopic('all');
    setOnlyPrayers(false);
    setLocalSearch('');
    updateParams({
      buch: null,
      lektion: null,
      thema: null,
      gebete: null,
      q: null,
    });
  };

  const handleNextQuoteInBook = () => {
    const bookTitleDe = practiceQuote.mainBook?.de || practiceQuote.book.de.split(',')[0].trim();
    const bookQuotes = QUOTES_DATA.filter(
      (q) => (q.mainBook?.de || q.book.de.split(',')[0].trim()) === bookTitleDe
    );
    const currIdx = bookQuotes.findIndex((q) => q.id === practiceQuote.id);
    const nextIdx = (currIdx + 1) % bookQuotes.length;
    setPracticeQuote(bookQuotes[nextIdx]);
  };

  // Filtered 50 Methods catalog (flat list, no phase filter)
  const filtered50Methods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((m) => {
      if (methodSearch) {
        const query = methodSearch.toLowerCase();
        const nameMatch = m.name[language].toLowerCase().includes(query);
        const sumMatch = m.summary[language].toLowerCase().includes(query);
        if (!nameMatch && !sumMatch) return false;
      }
      return true;
    });
  }, [methodSearch, language]);

  // Filtered quotes in picker dialog
  const pickerQuotes = useMemo(() => {
    if (!pickerSearch) return QUOTES_DATA;
    const query = pickerSearch.toLowerCase();
    return QUOTES_DATA.filter((q) => {
      const text = isDe ? q.textDe : q.textEn;
      return (
        text.toLowerCase().includes(query) ||
        q.source[language].toLowerCase().includes(query) ||
        q.book[language].toLowerCase().includes(query) ||
        q.theme[language].toLowerCase().includes(query)
      );
    });
  }, [pickerSearch, language, isDe]);

  // If viewing a detail page, render QuoteDetail directly!
  if (activeDetailQuote) {
    return (
      <QuoteDetail
        quote={activeDetailQuote}
        language={language}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onBack={() => navigate('/quotes')}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl w-full mx-auto pb-20 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
            {t.tabQuotes}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {isDe
              ? 'Heilige Zitate und Gebete zum Lesen, Reflektieren und Auswendiglernen.'
              : 'Holy scripture verses and prayers for reading, reflection, and memorisation.'}
          </p>
        </div>

        {/* Top 2 Tabs SegmentedControl */}
        <SegmentedControl<ViewTab>
          options={[
            {
              id: 'quotes',
              label: t.tabQuotesRead,
              icon: <BookOpen className="w-4 h-4 text-accent" />,
              count: (effectiveSearch || activeFilterCount > 0) ? filteredQuotes.length : undefined,
            },
            {
              id: 'practice',
              label: t.tabQuotesMemorise,
              icon: <Zap className="w-4 h-4 text-accent" />,
            },
          ]}
          value={viewTab}
          onChange={handleTabChange}
        />
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LESEN (All Quotes & Prayers) */}
      {/* ========================================================================= */}
      {viewTab === 'quotes' && (
        <div className="space-y-3">
          {/* 1. Search Input with Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  updateParams({ q: e.target.value || null });
                }}
                placeholder={
                  isDe
                    ? 'Zitate nach Text, Thema oder Quelle durchsuchen...'
                    : 'Search quotes by text, theme, or source...'
                }
                aria-label={isDe ? 'Zitate durchsuchen' : 'Search quotes'}
                className="w-full h-11 pl-10 pr-11 rounded-control bg-surface border border-border text-sm text-text placeholder:text-text-tertiary focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    updateParams({ q: null });
                  }}
                  aria-label={isDe ? 'Suche löschen' : 'Clear search'}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-tertiary hover:text-text rounded-control focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Native Filter Toggle Button (Matches GamesView & ServiceArtsView) */}
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              aria-expanded={showFilters}
              aria-label={
                showFilters
                  ? (isDe ? 'Filter schließen' : 'Hide filters')
                  : (isDe ? 'Filter öffnen' : 'Show filters')
              }
              className={`min-h-[44px] h-11 px-3.5 rounded-control border text-sm font-semibold inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/15'
                  : 'bg-surface border-border text-text hover:bg-surface-2'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{isDe ? 'Filter' : 'Filters'}</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-2xs font-bold bg-accent text-accent-contrast">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* 2. Collapsible Filter Bar */}
          {showFilters && (
            <ScrollableFilterBar
              activeFilterCount={activeFilterCount + (localSearch ? 1 : 0)}
              onClearAll={handleResetFilters}
              clearLabel={isDe ? 'Filter zurücksetzen' : 'Reset filters'}
            >
              {/* Buch Dropdown */}
              <FilterPillDropdown
                label={isDe ? 'Buch' : 'Book'}
                activeLabel={activeBookLabel}
                isActive={selectedBook !== 'all'}
                icon={<BookOpen className="w-3.5 h-3.5 shrink-0" />}
                options={bookOptions}
                selectedValue={selectedBook}
                onSelect={(val) => {
                  const nextBook = (val as string) || 'all';
                  setSelectedBook(nextBook);
                  setSelectedSection('all');
                  updateParams({
                    buch: nextBook === 'all' ? null : nextBook,
                    lektion: null,
                  });
                }}
              />

              {/* Lektion Dropdown */}
              {selectedBook !== 'all' && sectionOptions.length > 0 && (
                <FilterPillDropdown
                  label={isDe ? 'Lektion' : 'Lesson'}
                  activeLabel={activeSectionLabel}
                  isActive={selectedSection !== 'all'}
                  icon={<Layers className="w-3.5 h-3.5 shrink-0" />}
                  options={sectionOptions}
                  selectedValue={selectedSection}
                  onSelect={(val) => {
                    const nextSec = (val as string) || 'all';
                    setSelectedSection(nextSec);
                    updateParams({ lektion: nextSec === 'all' ? null : nextSec });
                  }}
                />
              )}

              {/* Thema Dropdown */}
              <FilterPillDropdown
                label={isDe ? 'Thema' : 'Theme'}
                activeLabel={activeTopicLabel}
                isActive={selectedTopic !== 'all'}
                icon={<Sparkles className="w-3.5 h-3.5 shrink-0" />}
                options={topicOptions}
                selectedValue={selectedTopic}
                onSelect={(val) => {
                  const nextTopic = (val as QuoteGeneralTopic | 'all') || 'all';
                  setSelectedTopic(nextTopic);
                  updateParams({ thema: nextTopic === 'all' ? null : nextTopic });
                }}
              />

              {/* Nur Gebete 1-Click Toggle Pill */}
              <FilterPillButton
                label={t.filterOnlyPrayers}
                isActive={onlyPrayers}
                onClick={() => {
                  const next = !onlyPrayers;
                  setOnlyPrayers(next);
                  updateParams({ gebete: next ? '1' : null });
                }}
                icon={<Heart className="w-3.5 h-3.5 shrink-0" />}
              />
            </ScrollableFilterBar>
          )}

          {/* Masonry Columns of Quote Cards: 1 col on mobile, 2 cols on desktop */}
          {filteredQuotes.length > 0 ? (
            <>
              {(effectiveSearch || activeFilterCount > 0) && (
                <div className="text-xs text-text-tertiary font-medium mb-1 px-1" aria-live="polite">
                  {filteredQuotes.length} {isDe ? (filteredQuotes.length === 1 ? 'Zitat gefunden' : 'Zitate gefunden') : (filteredQuotes.length === 1 ? 'quote found' : 'quotes found')}
                </div>
              )}
              <div className="columns-1 md:columns-2 gap-5 [column-fill:_balance]">
                {filteredQuotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    language={language}
                    isFavorite={favorites.includes(quote.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSelectQuote={(q) => navigate(`/quotes/${q.id}`)}
                    onPracticeQuote={(q) => navigate(`/quotes?tab=practice&quote=${q.id}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title={isDe ? 'Keine Zitate gefunden' : 'No quotes found'}
              description={isDe ? 'Passe die Filter an oder ändere den Suchbegriff.' : 'Adjust filters or change search term.'}
              actionLabel={isDe ? 'Filter zurücksetzen' : 'Reset filters'}
              onAction={handleResetFilters}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUSWENDIG LERNEN (Flat Overview of Methods & Interactive Web-Apps) */}
      {/* ========================================================================= */}
      {viewTab === 'practice' && (
        <div className="space-y-6">
          {/* Active Practice Quote Banner (always visible at top of practice view) */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                <span className="font-semibold text-accent inline-flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {t.activePracticeQuote}
                </span>
                <span>·</span>
                <span>{practiceQuote.book[language]}</span>
              </div>
              <p className="font-serif text-base sm:text-lg text-text line-clamp-2 italic">
                „{isDe ? practiceQuote.textDe : practiceQuote.textEn}“
              </p>
              <p className="text-2xs text-text-secondary font-serif">
                — {practiceQuote.source[language]}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                onClick={() => setIsQuotePickerOpen(true)}
                className="min-h-[44px]"
              >
                <Search className="w-4 h-4 mr-1.5" />
                <span>{t.chooseAnotherQuote}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleNextQuoteInBook}
                className="min-h-[44px]"
                title={isDe ? 'Nächstes Zitat aus diesem Buch' : 'Next quote in book'}
              >
                <span>{isDe ? 'Nächstes' : 'Next'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/quotes/${practiceQuote.id}`)}
                className="min-h-[44px]"
                title={isDe ? 'Im Lesemodus ansehen' : 'View in reading mode'}
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                <span>{isDe ? 'Lesen' : 'Read'}</span>
              </Button>
            </div>
          </div>

          {/* Active Interactive Simulator (when a Web-App tool is launched) */}
          {activeTool && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* The Active Simulator Container */}
              <InteractiveToolRenderer
                tool={activeTool}
                quote={practiceQuote}
                language={language}
                onClose={() => setActiveTool(null)}
                onSelectTool={(toolId) => setActiveTool(toolId)}
                showSwitcher={true}
              />
            </div>
          )}

          {/* Flat Overview of all 50 Methods (no phase filter) */}
          <div className="space-y-4">
            {/* Section Header & Search Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-text tracking-tight">
                  {isDe ? 'Auswendiglernmethoden' : 'Memorisation Methods'}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {isDe 
                    ? '50 Methoden im Überblick – klicke auf eine Web-App zum sofortigen interaktiven Üben.' 
                    : '50 methods overview – tap on any web app for instant interactive practice.'}
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={methodSearch}
                  onChange={(e) => setMethodSearch(e.target.value)}
                  placeholder={isDe ? 'Methoden durchsuchen...' : 'Search methods...'}
                  aria-label={isDe ? 'Methoden durchsuchen' : 'Search methods'}
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-surface border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent min-h-[44px]"
                />
                {methodSearch && (
                  <button
                    type="button"
                    onClick={() => setMethodSearch('')}
                    aria-label={isDe ? 'Suche löschen' : 'Clear search'}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center text-text-tertiary hover:text-text rounded-control cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Flat Grid of Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered50Methods.map((method) => {
                const toolId = METHOD_TO_TOOL_MAP[method.id];
                const isCurrentToolActive = activeTool === toolId;

                return (
                  <article
                    key={method.id}
                    onClick={() => {
                      if (toolId) {
                        setActiveTool(toolId);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        setSelectedMethodForDetail(method);
                      }
                    }}
                    className={`bg-surface rounded-2xl border p-4 sm:p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-3 ${
                      isCurrentToolActive
                        ? 'border-accent shadow-1 ring-1 ring-accent/30'
                        : 'border-border hover:bg-surface-2/40 hover:shadow-2'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xs text-text-tertiary font-medium">{method.durationMinutes}</span>
                          {method.space && (
                            <span className="text-2xs text-text-tertiary truncate">· {method.space[language]}</span>
                          )}
                        </div>
                        {toolId && (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text border border-accent/20">
                            <Zap className="w-2.5 h-2.5 text-accent" />
                            Web-App
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm sm:text-base text-text">
                        {method.name[language]}
                      </h3>

                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {method.summary[language]}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-border text-xs text-accent font-semibold">
                      {toolId ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCurrentToolActive ? (isDe ? 'Wird oben ausgeführt' : 'Running above') : (isDe ? 'Web-App starten' : 'Launch Web-App')}</span>
                        </span>
                      ) : (
                        <span>{isDe ? 'Anleitung ansehen' : 'View instructions'}</span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </article>
                );
              })}
            </div>

            {filtered50Methods.length === 0 && (
              <EmptyState
                title={isDe ? 'Keine Methoden gefunden' : 'No methods found'}
                description={isDe ? 'Passe den Suchbegriff an.' : 'Adjust search term.'}
                actionLabel={isDe ? 'Suche zurücksetzen' : 'Reset search'}
                onAction={() => {
                  setMethodSearch('');
                }}
              />
            )}
          </div>

          {/* Method Detail Sheet (for instructions) */}
          <Sheet
            isOpen={!!selectedMethodForDetail}
            onClose={() => setSelectedMethodForDetail(null)}
            title={selectedMethodForDetail?.name[language] || ''}
          >
            {selectedMethodForDetail && (
              <div className="space-y-4 py-2 text-sm text-text">
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <span className="font-semibold">{selectedMethodForDetail.durationMinutes}</span>
                  {selectedMethodForDetail.space && (
                    <>
                      <span>·</span>
                      <span>{selectedMethodForDetail.space[language]}</span>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-surface-2 border border-border">
                  <p className="font-medium text-text">{selectedMethodForDetail.summary[language]}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-tertiary">
                    {isDe ? 'Schritt-für-Schritt-Anleitung' : 'Step-by-step instructions'}
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-text-secondary">
                    {selectedMethodForDetail.steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <strong className="text-text font-semibold mr-1">{step.name[language]}:</strong>
                        <span>{step.description[language]}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {METHOD_TO_TOOL_MAP[selectedMethodForDetail.id] && (
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      className="w-full min-h-[44px]"
                      onClick={() => {
                        const tool = METHOD_TO_TOOL_MAP[selectedMethodForDetail.id];
                        setSelectedMethodForDetail(null);
                        setActiveTool(tool);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      <span>{isDe ? 'Jetzt mit Web-App üben' : 'Practice with Web-App now'}</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Sheet>
        </div>
      )}

      {/* Quote Picker Modal Dialog */}
      <Dialog
        isOpen={isQuotePickerOpen}
        onClose={() => setIsQuotePickerOpen(false)}
        title={t.chooseAnotherQuote}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="search"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder={isDe ? 'Zitate durchsuchen...' : 'Search quotes...'}
              aria-label={isDe ? 'Zitate durchsuchen' : 'Search quotes'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent min-h-[44px]"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {pickerQuotes.map((q) => {
              const isSelected = q.id === practiceQuote.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setPracticeQuote(q);
                    setIsQuotePickerOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent-subtle/50'
                      : 'border-border hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-2xs font-bold text-text-tertiary">
                      {q.book[language]}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <p className="font-serif text-xs text-text line-clamp-2">
                    „{isDe ? q.textDe : q.textEn}“
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>
    </div>
  );
};
