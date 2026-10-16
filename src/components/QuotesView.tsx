import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Search, X, SlidersHorizontal, BookOpen, Zap, Layers,
  ArrowRight, Laptop, Play
} from 'lucide-react';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/latin-400-italic.css';
import { QuotePhase, QuoteItem, Language, QuoteGeneralTopic, QuoteMethod } from '../types';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { QUOTES_DATA, JUNIOR_YOUTH_BOOKS } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';
import { SegmentedControl } from './ui/SegmentedControl';
import { Sheet } from './ui/Sheet';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { EmptyState } from './ui/EmptyState';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';

// Quote Card & Detail
import { QuoteCard, isPrayerQuote, formatQuoteSection } from './QuoteCard';
import { QuoteDetail } from './QuoteDetail';

// 11 Interactive Practice Simulators (lazy-loaded on studio tab)
const Chalkboard = React.lazy(() => import('./quotes/Chalkboard').then(m => ({ default: m.Chalkboard })));
const FirstLetterBoard = React.lazy(() => import('./quotes/FirstLetterBoard').then(m => ({ default: m.FirstLetterBoard })));
const ClozeTest = React.lazy(() => import('./quotes/ClozeTest').then(m => ({ default: m.ClozeTest })));
const WordPuzzle = React.lazy(() => import('./quotes/WordPuzzle').then(m => ({ default: m.WordPuzzle })));
const ImposterDetector = React.lazy(() => import('./quotes/ImposterDetector').then(m => ({ default: m.ImposterDetector })));
const TypeRecall = React.lazy(() => import('./quotes/TypeRecall').then(m => ({ default: m.TypeRecall })));
const CumulativeCascade = React.lazy(() => import('./quotes/CumulativeCascade').then(m => ({ default: m.CumulativeCascade })));
const MetronomePacer = React.lazy(() => import('./quotes/MetronomePacer').then(m => ({ default: m.MetronomePacer })));
const CodeClicker = React.lazy(() => import('./quotes/CodeClicker').then(m => ({ default: m.CodeClicker })));
const SpeedRunTimer = React.lazy(() => import('./quotes/SpeedRunTimer').then(m => ({ default: m.SpeedRunTimer })));
const FlashReader = React.lazy(() => import('./quotes/FlashReader').then(m => ({ default: m.FlashReader })));

interface QuotesViewProps {
  searchQuery?: string;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showOnlyFavorites?: boolean;
  selectedQuoteId?: string | null;
  onSelectQuote?: (quote: QuoteItem) => void;
}

export type InteractiveTool = 
  | 'chalkboard' 
  | 'firstLetter' 
  | 'cloze' 
  | 'wordPuzzle' 
  | 'imposter' 
  | 'typeRecall' 
  | 'cascade' 
  | 'metronome' 
  | 'codeClicker' 
  | 'speedRun' 
  | 'flashReader';

type ViewTab = 'quotes' | 'practice';
type LearningSubTab = 'studio' | 'methods';

const METHOD_TO_TOOL_MAP: Record<string, InteractiveTool> = {
  'die-verschwindende-tafel': 'chalkboard',
  'erstbuchstaben-geruest': 'firstLetter',
  'zitate-lochkarte': 'cloze',
  'zitate-puzzle-im-raum': 'wordPuzzle',
  'fehler-sucher': 'imposter',
  'kollektives-tafel-schreiben': 'typeRecall',
  'zitate-treppe': 'cascade',
  'metronom-steigerung': 'metronome',
  'der-klick-ersatz': 'codeClicker',
  'kreis-sprint': 'speedRun',
  'echokammer': 'flashReader',
};

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
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();

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

  const [learningSubTab, setLearningSubTab] = useState<LearningSubTab>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'methods') return 'methods';
    return 'studio';
  });

  // Filters for Quotes Catalog (initialized from URL searchParams)
  const [localSearch, setLocalSearch] = useState(() => searchParams.get('q') || '');
  const [selectedBook, setSelectedBook] = useState<string>(() => searchParams.get('buch') || 'all');
  const [selectedSection, setSelectedSection] = useState<string>(() => searchParams.get('lektion') || 'all');
  const [selectedTopic, setSelectedTopic] = useState<QuoteGeneralTopic | 'all'>(
    () => (searchParams.get('thema') as QuoteGeneralTopic) || 'all'
  );
  const [onlyPrayers, setOnlyPrayers] = useState<boolean>(() => searchParams.get('gebete') === '1');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Active Quote in Practice Studio
  const [practiceQuote, setPracticeQuote] = useState<QuoteItem>(() => {
    const qParam = searchParams.get('quote');
    if (qParam) {
      const match = QUOTES_DATA.find((q) => q.id === qParam);
      if (match) return match;
    }
    return QUOTES_DATA[0];
  });

  // Active Interactive Simulator Tool
  const [activeTool, setActiveTool] = useState<InteractiveTool>(() => {
    const toolParam = searchParams.get('tool') as InteractiveTool | null;
    if (toolParam && [
      'chalkboard', 'firstLetter', 'cloze', 'wordPuzzle', 'imposter', 
      'typeRecall', 'cascade', 'metronome', 'codeClicker', 'speedRun', 'flashReader'
    ].includes(toolParam)) {
      return toolParam;
    }
    return 'chalkboard';
  });

  const [isQuotePickerOpen, setIsQuotePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // 50 Methods Filter & Detail Modal
  const [methodPhaseFilter, setMethodPhaseFilter] = useState<QuotePhase | 'all'>('all');
  const [methodSearch, setMethodSearch] = useState('');
  const [selectedMethodForDetail, setSelectedMethodForDetail] = useState<QuoteMethod | null>(null);

  // Sync viewTab with URL
  const handleTabChange = (tab: ViewTab) => {
    setViewTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'quotes') {
        next.delete('tab');
      } else {
        next.set('tab', 'practice');
      }
      return next;
    }, { replace: true });
  };

  const effectiveSearch = externalSearchQuery || localSearch;

  // Sorting helper: Rank by Junior Youth book sequence, then lesson number
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
        const textMatch = (language === 'de' ? quote.textDe : quote.textEn).toLowerCase().includes(query);
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
  }, [effectiveSearch, selectedTopic, selectedBook, selectedSection, onlyPrayers, showOnlyFavorites, favorites, language]);

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
    return Array.from(set);
  }, [selectedBook, language]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBook !== 'all') count++;
    if (selectedSection !== 'all') count++;
    if (selectedTopic !== 'all') count++;
    if (onlyPrayers) count++;
    return count;
  }, [selectedBook, selectedSection, selectedTopic, onlyPrayers]);

  const handleResetFilters = () => {
    setSelectedBook('all');
    setSelectedSection('all');
    setSelectedTopic('all');
    setOnlyPrayers(false);
    setLocalSearch('');
  };

  // Action handlers
  const handleAddToPlan = (quote: QuoteItem) => {
    const isPrayer = isPrayerQuote(quote);
    const result = addSlotToPlan({
      type: isPrayer ? 'devotional' : 'study',
      title: { 
        de: `${isPrayer ? 'Gebet' : 'Zitat'}: ${quote.theme.de}`, 
        en: `${isPrayer ? 'Prayer' : 'Quote'}: ${quote.theme.en}` 
      },
      durationMinutes: isPrayer ? 10 : 20,
      description: { de: quote.textDe, en: quote.textEn },
      referenceId: quote.id,
      referenceType: 'quote',
    });

    showToast({
      text: isPrayer ? t.addedAsDevotional : (language === 'de' ? 'Zitat zum Treffen hinzugefügt' : 'Quote added to meeting'),
      action: {
        label: language === 'de' ? 'Plan öffnen' : 'Open Plan',
        onClick: () => navigate('/planner'),
      },
      undo: {
        label: language === 'de' ? 'Rückgängig' : 'Undo',
        onClick: () => result.undo(),
      },
    });
  };

  const handleStartPractice = (quote: QuoteItem, toolId?: InteractiveTool) => {
    setPracticeQuote(quote);
    if (toolId) setActiveTool(toolId);
    setViewTab('practice');
    setLearningSubTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Filtered 50 Methods catalog
  const filtered50Methods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((m) => {
      if (methodPhaseFilter !== 'all' && m.phase !== methodPhaseFilter) return false;
      if (methodSearch) {
        const query = methodSearch.toLowerCase();
        const nameMatch = m.name[language].toLowerCase().includes(query);
        const sumMatch = m.summary[language].toLowerCase().includes(query);
        if (!nameMatch && !sumMatch) return false;
      }
      return true;
    });
  }, [methodPhaseFilter, methodSearch, language]);

  // Filtered quotes in picker dialog
  const pickerQuotes = useMemo(() => {
    if (!pickerSearch) return QUOTES_DATA;
    const query = pickerSearch.toLowerCase();
    return QUOTES_DATA.filter((q) => {
      const text = language === 'de' ? q.textDe : q.textEn;
      return (
        text.toLowerCase().includes(query) ||
        q.source[language].toLowerCase().includes(query) ||
        q.book[language].toLowerCase().includes(query) ||
        q.theme[language].toLowerCase().includes(query)
      );
    });
  }, [pickerSearch, language]);

  // The 11 Digital Practice Tools
  const interactiveTools: {
    id: InteractiveTool;
    nameDe: string;
    nameEn: string;
    descDe: string;
    descEn: string;
  }[] = [
    { id: 'chalkboard', nameDe: 'Verschwindende Tafel', nameEn: 'Disappearing Board', descDe: 'Wörter schrittweise ausblenden', descEn: 'Progressively blank out words' },
    { id: 'firstLetter', nameDe: 'Erstbuchstaben', nameEn: 'First Letters', descDe: 'Nur noch Anfangsbuchstaben als Stütze', descEn: 'Initial letters as minimal cues' },
    { id: 'cloze', nameDe: 'Lückentext', nameEn: 'Cloze Test', descDe: 'Wörter aus Speicher in Lücken setzen', descEn: 'Fill missing words from the pool' },
    { id: 'wordPuzzle', nameDe: 'Wort-Puzzle', nameEn: 'Word Puzzle', descDe: 'Wörter in Reihenfolge setzen', descEn: 'Reassemble scrambled words' },
    { id: 'imposter', nameDe: 'Fehler-Sucher', nameEn: 'Imposter Spotter', descDe: 'Falsche Wörter im Text finden', descEn: 'Find and fix decoy words' },
    { id: 'typeRecall', nameDe: 'Schreibtrainer', nameEn: 'Type Recall', descDe: 'Aus dem Kopf tippen mit Live-Feedback', descEn: 'Type letter-by-letter from memory' },
    { id: 'cascade', nameDe: 'Zitate-Treppe', nameEn: 'Cascade', descDe: 'Satz für Satz stufenweise aufbauen', descEn: 'Accumulate phrases step by step' },
    { id: 'metronome', nameDe: 'Metronom', nameEn: 'Metronome', descDe: 'Im Takt sprechen zur Verankerung', descEn: 'Recite in rhythmic tempo' },
    { id: 'codeClicker', nameDe: 'Code-Klicker', nameEn: 'Action Triggers', descDe: 'Wörter durch Klatschen ersetzen', descEn: 'Substitute words with actions' },
    { id: 'speedRun', nameDe: 'Speed-Run', nameEn: 'Speed Challenge', descDe: 'Stoppuhr-Challenge im Kreis', descEn: 'Group stopwatch challenge' },
    { id: 'flashReader', nameDe: 'Blitz-Leser', nameEn: 'Flash Reader', descDe: 'Wörter strömen in schnellem Tempo', descEn: 'Flash words at high speed' },
  ];

  // If viewing a detail page, render QuoteDetail directly!
  if (activeDetailQuote) {
    return (
      <QuoteDetail
        quote={activeDetailQuote}
        language={language}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onBack={() => navigate('/quotes')}
        onAddToMeeting={handleAddToPlan}
        onUseAsDevotional={handleAddToPlan}
        onPracticeTool={(quote, toolId) => handleStartPractice(quote, toolId as InteractiveTool)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. Header (No Kopfkarte, clean design token pattern like Phase 00) */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
            {t.tabQuotes}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {language === 'de'
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
              count: filteredQuotes.length,
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
      {/* TAB 1: LESEN (All Quotes & Prayers, Max ONE Line of Controls Before List) */}
      {/* ========================================================================= */}
      {viewTab === 'quotes' && (
        <div className="space-y-4">
          {/* Exactly ONE control row before list: Search input + Filter button */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={language === 'de' ? 'Zitate nach Text, Thema oder Quelle durchsuchen...' : 'Search quotes by text, theme, or source...'}
                className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl bg-surface border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent min-h-[44px]"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  aria-label={language === 'de' ? 'Suche löschen' : 'Clear search'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
              onClick={() => setIsFilterSheetOpen(true)}
              className="shrink-0 min-h-[44px]"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </Button>
          </div>

          {/* Active Removable Filter Chips */}
          {(selectedBook !== 'all' || selectedSection !== 'all' || selectedTopic !== 'all' || onlyPrayers || localSearch) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-text-tertiary">{language === 'de' ? 'Aktive Filter:' : 'Active filters:'}</span>

              {selectedBook !== 'all' && (
                <button
                  type="button"
                  onClick={() => { setSelectedBook('all'); setSelectedSection('all'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-surface-2 border border-border text-text hover:border-accent cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>{selectedBook}</span>
                  <X className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
                </button>
              )}

              {selectedSection !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedSection('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-surface-2 border border-border text-text hover:border-accent cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>{selectedSection}</span>
                  <X className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
                </button>
              )}

              {selectedTopic !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedTopic('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-surface-2 border border-border text-text hover:border-accent cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>{selectedTopic}</span>
                  <X className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
                </button>
              )}

              {onlyPrayers && (
                <button
                  type="button"
                  onClick={() => setOnlyPrayers(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-surface-2 border border-border text-text hover:border-accent cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>{t.filterOnlyPrayers}</span>
                  <X className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
                </button>
              )}

              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-surface-2 border border-border text-text hover:border-accent cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>„{localSearch}“</span>
                  <X className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
                </button>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-2xs text-text-tertiary hover:text-accent underline ml-1 px-2 py-1 min-h-[36px] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
              >
                {language === 'de' ? 'Alle zurücksetzen' : 'Reset all'}
              </button>
            </div>
          )}

          {/* Grid of Quote Cards: 1 col on mobile, 2 col on desktop, clean calm surface */}
          {filteredQuotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  language={language}
                  isFavorite={favorites.includes(quote.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectQuote={(q) => navigate(`/quotes/${q.id}`)}
                  onPracticeQuote={(q) => handleStartPractice(q)}
                  onAddToMeeting={handleAddToPlan}
                  onUseAsDevotional={handleAddToPlan}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={language === 'de' ? 'Keine Zitate gefunden' : 'No quotes found'}
              description={language === 'de' ? 'Passe die Filter an oder ändere den Suchbegriff.' : 'Adjust filters or change search term.'}
              actionLabel={language === 'de' ? 'Filter zurücksetzen' : 'Reset filters'}
              onAction={handleResetFilters}
            />
          )}

          {/* Filter Sheet */}
          <Sheet
            isOpen={isFilterSheetOpen}
            onClose={() => setIsFilterSheetOpen(false)}
            title={language === 'de' ? 'Zitate filtern' : 'Filter Quotes'}
          >
            <div className="space-y-6">
              {/* Only Prayers Checkbox */}
              <div className="p-4 rounded-2xl bg-surface-2 border border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyPrayers}
                    onChange={(e) => setOnlyPrayers(e.target.checked)}
                    className="w-5 h-5 rounded-md border-border text-accent focus:ring-accent cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-text block">
                      {t.filterOnlyPrayers}
                    </span>
                    <span className="text-2xs text-text-secondary block">
                      {language === 'de' ? 'Gebete für den Einstieg oder Abschluss von Treffen' : 'Prayers for opening or closing gatherings'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Book Select */}
              <Select
                label={language === 'de' ? 'Jugendbuch oder Sammlung' : 'Book or Collection'}
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setSelectedSection('all');
                }}
                options={[
                  { value: 'all', label: language === 'de' ? 'Alle Bücher' : 'All Books' },
                  ...JUNIOR_YOUTH_BOOKS.map((b) => ({
                    value: b.title[language],
                    label: `${b.title[language]}${b.isOfficialJYBook ? ` (${b.targetAge})` : ''}`,
                  })),
                ]}
              />

              {/* Section Select (if book has multiple sections) */}
              {availableSections.length > 0 && (
                <Select
                  label={language === 'de' ? 'Lektion / Abschnitt' : 'Lesson / Section'}
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'de' ? 'Alle Lektionen' : 'All Lessons' },
                    ...availableSections.map((sec) => ({
                      value: sec,
                      label: sec,
                    })),
                  ]}
                />
              )}

              {/* Topic Select */}
              <Select
                label={language === 'de' ? 'Spirituales Thema' : 'Spiritual Theme'}
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value as QuoteGeneralTopic | 'all')}
                options={[
                  { value: 'all', label: language === 'de' ? 'Alle Themen' : 'All Themes' },
                  { value: 'einheit', label: language === 'de' ? 'Einheit' : 'Unity' },
                  { value: 'wahrhaftigkeit', label: language === 'de' ? 'Wahrhaftigkeit' : 'Truthfulness' },
                  { value: 'dienst', label: language === 'de' ? 'Dienst' : 'Service' },
                  { value: 'gerechtigkeit', label: language === 'de' ? 'Gerechtigkeit' : 'Justice' },
                  { value: 'verstand', label: language === 'de' ? 'Verstand & Wissen' : 'Intellect' },
                  { value: 'seele', label: language === 'de' ? 'Seele & Geist' : 'Soul & Spirit' },
                  { value: 'freude', label: language === 'de' ? 'Freude' : 'Joy' },
                  { value: 'gebet', label: language === 'de' ? 'Gebet' : 'Prayer' },
                ]}
              />

              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="min-h-[44px]"
                >
                  {language === 'de' ? 'Zurücksetzen' : 'Reset'}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="min-h-[44px]"
                >
                  {language === 'de' ? 'Anwenden' : 'Apply'}
                </Button>
              </div>
            </div>
          </Sheet>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUSWENDIG LERNEN (Studio + 50 Methods Catalog) */}
      {/* ========================================================================= */}
      {viewTab === 'practice' && (
        <div className="space-y-6">
          {/* Active Quote Selector Banner */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                <span className="font-semibold text-accent">{t.activePracticeQuote}</span>
                <span>·</span>
                <span>{practiceQuote.book[language]}</span>
              </div>
              <p className="font-serif text-base sm:text-lg text-text line-clamp-2 italic">
                „{language === 'de' ? practiceQuote.textDe : practiceQuote.textEn}“
              </p>
              <p className="text-2xs text-text-secondary font-serif">
                — {practiceQuote.source[language]}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
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
                title={language === 'de' ? 'Nächstes Zitat aus diesem Buch' : 'Next quote in book'}
              >
                <span>{language === 'de' ? 'Nächstes' : 'Next'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Sub Navigation: Interactive Studio vs All 50 Methods */}
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLearningSubTab('studio')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center gap-2 ${
                  learningSubTab === 'studio'
                    ? 'bg-accent text-accent-contrast shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>{language === 'de' ? 'Interaktive Web-Methoden (11)' : 'Interactive Web Tools (11)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLearningSubTab('methods')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center gap-2 ${
                  learningSubTab === 'methods'
                    ? 'bg-accent text-accent-contrast shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{language === 'de' ? 'Alle 50 Methoden' : 'All 50 Methods'}</span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: Interactive Practice Studio */}
          {learningSubTab === 'studio' && (
            <div className="space-y-6">
              {/* Tool Selector (Horizontal scrollable pills) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {interactiveTools.map((tool) => {
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setActiveTool(tool.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[44px] shrink-0 ${
                        isActive
                          ? 'bg-accent text-accent-contrast border-accent shadow-xs'
                          : 'bg-surface hover:bg-surface-2 border-border text-text'
                      }`}
                    >
                      <span>{language === 'de' ? tool.nameDe : tool.nameEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Hosted Simulator */}
              <div className="bg-surface rounded-3xl border border-border p-4 sm:p-6 shadow-xs">
                <React.Suspense fallback={<div className="h-48 animate-pulse bg-surface-2 rounded-2xl" />}>
                  {activeTool === 'chalkboard' && (
                    <Chalkboard quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'firstLetter' && (
                    <FirstLetterBoard quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'cloze' && (
                    <ClozeTest quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'wordPuzzle' && (
                    <WordPuzzle quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'imposter' && (
                    <ImposterDetector quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'typeRecall' && (
                    <TypeRecall quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'cascade' && (
                    <CumulativeCascade quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'metronome' && (
                    <MetronomePacer quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'codeClicker' && (
                    <CodeClicker quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'speedRun' && (
                    <SpeedRunTimer quote={practiceQuote} language={language} />
                  )}
                  {activeTool === 'flashReader' && (
                    <FlashReader quote={practiceQuote} language={language} />
                  )}
                </React.Suspense>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: All 50 Methods Catalog */}
          {learningSubTab === 'methods' && (
            <div className="space-y-4">
              {/* Phases Segmented Control + Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <SegmentedControl<string>
                  options={[
                    { id: 'all', label: language === 'de' ? 'Alle' : 'All' },
                    { id: '1', label: t.phase1Short },
                    { id: '2', label: t.phase2Short },
                    { id: '3', label: t.phase3Short },
                  ]}
                  value={String(methodPhaseFilter)}
                  onChange={(val) => setMethodPhaseFilter(val === 'all' ? 'all' : Number(val) as QuotePhase)}
                />

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={methodSearch}
                    onChange={(e) => setMethodSearch(e.target.value)}
                    placeholder={language === 'de' ? 'Methoden durchsuchen...' : 'Search methods...'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent min-h-[44px]"
                  />
                </div>
              </div>

              {/* Methods List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered50Methods.map((method) => {
                  const digitalTool = METHOD_TO_TOOL_MAP[method.id];
                  return (
                    <article
                      key={method.id}
                      onClick={() => setSelectedMethodForDetail(method)}
                      className="bg-surface rounded-2xl border border-border p-4 sm:p-5 transition-all duration-150 hover:border-text-secondary/40 cursor-pointer flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary">
                            {method.phase === 1 ? t.phase1Label : method.phase === 2 ? t.phase2Label : t.phase3Label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xs text-text-tertiary">{method.durationMinutes}</span>
                            {digitalTool && (
                              <span
                                className="inline-flex items-center gap-1 text-2xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full"
                                title={t.digitalMethodTooltip}
                              >
                                <Laptop className="w-3 h-3" />
                                <span>{t.digitalMethodBadge}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-semibold text-sm sm:text-base text-text">
                          {method.name[language]}
                        </h3>

                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                          {method.summary[language]}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-border text-xs text-accent font-medium">
                        <span>{language === 'de' ? 'Details ansehen' : 'View details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Method Detail Sheet */}
              <Sheet
                isOpen={!!selectedMethodForDetail}
                onClose={() => setSelectedMethodForDetail(null)}
                title={selectedMethodForDetail?.name[language] || ''}
              >
                {selectedMethodForDetail && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-text">
                        {selectedMethodForDetail.phase === 1
                          ? t.phase1Label
                          : selectedMethodForDetail.phase === 2
                          ? t.phase2Label
                          : t.phase3Label}
                      </span>
                      <span>·</span>
                      <span>{selectedMethodForDetail.durationMinutes}</span>
                      {METHOD_TO_TOOL_MAP[selectedMethodForDetail.id] && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-accent font-semibold">
                            <Laptop className="w-3.5 h-3.5" />
                            <span>{t.digitalMethodBadge}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Single "Üben" button in accent if interactive tool available */}
                    {METHOD_TO_TOOL_MAP[selectedMethodForDetail.id] && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          const tool = METHOD_TO_TOOL_MAP[selectedMethodForDetail.id];
                          setActiveTool(tool);
                          setLearningSubTab('studio');
                          setSelectedMethodForDetail(null);
                        }}
                        className="w-full min-h-[44px]"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        <span>{t.practiceDigitallyNow}</span>
                      </Button>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                        {language === 'de' ? 'Ziel der Methode' : 'Objective'}
                      </h4>
                      <p className="text-sm text-text leading-relaxed">
                        {selectedMethodForDetail.idea[language]}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                        {language === 'de' ? 'Schritte' : 'Steps'}
                      </h4>
                      <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-text leading-relaxed">
                        {selectedMethodForDetail.steps.map((st, i) => (
                          <li key={i} className="pl-1">
                            <span className="font-semibold">{st.name[language]}:</span> {st.description[language]}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                        {language === 'de' ? 'Warum es funktioniert' : 'Why it works'}
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        {selectedMethodForDetail.whyItWorks[language]}
                      </p>
                    </div>

                    {selectedMethodForDetail.animatorTips[language]?.length > 0 && (
                      <div className="space-y-2 p-4 rounded-2xl bg-surface-2 border border-border">
                        <h4 className="text-xs font-bold text-text">
                          {language === 'de' ? 'Tipps für Animatoren' : 'Animator tips'}
                        </h4>
                        <ul className="space-y-1 list-disc list-inside text-xs text-text-secondary">
                          {selectedMethodForDetail.animatorTips[language].map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Sheet>
            </div>
          )}
        </div>
      )}

      {/* Quote Picker Dialog */}
      <Dialog
        isOpen={isQuotePickerOpen}
        onClose={() => setIsQuotePickerOpen(false)}
        title={t.selectQuoteToPractice}
      >
        <div className="space-y-4 max-h-[70vh] flex flex-col">
          <div className="relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder={language === 'de' ? 'Zitat oder Buch suchen...' : 'Search quote or book...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary min-h-[44px]"
            />
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 flex-1">
            {pickerQuotes.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setPracticeQuote(q);
                  setIsQuotePickerOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                  practiceQuote.id === q.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-surface hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between text-2xs text-text-tertiary mb-1">
                  <span>{q.book[language]}{formatQuoteSection(q.section?.[language]) ? ` · ${formatQuoteSection(q.section?.[language])}` : ''}</span>
                  <span className="font-semibold text-text">{q.theme[language]}</span>
                </div>
                <p className="font-serif text-xs line-clamp-2 text-text">
                  „{language === 'de' ? q.textDe : q.textEn}“
                </p>
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    </div>
  );
};
