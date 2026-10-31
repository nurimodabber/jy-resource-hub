import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  Users,
  Clock,
  MapPin,
  Play,
  BookOpen,
} from 'lucide-react';
import { Game, Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { useAdminData } from '../context/AdminDataContext';
import { UI_TRANSLATIONS } from '../data/translations';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { GameCard, EnergyDots } from './GameCard';
import { ShareMenu } from './ui/ShareMenu';
import { tr } from './tools/common';

// Companion Components
import { EmpireCompanion } from './games/companions/EmpireCompanion';
import { SpyCompanion } from './games/companions/SpyCompanion';
import { WhoAmICompanion } from './games/companions/WhoAmICompanion';
import { WerewolfCompanion } from './games/companions/WerewolfCompanion';
import { KillerCompanion } from './games/companions/KillerCompanion';
import { SilentSortCompanion } from './games/companions/SilentSortCompanion';
import { StoryStarterCompanion } from './games/companions/StoryStarterCompanion';
import { PsychiatristCompanion } from './games/companions/PsychiatristCompanion';

const GAME_COMPANIONS: Partial<Record<string, React.FC<{ language: Language }>>> = {
  empire: EmpireCompanion,
  spion: SpyCompanion,
  'wer-bin-ich': WhoAmICompanion,
  werwolf: WerewolfCompanion,
  'schlafmuetze-moerder': KillerCompanion,
  'stumme-reihe': SilentSortCompanion,
  'ein-wort-geschichte': StoryStarterCompanion,
  psychiater: PsychiatristCompanion,
};

interface GamePageProps {
  game: Game;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const GamePage: React.FC<GamePageProps> = ({
  game,
  language,
  isFavorite,
  onToggleFavorite,
}) => {
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const adminData = useAdminData();
  const allGames = adminData.games.length > 0 ? adminData.games : GAMES_DATA;
  const [searchParams, setSearchParams] = useSearchParams();

  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isTipsOpen, setIsTipsOpen] = useState(true);

  const Companion = GAME_COMPANIONS[game.id];
  const hasCompanion = Companion !== undefined;

  // View mode: 'rules' or 'play' (interactive companion)
  const initialMode = searchParams.get('mode') === 'play' && hasCompanion ? 'play' : 'rules';
  const [viewMode, setViewMode] = useState<'rules' | 'play'>(initialMode);

  // Ensure top of detail view is immediately visible on mount or game change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [game.id]);

  useEffect(() => {
    const targetMode = searchParams.get('mode') === 'play' && hasCompanion ? 'play' : 'rules';
    setViewMode(targetMode);
  }, [searchParams, hasCompanion]);

  const switchMode = (mode: 'rules' | 'play') => {
    setViewMode(mode);
    const newParams = new URLSearchParams(searchParams);
    if (mode === 'play') {
      newParams.set('mode', 'play');
    } else {
      newParams.delete('mode');
    }
    setSearchParams(newParams, { replace: true });
  };

  const materials = game.materials[language].filter((m) => !/^(keine|none)/i.test(m));
  const hasNoMaterials = materials.length === 0;

  const energyLabel =
    game.energyLevel === 'high'
      ? t.filterHighEnergy
      : game.energyLevel === 'medium'
      ? t.filterMediumEnergy
      : t.filterCalmEnergy;

  // Similar games: 3 games with the exact same purpose
  const similarGames = allGames.filter(
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

  const gameRulesText = `${game.title[language]}\n\n${game.idea[language]}\n\n${L('Ablauf:', 'Rules:')}\n${game.rules[language]
    .map((r, i) => `${i + 1}. ${r}`)
    .join('\n')}`;
  const gameUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/games/${game.id}`;

  const categoryBadge = React.useMemo(() => {
    switch (game.purpose) {
      case 'kennenlernen':
        return language === 'de' ? 'Kennenlernen' : 'Icebreaker';
      case 'zusammenarbeit':
        return language === 'de' ? 'Zusammenarbeit' : 'Cooperation';
      case 'ruhe':
        return language === 'de' ? 'Fokus & Konzentration' : 'Focus & Calm';
      case 'energie':
        return language === 'de' ? 'Bewegung & Dynamik' : 'Movement & Action';
      case 'raten':
        return language === 'de' ? 'Raten & Denken' : 'Guessing & Logic';
      default:
        return language === 'de' ? 'Gruppenspiel' : 'Group Game';
    }
  }, [game.purpose, language]);

  return (
    <article className="max-w-6xl w-full mx-auto pb-32 lg:pb-16 pt-2">
      {/* Top Header Navigation: Back button links to /games, right has subtle Share & Bookmark buttons */}
      <div className="flex items-center justify-between gap-4 mb-4 print:hidden">
        <Link
          to="/games"
          className="inline-flex items-center gap-1.5 -ml-2 px-3 min-h-[44px] rounded-control text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToGamesOverview}</span>
        </Link>

        {/* Subtile Share & Lesezeichen Buttons rechts im Header (nur mobil, auf Desktop in der Aktionen-Sidebar) */}
        <div className="flex items-center gap-1.5 shrink-0 lg:hidden">
          <IconButton
            label={isFavorite ? t.savedItems : L('Merken', 'Save')}
            variant={isFavorite ? 'secondary' : 'outline'}
            className={`min-h-[44px] min-w-[44px] ${isFavorite ? 'text-accent bg-accent-subtle/80 border-accent/30' : 'text-text-secondary'}`}
            onClick={(e) => onToggleFavorite(game.id, e)}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
          </IconButton>

          <ShareMenu
            textToCopy={gameRulesText}
            urlToCopy={gameUrl}
            language={language}
            align="right"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left Column: Game Content / Companion */}
        <div className="lg:col-span-8">
          <header className="mb-4 sm:mb-5 space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent-subtle/80 text-accent-text">
                  {categoryBadge}
                </span>
              </div>
              <div className="flex items-center gap-3.5 flex-wrap pt-1">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text text-balance leading-[1.12]">
                  {game.title[language]}
                </h1>
                <span
                  className="inline-flex items-center shrink-0"
                  title={`${t.filterEnergy}: ${energyLabel}`}
                  aria-label={`${t.filterEnergy}: ${energyLabel}`}
                >
                  <EnergyDots energyLevel={game.energyLevel} size="md" />
                </span>
              </div>
            </div>

            {/* Meta as Badges: Immer in genau einer einzigen Zeile (kein Umbruch!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap py-1 print:hidden select-none text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border shrink-0 font-medium whitespace-nowrap shadow-2xs">
                <Users className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                <span>{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border shrink-0 font-medium whitespace-nowrap shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                <span>{game.durationMinutes}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border shrink-0 font-medium whitespace-nowrap shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                <span>{game.space[language]}</span>
              </span>
            </div>

            {/* Seamless Mode Switcher (Anleitung vs Jetzt spielen) */}
            {hasCompanion && (
              <div className="pt-2 print:hidden">
                <div className="inline-flex items-center p-1 rounded-full bg-surface-2 border border-border">
                  <button
                    type="button"
                    onClick={() => switchMode('rules')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 min-h-[38px] rounded-full text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'rules'
                        ? 'bg-surface text-text shadow-xs border border-border'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{L('Anleitung lesen', 'Read instructions')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('play')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 min-h-[38px] rounded-full text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'play'
                        ? 'bg-accent text-accent-contrast shadow-xs'
                        : 'text-accent hover:text-accent-hover'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{L('Jetzt spielen', 'Play now')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Print-only meta */}
            <div className="hidden print:block mt-2 text-sm text-text-secondary">
              {game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix} · {game.durationMinutes} · {energyLabel} · {game.space[language]}
            </div>
          </header>

          {/* =============================================================== */}
          {/* INTERACTIVE COMPANION VIEW (JETZT SPIELEN)                      */}
          {/* =============================================================== */}
          {viewMode === 'play' && Companion ? (
            <section className="mt-4 print:hidden">
              <Companion language={language} />
            </section>
          ) : (
            /* ============================================================= */
            /* STANDARD INSTRUCTIONS VIEW (ANLEITUNG LESEN)                  */
            /* ============================================================= */
            <>
              {/* Section 1: Idee */}
              <section className="mb-5 sm:mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1.5">
                  {t.ideaTitle}
                </h2>
                <p className="text-sm sm:text-base text-text leading-relaxed">
                  {game.idea[language]}
                </p>
              </section>

              {/* Section 2: Material */}
              {!hasNoMaterials && (
                <section className="mb-5 sm:mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1.5">
                    {t.materialsTitle}
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-text">
                    {materials.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Section 3: Ablauf mit Checkboxen */}
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2.5">
                  {t.rulesTitle}
                </h2>
                <ol className="space-y-3">
                  {game.rules[language].map((rule, idx) => {
                    const isChecked = checkedSteps.has(idx);
                    return (
                      <li
                        key={idx}
                        className={`flex items-start gap-3 p-3.5 rounded-card border transition-all ${
                          isChecked
                            ? 'bg-surface-2/60 border-border opacity-70'
                            : 'bg-surface border-border hover:border-border-strong'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleStepCheck(idx)}
                          className="mt-0.5 min-w-[28px] min-h-[28px] flex items-center justify-center text-text-tertiary hover:text-accent focus-visible:outline-none print:hidden cursor-pointer"
                          aria-label={`${L('Schritt', 'Step')} ${idx + 1}`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-accent border-accent text-accent-contrast'
                                : 'border-border-strong bg-surface'
                            }`}
                          >
                            {isChecked && <span className="text-xs font-bold">✓</span>}
                          </span>
                        </button>

                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-text-tertiary tabular-nums block mb-0.5">
                            {L('Schritt', 'Step')} {idx + 1}
                          </span>
                          <p
                            className={`text-sm sm:text-base leading-relaxed ${
                              isChecked ? 'line-through text-text-secondary' : 'text-text'
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

              {/* Section 4: Tipps für die Spielleitung */}
              {game.animatorTips && game.animatorTips[language]?.length > 0 && (
                <section className="mb-8 rounded-card border border-border bg-surface-2 p-5">
                  <button
                    type="button"
                    onClick={() => setIsTipsOpen(!isTipsOpen)}
                    className="w-full flex items-center justify-between text-left print:hidden cursor-pointer"
                    aria-expanded={isTipsOpen}
                  >
                    <h2 className="text-base font-semibold text-text">
                      {t.animatorTipsTitle}
                    </h2>
                    <ChevronDown
                      className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
                        isTipsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div className="hidden print:block font-bold text-sm text-text mb-2">
                    {t.animatorTipsTitle}
                  </div>

                  {isTipsOpen && (
                    <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm text-text-secondary leading-relaxed">
                      {game.animatorTips[language].map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {/* Section 5: Drei ähnliche Spiele */}
              {similarGames.length > 0 && (
                <section className="mt-12 pt-8 border-t border-border print:hidden">
                  <h2 className="text-lg font-bold text-text mb-4">
                    {t.similarGamesTitle}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            </>
          )}
        </div>

        {/* Right Column: Sticky Action Bar on Desktop */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 print:hidden">
          <div className="p-5 rounded-card bg-surface border border-border shadow-1 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
              {L('Aktionen', 'Actions')}
            </h2>

            {hasCompanion && (
              <Button
                variant={viewMode === 'play' ? 'secondary' : 'primary'}
                size="md"
                className="w-full justify-start"
                icon={
                  viewMode === 'play' ? (
                    <BookOpen className="w-4 h-4 shrink-0" />
                  ) : (
                    <Play className="w-4 h-4 shrink-0 fill-current" />
                  )
                }
                onClick={() => switchMode(viewMode === 'play' ? 'rules' : 'play')}
              >
                <span>{viewMode === 'play' ? L('Anleitung lesen', 'Read instructions') : L('Jetzt spielen', 'Play now')}</span>
              </Button>
            )}

            <Button
              variant={isFavorite ? 'secondary' : 'outline'}
              size="md"
              className={`w-full justify-start ${isFavorite ? 'text-accent' : ''}`}
              icon={<Bookmark className={`w-4 h-4 shrink-0 ${isFavorite ? 'fill-current text-accent' : ''}`} />}
              onClick={(e) => onToggleFavorite(game.id, e)}
              aria-pressed={isFavorite}
            >
              <span>{isFavorite ? t.savedItems : L('Merken', 'Save')}</span>
            </Button>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-tertiary">{L('Teilen oder Kopieren', 'Share or copy')}</span>
              <ShareMenu
                textToCopy={gameRulesText}
                urlToCopy={gameUrl}
                language={language}
                align="right"
              />
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};
