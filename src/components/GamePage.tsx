import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Plus,
  Play,
  Printer,
  Share2,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Timer,
  ChevronDown,
  MoreVertical,
  CheckSquare,
  Square,
  Users,
  Clock,
  MapPin,
  Package,
} from 'lucide-react';
import { Game, Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { UI_TRANSLATIONS } from '../data/translations';
import { shareResource } from '../utils/share';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { parseMinutes } from '../utils/random';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Badge } from './ui/Badge';
import { Sheet } from './ui/Sheet';
import { GameCard } from './GameCard';
import { tr } from './tools/common';

const TOOL_FOR_GAME: Record<string, { to: string; de: string; en: string }> = {
  empire: { to: '/tools/empire', de: 'Empire-Werkzeug öffnen', en: 'Open Empire tool' },
  werwolf: { to: '/tools/roles', de: 'Rollenverteiler und Erzähler öffnen', en: 'Open role dealer and narrator' },
  spion: { to: '/tools/roles', de: 'Rollenverteiler öffnen', en: 'Open role dealer' },
  'wer-bin-ich': { to: '/tools/roles', de: 'Begriffe verteilen', en: 'Deal terms' },
  'schlafmuetze-moerder': { to: '/tools/roles', de: 'Rollenverteiler öffnen', en: 'Open role dealer' },
  psychiater: { to: '/tools/ideas', de: 'Regeln für den Psychiater', en: 'Psychiatrist rules' },
};

interface GamePageProps {
  game: Game;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

// ---------------------------------------------------------------------------
// PlayMode Component: fullscreen, beamer-ready, readable at 5m (>=40px at 1280px)
// ---------------------------------------------------------------------------
const PlayMode: React.FC<{ game: Game; language: Language; onClose: () => void }> = ({
  game,
  language,
  onClose,
}) => {
  const L = tr(language);
  const steps = game.rules[language];
  const [stepIndex, setStepIndex] = useState(0);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0); // -1, 0, 1
  const [isBeamerContrast, setIsBeamerContrast] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Keep screen on
  useWakeLock(true);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setStepIndex((v) => Math.min(steps.length - 1, v + 1));
      }
      if (e.key === 'ArrowLeft') {
        setStepIndex((v) => Math.max(0, v - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, steps.length]);

  // Touch Swipe navigation
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      setStepIndex((v) => Math.min(steps.length - 1, v + 1)); // swipe left -> next
    } else if (diff < -50) {
      setStepIndex((v) => Math.max(0, v - 1)); // swipe right -> prev
    }
    touchStartX.current = null;
  };

  // Mini Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const progressPercent = ((stepIndex + 1) / steps.length) * 100;

  // Font size classes ensuring >= 40px at 1280px (lg:text-[42px] or xl:text-[48px])
  const fontSizeClass =
    fontSizeOffset === 1
      ? 'text-3xl sm:text-5xl lg:text-[50px] leading-snug'
      : fontSizeOffset === -1
      ? 'text-xl sm:text-3xl lg:text-[36px] leading-relaxed'
      : 'text-2xl sm:text-4xl lg:text-[42px] leading-snug';

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`fixed inset-0 z-70 flex flex-col safe-top safe-bottom select-none transition-colors duration-120 ${
        isBeamerContrast ? 'bg-black text-white' : 'bg-bg text-text'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={game.title[language]}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top step progress bar */}
      <div className="w-full h-1.5 bg-line shrink-0">
        <div
          className="h-full bg-accent transition-all duration-180 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top Bar Controls */}
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-line shrink-0 gap-2">
        <div className="min-w-0 flex items-center gap-3">
          <p className="text-sm font-bold truncate">{game.title[language]}</p>
          <span className="text-xs px-2.5 py-0.5 rounded-control bg-surface-2 text-text font-mono font-semibold shrink-0">
            {L('Schritt', 'Step')} {stepIndex + 1} / {steps.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Beamer Contrast toggle */}
          <button
            type="button"
            onClick={() => setIsBeamerContrast(!isBeamerContrast)}
            aria-pressed={isBeamerContrast}
            className={`min-h-[40px] px-2.5 rounded-control text-xs font-semibold border transition-colors ${
              isBeamerContrast
                ? 'bg-white text-black border-white'
                : 'bg-surface-2 text-text-secondary border-line hover:text-text'
            }`}
            title={L('Beamer-Kontrast umschalten', 'Toggle beamer high contrast')}
          >
            {L('Beamer', 'Beamer')}
          </button>

          {/* Font size adjustments */}
          <div className="inline-flex items-center bg-surface-2 rounded-control p-0.5 border border-line">
            <button
              type="button"
              onClick={() => setFontSizeOffset((v) => Math.max(-1, v - 1))}
              disabled={fontSizeOffset === -1}
              aria-label={L('Schrift kleiner', 'Decrease text size')}
              className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-control hover:bg-surface disabled:opacity-30"
            >
              A−
            </button>
            <button
              type="button"
              onClick={() => setFontSizeOffset((v) => Math.min(1, v + 1))}
              disabled={fontSizeOffset === 1}
              aria-label={L('Schrift größer', 'Increase text size')}
              className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-control hover:bg-surface disabled:opacity-30"
            >
              A+
            </button>
          </div>

          {/* Timer button */}
          <button
            type="button"
            onClick={() => setShowTimer(!showTimer)}
            aria-pressed={showTimer}
            className={`min-h-[40px] px-3 rounded-control text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              showTimer
                ? 'bg-accent text-accent-contrast border-accent'
                : 'bg-surface-2 text-text-secondary border-border hover:text-text'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span className="tabular-nums">{formatTimer(timerSeconds)}</span>
          </button>

          {/* Close button */}
          <IconButton label={L('Beenden', 'Close')} onClick={onClose} variant="ghost" size="md">
            <X className="w-5 h-5" />
          </IconButton>
        </div>
      </header>

      {/* Floating mini timer if active */}
      {showTimer && (
        <div className="absolute top-20 right-4 z-10 bg-surface border border-border shadow-2 rounded-card p-4 flex flex-col items-center gap-3">
          <p className="text-3xl font-mono font-bold tabular-nums text-text">
            {formatTimer(timerSeconds)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={timerRunning ? 'secondary' : 'primary'}
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? L('Pause', 'Pause') : L('Start', 'Start')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(60);
              }}
            >
              {L('Reset', 'Reset')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTimerSeconds((v) => v + 60)}
            >
              +1m
            </Button>
          </div>
        </div>
      )}

      {/* Main step content viewport */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center px-6 sm:px-16 lg:px-24 py-8">
        <div className="max-w-4xl w-full text-center">
          <p
            className={`font-medium tracking-tight text-balance transition-all ${fontSizeClass}`}
          >
            {steps[stepIndex]}
          </p>
        </div>
      </main>

      {/* Bottom step navigation bar */}
      <footer className="flex items-center gap-3 p-4 sm:px-8 border-t border-border/60 shrink-0">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
          aria-label={L('Zurück', 'Back')}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {L('Zurück', 'Back')}
        </Button>

        <div className="flex-1 text-center text-xs text-text-tertiary tabular-nums hidden sm:block">
          {L('Tippe auf Weiter oder wische zum nächsten Schritt', 'Tap next or swipe for next step')}
        </div>

        {stepIndex < steps.length - 1 ? (
          <Button
            variant="primary"
            size="lg"
            className="flex-1 sm:flex-initial sm:min-w-[160px]"
            onClick={() => setStepIndex(stepIndex + 1)}
          >
            {L('Weiter', 'Next')}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="flex-1 sm:flex-initial sm:min-w-[160px]"
            onClick={onClose}
          >
            <Check className="w-5 h-5 mr-1" />
            {L('Fertig', 'Done')}
          </Button>
        )}
      </footer>
    </div>
  );
};

// ---------------------------------------------------------------------------
// GamePage Main View
// ---------------------------------------------------------------------------
export const GamePage: React.FC<GamePageProps> = ({
  game,
  language,
  isFavorite,
  onToggleFavorite,
}) => {
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isTipsOpen, setIsTipsOpen] = useState(true);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const tool = TOOL_FOR_GAME[game.id];
  const materials = game.materials[language].filter((m) => !/^(keine|none)/i.test(m));
  const hasNoMaterials = materials.length === 0;

  const energyLabel =
    game.energyLevel === 'high'
      ? t.filterHighEnergy
      : game.energyLevel === 'medium'
      ? t.filterMediumEnergy
      : t.filterCalmEnergy;

  // Similar games: 3 games with the exact same purpose
  const similarGames = GAMES_DATA.filter(
    (g) => g.purpose === game.purpose && g.id !== game.id,
  ).slice(0, 3);

  const toggleStepCheck = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddToPlan = () => {
    const [min] = parseMinutes(game.durationMinutes);
    const result = addSlotToPlan({
      type: game.energyLevel === 'calm' ? 'closing' : 'warmup',
      title: { de: game.title.de, en: game.title.en },
      durationMinutes: min || 15,
      description: { de: game.summary.de, en: game.summary.en },
      referenceId: game.id,
      referenceType: 'game',
    });
    showToast({
      text: L('Zum Treffen hinzugefügt', 'Added to gathering'),
      action: {
        label: L('Treffen öffnen', 'Open gathering'),
        onClick: () => navigate('/treffen'),
      },
      undo: {
        label: L('Rückgängig', 'Undo'),
        onClick: () => result.undo(),
      },
    });
  };

  const handleCopyRules = async () => {
    const text = `${game.title[language]}\n\n${game.idea[language]}\n\n${game.rules[language]
      .map((r, i) => `${i + 1}. ${r}`)
      .join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({ text: t.copiedSuccess });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
    setIsMobileMoreOpen(false);
  };

  const handleShare = () => {
    shareResource({
      title: `${game.title[language]} – ${t.siteTitle}`,
      text: game.title[language],
      url: `${window.location.origin}/games/${game.id}`,
    });
    setIsMobileMoreOpen(false);
  };

  const handlePrint = () => {
    setIsMobileMoreOpen(false);
    window.print();
  };

  return (
    <article className="max-w-5xl mx-auto pb-36 lg:pb-16 px-4 sm:px-6">
      {/* Back to games list */}
      <div className="mb-4 print:hidden">
        <Link
          to="/games"
          className="inline-flex items-center gap-1.5 -ml-2 px-3 min-h-[44px] rounded-control text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToGamesOverview}
        </Link>
      </div>

      {/* Main Grid: Content on left, Sticky Actions on right (desktop) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-8">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text text-balance">
              {game.title[language]}
            </h1>
            {game.subtitle && (
              <p className="text-lg text-text-secondary mt-1 font-medium">
                {game.subtitle[language]}
              </p>
            )}

            {/* Meta as Badges */}
            <div className="flex flex-wrap gap-2 mt-4 print:hidden">
              <Badge size="md" category="neutral">
                <Users className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}
              </Badge>
              <Badge size="md" category="neutral">
                <Clock className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {game.durationMinutes}
              </Badge>
              <Badge size="md" category="neutral">
                <span className="w-2 h-2 rounded-full bg-accent mr-1.5" />
                {energyLabel}
              </Badge>
              <Badge size="md" category="neutral">
                <MapPin className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {game.space[language]}
              </Badge>
              <Badge size="md" category={hasNoMaterials ? 'accent' : 'neutral'}>
                <Package className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {hasNoMaterials ? t.noMaterialNeeded : materials.join(', ')}
              </Badge>
            </div>

            {/* Print-only meta */}
            <div className="hidden print:block mt-2 text-sm text-text-secondary">
              {game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix} · {game.durationMinutes} · {energyLabel} · {game.space[language]}
            </div>
          </header>

          {/* Section 1: Idee (zwei Sätze) */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
              {t.ideaTitle}
            </h2>
            <p className="text-base sm:text-lg text-text leading-relaxed">
              {game.idea[language]}
            </p>
          </section>

          {/* Section 2: Material */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
              {t.materialsTitle}
            </h2>
            {hasNoMaterials ? (
              <p className="text-sm text-text-secondary">
                {t.noMaterialNeeded}
              </p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm text-text">
                {materials.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Section 3: Ablauf mit interaktiven Checkboxen zum Abhaken */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                {t.stepsChecklistTitle}
              </h2>
              {checkedSteps.size > 0 && (
                <button
                  type="button"
                  onClick={() => setCheckedSteps(new Set())}
                  className="text-xs text-text-secondary hover:text-text underline print:hidden"
                >
                  {L('Häkchen zurücksetzen', 'Reset checks')}
                </button>
              )}
            </div>

            <ol className="space-y-3">
              {game.rules[language].map((rule, idx) => {
                const isChecked = checkedSteps.has(idx);
                return (
                  <li
                    key={idx}
                    className={`flex items-start gap-3.5 p-4 rounded-card border transition-all ${
                      isChecked
                        ? 'bg-surface-2/60 border-line opacity-65'
                        : 'bg-surface border-line hover:border-accent/60'
                    }`}
                  >
                    {/* Large Mono Number */}
                    <span
                      className={`font-mono text-xl sm:text-2xl font-bold select-none leading-none pt-0.5 shrink-0 w-7 text-right ${
                        isChecked ? 'text-text-tertiary' : 'text-accent'
                      }`}
                      aria-hidden="true"
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleStepCheck(idx)}
                      className="mt-0.5 min-w-[28px] min-h-[28px] flex items-center justify-center text-text-tertiary hover:text-accent focus-visible:outline-none print:hidden shrink-0"
                      aria-label={`${L('Schritt', 'Step')} ${idx + 1} ${
                        isChecked ? L('als erledigt markiert', 'checked') : L('abhaken', 'mark as checked')
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-accent" />
                      ) : (
                        <Square className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isChecked ? 'line-through text-text-secondary' : 'text-text font-normal'
                        }`}
                      >
                        {rule}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Section 4: Tipps für Animatoren als abgesetzter Kasten */}
          {game.animatorTips[language].length > 0 && (
            <section className="mb-8 rounded-card border border-line bg-surface-2 p-5 sm:p-6 space-y-3">
              <button
                type="button"
                onClick={() => setIsTipsOpen(!isTipsOpen)}
                className="w-full flex items-center justify-between text-left print:hidden"
                aria-expanded={isTipsOpen}
              >
                <h2 className="text-base font-bold text-text">
                  {t.animatorTipsTitle}
                </h2>
                <ChevronDown
                  className={`w-5 h-5 text-text-secondary transition-transform duration-150 ${
                    isTipsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className="hidden print:block font-bold text-sm text-text mb-2">
                {t.animatorTipsTitle}
              </div>

              {(isTipsOpen || typeof window !== 'undefined') && (
                <ul
                  className={`list-disc pl-5 space-y-2 text-sm text-text-secondary leading-relaxed ${
                    isTipsOpen ? 'block' : 'hidden print:block'
                  }`}
                >
                  {game.animatorTips[language].map((tip, i) => (
                    <li key={i}>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Section 5: Verwandte Werkzeuge */}
          {tool && (
            <section className="mb-8 print:hidden">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
                {t.relatedToolsTitle}
              </h2>
              <Link
                to={tool.to}
                className="block p-4 rounded-card border border-border bg-surface hover:border-accent hover:bg-surface-2 transition-all group"
              >
                <p className="font-semibold text-text group-hover:text-accent-text transition-colors">
                  {L(tool.de, tool.en)}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {L('Passende digitale Unterstützung für dieses Spiel in der Gruppe', 'Interactive companion tool for this game with the group')}
                </p>
              </Link>
            </section>
          )}

          {/* Section 6: Ähnliche Spiele (drei mit gleicher Wirkung) */}
          {similarGames.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border print:hidden">
              <h2 className="text-lg font-bold text-text mb-4">
                {t.similarGamesTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {similarGames.map((similar) => (
                  <GameCard
                    key={similar.id}
                    game={similar}
                    language={language}
                    isFavorite={false}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sticky Action Bar on Desktop (hidden on print) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 print:hidden">
          <div className="p-5 rounded-card bg-surface border border-border shadow-1 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
              {L('Aktionen', 'Actions')}
            </h2>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={() => setIsPlaying(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              {t.playMode}
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center"
              onClick={handleAddToPlan}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addToMeeting}
            </Button>

            <Button
              variant={isFavorite ? 'secondary' : 'outline'}
              size="md"
              className={`w-full justify-center ${isFavorite ? 'text-accent' : ''}`}
              onClick={(e) => onToggleFavorite(game.id, e)}
              aria-pressed={isFavorite}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current text-accent' : ''}`} />
              {isFavorite ? t.savedItems : L('Merken', 'Save')}
            </Button>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button variant="ghost" size="sm" className="w-full justify-start text-text-secondary" onClick={handleCopyRules}>
                {copied ? <Check className="w-4 h-4 mr-2 text-accent" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? t.copiedSuccess : t.copyRules}
              </Button>

              <Button variant="ghost" size="sm" className="w-full justify-start text-text-secondary" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                {t.shareBtn}
              </Button>

              <Button variant="ghost" size="sm" className="w-full justify-start text-text-secondary" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                {L('Drucken', 'Print')}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Fixed bottom action bar on Mobile (<1024px) above BottomTabBar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-surface backdrop-blur-md border-t border-border p-3 shadow-2 flex items-center gap-2 print:hidden">
        <Button
          variant="primary"
          size="md"
          className="flex-1 justify-center min-h-[44px]"
          onClick={() => setIsPlaying(true)}
        >
          <Play className="w-4 h-4 mr-1.5" />
          {t.playMode}
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="shrink-0 min-h-[44px] px-3"
          onClick={handleAddToPlan}
        >
          <Plus className="w-4 h-4 mr-1" />
          {t.addToMeeting}
        </Button>

        <IconButton
          label={isFavorite ? t.savedItems : L('Merken', 'Save')}
          variant={isFavorite ? 'secondary' : 'outline'}
          size="md"
          className={`shrink-0 min-w-[44px] min-h-[44px] ${isFavorite ? 'text-accent' : ''}`}
          onClick={(e) => onToggleFavorite(game.id, e)}
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-accent' : ''}`} />
        </IconButton>

        <IconButton
          label={L('Mehr Optionen', 'More options')}
          variant="outline"
          size="md"
          className="shrink-0 min-w-[44px] min-h-[44px]"
          onClick={() => setIsMobileMoreOpen(true)}
        >
          <MoreVertical className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Mobile More Sheet */}
      <Sheet
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        title={game.title[language]}
      >
        <div className="space-y-2 py-2">
          <Button variant="outline" size="lg" className="w-full justify-start" onClick={handleCopyRules}>
            {copied ? <Check className="w-4 h-4 mr-2.5 text-accent" /> : <Copy className="w-4 h-4 mr-2.5" />}
            {copied ? t.copiedSuccess : t.copyRules}
          </Button>

          <Button variant="outline" size="lg" className="w-full justify-start" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2.5" />
            {t.shareBtn}
          </Button>

          <Button variant="outline" size="lg" className="w-full justify-start" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2.5" />
            {L('Drucken', 'Print')}
          </Button>
        </div>
      </Sheet>

      {/* Fullscreen PlayMode modal */}
      {isPlaying && (
        <PlayMode game={game} language={language} onClose={() => setIsPlaying(false)} />
      )}
    </article>
  );
};
