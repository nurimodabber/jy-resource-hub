import React, { useState, useMemo, useEffect } from 'react';
import { 
  Copy, Check, ChevronDown, ChevronUp, Bookmark, 
  Eraser, RotateCcw, ArrowRight, Type, Puzzle, 
  Search, Activity, HandMetal, Timer 
} from 'lucide-react';
import { QuotePhase, QuoteItem, Language } from '../types';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { QUOTES_DATA } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';

// Interactive Practice Studio Components
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
}

type StudioTool = 'chalkboard' | 'firstLetter' | 'wordPuzzle' | 'imposter' | 'metronome' | 'codeClicker' | 'speedRun';

export const QuotesView: React.FC<QuotesViewProps> = ({
  searchQuery,
  language,
  favorites,
  onToggleFavorite,
  showOnlyFavorites,
}) => {
  const t = UI_TRANSLATIONS[language];

  // Apple Segmented Sub-view: Studio, Methods, or Quotes Library
  const [viewMode, setViewMode] = useState<'studio' | 'methods' | 'quotes'>('studio');
  
  // Active Interactive Tool inside the Studio
  const [activeTool, setActiveTool] = useState<StudioTool>('chalkboard');

  // Phase & Modality filter for methods view
  const [selectedPhase, setSelectedPhase] = useState<QuotePhase | 'all'>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>('wort-mind');
  
  // Selected practice quote
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem>(QUOTES_DATA[0]);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

  // Hierarchical Quote Filter States: 1. Book -> 2. Section/Lesson -> 3. Generalized Topic
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [expandedLangQuoteIds, setExpandedLangQuoteIds] = useState<string[]>([]);

  const handleSelectBook = (book: string) => {
    setSelectedBook(book);
    setSelectedSection('all');
  };

  // Unique books list for filtering
  const uniqueBooks = useMemo(() => {
    const booksMap = new Map<string, { de: string; en: string; count: number }>();
    QUOTES_DATA.forEach(q => {
      const deMain = q.mainBook ? q.mainBook.de : q.book.de.split(',')[0].trim();
      const enMain = q.mainBook ? q.mainBook.en : q.book.en.split(',')[0].trim();
      const existing = booksMap.get(deMain);
      if (existing) {
        existing.count += 1;
      } else {
        booksMap.set(deMain, { de: deMain, en: enMain, count: 1 });
      }
    });
    return Array.from(booksMap.values());
  }, []);

  // Available sections (lessons) based on selectedBook
  const availableSections = useMemo(() => {
    const sectionsMap = new Map<string, { de: string; en: string; count: number }>();
    QUOTES_DATA.forEach(q => {
      const deMain = q.mainBook ? q.mainBook.de : q.book.de.split(',')[0].trim();
      if (selectedBook !== 'all' && deMain !== selectedBook) return;
      if (q.section) {
        const existing = sectionsMap.get(q.section.de);
        if (existing) {
          existing.count += 1;
        } else {
          sectionsMap.set(q.section.de, { de: q.section.de, en: q.section.en, count: 1 });
        }
      }
    });
    return Array.from(sectionsMap.values()).sort((a, b) => {
      const numA = parseInt(a.de.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.de.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [selectedBook]);

  // Generalized topics list
  const generalTopicsList = useMemo(() => [
    { id: 'all', label: t.allTopics },
    { id: 'einheit', label: t.topicEinheit },
    { id: 'wahrhaftigkeit', label: t.topicWahrhaftigkeit },
    { id: 'dienst', label: t.topicDienst },
    { id: 'gerechtigkeit', label: t.topicGerechtigkeit },
    { id: 'verstand', label: t.topicVerstand },
    { id: 'seele', label: t.topicSeele },
    { id: 'freude', label: t.topicFreude },
    { id: 'gebet', label: t.topicGebet },
  ], [t]);

  const hasActiveQuoteFilters = selectedBook !== 'all' || selectedSection !== 'all' || selectedTopic !== 'all';

  const handleResetQuoteFilters = () => {
    setSelectedBook('all');
    setSelectedSection('all');
    setSelectedTopic('all');
  };

  const toggleDualLang = (id: string) => {
    setExpandedLangQuoteIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Interactive Disappearing Board State
  const quoteText = language === 'de' ? selectedQuote.textDe : selectedQuote.textEn;
  const words = useMemo(() => quoteText.split(/\s+/), [quoteText]);
  const [hiddenWordIndices, setHiddenWordIndices] = useState<number[]>([]);

  // Reset hidden words whenever the quote or language changes
  useEffect(() => {
    setHiddenWordIndices([]);
  }, [selectedQuote, language]);

  const tools = [
    { id: 'chalkboard' as const, label: t.toolChalkboard, icon: Eraser },
    { id: 'firstLetter' as const, label: t.toolFirstLetter, icon: Type },
    { id: 'wordPuzzle' as const, label: t.toolWordPuzzle, icon: Puzzle },
    { id: 'imposter' as const, label: t.toolImposter, icon: Search },
    { id: 'metronome' as const, label: t.toolMetronome, icon: Activity },
    { id: 'codeClicker' as const, label: t.toolCodeClicker, icon: HandMetal },
    { id: 'speedRun' as const, label: t.toolSpeedRun, icon: Timer },
  ];

  const handleEraseNext = () => {
    const unhidden = words.map((_, i) => i).filter(i => !hiddenWordIndices.includes(i));
    if (unhidden.length === 0) return;

    // Pick 2-3 random unhidden words to hide
    const countToHide = Math.min(unhidden.length, Math.floor(Math.random() * 2) + 2);
    const shuffled = [...unhidden].sort(() => 0.5 - Math.random());
    const toHide = shuffled.slice(0, countToHide);

    setHiddenWordIndices(prev => [...prev, ...toHide]);
  };

  const handleToggleWord = (idx: number) => {
    setHiddenWordIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const filteredMethods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((method) => {
      if (showOnlyFavorites && !favorites.includes(method.id)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = method.name[language].toLowerCase().includes(q);
        const matchesSummary = method.summary[language].toLowerCase().includes(q);
        const matchesWhy = method.whyItWorks[language].toLowerCase().includes(q);
        if (!matchesName && !matchesSummary && !matchesWhy) return false;
      }

      if (selectedPhase !== 'all' && method.phase !== selectedPhase) {
        return false;
      }

      if (selectedModality !== 'all' && method.modality !== selectedModality) {
        return false;
      }

      return true;
    });
  }, [searchQuery, language, selectedPhase, selectedModality, showOnlyFavorites, favorites]);

  const filteredQuotes = useMemo(() => {
    return QUOTES_DATA.filter((item) => {
      const mainBookDe = item.mainBook ? item.mainBook.de : item.book.de.split(',')[0].trim();
      if (selectedBook !== 'all' && mainBookDe !== selectedBook) {
        return false;
      }

      if (selectedSection !== 'all' && item.section?.de !== selectedSection) {
        return false;
      }

      if (selectedTopic !== 'all' && item.generalTopic !== selectedTopic) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDe = item.textDe.toLowerCase().includes(q);
        const matchesEn = item.textEn.toLowerCase().includes(q);
        const matchesTheme = item.theme[language].toLowerCase().includes(q);
        const matchesSource = item.source[language].toLowerCase().includes(q);
        const matchesBook = item.book[language].toLowerCase().includes(q);
        const matchesKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));

        if (!matchesDe && !matchesEn && !matchesTheme && !matchesSource && !matchesBook && !matchesKeywords) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, language, selectedBook, selectedSection, selectedTopic]);

  // Keep selectedQuote in sync with filtered list
  useEffect(() => {
    if (filteredQuotes.length > 0 && !filteredQuotes.some(q => q.id === selectedQuote.id)) {
      setSelectedQuote(filteredQuotes[0]);
    }
  }, [filteredQuotes, selectedQuote]);

  const handleCopyQuote = (item: QuoteItem) => {
    const text = language === 'de' ? item.textDe : item.textEn;
    navigator.clipboard.writeText(`„${text}“\n— ${item.source[language]} (${item.book[language]})`);
    setCopiedQuoteId(item.id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  const launchStudioWithQuote = (item: QuoteItem, tool: StudioTool = 'chalkboard') => {
    setSelectedQuote(item);
    setActiveTool(tool);
    setViewMode('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header & 3-Mode Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {t.quotesHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-xl font-normal leading-relaxed">
            {t.quotesHeaderDesc}
          </p>
        </div>

        {/* Apple Segmented View Switcher */}
        <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('studio')}
            className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              viewMode === 'studio'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            {t.subtabStudio}
          </button>
          <button
            onClick={() => setViewMode('methods')}
            className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              viewMode === 'methods'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            {t.subtabMethods} ({QUOTE_METHODS_DATA.length})
          </button>
          <button
            onClick={() => setViewMode('quotes')}
            className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              viewMode === 'quotes'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            {t.subtabQuotes} ({QUOTES_DATA.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE PRACTICE STUDIO (7 SIMULATORS) */}
      {viewMode === 'studio' && (
        <div className="space-y-6">
          {/* Studio Tool Selection Pills */}
          <div className="overflow-x-auto pb-1 custom-scrollbar">
            <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] min-w-max">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quote Selection Bar: 3-Tier Hierarchical Filter */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-black/[0.06] shadow-2xs space-y-4">
            {/* Tier 1 & Tier 2: Book & Section dropdowns + Citation & Copy */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-black/[0.04] pb-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Book Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] shrink-0">
                    {t.filterBookLabel}:
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => handleSelectBook(e.target.value)}
                    className="text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] px-3 py-1.5 rounded-full border border-black/[0.06] outline-hidden cursor-pointer transition-colors"
                  >
                    <option value="all">{t.allBooks} ({QUOTES_DATA.length})</option>
                    {uniqueBooks.map(b => (
                      <option key={b.de} value={b.de}>
                        {b[language]} ({b.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Section / Lesson Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] shrink-0">
                    {t.filterSectionLabel}:
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={availableSections.length === 0}
                    className="text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] px-3 py-1.5 rounded-full border border-black/[0.06] outline-hidden cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="all">{t.allSections} ({availableSections.reduce((acc, s) => acc + s.count, 0)})</option>
                    {availableSections.map(s => (
                      <option key={s.de} value={s.de}>
                        {s[language]} ({s.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                {hasActiveQuoteFilters && (
                  <button
                    onClick={handleResetQuoteFilters}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#0071e3] hover:underline px-2 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.resetFilters}</span>
                  </button>
                )}
              </div>

              {/* Active Quote Citation and Copy */}
              <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                <span className="text-[11px] text-[#86868b] font-medium max-w-[220px] truncate" title={selectedQuote.source[language]}>
                  {selectedQuote.source[language]}
                </span>
                <button
                  onClick={() => handleCopyQuote(selectedQuote)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-black/[0.08] hover:bg-black/[0.04] text-[#1d1d1f] transition-colors"
                >
                  {copiedQuoteId === selectedQuote.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#86868b]" />
                  )}
                  <span>{copiedQuoteId === selectedQuote.id ? t.copiedSuccess : t.copyQuote}</span>
                </button>
              </div>
            </div>

            {/* Tier 3: Generalized Topic Filter Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  {t.filterTopicLabel}:
                </span>
                <span className="text-[11px] text-[#86868b]">
                  {filteredQuotes.length} {filteredQuotes.length === 1 ? t.quoteFound : t.quotesFound}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {generalTopicsList.map(topic => {
                  const isSelected = selectedTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#1d1d1f] text-white font-semibold shadow-apple-pill'
                          : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08]'
                      }`}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matching Quotes Selector (Selectable Mini-Cards) */}
            <div className="pt-2 border-t border-black/[0.04]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                {t.matchingQuotes} ({filteredQuotes.length}):
              </div>
              {filteredQuotes.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#86868b] bg-black/[0.02] rounded-xl border border-dashed border-black/[0.08]">
                  <p>{t.noQuotesMatch}</p>
                  <button
                    onClick={handleResetQuoteFilters}
                    className="mt-2 text-[#0071e3] font-medium hover:underline text-xs"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {filteredQuotes.map((q) => {
                    const isSelected = selectedQuote.id === q.id;
                    const textPreview = language === 'de' ? q.textDe : q.textEn;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setSelectedQuote(q)}
                        className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#0071e3] ring-1 ring-[#0071e3]/30 shadow-xs'
                            : 'bg-white hover:bg-black/[0.02] border-black/[0.06]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="text-xs font-semibold text-[#1d1d1f] truncate">
                            {q.theme[language]}
                          </span>
                          {q.section && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/[0.05] text-[#86868b] shrink-0">
                              {q.section[language]}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6e6e73] font-serif italic line-clamp-1">
                          „{textPreview}“
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* TOOL 1: DISAPPEARING CHALKBOARD */}
          {activeTool === 'chalkboard' && (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8 shadow-apple-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#86868b]">
                <p>{t.boardSubtitle}</p>
                <span className="font-mono text-[11px] bg-black/[0.04] px-3 py-1 rounded-full text-[#1d1d1f] self-start sm:self-auto shrink-0">
                  {words.length - hiddenWordIndices.length} / {words.length} {t.wordsRemaining}
                </span>
              </div>

              {/* Apple Blackboard Canvas */}
              <div className="bg-[#1d1d1f] text-white rounded-2xl p-8 sm:p-12 shadow-inner border border-black/40 space-y-6 text-center">
                <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-3 font-serif text-xl sm:text-3xl leading-relaxed tracking-wide min-h-[140px]">
                  {words.map((word, idx) => {
                    const isHidden = hiddenWordIndices.includes(idx);
                    return (
                      <span
                        key={idx}
                        onClick={() => handleToggleWord(idx)}
                        className={`cursor-pointer transition-all duration-200 select-none ${
                          isHidden
                            ? 'text-neutral-500 border-b border-neutral-700 px-2 py-0.5'
                            : 'hover:text-emerald-400'
                        }`}
                        title={isHidden ? 'Klicken zum Einblenden' : 'Klicken zum Ausblenden'}
                      >
                        {isHidden ? '_____' : word}
                      </span>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
                  <span className="font-serif italic">— {selectedQuote.source[language]} ({selectedQuote.book[language]})</span>
                  <span className="text-[11px] text-neutral-400">
                    {t.tapWordHint}
                  </span>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEraseNext}
                    disabled={hiddenWordIndices.length === words.length}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0071e3] text-white text-xs font-semibold rounded-full hover:bg-[#0077ed] disabled:opacity-40 transition-all shadow-apple-pill"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>{t.eraseNextWord}</span>
                  </button>
                  <button
                    onClick={() => setHiddenWordIndices([])}
                    disabled={hiddenWordIndices.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-black/[0.08] text-[#1d1d1f] text-xs font-medium rounded-full hover:bg-black/[0.04] disabled:opacity-40 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.resetBoard}</span>
                  </button>
                </div>

                {hiddenWordIndices.length === words.length && (
                  <p className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                    {t.allWordsHidden}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TOOL 2: FIRST-LETTER ANCHORS */}
          {activeTool === 'firstLetter' && (
            <FirstLetterBoard quote={selectedQuote} language={language} />
          )}

          {/* TOOL 3: INTERACTIVE WORD PUZZLE */}
          {activeTool === 'wordPuzzle' && (
            <WordPuzzle quote={selectedQuote} language={language} />
          )}

          {/* TOOL 4: IMPOSTER DETECTOR */}
          {activeTool === 'imposter' && (
            <ImposterDetector quote={selectedQuote} language={language} />
          )}

          {/* TOOL 5: METRONOME CADENCE PACER */}
          {activeTool === 'metronome' && (
            <MetronomePacer quote={selectedQuote} language={language} />
          )}

          {/* TOOL 6: CODE CLICKER */}
          {activeTool === 'codeClicker' && (
            <CodeClicker quote={selectedQuote} language={language} />
          )}

          {/* TOOL 7: SPEED RUN TIMER */}
          {activeTool === 'speedRun' && (
            <SpeedRunTimer quote={selectedQuote} language={language} />
          )}
        </div>
      )}

      {/* VIEW 2: 50 COOPERATIVE MEMORIZATION METHODS CATALOG */}
      {viewMode === 'methods' && (
        <div className="space-y-6">
          {/* Phase & Modality Filter Bar */}
          <div className="flex flex-col gap-3">
            {/* Phase Segmented Filter */}
            <div className="overflow-x-auto pb-1 custom-scrollbar">
              <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] min-w-max">
                <button
                  onClick={() => setSelectedPhase('all')}
                  className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                    selectedPhase === 'all'
                      ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {t.allPhases} (50)
                </button>
                <button
                  onClick={() => setSelectedPhase(1)}
                  className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                    selectedPhase === 1
                      ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {t.phase1Title} (16)
                </button>
                <button
                  onClick={() => setSelectedPhase(2)}
                  className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                    selectedPhase === 2
                      ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {t.phase2Title} (17)
                </button>
                <button
                  onClick={() => setSelectedPhase(3)}
                  className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                    selectedPhase === 3
                      ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {t.phase3Title} (17)
                </button>
              </div>
            </div>

            {/* Modality Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#86868b]">
              <span>Modus:</span>
              {[
                { id: 'all', label: language === 'de' ? 'Alle Modi' : 'All Modes' },
                { id: 'rhythm', label: t.modalityRhythm },
                { id: 'movement', label: t.modalityMovement },
                { id: 'visual', label: t.modalityVisual },
                { id: 'focus', label: t.modalityFocus },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModality(m.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    selectedModality === m.id
                      ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-apple-pill'
                      : 'bg-white text-[#6e6e73] border-black/[0.06] hover:text-[#1d1d1f]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <span className="ml-auto font-mono text-[11px] text-[#86868b]">
                {filteredMethods.length} {language === 'de' ? 'Methoden' : 'methods'}
              </span>
            </div>
          </div>

          {/* Methods Cards List */}
          <div className="space-y-3">
            {filteredMethods.map((method) => {
              const isExpanded = expandedMethodId === method.id;
              const isFav = favorites.includes(method.id);

              return (
                <div
                  key={method.id}
                  className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-apple-card transition-all"
                >
                  <div
                    onClick={() => setExpandedMethodId(isExpanded ? null : method.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-black/[0.01] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-black/[0.04] text-[#1d1d1f] font-semibold text-xs flex items-center justify-center shrink-0">
                        {method.phase}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base text-[#1d1d1f]">
                            {method.name[language]}
                          </h3>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] text-[#6e6e73]">
                            {method.modality === 'movement' && t.modalityMovement}
                            {method.modality === 'rhythm' && t.modalityRhythm}
                            {method.modality === 'visual' && t.modalityVisual}
                            {method.modality === 'focus' && t.modalityFocus}
                          </span>
                        </div>
                        <p className="text-xs text-[#86868b] mt-0.5 font-normal">
                          {method.summary[language]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => onToggleFavorite(method.id, e)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isFav
                            ? 'text-amber-500 bg-amber-500/10'
                            : 'text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                        }`}
                        title={t.savedItems}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                      <div className="p-1 text-[#86868b]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-black/[0.04] space-y-4 text-xs sm:text-sm text-[#1d1d1f]">
                      {/* Why it works */}
                      <div className="bg-[#f5f5f7] p-3.5 rounded-xl space-y-1">
                        <strong className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                          {t.whyWorksTitle}
                        </strong>
                        <p className="text-xs text-[#1d1d1f] leading-relaxed font-normal">
                          {method.whyItWorks[language]}
                        </p>
                      </div>

                      {/* Step by step in the room */}
                      <div className="space-y-2">
                        <strong className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                          {t.stepsInRoomTitle}
                        </strong>
                        <div className="space-y-2">
                          {method.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-[#1d1d1f]">
                              <span className="w-4 h-4 rounded-full bg-black/[0.08] text-[#1d1d1f] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-semibold block">{step.name[language]}</span>
                                <span className="leading-relaxed font-normal text-[#6e6e73]">{step.description[language]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reset Condition if available */}
                      {method.resetRule && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 font-normal">
                          <strong className="font-semibold block mb-0.5">{t.resetRuleTitle}:</strong>
                          <p>{method.resetRule[language]}</p>
                        </div>
                      )}

                      {/* Facilitator tip */}
                      {method.animatorTips[language].length > 0 && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-950 font-normal">
                          <strong className="font-semibold block mb-0.5">{t.tipsPracticeTitle}:</strong>
                          <ul className="space-y-1">
                            {method.animatorTips[language].map((tip, i) => (
                              <li key={i}>• {tip}</li>
                            ))}
                          </ul>
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

      {/* VIEW 3: QUOTE LIBRARY (ZITATESAMMLUNG) */}
      {viewMode === 'quotes' && (
        <div className="space-y-6">
          {/* Hierarchical Filter Bar: Book, Section & Topic */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-black/[0.06] shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-black/[0.04] pb-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Book Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] shrink-0">
                    {t.filterBookLabel}:
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => handleSelectBook(e.target.value)}
                    className="text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] px-3 py-1.5 rounded-full border border-black/[0.06] outline-hidden cursor-pointer transition-colors"
                  >
                    <option value="all">{t.allBooks} ({QUOTES_DATA.length})</option>
                    {uniqueBooks.map(b => (
                      <option key={b.de} value={b.de}>
                        {b[language]} ({b.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Section / Lesson Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] shrink-0">
                    {t.filterSectionLabel}:
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={availableSections.length === 0}
                    className="text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] px-3 py-1.5 rounded-full border border-black/[0.06] outline-hidden cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="all">{t.allSections} ({availableSections.reduce((acc, s) => acc + s.count, 0)})</option>
                    {availableSections.map(s => (
                      <option key={s.de} value={s.de}>
                        {s[language]} ({s.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                {hasActiveQuoteFilters && (
                  <button
                    onClick={handleResetQuoteFilters}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#0071e3] hover:underline px-2 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.resetFilters}</span>
                  </button>
                )}
              </div>

              <span className="text-xs text-[#86868b] font-medium shrink-0 self-end lg:self-auto">
                {filteredQuotes.length} {filteredQuotes.length === 1 ? t.quoteFound : t.quotesFound}
              </span>
            </div>

            {/* Tier 3: Generalized Topic Filter Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                {t.filterTopicLabel}:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {generalTopicsList.map(topic => {
                  const isSelected = selectedTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#1d1d1f] text-white font-semibold shadow-apple-pill'
                          : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08]'
                      }`}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Empty state if no quotes match */}
          {filteredQuotes.length === 0 && (
            <div className="py-12 text-center text-sm text-[#86868b] bg-white rounded-2xl border border-black/[0.06] p-8 space-y-3">
              <p>{t.noQuotesMatch}</p>
              <button
                onClick={handleResetQuoteFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] rounded-full transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetFilters}</span>
              </button>
            </div>
          )}

          {/* Quotes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredQuotes.map((q) => {
              const isDualOpen = expandedLangQuoteIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-apple-card flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#1d1d1f]">
                          {q.theme[language]}
                        </span>
                        {q.section && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#0071e3] border border-blue-100">
                            {q.section[language]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#86868b] font-medium">
                          {q.book[language]}
                        </span>
                        <button
                          onClick={() => toggleDualLang(q.id)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#0071e3] transition-colors"
                          title={language === 'de' ? 'Englische Übersetzung anzeigen' : 'Show German translation'}
                        >
                          {isDualOpen ? 'DE/EN ▲' : 'DE/EN ▼'}
                        </button>
                      </div>
                    </div>

                    <blockquote className="font-serif text-base sm:text-lg text-[#1d1d1f] leading-relaxed italic">
                      „{language === 'de' ? q.textDe : q.textEn}“
                    </blockquote>

                    {isDualOpen && (
                      <div className="p-3 bg-black/[0.02] border-l-2 border-[#0071e3] rounded-r-xl text-xs sm:text-sm font-serif italic text-[#515154] leading-relaxed">
                        „{language === 'de' ? q.textEn : q.textDe}“
                      </div>
                    )}

                    <p className="text-xs text-[#86868b] font-medium">
                      — {q.source[language]}
                    </p>
                  </div>

                  {/* Bottom Actions with Direct Studio Simulator Launcher */}
                  <div className="pt-3 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyQuote(q)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                    >
                      {copiedQuoteId === q.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#86868b]" />
                      )}
                      <span>{copiedQuoteId === q.id ? t.copiedSuccess : t.copyQuote}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => launchStudioWithQuote(q, 'chalkboard')}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] rounded-full transition-colors"
                        title={t.toolChalkboard}
                      >
                        <Eraser className="w-3 h-3 text-[#0071e3]" />
                        <span>Tafel</span>
                      </button>

                      <button
                        onClick={() => launchStudioWithQuote(q, 'wordPuzzle')}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] rounded-full transition-colors"
                        title={t.toolWordPuzzle}
                      >
                        <Puzzle className="w-3 h-3 text-emerald-600" />
                        <span>Puzzle</span>
                      </button>

                      <button
                        onClick={() => launchStudioWithQuote(q, 'firstLetter')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3] hover:underline ml-1"
                      >
                        <span>{t.openInSimulator}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
