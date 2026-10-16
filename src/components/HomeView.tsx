import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Bookmark,
  ChevronRight,
  X,
  Smartphone,
  Palette,
  HeartHandshake,
  History,
  Timer as TimerIcon,
  Users as UsersIcon,
  Eye as EyeIcon,
  Award,
  BookOpen,
  Calendar,
  Copy,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { QUOTES_DATA } from '../data/quotes';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { usePlanner } from '../context/PlannerContext';
import { stripQuotes } from '../utils/random';
import { loadRecentViews } from '../utils/recentViews';
import { loadGroupTitle } from '../utils/groupNames';
import { getBadiDate } from '../utils/badiCalendar';
import {
  loadBookProgress,
  saveBookProgress,
  JY_BOOKS,
  getBookById,
  type BookProgress,
} from '../utils/bookProgress';
import { tr } from './tools/common';

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

  // PWA Install banner state
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

  // Quote of the day: deterministic rotation
  const quote = React.useMemo(() => {
    if (!QUOTES_DATA || QUOTES_DATA.length === 0) return null;
    const index = getDayOfYear() % QUOTES_DATA.length;
    return QUOTES_DATA[index];
  }, []);

  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Time-of-day greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === 'de' ? 'Guten Morgen' : 'Good morning';
    } else if (hour < 17) {
      return language === 'de' ? 'Guten Tag' : 'Good afternoon';
    } else {
      return language === 'de' ? 'Guten Abend' : 'Good evening';
    }
  }, [language]);

  // Dates
  const badiDate = React.useMemo(() => getBadiDate(new Date()), []);
  const gregorianFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [language]);

  // One service project and one arts project as fixed sample
  const sampleService = React.useMemo(() => SERVICE_PROJECTS_DATA[0] ?? null, []);
  const sampleArt = React.useMemo(() => ARTS_PROMPTS_DATA[0] ?? null, []);

  // Recent views
  const [recentViews, setRecentViews] = useState(loadRecentViews());
  useEffect(() => {
    setRecentViews(loadRecentViews());
  }, []);

  // Group name from storage
  const [groupName, setGroupName] = useState('');
  useEffect(() => {
    setGroupName(loadGroupTitle() || '');
  }, []);

  // Book progress state
  const [bookProgress, setBookProgress] = useState<BookProgress | null>(() => loadBookProgress());
  const [isEditingBook, setIsEditingBook] = useState(false);

  const activeBook = bookProgress ? getBookById(bookProgress.bookId) : null;

  const handleUpdateLesson = (delta: number) => {
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
    setIsEditingBook(false);
  };

  // Plan info
  const slotCount = activePlan?.slots?.length || 0;
  const totalMinutes = activePlan?.slots?.reduce((sum, s) => sum + s.durationMinutes, 0) || 0;

  // Check if active plan is scheduled for today
  const isPlanToday = React.useMemo(() => {
    if (!activePlan?.date) return false;
    const todayStr = new Date().toISOString().slice(0, 10);
    return activePlan.date === todayStr;
  }, [activePlan?.date]);

  const handleUseQuoteAsDevotional = () => {
    if (!quote) return;
    const snippetDe = quote.textDe.slice(0, 80);
    const snippetEn = quote.textEn.slice(0, 80);
    addSlotToPlan({
      type: 'devotional',
      title: {
        de: `Andacht: ${quote.source.de}`,
        en: `Devotion: ${quote.source.en}`,
      },
      durationMinutes: 15,
      description: {
        de: `„${snippetDe}…“`,
        en: `“${snippetEn}…”`,
      },
      referenceId: quote.id,
      referenceType: 'quote',
    });
    navigate('/treffen');
  };

  const handleCopyQuote = async () => {
    if (!quote) return;
    const textToCopy = `${language === 'de' ? quote.textDe : quote.textEn}\n\n— ${quote.source[language]}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const rawQuoteText = quote ? (language === 'de' ? quote.textDe : quote.textEn) : '';
  const isLongQuote = rawQuoteText.length > 240;
  const displayedQuote = isLongQuote && !isQuoteExpanded
    ? `${rawQuoteText.slice(0, 220)}…`
    : rawQuoteText;

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      {/* 1. Installationshinweis (PWA Prompt – dezent, einzeilig) */}
      {showInstallBanner && (
        <aside
          aria-label={L('Installationshinweis', 'Install banner')}
          className="md:hidden flex items-center justify-between gap-3 px-3.5 py-2 rounded-control bg-surface-2 text-text text-xs border border-line"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-3.5 h-3.5 text-action shrink-0" />
            <p className="line-clamp-1 text-2xs text-text-secondary">
              {L(
                'Tipp: Zum Startbildschirm hinzufügen für Offline-Nutzung.',
                'Tip: Add to home screen for offline use.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {deferredInstallPrompt && (
              <button
                type="button"
                onClick={handleNativeInstall}
                className="text-2xs font-semibold text-action hover:underline min-h-[36px] flex items-center"
              >
                {t.installAppCta}
              </button>
            )}
            <button
              type="button"
              onClick={handleDismissInstall}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-text-tertiary hover:text-text cursor-pointer"
              aria-label={L('Hinweis schließen', 'Dismiss notice')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. Begrüßungszeile mit Datum & Badí'-Datum */}
      <header className="flex flex-wrap items-baseline justify-between gap-2 text-xs sm:text-sm text-text-secondary">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-text font-bold text-sm sm:text-base">{greeting}</span>
          <span className="text-line hidden sm:inline" aria-hidden="true">·</span>
          <span className="font-medium text-text-secondary">{gregorianFormatted}</span>
          <span className="text-line hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-word font-semibold">{language === 'de' ? badiDate.formattedDe : badiDate.formattedEn}</span>
        </div>
        {groupName && (
          <span className="text-2xs text-text-tertiary uppercase tracking-wider font-semibold">
            {groupName}
          </span>
        )}
      </header>

      {/* 3. Zweispaltiges Hauptlayout auf Desktop: Zitat (60%) & Dein Bereich (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Linke Spalte: Zitat des Tages (großzügig in Literata) */}
        {quote && (
          <section aria-label={L('Zitat des Tages', 'Quote of the day')} className="lg:col-span-7">
            <article className="p-6 sm:p-8 rounded-card bg-surface border border-line shadow-1 space-y-6">
              <div className="border-l-2 border-word pl-5 sm:pl-7 py-1">
                <blockquote className="font-serif text-2xl sm:text-3xl text-text leading-relaxed tracking-normal">
                  {language === 'de' ? `„${stripQuotes(displayedQuote)}“` : `“${stripQuotes(displayedQuote)}”`}
                </blockquote>
              </div>

              {isLongQuote && (
                <button
                  type="button"
                  onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
                  className="text-xs font-semibold text-action hover:underline cursor-pointer min-h-[36px] ml-5 sm:ml-7"
                >
                  {isQuoteExpanded ? L('Weniger anzeigen', 'Show less') : L('Weiterlesen', 'Read more')}
                </button>
              )}

              <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-text-secondary font-medium">
                  {quote.source[language]}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className="p-2 rounded-control bg-surface-2 hover:bg-surface-2/80 text-text-secondary hover:text-text transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                    title={L('Zitat kopieren', 'Copy quote')}
                    aria-label={L('Zitat kopieren', 'Copy quote')}
                  >
                    {isCopied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <Link
                    to={`/quotes/${quote.id}`}
                    className="px-3.5 py-2 rounded-control bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-medium transition-colors cursor-pointer min-h-[40px] flex items-center"
                  >
                    {L('Lesemodus', 'Reading mode')}
                  </Link>

                  <button
                    type="button"
                    onClick={handleUseQuoteAsDevotional}
                    className="px-4 py-2 rounded-control bg-action text-action-contrast hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer min-h-[40px] flex items-center"
                  >
                    {L('Als Andacht verwenden', 'Use in devotion')}
                  </button>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Rechte Spalte: Dein Bereich */}
        <section aria-label={L('Dein Bereich', 'Your workspace')} className="lg:col-span-5 space-y-3">
          <div className="rounded-card border border-line bg-surface divide-y divide-line overflow-hidden shadow-1">
            {/* 1. Nächstes Treffen */}
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-action" />
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    {L('Nächstes Treffen', 'Next gathering')}
                  </span>
                </div>
                {isPlanToday && (
                  <span className="px-2 py-0.5 rounded-chip text-2xs font-bold bg-action text-action-contrast">
                    {L('Heute', 'Today')}
                  </span>
                )}
              </div>

              {slotCount > 0 ? (
                <div>
                  <h3 className="font-bold text-text text-base">
                    {activePlan?.name || L('Geplantes Treffen', 'Scheduled gathering')}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {slotCount} {L('Bausteine', 'blocks')}
                    {totalMinutes > 0 ? ` · ${totalMinutes} ${L('Min.', 'min.')}` : ''}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={isPlanToday ? '/treffen?live=true' : '/treffen'}
                      className="px-3 py-1.5 rounded-control bg-action text-action-contrast hover:opacity-90 text-xs font-bold transition-opacity flex items-center gap-1.5 min-h-[36px]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isPlanToday ? L('Starten', 'Start') : L('Öffnen', 'Open')}</span>
                    </Link>
                    <Link
                      to="/treffen"
                      className="px-3 py-1.5 rounded-control bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-medium transition-colors min-h-[36px] flex items-center"
                    >
                      {L('Bearbeiten', 'Edit')}
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {L(
                      'Was steht bei eurem nächsten Treffen an? Baue euren Ablauf flexibel zusammen.',
                      'What is planned for your next gathering? Assemble your agenda flexibly.'
                    )}
                  </p>
                  <div className="mt-3">
                    <Link
                      to="/treffen"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface-2 hover:bg-surface-2/80 text-action font-bold text-xs transition-colors min-h-[36px]"
                    >
                      <span>{L('Treffen vorbereiten →', 'Plan gathering →')}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2. JY-Buch Fortschritt */}
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-word" />
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    {L('Buch-Fortschritt', 'Book progress')}
                  </span>
                </div>
                {activeBook && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBook(!isEditingBook)}
                    className="text-2xs font-semibold text-action hover:underline cursor-pointer"
                  >
                    {isEditingBook ? L('Fertig', 'Done') : L('Buch wechseln', 'Change book')}
                  </button>
                )}
              </div>

              {activeBook && bookProgress ? (
                <div className="space-y-2">
                  <p className="font-bold text-text text-sm">
                    {activeBook.title[language]}
                  </p>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-text-secondary">
                      {L('Lektion', 'Lesson')} <strong className="text-text font-bold">{bookProgress.lesson}</strong> {L('von', 'of')} {activeBook.totalLessons}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateLesson(-1)}
                        disabled={bookProgress.lesson <= 1}
                        className="w-8 h-8 rounded-control bg-surface-2 hover:bg-surface-2/80 disabled:opacity-30 text-text flex items-center justify-center cursor-pointer transition-colors"
                        aria-label={L('Vorherige Lektion', 'Previous lesson')}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateLesson(1)}
                        disabled={bookProgress.lesson >= activeBook.totalLessons}
                        className="w-8 h-8 rounded-control bg-surface-2 hover:bg-surface-2/80 disabled:opacity-30 text-text flex items-center justify-center cursor-pointer transition-colors"
                        aria-label={L('Nächste Lektion', 'Next lesson')}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {L(
                      'Halte fest, bei welcher Lektion ihr gerade seid, um passende Zitate direkt im Blick zu haben.',
                      'Keep track of your current lesson to have matching quotes at hand.'
                    )}
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingBook(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface-2 hover:bg-surface-2/80 text-action font-bold text-xs transition-colors min-h-[36px] cursor-pointer"
                    >
                      <span>{L('Buch wählen →', 'Select book →')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Schnellauswahl Juniorjugend-Buch */}
              {isEditingBook && (
                <div className="pt-3 border-t border-line space-y-1.5 animate-in fade-in duration-120">
                  <p className="text-2xs font-semibold text-text-tertiary uppercase">
                    {L('Juniorjugend-Buch auswählen:', 'Select junior youth book:')}
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {JY_BOOKS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBook(b.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-control text-xs transition-colors flex items-center justify-between ${
                          bookProgress?.bookId === b.id
                            ? 'bg-action text-action-contrast font-bold'
                            : 'hover:bg-surface-2 text-text'
                        }`}
                      >
                        <span className="truncate">{b.title[language]}</span>
                        <span className="text-2xs opacity-75 shrink-0 ml-2">{b.totalLessons} L.</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Gemerkte Inhalte */}
            <Link
              to="/saved"
              className="flex items-center justify-between p-4 sm:p-5 hover:bg-surface-2/60 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bookmark className="w-4 h-4 text-action shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-text group-hover:text-action transition-colors">
                    {t.savedItems}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {favorites.length > 0
                      ? `${favorites.length} ${L('Inhalte gespeichert', 'items saved')}`
                      : L('Noch keine Lesezeichen', 'No bookmarks yet')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-action shrink-0" />
            </Link>

            {/* 4. Zuletzt angesehen */}
            {recentViews.length > 0 && (
              <div className="p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <History className="w-3.5 h-3.5 text-action" />
                  <span>{L('Zuletzt angesehen', 'Recently viewed')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentViews.slice(0, 4).map((item) => (
                    <Link
                      key={`rec-${item.id}`}
                      to={item.path}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface-2 hover:bg-surface-2/80 text-xs text-text border border-line/60 transition-colors"
                    >
                      <span className="font-medium truncate max-w-[180px]">{item.title[language]}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 4. Kompakte Werkzeuge für die Gruppenstunde */}
      <section aria-label={t.tabTools} className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            {L('Werkzeuge für die Gruppenstunde', 'Live tools for your gathering')}
          </h2>
          <Link to="/tools" className="text-xs font-semibold text-action hover:underline">
            {L('Alle Werkzeuge →', 'All tools →')}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/tools/timer"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-action transition-colors group flex flex-col justify-between shadow-1"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Uhr', 'Clock')}</span>
              <TimerIcon className="w-4 h-4 text-action" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-action transition-colors">
                05:00
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Timer & Intervall', 'Timer & Intervals')}</p>
            </div>
          </Link>

          <Link
            to="/tools/teams"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-action transition-colors group flex flex-col justify-between shadow-1"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Gruppen', 'Groups')}</span>
              <UsersIcon className="w-4 h-4 text-action" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-action transition-colors">
                2 Teams
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Teams & Partner', 'Teams & Pairs')}</p>
            </div>
          </Link>

          <Link
            to="/tools/roles"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-action transition-colors group flex flex-col justify-between shadow-1"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Spielleitung', 'Master')}</span>
              <EyeIcon className="w-4 h-4 text-action" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-action transition-colors">
                4 Rollen
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Rollenverteiler', 'Role assigner')}</p>
            </div>
          </Link>

          <Link
            to="/tools/scoreboard"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-action transition-colors group flex flex-col justify-between shadow-1"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Stand', 'Score')}</span>
              <Award className="w-4 h-4 text-action" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-action transition-colors">
                Punkte
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Punktetafel', 'Scoreboard')}</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Dienst & Kunst (Zwei ausgewählte Inspirationen) */}
      <section aria-label={L('Dienst & Kunst', 'Service & Arts')} className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
              {L('Dienst & Kunst', 'Service & Arts')}
            </h2>
            <p className="text-xs text-text-secondary">
              {L('Gemeinsamer Dienst und kreativer Ausdruck gehören zu jeder Juniorjugendgruppe.', 'Community service and creative expression belong to every junior youth group.')}
            </p>
          </div>
          <Link
            to="/service-arts"
            className="text-xs font-semibold text-action hover:underline shrink-0"
          >
            {L('Alle ansehen →', 'See all →')}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {sampleService && (
            <Link
              to={`/service-arts/${sampleService.id}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-action transition-colors group shadow-1"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-control text-2xs font-semibold bg-surface-2 text-text flex items-center gap-1.5 shrink-0">
                    <HeartHandshake className="w-3.5 h-3.5 text-action" />
                    <span>{L('Dienstprojekt', 'Service Project')}</span>
                  </span>
                  <span className="font-mono text-2xs text-text-secondary font-semibold shrink-0">
                    {sampleService.durationMin}–{sampleService.durationMax} {L('Min', 'min')}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base group-hover:text-action transition-colors">
                  {sampleService.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleService.objective[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-secondary">
                <span className="font-mono">{sampleService.groupSize.min}–{sampleService.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-action flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          )}

          {sampleArt && (
            <Link
              to={`/service-arts/${sampleArt.id}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-action transition-colors group shadow-1"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-control text-2xs font-semibold bg-surface-2 text-text flex items-center gap-1.5 shrink-0">
                    <Palette className="w-3.5 h-3.5 text-action" />
                    <span>{L('Kunst & Theater', 'Arts & Drama')}</span>
                  </span>
                  <span className="font-mono text-2xs text-text-secondary font-semibold shrink-0">
                    {sampleArt.durationMin}–{sampleArt.durationMax} {L('Min', 'min')}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base group-hover:text-action transition-colors">
                  {sampleArt.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleArt.description[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-secondary">
                <span className="font-mono">{sampleArt.groupSize.min}–{sampleArt.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-action flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};
