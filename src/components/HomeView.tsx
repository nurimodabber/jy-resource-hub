import React, { useState, useEffect } from 'react';
import { quoteAuthor } from '../utils/quoteAuthor';
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
  BookOpen,
  Plus,
  Music,
  Share2,
  } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { QUOTES_DATA } from '../data/quotes';
import { getQuoteSong } from '../data/quoteSongs';
import { useToast } from '../context/ToastContext';
import { stripQuotes } from '../utils/random';
import { shareResource } from '../utils/share';
import { loadRecentViews } from '../utils/recentViews';
import { loadGroupTitle } from '../utils/groupNames';
import { getBadiDate } from '../utils/badiCalendar';
import { FadedIconTile } from './ui/FadedIconTile';
import { tr, Panel, Label, Stepper, ChoiceChips, primaryBtn } from './tools/common';

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
                className="px-2.5 py-1.5 min-h-[44px] rounded-full bg-accent text-accent-contrast font-bold text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
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

      {/* 2. Hero-Bereich: Noble Editorial Typografie & Pill-CTAs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Linke Spalte: Begrüßung & Datum (lg:col-span-7) */}
        <header className="lg:col-span-7 space-y-3">
          <h1 className="font-serif text-[32px] sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.15] sm:leading-[1.12]">
            {fullGreeting}
          </h1>
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
            {/* Aktion 1: Spiel finden (die eine gefüllte Hauptaktion, solide) */}
            <button
              type="button"
              onClick={() => setShowCompactFinder(!showCompactFinder)}
              className="relative overflow-hidden rounded-full bg-accent text-accent-contrast px-5 py-3.5 sm:py-4 shadow-md hover:bg-accent-hover active:scale-[0.98] transition-all duration-150 flex items-center justify-between group cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent min-h-[52px] border border-white/25"
            >
              <div className="min-w-0 pr-2 relative z-10">
                <div className="font-bold text-sm sm:text-base text-accent-contrast tracking-tight">
                  {L('Spiel finden', 'Find a game')}
                </div>
                <p className="text-2xs text-accent-contrast font-medium leading-tight truncate">
                  {L('Gruppengröße & Zeit wählen', 'Pick group size & time')}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent-contrast/95 group-hover:translate-x-1 transition-transform shrink-0 relative z-10" />
            </button>

            {/* Aktion 2: Zitate & Gebete (solide, sekundär) */}
            <Link
              to="/quotes"
              className="relative overflow-hidden rounded-full bg-surface border border-line text-text px-5 py-3.5 sm:py-4 shadow-sm hover:bg-surface-2/90 active:scale-[0.98] transition-all duration-150 flex items-center justify-between group cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent min-h-[52px]"
            >
              <div className="min-w-0 pr-2 relative z-10">
                <div className="font-bold text-sm sm:text-base text-text group-hover:text-accent tracking-tight transition-colors">
                  {L('Zitate & Gebete', 'Quotes & Prayers')}
                </div>
                <p className="text-2xs text-text-secondary leading-tight truncate">
                  {L('Texte nachschlagen & vertiefen', 'Look up texts & reflect')}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 relative z-10" />
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

      {/* 3. Zitat des Tages: Raum für das heilige Wort */}
      {quote && (
        <section
          aria-label={L('Zitat des Tages', 'Quote of the day')}
          className="px-6 pb-6 pt-3.5 sm:px-8 sm:pb-8 sm:pt-3.5 rounded-card bg-surface border border-border/70 shadow-xs hover:shadow-1 transition-all duration-200 space-y-4 group"
        >
          {/* Header Row: Feine Typografie-Kennzeichnung & Aktionen */}
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3 sm:pb-3.5">
            <span className="text-2xs font-semibold text-text-tertiary truncate">
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
                className={`min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 motion-reduce:transform-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent ${
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
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
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
                  className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-text-secondary hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
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
              — {quoteAuthor(quote.source[language])}
            </cite>
          </Link>
        </section>
      )}

      {/* Projekte & mehr: Dienst, Kunst und Beitragen haben keinen eigenen Tab unten, darum hier als Kacheln.
          Bewusst neutral (keine Kategorie-Farbe): die Startseite soll ruhig bleiben. */}
      <section aria-labelledby="home-projects-title" className="space-y-3">
        <h2 id="home-projects-title" className="text-base sm:text-lg font-bold text-text tracking-tight">
          {L('Projekte & mehr', 'Projects & more')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {[
            {
              to: '/service',
              Icon: HeartHandshake,
              title: L('Dienst', 'Service'),
            },
            {
              to: '/arts',
              Icon: Palette,
              title: L('Kunst', 'Arts'),
            },
            {
              to: '/vorschlagen',
              Icon: Plus,
              title: L('Beitragen', 'Contribute'),
            },
          ].map(({ to, Icon, title }) => (
            <FadedIconTile key={to} to={to} Icon={Icon} title={title} className="min-h-[76px] sm:min-h-[112px] lg:min-h-[150px]" />
          ))}
        </div>
      </section>

      {/* 6. Zuletzt angesehen: only once there is a history. The empty state repeated the two actions at
          the top of the page and added a second filled accent button (one main action per view). */}
      {recentViews.length > 0 && (
      <section aria-label={L('Zuletzt angesehen', 'Recently viewed')} className="space-y-3">
        <h3 className="text-xs font-bold text-text-tertiary flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-text-tertiary" />
          <span>{L('Zuletzt angesehen', 'Recently viewed')}</span>
        </h3>
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
      </section>
      )}
    </div>
  );
};
