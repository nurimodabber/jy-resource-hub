import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
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
import { tr, Panel, Label, Stepper, ChoiceChips, primaryBtn } from './tools/common';

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
        if (parsed.duration) return parsed.duration;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  const [showCompactFinder, setShowCompactFinder] = useState(false);

  const handleSearchGames = () => {
    try {
      localStorage.setItem('jy_quick_pick_v2', JSON.stringify({ size: finderSize, duration: finderDuration }));
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams();
    if (finderSize) params.set('gruppe', String(finderSize));
    if (finderDuration) params.set('dauer', finderDuration);
    navigate(`/games?${params.toString()}`);
  };

  // Quote of the day: deterministic rotation
  const quote = React.useMemo(() => {
    if (!QUOTES_DATA || QUOTES_DATA.length === 0) return null;
    const index = getDayOfYear() % QUOTES_DATA.length;
    return QUOTES_DATA[index];
  }, []);

  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);

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

  const rawQuoteText = quote ? (language === 'de' ? quote.textDe : quote.textEn) : '';
  const isLongQuote = rawQuoteText.length > 240;
  const displayedQuote = isLongQuote && !isQuoteExpanded
    ? `${rawQuoteText.slice(0, 220)}…`
    : rawQuoteText;

  // Default blueprint slots for empty timeline
  const blueprintSlots = [
    { title: L('Andacht', 'Devotions'), duration: 10, color: 'bg-accent/80' },
    { title: L('Zitat & Reflexion', 'Quote & Study'), duration: 20, color: 'bg-accent' },
    { title: L('Spiel', 'Game'), duration: 15, color: 'bg-e-lebhaft' },
    { title: L('Dienst & Kunst', 'Service & Arts'), duration: 20, color: 'bg-e-ruhig' },
    { title: L('Abschluss', 'Closing'), duration: 10, color: 'bg-e-mittel' },
  ];

  const timelineSlots = slotCount > 0
    ? activePlan!.slots.map((s) => ({
        title: s.title[language] || s.title.de,
        duration: s.durationMinutes,
        color:
          s.referenceType === 'quote' || s.type === 'devotional' || s.type === 'study'
            ? 'bg-accent'
            : s.referenceType === 'game' || s.type === 'warmup'
            ? 'bg-e-lebhaft'
            : s.referenceType === 'service' || s.referenceType === 'art' || s.type === 'service' || s.type === 'arts_discussion'
            ? 'bg-e-ruhig'
            : 'bg-e-mittel',
      }))
    : blueprintSlots;

  const timelineTotal = timelineSlots.reduce((acc, s) => acc + s.duration, 0) || 75;

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-9">
      {/* 1. Installationshinweis (PWA Prompt – Mobile only) */}
      {showInstallBanner && (
        <aside
          aria-label={L('Installationshinweis', 'Install banner')}
          className="md:hidden flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-control bg-surface-2 text-text text-xs border border-line animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-accent shrink-0" />
            <p className="line-clamp-2">
              {L(
                'Tipp: Zum Startbildschirm hinzufügen, um die Seite offline wie eine App zu nutzen.',
                'Tip: Add to home screen to use the hub offline like an app.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {deferredInstallPrompt && (
              <button
                type="button"
                onClick={handleNativeInstall}
                className="px-2.5 py-1.5 min-h-[36px] rounded-control bg-accent text-accent-ink font-bold text-2xs cursor-pointer"
              >
                {t.installAppCta}
              </button>
            )}
            <button
              type="button"
              onClick={handleDismissInstall}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-control text-text-secondary hover:text-text cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={L('Hinweis schließen', 'Dismiss notice')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. Herzstück: Zitat des Tages mit dualem Kalenderdatum */}
      {quote && (
        <section aria-label={L('Zitat des Tages', 'Quote of the day')} className="space-y-3 pt-2">
          {/* Dual Date Header */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs sm:text-sm text-text-secondary">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-text font-semibold">{gregorianFormatted}</span>
              <span className="text-line" aria-hidden="true">·</span>
              <span className="text-accent font-semibold">{language === 'de' ? badiDate.formattedDe : badiDate.formattedEn}</span>
            </div>
            {groupName && (
              <span className="text-2xs text-text-tertiary uppercase tracking-wider font-semibold">
                {groupName}
              </span>
            )}
          </div>

          {/* Lesekarte in Literata */}
          <article className="p-6 sm:p-8 rounded-card bg-surface/75 border border-line shadow-1 space-y-5">
            <div className="border-l-2 border-accent pl-5 sm:pl-7 py-1">
              <blockquote className="font-serif text-2xl sm:text-3xl text-text leading-relaxed tracking-normal">
                {language === 'de' ? `„${stripQuotes(displayedQuote)}“` : `“${stripQuotes(displayedQuote)}”`}
              </blockquote>
            </div>

            {isLongQuote && (
              <button
                type="button"
                onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
                className="text-xs font-semibold text-accent hover:underline cursor-pointer min-h-[36px] ml-5 sm:ml-7"
              >
                {isQuoteExpanded ? L('Weniger anzeigen', 'Show less') : L('Weiterlesen', 'Read more')}
              </button>
            )}

            <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-text-secondary font-medium">
                {quote.source[language]}
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleUseQuoteAsDevotional}
                  className="px-3.5 py-2 rounded-control bg-accent text-accent-ink hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer min-h-[44px]"
                >
                  {L('Als Andacht verwenden', 'Use in devotion')}
                </button>
                <Link
                  to={`/quotes/${quote.id}`}
                  className="px-3.5 py-2 rounded-control bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-medium transition-colors cursor-pointer min-h-[44px] flex items-center"
                >
                  {L('Lesemodus', 'Reading mode')}
                </Link>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* 3. Ablaufbalken des nächsten Treffens (ersetzt die 2 Kacheln) */}
      <section aria-label={L('Nächstes Treffen', 'Next gathering')} className="p-5 sm:p-6 rounded-card bg-surface border border-line shadow-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
                {slotCount > 0 ? (activePlan?.name || L('Nächstes Treffen', 'Next gathering')) : L('Nächstes Treffen planen', 'Plan next gathering')}
              </h2>
              {isPlanToday && (
                <span className="px-2 py-0.5 rounded-chip text-2xs font-bold bg-accent text-accent-ink">
                  {L('Heute', 'Today')}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {slotCount > 0
                ? L(`${slotCount} Bausteine · ${totalMinutes} Minuten geplant`, `${slotCount} building blocks · ${totalMinutes} minutes planned`)
                : L('75 Minuten Entwurf: Wähle eine Vorlage oder passe Bausteine an.', '75 min draft: pick a preset or assemble your blocks.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tools/finder"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                  e.preventDefault();
                  setShowCompactFinder((prev) => !prev);
                }
              }}
              className="text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
            >
              {L('Spiel finden →', 'Find game →')}
            </Link>
            <Link
              to={slotCount > 0 ? (isPlanToday ? '/treffen?live=true' : '/treffen') : '/treffen'}
              className="px-3.5 py-2 rounded-control bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1.5"
            >
              {slotCount > 0 ? (
                <>
                  <Play className="w-3.5 h-3.5 text-accent fill-current" />
                  <span>{isPlanToday ? L('Starten', 'Start') : L('Öffnen', 'Open')}</span>
                </>
              ) : (
                <span>{L('Vorlage wählen →', 'Choose preset →')}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Proportionaler Zeitbalken mit orchestrierter Animation */}
        <div className="space-y-2">
          <div
            className="w-full h-8 sm:h-9 rounded-control overflow-hidden flex bg-surface-2 border border-line/60"
            role="progressbar"
            aria-label={L('Zeitverteilung des Treffens', 'Gathering time distribution')}
            aria-valuenow={slotCount > 0 ? totalMinutes : 75}
            aria-valuemin={0}
            aria-valuemax={timelineTotal}
          >
            {timelineSlots.map((slot, idx) => {
              const pct = (slot.duration / timelineTotal) * 100;
              return (
                <div
                  key={`slot-${idx}-${slot.title}`}
                  style={{
                    width: `${pct}%`,
                    animationDelay: `${idx * 80}ms`,
                  }}
                  title={`${slot.title} (${slot.duration} min)`}
                  className={`h-full ${slot.color} transition-all relative flex items-center justify-center px-1 border-r border-surface/30 last:border-r-0 overflow-hidden group motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 duration-300`}
                >
                  <span className="text-2xs font-semibold text-accent-ink truncate px-1 select-none font-mono">
                    {slot.duration > 8 ? `${slot.duration}m` : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legende unter dem Balken */}
          <div className="flex flex-wrap items-center justify-between gap-y-1 text-2xs text-text-tertiary">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {timelineSlots.slice(0, 5).map((s, idx) => (
                <span key={`leg-${idx}`} className="inline-flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} aria-hidden="true" />
                  <span>{s.title}</span>
                  <span className="font-mono text-text-secondary">({s.duration}m)</span>
                </span>
              ))}
            </div>
            <span className="font-mono font-semibold text-text-secondary">
              {L('Gesamt:', 'Total:')} {slotCount > 0 ? totalMinutes : 75} min
            </span>
          </div>
        </div>
      </section>

      {/* 4. Spielfinder kompakt (ausklappbar) */}
      {showCompactFinder && (
        <section aria-label={L('Kompakter Spielfinder', 'Compact game finder')} className="animate-in fade-in duration-150">
          <Panel className="space-y-4 border border-line bg-surface">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent" />
                <span>{L('Schneller Spielfinder', 'Quick game finder')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCompactFinder(false)}
                aria-label={L('Spielfinder schließen', 'Close game finder')}
                className="text-text-tertiary hover:text-text min-w-[44px] min-h-[44px] flex items-center justify-center rounded-control text-xs cursor-pointer"
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

      {/* 5. Kompakte Werkzeug-Statuszeile (ohne Kachelraster und Kreis-Icons) */}
      <section aria-label={t.tabTools} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider text-text-secondary">
            {L('Werkzeuge für die Gruppenstunde', 'Live tools for your gathering')}
          </h2>
          <Link to="/tools" className="text-xs font-semibold text-accent hover:underline">
            {L('Alle Werkzeuge →', 'All tools →')}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            to="/tools/timer"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-accent transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Uhr', 'Clock')}</span>
              <TimerIcon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-accent transition-colors">
                05:00
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Timer & Intervall', 'Timer & Intervals')}</p>
            </div>
          </Link>

          <Link
            to="/tools/teams"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-accent transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Gruppen', 'Groups')}</span>
              <UsersIcon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-accent transition-colors">
                2 Teams
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Teams & Partner', 'Teams & Pairs')}</p>
            </div>
          </Link>

          <Link
            to="/tools/roles"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-accent transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Spielleitung', 'Master')}</span>
              <EyeIcon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-accent transition-colors">
                4 Rollen
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Rollenverteiler', 'Role assigner')}</p>
            </div>
          </Link>

          <Link
            to="/tools/scoreboard"
            className="p-3.5 rounded-card bg-surface border border-line hover:border-accent transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-2xs uppercase tracking-wider font-semibold">{L('Stand', 'Score')}</span>
              <Award className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-text tracking-tight group-hover:text-accent transition-colors">
                Punkte
              </span>
              <p className="text-2xs text-text-secondary mt-0.5">{L('Punktetafel', 'Scoreboard')}</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. Dienst & Kunst (Zwei klare Beispiele) */}
      <section aria-label={L('Dienst & Kunst', 'Service & Arts')} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
              {L('Dienst & Kunst', 'Service & Arts')}
            </h2>
            <p className="text-xs text-text-secondary">
              {L('Dienst an der Nachbarschaft und künstlerischer Ausdruck gehören zu jedem Treffen.', 'Community service and creative expression belong to every gathering.')}
            </p>
          </div>
          <Link
            to="/service-arts"
            className="text-xs font-semibold text-accent hover:underline shrink-0"
          >
            {L('Alle ansehen →', 'See all →')}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {sampleService && (
            <Link
              to={`/service-arts/${sampleService.id}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-accent transition-colors group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-control text-2xs font-semibold bg-surface-2 text-text flex items-center gap-1.5 shrink-0">
                    <HeartHandshake className="w-3.5 h-3.5 text-accent" />
                    <span>{L('Dienstprojekt', 'Service Project')}</span>
                  </span>
                  <span className="font-mono text-2xs text-text-secondary font-semibold shrink-0">
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
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-secondary">
                <span className="font-mono">{sampleService.groupSize.min}–{sampleService.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-accent flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          )}

          {sampleArt && (
            <Link
              to={`/service-arts/${sampleArt.id}`}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-accent transition-colors group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-control text-2xs font-semibold bg-surface-2 text-text flex items-center gap-1.5 shrink-0">
                    <Palette className="w-3.5 h-3.5 text-accent" />
                    <span>{L('Kunst & Theater', 'Arts & Drama')}</span>
                  </span>
                  <span className="font-mono text-2xs text-text-secondary font-semibold shrink-0">
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
              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-secondary">
                <span className="font-mono">{sampleArt.groupSize.min}–{sampleArt.groupSize.max} {L('Personen', 'people')}</span>
                <span className="font-semibold text-accent flex items-center gap-0.5">
                  {L('Ansehen', 'View')} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* 7. Dein Bereich & Zuletzt angesehen: Ruhige Listenstruktur mit Trennlinien */}
      <section aria-label={L('Dein Bereich', 'Your workspace')} className="space-y-3">
        <h2 className="text-sm font-bold text-text uppercase tracking-wider text-text-secondary">
          {L('Dein Bereich', 'Your workspace')}
        </h2>

        <div className="rounded-card border border-line bg-surface divide-y divide-line overflow-hidden">
          {/* Gemerkte Inhalte */}
          <Link
            to="/saved"
            className="flex items-center justify-between p-4 hover:bg-surface-2/60 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Bookmark className="w-4 h-4 text-accent shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                  {t.savedItems}
                </p>
                <p className="text-xs text-text-secondary">
                  {favorites.length > 0
                    ? `${favorites.length} ${L('Inhalte gespeichert', 'items saved')}`
                    : L('Noch keine Lesezeichen', 'No bookmarks yet')}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent shrink-0" />
          </Link>

          {/* Zuletzt angesehen */}
          {recentViews.length > 0 && (
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <History className="w-3.5 h-3.5 text-accent" />
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
  );
};
