import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Compass,
  ArrowRight,
  Clock,
  Play,
  Bookmark,
  ChevronRight,
  X,
  Smartphone,
  Quote as QuoteIcon,
  Palette,
  HeartHandshake,
  History,
  Timer as TimerIcon,
  Users as UsersIcon,
  Eye as EyeIcon,
  Award,
  BookOpen,
  Plus,
  Minus,
  Sparkles,
  Music,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { QUOTES_DATA } from '../data/quotes';
import { getQuoteSong } from '../data/quoteSongs';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { usePlanner } from '../context/PlannerContext';
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
}

export const getDayOfYear = (d: Date = new Date()): number => {
  const start = new Date(Date.UTC(d.getFullYear(), 0, 0));
  const diff = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - start.getTime();
  return Math.floor(diff / 86400000);
};

export const HomeView: React.FC<HomeViewProps> = ({ language, favorites }) => {
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const navigate = useNavigate();
  const { activePlan, addSlotToPlan } = usePlanner();

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

  // Active plan stats
  const slotCount = activePlan?.slots?.length ?? 0;
  const totalMinutes = activePlan?.slots?.reduce((sum, s) => sum + s.durationMinutes, 0) ?? 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const isPlanToday = Boolean(activePlan?.date && activePlan.date === todayStr);

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

  // Time-of-day greeting
  const currentHour = new Date().getHours();
  const baseGreeting =
    currentHour < 11
      ? (language === 'de' ? 'Guten Morgen' : 'Good morning')
      : currentHour < 17
      ? (language === 'de' ? 'Guten Tag' : 'Good afternoon')
      : (language === 'de' ? 'Guten Abend' : 'Good evening');
  const fullGreeting = groupTitle ? `${baseGreeting}, ${groupTitle}` : baseGreeting;

  // Fixed selection for Service & Arts
  const sampleService = SERVICE_PROJECTS_DATA[0];
  const sampleArt = ARTS_PROMPTS_DATA[0];

  const { showToast } = useToast();

  const handleUseQuoteAsDevotional = () => {
    if (!quote) return;
    addSlotToPlan({
      type: 'devotional',
      title: {
        de: `Andacht: ${quote.theme.de}`,
        en: `Devotion: ${quote.theme.en}`,
      },
      durationMinutes: 10,
      description: {
        de: quote.textDe,
        en: quote.textEn,
      },
      referenceId: quote.id,
      referenceType: 'quote',
    });
    navigate('/treffen');
  };

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
      {/* 1. Installationshinweis (PWA Prompt – Mobile only, wrapping safely without truncation) */}
      {showInstallBanner && (
        <aside
          aria-label={L('Installationshinweis', 'Install banner')}
          className="md:hidden flex items-start justify-between gap-3 px-3.5 py-3 rounded-control bg-accent/10 text-text text-xs border border-accent/25 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <Smartphone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="leading-snug text-xs text-text">
              {L(
                'Tipp: Zum Startbildschirm hinzufügen, um die Seite wie eine App und offline zu nutzen.',
                'Tip: Add to home screen to use the hub offline like an app.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {deferredInstallPrompt && (
              <button
                type="button"
                onClick={handleNativeInstall}
                className="px-3 py-1.5 min-h-[44px] rounded-full bg-accent text-accent-contrast font-bold text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t.installAppCta}
              </button>
            )}
            <button
              type="button"
              onClick={handleDismissInstall}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-text-secondary hover:text-text cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={L('Hinweis schließen', 'Dismiss notice')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. Hero-Bereich: Begrüßung links, die zwei gestapelten CTAs rechts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Linke Spalte: Begrüßung & Datum (lg:col-span-7) */}
        <header className="lg:col-span-7 space-y-2">
          {isPlanToday && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-accent text-accent-contrast">
              <Clock className="w-3 h-3" />
              {L('Heute anstehend', 'Scheduled for today')}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
            {slotCount > 0
              ? `${fullGreeting} · ${L('Weiter mit deinem Treffen', 'Continue your gathering')}`
              : fullGreeting}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
            {slotCount > 0
              ? L(
                  `Dein Entwurf für „${activePlan?.name}“ (${totalMinutes} Min., ${slotCount} Bausteine) wartet auf dich.`,
                  `Your draft for "${activePlan?.name}" (${totalMinutes} min., ${slotCount} blocks) is ready.`
                )
              : L(
                  'Spiele, heilige Zitate und Werkzeuge für deine Juniorjugendgruppe.',
                  'Games, sacred scripture, and tools for your junior youth group.'
                )}
          </p>
          {/* Dezente Datumszeile (Gregorianisch & Badí') */}
          <p className="text-2xs sm:text-xs text-text-tertiary flex flex-wrap items-center gap-x-2 pt-1">
            <span>{gregorianFormatted}</span>
            <span className="text-border" aria-hidden="true">·</span>
            <span className="text-text-secondary font-medium">
              {language === 'de' ? badiDate.formattedDe : badiDate.formattedEn}
            </span>
          </p>
        </header>

        {/* Rechte Spalte: In vertikaler Darstellung (Mobile) nebeneinander, in horizontaler Darstellung (Desktop) übereinander */}
        <div className="lg:col-span-5 space-y-3">
          <nav
            aria-label={L('Haupteinstiege', 'Main navigation')}
            className="grid grid-cols-2 lg:flex lg:flex-col gap-2.5 sm:gap-3"
          >
            {/* Hauptaktion: Treffen vorbereiten */}
            <Link
              to="/treffen"
              className="rounded-card bg-accent text-accent-contrast p-3.5 sm:p-4 lg:p-5 shadow-1 hover:bg-accent-hover transition-all duration-150 flex flex-col justify-between sm:flex-row sm:items-center sm:justify-between group cursor-pointer focus-visible:ring-2 focus-visible:ring-accent min-h-[92px] sm:min-h-0"
            >
              <div className="space-y-0.5 min-w-0 pr-1">
                <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base lg:text-lg tracking-tight">
                  <span>{L('Treffen vorbereiten', 'Prepare gathering')}</span>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-contrast shrink-0" />
                </div>
                <p className="text-2xs sm:text-xs text-accent-contrast/95 font-medium leading-tight">
                  {slotCount > 0
                    ? `${slotCount} ${L('Bausteine', 'blocks')} · ${totalMinutes} min`
                    : L('Ablauf planen, Bausteine zusammenstellen', 'Plan agenda, assemble building blocks')}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent-contrast/15 flex items-center justify-center shrink-0 self-end sm:self-center mt-2 sm:mt-0 group-hover:translate-x-0.5 transition-transform">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-accent-contrast" />
              </div>
            </Link>

            {/* Sekundäraktion: Spiel finden */}
            <button
              type="button"
              onClick={() => setShowCompactFinder(!showCompactFinder)}
              className="rounded-card bg-surface border border-line p-3.5 sm:p-4 lg:p-5 shadow-xs hover:border-accent hover:shadow-1 transition-all duration-150 flex flex-col justify-between sm:flex-row sm:items-center sm:justify-between group cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent min-h-[92px] sm:min-h-0"
            >
              <div className="space-y-0.5 min-w-0 pr-1">
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base lg:text-lg text-text group-hover:text-accent tracking-tight transition-colors">
                  <span>{L('Spiel finden', 'Find a game')}</span>
                  <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
                </div>
                <p className="text-2xs sm:text-xs text-text-secondary leading-tight">
                  {L('Gruppengröße & Zeit eingeben', 'Pick group size & time')}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-2 text-text flex items-center justify-center shrink-0 self-end sm:self-center mt-2 sm:mt-0 group-hover:bg-accent/15 group-hover:text-accent transition-colors">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>
          </nav>

          {/* Spielfinder kompakt (nur bei Klick auf "Spiel finden") */}
          {showCompactFinder && (
            <section aria-label={L('Kompakter Spielfinder', 'Compact game finder')} className="animate-in fade-in duration-200">
              <Panel className="space-y-4 border border-accent/30 bg-surface rounded-card p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-text flex items-center gap-2">
                    <Compass className="w-4 h-4 text-accent" />
                    <span>{L('Schneller Spielfinder', 'Quick game finder')}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCompactFinder(false)}
                    aria-label={L('Spielfinder schließen', 'Close game finder')}
                    className="text-text-tertiary hover:text-text min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
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
                  className={`${primaryBtn} w-full rounded-full min-h-[44px]`}
                >
                  <span>{L('Passende Spiele anzeigen', 'Show matching games')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Panel>
            </section>
          )}
        </div>
      </div>

      {/* 3. Zitat des Tages: Breiter horizontaler Raum, damit der Text in 1-2 Zeilen fließt */}
      {quote && (
        <section
          aria-label={L('Zitat des Tages', 'Quote of the day')}
          className="p-5 sm:p-6 rounded-card bg-surface border border-line shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <QuoteIcon className="w-3.5 h-3.5 text-accent" />
              <span>{L('Zitat des Tages', 'Quote of the day')}</span>
            </span>
            <ArrowLink to={`/quotes/${quote.id}`}>
              {L('Im Lesemodus', 'Reading mode')}
            </ArrowLink>
          </div>

          <blockquote className="font-serif text-base sm:text-lg text-text leading-relaxed">
            {language === 'de' ? `„${stripQuotes(quoteText)}“` : `“${stripQuotes(quoteText)}”`}
          </blockquote>

          {/* Untere Zeile: Quelle links, Aktions-Buttons rechts */}
          <div className="pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-text-secondary font-medium">
              {quote.source[language]}
            </p>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2">
              <button
                type="button"
                onClick={handleUseQuoteAsDevotional}
                className="px-3.5 py-2.5 rounded-full bg-accent/15 hover:bg-accent/25 text-accent text-xs font-bold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{t.quoteAsDevotional}</span>
              </button>
              <Link
                to={`/quotes/${quote.id}`}
                className="px-3.5 py-2.5 rounded-full bg-surface-2 hover:bg-surface-3 text-text text-xs font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>{L('Lesen', 'Read')}</span>
              </Link>
              <button
                type="button"
                onClick={handleShareQuote}
                className="px-3 py-2.5 rounded-full border border-line hover:bg-surface-2 text-text-secondary hover:text-text text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
                title={t.quoteShare}
                aria-label={t.quoteShare}
              >
                <Share2 className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                <span>{t.quoteShare}</span>
              </button>
              {quoteSong && (
                <a
                  href={quoteSong.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-full border border-line hover:bg-surface-2 text-text-secondary hover:text-text text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent"
                  title={language === 'de' ? `Lied „${quoteSong.title}“ auf bahaisongs.com anhören` : `Listen to song "${quoteSong.title}" on bahaisongs.com`}
                  aria-label={t.quoteSongAriaLabel}
                >
                  <Music className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{t.quoteSongLink}</span>
                  <ExternalLink className="w-3 h-3 text-text-tertiary shrink-0" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Werkzeug-Bereich: auf Desktop eine Reihe, mobil 2x2 mit klarem Icon-Fokus */}
      <section aria-label={t.tabTools} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
              {t.tabTools}
            </h2>
            <p className="text-xs text-text-tertiary">
              {L('Live-Helfer für Handy und Beamer in der Gruppe', 'Live tools for phone and projector in the group')}
            </p>
          </div>
          <ArrowLink to="/tools">
            {L('Alle Werkzeuge', 'All tools')}
          </ArrowLink>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/tools/timer"
            className="p-4 rounded-card bg-surface border border-border hover:border-accent hover:shadow-xs transition-all group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Uhr', 'Timer')}
              </span>
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-contrast transition-colors shrink-0">
                <TimerIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-text tabular-nums">
              05:00
            </div>
            <p className="text-2xs text-text-secondary mt-1">
              {L('Timer & Signalton', 'Timer & chime')}
            </p>
          </Link>

          <Link
            to="/tools/teams"
            className="p-4 rounded-card bg-surface border border-border hover:border-accent hover:shadow-xs transition-all group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Gruppen', 'Groups')}
              </span>
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-contrast transition-colors shrink-0">
                <UsersIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-text tabular-nums">
              2 Teams
            </div>
            <p className="text-2xs text-text-secondary mt-1">
              {L('Faire Zufallsteams', 'Fair random teams')}
            </p>
          </Link>

          <Link
            to="/tools/roles"
            className="p-4 rounded-card bg-surface border border-border hover:border-accent hover:shadow-xs transition-all group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Spielleitung', 'Roles')}
              </span>
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-contrast transition-colors shrink-0">
                <EyeIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-text tabular-nums">
              4 Rollen
            </div>
            <p className="text-2xs text-text-secondary mt-1">
              {L('Geheime Identitäten', 'Secret roles')}
            </p>
          </Link>

          <Link
            to="/tools/scoreboard"
            className="p-4 rounded-card bg-surface border border-border hover:border-accent hover:shadow-xs transition-all group flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Stand', 'Score')}
              </span>
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-contrast transition-colors shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-text tabular-nums">
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
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-accent hover:shadow-xs transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-surface-2 text-text-secondary flex items-center gap-1.5 shrink-0">
                    <HeartHandshake className="w-3.5 h-3.5 text-accent" />
                    <span>{L('Dienstprojekt', 'Service Project')}</span>
                  </span>
                  <span className="text-2xs text-text-tertiary font-semibold tabular-nums shrink-0">
                    {sampleService.durationMin}–{sampleService.durationMax} {L('Min', 'min')}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base group-hover:text-accent transition-colors">
                  {sampleService.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleService.objective[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-tertiary">
                <span>{sampleService.groupSize.min}–{sampleService.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          )}

          {/* Arts Prompt Card */}
          {sampleArt && (
            <Link
              to={`/arts/${sampleArt.id}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-accent hover:shadow-xs transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-surface-2 text-text-secondary flex items-center gap-1.5 shrink-0">
                    <Palette className="w-3.5 h-3.5 text-accent" />
                    <span>{L('Kunst & Theater', 'Arts & Drama')}</span>
                  </span>
                  <span className="text-2xs text-text-tertiary font-semibold tabular-nums shrink-0">
                    {sampleArt.durationMin}–{sampleArt.durationMax} {L('Min', 'min')}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base group-hover:text-accent transition-colors">
                  {sampleArt.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleArt.description[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-tertiary">
                <span>{sampleArt.groupSize.min}–{sampleArt.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
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
          {/* Kachel 1: Nächstes Treffen */}
          <Link
            to={isPlanToday && slotCount > 0 ? '/treffen?live=true' : '/treffen'}
            className="flex items-center gap-3 p-4 rounded-card border border-border bg-surface hover:border-accent hover:shadow-xs transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
              {isPlanToday && slotCount > 0 ? <Play className="w-5 h-5 fill-current" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="font-bold text-text text-sm truncate group-hover:text-accent transition-colors">
                  {slotCount > 0 ? activePlan?.name : L('Nächstes Treffen', 'Next gathering')}
                </p>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {slotCount > 0
                  ? `${slotCount} ${L('Bausteine', 'blocks')} · ${totalMinutes} min`
                  : L('Noch kein Ablauf geplant', 'No agenda planned yet')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent shrink-0" />
          </Link>

          {/* Kachel 2: Gemerkt */}
          <Link
            to="/saved"
            className="flex items-center gap-3 p-4 rounded-card border border-border bg-surface hover:border-accent hover:shadow-xs transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text text-sm truncate group-hover:text-accent transition-colors">
                {t.savedItems}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
                {favorites.length > 0
                  ? `${favorites.length} ${L('gemerkte Inhalte', 'saved items')}`
                  : L('Spiele, Zitate und Projekte merken', 'Save items for later')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent shrink-0" />
          </Link>

          {/* Kachel 3: Buch-Fortschritt mit mindestens 44px Touch-Zielen */}
          <div className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-surface hover:border-accent hover:shadow-xs transition-all duration-150 group">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsSelectingBook(!isSelectingBook)}
                  className="font-bold text-text text-sm truncate group-hover:text-accent text-left block w-full transition-colors cursor-pointer min-h-[44px] flex flex-col justify-center focus-visible:ring-2 focus-visible:ring-accent rounded-control"
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
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-full transition-opacity"
                >
                  <span className="w-7 h-7 rounded-full bg-surface-2 hover:bg-surface-2/80 flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUpdateLesson(1, e)}
                  disabled={!bookProgress || bookProgress.lesson >= activeBook.totalLessons}
                  aria-label={L('Nächste Lektion', 'Next lesson')}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded-full transition-opacity"
                >
                  <span className="w-7 h-7 rounded-full bg-surface-2 hover:bg-surface-2/80 flex items-center justify-center">
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
                className="text-text-tertiary hover:text-text cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent rounded-full"
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
          <History className="w-3.5 h-3.5 text-accent" />
          <span>{L('Zuletzt angesehen', 'Recently viewed')}</span>
        </h3>
        {recentViews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {recentViews.map((item) => (
              <Link
                key={`rec-${item.id}`}
                to={item.path}
                className="flex items-center gap-2.5 p-3 rounded-card bg-surface border border-border hover:bg-surface-2 hover:border-accent transition-colors group min-h-[52px] focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="w-8 h-8 rounded-full bg-surface-2 text-text-secondary flex items-center justify-center shrink-0 text-xs">
                  {item.type === 'game' ? <Compass className="w-4 h-4 text-accent" /> : item.type === 'quote' ? <QuoteIcon className="w-4 h-4 text-accent" /> : <Sparkles className="w-4 h-4 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text text-xs truncate group-hover:text-accent">
                    {item.title[language]}
                  </p>
                  {item.subtitle && (
                    <p className="text-2xs text-text-tertiary truncate">{item.subtitle[language]}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-card bg-surface border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <History className="w-5 h-5" />
              </div>
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
                className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-semibold min-h-[44px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t.exploreGames}
              </Link>
              <Link
                to="/quotes"
                className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-accent/15 hover:bg-accent/25 text-accent text-xs font-bold min-h-[44px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-accent"
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
