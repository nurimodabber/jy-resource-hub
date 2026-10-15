import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Compass,
  ArrowRight,
  Clock,
  Play,
  Bookmark,
  Crown,
  Eye,
  Users,
  Timer,
  Sparkles,
  ChevronRight,
  X,
  Smartphone,
  Quote as QuoteIcon,
  Palette,
  HeartHandshake,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { QUOTES_DATA } from '../data/quotes';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { usePlanner } from '../context/PlannerContext';
import { stripQuotes } from '../utils/random';
import { loadRecentViews } from '../utils/recentViews';
import { tr, Panel, Label, Stepper, ChoiceChips, primaryBtn } from './tools/common';

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
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jy_dismiss_install') !== 'true';
    } catch {
      return false;
    }
  });

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem('jy_dismiss_install', 'true');
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
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);

  // Active plan stats
  const slotCount = activePlan?.slots.length ?? 0;
  const totalMinutes = activePlan?.slots.reduce((sum, s) => sum + s.durationMinutes, 0) ?? 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const isPlanToday = Boolean(activePlan?.date && activePlan.date === todayStr);

  // Recent viewed items (max 3)
  const [recentViews] = useState(() => loadRecentViews());

  // Fixed selection for Service & Arts
  const sampleService = SERVICE_PROJECTS_DATA[0];
  const sampleArt = ARTS_PROMPTS_DATA[0];

  // Quick Tools
  const quickTools = [
    { to: '/tools/empire', label: 'Empire', icon: Crown },
    { to: '/tools/roles', label: L('Rollen', 'Roles'), icon: Eye },
    { to: '/tools/teams', label: L('Teams', 'Teams'), icon: Users },
    { to: '/tools/timer', label: L('Timer', 'Timer'), icon: Timer },
  ];

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

  const rawQuoteText = quote ? (language === 'de' ? quote.textDe : quote.textEn) : '';
  const isLongQuote = rawQuoteText.length > 220;
  const displayedQuote = isLongQuote && !isQuoteExpanded
    ? `${rawQuoteText.slice(0, 210)}…`
    : rawQuoteText;

  return (
    <div className="max-w-4xl mx-auto pb-28 space-y-7">
      {/* 1. Installationshinweis (PWA Prompt) */}
      {showInstallBanner && (
        <aside
          aria-label={L('Installationshinweis', 'Install banner')}
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-control bg-accent-subtle/70 text-text text-xs border border-accent/20 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-accent-text shrink-0" />
            <p className="truncate">
              {L(
                'Tipp: Zum Startbildschirm hinzufügen, um die Seite wie eine App und offline zu nutzen.',
                'Tip: Add to home screen to use the hub offline like an app.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismissInstall}
            className="p-1 rounded-full text-text-tertiary hover:text-text cursor-pointer shrink-0"
            aria-label={L('Hinweis schließen', 'Dismiss notice')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* 2. Kopf (Context-aware Greeting) */}
      <header className="space-y-1">
        {isPlanToday && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-chip text-2xs font-extrabold uppercase tracking-wider bg-accent text-accent-contrast">
            <Clock className="w-3 h-3" />
            {L('Heute anstehend', 'Scheduled for today')}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          {slotCount > 0
            ? L('Weiter mit deinem Treffen', 'Continue your gathering')
            : L('Hallo', 'Hello')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {slotCount > 0
            ? L(
                `Dein Entwurf für „${activePlan?.name}“ (${totalMinutes} Min, ${slotCount} Bausteine) wartet auf dich.`,
                `Your draft for "${activePlan?.name}" (${totalMinutes} min, ${slotCount} blocks) is ready.`
              )
            : L(
                'Spiele, heilige Zitate und Werkzeuge für deine Juniorjugendgruppe.',
                'Games, sacred scripture, and tools for your junior youth group.'
              )}
        </p>
      </header>

      {/* 3. Zwei große Einstiege */}
      <nav aria-label={L('Haupteinstiege', 'Main navigation')} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Hauptaktion: Treffen vorbereiten */}
        <Link
          to="/treffen"
          className="rounded-card bg-accent text-accent-contrast p-4 sm:p-5 shadow-1 hover:bg-accent-hover transition-all duration-150 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-0.5 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 font-extrabold text-base sm:text-lg tracking-tight">
              <span>{L('Treffen vorbereiten', 'Prepare gathering')}</span>
              <Sparkles className="w-4 h-4 text-accent-contrast/80 shrink-0" />
            </div>
            <p className="text-xs text-accent-contrast/90 leading-tight">
              {L('Ablauf planen, Bausteine zusammenstellen', 'Plan agenda, assemble building blocks')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
            <Calendar className="w-5 h-5 text-accent-contrast" />
          </div>
        </Link>

        {/* Sekundäraktion: Spiel finden */}
        <button
          type="button"
          onClick={() => setShowCompactFinder(!showCompactFinder)}
          className="rounded-card bg-surface border border-border p-4 sm:p-5 shadow-xs hover:border-accent hover:bg-surface-2 transition-all duration-150 flex items-center justify-between group cursor-pointer text-left"
        >
          <div className="space-y-0.5 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 font-bold text-base sm:text-lg text-text group-hover:text-accent-text tracking-tight transition-colors">
              <span>{L('Spiel finden', 'Find a game')}</span>
              <Compass className="w-4 h-4 text-accent-text shrink-0" />
            </div>
            <p className="text-xs text-text-secondary leading-tight">
              {L('Gruppengröße & Zeit eingeben', 'Pick group size & time')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-2 text-text flex items-center justify-center shrink-0 group-hover:bg-accent-subtle group-hover:text-accent-text transition-colors">
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </nav>

      {/* 4. Spielfinder kompakt (nur 2 Eingaben, öffnet /games?...) */}
      {showCompactFinder && (
        <section aria-label={L('Kompakter Spielfinder', 'Compact game finder')} className="animate-in fade-in duration-200">
          <Panel className="space-y-4 border border-accent/30 bg-surface">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-text" />
                <span>{L('Schneller Spielfinder', 'Quick game finder')}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowCompactFinder(false)}
                className="text-text-tertiary hover:text-text p-1 text-xs"
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
              className={`${primaryBtn} w-full`}
            >
              <span>{L('Passende Spiele anzeigen', 'Show matching games')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Panel>
        </section>
      )}

      {/* 5. Weitermachen (Zuletzt geöffnetes Treffen & zuletzt angesehene Inhalte) */}
      {(slotCount > 0 || recentViews.length > 0 || favorites.length > 0) && (
        <section aria-label={L('Weitermachen', 'Continue')} className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            {L('Weitermachen', 'Continue')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slotCount > 0 && (
              <Link
                to={isPlanToday ? '/treffen?live=true' : '/treffen'}
                className="flex items-center gap-3 p-4 rounded-card border border-border bg-surface hover:border-accent hover:shadow-xs transition-all duration-150 group"
              >
                <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
                  {isPlanToday ? <Play className="w-5 h-5 fill-current" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-text text-sm truncate group-hover:text-accent-text transition-colors">
                      {activePlan?.name}
                    </p>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-chip bg-surface-2 text-text-secondary shrink-0 tabular-nums">
                      {totalMinutes} min
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {isPlanToday ? L('Treffen jetzt starten', 'Start gathering now') : L(`${slotCount} Bausteine vorbereitet`, `${slotCount} blocks planned`)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-text shrink-0" />
              </Link>
            )}

            {favorites.length > 0 && (
              <Link
                to="/saved"
                className="flex items-center gap-3 p-4 rounded-card border border-border bg-surface hover:border-accent hover:shadow-xs transition-all duration-150 group"
              >
                <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text text-sm truncate group-hover:text-accent-text transition-colors">
                    {t.savedItems}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
                    {favorites.length} {L('gemerkte Inhalte', 'saved items')}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-text shrink-0" />
              </Link>
            )}
          </div>

          {/* Zuletzt angesehene Inhalte */}
          {recentViews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {recentViews.map((item) => (
                <Link
                  key={`rec-${item.id}`}
                  to={item.path}
                  className="flex items-center gap-2.5 p-3 rounded-card bg-surface-2/60 border border-border/80 hover:bg-surface-2 hover:border-accent transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-surface text-text-secondary flex items-center justify-center shrink-0 text-xs">
                    {item.type === 'game' ? <Compass className="w-3.5 h-3.5" /> : item.type === 'quote' ? <QuoteIcon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-xs truncate group-hover:text-accent-text">
                      {item.title[language]}
                    </p>
                    {item.subtitle && (
                      <p className="text-2xs text-text-tertiary truncate">{item.subtitle[language]}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. Heute: Zitat des Tages im Lesestil (Phase 04) */}
      {quote && (
        <section aria-label={L('Zitat des Tages', 'Quote of the day')} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <QuoteIcon className="w-3.5 h-3.5 text-accent-text" />
              <span>{L('Heute · Zitat des Tages', 'Today · Quote of the day')}</span>
            </h2>
            <Link
              to={`/quotes/${quote.id}`}
              className="text-xs font-semibold text-accent-text hover:underline"
            >
              {L('Im Lesemodus', 'Reading mode')} →
            </Link>
          </div>

          <div className="p-6 sm:p-8 rounded-card bg-surface border border-border shadow-xs space-y-4">
            <blockquote className="font-serif text-lg sm:text-xl text-text leading-relaxed">
              {language === 'de' ? `„${stripQuotes(displayedQuote)}“` : `“${stripQuotes(displayedQuote)}”`}
            </blockquote>

            {isLongQuote && (
              <button
                type="button"
                onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
                className="text-xs font-semibold text-accent-text hover:underline cursor-pointer"
              >
                {isQuoteExpanded ? L('Weniger anzeigen', 'Show less') : L('Weiterlesen', 'Read more')}
              </button>
            )}

            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-text-secondary">
                {quote.source[language]}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseQuoteAsDevotional}
                  className="px-3 py-1.5 rounded-control bg-accent-subtle hover:bg-accent-subtle/80 text-accent-text text-xs font-bold transition-colors cursor-pointer min-h-[36px]"
                >
                  {L('Als Andacht verwenden', 'Use in devotion')}
                </button>
                <Link
                  to={`/quotes/${quote.id}`}
                  className="px-3 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised text-text text-xs font-semibold transition-colors cursor-pointer min-h-[36px] flex items-center"
                >
                  {L('Lesen', 'Read')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Dienst und Kunst (Zwei feste Beispiele: eines je Art) */}
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
          <Link
            to="/service-arts"
            className="text-xs font-semibold text-accent-text hover:underline"
          >
            {L('Alle ansehen', 'See all')} →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Service Project Card */}
          {sampleService && (
            <Link
              to={`/service-arts/${sampleService.id}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-border hover:border-accent hover:shadow-xs transition-all duration-150 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-chip text-2xs font-extrabold uppercase tracking-wider bg-accent-subtle text-accent-text flex items-center gap-1">
                    <HeartHandshake className="w-3 h-3" />
                    <span>{L('Dienstprojekt', 'Service Project')}</span>
                  </span>
                  <span className="text-2xs text-text-tertiary font-semibold tabular-nums">
                    {sampleService.duration[language]}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base group-hover:text-accent-text transition-colors">
                  {sampleService.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleService.objective[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
                <span>{sampleService.groupSize.min}–{sampleService.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-accent-text group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          )}

          {/* Arts Prompt Card */}
          {sampleArt && (
            <Link
              to={`/service-arts/${sampleArt.id}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-border hover:border-accent hover:shadow-xs transition-all duration-150 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-chip text-2xs font-extrabold uppercase tracking-wider bg-accent-subtle text-accent-text flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    <span>{L('Kunst & Theater', 'Arts & Drama')}</span>
                  </span>
                  <span className="text-2xs text-text-tertiary font-semibold tabular-nums">
                    {sampleArt.duration[language]}
                  </span>
                </div>
                <h3 className="font-bold text-text text-base group-hover:text-accent-text transition-colors">
                  {sampleArt.title[language]}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {sampleArt.description[language]}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
                <span>{sampleArt.groupSize.min}–{sampleArt.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-accent-text group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* 8. Werkzeuge (Vier Kacheln & Alle ansehen) */}
      <section aria-label={t.tabTools} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">{t.tabTools}</h2>
            <p className="text-xs text-text-tertiary">
              {L('Live-Helfer für Handy und Beamer in der Gruppe', 'Live tools for phone and projector in the group')}
            </p>
          </div>
          <Link to="/tools" className="text-xs font-semibold text-accent-text hover:underline">
            {L('Alle ansehen', 'See all')} →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickTools.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className="flex flex-col items-center text-center p-4 rounded-card border border-border bg-surface hover:border-accent hover:shadow-xs transition-all duration-150 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mb-2">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="font-bold text-text text-sm group-hover:text-accent-text transition-colors">
                  {q.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 9. Vorschlag einreichen (Ruhige Zeile am Ende) */}
      <footer className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary bg-surface-2/50 rounded-card p-4">
          <p>
            {L(
              'Du hast ein Spiel oder Projekt, das fehlt? Schick es uns.',
              "Have a game or project idea that's missing? Send it to us."
            )}
          </p>
          <Link
            to="/vorschlagen"
            className="font-bold text-accent-text hover:underline shrink-0"
          >
            {L('Vorschlag einreichen', 'Submit proposal')} →
          </Link>
        </div>
      </footer>
    </div>
  );
};
