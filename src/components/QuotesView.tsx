import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Search, X, BookOpen, Layers, Sparkles, Heart,
  ArrowLeft, ArrowRight, Play, Check, SlidersHorizontal, Zap, Music, Shuffle
} from 'lucide-react';
import { QuoteItem, Language, QuoteGeneralTopic, QuoteMethod } from '../types';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { QUOTES_DATA, JUNIOR_YOUTH_BOOKS } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';
import { getQuoteSong } from '../data/quoteSongs';
import { SegmentedControl } from './ui/SegmentedControl';
import { Sheet } from './ui/Sheet';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
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

  // 50 Methods Catalog Filter State (search and phase filters)
  const [methodSearch, setMethodSearch] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'apps' | 'phase-1' | 'phase-2' | 'phase-3'>('all');
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

  // Dropdown options (Official Junior Youth books; prayers are accessed via the dedicated "Nur Gebete" toggle)
  const bookOptions = useMemo(() => [
    { value: 'all', label: isDe ? 'Alle Bücher' : 'All Books' },
    ...JUNIOR_YOUTH_BOOKS.filter((b) => b.id !== 'prayers').map((b) => ({
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

  const currentBookQuotes = useMemo(() => {
    const bookTitleDe = practiceQuote.mainBook?.de || practiceQuote.book.de.split(',')[0].trim();
    return QUOTES_DATA.filter(
      (q) => (q.mainBook?.de || q.book.de.split(',')[0].trim()) === bookTitleDe
    );
  }, [practiceQuote]);

  const currentQuoteIndexInBook = useMemo(() => {
    const idx = currentBookQuotes.findIndex((q) => q.id === practiceQuote.id);
    return idx >= 0 ? idx : 0;
  }, [currentBookQuotes, practiceQuote.id]);

  const handleNextQuoteInBook = () => {
    if (currentBookQuotes.length === 0) return;
    const nextIdx = (currentQuoteIndexInBook + 1) % currentBookQuotes.length;
    const nextQuote = currentBookQuotes[nextIdx];
    setPracticeQuote(nextQuote);
    updateParams({ quote: nextQuote.id });
  };

  const handlePrevQuoteInBook = () => {
    if (currentBookQuotes.length === 0) return;
    const prevIdx = (currentQuoteIndexInBook - 1 + currentBookQuotes.length) % currentBookQuotes.length;
    const prevQuote = currentBookQuotes[prevIdx];
    setPracticeQuote(prevQuote);
    updateParams({ quote: prevQuote.id });
  };

  const handleRandomQuote = () => {
    const list = filteredQuotes.length > 0 ? filteredQuotes : QUOTES_DATA;
    const randomIndex = Math.floor(Math.random() * list.length);
    const randomQuote = list[randomIndex];
    if (viewTab === 'practice') {
      setPracticeQuote(randomQuote);
      updateParams({ quote: randomQuote.id });
    } else {
      navigate(`/quotes/${randomQuote.id}`);
    }
  };

  // Filtered 50 Methods catalog with phase and app filters
  const filtered50Methods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((m) => {
      if (selectedPhase === 'apps' && !METHOD_TO_TOOL_MAP[m.id]) {
        return false;
      }
      if (selectedPhase === 'phase-1' && m.phase !== 1) {
        return false;
      }
      if (selectedPhase === 'phase-2' && m.phase !== 2) {
        return false;
      }
      if (selectedPhase === 'phase-3' && m.phase !== 3) {
        return false;
      }
      if (methodSearch) {
        const query = methodSearch.toLowerCase();
        const nameMatch = m.name[language].toLowerCase().includes(query);
        const sumMatch = m.summary[language].toLowerCase().includes(query);
        if (!nameMatch && !sumMatch) return false;
      }
      return true;
    });
  }, [methodSearch, selectedPhase, language]);

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

  const tabOptions = useMemo(
    () => [
      {
        id: 'quotes' as ViewTab,
        label: t.tabQuotesRead,
        icon: <BookOpen className="w-4 h-4" />,
        count: effectiveSearch || activeFilterCount > 0 ? filteredQuotes.length : undefined,
      },
      {
        id: 'practice' as ViewTab,
        label: t.tabQuotesMemorise,
        icon: <Zap className="w-4 h-4 fill-current/20" />,
      },
    ],
    [t.tabQuotesRead, t.tabQuotesMemorise, effectiveSearch, activeFilterCount, filteredQuotes.length]
  );

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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-4">
          <div>
            <h1 className="font-serif text-[32px] sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.15] sm:leading-[1.12]">
              {t.tabQuotes}
            </h1>
            <p className="hidden sm:block text-base sm:text-lg text-text-secondary mt-2 max-w-xl font-normal leading-relaxed">
              {isDe
                ? 'Heilige Zitate und Gebete zum Lesen, Reflektieren und Auswendiglernen.'
                : 'Holy scripture verses and prayers for reading, reflection, and memorisation.'}
            </p>
          </div>

          {/* Desktop: SegmentedControl + Random Quote Button placed on the right next to headline */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <SegmentedControl<ViewTab>
              options={tabOptions}
              value={viewTab}
              onChange={handleTabChange}
            />

            <button
              type="button"
              onClick={handleRandomQuote}
              aria-label={isDe ? 'Zufälliges Zitat' : 'Random quote'}
              title={isDe ? 'Zufälliges Zitat' : 'Random quote'}
              className="p-3 rounded-full bg-surface hover:bg-surface-2 border border-border/80 text-text-secondary hover:text-accent transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile: SegmentedControl with Random Quote Button to the right */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SegmentedControl<ViewTab>
              options={tabOptions}
              value={viewTab}
              onChange={handleTabChange}
              fullWidth
            />
          </div>

          <button
            type="button"
            onClick={handleRandomQuote}
            aria-label={isDe ? 'Zufälliges Zitat' : 'Random quote'}
            title={isDe ? 'Zufälliges Zitat' : 'Random quote'}
            className="p-2.5 rounded-full bg-surface hover:bg-surface-2 border border-border/80 text-text-secondary hover:text-accent transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LESEN (All Quotes & Prayers) */}
      {/* ========================================================================= */}
      {viewTab === 'quotes' && (
        <div className="space-y-3">
          {/* 1. Search Input with Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent pointer-events-none transition-colors duration-150"
                aria-hidden="true"
              />
              <input
                type="text"
                inputMode="search"
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
                className="w-full h-11 pl-10 pr-11 rounded-control bg-surface-2/60 hover:bg-surface-2/80 focus:bg-surface border border-line hover:border-text-tertiary/60 focus:border-accent text-sm text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-3 focus:ring-accent/15 transition-all shadow-2xs"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    updateParams({ q: null });
                  }}
                  aria-label={isDe ? 'Suche löschen' : 'Clear search'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text hover:bg-surface-2/80 active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
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
              className={`min-h-[44px] h-11 px-3.5 rounded-control border text-sm font-semibold inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-2xs ${
                showFilters || activeFilterCount > 0
                  ? 'bg-accent/12 border-accent/40 text-accent hover:bg-accent/18'
                  : 'bg-surface border-border/80 text-text hover:bg-surface-2'
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
                    onPracticeQuote={(q) => {
                      navigate(`/quotes?tab=practice&quote=${q.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
          {/* Active Practice Quote Banner (Hero) */}
          {(() => {
            const practiceSong = getQuoteSong(practiceQuote.id, language);
            return (
              <div className="bg-surface rounded-card border border-border/80 shadow-xs overflow-hidden transition-all duration-200">
                {/* 1. Header Bar: Badge, Book/Lesson info & Quote counter */}
                <div className="px-4 sm:px-6 py-3 bg-surface-2/40 border-b border-border/60 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent-subtle text-accent-text shrink-0">
                      <Zap className="w-3.5 h-3.5 fill-accent/30" />
                      <span>{isDe ? 'Ausgewählt zum Üben' : 'Selected for practice'}</span>
                    </span>
                    <span className="text-border-strong text-xs hidden sm:inline" aria-hidden="true">·</span>
                    <span className="text-xs text-text-secondary font-medium truncate max-w-xs sm:max-w-md">
                      {practiceQuote.book[language]}
                    </span>
                  </div>

                  <span className="text-2xs font-bold text-text-tertiary tabular-nums shrink-0">
                    {isDe 
                      ? `Zitat ${currentQuoteIndexInBook + 1} von ${currentBookQuotes.length}` 
                      : `Quote ${currentQuoteIndexInBook + 1} of ${currentBookQuotes.length}`}
                  </span>
                </div>

                {/* 2. Main Content: Holy text and attribution */}
                <div className="p-5 sm:p-6 pb-3 space-y-2.5">
                  <p className="font-serif text-lg sm:text-xl md:text-2xl text-text leading-relaxed font-normal">
                    {isDe ? `»${practiceQuote.textDe}«` : `“${practiceQuote.textEn}”`}
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary font-sans font-medium">
                    — {practiceQuote.source[language]}
                  </p>
                </div>

                {/* 3. Action Toolbar: Navigation on left, Quick Actions on right */}
                <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
                  {/* Left: Previous & Next Quote in Book Navigation */}
                  <div className="flex items-center gap-1.5">
                    <IconButton
                      variant="outline"
                      size="md"
                      onClick={handlePrevQuoteInBook}
                      label={isDe ? 'Vorheriges Zitat aus diesem Buch' : 'Previous quote in book'}
                      className="bg-surface hover:bg-surface-2 border border-border/80 text-text"
                    >
                      <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                    </IconButton>

                    <span className="text-xs font-semibold text-text-secondary px-2 tabular-nums select-none">
                      {currentQuoteIndexInBook + 1} / {currentBookQuotes.length}
                    </span>

                    <IconButton
                      variant="outline"
                      size="md"
                      onClick={handleNextQuoteInBook}
                      label={isDe ? 'Nächstes Zitat aus diesem Buch' : 'Next quote in book'}
                      className="bg-surface hover:bg-surface-2 border border-border/80 text-text"
                    >
                      <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                    </IconButton>
                  </div>

                  {/* Right: Change Quote, Reading Mode, Song */}
                  <div className="flex items-center gap-1.5">
                    {practiceSong && (
                      <a
                        href={practiceSong.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-control border border-border/80 bg-surface hover:bg-surface-2 text-accent inline-flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                        title={isDe ? `Lied „${practiceSong.title}“ auf bahaisongs.com anhören` : `Listen to song "${practiceSong.title}" on bahaisongs.com`}
                        aria-label={t.quoteSongAriaLabel}
                      >
                        <Music className="w-4 h-4" />
                      </a>
                    )}

                    <IconButton
                      variant="secondary"
                      size="md"
                      onClick={() => setIsQuotePickerOpen(true)}
                      label={t.chooseAnotherQuote}
                      className="bg-surface-2 hover:bg-surface-2/80 border border-border/80 text-text"
                    >
                      <Search className="w-4 h-4" strokeWidth={1.75} />
                    </IconButton>

                    <IconButton
                      variant="outline"
                      size="md"
                      onClick={() => navigate(`/quotes/${practiceQuote.id}`)}
                      label={isDe ? 'Im Lesemodus lesen' : 'Read in reading mode'}
                      className="bg-surface hover:bg-surface-2 border border-border/80 text-text"
                    >
                      <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                    </IconButton>
                  </div>
                </div>
              </div>
            );
          })()}

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
                    ? '50 Methoden im Überblick – wähle eine Web-App zum interaktiven Üben oder erkunde Methoden für die Gruppe.' 
                    : '50 methods overview – tap on any web app for interactive practice or explore group methods.'}
                </p>
              </div>

              <div className="relative w-full sm:w-80 group">
                <Search className="w-4 h-4 text-text-tertiary group-focus-within:text-accent absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150" />
                <input
                  type="text"
                  inputMode="search"
                  value={methodSearch}
                  onChange={(e) => setMethodSearch(e.target.value)}
                  placeholder={isDe ? 'Methoden durchsuchen...' : 'Search methods...'}
                  aria-label={isDe ? 'Methoden durchsuchen' : 'Search methods'}
                  className="w-full h-11 pl-10 pr-10 text-sm rounded-control bg-surface-2/60 hover:bg-surface-2/80 focus:bg-surface border border-line hover:border-text-tertiary/60 focus:border-accent text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-3 focus:ring-accent/15 transition-all shadow-2xs"
                />
                {methodSearch && (
                  <button
                    type="button"
                    onClick={() => setMethodSearch('')}
                    aria-label={isDe ? 'Suche löschen' : 'Clear search'}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text hover:bg-surface-2/80 active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Phase & Web-App Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
              {[
                { id: 'all', label: isDe ? 'Alle Methoden (50)' : 'All methods (50)' },
                { id: 'apps', label: isDe ? 'Interaktive Web-Apps (11)' : 'Interactive Web-Apps (11)' },
                { id: 'phase-1', label: isDe ? '1. Annähern & Rhythmus' : '1. Rhythm & Flow' },
                { id: 'phase-2', label: isDe ? '2. Einprägen & Festigen' : '2. Memorise & Anchor' },
                { id: 'phase-3', label: isDe ? '3. Meistern & Rezitieren' : '3. Master & Recite' },
              ].map((pill) => {
                const isSelected = selectedPhase === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedPhase(pill.id as typeof selectedPhase)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer min-h-[36px] flex items-center ${
                      isSelected
                        ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                        : 'bg-surface hover:bg-surface-2 text-text-secondary hover:text-text border border-border/80'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Grid of Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
                    className={`bg-surface rounded-card border p-5 sm:p-6 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between group shadow-2xs ${
                      isCurrentToolActive
                        ? 'border-accent shadow-1 ring-1 ring-accent/30'
                        : 'border-border/80 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-text-tertiary">
                        <div className="flex items-center gap-2 font-medium flex-wrap">
                          {toolId ? (
                            <span className="px-2.5 py-0.5 rounded-chip text-2xs font-semibold bg-accent/8 text-accent border border-accent/20 inline-flex items-center gap-1">
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{isDe ? 'Web-App' : 'Web App'}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-chip text-2xs font-medium bg-surface-2 text-text-secondary border border-border/70">
                              {method.phase === 1
                                ? isDe ? 'Phase 1: Annähern' : 'Phase 1: Approach'
                                : method.phase === 2
                                ? isDe ? 'Phase 2: Einprägen' : 'Phase 2: Memorise'
                                : isDe ? 'Phase 3: Meistern' : 'Phase 3: Master'}
                            </span>
                          )}
                          <span className="text-2xs text-text-secondary">{method.durationMinutes}</span>
                          {method.space && (
                            <>
                              <span className="text-border" aria-hidden="true">·</span>
                              <span className="text-2xs text-text-secondary truncate">{method.space[language]}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-medium text-text group-hover:text-accent transition-colors leading-snug">
                        {method.name[language]}
                      </h3>

                      <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed">
                        {method.summary[language]}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 flex items-center justify-between border-t border-border/40 text-xs text-accent font-semibold">
                      {toolId ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCurrentToolActive ? (isDe ? 'Wird oben ausgeführt' : 'Running above') : (isDe ? 'Web-App starten' : 'Launch Web-App')}</span>
                        </span>
                      ) : (
                        <span>{isDe ? 'Anleitung ansehen' : 'View instructions'}</span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent pointer-events-none transition-colors duration-150" />
            <input
              type="text"
              inputMode="search"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder={isDe ? 'Zitate durchsuchen...' : 'Search quotes...'}
              aria-label={isDe ? 'Zitate durchsuchen' : 'Search quotes'}
              className="w-full h-11 pl-10 pr-3 text-sm rounded-control bg-surface-2/60 hover:bg-surface-2/80 focus:bg-surface border border-line hover:border-text-tertiary/60 focus:border-accent text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-3 focus:ring-accent/15 transition-all shadow-2xs"
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
                    updateParams({ quote: q.id });
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
