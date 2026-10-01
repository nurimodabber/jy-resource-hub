import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Copy, Check, Bookmark, Search, X, Play, 
  ChevronRight, SlidersHorizontal, 
  MessageCircle, Plus, Layers
} from 'lucide-react';
import { QuotePhase, QuoteItem, Language, QuoteGeneralTopic } from '../types';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { QUOTES_DATA } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';
import { Badge } from './ui/Badge';
import { Dialog } from './ui/Dialog';
import { Sheet } from './ui/Sheet';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { generateWhatsAppLink } from '../utils/share';

// Interactive Practice Simulators
import { FirstLetterBoard } from './quotes/FirstLetterBoard';
import { WordPuzzle } from './quotes/WordPuzzle';
import { ImposterDetector } from './quotes/ImposterDetector';
import { MetronomePacer } from './quotes/MetronomePacer';
import { CodeClicker } from './quotes/CodeClicker';
import { SpeedRunTimer } from './quotes/SpeedRunTimer';

interface QuotesViewProps {
  searchQuery: string;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showOnlyFavorites: boolean;
  selectedQuoteId?: string | null;
  onSelectQuote?: (quote: QuoteItem) => void;
}

type InteractiveTool = 'chalkboard' | 'firstLetter' | 'wordPuzzle' | 'imposter' | 'metronome' | 'codeClicker' | 'speedRun';

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
  const effectiveQuoteId = propQuoteId ?? routeQuoteId;
  const t = UI_TRANSLATIONS[language];
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<QuoteGeneralTopic | 'all'>('all');
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Active Quote in Reading View
  const [readingQuote, setReadingQuote] = useState<QuoteItem | null>(() => {
    if (effectiveQuoteId) {
      return QUOTES_DATA.find((q) => q.id === effectiveQuoteId) || null;
    }
    return null;
  });

  // Practice Modes
  const [isPracticeMethodsOpen, setIsPracticeMethodsOpen] = useState(false);
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<InteractiveTool | null>(null);
  const [isAllMethodsModalOpen, setIsAllMethodsModalOpen] = useState(false);
  const [methodPhaseFilter, setMethodPhaseFilter] = useState<QuotePhase | 'all'>('all');
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>(null);

  // Sync external deep link
  useEffect(() => {
    if (effectiveQuoteId) {
      const match = QUOTES_DATA.find((q) => q.id === effectiveQuoteId);
      if (match) {
        setReadingQuote(match);
      }
    } else {
      setReadingQuote(null);
    }
  }, [effectiveQuoteId]);

  const effectiveSearch = externalSearchQuery || localSearch;

  // Unique books for filter sheet
  const uniqueBooks = useMemo(() => {
    const set = new Set<string>();
    QUOTES_DATA.forEach((q) => {
      const b = q.mainBook ? q.mainBook[language] : q.book[language].split(',')[0].trim();
      set.add(b);
    });
    return Array.from(set);
  }, [language]);

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

  // Filtered quotes list
  const filteredQuotes = useMemo(() => {
    return QUOTES_DATA.filter((quote) => {
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
  }, [effectiveSearch, selectedTopic, selectedBook, selectedSection, showOnlyFavorites, favorites, language]);

  // Interactive Tools catalog (Recommended methods first)
  const interactiveTools: { id: InteractiveTool; nameDe: string; nameEn: string; descDe: string; descEn: string }[] = [
    {
      id: 'chalkboard',
      nameDe: 'Die verschwindende Tafel',
      nameEn: 'The Disappearing Board',
      descDe: 'Wörter schrittweise ausblenden und aus dem Gedächtnis ergänzen.',
      descEn: 'Erase words progressively and recall them from memory.',
    },
    {
      id: 'firstLetter',
      nameDe: 'Erstbuchstaben-Board',
      nameEn: 'First-Letter Anchors',
      descDe: 'Nur noch die Anfangsbuchstaben als kognitive Gedächtnisstütze.',
      descEn: 'Rely only on initial letters as minimal memory cues.',
    },
    {
      id: 'wordPuzzle',
      nameDe: 'Wort-Puzzle',
      nameEn: 'Word Puzzle',
      descDe: 'Durcheinandergewürfelte Wörter in die richtige Reihenfolge setzen.',
      descEn: 'Assemble scrambled words in correct grammatical order.',
    },
    {
      id: 'imposter',
      nameDe: 'Kuckucksei-Detektor',
      nameEn: 'Imposter Detector',
      descDe: 'Eingeschlichene falsche Wörter im Vers aufspüren und korrigieren.',
      descEn: 'Spot and correct decoy words inserted into the holy verse.',
    },
    {
      id: 'metronome',
      nameDe: 'Takt-Schritt / Metronom',
      nameEn: 'Rhythm Pacer',
      descDe: 'Im Takt des Metronoms sprechen zur Verankerung im Sprachzentrum.',
      descEn: 'Recite in rhythmic tempo to anchor cadence into memory.',
    },
    {
      id: 'codeClicker',
      nameDe: 'Code-Knacker (Aktionswörter)',
      nameEn: 'Action Triggers',
      descDe: 'Bestimmte Wörter durch Klatschen, Schnipsen oder Stampfen ersetzen.',
      descEn: 'Substitute selected keywords with physical actions.',
    },
    {
      id: 'speedRun',
      nameDe: 'Speed-Run Timer',
      nameEn: 'Speed-Run Stopwatch',
      descDe: 'Schnelligkeits-Challenge im Kreis für flüssiges, fehlerfreies Sprechen.',
      descEn: 'Group speed challenge for fluent recitation without hesitation.',
    },
  ];

  // Topics for the single horizontal chip row
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

  // Chalkboard simulator internal state
  const [chalkboardHiddenIndices, setChalkboardHiddenIndices] = useState<number[]>([]);
  const currentQuoteText = readingQuote ? (language === 'de' ? readingQuote.textDe : readingQuote.textEn) : '';
  const currentWords = useMemo(() => currentQuoteText.split(/\s+/), [currentQuoteText]);

  const handleEraseMoreWords = () => {
    const unhidden = currentWords.map((_, i) => i).filter((i) => !chalkboardHiddenIndices.includes(i));
    if (unhidden.length === 0) return;
    const countToHide = Math.min(unhidden.length, Math.floor(Math.random() * 2) + 2);
    const shuffled = [...unhidden].sort(() => 0.5 - Math.random());
    setChalkboardHiddenIndices((prev) => [...prev, ...shuffled.slice(0, countToHide)]);
  };

  const handleResetChalkboard = () => {
    setChalkboardHiddenIndices([]);
  };

  const handleSelectQuoteItem = (quote: QuoteItem) => {
    setReadingQuote(quote);
    setChalkboardHiddenIndices([]);
    if (onSelectQuote) onSelectQuote(quote);
    navigate(`/quotes/${quote.id}`);
  };

  const handleCloseReadingView = () => {
    setReadingQuote(null);
    setIsPracticeMethodsOpen(false);
    setActiveInteractiveTool(null);
    navigate('/quotes');
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

  // Full 50 Methods filtered
  const filteredAllMethods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((m) => {
      if (methodPhaseFilter !== 'all' && m.phase !== methodPhaseFilter) return false;
      return true;
    });
  }, [methodPhaseFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              {t.tabQuotes}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary truncate">
              {language === 'de'
                ? `${QUOTES_DATA.length} heilige Zitate & ${QUOTE_METHODS_DATA.length} erprobte Verinnerlichungsmethoden.`
                : `${QUOTES_DATA.length} scripture verses and ${QUOTE_METHODS_DATA.length} memorisation methods.`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAllMethodsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px] shrink-0"
          >
            <Layers className="w-4 h-4 text-accent-text" />
            <span>
              {language === 'de'
                ? `Alle ${QUOTE_METHODS_DATA.length} Methoden ansehen`
                : `View all ${QUOTE_METHODS_DATA.length} methods`}
            </span>
          </button>
        </div>

        {/* Search Bar & Filter Sheet Trigger */}
        <div className="mt-5 flex items-center gap-2.5">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer min-h-[40px] ${
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

        {/* Single Theme Filter Chip Row (Horizontal, No visible scrollbar) */}
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
              selectedTopic === 'all'
                ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
            }`}
          >
            {language === 'de' ? 'Alle Themen' : 'All Topics'}
          </button>
          {topics.map((top) => (
            <button
              key={top.id}
              type="button"
              onClick={() => setSelectedTopic(selectedTopic === top.id ? 'all' : top.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] cursor-pointer ${
                selectedTopic === top.id
                  ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                  : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
              }`}
            >
              {language === 'de' ? top.labelDe : top.labelEn}
            </button>
          ))}
        </div>

        {/* Active Removable Filters Display */}
        {(selectedBook !== 'all' || selectedSection !== 'all' || selectedTopic !== 'all') && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs">
            <span className="text-text-tertiary">{language === 'de' ? 'Aktive Filter:' : 'Active filters:'}</span>
            {selectedTopic !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text">
                <span>Thema: {topics.find((t) => t.id === selectedTopic)?.[language === 'de' ? 'labelDe' : 'labelEn']}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedTopic('all')} />
              </span>
            )}
            {selectedBook !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text">
                <span>Buch: {selectedBook}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => { setSelectedBook('all'); setSelectedSection('all'); }} />
              </span>
            )}
            {selectedSection !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text">
                <span>Lektion: {selectedSection}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedSection('all')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. Quotes List Grid (3 columns on wide screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredQuotes.map((quote) => (
          <article
            key={quote.id}
            role="button"
            tabIndex={0}
            onClick={() => handleSelectQuoteItem(quote)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectQuoteItem(quote);
              }
            }}
            className="group relative bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs hover:border-brand/40 hover:shadow-apple-card-hover hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={`${quote.theme[language]}: „${language === 'de' ? quote.textDe.slice(0, 40) : quote.textEn.slice(0, 40)}...“`}
          >
            <div>
              {/* Badges & Bookmark */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <Badge category="study" size="sm">
                  {quote.theme[language]}
                </Badge>

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

              {/* Quote Excerpt clamped to 3 lines in Lora serif */}
              <blockquote className="font-serif italic text-sm sm:text-base text-text leading-relaxed line-clamp-3 mb-2.5">
                „{language === 'de' ? quote.textDe : quote.textEn}“
              </blockquote>
            </div>

            {/* Compact Source Line */}
            <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2 text-2xs text-text-secondary">
              <span className="font-serif text-text-tertiary leading-snug truncate">
                — {quote.source[language]} ({quote.book[language]})
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </article>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="p-8 text-center bg-surface rounded-3xl border border-border">
          <p className="text-sm text-text-secondary">
            {language === 'de' ? 'Keine Zitate für diese Suche oder Filter gefunden.' : 'No quotes found matching your search or filters.'}
          </p>
        </div>
      )}

      {/* 3. Reading View Dialog */}
      {readingQuote && (
        <Dialog
          isOpen={true}
          onClose={handleCloseReadingView}
          maxWidth="4xl"
          showCloseButton={false}
        >
          <div className="space-y-6">
            {/* Header: Title, Category, Prev/Next Arrows, Bookmark & Close */}
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <Badge category="study" size="md">
                  {readingQuote.theme[language]}
                </Badge>
                {readingQuote.section && (
                  <Badge category="neutral" size="md">
                    {readingQuote.section[language]}
                  </Badge>
                )}
                <span className="text-xs font-semibold text-text-secondary truncate">
                  {readingQuote.book[language]}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Prev / Next Navigation Arrows */}
                {(() => {
                  const currentIndex = filteredQuotes.findIndex((q) => q.id === readingQuote.id);
                  const hasPrev = currentIndex > 0;
                  const hasNext = currentIndex < filteredQuotes.length - 1;
                  return (
                    <div className="flex items-center gap-1 mr-1">
                      <button
                        type="button"
                        disabled={!hasPrev}
                        onClick={() => {
                          if (hasPrev) handleSelectQuoteItem(filteredQuotes[currentIndex - 1]);
                        }}
                        className="p-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface-raised disabled:opacity-30 disabled:pointer-events-none text-text transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title={language === 'de' ? 'Vorheriges Zitat (←)' : 'Previous quote (←)'}
                        aria-label="Vorheriges Zitat"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={!hasNext}
                        onClick={() => {
                          if (hasNext) handleSelectQuoteItem(filteredQuotes[currentIndex + 1]);
                        }}
                        className="p-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface-raised disabled:opacity-30 disabled:pointer-events-none text-text transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title={language === 'de' ? 'Nächstes Zitat (→)' : 'Next quote (→)'}
                        aria-label="Nächstes Zitat"
                      >
                        →
                      </button>
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(readingQuote.id, e)}
                  className={`p-2 rounded-full text-text-secondary hover:text-text transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ${
                    favorites.includes(readingQuote.id) ? 'text-accent-contrast bg-accent hover:bg-accent-hover' : ''
                  }`}
                  aria-label="Lesezeichen"
                >
                  <Bookmark className={`w-5 h-5 ${favorites.includes(readingQuote.id) ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleCloseReadingView}
                  className="p-2 rounded-full text-text-secondary hover:text-text transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  aria-label="Schließen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Desktop 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (≈58% - 7 cols): Quote in large serif on calm tinted panel */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-7 sm:p-9 rounded-3xl bg-surface-2/80 border border-border/80 flex flex-col justify-between space-y-6">
                  <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-text leading-relaxed">
                    „{language === 'de' ? readingQuote.textDe : readingQuote.textEn}“
                  </blockquote>

                  <div className="pt-4 border-t border-border/60">
                    <p className="text-sm font-serif font-medium text-text-secondary">
                      — {readingQuote.source[language]}
                    </p>
                    <p className="text-2xs font-serif text-text-tertiary mt-0.5">
                      {readingQuote.book[language]}
                    </p>
                  </div>
                </div>

                {/* Secondary Actions (Copy & WhatsApp) */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyQuote(readingQuote)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text font-medium transition-colors cursor-pointer min-h-[36px]"
                  >
                    {copiedQuote ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuote ? (language === 'de' ? 'Kopiert!' : 'Copied!') : (language === 'de' ? 'Zitat kopieren' : 'Copy Quote')}</span>
                  </button>

                  <a
                    href={generateWhatsAppLink(
                      `„${language === 'de' ? readingQuote.textDe : readingQuote.textEn}“ — ${readingQuote.source[language]}`,
                      `${window.location.origin}/quotes/${readingQuote.id}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text font-medium transition-colors cursor-pointer min-h-[36px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column (≈42% - 5 cols, sticky): Primary Actions & Quick Methods preview */}
              <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-2">
                
                {/* Primary Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPracticeMethodsOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-sm shadow-apple-pill flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer min-h-[46px] outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{language === 'de' ? 'Üben (Methode wählen)' : 'Practice (Choose Method)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToPlan(readingQuote)}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[42px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'de' ? 'Zum Plan hinzufügen' : 'Add to Plan'}</span>
                  </button>
                </div>

                {/* Short preview of 2–3 suggested Verinnerlichungsmethoden to start straight away */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                      {language === 'de' ? 'Direkt loslegen' : 'Quick Practice'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPracticeMethodsOpen(true)}
                      className="text-2xs font-semibold text-accent-text hover:underline cursor-pointer"
                    >
                      {language === 'de' ? 'Alle anzeigen' : 'View all'} →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {interactiveTools.slice(0, 3).map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveInteractiveTool(tool.id)}
                        className="w-full text-left p-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-text group-hover:text-brand transition-colors truncate">
                            {language === 'de' ? tool.nameDe : tool.nameEn}
                          </p>
                          <p className="text-2xs text-text-tertiary line-clamp-1 mt-0.5">
                            {language === 'de' ? tool.descDe : tool.descEn}
                          </p>
                        </div>
                        <span className="p-1 rounded-lg bg-accent text-accent-contrast group-hover:bg-accent-hover shrink-0">
                          <Play className="w-3 h-3 fill-current" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </Dialog>
      )}

      {/* 4. Practice Methods Selection Dialog (Short method list, 1 line each, recommended first) */}
      <Dialog
        isOpen={isPracticeMethodsOpen}
        onClose={() => setIsPracticeMethodsOpen(false)}
        title={language === 'de' ? 'Verinnerlichungsmethode wählen' : 'Choose Memorisation Method'}
        maxWidth="md"
        showCloseButton={true}
      >
        <div className="space-y-3 pt-2">
          {interactiveTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                setActiveInteractiveTool(tool.id);
                setIsPracticeMethodsOpen(false);
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between group"
            >
              <div className="min-w-0 pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-text group-hover:text-accent-text transition-colors truncate">
                  {language === 'de' ? tool.nameDe : tool.nameEn}
                </h4>
                <p className="text-2xs text-text-secondary mt-0.5 line-clamp-1">
                  {language === 'de' ? tool.descDe : tool.descEn}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-accent-contrast text-xs font-semibold shrink-0 group-hover:bg-accent-hover transition-colors">
                <span>{language === 'de' ? 'Starten' : 'Start'}</span>
                <Play className="w-3 h-3 fill-current" />
              </span>
            </button>
          ))}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsPracticeMethodsOpen(false);
                setIsAllMethodsModalOpen(true);
              }}
              className="text-xs font-semibold text-accent-text hover:underline"
            >
              {language === 'de'
                ? `+ Alle ${QUOTE_METHODS_DATA.length} Methoden ansehen`
                : `+ View all ${QUOTE_METHODS_DATA.length} methods`}
            </button>
          </div>
        </div>
      </Dialog>

      {/* 5. Full-Screen Interactive Practice Simulator View */}
      {activeInteractiveTool && readingQuote && (
        <div
          className="fixed inset-0 z-50 bg-bg text-text p-4 sm:p-8 flex flex-col justify-between safe-top safe-bottom overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar with Exit */}
          <div className="flex items-center justify-between border-b border-border pb-4 max-w-4xl mx-auto w-full">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-wider text-accent-text block">
                {language === 'de' ? 'Interaktives Studio' : 'Practice Studio'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-text">
                {interactiveTools.find((t) => t.id === activeInteractiveTool)?.[language === 'de' ? 'nameDe' : 'nameEn']}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveInteractiveTool(null)}
              className="p-2 rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Studio schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Practice Canvas Area */}
          <div className="max-w-4xl mx-auto w-full py-6 flex-1 flex flex-col justify-center">
            {activeInteractiveTool === 'chalkboard' && (
              <div className="space-y-6">
                <div className="p-8 sm:p-12 rounded-3xl bg-surface-raised border border-border text-center space-y-6 shadow-xs">
                  <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed text-text">
                    {currentWords.map((word, idx) => {
                      const isHidden = chalkboardHiddenIndices.includes(idx);
                      const punctuation = word.replace(/[a-zA-ZäöüÄÖÜß0-9]/g, '');
                      return (
                        <span
                          key={idx}
                          onClick={() => {
                            setChalkboardHiddenIndices((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            );
                          }}
                          className={`cursor-pointer transition-all duration-200 select-none px-2 py-0.5 rounded-lg ${
                            isHidden
                              ? 'text-text-tertiary border-b-2 border-border opacity-40'
                              : 'text-text hover:text-accent-text'
                          }`}
                        >
                          {isHidden ? `____${punctuation}` : word}
                        </span>
                      );
                    })}
                  </div>

                  <p className="text-xs text-text-tertiary font-serif italic">
                    — {readingQuote.source[language]}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleEraseMoreWords}
                    disabled={chalkboardHiddenIndices.length === currentWords.length}
                    className="px-6 py-2.5 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-semibold text-xs transition-colors shadow-xs cursor-pointer min-h-[40px]"
                  >
                    {language === 'de' ? 'Wörter ausblenden' : 'Erase Words'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetChalkboard}
                    className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px]"
                  >
                    {language === 'de' ? 'Zurücksetzen' : 'Reset'}
                  </button>
                </div>
              </div>
            )}

            {activeInteractiveTool === 'firstLetter' && (
              <FirstLetterBoard quote={readingQuote} language={language} />
            )}

            {activeInteractiveTool === 'wordPuzzle' && (
              <WordPuzzle quote={readingQuote} language={language} />
            )}

            {activeInteractiveTool === 'imposter' && (
              <ImposterDetector quote={readingQuote} language={language} />
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
          </div>
        </div>
      )}

      {/* 6. Filter Sheet for Book & Section */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title={language === 'de' ? 'Buch & Lektion filtern' : 'Filter Book & Lesson'}
        position="bottom"
      >
        <div className="space-y-6 pb-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              {language === 'de' ? 'Buch auswählen' : 'Select Book'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedBook('all');
                  setSelectedSection('all');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedBook === 'all'
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {language === 'de' ? 'Alle Bücher' : 'All Books'}
              </button>
              {uniqueBooks.map((book) => (
                <button
                  key={book}
                  type="button"
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedSection('all');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedBook === book
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {book}
                </button>
              ))}
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

      {/* 7. "Mehr Methoden" Catalog Dialog */}
      <Dialog
        isOpen={isAllMethodsModalOpen}
        onClose={() => setIsAllMethodsModalOpen(false)}
        title={
          language === 'de'
            ? `Methoden-Katalog (${QUOTE_METHODS_DATA.length} Methoden)`
            : `Memorisation Methods (${QUOTE_METHODS_DATA.length} Methods)`
        }
        maxWidth="xl"
        showCloseButton={true}
      >
        <div className="space-y-4 pt-2">
          {/* Phase Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setMethodPhaseFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                methodPhaseFilter === 'all' ? 'bg-accent text-accent-contrast font-semibold' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Alle Phasen' : 'All Phases'}
            </button>
            <button
              type="button"
              onClick={() => setMethodPhaseFilter(1)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                methodPhaseFilter === 1 ? 'bg-accent text-accent-contrast font-semibold' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Phase 1: Verstehen & Struktur' : 'Phase 1: Comprehend'}
            </button>
            <button
              type="button"
              onClick={() => setMethodPhaseFilter(2)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                methodPhaseFilter === 2 ? 'bg-accent text-accent-contrast font-semibold' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Phase 2: Rhythmus & Einprägen' : 'Phase 2: Memorise'}
            </button>
            <button
              type="button"
              onClick={() => setMethodPhaseFilter(3)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                methodPhaseFilter === 3 ? 'bg-accent text-accent-contrast font-semibold' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Phase 3: Festigen & Abruf' : 'Phase 3: Consolidate'}
            </button>
          </div>

          {/* Methods List */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {filteredAllMethods.map((m) => {
              const isExpanded = expandedMethodId === m.id;
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2 transition-colors"
                >
                  <div
                    onClick={() => setExpandedMethodId(isExpanded ? null : m.id)}
                    className="flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border">
                          Phase {m.phase}
                        </span>
                        <span className="text-2xs text-text-tertiary">
                          {m.durationMinutes}′
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text hover:text-accent transition-colors">
                        {m.name[language]}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {m.summary[language]}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform mt-1 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-border space-y-3 text-xs animate-in fade-in">
                      <div>
                        <strong className="text-text font-semibold block mb-1">
                          {language === 'de' ? 'Schritt für Schritt:' : 'Step by Step:'}
                        </strong>
                        <div className="space-y-1.5">
                          {m.steps.map((st, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-accent text-accent-contrast font-bold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <p className="text-text-secondary">{st.description[language]}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {m.whyItWorks && (
                        <div className="p-3 rounded-xl bg-surface border border-border">
                          <strong className="text-text font-semibold block mb-0.5">
                            {language === 'de' ? 'Warum es funktioniert:' : 'Why it works:'}
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
      </Dialog>

    </div>
  );
};
