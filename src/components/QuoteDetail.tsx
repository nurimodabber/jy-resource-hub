import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, Bookmark, Share2, Copy, Check, Heart, Plus, Maximize2, 
  Play, ChevronDown, ChevronUp, Sun, Moon, Sparkles, X, ChevronLeft, ChevronRight,
  Laptop
} from 'lucide-react';
import { QuoteItem, Language, QuoteMethod } from '../types';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { UI_TRANSLATIONS } from '../data/translations';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { useToast } from '../context/ToastContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { shareResource } from '../utils/share';
import { isPrayerQuote, formatQuoteSection } from './QuoteCard';

interface QuoteDetailProps {
  quote: QuoteItem;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
  onAddToMeeting: (quote: QuoteItem) => void;
  onUseAsDevotional: (quote: QuoteItem) => void;
  onPracticeTool: (quote: QuoteItem, toolId: string) => void;
}

const METHOD_TO_TOOL_MAP: Record<string, string> = {
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

export const QuoteDetail: React.FC<QuoteDetailProps> = ({
  quote,
  language,
  favorites,
  onToggleFavorite,
  onBack,
  onAddToMeeting,
  onUseAsDevotional,
  onPracticeTool,
}) => {
  const t = UI_TRANSLATIONS[language];
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showAllMethods, setShowAllMethods] = useState(false);

  // Presentation / Reading Mode state
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [beamerHighContrast, setBeamerHighContrast] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState(1); // 0 = standard, 1 = large, 2 = extra large, 3 = beamer huge
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => {
    const idx = QUOTES_DATA.findIndex((q) => q.id === quote.id);
    return idx >= 0 ? idx : 0;
  });

  const activeQuote = QUOTES_DATA[currentQuoteIndex] || quote;
  const isFavorite = favorites.includes(activeQuote.id);
  const isPrayer = isPrayerQuote(activeQuote);

  const text = language === 'de' ? activeQuote.textDe : activeQuote.textEn;
  const bookName = activeQuote.mainBook ? activeQuote.mainBook[language] : activeQuote.book[language].split(',')[0].trim();
  const sectionName = formatQuoteSection(activeQuote.section ? activeQuote.section[language] : undefined);

  // Keep screen awake during reading mode
  useWakeLock(isReadingMode);

  // Sync index when prop changes
  useEffect(() => {
    const idx = QUOTES_DATA.findIndex((q) => q.id === quote.id);
    if (idx >= 0) setCurrentQuoteIndex(idx);
  }, [quote.id]);

  // Methods recommendations based on quote length
  const recommendedMethods = useMemo(() => {
    const wordCount = (language === 'de' ? activeQuote.textDe : activeQuote.textEn).trim().split(/\s+/).length;
    let targetIds: string[];

    if (wordCount < 18) {
      targetIds = ['erstbuchstaben-geruest', 'die-verschwindende-tafel', 'kreis-sprint'];
    } else if (wordCount <= 35) {
      targetIds = ['zitate-treppe', 'zitate-lochkarte', 'fehler-sucher'];
    } else {
      targetIds = ['zitate-treppe', 'kollektives-tafel-schreiben', 'erstbuchstaben-geruest'];
    }

    return targetIds
      .map((id) => QUOTE_METHODS_DATA.find((m) => m.id === id))
      .filter((m): m is QuoteMethod => !!m);
  }, [activeQuote, language]);

  // Remaining methods
  const remainingMethods = useMemo(() => {
    const recIds = new Set(recommendedMethods.map((m) => m.id));
    return QUOTE_METHODS_DATA.filter((m) => !recIds.has(m.id));
  }, [recommendedMethods]);

  const handleCopy = () => {
    const formatted = `„${text}“\n— ${activeQuote.source[language]} (${activeQuote.book[language]})`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    showToast({
      text: language === 'de' ? 'Zitat kopiert' : 'Quote copied',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await shareResource({
      title: activeQuote.theme[language],
      text: `„${text}“\n— ${activeQuote.source[language]}`,
      url: window.location.href,
    });
  };

  // Keyboard navigation & gestures for Presentation Mode
  useEffect(() => {
    if (!isReadingMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsReadingMode(false);
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES_DATA.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentQuoteIndex((prev) => (prev - 1 + QUOTES_DATA.length) % QUOTES_DATA.length);
      } else if (e.key === '+' || e.key === '=') {
        setFontSizeStep((prev) => Math.min(3, prev + 1));
      } else if (e.key === '-' || e.key === '_') {
        setFontSizeStep((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingMode]);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (deltaX < -50) {
      setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES_DATA.length);
    } else if (deltaX > 50) {
      setCurrentQuoteIndex((prev) => (prev - 1 + QUOTES_DATA.length) % QUOTES_DATA.length);
    }
    touchStartXRef.current = null;
  };

  const fontClasses = [
    'text-xl sm:text-2xl leading-relaxed',
    'text-2xl sm:text-3xl leading-relaxed',
    'text-3xl sm:text-4xl leading-relaxed',
    'text-4xl sm:text-5xl lg:text-6xl leading-tight',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-36 lg:pb-24 pt-2">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          onClick={onBack}
          className="min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>{t.backToQuotes}</span>
        </Button>

        <div className="flex items-center gap-2">
          <IconButton
            label={isFavorite ? t.savedItems : (language === 'de' ? 'Merken' : 'Save')}
            variant="outline"
            className={isFavorite ? 'text-accent' : 'text-text-secondary'}
            onClick={(e) => onToggleFavorite(activeQuote.id, e)}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent' : ''}`} />
          </IconButton>
          <IconButton
            label={copied ? (language === 'de' ? 'Kopiert' : 'Copied') : (language === 'de' ? 'Kopieren' : 'Copy')}
            variant="outline"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
          </IconButton>
          <IconButton
            label={language === 'de' ? 'Teilen' : 'Share'}
            variant="outline"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      {/* Main Sacred Text Reading Card (Calm surface, generous margin, Lora serif) */}
      <section className="bg-surface rounded-3xl border border-border p-6 sm:p-12 lg:p-16 space-y-8 shadow-xs">
        <div className="flex items-center justify-between gap-3 text-xs text-text-tertiary">
          <span className="font-medium tracking-wide">
            {bookName} {sectionName ? `· ${sectionName}` : ''}
          </span>
          {isPrayer && (
            <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary border border-border">
              {language === 'de' ? 'Gebet & Andacht' : 'Prayer & Devotion'}
            </span>
          )}
        </div>

        {/* The Holy Text: strictly unmodified, Lora font, max-w 680px */}
        <div className="max-w-[680px] mx-auto py-2">
          <blockquote className="font-serif text-2xl sm:text-3xl leading-[1.65] text-text text-center sm:text-left select-text">
            „{text}“
          </blockquote>

          <div className="mt-8 text-center sm:text-left">
            <cite className="not-italic text-sm sm:text-base text-text-secondary font-serif italic block">
              — {activeQuote.source[language]}
            </cite>
            <span className="text-xs text-text-tertiary mt-1 block">
              {activeQuote.book[language]}
            </span>
          </div>
        </div>

        {/* Lesemodus Button */}
        <div className="pt-6 border-t border-border flex flex-wrap items-center justify-center sm:justify-between gap-4">
          <Button
            variant="secondary"
            onClick={() => setIsReadingMode(true)}
            className="min-h-[44px]"
          >
            <Maximize2 className="w-4 h-4 mr-2 text-accent" />
            <span>{t.presentationMode}</span>
          </Button>

          <span className="text-xs text-text-tertiary">
            {language === 'de' ? 'Vollbild · Beamer · Bildschirm bleibt an' : 'Fullscreen · Beamer · Screen kept awake'}
          </span>
        </div>
      </section>

      {/* Devotional / Memorisation Section */}
      {isPrayer ? (
        <section className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-base sm:text-lg font-semibold text-text">
              {language === 'de' ? 'Andacht & Gebet in der Gruppe' : 'Devotions & Prayer in the Group'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t.prayerDevotionalTip1}
          </p>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t.prayerDevotionalTip2}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => onUseAsDevotional(activeQuote)}
              className="min-h-[44px]"
            >
              <Heart className="w-4 h-4 mr-2" />
              <span>{t.useAsDevotional}</span>
            </Button>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-text">
                {t.recommendedMethodsTitle}
              </h2>
              <p className="text-xs text-text-secondary">
                {language === 'de'
                  ? '3 Methoden abgestimmt auf die Länge dieses Zitats'
                  : '3 methods matched to the length of this verse'}
              </p>
            </div>
          </div>

          {/* 3 Recommended Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedMethods.map((method) => {
              const toolId = METHOD_TO_TOOL_MAP[method.id];
              return (
                <div
                  key={method.id}
                  className="bg-surface rounded-2xl border border-border p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary">
                        {method.phase === 1 ? t.phase1Short : method.phase === 2 ? t.phase2Short : t.phase3Short}
                      </span>
                      <span className="text-2xs text-text-tertiary">
                        {method.durationMinutes}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-text">
                      {method.name[language]}
                    </h3>

                    <p className="text-xs text-text-secondary line-clamp-3">
                      {method.summary[language]}
                    </p>
                  </div>

                  <div>
                    {toolId ? (
                      <Button
                        variant="primary"
                        onClick={() => onPracticeTool(activeQuote, toolId)}
                        className="w-full min-h-[44px]"
                      >
                        <Play className="w-4 h-4 mr-1.5" />
                        <span>{t.practiceDigitallyNow}</span>
                      </Button>
                    ) : (
                      <div className="text-2xs text-text-tertiary text-center py-2">
                        {language === 'de' ? 'Praktische Gruppenübung' : 'Practical group exercise'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collapsible toggle for remaining methods */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAllMethods(!showAllMethods)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline py-2 min-h-[44px] cursor-pointer"
            >
              {showAllMethods ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>{t.fewerMethodsToggle}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>{t.moreMethodsToggle} ({remainingMethods.length})</span>
                </>
              )}
            </button>

            {showAllMethods && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 animate-in fade-in duration-200">
                {remainingMethods.map((method) => {
                  const toolId = METHOD_TO_TOOL_MAP[method.id];
                  return (
                    <div
                      key={method.id}
                      className="bg-surface rounded-xl border border-border p-4 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary">
                            {method.phase === 1 ? t.phase1Short : method.phase === 2 ? t.phase2Short : t.phase3Short}
                          </span>
                          <span className="text-2xs text-text-tertiary">{method.durationMinutes}</span>
                          {toolId && (
                            <span className="inline-flex items-center gap-1 text-2xs text-accent font-medium">
                              <Laptop className="w-3 h-3" />
                              <span>{t.digitalMethodBadge}</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-text">{method.name[language]}</h4>
                        <p className="text-2xs text-text-secondary line-clamp-2">{method.summary[language]}</p>
                      </div>

                      {toolId && (
                        <Button
                          variant="secondary"
                          onClick={() => onPracticeTool(activeQuote, toolId)}
                          className="shrink-0 min-h-[44px] text-xs px-3 py-1.5"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          <span>{t.practiceTextLink}</span>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sticky Bottom Action Bar above Mobile Navigation */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-30 bg-surface backdrop-blur-md border-t border-border p-3 lg:safe-bottom shadow-2 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <IconButton
              label={isFavorite ? t.savedItems : (language === 'de' ? 'Merken' : 'Save')}
              variant="outline"
              className={isFavorite ? 'text-accent' : 'text-text-secondary'}
              onClick={(e) => onToggleFavorite(activeQuote.id, e)}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent' : ''}`} />
            </IconButton>
            <IconButton
              label={t.presentationMode}
              variant="outline"
              onClick={() => setIsReadingMode(true)}
            >
              <Maximize2 className="w-4 h-4" />
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            {isPrayer ? (
              <Button
                variant="primary"
                onClick={() => onUseAsDevotional(activeQuote)}
                className="min-h-[44px]"
              >
                <Heart className="w-4 h-4 mr-2" />
                <span>{t.useAsDevotional}</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => onAddToMeeting(activeQuote)}
                className="min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>{t.addToPlanner}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Reading / Presentation Mode */}
      {isReadingMode && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 transition-colors duration-200 select-text ${
            beamerHighContrast
              ? 'bg-black text-white'
              : 'bg-surface text-text'
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Control Bar in Reading Mode */}
          <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70 font-sans">
                {currentQuoteIndex + 1} / {QUOTES_DATA.length}
              </span>
              <span className="text-xs opacity-50 hidden sm:inline">·</span>
              <span className="text-xs opacity-70 font-sans hidden sm:inline">
                {bookName} {sectionName ? `· ${sectionName}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size A- / A+ */}
              <button
                type="button"
                onClick={() => setFontSizeStep((prev) => Math.max(0, prev - 1))}
                aria-label={t.fontSizeSmaller}
                className="px-3 py-1.5 rounded-lg border border-current opacity-80 hover:opacity-100 min-h-[44px] min-w-[44px] text-xs font-semibold cursor-pointer"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => setFontSizeStep((prev) => Math.min(3, prev + 1))}
                aria-label={t.fontSizeLarger}
                className="px-3 py-1.5 rounded-lg border border-current opacity-80 hover:opacity-100 min-h-[44px] min-w-[44px] text-xs font-semibold cursor-pointer"
              >
                A+
              </button>

              {/* Beamer Contrast Toggle */}
              <button
                type="button"
                onClick={() => setBeamerHighContrast(!beamerHighContrast)}
                aria-label={t.beamerContrast}
                className="px-3 py-1.5 rounded-lg border border-current opacity-80 hover:opacity-100 min-h-[44px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {beamerHighContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">{t.beamerContrast}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsReadingMode(false)}
                aria-label={t.exitPresentation}
                className="p-2.5 rounded-full border border-current opacity-80 hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Sacred Text Area */}
          <div className="max-w-4xl mx-auto w-full my-auto py-8 text-center px-4">
            <p className={`font-serif ${fontClasses[fontSizeStep]} leading-relaxed select-text`}>
              „{text}“
            </p>
            <p className="mt-8 font-serif italic text-base sm:text-xl opacity-75">
              — {activeQuote.source[language]}
            </p>
            <p className="mt-2 text-xs sm:text-sm opacity-60">
              {activeQuote.book[language]}
            </p>
          </div>

          {/* Bottom Bar in Reading Mode: Prev / Next buttons and Hints */}
          <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full text-xs opacity-75">
            <button
              type="button"
              onClick={() => setCurrentQuoteIndex((prev) => (prev - 1 + QUOTES_DATA.length) % QUOTES_DATA.length)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-current hover:opacity-100 min-h-[44px] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'de' ? 'Vorheriges' : 'Previous'}</span>
            </button>

            <span className="text-2xs opacity-60 hidden md:inline font-sans">
              {language === 'de'
                ? 'Tastatur: ← / → Zitat wechseln · + / − Schriftgröße · Esc Schließen'
                : 'Keyboard: ← / → Change quote · + / − Font size · Esc Close'}
            </span>

            <button
              type="button"
              onClick={() => setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES_DATA.length)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-current hover:opacity-100 min-h-[44px] cursor-pointer"
            >
              <span className="hidden sm:inline">{language === 'de' ? 'Nächstes' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
