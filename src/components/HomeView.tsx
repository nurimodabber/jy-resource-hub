import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Bookmark,
  ChevronRight,
  X,
  Smartphone,
  Palette,
  HeartHandshake,
  History,
  Timer as TimerIcon,
  Users as UsersIcon,
  MessageSquareQuote,
  Award,
  BookOpen,
  Plus,
  Minus,
  Music,
  Share2,
  Wrench,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { QUOTES_DATA } from '../data/quotes';
import { getQuoteSong } from '../data/quoteSongs';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { useToast } from '../context/ToastContext';
import { stripQuotes } from '../utils/random';
import { shareResource } from '../utils/share';
import { loadRecentViews } from '../utils/recentViews';
import { loadGroupTitle } from '../utils/groupNames';
import { getBadiDate } from '../utils/badiCalendar';
import {
  loadBookProgress,
  saveBookProgress,
  getBookById,
  JY_BOOKS,
  type BookProgress,
} from '../utils/bookProgress';
import { tr, Panel, Label, Stepper, ChoiceChips, primaryBtn } from './tools/common';
import { ArrowLink } from './ui/ArrowLink';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface HomeViewProps {
  language: Language;
  favorites: string[];
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
}

export const getDayOfYear = (d: Date = new Date()): number => {
  const start = new Date(Date.UTC(d.getFullYear(), 0, 0));
  const diff = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - start.getTime();
  return Math.floor(diff / 86400000);
};

export const HomeView: React.FC<HomeViewProps> = ({ language, favorites, onToggleFavorite }) => {
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const navigate = useNavigate();

  // PWA Install banner state (mobile only)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) {
        return false;
      }
      return localStorage.getItem('jy_dismiss_install') !== 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem('jy_dismiss_install', 'true');
    } catch {
      /* ignore */
    }
  };

  const handleNativeInstall = async () => {
    if (!deferredInstallPrompt) return;
    try {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        handleDismissInstall();
      }
      setDeferredInstallPrompt(null);
    } catch {
      /* ignore */
    }
  };

  // Compact Spielfinder state
  const [finderSize, setFinderSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jy_quick_pick_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.size === 'number') return parsed.size;
      }
    } catch {
      /* ignore */
    }
    return 12;
  });

  const [finderDuration, setFinderDuration] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('jy_quick_pick_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.duration !== undefined) return parsed.duration;
      }
    } catch {
      /* ignore */
    }
    return '20';
  });

  const [showCompactFinder, setShowCompactFinder] = useState(false);

  const handleSearchGames = () => {
    try {
      localStorage.setItem(
        'jy_quick_pick_v2',
        JSON.stringify({ size: finderSize, duration: finderDuration })
      );
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams();
    params.set('personen', String(finderSize));
    if (finderDuration) params.set('dauer', finderDuration);
    navigate(`/games?${params.toString()}`);
  };

  // Quote of the day
  const quoteIndex = getDayOfYear() % QUOTES_DATA.length;
  const quote = QUOTES_DATA[quoteIndex];
  const quoteSong = quote ? getQuoteSong(quote.id, language) : undefined;

  // Recent viewed items and group title
  const [recentViews] = useState(() => loadRecentViews());
  const [groupTitle] = useState(() => loadGroupTitle());

  // Dates: Gregorian & Badí'
  const badiDate = React.useMemo(() => getBadiDate(new Date()), []);
  const gregorianFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [language]);

  // Book progress state
  const [bookProgress, setBookProgress] = useState<BookProgress | null>(() => loadBookProgress());
  const [isSelectingBook, setIsSelectingBook] = useState(false);
  const activeBook = bookProgress ? getBookById(bookProgress.bookId) : null;

  const handleUpdateLesson = (delta: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!bookProgress || !activeBook) return;
    const nextLesson = Math.max(1, Math.min(activeBook.totalLessons, bookProgress.lesson + delta));
    const updated: BookProgress = { ...bookProgress, lesson: nextLesson };
    saveBookProgress(updated);
    setBookProgress(updated);
  };

  const handleSelectBook = (bookId: string) => {
    const updated: BookProgress = { bookId, lesson: 1 };
    saveBookProgress(updated);
    setBookProgress(updated);
    setIsSelectingBook(false);
  };

  // Time-of-day greeting (re-evaluated on client time; updates periodically)
  // Morning: 05:00 - 11:59 | Afternoon: 12:00 - 17:59 | Evening/Night: 18:00 - 04:59
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const baseGreeting =
    currentHour >= 5 && currentHour < 12
      ? t.greetingMorning
      : currentHour >= 12 && currentHour < 18
      ? t.greetingAfternoon
      : t.greetingEvening;
  const fullGreeting = groupTitle ? `${baseGreeting}, ${groupTitle}` : baseGreeting;

  // Fixed selection for Service & Arts
  const sampleService = SERVICE_PROJECTS_DATA[0];
  const sampleArt = ARTS_PROMPTS_DATA[0];

  const { showToast } = useToast();

  const handleShareQuote = async () => {
    if (!quote) return;
    const text = language === 'de' ? quote.textDe : quote.textEn;
    const source = quote.source[language];
    const quoteUrl = `${window.location.origin}/quotes/${quote.id}`;
    const result = await shareResource({
      title: `${quote.theme[language]} – ${t.siteTitle}`,
      text: `„${stripQuotes(text)}“\n— ${source}`,
      url: quoteUrl,
    });
    if (result.success) {
      showToast({ text: t.quoteShareSuccess });
    }
  };

  const quoteText = quote ? (language === 'de' ? quote.textDe : quote.textEn) : '';

  return (
    <div className="max-w-6xl w-full mx-auto pb-10 space-y-8 sm:space-y-10">
      {/* 1. Installationshinweis (PWA Prompt – Mobile only) */}
      {showInstallBanner && (
        <aside
          aria-label={L('Installationshinweis', 'Install banner')}
          className="md:hidden flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-card bg-accent/10 text-text text-xs border border-accent/25 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-accent shrink-0" />
            <p className="line-clamp-2">
              {L(
                'Tipp: Zum Startbildschirm hinzufügen, um die Seite wie eine App und offline zu nutzen.',
                'Tip: Add to home screen to use the hub offline like an app.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {deferredInstallPrompt && (
              <button
                type="button"
                onClick={handleNativeInstall}
                className="px-2.5 py-1.5 min-h-[44px] rounded-control bg-accent text-accent-contrast font-bold text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t.installAppCta}
              </button>
            )}
            <button
              type="button"
              onClick={handleDismissInstall}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-control text-text-secondary hover:text-text cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={L('Hinweis schließen', 'Dismiss notice')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. Hero-Bereich: Noble Editorial Typografie & Pill-CTAs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Linke Spalte: Begrüßung & Datum (lg:col-span-7) */}
        <header className="lg:col-span-7 space-y-3">
          <h1 className="font-serif text-[32px] sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.15] sm:leading-[1.12]">
            {fullGreeting}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
            {L(
              'Materialien, Zitate und Werkzeuge für deine Juniorjugendgruppe.',
              'Materials, quotes, and tools for your junior youth group.'
            )}
          </p>
          {/* Dezente Datumszeile (Gregorianisch & Badí') */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-2xs sm:text-xs text-text-tertiary">
            <span className="font-medium text-text-secondary">{gregorianFormatted}</span>
            <span className="text-border-strong select-none" aria-hidden="true">·</span>
            <span className="font-medium text-accent-text bg-accent-subtle/70 px-2.5 py-0.5 rounded-full inline-flex items-center">
              {language === 'de' ? badiDate.formattedDe : badiDate.formattedEn}
            </span>
          </div>
        </header>

        {/* Rechte Spalte: Die zwei CTAs als edle Pill-Buttons */}
        <div className="lg:col-span-5 space-y-3">
          <nav
            aria-label={L('Haupteinstiege', 'Main navigation')}
            className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-2.5 sm:gap-3"
          >
            {/* Aktion 1: Spiel finden */}
            <button
              type="button"
              onClick={() => setShowCompactFinder(!showCompactFinder)}
              className="liquid-pill-primary px-6 py-3.5 sm:py-4 flex items-center justify-between group cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent min-h-[52px]"
            >
              <div className="min-w-0 pr-2">
                <div className="font-bold text-sm sm:text-base text-accent-contrast tracking-tight">
                  {L('Spiel finden', 'Find a game')}
                </div>
                <p className="text-2xs text-accent-contrast/80 font-medium leading-tight truncate">
                  {L('Gruppengröße & Zeit wählen', 'Pick group size & time')}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent-contrast/90 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* Aktion 2: Zitate & Gebete */}
            <Link
              to="/quotes"
              className="liquid-pill-secondary px-6 py-3.5 sm:py-4 flex items-center justify-between group cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent min-h-[52px]"
            >
              <div className="min-w-0 pr-2">
                <div className="font-bold text-sm sm:text-base text-text group-hover:text-accent tracking-tight transition-colors">
                  {L('Zitate & Gebete', 'Quotes & Prayers')}
                </div>
                <p className="text-2xs text-text-secondary leading-tight truncate">
                  {L('Texte nachschlagen & vertiefen', 'Look up texts & reflect')}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </nav>

          {/* Spielfinder kompakt (nur bei Klick auf "Spiel finden") */}
          {showCompactFinder && (
            <section aria-label={L('Kompakter Spielfinder', 'Compact game finder')} className="animate-in fade-in duration-200">
              <Panel className="space-y-4 border border-border bg-surface rounded-card p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-text flex items-center gap-2">
                    <Compass className="w-4 h-4 text-accent" />
                    <span>{L('Schneller Spielfinder', 'Quick game finder')}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCompactFinder(false)}
                    aria-label={L('Spielfinder schließen', 'Close game finder')}
                    className="text-text-tertiary hover:text-text min-w-[44px] min-h-[44px] flex items-center justify-center rounded-control text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{L('Wie viele Personen?', 'How many people?')}</Label>
                    <Stepper
                      value={finderSize}
                      min={2}
                      max={40}
                      onChange={setFinderSize}
                      label={L('Gruppengröße', 'Group size')}
                    />
                  </div>

                  <div>
                    <Label>{L('Höchstens wie lang?', 'How long at most?')}</Label>
                    <ChoiceChips
                      value={finderDuration}
                      onChange={setFinderDuration}
                      allLabel={L('Egal', 'Any')}
                      options={[
                        { id: '10', label: '10 min' },
                        { id: '20', label: '20 min' },
                        { id: '30', label: '30 min' },
                      ]}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearchGames}
                  className={`${primaryBtn} w-full min-h-[44px]`}
                >
                  <span>{L('Passende Spiele anzeigen', 'Show matching games')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Panel>
            </section>
          )}
        </div>
      </div>

      {/* 3. Zitat des Tages: Raum für das heilige Wort */}
      {quote && (
        <section
          aria-label={L('Zitat des Tages', 'Quote of the day')}
          className="px-6 pb-6 pt-3.5 sm:px-8 sm:pb-8 sm:pt-3.5 rounded-card bg-surface border border-border/70 shadow-xs hover:shadow-1 transition-all duration-200 space-y-4 group"
        >
          {/* Header Row: Feine Typografie-Kennzeichnung & Aktionen */}
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3 sm:pb-3.5">
            <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-tertiary truncate">
              {L('Zitat des Tages', 'Quote of the day')}
              {quote.book[language] &&
              !/gebete?\s*(&|und|\+)?\s*andacht/i.test(quote.book[language]) &&
              !/prayers?\s*(&|and|\+)?\s*devotions?/i.test(quote.book[language])
                ? ` · ${quote.book[language]}`
                : ''}
            </span>

            {/* Symmetrische Icon-Aktionen */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Lesezeichen / Merken */}
              <button
                type="button"
                onClick={(e) => onToggleFavorite?.(quote.id, e)}
                className={`min-w-[44px] min-h-[44px] rounded-control flex items-center justify-center transition-all duration-150 active:scale-90 motion-reduce:transform-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent ${
                  favorites.includes(quote.id)
                    ? 'text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs'
                    : 'text-text-secondary hover:text-text hover:bg-surface-2'
                }`}
                title={favorites.includes(quote.id) ? t.savedItems : L('Merken', 'Save')}
                aria-label={favorites.includes(quote.id) ? t.savedItems : L('Merken', 'Save')}
                aria-pressed={favorites.includes(quote.id)}
              >
                <Bookmark className={`w-4 h-4 transition-transform duration-150 ${favorites.includes(quote.id) ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
              </button>

              {/* Teilen */}
              <button
                type="button"
                onClick={handleShareQuote}
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-control flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
                title={t.quoteShare}
                aria-label={t.quoteShare}
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Lied (falls vorhanden) */}
              {quoteSong && (
                <a
                  href={quoteSong.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-control flex items-center justify-center text-text-secondary hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
                  title={language === 'de' ? `Lied „${quoteSong.title}“ auf bahaisongs.com anhören` : `Listen to song "${quoteSong.title}" on bahaisongs.com`}
                  aria-label={t.quoteSongAriaLabel}
                >
                  <Music className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Scripture text in großzügiger Lora-Serifenschrift */}
          <Link
            to={`/quotes/${quote.id}`}
            className="block group/quote focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control pt-1"
          >
            <blockquote className="font-serif text-lg sm:text-xl md:text-2xl text-text leading-[1.65] select-text group-hover/quote:text-accent transition-colors font-normal">
              {language === 'de' ? `»${stripQuotes(quoteText)}«` : `“${stripQuotes(quoteText)}”`}
            </blockquote>

            <cite className="not-italic text-xs sm:text-sm text-text-secondary font-serif italic block mt-3">
              — {quote.source[language]}
            </cite>
          </Link>
        </section>
      )}

      {/* 4. Werkzeug-Bereich: Taktile Instrumente */}
      <section aria-label={t.tabTools} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
              {t.tabTools}
            </h2>
            <p className="text-xs text-text-tertiary">
              {L('Live-Helfer für die Gruppe', 'Live tools for the group')}
            </p>
          </div>
          <ArrowLink to="/tools">
            {L('Alle Werkzeuge', 'All tools')}
          </ArrowLink>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/tools/timer"
            className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 hover:-translate-y-1 hover:shadow-2 transition-all duration-200 group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent shadow-xs min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                {L('Timer', 'Timer')}
              </span>
              <TimerIcon className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text tabular-nums">
              05:00
            </div>
            <p className="text-2xs text-text-secondary mt-1">
              {L('Timer & Signalton', 'Timer & chime')}
            </p>
          </Link>

          <Link
            to="/tools/teams"
            className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 hover:-translate-y-1 hover:shadow-2 transition-all duration-200 group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent shadow-xs min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                {L('Gruppen', 'Groups')}
              </span>
              <UsersIcon className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text tabular-nums">
              2 Teams
            </div>
            <p className="text-2xs text-text-secondary mt-1">
              {L('Faire Zufallsteams', 'Fair random teams')}
            </p>
          </Link>

          <Link
            to="/tools/cards"
            className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 hover:-translate-y-1 hover:shadow-2 transition-all duration-200 group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent shadow-xs min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                {L('Gespräch', 'Cards')}
              </span>
              <MessageSquareQuote className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text tabular-nums">
              {L('Karten', 'Cards')}
            </div>
            <p className="text-2xs text-text-secondary mt-1">
              {L('Fragen für den Kreis', 'Circle questions')}
            </p>
          </Link>

          <Link
            to="/tools/scoreboard"
            className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 hover:-translate-y-1 hover:shadow-2 transition-all duration-200 group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent shadow-xs min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
                {L('Stand', 'Score')}
              </span>
              <Award className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text tabular-nums">
              Punkte
            </div>
            <p className="text-2xs text-text-secondary mt-1">
              {L('Stationen & Runden', 'Stations & rounds')}
            </p>
          </Link>
        </div>
      </section>

      {/* 4. Dienst & Kunst: Karten mit visueller Kennung und Section-Links ohne Umbruch */}
      <section aria-label={L('Dienst & Kunst', 'Service & Arts')} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
              {L('Dienst & Kunst', 'Service & Arts')}
            </h2>
            <p className="text-xs text-text-tertiary">
              {L('Gemeinwohlorientierte Aktionen und kreativer Ausdruck', 'Community service and creative expression')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ArrowLink to="/service">
              {L('Dienst', 'Service')}
            </ArrowLink>
            <span className="text-border select-none" aria-hidden="true">·</span>
            <ArrowLink to="/arts">
              {L('Kunst', 'Creative')}
            </ArrowLink>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Service Project Card */}
          {sampleService && (
            <Link
              to={`/service/${sampleService.id}`}
              className="flex flex-col justify-between px-4 pb-4 pt-2.5 sm:px-5 sm:pb-5 sm:pt-3 rounded-card bg-surface border border-border hover:bg-surface-2/40 hover:shadow-2 transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent shadow-1"
            >
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-2xs text-text-tertiary">
                  <span className="font-semibold uppercase tracking-wider text-text-secondary">
                    {L('Dienstprojekt', 'Service Project')}
                  </span>
                  <span className="font-medium tabular-nums">
                    {sampleService.durationMin}–{sampleService.durationMax} {L('Min', 'min')}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base transition-colors">
                  {sampleService.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleService.objective[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-tertiary">
                <span>{sampleService.groupSize.min}–{sampleService.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-text-secondary group-hover:text-text group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          )}

          {/* Arts Prompt Card */}
          {sampleArt && (
            <Link
              to={`/arts/${sampleArt.id}`}
              className="flex flex-col justify-between px-4 pb-4 pt-2.5 sm:px-5 sm:pb-5 sm:pt-3 rounded-card bg-surface border border-border hover:bg-surface-2/40 hover:shadow-2 transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent shadow-1"
            >
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-2xs text-text-tertiary">
                  <span className="font-semibold uppercase tracking-wider text-text-secondary">
                    {L('Kunst & Theater', 'Arts & Drama')}
                  </span>
                  <span className="font-medium tabular-nums">
                    {sampleArt.durationMin}–{sampleArt.durationMax} {L('Min', 'min')}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base transition-colors">
                  {sampleArt.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleArt.description[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-tertiary">
                <span>{sampleArt.groupSize.min}–{sampleArt.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-text-secondary group-hover:text-text group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* 5. Dein Bereich: 3 Kacheln mit 44px+ Touch-Zielen */}
      <section aria-label={L('Dein Bereich', 'Your workspace')} className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
          {L('Dein Bereich', 'Your workspace')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Kachel 1: Werkzeuge */}
          <Link
            to="/tools"
            className="flex items-center gap-3.5 p-4 rounded-card border border-border bg-surface hover:bg-surface-2/40 hover:shadow-2 transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent shadow-1"
          >
            <Wrench className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text text-sm truncate transition-colors">
                {t.tabTools}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 truncate">
                {L('Timer, Teams, Rollen und mehr', 'Timer, teams, roles and more')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-text shrink-0" />
          </Link>

          {/* Kachel 2: Gemerkt */}
          <Link
            to="/saved"
            className="flex items-center gap-3.5 p-4 rounded-card border border-border bg-surface hover:bg-surface-2/40 hover:shadow-2 transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent shadow-1"
          >
            <Bookmark className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text text-sm truncate transition-colors">
                {t.savedItems}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
                {favorites.length > 0
                  ? `${favorites.length} ${L('gemerkte Inhalte', 'saved items')}`
                  : L('Spiele, Zitate und Projekte merken', 'Save items for later')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-text shrink-0" />
          </Link>

          {/* Kachel 3: Buch-Fortschritt mit mindestens 44px Touch-Zielen */}
          <div className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-surface hover:bg-surface-2/40 hover:shadow-2 transition-all duration-150 group shadow-1">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <BookOpen className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsSelectingBook(!isSelectingBook)}
                  className="font-bold text-text text-sm truncate text-left block w-full transition-colors cursor-pointer min-h-[44px] flex flex-col justify-center focus-visible:ring-2 focus-visible:ring-accent rounded-control"
                >
                  <span className="truncate">{activeBook ? activeBook.title[language] : L('Juniorjugend-Buch', 'JY Book')}</span>
                  <span className="text-xs text-text-secondary font-normal">
                    {activeBook
                      ? `${L('Lektion', 'Lesson')} ${bookProgress?.lesson || 1} / ${activeBook.totalLessons}`
                      : L('Buch auswählen', 'Select book')}
                  </span>
                </button>
              </div>
            </div>

            {/* Stepper buttons mit Mindest-Touch-Größe 44px */}
            {activeBook && (
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleUpdateLesson(-1, e)}
                  disabled={!bookProgress || bookProgress.lesson <= 1}
                  aria-label={L('Vorherige Lektion', 'Previous lesson')}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-control transition-opacity"
                >
                  <span className="w-7 h-7 rounded-control bg-surface-2 hover:bg-surface-2/80 flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUpdateLesson(1, e)}
                  disabled={!bookProgress || bookProgress.lesson >= activeBook.totalLessons}
                  aria-label={L('Nächste Lektion', 'Next lesson')}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-control transition-opacity"
                >
                  <span className="w-7 h-7 rounded-control bg-surface-2 hover:bg-surface-2/80 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Buch-Auswahl Popover/Drawer */}
        {isSelectingBook && (
          <div className="p-4 rounded-card border border-border bg-surface-2 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-bold text-text mb-2">
              <span>{L('Aktuelles Juniorjugend-Buch wählen:', 'Select current book:')}</span>
              <button
                type="button"
                onClick={() => setIsSelectingBook(false)}
                className="text-text-tertiary hover:text-text cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent rounded-control"
                aria-label={L('Schließen', 'Close')}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {JY_BOOKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBook(b.id)}
                  className={`p-3 rounded-control border text-left text-xs transition-colors cursor-pointer min-h-[44px] flex flex-col justify-center focus-visible:ring-2 focus-visible:ring-accent ${
                    bookProgress?.bookId === b.id
                      ? 'bg-accent/15 border-accent text-accent font-bold'
                      : 'bg-surface border-border text-text hover:border-text-secondary'
                  }`}
                >
                  <span className="block truncate font-medium">{b.title[language]}</span>
                  <span className="text-2xs text-text-tertiary">{b.totalLessons} {L('Lektionen', 'lessons')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 6. Zuletzt angesehen: Ansprechender Leerzustand & Verlaufskarten */}
      <section aria-label={L('Zuletzt angesehen', 'Recently viewed')} className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-text-tertiary" />
          <span>{L('Zuletzt angesehen', 'Recently viewed')}</span>
        </h3>
        {recentViews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {recentViews.map((item) => (
              <Link
                key={`rec-${item.id}`}
                to={item.path}
                className="flex items-center gap-2.5 p-3 rounded-card bg-surface border border-border hover:bg-surface-2 transition-colors group min-h-[52px] focus-visible:ring-2 focus-visible:ring-accent shadow-1"
              >
                <div className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors flex items-center justify-center shrink-0">
                  {item.type === 'game' ? (
                    <Compass className="w-4 h-4" />
                  ) : item.type === 'quote' ? (
                    <BookOpen className="w-4 h-4" />
                  ) : item.type === 'service' ? (
                    <HeartHandshake className="w-4 h-4" />
                  ) : (
                    <Palette className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text text-xs truncate">
                    {item.title[language]}
                  </p>
                  {item.subtitle && (
                    <p className="text-2xs text-text-tertiary truncate">{item.subtitle[language]}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-text shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-card bg-surface border border-border shadow-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <History className="w-5 h-5 text-text-tertiary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-text text-sm">
                  {t.recentViewsEmptyTitle}
                </p>
                <p className="text-xs text-text-secondary max-w-lg leading-relaxed">
                  {t.recentViewsEmptyDesc}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
              <Link
                to="/games"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full liquid-pill-secondary text-xs font-semibold min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t.exploreGames}
              </Link>
              <Link
                to="/quotes"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full liquid-pill-primary text-xs font-bold min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t.exploreQuotes}
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
