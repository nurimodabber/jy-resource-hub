import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Copy, Check, Bookmark, Search, X, Play, 
  ChevronRight, SlidersHorizontal, 
  MessageCircle, Plus, Layers, BookOpen, Zap,
  Maximize2, Minimize2, ArrowRight,
  Eraser, Type, FileText, Puzzle, Keyboard, Activity, Hand, Timer, Laptop
} from 'lucide-react';
import { QuotePhase, QuoteItem, Language, QuoteGeneralTopic } from '../types';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { QUOTES_DATA, JUNIOR_YOUTH_BOOKS } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';
import { Badge } from './ui/Badge';
import { Dialog } from './ui/Dialog';
import { Sheet } from './ui/Sheet';
import { EmptyState } from './ui/EmptyState';
import { SegmentedControl } from './ui/SegmentedControl';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { generateWhatsAppLink } from '../utils/share';

// Interactive Practice Simulators
import { Chalkboard } from './quotes/Chalkboard';
import { FirstLetterBoard } from './quotes/FirstLetterBoard';
import { ClozeTest } from './quotes/ClozeTest';
import { WordPuzzle } from './quotes/WordPuzzle';
import { ImposterDetector } from './quotes/ImposterDetector';
import { TypeRecall } from './quotes/TypeRecall';
import { CumulativeCascade } from './quotes/CumulativeCascade';
import { MetronomePacer } from './quotes/MetronomePacer';
import { CodeClicker } from './quotes/CodeClicker';
import { SpeedRunTimer } from './quotes/SpeedRunTimer';
import { FlashReader } from './quotes/FlashReader';

interface QuotesViewProps {
  searchQuery: string;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showOnlyFavorites: boolean;
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

type ViewMode = 'quotes' | 'practice' | 'methods';

export const QuotesView: React.FC<QuotesViewProps> = ({
  searchQuery: externalSearchQuery,
  language,
  favorites,
  onToggleFavorite,
  showOnlyFavorites,
  selectedQuoteId: propQuoteId,
  onSelectQuote,
}) => {
  const { id: routeQuoteId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const effectiveQuoteId = propQuoteId ?? routeQuoteId;
  const t = UI_TRANSLATIONS[language];
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();

  // Top view mode: 'quotes' | 'practice' | 'methods'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'practice' || tabParam === 'methods') return tabParam;
    return 'quotes';
  });

  const [localSearch, setLocalSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<QuoteGeneralTopic | 'all'>('all');
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isQuotePickerOpen, setIsQuotePickerOpen] = useState(false);
  const [isFullScreenStudio, setIsFullScreenStudio] = useState(false);

  // Active Quote in Practice & Reading View (defaults to first quote if none selected)
  const [readingQuote, setReadingQuote] = useState<QuoteItem | null>(() => {
    if (effectiveQuoteId) {
      return QUOTES_DATA.find((q) => q.id === effectiveQuoteId) || QUOTES_DATA[0];
    }
    return QUOTES_DATA[0];
  });

  // Reading view modal state (from card click in quotes tab)
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

  // Active Interactive Tool in practice studio
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<InteractiveTool>('chalkboard');

  // Methods catalog filter state
  const [methodPhaseFilter, setMethodPhaseFilter] = useState<QuotePhase | 'all'>('all');
  const [methodSearch, setMethodSearch] = useState('');
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>(null);

  // Sync external deep link
  useEffect(() => {
    if (effectiveQuoteId) {
      const match = QUOTES_DATA.find((q) => q.id === effectiveQuoteId);
      if (match) {
        setReadingQuote(match);
      }
    }
  }, [effectiveQuoteId]);

  // Sync viewMode with search params
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (mode === 'quotes') {
        next.delete('tab');
      } else {
        next.set('tab', mode);
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

      if (selectedSection !== 'all' && quote.section) {
        if (quote.section[language] !== selectedSection) return false;
      }

      return true;
    });

    // Sort by Junior Youth book first, then by section/lesson number
    return list.sort((a, b) => {
      const rankA = getBookRank(a);
      const rankB = getBookRank(b);
      if (rankA !== rankB) return rankA - rankB;

      const secA = getSectionNum(a.section?.de);
      const secB = getSectionNum(b.section?.de);
      if (secA !== secB) return secA - secB;

      return 0;
    });
  }, [effectiveSearch, selectedTopic, selectedBook, selectedSection, showOnlyFavorites, favorites, language]);

  // Unique sections/lessons for selected book
  const availableSections = useMemo(() => {
    if (selectedBook === 'all') return [];
    const set = new Set<string>();
    QUOTES_DATA.forEach((q) => {
      const b = q.mainBook ? q.mainBook[language] : q.book[language].split(',')[0].trim();
      if (b === selectedBook && q.section) {
        set.add(q.section[language]);
      }
    });
    return Array.from(set);
  }, [selectedBook, language]);

  // Catalog of all 11 Interactive Web Tools hosted on the site
  const interactiveTools: {
    id: InteractiveTool;
    nameDe: string;
    nameEn: string;
    descDe: string;
    descEn: string;
    icon: React.FC<{ className?: string }>;
    categoryDe: string;
    categoryEn: string;
    methodId: string;
  }[] = [
    {
      id: 'chalkboard',
      nameDe: 'Die verschwindende Tafel',
      nameEn: 'Disappearing Board',
      descDe: 'Wörter schrittweise ausblenden und aus dem Gedächtnis ergänzen.',
      descEn: 'Erase words progressively and recall them from memory.',
      icon: Eraser,
      categoryDe: 'Visuell',
      categoryEn: 'Visual',
      methodId: 'die-verschwindende-tafel',
    },
    {
      id: 'firstLetter',
      nameDe: 'Erstbuchstaben-Board',
      nameEn: 'First-Letter Anchors',
      descDe: 'Nur noch die Anfangsbuchstaben als kognitive Gedächtnisstütze.',
      descEn: 'Rely only on initial letters as minimal memory cues.',
      icon: Type,
      categoryDe: 'Kognitiv',
      categoryEn: 'Cognitive',
      methodId: 'erstbuchstaben-geruest',
    },
    {
      id: 'cloze',
      nameDe: 'Lückentext-Test',
      nameEn: 'Cloze Challenge',
      descDe: 'Fehlende Wörter aus dem Wortspeicher in die richtigen Lücken einsetzen.',
      descEn: 'Insert missing words from the pool into the correct slots.',
      icon: FileText,
      categoryDe: 'Wortspeicher',
      categoryEn: 'Vocabulary',
      methodId: 'zitate-lochkarte',
    },
    {
      id: 'wordPuzzle',
      nameDe: 'Wort-Puzzle',
      nameEn: 'Word Puzzle',
      descDe: 'Durcheinandergewürfelte Wörter in die richtige Reihenfolge setzen.',
      descEn: 'Assemble scrambled words in correct grammatical order.',
      icon: Puzzle,
      categoryDe: 'Struktur',
      categoryEn: 'Structure',
      methodId: 'zitate-puzzle-im-raum',
    },
    {
      id: 'imposter',
      nameDe: 'Kuckucksei-Detektor',
      nameEn: 'Imposter Spotter',
      descDe: 'Eingeschlichene falsche Wörter im Vers aufspüren und korrigieren.',
      descEn: 'Spot and correct decoy words inserted into the holy verse.',
      icon: Search,
      categoryDe: 'Aufmerksamkeit',
      categoryEn: 'Attention',
      methodId: 'fehler-sucher',
    },
    {
      id: 'typeRecall',
      nameDe: 'Tastatur-Schreibtrainer',
      nameEn: 'Type Recall',
      descDe: 'Echtzeit-Feedback beim Tippen Buchstabe für Buchstabe aus dem Kopf.',
      descEn: 'Live typing feedback letter-by-letter directly from memory.',
      icon: Keyboard,
      categoryDe: 'Motorisch',
      categoryEn: 'Motor',
      methodId: 'kollektives-tafel-schreiben',
    },
    {
      id: 'cascade',
      nameDe: 'Zitate-Treppe (Kumulativ)',
      nameEn: 'Stepwise Cascade',
      descDe: 'Satz für Satz stufenweise aufbauen und akkumulierend rezitieren.',
      descEn: 'Accumulate phrases step by step until the full verse is mastered.',
      icon: Layers,
      categoryDe: 'Kumulativ',
      categoryEn: 'Cumulative',
      methodId: 'zitate-treppe',
    },
    {
      id: 'metronome',
      nameDe: 'Takt-Schritt / Metronom',
      nameEn: 'Rhythm Metronome',
      descDe: 'Im gleichmäßigen 4/4-Takt mit Audio-Klick sprechen zur Sprachverankerung.',
      descEn: 'Recite in rhythmic tempo with audio tick to anchor cadence.',
      icon: Activity,
      categoryDe: 'Rhythmus',
      categoryEn: 'Rhythm',
      methodId: 'metronom-steigerung',
    },
    {
      id: 'codeClicker',
      nameDe: 'Code-Knacker (Aktionswörter)',
      nameEn: 'Action Triggers',
      descDe: 'Bestimmte Wörter durch Klatschen, Schnipsen oder Stampfen ersetzen.',
      descEn: 'Substitute selected keywords with simultaneous physical actions.',
      icon: Hand,
      categoryDe: 'Kinästhetisch',
      categoryEn: 'Kinesthetic',
      methodId: 'der-klick-ersatz',
    },
    {
      id: 'speedRun',
      nameDe: 'Speed-Run Stopwatch',
      nameEn: 'Speed Challenge',
      descDe: 'Schnelligkeits-Challenge im Kreis für flüssiges, fehlerfreies Sprechen.',
      descEn: 'Group speed challenge for fluent recitation without hesitation.',
      icon: Timer,
      categoryDe: 'Gruppenspiel',
      categoryEn: 'Group',
      methodId: 'kreis-sprint',
    },
    {
      id: 'flashReader',
      nameDe: 'Blitz-Leser (RSVP)',
      nameEn: 'Flash Reader (RSVP)',
      descDe: 'Wörter strömen in schnellem Tempo zur Beseitigung von Leseverzögerungen.',
      descEn: 'Flashes words at high speed to eliminate vocal hesitation.',
      icon: Zap,
      categoryDe: 'Fokus',
      categoryEn: 'Focus',
      methodId: 'echokammer',
    },
  ];

  // Topics for horizontal filter row
  const topics: { id: QuoteGeneralTopic; labelDe: string; labelEn: string }[] = [
    { id: 'einheit', labelDe: 'Einheit', labelEn: 'Unity' },
    { id: 'wahrhaftigkeit', labelDe: 'Wahrhaftigkeit', labelEn: 'Truthfulness' },
    { id: 'dienst', labelDe: 'Dienst', labelEn: 'Service' },
    { id: 'gerechtigkeit', labelDe: 'Gerechtigkeit', labelEn: 'Justice' },
    { id: 'verstand', labelDe: 'Verstand & Wissen', labelEn: 'Intellect' },
    { id: 'seele', labelDe: 'Seele & Geist', labelEn: 'Soul & Spirit' },
    { id: 'freude', labelDe: 'Freude', labelEn: 'Joy' },
    { id: 'gebet', labelDe: 'Gebet', labelEn: 'Prayer' },
  ];

  // Handlers for quote actions
  const handleOpenReadingModal = (quote: QuoteItem) => {
    setReadingQuote(quote);
    setIsReadingModalOpen(true);
    if (onSelectQuote) onSelectQuote(quote);
  };

  const handleStartPractice = (quote: QuoteItem, toolId?: InteractiveTool) => {
    setReadingQuote(quote);
    if (toolId) setActiveInteractiveTool(toolId);
    setViewMode('practice');
    setIsReadingModalOpen(false);
    if (onSelectQuote) onSelectQuote(quote);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextQuoteInBook = () => {
    if (!readingQuote) return;
    const bookTitleDe = readingQuote.mainBook?.de || readingQuote.book.de.split(',')[0].trim();
    const bookQuotes = QUOTES_DATA.filter(
      (q) => (q.mainBook?.de || q.book.de.split(',')[0].trim()) === bookTitleDe
    );
    const currIdx = bookQuotes.findIndex((q) => q.id === readingQuote.id);
    const nextIdx = (currIdx + 1) % bookQuotes.length;
    setReadingQuote(bookQuotes[nextIdx]);
  };

  const handleAddToPlan = (quote: QuoteItem) => {
    const result = addSlotToPlan({
      type: 'study',
      title: { de: `Zitat: ${quote.theme.de}`, en: `Quote: ${quote.theme.en}` },
      durationMinutes: 20,
      description: { de: quote.textDe, en: quote.textEn },
      referenceId: quote.id,
      referenceType: 'quote',
    });

    showToast({
      text: language === 'de' ? 'Zitat zum Plan hinzugefügt' : 'Quote added to plan',
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

  const [copiedQuote, setCopiedQuote] = useState(false);
  const handleCopyQuote = (quote: QuoteItem) => {
    const text = `„${language === 'de' ? quote.textDe : quote.textEn}“\n— ${quote.source[language]} (${quote.book[language]})`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // Filtered 50 Methods catalog
  const filteredAllMethods = useMemo(() => {
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* 1. Header & Top Mode Navigation Bar */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              {t.tabQuotes}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              {language === 'de'
                ? `${QUOTES_DATA.length} heilige Zitate aus 11 Jugendbüchern & ${QUOTE_METHODS_DATA.length} Verinnerlichungsmethoden.`
                : `${QUOTES_DATA.length} scripture verses from 11 junior youth books and ${QUOTE_METHODS_DATA.length} memorisation methods.`}
            </p>
          </div>

          {/* Top Segmented Mode Control */}
          <div className="shrink-0">
            <SegmentedControl<ViewMode>
              options={[
                {
                  id: 'quotes',
                  label: t.tabQuotesCatalog,
                  icon: <BookOpen className="w-3.5 h-3.5 text-accent-text" />,
                  count: filteredQuotes.length,
                },
                {
                  id: 'practice',
                  label: t.tabPracticeStudio,
                  icon: <Zap className="w-3.5 h-3.5 text-accent-text" />,
                },
                {
                  id: 'methods',
                  label: t.tabAllMethods,
                  icon: <Layers className="w-3.5 h-3.5 text-accent-text" />,
                  count: QUOTE_METHODS_DATA.length,
                },
              ]}
              value={viewMode}
              onChange={handleViewModeChange}
            />
          </div>
        </div>

        {/* Dynamic Controls based on selected View Mode */}
        {viewMode === 'quotes' && (
          <div className="space-y-3 pt-2 border-t border-border">
            {/* Search Bar & Book/Lesson Filter Sheet Trigger */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={language === 'de' ? 'Zitate nach Text, Thema oder Quelle durchsuchen...' : 'Search quotes by text, theme, or source...'}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => setLocalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text p-1 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer min-h-[40px] shrink-0 ${
                  selectedBook !== 'all' || selectedSection !== 'all'
                    ? 'bg-accent text-accent-contrast border-accent'
                    : 'bg-surface-2 text-text-secondary hover:text-text border-border'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'de' ? 'Buch & Lektion' : 'Book & Lesson'}</span>
                {(selectedBook !== 'all' || selectedSection !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-accent-contrast ml-0.5" />
                )}
              </button>
            </div>

            {/* Canonical Junior Youth Book Pills Filter Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => { setSelectedBook('all'); setSelectedSection('all'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                  selectedBook === 'all'
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {t.allJuniorYouthBooks}
              </button>

              {JUNIOR_YOUTH_BOOKS.map((book) => {
                const bookTitle = book.title[language];
                const isSelected = selectedBook === bookTitle;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => { setSelectedBook(isSelected ? 'all' : bookTitle); setSelectedSection('all'); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                        : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                    }`}
                  >
                    <span>{bookTitle}</span>
                    {book.isOfficialJYBook && (
                      <span className={`text-2xs opacity-75 font-mono ${isSelected ? 'text-accent-contrast' : 'text-text-tertiary'}`}>
                        ({book.targetAge})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Spiritual Topic Filters Row */}
            <div className="pt-2 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedTopic('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[30px] cursor-pointer ${
                  selectedTopic === 'all'
                    ? 'bg-surface-raised text-text font-semibold border border-accent/40 shadow-2xs'
                    : 'text-text-tertiary hover:text-text'
                }`}
              >
                {language === 'de' ? 'Alle Themen' : 'All Themes'}
              </button>
              {topics.map((top) => (
                <button
                  key={top.id}
                  type="button"
                  onClick={() => setSelectedTopic(selectedTopic === top.id ? 'all' : top.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[30px] cursor-pointer ${
                    selectedTopic === top.id
                      ? 'bg-surface-raised text-text font-semibold border border-accent/40 shadow-2xs'
                      : 'text-text-tertiary hover:text-text'
                  }`}
                >
                  {language === 'de' ? top.labelDe : top.labelEn}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: QUOTES CATALOG (Sorted by Junior Youth Book First) */}
      {/* ========================================================================= */}
      {viewMode === 'quotes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Active Filter Chips */}
          {(selectedBook !== 'all' || selectedSection !== 'all' || selectedTopic !== 'all' || localSearch) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-text-tertiary">{language === 'de' ? 'Aktive Filter:' : 'Active filters:'}</span>
              {selectedBook !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-text">
                  <span>Buch: {selectedBook}</span>
                  <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => { setSelectedBook('all'); setSelectedSection('all'); }} />
                </span>
              )}
              {selectedSection !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-text">
                  <span>Lektion: {selectedSection}</span>
                  <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedSection('all')} />
                </span>
              )}
              {selectedTopic !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-text">
                  <span>Thema: {topics.find((t) => t.id === selectedTopic)?.[language === 'de' ? 'labelDe' : 'labelEn']}</span>
                  <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedTopic('all')} />
                </span>
              )}
              <button
                type="button"
                onClick={() => { setSelectedBook('all'); setSelectedSection('all'); setSelectedTopic('all'); setLocalSearch(''); }}
                className="text-2xs font-semibold text-accent-text hover:underline cursor-pointer ml-1"
              >
                {language === 'de' ? 'Alle zurücksetzen' : 'Reset all'}
              </button>
            </div>
          )}

          {/* Quotes Grid: 3 columns on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredQuotes.map((quote) => {
              const bookTitle = quote.mainBook ? quote.mainBook[language] : quote.book[language].split(',')[0].trim();
              return (
                <article
                  key={quote.id}
                  className="group relative bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs hover:border-brand/40 hover:shadow-apple-card-hover transition-all flex flex-col justify-between"
                  aria-label={`${quote.theme[language]}: „${language === 'de' ? quote.textDe.slice(0, 40) : quote.textEn.slice(0, 40)}...“`}
                >
                  <div>
                    {/* Top Badges: Book & Lesson + Bookmark */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <Badge category="study" size="sm">
                          {bookTitle}
                        </Badge>
                        {quote.section && (
                          <Badge category="neutral" size="sm">
                            {quote.section[language]}
                          </Badge>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => onToggleFavorite(quote.id, e)}
                        className={`p-1.5 rounded-full text-text-tertiary hover:text-text transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer ${
                          favorites.includes(quote.id) ? 'text-accent-contrast bg-accent hover:bg-accent-hover' : ''
                        }`}
                        aria-label="Lesezeichen"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${favorites.includes(quote.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Theme header and quote excerpt as an accessible button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReadingModal(quote)}
                      className="w-full text-left group/quote focus:outline-hidden cursor-pointer"
                    >
                      <h3 className="text-xs font-bold text-text mb-1.5 truncate group-hover/quote:text-brand transition-colors">
                        {quote.theme[language]}
                      </h3>

                      <blockquote className="font-serif italic text-sm sm:text-base text-text leading-relaxed line-clamp-3 mb-3 group-hover/quote:text-brand/90 transition-colors">
                        „{language === 'de' ? quote.textDe : quote.textEn}“
                      </blockquote>
                    </button>
                  </div>

                  {/* Actions & Source Line */}
                  <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
                    <span className="font-serif text-2xs text-text-tertiary truncate">
                      — {quote.source[language]}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartPractice(quote)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-accent text-accent-contrast text-2xs font-semibold hover:bg-accent-hover transition-colors cursor-pointer min-h-[28px] shadow-2xs"
                        title={t.practiceThisQuote}
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>{language === 'de' ? 'Üben' : 'Practice'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReadingModal(quote)}
                        className="p-1 rounded-lg text-text-tertiary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                        title={language === 'de' ? 'Details ansehen' : 'View details'}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredQuotes.length === 0 && (
            <EmptyState
              title={language === 'de' ? 'Keine Zitate gefunden' : 'No quotes found'}
              description={language === 'de' ? 'Versuche, die aktiven Filter zurückzusetzen oder einen anderen Suchbegriff einzugeben.' : 'Try clearing your active filters or entering a different search keyword.'}
              actionLabel={selectedTopic !== 'all' || selectedBook !== 'all' || selectedSection !== 'all' || localSearch ? (language === 'de' ? 'Filter & Suche zurücksetzen' : 'Reset filters & search') : undefined}
              onAction={() => {
                setSelectedTopic('all');
                setSelectedBook('all');
                setSelectedSection('all');
                setLocalSearch('');
              }}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INTERACTIVE PRACTICE STUDIO (All Methods Hosted on Site) */}
      {/* ========================================================================= */}
      {viewMode === 'practice' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Active Quote Selector Banner */}
          {readingQuote ? (
            <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xs font-bold uppercase tracking-wider text-accent-text">
                    {language === 'de' ? 'Aktives Zitat zum Lernen:' : 'Active Quote to Memorise:'}
                  </span>
                  <Badge category="study" size="sm">
                    {readingQuote.mainBook ? readingQuote.mainBook[language] : readingQuote.book[language]}
                  </Badge>
                  {readingQuote.section && (
                    <Badge category="neutral" size="sm">
                      {readingQuote.section[language]}
                    </Badge>
                  )}
                </div>

                <blockquote className="font-serif italic text-base sm:text-lg text-text line-clamp-2">
                  „{language === 'de' ? readingQuote.textDe : readingQuote.textEn}“
                </blockquote>

                <p className="text-2xs text-text-tertiary font-serif truncate">
                  — {readingQuote.source[language]}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsQuotePickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[38px]"
                >
                  <Search className="w-3.5 h-3.5 text-accent-text" />
                  <span>{t.changeQuote}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuoteInBook}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover text-xs font-semibold transition-colors cursor-pointer min-h-[38px] shadow-2xs"
                  title={language === 'de' ? 'Nächstes Zitat aus diesem Buch' : 'Next quote in book'}
                >
                  <span>{language === 'de' ? 'Nächstes' : 'Next'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-3xl border border-border p-8 text-center space-y-4">
              <BookOpen className="w-10 h-10 text-accent-text mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-text">
                  {t.selectQuoteToPractice}
                </h3>
                <p className="text-xs text-text-secondary">
                  {language === 'de'
                    ? 'Wähle ein Zitat aus einem der 11 Jugendbücher, um das interaktive Üben zu starten.'
                    : 'Choose a quote from one of the 11 junior youth books to begin interactive practice.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotePickerOpen(true)}
                className="px-5 py-2.5 rounded-full bg-accent text-accent-contrast font-semibold text-xs shadow-apple-pill cursor-pointer"
              >
                {t.selectQuoteToPractice}
              </button>
            </div>
          )}

          {/* Interactive Method Picker (Horizontal Pills of all 11 Web Simulators) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {language === 'de' ? 'Interaktive Methode wählen (11 Web-Simulatoren):' : 'Choose Interactive Method (11 Web Simulators):'}
              </span>
              <span className="text-2xs font-semibold text-text-secondary">
                {interactiveTools.find((t) => t.id === activeInteractiveTool)?.[language === 'de' ? 'categoryDe' : 'categoryEn']}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {interactiveTools.map((tool) => {
                const isActive = activeInteractiveTool === tool.id;
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveInteractiveTool(tool.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[42px] shrink-0 ${
                      isActive
                        ? 'bg-accent text-accent-contrast border-accent shadow-apple-pill'
                        : 'bg-surface hover:bg-surface-2 border-border text-text'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent-contrast' : 'text-accent'}`} />
                    <span>{language === 'de' ? tool.nameDe : tool.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Hosted Simulator Canvas */}
          {readingQuote && (
            <div className="relative">
              {/* Studio Canvas Toolbar (Full Screen toggle, Copy, Plan) */}
              <div className="flex items-center justify-between gap-2 px-2 pb-2 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-text">
                    {interactiveTools.find((t) => t.id === activeInteractiveTool)?.[language === 'de' ? 'nameDe' : 'nameEn']}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyQuote(readingQuote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 border border-border text-2xs font-medium cursor-pointer"
                  >
                    {copiedQuote ? <Check className="w-3 h-3 text-sage" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedQuote ? (language === 'de' ? 'Kopiert' : 'Copied') : (language === 'de' ? 'Kopieren' : 'Copy')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToPlan(readingQuote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 border border-border text-2xs font-medium cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'de' ? 'Plan' : 'Plan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullScreenStudio(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 border border-border text-2xs font-medium cursor-pointer"
                    title={language === 'de' ? 'Vollbildmodus (für Beamer / Gruppe)' : 'Fullscreen mode (for projector)'}
                  >
                    <Maximize2 className="w-3 h-3 text-accent-text" />
                    <span className="hidden sm:inline">{language === 'de' ? 'Vollbild' : 'Fullscreen'}</span>
                  </button>
                </div>
              </div>

              {/* Render Active Simulator Component */}
              <div className="bg-surface rounded-3xl border border-border p-4 sm:p-6 shadow-xs">
                {activeInteractiveTool === 'chalkboard' && (
                  <Chalkboard quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'firstLetter' && (
                  <FirstLetterBoard quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'cloze' && (
                  <ClozeTest quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'wordPuzzle' && (
                  <WordPuzzle quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'imposter' && (
                  <ImposterDetector quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'typeRecall' && (
                  <TypeRecall quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'cascade' && (
                  <CumulativeCascade quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'metronome' && (
                  <MetronomePacer quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'codeClicker' && (
                  <CodeClicker quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'speedRun' && (
                  <SpeedRunTimer quote={readingQuote} language={language} />
                )}
                {activeInteractiveTool === 'flashReader' && (
                  <FlashReader quote={readingQuote} language={language} />
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALL 50 MEMORISATION METHODS CATALOG */}
      {/* ========================================================================= */}
      {viewMode === 'methods' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Phase Filter Chips & Method Search */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setMethodPhaseFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                    methodPhaseFilter === 'all'
                      ? 'bg-accent text-accent-contrast shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {language === 'de' ? 'Alle Phasen' : 'All Phases'}
                </button>
                <button
                  type="button"
                  onClick={() => setMethodPhaseFilter(1)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                    methodPhaseFilter === 1
                      ? 'bg-accent text-accent-contrast shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {language === 'de' ? 'Phase 1: Verstehen & Struktur' : 'Phase 1: Comprehend'}
                </button>
                <button
                  type="button"
                  onClick={() => setMethodPhaseFilter(2)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                    methodPhaseFilter === 2
                      ? 'bg-accent text-accent-contrast shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {language === 'de' ? 'Phase 2: Rhythmus & Einprägen' : 'Phase 2: Memorise'}
                </button>
                <button
                  type="button"
                  onClick={() => setMethodPhaseFilter(3)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                    methodPhaseFilter === 3
                      ? 'bg-accent text-accent-contrast shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {language === 'de' ? 'Phase 3: Festigen & Abruf' : 'Phase 3: Consolidate'}
                </button>
              </div>

              {/* Method search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={methodSearch}
                  onChange={(e) => setMethodSearch(e.target.value)}
                  placeholder={language === 'de' ? 'Methoden durchsuchen...' : 'Search methods...'}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-1 focus:ring-accent"
                />
                {methodSearch && (
                  <button
                    type="button"
                    onClick={() => setMethodSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Methods List */}
          <div className="space-y-3">
            {filteredAllMethods.map((m) => {
              const isExpanded = expandedMethodId === m.id;
              // Check if this method has a matching web simulator
              const matchingWebTool = interactiveTools.find((t) => t.methodId === m.id);

              return (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-3 shadow-xs transition-colors"
                >
                  <div className="w-full flex items-start justify-between gap-3">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedMethodId(isExpanded ? null : m.id)}
                      className="min-w-0 flex-1 text-left cursor-pointer group focus:outline-hidden"
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border">
                          Phase {m.phase}
                        </span>
                        <span className="text-2xs font-mono text-text-tertiary">
                          {m.durationMinutes}
                        </span>
                        {matchingWebTool && (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text border border-accent/20">
                            <Laptop className="w-3 h-3 text-accent shrink-0" />
                            <span>{t.methodPlayableOnWeb}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-brand transition-colors">
                        {m.name[language]}
                      </h3>

                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {m.summary[language]}
                      </p>
                    </button>

                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      {matchingWebTool && (
                        <button
                          type="button"
                          onClick={() => {
                            if (readingQuote) {
                              handleStartPractice(readingQuote, matchingWebTool.id);
                            } else {
                              handleStartPractice(QUOTES_DATA[0], matchingWebTool.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-accent text-accent-contrast text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">{language === 'de' ? 'Jetzt üben' : 'Practice now'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? (language === 'de' ? 'Einklappen' : 'Collapse') : (language === 'de' ? 'Ausklappen' : 'Expand')}
                        onClick={() => setExpandedMethodId(isExpanded ? null : m.id)}
                        className="p-1 rounded-lg text-text-tertiary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                      >
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-border space-y-3.5 text-xs animate-in fade-in">
                      {/* Step by step */}
                      <div>
                        <strong className="text-text font-semibold block mb-2">
                          {language === 'de' ? 'Durchführung im Raum (Schritt für Schritt):' : 'Procedure in the Room (Step by Step):'}
                        </strong>
                        <div className="space-y-2">
                          {m.steps.map((st, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-accent text-accent-contrast font-bold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <div>
                                <span className="font-semibold text-text mr-1">{st.name[language]}:</span>
                                <span className="text-text-secondary">{st.description[language]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Success & Reset */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {m.successCriteria && (
                          <div className="p-3 rounded-xl bg-surface-2 border border-border">
                            <strong className="text-text font-semibold block mb-0.5">
                              {language === 'de' ? 'Erfolgsziel:' : 'Success Goal:'}
                            </strong>
                            <p className="text-text-secondary">{m.successCriteria[language]}</p>
                          </div>
                        )}
                        {m.resetRule && (
                          <div className="p-3 rounded-xl bg-surface-2 border border-border">
                            <strong className="text-text font-semibold block mb-0.5">
                              {language === 'de' ? 'Reset-Regel:' : 'Reset Rule:'}
                            </strong>
                            <p className="text-text-secondary">{m.resetRule[language]}</p>
                          </div>
                        )}
                      </div>

                      {/* Why it works */}
                      {m.whyItWorks && (
                        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                          <strong className="text-text font-semibold block mb-0.5">
                            {language === 'de' ? 'Warum es funktioniert (Pädagogischer Hintergrund):' : 'Why it works:'}
                          </strong>
                          <p className="text-text-secondary">{m.whyItWorks[language]}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG: READING VIEW MODAL (from Quotes Catalog) */}
      {/* ========================================================================= */}
      {readingQuote && (
        <Dialog
          isOpen={isReadingModalOpen}
          onClose={() => setIsReadingModalOpen(false)}
          maxWidth="2xl"
          showCloseButton={true}
        >
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge category="study" size="md">
                {readingQuote.mainBook ? readingQuote.mainBook[language] : readingQuote.book[language]}
              </Badge>
              {readingQuote.section && (
                <Badge category="neutral" size="md">
                  {readingQuote.section[language]}
                </Badge>
              )}
              <span className="text-xs font-bold text-text-secondary">
                {readingQuote.theme[language]}
              </span>
            </div>

            <div className="p-7 sm:p-9 rounded-3xl bg-surface-2 border border-border flex flex-col justify-between space-y-6">
              <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-text leading-relaxed">
                „{language === 'de' ? readingQuote.textDe : readingQuote.textEn}“
              </blockquote>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-serif font-medium text-text-secondary">
                  — {readingQuote.source[language]}
                </p>
                <p className="text-2xs font-serif text-text-tertiary mt-0.5">
                  {readingQuote.book[language]}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyQuote(readingQuote)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text text-xs font-semibold transition-colors cursor-pointer min-h-[38px]"
                >
                  {copiedQuote ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQuote ? (language === 'de' ? 'Kopiert!' : 'Copied!') : (language === 'de' ? 'Kopieren' : 'Copy')}</span>
                </button>

                <a
                  href={generateWhatsAppLink(
                    `„${language === 'de' ? readingQuote.textDe : readingQuote.textEn}“ — ${readingQuote.source[language]}`,
                    `${window.location.origin}/quotes/${readingQuote.id}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text text-xs font-semibold transition-colors cursor-pointer min-h-[38px]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleAddToPlan(readingQuote)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text text-xs font-semibold transition-colors cursor-pointer min-h-[38px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'Zum Plan' : 'Add to Plan'}</span>
                </button>
              </div>

              {/* Primary: Start Learning this quote */}
              <button
                type="button"
                onClick={() => handleStartPractice(readingQuote)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-xs shadow-apple-pill transition-all cursor-pointer min-h-[40px]"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{language === 'de' ? 'Jetzt interaktiv auswendig lernen' : 'Practice this quote now'}</span>
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* DIALOG: QUOTE PICKER (for Practice Studio) */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isQuotePickerOpen}
        onClose={() => setIsQuotePickerOpen(false)}
        title={t.selectQuoteToPractice}
        maxWidth="2xl"
        showCloseButton={true}
      >
        <div className="space-y-4 pt-2">
          {/* Quick search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'de' ? 'Zitat nach Stichwort oder Buch suchen...' : 'Search by keyword or book...'}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Book pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedBook('all')}
              className={`px-3 py-1 rounded-full text-2xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedBook === 'all'
                  ? 'bg-accent text-accent-contrast shadow-xs'
                  : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Alle' : 'All'}
            </button>
            {JUNIOR_YOUTH_BOOKS.slice(0, 11).map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => setSelectedBook(book.title[language])}
                className={`px-3 py-1 rounded-full text-2xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedBook === book.title[language]
                    ? 'bg-accent text-accent-contrast shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                {book.title[language]}
              </button>
            ))}
          </div>

          {/* Scrollable Quotes List */}
          <div className="space-y-2 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
            {filteredQuotes.map((q) => {
              const isSelected = readingQuote?.id === q.id;
              const bookTitle = q.mainBook ? q.mainBook[language] : q.book[language].split(',')[0].trim();
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setReadingQuote(q);
                    setIsQuotePickerOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-accent/15 border-accent text-accent-text ring-1 ring-accent/30'
                      : 'bg-surface-2 hover:bg-surface-raised border-border text-text'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xs font-bold text-text-secondary">{bookTitle}</span>
                      {q.section && (
                        <span className="text-2xs font-mono text-text-tertiary">· {q.section[language]}</span>
                      )}
                      <span className="text-2xs font-semibold text-accent-text">({q.theme[language]})</span>
                    </div>
                    <p className="font-serif italic text-xs text-text line-clamp-1">
                      „{language === 'de' ? q.textDe : q.textEn}“
                    </p>
                  </div>

                  <span className="p-1 rounded-lg bg-accent text-accent-contrast group-hover:bg-accent-hover shrink-0">
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* FULLSCREEN STUDIO OVERLAY (for Beamer / Classrooms) */}
      {/* ========================================================================= */}
      {isFullScreenStudio && readingQuote && (
        <div
          className="fixed inset-0 z-50 bg-bg text-text p-4 sm:p-8 flex flex-col justify-between safe-top safe-bottom overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar with Exit */}
          <div className="flex items-center justify-between border-b border-border pb-4 max-w-5xl mx-auto w-full">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-wider text-accent-text block">
                {language === 'de' ? 'Vollbild Lern-Studio' : 'Fullscreen Practice Studio'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-text">
                {interactiveTools.find((t) => t.id === activeInteractiveTool)?.[language === 'de' ? 'nameDe' : 'nameEn']}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsFullScreenStudio(false)}
              className="p-2 rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Vollbild schließen"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Fullscreen Canvas */}
          <div className="max-w-5xl mx-auto w-full py-6 flex-1 flex flex-col justify-center">
            {activeInteractiveTool === 'chalkboard' && (
              <Chalkboard quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'firstLetter' && (
              <FirstLetterBoard quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'cloze' && (
              <ClozeTest quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'wordPuzzle' && (
              <WordPuzzle quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'imposter' && (
              <ImposterDetector quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'typeRecall' && (
              <TypeRecall quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'cascade' && (
              <CumulativeCascade quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'metronome' && (
              <MetronomePacer quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'codeClicker' && (
              <CodeClicker quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'speedRun' && (
              <SpeedRunTimer quote={readingQuote} language={language} />
            )}
            {activeInteractiveTool === 'flashReader' && (
              <FlashReader quote={readingQuote} language={language} />
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FILTER SHEET (for Book & Lesson selection) */}
      {/* ========================================================================= */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title={language === 'de' ? 'Buch & Lektion filtern' : 'Filter Book & Lesson'}
        position="bottom"
      >
        <div className="space-y-6 pb-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              {t.juniorYouthBooks}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setSelectedBook('all'); setSelectedSection('all'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedBook === 'all'
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {t.allJuniorYouthBooks}
              </button>
              {JUNIOR_YOUTH_BOOKS.map((book) => {
                const bookTitle = book.title[language];
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => { setSelectedBook(bookTitle); setSelectedSection('all'); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedBook === bookTitle
                        ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                        : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                    }`}
                  >
                    {bookTitle}
                  </button>
                );
              })}
            </div>
          </div>

          {availableSections.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                {language === 'de' ? 'Lektion / Abschnitt' : 'Lesson / Section'}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSection('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedSection === 'all'
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {language === 'de' ? 'Alle Lektionen' : 'All Lessons'}
                </button>
                {availableSections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedSection === sec
                        ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                        : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(false)}
              className="w-full py-3 rounded-xl bg-accent text-accent-contrast font-semibold text-xs transition-colors cursor-pointer"
            >
              {language === 'de' ? `${filteredQuotes.length} Zitate anzeigen` : `Show ${filteredQuotes.length} Quotes`}
            </button>
          </div>
        </div>
      </Sheet>

    </div>
  );
};
